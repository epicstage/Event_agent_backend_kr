/**
 * SITE-034: 그룹 룸 블록 관리
 * CMP-IS Reference: 16.1.b - Group room block management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Group Room Block Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  groups: z.array(z.object({
    group_id: z.string(),
    group_name: z.string(),
    member_count: z.number(),
    room_type_preference: z.string().optional(),
    budget_per_room: z.number().optional(),
    special_requirements: z.array(z.string()).optional(),
  })),
  available_hotels: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    available_rooms: z.number(),
    rate: z.number(),
    amenities: z.array(z.string()),
  })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  allocation_plan_id: z.string(),
  event_id: z.string(),
  group_assignments: z.array(z.object({
    group_id: z.string(),
    group_name: z.string(),
    assigned_hotel: z.string(),
    rooms_allocated: z.number(),
    rate: z.number(),
    total_cost: z.number(),
    fit_score: z.number(),
  })),
  hotel_utilization: z.array(z.object({
    hotel_name: z.string(),
    total_rooms: z.number(),
    rooms_assigned: z.number(),
    remaining: z.number(),
  })),
  unassigned_groups: z.array(z.object({ group_id: z.string(), reason: z.string() })),
  total_cost_estimate: z.number(),
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
  const hotelAvailability = new Map(validatedInput.available_hotels.map(h => [h.hotel_id, h.available_rooms]));
  const assignments: Array<{
    group_id: string;
    group_name: string;
    assigned_hotel: string;
    rooms_allocated: number;
    rate: number;
    total_cost: number;
    fit_score: number;
  }> = [];
  const unassigned: Array<{ group_id: string; reason: string }> = [];

  for (const group of validatedInput.groups) {
    const sortedHotels = validatedInput.available_hotels
      .filter(h => (hotelAvailability.get(h.hotel_id) || 0) >= group.member_count)
      .filter(h => !group.budget_per_room || h.rate <= group.budget_per_room)
      .sort((a, b) => a.rate - b.rate);

    if (sortedHotels.length > 0) {
      const selectedHotel = sortedHotels[0];
      const currentAvail = hotelAvailability.get(selectedHotel.hotel_id) || 0;
      hotelAvailability.set(selectedHotel.hotel_id, currentAvail - group.member_count);

      assignments.push({
        group_id: group.group_id,
        group_name: group.group_name,
        assigned_hotel: selectedHotel.hotel_name,
        rooms_allocated: group.member_count,
        rate: selectedHotel.rate,
        total_cost: group.member_count * selectedHotel.rate * 3, // 3박 가정
        fit_score: group.budget_per_room ? Math.round((1 - selectedHotel.rate / group.budget_per_room) * 100) : 80,
      });
    } else {
      unassigned.push({ group_id: group.group_id, reason: "적합한 호텔 없음 (가용 객실 또는 예산 초과)" });
    }
  }

  const hotelUtilization = validatedInput.available_hotels.map(h => ({
    hotel_name: h.hotel_name,
    total_rooms: h.available_rooms,
    rooms_assigned: h.available_rooms - (hotelAvailability.get(h.hotel_id) || 0),
    remaining: hotelAvailability.get(h.hotel_id) || 0,
  }));

  return {
    allocation_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    group_assignments: assignments,
    hotel_utilization: hotelUtilization,
    unassigned_groups: unassigned,
    total_cost_estimate: assignments.reduce((sum, a) => sum + a.total_cost, 0),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-034",
  taskName: "그룹 룸 블록 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.1.b",
  skill: "Skill 16: Housing Management",
  subSkill: "16.1: Hotel Contracting",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
