/**
 * FIN-033: 공급사 견적 수집
 *
 * CMP-IS Reference: 8.1.c
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Vendor Quote Collection.
CMP-IS Standard: 8.1.c - Collecting and organizing vendor quotes (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  categories_needed: z.array(z.object({
    category: z.string(),
    description: z.string(),
    estimated_budget: z.number().optional(),
  })),
  event_requirements: z.object({
    event_date: z.string(),
    location: z.string(),
    attendee_count: z.number().int(),
    special_requirements: z.array(z.string()).optional(),
  }),
  preferred_vendors: z.array(z.object({
    vendor_name: z.string(),
    category: z.string(),
    contact_info: z.string().optional(),
  })).optional(),
  deadline_for_quotes: z.string(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  collection_id: z.string().uuid(),
  event_id: z.string().uuid(),
  rfq_documents: z.array(z.object({
    category: z.string(),
    rfq_template: z.object({
      header: z.string(),
      scope_of_work: z.array(z.string()),
      specifications: z.array(z.string()),
      submission_requirements: z.array(z.string()),
      evaluation_criteria: z.array(z.object({
        criterion: z.string(),
        weight: z.number(),
      })),
    }),
    suggested_vendors: z.array(z.string()),
  })),
  tracking_sheet: z.object({
    columns: z.array(z.string()),
    initial_status: z.string(),
  }),
  timeline: z.array(z.object({
    activity: z.string(),
    deadline: z.string(),
    responsible: z.string(),
  })),
  negotiation_tips: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const rfqDocs = validated.categories_needed.map(cat => ({
    category: cat.category,
    rfq_template: {
      header: `견적 요청서 (RFQ) - ${cat.category}`,
      scope_of_work: [
        `이벤트: ${validated.event_requirements.location}`,
        `일자: ${validated.event_requirements.event_date}`,
        `예상 참석자: ${validated.event_requirements.attendee_count}명`,
        cat.description,
      ],
      specifications: [
        "상세 품목별 단가 포함",
        "설치/철거 비용 별도 명시",
        "결제 조건 명시",
        "취소 정책 포함",
        ...validated.event_requirements.special_requirements || [],
      ],
      submission_requirements: [
        "회사 소개서",
        "관련 포트폴리오",
        "레퍼런스 2개 이상",
        "보험 증서 사본",
        "상세 견적서",
      ],
      evaluation_criteria: [
        { criterion: "가격 경쟁력", weight: 30 },
        { criterion: "품질/경험", weight: 25 },
        { criterion: "서비스 범위", weight: 20 },
        { criterion: "유연성/대응력", weight: 15 },
        { criterion: "레퍼런스", weight: 10 },
      ],
    },
    suggested_vendors: validated.preferred_vendors
      ?.filter(v => v.category === cat.category)
      .map(v => v.vendor_name) || [`${cat.category} 전문업체 A`, `${cat.category} 전문업체 B`],
  }));

  const output: Output = {
    collection_id: generateUUID(),
    event_id: validated.event_id,
    rfq_documents: rfqDocs,
    tracking_sheet: {
      columns: [
        "카테고리",
        "업체명",
        "연락처",
        "RFQ 발송일",
        "견적 수령일",
        "견적 금액",
        "상태",
        "비고",
      ],
      initial_status: "RFQ 발송 대기",
    },
    timeline: [
      { activity: "RFQ 문서 확정", deadline: "D-30", responsible: "구매팀" },
      { activity: "RFQ 발송", deadline: "D-28", responsible: "구매팀" },
      { activity: "질의응답 기간", deadline: "D-21", responsible: "프로젝트팀" },
      { activity: "견적 마감", deadline: validated.deadline_for_quotes, responsible: "업체" },
      { activity: "견적 평가", deadline: "D-14", responsible: "평가위원회" },
      { activity: "협상 및 선정", deadline: "D-7", responsible: "구매팀" },
    ],
    negotiation_tips: [
      "복수 업체 경쟁 구도 활용",
      "장기 파트너십 가능성 언급",
      "패키지 딜 요청",
      "결제 조건 협상 (조기 결제 할인 등)",
      "추가 서비스 무료 제공 요청",
      "다음 이벤트 우선 협상권 제안",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-033",
  taskName: "공급사 견적 수집",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 8.1.c",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
