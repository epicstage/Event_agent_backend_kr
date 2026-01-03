/**
 * SITE-016: 현장 벤더 조정
 * CMP-IS Reference: 15.4.c - On-site vendor coordination
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert On-site Vendor Coordinator.`;

export const InputSchema = z.object({
  event_id: z.string(),
  vendors: z.array(z.object({ vendor_id: z.string(), vendor_name: z.string(), service_type: z.string(), arrival_date: z.string(), contact_name: z.string(), contact_phone: z.string() })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  coordination_id: z.string(),
  event_id: z.string(),
  vendor_schedule: z.array(z.object({ vendor: z.string(), service: z.string(), arrival: z.string(), location: z.string(), coordinator: z.string() })),
  contact_sheet: z.array(z.object({ vendor: z.string(), contact: z.string(), phone: z.string() })),
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
    coordination_id: generateUUID(),
    event_id: validatedInput.event_id,
    vendor_schedule: validatedInput.vendors.map(v => ({
      vendor: v.vendor_name,
      service: v.service_type,
      arrival: v.arrival_date,
      location: "Loading Dock",
      coordinator: "현장 매니저",
    })),
    contact_sheet: validatedInput.vendors.map(v => ({ vendor: v.vendor_name, contact: v.contact_name, phone: v.contact_phone })),
    coordination_notes: ["벤더별 작업 구역 사전 지정", "일일 조회 미팅 진행"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-016",
  taskName: "현장 벤더 조정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.4.c",
  skill: "Skill 15: Site Operations",
  subSkill: "15.4: Logistics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
