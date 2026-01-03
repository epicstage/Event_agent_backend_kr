/**
 * FIN-025: 전시사 계약 관리
 *
 * CMP-IS Reference: 7.3.d
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Exhibitor Contract Management.
CMP-IS Standard: 7.3.d - Managing exhibitor contracts and documentation (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  exhibitor_info: z.object({
    company_name: z.string(),
    contact_person: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  package_details: z.object({
    package_name: z.string(),
    booth_size: z.string(),
    location: z.string(),
    price: z.number(),
  }),
  contract_terms: z.object({
    payment_schedule: z.array(z.object({
      milestone: z.string(),
      percentage: z.number(),
      due_date: z.string(),
    })),
    cancellation_policy: z.string(),
    liability_terms: z.string().optional(),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  contract_id: z.string().uuid(),
  event_id: z.string().uuid(),
  contract_draft: z.object({
    header: z.string(),
    parties: z.object({
      organizer: z.string(),
      exhibitor: z.string(),
    }),
    scope_of_work: z.array(z.string()),
    pricing_section: z.string(),
    payment_terms: z.string(),
    cancellation_clause: z.string(),
    liability_clause: z.string(),
    signatures_required: z.array(z.string()),
  }),
  checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(["pending", "completed", "not_applicable"]),
    responsible: z.string(),
  })),
  next_steps: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const paymentTerms = validated.contract_terms.payment_schedule
    .map(p => `${p.milestone}: ${p.percentage}% (${p.due_date})`)
    .join("; ");

  const output: Output = {
    contract_id: generateUUID(),
    event_id: validated.event_id,
    contract_draft: {
      header: `전시 참가 계약서 - ${validated.exhibitor_info.company_name}`,
      parties: {
        organizer: "[이벤트 주최사 정보]",
        exhibitor: `${validated.exhibitor_info.company_name} (담당: ${validated.exhibitor_info.contact_person})`,
      },
      scope_of_work: [
        `부스 제공: ${validated.package_details.booth_size} @ ${validated.package_details.location}`,
        `패키지: ${validated.package_details.package_name}`,
        "전시 공간 사용권",
        "기본 시설 및 유틸리티",
      ],
      pricing_section: `총 계약 금액: ${validated.currency} ${validated.package_details.price.toLocaleString()}`,
      payment_terms: paymentTerms,
      cancellation_clause: validated.contract_terms.cancellation_policy,
      liability_clause: validated.contract_terms.liability_terms || "표준 책임 조항 적용",
      signatures_required: ["주최사 대표", "전시사 대표", "증인(선택)"],
    },
    checklist: [
      { item: "계약서 초안 작성", status: "completed", responsible: "AI Assistant" },
      { item: "법무 검토", status: "pending", responsible: "법무팀" },
      { item: "가격 및 조건 확정", status: "pending", responsible: "영업팀" },
      { item: "전시사 서명", status: "pending", responsible: validated.exhibitor_info.contact_person },
      { item: "주최사 서명", status: "pending", responsible: "운영팀장" },
      { item: "계약금 수령 확인", status: "pending", responsible: "재무팀" },
    ],
    next_steps: [
      "계약서 초안을 전시사에 발송",
      "협상 포인트가 있는 경우 조율",
      "최종 버전 서명 및 스캔본 보관",
      "결제 일정에 따른 인보이스 발행",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-025",
  taskName: "전시사 계약 관리",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 7.3.d",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.3: Develop and Manage Exhibit/Sponsorship Sales Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
