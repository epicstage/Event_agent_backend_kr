/**
 * Intelligent Ask Router
 *
 * 자연어 질문을 분석하여 적절한 에이전트로 라우팅하는 통합 엔드포인트.
 * - /ask: 질문만 던지면 AI가 알아서 담당 에이전트 선택
 * - /ask/route: 라우팅만 수행 (에이전트 실행 없음)
 * - /ask/execute: 라우팅 + 에이전트 실행
 */

import { Hono } from "hono";
import type { Env } from "../types";
import { createRouter, IntelligentRouter } from "../lib/router";
import { executeAgentWithLLM as executeFinanceAgent } from "../agents/finance/registry";
import { executeAgentWithLLM as executeStrategyAgent } from "../agents/strategy/registry";
import { executeAgentWithLLM as executeProjectAgent } from "../agents/project/registry";
import { executeAgentWithLLM as executeMarketingAgent } from "../agents/marketing/registry";
import { executeAgentWithLLM as executeOperationsAgent } from "../agents/operations/registry";
import { executeAgentWithLLM as executeHRAgent } from "../agents/hr/registry";
import { executeAgentWithLLM as executeMeetingsAgent } from "../agents/meetings/registry";
import { executeAgentWithLLM as executeSiteAgent } from "../agents/site/registry";
import { executeAgentWithLLM as executeProAgent } from "../agents/pro/registry";
import {
  getSessionContext,
  addConversation,
  getFrustrationLevel,
  buildShortTermMemoryPrompt,
  generateSessionId,
} from "../lib/session";

// =============================================================================
// ROUTER INITIALIZATION
// =============================================================================

const ask = new Hono<{ Bindings: Env }>();

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * Out-of-Scope 응답 메시지
 */
const OUT_OF_SCOPE_MESSAGE = {
  ko: "저는 이벤트 전문 에이전트입니다. 해당 질문은 답변 범위를 벗어납니다. 이벤트 기획, 전략, 재무 관련 질문을 해주세요.",
  en: "I am an Event Management AI Agent. This question is outside my scope. Please ask about event planning, strategy, or financial management.",
};

/**
 * POST /ask/route
 * 질문을 분석하여 적절한 에이전트 ID만 반환 (실행 없음)
 */
ask.post("/route", async (c) => {
  try {
    const body = await c.req.json();
    const { question, context } = body;

    if (!question || typeof question !== "string") {
      return c.json({ success: false, error: "question is required" }, 400);
    }

    const router = createRouter(c.env.AI);
    const routeResult = await router.route({ question, context });

    // Out-of-Scope 처리
    if (routeResult.isOutOfScope || routeResult.domain === "out_of_scope") {
      return c.json({
        success: true,
        isOutOfScope: true,
        routing: routeResult,
        message: OUT_OF_SCOPE_MESSAGE.ko,
        message_en: OUT_OF_SCOPE_MESSAGE.en,
        suggestions: [
          "이벤트 목표를 설정해주세요",
          "예산 구조를 설계해볼까요?",
          "이해관계자를 분석해보시겠어요?",
        ],
      });
    }

    const domainEndpoints: Record<string, string> = {
      finance: "/finance/agents/execute-with-llm",
      strategy: "/strategy/agents/execute-with-llm",
      project: "/project/agents/execute-with-llm",
      marketing: "/marketing/agents/execute-with-llm",
      operations: "/operations/agents/execute-with-llm",
      hr: "/hr/agents/execute-with-llm",
      meetings: "/meetings/agents/execute-with-llm",
      site: "/site/agents/execute-with-llm",
      professionalism: "/professionalism/agents/execute-with-llm",
    };

    return c.json({
      success: true,
      isOutOfScope: false,
      routing: routeResult,
      next_action: {
        endpoint: domainEndpoints[routeResult.domain] || "/ask",
        method: "POST",
        body_hint: {
          taskId: routeResult.taskId,
          input: "Provide appropriate input for this agent",
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * POST /ask
 * 자연어 질문 → 라우팅 → 에이전트 실행 → 결과 반환
 *
 * Body:
 * {
 *   "question": "예산 얼마나 필요해?",
 *   "sessionId": "optional",
 *   "input": { "event_id": "...", ... } // 에이전트 실행에 필요한 추가 데이터
 * }
 */
ask.post("/", async (c) => {
  const startTime = Date.now();

  try {
    const body = await c.req.json();
    const {
      question,
      sessionId: providedSessionId,
      input: additionalInput,
      context,
    } = body;

    if (!question || typeof question !== "string") {
      return c.json({ success: false, error: "question is required" }, 400);
    }

    // 1. 세션 관리
    const sessionId = providedSessionId || generateSessionId();
    const sessionContext = await getSessionContext(c.env.KV, sessionId);
    const shortTermMemory = buildShortTermMemoryPrompt(sessionContext);
    const frustration = getFrustrationLevel(sessionContext);

    // 2. 지능형 라우팅
    const router = createRouter(c.env.AI);
    const routeResult = await router.route({
      question,
      context: {
        ...context,
        previous_tasks: sessionContext?.conversations.map((c) => c.taskId),
      },
    });

    // 2.5. Out-of-Scope 처리 (에이전트 실행 전에 차단)
    if (routeResult.isOutOfScope || routeResult.domain === "out_of_scope") {
      const responseTime = Date.now() - startTime;
      return c.json({
        success: true,
        sessionId,
        question,
        isOutOfScope: true,
        message: OUT_OF_SCOPE_MESSAGE.ko,
        message_en: OUT_OF_SCOPE_MESSAGE.en,
        routing: {
          domain: "out_of_scope",
          confidence: routeResult.confidence,
          reasoning: routeResult.reasoning,
        },
        suggestions: [
          "이벤트 목표를 설정해주세요",
          "예산 구조를 설계해볼까요?",
          "이해관계자를 분석해보시겠어요?",
        ],
        metadata: {
          response_time_ms: responseTime,
        },
      });
    }

    // 3. 에이전트 실행
    let agentResult;
    const agentInput = {
      ...additionalInput,
      question, // 원본 질문도 전달
    };

    if (routeResult.domain === "finance") {
      agentResult = await executeFinanceAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "strategy") {
      agentResult = await executeStrategyAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "project") {
      agentResult = await executeProjectAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "marketing") {
      agentResult = await executeMarketingAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "operations") {
      agentResult = await executeOperationsAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "hr") {
      agentResult = await executeHRAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "meetings") {
      agentResult = await executeMeetingsAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "site") {
      agentResult = await executeSiteAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else if (routeResult.domain === "professionalism") {
      agentResult = await executeProAgent(
        routeResult.taskId,
        agentInput,
        c.env.AI,
        shortTermMemory,
        sessionContext?.preferences
      );
    } else {
      // Fallback - should not reach here due to out-of-scope check above
      return c.json({
        success: false,
        error: "Unknown domain",
        routing: routeResult,
      }, 400);
    }

    // 4. 대화 기록 저장
    const { isRepeated } = await addConversation(c.env.KV, sessionId, {
      taskId: routeResult.taskId,
      input: { question, ...additionalInput },
      output: agentResult.result,
      aiInsights: agentResult.ai_insights,
    });

    // 5. 응답 생성
    const responseTime = Date.now() - startTime;

    return c.json({
      success: true,
      sessionId,
      question,
      routing: {
        taskId: routeResult.taskId,
        domain: routeResult.domain,
        confidence: routeResult.confidence,
        reasoning: routeResult.reasoning,
      },
      result: agentResult.result,
      ai_enhanced: agentResult.ai_enhanced,
      ai_insights: agentResult.ai_insights,
      session: {
        frustration_detected: isRepeated,
        frustration_level: frustration.level,
      },
      metadata: {
        response_time_ms: responseTime,
        model_used: "@cf/meta/llama-3.1-70b-instruct",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ASK ERROR]", message);

    // 에러가 input validation인 경우 더 친절한 메시지
    if (message.includes("validation") || message.includes("required")) {
      return c.json({
        success: false,
        error: "Agent requires specific input data",
        hint: "Use /ask/route first to understand what input the selected agent needs",
        detail: message,
      }, 400);
    }

    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * GET /ask/catalog
 * 라우터가 알고 있는 모든 에이전트 목록
 */
ask.get("/catalog", (c) => {
  const catalog = IntelligentRouter.getAgentCatalog();

  const byDomain = {
    strategy: catalog.filter((a: { domain: string }) => a.domain === "strategy"),
    project: catalog.filter((a: { domain: string }) => a.domain === "project"),
    marketing: catalog.filter((a: { domain: string }) => a.domain === "marketing"),
    finance: catalog.filter((a: { domain: string }) => a.domain === "finance"),
    operations: catalog.filter((a: { domain: string }) => a.domain === "operations"),
    hr: catalog.filter((a: { domain: string }) => a.domain === "hr"),
    meetings: catalog.filter((a: { domain: string }) => a.domain === "meetings"),
    site: catalog.filter((a: { domain: string }) => a.domain === "site"),
    professionalism: catalog.filter((a: { domain: string }) => a.domain === "professionalism"),
  };

  return c.json({
    success: true,
    total: catalog.length,
    by_domain: {
      strategy: byDomain.strategy.length,
      project: byDomain.project.length,
      marketing: byDomain.marketing.length,
      finance: byDomain.finance.length,
      operations: byDomain.operations.length,
      hr: byDomain.hr.length,
      meetings: byDomain.meetings.length,
      site: byDomain.site.length,
      professionalism: byDomain.professionalism.length,
    },
    catalog: byDomain,
  });
});

/**
 * POST /ask/batch
 * 여러 질문을 한 번에 라우팅 (실행 없음)
 */
ask.post("/batch", async (c) => {
  try {
    const body = await c.req.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return c.json({ success: false, error: "questions array is required" }, 400);
    }

    if (questions.length > 10) {
      return c.json({ success: false, error: "Maximum 10 questions per batch" }, 400);
    }

    const router = createRouter(c.env.AI);
    const results = await Promise.all(
      questions.map(async (q: string) => {
        const result = await router.route({ question: q });
        return {
          question: q,
          routing: result,
        };
      })
    );

    return c.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * POST /ask/suggest
 * 사용자 입력에 기반한 다음 질문 제안
 */
ask.post("/suggest", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, current_task } = body;

    if (!sessionId) {
      return c.json({ success: false, error: "sessionId is required" }, 400);
    }

    const sessionContext = await getSessionContext(c.env.KV, sessionId);
    if (!sessionContext) {
      return c.json({
        success: true,
        suggestions: [
          "이벤트 목표를 설정해주세요",
          "예산 구조를 설계해볼까요?",
          "이해관계자를 분석해보시겠어요?",
        ],
      });
    }

    // 최근 대화 기반 제안
    const recentTasks = sessionContext.conversations.slice(-3).map((c) => c.taskId);
    const suggestions: string[] = [];

    // 전략 → 재무 흐름 제안
    if (recentTasks.includes("STR-001") && !recentTasks.includes("STR-002")) {
      suggestions.push("이해관계자를 분석해보시겠어요? (STR-002)");
    }
    if (recentTasks.includes("STR-001") && !recentTasks.includes("FIN-031")) {
      suggestions.push("목표에 맞는 예산 구조를 설계해볼까요? (FIN-031)");
    }
    if (recentTasks.includes("STR-002") && !recentTasks.includes("STR-003")) {
      suggestions.push("리스크를 식별해보시겠어요? (STR-003)");
    }
    if (recentTasks.includes("FIN-031") && !recentTasks.includes("FIN-037")) {
      suggestions.push("손익분기점을 분석해볼까요? (FIN-037)");
    }

    // 기본 제안
    if (suggestions.length === 0) {
      suggestions.push(
        "스폰서십 가치를 산정해볼까요?",
        "가격 책정 전략이 필요하신가요?",
        "리스크 평가를 진행해보시겠어요?"
      );
    }

    return c.json({
      success: true,
      sessionId,
      recent_tasks: recentTasks,
      suggestions: suggestions.slice(0, 3),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, error: message }, 500);
  }
});

export default ask;
