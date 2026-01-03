/**
 * STR-052: 가치 제안 설계
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Value Proposition)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Value Proposition Agent for event planning.

Your expertise includes:
- Value proposition canvas development
- Customer jobs-to-be-done analysis
- Gain creators and pain relievers identification
- Unique value articulation

CMP-IS Standard: Domain A - Strategic Planning (Value Proposition)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  target_segments: z.array(z.object({
    segment_name: z.string(),
    segment_profile: z.string(),
    key_needs: z.array(z.string()),
  })),
  event_offering: z.object({
    core_offering: z.string(),
    features: z.array(z.string()),
    differentiators: z.array(z.string()).optional(),
  }),
  competitive_context: z.object({
    alternatives: z.array(z.string()).optional(),
    competitive_advantages: z.array(z.string()).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  value_proposition_id: z.string().uuid(),
  event_id: z.string().uuid(),
  value_proposition_canvas: z.array(z.object({
    segment: z.string(),
    customer_profile: z.object({
      jobs_to_be_done: z.array(z.object({
        job: z.string(),
        job_type: z.enum(["functional", "social", "emotional"]),
        importance: z.enum(["critical", "high", "medium", "low"]),
      })),
      pains: z.array(z.object({
        pain: z.string(),
        severity: z.enum(["extreme", "severe", "moderate", "mild"]),
      })),
      gains: z.array(z.object({
        gain: z.string(),
        type: z.enum(["required", "expected", "desired", "unexpected"]),
      })),
    }),
    value_map: z.object({
      pain_relievers: z.array(z.object({
        reliever: z.string(),
        addressed_pain: z.string(),
        effectiveness: z.enum(["high", "medium", "low"]),
      })),
      gain_creators: z.array(z.object({
        creator: z.string(),
        created_gain: z.string(),
        impact: z.enum(["high", "medium", "low"]),
      })),
      products_services: z.array(z.string()),
    }),
    fit_assessment: z.object({
      fit_score: z.number(),
      fit_level: z.enum(["problem_solution_fit", "product_market_fit", "no_fit"]),
      gaps: z.array(z.string()),
    }),
  })),
  unified_value_proposition: z.object({
    headline: z.string(),
    subheadline: z.string(),
    key_benefits: z.array(z.object({
      benefit: z.string(),
      supporting_feature: z.string(),
    })),
    proof_points: z.array(z.string()),
    unique_differentiator: z.string(),
  }),
  value_messaging: z.array(z.object({
    segment: z.string(),
    primary_message: z.string(),
    supporting_messages: z.array(z.string()),
    call_to_action: z.string(),
    channels: z.array(z.string()),
  })),
  competitive_positioning: z.object({
    positioning_statement: z.string(),
    competitive_advantages: z.array(z.object({
      advantage: z.string(),
      sustainability: z.enum(["high", "medium", "low"]),
    })),
    positioning_map: z.object({
      x_axis: z.string(),
      y_axis: z.string(),
      our_position: z.string(),
    }),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-052",
  taskName: "Value Proposition",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "이벤트의 가치 제안을 설계하고 차별화 전략을 수립합니다.",
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

  const { target_segments, event_offering, event_name, competitive_context } = validated;

  const canvases = target_segments.map(segment => {
    const jobs = segment.key_needs.map((need, idx) => ({
      job: need,
      job_type: idx === 0 ? "functional" as const : idx === 1 ? "social" as const : "emotional" as const,
      importance: idx === 0 ? "critical" as const : "high" as const,
    }));

    const pains = [
      { pain: "시간과 비용 대비 가치 불확실", severity: "severe" as const },
      { pain: "원하는 정보/경험 접근 어려움", severity: "moderate" as const },
    ];

    const gains = [
      { gain: "전문 지식 습득", type: "expected" as const },
      { gain: "네트워킹 기회", type: "desired" as const },
      { gain: "영감과 동기 부여", type: "unexpected" as const },
    ];

    const painRelievers = event_offering.features.slice(0, 2).map((feature, idx) => ({
      reliever: feature,
      addressed_pain: pains[idx % pains.length].pain,
      effectiveness: "high" as const,
    }));

    const gainCreators = event_offering.features.slice(0, 3).map((feature, idx) => ({
      creator: feature,
      created_gain: gains[idx % gains.length].gain,
      impact: "high" as const,
    }));

    const fitScore = Math.round(70 + Math.random() * 25);
    const fitLevel = fitScore >= 80 ? "product_market_fit" as const :
                     fitScore >= 60 ? "problem_solution_fit" as const : "no_fit" as const;

    return {
      segment: segment.segment_name,
      customer_profile: {
        jobs_to_be_done: jobs,
        pains,
        gains,
      },
      value_map: {
        pain_relievers: painRelievers,
        gain_creators: gainCreators,
        products_services: event_offering.features,
      },
      fit_assessment: {
        fit_score: fitScore,
        fit_level: fitLevel,
        gaps: fitScore < 80 ? ["일부 니즈 추가 대응 필요"] : [],
      },
    };
  });

  const differentiators = event_offering.differentiators || ["차별화된 경험", "전문성"];

  return {
    value_proposition_id: generateUUID(),
    event_id: validated.event_id,
    value_proposition_canvas: canvases,
    unified_value_proposition: {
      headline: `${event_name}: ${differentiators[0]}을(를) 경험하세요`,
      subheadline: `${target_segments[0]?.key_needs[0] || "핵심 니즈"}를 해결하는 최적의 기회`,
      key_benefits: event_offering.features.slice(0, 3).map(feature => ({
        benefit: `${feature}을(를) 통한 가치 창출`,
        supporting_feature: feature,
      })),
      proof_points: ["업계 전문가 참여", "검증된 프로그램", "높은 만족도"],
      unique_differentiator: differentiators[0] || event_offering.core_offering,
    },
    value_messaging: target_segments.map(segment => ({
      segment: segment.segment_name,
      primary_message: `${segment.segment_name}를 위한 ${event_name}`,
      supporting_messages: [
        `${segment.key_needs[0]} 해결`,
        "검증된 가치 제공",
        "특별한 경험",
      ],
      call_to_action: "지금 참여하세요",
      channels: ["이메일", "SNS", "웹사이트", "파트너 채널"],
    })),
    competitive_positioning: {
      positioning_statement: `${event_name}은(는) ${target_segments.map(s => s.segment_name).join(", ")}을(를) 위해 ${event_offering.core_offering}을(를) 제공하여 ${differentiators[0]}을(를) 실현합니다.`,
      competitive_advantages: (competitive_context?.competitive_advantages || differentiators).map(adv => ({
        advantage: adv,
        sustainability: "high" as const,
      })),
      positioning_map: {
        x_axis: "가격/접근성",
        y_axis: "품질/전문성",
        our_position: "고품질-합리적 가격 영역",
      },
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
