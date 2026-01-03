/**
 * OPS-020: Registration Operations Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 *
 * 등록 현장 운영
 */

import { z } from "zod";

export const OPS_020_RegistrationOps = {
  id: "OPS-020",
  name: "Registration Operations Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `당신은 등록 현장 운영 전문가입니다.
원활한 체크인 프로세스로 참석자 첫인상을 좌우합니다.
대기 시간 최소화와 정확한 데이터 수집이 핵심입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    expected_attendees: z.number(),
    registration_start: z.string(),
    event_start: z.string(),
    registration_type: z.string(), // badge_printing, pre_printed, digital
    vip_count: z.number().optional(),
  }),

  outputSchema: z.object({
    station_setup: z.object({
      total_stations: z.number(),
      regular_stations: z.number(),
      vip_stations: z.number(),
      self_service_kiosks: z.number(),
      staff_per_station: z.number(),
    }),
    flow_plan: z.object({
      queue_management: z.string(),
      estimated_throughput_per_hour: z.number(),
      peak_time_handling: z.array(z.string()),
    }),
    materials_checklist: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      status: z.enum(["ready", "pending", "ordered"]),
    })),
    contingency_procedures: z.array(z.object({
      scenario: z.string(),
      response: z.array(z.string()),
    })),
    real_time_metrics: z.object({
      checked_in: z.number(),
      pending: z.number(),
      average_wait_mins: z.number(),
      no_shows: z.number(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_020_RegistrationOps.inputSchema>) => {
    const stationsNeeded = Math.ceil(input.expected_attendees / 150);
    const vipStations = input.vip_count && input.vip_count > 20 ? 2 : 1;

    return {
      station_setup: {
        total_stations: stationsNeeded + vipStations + 2,
        regular_stations: stationsNeeded,
        vip_stations: vipStations,
        self_service_kiosks: 2,
        staff_per_station: 2,
      },
      flow_plan: {
        queue_management: "사전등록/현장등록 분리 + 알파벳순 분류",
        estimated_throughput_per_hour: stationsNeeded * 60,
        peak_time_handling: [
          "추가 스태프 대기",
          "긴급 레인 오픈",
          "음료 제공으로 대기 완화",
          "실시간 대기시간 안내",
        ],
      },
      materials_checklist: [
        { item: "배지 프린터", quantity: stationsNeeded, status: "ready" as const },
        { item: "배지 용지", quantity: Math.ceil(input.expected_attendees * 1.2), status: "ready" as const },
        { item: "랜야드", quantity: input.expected_attendees, status: "ready" as const },
        { item: "등록 키트 (가방/프로그램)", quantity: input.expected_attendees, status: "pending" as const },
        { item: "태블릿 (셀프체크인)", quantity: 4, status: "ready" as const },
        { item: "바코드 스캐너", quantity: stationsNeeded * 2, status: "ready" as const },
      ],
      contingency_procedures: [
        {
          scenario: "프린터 고장",
          response: ["백업 프린터 투입", "수기 배지 발급", "IT 지원 호출"],
        },
        {
          scenario: "시스템 다운",
          response: ["오프라인 모드 전환", "수기 명단 체크", "배지 사후 발급"],
        },
        {
          scenario: "예상 초과 대기",
          response: ["추가 레인 오픈", "VIP 레인 일반 개방", "사전등록 우선 처리"],
        },
        {
          scenario: "미등록자 방문",
          response: ["현장 등록 안내", "대기 별도 관리", "결제 시스템 준비"],
        },
      ],
      real_time_metrics: {
        checked_in: 0,
        pending: input.expected_attendees,
        average_wait_mins: 0,
        no_shows: 0,
      },
    };
  },
};
