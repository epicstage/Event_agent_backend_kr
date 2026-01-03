/**
 * OPS-005: Capacity Planning Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 수용 인원 및 공간 용량 계획
 */

import { z } from "zod";

export const OPS_005_CapacityPlanning = {
  id: "OPS-005",
  name: "Capacity Planning Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 수용량 분석 전문가입니다.
안전 규정, 쾌적성, 운영 효율성을 모두 만족시키는
최적의 인원 배치를 설계합니다.
과밀도 없이 최대 효율을 달성하는 것이 목표입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_spaces: z.array(z.object({
      space_id: z.string(),
      space_name: z.string(),
      area_sqm: z.number(),
      max_capacity: z.number(),
    })),
    session_schedule: z.array(z.object({
      session_id: z.string(),
      session_name: z.string(),
      expected_attendees: z.number(),
      duration_mins: z.number(),
      requires_seating: z.boolean(),
    })),
    total_registered: z.number(),
    peak_times: z.array(z.string()).optional(),
  }),

  outputSchema: z.object({
    capacity_analysis: z.object({
      total_venue_capacity: z.number(),
      total_registered: z.number(),
      utilization_rate: z.number(),
      capacity_status: z.enum(["under_capacity", "optimal", "near_capacity", "over_capacity"]),
    }),
    space_assignments: z.array(z.object({
      space_id: z.string(),
      space_name: z.string(),
      assigned_sessions: z.array(z.object({
        session_id: z.string(),
        session_name: z.string(),
        time_slot: z.string(),
        expected: z.number(),
        capacity: z.number(),
        fill_rate: z.number(),
      })),
      daily_utilization: z.number(),
    })),
    peak_load_analysis: z.object({
      peak_time: z.string(),
      peak_attendance: z.number(),
      spaces_in_use: z.number(),
      bottlenecks: z.array(z.object({
        location: z.string(),
        issue: z.string(),
        mitigation: z.string(),
      })),
    }),
    recommendations: z.array(z.object({
      category: z.string(),
      issue: z.string(),
      recommendation: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    })),
    overflow_plan: z.object({
      overflow_spaces: z.array(z.string()),
      live_stream_capacity: z.number(),
      waitlist_protocol: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_005_CapacityPlanning.inputSchema>) => {
    const totalVenueCapacity = input.venue_spaces.reduce((sum, s) => sum + s.max_capacity, 0);
    const utilizationRate = (input.total_registered / totalVenueCapacity) * 100;

    let capacityStatus: "under_capacity" | "optimal" | "near_capacity" | "over_capacity";
    if (utilizationRate < 60) capacityStatus = "under_capacity";
    else if (utilizationRate < 80) capacityStatus = "optimal";
    else if (utilizationRate < 95) capacityStatus = "near_capacity";
    else capacityStatus = "over_capacity";

    const spaceAssignments = input.venue_spaces.map((space, idx) => {
      const assignedSessions = input.session_schedule
        .filter((_, sIdx) => sIdx % input.venue_spaces.length === idx)
        .map((session) => ({
          session_id: session.session_id,
          session_name: session.session_name,
          time_slot: `Day 1, ${9 + idx * 2}:00-${10 + idx * 2}:00`,
          expected: session.expected_attendees,
          capacity: space.max_capacity,
          fill_rate: Math.round((session.expected_attendees / space.max_capacity) * 100),
        }));

      return {
        space_id: space.space_id,
        space_name: space.space_name,
        assigned_sessions: assignedSessions,
        daily_utilization: Math.round(
          (assignedSessions.reduce((sum, s) => sum + s.fill_rate, 0) / Math.max(assignedSessions.length, 1))
        ),
      };
    });

    const peakAttendance = Math.round(input.total_registered * 0.85);

    return {
      capacity_analysis: {
        total_venue_capacity: totalVenueCapacity,
        total_registered: input.total_registered,
        utilization_rate: Math.round(utilizationRate),
        capacity_status: capacityStatus,
      },
      space_assignments: spaceAssignments,
      peak_load_analysis: {
        peak_time: input.peak_times?.[0] || "10:00-11:00",
        peak_attendance: peakAttendance,
        spaces_in_use: input.venue_spaces.length,
        bottlenecks: [
          {
            location: "Registration Area",
            issue: "개막 1시간 전 집중 도착 예상",
            mitigation: "사전 등록 강화 및 셀프 체크인 키오스크 추가",
          },
          {
            location: "Main Hall Entry",
            issue: "키노트 세션 직전 혼잡",
            mitigation: "복수 입구 운영 및 좌석 배정 시스템",
          },
          {
            location: "Catering Area",
            issue: "점심시간 동시 이동",
            mitigation: "시차 배식 또는 복수 케이터링 스테이션",
          },
        ],
      },
      recommendations: [
        {
          category: "세션 배치",
          issue: "인기 세션 공간 부족 우려",
          recommendation: "대형 홀 배정 및 실시간 스트리밍 준비",
          priority: "high" as const,
        },
        {
          category: "동선 관리",
          issue: "세션 간 이동 시간 부족",
          recommendation: "세션 간 15분 휴식 확보",
          priority: "medium" as const,
        },
        {
          category: "케이터링",
          issue: "피크 시간 수용량",
          recommendation: "복수 뷔페 라인 및 그랩앤고 옵션",
          priority: "medium" as const,
        },
        {
          category: "비상 대비",
          issue: "만석 시 안전 우려",
          recommendation: "실시간 인원 카운팅 시스템 도입",
          priority: "high" as const,
        },
      ],
      overflow_plan: {
        overflow_spaces: ["Overflow Lounge", "Outdoor Terrace (날씨 허용시)"],
        live_stream_capacity: Math.round(input.total_registered * 0.3),
        waitlist_protocol: "실시간 좌석 현황 모니터링, 대기자 알림 시스템, 우선순위 입장 관리",
      },
    };
  },
};
