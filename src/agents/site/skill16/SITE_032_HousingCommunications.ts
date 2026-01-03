/**
 * SITE-032: 숙박 커뮤니케이션
 * CMP-IS Reference: 16.9.a - Housing communications
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Communications Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  communication_type: z.enum(["confirmation", "reminder", "update", "welcome", "checkout"]),
  recipients: z.array(z.object({
    guest_id: z.string(),
    guest_name: z.string(),
    email: z.string(),
    hotel_name: z.string(),
    check_in: z.string(),
    check_out: z.string(),
  })),
  custom_message: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  communication_id: z.string(),
  event_id: z.string(),
  template_used: z.string(),
  messages_generated: z.array(z.object({
    recipient_id: z.string(),
    recipient_name: z.string(),
    email: z.string(),
    subject: z.string(),
    body_preview: z.string(),
    status: z.string(),
  })),
  summary: z.object({ total_recipients: z.number(), messages_queued: z.number() }),
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

const templates: Record<string, { subject: string; bodyTemplate: string }> = {
  confirmation: {
    subject: "[{event}] 숙박 예약 확정 안내",
    bodyTemplate: "{name}님, {hotel}에서의 숙박이 확정되었습니다. 체크인: {checkin}, 체크아웃: {checkout}",
  },
  reminder: {
    subject: "[{event}] 체크인 3일 전 안내",
    bodyTemplate: "{name}님, 곧 {hotel} 체크인입니다. 체크인 날짜: {checkin}. 프론트에서 행사명을 말씀해주세요.",
  },
  update: {
    subject: "[{event}] 숙박 정보 업데이트",
    bodyTemplate: "{name}님, 숙박 정보가 업데이트되었습니다. {custom}",
  },
  welcome: {
    subject: "[{event}] 환영합니다!",
    bodyTemplate: "{name}님, {hotel}에 오신 것을 환영합니다! 행사장까지 셔틀이 운행됩니다.",
  },
  checkout: {
    subject: "[{event}] 체크아웃 안내",
    bodyTemplate: "{name}님, 체크아웃 시간은 {checkout}입니다. 즐거운 행사 되셨길 바랍니다.",
  },
};

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const template = templates[validatedInput.communication_type];

  const messages = validatedInput.recipients.map(r => ({
    recipient_id: r.guest_id,
    recipient_name: r.guest_name,
    email: r.email,
    subject: template.subject.replace("{event}", validatedInput.event_name),
    body_preview: template.bodyTemplate
      .replace("{name}", r.guest_name)
      .replace("{hotel}", r.hotel_name)
      .replace("{checkin}", r.check_in)
      .replace("{checkout}", r.check_out)
      .replace("{custom}", validatedInput.custom_message || "")
      .slice(0, 100) + "...",
    status: "queued",
  }));

  return {
    communication_id: generateUUID(),
    event_id: validatedInput.event_id,
    template_used: validatedInput.communication_type,
    messages_generated: messages,
    summary: {
      total_recipients: messages.length,
      messages_queued: messages.length,
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-032",
  taskName: "숙박 커뮤니케이션",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.9.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.9: Communications",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
