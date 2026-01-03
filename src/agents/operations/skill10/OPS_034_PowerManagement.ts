/**
 * OPS-034: Power Management Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_034_PowerManagement = {
  id: "OPS-034",
  name: "Power Management Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `전력 관리 전문가. 이벤트의 모든 전기적 요구사항을
안전하고 효율적으로 관리합니다. 정전은 옵션이 아닙니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_power_capacity: z.number(), // in kW
    equipment_list: z.array(z.object({
      zone: z.string(),
      equipment: z.string(),
      power_requirement: z.number(), // in watts
    })),
    backup_required: z.boolean(),
  }),

  outputSchema: z.object({
    power_plan: z.object({
      total_requirement: z.number(),
      venue_capacity: z.number(),
      utilization_rate: z.number(),
      status: z.enum(["safe", "caution", "overload"]),
    }),
    distribution: z.array(z.object({
      zone: z.string(),
      circuit: z.string(),
      allocated_power: z.number(),
      equipment: z.array(z.string()),
    })),
    backup_systems: z.object({
      ups_locations: z.array(z.string()),
      generator: z.object({
        required: z.boolean(),
        capacity: z.string(),
        location: z.string(),
      }),
      priority_loads: z.array(z.string()),
    }),
    safety_measures: z.array(z.object({
      measure: z.string(),
      location: z.string(),
      responsible: z.string(),
    })),
    charging_stations: z.array(z.object({
      location: z.string(),
      outlets: z.number(),
      usb_ports: z.number(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_034_PowerManagement.inputSchema>) => {
    const totalRequirement = input.equipment_list.reduce((sum, eq) => sum + eq.power_requirement, 0) / 1000;
    const utilizationRate = (totalRequirement / input.venue_power_capacity) * 100;

    let status: "safe" | "caution" | "overload";
    if (utilizationRate < 70) status = "safe";
    else if (utilizationRate < 90) status = "caution";
    else status = "overload";

    const zoneGroups = input.equipment_list.reduce((acc, eq) => {
      if (!acc[eq.zone]) acc[eq.zone] = [];
      acc[eq.zone].push(eq);
      return acc;
    }, {} as Record<string, typeof input.equipment_list>);

    return {
      power_plan: {
        total_requirement: Math.round(totalRequirement * 10) / 10,
        venue_capacity: input.venue_power_capacity,
        utilization_rate: Math.round(utilizationRate),
        status,
      },
      distribution: Object.entries(zoneGroups).map(([zone, equipment], idx) => ({
        zone,
        circuit: `Circuit ${String.fromCharCode(65 + idx)}`,
        allocated_power: equipment.reduce((sum, eq) => sum + eq.power_requirement, 0),
        equipment: equipment.map((eq) => eq.equipment),
      })),
      backup_systems: {
        ups_locations: ["메인 스테이지 AV", "등록 시스템", "스트리밍 장비"],
        generator: {
          required: input.backup_required,
          capacity: input.backup_required ? `${Math.ceil(totalRequirement * 0.5)} kW` : "N/A",
          location: input.backup_required ? "야외 주차장 (케이블 50m)" : "N/A",
        },
        priority_loads: [
          "비상 조명",
          "소방 시스템",
          "통신 장비",
          "메인 AV 시스템",
          "등록 시스템",
        ],
      },
      safety_measures: [
        { measure: "접지 확인", location: "모든 전원 분배함", responsible: "전기 기술자" },
        { measure: "과부하 차단기", location: "각 분전반", responsible: "현장 관리자" },
        { measure: "케이블 커버/테이프", location: "통로 횡단 구간", responsible: "설치팀" },
        { measure: "전기 안전 표지", location: "분전반 주변", responsible: "안전 담당" },
        { measure: "비상 차단 스위치 위치 공유", location: "컨트롤룸", responsible: "전체 스태프" },
      ],
      charging_stations: [
        { location: "등록 로비", outlets: 20, usb_ports: 40 },
        { location: "네트워킹 라운지", outlets: 15, usb_ports: 30 },
        { location: "세션 홀 후면", outlets: 10, usb_ports: 20 },
      ],
    };
  },
};
