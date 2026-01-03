/**
 * SITE-013: AV/기술 지원
 * CMP-IS Reference: 15.7.c - AV and technical support
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event AV Technical Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  sessions: z.array(z.object({ session_name: z.string(), type: z.string(), attendees: z.number(), av_needs: z.array(z.string()).optional() })),
  venue_av_available: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  av_requirements: z.array(z.object({ item: z.string(), quantity: z.number(), rental_needed: z.boolean() })),
  technical_staff: z.object({ technicians: z.number(), operators: z.number() }),
  by_session: z.array(z.object({ session: z.string(), equipment: z.array(z.string()) })),
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
  const venueAV = new Set(validatedInput.venue_av_available || []);

  const requirements = [
    { item: "무선 마이크", quantity: validatedInput.sessions.length * 2, rental_needed: !venueAV.has("wireless_mic") },
    { item: "프로젝터", quantity: validatedInput.sessions.length, rental_needed: !venueAV.has("projector") },
    { item: "스크린", quantity: validatedInput.sessions.length, rental_needed: !venueAV.has("screen") },
    { item: "믹서", quantity: 1, rental_needed: !venueAV.has("mixer") },
  ];

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    av_requirements: requirements,
    technical_staff: { technicians: Math.ceil(validatedInput.sessions.length / 3), operators: Math.ceil(validatedInput.sessions.length / 5) },
    by_session: validatedInput.sessions.map(s => ({ session: s.session_name, equipment: s.av_needs || ["마이크", "프로젝터"] })),
    estimated_cost: requirements.filter(r => r.rental_needed).reduce((sum, r) => sum + r.quantity * 200000, 0),
    recommendations: ["리허설 시 AV 테스트 필수", "백업 장비 준비"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-013",
  taskName: "AV/기술 지원",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.7.c",
  skill: "Skill 15: Site Operations",
  subSkill: "15.7: Technical Infrastructure",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
