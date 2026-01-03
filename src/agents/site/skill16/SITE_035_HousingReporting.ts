/**
 * SITE-035: 숙박 리포팅
 * CMP-IS Reference: 16.10.a - Housing reporting
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Reporting Analyst.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  reporting_period: z.object({ start: z.string(), end: z.string() }),
  hotel_data: z.array(z.object({
    hotel_name: z.string(),
    rooms_blocked: z.number(),
    rooms_reserved: z.number(),
    revenue: z.number(),
    avg_daily_rate: z.number(),
  })),
  guest_demographics: z.object({
    total_guests: z.number(),
    by_type: z.record(z.number()),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  report_title: z.string(),
  executive_summary: z.object({
    total_room_nights: z.number(),
    total_revenue: z.number(),
    overall_pickup_rate: z.number(),
    avg_daily_rate: z.number(),
  }),
  hotel_performance: z.array(z.object({
    hotel: z.string(),
    pickup_rate: z.number(),
    revenue: z.number(),
    revenue_share: z.number(),
  })),
  trends: z.array(z.object({ metric: z.string(), value: z.number(), trend: z.string() })),
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
  const totalBlocked = validatedInput.hotel_data.reduce((sum, h) => sum + h.rooms_blocked, 0);
  const totalReserved = validatedInput.hotel_data.reduce((sum, h) => sum + h.rooms_reserved, 0);
  const totalRevenue = validatedInput.hotel_data.reduce((sum, h) => sum + h.revenue, 0);
  const avgRate = totalRevenue / totalReserved || 0;

  const hotelPerformance = validatedInput.hotel_data.map(h => ({
    hotel: h.hotel_name,
    pickup_rate: Math.round((h.rooms_reserved / h.rooms_blocked) * 100),
    revenue: h.revenue,
    revenue_share: Math.round((h.revenue / totalRevenue) * 100),
  }));

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    report_title: `${validatedInput.event_name} 숙박 현황 리포트`,
    executive_summary: {
      total_room_nights: totalReserved,
      total_revenue: totalRevenue,
      overall_pickup_rate: Math.round((totalReserved / totalBlocked) * 100),
      avg_daily_rate: Math.round(avgRate),
    },
    hotel_performance: hotelPerformance,
    trends: [
      { metric: "픽업률", value: Math.round((totalReserved / totalBlocked) * 100), trend: totalReserved > totalBlocked * 0.7 ? "positive" : "negative" },
      { metric: "ADR", value: Math.round(avgRate), trend: "stable" },
    ],
    recommendations: [
      totalReserved < totalBlocked * 0.7 ? "픽업률 향상을 위한 마케팅 강화 필요" : "현재 픽업률 양호",
      "고성과 호텔과의 파트너십 강화 권장",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-035",
  taskName: "숙박 리포팅",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.10.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.10: Reporting & Analytics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
