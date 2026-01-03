/**
 * MKT-027: 캠페인 최적화
 * CMP-IS Reference: 8.2.c - Campaign performance optimization
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Campaign Optimization Agent.
CMP-IS Standard: 8.2.c - Optimizing campaign performance through data-driven adjustments.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string(),
  optimization_focus: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  optimization_id: z.string(),
  event_id: z.string(),
  campaign_id: z.string(),
  current_performance: z.object({
    spend: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    ctr: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    roas: z.number(),
  }),
  optimizations_applied: z.array(z.object({
    optimization: z.string(),
    before: z.string(),
    after: z.string(),
    expected_impact: z.string(),
  })),
  budget_reallocation: z.array(z.object({
    channel: z.string(),
    previous_budget: z.number(),
    new_budget: z.number(),
    reason: z.string(),
  })),
  underperforming_elements: z.array(z.object({
    element: z.string(),
    issue: z.string(),
    action: z.string(),
  })),
  projected_improvement: z.object({
    ctr_improvement: z.number(),
    cpa_reduction: z.number(),
    roas_improvement: z.number(),
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

  return {
    optimization_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaign_id: validatedInput.campaign_id,
    current_performance: {
      spend: 5000000,
      impressions: 500000,
      clicks: 12500,
      conversions: 375,
      ctr: 2.5,
      cpc: 400,
      cpa: 13333,
      roas: 2.8,
    },
    optimizations_applied: [
      { optimization: "저성과 광고 그룹 일시중지", before: "10개 광고그룹 활성", after: "7개 광고그룹 활성", expected_impact: "CPA -15%" },
      { optimization: "고성과 키워드 입찰가 상향", before: "평균 입찰가 500원", after: "상위 20% 키워드 +30%", expected_impact: "전환 +20%" },
      { optimization: "타겟 오디언스 세분화", before: "넓은 관심사 타겟", after: "구매 의향 높은 세그먼트", expected_impact: "CTR +25%" },
      { optimization: "광고 소재 교체", before: "단일 크리에이티브", after: "3종 로테이션", expected_impact: "피로도 감소" },
    ],
    budget_reallocation: [
      { channel: "Google Search", previous_budget: 2000000, new_budget: 2500000, reason: "ROAS 4.2로 최고 성과" },
      { channel: "Meta", previous_budget: 1500000, new_budget: 1200000, reason: "CPA 높음, 효율 개선 필요" },
      { channel: "LinkedIn", previous_budget: 1000000, new_budget: 800000, reason: "전환율 저조" },
      { channel: "리타겟팅", previous_budget: 500000, new_budget: 500000, reason: "안정적 성과 유지" },
    ],
    underperforming_elements: [
      { element: "디스플레이 광고", issue: "CTR 0.3%로 평균 이하", action: "크리에이티브 전면 교체" },
      { element: "모바일 랜딩페이지", issue: "이탈률 65%", action: "모바일 UX 개선" },
      { element: "야간 시간대", issue: "전환율 50% 하락", action: "데이파팅 조정" },
    ],
    projected_improvement: {
      ctr_improvement: 18,
      cpa_reduction: 22,
      roas_improvement: 35,
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-027";
export const taskName = "캠페인 최적화";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.2.c";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.2: Performance Optimization";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
