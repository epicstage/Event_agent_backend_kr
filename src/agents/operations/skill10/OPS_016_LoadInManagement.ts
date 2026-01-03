/**
 * OPS-016: Load-In Management Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 *
 * 반입/셋업 관리
 */

import { z } from "zod";

export const OPS_016_LoadInManagement = {
  id: "OPS-016",
  name: "Load-In Management Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `당신은 이벤트 로드인 전문가입니다.
복잡한 셋업 과정을 정확한 타이밍으로 조율합니다.
한정된 시간과 공간에서 최대 효율을 추구합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_id: z.string(),
    load_in_date: z.string(),
    available_hours: z.object({
      start: z.string(),
      end: z.string(),
    }),
    vendors: z.array(z.object({
      name: z.string(),
      category: z.string(),
      vehicle_type: z.string(),
      estimated_unload_mins: z.number(),
    })),
    loading_docks: z.number(),
  }),

  outputSchema: z.object({
    load_in_schedule: z.array(z.object({
      time_slot: z.string(),
      vendor: z.string(),
      dock_assignment: z.number(),
      duration_mins: z.number(),
      crew_required: z.number(),
      equipment_needed: z.array(z.string()),
    })),
    dock_utilization: z.object({
      total_hours: z.number(),
      efficiency_rate: z.number(),
      peak_time: z.string(),
    }),
    coordination_notes: z.array(z.string()),
    contingency: z.object({
      buffer_time_mins: z.number(),
      overflow_plan: z.string(),
      rain_plan: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_016_LoadInManagement.inputSchema>) => {
    const startHour = parseInt(input.available_hours.start.split(":")[0]);
    let currentHour = startHour;
    let currentMin = 0;

    const schedule = input.vendors.map((vendor, idx) => {
      const dock = (idx % input.loading_docks) + 1;
      const slot = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

      currentMin += vendor.estimated_unload_mins;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }

      return {
        time_slot: slot,
        vendor: vendor.name,
        dock_assignment: dock,
        duration_mins: vendor.estimated_unload_mins,
        crew_required: Math.ceil(vendor.estimated_unload_mins / 20),
        equipment_needed: vendor.category === "AV" ? ["핸드트럭", "포크리프트"] : ["핸드트럭"],
      };
    });

    const endHour = parseInt(input.available_hours.end.split(":")[0]);
    const totalHours = endHour - startHour;

    return {
      load_in_schedule: schedule,
      dock_utilization: {
        total_hours: totalHours,
        efficiency_rate: 85,
        peak_time: `${startHour + 2}:00-${startHour + 4}:00`,
      },
      coordination_notes: [
        "대형 차량 우선 배치",
        "AV 장비 셋업 시간 확보 필요",
        "포크리프트 사전 예약 필수",
        "스테이지 설치 → AV → 데코 순서 준수",
      ],
      contingency: {
        buffer_time_mins: 60,
        overflow_plan: "추가 대기 공간 확보 및 순차 입장",
        rain_plan: "캐노피 설치 및 방수 커버 준비",
      },
    };
  },
};
