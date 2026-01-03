/**
 * MKTADV-039: 교차 판매 및 업셀링
 * CMP-IS Reference: 18.12.a - Cross-sell and upsell management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Cross-Sell and Upsell Strategist for event revenue optimization.`;

export const InputSchema = z.object({
  event_id: z.string(),
  customer_segment: z.string().optional(),
  strategy_focus: z.enum(["ticket_upgrade", "add_ons", "related_events", "all"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  strategy_id: z.string(),
  event_id: z.string(),
  opportunity_overview: z.object({
    total_customers: z.number(),
    eligible_for_upsell: z.number(),
    eligible_for_crosssell: z.number(),
    potential_additional_revenue: z.number(),
    current_conversion_rate: z.number(),
  }),
  upsell_opportunities: z.array(z.object({
    offer: z.string(),
    from_product: z.string(),
    to_product: z.string(),
    price_difference: z.number(),
    eligible_customers: z.number(),
    expected_conversion: z.number(),
    potential_revenue: z.number(),
    best_timing: z.string(),
  })),
  crosssell_opportunities: z.array(z.object({
    offer: z.string(),
    product: z.string(),
    price: z.number(),
    eligible_customers: z.number(),
    expected_conversion: z.number(),
    potential_revenue: z.number(),
    affinity_score: z.number(),
  })),
  personalized_recommendations: z.array(z.object({
    segment: z.string(),
    customer_count: z.number(),
    recommended_offer: z.string(),
    reasoning: z.string(),
    expected_response_rate: z.number(),
  })),
  campaign_templates: z.array(z.object({
    campaign_name: z.string(),
    offer_type: z.string(),
    channel: z.string(),
    trigger: z.string(),
    message_preview: z.string(),
  })),
  performance_tracking: z.object({
    ytd_upsell_revenue: z.number(),
    ytd_crosssell_revenue: z.number(),
    avg_order_value_increase: z.number(),
    top_performing_offer: z.string(),
  }),
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
    strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    opportunity_overview: {
      total_customers: 1850,
      eligible_for_upsell: 680,
      eligible_for_crosssell: 1420,
      potential_additional_revenue: 125000,
      current_conversion_rate: 12,
    },
    upsell_opportunities: [
      { offer: "VIP 업그레이드", from_product: "General Admission", to_product: "VIP Pass", price_difference: 200, eligible_customers: 450, expected_conversion: 15, potential_revenue: 13500, best_timing: "등록 후 24시간" },
      { offer: "All-Access 업그레이드", from_product: "Single Day", to_product: "All-Access", price_difference: 150, eligible_customers: 180, expected_conversion: 22, potential_revenue: 5940, best_timing: "D-7" },
      { offer: "Premium 네트워킹", from_product: "VIP Pass", to_product: "VIP + Premium Networking", price_difference: 100, eligible_customers: 50, expected_conversion: 35, potential_revenue: 1750, best_timing: "등록 즉시" },
    ],
    crosssell_opportunities: [
      { offer: "워크숍 추가", product: "Pre-event Workshop", price: 150, eligible_customers: 680, expected_conversion: 12, potential_revenue: 12240, affinity_score: 85 },
      { offer: "온디맨드 콘텐츠", product: "Recording Bundle", price: 99, eligible_customers: 1200, expected_conversion: 18, potential_revenue: 21384, affinity_score: 78 },
      { offer: "네트워킹 디너", product: "VIP Dinner Ticket", price: 120, eligible_customers: 320, expected_conversion: 25, potential_revenue: 9600, affinity_score: 82 },
      { offer: "연간 멤버십", product: "Community Membership", price: 299, eligible_customers: 850, expected_conversion: 8, potential_revenue: 20332, affinity_score: 72 },
    ],
    personalized_recommendations: [
      { segment: "이전 VIP 참가자", customer_count: 120, recommended_offer: "VIP + Premium Networking 패키지", reasoning: "과거 VIP 구매자의 65%가 프리미엄 옵션 선택", expected_response_rate: 35 },
      { segment: "콘텐츠 소비 높은 고객", customer_count: 280, recommended_offer: "온디맨드 번들", reasoning: "높은 콘텐츠 참여도 = 녹화본 관심", expected_response_rate: 22 },
      { segment: "네트워킹 활발 참가자", customer_count: 185, recommended_offer: "VIP 디너", reasoning: "네트워킹 세션 참석률 높음", expected_response_rate: 28 },
      { segment: "복수 이벤트 참가자", customer_count: 95, recommended_offer: "연간 멤버십", reasoning: "연간 2회 이상 참가 = 멤버십 가치 인식", expected_response_rate: 18 },
    ],
    campaign_templates: [
      { campaign_name: "즉시 업그레이드 제안", offer_type: "upsell", channel: "email", trigger: "등록 완료 후 1시간", message_preview: "🎉 등록 완료! 지금 VIP로 업그레이드하면 20% 추가 할인..." },
      { campaign_name: "워크숍 추천", offer_type: "crosssell", channel: "email", trigger: "등록 후 24시간", message_preview: "관심 세션과 연계된 심화 워크숍을 발견했어요..." },
      { campaign_name: "D-7 최종 기회", offer_type: "upsell", channel: "email + sms", trigger: "D-7", message_preview: "⏰ 마지막 기회! VIP 업그레이드 잔여 좌석 10석..." },
      { campaign_name: "사후 멤버십 제안", offer_type: "crosssell", channel: "email", trigger: "이벤트 종료 후 3일", message_preview: "이벤트가 끝나도 커뮤니티는 계속됩니다..." },
    ],
    performance_tracking: {
      ytd_upsell_revenue: 85000,
      ytd_crosssell_revenue: 62000,
      avg_order_value_increase: 28,
      top_performing_offer: "VIP 업그레이드 (15% 전환율)",
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-039",
  taskName: "교차 판매 및 업셀링",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.12.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.12: Revenue Optimization",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
