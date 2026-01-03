/**
 * FIN-012: 스폰서 커밋먼트 협상
 *
 * CMP-IS Reference: 7.1.g - Negotiating with potential sponsors
 * Task Type: Human (AI 보조)
 *
 * Input: 스폰서 요구사항, 이벤트 제공 가능 혜택
 * Output: 협상 결과 (합의 조건)
 */

import { z } from "zod";
import {
  SponsorshipTier,
  CurrencyCode,
  generateUUID,
  nowISO,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an AI Assistant for Sponsor Commitment Negotiation support.

Your role is to:
- Analyze sponsor requests and available benefits
- Identify negotiation gaps and opportunities
- Suggest win-win compromise solutions
- Document negotiation outcomes and agreements

CMP-IS Standard: 7.1.g - Negotiating with potential sponsors

IMPORTANT: This is a HUMAN task. You provide analysis and suggestions, but actual negotiation must be conducted by human team members.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  negotiation_session: z.object({
    session_id: z.string().uuid().optional(),
    sponsor_name: z.string(),
    negotiation_round: z.number().int().min(1).default(1),
  }),
  sponsor_requirements: z.object({
    requested_tier: SponsorshipTier.optional(),
    requested_benefits: z.array(z.string()).describe("요청 혜택"),
    proposed_amount: z.number().describe("제안 금액"),
    support_type: z.enum(["cash", "in_kind", "mixed"]).describe("지원 유형"),
    special_requests: z.array(z.string()).optional().describe("특별 요청사항"),
    deal_breakers: z.array(z.string()).optional().describe("필수 조건 (협상 불가)"),
    flexibility_areas: z.array(z.string()).optional().describe("유연하게 조정 가능한 영역"),
  }),
  event_offerings: z.object({
    available_tiers: z.array(
      z.object({
        tier: SponsorshipTier,
        tier_name: z.string(),
        standard_price: z.number(),
        minimum_price: z.number().describe("최소 수용 가격"),
        included_benefits: z.array(z.string()),
        optional_benefits: z.array(z.string()),
      })
    ),
    custom_benefit_options: z.array(z.string()).optional(),
    exclusivity_available: z.boolean().default(false),
    payment_flexibility: z.boolean().default(true),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  negotiation_id: z.string().uuid().describe("협상 ID"),
  event_id: z.string().uuid(),
  session_id: z.string().uuid(),
  sponsor_name: z.string(),
  gap_analysis: z.object({
    price_gap: z.number().describe("가격 차이"),
    price_gap_percentage: z.number().describe("가격 차이 %"),
    benefit_gaps: z.array(
      z.object({
        requested: z.string(),
        available: z.string(),
        gap_type: z.enum(["fully_met", "partially_met", "not_available", "upgradeable"]),
        notes: z.string().optional(),
      })
    ),
    alignment_score: z.number().min(0).max(100).describe("요구-제공 정렬도"),
  }),
  negotiation_options: z
    .array(
      z.object({
        option_name: z.string(),
        option_type: z.enum(["tier_adjustment", "benefit_swap", "price_negotiation", "custom_package"]),
        description: z.string(),
        sponsor_gets: z.array(z.string()),
        event_gets: z.array(z.string()),
        price_adjustment: z.number(),
        final_price: z.number(),
        feasibility: z.enum(["high", "medium", "low"]),
        recommendation_score: z.number().min(1).max(5),
      })
    )
    .describe("협상 옵션"),
  recommended_approach: z.object({
    primary_option: z.string(),
    rationale: z.string(),
    talking_points: z.array(z.string()),
    concessions_to_offer: z.array(z.string()),
    items_to_hold_firm: z.array(z.string()),
  }),
  agreement_template: z.object({
    tier: z.string(),
    final_amount: z.number(),
    confirmed_benefits: z.array(z.string()),
    special_terms: z.array(z.string()),
    payment_terms: z.string(),
  }),
  risk_assessment: z.object({
    deal_risk: z.enum(["low", "medium", "high"]),
    risk_factors: z.array(z.string()),
    mitigation_suggestions: z.array(z.string()),
  }),
  analyzed_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 혜택 갭 분석
 */
function analyzeBenefitGaps(
  requested: string[],
  availableBenefits: string[],
  optionalBenefits: string[]
): z.infer<typeof OutputSchema>["gap_analysis"]["benefit_gaps"] {
  return requested.map((req) => {
    const reqLower = req.toLowerCase();

    // 포함된 혜택에서 검색
    const inIncluded = availableBenefits.some(
      (b) =>
        b.toLowerCase().includes(reqLower) || reqLower.includes(b.toLowerCase())
    );
    if (inIncluded) {
      return {
        requested: req,
        available: availableBenefits.find(
          (b) =>
            b.toLowerCase().includes(reqLower) ||
            reqLower.includes(b.toLowerCase())
        )!,
        gap_type: "fully_met" as const,
      };
    }

    // 옵션 혜택에서 검색
    const inOptional = optionalBenefits.some(
      (b) =>
        b.toLowerCase().includes(reqLower) || reqLower.includes(b.toLowerCase())
    );
    if (inOptional) {
      return {
        requested: req,
        available: optionalBenefits.find(
          (b) =>
            b.toLowerCase().includes(reqLower) ||
            reqLower.includes(b.toLowerCase())
        )!,
        gap_type: "upgradeable" as const,
        notes: "추가 비용으로 제공 가능",
      };
    }

    // 유사한 혜택 검색
    const allBenefits = [...availableBenefits, ...optionalBenefits];
    const similar = allBenefits.find((b) => {
      const words = reqLower.split(" ");
      return words.some((w) => b.toLowerCase().includes(w) && w.length > 3);
    });

    if (similar) {
      return {
        requested: req,
        available: similar,
        gap_type: "partially_met" as const,
        notes: "유사한 혜택으로 대체 가능",
      };
    }

    return {
      requested: req,
      available: "해당 없음",
      gap_type: "not_available" as const,
      notes: "맞춤형 솔루션 필요",
    };
  });
}

/**
 * 협상 옵션 생성
 */
function generateNegotiationOptions(
  proposedAmount: number,
  availableTiers: z.infer<typeof InputSchema>["event_offerings"]["available_tiers"],
  benefitGaps: z.infer<typeof OutputSchema>["gap_analysis"]["benefit_gaps"],
  specialRequests: string[] | undefined
): z.infer<typeof OutputSchema>["negotiation_options"] {
  const options: z.infer<typeof OutputSchema>["negotiation_options"] = [];

  // 가장 적합한 티어 찾기
  const matchingTier = availableTiers.find(
    (t) => proposedAmount >= t.minimum_price && proposedAmount <= t.standard_price * 1.1
  );

  const closestTier =
    matchingTier ||
    availableTiers.reduce((prev, curr) =>
      Math.abs(curr.standard_price - proposedAmount) <
      Math.abs(prev.standard_price - proposedAmount)
        ? curr
        : prev
    );

  // 옵션 1: 표준 패키지 (가격 조정)
  const priceAdjustment = proposedAmount - closestTier.standard_price;
  options.push({
    option_name: "표준 패키지 조정",
    option_type: "price_negotiation",
    description: `${closestTier.tier_name} 패키지를 제안 금액에 맞춰 조정`,
    sponsor_gets: closestTier.included_benefits,
    event_gets: [`${proposedAmount.toLocaleString()} 확보`],
    price_adjustment: priceAdjustment,
    final_price: proposedAmount,
    feasibility: proposedAmount >= closestTier.minimum_price ? "high" : "medium",
    recommendation_score:
      proposedAmount >= closestTier.minimum_price
        ? 4
        : proposedAmount >= closestTier.minimum_price * 0.9
        ? 3
        : 2,
  });

  // 옵션 2: 혜택 스왑
  const unmetBenefits = benefitGaps.filter(
    (g) => g.gap_type === "not_available" || g.gap_type === "upgradeable"
  );
  if (unmetBenefits.length > 0) {
    options.push({
      option_name: "혜택 맞춤 교환",
      option_type: "benefit_swap",
      description: "일부 표준 혜택을 스폰서 요청 혜택으로 교체",
      sponsor_gets: [
        ...closestTier.included_benefits.slice(0, -unmetBenefits.length),
        ...unmetBenefits.map((b) => `(맞춤) ${b.requested}`),
      ],
      event_gets: ["스폰서 만족도 향상", "차별화된 파트너십"],
      price_adjustment: 0,
      final_price: closestTier.standard_price,
      feasibility: "medium",
      recommendation_score: 3,
    });
  }

  // 옵션 3: 다운그레이드 + 애드온
  const lowerTier = availableTiers.find(
    (t) => t.standard_price < proposedAmount && t.tier !== closestTier.tier
  );
  if (lowerTier) {
    options.push({
      option_name: "하위 티어 + 선택 애드온",
      option_type: "custom_package",
      description: `${lowerTier.tier_name} 기본 + 원하는 혜택만 추가`,
      sponsor_gets: [
        ...lowerTier.included_benefits,
        "원하는 추가 혜택 2-3개 선택 가능",
      ],
      event_gets: [
        `${proposedAmount.toLocaleString()} 확보`,
        "유연한 패키지 운영",
      ],
      price_adjustment: proposedAmount - lowerTier.standard_price,
      final_price: proposedAmount,
      feasibility: "high",
      recommendation_score: 4,
    });
  }

  // 옵션 4: 프리미엄 업그레이드 제안
  const higherTier = availableTiers.find(
    (t) => t.standard_price > proposedAmount * 1.1
  );
  if (higherTier && proposedAmount >= higherTier.minimum_price * 0.8) {
    options.push({
      option_name: "업그레이드 유도",
      option_type: "tier_adjustment",
      description: `${higherTier.tier_name}으로 업그레이드 시 추가 가치 제공`,
      sponsor_gets: [
        ...higherTier.included_benefits,
        "추가 10% 보너스 노출",
      ],
      event_gets: [
        `${higherTier.standard_price.toLocaleString()} 확보`,
        "프리미엄 파트너십",
      ],
      price_adjustment: higherTier.standard_price - proposedAmount,
      final_price: higherTier.standard_price,
      feasibility: "low",
      recommendation_score: 2,
    });
  }

  return options.sort((a, b) => b.recommendation_score - a.recommendation_score);
}

/**
 * 리스크 평가
 */
function assessRisk(
  priceGapPercentage: number,
  dealBreakers: string[] | undefined,
  alignmentScore: number
): z.infer<typeof OutputSchema>["risk_assessment"] {
  const riskFactors: string[] = [];
  const mitigations: string[] = [];

  if (priceGapPercentage > 30) {
    riskFactors.push(`가격 차이 ${priceGapPercentage.toFixed(0)}%로 큼`);
    mitigations.push("분할 결제 또는 다년 계약 제안");
  }

  if (dealBreakers && dealBreakers.length > 0) {
    riskFactors.push(`협상 불가 조건 ${dealBreakers.length}개 존재`);
    mitigations.push("필수 조건 충족 여부 먼저 확인 후 협상 진행");
  }

  if (alignmentScore < 50) {
    riskFactors.push("요구-제공 정렬도 낮음");
    mitigations.push("맞춤형 패키지 설계로 갭 해소");
  }

  const dealRisk: "low" | "medium" | "high" =
    riskFactors.length === 0
      ? "low"
      : riskFactors.length <= 2
      ? "medium"
      : "high";

  if (riskFactors.length === 0) {
    riskFactors.push("특별한 리스크 요인 없음");
    mitigations.push("표준 협상 절차 진행");
  }

  return {
    deal_risk: dealRisk,
    risk_factors: riskFactors,
    mitigation_suggestions: mitigations,
  };
}

/**
 * FIN-012 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const {
    negotiation_session,
    sponsor_requirements,
    event_offerings,
    currency,
  } = validatedInput;

  const sessionId = negotiation_session.session_id || generateUUID();

  // 가격 갭 분석
  const closestTier =
    event_offerings.available_tiers.find(
      (t) => t.tier === sponsor_requirements.requested_tier
    ) || event_offerings.available_tiers[0];

  const priceGap = closestTier.standard_price - sponsor_requirements.proposed_amount;
  const priceGapPercentage =
    (priceGap / closestTier.standard_price) * 100;

  // 혜택 갭 분석
  const benefitGaps = analyzeBenefitGaps(
    sponsor_requirements.requested_benefits,
    closestTier.included_benefits,
    closestTier.optional_benefits
  );

  // 정렬도 점수 계산
  const metCount = benefitGaps.filter(
    (g) => g.gap_type === "fully_met" || g.gap_type === "partially_met"
  ).length;
  const alignmentScore = Math.round(
    (metCount / benefitGaps.length) * 70 +
      (sponsor_requirements.proposed_amount >= closestTier.minimum_price ? 30 : 0)
  );

  // 협상 옵션 생성
  const negotiationOptions = generateNegotiationOptions(
    sponsor_requirements.proposed_amount,
    event_offerings.available_tiers,
    benefitGaps,
    sponsor_requirements.special_requests
  );

  // 권장 접근법
  const primaryOption = negotiationOptions[0];
  const recommendedApproach = {
    primary_option: primaryOption.option_name,
    rationale:
      alignmentScore >= 70
        ? "요구사항과 제공 가능 혜택이 잘 맞아 빠른 합의 가능"
        : alignmentScore >= 50
        ? "일부 조정으로 합의 가능, 유연한 협상 필요"
        : "상당한 조정 필요, 맞춤형 솔루션 제안 권장",
    talking_points: [
      `제안하신 ${sponsor_requirements.proposed_amount.toLocaleString()} ${currency}에 맞는 최적의 옵션을 준비했습니다.`,
      `${closestTier.tier_name} 패키지의 핵심 혜택은 [주요 혜택]입니다.`,
      "귀사의 목표에 맞춰 혜택을 조정할 수 있습니다.",
    ],
    concessions_to_offer:
      sponsor_requirements.flexibility_areas ||
      ["결제 조건 유연화", "추가 노출 기회"],
    items_to_hold_firm: sponsor_requirements.deal_breakers || ["최소 스폰서십 금액"],
  };

  // 합의 템플릿
  const agreementTemplate = {
    tier: closestTier.tier_name,
    final_amount: primaryOption.final_price,
    confirmed_benefits: primaryOption.sponsor_gets,
    special_terms: sponsor_requirements.special_requests || [],
    payment_terms: event_offerings.payment_flexibility
      ? "50% 계약 시, 50% 이벤트 30일 전"
      : "100% 계약 시",
  };

  // 리스크 평가
  const riskAssessment = assessRisk(
    priceGapPercentage,
    sponsor_requirements.deal_breakers,
    alignmentScore
  );

  const output: Output = {
    negotiation_id: generateUUID(),
    event_id: validatedInput.event_id,
    session_id: sessionId,
    sponsor_name: negotiation_session.sponsor_name,
    gap_analysis: {
      price_gap: priceGap,
      price_gap_percentage: Math.round(priceGapPercentage * 10) / 10,
      benefit_gaps: benefitGaps,
      alignment_score: alignmentScore,
    },
    negotiation_options: negotiationOptions,
    recommended_approach: recommendedApproach,
    agreement_template: agreementTemplate,
    risk_assessment: riskAssessment,
    analyzed_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-012",
  taskName: "스폰서 커밋먼트 협상",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 7.1.g",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
