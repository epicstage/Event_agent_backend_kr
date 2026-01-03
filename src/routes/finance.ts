/**
 * Financial Management API Routes
 *
 * 이벤트 재무 관리 API 엔드포인트.
 * - CMP-IS Domain D (Skills 7, 8, 9) 준수
 * - Cloudflare D1 Database 연동
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../types";
import {
  BudgetLineItem,
  BudgetItemCreateSchema,
  BudgetItemUpdateSchema,
  SponsorshipPackage,
  Sponsor,
  FinancialReport,
  ReportGenerateRequestSchema,
  BudgetSummary,
  generateUUID,
  nowISO,
  calcVariance,
  calcVariancePercentage,
  calcROI,
  calcCostPerAttendee,
} from "../schemas/financial";
import { executeAgent, executeAgentWithLLM, listAgents, getAgent } from "../agents/finance/registry";

// =============================================================================
// ROUTER
// =============================================================================

const finance = new Hono<{ Bindings: Env }>();

// =============================================================================
// BUDGET ENDPOINTS
// =============================================================================

/**
 * POST /budget-items
 * 예산 항목 추가
 * CMP-IS Reference: Skill 8.1.e - Allocating budget amounts
 */
finance.post(
  "/budget-items",
  zValidator("json", BudgetItemCreateSchema),
  async (c) => {
    const body = c.req.valid("json");
    const db = c.env.DB;

    const id = generateUUID();
    const now = nowISO();
    const projected = body.unit_cost * body.quantity;

    await db
      .prepare(
        `INSERT INTO budget_items
        (id, event_id, category, name, description, vendor_name, cost_type,
         unit_cost, quantity, projected_amount, actual_amount, currency,
         status, payment_due_date, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        body.event_id,
        body.category,
        body.name,
        body.description || null,
        body.vendor_name || null,
        body.cost_type,
        body.unit_cost,
        body.quantity,
        projected,
        0,
        body.currency,
        "draft",
        body.payment_due_date || null,
        body.notes || null,
        now,
        now
      )
      .run();

    const item = {
      id,
      event_id: body.event_id,
      category: body.category,
      name: body.name,
      description: body.description,
      vendor_name: body.vendor_name,
      cost_type: body.cost_type,
      unit_cost: body.unit_cost,
      quantity: body.quantity,
      projected_amount: projected,
      actual_amount: 0,
      currency: body.currency,
      status: "draft",
      payment_due_date: body.payment_due_date,
      notes: body.notes,
      created_at: now,
      updated_at: now,
      variance: projected,
      variance_percentage: 100,
    };

    return c.json(item, 201);
  }
);

/**
 * GET /budget-items
 * 예산 항목 전체 조회
 */
finance.get("/budget-items", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.query("event_id");
  const category = c.req.query("category");
  const status = c.req.query("status");

  let sql = "SELECT * FROM budget_items WHERE 1=1";
  const params: string[] = [];

  if (eventId) {
    sql += " AND event_id = ?";
    params.push(eventId);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";

  const stmt = db.prepare(sql);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  const items = (result.results || []).map((row: any) => ({
    ...row,
    variance: calcVariance(row.projected_amount, row.actual_amount),
    variance_percentage: calcVariancePercentage(
      row.projected_amount,
      row.actual_amount
    ),
  }));

  return c.json(items);
});

/**
 * GET /budget-items/:item_id
 * 예산 항목 단일 조회
 */
finance.get("/budget-items/:item_id", async (c) => {
  const db = c.env.DB;
  const itemId = c.req.param("item_id");

  const result = await db
    .prepare("SELECT * FROM budget_items WHERE id = ?")
    .bind(itemId)
    .first();

  if (!result) {
    return c.json({ error: `Budget item ${itemId} not found` }, 404);
  }

  const item = {
    ...result,
    variance: calcVariance(
      result.projected_amount as number,
      result.actual_amount as number
    ),
    variance_percentage: calcVariancePercentage(
      result.projected_amount as number,
      result.actual_amount as number
    ),
  };

  return c.json(item);
});

/**
 * PATCH /budget-items/:item_id
 * 예산 항목 수정
 * CMP-IS Reference: Skill 8.3 - Monitor and revise budget
 */
finance.patch(
  "/budget-items/:item_id",
  zValidator("json", BudgetItemUpdateSchema),
  async (c) => {
    const db = c.env.DB;
    const itemId = c.req.param("item_id");
    const update = c.req.valid("json");

    // Check if exists
    const existing = await db
      .prepare("SELECT * FROM budget_items WHERE id = ?")
      .bind(itemId)
      .first();

    if (!existing) {
      return c.json({ error: `Budget item ${itemId} not found` }, 404);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (update.category !== undefined) {
      updates.push("category = ?");
      values.push(update.category);
    }
    if (update.name !== undefined) {
      updates.push("name = ?");
      values.push(update.name);
    }
    if (update.description !== undefined) {
      updates.push("description = ?");
      values.push(update.description);
    }
    if (update.vendor_name !== undefined) {
      updates.push("vendor_name = ?");
      values.push(update.vendor_name);
    }
    if (update.cost_type !== undefined) {
      updates.push("cost_type = ?");
      values.push(update.cost_type);
    }
    if (update.unit_cost !== undefined) {
      updates.push("unit_cost = ?");
      values.push(update.unit_cost);
    }
    if (update.quantity !== undefined) {
      updates.push("quantity = ?");
      values.push(update.quantity);
    }
    if (update.actual_amount !== undefined) {
      updates.push("actual_amount = ?");
      values.push(update.actual_amount);
    }
    if (update.status !== undefined) {
      updates.push("status = ?");
      values.push(update.status);
    }
    if (update.notes !== undefined) {
      updates.push("notes = ?");
      values.push(update.notes);
    }

    // Recalculate projected if needed
    const newUnitCost = update.unit_cost ?? (existing.unit_cost as number);
    const newQuantity = update.quantity ?? (existing.quantity as number);
    const newProjected = newUnitCost * newQuantity;

    if (update.unit_cost !== undefined || update.quantity !== undefined) {
      updates.push("projected_amount = ?");
      values.push(newProjected);
    }

    updates.push("updated_at = ?");
    values.push(nowISO());
    values.push(itemId);

    await db
      .prepare(`UPDATE budget_items SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    // Fetch updated record
    const updated = await db
      .prepare("SELECT * FROM budget_items WHERE id = ?")
      .bind(itemId)
      .first();

    const response = {
      ...updated,
      variance: calcVariance(
        updated!.projected_amount as number,
        updated!.actual_amount as number
      ),
      variance_percentage: calcVariancePercentage(
        updated!.projected_amount as number,
        updated!.actual_amount as number
      ),
    };

    return c.json(response);
  }
);

/**
 * DELETE /budget-items/:item_id
 * 예산 항목 삭제
 */
finance.delete("/budget-items/:item_id", async (c) => {
  const db = c.env.DB;
  const itemId = c.req.param("item_id");

  const result = await db
    .prepare("DELETE FROM budget_items WHERE id = ?")
    .bind(itemId)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: `Budget item ${itemId} not found` }, 404);
  }

  return c.body(null, 204);
});

/**
 * GET /budget-items/summary/:event_id
 * 예산 요약 조회
 */
finance.get("/budget-items/summary/:event_id", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param("event_id");

  const items = await db
    .prepare("SELECT * FROM budget_items WHERE event_id = ?")
    .bind(eventId)
    .all();

  const rows = items.results || [];

  if (rows.length === 0) {
    return c.json({
      total_items: 0,
      total_projected: 0,
      total_actual: 0,
      total_variance: 0,
      by_category: {},
      by_status: {},
    });
  }

  let totalProjected = 0;
  let totalActual = 0;
  const byCategory: Record<string, { projected: number; actual: number; count: number }> = {};
  const byStatus: Record<string, number> = {};

  for (const row of rows as any[]) {
    totalProjected += row.projected_amount;
    totalActual += row.actual_amount;

    if (!byCategory[row.category]) {
      byCategory[row.category] = { projected: 0, actual: 0, count: 0 };
    }
    byCategory[row.category].projected += row.projected_amount;
    byCategory[row.category].actual += row.actual_amount;
    byCategory[row.category].count += 1;

    byStatus[row.status] = (byStatus[row.status] || 0) + 1;
  }

  return c.json({
    total_items: rows.length,
    total_projected: totalProjected,
    total_actual: totalActual,
    total_variance: totalProjected - totalActual,
    by_category: byCategory,
    by_status: byStatus,
  });
});

// =============================================================================
// REPORT ENDPOINTS
// =============================================================================

/**
 * POST /reports/generate
 * 재무 리포트 생성
 * CMP-IS Reference: Skill 8.3.i - Completing financial reports
 */
finance.post(
  "/reports/generate",
  zValidator("json", ReportGenerateRequestSchema),
  async (c) => {
    const db = c.env.DB;
    const req = c.req.valid("json");

    // Get budget items for this event
    const budgetItems = await db
      .prepare("SELECT * FROM budget_items WHERE event_id = ?")
      .bind(req.event_id)
      .all();

    const items = budgetItems.results || [];
    let totalBudget = 0;
    let totalActual = 0;

    for (const row of items as any[]) {
      totalBudget += row.projected_amount;
      totalActual += row.actual_amount;
    }

    // Get contracted sponsors
    const sponsors = await db
      .prepare("SELECT * FROM sponsors WHERE status = 'contracted'")
      .all();

    let totalSponsorship = 0;
    for (const s of (sponsors.results || []) as any[]) {
      totalSponsorship += s.committed_amount || 0;
    }

    const totalRevenue = totalSponsorship;
    const netProfit = totalRevenue - totalActual;
    const roi = calcROI(netProfit, totalActual);
    const costPerAttendee = calcCostPerAttendee(totalActual, req.total_attendees);
    const revenuePerAttendee = req.total_attendees > 0 ? totalRevenue / req.total_attendees : 0;

    const id = generateUUID();
    const now = nowISO();

    await db
      .prepare(
        `INSERT INTO financial_reports
        (id, event_id, report_name, report_date, period_start, period_end,
         currency, total_registration_revenue, total_sponsorship_revenue,
         total_exhibit_revenue, total_other_revenue, total_budget,
         total_actual, total_attendees, paid_attendees)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        req.event_id,
        req.report_name,
        now,
        req.period_start,
        req.period_end,
        "USD",
        0,
        totalSponsorship,
        0,
        0,
        totalBudget,
        totalActual,
        req.total_attendees,
        req.paid_attendees
      )
      .run();

    const report = {
      id,
      event_id: req.event_id,
      report_name: req.report_name,
      report_date: now,
      period_start: req.period_start,
      period_end: req.period_end,
      currency: "USD",
      total_registration_revenue: 0,
      total_sponsorship_revenue: totalSponsorship,
      total_exhibit_revenue: 0,
      total_other_revenue: 0,
      total_budget: totalBudget,
      total_actual: totalActual,
      total_attendees: req.total_attendees,
      paid_attendees: req.paid_attendees,
      total_revenue: totalRevenue,
      net_profit: netProfit,
      roi_percentage: roi,
      cost_per_attendee: costPerAttendee,
      revenue_per_attendee: revenuePerAttendee,
      budget_variance: totalBudget - totalActual,
      budget_utilization_rate: totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0,
    };

    return c.json(report, 201);
  }
);

/**
 * GET /reports
 * 리포트 목록 조회
 */
finance.get("/reports", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.query("event_id");

  let sql = "SELECT * FROM financial_reports";
  const params: string[] = [];

  if (eventId) {
    sql += " WHERE event_id = ?";
    params.push(eventId);
  }

  sql += " ORDER BY report_date DESC";

  const stmt = db.prepare(sql);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  const reports = (result.results || []).map((row: any) => {
    const totalRevenue =
      row.total_registration_revenue +
      row.total_sponsorship_revenue +
      row.total_exhibit_revenue +
      row.total_other_revenue;
    const netProfit = totalRevenue - row.total_actual;

    return {
      ...row,
      total_revenue: totalRevenue,
      net_profit: netProfit,
      roi_percentage: calcROI(netProfit, row.total_actual),
      cost_per_attendee: calcCostPerAttendee(row.total_actual, row.total_attendees),
      revenue_per_attendee:
        row.total_attendees > 0 ? totalRevenue / row.total_attendees : 0,
      budget_variance: row.total_budget - row.total_actual,
      budget_utilization_rate:
        row.total_budget > 0 ? (row.total_actual / row.total_budget) * 100 : 0,
    };
  });

  return c.json(reports);
});

/**
 * GET /reports/:report_id
 * 리포트 상세 조회
 */
finance.get("/reports/:report_id", async (c) => {
  const db = c.env.DB;
  const reportId = c.req.param("report_id");

  const row: any = await db
    .prepare("SELECT * FROM financial_reports WHERE id = ?")
    .bind(reportId)
    .first();

  if (!row) {
    return c.json({ error: `Report ${reportId} not found` }, 404);
  }

  const totalRevenue =
    row.total_registration_revenue +
    row.total_sponsorship_revenue +
    row.total_exhibit_revenue +
    row.total_other_revenue;
  const netProfit = totalRevenue - row.total_actual;

  return c.json({
    ...row,
    total_revenue: totalRevenue,
    net_profit: netProfit,
    roi_percentage: calcROI(netProfit, row.total_actual),
    cost_per_attendee: calcCostPerAttendee(row.total_actual, row.total_attendees),
    revenue_per_attendee: row.total_attendees > 0 ? totalRevenue / row.total_attendees : 0,
    budget_variance: row.total_budget - row.total_actual,
    budget_utilization_rate:
      row.total_budget > 0 ? (row.total_actual / row.total_budget) * 100 : 0,
  });
});

// =============================================================================
// SPONSORSHIP ENDPOINTS
// =============================================================================

/**
 * POST /sponsorship-packages
 * 스폰서십 패키지 생성
 */
finance.post("/sponsorship-packages", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const id = generateUUID();
  const benefits = JSON.stringify(body.benefits || []);

  await db
    .prepare(
      `INSERT INTO sponsorship_packages
      (id, event_id, tier, tier_name, amount, currency, benefits, max_sponsors, sold_count, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      body.event_id,
      body.tier,
      body.tier_name,
      body.amount,
      body.currency || "USD",
      benefits,
      body.max_sponsors || 1,
      0,
      1
    )
    .run();

  const pkg = {
    id,
    event_id: body.event_id,
    tier: body.tier,
    tier_name: body.tier_name,
    amount: body.amount,
    currency: body.currency || "USD",
    benefits: body.benefits || [],
    max_sponsors: body.max_sponsors || 1,
    sold_count: 0,
    is_active: true,
    available_count: body.max_sponsors || 1,
    total_benefit_value: 0,
    total_cost_to_provide: 0,
    net_revenue: body.amount,
  };

  return c.json(pkg, 201);
});

/**
 * GET /sponsorship-packages
 * 스폰서십 패키지 목록
 */
finance.get("/sponsorship-packages", async (c) => {
  const db = c.env.DB;
  const eventId = c.req.query("event_id");

  let sql = "SELECT * FROM sponsorship_packages";
  const params: string[] = [];

  if (eventId) {
    sql += " WHERE event_id = ?";
    params.push(eventId);
  }

  const stmt = db.prepare(sql);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  const packages = (result.results || []).map((row: any) => {
    const benefits = row.benefits ? JSON.parse(row.benefits) : [];
    return {
      ...row,
      benefits,
      is_active: !!row.is_active,
      available_count: Math.max(0, row.max_sponsors - row.sold_count),
      total_benefit_value: benefits.reduce(
        (s: number, b: any) => s + (b.value || 0) * (b.quantity || 1),
        0
      ),
      total_cost_to_provide: benefits.reduce(
        (s: number, b: any) => s + (b.cost_to_provide || 0) * (b.quantity || 1),
        0
      ),
      net_revenue:
        row.amount -
        benefits.reduce(
          (s: number, b: any) => s + (b.cost_to_provide || 0) * (b.quantity || 1),
          0
        ),
    };
  });

  return c.json(packages);
});

/**
 * POST /sponsors
 * 스폰서 등록
 */
finance.post("/sponsors", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const id = generateUUID();

  await db
    .prepare(
      `INSERT INTO sponsors
      (id, company_name, industry, contact_name, contact_email, contact_phone, status, committed_amount, fulfillment_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      body.company_name,
      body.industry,
      body.contact_name,
      body.contact_email,
      body.contact_phone || null,
      "prospect",
      0,
      0
    )
    .run();

  return c.json(
    {
      id,
      company_name: body.company_name,
      industry: body.industry,
      contact_name: body.contact_name,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      status: "prospect",
      committed_amount: 0,
      fulfillment_rate: 0,
    },
    201
  );
});

/**
 * GET /sponsors
 * 스폰서 목록
 */
finance.get("/sponsors", async (c) => {
  const db = c.env.DB;
  const status = c.req.query("status");

  let sql = "SELECT * FROM sponsors";
  const params: string[] = [];

  if (status) {
    sql += " WHERE status = ?";
    params.push(status);
  }

  const stmt = db.prepare(sql);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  return c.json(result.results || []);
});

/**
 * PATCH /sponsors/:sponsor_id/status
 * 스폰서 상태 변경
 */
finance.patch("/sponsors/:sponsor_id/status", async (c) => {
  const db = c.env.DB;
  const sponsorId = c.req.param("sponsor_id");
  const body = await c.req.json();

  const existing = await db
    .prepare("SELECT * FROM sponsors WHERE id = ?")
    .bind(sponsorId)
    .first();

  if (!existing) {
    return c.json({ error: `Sponsor ${sponsorId} not found` }, 404);
  }

  const updates: string[] = ["status = ?"];
  const values: any[] = [body.status];

  if (body.committed_amount !== undefined) {
    updates.push("committed_amount = ?");
    values.push(body.committed_amount);
  }
  if (body.package_id !== undefined) {
    updates.push("package_id = ?");
    values.push(body.package_id);
  }
  if (body.status === "contracted") {
    updates.push("contract_signed_at = ?");
    values.push(nowISO());
  }

  values.push(sponsorId);

  await db
    .prepare(`UPDATE sponsors SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  const updated = await db
    .prepare("SELECT * FROM sponsors WHERE id = ?")
    .bind(sponsorId)
    .first();

  return c.json(updated);
});

// =============================================================================
// AGENT ENDPOINTS
// =============================================================================

/**
 * Agent Execute Request Schema
 */
const AgentExecuteRequestSchema = z.object({
  taskId: z.string().regex(/^FIN-\d{3}$/, "Invalid task ID format (FIN-XXX)"),
  input: z.record(z.any()),
});

/**
 * POST /agents/execute
 * AI 에이전트 실행
 * CMP-IS Domain D: Financial Management (Skills 7, 8, 9)
 */
finance.post(
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
finance.get("/agents", async (c) => {
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
finance.get("/agents/:taskId", async (c) => {
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
  taskId: z.string().regex(/^FIN-\d{3}$/, "Invalid task ID format (FIN-XXX)"),
  input: z.record(z.any()),
  sessionId: z.string().optional(), // 세션 ID (없으면 자동 생성)
});

/**
 * POST /agents/execute-with-llm
 * AI 에이전트 실행 + Cloudflare Workers AI (Llama 3.3) 보강
 *
 * 기능:
 * - 로컬 로직 실행 후 LLM이 결과를 검토하고 AI 인사이트 제공
 * - 세션 컨텍스트 (Short-term Memory) 주입
 * - D1 interactions 테이블에 로깅
 * - evolution_note로 AI 자기 학습
 * - gap_detected로 시스템 한계 자가 진단
 * - 반복 질문/불만 감지 및 기록
 * - 사용자 선호도 캐싱
 */
finance.post(
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

    // 동적 import (세션/인터랙션/갭 모듈)
    const {
      getSessionContext,
      addConversation,
      buildShortTermMemoryPrompt,
      generateSessionId,
      getFrustrationLevel,
    } = await import("../lib/session");
    const { logInteraction } = await import("../lib/interactions");
    const { logSystemGap, logRawConversation } = await import("../lib/gaps");

    // 세션 ID 처리
    const sessionId = inputSessionId || generateSessionId();

    // 원본 사용자 입력 저장 (raw_conversations)
    try {
      await logRawConversation(db, sessionId, "user_input", JSON.stringify(input), {
        taskId,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Raw conversation logging failed:", e);
    }

    // 세션 컨텍스트 로드 (Short-term Memory + User Preferences)
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
      // executeAgentWithLLM에 shortTermMemory + userPreferences 전달
      const result = await executeAgentWithLLM(taskId, input, ai, shortTermMemory, userPreferences);

      // 세션에 대화 추가 (KV) + 반복 질문 감지
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

      // 에이전트 응답 저장 (raw_conversations)
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
// UTILITY ENDPOINTS
// =============================================================================

/**
 * DELETE /reset
 * 데이터 초기화 (개발용)
 */
finance.delete("/reset", async (c) => {
  const db = c.env.DB;

  await db.prepare("DELETE FROM budget_items").run();
  await db.prepare("DELETE FROM sponsorship_packages").run();
  await db.prepare("DELETE FROM sponsors").run();
  await db.prepare("DELETE FROM financial_reports").run();

  return c.body(null, 204);
});

export default finance;
