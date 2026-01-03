/**
 * SITE-022: 객실 배정
 * CMP-IS Reference: 16.2.a - Room allocation
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Room Allocation Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_block_id: z.string(),
  guests: z.array(z.object({ guest_id: z.string(), guest_name: z.string(), guest_type: z.string(), room_preference: z.string().optional(), check_in: z.string(), check_out: z.string() })),
  available_rooms: z.object({ single: z.number(), double: z.number(), suite: z.number() }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  allocation_id: z.string(),
  event_id: z.string(),
  assignments: z.array(z.object({ guest_id: z.string(), guest_name: z.string(), room_type: z.string(), priority: z.number() })),
  summary: z.object({ total_guests: z.number(), rooms_assigned: z.number(), rooms_remaining: z.object({ single: z.number(), double: z.number(), suite: z.number() }) }),
  conflicts: z.array(z.object({ guest_id: z.string(), issue: z.string() })),
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
  const priorityOrder: Record<string, number> = { speaker: 1, vip: 2, sponsor: 3, staff: 4, attendee: 5 };

  const assignments = validatedInput.guests.map(g => ({
    guest_id: g.guest_id,
    guest_name: g.guest_name,
    room_type: g.room_preference || "single",
    priority: priorityOrder[g.guest_type] || 5,
  })).sort((a, b) => a.priority - b.priority);

  return {
    allocation_id: generateUUID(),
    event_id: validatedInput.event_id,
    assignments,
    summary: {
      total_guests: assignments.length,
      rooms_assigned: assignments.length,
      rooms_remaining: {
        single: validatedInput.available_rooms.single - assignments.filter(a => a.room_type === "single").length,
        double: validatedInput.available_rooms.double - assignments.filter(a => a.room_type === "double").length,
        suite: validatedInput.available_rooms.suite - assignments.filter(a => a.room_type === "suite").length,
      },
    },
    conflicts: [],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-022",
  taskName: "객실 배정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.2.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.2: Room Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
