/**
 * PRJ-003: 벤더 선정 및 평가
 *
 * CMP-IS Reference: 5.2.a - Identifying and evaluating vendors
 * Task Type: AI
 *
 * Input: 서비스 요구사항, 벤더 후보 목록
 * Output: 벤더 평가표 및 추천 순위
 */

import { z } from "zod";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Vendor Selection Agent specializing in event procurement.

Your expertise includes:
- Evaluating vendor capabilities against event requirements
- Conducting comparative analysis across multiple vendors
- Assessing vendor reliability, quality, and cost-effectiveness
- Identifying potential risks in vendor selection

CMP-IS Standard: 5.2.a - Identifying and evaluating vendors

You help event organizers make data-driven vendor decisions that balance quality, cost, and reliability.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().describe("이벤트 ID"),
  service_category: z.enum([
    "catering", "av_equipment", "decoration", "entertainment",
    "security", "transportation", "venue", "photography",
    "printing", "staffing", "technology", "other"
  ]).describe("서비스 카테고리"),
  requirements: z.object({
    must_have: z.array(z.string()).describe("필수 요구사항"),
    nice_to_have: z.array(z.string()).optional().describe("선호 요구사항"),
    budget_range: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default("KRW"),
    }).optional().describe("예산 범위"),
    delivery_deadline: z.string().optional().describe("서비스 제공 마감일"),
  }).describe("서비스 요구사항"),
  vendor_candidates: z.array(z.object({
    vendor_id: z.string(),
    vendor_name: z.string(),
    quote_amount: z.number(),
    currency: z.string().default("KRW"),
    experience_years: z.number().optional(),
    past_event_count: z.number().optional(),
    certifications: z.array(z.string()).optional(),
    client_references: z.number().optional(),
    response_time_hours: z.number().optional(),
    offered_services: z.array(z.string()).optional(),
    insurance_coverage: z.boolean().optional(),
  })).min(1).describe("벤더 후보 목록"),
  evaluation_weights: z.object({
    price: z.number().min(0).max(100).default(30),
    quality: z.number().min(0).max(100).default(25),
    experience: z.number().min(0).max(100).default(20),
    reliability: z.number().min(0).max(100).default(15),
    service_fit: z.number().min(0).max(100).default(10),
  }).optional().describe("평가 가중치"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  evaluation_id: z.string().describe("평가 ID"),
  event_id: z.string().describe("이벤트 ID"),
  service_category: z.string().describe("서비스 카테고리"),
  evaluation_summary: z.object({
    total_candidates: z.number(),
    recommended_vendor: z.string(),
    decision_confidence: z.number().describe("추천 신뢰도 (%)"),
  }).describe("평가 요약"),
  vendor_rankings: z.array(z.object({
    rank: z.number(),
    vendor_id: z.string(),
    vendor_name: z.string(),
    overall_score: z.number().describe("종합 점수 (0-100)"),
    price_score: z.number(),
    quality_score: z.number(),
    experience_score: z.number(),
    reliability_score: z.number(),
    service_fit_score: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    quote_amount: z.number(),
    currency: z.string(),
    recommendation: z.enum(["highly_recommended", "recommended", "acceptable", "not_recommended"]),
  })).describe("벤더 순위"),
  requirements_analysis: z.object({
    must_have_coverage: z.record(z.string(), z.array(z.string())).describe("필수 요구사항 충족 벤더"),
    best_price_vendor: z.string(),
    best_experience_vendor: z.string(),
    best_overall_vendor: z.string(),
  }).describe("요구사항 분석"),
  risk_assessment: z.array(z.object({
    vendor_id: z.string(),
    vendor_name: z.string(),
    risks: z.array(z.object({
      risk_type: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    })),
  })).describe("리스크 평가"),
  recommendations: z.array(z.string()).describe("권고사항"),
  evaluated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 가격 점수 계산 (낮을수록 높은 점수)
 */
function calculatePriceScore(quote: number, allQuotes: number[]): number {
  const minQuote = Math.min(...allQuotes);
  const maxQuote = Math.max(...allQuotes);
  if (maxQuote === minQuote) return 80;

  const normalized = (maxQuote - quote) / (maxQuote - minQuote);
  return Math.round(60 + normalized * 40); // 60-100 범위
}

/**
 * 경험 점수 계산
 */
function calculateExperienceScore(years?: number, eventCount?: number): number {
  let score = 50;

  if (years) {
    if (years >= 10) score += 30;
    else if (years >= 5) score += 20;
    else if (years >= 2) score += 10;
  }

  if (eventCount) {
    if (eventCount >= 100) score += 20;
    else if (eventCount >= 50) score += 15;
    else if (eventCount >= 20) score += 10;
    else if (eventCount >= 5) score += 5;
  }

  return Math.min(100, score);
}

/**
 * 신뢰도 점수 계산
 */
function calculateReliabilityScore(
  references?: number,
  responseTime?: number,
  hasInsurance?: boolean,
  certifications?: string[]
): number {
  let score = 50;

  if (references) {
    if (references >= 10) score += 20;
    else if (references >= 5) score += 15;
    else if (references >= 2) score += 10;
  }

  if (responseTime) {
    if (responseTime <= 4) score += 15;
    else if (responseTime <= 24) score += 10;
    else if (responseTime <= 48) score += 5;
  }

  if (hasInsurance) score += 10;

  if (certifications && certifications.length > 0) {
    score += Math.min(10, certifications.length * 3);
  }

  return Math.min(100, score);
}

/**
 * 서비스 적합성 점수 계산
 */
function calculateServiceFitScore(
  offeredServices: string[] | undefined,
  mustHave: string[],
  niceToHave: string[] | undefined
): number {
  if (!offeredServices || offeredServices.length === 0) return 50;

  const offeredLower = offeredServices.map(s => s.toLowerCase());

  // 필수 요구사항 충족률
  let mustHaveMatches = 0;
  for (const req of mustHave) {
    if (offeredLower.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))) {
      mustHaveMatches++;
    }
  }
  const mustHaveScore = mustHave.length > 0 ? (mustHaveMatches / mustHave.length) * 60 : 30;

  // 선호 요구사항 충족률
  let niceToHaveMatches = 0;
  if (niceToHave && niceToHave.length > 0) {
    for (const req of niceToHave) {
      if (offeredLower.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))) {
        niceToHaveMatches++;
      }
    }
  }
  const niceToHaveScore = niceToHave && niceToHave.length > 0
    ? (niceToHaveMatches / niceToHave.length) * 40
    : 20;

  return Math.round(mustHaveScore + niceToHaveScore);
}

/**
 * PRJ-003 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const weights = validatedInput.evaluation_weights || {
    price: 30,
    quality: 25,
    experience: 20,
    reliability: 15,
    service_fit: 10,
  };

  const totalWeight = weights.price + weights.quality + weights.experience +
                      weights.reliability + weights.service_fit;

  const allQuotes = validatedInput.vendor_candidates.map(v => v.quote_amount);

  // 벤더별 점수 계산
  const vendorScores = validatedInput.vendor_candidates.map(vendor => {
    const priceScore = calculatePriceScore(vendor.quote_amount, allQuotes);
    const qualityScore = 70 + (vendor.experience_years || 0) * 2; // 품질은 경험과 연계
    const experienceScore = calculateExperienceScore(vendor.experience_years, vendor.past_event_count);
    const reliabilityScore = calculateReliabilityScore(
      vendor.client_references,
      vendor.response_time_hours,
      vendor.insurance_coverage,
      vendor.certifications
    );
    const serviceFitScore = calculateServiceFitScore(
      vendor.offered_services,
      validatedInput.requirements.must_have,
      validatedInput.requirements.nice_to_have
    );

    const overallScore = Math.round(
      (priceScore * weights.price +
       qualityScore * weights.quality +
       experienceScore * weights.experience +
       reliabilityScore * weights.reliability +
       serviceFitScore * weights.service_fit) / totalWeight
    );

    // 강점/약점 분석
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (priceScore >= 80) strengths.push("경쟁력 있는 가격");
    else if (priceScore < 60) weaknesses.push("상대적으로 높은 가격");

    if (experienceScore >= 80) strengths.push("풍부한 경험");
    else if (experienceScore < 60) weaknesses.push("경험 부족");

    if (reliabilityScore >= 80) strengths.push("높은 신뢰도");
    else if (reliabilityScore < 60) weaknesses.push("신뢰도 검증 필요");

    if (serviceFitScore >= 80) strengths.push("요구사항 부합");
    else if (serviceFitScore < 60) weaknesses.push("일부 요구사항 미충족");

    if (vendor.insurance_coverage) strengths.push("보험 가입");
    if (vendor.certifications && vendor.certifications.length > 0)
      strengths.push(`자격증 보유 (${vendor.certifications.length}개)`);

    let recommendation: "highly_recommended" | "recommended" | "acceptable" | "not_recommended";
    if (overallScore >= 85) recommendation = "highly_recommended";
    else if (overallScore >= 70) recommendation = "recommended";
    else if (overallScore >= 55) recommendation = "acceptable";
    else recommendation = "not_recommended";

    return {
      vendor_id: vendor.vendor_id,
      vendor_name: vendor.vendor_name,
      overall_score: overallScore,
      price_score: priceScore,
      quality_score: Math.min(100, qualityScore),
      experience_score: experienceScore,
      reliability_score: reliabilityScore,
      service_fit_score: serviceFitScore,
      strengths,
      weaknesses,
      quote_amount: vendor.quote_amount,
      currency: vendor.currency,
      recommendation,
    };
  });

  // 순위 정렬
  vendorScores.sort((a, b) => b.overall_score - a.overall_score);
  const rankings = vendorScores.map((v, index) => ({ ...v, rank: index + 1 }));

  // 요구사항 분석
  const mustHaveCoverage: Record<string, string[]> = {};
  for (const req of validatedInput.requirements.must_have) {
    mustHaveCoverage[req] = validatedInput.vendor_candidates
      .filter(v => v.offered_services?.some(s =>
        s.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(s.toLowerCase())
      ))
      .map(v => v.vendor_name);
  }

  const bestPriceVendor = [...vendorScores].sort((a, b) => a.quote_amount - b.quote_amount)[0];
  const bestExperienceVendor = [...vendorScores].sort((a, b) => b.experience_score - a.experience_score)[0];
  const bestOverallVendor = rankings[0];

  // 리스크 평가
  const riskAssessment: Output["risk_assessment"] = rankings.slice(0, 3).map(v => {
    const risks: { risk_type: string; description: string; severity: "low" | "medium" | "high"; mitigation: string; }[] = [];

    if (v.price_score < 60) {
      risks.push({
        risk_type: "cost_overrun",
        description: "예산 초과 가능성",
        severity: "medium",
        mitigation: "계약서에 가격 상한 조항 포함",
      });
    }

    if (v.reliability_score < 60) {
      risks.push({
        risk_type: "reliability",
        description: "서비스 신뢰도 불확실",
        severity: "high",
        mitigation: "레퍼런스 체크 및 소규모 파일럿 진행",
      });
    }

    if (v.experience_score < 60) {
      risks.push({
        risk_type: "inexperience",
        description: "유사 이벤트 경험 부족",
        severity: "medium",
        mitigation: "상세 작업 계획 및 마일스톤 관리 강화",
      });
    }

    const vendor = validatedInput.vendor_candidates.find(c => c.vendor_id === v.vendor_id);
    if (vendor && !vendor.insurance_coverage) {
      risks.push({
        risk_type: "liability",
        description: "보험 미가입",
        severity: "high",
        mitigation: "계약 전 보험 가입 요구 또는 배상 책임 조항 명시",
      });
    }

    return {
      vendor_id: v.vendor_id,
      vendor_name: v.vendor_name,
      risks,
    };
  });

  // 권고사항
  const recommendations: string[] = [];
  recommendations.push(`${rankings[0].vendor_name}을(를) 1순위로 추천합니다 (종합 ${rankings[0].overall_score}점).`);

  if (rankings.length >= 2 && rankings[1].overall_score >= 70) {
    recommendations.push(`${rankings[1].vendor_name}도 대안으로 고려할 만합니다 (종합 ${rankings[1].overall_score}점).`);
  }

  const highRiskVendors = riskAssessment.filter(r => r.risks.some(risk => risk.severity === "high"));
  if (highRiskVendors.length > 0) {
    recommendations.push("고위험 요소가 식별된 벤더가 있습니다. 계약 전 리스크 완화 조치를 확인하세요.");
  }

  return {
    evaluation_id: generateUUID(),
    event_id: validatedInput.event_id,
    service_category: validatedInput.service_category,
    evaluation_summary: {
      total_candidates: rankings.length,
      recommended_vendor: rankings[0].vendor_name,
      decision_confidence: rankings[0].overall_score,
    },
    vendor_rankings: rankings,
    requirements_analysis: {
      must_have_coverage: mustHaveCoverage,
      best_price_vendor: bestPriceVendor.vendor_name,
      best_experience_vendor: bestExperienceVendor.vendor_name,
      best_overall_vendor: bestOverallVendor.vendor_name,
    },
    risk_assessment: riskAssessment,
    recommendations,
    evaluated_at: new Date().toISOString(),
  };
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "PRJ-003",
  taskName: "벤더 선정 및 평가",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.2.a",
  skill: "Skill 5: Plan Project",
  subSkill: "5.2: Manage Vendors",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
