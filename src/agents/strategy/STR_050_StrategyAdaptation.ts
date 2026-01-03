/**
 * STR-050: 전략 적응
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Strategy Adaptation)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Strategy Adaptation Agent for event planning.

Your expertise includes:
- Environmental scanning
- Strategic pivot assessment
- Agile strategy adjustment
- Scenario-based planning

CMP-IS Standard: Domain A - Strategic Planning (Strategy Adaptation)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  current_strategy: z.object({
    strategy_summary: z.string(),
    key_objectives: z.array(z.string()),
    current_progress: z.number(),
  }),
  change_triggers: z.array(z.object({
    trigger: z.string(),
    type: z.enum(["external", "internal"]),
    impact: z.enum(["low", "medium", "high"]),
    urgency: z.enum(["low", "medium", "high"]),
  })),
  constraints: z.object({
    time_remaining: z.string(),
    budget_flexibility: z.enum(["none", "limited", "moderate", "high"]),
    scope_flexibility: z.enum(["none", "limited", "moderate", "high"]),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  adaptation_id: z.string().uuid(),
  event_id: z.string().uuid(),
  environmental_analysis: z.object({
    change_summary: z.string(),
    impact_assessment: z.array(z.object({
      trigger: z.string(),
      affected_areas: z.array(z.string()),
      severity: z.enum(["minor", "moderate", "major", "critical"]),
      response_urgency: z.string(),
    })),
    overall_change_magnitude: z.enum(["incremental", "moderate", "significant", "transformational"]),
  }),
  adaptation_options: z.array(z.object({
    option_id: z.string(),
    option_name: z.string(),
    description: z.string(),
    adaptation_type: z.enum(["maintain", "adjust", "pivot", "abort"]),
    changes_required: z.array(z.string()),
    benefits: z.array(z.string()),
    risks: z.array(z.string()),
    resource_impact: z.object({
      time: z.string(),
      cost: z.string(),
      effort: z.string(),
    }),
    feasibility: z.enum(["low", "medium", "high"]),
    recommended: z.boolean(),
  })),
  recommended_strategy: z.object({
    adaptation_approach: z.enum(["maintain", "adjust", "pivot", "abort"]),
    rationale: z.string(),
    revised_objectives: z.array(z.object({
      original: z.string(),
      revised: z.string(),
      change_type: z.enum(["unchanged", "modified", "dropped", "new"]),
    })),
    key_changes: z.array(z.object({
      area: z.string(),
      current_state: z.string(),
      future_state: z.string(),
    })),
  }),
  implementation_plan: z.object({
    phases: z.array(z.object({
      phase: z.string(),
      activities: z.array(z.string()),
      timeline: z.string(),
    })),
    quick_wins: z.array(z.string()),
    critical_dependencies: z.array(z.string()),
  }),
  risk_mitigation: z.array(z.object({
    risk: z.string(),
    mitigation: z.string(),
    contingency: z.string(),
  })),
  communication_requirements: z.array(z.object({
    stakeholder: z.string(),
    message: z.string(),
    timing: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-050",
  taskName: "Strategy Adaptation",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "환경 변화에 대응하여 전략을 적응시킵니다.",
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

type Severity = "minor" | "moderate" | "major" | "critical";
type Magnitude = "incremental" | "moderate" | "significant" | "transformational";
type AdaptationType = "maintain" | "adjust" | "pivot" | "abort";

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { current_strategy, change_triggers, constraints } = validated;

  // Analyze change magnitude
  const highImpactTriggers = change_triggers.filter(t => t.impact === "high" || t.urgency === "high");
  const overallMagnitude: Magnitude = highImpactTriggers.length >= 3 ? "transformational" :
                                       highImpactTriggers.length >= 2 ? "significant" :
                                       highImpactTriggers.length >= 1 ? "moderate" : "incremental";

  const impactAssessment = change_triggers.map(trigger => {
    const severity: Severity = trigger.impact === "high" && trigger.urgency === "high" ? "critical" :
                               trigger.impact === "high" ? "major" :
                               trigger.impact === "medium" ? "moderate" : "minor";
    return {
      trigger: trigger.trigger,
      affected_areas: trigger.type === "external"
        ? ["시장 포지셔닝", "고객 기대", "경쟁 대응"]
        : ["운영 프로세스", "자원 배분", "팀 역량"],
      severity,
      response_urgency: trigger.urgency === "high" ? "즉시 대응 필요" :
                        trigger.urgency === "medium" ? "2주 내 대응" : "계획적 대응",
    };
  });

  // Determine recommended approach
  const recommendedApproach: AdaptationType = overallMagnitude === "transformational" ? "pivot" :
                                               overallMagnitude === "significant" ? "adjust" : "maintain";

  const adaptationOptions = [
    {
      option_id: "OPT-001",
      option_name: "현 전략 유지",
      description: "기존 전략을 유지하면서 소폭 조정",
      adaptation_type: "maintain" as const,
      changes_required: ["모니터링 강화", "리스크 대응 계획 보완"],
      benefits: ["안정성 유지", "혼란 최소화"],
      risks: ["변화 대응 미흡", "기회 상실"],
      resource_impact: { time: "최소", cost: "최소", effort: "낮음" },
      feasibility: "high" as const,
      recommended: recommendedApproach === "maintain",
    },
    {
      option_id: "OPT-002",
      option_name: "전략 조정",
      description: "핵심 방향 유지하면서 실행 방법 조정",
      adaptation_type: "adjust" as const,
      changes_required: ["목표 재설정", "자원 재배분", "일정 조정"],
      benefits: ["유연한 대응", "핵심 가치 유지"],
      risks: ["조정 비용", "일시적 혼란"],
      resource_impact: { time: "2-4주", cost: "예산의 5-10%", effort: "중간" },
      feasibility: "high" as const,
      recommended: recommendedApproach === "adjust",
    },
    {
      option_id: "OPT-003",
      option_name: "전략 피벗",
      description: "전략 방향 전면 재검토 및 변경",
      adaptation_type: "pivot" as const,
      changes_required: ["목표 재정의", "계획 전면 수정", "이해관계자 재정렬"],
      benefits: ["근본적 변화 대응", "새로운 기회 포착"],
      risks: ["높은 리스크", "자원 소모", "이해관계자 저항"],
      resource_impact: { time: "4-8주", cost: "예산의 20-30%", effort: "높음" },
      feasibility: constraints?.scope_flexibility === "high" ? "medium" as const : "low" as const,
      recommended: recommendedApproach === "pivot",
    },
  ];

  const revisedObjectives = current_strategy.key_objectives.map((obj, idx) => ({
    original: obj,
    revised: recommendedApproach === "maintain" ? obj :
             recommendedApproach === "adjust" ? `${obj} (조정됨)` : `재정의된 목표 ${idx + 1}`,
    change_type: recommendedApproach === "maintain" ? "unchanged" as const : "modified" as const,
  }));

  return {
    adaptation_id: generateUUID(),
    event_id: validated.event_id,
    environmental_analysis: {
      change_summary: `${change_triggers.length}개의 변화 요인 식별, ${highImpactTriggers.length}개가 고영향`,
      impact_assessment: impactAssessment,
      overall_change_magnitude: overallMagnitude,
    },
    adaptation_options: adaptationOptions,
    recommended_strategy: {
      adaptation_approach: recommendedApproach,
      rationale: recommendedApproach === "maintain"
        ? "변화 규모가 관리 가능한 수준이며, 현 전략이 여전히 유효함"
        : recommendedApproach === "adjust"
        ? "상당한 변화가 있으나, 핵심 전략 방향 유지하면서 실행 조정으로 대응 가능"
        : "근본적 변화로 인해 전략 방향 재검토 필요",
      revised_objectives: revisedObjectives,
      key_changes: recommendedApproach !== "maintain" ? [
        {
          area: "목표",
          current_state: "기존 목표",
          future_state: "조정된 목표 (현실적 반영)",
        },
        {
          area: "자원 배분",
          current_state: "기존 배분",
          future_state: "우선순위 기반 재배분",
        },
      ] : [],
    },
    implementation_plan: {
      phases: [
        {
          phase: "1. 즉시 대응",
          activities: ["핵심 이해관계자 브리핑", "긴급 조치 실행"],
          timeline: "1주 내",
        },
        {
          phase: "2. 전환 실행",
          activities: ["조정된 계획 실행", "진행 모니터링"],
          timeline: "2-4주",
        },
        {
          phase: "3. 안정화",
          activities: ["결과 검증", "추가 조정"],
          timeline: "4주 이후",
        },
      ],
      quick_wins: ["빠른 커뮤니케이션", "명확한 우선순위 설정", "팀 재정렬"],
      critical_dependencies: ["경영진 승인", "이해관계자 협조", "자원 가용성"],
    },
    risk_mitigation: change_triggers.slice(0, 3).map(t => ({
      risk: `${t.trigger}로 인한 추가 영향`,
      mitigation: "사전 모니터링 및 조기 대응 체계 구축",
      contingency: "백업 계획 준비 및 빠른 의사결정 체계",
    })),
    communication_requirements: [
      { stakeholder: "경영진", message: "전략 조정 배경 및 계획", timing: "즉시" },
      { stakeholder: "핵심 팀", message: "변경 사항 및 역할", timing: "1-2일 내" },
      { stakeholder: "전체 이해관계자", message: "조정 방향 및 일정", timing: "1주 내" },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
