/**
 * FIN-011: 스폰서 지원 유형 파악
 *
 * CMP-IS Reference: 7.1.g - Negotiating with potential sponsors
 * Task Type: Human (AI 보조)
 *
 * Input: 스폰서 미팅 노트
 * Output: 현금/할인/제품 지원 유형
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an AI Assistant for Sponsor Support Type Identification.

Your role is to:
- Analyze meeting notes to identify sponsor support preferences
- Categorize support types (cash, discount, in-kind)
- Estimate values for different support types
- Recommend optimal support mix for both parties

CMP-IS Standard: 7.1.g - Negotiating with potential sponsors

IMPORTANT: This is a HUMAN task. You assist with analysis and categorization, but confirmation of support types must be done through human negotiation.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  sponsor_id: z.string().uuid().describe("스폰서 ID"),
  meeting_notes: z.object({
    meeting_date: z.string().describe("미팅 일자"),
    attendees: z.array(z.string()).describe("참석자 목록"),
    duration_minutes: z.number().int().describe("미팅 시간 (분)"),
    notes_content: z.string().describe("미팅 노트 내용"),
    discussed_topics: z.array(z.string()).optional().describe("논의 주제"),
    sponsor_interests: z.array(z.string()).optional().describe("스폰서 관심사"),
    sponsor_concerns: z.array(z.string()).optional().describe("스폰서 우려사항"),
    mentioned_budget: z.number().optional().describe("언급된 예산"),
    mentioned_products: z.array(z.string()).optional().describe("언급된 제품/서비스"),
  }),
  sponsor_company_info: z.object({
    company_name: z.string(),
    industry: z.string(),
    main_products: z.array(z.string()).optional(),
    typical_sponsorship_style: z.string().optional(),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid().describe("분석 ID"),
  event_id: z.string().uuid(),
  sponsor_id: z.string().uuid(),
  identified_support_types: z
    .array(
      z.object({
        support_type: z.enum(["cash", "discount", "in_kind", "service", "media"]),
        support_name: z.string().describe("지원 명칭"),
        description: z.string().describe("설명"),
        estimated_value: z.number().describe("예상 가치"),
        confidence: z.enum(["high", "medium", "low"]).describe("식별 신뢰도"),
        evidence: z.array(z.string()).describe("근거 (미팅 노트에서)"),
        feasibility: z.enum(["confirmed", "likely", "possible", "unlikely"]),
      })
    )
    .describe("식별된 지원 유형"),
  support_mix_analysis: z.object({
    total_estimated_value: z.number().describe("총 예상 가치"),
    cash_percentage: z.number().describe("현금 비율 (%)"),
    in_kind_percentage: z.number().describe("현물 비율 (%)"),
    recommended_mix: z.string().describe("권장 지원 조합"),
  }),
  sponsor_preferences: z.object({
    preferred_visibility: z.array(z.string()).describe("선호 노출 방식"),
    preferred_activation: z.array(z.string()).describe("선호 활성화 방식"),
    budget_sensitivity: z.enum(["low", "medium", "high"]).describe("예산 민감도"),
    decision_timeline: z.string().optional().describe("의사결정 타임라인"),
  }),
  negotiation_recommendations: z.array(z.string()).describe("협상 권고사항"),
  follow_up_questions: z.array(z.string()).describe("추가 확인 필요 사항"),
  analyzed_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 키워드 기반 지원 유형 감지
 */
const SUPPORT_TYPE_KEYWORDS: Record<
  string,
  { type: string; keywords: string[]; weight: number }
> = {
  cash: {
    type: "cash",
    keywords: [
      "현금",
      "금액",
      "투자",
      "예산",
      "원",
      "달러",
      "USD",
      "KRW",
      "비용",
      "지불",
      "후원금",
    ],
    weight: 1,
  },
  discount: {
    type: "discount",
    keywords: ["할인", "특가", "프로모션", "리베이트", "가격 인하", "discount"],
    weight: 0.8,
  },
  in_kind: {
    type: "in_kind",
    keywords: [
      "제품",
      "물품",
      "현물",
      "샘플",
      "굿즈",
      "기기",
      "장비",
      "물자",
      "협찬품",
    ],
    weight: 0.9,
  },
  service: {
    type: "service",
    keywords: [
      "서비스",
      "인력",
      "기술 지원",
      "컨설팅",
      "교육",
      "운영 지원",
      "인프라",
    ],
    weight: 0.85,
  },
  media: {
    type: "media",
    keywords: [
      "미디어",
      "광고",
      "홍보",
      "마케팅 지원",
      "채널",
      "노출",
      "매체",
      "언론",
    ],
    weight: 0.8,
  },
};

/**
 * 노트에서 지원 유형 감지
 */
function detectSupportTypes(
  notesContent: string,
  mentionedProducts: string[] | undefined,
  mentionedBudget: number | undefined
): z.infer<typeof OutputSchema>["identified_support_types"] {
  const detected: z.infer<typeof OutputSchema>["identified_support_types"] = [];
  const contentLower = notesContent.toLowerCase();

  // 키워드 기반 감지
  for (const [key, config] of Object.entries(SUPPORT_TYPE_KEYWORDS)) {
    const matchedKeywords = config.keywords.filter((kw) =>
      contentLower.includes(kw.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      const confidence =
        matchedKeywords.length >= 3
          ? "high"
          : matchedKeywords.length >= 2
          ? "medium"
          : "low";

      detected.push({
        support_type: config.type as any,
        support_name: `${key} 지원`,
        description: `미팅에서 ${matchedKeywords.join(", ")} 관련 논의`,
        estimated_value: 0, // 나중에 계산
        confidence,
        evidence: matchedKeywords.map((kw) => `키워드 감지: "${kw}"`),
        feasibility: confidence === "high" ? "likely" : "possible",
      });
    }
  }

  // 현금 예산이 언급된 경우
  if (mentionedBudget && mentionedBudget > 0) {
    const existingCash = detected.find((d) => d.support_type === "cash");
    if (existingCash) {
      existingCash.estimated_value = mentionedBudget;
      existingCash.confidence = "high";
      existingCash.feasibility = "confirmed";
      existingCash.evidence.push(`언급된 예산: ${mentionedBudget.toLocaleString()}`);
    } else {
      detected.push({
        support_type: "cash",
        support_name: "현금 지원",
        description: "미팅에서 구체적 예산 언급",
        estimated_value: mentionedBudget,
        confidence: "high",
        evidence: [`언급된 예산: ${mentionedBudget.toLocaleString()}`],
        feasibility: "confirmed",
      });
    }
  }

  // 제품이 언급된 경우
  if (mentionedProducts && mentionedProducts.length > 0) {
    const existingInKind = detected.find((d) => d.support_type === "in_kind");
    if (existingInKind) {
      existingInKind.evidence.push(
        ...mentionedProducts.map((p) => `언급된 제품: ${p}`)
      );
      existingInKind.confidence = "high";
    } else {
      detected.push({
        support_type: "in_kind",
        support_name: "현물 지원",
        description: `언급된 제품: ${mentionedProducts.join(", ")}`,
        estimated_value: mentionedProducts.length * 500, // 대략적 추정
        confidence: "medium",
        evidence: mentionedProducts.map((p) => `언급된 제품: ${p}`),
        feasibility: "likely",
      });
    }
  }

  return detected;
}

/**
 * 스폰서 선호도 분석
 */
function analyzePreferences(
  interests: string[] | undefined,
  concerns: string[] | undefined,
  notesContent: string
): z.infer<typeof OutputSchema>["sponsor_preferences"] {
  const contentLower = notesContent.toLowerCase();

  // 선호 노출 방식 감지
  const visibilityOptions = [
    "로고 노출",
    "부스 운영",
    "세션 후원",
    "앱 배너",
    "네이밍 라이츠",
    "현수막",
    "브로셔",
  ];
  const preferredVisibility = visibilityOptions.filter((opt) =>
    contentLower.includes(opt.toLowerCase().replace(" ", ""))
  );

  // 선호 활성화 방식 감지
  const activationOptions = [
    "제품 시연",
    "샘플링",
    "네트워킹",
    "강연",
    "워크샵",
    "경품 행사",
  ];
  const preferredActivation = activationOptions.filter((opt) =>
    contentLower.includes(opt.toLowerCase())
  );

  // 예산 민감도 감지
  let budgetSensitivity: "low" | "medium" | "high" = "medium";
  if (
    contentLower.includes("예산 제한") ||
    contentLower.includes("비용 민감") ||
    contentLower.includes("저렴")
  ) {
    budgetSensitivity = "high";
  } else if (
    contentLower.includes("투자 여력") ||
    contentLower.includes("예산 충분")
  ) {
    budgetSensitivity = "low";
  }

  // 타임라인 감지
  let timeline: string | undefined;
  if (contentLower.includes("이번 분기") || contentLower.includes("빠른 결정")) {
    timeline = "1개월 이내";
  } else if (contentLower.includes("다음 달") || contentLower.includes("검토 후")) {
    timeline = "1-2개월";
  } else if (contentLower.includes("내년") || contentLower.includes("장기 검토")) {
    timeline = "3개월 이상";
  }

  return {
    preferred_visibility:
      preferredVisibility.length > 0 ? preferredVisibility : ["미확인 - 추가 논의 필요"],
    preferred_activation:
      preferredActivation.length > 0 ? preferredActivation : ["미확인 - 추가 논의 필요"],
    budget_sensitivity: budgetSensitivity,
    decision_timeline: timeline,
  };
}

/**
 * FIN-011 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { meeting_notes, sponsor_company_info, currency } = validatedInput;

  // 지원 유형 감지
  const identifiedTypes = detectSupportTypes(
    meeting_notes.notes_content,
    meeting_notes.mentioned_products,
    meeting_notes.mentioned_budget
  );

  // 총 가치 계산
  const totalValue = identifiedTypes.reduce((sum, t) => sum + t.estimated_value, 0);
  const cashValue = identifiedTypes
    .filter((t) => t.support_type === "cash")
    .reduce((sum, t) => sum + t.estimated_value, 0);
  const inKindValue = identifiedTypes
    .filter((t) => t.support_type !== "cash")
    .reduce((sum, t) => sum + t.estimated_value, 0);

  // 지원 조합 분석
  const supportMixAnalysis = {
    total_estimated_value: totalValue,
    cash_percentage: totalValue > 0 ? Math.round((cashValue / totalValue) * 100) : 0,
    in_kind_percentage: totalValue > 0 ? Math.round((inKindValue / totalValue) * 100) : 0,
    recommended_mix:
      cashValue > inKindValue
        ? "현금 중심 스폰서십 - 유연한 혜택 설계 가능"
        : inKindValue > 0
        ? "현물 중심 스폰서십 - 제품 연계 활성화 프로그램 권장"
        : "지원 유형 미확정 - 추가 협의 필요",
  };

  // 선호도 분석
  const sponsorPreferences = analyzePreferences(
    meeting_notes.sponsor_interests,
    meeting_notes.sponsor_concerns,
    meeting_notes.notes_content
  );

  // 협상 권고사항
  const recommendations: string[] = [];
  if (sponsorPreferences.budget_sensitivity === "high") {
    recommendations.push("단계별 참여 옵션 또는 분할 결제 제안 고려");
  }
  if (identifiedTypes.some((t) => t.support_type === "in_kind")) {
    recommendations.push("현물 지원의 정확한 시장 가치 산정 필요");
  }
  if (identifiedTypes.length === 0) {
    recommendations.push("후속 미팅에서 구체적인 지원 방식 논의 필요");
  }
  if (meeting_notes.sponsor_concerns && meeting_notes.sponsor_concerns.length > 0) {
    recommendations.push(
      `우려사항 해소 필요: ${meeting_notes.sponsor_concerns.join(", ")}`
    );
  }

  // 추가 확인 필요 사항
  const followUpQuestions: string[] = [];
  if (!meeting_notes.mentioned_budget) {
    followUpQuestions.push("구체적인 예산 범위 확인");
  }
  if (identifiedTypes.filter((t) => t.confidence === "low").length > 0) {
    followUpQuestions.push("지원 유형별 세부 내용 확인");
  }
  followUpQuestions.push("의사결정 프로세스 및 타임라인 확인");
  followUpQuestions.push("최종 승인자 확인");

  const output: Output = {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    sponsor_id: validatedInput.sponsor_id,
    identified_support_types: identifiedTypes,
    support_mix_analysis: supportMixAnalysis,
    sponsor_preferences: sponsorPreferences,
    negotiation_recommendations: recommendations,
    follow_up_questions: followUpQuestions,
    analyzed_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-011",
  taskName: "스폰서 지원 유형 파악",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 7.1.g",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
