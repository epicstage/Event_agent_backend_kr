/**
 * OPS-035: Climate Control Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_035_ClimateControl = {
  id: "OPS-035",
  name: "Climate Control Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `실내 환경 관리 전문가. 참석자들이 가장 쾌적하게
느끼는 온도, 습도, 공기질을 유지합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_zones: z.array(z.object({
      zone_name: z.string(),
      area_sqm: z.number(),
      expected_occupancy: z.number(),
      hvac_controllable: z.boolean(),
    })),
    season: z.enum(["spring", "summer", "fall", "winter"]),
    outdoor_temp_celsius: z.number(),
  }),

  outputSchema: z.object({
    climate_settings: z.array(z.object({
      zone: z.string(),
      target_temp: z.number(),
      pre_cooling: z.string(),
      during_event: z.string(),
    })),
    monitoring: z.object({
      check_frequency: z.string(),
      checkpoints: z.array(z.string()),
      alert_thresholds: z.object({
        temp_high: z.number(),
        temp_low: z.number(),
        humidity_high: z.number(),
      }),
    }),
    adjustments: z.array(z.object({
      scenario: z.string(),
      action: z.string(),
      timing: z.string(),
    })),
    special_considerations: z.array(z.object({
      area: z.string(),
      consideration: z.string(),
      solution: z.string(),
    })),
    energy_efficiency: z.object({
      strategies: z.array(z.string()),
      estimated_savings: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_035_ClimateControl.inputSchema>) => {
    const baseTemp = input.season === "summer" ? 24 : input.season === "winter" ? 22 : 23;

    return {
      climate_settings: input.venue_zones.map((zone) => {
        const crowdingFactor = zone.expected_occupancy / zone.area_sqm;
        const adjustedTemp = baseTemp - (crowdingFactor > 1 ? 1 : 0);

        return {
          zone: zone.zone_name,
          target_temp: adjustedTemp,
          pre_cooling: zone.hvac_controllable
            ? `행사 2시간 전 ${adjustedTemp - 2}°C로 예냉`
            : "베뉴 관리팀에 사전 요청",
          during_event: `${adjustedTemp}°C 유지, 세션 시작 전 1도 낮춤`,
        };
      }),
      monitoring: {
        check_frequency: "30분마다",
        checkpoints: input.venue_zones.map((z) => z.zone_name),
        alert_thresholds: {
          temp_high: baseTemp + 3,
          temp_low: baseTemp - 3,
          humidity_high: 65,
        },
      },
      adjustments: [
        {
          scenario: "인원 급증 (세션 시작)",
          action: "해당 구역 2도 추가 냉방",
          timing: "세션 시작 15분 전",
        },
        {
          scenario: "인원 감소 (휴식 시간)",
          action: "절전 모드 전환",
          timing: "휴식 시작 즉시",
        },
        {
          scenario: "외부 문 개방 (등록 시간)",
          action: "로비 냉방 강화, 에어커튼 가동",
          timing: "등록 시작 30분 전",
        },
        {
          scenario: "AV 장비 발열",
          action: "무대 구역 스팟 쿨링",
          timing: "리허설 시 확인 및 조정",
        },
      ],
      special_considerations: [
        {
          area: "무대/스테이지",
          consideration: "조명 열로 인한 온도 상승",
          solution: "무대 에어컨 별도 강화, 연사 대기실 시원하게 유지",
        },
        {
          area: "케이터링 구역",
          consideration: "음식 신선도 및 냄새 확산",
          solution: "환기 강화, 별도 공조 운영",
        },
        {
          area: "전시 구역",
          consideration: "장시간 서있는 참석자",
          solution: "선풍기 보조, 휴식 공간 쿨링 존",
        },
        {
          area: "등록 로비",
          consideration: "외부 공기 유입",
          solution: "에어커튼, 자동문 타이밍 조정",
        },
      ],
      energy_efficiency: {
        strategies: [
          "점유율 기반 구역별 냉난방",
          "야간/휴식 시간 절전 모드",
          "자연 채광 활용으로 조명 발열 감소",
          "CO2 센서 기반 환기 최적화",
        ],
        estimated_savings: "표준 운영 대비 15-20% 에너지 절감",
      },
    };
  },
};
