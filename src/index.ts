/**
 * Global Standard Event Agent API
 *
 * 이벤트 기획 및 실행을 위한 AI-Native Agent System API.
 * - CMP International Standards 준수
 * - EMBOK 5x5 Matrix 기반 도메인 설계
 * - Cvent REST API 호환
 *
 * Version: 0.1.0
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./types";
import finance from "./routes/finance";
import strategy from "./routes/strategy";
import project from "./routes/project";
import marketing from "./routes/marketing";
import operations from "./routes/operations";
import hr from "./routes/hr";
import meetings from "./routes/meetings";
import ask from "./routes/ask";
import system from "./routes/system";
import { IntelligentRouter } from "./lib/router";
import { listAgents as listFinanceAgents } from "./agents/finance/registry";
import { listAgents as listStrategyAgents } from "./agents/strategy/registry";
import { listAgents as listProjectAgents } from "./agents/project/registry";
import { listMarketingAgents } from "./agents/marketing/registry";
import { listOperationsAgents } from "./agents/operations/registry";
import { listHRAgents } from "./agents/hr/registry";
import { listMeetingsAgents } from "./agents/meetings/registry";

// =============================================================================
// APP INITIALIZATION
// =============================================================================

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Logger
app.use("*", logger());

// CORS - Lovable 및 모든 프론트엔드 허용
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// =============================================================================
// ROUTES
// =============================================================================

// Finance Router (/finance/*)
app.route("/finance", finance);

// Strategy Router (/strategy/*)
app.route("/strategy", strategy);

// Project Router (/project/*)
app.route("/project", project);

// Marketing Router (/marketing/*)
app.route("/marketing", marketing);

// Operations Router (/operations/*)
app.route("/operations", operations);

// HR Router (/hr/*)
app.route("/hr", hr);

// Meetings Router (/meetings/*)
app.route("/meetings", meetings);

// Intelligent Ask Router (/ask/*)
app.route("/ask", ask);

// System Admin Router (/system/*) - 관리자 전용
app.route("/system", system);

// =============================================================================
// ROOT ENDPOINTS
// =============================================================================

/**
 * GET /
 * API 상태 확인
 */
app.get("/", (c) => {
  return c.json({
    message: "Global Standard Event Agent API is Running",
    version: "0.8.0",
    standards: ["CMP-IS", "EMBOK", "APEX"],
    active_domains: ["Strategic Planning", "Project Management", "Marketing Management", "Financial Management", "Operations Management", "Human Resources"],
    features: ["Intelligent Router", "Session Memory", "Gap Detection", "Agent Orchestration", "Knowledge Learning"],
    endpoints: {
      ask: "/ask - Natural language routing & execution",
      strategy: "/strategy/agents - Strategic planning agents",
      project: "/project/agents - Project management agents",
      marketing: "/marketing/agents - Marketing management agents",
      finance: "/finance/agents - Financial management agents",
      operations: "/operations/agents - Operations management agents",
      hr: "/hr/agents - Human resources agents",
      system: "/system - Admin orchestration & learning system",
    },
    docs: "/docs",
  });
});

// 시스템 에이전트 정보 (SYS-001 ~ SYS-005)
const SYSTEM_AGENTS = [
  { id: "SYS-001", name: "Document Analyzer", taskType: "AI" as const },
  { id: "SYS-002", name: "Consistency Checker", taskType: "AI" as const },
  { id: "SYS-003", name: "Performance Monitor", taskType: "AI" as const },
  { id: "SYS-004", name: "Knowledge Integrator", taskType: "AI" as const },
  { id: "SYS-005", name: "Web Searcher", taskType: "AI" as const },
];

/**
 * GET /health
 * 헬스체크
 */
app.get("/health", (c) => {
  const financeAgents = listFinanceAgents();
  const strategyAgents = listStrategyAgents({});
  const projectAgents = listProjectAgents();
  const marketingAgents = listMarketingAgents();
  const operationsAgents = listOperationsAgents();
  const hrAgents = listHRAgents();
  const meetingsAgentsInfo = listMeetingsAgents();
  const systemAgentCount = SYSTEM_AGENTS.length;

  return c.json({
    status: "healthy",
    api_version: "0.8.1",
    total_agents: financeAgents.length + strategyAgents.length + projectAgents.length + marketingAgents.length + operationsAgents.length + hrAgents.length + meetingsAgentsInfo.length + systemAgentCount,
    domains: {
      strategic_planning: {
        status: "active",
        reference: "CMP-IS Domain A",
        agent_count: strategyAgents.length,
        skills: [
          "Skill 1: Goal Setting",
          "Skill 2: Stakeholder Analysis",
          "Skill 3: Risk Management",
          "Skill 4: Strategic Alignment",
        ],
      },
      project_management: {
        status: "active",
        reference: "CMP-IS Domain B",
        agent_count: projectAgents.length,
        skills: [
          "Skill 5: Plan Project",
          "Skill 6: Manage Project",
        ],
      },
      marketing_management: {
        status: "active",
        reference: "CMP-IS Domain C",
        agent_count: marketingAgents.length,
        skills: [
          "Skill 7: Plan Marketing",
          "Skill 8: Execute Marketing",
        ],
      },
      financial_management: {
        status: "active",
        reference: "CMP-IS Domain D",
        agent_count: financeAgents.length,
        skills: [
          "Skill 7: Manage Event Funding",
          "Skill 8: Manage Budget",
          "Skill 9: Manage Monetary Transactions",
        ],
      },
      operations_management: {
        status: "active",
        reference: "CMP-IS Domain E",
        agent_count: operationsAgents.length,
        skills: [
          "Skill 9: Site Management",
          "Skill 10: Logistics Management",
        ],
      },
      human_resources: {
        status: "active",
        reference: "CMP-IS Domain F",
        agent_count: hrAgents.length,
        skills: [
          "Skill 11: HR Planning",
          "Skill 12: HR Management",
        ],
      },
      meetings_contents: {
        status: "active",
        reference: "CMP-IS Domain G",
        agent_count: meetingsAgentsInfo.length,
        skills: [
          "Skill 13: Program Design",
          "Skill 14: Speaker & Content Management",
        ],
      },
      system: {
        status: "active",
        reference: "System Orchestration",
        agent_count: systemAgentCount,
        agents: SYSTEM_AGENTS.map((a) => ({ id: a.id, name: a.name })),
      },
    },
  });
});

/**
 * GET /system/stats
 * 실시간 에이전트 통계 (Lovable UI 연동용)
 */
app.get("/system/stats", (c) => {
  const financeAgents = listFinanceAgents();
  const strategyAgents = listStrategyAgents({});
  const projectAgents = listProjectAgents();
  const marketingAgents = listMarketingAgents();
  const operationsAgents = listOperationsAgents();
  const hrAgents = listHRAgents();
  const meetingsAgentsInfo = listMeetingsAgents();
  const routerStats = IntelligentRouter.getAgentStats();

  // 타입별 분류
  const financeByType = { AI: 0, Human: 0, Hybrid: 0 };
  for (const agent of financeAgents) {
    financeByType[agent.taskType as keyof typeof financeByType]++;
  }

  const strategyByType = { AI: 0, Human: 0, Hybrid: 0 };
  for (const agent of strategyAgents) {
    strategyByType[agent.taskType as keyof typeof strategyByType]++;
  }

  const projectByType = { AI: 0, Human: 0, Hybrid: 0 };
  for (const agent of projectAgents) {
    projectByType[agent.taskType as keyof typeof projectByType]++;
  }

  const marketingByType = { AI: 0, Human: 0, Hybrid: 0 };
  for (const agent of marketingAgents) {
    marketingByType[agent.taskType as keyof typeof marketingByType]++;
  }

  const operationsByType = { AI: 0, Human: 0, Hybrid: 0 };
  for (const agent of operationsAgents) {
    operationsByType[agent.taskType as keyof typeof operationsByType]++;
  }

  const hrByType = { AI: 0, Human: 0, Hybrid: 0 };
  for (const agent of hrAgents) {
    hrByType[agent.taskType as keyof typeof hrByType]++;
  }

  const meetingsByType = { AI: 0, Human: 0, Hybrid: 0 };
  for (const agent of meetingsAgentsInfo) {
    meetingsByType[agent.taskType as keyof typeof meetingsByType]++;
  }

  const systemByType = { AI: SYSTEM_AGENTS.length, Human: 0, Hybrid: 0 };

  return c.json({
    success: true,
    timestamp: new Date().toISOString(),
    total_agents: financeAgents.length + strategyAgents.length + projectAgents.length + marketingAgents.length + operationsAgents.length + hrAgents.length + meetingsAgentsInfo.length + SYSTEM_AGENTS.length,
    router_catalog_count: routerStats.total,
    domains: {
      strategy: {
        code: "A",
        name: "Strategic Planning",
        total: strategyAgents.length,
        by_type: strategyByType,
        skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      },
      project: {
        code: "B",
        name: "Project Management",
        total: projectAgents.length,
        by_type: projectByType,
        skills: ["Skill 5", "Skill 6"],
      },
      marketing: {
        code: "C",
        name: "Marketing Management",
        total: marketingAgents.length,
        by_type: marketingByType,
        skills: ["Skill 7", "Skill 8"],
      },
      finance: {
        code: "D",
        name: "Financial Management",
        total: financeAgents.length,
        by_type: financeByType,
        skills: ["Skill 7", "Skill 8", "Skill 9"],
      },
      operations: {
        code: "E",
        name: "Operations Management",
        total: operationsAgents.length,
        by_type: operationsByType,
        skills: ["Skill 9", "Skill 10"],
      },
      hr: {
        code: "F",
        name: "Human Resources",
        total: hrAgents.length,
        by_type: hrByType,
        skills: ["Skill 11", "Skill 12"],
      },
      meetings: {
        code: "G",
        name: "Meetings & Contents",
        total: meetingsAgentsInfo.length,
        by_type: meetingsByType,
        skills: ["Skill 13", "Skill 14"],
      },
      system: {
        code: "SYS",
        name: "System Orchestration",
        total: SYSTEM_AGENTS.length,
        by_type: systemByType,
        agents: SYSTEM_AGENTS.map((a) => ({ id: a.id, name: a.name })),
      },
    },
    features: {
      intelligent_routing: true,
      session_memory: true,
      gap_detection: true,
      out_of_scope_detection: true,
    },
  });
});

// =============================================================================
// ERROR HANDLER
// =============================================================================

app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`);
  return c.json(
    {
      error: "Internal Server Error",
      detail: err.message,
      path: c.req.url,
    },
    500
  );
});

// =============================================================================
// 404 HANDLER
// =============================================================================

app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      path: c.req.url,
    },
    404
  );
});

// =============================================================================
// EXPORT
// =============================================================================

export default app;
