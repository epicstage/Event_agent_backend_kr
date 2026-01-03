/**
 * Marketing Routes
 * Domain C: Marketing Management (MKT-001 ~ MKT-040)
 */
import { Hono } from "hono";
import type { Env } from "../types";
import {
  MARKETING_AGENTS,
  getMarketingAgent,
  listMarketingAgents,
  getMarketingAgentsBySkill,
  MARKETING_DOMAIN_INFO,
} from "../agents/marketing/registry";

const marketing = new Hono<{ Bindings: Env }>();

// List all marketing agents
marketing.get("/agents", (c) => {
  const agents = listMarketingAgents();
  return c.json({
    domain: MARKETING_DOMAIN_INFO,
    agents,
    total: agents.length,
  });
});

// Get agents by skill
marketing.get("/agents/skill/:skill", (c) => {
  const skill = c.req.param("skill");
  const agents = getMarketingAgentsBySkill(skill);
  return c.json({
    skill,
    agents: agents.map((a) => ({
      taskId: a.taskId,
      taskName: a.taskName,
      taskType: a.taskType,
      subSkill: a.subSkill,
      cmpReference: a.cmpReference,
    })),
    total: agents.length,
  });
});

// Get specific agent info
marketing.get("/agents/:taskId", (c) => {
  const taskId = c.req.param("taskId").toUpperCase();
  const agent = getMarketingAgent(taskId);

  if (!agent) {
    return c.json({ error: `Agent ${taskId} not found` }, 404);
  }

  return c.json({
    taskId: agent.taskId,
    taskName: agent.taskName,
    taskType: agent.taskType,
    skill: agent.skill,
    subSkill: agent.subSkill,
    cmpReference: agent.cmpReference,
    persona: agent.AGENT_PERSONA,
  });
});

// Execute a marketing agent
marketing.post("/agents/execute", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, input, sessionId } = body;

    if (!taskId) {
      return c.json({ error: "taskId is required" }, 400);
    }

    const agent = getMarketingAgent(taskId.toUpperCase());
    if (!agent) {
      return c.json({ error: `Agent ${taskId} not found` }, 404);
    }

    // Validate input against schema
    const validatedInput = agent.InputSchema
      ? (agent.InputSchema as { parse: (input: unknown) => unknown }).parse(input)
      : input;

    // Execute the agent
    const startTime = Date.now();
    const result = await agent.execute(validatedInput);
    const executionTime = Date.now() - startTime;

    return c.json({
      success: true,
      taskId: agent.taskId,
      taskName: agent.taskName,
      sessionId,
      result,
      metadata: {
        executionTime,
        cmpReference: agent.cmpReference,
        skill: agent.skill,
      },
    });
  } catch (error) {
    console.error("Marketing agent execution error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Execute with LLM enhancement (AI-powered response)
marketing.post("/agents/execute-with-llm", async (c) => {
  try {
    const body = await c.req.json();
    const { taskId, input, sessionId } = body;

    if (!taskId) {
      return c.json({ error: "taskId is required" }, 400);
    }

    const agent = getMarketingAgent(taskId.toUpperCase());
    if (!agent) {
      return c.json({ error: `Agent ${taskId} not found` }, 404);
    }

    // Validate input
    const validatedInput = agent.InputSchema
      ? (agent.InputSchema as { parse: (input: unknown) => unknown }).parse(input)
      : input;

    // Execute base agent
    const startTime = Date.now();
    const baseResult = await agent.execute(validatedInput);

    // Enhance with LLM if available
    let enhancedResult = baseResult;
    if (c.env.AI) {
      try {
        const prompt = `You are ${agent.AGENT_PERSONA}

Based on the following analysis result, provide additional insights and recommendations in Korean:

${JSON.stringify(baseResult, null, 2)}

Provide:
1. Key insights (핵심 인사이트)
2. Action items (실행 항목)
3. Risk considerations (리스크 고려사항)
4. Success factors (성공 요인)

Format as a structured JSON with these fields.`;

        const llmResponse = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          prompt,
          max_tokens: 1024,
        });

        enhancedResult = {
          ...baseResult as object,
          llm_insights: llmResponse,
        };
      } catch (llmError) {
        console.error("LLM enhancement failed:", llmError);
        // Continue with base result
      }
    }

    const executionTime = Date.now() - startTime;

    return c.json({
      success: true,
      taskId: agent.taskId,
      taskName: agent.taskName,
      sessionId,
      result: enhancedResult,
      metadata: {
        executionTime,
        cmpReference: agent.cmpReference,
        skill: agent.skill,
        llmEnhanced: c.env.AI ? true : false,
      },
    });
  } catch (error) {
    console.error("Marketing agent execution error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Domain info endpoint
marketing.get("/info", (c) => {
  return c.json(MARKETING_DOMAIN_INFO);
});

export default marketing;
