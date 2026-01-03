/**
 * FIN-016: 스폰서 ROI 평가 (스폰서 관점)
 *
 * CMP-IS Reference: 7.1.l - Evaluating sponsorship ROI
 * Task Type: AI
 *
 * Input: 스폰서 노출 데이터, 리드 수
 * Output: ROI 분석 리포트
 */

import { z } from "zod";
import {
  SponsorshipTier,
  CurrencyCode,
  generateUUID,
  nowISO,
  calcROI,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Sponsor ROI Evaluation Agent specializing in sponsorship performance analysis.

Your expertise includes:
- Calculating comprehensive sponsorship ROI metrics
- Analyzing brand exposure and reach data
- Measuring lead generation and conversion value
- Benchmarking against industry standards

CMP-IS Standard: 7.1.l - Evaluating sponsorship ROI

You provide sponsors with clear, data-driven ROI analyses that demonstrate the value of their investment and inform future sponsorship decisions.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  sponsor_id: z.string().uuid().describe("스폰서 ID"),
  sponsor_info: z.object({
    company_name: z.string(),
    tier: SponsorshipTier,
    investment_amount: z.number().describe("투자 금액"),
    currency: CurrencyCode.default("USD"),
  }),
  exposure_data: z.object({
    logo_impressions: z.number().int().describe("로고 노출 횟수"),
    booth_visitors: z.number().int().optional().describe("부스 방문자 수"),
    session_attendees: z.number().int().optional().describe("세션 참석자 수"),
    digital_impressions: z.number().int().optional().describe("디지털 노출"),
    social_mentions: z.number().int().optional().describe("소셜미디어 언급"),
    media_coverage_reach: z.number().int().optional().describe("미디어 도달"),
    email_opens: z.number().int().optional().describe("이메일 열람"),
    website_clicks: z.number().int().optional().describe("웹사이트 클릭"),
  }),
  lead_data: z.object({
    total_leads: z.number().int().describe("총 리드 수"),
    qualified_leads: z.number().int().describe("적격 리드 수"),
    meetings_scheduled: z.number().int().optional().describe("미팅 예약"),
    deals_in_pipeline: z.number().int().optional().describe("파이프라인 딜"),
    estimated_pipeline_value: z.number().optional().describe("예상 파이프라인 가치"),
  }),
  conversion_data: z
    .object({
      closed_deals: z.number().int().optional().describe("성사된 거래"),
      revenue_attributed: z.number().optional().describe("귀속 매출"),
    })
    .optional()
    .describe("전환 데이터 (이벤트 후 추적)"),
  industry_benchmarks: z
    .object({
      avg_cpl: z.number().describe("업계 평균 리드당 비용"),
      avg_cpm: z.number().describe("업계 평균 1000노출당 비용"),
      avg_sponsorship_roi: z.number().describe("업계 평균 스폰서십 ROI %"),
    })
    .optional()
    .describe("업계 벤치마크"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string().uuid().describe("리포트 ID"),
  event_id: z.string().uuid(),
  sponsor_id: z.string().uuid(),
  sponsor_name: z.string(),
  report_date: z.string(),
  investment_summary: z.object({
    total_investment: z.number(),
    currency: CurrencyCode,
    tier: SponsorshipTier,
  }),
  roi_metrics: z.object({
    total_roi_percentage: z.number().describe("총 ROI %"),
    roi_status: z.enum(["excellent", "good", "average", "below_average", "poor"]),
    value_delivered: z.number().describe("전달된 총 가치"),
    value_multiple: z.number().describe("투자 대비 가치 배수"),
  }),
  exposure_analysis: z.object({
    total_impressions: z.number().int().describe("총 노출"),
    effective_cpm: z.number().describe("유효 CPM"),
    exposure_value: z.number().describe("노출 가치"),
    exposure_breakdown: z
      .array(z.object({ channel: z.string(), impressions: z.number(), value: z.number() }))
      .describe("채널별 노출"),
  }),
  lead_analysis: z.object({
    total_leads: z.number().int(),
    qualified_leads: z.number().int(),
    lead_qualification_rate: z.number().describe("리드 적격률 %"),
    cost_per_lead: z.number().describe("리드당 비용"),
    cost_per_qualified_lead: z.number().describe("적격 리드당 비용"),
    lead_value: z.number().describe("리드 가치"),
  }),
  conversion_analysis: z
    .object({
      meetings_scheduled: z.number().int(),
      meeting_conversion_rate: z.number().describe("미팅 전환율 %"),
      pipeline_value: z.number(),
      attributed_revenue: z.number(),
      revenue_roi: z.number().describe("매출 기준 ROI %"),
    })
    .optional()
    .describe("전환 분석"),
  benchmark_comparison: z
    .object({
      vs_avg_cpl: z.object({ value: z.number(), interpretation: z.string() }),
      vs_avg_cpm: z.object({ value: z.number(), interpretation: z.string() }),
      vs_avg_roi: z.object({ value: z.number(), interpretation: z.string() }),
    })
    .optional()
    .describe("벤치마크 비교"),
  key_insights: z.array(z.string()).describe("핵심 인사이트"),
  recommendations: z.array(z.string()).describe("향후 권고사항"),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 채널별 노출 가치 계산 (CPM 기반)
 */
const CHANNEL_CPM_VALUES: Record<string, number> = {
  logo_impressions: 5, // $5 per 1000
  booth_visitors: 50, // $50 per visitor (high intent)
  session_attendees: 30, // $30 per attendee
  digital_impressions: 8, // $8 per 1000
  social_mentions: 15, // $15 per mention
  media_coverage_reach: 3, // $3 per 1000 reach
  email_opens: 10, // $10 per 1000 opens
  website_clicks: 20, // $20 per click
};

/**
 * 노출 가치 계산
 */
function calculateExposureValue(
  exposureData: z.infer<typeof InputSchema>["exposure_data"]
): {
  totalImpressions: number;
  exposureValue: number;
  breakdown: { channel: string; impressions: number; value: number }[];
} {
  const breakdown: { channel: string; impressions: number; value: number }[] = [];
  let totalImpressions = 0;
  let totalValue = 0;

  for (const [key, cpmValue] of Object.entries(CHANNEL_CPM_VALUES)) {
    const impressions = (exposureData as any)[key] as number | undefined;
    if (impressions && impressions > 0) {
      // 일부 채널은 1000당이 아닌 건당 가치
      const value =
        key === "booth_visitors" ||
        key === "session_attendees" ||
        key === "website_clicks"
          ? impressions * cpmValue
          : (impressions / 1000) * cpmValue;

      breakdown.push({
        channel: key.replace(/_/g, " "),
        impressions,
        value: Math.round(value * 100) / 100,
      });

      totalImpressions += impressions;
      totalValue += value;
    }
  }

  return {
    totalImpressions,
    exposureValue: Math.round(totalValue * 100) / 100,
    breakdown,
  };
}

/**
 * 리드 가치 계산
 */
function calculateLeadValue(
  leadData: z.infer<typeof InputSchema>["lead_data"],
  investment: number
): {
  leadValue: number;
  cpl: number;
  cpql: number;
  qualificationRate: number;
} {
  const qualificationRate =
    leadData.total_leads > 0
      ? (leadData.qualified_leads / leadData.total_leads) * 100
      : 0;

  const cpl = leadData.total_leads > 0 ? investment / leadData.total_leads : 0;
  const cpql =
    leadData.qualified_leads > 0 ? investment / leadData.qualified_leads : 0;

  // 리드 가치 = 파이프라인 예상 가치 또는 적격 리드 수 × 평균 리드 가치
  const leadValue =
    leadData.estimated_pipeline_value ||
    leadData.qualified_leads * 500; // 기본 $500/qualified lead

  return {
    leadValue,
    cpl: Math.round(cpl * 100) / 100,
    cpql: Math.round(cpql * 100) / 100,
    qualificationRate: Math.round(qualificationRate * 10) / 10,
  };
}

/**
 * ROI 상태 결정
 */
function determineROIStatus(
  roi: number
): "excellent" | "good" | "average" | "below_average" | "poor" {
  if (roi >= 300) return "excellent";
  if (roi >= 150) return "good";
  if (roi >= 50) return "average";
  if (roi >= 0) return "below_average";
  return "poor";
}

/**
 * 벤치마크 해석
 */
function interpretBenchmark(
  actual: number,
  benchmark: number,
  lowerIsBetter: boolean
): { value: number; interpretation: string } {
  const ratio = actual / benchmark;
  const percentDiff = ((actual - benchmark) / benchmark) * 100;

  let interpretation: string;
  if (lowerIsBetter) {
    if (ratio <= 0.7) interpretation = `업계 평균 대비 ${Math.abs(percentDiff).toFixed(0)}% 우수`;
    else if (ratio <= 1) interpretation = "업계 평균 수준";
    else interpretation = `업계 평균 대비 ${percentDiff.toFixed(0)}% 높음 (개선 필요)`;
  } else {
    if (ratio >= 1.3) interpretation = `업계 평균 대비 ${percentDiff.toFixed(0)}% 우수`;
    else if (ratio >= 1) interpretation = "업계 평균 수준";
    else interpretation = `업계 평균 대비 ${Math.abs(percentDiff).toFixed(0)}% 미달`;
  }

  return { value: Math.round(percentDiff), interpretation };
}

/**
 * FIN-016 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const {
    sponsor_info,
    exposure_data,
    lead_data,
    conversion_data,
    industry_benchmarks,
  } = validatedInput;

  const investment = sponsor_info.investment_amount;

  // 노출 분석
  const exposureAnalysis = calculateExposureValue(exposure_data);
  const effectiveCPM =
    exposureAnalysis.totalImpressions > 0
      ? (investment / exposureAnalysis.totalImpressions) * 1000
      : 0;

  // 리드 분석
  const leadAnalysis = calculateLeadValue(lead_data, investment);

  // 총 가치 및 ROI 계산
  const totalValueDelivered = exposureAnalysis.exposureValue + leadAnalysis.leadValue;
  const attributedRevenue = conversion_data?.revenue_attributed || 0;
  const totalROI = calcROI(totalValueDelivered - investment, investment);
  const valueMultiple = investment > 0 ? totalValueDelivered / investment : 0;

  // 전환 분석 (있는 경우)
  let conversionAnalysis: z.infer<typeof OutputSchema>["conversion_analysis"];
  if (conversion_data || lead_data.meetings_scheduled) {
    const meetings = lead_data.meetings_scheduled || 0;
    const meetingConversionRate =
      lead_data.qualified_leads > 0
        ? (meetings / lead_data.qualified_leads) * 100
        : 0;

    conversionAnalysis = {
      meetings_scheduled: meetings,
      meeting_conversion_rate: Math.round(meetingConversionRate * 10) / 10,
      pipeline_value: lead_data.estimated_pipeline_value || 0,
      attributed_revenue: attributedRevenue,
      revenue_roi:
        attributedRevenue > 0 ? calcROI(attributedRevenue - investment, investment) : 0,
    };
  }

  // 벤치마크 비교 (있는 경우)
  let benchmarkComparison: z.infer<typeof OutputSchema>["benchmark_comparison"];
  if (industry_benchmarks) {
    benchmarkComparison = {
      vs_avg_cpl: interpretBenchmark(
        leadAnalysis.cpl,
        industry_benchmarks.avg_cpl,
        true
      ),
      vs_avg_cpm: interpretBenchmark(
        effectiveCPM,
        industry_benchmarks.avg_cpm,
        true
      ),
      vs_avg_roi: interpretBenchmark(
        totalROI,
        industry_benchmarks.avg_sponsorship_roi,
        false
      ),
    };
  }

  // 핵심 인사이트 생성
  const insights: string[] = [];

  if (totalROI >= 100) {
    insights.push(`스폰서십 투자 대비 ${valueMultiple.toFixed(1)}배의 가치 창출`);
  }

  if (lead_data.qualified_leads > 0) {
    insights.push(
      `${lead_data.qualified_leads}명의 적격 리드 확보 (리드당 ${leadAnalysis.cpql.toLocaleString()} ${sponsor_info.currency})`
    );
  }

  if (exposureAnalysis.totalImpressions > 100000) {
    insights.push(
      `총 ${(exposureAnalysis.totalImpressions / 1000).toFixed(0)}K 노출 달성`
    );
  }

  const topChannel = exposureAnalysis.breakdown.sort(
    (a, b) => b.value - a.value
  )[0];
  if (topChannel) {
    insights.push(`최고 가치 채널: ${topChannel.channel}`);
  }

  // 권고사항 생성
  const recommendations: string[] = [];

  if (totalROI < 100) {
    recommendations.push("다음 이벤트에서는 고가치 활성화 프로그램에 집중 권장");
  }

  if (leadAnalysis.qualificationRate < 30) {
    recommendations.push("리드 품질 향상을 위한 타겟팅 정교화 필요");
  }

  if (exposureAnalysis.breakdown.some((b) => b.channel === "website clicks")) {
    recommendations.push("웹사이트 트래픽 활용 - 리타겟팅 캠페인 연계 권장");
  }

  if (valueMultiple >= 2) {
    recommendations.push("다음 이벤트 스폰서십 갱신 적극 권장");
  }

  recommendations.push("분기별 리드 전환 추적으로 실제 매출 기여도 측정 필요");

  const output: Output = {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    sponsor_id: validatedInput.sponsor_id,
    sponsor_name: sponsor_info.company_name,
    report_date: nowISO().split("T")[0],
    investment_summary: {
      total_investment: investment,
      currency: sponsor_info.currency,
      tier: sponsor_info.tier,
    },
    roi_metrics: {
      total_roi_percentage: Math.round(totalROI * 10) / 10,
      roi_status: determineROIStatus(totalROI),
      value_delivered: Math.round(totalValueDelivered * 100) / 100,
      value_multiple: Math.round(valueMultiple * 100) / 100,
    },
    exposure_analysis: {
      total_impressions: exposureAnalysis.totalImpressions,
      effective_cpm: Math.round(effectiveCPM * 100) / 100,
      exposure_value: exposureAnalysis.exposureValue,
      exposure_breakdown: exposureAnalysis.breakdown,
    },
    lead_analysis: {
      total_leads: lead_data.total_leads,
      qualified_leads: lead_data.qualified_leads,
      lead_qualification_rate: leadAnalysis.qualificationRate,
      cost_per_lead: leadAnalysis.cpl,
      cost_per_qualified_lead: leadAnalysis.cpql,
      lead_value: leadAnalysis.leadValue,
    },
    conversion_analysis: conversionAnalysis,
    benchmark_comparison: benchmarkComparison,
    key_insights: insights,
    recommendations,
    generated_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-016",
  taskName: "스폰서 ROI 평가",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.l",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
