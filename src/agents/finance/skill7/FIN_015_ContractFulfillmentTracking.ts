/**
 * FIN-015: 스폰서 계약 이행 추적
 *
 * CMP-IS Reference: 7.1.k - Tracking fulfillment of sponsorship contracts
 * Task Type: AI
 *
 * Input: 계약 조건, 실행 현황
 * Output: 이행률 리포트
 */

import { z } from "zod";
import {
  SponsorshipTier,
  SponsorBenefitSchema,
  CurrencyCode,
  generateUUID,
  nowISO,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Contract Fulfillment Tracking Agent specializing in sponsorship obligation management.

Your expertise includes:
- Monitoring benefit delivery status against contracts
- Calculating fulfillment rates and progress
- Identifying at-risk deliverables
- Generating compliance reports

CMP-IS Standard: 7.1.k - Tracking fulfillment of sponsorship contracts

You ensure all sponsorship commitments are tracked and delivered, maintaining sponsor satisfaction and contractual compliance.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  contract_id: z.string().uuid().describe("계약 ID"),
  sponsor_info: z.object({
    sponsor_name: z.string(),
    tier: SponsorshipTier,
    contract_value: z.number(),
    currency: CurrencyCode.default("USD"),
  }),
  contracted_benefits: z
    .array(
      z.object({
        benefit_id: z.string().uuid(),
        benefit_name: z.string(),
        description: z.string().optional(),
        promised_value: z.number(),
        quantity: z.number().int().default(1),
        delivery_deadline: z.string().optional(),
        category: z.enum([
          "branding",
          "access",
          "promotion",
          "content",
          "networking",
          "digital",
          "physical",
          "other",
        ]),
      })
    )
    .describe("계약된 혜택 목록"),
  fulfillment_status: z
    .array(
      z.object({
        benefit_id: z.string().uuid(),
        status: z.enum([
          "not_started",
          "in_progress",
          "delivered",
          "partial",
          "blocked",
          "cancelled",
        ]),
        delivered_quantity: z.number().int().default(0),
        delivered_date: z.string().optional(),
        evidence: z.string().optional().describe("이행 증빙"),
        blockers: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .describe("이행 현황"),
  report_date: z.string().describe("리포트 기준일"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string().uuid().describe("리포트 ID"),
  event_id: z.string().uuid(),
  contract_id: z.string().uuid(),
  sponsor_name: z.string(),
  report_date: z.string(),
  overall_fulfillment: z.object({
    rate_percentage: z.number().describe("전체 이행률 (%)"),
    status: z.enum(["on_track", "at_risk", "behind", "completed"]),
    value_delivered: z.number().describe("전달된 가치"),
    value_remaining: z.number().describe("잔여 가치"),
  }),
  by_category_fulfillment: z
    .array(
      z.object({
        category: z.string(),
        total_items: z.number().int(),
        delivered_items: z.number().int(),
        rate_percentage: z.number(),
      })
    )
    .describe("카테고리별 이행 현황"),
  benefit_details: z
    .array(
      z.object({
        benefit_id: z.string().uuid(),
        benefit_name: z.string(),
        category: z.string(),
        promised_value: z.number(),
        delivered_value: z.number(),
        fulfillment_rate: z.number(),
        status: z.string(),
        status_indicator: z.enum(["green", "yellow", "red"]),
        days_until_deadline: z.number().int().optional(),
        blockers: z.array(z.string()),
        action_required: z.string().optional(),
      })
    )
    .describe("혜택별 상세"),
  risk_assessment: z.object({
    at_risk_benefits: z.number().int(),
    blocked_benefits: z.number().int(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    risk_factors: z.array(z.string()),
  }),
  action_items: z
    .array(
      z.object({
        priority: z.enum(["urgent", "high", "medium", "low"]),
        action: z.string(),
        deadline: z.string().optional(),
        responsible: z.string().optional(),
      })
    )
    .describe("조치 사항"),
  summary: z.string().describe("요약"),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 이행 상태에 따른 이행률 계산
 */
function calculateFulfillmentRate(
  status: string,
  deliveredQty: number,
  promisedQty: number
): number {
  switch (status) {
    case "delivered":
      return 100;
    case "cancelled":
      return 0; // 취소된 항목은 계산에서 제외될 수 있음
    case "partial":
      return promisedQty > 0 ? (deliveredQty / promisedQty) * 100 : 0;
    case "in_progress":
      // 진행 중은 부분 인정
      return promisedQty > 0
        ? Math.min((deliveredQty / promisedQty) * 100 + 20, 80)
        : 20;
    case "blocked":
      return promisedQty > 0 ? (deliveredQty / promisedQty) * 100 : 0;
    default:
      return 0;
  }
}

/**
 * 상태 인디케이터 결정
 */
function getStatusIndicator(
  rate: number,
  status: string,
  daysUntilDeadline?: number
): "green" | "yellow" | "red" {
  if (status === "blocked") return "red";
  if (status === "delivered") return "green";

  if (daysUntilDeadline !== undefined) {
    if (daysUntilDeadline < 0) return "red"; // 기한 초과
    if (daysUntilDeadline <= 7 && rate < 80) return "red";
    if (daysUntilDeadline <= 14 && rate < 50) return "yellow";
  }

  if (rate >= 80) return "green";
  if (rate >= 50) return "yellow";
  return "red";
}

/**
 * 필요 조치 결정
 */
function determineAction(
  status: string,
  indicator: string,
  blockers: string[]
): string | undefined {
  if (status === "blocked" && blockers.length > 0) {
    return `블로커 해결 필요: ${blockers[0]}`;
  }
  if (indicator === "red") {
    return "긴급 조치 필요 - 이행 지연";
  }
  if (indicator === "yellow") {
    return "진행 상황 모니터링 강화";
  }
  return undefined;
}

/**
 * 전체 상태 결정
 */
function determineOverallStatus(
  rate: number,
  atRiskCount: number,
  blockedCount: number
): "on_track" | "at_risk" | "behind" | "completed" {
  if (rate >= 100) return "completed";
  if (blockedCount > 0 || rate < 50) return "behind";
  if (atRiskCount > 0 || rate < 80) return "at_risk";
  return "on_track";
}

/**
 * 리스크 레벨 결정
 */
function determineRiskLevel(
  atRiskCount: number,
  blockedCount: number,
  totalCount: number
): "low" | "medium" | "high" | "critical" {
  const problemRatio = (atRiskCount + blockedCount) / totalCount;

  if (blockedCount >= 3 || problemRatio >= 0.5) return "critical";
  if (blockedCount >= 1 || problemRatio >= 0.3) return "high";
  if (atRiskCount >= 2 || problemRatio >= 0.15) return "medium";
  return "low";
}

/**
 * FIN-015 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { contracted_benefits, fulfillment_status, sponsor_info } = validatedInput;

  const reportDate = new Date(validatedInput.report_date);

  // 혜택별 상세 분석
  const benefitDetails: z.infer<typeof OutputSchema>["benefit_details"] = [];
  const categoryMap: Record<string, { total: number; delivered: number }> = {};
  let totalPromisedValue = 0;
  let totalDeliveredValue = 0;
  let atRiskCount = 0;
  let blockedCount = 0;

  for (const benefit of contracted_benefits) {
    const status = fulfillment_status.find((s) => s.benefit_id === benefit.benefit_id);

    const deliveredQty = status?.delivered_quantity || 0;
    const fulfillmentRate = calculateFulfillmentRate(
      status?.status || "not_started",
      deliveredQty,
      benefit.quantity
    );

    // 데드라인까지 남은 일수
    let daysUntilDeadline: number | undefined;
    if (benefit.delivery_deadline) {
      const deadline = new Date(benefit.delivery_deadline);
      daysUntilDeadline = Math.ceil(
        (deadline.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    const indicator = getStatusIndicator(
      fulfillmentRate,
      status?.status || "not_started",
      daysUntilDeadline
    );

    const blockers = status?.blockers || [];
    const actionRequired = determineAction(
      status?.status || "not_started",
      indicator,
      blockers
    );

    // 가치 계산
    const deliveredValue = (benefit.promised_value * fulfillmentRate) / 100;
    totalPromisedValue += benefit.promised_value;
    totalDeliveredValue += deliveredValue;

    // 위험 카운트
    if (indicator === "red" && status?.status !== "blocked") atRiskCount++;
    if (status?.status === "blocked") blockedCount++;

    // 카테고리별 집계
    if (!categoryMap[benefit.category]) {
      categoryMap[benefit.category] = { total: 0, delivered: 0 };
    }
    categoryMap[benefit.category].total++;
    if (status?.status === "delivered") {
      categoryMap[benefit.category].delivered++;
    }

    benefitDetails.push({
      benefit_id: benefit.benefit_id,
      benefit_name: benefit.benefit_name,
      category: benefit.category,
      promised_value: benefit.promised_value,
      delivered_value: Math.round(deliveredValue * 100) / 100,
      fulfillment_rate: Math.round(fulfillmentRate * 10) / 10,
      status: status?.status || "not_started",
      status_indicator: indicator,
      days_until_deadline: daysUntilDeadline,
      blockers,
      action_required: actionRequired,
    });
  }

  // 전체 이행률
  const overallRate =
    totalPromisedValue > 0 ? (totalDeliveredValue / totalPromisedValue) * 100 : 0;

  // 카테고리별 이행 현황
  const byCategoryFulfillment = Object.entries(categoryMap).map(
    ([category, data]) => ({
      category,
      total_items: data.total,
      delivered_items: data.delivered,
      rate_percentage:
        data.total > 0 ? Math.round((data.delivered / data.total) * 100) : 0,
    })
  );

  // 리스크 평가
  const riskFactors: string[] = [];
  if (blockedCount > 0) {
    riskFactors.push(`${blockedCount}개 혜택이 블로킹됨`);
  }
  if (atRiskCount > 0) {
    riskFactors.push(`${atRiskCount}개 혜택이 위험 상태`);
  }
  if (overallRate < 50) {
    riskFactors.push("전체 이행률 50% 미만");
  }

  const riskLevel = determineRiskLevel(
    atRiskCount,
    blockedCount,
    contracted_benefits.length
  );

  // 조치 사항 생성
  const actionItems: z.infer<typeof OutputSchema>["action_items"] = [];

  // 블로킹된 항목 우선
  const blockedBenefits = benefitDetails.filter((b) => b.status === "blocked");
  for (const blocked of blockedBenefits) {
    actionItems.push({
      priority: "urgent",
      action: `[${blocked.benefit_name}] 블로커 해결: ${blocked.blockers.join(", ")}`,
      deadline: "즉시",
    });
  }

  // 위험 항목
  const atRiskBenefits = benefitDetails.filter(
    (b) => b.status_indicator === "red" && b.status !== "blocked"
  );
  for (const atRisk of atRiskBenefits) {
    actionItems.push({
      priority: "high",
      action: `[${atRisk.benefit_name}] 이행 촉진 필요`,
      deadline: atRisk.days_until_deadline
        ? `D-${atRisk.days_until_deadline}`
        : undefined,
    });
  }

  // 요약 생성
  const summary =
    `${sponsor_info.sponsor_name} (${sponsor_info.tier}) 스폰서십 계약 이행률: ${Math.round(overallRate)}%. ` +
    `총 ${contracted_benefits.length}개 혜택 중 ` +
    `${benefitDetails.filter((b) => b.status === "delivered").length}개 완료, ` +
    `${blockedCount}개 블로킹, ${atRiskCount}개 위험. ` +
    (riskLevel === "low"
      ? "전반적으로 순조롭게 진행 중."
      : riskLevel === "critical"
      ? "긴급 조치 필요!"
      : "일부 항목 주의 필요.");

  const output: Output = {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    contract_id: validatedInput.contract_id,
    sponsor_name: sponsor_info.sponsor_name,
    report_date: validatedInput.report_date,
    overall_fulfillment: {
      rate_percentage: Math.round(overallRate * 10) / 10,
      status: determineOverallStatus(overallRate, atRiskCount, blockedCount),
      value_delivered: Math.round(totalDeliveredValue * 100) / 100,
      value_remaining: Math.round((totalPromisedValue - totalDeliveredValue) * 100) / 100,
    },
    by_category_fulfillment: byCategoryFulfillment,
    benefit_details: benefitDetails,
    risk_assessment: {
      at_risk_benefits: atRiskCount,
      blocked_benefits: blockedCount,
      risk_level: riskLevel,
      risk_factors:
        riskFactors.length > 0 ? riskFactors : ["특별한 리스크 없음"],
    },
    action_items:
      actionItems.length > 0
        ? actionItems
        : [
            {
              priority: "low",
              action: "현재 진행 상황 모니터링 유지",
            },
          ],
    summary,
    generated_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-015",
  taskName: "스폰서 계약 이행 추적",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.k",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
