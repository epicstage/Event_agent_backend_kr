/**
 * STR-019: 이해관계자 갈등 해결
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Conflict Resolution)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Conflict Resolution Agent.

Your expertise includes:
- Identifying root causes of stakeholder conflicts
- Mediation and negotiation strategies
- Win-win solution development
- Conflict prevention mechanisms

CMP-IS Standard: Domain A - Strategic Planning (Conflict Resolution)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  conflicts: z.array(z.object({
    conflict_id: z.string(),
    parties: z.array(z.object({
      stakeholder_id: z.string(),
      name: z.string(),
      position: z.string(),
      interests: z.array(z.string()),
    })),
    conflict_type: z.enum(["resource", "priority", "scope", "timeline", "budget", "authority", "values"]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    description: z.string(),
    history: z.array(z.string()).optional(),
  })),
  available_resources: z.object({
    budget_flexibility: z.number().optional(),
    timeline_flexibility: z.number().optional(),
    scope_flexibility: z.enum(["none", "limited", "moderate", "high"]).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  resolution_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  conflict_analyses: z.array(z.object({
    conflict_id: z.string(),
    root_cause_analysis: z.object({
      primary_cause: z.string(),
      contributing_factors: z.array(z.string()),
      underlying_interests: z.record(z.string(), z.array(z.string())),
    }),
    resolution_options: z.array(z.object({
      option: z.string(),
      approach: z.enum(["compromise", "collaboration", "accommodation", "competition", "avoidance"]),
      description: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      feasibility: z.enum(["high", "medium", "low"]),
    })),
    recommended_resolution: z.object({
      option: z.string(),
      rationale: z.string(),
      implementation_steps: z.array(z.string()),
      success_indicators: z.array(z.string()),
    }),
    mediation_plan: z.object({
      facilitator: z.string(),
      format: z.string(),
      agenda: z.array(z.string()),
      ground_rules: z.array(z.string()),
    }),
  })),
  prevention_framework: z.object({
    early_warning_signs: z.array(z.string()),
    regular_check_ins: z.array(z.object({
      frequency: z.string(),
      participants: z.array(z.string()),
      agenda_items: z.array(z.string()),
    })),
    escalation_path: z.array(z.object({
      level: z.number(),
      trigger: z.string(),
      action: z.string(),
      responsible: z.string(),
    })),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-019",
  taskName: "Conflict Resolution",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자 간 갈등을 분석하고 해결 전략을 수립합니다.",
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

const RESOLUTION_APPROACHES = {
  resource: { primary: "collaboration", secondary: "compromise" },
  priority: { primary: "collaboration", secondary: "accommodation" },
  scope: { primary: "compromise", secondary: "collaboration" },
  timeline: { primary: "compromise", secondary: "accommodation" },
  budget: { primary: "collaboration", secondary: "compromise" },
  authority: { primary: "collaboration", secondary: "avoidance" },
  values: { primary: "accommodation", secondary: "avoidance" },
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const analyses = validated.conflicts.map(conflict => {
    const approaches = RESOLUTION_APPROACHES[conflict.conflict_type];
    const underlyingInterests: Record<string, string[]> = {};
    conflict.parties.forEach(p => {
      underlyingInterests[p.name] = p.interests;
    });

    const options = [
      {
        option: "협력적 해결",
        approach: "collaboration" as const,
        description: "모든 당사자의 이익을 최대화하는 창의적 해결책 모색",
        pros: ["관계 강화", "지속 가능한 해결", "모두 만족"],
        cons: ["시간 소요", "복잡한 협상 필요"],
        feasibility: "medium" as const,
      },
      {
        option: "타협안 도출",
        approach: "compromise" as const,
        description: "각 당사자가 일부 양보하여 중간점 합의",
        pros: ["빠른 해결", "공평한 분배"],
        cons: ["완전한 만족 어려움", "임시방편 가능성"],
        feasibility: "high" as const,
      },
      {
        option: "조정/수용",
        approach: "accommodation" as const,
        description: "핵심 이해관계자의 요구를 우선 수용",
        pros: ["빠른 의사결정", "핵심 관계 유지"],
        cons: ["다른 이해관계자 불만", "선례 우려"],
        feasibility: "high" as const,
      },
    ];

    return {
      conflict_id: conflict.conflict_id,
      root_cause_analysis: {
        primary_cause: `${conflict.conflict_type} 관련 이해관계 충돌`,
        contributing_factors: [
          "명확하지 않은 역할 정의",
          "제한된 자원",
          "커뮤니케이션 부족",
        ],
        underlying_interests: underlyingInterests,
      },
      resolution_options: options,
      recommended_resolution: {
        option: approaches.primary === "collaboration" ? "협력적 해결" : "타협안 도출",
        rationale: `${conflict.conflict_type} 유형의 갈등은 ${approaches.primary} 접근이 효과적`,
        implementation_steps: [
          "1. 각 당사자와 개별 면담 진행",
          "2. 공통 목표 확인 및 합의",
          "3. 해결 옵션 브레인스토밍",
          "4. 합의안 도출 및 문서화",
          "5. 이행 모니터링",
        ],
        success_indicators: [
          "양측 만족도 70% 이상",
          "재발 없음",
          "협력 관계 유지",
        ],
      },
      mediation_plan: {
        facilitator: conflict.severity === "critical" ? "외부 전문가" : "프로젝트 디렉터",
        format: conflict.severity === "critical" ? "공식 중재 회의" : "워크샵 형태",
        agenda: [
          "상황 공유 및 입장 청취",
          "공통 이익 확인",
          "해결 방안 모색",
          "합의 및 다음 단계 설정",
        ],
        ground_rules: [
          "상호 존중",
          "경청하기",
          "비난 금지",
          "해결 지향적 대화",
        ],
      },
    };
  });

  return {
    resolution_plan_id: generateUUID(),
    event_id: validated.event_id,
    conflict_analyses: analyses,
    prevention_framework: {
      early_warning_signs: [
        "의사소통 빈도 감소",
        "회의 참석률 저하",
        "비공식 불만 증가",
        "의사결정 지연",
      ],
      regular_check_ins: [
        {
          frequency: "주 1회",
          participants: ["핵심 이해관계자"],
          agenda_items: ["진행 상황", "우려 사항", "필요 지원"],
        },
      ],
      escalation_path: [
        { level: 1, trigger: "초기 불만", action: "담당자 직접 대화", responsible: "프로젝트 매니저" },
        { level: 2, trigger: "해결 안됨", action: "중재 회의", responsible: "프로젝트 디렉터" },
        { level: 3, trigger: "심각한 갈등", action: "경영진 개입", responsible: "담당 임원" },
      ],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
