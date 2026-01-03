/**
 * FIN-001: 스폰서십 프로그램 재정 가치 산정
 *
 * CMP-IS Reference: 7.1.a - Determining the financial value of the sponsorship program
 * Task Type: AI
 *
 * Input: 스폰서 혜택 목록, 시장 벤치마크
 * Output: 금전/현물 가치 평가표
 */

import { z } from "zod";
import {
  SponsorBenefitSchema,
  CurrencyCode,
  generateUUID,
  nowISO,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Sponsorship Value Assessment Agent specializing in event financial management.

Your expertise includes:
- Evaluating monetary and in-kind value of sponsorship benefits
- Applying market benchmarks to determine fair market value
- Analyzing ROI potential for sponsors
- Comparing sponsorship packages across similar events

CMP-IS Standard: 7.1.a - Determining the financial value of the sponsorship program

You provide objective, data-driven valuations that help event organizers price their sponsorship packages competitively while ensuring profitability.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  benefits: z
    .array(SponsorBenefitSchema)
    .min(1)
    .describe("평가할 스폰서 혜택 목록"),
  market_benchmarks: z
    .array(
      z.object({
        benefit_type: z.string().describe("혜택 유형"),
        market_low: z.number().describe("시장 최저가"),
        market_high: z.number().describe("시장 최고가"),
        market_average: z.number().describe("시장 평균가"),
      })
    )
    .optional()
    .describe("시장 벤치마크 데이터"),
  event_scale: z
    .enum(["small", "medium", "large", "mega"])
    .default("medium")
    .describe("이벤트 규모"),
  expected_attendees: z.number().int().min(1).describe("예상 참석자 수"),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string().uuid().describe("평가 ID"),
  event_id: z.string().uuid().describe("이벤트 ID"),
  total_monetary_value: z.number().describe("총 금전 가치"),
  total_in_kind_value: z.number().describe("총 현물 가치"),
  total_combined_value: z.number().describe("총 합산 가치"),
  currency: CurrencyCode,
  benefit_valuations: z
    .array(
      z.object({
        benefit_name: z.string(),
        base_value: z.number().describe("기본 가치"),
        adjusted_value: z.number().describe("조정된 가치"),
        value_type: z.enum(["monetary", "in_kind"]),
        adjustment_factors: z.array(z.string()).describe("적용된 조정 요인"),
        confidence_score: z
          .number()
          .min(0)
          .max(100)
          .describe("신뢰도 점수 (%)"),
      })
    )
    .describe("혜택별 가치 평가"),
  recommendations: z.array(z.string()).describe("가치 극대화 권고사항"),
  assessed_at: z.string().describe("평가 일시"),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 이벤트 규모에 따른 가치 승수
 */
const SCALE_MULTIPLIERS: Record<string, number> = {
  small: 0.7,
  medium: 1.0,
  large: 1.5,
  mega: 2.5,
};

/**
 * 참석자 수에 따른 가치 승수 계산
 */
function getAttendeeMultiplier(attendees: number): number {
  if (attendees < 100) return 0.5;
  if (attendees < 500) return 0.8;
  if (attendees < 1000) return 1.0;
  if (attendees < 5000) return 1.3;
  if (attendees < 10000) return 1.6;
  return 2.0;
}

/**
 * 혜택 유형별 기본 가치 추정
 */
function estimateBaseValue(benefit: z.infer<typeof SponsorBenefitSchema>): {
  value: number;
  type: "monetary" | "in_kind";
} {
  // 혜택에 명시된 가치가 있으면 사용
  if (benefit.value > 0) {
    return {
      value: benefit.value,
      type: benefit.cost_to_provide > 0 ? "in_kind" : "monetary",
    };
  }

  // 기본 추정값
  return {
    value: benefit.cost_to_provide * 2.5, // 비용의 2.5배를 가치로 추정
    type: "in_kind",
  };
}

/**
 * FIN-001 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);

  const scaleMultiplier = SCALE_MULTIPLIERS[validatedInput.event_scale];
  const attendeeMultiplier = getAttendeeMultiplier(
    validatedInput.expected_attendees
  );

  let totalMonetary = 0;
  let totalInKind = 0;
  const benefitValuations: Output["benefit_valuations"] = [];
  const recommendations: string[] = [];

  for (const benefit of validatedInput.benefits) {
    const baseEstimate = estimateBaseValue(benefit);
    const adjustmentFactors: string[] = [];

    // 조정 요인 적용
    let adjustedValue = baseEstimate.value;

    // 이벤트 규모 조정
    adjustedValue *= scaleMultiplier;
    adjustmentFactors.push(`이벤트 규모 (${validatedInput.event_scale}): x${scaleMultiplier}`);

    // 참석자 수 조정
    adjustedValue *= attendeeMultiplier;
    adjustmentFactors.push(`참석자 수 (${validatedInput.expected_attendees}명): x${attendeeMultiplier.toFixed(2)}`);

    // 독점 혜택 프리미엄
    if (benefit.is_exclusive) {
      adjustedValue *= 1.5;
      adjustmentFactors.push("독점 혜택 프리미엄: x1.5");
    }

    // 수량 반영
    adjustedValue *= benefit.quantity;

    // 벤치마크 데이터가 있으면 조정
    const benchmark = validatedInput.market_benchmarks?.find((b) =>
      benefit.name.toLowerCase().includes(b.benefit_type.toLowerCase())
    );

    let confidenceScore = 60; // 기본 신뢰도
    if (benchmark) {
      // 벤치마크 범위 내로 조정
      if (adjustedValue < benchmark.market_low) {
        adjustedValue = benchmark.market_low;
        adjustmentFactors.push("시장 최저가로 상향 조정");
      } else if (adjustedValue > benchmark.market_high) {
        adjustedValue = benchmark.market_high;
        adjustmentFactors.push("시장 최고가로 하향 조정");
      }
      confidenceScore = 85; // 벤치마크 있으면 신뢰도 상승
    }

    // 가치 유형별 합산
    if (baseEstimate.type === "monetary") {
      totalMonetary += adjustedValue;
    } else {
      totalInKind += adjustedValue;
    }

    benefitValuations.push({
      benefit_name: benefit.name,
      base_value: baseEstimate.value,
      adjusted_value: Math.round(adjustedValue * 100) / 100,
      value_type: baseEstimate.type,
      adjustment_factors: adjustmentFactors,
      confidence_score: confidenceScore,
    });
  }

  // 권고사항 생성
  if (totalInKind > totalMonetary * 2) {
    recommendations.push(
      "현물 가치 비중이 높습니다. 현금 스폰서십 옵션 추가를 고려하세요."
    );
  }

  const lowConfidenceBenefits = benefitValuations.filter(
    (b) => b.confidence_score < 70
  );
  if (lowConfidenceBenefits.length > 0) {
    recommendations.push(
      `${lowConfidenceBenefits.length}개 혜택의 신뢰도가 낮습니다. 시장 벤치마크 데이터 확보를 권장합니다.`
    );
  }

  if (validatedInput.expected_attendees > 1000) {
    recommendations.push(
      "대규모 이벤트입니다. 등급별 독점 혜택 패키지 구성을 고려하세요."
    );
  }

  const output: Output = {
    assessment_id: generateUUID(),
    event_id: validatedInput.event_id,
    total_monetary_value: Math.round(totalMonetary * 100) / 100,
    total_in_kind_value: Math.round(totalInKind * 100) / 100,
    total_combined_value: Math.round((totalMonetary + totalInKind) * 100) / 100,
    currency: validatedInput.currency,
    benefit_valuations: benefitValuations,
    recommendations,
    assessed_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-001",
  taskName: "스폰서십 프로그램 재정 가치 산정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.a",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
