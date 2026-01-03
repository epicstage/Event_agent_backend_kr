/**
 * Project Management API Routes
 *
 * 이벤트 프로젝트 관리 API 엔드포인트.
 * - CMP-IS Domain B (Skills 5, 6) 준수
 * - Cloudflare D1 Database 연동
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../types";
import { executeAgent, executeAgentWithLLM, listAgents, getAgent } from "../agents/project/registry";

// =============================================================================
// ROUTER
// =============================================================================

const project = new Hono<{ Bindings: Env }>();

// =============================================================================
// AGENT ENDPOINTS
// =============================================================================

/**
 * Agent Execute Request Schema
 */
const AgentExecuteRequestSchema = z.object({
  taskId: z.string().regex(/^PRJ-\d{3}$/, "Invalid task ID format (PRJ-XXX)"),
  input: z.record(z.any()),
});

/**
 * POST /agents/execute
 * AI 에이전트 실행
 * CMP-IS Domain B: Project Management (Skills 5, 6)
 */
project.post(
  "/agents/execute",
  zValidator("json", AgentExecuteRequestSchema),
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
 * GET /agents
 * 등록된 에이전트 목록 조회
 */
project.get("/agents", async (c) => {
  const skill = c.req.query("skill");
  const taskType = c.req.query("taskType");

  let agents = listAgents();

  if (skill) {
    agents = agents.filter((a) => a.skill.toLowerCase().includes(skill.toLowerCase()));
  }

  if (taskType) {
    agents = agents.filter((a) => a.taskType === taskType);
  }

  return c.json({
    total: agents.length,
    agents,
  });
});

/**
 * GET /agents/:taskId
 * 특정 에이전트 상세 정보 조회
 */
project.get("/agents/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const agent = getAgent(taskId);

  if (!agent) {
    return c.json(
      {
        error: `Agent ${taskId} not found`,
      },
      404
    );
  }

  return c.json(agent);
});

/**
 * Agent Execute with LLM Request Schema
 */
const AgentExecuteWithLLMSchema = z.object({
  taskId: z.string().regex(/^PRJ-\d{3}$/, "Invalid task ID format (PRJ-XXX)"),
  input: z.record(z.any()),
  sessionId: z.string().optional(),
});

/**
 * POST /agents/execute-with-llm
 * AI 에이전트 실행 + Cloudflare Workers AI (Llama 3.3) 보강
 */
project.post(
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
      const result = await executeAgentWithLLM(taskId, input, ai, shortTermMemory, userPreferences as Record<string, unknown> | undefined);

      // 세션에 대화 추가
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

      // AI가 감지한 시스템 갭 기록
      if (result.ai_insights?.gap_detected && interactionId) {
        try {
          await logSystemGap(db, {
            interaction_id: interactionId,
            gap_type: result.ai_insights.gap_detected.type,
            severity: result.ai_insights.gap_detected.severity,
            description: result.ai_insights.gap_detected.description,
            context_data: JSON.stringify({ taskId, input }),
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
            description: `User asked about ${taskId} repeatedly (detected as frustration signal)`,
            context_data: JSON.stringify({
              taskId,
              frustrationLevel: frustrationLevel.level,
              signalCount: frustrationLevel.signals.length,
            }),
            suggested_fix: "Review this task's responses for clarity and completeness",
          });
        } catch (e) {
          console.error("Frustration gap logging failed:", e);
        }
      }

      // 에이전트 응답 저장
      try {
        await logRawConversation(db, sessionId, "agent_response", JSON.stringify(result), {
          taskId,
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

      // 에러도 raw_conversations에 기록
      try {
        await logRawConversation(db, sessionId, "system_event", JSON.stringify({ error: message }), {
          taskId,
          type: "error",
        });
      } catch (e) {
        console.error("Error logging failed:", e);
      }

      if (message.includes("not found")) {
        return c.json(
          {
            success: false,
            taskId,
            sessionId,
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
            sessionId,
            error: message,
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          taskId,
          sessionId,
          error: message,
        },
        500
      );
    }
  }
);

// =============================================================================
// PROJECT-SPECIFIC ENDPOINTS
// =============================================================================

/**
 * GET /milestones/:event_id
 * 이벤트 마일스톤 조회 (D1에서)
 */
project.get("/milestones/:event_id", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param("event_id");

  try {
    const result = await db
      .prepare("SELECT * FROM project_milestones WHERE event_id = ? ORDER BY target_date ASC")
      .bind(eventId)
      .all();

    return c.json({
      event_id: eventId,
      milestones: result.results || [],
      total: (result.results || []).length,
    });
  } catch (error) {
    return c.json({
      event_id: eventId,
      milestones: [],
      total: 0,
      note: "No milestones found or table not initialized",
    });
  }
});

/**
 * GET /tasks/:event_id
 * 이벤트 태스크 조회 (D1에서)
 */
project.get("/tasks/:event_id", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param("event_id");
  const status = c.req.query("status");

  try {
    let sql = "SELECT * FROM project_tasks WHERE event_id = ?";
    const params: string[] = [eventId];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY created_at DESC";

    const result = await db.prepare(sql).bind(...params).all();

    return c.json({
      event_id: eventId,
      tasks: result.results || [],
      total: (result.results || []).length,
    });
  } catch (error) {
    return c.json({
      event_id: eventId,
      tasks: [],
      total: 0,
      note: "No tasks found or table not initialized",
    });
  }
});

/**
 * GET /issues/:event_id
 * 이벤트 이슈 조회 (D1에서)
 */
project.get("/issues/:event_id", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param("event_id");
  const priority = c.req.query("priority");

  try {
    let sql = "SELECT * FROM project_issues WHERE event_id = ?";
    const params: string[] = [eventId];

    if (priority) {
      sql += " AND priority = ?";
      params.push(priority);
    }

    sql += " ORDER BY created_at DESC";

    const result = await db.prepare(sql).bind(...params).all();

    return c.json({
      event_id: eventId,
      issues: result.results || [],
      total: (result.results || []).length,
    });
  } catch (error) {
    return c.json({
      event_id: eventId,
      issues: [],
      total: 0,
      note: "No issues found or table not initialized",
    });
  }
});

/**
 * GET /resources/:event_id
 * 이벤트 자원 조회 (D1에서)
 */
project.get("/resources/:event_id", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param("event_id");
  const resourceType = c.req.query("type");

  try {
    let sql = "SELECT * FROM project_resources WHERE event_id = ?";
    const params: string[] = [eventId];

    if (resourceType) {
      sql += " AND resource_type = ?";
      params.push(resourceType);
    }

    const result = await db.prepare(sql).bind(...params).all();

    return c.json({
      event_id: eventId,
      resources: result.results || [],
      total: (result.results || []).length,
    });
  } catch (error) {
    return c.json({
      event_id: eventId,
      resources: [],
      total: 0,
      note: "No resources found or table not initialized",
    });
  }
});

/**
 * GET /documents/:event_id
 * 이벤트 문서 조회 (D1에서)
 */
project.get("/documents/:event_id", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param("event_id");
  const docType = c.req.query("type");

  try {
    let sql = "SELECT * FROM project_documents WHERE event_id = ?";
    const params: string[] = [eventId];

    if (docType) {
      sql += " AND document_type = ?";
      params.push(docType);
    }

    sql += " ORDER BY created_at DESC";

    const result = await db.prepare(sql).bind(...params).all();

    return c.json({
      event_id: eventId,
      documents: result.results || [],
      total: (result.results || []).length,
    });
  } catch (error) {
    return c.json({
      event_id: eventId,
      documents: [],
      total: 0,
      note: "No documents found or table not initialized",
    });
  }
});

export default project;
