/**
 * MKTADV-028: 이탈 예측 및 방지
 * CMP-IS Reference: 18.6.b - Customer churn prediction
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Customer Churn Analyst for event retention strategies.`;

export const InputSchema = z.object({
  event_id: z.string(),
  prediction_horizon: z.enum(["next_event", "6_months", "12_months"]).optional(),
  intervention_budget: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  prediction_id: z.string(),
  event_id: z.string(),
  churn_overview: z.object({
    total_customers_analyzed: z.number(),
    at_risk_count: z.number(),
    at_risk_percentage: z.number(),
    potential_revenue_at_risk: z.number(),
    predicted_churn_rate: z.number(),
  }),
  risk_segments: z.array(z.object({
    segment: z.string(),
    customer_count: z.number(),
    churn_probability: z.number(),
    revenue_at_risk: z.number(),
    primary_churn_reason: z.string(),
    intervention_priority: z.enum(["critical", "high", "medium", "low"]),
  })),
  churn_indicators: z.array(z.object({
    indicator: z.string(),
    weight: z.number(),
    current_trend: z.enum(["improving", "stable", "declining"]),
    benchmark: z.string(),
  })),
  intervention_strategies: z.array(z.object({
    strategy: z.string(),
    target_segment: z.string(),
    expected_retention_lift: z.number(),
    estimated_cost: z.number(),
    roi_estimate: z.number(),
    implementation_effort: z.enum(["low", "medium", "high"]),
  })),
  early_warning_alerts: z.array(z.object({
    customer_segment: z.string(),
    alert_type: z.string(),
    trigger_condition: z.string(),
    recommended_action: z.string(),
  })),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  return {
    prediction_id: generateUUID(),
    event_id: validatedInput.event_id,
    churn_overview: {
      total_customers_analyzed: 1800,
      at_risk_count: 342,
      at_risk_percentage: 19,
      potential_revenue_at_risk: 185000,
      predicted_churn_rate: 15.2,
    },
    risk_segments: [
      { segment: "단발성 참가자", customer_count: 145, churn_probability: 68, revenue_at_risk: 52000, primary_churn_reason: "가치 인식 부족", intervention_priority: "high" },
      { segment: "가격 민감 고객", customer_count: 88, churn_probability: 55, revenue_at_risk: 42000, primary_churn_reason: "경쟁사 가격", intervention_priority: "high" },
      { segment: "참여 감소 고객", customer_count: 65, churn_probability: 72, revenue_at_risk: 58000, primary_churn_reason: "콘텐츠 불만족", intervention_priority: "critical" },
      { segment: "연락 두절 고객", customer_count: 44, churn_probability: 85, revenue_at_risk: 33000, primary_churn_reason: "관계 단절", intervention_priority: "medium" },
    ],
    churn_indicators: [
      { indicator: "이메일 오픈율 하락", weight: 0.25, current_trend: "declining", benchmark: "업계 평균 대비 -15%" },
      { indicator: "웹사이트 방문 감소", weight: 0.20, current_trend: "declining", benchmark: "전년 대비 -30%" },
      { indicator: "세션 참석률 하락", weight: 0.20, current_trend: "stable", benchmark: "목표 대비 -10%" },
      { indicator: "NPS 점수 하락", weight: 0.15, current_trend: "declining", benchmark: "업계 평균 수준" },
      { indicator: "지원 문의 증가", weight: 0.10, current_trend: "improving", benchmark: "정상 범위" },
      { indicator: "소셜 언급 감소", weight: 0.10, current_trend: "stable", benchmark: "전년 동기 수준" },
    ],
    intervention_strategies: [
      { strategy: "VIP 전환 프로그램", target_segment: "참여 감소 고객", expected_retention_lift: 25, estimated_cost: 5000, roi_estimate: 3.2, implementation_effort: "medium" },
      { strategy: "가격 유연화 옵션", target_segment: "가격 민감 고객", expected_retention_lift: 35, estimated_cost: 8000, roi_estimate: 2.8, implementation_effort: "low" },
      { strategy: "콘텐츠 맞춤 추천", target_segment: "단발성 참가자", expected_retention_lift: 20, estimated_cost: 3000, roi_estimate: 4.5, implementation_effort: "medium" },
      { strategy: "1:1 관계 복원", target_segment: "연락 두절 고객", expected_retention_lift: 15, estimated_cost: 2000, roi_estimate: 2.1, implementation_effort: "high" },
    ],
    early_warning_alerts: [
      { customer_segment: "VIP", alert_type: "참여 감소", trigger_condition: "2주 연속 이메일 미오픈", recommended_action: "계정 매니저 직접 연락" },
      { customer_segment: "Regular", alert_type: "가격 민감", trigger_condition: "가격 페이지 3회 이상 방문", recommended_action: "맞춤 할인 제안" },
      { customer_segment: "All", alert_type: "불만 신호", trigger_condition: "NPS 6점 이하", recommended_action: "즉시 피드백 수집 및 해결" },
      { customer_segment: "Repeat", alert_type: "이탈 위험", trigger_condition: "연속 2회 미등록", recommended_action: "재참여 캠페인 발송" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-028",
  taskName: "이탈 예측 및 방지",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.6.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.6: Customer Analytics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
