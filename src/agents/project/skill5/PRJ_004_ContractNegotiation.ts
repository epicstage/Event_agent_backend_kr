/**
 * PRJ-004: 계약 협상 지원
 *
 * CMP-IS Reference: 5.2.b - Negotiating vendor contracts
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Contract Negotiation Agent specializing in event vendor agreements.

Your expertise includes:
- Analyzing contract terms and identifying negotiation opportunities
- Recommending fair pricing based on market benchmarks
- Identifying risk clauses and suggesting protective terms
- Developing negotiation strategies for win-win outcomes

CMP-IS Standard: 5.2.b - Negotiating vendor contracts`;

export const InputSchema = z.object({
  event_id: z.string().describe("이벤트 ID"),
  vendor_name: z.string().describe("벤더명"),
  service_category: z.string().describe("서비스 카테고리"),
  initial_quote: z.object({
    amount: z.number(),
    currency: z.string().default("KRW"),
    breakdown: z.array(z.object({
      item: z.string(),
      amount: z.number(),
      quantity: z.number().optional(),
    })).optional(),
  }).describe("초기 견적"),
  budget_target: z.number().describe("목표 예산"),
  contract_terms: z.object({
    payment_terms: z.string().optional(),
    cancellation_policy: z.string().optional(),
    liability_clause: z.string().optional(),
    delivery_timeline: z.string().optional(),
  }).optional().describe("계약 조건"),
  negotiation_priority: z.enum(["price", "quality", "timeline", "terms"]).default("price"),
  market_rate_reference: z.number().optional().describe("시장 기준 가격"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  negotiation_id: z.string(),
  event_id: z.string(),
  vendor_name: z.string(),
  price_analysis: z.object({
    initial_quote: z.number(),
    budget_target: z.number(),
    gap_amount: z.number(),
    gap_percentage: z.number(),
    market_comparison: z.enum(["below_market", "at_market", "above_market"]),
    recommended_counter_offer: z.number(),
  }),
  negotiation_strategy: z.object({
    approach: z.enum(["aggressive", "collaborative", "value_based"]),
    key_leverage_points: z.array(z.string()),
    concession_items: z.array(z.string()),
    walk_away_point: z.number(),
  }),
  term_recommendations: z.array(z.object({
    term_type: z.string(),
    current_term: z.string().optional(),
    recommended_change: z.string(),
    importance: z.enum(["critical", "important", "nice_to_have"]),
    rationale: z.string(),
  })),
  risk_flags: z.array(z.object({
    risk_type: z.string(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    mitigation: z.string(),
  })),
  talking_points: z.array(z.string()),
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

  const initialQuote = validatedInput.initial_quote.amount;
  const budgetTarget = validatedInput.budget_target;
  const marketRate = validatedInput.market_rate_reference || initialQuote * 0.9;

  const gapAmount = initialQuote - budgetTarget;
  const gapPercentage = Math.round((gapAmount / initialQuote) * 100);

  let marketComparison: "below_market" | "at_market" | "above_market" = "at_market";
  if (initialQuote < marketRate * 0.9) marketComparison = "below_market";
  else if (initialQuote > marketRate * 1.1) marketComparison = "above_market";

  // 카운터 오퍼 계산
  let recommendedCounterOffer: number;
  if (marketComparison === "above_market") {
    recommendedCounterOffer = Math.round(marketRate * 0.95);
  } else if (gapAmount > 0) {
    recommendedCounterOffer = Math.round(budgetTarget + gapAmount * 0.3);
  } else {
    recommendedCounterOffer = initialQuote;
  }

  // 협상 전략
  let approach: "aggressive" | "collaborative" | "value_based" = "collaborative";
  if (marketComparison === "above_market" && gapPercentage > 20) {
    approach = "aggressive";
  } else if (validatedInput.negotiation_priority === "quality") {
    approach = "value_based";
  }

  const leveragePoints: string[] = [];
  const concessionItems: string[] = [];

  if (marketComparison === "above_market") {
    leveragePoints.push("시장 평균 대비 높은 견적");
  }
  leveragePoints.push("장기 파트너십 가능성");
  leveragePoints.push("추천 및 레퍼런스 제공 가능");

  concessionItems.push("일부 서비스 범위 축소 가능");
  concessionItems.push("결제 조건 유연화 (선급금 비율 조정)");
  concessionItems.push("마케팅 노출 기회 제공");

  const walkAwayPoint = Math.round(budgetTarget * 1.15);

  // 조건 권고
  const termRecommendations: Output["term_recommendations"] = [];

  termRecommendations.push({
    term_type: "payment_terms",
    current_term: validatedInput.contract_terms?.payment_terms,
    recommended_change: "30% 선급금, 40% 서비스 완료 시, 30% 정산 후 15일 이내",
    importance: "important",
    rationale: "현금 흐름 관리 및 서비스 품질 보장",
  });

  termRecommendations.push({
    term_type: "cancellation_policy",
    current_term: validatedInput.contract_terms?.cancellation_policy,
    recommended_change: "30일 전 취소 시 전액 환불, 14일 전 50% 환불, 7일 이내 환불 불가",
    importance: "critical",
    rationale: "불가피한 상황 대비 유연성 확보",
  });

  termRecommendations.push({
    term_type: "liability",
    current_term: validatedInput.contract_terms?.liability_clause,
    recommended_change: "벤더 과실로 인한 손해 시 계약금의 150% 한도 내 배상",
    importance: "critical",
    rationale: "이벤트 실패 시 손해 최소화",
  });

  // 리스크 플래그
  const riskFlags: Output["risk_flags"] = [];

  if (!validatedInput.contract_terms?.cancellation_policy) {
    riskFlags.push({
      risk_type: "cancellation_risk",
      description: "취소 정책 미명시",
      severity: "high",
      mitigation: "명확한 취소 및 환불 조건 계약서에 포함 필수",
    });
  }

  if (!validatedInput.contract_terms?.liability_clause) {
    riskFlags.push({
      risk_type: "liability_risk",
      description: "책임 조항 미명시",
      severity: "high",
      mitigation: "손해 배상 및 보험 조항 추가 필수",
    });
  }

  if (gapPercentage > 30) {
    riskFlags.push({
      risk_type: "budget_risk",
      description: "예산과 견적의 큰 차이",
      severity: "medium",
      mitigation: "범위 조정 또는 대안 벤더 탐색",
    });
  }

  // 협상 포인트
  const talkingPoints = [
    `우리 예산은 ${budgetTarget.toLocaleString()}원입니다.`,
    `시장 조사 결과 유사 서비스의 평균 가격은 ${marketRate.toLocaleString()}원입니다.`,
    `장기적 파트너십을 고려하고 있으며, 향후 추가 이벤트에서 우선 협력할 의향이 있습니다.`,
    `결제 조건이나 서비스 범위 조정에 대해 논의할 수 있습니다.`,
    recommendedCounterOffer < initialQuote
      ? `${recommendedCounterOffer.toLocaleString()}원으로 조정 가능하신지 검토 부탁드립니다.`
      : `현재 견적은 합리적으로 보입니다.`,
  ];

  return {
    negotiation_id: generateUUID(),
    event_id: validatedInput.event_id,
    vendor_name: validatedInput.vendor_name,
    price_analysis: {
      initial_quote: initialQuote,
      budget_target: budgetTarget,
      gap_amount: gapAmount,
      gap_percentage: gapPercentage,
      market_comparison: marketComparison,
      recommended_counter_offer: recommendedCounterOffer,
    },
    negotiation_strategy: {
      approach,
      key_leverage_points: leveragePoints,
      concession_items: concessionItems,
      walk_away_point: walkAwayPoint,
    },
    term_recommendations: termRecommendations,
    risk_flags: riskFlags,
    talking_points: talkingPoints,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-004",
  taskName: "계약 협상 지원",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.2.b",
  skill: "Skill 5: Plan Project",
  subSkill: "5.2: Manage Vendors",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
