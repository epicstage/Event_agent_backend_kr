/**
 * FIN-024: 전시 판매 진행 추적
 *
 * CMP-IS Reference: 7.3.c
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Exhibit Sales Tracking.
CMP-IS Standard: 7.3.c - Monitoring exhibit sales progress and pipeline.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  sales_target: z.object({
    total_revenue: z.number(),
    total_booths: z.number().int(),
  }),
  current_sales: z.array(z.object({
    exhibitor_name: z.string(),
    package_name: z.string(),
    status: z.enum(["confirmed", "pending", "negotiating", "lost"]),
    revenue: z.number(),
    signed_date: z.string().optional(),
  })),
  pipeline: z.array(z.object({
    prospect_name: z.string(),
    stage: z.string(),
    probability: z.number().min(0).max(100),
    expected_revenue: z.number(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tracking_id: z.string().uuid(),
  event_id: z.string().uuid(),
  summary: z.object({
    confirmed_revenue: z.number(),
    confirmed_booths: z.number().int(),
    pending_revenue: z.number(),
    pipeline_weighted_revenue: z.number(),
    target_achievement_rate: z.number(),
  }),
  status_breakdown: z.array(z.object({
    status: z.string(),
    count: z.number().int(),
    revenue: z.number(),
  })),
  forecast: z.object({
    optimistic: z.number(),
    realistic: z.number(),
    conservative: z.number(),
  }),
  action_items: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    deadline: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const confirmed = validated.current_sales.filter(s => s.status === "confirmed");
  const pending = validated.current_sales.filter(s => s.status === "pending");
  const negotiating = validated.current_sales.filter(s => s.status === "negotiating");

  const confirmedRevenue = confirmed.reduce((sum, s) => sum + s.revenue, 0);
  const pendingRevenue = pending.reduce((sum, s) => sum + s.revenue, 0);
  const negotiatingRevenue = negotiating.reduce((sum, s) => sum + s.revenue, 0);

  const pipelineWeighted = validated.pipeline?.reduce((sum, p) =>
    sum + (p.expected_revenue * p.probability / 100), 0) || 0;

  const output: Output = {
    tracking_id: generateUUID(),
    event_id: validated.event_id,
    summary: {
      confirmed_revenue: confirmedRevenue,
      confirmed_booths: confirmed.length,
      pending_revenue: pendingRevenue,
      pipeline_weighted_revenue: Math.round(pipelineWeighted),
      target_achievement_rate: Math.round((confirmedRevenue / validated.sales_target.total_revenue) * 100),
    },
    status_breakdown: [
      { status: "확정", count: confirmed.length, revenue: confirmedRevenue },
      { status: "대기", count: pending.length, revenue: pendingRevenue },
      { status: "협상중", count: negotiating.length, revenue: negotiatingRevenue },
    ],
    forecast: {
      optimistic: confirmedRevenue + pendingRevenue + negotiatingRevenue,
      realistic: confirmedRevenue + pendingRevenue * 0.8 + negotiatingRevenue * 0.5,
      conservative: confirmedRevenue + pendingRevenue * 0.6,
    },
    action_items: [
      {
        priority: "high",
        action: "협상중인 전시사 계약 마감 추진",
        deadline: "2주 내",
      },
      {
        priority: "medium",
        action: "신규 잠재 고객 아웃리치 확대",
        deadline: "4주 내",
      },
      {
        priority: "low",
        action: "기존 확정사 업그레이드 제안",
        deadline: "6주 내",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-024",
  taskName: "전시 판매 진행 추적",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 7.3.c",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.3: Develop and Manage Exhibit/Sponsorship Sales Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
