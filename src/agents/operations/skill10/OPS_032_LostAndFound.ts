/**
 * OPS-032: Lost and Found Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_032_LostAndFound = {
  id: "OPS-032",
  name: "Lost and Found Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `분실물 관리 전문가. 참석자들의 소중한 물건을
신속하게 찾아드리는 것이 사명입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_zones: z.array(z.string()),
    expected_attendees: z.number(),
    event_duration_days: z.number(),
  }),

  outputSchema: z.object({
    station_setup: z.object({
      location: z.string(),
      hours: z.string(),
      staff: z.number(),
      equipment: z.array(z.string()),
    }),
    process: z.object({
      found_item: z.array(z.string()),
      claim_process: z.array(z.string()),
      high_value_protocol: z.string(),
    }),
    communication: z.object({
      announcement_locations: z.array(z.string()),
      digital_notification: z.string(),
      post_event_contact: z.string(),
    }),
    zone_sweeps: z.array(z.object({
      zone: z.string(),
      sweep_times: z.array(z.string()),
      responsible: z.string(),
    })),
    statistics_tracking: z.array(z.string()),
  }),

  execute: async (input: z.infer<typeof OPS_032_LostAndFound.inputSchema>) => {
    return {
      station_setup: {
        location: "등록 데스크 인근 / 인포메이션",
        hours: "행사 시작 30분 전 ~ 종료 1시간 후",
        staff: Math.max(1, Math.ceil(input.expected_attendees / 500)),
        equipment: ["잠금 캐비닛", "분실물 접수 폼", "라벨 프린터", "사진 촬영용 태블릿"],
      },
      process: {
        found_item: [
          "발견 장소, 시간, 발견자 기록",
          "물품 사진 촬영",
          "고유 번호 라벨 부착",
          "잠금 캐비닛 보관",
          "분실물 목록 업데이트",
        ],
        claim_process: [
          "신분증 확인",
          "물품 특징 확인 (색상, 내용물 등)",
          "수령 서명",
          "시스템 반환 처리",
        ],
        high_value_protocol: "현금, 전자기기, 귀중품은 별도 금고 보관, 관리자 입회 하 반환",
      },
      communication: {
        announcement_locations: ["등록 데스크", "세션 장내 공지 (선택)", "이벤트 앱 푸시"],
        digital_notification: "분실물 등록 시 앱으로 알림, 사진과 수령 장소 안내",
        post_event_contact: "행사 후 7일간 이메일/전화 문의 가능, 이후 기부 처리",
      },
      zone_sweeps: input.venue_zones.map((zone) => ({
        zone,
        sweep_times: ["세션 종료 시", "점심 후", "행사 종료 시"],
        responsible: `${zone} 담당 스태프`,
      })),
      statistics_tracking: [
        "총 접수 건수",
        "반환 완료 건수",
        "미반환 건수",
        "가장 흔한 분실물 유형",
        "주요 분실 장소",
      ],
    };
  },
};
