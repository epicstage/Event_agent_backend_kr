/**
 * SITE-029: 숙박-교통 연계
 * CMP-IS Reference: 16.7.a - Housing-transportation coordination
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing-Transportation Coordinator.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_id: z.string(),
  hotel_name: z.string(),
  venue_address: z.string(),
  guests_requiring_transport: z.array(z.object({
    guest_id: z.string(),
    guest_name: z.string(),
    pickup_date: z.string(),
    pickup_time: z.string(),
    destination: z.string(),
  })),
  shuttle_capacity: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  coordination_id: z.string(),
  event_id: z.string(),
  shuttle_schedule: z.array(z.object({
    route_id: z.string(),
    departure_time: z.string(),
    pickup_location: z.string(),
    destination: z.string(),
    passengers: z.array(z.string()),
    capacity_used: z.number(),
  })),
  individual_transfers: z.array(z.object({ guest_id: z.string(), guest_name: z.string(), pickup_time: z.string(), notes: z.string() })),
  logistics_summary: z.object({ total_shuttles: z.number(), total_individual: z.number(), peak_time: z.string() }),
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
  const capacity = validatedInput.shuttle_capacity || 20;

  // Group by time for shuttles
  const byTime: Record<string, string[]> = {};
  for (const g of validatedInput.guests_requiring_transport) {
    const key = `${g.pickup_date}_${g.pickup_time}`;
    if (!byTime[key]) byTime[key] = [];
    byTime[key].push(g.guest_name);
  }

  const shuttleSchedule: Array<{
    route_id: string;
    departure_time: string;
    pickup_location: string;
    destination: string;
    passengers: string[];
    capacity_used: number;
  }> = [];

  const individualTransfers: Array<{ guest_id: string; guest_name: string; pickup_time: string; notes: string }> = [];

  for (const [key, passengers] of Object.entries(byTime)) {
    const [date, time] = key.split("_");
    if (passengers.length >= 5) {
      shuttleSchedule.push({
        route_id: generateUUID().slice(0, 8),
        departure_time: `${date} ${time}`,
        pickup_location: validatedInput.hotel_name,
        destination: validatedInput.venue_address,
        passengers,
        capacity_used: passengers.length,
      });
    } else {
      for (const p of passengers) {
        const guest = validatedInput.guests_requiring_transport.find(g => g.guest_name === p);
        if (guest) {
          individualTransfers.push({
            guest_id: guest.guest_id,
            guest_name: guest.guest_name,
            pickup_time: `${date} ${time}`,
            notes: "개별 차량 배정",
          });
        }
      }
    }
  }

  const peakTime = Object.entries(byTime).sort((a, b) => b[1].length - a[1].length)[0]?.[0]?.split("_")[1] || "09:00";

  return {
    coordination_id: generateUUID(),
    event_id: validatedInput.event_id,
    shuttle_schedule: shuttleSchedule,
    individual_transfers: individualTransfers,
    logistics_summary: {
      total_shuttles: shuttleSchedule.length,
      total_individual: individualTransfers.length,
      peak_time: peakTime,
    },
    recommendations: [
      shuttleSchedule.some(s => s.capacity_used > capacity * 0.8) ? "피크 시간대 추가 셔틀 고려" : "",
      "호텔 로비 대기 공간 확보 권장",
    ].filter(Boolean),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-029",
  taskName: "숙박-교통 연계",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.7.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.7: Transportation Coordination",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
