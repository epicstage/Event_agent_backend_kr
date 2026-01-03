/**
 * Operations Domain API Routes
 * CMP-IS Domain E: Operations Management
 */

import { Hono } from "hono";
import { Bindings } from "../types";
import {
  OperationsAgentRegistry,
  listOperationsAgents,
  getOperationsAgentsBySkill,
  OPERATIONS_AGENT_COUNT,
} from "../agents/operations/registry";

const operations = new Hono<{ Bindings: Bindings }>();

/**
 * GET /operations/agents
 * 전체 Operations 에이전트 목록 (40개)
 */
operations.get("/agents", async (c) => {
  const skill = c.req.query("skill");

  if (skill === "9" || skill === "10") {
    const agents = getOperationsAgentsBySkill(parseInt(skill) as 9 | 10);
    return c.json({
      domain: "operations",
      skill: parseInt(skill),
      count: agents.length,
      agents,
    });
  }

  const agents = listOperationsAgents();
  return c.json({
    domain: "operations",
    totalAgents: OPERATIONS_AGENT_COUNT,
    skills: {
      skill9: { name: "Site Management", count: 15 },
      skill10: { name: "Logistics Management", count: 25 },
    },
    agents,
  });
});

/**
 * GET /operations/agents/:agentId
 * 특정 에이전트 상세 정보
 */
operations.get("/agents/:agentId", async (c) => {
  const agentId = c.req.param("agentId").toUpperCase();

  if (!(agentId in OperationsAgentRegistry)) {
    return c.json({ error: `Agent ${agentId} not found in Operations domain` }, 404);
  }

  const agent = OperationsAgentRegistry[agentId as keyof typeof OperationsAgentRegistry];

  return c.json({
    id: agent.id,
    name: agent.name,
    domain: agent.domain,
    skill: agent.skill,
    cmpStandard: agent.cmpStandard,
    persona: agent.persona,
    inputSchema: JSON.parse(JSON.stringify(agent.inputSchema._def)),
    outputSchema: JSON.parse(JSON.stringify(agent.outputSchema._def)),
  });
});

/**
 * POST /operations/agents/execute
 * 에이전트 실행 (Rule-based)
 */
operations.post("/agents/execute", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, input } = body;

    if (!taskId || !input) {
      return c.json({ error: "taskId and input are required" }, 400);
    }

    const agentId = taskId.toUpperCase();
    if (!(agentId in OperationsAgentRegistry)) {
      return c.json({ error: `Agent ${agentId} not found` }, 404);
    }

    const agent = OperationsAgentRegistry[agentId as keyof typeof OperationsAgentRegistry];

    // Validate input
    const parseResult = agent.inputSchema.safeParse(input);
    if (!parseResult.success) {
      return c.json({
        error: "Input validation failed",
        details: parseResult.error.errors,
      }, 400);
    }

    // Execute agent
    const result = await agent.execute(parseResult.data);

    return c.json({
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      skill: agent.skill,
      result,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Operations agent execution error:", error);
    return c.json({
      error: "Agent execution failed",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * POST /operations/agents/execute-with-llm
 * LLM 강화 실행 (AI Binding 사용)
 */
operations.post("/agents/execute-with-llm", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, sessionId, input } = body;

    if (!taskId || !input) {
      return c.json({ error: "taskId and input are required" }, 400);
    }

    const agentId = taskId.toUpperCase();
    if (!(agentId in OperationsAgentRegistry)) {
      return c.json({ error: `Agent ${agentId} not found` }, 404);
    }

    const agent = OperationsAgentRegistry[agentId as keyof typeof OperationsAgentRegistry];

    // Validate input
    const parseResult = agent.inputSchema.safeParse(input);
    if (!parseResult.success) {
      return c.json({
        error: "Input validation failed",
        details: parseResult.error.errors,
      }, 400);
    }

    // Execute base agent logic
    const baseResult = await agent.execute(parseResult.data);

    // Enhance with LLM if AI binding available
    let enhancedResult = baseResult;
    let llmInsights = null;

    if (c.env.AI) {
      try {
        const systemPrompt = `당신은 ${agent.name}입니다. ${agent.persona}

CMP-IS 표준: ${agent.cmpStandard}

다음 결과를 분석하고 추가 인사이트를 제공하세요:
- 실행 가능한 개선 제안
- 잠재적 리스크 식별
- 업계 베스트 프랙티스 비교`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          {
            role: "user" as const,
            content: `입력: ${JSON.stringify(input, null, 2)}\n\n결과: ${JSON.stringify(baseResult, null, 2)}\n\n이 결과에 대한 전문가 인사이트를 제공해주세요.`,
          },
        ];

        const llmResponse = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages,
          max_tokens: 1024,
        });

        llmInsights = (llmResponse as { response?: string }).response || null;
      } catch (llmError) {
        console.error("LLM enhancement failed:", llmError);
      }
    }

    // Store in KV if available
    if (c.env.EVENT_AGENT_KV && sessionId) {
      const cacheKey = `ops:${sessionId}:${agentId}:${Date.now()}`;
      await c.env.EVENT_AGENT_KV.put(
        cacheKey,
        JSON.stringify({ input, result: enhancedResult, llmInsights }),
        { expirationTtl: 86400 }
      );
    }

    return c.json({
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      skill: agent.skill,
      cmpStandard: agent.cmpStandard,
      result: enhancedResult,
      llmInsights,
      sessionId,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Operations LLM agent execution error:", error);
    return c.json({
      error: "Agent execution failed",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * GET /operations/skills
 * Operations 도메인 스킬 체계
 */
operations.get("/skills", async (c) => {
  return c.json({
    domain: "operations",
    cmpDomain: "Domain E",
    skills: [
      {
        skill: 9,
        name: "Site Management",
        description: "베뉴 선정, 현장 관리, 시설 계획",
        agentCount: 15,
        agentRange: "OPS-001 ~ OPS-015",
        capabilities: [
          "Venue Sourcing & Selection",
          "Site Inspection & Evaluation",
          "Floor Plan Design",
          "Capacity Planning",
          "Accessibility Planning",
          "Contract Management",
          "F&B Planning",
          "AV Planning",
          "Safety Planning",
          "Pre-Event Checklist",
        ],
      },
      {
        skill: 10,
        name: "Logistics Management",
        description: "현장 실행, 물류 관리, 운영 조율",
        agentCount: 25,
        agentRange: "OPS-016 ~ OPS-040",
        capabilities: [
          "Load-In/Load-Out Management",
          "Equipment Tracking",
          "On-site F&B Execution",
          "AV Operation",
          "Registration Operations",
          "Session Management",
          "Crowd Management",
          "Security Operations",
          "Medical Support",
          "VIP Services",
          "Speaker Support",
          "Live Streaming",
          "Real-Time Monitoring",
        ],
      },
    ],
  });
});

/**
 * GET /operations/capabilities
 * Operations 도메인 핵심 역량
 */
operations.get("/capabilities", async (c) => {
  return c.json({
    domain: "operations",
    cmpStandard: "CMP-IS Domain E",
    totalAgents: OPERATIONS_AGENT_COUNT,
    coreCapabilities: [
      {
        area: "Venue Management",
        description: "베뉴 소싱, 평가, 계약, 관리",
        agents: ["OPS-001", "OPS-002", "OPS-003", "OPS-007"],
      },
      {
        area: "Space Planning",
        description: "공간 설계, 수용량, 접근성",
        agents: ["OPS-004", "OPS-005", "OPS-006"],
      },
      {
        area: "Technical Production",
        description: "AV, 조명, 스트리밍, 전력",
        agents: ["OPS-009", "OPS-019", "OPS-030", "OPS-034"],
      },
      {
        area: "F&B Operations",
        description: "케이터링 계획 및 현장 실행",
        agents: ["OPS-008", "OPS-018"],
      },
      {
        area: "Guest Experience",
        description: "등록, VIP, 연사, 전시업체 지원",
        agents: ["OPS-020", "OPS-026", "OPS-027", "OPS-028"],
      },
      {
        area: "Safety & Security",
        description: "안전, 보안, 의료, 군중관리",
        agents: ["OPS-010", "OPS-022", "OPS-023", "OPS-024"],
      },
      {
        area: "Logistics",
        description: "반입/철수, 장비, 교통, 폐기물",
        agents: ["OPS-016", "OPS-017", "OPS-025", "OPS-033", "OPS-040"],
      },
      {
        area: "On-site Operations",
        description: "실시간 모니터링, 커뮤니케이션, 사이니지",
        agents: ["OPS-037", "OPS-038", "OPS-039"],
      },
    ],
  });
});

export default operations;
