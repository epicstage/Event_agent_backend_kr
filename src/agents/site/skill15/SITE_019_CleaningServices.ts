/**
 * SITE-019: 청소 서비스 관리
 * CMP-IS Reference: 15.10.b - Cleaning services management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Cleaning Services Coordinator.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_size_sqm: z.number(),
  attendee_count: z.number(),
  event_duration_days: z.number(),
  high_traffic_areas: z.array(z.string()),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  cleaning_schedule: z.array(z.object({ time: z.string(), areas: z.array(z.string()), tasks: z.array(z.string()) })),
  staff_requirements: z.object({ cleaners: z.number(), supervisors: z.number() }),
  supplies_needed: z.array(z.object({ item: z.string(), quantity: z.number() })),
  estimated_cost: z.number(),
  recommendations: z.array(z.string()),
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
  const cleanersNeeded = Math.ceil(validatedInput.venue_size_sqm / 500);

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    cleaning_schedule: [
      { time: "06:00", areas: ["전체"], tasks: ["바닥 청소", "화장실 점검"] },
      { time: "12:00", areas: validatedInput.high_traffic_areas, tasks: ["쓰레기통 비우기", "화장실 청소"] },
      { time: "18:00", areas: validatedInput.high_traffic_areas, tasks: ["바닥 청소", "테이블 정리"] },
      { time: "22:00", areas: ["전체"], tasks: ["전체 청소", "다음날 준비"] },
    ],
    staff_requirements: { cleaners: cleanersNeeded, supervisors: Math.ceil(cleanersNeeded / 5) },
    supplies_needed: [
      { item: "청소 세제", quantity: Math.ceil(validatedInput.venue_size_sqm / 100) },
      { item: "쓰레기 봉투", quantity: validatedInput.attendee_count * validatedInput.event_duration_days },
      { item: "화장지", quantity: Math.ceil(validatedInput.attendee_count / 50) * validatedInput.event_duration_days },
    ],
    estimated_cost: cleanersNeeded * 150000 * validatedInput.event_duration_days,
    recommendations: ["휴게 시간 집중 청소", "화장실 2시간 간격 점검"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-019",
  taskName: "청소 서비스 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.10.b",
  skill: "Skill 15: Site Operations",
  subSkill: "15.10: Sustainability",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
