/**
 * MKT-030: 전환 추적
 * CMP-IS Reference: 8.3.b - Conversion tracking and attribution
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Conversion Tracking Agent.
CMP-IS Standard: 8.3.b - Tracking conversions and attribution across channels.`;

export const InputSchema = z.object({
  event_id: z.string(),
  tracking_period: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  attribution_model: z.string().default("last_click"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tracking_id: z.string(),
  event_id: z.string(),
  conversion_summary: z.object({
    total_conversions: z.number(),
    total_revenue: z.number(),
    conversion_rate: z.number(),
    average_order_value: z.number(),
  }),
  conversion_funnel: z.array(z.object({
    stage: z.string(),
    users: z.number(),
    conversion_rate: z.number(),
    drop_off_rate: z.number(),
  })),
  attribution_analysis: z.array(z.object({
    channel: z.string(),
    first_touch_conversions: z.number(),
    last_touch_conversions: z.number(),
    linear_conversions: z.number(),
    assisted_conversions: z.number(),
    conversion_value: z.number(),
  })),
  conversion_paths: z.array(z.object({
    path: z.string(),
    conversions: z.number(),
    percentage: z.number(),
    avg_time_to_convert: z.string(),
  })),
  tracking_health: z.object({
    pixel_status: z.string(),
    events_tracked: z.array(z.string()),
    data_quality_score: z.number(),
    issues: z.array(z.string()),
  }),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  return {
    tracking_id: generateUUID(),
    event_id: validatedInput.event_id,
    conversion_summary: {
      total_conversions: 1500,
      total_revenue: 75000000,
      conversion_rate: 3.2,
      average_order_value: 50000,
    },
    conversion_funnel: [
      { stage: "사이트 방문", users: 50000, conversion_rate: 100, drop_off_rate: 0 },
      { stage: "랜딩페이지 뷰", users: 45000, conversion_rate: 90, drop_off_rate: 10 },
      { stage: "등록 시작", users: 8000, conversion_rate: 17.8, drop_off_rate: 82.2 },
      { stage: "정보 입력", users: 5000, conversion_rate: 62.5, drop_off_rate: 37.5 },
      { stage: "결제", users: 2000, conversion_rate: 40, drop_off_rate: 60 },
      { stage: "등록 완료", users: 1500, conversion_rate: 75, drop_off_rate: 25 },
    ],
    attribution_analysis: [
      { channel: "Paid Search", first_touch_conversions: 400, last_touch_conversions: 500, linear_conversions: 450, assisted_conversions: 200, conversion_value: 25000000 },
      { channel: "Paid Social", first_touch_conversions: 350, last_touch_conversions: 300, linear_conversions: 325, assisted_conversions: 300, conversion_value: 16250000 },
      { channel: "Email", first_touch_conversions: 50, last_touch_conversions: 400, linear_conversions: 225, assisted_conversions: 100, conversion_value: 20000000 },
      { channel: "Organic Search", first_touch_conversions: 200, last_touch_conversions: 150, linear_conversions: 175, assisted_conversions: 150, conversion_value: 8750000 },
      { channel: "Direct", first_touch_conversions: 100, last_touch_conversions: 150, linear_conversions: 125, assisted_conversions: 50, conversion_value: 5000000 },
    ],
    conversion_paths: [
      { path: "Paid Search → Direct → Email", conversions: 250, percentage: 16.7, avg_time_to_convert: "5.2일" },
      { path: "Paid Social → Paid Search", conversions: 180, percentage: 12.0, avg_time_to_convert: "3.8일" },
      { path: "Organic Search → Email", conversions: 150, percentage: 10.0, avg_time_to_convert: "7.1일" },
      { path: "Direct (단일 터치)", conversions: 120, percentage: 8.0, avg_time_to_convert: "0.5일" },
      { path: "Paid Social → Email", conversions: 100, percentage: 6.7, avg_time_to_convert: "4.5일" },
    ],
    tracking_health: {
      pixel_status: "active",
      events_tracked: ["PageView", "ViewContent", "InitiateRegistration", "AddPaymentInfo", "Purchase"],
      data_quality_score: 92,
      issues: ["일부 모바일 Safari에서 ITP로 인한 데이터 손실 가능성"],
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-030";
export const taskName = "전환 추적";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.3.b";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.3: Performance Monitoring";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
