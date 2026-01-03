/**
 * MKT-028: 예산 재배분
 * CMP-IS Reference: 8.2.d - Budget reallocation based on performance
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Budget Reallocation Agent.
CMP-IS Standard: 8.2.d - Reallocating marketing budget for optimal ROI.`;

export const InputSchema = z.object({
  event_id: z.string(),
  total_budget: z.number(),
  currency: z.string().default("KRW"),
  channel_performance: z.array(z.object({
    channel: z.string(),
    current_budget: z.number(),
    spend: z.number(),
    conversions: z.number(),
    revenue: z.number(),
  })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  reallocation_id: z.string(),
  event_id: z.string(),
  reallocation_summary: z.object({
    total_budget: z.number(),
    reallocated_amount: z.number(),
    expected_additional_conversions: z.number(),
    expected_roi_improvement: z.number(),
  }),
  channel_allocations: z.array(z.object({
    channel: z.string(),
    previous_budget: z.number(),
    new_budget: z.number(),
    change: z.number(),
    change_percentage: z.number(),
    reason: z.string(),
    expected_impact: z.string(),
  })),
  reallocation_rules: z.array(z.object({
    rule: z.string(),
    threshold: z.string(),
    action: z.string(),
  })),
  risk_assessment: z.object({
    risk_level: z.string(),
    potential_issues: z.array(z.string()),
    mitigation_strategies: z.array(z.string()),
  }),
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

  const channelAllocations = validatedInput.channel_performance.map(ch => {
    const roas = ch.conversions > 0 ? ch.revenue / ch.spend : 0;
    let newBudget = ch.current_budget;
    let reason = "";

    if (roas > 3) {
      newBudget = ch.current_budget * 1.3;
      reason = `ROAS ${roas.toFixed(1)}로 고성과`;
    } else if (roas < 1.5) {
      newBudget = ch.current_budget * 0.7;
      reason = `ROAS ${roas.toFixed(1)}로 저조`;
    } else {
      reason = "현 수준 유지";
    }

    return {
      channel: ch.channel,
      previous_budget: ch.current_budget,
      new_budget: Math.round(newBudget),
      change: Math.round(newBudget - ch.current_budget),
      change_percentage: Math.round(((newBudget - ch.current_budget) / ch.current_budget) * 100),
      reason,
      expected_impact: roas > 3 ? "전환 +30%" : roas < 1.5 ? "비용 절감" : "안정적 유지",
    };
  });

  const totalReallocated = channelAllocations.reduce((sum, ch) => sum + Math.abs(ch.change), 0);

  return {
    reallocation_id: generateUUID(),
    event_id: validatedInput.event_id,
    reallocation_summary: {
      total_budget: validatedInput.total_budget,
      reallocated_amount: totalReallocated / 2,
      expected_additional_conversions: Math.round(totalReallocated / 10000),
      expected_roi_improvement: 25,
    },
    channel_allocations: channelAllocations,
    reallocation_rules: [
      { rule: "고성과 채널 확대", threshold: "ROAS > 3.0", action: "예산 +30%" },
      { rule: "저성과 채널 축소", threshold: "ROAS < 1.5", action: "예산 -30%" },
      { rule: "테스트 예산 유지", threshold: "신규 채널", action: "전체의 10% 할당" },
      { rule: "리타겟팅 유지", threshold: "전환율 > 5%", action: "현 수준 유지" },
    ],
    risk_assessment: {
      risk_level: "medium",
      potential_issues: [
        "급격한 예산 변경으로 알고리즘 학습 리셋",
        "저성과 채널의 잠재력 미활용",
        "시장 상황 변화 미반영",
      ],
      mitigation_strategies: [
        "점진적 예산 조정 (주 15% 이내)",
        "최소 테스트 예산 유지",
        "주간 성과 모니터링 강화",
      ],
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-028";
export const taskName = "예산 재배분";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.2.d";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.2: Performance Optimization";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
