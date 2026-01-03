/**
 * MTG-001: Program Design & Structure
 *
 * CMP-IS Domain G: Meetings & Contents - Skill 13: Program Design
 * 이벤트 프로그램 전체 구조 설계 및 세션 배치 최적화
 */

import { z } from "zod";

export const MTG_001_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.enum(["conference", "symposium", "summit", "congress", "forum", "workshop_series", "hybrid"]),
  event_duration_days: z.number().min(1).max(14),
  expected_attendees: z.number().min(10),
  main_theme: z.string(),
  sub_themes: z.array(z.string()).optional(),
  target_audience: z.array(z.enum(["executives", "managers", "practitioners", "academics", "students", "general"])),
  venue_rooms: z.array(z.object({
    room_id: z.string(),
    name: z.string(),
    capacity: z.number(),
    av_capability: z.enum(["basic", "standard", "advanced", "broadcast"]),
  })).optional(),
  parallel_sessions_max: z.number().min(1).max(20).default(4),
});

export const MTG_001_OutputSchema = z.object({
  event_id: z.string(),
  program_structure: z.object({
    total_days: z.number(),
    tracks: z.array(z.object({
      track_id: z.string(),
      name: z.string(),
      theme: z.string(),
      target_audience: z.array(z.string()),
      session_count: z.number(),
      color_code: z.string(),
    })),
    daily_schedule: z.array(z.object({
      day: z.number(),
      date_label: z.string(),
      theme_of_day: z.string(),
      time_blocks: z.array(z.object({
        start: z.string(),
        end: z.string(),
        block_type: z.enum(["opening", "keynote", "plenary", "breakout", "workshop", "networking", "break", "lunch", "closing"]),
        parallel_sessions: z.number(),
        room_assignments: z.array(z.string()),
      })),
    })),
    session_mix: z.object({
      keynotes: z.number(),
      plenaries: z.number(),
      breakouts: z.number(),
      workshops: z.number(),
      panels: z.number(),
      networking: z.number(),
    }),
    total_sessions: z.number(),
    total_content_hours: z.number(),
  }),
  resource_requirements: z.object({
    speakers_needed: z.object({
      keynote: z.number(),
      invited: z.number(),
      contributed: z.number(),
    }),
    rooms_required: z.number(),
    av_setups: z.number(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_001_Input = z.infer<typeof MTG_001_InputSchema>;
export type MTG_001_Output = z.infer<typeof MTG_001_OutputSchema>;

const TRACK_COLORS = ["#1E40AF", "#059669", "#DC2626", "#7C3AED", "#D97706", "#0891B2"];

export async function execute(input: MTG_001_Input): Promise<MTG_001_Output> {
  const days = input.event_duration_days;
  const attendees = input.expected_attendees;
  const parallelMax = input.parallel_sessions_max;

  // Generate tracks based on themes
  const themes = [input.main_theme, ...(input.sub_themes || [])];
  const tracks = themes.slice(0, 6).map((theme, idx) => ({
    track_id: `TRACK-${String(idx + 1).padStart(2, "0")}`,
    name: idx === 0 ? "Main Conference" : `Track ${idx + 1}: ${theme.substring(0, 30)}`,
    theme,
    target_audience: input.target_audience,
    session_count: idx === 0 ? Math.ceil(days * 3) : Math.ceil(days * 4),
    color_code: TRACK_COLORS[idx] || "#6B7280",
  }));

  // Calculate session mix
  const keynotesPerDay = days >= 2 ? 1 : 2;
  const sessionMix = {
    keynotes: Math.min(days, 3) * keynotesPerDay,
    plenaries: Math.ceil(days * 1.5),
    breakouts: days * parallelMax * 3,
    workshops: Math.ceil(days * parallelMax * 0.5),
    panels: Math.ceil(days * 2),
    networking: days * 2,
  };

  const totalSessions = Object.values(sessionMix).reduce((a, b) => a + b, 0);
  const contentHoursPerDay = 7;

  // Block type literal union
  type BlockType = "opening" | "keynote" | "plenary" | "breakout" | "workshop" | "networking" | "break" | "lunch" | "closing";

  // Generate daily schedule
  const dailySchedule = Array.from({ length: days }, (_, dayIdx) => ({
    day: dayIdx + 1,
    date_label: `Day ${dayIdx + 1}`,
    theme_of_day: themes[dayIdx % themes.length] || input.main_theme,
    time_blocks: [
      { start: "08:00", end: "09:00", block_type: "opening" as BlockType, parallel_sessions: 1, room_assignments: ["Main Hall"] },
      { start: "09:00", end: "10:00", block_type: "keynote" as BlockType, parallel_sessions: 1, room_assignments: ["Main Hall"] },
      { start: "10:00", end: "10:30", block_type: "break" as BlockType, parallel_sessions: 0, room_assignments: [] },
      { start: "10:30", end: "12:00", block_type: "breakout" as BlockType, parallel_sessions: parallelMax, room_assignments: tracks.slice(0, parallelMax).map(t => t.name) },
      { start: "12:00", end: "13:30", block_type: "lunch" as BlockType, parallel_sessions: 0, room_assignments: ["Dining Area"] },
      { start: "13:30", end: "15:00", block_type: "breakout" as BlockType, parallel_sessions: parallelMax, room_assignments: tracks.slice(0, parallelMax).map(t => t.name) },
      { start: "15:00", end: "15:30", block_type: "break" as BlockType, parallel_sessions: 0, room_assignments: [] },
      { start: "15:30", end: "17:00", block_type: (dayIdx % 2 === 0 ? "workshop" : "breakout") as BlockType, parallel_sessions: Math.ceil(parallelMax / 2), room_assignments: tracks.slice(0, Math.ceil(parallelMax / 2)).map(t => t.name) },
      { start: "17:00", end: "18:00", block_type: "networking" as BlockType, parallel_sessions: 1, room_assignments: ["Networking Lounge"] },
    ],
  }));

  // Modify first and last day
  if (days >= 2) {
    dailySchedule[0].time_blocks[0].block_type = "opening";
    dailySchedule[days - 1].time_blocks.push({
      start: "18:00", end: "19:00", block_type: "closing" as const, parallel_sessions: 1, room_assignments: ["Main Hall"],
    });
  }

  return {
    event_id: input.event_id,
    program_structure: {
      total_days: days,
      tracks,
      daily_schedule: dailySchedule,
      session_mix: sessionMix,
      total_sessions: totalSessions,
      total_content_hours: days * contentHoursPerDay,
    },
    resource_requirements: {
      speakers_needed: {
        keynote: sessionMix.keynotes,
        invited: sessionMix.plenaries + sessionMix.panels * 4,
        contributed: sessionMix.breakouts,
      },
      rooms_required: Math.max(parallelMax + 2, Math.ceil(attendees / 200)),
      av_setups: parallelMax + 1,
    },
    recommendations: [
      `${days}일 일정에 ${tracks.length}개 트랙 구성 권장`,
      attendees > 500 ? "메인홀 이외 오버플로우 룸 라이브 중계 필요" : "단일 메인홀로 충분",
      `키노트 연사 ${sessionMix.keynotes}명 조기 확보 필요`,
      days >= 3 ? "중간 네트워킹 디너 또는 사교 이벤트 추가 권장" : "간단한 환영 리셉션 권장",
      "Call for Papers 최소 6개월 전 오픈 권장",
    ],
  };
}

export const MTG_001_ProgramDesign = {
  id: "MTG-001",
  name: "Program Design & Structure",
  description: "이벤트 프로그램 전체 구조 설계",
  inputSchema: MTG_001_InputSchema,
  outputSchema: MTG_001_OutputSchema,
  execute,
  tags: ["program", "design", "structure", "schedule"],
  domain: "meetings",
  skill: 13,
  taskType: "AI" as const,
};
