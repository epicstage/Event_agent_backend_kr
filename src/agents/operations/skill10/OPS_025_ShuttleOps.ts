/**
 * OPS-025: Shuttle Operations Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_025_ShuttleOps = {
  id: "OPS-025",
  name: "Shuttle Operations Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `셔틀 운영 전문가. 참석자 이동을 원활하게 관리합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    routes: z.array(z.object({
      route_name: z.string(),
      origin: z.string(),
      destination: z.string(),
      distance_km: z.number(),
    })),
    operating_hours: z.object({ start: z.string(), end: z.string() }),
    expected_passengers: z.number(),
  }),

  outputSchema: z.object({
    route_schedules: z.array(z.object({
      route_name: z.string(),
      frequency_mins: z.number(),
      vehicles_assigned: z.number(),
      first_departure: z.string(),
      last_departure: z.string(),
      estimated_travel_mins: z.number(),
    })),
    vehicle_assignments: z.array(z.object({
      vehicle_id: z.string(),
      type: z.string(),
      capacity: z.number(),
      driver: z.string(),
      route: z.string(),
    })),
    passenger_info: z.object({
      pickup_points: z.array(z.object({ location: z.string(), signage: z.string() })),
      announcements: z.array(z.string()),
      app_tracking: z.boolean(),
    }),
    contingency: z.object({
      backup_vehicles: z.number(),
      traffic_delay_protocol: z.string(),
      breakdown_procedure: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_025_ShuttleOps.inputSchema>) => {
    return {
      route_schedules: input.routes.map((route) => ({
        route_name: route.route_name,
        frequency_mins: 20,
        vehicles_assigned: Math.ceil(input.expected_passengers / 500),
        first_departure: input.operating_hours.start,
        last_departure: input.operating_hours.end,
        estimated_travel_mins: Math.ceil(route.distance_km * 3),
      })),
      vehicle_assignments: input.routes.flatMap((route, idx) =>
        Array.from({ length: 2 }, (_, i) => ({
          vehicle_id: `BUS-${String(idx * 2 + i + 1).padStart(2, "0")}`,
          type: "45인승 버스",
          capacity: 45,
          driver: `Driver ${idx * 2 + i + 1}`,
          route: route.route_name,
        }))
      ),
      passenger_info: {
        pickup_points: input.routes.map((r) => ({
          location: r.origin,
          signage: `${r.route_name} 셔틀 승차장`,
        })),
        announcements: [
          "셔틀 출발 5분 전 탑승 완료해 주세요",
          "대형 짐은 트렁크에 보관해 주세요",
          "셔틀 내 음식물 섭취를 삼가해 주세요",
        ],
        app_tracking: true,
      },
      contingency: {
        backup_vehicles: 2,
        traffic_delay_protocol: "예상 도착 시간 실시간 안내, 대체 경로 활용",
        breakdown_procedure: "백업 차량 출동 (15분 내), 승객 임시 대피",
      },
    };
  },
};
