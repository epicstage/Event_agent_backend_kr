/**
 * SITE-010: 사이니지 및 안내 시스템
 * CMP-IS Reference: 15.6.a - Signage and wayfinding
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Signage and Wayfinding Designer.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_areas: z.array(z.object({ area_name: z.string(), purpose: z.string() })),
  attendee_flow: z.array(z.string()),
  branding: z.object({ primary_color: z.string(), logo_url: z.string().optional() }).optional(),
  languages: z.array(z.string()).default(["ko", "en"]),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  signage_plan_id: z.string(),
  event_id: z.string(),
  signage_list: z.array(z.object({ type: z.string(), location: z.string(), content: z.string(), size: z.string(), quantity: z.number() })),
  wayfinding_strategy: z.object({ entry_to_registration: z.array(z.string()), key_routes: z.array(z.object({ from: z.string(), to: z.string(), signs: z.number() })) }),
  total_signs: z.number(),
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
  const signs = validatedInput.venue_areas.map(area => ({
    type: "방향 안내판",
    location: area.area_name,
    content: `${area.area_name} →`,
    size: "A1",
    quantity: 2,
  }));

  return {
    signage_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    signage_list: signs,
    wayfinding_strategy: {
      entry_to_registration: ["입구 배너", "바닥 안내 스티커", "등록대 사인"],
      key_routes: validatedInput.venue_areas.slice(0, 3).map((area, i) => ({
        from: i === 0 ? "입구" : validatedInput.venue_areas[i - 1].area_name,
        to: area.area_name,
        signs: 2,
      })),
    },
    total_signs: signs.reduce((sum, s) => sum + s.quantity, 0),
    estimated_cost: signs.reduce((sum, s) => sum + s.quantity * 50000, 0),
    recommendations: ["다국어 표기 필수", "화살표와 아이콘 활용"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-010",
  taskName: "사이니지 및 안내 시스템",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.6.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.6: Signage & Wayfinding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
