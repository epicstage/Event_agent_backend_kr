/**
 * OPS-011: Transport Planning Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 교통 및 셔틀 계획
 */

import { z } from "zod";

export const OPS_011_TransportPlanning = {
  id: "OPS-011",
  name: "Transport Planning Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 교통/물류 전문가입니다.
수천 명의 참석자를 안전하고 효율적으로 이동시키는 것이 전문입니다.
동선 최적화, 피크 타임 관리, 대중교통 연계에 능숙합니다.
이동이 곧 경험의 시작이라고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_location: z.object({
      address: z.string(),
      city: z.string(),
      nearest_station: z.string().optional(),
      parking_available: z.boolean(),
    }),
    attendee_profile: z.object({
      total: z.number(),
      local_percentage: z.number(),
      out_of_town_percentage: z.number(),
      vip_count: z.number().optional(),
    }),
    event_dates: z.array(z.string()),
    event_times: z.object({
      start: z.string(),
      end: z.string(),
    }),
    transport_budget: z.number().optional(),
  }),

  outputSchema: z.object({
    transport_plan: z.object({
      strategy: z.string(),
      total_cost_estimate: z.number(),
      key_considerations: z.array(z.string()),
    }),
    shuttle_service: z.object({
      routes: z.array(z.object({
        route_name: z.string(),
        origin: z.string(),
        destination: z.string(),
        frequency_mins: z.number(),
        vehicle_type: z.string(),
        capacity_per_trip: z.number(),
        operating_hours: z.string(),
        estimated_cost: z.number(),
      })),
      total_vehicles: z.number(),
      vendor_recommendations: z.array(z.string()),
    }),
    parking_plan: z.object({
      onsite_spaces: z.number(),
      offsite_options: z.array(z.object({
        location: z.string(),
        capacity: z.number(),
        distance_km: z.number(),
        shuttle_connection: z.boolean(),
      })),
      valet_service: z.boolean(),
      parking_cost: z.number(),
    }),
    vip_transport: z.object({
      vehicles: z.array(z.object({
        type: z.string(),
        quantity: z.number(),
        purpose: z.string(),
      })),
      driver_count: z.number(),
      staging_area: z.string(),
    }).optional(),
    public_transit: z.object({
      nearest_stations: z.array(z.object({
        type: z.string(),
        name: z.string(),
        distance_m: z.number(),
        lines: z.array(z.string()),
      })),
      recommended_routes: z.array(z.string()),
      attendee_instructions: z.string(),
    }),
    traffic_management: z.object({
      peak_arrival_time: z.string(),
      peak_departure_time: z.string(),
      traffic_control_points: z.array(z.string()),
      police_coordination: z.boolean(),
      signage_needs: z.array(z.string()),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_011_TransportPlanning.inputSchema>) => {
    const outOfTownAttendees = Math.round(input.attendee_profile.total * input.attendee_profile.out_of_town_percentage / 100);
    const shuttleCapacity = Math.ceil(outOfTownAttendees * 0.5 / 45); // 50% use shuttle, 45 per bus

    return {
      transport_plan: {
        strategy: `대중교통 + 셔틀 + 제한적 자가용 병행 운영`,
        total_cost_estimate: input.transport_budget || Math.round(input.attendee_profile.total * 15000),
        key_considerations: [
          "피크 시간대 집중 도착 분산 필요",
          "VIP 별도 동선 확보",
          "우천 시 대기 공간 필요",
          "비상 대피 경로와 교통 동선 분리",
        ],
      },
      shuttle_service: {
        routes: [
          {
            route_name: "공항 셔틀",
            origin: "인천국제공항 T1/T2",
            destination: "베뉴",
            frequency_mins: 60,
            vehicle_type: "45인승 리무진 버스",
            capacity_per_trip: 45,
            operating_hours: "06:00-22:00",
            estimated_cost: 800000,
          },
          {
            route_name: "기차역 셔틀",
            origin: input.venue_location.nearest_station || "서울역",
            destination: "베뉴",
            frequency_mins: 30,
            vehicle_type: "28인승 미니버스",
            capacity_per_trip: 28,
            operating_hours: "07:00-21:00",
            estimated_cost: 400000,
          },
          {
            route_name: "호텔 셔틀",
            origin: "공식 호텔 5개소",
            destination: "베뉴",
            frequency_mins: 20,
            vehicle_type: "45인승 버스",
            capacity_per_trip: 45,
            operating_hours: "08:00-23:00",
            estimated_cost: 600000,
          },
        ],
        total_vehicles: shuttleCapacity + 3,
        vendor_recommendations: [
          "대한관광버스",
          "서울시티투어",
          "프리미엄 리무진",
        ],
      },
      parking_plan: {
        onsite_spaces: input.venue_location.parking_available ? 300 : 0,
        offsite_options: [
          {
            location: "인근 공영주차장",
            capacity: 500,
            distance_km: 0.5,
            shuttle_connection: true,
          },
          {
            location: "대형마트 주차장 (협약)",
            capacity: 300,
            distance_km: 1.0,
            shuttle_connection: true,
          },
        ],
        valet_service: (input.attendee_profile.vip_count || 0) > 20,
        parking_cost: 5000,
      },
      vip_transport: input.attendee_profile.vip_count && input.attendee_profile.vip_count > 0 ? {
        vehicles: [
          { type: "세단 (에쿠스/제네시스)", quantity: Math.ceil(input.attendee_profile.vip_count / 3), purpose: "공항 픽업/드롭" },
          { type: "밴 (스타리아)", quantity: Math.ceil(input.attendee_profile.vip_count / 7), purpose: "그룹 이동" },
        ],
        driver_count: Math.ceil(input.attendee_profile.vip_count / 5),
        staging_area: "베뉴 지하 VIP 전용 구역",
      } : undefined,
      public_transit: {
        nearest_stations: [
          {
            type: "지하철",
            name: "컨벤션센터역",
            distance_m: 300,
            lines: ["9호선"],
          },
          {
            type: "버스",
            name: "컨벤션센터 정류장",
            distance_m: 100,
            lines: ["360", "740", "공항버스 6000"],
          },
        ],
        recommended_routes: [
          "김포공항 → 9호선 → 컨벤션센터역 (40분)",
          "서울역 → 9호선 환승 → 컨벤션센터역 (35분)",
          "강남역 → 9호선 → 컨벤션센터역 (25분)",
        ],
        attendee_instructions: `
대중교통 이용 시 9호선 컨벤션센터역 1번 출구 이용.
출구에서 도보 5분 거리.
행사 당일 교통카드 할인 코드 제공 예정.
        `.trim(),
      },
      traffic_management: {
        peak_arrival_time: `${input.event_times.start.split(":")[0]}:00 - ${input.event_times.start}`,
        peak_departure_time: `${input.event_times.end} - ${parseInt(input.event_times.end.split(":")[0]) + 1}:00`,
        traffic_control_points: [
          "베뉴 정문 진입로",
          "주차장 입구",
          "셔틀 승하차 구역",
        ],
        police_coordination: input.attendee_profile.total > 1000,
        signage_needs: [
          "주차장 안내 (500m, 200m, 진입로)",
          "셔틀 승하차 안내",
          "VIP 차량 전용 표지",
          "보행자 동선 안내",
        ],
      },
    };
  },
};
