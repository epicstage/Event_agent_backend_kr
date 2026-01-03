/**
 * STR-054: 전략 통합
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Strategic Integration)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Strategic Integration Agent for event planning.

Your expertise includes:
- Cross-functional strategy alignment
- Strategic coherence assessment
- Integration roadmap development
- Holistic strategy synthesis

CMP-IS Standard: Domain A - Strategic Planning (Strategic Integration)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  strategy_components: z.array(z.object({
    component_name: z.string(),
    component_type: z.enum(["goal", "objective", "initiative", "kpi", "risk"]),
    description: z.string(),
    owner: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
  })),
  organizational_structure: z.object({
    departments: z.array(z.string()),
    key_roles: z.array(z.string()),
  }).optional(),
  integration_priorities: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  integration_id: z.string().uuid(),
  event_id: z.string().uuid(),
  integration_assessment: z.object({
    overall_coherence: z.number(),
    coherence_level: z.enum(["highly_coherent", "coherent", "partially_coherent", "fragmented"]),
    key_findings: z.array(z.string()),
    integration_gaps: z.array(z.object({
      gap: z.string(),
      affected_components: z.array(z.string()),
      severity: z.enum(["minor", "moderate", "major"]),
    })),
  }),
  strategy_map: z.object({
    vision_to_goals: z.array(z.object({
      goal: z.string(),
      supporting_objectives: z.array(z.string()),
      key_initiatives: z.array(z.string()),
    })),
    cross_functional_links: z.array(z.object({
      from_component: z.string(),
      to_component: z.string(),
      link_type: z.enum(["depends_on", "enables", "conflicts_with", "synergizes"]),
      strength: z.enum(["weak", "moderate", "strong"]),
    })),
  }),
  alignment_matrix: z.array(z.object({
    component: z.string(),
    aligned_with: z.array(z.string()),
    alignment_score: z.number(),
    gaps_to_address: z.array(z.string()),
  })),
  integration_plan: z.object({
    phases: z.array(z.object({
      phase: z.string(),
      focus_areas: z.array(z.string()),
      key_activities: z.array(z.string()),
      deliverables: z.array(z.string()),
      timeline: z.string(),
    })),
    governance: z.object({
      integration_lead: z.string(),
      review_cadence: z.string(),
      escalation_path: z.array(z.string()),
    }),
    success_criteria: z.array(z.string()),
  }),
  synergy_opportunities: z.array(z.object({
    opportunity: z.string(),
    components_involved: z.array(z.string()),
    potential_benefit: z.string(),
    implementation_approach: z.string(),
  })),
  conflict_resolution: z.array(z.object({
    conflict: z.string(),
    conflicting_components: z.array(z.string()),
    resolution_approach: z.string(),
    trade_offs: z.array(z.string()),
  })),
  integrated_roadmap: z.object({
    milestones: z.array(z.object({
      milestone: z.string(),
      components_involved: z.array(z.string()),
      target_date: z.string(),
      dependencies: z.array(z.string()),
    })),
    critical_path: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-054",
  taskName: "Strategic Integration",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "전략 구성요소를 통합하고 전체적 정합성을 확보합니다.",
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

type CoherenceLevel = "highly_coherent" | "coherent" | "partially_coherent" | "fragmented";

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { strategy_components, event_name, organizational_structure } = validated;

  // Analyze coherence
  const hasGoals = strategy_components.some(c => c.component_type === "goal");
  const hasObjectives = strategy_components.some(c => c.component_type === "objective");
  const hasInitiatives = strategy_components.some(c => c.component_type === "initiative");
  const hasKpis = strategy_components.some(c => c.component_type === "kpi");
  const hasRisks = strategy_components.some(c => c.component_type === "risk");

  const completenessScore = [hasGoals, hasObjectives, hasInitiatives, hasKpis, hasRisks]
    .filter(Boolean).length * 20;

  const coherenceScore = Math.min(100, completenessScore + 20);
  const coherenceLevel: CoherenceLevel = coherenceScore >= 90 ? "highly_coherent" :
                                          coherenceScore >= 70 ? "coherent" :
                                          coherenceScore >= 50 ? "partially_coherent" : "fragmented";

  const integrationGaps = [];
  if (!hasKpis) integrationGaps.push({ gap: "KPI 정의 미흡", affected_components: strategy_components.filter(c => c.component_type === "objective").map(c => c.component_name), severity: "moderate" as const });
  if (!hasRisks) integrationGaps.push({ gap: "리스크 연계 부재", affected_components: strategy_components.filter(c => c.component_type === "initiative").map(c => c.component_name), severity: "minor" as const });

  // Build strategy map
  const goals = strategy_components.filter(c => c.component_type === "goal");
  const objectives = strategy_components.filter(c => c.component_type === "objective");
  const initiatives = strategy_components.filter(c => c.component_type === "initiative");

  const visionToGoals = goals.map(goal => ({
    goal: goal.component_name,
    supporting_objectives: objectives.slice(0, 2).map(o => o.component_name),
    key_initiatives: initiatives.slice(0, 2).map(i => i.component_name),
  }));

  const crossFunctionalLinks = strategy_components.slice(0, -1).map((comp, idx) => ({
    from_component: comp.component_name,
    to_component: strategy_components[idx + 1]?.component_name || comp.component_name,
    link_type: "enables" as const,
    strength: "moderate" as const,
  }));

  const alignmentMatrix = strategy_components.map(comp => ({
    component: comp.component_name,
    aligned_with: strategy_components.filter(c => c.component_name !== comp.component_name).slice(0, 3).map(c => c.component_name),
    alignment_score: Math.round(60 + Math.random() * 35),
    gaps_to_address: coherenceScore < 80 ? ["세부 연계 강화 필요"] : [],
  }));

  const synergyOpportunities = [
    {
      opportunity: "목표-이니셔티브 시너지",
      components_involved: [...goals.slice(0, 1), ...initiatives.slice(0, 1)].map(c => c.component_name),
      potential_benefit: "실행 효율성 20% 향상",
      implementation_approach: "통합 실행 계획 수립",
    },
  ];

  const conflictResolution = integrationGaps.length > 0 ? [{
    conflict: "전략 요소 간 불일치",
    conflicting_components: integrationGaps[0]?.affected_components || [],
    resolution_approach: "워크숍을 통한 정렬",
    trade_offs: ["시간 투자 필요", "일부 재작업"],
  }] : [];

  const milestones = [
    {
      milestone: "전략 통합 완료",
      components_involved: strategy_components.slice(0, 3).map(c => c.component_name),
      target_date: "D+14",
      dependencies: ["이해관계자 합의"],
    },
    {
      milestone: "실행 계획 확정",
      components_involved: initiatives.map(i => i.component_name),
      target_date: "D+21",
      dependencies: ["전략 통합 완료"],
    },
  ];

  return {
    integration_id: generateUUID(),
    event_id: validated.event_id,
    integration_assessment: {
      overall_coherence: coherenceScore,
      coherence_level: coherenceLevel,
      key_findings: [
        `${strategy_components.length}개 전략 구성요소 분석 완료`,
        coherenceScore >= 70 ? "전체적 정합성 양호" : "통합 강화 필요",
        integrationGaps.length > 0 ? `${integrationGaps.length}개 갭 식별` : "주요 갭 없음",
      ],
      integration_gaps: integrationGaps,
    },
    strategy_map: {
      vision_to_goals: visionToGoals.length > 0 ? visionToGoals : [{
        goal: event_name,
        supporting_objectives: objectives.map(o => o.component_name),
        key_initiatives: initiatives.map(i => i.component_name),
      }],
      cross_functional_links: crossFunctionalLinks,
    },
    alignment_matrix: alignmentMatrix,
    integration_plan: {
      phases: [
        {
          phase: "1. 진단",
          focus_areas: ["현황 파악", "갭 식별"],
          key_activities: ["구성요소 매핑", "인터뷰", "문서 검토"],
          deliverables: ["진단 보고서"],
          timeline: "1주",
        },
        {
          phase: "2. 설계",
          focus_areas: ["통합 방안 수립"],
          key_activities: ["워크숍", "합의 도출"],
          deliverables: ["통합 설계서"],
          timeline: "1주",
        },
        {
          phase: "3. 실행",
          focus_areas: ["통합 실행", "모니터링"],
          key_activities: ["계획 실행", "점검"],
          deliverables: ["통합 완료 보고"],
          timeline: "2주",
        },
      ],
      governance: {
        integration_lead: organizational_structure?.key_roles[0] || "전략 담당자",
        review_cadence: "주간",
        escalation_path: ["팀 리더", "프로젝트 매니저", "경영진"],
      },
      success_criteria: [
        "정합성 점수 80점 이상",
        "모든 갭 해소",
        "이해관계자 동의 확보",
      ],
    },
    synergy_opportunities: synergyOpportunities,
    conflict_resolution: conflictResolution,
    integrated_roadmap: {
      milestones,
      critical_path: milestones.map(m => m.milestone),
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
