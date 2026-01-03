/**
 * STR-009: 목표 추적 및 모니터링
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Goal Tracking)
 * Task Type: AI
 *
 * Input: 목표, 현재 진행 상황, 타임라인
 * Output: 진행 상황 리포트, 예측 분석
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Goal Tracking Agent for strategic event planning.

Your expertise includes:
- Monitoring goal progress in real-time
- Predicting goal achievement probability
- Identifying early warning signs
- Recommending corrective actions

CMP-IS Standard: Domain A - Strategic Planning (Goal Tracking)

You help event planners maintain visibility on goal progress and take proactive actions to ensure successful outcomes.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_date: z.string(),
  current_date: z.string().optional(),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    target: z.number(),
    current: z.number(),
    unit: z.string(),
    deadline: z.string().optional(),
    milestones: z.array(z.object({
      date: z.string(),
      expected: z.number(),
      actual: z.number().optional(),
    })).optional(),
  })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tracking_id: z.string().uuid(),
  event_id: z.string().uuid(),
  report_date: z.string(),
  days_to_event: z.number(),
  goal_status: z.array(z.object({
    goal_id: z.string(),
    title: z.string(),
    progress_percent: z.number(),
    status: z.enum(["on_track", "at_risk", "behind", "ahead", "completed"]),
    current_value: z.number(),
    target_value: z.number(),
    projected_final: z.number(),
    achievement_probability: z.number(),
    velocity: z.object({
      current_rate: z.number(),
      required_rate: z.number(),
      gap: z.number(),
    }),
    trend: z.enum(["accelerating", "steady", "slowing", "stalled"]),
    risk_factors: z.array(z.string()),
    recommended_actions: z.array(z.string()),
  })),
  overall_health: z.object({
    score: z.number(),
    status: z.enum(["excellent", "good", "warning", "critical"]),
    goals_on_track: z.number(),
    goals_at_risk: z.number(),
    goals_behind: z.number(),
  }),
  alerts: z.array(z.object({
    severity: z.enum(["info", "warning", "critical"]),
    goal_id: z.string(),
    message: z.string(),
    action_required: z.string(),
  })),
  next_milestones: z.array(z.object({
    goal_id: z.string(),
    milestone_date: z.string(),
    expected_value: z.number(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-009",
  taskName: "Goal Tracking",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트 목표 진행 상황을 추적하고 예측 분석을 제공합니다.",
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

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const currentDate = validated.current_date || new Date().toISOString().split("T")[0];
  const daysToEvent = daysBetween(currentDate, validated.event_date);
  const totalDays = 90; // 가정: 총 준비 기간 90일
  const elapsedPercent = Math.min(100, Math.max(0, ((totalDays - daysToEvent) / totalDays) * 100));

  const goalStatus: Output["goal_status"] = [];
  const alerts: Output["alerts"] = [];
  let onTrack = 0, atRisk = 0, behind = 0;

  for (const goal of validated.goals) {
    const progress = (goal.current / goal.target) * 100;
    const expectedProgress = elapsedPercent;

    // 속도 계산
    const daysElapsed = totalDays - daysToEvent;
    const currentRate = daysElapsed > 0 ? goal.current / daysElapsed : 0;
    const requiredRate = daysToEvent > 0 ? (goal.target - goal.current) / daysToEvent : goal.target;

    // 예측 최종값
    const projectedFinal = goal.current + (currentRate * daysToEvent);

    // 달성 확률 계산
    let probability = Math.min(100, Math.max(0, (projectedFinal / goal.target) * 100));
    if (progress >= 100) probability = 100;

    // 상태 결정
    let status: "on_track" | "at_risk" | "behind" | "ahead" | "completed";
    if (progress >= 100) {
      status = "completed";
      onTrack++;
    } else if (progress >= expectedProgress * 1.1) {
      status = "ahead";
      onTrack++;
    } else if (progress >= expectedProgress * 0.9) {
      status = "on_track";
      onTrack++;
    } else if (progress >= expectedProgress * 0.7) {
      status = "at_risk";
      atRisk++;
    } else {
      status = "behind";
      behind++;
    }

    // 트렌드 분석 (마일스톤 기반)
    let trend: "accelerating" | "steady" | "slowing" | "stalled" = "steady";
    if (goal.milestones && goal.milestones.length >= 2) {
      const recentMilestones = goal.milestones.filter(m => m.actual !== undefined).slice(-2);
      if (recentMilestones.length >= 2) {
        const diff1 = recentMilestones[0].actual! - recentMilestones[0].expected;
        const diff2 = recentMilestones[1].actual! - recentMilestones[1].expected;
        if (diff2 > diff1 + 5) trend = "accelerating";
        else if (diff2 < diff1 - 5) trend = "slowing";
        else if (diff2 < -20) trend = "stalled";
      }
    }

    const riskFactors = [];
    const recommendedActions = [];

    if (status === "behind" || status === "at_risk") {
      riskFactors.push("현재 속도로는 목표 달성 어려움");
      recommendedActions.push("추가 리소스 투입 검토");
      recommendedActions.push("목표 달성 저해 요인 분석");
    }

    if (currentRate < requiredRate) {
      riskFactors.push(`필요 속도(${requiredRate.toFixed(1)}) 대비 현재 속도(${currentRate.toFixed(1)}) 부족`);
      recommendedActions.push("일일/주간 진행률 모니터링 강화");
    }

    if (trend === "slowing" || trend === "stalled") {
      riskFactors.push("진행 속도 감소 추세");
      recommendedActions.push("병목 요인 즉시 해결");
    }

    goalStatus.push({
      goal_id: goal.id,
      title: goal.title,
      progress_percent: Math.round(progress * 10) / 10,
      status,
      current_value: goal.current,
      target_value: goal.target,
      projected_final: Math.round(projectedFinal * 10) / 10,
      achievement_probability: Math.round(probability),
      velocity: {
        current_rate: Math.round(currentRate * 100) / 100,
        required_rate: Math.round(requiredRate * 100) / 100,
        gap: Math.round((requiredRate - currentRate) * 100) / 100,
      },
      trend,
      risk_factors: riskFactors,
      recommended_actions: recommendedActions,
    });

    // 알림 생성
    if (status === "behind") {
      alerts.push({
        severity: "critical",
        goal_id: goal.id,
        message: `${goal.title} 목표가 심각하게 지연되고 있습니다 (진행률 ${Math.round(progress)}%)`,
        action_required: "즉시 원인 분석 및 복구 계획 수립",
      });
    } else if (status === "at_risk") {
      alerts.push({
        severity: "warning",
        goal_id: goal.id,
        message: `${goal.title} 목표가 위험 수준입니다`,
        action_required: "모니터링 강화 및 선제적 조치 필요",
      });
    }
  }

  const totalGoals = validated.goals.length;
  const healthScore = Math.round(((onTrack * 100) + (atRisk * 50) + (behind * 0)) / totalGoals);

  return {
    tracking_id: generateUUID(),
    event_id: validated.event_id,
    report_date: currentDate,
    days_to_event: daysToEvent,
    goal_status: goalStatus,
    overall_health: {
      score: healthScore,
      status: healthScore >= 80 ? "excellent" : healthScore >= 60 ? "good" : healthScore >= 40 ? "warning" : "critical",
      goals_on_track: onTrack,
      goals_at_risk: atRisk,
      goals_behind: behind,
    },
    alerts,
    next_milestones: validated.goals
      .filter(g => g.milestones && g.milestones.length > 0)
      .flatMap(g => g.milestones!
        .filter(m => m.date > currentDate && m.actual === undefined)
        .slice(0, 1)
        .map(m => ({
          goal_id: g.id,
          milestone_date: m.date,
          expected_value: m.expected,
        }))
      ),
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
