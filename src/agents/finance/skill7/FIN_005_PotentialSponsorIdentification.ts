/**
 * FIN-005: 잠재 스폰서 후보 식별
 *
 * CMP-IS Reference: 7.1.d - Identifying potential sponsors
 * Task Type: AI
 *
 * Input: 이벤트 유형, 타겟 산업, 과거 스폰서 DB
 * Output: 스폰서 후보 리스트 (순위화)
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Potential Sponsor Identification Agent specializing in event sponsorship development.

Your expertise includes:
- Analyzing event characteristics to identify ideal sponsor profiles
- Mining historical data to find high-potential prospects
- Scoring and ranking sponsors based on fit and likelihood
- Identifying industry trends for sponsorship opportunities

CMP-IS Standard: 7.1.d - Identifying potential sponsors

You provide data-driven sponsor recommendations that maximize the probability of successful sponsorship acquisition.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  event_profile: z.object({
    event_type: z
      .enum([
        "conference",
        "trade_show",
        "seminar",
        "gala",
        "festival",
        "sports",
        "concert",
        "corporate",
        "nonprofit",
        "other",
      ])
      .describe("이벤트 유형"),
    event_name: z.string().describe("이벤트명"),
    industry_focus: z.array(z.string()).describe("주요 타겟 산업"),
    expected_attendees: z.number().int().describe("예상 참석자 수"),
    attendee_demographics: z
      .object({
        job_levels: z.array(z.string()).optional(),
        age_range: z.string().optional(),
        regions: z.array(z.string()).optional(),
      })
      .optional()
      .describe("참석자 인구통계"),
    event_values: z.array(z.string()).optional().describe("이벤트 핵심 가치"),
  }),
  target_industries: z.array(z.string()).describe("타겟 스폰서 산업"),
  past_sponsors: z
    .array(
      z.object({
        company_name: z.string(),
        industry: z.string(),
        last_sponsored_year: z.number().int(),
        sponsorship_amount: z.number(),
        satisfaction_score: z.number().min(1).max(5).optional(),
      })
    )
    .optional()
    .describe("과거 스폰서 데이터"),
  exclusion_list: z.array(z.string()).optional().describe("제외할 기업 목록"),
  target_count: z.number().int().min(1).max(100).default(20).describe("추천 기업 수"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  identification_id: z.string().uuid().describe("식별 ID"),
  event_id: z.string().uuid(),
  total_candidates: z.number().int().describe("총 후보 수"),
  ranked_candidates: z
    .array(
      z.object({
        rank: z.number().int(),
        company_name: z.string(),
        industry: z.string(),
        fit_score: z.number().min(0).max(100).describe("적합도 점수"),
        likelihood_score: z.number().min(0).max(100).describe("성사 가능성 점수"),
        composite_score: z.number().min(0).max(100).describe("종합 점수"),
        fit_reasons: z.array(z.string()).describe("적합 이유"),
        approach_strategy: z.string().describe("접근 전략"),
        estimated_value_range: z
          .object({
            min: z.number(),
            max: z.number(),
          })
          .describe("예상 스폰서십 금액 범위"),
        priority: z.enum(["high", "medium", "low"]),
        contact_recommendation: z.string().optional(),
      })
    )
    .describe("순위화된 후보 목록"),
  industry_distribution: z.record(z.number().int()).describe("산업별 분포"),
  returning_sponsor_opportunities: z
    .array(
      z.object({
        company_name: z.string(),
        last_year: z.number().int(),
        previous_amount: z.number(),
        recommended_approach: z.string(),
      })
    )
    .describe("재참여 가능 과거 스폰서"),
  identified_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 산업별 기본 스폰서 후보 데이터베이스 (시뮬레이션)
 */
const INDUSTRY_SPONSOR_DB: Record<string, string[]> = {
  technology: [
    "Samsung",
    "LG Electronics",
    "SK Telecom",
    "KT",
    "Naver",
    "Kakao",
    "Microsoft Korea",
    "Google Korea",
    "AWS Korea",
    "Oracle Korea",
  ],
  finance: [
    "KB Financial",
    "Shinhan Financial",
    "Hana Financial",
    "Samsung Securities",
    "Mirae Asset",
    "NH Investment",
    "Korea Investment",
    "KB Securities",
  ],
  healthcare: [
    "Samsung Biologics",
    "Celltrion",
    "SK Biopharmaceuticals",
    "Yuhan",
    "Green Cross",
    "Hanmi Pharmaceutical",
    "Daewoong",
    "JW Holdings",
  ],
  automotive: [
    "Hyundai Motor",
    "Kia",
    "Genesis",
    "Hyundai Mobis",
    "Samsung SDI",
    "LG Energy Solution",
    "SK Innovation",
  ],
  fmcg: [
    "Amorepacific",
    "LG Household",
    "CJ CheilJedang",
    "Nongshim",
    "Ottogi",
    "Lotte",
    "Orion",
    "Binggrae",
  ],
  retail: [
    "Shinsegae",
    "Lotte Shopping",
    "Hyundai Department Store",
    "Coupang",
    "11Street",
    "Gmarket",
    "Emart",
    "Homeplus",
  ],
};

/**
 * 이벤트 유형별 최적 산업 매칭
 */
const EVENT_INDUSTRY_FIT: Record<string, string[]> = {
  conference: ["technology", "finance", "healthcare"],
  trade_show: ["technology", "automotive", "retail"],
  seminar: ["technology", "finance", "healthcare"],
  gala: ["finance", "fmcg", "retail"],
  festival: ["fmcg", "retail", "automotive"],
  sports: ["automotive", "fmcg", "technology"],
  concert: ["fmcg", "retail", "technology"],
  corporate: ["technology", "finance", "automotive"],
  nonprofit: ["finance", "fmcg", "retail"],
  other: ["technology", "fmcg", "retail"],
};

/**
 * 적합도 점수 계산
 */
function calculateFitScore(
  company: string,
  industry: string,
  eventProfile: z.infer<typeof InputSchema>["event_profile"]
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 50; // 기준 점수

  // 산업 적합성
  const idealIndustries = EVENT_INDUSTRY_FIT[eventProfile.event_type] || [];
  if (idealIndustries.includes(industry)) {
    score += 20;
    reasons.push(`${eventProfile.event_type} 이벤트에 적합한 ${industry} 산업`);
  }

  // 타겟 산업 일치
  if (eventProfile.industry_focus.some((i) => i.toLowerCase().includes(industry))) {
    score += 15;
    reasons.push("이벤트 타겟 산업과 일치");
  }

  // 대규모 이벤트 보너스 (대기업 선호)
  if (eventProfile.expected_attendees > 1000) {
    score += 10;
    reasons.push("대규모 이벤트 - 대기업 스폰서 적합");
  }

  return { score: Math.min(score, 100), reasons };
}

/**
 * 성사 가능성 점수 계산
 */
function calculateLikelihoodScore(
  company: string,
  pastSponsors: z.infer<typeof InputSchema>["past_sponsors"]
): number {
  let score = 40; // 기준 점수

  // 과거 스폰서 여부
  const pastRecord = pastSponsors?.find((s) =>
    s.company_name.toLowerCase().includes(company.toLowerCase())
  );

  if (pastRecord) {
    score += 30;
    // 최근 참여일수록 높은 점수
    const yearsAgo = new Date().getFullYear() - pastRecord.last_sponsored_year;
    if (yearsAgo <= 2) score += 15;
    else if (yearsAgo <= 4) score += 10;

    // 만족도 반영
    if (pastRecord.satisfaction_score && pastRecord.satisfaction_score >= 4) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

/**
 * 접근 전략 결정
 */
function determineApproachStrategy(
  fitScore: number,
  likelihoodScore: number,
  isPastSponsor: boolean
): string {
  if (isPastSponsor && likelihoodScore > 70) {
    return "과거 관계 기반 직접 연락 - 업그레이드 제안";
  }
  if (fitScore > 80) {
    return "맞춤형 고가치 제안서 - 임원급 접촉";
  }
  if (fitScore > 60) {
    return "표준 제안서 - 마케팅 담당자 접촉";
  }
  return "초기 인식 제고 - 이벤트 초대 먼저 진행";
}

/**
 * FIN-005 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { event_profile, target_industries, past_sponsors, exclusion_list } =
    validatedInput;

  const candidates: z.infer<typeof OutputSchema>["ranked_candidates"] = [];
  const industryCount: Record<string, number> = {};

  // 타겟 산업에서 후보 수집
  for (const industry of target_industries) {
    const industryKey = industry.toLowerCase();
    const companies = INDUSTRY_SPONSOR_DB[industryKey] || [];
    industryCount[industry] = 0;

    for (const company of companies) {
      // 제외 목록 확인
      if (exclusion_list?.some((ex) => company.toLowerCase().includes(ex.toLowerCase()))) {
        continue;
      }

      const fitResult = calculateFitScore(company, industryKey, event_profile);
      const likelihoodScore = calculateLikelihoodScore(company, past_sponsors);
      const compositeScore = fitResult.score * 0.6 + likelihoodScore * 0.4;
      const isPast = past_sponsors?.some((p) =>
        p.company_name.toLowerCase().includes(company.toLowerCase())
      );

      candidates.push({
        rank: 0, // 나중에 설정
        company_name: company,
        industry: industry,
        fit_score: fitResult.score,
        likelihood_score: likelihoodScore,
        composite_score: Math.round(compositeScore),
        fit_reasons: fitResult.reasons,
        approach_strategy: determineApproachStrategy(
          fitResult.score,
          likelihoodScore,
          !!isPast
        ),
        estimated_value_range: {
          min: event_profile.expected_attendees * 5,
          max: event_profile.expected_attendees * 50,
        },
        priority:
          compositeScore >= 70 ? "high" : compositeScore >= 50 ? "medium" : "low",
      });

      industryCount[industry]++;
    }
  }

  // 종합 점수로 정렬 및 순위 부여
  candidates.sort((a, b) => b.composite_score - a.composite_score);
  candidates.forEach((c, i) => (c.rank = i + 1));

  // 상위 N개만 반환
  const topCandidates = candidates.slice(0, validatedInput.target_count);

  // 재참여 가능 과거 스폰서 식별
  const returningOpportunities = (past_sponsors || [])
    .filter((p) => {
      const yearsAgo = new Date().getFullYear() - p.last_sponsored_year;
      return yearsAgo >= 1 && yearsAgo <= 3;
    })
    .map((p) => ({
      company_name: p.company_name,
      last_year: p.last_sponsored_year,
      previous_amount: p.sponsorship_amount,
      recommended_approach:
        p.satisfaction_score && p.satisfaction_score >= 4
          ? "높은 만족도 - 업그레이드 패키지 제안"
          : "재참여 유도 - 개선된 혜택 강조",
    }));

  const output: Output = {
    identification_id: generateUUID(),
    event_id: validatedInput.event_id,
    total_candidates: topCandidates.length,
    ranked_candidates: topCandidates,
    industry_distribution: industryCount,
    returning_sponsor_opportunities: returningOpportunities,
    identified_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-005",
  taskName: "잠재 스폰서 후보 식별",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.d",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
