/**
 * Meetings Domain Routes
 *
 * CMP-IS Domain G: Meetings & Contents API
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import meetingsRegistry, { executeAgentWithLLM } from "../agents/meetings/registry";

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
};

const meetings = new Hono<{ Bindings: Bindings }>();

meetings.use("*", cors());

// 전체 Meetings 에이전트 목록
meetings.get("/agents", (c) => {
  const taskType = c.req.query("taskType") as "AI" | "Hybrid" | "Human" | undefined;
  const skill = c.req.query("skill") ? parseInt(c.req.query("skill")!) : undefined;

  let agents = meetingsRegistry.list();

  if (taskType) {
    const filteredAgents = meetingsRegistry.getByTaskType(taskType);
    agents = filteredAgents.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      taskType: a.taskType,
      cmpStandard: `CMP-IS Domain G: Skill ${a.skill}`,
    }));
  }

  if (skill === 13 || skill === 14) {
    const filteredAgents = meetingsRegistry.getBySkill(skill);
    agents = filteredAgents.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      taskType: a.taskType,
      cmpStandard: `CMP-IS Domain G: Skill ${a.skill}`,
    }));
  }

  return c.json({
    domain: "meetings",
    domainName: "Meetings & Contents",
    cmpDomain: "CMP-IS Domain G",
    stats: meetingsRegistry.stats,
    agents,
  });
});

// 에이전트 검색
meetings.get("/agents/search", (c) => {
  const query = c.req.query("q") || "";
  const results = meetingsRegistry.search(query);

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
meetings.get("/agents/:agentId", (c) => {
  const agentId = c.req.param("agentId");
  const agent = meetingsRegistry.getById(agentId);

  if (!agent) {
    return c.json({ error: `Agent not found: ${agentId}` }, 404);
  }

  return c.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    version: "1.0.0",
    taskType: agent.taskType,
    cmpStandard: `CMP-IS Domain G: Skill ${agent.skill}`,
    persona: (agent as { persona?: string }).persona || "",
    inputSchema: agent.inputSchema._def,
    outputSchema: agent.outputSchema._def,
  });
});

// 에이전트 실행
meetings.post("/agents/execute", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, input } = body;

    if (!taskId) {
      return c.json({ error: "taskId is required" }, 400);
    }

    const result = await meetingsRegistry.execute(taskId, input);

    return c.json({
      success: true,
      domain: "meetings",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// LLM 강화 에이전트 실행
meetings.post("/agents/execute-with-llm", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, input, sessionId, userPreferences } = body;

    if (!taskId) {
      return c.json({ error: "taskId is required" }, 400);
    }

    // Short-term memory from KV (세션 기반)
    let shortTermMemory: string | undefined;
    if (sessionId) {
      try {
        shortTermMemory = (await c.env.KV.get(`session:${sessionId}:memory`)) || undefined;
      } catch {
        // KV 접근 실패시 무시
      }
    }

    const result = await executeAgentWithLLM(
      taskId,
      input,
      c.env.AI,
      shortTermMemory,
      userPreferences
    );

    return c.json({
      success: true,
      domain: "meetings",
      taskId,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// 도메인 스킬 목록
meetings.get("/skills", (c) => {
  return c.json({
    domain: "meetings",
    skills: [
      {
        id: 13,
        name: "Program Design",
        description: "프로그램 구조 설계, 세션 스케줄링, 트랙 관리",
        agentRange: "MTG-001 ~ MTG-020",
        agentCount: 20,
      },
      {
        id: 14,
        name: "Speaker & Content Management",
        description: "연사 관리, 초록 심사, 콘텐츠 제작",
        agentRange: "MTG-021 ~ MTG-040",
        agentCount: 20,
      },
    ],
    totalAgents: 40,
  });
});

export default meetings;
