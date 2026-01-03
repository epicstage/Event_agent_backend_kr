/**
 * OPS-028: Exhibitor Services Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_028_ExhibitorServices = {
  id: "OPS-028",
  name: "Exhibitor Services Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `전시 업체 서비스 전문가. 부스 설치부터 철수까지
전시 참가업체의 모든 니즈를 충족시킵니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    exhibitors: z.array(z.object({
      company_name: z.string(),
      booth_number: z.string(),
      booth_size: z.string(),
      setup_requirements: z.array(z.string()),
    })),
    exhibition_dates: z.array(z.string()),
  }),

  outputSchema: z.object({
    exhibitor_guide: z.object({
      setup_schedule: z.object({
        start: z.string(),
        end: z.string(),
        rules: z.array(z.string()),
      }),
      teardown_schedule: z.object({
        start: z.string(),
        end: z.string(),
        rules: z.array(z.string()),
      }),
    }),
    booth_assignments: z.array(z.object({
      company: z.string(),
      booth: z.string(),
      power_allocation: z.string(),
      internet: z.string(),
      furniture_included: z.array(z.string()),
    })),
    support_services: z.object({
      desk_location: z.string(),
      hours: z.string(),
      services: z.array(z.string()),
    }),
    logistics_info: z.object({
      loading_dock: z.string(),
      freight_elevator: z.string(),
      storage_area: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_028_ExhibitorServices.inputSchema>) => {
    return {
      exhibitor_guide: {
        setup_schedule: {
          start: "D-1 08:00",
          end: "D-1 22:00",
          rules: ["포장재 당일 수거", "통로 점유 금지", "소음 작업 18시 이전 완료"],
        },
        teardown_schedule: {
          start: "행사 종료 후 즉시",
          end: "D+1 18:00",
          rules: ["순차 철수", "바닥 원상복구", "폐기물 분리수거"],
        },
      },
      booth_assignments: input.exhibitors.map((ex) => ({
        company: ex.company_name,
        booth: ex.booth_number,
        power_allocation: ex.booth_size.includes("large") ? "20A" : "10A",
        internet: "유선 1포트 + Wi-Fi",
        furniture_included: ["테이블 1개", "의자 2개", "명패", "휴지통"],
      })),
      support_services: {
        desk_location: "전시장 입구 우측",
        hours: "08:00 - 18:00",
        services: ["추가 가구 대여", "전기 문제 해결", "청소 서비스", "인쇄 서비스", "통역 연결"],
      },
      logistics_info: {
        loading_dock: "B1 화물 입구",
        freight_elevator: "서측 화물 엘리베이터 (3톤)",
        storage_area: "B1 창고 (사전 예약 필수)",
      },
    };
  },
};
