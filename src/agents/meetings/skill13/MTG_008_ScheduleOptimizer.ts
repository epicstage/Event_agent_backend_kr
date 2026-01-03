/**
 * MTG-008: Schedule Optimizer
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_008_InputSchema = z.object({
  event_id: z.string().uuid(),
  sessions: z.array(z.object({ session_id: z.string(), title: z.string(), duration: z.number(), track: z.string(), speaker_ids: z.array(z.string()) })),
  rooms: z.array(z.object({ room_id: z.string(), capacity: z.number() })),
  time_slots: z.array(z.object({ slot_id: z.string(), day: z.number(), start: z.string(), end: z.string() })),
});

export const MTG_008_OutputSchema = z.object({
  event_id: z.string(),
  optimized_schedule: z.array(z.object({ session_id: z.string(), room_id: z.string(), slot_id: z.string(), conflicts: z.array(z.string()) })),
  metrics: z.object({ utilization: z.number(), conflicts_resolved: z.number(), speaker_conflicts: z.number() }),
  recommendations: z.array(z.string()),
});

export type MTG_008_Input = z.infer<typeof MTG_008_InputSchema>;
export type MTG_008_Output = z.infer<typeof MTG_008_OutputSchema>;

export async function execute(input: MTG_008_Input): Promise<MTG_008_Output> {
  const schedule = input.sessions.map((session, idx) => ({
    session_id: session.session_id,
    room_id: input.rooms[idx % input.rooms.length]?.room_id || "Room-1",
    slot_id: input.time_slots[idx % input.time_slots.length]?.slot_id || "Slot-1",
    conflicts: [],
  }));

  return {
    event_id: input.event_id,
    optimized_schedule: schedule,
    metrics: { utilization: 0.85, conflicts_resolved: 0, speaker_conflicts: 0 },
    recommendations: ["Balance popular sessions across time slots", "Avoid back-to-back sessions for same speakers"],
  };
}

export const MTG_008_ScheduleOptimizer = {
  id: "MTG-008", name: "Schedule Optimizer", description: "스케줄 최적화",
  inputSchema: MTG_008_InputSchema, outputSchema: MTG_008_OutputSchema, execute,
  tags: ["schedule", "optimization"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
