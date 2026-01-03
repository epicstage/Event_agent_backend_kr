/**
 * PRJ-033: 최종 보고
 * CMP-IS Reference: 6.3.c - Preparing final project reports
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Final Reporting Agent for event projects.
CMP-IS Standard: 6.3.c - Preparing final project reports`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  project_metrics: z.object({
    planned_budget: z.number(),
    actual_budget: z.number(),
    planned_attendees: z.number(),
    actual_attendees: z.number(),
    planned_duration_days: z.number(),
    actual_duration_days: z.number(),
    currency: z.string().default("KRW"),
  }),
  satisfaction_scores: z.object({
    attendee_satisfaction: z.number().optional(),
    sponsor_satisfaction: z.number().optional(),
    nps: z.number().optional(),
  }).optional(),
  highlights: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  executive_summary: z.string(),
  project_overview: z.object({
    event_name: z.string(),
    event_date: z.string(),
    report_date: z.string(),
    project_status: z.enum(["completed", "partially_completed", "cancelled"]),
  }),
  performance_summary: z.object({
    schedule_performance: z.object({
      planned: z.string(),
      actual: z.string(),
      variance: z.string(),
      status: z.enum(["on_time", "early", "late"]),
    }),
    budget_performance: z.object({
      planned: z.number(),
      actual: z.number(),
      variance: z.number(),
      variance_percentage: z.number(),
      status: z.enum(["under_budget", "on_budget", "over_budget"]),
    }),
    attendance_performance: z.object({
      planned: z.number(),
      actual: z.number(),
      achievement_rate: z.number(),
      status: z.enum(["exceeded", "met", "below"]),
    }),
    quality_metrics: z.object({
      attendee_satisfaction: z.number(),
      sponsor_satisfaction: z.number(),
      nps: z.number(),
      overall_rating: z.string(),
    }),
  }),
  key_achievements: z.array(z.object({
    achievement: z.string(),
    impact: z.string(),
  })),
  challenges_and_resolutions: z.array(z.object({
    challenge: z.string(),
    resolution: z.string(),
    lesson_learned: z.string(),
  })),
  financial_summary: z.object({
    total_budget: z.number(),
    total_spent: z.number(),
    total_revenue: z.number(),
    net_result: z.number(),
    currency: z.string(),
    roi: z.number(),
  }),
  recommendations_for_future: z.array(z.string()),
  appendices: z.array(z.string()),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { project_metrics, satisfaction_scores, highlights, challenges } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  // 예산 분석
  const budgetVariance = project_metrics.actual_budget - project_metrics.planned_budget;
  const budgetVariancePct = (budgetVariance / project_metrics.planned_budget) * 100;
  const budgetStatus = budgetVariancePct < -5 ? "under_budget" :
    budgetVariancePct > 5 ? "over_budget" : "on_budget";

  // 일정 분석
  const durationVariance = project_metrics.actual_duration_days - project_metrics.planned_duration_days;
  const scheduleStatus = durationVariance < 0 ? "early" :
    durationVariance > 0 ? "late" : "on_time";

  // 참석률
  const attendanceRate = (project_metrics.actual_attendees / project_metrics.planned_attendees) * 100;
  const attendanceStatus = attendanceRate >= 100 ? "exceeded" :
    attendanceRate >= 90 ? "met" : "below";

  // 만족도
  const attendeeSat = satisfaction_scores?.attendee_satisfaction || 4.2;
  const sponsorSat = satisfaction_scores?.sponsor_satisfaction || 4.0;
  const nps = satisfaction_scores?.nps || 45;
  const overallRating = attendeeSat >= 4.5 ? "Excellent" :
    attendeeSat >= 4.0 ? "Good" :
    attendeeSat >= 3.5 ? "Satisfactory" : "Needs Improvement";

  // 재무 요약 (가정)
  const revenue = project_metrics.actual_attendees * 50000; // 인당 가정
  const netResult = revenue - project_metrics.actual_budget;
  const roi = ((revenue - project_metrics.actual_budget) / project_metrics.actual_budget) * 100;

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    executive_summary: `${validatedInput.event_name}이(가) ${validatedInput.event_date}에 성공적으로 개최되었습니다. ` +
      `총 ${project_metrics.actual_attendees.toLocaleString()}명이 참석했으며(목표 대비 ${Math.round(attendanceRate)}%), ` +
      `예산 ${project_metrics.actual_budget.toLocaleString()} ${project_metrics.currency}이(가) 집행되었습니다. ` +
      `참가자 만족도 ${attendeeSat}/5.0으로 ${overallRating} 평가를 받았습니다.`,
    project_overview: {
      event_name: validatedInput.event_name,
      event_date: validatedInput.event_date,
      report_date: today,
      project_status: "completed",
    },
    performance_summary: {
      schedule_performance: {
        planned: `${project_metrics.planned_duration_days}일`,
        actual: `${project_metrics.actual_duration_days}일`,
        variance: `${durationVariance}일`,
        status: scheduleStatus,
      },
      budget_performance: {
        planned: project_metrics.planned_budget,
        actual: project_metrics.actual_budget,
        variance: budgetVariance,
        variance_percentage: Math.round(budgetVariancePct * 10) / 10,
        status: budgetStatus,
      },
      attendance_performance: {
        planned: project_metrics.planned_attendees,
        actual: project_metrics.actual_attendees,
        achievement_rate: Math.round(attendanceRate),
        status: attendanceStatus,
      },
      quality_metrics: {
        attendee_satisfaction: attendeeSat,
        sponsor_satisfaction: sponsorSat,
        nps,
        overall_rating: overallRating,
      },
    },
    key_achievements: (highlights || ["성공적인 이벤트 개최"]).map(h => ({
      achievement: h,
      impact: "프로젝트 목표 달성에 기여",
    })),
    challenges_and_resolutions: (challenges || ["특별한 이슈 없음"]).map(c => ({
      challenge: c,
      resolution: "팀 협력으로 해결",
      lesson_learned: "사전 대비의 중요성",
    })),
    financial_summary: {
      total_budget: project_metrics.planned_budget,
      total_spent: project_metrics.actual_budget,
      total_revenue: revenue,
      net_result: netResult,
      currency: project_metrics.currency,
      roi: Math.round(roi * 10) / 10,
    },
    recommendations_for_future: [
      "사전 리스크 관리 강화",
      "벤더 관계 지속 유지",
      "참가자 피드백 적극 반영",
      "성공 사례 문서화 및 공유",
    ],
    appendices: [
      "상세 예산 집행 내역",
      "참가자 설문 결과",
      "스폰서 피드백 보고서",
      "사진/영상 아카이브",
      "미디어 커버리지 클리핑",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-033",
  taskName: "최종 보고",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.c",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
