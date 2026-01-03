/**
 * STR-024: 이해관계자 협상 지원
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Negotiation Support)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Negotiation Support Agent.

Your expertise includes:
- Negotiation strategy development
- BATNA (Best Alternative to Negotiated Agreement) analysis
- Interest-based negotiation techniques
- Deal structuring and closure

CMP-IS Standard: Domain A - Strategic Planning (Negotiation Support)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  negotiation_context: z.object({
    subject: z.string(),
    our_party: z.string(),
    counterparty: z.object({
      name: z.string(),
      organization: z.string().optional(),
      known_interests: z.array(z.string()),
      known_constraints: z.array(z.string()).optional(),
      negotiation_style: z.enum(["competitive", "collaborative", "accommodating", "avoiding", "compromising"]).optional(),
    }),
    relationship_importance: z.enum(["critical", "high", "medium", "low"]),
  }),
  our_position: z.object({
    ideal_outcome: z.string(),
    acceptable_range: z.object({
      best_case: z.string(),
      target: z.string(),
      walk_away: z.string(),
    }),
    priorities: z.array(z.object({
      item: z.string(),
      importance: z.enum(["must_have", "important", "nice_to_have"]),
    })),
    constraints: z.array(z.string()).optional(),
  }),
  alternatives: z.array(z.object({
    alternative: z.string(),
    feasibility: z.enum(["high", "medium", "low"]),
    value_comparison: z.string(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  negotiation_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  preparation_analysis: z.object({
    batna: z.object({
      best_alternative: z.string(),
      batna_value: z.string(),
      implications: z.array(z.string()),
    }),
    counterparty_analysis: z.object({
      likely_batna: z.string(),
      estimated_priorities: z.array(z.object({
        item: z.string(),
        estimated_importance: z.string(),
      })),
      potential_pressure_points: z.array(z.string()),
      estimated_walk_away: z.string(),
    }),
    zone_of_possible_agreement: z.object({
      exists: z.boolean(),
      estimated_range: z.string(),
      key_variables: z.array(z.string()),
    }),
  }),
  negotiation_strategy: z.object({
    approach: z.enum(["competitive", "collaborative", "hybrid"]),
    rationale: z.string(),
    opening_position: z.string(),
    concession_strategy: z.array(z.object({
      round: z.number(),
      concession_item: z.string(),
      condition: z.string(),
      target_response: z.string(),
    })),
    value_creation_opportunities: z.array(z.object({
      opportunity: z.string(),
      mutual_benefit: z.string(),
      proposal: z.string(),
    })),
  }),
  tactics_playbook: z.array(z.object({
    scenario: z.string(),
    tactic: z.string(),
    script: z.string(),
    contingency: z.string(),
  })),
  deal_structure_options: z.array(z.object({
    option_name: z.string(),
    terms: z.array(z.object({
      term: z.string(),
      our_position: z.string(),
      flexibility: z.enum(["none", "limited", "moderate", "high"]),
    })),
    overall_value: z.enum(["excellent", "good", "acceptable", "poor"]),
  })),
  closure_tactics: z.object({
    signals_to_close: z.array(z.string()),
    closing_techniques: z.array(z.string()),
    documentation_checklist: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-024",
  taskName: "Negotiation Support",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자와의 협상 전략을 수립하고 지원합니다.",
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

  const { our_position, negotiation_context, alternatives } = validated;
  const counterparty = negotiation_context.counterparty;

  // Determine best alternative (BATNA)
  const bestAlt = alternatives?.sort((a, b) =>
    a.feasibility === "high" ? -1 : b.feasibility === "high" ? 1 : 0
  )[0];

  // Determine approach based on relationship importance
  const approach = negotiation_context.relationship_importance === "critical" ||
    negotiation_context.relationship_importance === "high"
    ? "collaborative" as const
    : counterparty.negotiation_style === "competitive"
    ? "hybrid" as const
    : "collaborative" as const;

  // Build concession strategy
  const niceToHaves = our_position.priorities.filter(p => p.importance === "nice_to_have");
  const importants = our_position.priorities.filter(p => p.importance === "important");
  const concessions = [
    ...niceToHaves.map((p, idx) => ({
      round: idx + 1,
      concession_item: p.item,
      condition: "상대방 동등한 양보 시",
      target_response: "핵심 사항 합의 진전",
    })),
    ...importants.slice(0, 1).map((p, idx) => ({
      round: niceToHaves.length + idx + 1,
      concession_item: `${p.item} 일부 조정`,
      condition: "최종 합의 단계에서만",
      target_response: "전체 딜 성사",
    })),
  ];

  return {
    negotiation_plan_id: generateUUID(),
    event_id: validated.event_id,
    preparation_analysis: {
      batna: {
        best_alternative: bestAlt?.alternative || "대안 없음 - 협상 성공 필수",
        batna_value: bestAlt?.value_comparison || "현 협상 대비 불리",
        implications: bestAlt
          ? ["BATNA 존재로 협상력 확보", "과도한 양보 불필요"]
          : ["협상 실패 시 큰 손실", "신중한 접근 필요"],
      },
      counterparty_analysis: {
        likely_batna: "다른 이벤트/파트너십 기회",
        estimated_priorities: counterparty.known_interests.map(interest => ({
          item: interest,
          estimated_importance: "높음",
        })),
        potential_pressure_points: counterparty.known_constraints || ["일정 압박", "예산 제한"],
        estimated_walk_away: "핵심 이익 미충족 시",
      },
      zone_of_possible_agreement: {
        exists: true,
        estimated_range: `${our_position.acceptable_range.target} ~ 상대 추정 target`,
        key_variables: our_position.priorities.filter(p => p.importance === "must_have").map(p => p.item),
      },
    },
    negotiation_strategy: {
      approach,
      rationale: approach === "collaborative"
        ? "장기 관계 중시, 상호 이익 극대화 추구"
        : "관계 유지하면서 우리 이익 확보",
      opening_position: our_position.acceptable_range.best_case,
      concession_strategy: concessions,
      value_creation_opportunities: [
        {
          opportunity: "패키지 딜",
          mutual_benefit: "개별 협상보다 효율적",
          proposal: "여러 항목을 묶어 전체 가치 증대",
        },
        {
          opportunity: "장기 파트너십",
          mutual_benefit: "안정성 및 비용 절감",
          proposal: "단일 이벤트 넘어 지속 협력 제안",
        },
      ],
    },
    tactics_playbook: [
      {
        scenario: "상대방 강경 입장",
        tactic: "이해관계 탐색",
        script: "입장 뒤의 실제 관심사가 무엇인지 더 이해하고 싶습니다.",
        contingency: "휴회 요청 및 BATNA 검토",
      },
      {
        scenario: "교착 상태",
        tactic: "조건부 제안",
        script: "만약 ~를 해주신다면, 저희도 ~를 고려할 수 있습니다.",
        contingency: "제3의 옵션 모색",
      },
      {
        scenario: "불합리한 요구",
        tactic: "객관적 기준 제시",
        script: "업계 표준과 비교해 보면...",
        contingency: "BATNA 언급으로 한계 명시",
      },
    ],
    deal_structure_options: [
      {
        option_name: "표준 계약",
        terms: our_position.priorities.map(p => ({
          term: p.item,
          our_position: our_position.acceptable_range.target,
          flexibility: p.importance === "must_have" ? "none" as const : "moderate" as const,
        })),
        overall_value: "good" as const,
      },
      {
        option_name: "확장 파트너십",
        terms: [
          { term: "기본 조건", our_position: our_position.acceptable_range.target, flexibility: "limited" as const },
          { term: "추가 협력 범위", our_position: "향후 논의", flexibility: "high" as const },
        ],
        overall_value: "excellent" as const,
      },
    ],
    closure_tactics: {
      signals_to_close: [
        "세부 사항 질문 증가",
        "이행 일정 논의",
        "결재권자 언급",
        "최종 확인 요청",
      ],
      closing_techniques: [
        "요약 정리: 합의 사항 정리 후 확정 제안",
        "선택형 종결: 두 가지 허용 가능한 옵션 제시",
        "일정 활용: 결정 시한 설정",
      ],
      documentation_checklist: [
        "합의 조건 명문화",
        "역할 및 책임 정의",
        "일정 및 마일스톤",
        "위약 조항",
        "서명 및 날인",
      ],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
