/**
 * MTG-005: Track Management
 * CMP-IS Domain G - Skill 13: Program Design
 */
import { z } from "zod";

export const MTG_005_InputSchema = z.object({
  event_id: z.string().uuid(),
  tracks: z.array(z.object({
    track_id: z.string(),
    name: z.string(),
    theme: z.string(),
    target_sessions: z.number(),
  })),
  total_rooms: z.number(),
  event_days: z.number(),
});

export const MTG_005_OutputSchema = z.object({
  event_id: z.string(),
  track_allocation: z.array(z.object({
    track_id: z.string(),
    name: z.string(),
    assigned_rooms: z.array(z.string()),
    time_slots: z.array(z.object({ day: z.number(), start: z.string(), end: z.string() })),
    session_capacity: z.number(),
    chair_requirements: z.object({ chair: z.number(), co_chair: z.number() }),
  })),
  room_utilization: z.number(),
  recommendations: z.array(z.string()),
});

export type MTG_005_Input = z.infer<typeof MTG_005_InputSchema>;
export type MTG_005_Output = z.infer<typeof MTG_005_OutputSchema>;

export async function execute(input: MTG_005_Input): Promise<MTG_005_Output> {
  const { tracks, total_rooms, event_days } = input;
  const roomsPerTrack = Math.max(1, Math.floor(total_rooms / tracks.length));

  const trackAllocation = tracks.map((track, idx) => ({
    track_id: track.track_id,
    name: track.name,
    assigned_rooms: Array.from({ length: roomsPerTrack }, (_, i) => `Room ${idx * roomsPerTrack + i + 1}`),
    time_slots: Array.from({ length: event_days }, (_, d) => ({
      day: d + 1,
      start: "09:00",
      end: "17:00",
    })),
    session_capacity: roomsPerTrack * event_days * 4,
    chair_requirements: { chair: 1, co_chair: track.target_sessions > 10 ? 2 : 1 },
  }));

  return {
    event_id: input.event_id,
    track_allocation: trackAllocation,
    room_utilization: (tracks.length * roomsPerTrack) / total_rooms,
    recommendations: [
      "트랙별 색상 코드로 참가자 이동 안내",
      "인기 트랙은 대형 룸 배정",
      "트랙 체어 사전 미팅 필수",
    ],
  };
}

export const MTG_005_TrackManagement = {
  id: "MTG-005", name: "Track Management", description: "프로그램 트랙 관리",
  inputSchema: MTG_005_InputSchema, outputSchema: MTG_005_OutputSchema, execute,
  tags: ["track", "management"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
