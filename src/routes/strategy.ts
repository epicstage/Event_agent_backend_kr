/**
 * Strategy Domain API Routes
 *
 * CMP-IS Domain A: Strategic Planning
 * - Goal Setting
 * - Stakeholder Analysis
 * - Risk Assessment
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../types";
import {
  listAgents,
  getAgent,
  executeAgent,
  executeAgentWithLLM,
  getRegistrySummary,
} from "../agents/strategy/registry";

const strategy = new Hono<{ Bindings: Env }>();

// =============================================================================
// AGENT ENDPOINTS
// =============================================================================

/**
 * GET /agents
 * 전략 에이전트 목록 조회
 */
strategy.get("/agents", async (c) => {
  const skill = c.req.query("skill");
  const taskType = c.req.query("taskType") as "AI" | "Human" | "Hybrid" | undefined;

  const agents = listAgents({ skill, taskType });

  return c.json({
    success: true,
    domain: "A",
    domainName: "Strategic Planning",
    count: agents.length,
    agents: agents.map((agent) => ({
      taskId: agent.taskId,
      taskName: agent.taskName,
      skill: agent.skill,
      taskType: agent.taskType,
      description: agent.description,
    })),
  });
});

/**
 * GET /agents/summary
 * 에이전트 레지스트리 요약
 */
strategy.get("/agents/summary", async (c) => {
  const summary = getRegistrySummary();

  return c.json({
    success: true,
    domain: "A",
    domainName: "Strategic Planning",
    summary,
  });
});

/**
 * GET /agents/:taskId
 * 특정 에이전트 상세 정보
 */
strategy.get("/agents/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const agent = getAgent(taskId);

  if (!agent) {
    return c.json(
      {
        success: false,
        error: `Agent not found: ${taskId}`,
      },
      404
    );
  }

  return c.json({
    success: true,
    agent: {
      taskId: agent.taskId,
      taskName: agent.taskName,
      domain: agent.domain,
      skill: agent.skill,
      taskType: agent.taskType,
      description: agent.description,
      inputSchema: agent.inputSchema,
      outputSchema: agent.outputSchema,
    },
  });
});

/**
 * Agent Execute Request Schema
 */
const AgentExecuteSchema = z.object({
  taskId: z.string().regex(/^STR-\d{3}$/, "Invalid task ID format (STR-XXX)"),
  input: z.record(z.any()),
});

/**
 * POST /agents/execute
 * 에이전트 실행 (로컬 로직만)
 */
strategy.post(
  "/agents/execute",
  zValidator("json", AgentExecuteSchema),
  async (c) => {
    const { taskId, input } = c.req.valid("json");

    try {
      const result = await executeAgent(taskId, input);

      return c.json({
        success: true,
        taskId,
        result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("not found")) {
        return c.json(
          {
            success: false,
            taskId,
            error: message,
          },
          404
        );
      }

      if (message.includes("validation") || message.includes("Validation")) {
        return c.json(
          {
            success: false,
            taskId,
            error: message,
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          taskId,
          error: message,
        },
        500
      );
    }
  }
);

/**
 * Agent Execute with LLM Request Schema
 */
const AgentExecuteWithLLMSchema = z.object({
  taskId: z.string().regex(/^STR-\d{3}$/, "Invalid task ID format (STR-XXX)"),
  input: z.record(z.any()),
  sessionId: z.string().optional(),
});

/**
 * POST /agents/execute-with-llm
 * AI 에이전트 실행 + Cloudflare Workers AI (Llama 3.3) 보강
 */
strategy.post(
  "/agents/execute-with-llm",
  zValidator("json", AgentExecuteWithLLMSchema),
  async (c) => {
    const { taskId, input, sessionId: inputSessionId } = c.req.valid("json");
    const ai = c.env.AI;
    const kv = c.env.KV;
    const db = c.env.DB;

    if (!ai) {
      return c.json(
        {
          success: false,
          taskId,
          error: "Cloudflare AI binding not configured",
        },
        500
      );
    }

    // 동적 import
    const {
      getSessionContext,
      addConversation,
      buildShortTermMemoryPrompt,
      generateSessionId,
      getFrustrationLevel,
    } = await import("../lib/session");
    const { logInteraction } = await import("../lib/interactions");
    const { logSystemGap, logRawConversation } = await import("../lib/gaps");

    const sessionId = inputSessionId || generateSessionId();

    // 원본 사용자 입력 저장
    try {
      await logRawConversation(db, sessionId, "user_input", JSON.stringify(input), {
        taskId,
        domain: "strategy",
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Raw conversation logging failed:", e);
    }

    // 세션 컨텍스트 로드
    let sessionContext = null;
    let shortTermMemory = "";
    let userPreferences = undefined;
    try {
      sessionContext = await getSessionContext(kv, sessionId);
      shortTermMemory = buildShortTermMemoryPrompt(sessionContext);
      userPreferences = sessionContext?.preferences;
    } catch (e) {
      console.error("Session context load failed:", e);
    }

    try {
      const result = await executeAgentWithLLM(taskId, input, ai, shortTermMemory, userPreferences);

      // 세션에 대화 추가 + 반복 질문 감지
      let isRepeatedQuestion = false;
      let frustrationLevel: { level: "none" | "low" | "medium" | "high"; signals: any[] } = {
        level: "none",
        signals: [],
      };
      try {
        const { context: updatedContext, isRepeated } = await addConversation(kv, sessionId, {
          taskId,
          input,
          output: result.result,
          aiInsights: result.ai_insights
            ? {
                analysis: result.ai_insights.analysis,
                recommendations: result.ai_insights.recommendations,
                confidence_score: result.ai_insights.confidence_score,
              }
            : undefined,
        });
        isRepeatedQuestion = isRepeated;
        frustrationLevel = getFrustrationLevel(updatedContext);
      } catch (e) {
        console.error("Session update failed:", e);
      }

      // D1에 인터랙션 로깅
      let interactionId: number | null = null;
      try {
        interactionId = await logInteraction(db, {
          session_id: sessionId,
          task_id: taskId,
          user_query: JSON.stringify(input),
          agent_output: JSON.stringify(result.result),
          ai_insight: JSON.stringify(result.ai_insights || {}),
          evolution_note: result.ai_insights?.evolution_note,
        });
      } catch (e) {
        console.error("Interaction logging failed:", e);
      }

      // AI 감지 시스템 갭 기록
      if (result.ai_insights?.gap_detected && interactionId) {
        try {
          await logSystemGap(db, {
            interaction_id: interactionId,
            gap_type: result.ai_insights.gap_detected.type,
            severity: result.ai_insights.gap_detected.severity,
            description: result.ai_insights.gap_detected.description,
            context_data: JSON.stringify({ taskId, input, domain: "strategy" }),
            suggested_fix: result.ai_insights.gap_detected.suggested_fix,
          });
        } catch (e) {
          console.error("Gap logging failed:", e);
        }
      }

      // 반복 질문으로 인한 불만 신호 기록
      if (isRepeatedQuestion && interactionId) {
        try {
          await logSystemGap(db, {
            interaction_id: interactionId,
            gap_type: "USER_FRUSTRATION",
            severity: frustrationLevel.level === "high" ? "high" : "medium",
            description: `User asked about ${taskId} repeatedly (strategy domain)`,
            context_data: JSON.stringify({
              taskId,
              domain: "strategy",
              frustrationLevel: frustrationLevel.level,
            }),
            suggested_fix: "Review strategy agent responses for clarity",
          });
        } catch (e) {
          console.error("Frustration gap logging failed:", e);
        }
      }

      // 에이전트 응답 저장
      try {
        await logRawConversation(db, sessionId, "agent_response", JSON.stringify(result), {
          taskId,
          domain: "strategy",
          interactionId,
          hasGap: !!result.ai_insights?.gap_detected,
          isRepeated: isRepeatedQuestion,
        });
      } catch (e) {
        console.error("Raw response logging failed:", e);
      }

      return c.json({
        success: true,
        taskId,
        sessionId,
        interactionId,
        frustration_detected: isRepeatedQuestion,
        frustration_level: frustrationLevel.level,
        ...result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      // 에러도 기록
      try {
        await logRawConversation(db, sessionId, "system_event", JSON.stringify({ error: message }), {
          taskId,
          domain: "strategy",
          type: "error",
        });
      } catch (e) {
        console.error("Error logging failed:", e);
      }

      if (message.includes("not found")) {
        return c.json({ success: false, taskId, sessionId, error: message }, 404);
      }

      if (message.includes("validation") || message.includes("Validation")) {
        return c.json({ success: false, taskId, sessionId, error: message }, 400);
      }

      return c.json({ success: false, taskId, sessionId, error: message }, 500);
    }
  }
);

// =============================================================================
// STRATEGY DATA ENDPOINTS
// =============================================================================

/**
 * POST /goals
 * 이벤트 목표 저장
 */
strategy.post(
  "/goals",
  zValidator(
    "json",
    z.object({
      event_id: z.string().uuid(),
      goal_type: z.string(),
      title: z.string(),
      description: z.string().optional(),
      target_value: z.number().optional(),
      target_unit: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      deadline: z.string().optional(),
      owner: z.string().optional(),
      kpis: z.array(z.any()).optional(),
      success_criteria: z.string().optional(),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");
    const db = c.env.DB;

    try {
      const result = await db
        .prepare(
          `INSERT INTO event_goals
          (event_id, goal_type, title, description, target_value, target_unit, priority, deadline, owner, kpis, success_criteria)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.event_id,
          data.goal_type,
          data.title,
          data.description || null,
          data.target_value || null,
          data.target_unit || null,
          data.priority,
          data.deadline || null,
          data.owner || null,
          data.kpis ? JSON.stringify(data.kpis) : null,
          data.success_criteria || null
        )
        .run();

      return c.json({
        success: true,
        goalId: result.meta.last_row_id,
      }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return c.json({ success: false, error: message }, 500);
    }
  }
);

/**
 * GET /goals/:eventId
 * 이벤트 목표 조회
 */
strategy.get("/goals/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const db = c.env.DB;

  try {
    const result = await db
      .prepare("SELECT * FROM event_goals WHERE event_id = ? ORDER BY priority DESC, created_at DESC")
      .bind(eventId)
      .all();

    return c.json({
      success: true,
      count: result.results?.length || 0,
      goals: result.results || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * POST /stakeholders
 * 이해관계자 저장
 */
strategy.post(
  "/stakeholders",
  zValidator(
    "json",
    z.object({
      event_id: z.string().uuid(),
      name: z.string(),
      organization: z.string().optional(),
      role: z.string(),
      stakeholder_type: z.enum(["internal", "external"]).default("external"),
      influence_level: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      interest_level: z.enum(["low", "medium", "high"]).default("medium"),
      engagement_strategy: z.string().optional(),
      expectations: z.array(z.string()).optional(),
      concerns: z.array(z.string()).optional(),
      contact_info: z.record(z.any()).optional(),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");
    const db = c.env.DB;

    try {
      const result = await db
        .prepare(
          `INSERT INTO stakeholders
          (event_id, name, organization, role, stakeholder_type, influence_level, interest_level, engagement_strategy, expectations, concerns, contact_info)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.event_id,
          data.name,
          data.organization || null,
          data.role,
          data.stakeholder_type,
          data.influence_level,
          data.interest_level,
          data.engagement_strategy || null,
          data.expectations ? JSON.stringify(data.expectations) : null,
          data.concerns ? JSON.stringify(data.concerns) : null,
          data.contact_info ? JSON.stringify(data.contact_info) : null
        )
        .run();

      return c.json({
        success: true,
        stakeholderId: result.meta.last_row_id,
      }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return c.json({ success: false, error: message }, 500);
    }
  }
);

/**
 * GET /stakeholders/:eventId
 * 이해관계자 조회
 */
strategy.get("/stakeholders/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const db = c.env.DB;

  try {
    const result = await db
      .prepare("SELECT * FROM stakeholders WHERE event_id = ? ORDER BY influence_level DESC, created_at DESC")
      .bind(eventId)
      .all();

    return c.json({
      success: true,
      count: result.results?.length || 0,
      stakeholders: result.results || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * POST /risks
 * 리스크 저장
 */
strategy.post(
  "/risks",
  zValidator(
    "json",
    z.object({
      event_id: z.string().uuid(),
      risk_category: z.string(),
      title: z.string(),
      description: z.string(),
      probability: z.enum(["very_low", "low", "medium", "high", "very_high"]).default("medium"),
      impact: z.enum(["minimal", "minor", "moderate", "major", "catastrophic"]).default("moderate"),
      risk_score: z.number().optional(),
      owner: z.string().optional(),
      mitigation_strategy: z.string().optional(),
      contingency_plan: z.string().optional(),
      trigger_indicators: z.array(z.string()).optional(),
      cost_of_mitigation: z.number().optional(),
      cost_if_occurs: z.number().optional(),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");
    const db = c.env.DB;

    // Calculate risk score if not provided
    const probScore = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 }[data.probability];
    const impactScore = { minimal: 1, minor: 2, moderate: 3, major: 4, catastrophic: 5 }[data.impact];
    const riskScore = data.risk_score || (probScore * impactScore);

    try {
      const result = await db
        .prepare(
          `INSERT INTO risk_register
          (event_id, risk_category, title, description, probability, impact, risk_score, owner, mitigation_strategy, contingency_plan, trigger_indicators, cost_of_mitigation, cost_if_occurs)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.event_id,
          data.risk_category,
          data.title,
          data.description,
          data.probability,
          data.impact,
          riskScore,
          data.owner || null,
          data.mitigation_strategy || null,
          data.contingency_plan || null,
          data.trigger_indicators ? JSON.stringify(data.trigger_indicators) : null,
          data.cost_of_mitigation || null,
          data.cost_if_occurs || null
        )
        .run();

      return c.json({
        success: true,
        riskId: result.meta.last_row_id,
      }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return c.json({ success: false, error: message }, 500);
    }
  }
);

/**
 * GET /risks/:eventId
 * 리스크 조회
 */
strategy.get("/risks/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const db = c.env.DB;

  try {
    const result = await db
      .prepare("SELECT * FROM risk_register WHERE event_id = ? ORDER BY risk_score DESC, created_at DESC")
      .bind(eventId)
      .all();

    return c.json({
      success: true,
      count: result.results?.length || 0,
      risks: result.results || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

export default strategy;
