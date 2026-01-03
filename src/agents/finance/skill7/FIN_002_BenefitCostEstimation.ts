/**
 * FIN-002: 스폰서 혜택 제공 비용 추정
 *
 * CMP-IS Reference: 7.1.a - Determining the financial value of the sponsorship program
 * Task Type: AI
 *
 * Input: 혜택 항목별 원가, 수량
 * Output: 혜택별 예상 비용
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

export const AGENT_PERSONA = `You are an expert Benefit Cost Estimation Agent specializing in sponsorship program financial analysis.

Your expertise includes:
- Calculating accurate cost-to-serve for each sponsorship benefit
- Identifying hidden costs and overhead factors
- Optimizing benefit delivery for cost efficiency
- Benchmarking costs against industry standards

CMP-IS Standard: 7.1.a - Determining the financial value of the sponsorship program

You provide precise cost estimates that help event organizers understand their true margins on sponsorship packages.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  benefits: z
    .array(
      z.object({
        name: z.string().describe("혜택명"),
        description: z.string().optional().describe("혜택 설명"),
        quantity: z.number().int().min(1).default(1).describe("제공 수량"),
        unit_cost: z.number().min(0).optional().describe("단위 원가 (알려진 경우)"),
        cost_category: z
          .enum([
            "production",
            "digital",
            "print",
            "staff",
            "venue",
            "technology",
            "other",
          ])
          .describe("비용 카테고리"),
        requires_external_vendor: z
          .boolean()
          .default(false)
          .describe("외부 업체 필요 여부"),
      })
    )
    .min(1)
    .describe("비용 추정할 혜택 목록"),
  overhead_rate: z
    .number()
    .min(0)
    .max(100)
    .default(15)
    .describe("간접비율 (%)"),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  estimation_id: z.string().uuid().describe("추정 ID"),
  event_id: z.string().uuid().describe("이벤트 ID"),
  total_direct_cost: z.number().describe("총 직접 비용"),
  total_overhead: z.number().describe("총 간접 비용"),
  total_estimated_cost: z.number().describe("총 예상 비용"),
  currency: CurrencyCode,
  benefit_costs: z
    .array(
      z.object({
        benefit_name: z.string(),
        quantity: z.number().int(),
        unit_cost: z.number().describe("단위 비용"),
        direct_cost: z.number().describe("직접 비용"),
        overhead_cost: z.number().describe("간접 비용"),
        total_cost: z.number().describe("총 비용"),
        cost_breakdown: z
          .array(
            z.object({
              item: z.string(),
              amount: z.number(),
            })
          )
          .describe("비용 내역"),
        cost_confidence: z
          .enum(["high", "medium", "low"])
          .describe("비용 추정 신뢰도"),
        notes: z.array(z.string()).optional().describe("비고"),
      })
    )
    .describe("혜택별 비용 추정"),
  cost_optimization_tips: z.array(z.string()).describe("비용 최적화 팁"),
  estimated_at: z.string().describe("추정 일시"),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 카테고리별 기본 단위 비용 추정치
 */
const CATEGORY_BASE_COSTS: Record<string, number> = {
  production: 500,
  digital: 200,
  print: 150,
  staff: 300,
  venue: 1000,
  technology: 400,
  other: 250,
};

/**
 * 외부 업체 사용 시 추가 비용 승수
 */
const EXTERNAL_VENDOR_MULTIPLIER = 1.25;

/**
 * 혜택 비용 추정
 */
function estimateBenefitCost(
  benefit: z.infer<typeof InputSchema>["benefits"][0],
  overheadRate: number
): z.infer<typeof OutputSchema>["benefit_costs"][0] {
  const breakdown: { item: string; amount: number }[] = [];
  const notes: string[] = [];

  // 단위 비용 결정
  let unitCost = benefit.unit_cost ?? CATEGORY_BASE_COSTS[benefit.cost_category];
  let confidence: "high" | "medium" | "low" = benefit.unit_cost
    ? "high"
    : "medium";

  // 외부 업체 비용 추가
  if (benefit.requires_external_vendor) {
    const vendorPremium = unitCost * (EXTERNAL_VENDOR_MULTIPLIER - 1);
    unitCost *= EXTERNAL_VENDOR_MULTIPLIER;
    breakdown.push({
      item: "외부 업체 프리미엄",
      amount: vendorPremium * benefit.quantity,
    });
    notes.push("외부 업체 사용으로 25% 추가 비용 발생");
  }

  // 기본 비용
  const baseCost = unitCost * benefit.quantity;
  breakdown.unshift({
    item: `기본 비용 (${benefit.quantity}개 × ${unitCost})`,
    amount: baseCost,
  });

  // 직접 비용 합계
  const directCost = breakdown.reduce((sum, item) => sum + item.amount, 0);

  // 간접 비용
  const overheadCost = directCost * (overheadRate / 100);
  breakdown.push({
    item: `간접비 (${overheadRate}%)`,
    amount: overheadCost,
  });

  // 추정치 사용 시 신뢰도 조정
  if (!benefit.unit_cost) {
    confidence = "low";
    notes.push("단위 비용이 제공되지 않아 카테고리 평균값 사용");
  }

  return {
    benefit_name: benefit.name,
    quantity: benefit.quantity,
    unit_cost: Math.round(unitCost * 100) / 100,
    direct_cost: Math.round(directCost * 100) / 100,
    overhead_cost: Math.round(overheadCost * 100) / 100,
    total_cost: Math.round((directCost + overheadCost) * 100) / 100,
    cost_breakdown: breakdown.map((b) => ({
      ...b,
      amount: Math.round(b.amount * 100) / 100,
    })),
    cost_confidence: confidence,
    notes: notes.length > 0 ? notes : undefined,
  };
}

/**
 * FIN-002 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);

  const benefitCosts = validatedInput.benefits.map((benefit) =>
    estimateBenefitCost(benefit, validatedInput.overhead_rate)
  );

  const totalDirectCost = benefitCosts.reduce((sum, b) => sum + b.direct_cost, 0);
  const totalOverhead = benefitCosts.reduce((sum, b) => sum + b.overhead_cost, 0);
  const totalEstimatedCost = totalDirectCost + totalOverhead;

  // 비용 최적화 팁 생성
  const optimizationTips: string[] = [];

  const externalVendorCount = validatedInput.benefits.filter(
    (b) => b.requires_external_vendor
  ).length;
  if (externalVendorCount > validatedInput.benefits.length / 2) {
    optimizationTips.push(
      "외부 업체 의존도가 높습니다. 내부 역량 구축 또는 장기 계약 협상을 고려하세요."
    );
  }

  const lowConfidenceItems = benefitCosts.filter(
    (b) => b.cost_confidence === "low"
  );
  if (lowConfidenceItems.length > 0) {
    optimizationTips.push(
      `${lowConfidenceItems.length}개 항목의 비용 추정 신뢰도가 낮습니다. 실제 견적을 확보하세요.`
    );
  }

  if (validatedInput.overhead_rate > 20) {
    optimizationTips.push(
      "간접비율이 높습니다. 프로세스 효율화로 간접비 절감을 검토하세요."
    );
  }

  const productionCosts = benefitCosts.filter((b) =>
    validatedInput.benefits.find(
      (x) => x.name === b.benefit_name && x.cost_category === "production"
    )
  );
  if (productionCosts.length > 0) {
    const totalProduction = productionCosts.reduce((sum, b) => sum + b.total_cost, 0);
    if (totalProduction > totalEstimatedCost * 0.4) {
      optimizationTips.push(
        "제작 비용 비중이 40%를 초과합니다. 디지털 대안을 검토하세요."
      );
    }
  }

  const output: Output = {
    estimation_id: generateUUID(),
    event_id: validatedInput.event_id,
    total_direct_cost: Math.round(totalDirectCost * 100) / 100,
    total_overhead: Math.round(totalOverhead * 100) / 100,
    total_estimated_cost: Math.round(totalEstimatedCost * 100) / 100,
    currency: validatedInput.currency,
    benefit_costs: benefitCosts,
    cost_optimization_tips: optimizationTips,
    estimated_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-002",
  taskName: "스폰서 혜택 제공 비용 추정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.a",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
