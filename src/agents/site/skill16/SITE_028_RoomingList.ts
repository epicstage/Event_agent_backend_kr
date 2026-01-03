/**
 * SITE-028: 루밍 리스트 관리
 * CMP-IS Reference: 16.2.c - Rooming list management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Rooming List Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_id: z.string(),
  hotel_name: z.string(),
  guests: z.array(z.object({
    guest_id: z.string(),
    guest_name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    room_type: z.string(),
    check_in: z.string(),
    check_out: z.string(),
    special_requests: z.array(z.string()).optional(),
  })),
  submission_deadline: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  rooming_list_id: z.string(),
  event_id: z.string(),
  hotel_id: z.string(),
  summary: z.object({ total_guests: z.number(), by_room_type: z.record(z.number()), total_room_nights: z.number() }),
  rooming_list: z.array(z.object({
    guest_name: z.string(),
    room_type: z.string(),
    arrival: z.string(),
    departure: z.string(),
    nights: z.number(),
    notes: z.string(),
  })),
  submission_status: z.object({ deadline: z.string(), status: z.string(), days_until: z.number() }),
  validation_issues: z.array(z.object({ guest_id: z.string(), issue: z.string() })),
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
  const byRoomType: Record<string, number> = {};
  let totalNights = 0;

  const roomingList = validatedInput.guests.map(g => {
    const checkIn = new Date(g.check_in);
    const checkOut = new Date(g.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    totalNights += nights;
    byRoomType[g.room_type] = (byRoomType[g.room_type] || 0) + 1;

    return {
      guest_name: g.guest_name,
      room_type: g.room_type,
      arrival: g.check_in,
      departure: g.check_out,
      nights,
      notes: g.special_requests?.join(", ") || "",
    };
  });

  const deadline = validatedInput.submission_deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return {
    rooming_list_id: generateUUID(),
    event_id: validatedInput.event_id,
    hotel_id: validatedInput.hotel_id,
    summary: {
      total_guests: validatedInput.guests.length,
      by_room_type: byRoomType,
      total_room_nights: totalNights,
    },
    rooming_list,
    submission_status: {
      deadline,
      status: daysUntil < 0 ? "overdue" : daysUntil < 3 ? "urgent" : "on_track",
      days_until: daysUntil,
    },
    validation_issues: validatedInput.guests.filter(g => !g.email && !g.phone).map(g => ({
      guest_id: g.guest_id,
      issue: "연락처 정보 누락",
    })),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-028",
  taskName: "루밍 리스트 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.2.c",
  skill: "Skill 16: Housing Management",
  subSkill: "16.2: Room Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
