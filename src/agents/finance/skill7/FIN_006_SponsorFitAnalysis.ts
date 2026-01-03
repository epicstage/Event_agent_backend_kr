/**
 * FIN-006: 스폰서 적합성 분석 (이벤트 호환성)
 *
 * CMP-IS Reference: 7.1.d - Identifying potential sponsors
 * Task Type: AI
 *
 * Input: 스폰서 브랜드 정보, 이벤트 성격
 * Output: 적합성 점수 및 이유
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Sponsor Fit Analysis Agent specializing in brand-event alignment evaluation with strong emphasis on ESG (Environmental, Social, Governance) compatibility.

Your expertise includes:
- Analyzing brand values and event characteristics for compatibility
- Evaluating audience overlap between sponsor and event
- Assessing ESG alignment between sponsor corporate responsibility and event sustainability goals
- Evaluating corporate image compatibility with event positioning
- Assessing potential brand risks and benefits
- Providing strategic alignment recommendations

CMP-IS Standard: 7.1.d - Identifying potential sponsors

You provide objective compatibility assessments that prioritize ESG alignment and corporate image matching, recognizing that modern events increasingly require sponsors whose values authentically align with sustainability and social responsibility goals.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

// ESG 등급 정의
const ESGRating = z.enum(["A+", "A", "B+", "B", "C", "D", "none"]);

// ESG 세부 항목 스키마
const ESGProfileSchema = z.object({
  environmental: z.object({
    rating: ESGRating.default("none").describe("환경 등급"),
    initiatives: z.array(z.string()).optional().describe("환경 이니셔티브 (탄소중립, 재생에너지 등)"),
    certifications: z.array(z.string()).optional().describe("환경 인증 (ISO14001, B-Corp 등)"),
    carbon_neutral_commitment: z.boolean().optional().describe("탄소중립 선언 여부"),
  }).optional(),
  social: z.object({
    rating: ESGRating.default("none").describe("사회 등급"),
    initiatives: z.array(z.string()).optional().describe("사회 이니셔티브 (DEI, 지역사회 등)"),
    diversity_commitment: z.boolean().optional().describe("다양성 정책 유무"),
    labor_practices: z.enum(["excellent", "good", "average", "poor", "unknown"]).optional(),
  }).optional(),
  governance: z.object({
    rating: ESGRating.default("none").describe("거버넌스 등급"),
    transparency_score: z.number().min(0).max(100).optional().describe("투명성 점수"),
    ethical_violations: z.array(z.string()).optional().describe("윤리 위반 이력"),
    board_diversity: z.boolean().optional().describe("이사회 다양성"),
  }).optional(),
  overall_esg_score: z.number().min(0).max(100).optional().describe("종합 ESG 점수"),
});

// 기업 이미지 상세 스키마
const CorporateImageSchema = z.object({
  positioning: z.enum(["premium", "mainstream", "budget", "innovative", "traditional"]).describe("포지셔닝"),
  reputation_score: z.number().min(0).max(100).optional().describe("평판 점수"),
  public_perception: z.enum(["very_positive", "positive", "neutral", "negative", "controversial"]).optional(),
  brand_personality: z.array(z.enum([
    "trustworthy", "innovative", "luxurious", "friendly", "professional",
    "sustainable", "adventurous", "caring", "authoritative", "youthful"
  ])).optional().describe("브랜드 성격"),
  recent_campaigns: z.array(z.string()).optional().describe("최근 캠페인/CSR 활동"),
});

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  sponsor_profile: z.object({
    company_name: z.string().describe("회사명"),
    industry: z.string().describe("산업"),
    brand_values: z.array(z.string()).describe("브랜드 핵심 가치"),
    target_demographics: z
      .object({
        age_range: z.string().optional(),
        income_level: z.string().optional(),
        interests: z.array(z.string()).optional(),
      })
      .optional()
      .describe("타겟 고객층"),
    // 기존 brand_image를 상세 스키마로 확장
    brand_image: z
      .enum(["premium", "mainstream", "budget", "innovative", "traditional"])
      .describe("브랜드 이미지 (레거시)"),
    corporate_image: CorporateImageSchema.optional().describe("기업 이미지 상세"),
    esg_profile: ESGProfileSchema.optional().describe("ESG 프로필"),
    controversy_history: z.array(z.string()).optional().describe("과거 논란 이력"),
    competitor_brands: z.array(z.string()).optional().describe("경쟁 브랜드"),
  }),
  event_profile: z.object({
    event_name: z.string().describe("이벤트명"),
    event_type: z.string().describe("이벤트 유형"),
    event_values: z.array(z.string()).describe("이벤트 핵심 가치"),
    attendee_profile: z
      .object({
        age_range: z.string().optional(),
        income_level: z.string().optional(),
        interests: z.array(z.string()).optional(),
        professional_level: z.string().optional(),
      })
      .describe("참석자 프로필"),
    event_tone: z
      .enum(["formal", "casual", "innovative", "educational", "entertainment"])
      .describe("이벤트 톤"),
    // ESG 관련 이벤트 속성 추가
    esg_requirements: z.object({
      sustainability_focus: z.boolean().optional().describe("지속가능성 중시 여부"),
      carbon_neutral_event: z.boolean().optional().describe("탄소중립 이벤트 여부"),
      diversity_inclusive: z.boolean().optional().describe("다양성/포용성 중시"),
      required_esg_minimum: ESGRating.optional().describe("요구 최소 ESG 등급"),
      priority_values: z.array(z.enum([
        "environmental", "social", "governance", "diversity", "sustainability", "ethics"
      ])).optional().describe("우선순위 가치"),
    }).optional().describe("이벤트 ESG 요구사항"),
    desired_sponsor_image: z.array(z.enum([
      "trustworthy", "innovative", "luxurious", "friendly", "professional",
      "sustainable", "adventurous", "caring", "authoritative", "youthful"
    ])).optional().describe("원하는 스폰서 이미지"),
    existing_sponsors: z.array(z.string()).optional().describe("기존 확정 스폰서"),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid().describe("분석 ID"),
  event_id: z.string().uuid(),
  company_name: z.string(),
  overall_fit_score: z.number().min(0).max(100).describe("종합 적합도 점수"),
  fit_grade: z.enum(["A", "B", "C", "D", "F"]).describe("적합도 등급"),
  recommendation: z
    .enum(["highly_recommended", "recommended", "conditional", "not_recommended"])
    .describe("추천 수준"),
  dimension_scores: z
    .object({
      brand_alignment: z.number().min(0).max(100).describe("브랜드 가치 정렬"),
      audience_overlap: z.number().min(0).max(100).describe("타겟 오디언스 중복"),
      image_compatibility: z.number().min(0).max(100).describe("이미지 호환성"),
      esg_alignment: z.number().min(0).max(100).describe("ESG 정렬도 (핵심 지표)"),
      corporate_image_match: z.number().min(0).max(100).describe("기업 이미지 매칭"),
      risk_assessment: z.number().min(0).max(100).describe("리스크 평가 (높을수록 안전)"),
    })
    .describe("차원별 점수"),
  esg_analysis: z.object({
    sponsor_esg_level: z.string().describe("스폰서 ESG 수준"),
    event_esg_requirement: z.string().describe("이벤트 ESG 요구수준"),
    alignment_status: z.enum(["exceeds", "meets", "below", "far_below"]).describe("충족 상태"),
    gap_analysis: z.array(z.string()).describe("갭 분석"),
    esg_strengths: z.array(z.string()).describe("ESG 강점"),
    esg_concerns: z.array(z.string()).describe("ESG 우려사항"),
  }).describe("ESG 상세 분석"),
  image_analysis: z.object({
    positioning_match: z.boolean().describe("포지셔닝 매칭"),
    personality_overlap: z.array(z.string()).describe("브랜드 성격 중복"),
    perception_risk: z.enum(["none", "low", "medium", "high"]).describe("인식 리스크"),
    synergy_potential: z.string().describe("시너지 잠재력"),
  }).describe("이미지 상세 분석"),
  strengths: z.array(z.string()).describe("강점"),
  concerns: z.array(z.string()).describe("우려 사항"),
  risk_factors: z
    .array(
      z.object({
        factor: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        mitigation: z.string(),
      })
    )
    .describe("리스크 요인"),
  competitor_conflicts: z.array(z.string()).describe("경쟁사 충돌"),
  strategic_recommendations: z.array(z.string()).describe("전략적 권고"),
  weight_breakdown: z.object({
    esg_weight: z.number().describe("ESG 가중치 (%)"),
    image_weight: z.number().describe("이미지 가중치 (%)"),
    brand_weight: z.number().describe("브랜드 가중치 (%)"),
    audience_weight: z.number().describe("오디언스 가중치 (%)"),
    risk_weight: z.number().describe("리스크 가중치 (%)"),
  }).describe("점수 가중치 분배"),
  analyzed_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

// ESG 등급을 점수로 변환
const ESG_RATING_SCORES: Record<string, number> = {
  "A+": 100,
  "A": 90,
  "B+": 80,
  "B": 70,
  "C": 50,
  "D": 30,
  "none": 0,
};

/**
 * ESG 정렬도 분석 (강화된 로직)
 */
function analyzeESGAlignment(
  sponsorESG: z.infer<typeof ESGProfileSchema> | undefined,
  eventESG: z.infer<typeof InputSchema>["event_profile"]["esg_requirements"]
): {
  score: number;
  analysis: z.infer<typeof OutputSchema>["esg_analysis"];
} {
  // 이벤트가 ESG를 중시하지 않으면 기본 점수
  if (!eventESG || (!eventESG.sustainability_focus && !eventESG.required_esg_minimum)) {
    return {
      score: 70, // 중립
      analysis: {
        sponsor_esg_level: sponsorESG?.overall_esg_score ? `${sponsorESG.overall_esg_score}점` : "미평가",
        event_esg_requirement: "요구사항 없음",
        alignment_status: "meets",
        gap_analysis: [],
        esg_strengths: [],
        esg_concerns: [],
      },
    };
  }

  let score = 50; // 기준점
  const strengths: string[] = [];
  const concerns: string[] = [];
  const gaps: string[] = [];

  // 스폰서 종합 ESG 점수
  const sponsorOverallScore = sponsorESG?.overall_esg_score || 0;

  // 최소 등급 요구 충족 여부
  if (eventESG.required_esg_minimum && eventESG.required_esg_minimum !== "none") {
    const requiredScore = ESG_RATING_SCORES[eventESG.required_esg_minimum];
    if (sponsorOverallScore >= requiredScore) {
      score += 25;
      strengths.push(`최소 ESG 등급 요구(${eventESG.required_esg_minimum}) 충족`);
    } else {
      score -= 20;
      concerns.push(`ESG 등급 미달: 요구 ${eventESG.required_esg_minimum}, 실제 ${sponsorOverallScore}점`);
      gaps.push(`ESG 점수 ${requiredScore - sponsorOverallScore}점 부족`);
    }
  }

  // 환경(E) 분석
  if (eventESG.sustainability_focus || eventESG.carbon_neutral_event) {
    if (sponsorESG?.environmental) {
      const envRating = sponsorESG.environmental.rating || "none";
      const envScore = ESG_RATING_SCORES[envRating];

      if (envScore >= 80) {
        score += 15;
        strengths.push(`환경 등급 우수 (${envRating})`);
      } else if (envScore >= 50) {
        score += 5;
      } else {
        score -= 10;
        concerns.push("환경 등급 미흡");
      }

      if (eventESG.carbon_neutral_event && sponsorESG.environmental.carbon_neutral_commitment) {
        score += 10;
        strengths.push("탄소중립 선언 기업 - 이벤트 탄소중립 목표 부합");
      } else if (eventESG.carbon_neutral_event && !sponsorESG.environmental.carbon_neutral_commitment) {
        score -= 5;
        gaps.push("이벤트는 탄소중립이나 스폰서는 미선언");
      }

      if (sponsorESG.environmental.certifications?.length) {
        score += Math.min(10, sponsorESG.environmental.certifications.length * 3);
        strengths.push(`환경 인증 보유: ${sponsorESG.environmental.certifications.join(", ")}`);
      }
    } else {
      score -= 15;
      concerns.push("환경 ESG 정보 없음 - 지속가능성 중시 이벤트와 불일치 우려");
    }
  }

  // 사회(S) 분석
  if (eventESG.diversity_inclusive) {
    if (sponsorESG?.social) {
      if (sponsorESG.social.diversity_commitment) {
        score += 10;
        strengths.push("다양성 정책 보유 기업");
      } else {
        concerns.push("다양성 정책 미확인");
      }

      if (sponsorESG.social.labor_practices === "excellent" || sponsorESG.social.labor_practices === "good") {
        score += 5;
        strengths.push(`노동 관행 ${sponsorESG.social.labor_practices}`);
      } else if (sponsorESG.social.labor_practices === "poor") {
        score -= 15;
        concerns.push("노동 관행 우려");
      }
    }
  }

  // 거버넌스(G) 분석
  if (sponsorESG?.governance) {
    if (sponsorESG.governance.ethical_violations?.length) {
      score -= sponsorESG.governance.ethical_violations.length * 10;
      concerns.push(`윤리 위반 이력 ${sponsorESG.governance.ethical_violations.length}건`);
    }
    if (sponsorESG.governance.transparency_score && sponsorESG.governance.transparency_score >= 80) {
      score += 5;
      strengths.push("높은 투명성 점수");
    }
  }

  // 정렬 상태 결정
  let alignmentStatus: "exceeds" | "meets" | "below" | "far_below";
  if (score >= 85) alignmentStatus = "exceeds";
  else if (score >= 65) alignmentStatus = "meets";
  else if (score >= 45) alignmentStatus = "below";
  else alignmentStatus = "far_below";

  return {
    score: Math.max(0, Math.min(100, score)),
    analysis: {
      sponsor_esg_level: sponsorESG?.overall_esg_score ? `${sponsorESG.overall_esg_score}점` : "미평가",
      event_esg_requirement: eventESG.required_esg_minimum || "일반",
      alignment_status: alignmentStatus,
      gap_analysis: gaps,
      esg_strengths: strengths,
      esg_concerns: concerns,
    },
  };
}

/**
 * 기업 이미지 매칭 분석 (강화된 로직)
 */
function analyzeCorporateImageMatch(
  sponsorImage: z.infer<typeof CorporateImageSchema> | undefined,
  sponsorBrandImage: string,
  eventTone: string,
  desiredImage: string[] | undefined
): {
  score: number;
  analysis: z.infer<typeof OutputSchema>["image_analysis"];
} {
  let score = 60; // 기준점
  const personalityOverlap: string[] = [];
  let perceptionRisk: "none" | "low" | "medium" | "high" = "none";
  let synergyPotential = "보통";
  let positioningMatch = false;

  // 기본 호환성 매트릭스 (확장)
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    premium: { formal: 95, casual: 55, innovative: 85, educational: 75, entertainment: 60 },
    mainstream: { formal: 70, casual: 90, innovative: 75, educational: 80, entertainment: 88 },
    budget: { formal: 35, casual: 80, innovative: 45, educational: 65, entertainment: 75 },
    innovative: { formal: 65, casual: 78, innovative: 98, educational: 85, entertainment: 72 },
    traditional: { formal: 92, casual: 55, innovative: 40, educational: 82, entertainment: 50 },
  };

  const positioning = sponsorImage?.positioning || sponsorBrandImage;
  const baseScore = compatibilityMatrix[positioning]?.[eventTone] || 60;
  score = baseScore;
  positioningMatch = baseScore >= 70;

  // 브랜드 성격 매칭 (상세)
  if (sponsorImage?.brand_personality && desiredImage) {
    const overlap = sponsorImage.brand_personality.filter(p =>
      desiredImage.includes(p as any)
    );
    personalityOverlap.push(...overlap);

    // 성격 매칭 보너스/패널티
    const matchRatio = overlap.length / Math.max(desiredImage.length, 1);
    if (matchRatio >= 0.6) {
      score += 20;
      synergyPotential = "높음 - 브랜드 성격 강한 일치";
    } else if (matchRatio >= 0.3) {
      score += 10;
      synergyPotential = "중간 - 부분적 성격 일치";
    } else if (matchRatio === 0 && desiredImage.length > 0) {
      score -= 10;
      synergyPotential = "낮음 - 성격 불일치";
    }
  }

  // 평판 점수 반영
  if (sponsorImage?.reputation_score) {
    if (sponsorImage.reputation_score >= 85) {
      score += 10;
    } else if (sponsorImage.reputation_score >= 70) {
      score += 5;
    } else if (sponsorImage.reputation_score < 50) {
      score -= 15;
    }
  }

  // 대중 인식 리스크 평가
  if (sponsorImage?.public_perception) {
    switch (sponsorImage.public_perception) {
      case "very_positive":
        score += 10;
        perceptionRisk = "none";
        break;
      case "positive":
        score += 5;
        perceptionRisk = "none";
        break;
      case "neutral":
        perceptionRisk = "low";
        break;
      case "negative":
        score -= 15;
        perceptionRisk = "medium";
        break;
      case "controversial":
        score -= 25;
        perceptionRisk = "high";
        break;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    analysis: {
      positioning_match: positioningMatch,
      personality_overlap: personalityOverlap,
      perception_risk: perceptionRisk,
      synergy_potential: synergyPotential,
    },
  };
}

/**
 * 브랜드 가치 정렬 점수 계산
 */
function calculateBrandAlignment(
  brandValues: string[],
  eventValues: string[]
): { score: number; matches: string[] } {
  const normalizedBrand = brandValues.map((v) => v.toLowerCase());
  const normalizedEvent = eventValues.map((v) => v.toLowerCase());

  const matches = normalizedBrand.filter(
    (bv) =>
      normalizedEvent.some((ev) => ev.includes(bv) || bv.includes(ev))
  );

  const score = Math.min(
    100,
    (matches.length / Math.max(brandValues.length, eventValues.length)) * 100 + 30
  );

  return {
    score: Math.round(score),
    matches: matches.map(
      (m) => brandValues.find((v) => v.toLowerCase() === m) || m
    ),
  };
}

/**
 * 오디언스 중복 점수 계산
 */
function calculateAudienceOverlap(
  sponsorDemo: z.infer<typeof InputSchema>["sponsor_profile"]["target_demographics"],
  attendeeProfile: z.infer<typeof InputSchema>["event_profile"]["attendee_profile"]
): number {
  let score = 50; // 기준점

  if (!sponsorDemo) return score;

  // 연령대 매칭
  if (sponsorDemo.age_range && attendeeProfile.age_range) {
    if (sponsorDemo.age_range === attendeeProfile.age_range) {
      score += 20;
    }
  }

  // 소득 수준 매칭
  if (sponsorDemo.income_level && attendeeProfile.income_level) {
    if (sponsorDemo.income_level === attendeeProfile.income_level) {
      score += 15;
    }
  }

  // 관심사 매칭
  if (sponsorDemo.interests && attendeeProfile.interests) {
    const overlap = sponsorDemo.interests.filter((i) =>
      attendeeProfile.interests!.some(
        (ai) => ai.toLowerCase().includes(i.toLowerCase())
      )
    );
    score += Math.min(15, overlap.length * 5);
  }

  return Math.min(100, score);
}

/**
 * 이미지 호환성 점수 계산
 */
function calculateImageCompatibility(
  brandImage: string,
  eventTone: string
): number {
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    premium: {
      formal: 95,
      casual: 60,
      innovative: 80,
      educational: 75,
      entertainment: 65,
    },
    mainstream: {
      formal: 70,
      casual: 90,
      innovative: 75,
      educational: 80,
      entertainment: 85,
    },
    budget: {
      formal: 40,
      casual: 85,
      innovative: 50,
      educational: 70,
      entertainment: 80,
    },
    innovative: {
      formal: 70,
      casual: 80,
      innovative: 95,
      educational: 85,
      entertainment: 75,
    },
    traditional: {
      formal: 90,
      casual: 60,
      innovative: 50,
      educational: 80,
      entertainment: 55,
    },
  };

  return compatibilityMatrix[brandImage]?.[eventTone] || 60;
}

/**
 * 리스크 평가 (높을수록 안전)
 */
function assessRisk(
  controversyHistory: string[] | undefined,
  competitorBrands: string[] | undefined,
  existingSponsors: string[] | undefined
): { score: number; factors: z.infer<typeof OutputSchema>["risk_factors"]; conflicts: string[] } {
  let score = 100;
  const factors: z.infer<typeof OutputSchema>["risk_factors"] = [];
  const conflicts: string[] = [];

  // 논란 이력
  if (controversyHistory && controversyHistory.length > 0) {
    score -= controversyHistory.length * 15;
    factors.push({
      factor: `과거 논란 이력 ${controversyHistory.length}건`,
      severity: controversyHistory.length > 2 ? "high" : "medium",
      mitigation: "미디어 모니터링 강화 및 위기 대응 계획 수립",
    });
  }

  // 경쟁사 충돌
  if (competitorBrands && existingSponsors) {
    const conflicting = competitorBrands.filter((cb) =>
      existingSponsors.some(
        (es) =>
          es.toLowerCase().includes(cb.toLowerCase()) ||
          cb.toLowerCase().includes(es.toLowerCase())
      )
    );
    if (conflicting.length > 0) {
      score -= conflicting.length * 20;
      conflicts.push(...conflicting);
      factors.push({
        factor: `경쟁사 충돌: ${conflicting.join(", ")}`,
        severity: "high",
        mitigation: "독점 조항 검토 및 별도 노출 영역 확보",
      });
    }
  }

  return {
    score: Math.max(0, score),
    factors,
    conflicts,
  };
}

/**
 * 종합 등급 결정
 */
function determineGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * 추천 수준 결정
 */
function determineRecommendation(
  score: number,
  riskFactors: z.infer<typeof OutputSchema>["risk_factors"]
): "highly_recommended" | "recommended" | "conditional" | "not_recommended" {
  const hasHighRisk = riskFactors.some((r) => r.severity === "high");

  if (score >= 80 && !hasHighRisk) return "highly_recommended";
  if (score >= 65 && !hasHighRisk) return "recommended";
  if (score >= 50 || (score >= 40 && !hasHighRisk)) return "conditional";
  return "not_recommended";
}

/**
 * 동적 가중치 결정 (이벤트 특성 기반)
 */
function determineWeights(
  eventESG: z.infer<typeof InputSchema>["event_profile"]["esg_requirements"],
  desiredImage: string[] | undefined
): {
  esg: number;
  image: number;
  brand: number;
  audience: number;
  risk: number;
} {
  // 기본 가중치 (ESG와 이미지 비중 상향)
  let weights = {
    esg: 0.25,      // ESG 정렬도 (기존 없음 → 25%)
    image: 0.25,    // 기업 이미지 매칭 (기존 25% 유지)
    brand: 0.20,    // 브랜드 가치 (기존 30% → 20%)
    audience: 0.15, // 오디언스 (기존 25% → 15%)
    risk: 0.15,     // 리스크 (기존 20% → 15%)
  };

  // 이벤트가 ESG를 강력히 중시하면 ESG 가중치 추가 상향
  if (eventESG?.sustainability_focus || eventESG?.carbon_neutral_event) {
    weights = {
      esg: 0.35,      // ESG 최우선
      image: 0.25,
      brand: 0.15,
      audience: 0.12,
      risk: 0.13,
    };
  }

  // 이벤트가 특정 이미지를 강력히 원하면 이미지 가중치 상향
  if (desiredImage && desiredImage.length >= 3) {
    weights.image = Math.min(0.30, weights.image + 0.05);
    weights.brand = Math.max(0.10, weights.brand - 0.05);
  }

  return weights;
}

/**
 * FIN-006 메인 실행 함수 (강화된 ESG + 이미지 분석)
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { sponsor_profile, event_profile } = validatedInput;

  // 동적 가중치 결정
  const weights = determineWeights(
    event_profile.esg_requirements,
    event_profile.desired_sponsor_image
  );

  // 1. ESG 정렬도 분석 (핵심 신규)
  const esgAnalysis = analyzeESGAlignment(
    sponsor_profile.esg_profile,
    event_profile.esg_requirements
  );

  // 2. 기업 이미지 매칭 분석 (강화)
  const imageAnalysis = analyzeCorporateImageMatch(
    sponsor_profile.corporate_image,
    sponsor_profile.brand_image,
    event_profile.event_tone,
    event_profile.desired_sponsor_image
  );

  // 3. 브랜드 가치 정렬 (기존)
  const brandAlignment = calculateBrandAlignment(
    sponsor_profile.brand_values,
    event_profile.event_values
  );

  // 4. 오디언스 중복 (기존)
  const audienceOverlap = calculateAudienceOverlap(
    sponsor_profile.target_demographics,
    event_profile.attendee_profile
  );

  // 5. 레거시 이미지 호환성 (하위 호환)
  const legacyImageCompatibility = calculateImageCompatibility(
    sponsor_profile.brand_image,
    event_profile.event_tone
  );

  // 6. 리스크 평가 (기존)
  const riskAssessment = assessRisk(
    sponsor_profile.controversy_history,
    sponsor_profile.competitor_brands,
    event_profile.existing_sponsors
  );

  // ESG 우려가 있으면 리스크에 추가
  if (esgAnalysis.analysis.esg_concerns.length > 0) {
    for (const concern of esgAnalysis.analysis.esg_concerns) {
      riskAssessment.factors.push({
        factor: `[ESG] ${concern}`,
        severity: esgAnalysis.analysis.alignment_status === "far_below" ? "high" : "medium",
        mitigation: "ESG 개선 계획 요청 또는 스폰서십 조건 조정",
      });
    }
  }

  // 이미지 인식 리스크 추가
  if (imageAnalysis.analysis.perception_risk === "high") {
    riskAssessment.factors.push({
      factor: "[이미지] 대중 인식 리스크 높음",
      severity: "high",
      mitigation: "브랜드 이미지 개선 활동 필요, 부정적 연상 관리",
    });
  }

  // 종합 점수 계산 (새 가중치 적용)
  const overallScore = Math.round(
    esgAnalysis.score * weights.esg +
    imageAnalysis.score * weights.image +
    brandAlignment.score * weights.brand +
    audienceOverlap * weights.audience +
    riskAssessment.score * weights.risk
  );

  // 강점 도출 (ESG, 이미지 우선)
  const strengths: string[] = [];

  // ESG 강점 먼저
  if (esgAnalysis.score >= 75) {
    strengths.push(`ESG 정렬 우수 (${esgAnalysis.score}점)`);
  }
  strengths.push(...esgAnalysis.analysis.esg_strengths);

  // 이미지 강점
  if (imageAnalysis.score >= 75) {
    strengths.push(`기업 이미지 매칭 우수 (${imageAnalysis.score}점)`);
  }
  if (imageAnalysis.analysis.personality_overlap.length > 0) {
    strengths.push(`브랜드 성격 일치: ${imageAnalysis.analysis.personality_overlap.join(", ")}`);
  }

  // 기존 강점
  if (brandAlignment.score >= 70) {
    strengths.push(`브랜드 가치 정렬: ${brandAlignment.matches.join(", ")}`);
  }
  if (audienceOverlap >= 70) {
    strengths.push("타겟 오디언스 높은 중복률");
  }
  if (riskAssessment.score >= 80) {
    strengths.push("낮은 리스크 프로필");
  }

  // 우려 사항 도출 (ESG, 이미지 우선)
  const concerns: string[] = [];

  // ESG 우려 먼저
  if (esgAnalysis.score < 50) {
    concerns.push(`ESG 정렬 미흡 (${esgAnalysis.score}점) - 이벤트 가치와 충돌 우려`);
  }
  concerns.push(...esgAnalysis.analysis.esg_concerns);

  // 이미지 우려
  if (imageAnalysis.score < 50) {
    concerns.push("기업 이미지와 이벤트 포지셔닝 불일치");
  }
  if (imageAnalysis.analysis.perception_risk !== "none") {
    concerns.push(`대중 인식 리스크: ${imageAnalysis.analysis.perception_risk}`);
  }

  // 기존 우려
  if (brandAlignment.score < 50) {
    concerns.push("브랜드 가치와 이벤트 가치 간 정렬 부족");
  }
  if (audienceOverlap < 50) {
    concerns.push("타겟 오디언스 중복 낮음");
  }
  if (riskAssessment.conflicts.length > 0) {
    concerns.push(`경쟁사 스폰서 존재: ${riskAssessment.conflicts.join(", ")}`);
  }

  // 전략적 권고 (ESG/이미지 중심)
  const recommendations: string[] = [];

  // ESG 기반 권고
  if (esgAnalysis.analysis.alignment_status === "exceeds") {
    recommendations.push("ESG 리더십 공동 캠페인 제안 - 양사 가치 시너지 극대화");
  } else if (esgAnalysis.analysis.alignment_status === "below") {
    recommendations.push("ESG 개선 로드맵 공유 요청 후 조건부 협의");
  } else if (esgAnalysis.analysis.alignment_status === "far_below") {
    recommendations.push("⚠️ ESG 미달 - 스폰서십 진행 시 이벤트 이미지 훼손 리스크 존재");
  }

  // 이미지 기반 권고
  if (imageAnalysis.analysis.synergy_potential.includes("높음")) {
    recommendations.push("공동 브랜딩 기회 적극 모색 - 높은 이미지 시너지");
  }

  // 종합 권고
  if (overallScore >= 75) {
    recommendations.push("✅ 적극 추천 - ESG 및 이미지 정합성 우수");
  } else if (overallScore >= 60) {
    recommendations.push("조건부 추천 - 일부 영역 보완 협의 필요");
  } else if (overallScore >= 45) {
    recommendations.push("신중한 검토 필요 - 리스크 대비 효익 분석 권장");
  } else {
    recommendations.push("❌ 비추천 - 가치 정합성 부족, 대안 스폰서 탐색 권장");
  }

  const output: Output = {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    company_name: sponsor_profile.company_name,
    overall_fit_score: overallScore,
    fit_grade: determineGrade(overallScore),
    recommendation: determineRecommendation(overallScore, riskAssessment.factors),
    dimension_scores: {
      brand_alignment: brandAlignment.score,
      audience_overlap: audienceOverlap,
      image_compatibility: legacyImageCompatibility, // 하위 호환
      esg_alignment: esgAnalysis.score,
      corporate_image_match: imageAnalysis.score,
      risk_assessment: riskAssessment.score,
    },
    esg_analysis: esgAnalysis.analysis,
    image_analysis: imageAnalysis.analysis,
    strengths,
    concerns,
    risk_factors: riskAssessment.factors,
    competitor_conflicts: riskAssessment.conflicts,
    strategic_recommendations: recommendations,
    weight_breakdown: {
      esg_weight: Math.round(weights.esg * 100),
      image_weight: Math.round(weights.image * 100),
      brand_weight: Math.round(weights.brand * 100),
      audience_weight: Math.round(weights.audience * 100),
      risk_weight: Math.round(weights.risk * 100),
    },
    analyzed_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-006",
  taskName: "스폰서 적합성 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.d",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
