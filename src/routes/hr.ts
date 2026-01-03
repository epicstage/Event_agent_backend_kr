/**
 * HR Domain Routes
 *
 * CMP-IS Domain F: Human Resources API
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import hrRegistry from "../agents/hr/registry";

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
};

const hr = new Hono<{ Bindings: Bindings }>();

hr.use("*", cors());

// 전체 HR 에이전트 목록
hr.get("/agents", (c) => {
  const taskType = c.req.query("taskType") as "AI" | "Hybrid" | "Human" | undefined;
  const skill = c.req.query("skill") ? parseInt(c.req.query("skill")!) : undefined;

  let agents = hrRegistry.list();

  if (taskType) {
    const filteredAgents = hrRegistry.getByTaskType(taskType);
    agents = filteredAgents.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      taskType: a.taskType,
      cmpStandard: a.cmpStandard,
    }));
  }

  if (skill === 11 || skill === 12) {
    const filteredAgents = hrRegistry.getBySkill(skill);
    agents = filteredAgents.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      taskType: a.taskType,
      cmpStandard: a.cmpStandard,
    }));
  }

  return c.json({
    domain: "hr",
    domainName: "Human Resources",
    cmpDomain: "CMP-IS Domain F",
    stats: hrRegistry.stats,
    agents,
  });
});

// 에이전트 검색
hr.get("/agents/search", (c) => {
  const query = c.req.query("q") || "";
  const results = hrRegistry.search(query);

  return c.json({
    query,
    count: results.length,
    results: results.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      taskType: a.taskType,
    })),
  });
});

// 특정 에이전트 정보
hr.get("/agents/:agentId", (c) => {
  const agentId = c.req.param("agentId");
  const agent = hrRegistry.getById(agentId);

  if (!agent) {
    return c.json({ error: `Agent not found: ${agentId}` }, 404);
  }

  return c.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    version: agent.version,
    taskType: agent.taskType,
    cmpStandard: agent.cmpStandard,
    persona: agent.persona,
    inputSchema: agent.inputSchema._def,
    outputSchema: agent.outputSchema._def,
  });
});

// 에이전트 실행
hr.post("/agents/execute", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, input } = body;

    if (!taskId) {
      return c.json({ error: "taskId is required" }, 400);
    }

    const result = await hrRegistry.execute(taskId, input);

    // 실행 로그 저장 (KV)
    const logKey = `hr:execution:${taskId}:${Date.now()}`;
    await c.env.KV.put(
      logKey,
      JSON.stringify({
        taskId,
        input,
        result,
        timestamp: new Date().toISOString(),
      }),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7일 보관
    );

    return c.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: errorMessage }, 400);
  }
});

// LLM 지원 에이전트 실행
hr.post("/agents/execute-with-llm", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, sessionId, input } = body;

    if (!taskId) {
      return c.json({ error: "taskId is required" }, 400);
    }

    const agent = hrRegistry.getById(taskId);
    if (!agent) {
      return c.json({ error: `Agent not found: ${taskId}` }, 404);
    }

    // 기본 실행
    const baseResult = await hrRegistry.execute(taskId, input);

    // LLM으로 결과 분석/보완
    const prompt = `당신은 ${agent.persona}

다음 HR 태스크 결과를 분석하고 추가 인사이트를 제공하세요:

태스크: ${agent.name}
설명: ${agent.description}

입력 데이터:
${JSON.stringify(input, null, 2)}

실행 결과:
${JSON.stringify(baseResult.result, null, 2)}

위 결과를 바탕으로:
1. 핵심 포인트 요약 (3줄 이내)
2. 추가 권장사항 (있다면)
3. 주의사항 또는 리스크

JSON 형식으로 응답하세요:
{
  "summary": "핵심 요약",
  "additionalRecommendations": ["권장사항1", "권장사항2"],
  "risks": ["리스크1"]
}`;

    const aiResponse = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    let llmInsights = null;
    try {
      const responseText = (aiResponse as { response?: string }).response || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        llmInsights = JSON.parse(jsonMatch[0]);
      }
    } catch {
      llmInsights = { raw: (aiResponse as { response?: string }).response };
    }

    // 세션 저장
    if (sessionId) {
      await c.env.KV.put(
        `hr:session:${sessionId}:${taskId}`,
        JSON.stringify({
          input,
          result: baseResult.result,
          llmInsights,
          timestamp: new Date().toISOString(),
        }),
        { expirationTtl: 60 * 60 * 24 } // 24시간 보관
      );
    }

    return c.json({
      ...baseResult,
      llmInsights,
      sessionId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: errorMessage }, 400);
  }
});

// HR 도메인 통계
hr.get("/stats", (c) => {
  return c.json({
    domain: "hr",
    domainName: "Human Resources",
    cmpDomain: "CMP-IS Domain F",
    ...hrRegistry.stats,
    skills: {
      11: {
        name: "HR Planning",
        description: "인력 계획 및 기획",
        agentCount: hrRegistry.stats.skill11Count,
        agentRange: "HR-001 ~ HR-015",
      },
      12: {
        name: "HR Management",
        description: "인력 운영 및 관리",
        agentCount: hrRegistry.stats.skill12Count,
        agentRange: "HR-016 ~ HR-040",
      },
    },
  });
});

export default hr;
