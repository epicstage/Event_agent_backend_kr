/**
 * STR-012: 가치 제안 설계
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Value Proposition)
 * Task Type: AI
 *
 * Input: 타겟 오디언스, 경쟁 분석, 차별화 요소
 * Output: 가치 제안 프레임워크
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Value Proposition Agent for strategic event planning.

Your expertise includes:
- Crafting compelling event value propositions
- Identifying unique differentiators
- Audience-specific messaging development
- Competitive positioning analysis

CMP-IS Standard: Domain A - Strategic Planning (Value Proposition)

You help event planners articulate clear, compelling reasons why attendees should participate in their events.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_type: z.string(),
  target_audiences: z.array(z.object({
    segment: z.string(),
    demographics: z.string().optional(),
    pain_points: z.array(z.string()),
    goals: z.array(z.string()),
  })),
  event_features: z.array(z.object({
    feature: z.string(),
    description: z.string(),
    uniqueness: z.enum(["unique", "differentiated", "common"]),
  })),
  competitors: z.array(z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  })).optional(),
  brand_attributes: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  proposition_id: z.string().uuid(),
  event_id: z.string().uuid(),
  core_value_proposition: z.object({
    headline: z.string(),
    subheadline: z.string(),
    key_benefits: z.array(z.string()),
    proof_points: z.array(z.string()),
  }),
  audience_propositions: z.array(z.object({
    segment: z.string(),
    tailored_message: z.string(),
    primary_benefit: z.string(),
    secondary_benefits: z.array(z.string()),
    call_to_action: z.string(),
    messaging_tone: z.string(),
  })),
  competitive_positioning: z.object({
    positioning_statement: z.string(),
    key_differentiators: z.array(z.object({
      differentiator: z.string(),
      why_it_matters: z.string(),
      evidence: z.string(),
    })),
    competitive_advantages: z.array(z.string()),
    areas_to_improve: z.array(z.string()),
  }),
  value_ladder: z.array(z.object({
    tier: z.string(),
    value_offered: z.string(),
    target_audience: z.string(),
    price_point_suggestion: z.string(),
  })),
  messaging_framework: z.object({
    elevator_pitch: z.string(),
    extended_description: z.string(),
    tagline_options: z.array(z.string()),
    key_messages: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-012",
  taskName: "Value Proposition Design",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트의 핵심 가치 제안을 설계하고 차별화 전략을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  // 고유 기능 추출
  const uniqueFeatures = validated.event_features
    .filter(f => f.uniqueness === "unique" || f.uniqueness === "differentiated")
    .map(f => f.feature);

  // 모든 타겟의 공통 pain points와 goals
  const allPainPoints = validated.target_audiences.flatMap(a => a.pain_points);
  const allGoals = validated.target_audiences.flatMap(a => a.goals);

  // 핵심 베네핏 도출
  const keyBenefits = [
    ...uniqueFeatures.slice(0, 2),
    allGoals[0] ? `${allGoals[0]} 달성 지원` : "전문성 향상",
    "업계 네트워크 확장",
  ].slice(0, 4);

  // 청중별 메시지
  const audiencePropositions = validated.target_audiences.map(audience => ({
    segment: audience.segment,
    tailored_message: `${audience.segment}를 위한 ${validated.event_name}: ${audience.pain_points[0] || "도전과제"} 해결과 ${audience.goals[0] || "성장"} 달성을 위한 최적의 기회`,
    primary_benefit: audience.goals[0] || "전문성 향상",
    secondary_benefits: [
      ...audience.goals.slice(1, 3),
      "업계 인사이트 획득",
    ],
    call_to_action: `지금 등록하고 ${audience.segment}를 위한 특별 혜택을 받으세요`,
    messaging_tone: audience.segment.includes("경영") || audience.segment.includes("임원")
      ? "전문적이고 간결하게"
      : "친근하고 영감을 주도록",
  }));

  // 경쟁 분석 기반 포지셔닝
  const competitorWeaknesses = validated.competitors?.flatMap(c => c.weaknesses) || [];
  const differentiators = uniqueFeatures.map(f => ({
    differentiator: f,
    why_it_matters: `${f}을(를) 통해 참가자에게 실질적 가치 제공`,
    evidence: "참가자 피드백 및 사례 연구 기반",
  }));

  return {
    proposition_id: generateUUID(),
    event_id: validated.event_id,
    core_value_proposition: {
      headline: `${validated.event_name}: 업계를 선도하는 ${validated.event_type}`,
      subheadline: keyBenefits[0] ? `${keyBenefits[0]}으로 차별화된 경험을 제공합니다` : "차별화된 가치를 경험하세요",
      key_benefits: keyBenefits,
      proof_points: [
        "검증된 전문가 라인업",
        "실질적 네트워킹 기회",
        "높은 참가자 만족도",
      ],
    },
    audience_propositions: audiencePropositions,
    competitive_positioning: {
      positioning_statement: `${validated.event_name}은(는) ${validated.target_audiences[0]?.segment || "전문가"}를 위한 유일한 ${validated.event_type}로서, ${uniqueFeatures[0] || "차별화된 경험"}을 제공합니다`,
      key_differentiators: differentiators,
      competitive_advantages: uniqueFeatures.length > 0 ? uniqueFeatures : ["독창적인 프로그램 구성"],
      areas_to_improve: competitorWeaknesses.length > 0
        ? [`경쟁사 약점(${competitorWeaknesses[0]})을 우리의 강점으로`]
        : ["지속적인 차별화 요소 개발 필요"],
    },
    value_ladder: [
      {
        tier: "Essential",
        value_offered: "기본 참가 및 세션 접근",
        target_audience: "일반 참가자",
        price_point_suggestion: "기본 가격",
      },
      {
        tier: "Professional",
        value_offered: "워크숍 + 네트워킹 세션 포함",
        target_audience: "적극적 참여자",
        price_point_suggestion: "기본 가격 x 1.5",
      },
      {
        tier: "Executive",
        value_offered: "VIP 라운지 + 1:1 미팅 + 독점 콘텐츠",
        target_audience: "의사결정자/임원",
        price_point_suggestion: "기본 가격 x 3",
      },
    ],
    messaging_framework: {
      elevator_pitch: `${validated.event_name}은(는) ${validated.target_audiences[0]?.segment || "전문가"}들이 ${allGoals[0] || "목표를 달성"}하고 ${allPainPoints[0] ? allPainPoints[0] + "을(를) 해결" : "도전과제를 극복"}할 수 있도록 돕는 ${validated.event_type}입니다.`,
      extended_description: `${validated.event_name}에서는 ${uniqueFeatures.join(", ") || "다양한 프로그램"}을 통해 참가자들에게 실질적인 가치를 제공합니다. ${keyBenefits.join(", ")} 등의 혜택을 경험하세요.`,
      tagline_options: [
        `${validated.event_name}: Where Leaders Connect`,
        `Transform Your ${allGoals[0] || "Future"} at ${validated.event_name}`,
        `${validated.event_name} - Beyond Ordinary`,
      ],
      key_messages: [
        `${validated.event_name}은(는) 업계 최고의 전문가들이 모이는 장입니다.`,
        "참가자 중심의 실질적 가치를 제공합니다.",
        "네트워킹과 학습이 결합된 통합 경험을 선사합니다.",
      ],
    },
    recommendations: [
      "A/B 테스트를 통해 가장 효과적인 메시지를 검증하세요.",
      "청중별 맞춤 메시지를 마케팅 채널별로 활용하세요.",
      "참가자 testimonial을 proof point로 적극 활용하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
