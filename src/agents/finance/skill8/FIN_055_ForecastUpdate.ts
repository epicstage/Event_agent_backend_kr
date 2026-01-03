/**
 * FIN-055: 예측 업데이트
 *
 * CMP-IS Reference: 8.3.e
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Forecast Update.
CMP-IS Standard: 8.3.e - Updating budget forecasts based on actual performance.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  current_date: z.string(),
  event_date: z.string(),
  original_budget: z.number(),
  spending_to_date: z.object({
    total_spent: z.number(),
    total_committed: z.number(),
    by_category: z.array(z.object({
      category: z.string(),
      spent: z.number(),
      committed: z.number(),
      remaining_budget: z.number(),
    })),
  }),
  registration_actuals: z.object({
    current_registrations: z.number().int(),
    projected_registrations: z.number().int(),
    current_revenue: z.number(),
  }).optional(),
  known_changes: z.array(z.object({
    description: z.string(),
    impact: z.number(),
    confirmed: z.boolean(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  forecast_id: z.string().uuid(),
  event_id: z.string().uuid(),
  forecast_summary: z.object({
    original_budget: z.number(),
    previous_forecast: z.number(),
    current_forecast: z.number(),
    forecast_change: z.number(),
    forecast_change_percentage: z.number(),
    confidence_level: z.number(),
  }),
  expense_forecast: z.object({
    total_forecast: z.number(),
    spent_to_date: z.number(),
    committed: z.number(),
    remaining_to_spend: z.number(),
    by_category: z.array(z.object({
      category: z.string(),
      original: z.number(),
      forecast: z.number(),
      variance: z.number(),
    })),
  }),
  revenue_forecast: z.object({
    total_forecast: z.number(),
    received_to_date: z.number(),
    expected_additional: z.number(),
  }).optional(),
  net_position_forecast: z.object({
    original_projection: z.number(),
    current_projection: z.number(),
    change: z.number(),
  }),
  forecast_drivers: z.array(z.object({
    driver: z.string(),
    impact: z.number(),
    direction: z.enum(["positive", "negative"]),
    certainty: z.enum(["confirmed", "likely", "possible"]),
  })),
  scenario_updates: z.object({
    optimistic: z.number(),
    realistic: z.number(),
    pessimistic: z.number(),
  }),
  recommendations: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalSpent = validated.spending_to_date.total_spent;
  const totalCommitted = validated.spending_to_date.total_committed;
  const remainingBudget = validated.original_budget - totalSpent - totalCommitted;

  // Calculate days progress
  const eventDate = new Date(validated.event_date);
  const currentDate = new Date(validated.current_date);
  const startDate = new Date(eventDate.getTime() - 180 * 24 * 60 * 60 * 1000); // Assume 6 months planning
  const totalDays = (eventDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  const elapsedDays = (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  const progressPercent = Math.min(100, (elapsedDays / totalDays) * 100);

  // Project final spend based on current rate
  const spendRate = totalSpent / (progressPercent / 100);
  const projectedTotal = totalSpent + totalCommitted + (remainingBudget * 0.9); // Assume 90% of remaining

  // Apply known changes
  const confirmedChanges = validated.known_changes?.filter(c => c.confirmed).reduce((sum, c) => sum + c.impact, 0) || 0;

  const currentForecast = projectedTotal + confirmedChanges;
  const forecastChange = currentForecast - validated.original_budget;

  const categoryForecasts = validated.spending_to_date.by_category.map(cat => {
    const forecast = cat.spent + cat.committed + (cat.remaining_budget * 0.85);
    return {
      category: cat.category,
      original: cat.spent + cat.committed + cat.remaining_budget,
      forecast: Math.round(forecast),
      variance: Math.round(forecast - (cat.spent + cat.committed + cat.remaining_budget)),
    };
  });

  const drivers = [
    ...(validated.known_changes || []).map(c => ({
      driver: c.description,
      impact: c.impact,
      direction: c.impact > 0 ? "negative" as const : "positive" as const,
      certainty: c.confirmed ? "confirmed" as const : "likely" as const,
    })),
  ];

  // Revenue forecast if provided
  const revenueForecast = validated.registration_actuals ? {
    total_forecast: Math.round(validated.registration_actuals.current_revenue *
      (validated.registration_actuals.projected_registrations / validated.registration_actuals.current_registrations)),
    received_to_date: validated.registration_actuals.current_revenue,
    expected_additional: Math.round(validated.registration_actuals.current_revenue *
      ((validated.registration_actuals.projected_registrations - validated.registration_actuals.current_registrations) /
        validated.registration_actuals.current_registrations)),
  } : undefined;

  const output: Output = {
    forecast_id: generateUUID(),
    event_id: validated.event_id,
    forecast_summary: {
      original_budget: validated.original_budget,
      previous_forecast: validated.original_budget, // Would be from actual previous forecast
      current_forecast: Math.round(currentForecast),
      forecast_change: Math.round(forecastChange),
      forecast_change_percentage: Math.round((forecastChange / validated.original_budget) * 100 * 10) / 10,
      confidence_level: 80,
    },
    expense_forecast: {
      total_forecast: Math.round(currentForecast),
      spent_to_date: totalSpent,
      committed: totalCommitted,
      remaining_to_spend: Math.round(currentForecast - totalSpent - totalCommitted),
      by_category: categoryForecasts,
    },
    revenue_forecast: revenueForecast,
    net_position_forecast: {
      original_projection: 0, // Would calculate from original
      current_projection: revenueForecast ? revenueForecast.total_forecast - currentForecast : -currentForecast,
      change: 0,
    },
    forecast_drivers: drivers.length > 0 ? drivers : [
      {
        driver: "현재 지출 추세 유지",
        impact: forecastChange,
        direction: forecastChange > 0 ? "negative" : "positive",
        certainty: "likely",
      },
    ],
    scenario_updates: {
      optimistic: Math.round(currentForecast * 0.9),
      realistic: Math.round(currentForecast),
      pessimistic: Math.round(currentForecast * 1.15),
    },
    recommendations: [
      forecastChange > validated.original_budget * 0.1
        ? "예산 초과 위험: 즉각적인 비용 통제 필요"
        : "현재 추세 유지 시 예산 범위 내 완료 예상",
      "다음 주 예측 정확도 향상을 위해 공급사 최종 견적 확정 필요",
      "미확정 변동 사항 조기 확정으로 예측 신뢰도 향상",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-055",
  taskName: "예측 업데이트",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.3.e",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.3: Monitor and Revise Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
