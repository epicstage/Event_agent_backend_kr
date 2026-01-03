/**
 * OPS-013: Staffing Plan Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 현장 인력 배치 계획
 */

import { z } from "zod";

export const OPS_013_StaffingPlan = {
  id: "OPS-013",
  name: "Staffing Plan Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 현장 운영 인력 전문가입니다.
수백 명의 스태프를 효율적으로 배치하고 관리한 경험이 있습니다.
적재적소에 적합한 인력을 배치하여 운영 효율을 극대화합니다.
잘 훈련된 팀이 완벽한 이벤트를 만든다고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    event_dates: z.array(z.string()),
    event_hours: z.object({
      setup_start: z.string(),
      event_start: z.string(),
      event_end: z.string(),
      teardown_end: z.string(),
    }),
    attendees: z.number(),
    venue_zones: z.array(z.string()),
    special_requirements: z.array(z.string()).optional(),
  }),

  outputSchema: z.object({
    staffing_summary: z.object({
      total_staff: z.number(),
      total_hours: z.number(),
      total_cost: z.number(),
      staff_to_attendee_ratio: z.string(),
    }),
    staff_categories: z.array(z.object({
      category: z.string(),
      roles: z.array(z.object({
        role: z.string(),
        count: z.number(),
        hours_per_shift: z.number(),
        hourly_rate: z.number(),
        total_cost: z.number(),
        source: z.string(),
        requirements: z.array(z.string()),
      })),
      subtotal: z.number(),
    })),
    shift_schedule: z.array(z.object({
      shift_name: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      roles_on_duty: z.array(z.object({
        role: z.string(),
        count: z.number(),
      })),
      total_on_shift: z.number(),
    })),
    zone_assignments: z.array(z.object({
      zone: z.string(),
      positions: z.array(z.object({
        position: z.string(),
        count: z.number(),
        responsibilities: z.array(z.string()),
      })),
      supervisor: z.string(),
    })),
    recruitment_plan: z.object({
      internal_staff: z.number(),
      temp_agency: z.number(),
      volunteers: z.number(),
      vendor_provided: z.number(),
      recruitment_deadline: z.string(),
    }),
    training_schedule: z.array(z.object({
      session: z.string(),
      date: z.string(),
      duration: z.string(),
      attendees: z.array(z.string()),
      content: z.array(z.string()),
    })),
    communication_plan: z.object({
      primary_channel: z.string(),
      radio_channels: z.array(z.object({
        channel: z.number(),
        purpose: z.string(),
        users: z.array(z.string()),
      })),
      briefing_schedule: z.array(z.object({
        time: z.string(),
        attendees: z.string(),
        location: z.string(),
      })),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_013_StaffingPlan.inputSchema>) => {
    const baseStaff = Math.ceil(input.attendees / 50);
    const totalStaff = baseStaff + 15; // +15 for specialized roles

    const eventDays = input.event_dates.length;
    const eventHoursPerDay = 12; // average

    return {
      staffing_summary: {
        total_staff: totalStaff,
        total_hours: totalStaff * eventHoursPerDay * eventDays,
        total_cost: totalStaff * eventHoursPerDay * eventDays * 25000,
        staff_to_attendee_ratio: `1:${Math.round(input.attendees / totalStaff)}`,
      },
      staff_categories: [
        {
          category: "운영 관리",
          roles: [
            {
              role: "현장 총괄 디렉터",
              count: 1,
              hours_per_shift: 14,
              hourly_rate: 100000,
              total_cost: 1400000 * eventDays,
              source: "내부 인력",
              requirements: ["5년 이상 경력", "위기 관리 능력"],
            },
            {
              role: "섹션 매니저",
              count: 4,
              hours_per_shift: 12,
              hourly_rate: 50000,
              total_cost: 2400000 * eventDays,
              source: "내부 인력",
              requirements: ["이벤트 경험 3년", "팀 리더십"],
            },
          ],
          subtotal: 3800000 * eventDays,
        },
        {
          category: "등록/안내",
          roles: [
            {
              role: "등록 데스크 스태프",
              count: Math.ceil(input.attendees / 200),
              hours_per_shift: 8,
              hourly_rate: 20000,
              total_cost: Math.ceil(input.attendees / 200) * 160000 * eventDays,
              source: "파견 업체",
              requirements: ["친절함", "기본 IT 능력"],
            },
            {
              role: "안내 도우미",
              count: Math.ceil(input.attendees / 150),
              hours_per_shift: 8,
              hourly_rate: 18000,
              total_cost: Math.ceil(input.attendees / 150) * 144000 * eventDays,
              source: "파견 업체",
              requirements: ["외국어 가능 우대", "친절함"],
            },
          ],
          subtotal: (Math.ceil(input.attendees / 200) * 160000 + Math.ceil(input.attendees / 150) * 144000) * eventDays,
        },
        {
          category: "기술/AV",
          roles: [
            {
              role: "테크니컬 디렉터",
              count: 1,
              hours_per_shift: 12,
              hourly_rate: 80000,
              total_cost: 960000 * eventDays,
              source: "AV 업체",
              requirements: ["AV 전문가", "라이브 이벤트 경험"],
            },
            {
              role: "AV 테크니션",
              count: 3,
              hours_per_shift: 10,
              hourly_rate: 40000,
              total_cost: 1200000 * eventDays,
              source: "AV 업체",
              requirements: ["음향/영상 기술", "문제 해결 능력"],
            },
          ],
          subtotal: 2160000 * eventDays,
        },
        {
          category: "보안",
          roles: [
            {
              role: "보안 책임자",
              count: 1,
              hours_per_shift: 10,
              hourly_rate: 40000,
              total_cost: 400000 * eventDays,
              source: "보안 업체",
              requirements: ["경비 자격증", "위기 대응 훈련"],
            },
            {
              role: "경비원",
              count: Math.ceil(input.attendees / 100),
              hours_per_shift: 8,
              hourly_rate: 25000,
              total_cost: Math.ceil(input.attendees / 100) * 200000 * eventDays,
              source: "보안 업체",
              requirements: ["경비 자격증"],
            },
          ],
          subtotal: (400000 + Math.ceil(input.attendees / 100) * 200000) * eventDays,
        },
      ],
      shift_schedule: [
        {
          shift_name: "새벽 셋업",
          start_time: input.event_hours.setup_start,
          end_time: input.event_hours.event_start,
          roles_on_duty: [
            { role: "셋업 크루", count: 10 },
            { role: "기술팀", count: 4 },
          ],
          total_on_shift: 14,
        },
        {
          shift_name: "오전 근무",
          start_time: input.event_hours.event_start,
          end_time: "13:00",
          roles_on_duty: [
            { role: "등록 스태프", count: Math.ceil(input.attendees / 200) },
            { role: "안내 도우미", count: Math.ceil(input.attendees / 150) },
            { role: "경비원", count: Math.ceil(input.attendees / 100) },
          ],
          total_on_shift: Math.ceil(input.attendees / 200) + Math.ceil(input.attendees / 150) + Math.ceil(input.attendees / 100),
        },
        {
          shift_name: "오후 근무",
          start_time: "12:00",
          end_time: input.event_hours.event_end,
          roles_on_duty: [
            { role: "등록 스태프", count: Math.ceil(input.attendees / 400) },
            { role: "안내 도우미", count: Math.ceil(input.attendees / 150) },
            { role: "경비원", count: Math.ceil(input.attendees / 100) },
          ],
          total_on_shift: Math.ceil(input.attendees / 400) + Math.ceil(input.attendees / 150) + Math.ceil(input.attendees / 100),
        },
        {
          shift_name: "철수 근무",
          start_time: input.event_hours.event_end,
          end_time: input.event_hours.teardown_end,
          roles_on_duty: [
            { role: "철거 크루", count: 10 },
            { role: "기술팀", count: 3 },
          ],
          total_on_shift: 13,
        },
      ],
      zone_assignments: input.venue_zones.map((zone) => ({
        zone: zone,
        positions: [
          { position: "존 리더", count: 1, responsibilities: ["구역 총괄", "문제 에스컬레이션", "스태프 관리"] },
          { position: "안내 스태프", count: 2, responsibilities: ["참석자 안내", "질문 응대"] },
          { position: "러너", count: 1, responsibilities: ["물품 전달", "긴급 지원"] },
        ],
        supervisor: "섹션 매니저 A",
      })),
      recruitment_plan: {
        internal_staff: 5,
        temp_agency: Math.ceil(totalStaff * 0.6),
        volunteers: Math.ceil(totalStaff * 0.1),
        vendor_provided: Math.ceil(totalStaff * 0.2),
        recruitment_deadline: "D-21",
      },
      training_schedule: [
        {
          session: "전체 오리엔테이션",
          date: "D-3",
          duration: "2시간",
          attendees: ["전 스태프"],
          content: ["이벤트 개요", "조직도/연락망", "기본 수칙", "유니폼 배포"],
        },
        {
          session: "역할별 교육",
          date: "D-2",
          duration: "3시간",
          attendees: ["역할별 그룹"],
          content: ["세부 업무 매뉴얼", "장비 사용법", "시나리오 연습"],
        },
        {
          session: "현장 리허설",
          date: "D-1",
          duration: "4시간",
          attendees: ["핵심 스태프"],
          content: ["동선 확인", "비상 대피 훈련", "커뮤니케이션 테스트"],
        },
      ],
      communication_plan: {
        primary_channel: "무전기 (디지털)",
        radio_channels: [
          { channel: 1, purpose: "총괄/긴급", users: ["디렉터", "매니저"] },
          { channel: 2, purpose: "운영/등록", users: ["등록팀", "안내팀"] },
          { channel: 3, purpose: "기술/AV", users: ["AV팀", "IT팀"] },
          { channel: 4, purpose: "보안/의료", users: ["보안팀", "의료팀"] },
        ],
        briefing_schedule: [
          { time: "D-Day 06:00", attendees: "전체 스태프", location: "메인 로비" },
          { time: "D-Day 12:00", attendees: "섹션 리더", location: "스태프 룸" },
          { time: "D-Day 종료 후", attendees: "전체 스태프", location: "메인 로비" },
        ],
      },
    };
  },
};
