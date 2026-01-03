/**
 * System Routes - Admin API for Agent Orchestration & Learning
 *
 * 최상위 관리자 전용 엔드포인트:
 * - 문서 분석 및 지식 통합
 * - 일관성 검사
 * - 복명복창 승인 관리
 * - 성능 모니터링
 * - 웹 검색 및 캐싱
 */

import { Hono } from "hono";
import { SYS_001_DocumentAnalyzer } from "../agents/system/SYS_001_DocumentAnalyzer";
import { SYS_002_ConsistencyChecker } from "../agents/system/SYS_002_ConsistencyChecker";
import { ConfirmationGate } from "../lib/confirmation_gate";
import { KnowledgeEngine } from "../lib/knowledge_engine";

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
};

const systemApp = new Hono<{ Bindings: Bindings }>();

// =============================================================================
// Document Analysis (SYS-001)
// =============================================================================

/**
 * POST /system/analyze-document
 * 문서 분석 및 도메인/에이전트 매칭
 */
systemApp.post("/analyze-document", async (c) => {
  try {
    const body = await c.req.json();

    // Validate input
    const parseResult = SYS_001_DocumentAnalyzer.InputSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json(
        {
          success: false,
          error: "validation_error",
          details: parseResult.error.errors,
        },
        400
      );
    }

    // Execute basic analysis
    const result = await SYS_001_DocumentAnalyzer.execute(parseResult.data);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "analysis_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * POST /system/analyze-document-ai
 * AI 강화 문서 분석
 */
systemApp.post("/analyze-document-ai", async (c) => {
  try {
    const body = await c.req.json();

    const parseResult = SYS_001_DocumentAnalyzer.InputSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json(
        {
          success: false,
          error: "validation_error",
          details: parseResult.error.errors,
        },
        400
      );
    }

    // Execute AI-enhanced analysis
    const result = await SYS_001_DocumentAnalyzer.analyzeWithAI(parseResult.data, c.env.AI);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "ai_analysis_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// =============================================================================
// Consistency Check (SYS-002)
// =============================================================================

/**
 * POST /system/check-consistency
 * 새 지식의 CMP 표준 충돌 검사
 */
systemApp.post("/check-consistency", async (c) => {
  try {
    const body = await c.req.json();

    const parseResult = SYS_002_ConsistencyChecker.InputSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json(
        {
          success: false,
          error: "validation_error",
          details: parseResult.error.errors,
        },
        400
      );
    }

    const result = await SYS_002_ConsistencyChecker.execute(parseResult.data);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "consistency_check_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * POST /system/check-consistency-ai
 * AI 강화 일관성 검사
 */
systemApp.post("/check-consistency-ai", async (c) => {
  try {
    const body = await c.req.json();

    const parseResult = SYS_002_ConsistencyChecker.InputSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json(
        {
          success: false,
          error: "validation_error",
          details: parseResult.error.errors,
        },
        400
      );
    }

    const result = await SYS_002_ConsistencyChecker.checkWithAI(parseResult.data, c.env.AI);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "ai_consistency_check_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// =============================================================================
// Confirmation Gate (복명복창)
// =============================================================================

/**
 * POST /system/confirmation/check
 * 승인이 필요한지 확인
 */
systemApp.post("/confirmation/check", async (c) => {
  try {
    const body = await c.req.json();
    const { input, context } = body;

    if (!input || !context) {
      return c.json(
        {
          success: false,
          error: "missing_parameters",
          message: "input and context are required",
        },
        400
      );
    }

    const gate = new ConfirmationGate(c.env.DB);
    const result = await gate.checkRequiresConfirmation(input, context);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "check_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * POST /system/confirmation/create
 * 승인 요청 생성
 */
systemApp.post("/confirmation/create", async (c) => {
  try {
    const body = await c.req.json();

    const gate = new ConfirmationGate(c.env.DB);
    const result = await gate.createRequest(body);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "create_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * POST /system/confirmation/:id/confirm
 * 승인 처리
 */
systemApp.post("/confirmation/:id/confirm", async (c) => {
  try {
    const requestId = c.req.param("id");
    const { confirmed_by, note } = await c.req.json();

    if (!confirmed_by) {
      return c.json(
        {
          success: false,
          error: "missing_parameters",
          message: "confirmed_by is required",
        },
        400
      );
    }

    const gate = new ConfirmationGate(c.env.DB);
    const result = await gate.confirm(requestId, confirmed_by, note);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "confirm_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * POST /system/confirmation/:id/reject
 * 거부 처리
 */
systemApp.post("/confirmation/:id/reject", async (c) => {
  try {
    const requestId = c.req.param("id");
    const { rejected_by, reason } = await c.req.json();

    if (!rejected_by) {
      return c.json(
        {
          success: false,
          error: "missing_parameters",
          message: "rejected_by is required",
        },
        400
      );
    }

    const gate = new ConfirmationGate(c.env.DB);
    const result = await gate.reject(requestId, rejected_by, reason);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "reject_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * GET /system/confirmation/pending
 * 대기 중인 승인 요청 목록
 */
systemApp.get("/confirmation/pending", async (c) => {
  try {
    const gate = new ConfirmationGate(c.env.DB);
    const requests = await gate.getPendingRequests();

    return c.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "fetch_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// =============================================================================
// Knowledge Engine
// =============================================================================

/**
 * POST /system/knowledge/search
 * 웹 검색 (캐시 활용)
 */
systemApp.post("/knowledge/search", async (c) => {
  try {
    const body = await c.req.json();
    const { query, search_type, requesting_agent, force_refresh } = body;

    if (!query) {
      return c.json(
        {
          success: false,
          error: "missing_parameters",
          message: "query is required",
        },
        400
      );
    }

    const engine = new KnowledgeEngine(c.env.DB, c.env.AI);
    const result = await engine.search({
      query,
      search_type: search_type || "general",
      requesting_agent,
      force_refresh: force_refresh || false,
    });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "search_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * GET /system/knowledge/gaps
 * 지식 갭 감지
 */
systemApp.get("/knowledge/gaps", async (c) => {
  try {
    const agentId = c.req.query("agent_id");

    const engine = new KnowledgeEngine(c.env.DB, c.env.AI);
    const gaps = await engine.detectKnowledgeGaps(agentId);

    return c.json({
      success: true,
      data: gaps,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "detection_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * POST /system/knowledge/integrate
 * 검색 결과를 지식 베이스에 통합
 */
systemApp.post("/knowledge/integrate", async (c) => {
  try {
    const { search_result_id, verified_by } = await c.req.json();

    if (!search_result_id || !verified_by) {
      return c.json(
        {
          success: false,
          error: "missing_parameters",
          message: "search_result_id and verified_by are required",
        },
        400
      );
    }

    const engine = new KnowledgeEngine(c.env.DB, c.env.AI);
    const result = await engine.integrateToKnowledgeBase(search_result_id, verified_by);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "integration_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// =============================================================================
// Performance Monitoring
// =============================================================================

/**
 * POST /system/performance/log
 * 에이전트 성능 로그 기록
 */
systemApp.post("/performance/log", async (c) => {
  try {
    const body = await c.req.json();

    const engine = new KnowledgeEngine(c.env.DB, c.env.AI);
    await engine.logPerformance(body);

    return c.json({
      success: true,
      message: "Performance logged",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "log_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * GET /system/performance/stats/:agentId
 * 에이전트 성능 통계 조회
 */
systemApp.get("/performance/stats/:agentId", async (c) => {
  try {
    const agentId = c.req.param("agentId");
    const days = parseInt(c.req.query("days") || "7");

    const engine = new KnowledgeEngine(c.env.DB, c.env.AI);
    const stats = await engine.getPerformanceStats(agentId, days);

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "stats_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// =============================================================================
// System Health
// =============================================================================

/**
 * GET /system/health
 * 시스템 상태 확인
 */
systemApp.get("/health", async (c) => {
  try {
    // Check DB connection
    const dbCheck = await c.env.DB.prepare("SELECT 1 as ok").first();

    return c.json({
      success: true,
      status: "healthy",
      components: {
        database: dbCheck ? "connected" : "disconnected",
        ai: "available",
      },
      system_agents: [
        { id: "SYS-001", name: "Document Analyzer", status: "active" },
        { id: "SYS-002", name: "Consistency Checker", status: "active" },
        { id: "SYS-003", name: "Performance Monitor", status: "active" },
        { id: "SYS-004", name: "Knowledge Integrator", status: "active" },
        { id: "SYS-005", name: "Web Searcher", status: "active" },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * GET /system/agents
 * 시스템 에이전트 목록
 */
systemApp.get("/agents", async (c) => {
  return c.json({
    success: true,
    data: [
      {
        id: "SYS-001",
        name: "Document Analyzer",
        description: "업로드된 문서를 분석하여 관련 도메인 에이전트를 식별",
        type: "document_analyzer",
        endpoints: ["/system/analyze-document", "/system/analyze-document-ai"],
      },
      {
        id: "SYS-002",
        name: "Consistency Checker",
        description: "새로운 지식이 기존 CMP 표준과 충돌하는지 검토",
        type: "consistency_checker",
        endpoints: ["/system/check-consistency", "/system/check-consistency-ai"],
      },
      {
        id: "SYS-003",
        name: "Performance Monitor",
        description: "에이전트 성능 모니터링 및 이상 감지",
        type: "performance_monitor",
        endpoints: ["/system/performance/log", "/system/performance/stats/:agentId"],
      },
      {
        id: "SYS-004",
        name: "Knowledge Integrator",
        description: "검증된 지식을 에이전트에 통합",
        type: "knowledge_integrator",
        endpoints: ["/system/knowledge/integrate"],
      },
      {
        id: "SYS-005",
        name: "Web Searcher",
        description: "웹 검색 및 결과 캐싱",
        type: "web_searcher",
        endpoints: ["/system/knowledge/search", "/system/knowledge/gaps"],
      },
    ],
  });
});

export default systemApp;
