/**
 * SITE-040: 숙박 비상 대응
 * CMP-IS Reference: 16.14.a - Housing emergency response
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Emergency Response Coordinator.`;

export const InputSchema = z.object({
  event_id: z.string(),
  emergency_type: z.enum(["hotel_closure", "overbooking", "natural_disaster", "health_emergency", "security_incident"]),
  affected_hotel: z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    affected_rooms: z.number(),
    affected_guests: z.array(z.object({
      guest_id: z.string(),
      guest_name: z.string(),
      contact: z.string(),
      vip_level: z.string().optional(),
    })),
  }),
  alternative_hotels: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    available_rooms: z.number(),
    distance_km: z.number(),
    rate: z.number(),
  })),
  incident_details: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  response_plan_id: z.string(),
  event_id: z.string(),
  incident_summary: z.object({
    type: z.string(),
    severity: z.string(),
    affected_guests_count: z.number(),
    timestamp: z.string(),
  }),
  relocation_plan: z.array(z.object({
    guest_id: z.string(),
    guest_name: z.string(),
    priority: z.number(),
    new_hotel: z.string(),
    status: z.string(),
  })),
  communication_plan: z.object({
    immediate_actions: z.array(z.string()),
    guest_notification_template: z.string(),
    stakeholder_alerts: z.array(z.object({ stakeholder: z.string(), message: z.string() })),
  }),
  logistics: z.object({
    transportation_arranged: z.boolean(),
    luggage_handling: z.string(),
    cost_implications: z.object({ estimated_additional_cost: z.number(), responsibility: z.string() }),
  }),
  follow_up_actions: z.array(z.object({ action: z.string(), owner: z.string(), deadline: z.string() })),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const severity = validatedInput.affected_hotel.affected_guests.length > 50 ? "high"
    : validatedInput.affected_hotel.affected_guests.length > 20 ? "medium" : "low";

  // Sort alternatives by distance and availability
  const sortedAlternatives = validatedInput.alternative_hotels
    .filter(h => h.available_rooms > 0)
    .sort((a, b) => a.distance_km - b.distance_km);

  // Prioritize guests (VIP first)
  const prioritizedGuests = validatedInput.affected_hotel.affected_guests
    .map((g, i) => ({ ...g, priority: g.vip_level ? 1 : 2, index: i }))
    .sort((a, b) => a.priority - b.priority);

  // Assign to hotels
  let hotelIndex = 0;
  let roomsUsed = 0;
  const relocationPlan = prioritizedGuests.map(g => {
    if (hotelIndex >= sortedAlternatives.length) {
      return {
        guest_id: g.guest_id,
        guest_name: g.guest_name,
        priority: g.priority,
        new_hotel: "대기 - 추가 호텔 확보 필요",
        status: "pending",
      };
    }

    const hotel = sortedAlternatives[hotelIndex];
    roomsUsed++;
    if (roomsUsed >= hotel.available_rooms) {
      hotelIndex++;
      roomsUsed = 0;
    }

    return {
      guest_id: g.guest_id,
      guest_name: g.guest_name,
      priority: g.priority,
      new_hotel: hotel.hotel_name,
      status: "assigned",
    };
  });

  const additionalCost = sortedAlternatives.slice(0, Math.ceil(validatedInput.affected_hotel.affected_guests.length / 10))
    .reduce((sum, h) => sum + h.rate * 3, 0);

  return {
    response_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    incident_summary: {
      type: validatedInput.emergency_type,
      severity,
      affected_guests_count: validatedInput.affected_hotel.affected_guests.length,
      timestamp: new Date().toISOString(),
    },
    relocation_plan,
    communication_plan: {
      immediate_actions: [
        "영향받은 게스트 즉시 연락",
        "대체 호텔 확정 및 예약",
        "교통편 수배",
        "행사 운영팀에 상황 공유",
      ],
      guest_notification_template: `긴급 안내: ${validatedInput.affected_hotel.hotel_name} 숙박에 문제가 발생하여 대체 호텔로 이동해 주셔야 합니다. 불편을 드려 죄송하며, 신속히 지원하겠습니다.`,
      stakeholder_alerts: [
        { stakeholder: "행사 디렉터", message: `숙박 비상상황 발생 - ${validatedInput.affected_hotel.affected_guests.length}명 영향` },
        { stakeholder: "재무팀", message: "추가 비용 발생 예상 - 승인 필요" },
      ],
    },
    logistics: {
      transportation_arranged: true,
      luggage_handling: "포터 서비스 수배 - 기존 호텔에서 신규 호텔로 직접 이송",
      cost_implications: {
        estimated_additional_cost: additionalCost,
        responsibility: validatedInput.emergency_type === "overbooking" ? "기존 호텔 부담" : "행사 비상예산",
      },
    },
    follow_up_actions: [
      { action: "게스트 만족도 확인 전화", owner: "Housing Team", deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
      { action: "비용 정산 및 클레임", owner: "Finance", deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
      { action: "사후 리뷰 및 개선점 도출", owner: "Operations", deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-040",
  taskName: "숙박 비상 대응",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.14.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.14: Emergency Response",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
