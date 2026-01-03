/**
 * PRJ-023: 성과 보고
 * CMP-IS Reference: 6.1.j - Performance reporting
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Performance Reporting Agent for event projects.
CMP-IS Standard: 6.1.j - Performance reporting`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  reporting_period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  schedule_data: z.object({
    planned_tasks: z.number(),
    completed_tasks: z.number(),
    delayed_tasks: z.number(),
  }),
  budget_data: z.object({
    planned_budget: z.number(),
    actual_spent: z.number(),
    currency: z.string().default("KRW"),
  }),
  quality_data: z.object({
    checkpoints_total: z.number(),
    checkpoints_passed: z.number(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  reporting_period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  executive_summary: z.string(),
  schedule_performance: z.object({
    spi: z.number(),
    status: z.enum(["on_track", "at_risk", "delayed"]),
    completion_rate: z.number(),
    variance_analysis: z.string(),
  }),
  cost_performance: z.object({
    cpi: z.number(),
    status: z.enum(["under_budget", "on_budget", "over_budget"]),
    budget_utilization: z.number(),
    variance_analysis: z.string(),
  }),
  quality_performance: z.object({
    pass_rate: z.number(),
    status: z.enum(["excellent", "good", "needs_improvement"]),
  }),
  overall_health: z.object({
    status: z.enum(["green", "yellow", "red"]),
    score: z.number(),
    trend: z.enum(["improving", "stable", "declining"]),
  }),
  key_achievements: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendations: z.array(z.string()),
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
  const { schedule_data, budget_data, quality_data } = validatedInput;

  // SPI 계산
  const completionRate = schedule_data.completed_tasks / schedule_data.planned_tasks;
  const spi = completionRate; // Simplified
  const scheduleStatus = spi >= 0.95 ? "on_track" : spi >= 0.8 ? "at_risk" : "delayed";

  // CPI 계산
  const budgetUtilization = budget_data.actual_spent / budget_data.planned_budget;
  const cpi = budget_data.planned_budget > 0 ? (budget_data.planned_budget * completionRate) / budget_data.actual_spent : 1;
  const costStatus = cpi >= 1.05 ? "under_budget" : cpi >= 0.95 ? "on_budget" : "over_budget";

  // 품질 성과
  const qualityPassRate = quality_data
    ? quality_data.checkpoints_passed / quality_data.checkpoints_total * 100
    : 100;
  const qualityStatus = qualityPassRate >= 95 ? "excellent" : qualityPassRate >= 80 ? "good" : "needs_improvement";

  // 전체 상태
  const healthScore = (spi * 40) + (cpi * 40) + (qualityPassRate / 100 * 20);
  const overallStatus = healthScore >= 90 ? "green" : healthScore >= 70 ? "yellow" : "red";

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    reporting_period: validatedInput.reporting_period,
    executive_summary: `${validatedInput.event_name} 프로젝트는 현재 ${overallStatus === "green" ? "정상" : overallStatus === "yellow" ? "주의" : "위험"} 상태입니다. ` +
      `일정 ${Math.round(completionRate * 100)}% 완료, 예산 ${Math.round(budgetUtilization * 100)}% 집행.`,
    schedule_performance: {
      spi: Math.round(spi * 100) / 100,
      status: scheduleStatus,
      completion_rate: Math.round(completionRate * 100),
      variance_analysis: scheduleStatus === "on_track"
        ? "일정 계획대로 진행 중"
        : `${schedule_data.delayed_tasks}개 태스크 지연, 만회 계획 필요`,
    },
    cost_performance: {
      cpi: Math.round(cpi * 100) / 100,
      status: costStatus,
      budget_utilization: Math.round(budgetUtilization * 100),
      variance_analysis: costStatus === "on_budget"
        ? "예산 계획대로 집행 중"
        : costStatus === "under_budget"
        ? "예산 절감 중, 품질 확인 필요"
        : "예산 초과 위험, 비용 통제 필요",
    },
    quality_performance: {
      pass_rate: Math.round(qualityPassRate),
      status: qualityStatus,
    },
    overall_health: {
      status: overallStatus,
      score: Math.round(healthScore),
      trend: spi >= 1 && cpi >= 1 ? "improving" : spi < 0.9 || cpi < 0.9 ? "declining" : "stable",
    },
    key_achievements: [
      `${schedule_data.completed_tasks}개 태스크 완료`,
      `품질 통과율 ${Math.round(qualityPassRate)}% 달성`,
    ],
    concerns: scheduleStatus !== "on_track" || costStatus === "over_budget"
      ? [`일정 지연 ${schedule_data.delayed_tasks}건`, `예산 집행률 ${Math.round(budgetUtilization * 100)}%`]
      : [],
    recommendations: [
      scheduleStatus !== "on_track" ? "지연 태스크 집중 관리" : "현재 일정 유지",
      costStatus === "over_budget" ? "비용 절감 방안 검토" : "예산 계획 유지",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-023",
  taskName: "성과 보고",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.j",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
