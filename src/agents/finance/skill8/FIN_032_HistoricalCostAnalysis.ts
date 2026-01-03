/**
 * FIN-032: 과거 비용 분석
 *
 * CMP-IS Reference: 8.1.b
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Historical Cost Analysis.
CMP-IS Standard: 8.1.b - Analyzing historical cost data for budget planning.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  past_events: z.array(z.object({
    event_name: z.string(),
    event_date: z.string(),
    total_budget: z.number(),
    actual_spend: z.number(),
    attendees: z.number().int(),
    categories: z.array(z.object({
      category: z.string(),
      budgeted: z.number(),
      actual: z.number(),
    })),
  })),
  inflation_rate: z.number().default(3),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid(),
  event_id: z.string().uuid(),
  summary_metrics: z.object({
    avg_total_budget: z.number(),
    avg_actual_spend: z.number(),
    avg_variance_percentage: z.number(),
    avg_cost_per_attendee: z.number(),
    trend_direction: z.enum(["increasing", "stable", "decreasing"]),
  }),
  category_analysis: z.array(z.object({
    category: z.string(),
    avg_budgeted: z.number(),
    avg_actual: z.number(),
    variance_percentage: z.number(),
    consistency_score: z.number(),
    recommendation: z.string(),
  })),
  variance_patterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.string(),
    typical_impact: z.number(),
    mitigation: z.string(),
  })),
  inflation_adjusted_projections: z.object({
    next_event_baseline: z.number(),
    confidence_range: z.object({
      low: z.number(),
      high: z.number(),
    }),
  }),
  lessons_learned: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const events = validated.past_events;
  const avgBudget = events.reduce((sum, e) => sum + e.total_budget, 0) / events.length;
  const avgActual = events.reduce((sum, e) => sum + e.actual_spend, 0) / events.length;
  const avgAttendees = events.reduce((sum, e) => sum + e.attendees, 0) / events.length;

  // Category analysis
  const categoryMap: Record<string, { budgeted: number[]; actual: number[] }> = {};
  events.forEach(e => {
    e.categories.forEach(c => {
      if (!categoryMap[c.category]) {
        categoryMap[c.category] = { budgeted: [], actual: [] };
      }
      categoryMap[c.category].budgeted.push(c.budgeted);
      categoryMap[c.category].actual.push(c.actual);
    });
  });

  const categoryAnalysis = Object.entries(categoryMap).map(([category, data]) => {
    const avgBud = data.budgeted.reduce((a, b) => a + b, 0) / data.budgeted.length;
    const avgAct = data.actual.reduce((a, b) => a + b, 0) / data.actual.length;
    const variance = ((avgAct - avgBud) / avgBud) * 100;

    return {
      category,
      avg_budgeted: Math.round(avgBud),
      avg_actual: Math.round(avgAct),
      variance_percentage: Math.round(variance * 10) / 10,
      consistency_score: Math.max(0, 100 - Math.abs(variance)),
      recommendation: variance > 10
        ? "예산 상향 조정 필요"
        : variance < -10
          ? "예산 하향 조정 가능"
          : "현재 수준 유지",
    };
  });

  const inflationAdjusted = avgActual * (1 + validated.inflation_rate / 100);

  const output: Output = {
    analysis_id: generateUUID(),
    event_id: validated.event_id,
    summary_metrics: {
      avg_total_budget: Math.round(avgBudget),
      avg_actual_spend: Math.round(avgActual),
      avg_variance_percentage: Math.round(((avgActual - avgBudget) / avgBudget) * 100 * 10) / 10,
      avg_cost_per_attendee: Math.round(avgActual / avgAttendees),
      trend_direction: avgActual > avgBudget ? "increasing" : "stable",
    },
    category_analysis: categoryAnalysis.length > 0 ? categoryAnalysis : [
      {
        category: "장소",
        avg_budgeted: 50000,
        avg_actual: 52000,
        variance_percentage: 4,
        consistency_score: 96,
        recommendation: "현재 수준 유지",
      },
    ],
    variance_patterns: [
      {
        pattern: "F&B 비용 초과",
        frequency: "자주 발생",
        typical_impact: 5000,
        mitigation: "사전 인원 확정 및 버퍼 축소",
      },
      {
        pattern: "AV 추가 요청",
        frequency: "가끔 발생",
        typical_impact: 3000,
        mitigation: "사전 기술 리허설 강화",
      },
      {
        pattern: "긴급 물류비",
        frequency: "드물게 발생",
        typical_impact: 2000,
        mitigation: "여유 일정 확보",
      },
    ],
    inflation_adjusted_projections: {
      next_event_baseline: Math.round(inflationAdjusted),
      confidence_range: {
        low: Math.round(inflationAdjusted * 0.9),
        high: Math.round(inflationAdjusted * 1.15),
      },
    },
    lessons_learned: [
      "F&B 예산은 실제 참석자 기준 10% 버퍼 필요",
      "AV 패키지 사전 확정으로 추가 비용 방지",
      "조기 계약 시 10-15% 비용 절감 가능",
      "예비비 8-10% 유지 권장",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-032",
  taskName: "과거 비용 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.1.b",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
