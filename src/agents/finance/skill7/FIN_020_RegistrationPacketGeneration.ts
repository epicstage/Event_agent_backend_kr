/**
 * FIN-020: 등록 사전 안내 패킷 생성
 *
 * CMP-IS Reference: 7.2.b
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Registration Packet Generation.
CMP-IS Standard: 7.2.b - Creating registration information documents.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_info: z.object({
    name: z.string(),
    dates: z.string(),
    venue: z.string(),
    description: z.string(),
  }),
  pricing_info: z.array(z.object({
    tier_name: z.string(),
    price: z.number(),
    includes: z.array(z.string()),
    deadline: z.string().optional(),
  })),
  schedule_highlights: z.array(z.string()),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  packet_id: z.string().uuid(),
  event_id: z.string().uuid(),
  document_sections: z.array(z.object({
    section_title: z.string(),
    content: z.string(),
  })),
  pricing_table_html: z.string(),
  call_to_action: z.string(),
  registration_url_placeholder: z.string(),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const pricingRows = validated.pricing_info.map(p =>
    `<tr><td>${p.tier_name}</td><td>${validated.currency} ${p.price.toLocaleString()}</td><td>${p.includes.join(", ")}</td><td>${p.deadline || "상시"}</td></tr>`
  ).join("");

  const output: Output = {
    packet_id: generateUUID(),
    event_id: validated.event_id,
    document_sections: [
      { section_title: "이벤트 개요", content: validated.event_info.description },
      { section_title: "일시 및 장소", content: `${validated.event_info.dates} | ${validated.event_info.venue}` },
      { section_title: "주요 프로그램", content: validated.schedule_highlights.join("\n") },
      { section_title: "등록 안내", content: "아래 요금표를 참조하여 등록해 주세요." },
    ],
    pricing_table_html: `<table><thead><tr><th>등급</th><th>가격</th><th>포함 항목</th><th>마감일</th></tr></thead><tbody>${pricingRows}</tbody></table>`,
    call_to_action: "지금 등록하고 Early Bird 혜택을 받으세요!",
    registration_url_placeholder: "[REGISTRATION_URL]",
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-020",
  taskName: "등록 사전 안내 패킷 생성",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.2.b",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.2: Develop and Manage Registration Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
