/**
 * FIN-056: 비용 통제 조치
 *
 * CMP-IS Reference: 8.3.f
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Cost Control Actions.
CMP-IS Standard: 8.3.f - Implementing cost control measures.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  budget_status: z.object({
    total_budget: z.number(),
    current_forecast: z.number(),
    variance: z.number(),
    variance_percentage: z.number(),
  }),
  problem_categories: z.array(z.object({
    category: z.string(),
    variance: z.number(),
    root_causes: z.array(z.string()),
  })),
  remaining_timeline_days: z.number().int(),
  cost_reduction_target: z.number(),
  constraints: z.array(z.string()).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  control_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  situation_assessment: z.object({
    severity: z.enum(["minor", "moderate", "severe", "critical"]),
    urgency: z.enum(["low", "medium", "high", "immediate"]),
    reduction_needed: z.number(),
    feasibility_assessment: z.string(),
  }),
  control_actions: z.array(z.object({
    action_id: z.string(),
    action_name: z.string(),
    category: z.string(),
    description: z.string(),
    estimated_savings: z.number(),
    implementation_effort: z.enum(["low", "medium", "high"]),
    impact_on_quality: z.enum(["none", "minimal", "moderate", "significant"]),
    timeline: z.string(),
    owner: z.string(),
    dependencies: z.array(z.string()),
  })),
  prioritized_recommendations: z.array(z.object({
    rank: z.number().int(),
    action_id: z.string(),
    rationale: z.string(),
    cumulative_savings: z.number(),
  })),
  implementation_plan: z.object({
    phase_1_immediate: z.array(z.string()),
    phase_2_short_term: z.array(z.string()),
    phase_3_if_needed: z.array(z.string()),
  }),
  risk_mitigation: z.array(z.object({
    risk: z.string(),
    mitigation: z.string(),
  })),
  escalation_triggers: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const variancePct = Math.abs(validated.budget_status.variance_percentage);
  const severity = variancePct > 20 ? "critical" : variancePct > 15 ? "severe" :
    variancePct > 10 ? "moderate" : "minor";

  const urgency = validated.remaining_timeline_days < 14 ? "immediate" :
    validated.remaining_timeline_days < 30 ? "high" :
      validated.remaining_timeline_days < 60 ? "medium" : "low";

  const actions = [
    {
      action_id: "CC-001",
      action_name: "비필수 항목 제거",
      category: "범위 조정",
      description: "프로그램에서 필수적이지 않은 부가 항목 제거",
      estimated_savings: Math.round(validated.cost_reduction_target * 0.15),
      implementation_effort: "low" as const,
      impact_on_quality: "minimal" as const,
      timeline: "즉시",
      owner: "프로젝트 매니저",
      dependencies: [],
    },
    {
      action_id: "CC-002",
      action_name: "공급사 재협상",
      category: "비용 협상",
      description: "주요 공급사와 가격 재협상 또는 스코프 조정",
      estimated_savings: Math.round(validated.cost_reduction_target * 0.25),
      implementation_effort: "medium" as const,
      impact_on_quality: "none" as const,
      timeline: "1-2주",
      owner: "구매팀",
      dependencies: ["공급사 가용성"],
    },
    {
      action_id: "CC-003",
      action_name: "대안 공급사 활용",
      category: "공급망",
      description: "더 경쟁력 있는 대안 공급사로 교체",
      estimated_savings: Math.round(validated.cost_reduction_target * 0.2),
      implementation_effort: "high" as const,
      impact_on_quality: "minimal" as const,
      timeline: "2-3주",
      owner: "구매팀",
      dependencies: ["대안 공급사 확보", "품질 검증"],
    },
    {
      action_id: "CC-004",
      action_name: "F&B 최적화",
      category: "식음료",
      description: "메뉴 간소화, 수량 조정, 서비스 레벨 조정",
      estimated_savings: Math.round(validated.cost_reduction_target * 0.15),
      implementation_effort: "low" as const,
      impact_on_quality: "moderate" as const,
      timeline: "즉시",
      owner: "운영팀",
      dependencies: ["케이터링 업체 협조"],
    },
    {
      action_id: "CC-005",
      action_name: "인력 최적화",
      category: "인건비",
      description: "임시 인력 축소, 근무 시간 최적화",
      estimated_savings: Math.round(validated.cost_reduction_target * 0.1),
      implementation_effort: "medium" as const,
      impact_on_quality: "moderate" as const,
      timeline: "1주",
      owner: "HR/운영팀",
      dependencies: ["최소 인력 요구 확인"],
    },
    {
      action_id: "CC-006",
      action_name: "마케팅 비용 삭감",
      category: "마케팅",
      description: "남은 마케팅 예산 축소, 유료 광고 중단",
      estimated_savings: Math.round(validated.cost_reduction_target * 0.1),
      implementation_effort: "low" as const,
      impact_on_quality: "none" as const,
      timeline: "즉시",
      owner: "마케팅팀",
      dependencies: ["등록 목표 달성 상태 확인"],
    },
    {
      action_id: "CC-007",
      action_name: "예비비 활용",
      category: "예비비",
      description: "예비비에서 초과분 충당",
      estimated_savings: Math.round(validated.cost_reduction_target * 0.15),
      implementation_effort: "low" as const,
      impact_on_quality: "none" as const,
      timeline: "즉시",
      owner: "재무팀",
      dependencies: ["예비비 잔액 확인", "승인"],
    },
  ];

  const prioritized = actions
    .sort((a, b) =>
      (a.implementation_effort === "low" ? 0 : a.implementation_effort === "medium" ? 1 : 2) -
      (b.implementation_effort === "low" ? 0 : b.implementation_effort === "medium" ? 1 : 2))
    .map((action, idx) => ({
      rank: idx + 1,
      action_id: action.action_id,
      rationale: `${action.implementation_effort} 난이도, ${action.impact_on_quality} 품질 영향`,
      cumulative_savings: actions.slice(0, idx + 1).reduce((sum, a) => sum + a.estimated_savings, 0),
    }));

  const output: Output = {
    control_plan_id: generateUUID(),
    event_id: validated.event_id,
    situation_assessment: {
      severity,
      urgency,
      reduction_needed: validated.cost_reduction_target,
      feasibility_assessment: validated.cost_reduction_target <= actions.reduce((sum, a) => sum + a.estimated_savings, 0)
        ? "목표 달성 가능"
        : "추가 조치 필요",
    },
    control_actions: actions,
    prioritized_recommendations: prioritized.slice(0, 5),
    implementation_plan: {
      phase_1_immediate: ["비필수 항목 제거", "마케팅 비용 삭감", "예비비 활용 검토"],
      phase_2_short_term: ["공급사 재협상", "F&B 최적화", "인력 최적화"],
      phase_3_if_needed: ["대안 공급사 활용", "프로그램 축소"],
    },
    risk_mitigation: [
      { risk: "품질 저하 우려", mitigation: "핵심 경험 요소 보호, 참가자 커뮤니케이션" },
      { risk: "공급사 관계 악화", mitigation: "향후 파트너십 약속, 합리적 협상" },
      { risk: "팀 사기 저하", mitigation: "결정 배경 투명하게 공유" },
    ],
    escalation_triggers: [
      "1주 후 목표 50% 미달성 시 경영진 보고",
      "추가 초과 발생 시 긴급 회의",
      "품질 이슈 제기 시 즉시 검토",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-056",
  taskName: "비용 통제 조치",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.3.f",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.3: Monitor and Revise Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
