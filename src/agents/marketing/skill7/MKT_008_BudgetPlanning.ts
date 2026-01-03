/**
 * MKT-008: 마케팅 예산 계획
 * CMP-IS Reference: 7.2.e - Planning marketing budget allocation
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Budget Planning Agent.
CMP-IS Standard: 7.2.e - Planning optimal marketing budget allocation for maximum ROI.`;

export const InputSchema = z.object({
  event_id: z.string(),
  total_budget: z.number(),
  currency: z.string().default("KRW"),
  target_registrations: z.number(),
  campaign_duration_weeks: z.number().default(12),
  priority_channels: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  budget_id: z.string(),
  event_id: z.string(),
  budget_summary: z.object({
    total: z.number(),
    by_channel: z.record(z.number()),
    by_phase: z.record(z.number()),
    contingency: z.number(),
  }),
  roi_projections: z.object({
    expected_registrations: z.number(),
    cost_per_registration: z.number(),
    revenue_potential: z.number(),
    expected_roi: z.number(),
  }),
  optimization_opportunities: z.array(z.string()),
  recommendations: z.array(z.string()),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);
  const { total_budget, target_registrations } = validatedInput;

  const byChannel: Record<string, number> = {
    "디지털 광고": total_budget * 0.35,
    "콘텐츠 제작": total_budget * 0.20,
    "이메일 마케팅": total_budget * 0.10,
    "소셜 미디어": total_budget * 0.15,
    "PR/미디어": total_budget * 0.10,
    "파트너십": total_budget * 0.05,
    "예비비": total_budget * 0.05,
  };

  const byPhase: Record<string, number> = {
    "인지도 구축": total_budget * 0.25,
    "리드 생성": total_budget * 0.35,
    "전환 유도": total_budget * 0.30,
    "막판 푸시": total_budget * 0.10,
  };

  const avgTicketPrice = 500000;
  const revenuePotential = target_registrations * avgTicketPrice;

  return {
    budget_id: generateUUID(),
    event_id: validatedInput.event_id,
    budget_summary: {
      total: total_budget,
      by_channel: byChannel,
      by_phase: byPhase,
      contingency: total_budget * 0.05,
    },
    roi_projections: {
      expected_registrations: target_registrations,
      cost_per_registration: Math.round(total_budget / target_registrations),
      revenue_potential: revenuePotential,
      expected_roi: Math.round(((revenuePotential - total_budget) / total_budget) * 100),
    },
    optimization_opportunities: [
      "얼리버드 기간 집중 투자로 CPA 절감",
      "고성과 채널로 예산 재배분",
      "리타겟팅으로 전환율 향상",
    ],
    recommendations: [
      "주간 성과 리뷰 후 예산 조정",
      "저성과 채널 예산은 고성과 채널로 이동",
      "예비비는 막판 푸시에 활용",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-008";
export const taskName = "마케팅 예산 계획";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.e";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
