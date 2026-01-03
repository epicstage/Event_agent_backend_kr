/**
 * SITE-018: 폐기물 관리
 * CMP-IS Reference: 15.10.a - Waste management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Waste Management Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  attendee_count: z.number(),
  event_duration_days: z.number(),
  catering_included: z.boolean().default(true),
  sustainability_focus: z.boolean().default(false),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  waste_estimate: z.object({ general_kg: z.number(), recyclable_kg: z.number(), food_waste_kg: z.number() }),
  bin_requirements: z.array(z.object({ type: z.string(), quantity: z.number(), locations: z.array(z.string()) })),
  collection_schedule: z.array(z.object({ time: z.string(), areas: z.array(z.string()) })),
  sustainability_measures: z.array(z.string()),
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
  const wastePerPerson = 0.5; // kg per day
  const totalWaste = validatedInput.attendee_count * wastePerPerson * validatedInput.event_duration_days;

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    waste_estimate: {
      general_kg: Math.round(totalWaste * 0.4),
      recyclable_kg: Math.round(totalWaste * 0.35),
      food_waste_kg: validatedInput.catering_included ? Math.round(totalWaste * 0.25) : 0,
    },
    bin_requirements: [
      { type: "일반 쓰레기", quantity: Math.ceil(validatedInput.attendee_count / 100), locations: ["로비", "전시장", "휴게실"] },
      { type: "재활용", quantity: Math.ceil(validatedInput.attendee_count / 100), locations: ["로비", "전시장", "휴게실"] },
      { type: "음식물", quantity: validatedInput.catering_included ? Math.ceil(validatedInput.attendee_count / 200) : 0, locations: ["케이터링 구역"] },
    ],
    collection_schedule: [
      { time: "12:00", areas: ["로비", "휴게실"] },
      { time: "18:00", areas: ["전체 구역"] },
    ],
    sustainability_measures: validatedInput.sustainability_focus ? ["재사용 가능 식기 사용", "디지털 자료 배포", "잔반 줄이기 캠페인"] : [],
    recommendations: ["분리수거 안내 게시", "친환경 인증 폐기물 업체 계약"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-018",
  taskName: "폐기물 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.10.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.10: Sustainability",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
