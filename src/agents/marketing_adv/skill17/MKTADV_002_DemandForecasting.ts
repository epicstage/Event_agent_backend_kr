/**
 * MKTADV-002: 수요 예측
 * CMP-IS Reference: 17.1.b - Demand forecasting for events
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Demand Forecasting Analyst for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_date: z.string(),
  event_type: z.enum(["conference", "exhibition", "seminar", "workshop", "festival", "corporate"]),
  historical_data: z.array(z.object({
    event_name: z.string(),
    date: z.string(),
    registrations: z.number(),
    attendees: z.number(),
  })).optional(),
  market_factors: z.object({
    economic_conditions: z.enum(["strong", "moderate", "weak"]).optional(),
    competitor_events: z.number().optional(),
    industry_trend: z.enum(["growing", "stable", "declining"]).optional(),
  }).optional(),
  target_audience_size: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  forecast_id: z.string(),
  event_id: z.string(),
  registration_forecast: z.object({
    pessimistic: z.number(),
    expected: z.number(),
    optimistic: z.number(),
    confidence_interval: z.number(),
  }),
  attendance_forecast: z.object({
    expected_rate: z.number(),
    expected_attendees: z.number(),
    no_show_rate: z.number(),
  }),
  timeline_forecast: z.array(z.object({
    weeks_before: z.number(),
    cumulative_registrations_percent: z.number(),
  })),
  demand_drivers: z.array(z.object({
    factor: z.string(),
    impact: z.enum(["positive", "negative", "neutral"]),
    weight: z.number(),
  })),
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

  const baseRegistrations = validatedInput.target_audience_size
    ? Math.floor(validatedInput.target_audience_size * 0.05)
    : 500;

  const expected = baseRegistrations + Math.floor(Math.random() * 200);
  const pessimistic = Math.floor(expected * 0.7);
  const optimistic = Math.floor(expected * 1.4);

  const timelineForecast = [
    { weeks_before: 12, cumulative_registrations_percent: 10 },
    { weeks_before: 8, cumulative_registrations_percent: 25 },
    { weeks_before: 6, cumulative_registrations_percent: 40 },
    { weeks_before: 4, cumulative_registrations_percent: 60 },
    { weeks_before: 2, cumulative_registrations_percent: 80 },
    { weeks_before: 1, cumulative_registrations_percent: 92 },
    { weeks_before: 0, cumulative_registrations_percent: 100 },
  ];

  const demandDrivers = [
    { factor: "산업 트렌드", impact: "positive" as const, weight: 0.25 },
    { factor: "연사 라인업", impact: "positive" as const, weight: 0.20 },
    { factor: "가격 경쟁력", impact: "neutral" as const, weight: 0.15 },
    { factor: "경쟁 이벤트", impact: "negative" as const, weight: 0.10 },
    { factor: "시즌 요인", impact: "positive" as const, weight: 0.15 },
    { factor: "마케팅 효과", impact: "positive" as const, weight: 0.15 },
  ];

  return {
    forecast_id: generateUUID(),
    event_id: validatedInput.event_id,
    registration_forecast: {
      pessimistic,
      expected,
      optimistic,
      confidence_interval: 85,
    },
    attendance_forecast: {
      expected_rate: 78,
      expected_attendees: Math.floor(expected * 0.78),
      no_show_rate: 22,
    },
    timeline_forecast: timelineForecast,
    demand_drivers: demandDrivers,
    recommendations: [
      "조기 등록 할인으로 12주 전 등록률 20%까지 끌어올리기",
      "4주 전 리마인더 캠페인 강화로 후반 등록 촉진",
      "경쟁 이벤트 분석 후 차별화 포인트 강조",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-002",
  taskName: "수요 예측",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.1.b",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.1: Data Analysis",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
