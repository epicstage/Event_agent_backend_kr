/**
 * SITE-027: 체크인/체크아웃 관리
 * CMP-IS Reference: 16.6.a - Check-in/check-out management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Check-in/Check-out Coordinator.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_id: z.string(),
  guests: z.array(z.object({
    guest_id: z.string(),
    guest_name: z.string(),
    check_in_date: z.string(),
    check_out_date: z.string(),
    arrival_time: z.string().optional(),
    departure_time: z.string().optional(),
  })),
  hotel_policies: z.object({ check_in_time: z.string(), check_out_time: z.string() }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  schedule_id: z.string(),
  event_id: z.string(),
  check_in_schedule: z.array(z.object({ date: z.string(), guests: z.array(z.object({ guest_id: z.string(), guest_name: z.string(), time: z.string() })) })),
  check_out_schedule: z.array(z.object({ date: z.string(), guests: z.array(z.object({ guest_id: z.string(), guest_name: z.string(), time: z.string() })) })),
  early_check_in_requests: z.array(z.object({ guest_id: z.string(), requested_time: z.string() })),
  late_check_out_requests: z.array(z.object({ guest_id: z.string(), requested_time: z.string() })),
  coordination_notes: z.array(z.string()),
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
  const defaultCheckIn = validatedInput.hotel_policies?.check_in_time || "15:00";
  const defaultCheckOut = validatedInput.hotel_policies?.check_out_time || "11:00";

  const checkInByDate: Record<string, Array<{ guest_id: string; guest_name: string; time: string }>> = {};
  const checkOutByDate: Record<string, Array<{ guest_id: string; guest_name: string; time: string }>> = {};
  const earlyRequests: Array<{ guest_id: string; requested_time: string }> = [];
  const lateRequests: Array<{ guest_id: string; requested_time: string }> = [];

  for (const g of validatedInput.guests) {
    if (!checkInByDate[g.check_in_date]) checkInByDate[g.check_in_date] = [];
    checkInByDate[g.check_in_date].push({ guest_id: g.guest_id, guest_name: g.guest_name, time: g.arrival_time || defaultCheckIn });

    if (!checkOutByDate[g.check_out_date]) checkOutByDate[g.check_out_date] = [];
    checkOutByDate[g.check_out_date].push({ guest_id: g.guest_id, guest_name: g.guest_name, time: g.departure_time || defaultCheckOut });

    if (g.arrival_time && g.arrival_time < defaultCheckIn) {
      earlyRequests.push({ guest_id: g.guest_id, requested_time: g.arrival_time });
    }
    if (g.departure_time && g.departure_time > defaultCheckOut) {
      lateRequests.push({ guest_id: g.guest_id, requested_time: g.departure_time });
    }
  }

  return {
    schedule_id: generateUUID(),
    event_id: validatedInput.event_id,
    check_in_schedule: Object.entries(checkInByDate).map(([date, guests]) => ({ date, guests })),
    check_out_schedule: Object.entries(checkOutByDate).map(([date, guests]) => ({ date, guests })),
    early_check_in_requests: earlyRequests,
    late_check_out_requests: lateRequests,
    coordination_notes: [
      earlyRequests.length > 0 ? `얼리 체크인 ${earlyRequests.length}건 호텔 협의 필요` : "",
      lateRequests.length > 0 ? `레이트 체크아웃 ${lateRequests.length}건 호텔 협의 필요` : "",
    ].filter(Boolean),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-027",
  taskName: "체크인/체크아웃 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.6.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.6: Guest Services",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
