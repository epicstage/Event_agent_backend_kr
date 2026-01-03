/**
 * OPS-033: Waste Management Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_033_WasteManagement = {
  id: "OPS-033",
  name: "Waste Management Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `폐기물 관리 및 지속가능성 전문가. 친환경 이벤트 운영을 통해
환경 영향을 최소화합니다. Zero Waste 이벤트가 목표입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    attendee_count: z.number(),
    event_days: z.number(),
    catering_type: z.string(),
    sustainability_goal: z.enum(["basic", "eco_friendly", "zero_waste"]),
  }),

  outputSchema: z.object({
    waste_stations: z.array(z.object({
      location: z.string(),
      bin_types: z.array(z.string()),
      signage: z.string(),
    })),
    collection_schedule: z.array(z.object({
      time: z.string(),
      zones: z.array(z.string()),
      crew_size: z.number(),
    })),
    sustainability_measures: z.array(z.object({
      measure: z.string(),
      impact: z.string(),
      implementation: z.string(),
    })),
    waste_reduction_tips: z.array(z.string()),
    reporting: z.object({
      metrics_tracked: z.array(z.string()),
      post_event_report: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_033_WasteManagement.inputSchema>) => {
    const isZeroWaste = input.sustainability_goal === "zero_waste";
    const isEcoFriendly = input.sustainability_goal === "eco_friendly" || isZeroWaste;

    return {
      waste_stations: [
        {
          location: "케이터링 구역 (3개소)",
          bin_types: isEcoFriendly
            ? ["음식물", "재활용 (플라스틱/캔)", "재활용 (종이)", "일반"]
            : ["재활용", "일반"],
          signage: "그림 + 한/영 텍스트, 색상 구분",
        },
        {
          location: "세션 홀 출입구",
          bin_types: ["재활용", "일반"],
          signage: "간결한 아이콘",
        },
        {
          location: "등록/로비",
          bin_types: isEcoFriendly ? ["종이 (명찰 홀더)", "재활용", "일반"] : ["재활용", "일반"],
          signage: "명찰 반납 안내 포함",
        },
      ],
      collection_schedule: [
        { time: "09:00", zones: ["전 구역"], crew_size: 3 },
        { time: "12:30", zones: ["케이터링", "로비"], crew_size: 4 },
        { time: "15:00", zones: ["세션 홀", "네트워킹"], crew_size: 2 },
        { time: "18:00", zones: ["전 구역"], crew_size: 4 },
        { time: "행사 종료 후", zones: ["전 구역 최종"], crew_size: 5 },
      ],
      sustainability_measures: [
        {
          measure: "재사용 가능 물병",
          impact: `약 ${input.attendee_count * 3}개 일회용 병 절감`,
          implementation: "워터 스테이션 설치, 참가자 텀블러 권장",
        },
        {
          measure: "디지털 자료",
          impact: "인쇄물 80% 감소",
          implementation: "QR 코드로 자료 배포, 앱 활용",
        },
        {
          measure: isZeroWaste ? "퇴비화 가능 식기" : "재활용 가능 식기",
          impact: "식기류 100% 재활용/퇴비화",
          implementation: isZeroWaste ? "PLA 소재 사용, 퇴비화 파트너십" : "분리수거 철저",
        },
        {
          measure: "남은 음식 기부",
          impact: "음식물 쓰레기 50% 감소",
          implementation: "푸드뱅크 연계, 포장 준비",
        },
      ],
      waste_reduction_tips: [
        "배지 홀더 반납 시 다음 행사 할인 쿠폰",
        "무료 물병 대신 텀블러 지참자 경품 추첨",
        "종이 자료 대신 앱 다운로드 유도",
        "케이터링 소분화로 음식 낭비 방지",
      ],
      reporting: {
        metrics_tracked: [
          "총 폐기물량 (kg)",
          "재활용률 (%)",
          "음식물 쓰레기량",
          "탄소발자국 추정치",
        ],
        post_event_report: "D+3 지속가능성 보고서 발행, 개선점 분석",
      },
    };
  },
};
