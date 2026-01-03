/**
 * SITE-012: 네트워크 연결 관리
 * CMP-IS Reference: 15.7.b - Network connectivity management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Network Infrastructure Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  attendee_count: z.number(),
  concurrent_devices_estimate: z.number().optional(),
  requirements: z.object({ streaming: z.boolean().default(false), live_polling: z.boolean().default(false), exhibitor_needs: z.boolean().default(false) }),
  venue_network: z.object({ bandwidth_mbps: z.number(), wifi_access_points: z.number() }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  bandwidth_analysis: z.object({ required_mbps: z.number(), available_mbps: z.number(), sufficient: z.boolean() }),
  wifi_plan: z.object({ ssids: z.array(z.object({ name: z.string(), purpose: z.string(), password_protected: z.boolean() })), access_points_needed: z.number() }),
  wired_requirements: z.object({ drops_needed: z.number(), locations: z.array(z.string()) }),
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
  const devices = validatedInput.concurrent_devices_estimate || validatedInput.attendee_count * 1.5;
  const requiredMbps = devices * 2 + (validatedInput.requirements.streaming ? 100 : 0);
  const availableMbps = validatedInput.venue_network?.bandwidth_mbps || 1000;

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    bandwidth_analysis: { required_mbps: requiredMbps, available_mbps: availableMbps, sufficient: availableMbps >= requiredMbps },
    wifi_plan: {
      ssids: [
        { name: "Event-Attendee", purpose: "참가자용", password_protected: true },
        { name: "Event-Staff", purpose: "스태프용", password_protected: true },
        { name: "Event-Exhibitor", purpose: "전시업체용", password_protected: true },
      ],
      access_points_needed: Math.ceil(validatedInput.attendee_count / 50),
    },
    wired_requirements: { drops_needed: 10, locations: ["Registration", "AV Booth", "Press Room"] },
    recommendations: ["네트워크 사전 테스트 필수", "백업 LTE 라우터 준비"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-012",
  taskName: "네트워크 연결 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.7.b",
  skill: "Skill 15: Site Operations",
  subSkill: "15.7: Technical Infrastructure",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
