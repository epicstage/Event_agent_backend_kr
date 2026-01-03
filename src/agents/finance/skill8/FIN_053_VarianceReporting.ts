/**
 * FIN-053: 차이 보고
 *
 * CMP-IS Reference: 8.3.c
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Variance Reporting.
CMP-IS Standard: 8.3.c - Creating variance reports for stakeholders.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  analysis_id: z.string().uuid().optional(),
  variance_data: z.array(z.object({
    category: z.string(),
    budgeted: z.number(),
    actual: z.number(),
    variance: z.number(),
    variance_percentage: z.number(),
  })),
  report_period: z.string(),
  audience: z.enum(["executive", "finance", "operations"]),
  previous_report: z.object({
    total_variance: z.number(),
    key_issues: z.array(z.string()),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  report_header: z.object({
    title: z.string(),
    period: z.string(),
    generated_date: z.string(),
    audience: z.string(),
  }),
  executive_summary: z.object({
    overall_status: z.enum(["on_track", "attention_needed", "critical"]),
    status_narrative: z.string(),
    key_highlights: z.array(z.string()),
    period_comparison: z.string().optional(),
  }),
  variance_summary_table: z.array(z.object({
    category: z.string(),
    budget: z.string(),
    actual: z.string(),
    variance: z.string(),
    variance_pct: z.string(),
    status_icon: z.string(),
  })),
  detailed_explanations: z.array(z.object({
    category: z.string(),
    variance_explanation: z.string(),
    impact_assessment: z.string(),
    corrective_actions: z.array(z.string()),
    owner: z.string(),
    deadline: z.string(),
  })),
  trend_analysis: z.object({
    current_trajectory: z.string(),
    month_over_month_change: z.string().optional(),
    projection_narrative: z.string(),
  }),
  action_items: z.array(z.object({
    action: z.string(),
    responsible: z.string(),
    due_date: z.string(),
    status: z.enum(["new", "in_progress", "completed"]),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalBudget = validated.variance_data.reduce((sum, v) => sum + v.budgeted, 0);
  const totalActual = validated.variance_data.reduce((sum, v) => sum + v.actual, 0);
  const totalVariance = totalActual - totalBudget;
  const totalVariancePct = (totalVariance / totalBudget) * 100;

  const overBudgetItems = validated.variance_data.filter(v => v.variance > 0);
  const underBudgetItems = validated.variance_data.filter(v => v.variance < 0);

  const overallStatus = Math.abs(totalVariancePct) > 15 ? "critical" :
    Math.abs(totalVariancePct) > 8 ? "attention_needed" : "on_track";

  const summaryTable = validated.variance_data.map(v => ({
    category: v.category,
    budget: `${v.budgeted.toLocaleString()}원`,
    actual: `${v.actual.toLocaleString()}원`,
    variance: `${v.variance >= 0 ? "+" : ""}${v.variance.toLocaleString()}원`,
    variance_pct: `${v.variance_percentage >= 0 ? "+" : ""}${v.variance_percentage.toFixed(1)}%`,
    status_icon: Math.abs(v.variance_percentage) > 15 ? "🔴" :
      Math.abs(v.variance_percentage) > 8 ? "🟡" : "🟢",
  }));

  const detailedExplanations = overBudgetItems.slice(0, 3).map(v => ({
    category: v.category,
    variance_explanation: `${v.category} 예산 대비 ${Math.abs(v.variance).toLocaleString()}원 초과 (${v.variance_percentage.toFixed(1)}%)`,
    impact_assessment: `전체 예산에 ${((v.variance / totalBudget) * 100).toFixed(1)}% 영향`,
    corrective_actions: [
      "해당 카테고리 추가 지출 동결",
      "대안 공급사 검토",
      "필수/선택 항목 재분류",
    ],
    owner: "카테고리 담당자",
    deadline: "D-30",
  }));

  const output: Output = {
    report_id: generateUUID(),
    event_id: validated.event_id,
    report_header: {
      title: `예산 차이 분석 보고서 - ${validated.audience === "executive" ? "경영진용" : validated.audience === "finance" ? "재무팀용" : "운영팀용"}`,
      period: validated.report_period,
      generated_date: nowISO(),
      audience: validated.audience,
    },
    executive_summary: {
      overall_status: overallStatus,
      status_narrative: overallStatus === "on_track"
        ? `전체 예산 ${totalVariancePct >= 0 ? "+" : ""}${totalVariancePct.toFixed(1)}% 범위 내 정상 운영 중입니다.`
        : overallStatus === "attention_needed"
          ? `예산 대비 ${Math.abs(totalVariancePct).toFixed(1)}% 차이 발생. 일부 항목 모니터링 강화가 필요합니다.`
          : `예산 대비 ${Math.abs(totalVariancePct).toFixed(1)}% 초과. 즉각적인 조치가 필요합니다.`,
      key_highlights: [
        `총 예산: ${totalBudget.toLocaleString()}원`,
        `실제 지출: ${totalActual.toLocaleString()}원`,
        `차이: ${totalVariance >= 0 ? "+" : ""}${totalVariance.toLocaleString()}원 (${totalVariancePct.toFixed(1)}%)`,
        overBudgetItems.length > 0 ? `초과 항목: ${overBudgetItems.length}개` : "초과 항목 없음",
      ],
      period_comparison: validated.previous_report
        ? `전기 대비 차이 ${validated.previous_report.total_variance > totalVariance ? "개선" : "악화"}`
        : undefined,
    },
    variance_summary_table: summaryTable,
    detailed_explanations: detailedExplanations.length > 0 ? detailedExplanations : [
      {
        category: "전체",
        variance_explanation: "주요 차이 항목 없음",
        impact_assessment: "정상 범위 내 운영",
        corrective_actions: ["현행 유지"],
        owner: "프로젝트 매니저",
        deadline: "해당 없음",
      },
    ],
    trend_analysis: {
      current_trajectory: overallStatus === "critical" ? "상향 추세 - 조치 필요" :
        overallStatus === "attention_needed" ? "주시 필요 - 안정화 중" : "안정적",
      month_over_month_change: validated.previous_report
        ? `전월 대비 ${totalVariance > validated.previous_report.total_variance ? "증가" : "감소"}`
        : undefined,
      projection_narrative: `현 추세 유지 시 이벤트 종료 시점 예상 차이: ${(totalVariancePct * 1.2).toFixed(1)}%`,
    },
    action_items: [
      {
        action: "주요 초과 항목 원인 분석 완료",
        responsible: "재무팀",
        due_date: "D-25",
        status: "new",
      },
      {
        action: "비용 통제 방안 수립",
        responsible: "운영팀",
        due_date: "D-20",
        status: "new",
      },
      {
        action: "경영진 보고",
        responsible: "프로젝트 매니저",
        due_date: "D-18",
        status: "new",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-053",
  taskName: "차이 보고",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.3.c",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.3: Monitor and Revise Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
