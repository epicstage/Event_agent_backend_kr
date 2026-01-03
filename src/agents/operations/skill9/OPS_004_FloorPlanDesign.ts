/**
 * OPS-004: Floor Plan Design Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 행사장 평면도 및 레이아웃 설계
 */

import { z } from "zod";

export const OPS_004_FloorPlanDesign = {
  id: "OPS-004",
  name: "Floor Plan Design Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 공간 설계 전문가입니다.
참석자 동선, 안전 규정, 브랜딩 임팩트를 모두 고려한
최적의 레이아웃을 설계합니다.
공간이 경험을 결정한다는 철학으로 모든 세부사항을 설계합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_id: z.string(),
    space_dimensions: z.object({
      width_m: z.number(),
      length_m: z.number(),
      height_m: z.number(),
    }),
    event_format: z.string(), // conference, exhibition, gala, hybrid
    capacity_required: z.number(),
    zones_needed: z.array(z.object({
      zone_type: z.string(), // stage, seating, exhibition, registration, catering, networking
      priority: z.enum(["must_have", "important", "nice_to_have"]),
      special_requirements: z.string().optional(),
    })),
    accessibility_requirements: z.boolean().optional(),
  }),

  outputSchema: z.object({
    floor_plan: z.object({
      total_area_sqm: z.number(),
      usable_area_sqm: z.number(),
      layout_type: z.string(),
    }),
    zones: z.array(z.object({
      zone_id: z.string(),
      zone_type: z.string(),
      position: z.object({
        x_start_m: z.number(),
        y_start_m: z.number(),
        width_m: z.number(),
        length_m: z.number(),
      }),
      area_sqm: z.number(),
      capacity: z.number().optional(),
      equipment_placement: z.array(z.string()),
      access_points: z.array(z.string()),
    })),
    traffic_flow: z.object({
      main_entrance: z.string(),
      primary_aisles: z.array(z.object({
        from: z.string(),
        to: z.string(),
        width_m: z.number(),
      })),
      emergency_exits: z.array(z.string()),
      bottleneck_risks: z.array(z.string()),
    }),
    safety_compliance: z.object({
      max_occupancy: z.number(),
      exit_capacity: z.number(),
      aisle_widths_compliant: z.boolean(),
      accessibility_compliant: z.boolean(),
      fire_safety_notes: z.array(z.string()),
    }),
    furniture_summary: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      zone: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_004_FloorPlanDesign.inputSchema>) => {
    const totalArea = input.space_dimensions.width_m * input.space_dimensions.length_m;
    const usableArea = totalArea * 0.85; // 15% for aisles and access

    const zones = input.zones_needed.map((zone, idx) => {
      const zoneArea = usableArea / input.zones_needed.length;
      const cols = Math.ceil(Math.sqrt(input.zones_needed.length));
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      return {
        zone_id: `ZONE-${String(idx + 1).padStart(2, "0")}`,
        zone_type: zone.zone_type,
        position: {
          x_start_m: col * (input.space_dimensions.width_m / cols),
          y_start_m: row * (input.space_dimensions.length_m / Math.ceil(input.zones_needed.length / cols)),
          width_m: input.space_dimensions.width_m / cols,
          length_m: input.space_dimensions.length_m / Math.ceil(input.zones_needed.length / cols),
        },
        area_sqm: Math.round(zoneArea),
        capacity: zone.zone_type === "seating" ? input.capacity_required : undefined,
        equipment_placement: getEquipmentForZone(zone.zone_type),
        access_points: [`${zone.zone_type}_entry_1`, `${zone.zone_type}_entry_2`],
      };
    });

    function getEquipmentForZone(zoneType: string): string[] {
      const equipment: Record<string, string[]> = {
        stage: ["무대 (8m x 6m)", "LED 스크린", "연단", "모니터 스피커"],
        seating: ["의자", "테이블 (필요시)", "통역 수신기 배포대"],
        exhibition: ["부스 파티션", "전시 조명", "전원 분배함"],
        registration: ["등록 데스크 (4대)", "배지 프린터", "안내 키오스크"],
        catering: ["뷔페 테이블", "음료 스테이션", "하이탑 테이블"],
        networking: ["라운지 소파", "하이탑 테이블", "충전 스테이션"],
      };
      return equipment[zoneType] || ["일반 가구"];
    }

    return {
      floor_plan: {
        total_area_sqm: Math.round(totalArea),
        usable_area_sqm: Math.round(usableArea),
        layout_type: input.event_format === "exhibition" ? "Open Floor" : "Theater/Mixed",
      },
      zones: zones,
      traffic_flow: {
        main_entrance: "South Entry (정문)",
        primary_aisles: [
          { from: "Main Entrance", to: "Registration", width_m: 3.0 },
          { from: "Registration", to: "Main Hall", width_m: 2.5 },
          { from: "Main Hall", to: "Catering", width_m: 2.5 },
          { from: "Main Hall", to: "Exhibition", width_m: 2.0 },
        ],
        emergency_exits: ["North Exit (후문)", "East Exit (동측)", "West Exit (서측)"],
        bottleneck_risks: [
          "휴식 시간 Registration→Catering 동선",
          "세션 종료 후 Main Hall 출구",
        ],
      },
      safety_compliance: {
        max_occupancy: Math.floor(usableArea / 1.5), // 1.5 sqm per person
        exit_capacity: Math.floor(usableArea / 1.5) * 1.2, // 20% buffer
        aisle_widths_compliant: true,
        accessibility_compliant: input.accessibility_requirements !== false,
        fire_safety_notes: [
          "비상구 3개소 - 수용인원 대비 적정",
          "스프링클러 시스템 확인 필요",
          "소화기 배치도 별도 작성",
          "비상 대피로 표지판 설치 필요",
        ],
      },
      furniture_summary: [
        { item: "의자", quantity: input.capacity_required, zone: "Seating" },
        { item: "등록 데스크", quantity: 4, zone: "Registration" },
        { item: "뷔페 테이블", quantity: 6, zone: "Catering" },
        { item: "하이탑 테이블", quantity: 15, zone: "Networking" },
        { item: "라운지 소파 세트", quantity: 5, zone: "Networking" },
        { item: "전시 부스 (3x3m)", quantity: Math.floor(usableArea * 0.1 / 9), zone: "Exhibition" },
      ],
    };
  },
};
