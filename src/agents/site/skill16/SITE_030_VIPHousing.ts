/**
 * SITE-030: VIP 숙박 관리
 * CMP-IS Reference: 16.8.a - VIP housing management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert VIP Housing Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  vip_guests: z.array(z.object({
    guest_id: z.string(),
    guest_name: z.string(),
    vip_level: z.enum(["platinum", "gold", "silver"]),
    title: z.string().optional(),
    preferences: z.object({
      room_type: z.string().optional(),
      floor_preference: z.string().optional(),
      amenities: z.array(z.string()).optional(),
      dietary: z.array(z.string()).optional(),
    }).optional(),
    check_in: z.string(),
    check_out: z.string(),
  })),
  available_suites: z.number(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  vip_plan_id: z.string(),
  event_id: z.string(),
  assignments: z.array(z.object({
    guest_id: z.string(),
    guest_name: z.string(),
    vip_level: z.string(),
    room_assignment: z.object({ room_type: z.string(), floor: z.string(), special_setup: z.array(z.string()) }),
    amenities_package: z.array(z.string()),
    concierge_notes: z.array(z.string()),
  })),
  resource_requirements: z.object({ suites_needed: z.number(), suites_available: z.number(), upgrade_requests: z.number() }),
  special_arrangements: z.array(z.object({ guest_id: z.string(), arrangement: z.string(), status: z.string() })),
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

  const vipPackages: Record<string, string[]> = {
    platinum: ["프리미엄 스위트", "개인 컨시어지", "공항 VIP 픽업", "환영 샴페인", "프리미엄 미니바"],
    gold: ["주니어 스위트", "우선 체크인", "환영 과일바구니", "미니바 크레딧"],
    silver: ["디럭스룸", "빠른 체크인", "환영 카드"],
  };

  const assignments = validatedInput.vip_guests.map(g => ({
    guest_id: g.guest_id,
    guest_name: g.guest_name,
    vip_level: g.vip_level,
    room_assignment: {
      room_type: g.preferences?.room_type || (g.vip_level === "platinum" ? "프레지덴셜 스위트" : g.vip_level === "gold" ? "주니어 스위트" : "디럭스"),
      floor: g.preferences?.floor_preference || "고층",
      special_setup: g.preferences?.amenities || [],
    },
    amenities_package: vipPackages[g.vip_level] || [],
    concierge_notes: [
      g.title ? `호칭: ${g.title}` : "",
      g.preferences?.dietary?.length ? `식이제한: ${g.preferences.dietary.join(", ")}` : "",
    ].filter(Boolean),
  }));

  const suitesNeeded = validatedInput.vip_guests.filter(g => g.vip_level === "platinum" || g.vip_level === "gold").length;

  return {
    vip_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    assignments,
    resource_requirements: {
      suites_needed: suitesNeeded,
      suites_available: validatedInput.available_suites,
      upgrade_requests: Math.max(0, suitesNeeded - validatedInput.available_suites),
    },
    special_arrangements: validatedInput.vip_guests
      .filter(g => g.preferences?.amenities?.length)
      .map(g => ({
        guest_id: g.guest_id,
        arrangement: g.preferences!.amenities!.join(", "),
        status: "pending",
      })),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-030",
  taskName: "VIP 숙박 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.8.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.8: VIP Services",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
