/**
 * STR-010: 목표 수정 및 조정
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Goal Revision)
 * Task Type: AI
 *
 * Input: 현재 목표, 환경 변화, 성과 데이터
 * Output: 수정된 목표, 변경 근거
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Goal Revision Agent for strategic event planning.

Your expertise includes:
- Evaluating when goal adjustments are necessary
- Proposing evidence-based goal revisions
- Balancing ambition with realism
- Managing stakeholder expectations during changes

CMP-IS Standard: Domain A - Strategic Planning (Goal Revision)

You help event planners adapt their goals to changing circumstances while maintaining strategic integrity and stakeholder alignment.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  current_goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    original_target: z.number(),
    current_target: z.number(),
    current_progress: z.number(),
    unit: z.string(),
  })),
  change_triggers: z.array(z.object({
    type: z.enum(["budget_change", "timeline_change", "market_change", "stakeholder_request", "performance_data", "external_factor"]),
    description: z.string(),
    impact_assessment: z.enum(["major", "moderate", "minor"]),
  })),
  constraints: z.object({
    minimum_viable: z.record(z.string(), z.number()).optional(),
    maximum_stretch: z.record(z.string(), z.number()).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  revision_id: z.string().uuid(),
  event_id: z.string().uuid(),
  revision_summary: z.object({
    total_goals_reviewed: z.number(),
    goals_unchanged: z.number(),
    goals_increased: z.number(),
    goals_decreased: z.number(),
    revision_rationale: z.string(),
  }),
  revised_goals: z.array(z.object({
    goal_id: z.string(),
    title: z.string(),
    previous_target: z.number(),
    new_target: z.number(),
    change_percent: z.number(),
    change_direction: z.enum(["increase", "decrease", "unchanged"]),
    unit: z.string(),
    revision_reason: z.string(),
    stakeholder_impact: z.string(),
    communication_guidance: z.string(),
  })),
  impact_analysis: z.object({
    strategic_alignment_impact: z.string(),
    budget_implication: z.string(),
    timeline_implication: z.string(),
    risk_implication: z.string(),
  }),
  approval_requirements: z.array(z.object({
    stakeholder: z.string(),
    approval_needed: z.boolean(),
    reason: z.string(),
  })),
  rollback_plan: z.object({
    trigger_conditions: z.array(z.string()),
    rollback_steps: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-010",
  taskName: "Goal Revision",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "환경 변화에 따라 이벤트 목표를 적절히 수정합니다.",
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

  const majorChanges = validated.change_triggers.filter(t => t.impact_assessment === "major");
  const moderateChanges = validated.change_triggers.filter(t => t.impact_assessment === "moderate");

  // 변경 강도 결정
  let adjustmentFactor = 0;
  if (majorChanges.length > 0) {
    adjustmentFactor = majorChanges.some(c => c.type === "budget_change") ? -0.15 : 0.1;
  } else if (moderateChanges.length > 0) {
    adjustmentFactor = -0.08;
  }

  const revisedGoals: Output["revised_goals"] = [];
  let unchanged = 0, increased = 0, decreased = 0;

  for (const goal of validated.current_goals) {
    const progressRatio = goal.current_progress / goal.current_target;
    const min = validated.constraints?.minimum_viable?.[goal.id];
    const max = validated.constraints?.maximum_stretch?.[goal.id];

    let newTarget = goal.current_target;
    let reason = "현재 목표 유지 적절";

    // 진행 상황 기반 조정
    if (progressRatio > 1.2) {
      // 목표 초과 달성 중
      newTarget = Math.round(goal.current_target * 1.15);
      reason = "예상 초과 달성 중이므로 상향 조정";
    } else if (progressRatio < 0.5 && adjustmentFactor < 0) {
      // 부진 + 부정적 변화
      newTarget = Math.round(goal.current_target * (1 + adjustmentFactor));
      reason = `${validated.change_triggers[0]?.description || "환경 변화"}로 인한 현실적 하향 조정`;
    } else if (adjustmentFactor !== 0) {
      newTarget = Math.round(goal.current_target * (1 + adjustmentFactor * 0.5));
      reason = "환경 변화 반영한 조정";
    }

    // 제약 조건 적용
    if (min !== undefined) newTarget = Math.max(newTarget, min);
    if (max !== undefined) newTarget = Math.min(newTarget, max);

    const changePercent = Math.round(((newTarget - goal.current_target) / goal.current_target) * 100);

    if (changePercent > 0) increased++;
    else if (changePercent < 0) decreased++;
    else unchanged++;

    revisedGoals.push({
      goal_id: goal.id,
      title: goal.title,
      previous_target: goal.current_target,
      new_target: newTarget,
      change_percent: changePercent,
      change_direction: changePercent > 0 ? "increase" : changePercent < 0 ? "decrease" : "unchanged",
      unit: goal.unit,
      revision_reason: reason,
      stakeholder_impact: changePercent < -10 ? "스폰서 및 경영진 설명 필요" : "일반적인 운영 조정 범위",
      communication_guidance: changePercent < -10
        ? "변경 사유와 대안적 가치 제공 방안을 함께 설명"
        : changePercent > 10
        ? "팀 동기부여와 함께 추가 리소스 필요성 공유"
        : "정기 업데이트에 포함하여 공지",
    });
  }

  const approvalRequirements = [];
  if (decreased > 0 && majorChanges.length > 0) {
    approvalRequirements.push({
      stakeholder: "경영진",
      approval_needed: true,
      reason: "주요 목표 하향 조정에 대한 승인 필요",
    });
  }
  if (revisedGoals.some(g => g.change_percent < -15)) {
    approvalRequirements.push({
      stakeholder: "스폰서",
      approval_needed: true,
      reason: "스폰서 기대치 관리 및 계약 조건 재검토 필요",
    });
  }

  return {
    revision_id: generateUUID(),
    event_id: validated.event_id,
    revision_summary: {
      total_goals_reviewed: validated.current_goals.length,
      goals_unchanged: unchanged,
      goals_increased: increased,
      goals_decreased: decreased,
      revision_rationale: majorChanges.length > 0
        ? `${majorChanges[0].type} 등 주요 변화 요인 반영`
        : moderateChanges.length > 0
        ? `${moderateChanges[0].type} 등 변화 요인 반영`
        : "현재 진행 상황 기반 미세 조정",
    },
    revised_goals: revisedGoals,
    impact_analysis: {
      strategic_alignment_impact: decreased > increased ? "목표 축소로 전략적 기대치 조정 필요" : "전략 정렬 유지",
      budget_implication: decreased > 0 ? "목표 하향 시 예산 재배분 검토" : "현행 예산 유지",
      timeline_implication: "목표 변경에 따른 마일스톤 재조정 권장",
      risk_implication: decreased > 0 ? "이해관계자 기대 관리 리스크 증가" : "리스크 수준 유지",
    },
    approval_requirements: approvalRequirements,
    rollback_plan: {
      trigger_conditions: [
        "환경 변화 요인 해소 시",
        "추가 리소스 확보 시",
        "이해관계자 요청 시",
      ],
      rollback_steps: [
        "원래 목표 달성 가능성 재평가",
        "필요 리소스 산정",
        "이해관계자 승인 획득",
        "목표 복원 및 커뮤니케이션",
      ],
    },
    recommendations: [
      "목표 변경 내역을 문서화하고 버전 관리하세요.",
      "변경 후 2주 내 진행 상황을 재점검하세요.",
      "이해관계자에게 변경 사유를 투명하게 공유하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
