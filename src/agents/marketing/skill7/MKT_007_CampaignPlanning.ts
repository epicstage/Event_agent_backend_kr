/**
 * MKT-007: 캠페인 계획
 * CMP-IS Reference: 7.2.d - Planning marketing campaigns
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Campaign Planning Agent for event marketing.
CMP-IS Standard: 7.2.d - Planning integrated marketing campaigns with clear objectives and timelines.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  campaign_objectives: z.array(z.string()),
  budget: z.number(),
  target_registrations: z.number(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  campaign_id: z.string(),
  event_id: z.string(),
  campaigns: z.array(z.object({
    name: z.string(),
    objective: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    channels: z.array(z.string()),
    budget: z.number(),
    target_kpi: z.string(),
    key_messages: z.array(z.string()),
  })),
  total_budget: z.number(),
  expected_results: z.object({
    total_reach: z.number(),
    expected_registrations: z.number(),
    cpa_target: z.number(),
  }),
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

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);
  const { event_date, budget, target_registrations } = validatedInput;

  const campaigns = [
    { name: "얼리버드 캠페인", objective: "초기 등록 확보", daysBefore: 90, duration: 30, budgetPercent: 25 },
    { name: "콘텐츠 캠페인", objective: "관심 유발", daysBefore: 60, duration: 30, budgetPercent: 30 },
    { name: "전환 캠페인", objective: "등록 전환", daysBefore: 30, duration: 21, budgetPercent: 30 },
    { name: "마감 캠페인", objective: "막판 푸시", daysBefore: 7, duration: 7, budgetPercent: 15 },
  ].map(c => ({
    name: c.name,
    objective: c.objective,
    start_date: addDays(event_date, -c.daysBefore),
    end_date: addDays(event_date, -c.daysBefore + c.duration),
    channels: ["이메일", "소셜", "광고"],
    budget: budget * (c.budgetPercent / 100),
    target_kpi: `등록 ${Math.round(target_registrations * c.budgetPercent / 100)}명`,
    key_messages: [`${c.name} 메시지 1`, `${c.name} 메시지 2`],
  }));

  return {
    campaign_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaigns,
    total_budget: budget,
    expected_results: {
      total_reach: target_registrations * 20,
      expected_registrations: target_registrations,
      cpa_target: Math.round(budget / target_registrations),
    },
    recommendations: ["캠페인 간 일관된 메시지 유지", "A/B 테스트로 최적화", "실시간 성과 모니터링"],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-007";
export const taskName = "캠페인 계획";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.d";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
