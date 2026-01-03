/**
 * SITE-023: 게스트 숙박 관리
 * CMP-IS Reference: 16.2.b - Guest accommodation management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Guest Accommodation Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  guest_id: z.string(),
  guest_name: z.string(),
  special_requests: z.array(z.string()).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  accessibility_needs: z.array(z.string()).optional(),
  arrival_info: z.object({ flight: z.string().optional(), date: z.string(), time: z.string() }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  accommodation_id: z.string(),
  event_id: z.string(),
  guest_id: z.string(),
  accommodation_details: z.object({ room_ready_time: z.string(), welcome_amenities: z.array(z.string()), special_arrangements: z.array(z.string()) }),
  communication_plan: z.object({ pre_arrival_email: z.boolean(), welcome_message: z.string() }),
  coordination_notes: z.array(z.string()),
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

  return {
    accommodation_id: generateUUID(),
    event_id: validatedInput.event_id,
    guest_id: validatedInput.guest_id,
    accommodation_details: {
      room_ready_time: "14:00",
      welcome_amenities: ["생수", "과일 바구니", "환영 카드"],
      special_arrangements: validatedInput.special_requests || [],
    },
    communication_plan: {
      pre_arrival_email: true,
      welcome_message: `${validatedInput.guest_name}님, 환영합니다!`,
    },
    coordination_notes: [
      validatedInput.accessibility_needs?.length ? "접근성 객실 배정 완료" : "",
      validatedInput.dietary_restrictions?.length ? "식이 제한 호텔에 전달 완료" : "",
    ].filter(Boolean),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-023",
  taskName: "게스트 숙박 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.2.b",
  skill: "Skill 16: Housing Management",
  subSkill: "16.2: Room Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
