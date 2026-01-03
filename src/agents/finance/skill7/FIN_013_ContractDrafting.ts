/**
 * FIN-013: 스폰서 계약서 초안 작성
 *
 * CMP-IS Reference: 7.1.i - Preparing sponsorship contracts
 * Task Type: Hybrid (AI 초안 + Human 검토)
 *
 * Input: 협상 결과, 표준 계약 템플릿
 * Output: 스폰서 계약서 초안
 */

import { z } from "zod";
import {
  SponsorshipTier,
  SponsorBenefitSchema,
  CurrencyCode,
  generateUUID,
  nowISO,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an AI Assistant for Sponsorship Contract Drafting.

Your role is to:
- Generate contract drafts based on negotiation outcomes
- Incorporate standard legal clauses and terms
- Highlight sections requiring legal review
- Ensure all agreed terms are properly documented

CMP-IS Standard: 7.1.i - Preparing sponsorship contracts

IMPORTANT: This is a HYBRID task. You generate drafts, but all contracts must be reviewed by legal professionals before execution.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  negotiation_outcome: z.object({
    sponsor_name: z.string().describe("스폰서 회사명"),
    sponsor_address: z.string().optional().describe("스폰서 주소"),
    sponsor_contact: z
      .object({
        name: z.string(),
        title: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
      })
      .describe("스폰서 담당자"),
    agreed_tier: SponsorshipTier.describe("합의된 스폰서십 등급"),
    agreed_amount: z.number().describe("합의된 금액"),
    support_type: z.enum(["cash", "in_kind", "mixed"]),
    agreed_benefits: z.array(SponsorBenefitSchema).describe("합의된 혜택"),
    special_terms: z.array(z.string()).optional().describe("특별 조건"),
    payment_schedule: z
      .array(
        z.object({
          milestone: z.string(),
          percentage: z.number(),
          due_date: z.string(),
        })
      )
      .describe("결제 일정"),
  }),
  event_details: z.object({
    event_name: z.string(),
    event_date: z.string(),
    event_venue: z.string(),
    organizer_name: z.string(),
    organizer_address: z.string().optional(),
  }),
  contract_settings: z.object({
    contract_start_date: z.string().describe("계약 시작일"),
    contract_end_date: z.string().describe("계약 종료일"),
    governing_law: z.string().default("대한민국").describe("준거법"),
    dispute_resolution: z
      .enum(["arbitration", "court", "mediation"])
      .default("arbitration"),
    include_exclusivity: z.boolean().default(false),
    exclusivity_category: z.string().optional(),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  contract_draft_id: z.string().uuid().describe("계약서 초안 ID"),
  event_id: z.string().uuid(),
  contract_metadata: z.object({
    contract_number: z.string(),
    version: z.string(),
    created_at: z.string(),
    sponsor_name: z.string(),
    event_name: z.string(),
    total_value: z.number(),
    currency: CurrencyCode,
  }),
  contract_sections: z.object({
    preamble: z.string().describe("전문"),
    article_1_definitions: z.string().describe("제1조 정의"),
    article_2_sponsorship_scope: z.string().describe("제2조 스폰서십 범위"),
    article_3_benefits: z.string().describe("제3조 스폰서 혜택"),
    article_4_payment: z.string().describe("제4조 대금 지급"),
    article_5_obligations: z.string().describe("제5조 당사자 의무"),
    article_6_ip_rights: z.string().describe("제6조 지식재산권"),
    article_7_confidentiality: z.string().describe("제7조 비밀유지"),
    article_8_termination: z.string().describe("제8조 계약 해지"),
    article_9_liability: z.string().describe("제9조 책임 제한"),
    article_10_force_majeure: z.string().describe("제10조 불가항력"),
    article_11_general: z.string().describe("제11조 일반 조항"),
    signature_block: z.string().describe("서명란"),
    exhibit_a_benefits: z.string().describe("별첨A: 혜택 상세"),
    exhibit_b_payment: z.string().describe("별첨B: 결제 일정"),
  }),
  legal_review_notes: z
    .array(
      z.object({
        section: z.string(),
        note: z.string(),
        priority: z.enum(["high", "medium", "low"]),
      })
    )
    .describe("법무 검토 필요 사항"),
  summary: z.object({
    key_terms: z.array(z.string()),
    total_pages_estimate: z.number().int(),
    special_provisions_count: z.number().int(),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 계약 번호 생성
 */
function generateContractNumber(eventId: string, sponsorName: string): string {
  const year = new Date().getFullYear();
  const sponsorCode = sponsorName.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `SP-${year}-${sponsorCode}-${random}`;
}

/**
 * 전문 생성
 */
function generatePreamble(
  organizerName: string,
  sponsorName: string,
  eventName: string
): string {
  return `본 스폰서십 계약서(이하 "본 계약")는 다음 당사자 간에 체결됩니다:

[주최자]
상호: ${organizerName}
(이하 "주최자"라 함)

[스폰서]
상호: ${sponsorName}
(이하 "스폰서"라 함)

(주최자와 스폰서를 개별적으로 "당사자", 총칭하여 "양 당사자"라 함)

양 당사자는 ${eventName}(이하 "이벤트")와 관련하여 아래와 같이 합의합니다.`;
}

/**
 * 정의 조항 생성
 */
function generateDefinitions(
  eventName: string,
  eventDate: string,
  eventVenue: string,
  tier: string
): string {
  return `제1조 (정의)

본 계약에서 사용되는 용어의 정의는 다음과 같습니다:

1.1 "이벤트"란 ${eventDate}에 ${eventVenue}에서 개최되는 "${eventName}"을 의미합니다.

1.2 "스폰서십"이란 본 계약에 따라 스폰서가 이벤트에 제공하는 재정적, 물질적 지원을 의미합니다.

1.3 "스폰서십 등급"이란 스폰서의 ${tier} 등급 후원을 의미합니다.

1.4 "혜택"이란 주최자가 스폰서에게 제공하기로 한 노출, 서비스 및 기타 권리를 의미합니다.

1.5 "지식재산권"이란 상표, 로고, 저작물 등 양 당사자의 지적 자산을 의미합니다.

1.6 "기밀정보"란 본 계약의 조건 및 당사자 간 교환되는 비공개 정보를 의미합니다.`;
}

/**
 * 혜택 조항 생성
 */
function generateBenefitsArticle(
  benefits: z.infer<typeof SponsorBenefitSchema>[]
): string {
  const benefitsList = benefits
    .map(
      (b, i) =>
        `   ${i + 1}. ${b.name}${b.description ? ` - ${b.description}` : ""}` +
        (b.quantity > 1 ? ` (${b.quantity}개)` : "")
    )
    .join("\n");

  return `제3조 (스폰서 혜택)

3.1 주최자는 스폰서에게 다음의 혜택을 제공합니다:

${benefitsList}

3.2 혜택의 상세 내용은 별첨A에 명시되어 있습니다.

3.3 주최자는 이벤트의 원활한 운영을 위해 혜택 제공 방식을 합리적 범위 내에서 조정할 수 있으며,
    이 경우 스폰서와 사전 협의합니다.

3.4 혜택의 가치가 실질적으로 감소하는 변경이 발생할 경우, 스폰서는 상응하는 보상을 요청할 수 있습니다.`;
}

/**
 * 결제 조항 생성
 */
function generatePaymentArticle(
  amount: number,
  currency: string,
  paymentSchedule: z.infer<typeof InputSchema>["negotiation_outcome"]["payment_schedule"]
): string {
  const scheduleList = paymentSchedule
    .map(
      (p) =>
        `   - ${p.milestone}: ${p.percentage}% (${(
          amount *
          (p.percentage / 100)
        ).toLocaleString()} ${currency}) - ${p.due_date}까지`
    )
    .join("\n");

  return `제4조 (대금 지급)

4.1 스폰서십 대금
    총 스폰서십 대금은 ${amount.toLocaleString()} ${currency}입니다.

4.2 지급 일정
${scheduleList}

4.3 지급 방법
    스폰서는 주최자가 지정한 은행 계좌로 송금하여 대금을 지급합니다.
    [은행명: _______]
    [계좌번호: _______]
    [예금주: _______]

4.4 지연 이자
    지급 기일을 초과한 금액에 대해서는 연 [__]%의 지연이자가 부과됩니다.

4.5 세금
    본 계약에 명시된 금액에는 부가가치세가 포함되어 있지 않으며,
    관련 세금은 적용 법률에 따라 별도 처리됩니다.`;
}

/**
 * 해지 조항 생성
 */
function generateTerminationArticle(): string {
  return `제8조 (계약 해지)

8.1 중대한 위반에 의한 해지
    일방 당사자가 본 계약상의 의무를 중대하게 위반하고, 상대방의 서면 통지 후
    30일 이내에 해당 위반을 시정하지 않은 경우, 상대방은 본 계약을 해지할 수 있습니다.

8.2 스폰서에 의한 해지
    a) 이벤트 60일 전까지 해지: 지급액의 50% 환불
    b) 이벤트 30일 전까지 해지: 지급액의 25% 환불
    c) 이벤트 30일 이내 해지: 환불 없음

8.3 주최자에 의한 해지
    주최자가 계약을 해지하는 경우, 스폰서는 지급한 금액의 전액 환불을 받습니다.

8.4 이벤트 취소
    불가항력 외의 사유로 이벤트가 취소되는 경우, 스폰서는 지급액 전액 환불 또는
    차기 이벤트로의 이월을 선택할 수 있습니다.

8.5 존속 조항
    비밀유지, 책임제한, 지식재산권 조항은 계약 종료 후에도 유효합니다.`;
}

/**
 * 서명란 생성
 */
function generateSignatureBlock(
  organizerName: string,
  sponsorName: string,
  sponsorContact: z.infer<typeof InputSchema>["negotiation_outcome"]["sponsor_contact"]
): string {
  return `[서명란]

본 계약의 내용을 확인하고 동의하며, 아래에 서명합니다.

[주최자]
회사명: ${organizerName}
성명: ____________________
직위: ____________________
서명: ____________________
날짜: ____________________


[스폰서]
회사명: ${sponsorName}
성명: ${sponsorContact.name}
직위: ${sponsorContact.title}
서명: ____________________
날짜: ____________________`;
}

/**
 * FIN-013 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const {
    negotiation_outcome,
    event_details,
    contract_settings,
    currency,
  } = validatedInput;

  const contractNumber = generateContractNumber(
    validatedInput.event_id,
    negotiation_outcome.sponsor_name
  );

  // 계약서 섹션 생성
  const contractSections = {
    preamble: generatePreamble(
      event_details.organizer_name,
      negotiation_outcome.sponsor_name,
      event_details.event_name
    ),
    article_1_definitions: generateDefinitions(
      event_details.event_name,
      event_details.event_date,
      event_details.event_venue,
      negotiation_outcome.agreed_tier
    ),
    article_2_sponsorship_scope: `제2조 (스폰서십 범위)

2.1 스폰서는 ${negotiation_outcome.agreed_tier} 등급 스폰서로서 본 이벤트를 후원합니다.

2.2 스폰서십 유형: ${
      negotiation_outcome.support_type === "cash"
        ? "현금 후원"
        : negotiation_outcome.support_type === "in_kind"
        ? "현물 후원"
        : "현금 및 현물 혼합 후원"
    }

2.3 본 계약의 효력 기간: ${contract_settings.contract_start_date}부터 ${contract_settings.contract_end_date}까지

${
  contract_settings.include_exclusivity
    ? `2.4 독점권: 스폰서는 ${contract_settings.exclusivity_category || "해당 카테고리"} 분야에서 독점적 스폰서 지위를 갖습니다.`
    : ""
}`,
    article_3_benefits: generateBenefitsArticle(negotiation_outcome.agreed_benefits),
    article_4_payment: generatePaymentArticle(
      negotiation_outcome.agreed_amount,
      currency,
      negotiation_outcome.payment_schedule
    ),
    article_5_obligations: `제5조 (당사자 의무)

5.1 주최자의 의무
    a) 제3조에 명시된 혜택을 성실히 제공
    b) 스폰서의 브랜드 자산을 적절히 사용
    c) 이벤트 진행 상황에 대한 정기 업데이트 제공
    d) 이벤트 종료 후 결과 리포트 제공

5.2 스폰서의 의무
    a) 합의된 일정에 따른 대금 지급
    b) 혜택 활용에 필요한 자료 적시 제공 (로고 파일 등)
    c) 주최자의 사전 승인 없이 이벤트 관련 별도 활동 금지
    d) 이벤트 브랜드 가이드라인 준수`,
    article_6_ip_rights: `제6조 (지식재산권)

6.1 양 당사자는 각자의 상표, 로고, 기타 지식재산권에 대한 소유권을 유지합니다.

6.2 각 당사자는 본 계약의 목적을 위해 상대방의 지식재산을 사용할 수 있는
    비독점적, 양도 불가능한 라이선스를 부여합니다.

6.3 라이선스의 범위는 본 계약에 명시된 활동으로 제한되며,
    계약 종료 시 자동으로 소멸합니다.

6.4 상대방의 지식재산 사용 시 사전 승인을 받아야 하며,
    해당 자산의 가치나 명성을 훼손하는 방식으로 사용할 수 없습니다.`,
    article_7_confidentiality: `제7조 (비밀유지)

7.1 양 당사자는 본 계약 체결 및 이행 과정에서 취득한 상대방의 기밀정보를
    비밀로 유지하고, 본 계약의 목적 외에 사용하거나 제3자에게 공개하지 않습니다.

7.2 기밀유지 의무는 다음의 경우에는 적용되지 않습니다:
    a) 공개 시점에 이미 공지된 정보
    b) 수령 당사자의 귀책 사유 없이 공지된 정보
    c) 법률에 의해 공개가 요구되는 정보

7.3 본 조의 비밀유지 의무는 계약 종료 후 3년간 유효합니다.`,
    article_8_termination: generateTerminationArticle(),
    article_9_liability: `제9조 (책임 제한)

9.1 어떠한 경우에도 일방 당사자의 상대방에 대한 책임은
    본 계약에 따라 스폰서가 지급한 금액을 초과하지 않습니다.

9.2 양 당사자는 상대방에게 간접적, 부수적, 특별, 결과적 또는
    징벌적 손해에 대해 책임을 지지 않습니다.

9.3 본 조의 책임 제한은 고의 또는 중대한 과실로 인한 손해에는 적용되지 않습니다.`,
    article_10_force_majeure: `제10조 (불가항력)

10.1 천재지변, 전쟁, 테러, 전염병, 정부 조치 등 양 당사자의 합리적 통제를 벗어난
     사유로 인해 본 계약의 이행이 불가능하거나 지연되는 경우,
     해당 당사자는 책임을 면제받습니다.

10.2 불가항력 사유가 발생한 당사자는 즉시 상대방에게 통지하고,
     영향을 최소화하기 위해 합리적인 노력을 기울여야 합니다.

10.3 불가항력으로 인해 이벤트가 취소되는 경우, 양 당사자는 성실히 협의하여
     대안을 모색하거나 공정한 정산을 진행합니다.`,
    article_11_general: `제11조 (일반 조항)

11.1 준거법
     본 계약은 ${contract_settings.governing_law} 법률에 따라 해석됩니다.

11.2 분쟁 해결
     본 계약과 관련한 분쟁은 ${
       contract_settings.dispute_resolution === "arbitration"
         ? "대한상사중재원의 중재"
         : contract_settings.dispute_resolution === "mediation"
         ? "조정"
         : "관할 법원의 소송"
     }에 의해 해결합니다.

11.3 완전 합의
     본 계약은 양 당사자 간의 완전한 합의를 구성하며,
     이전의 모든 구두 또는 서면 합의를 대체합니다.

11.4 수정
     본 계약의 수정은 양 당사자의 서면 합의에 의해서만 유효합니다.

11.5 양도
     일방 당사자는 상대방의 사전 서면 동의 없이 본 계약상의 권리나 의무를
     양도할 수 없습니다.

11.6 통지
     본 계약에 따른 모든 통지는 서면으로 하며, 등기우편, 이메일 또는
     직접 전달의 방법으로 합니다.`,
    signature_block: generateSignatureBlock(
      event_details.organizer_name,
      negotiation_outcome.sponsor_name,
      negotiation_outcome.sponsor_contact
    ),
    exhibit_a_benefits: `[별첨 A: 스폰서 혜택 상세]

${negotiation_outcome.agreed_benefits
  .map(
    (b, i) => `${i + 1}. ${b.name}
   - 설명: ${b.description || "해당 없음"}
   - 수량: ${b.quantity}개
   - 가치: ${b.value.toLocaleString()} ${currency}
   - 독점 여부: ${b.is_exclusive ? "예" : "아니오"}`
  )
  .join("\n\n")}`,
    exhibit_b_payment: `[별첨 B: 결제 일정]

총 계약 금액: ${negotiation_outcome.agreed_amount.toLocaleString()} ${currency}

결제 일정:
${negotiation_outcome.payment_schedule
  .map(
    (p, i) =>
      `${i + 1}. ${p.milestone}
   - 비율: ${p.percentage}%
   - 금액: ${(negotiation_outcome.agreed_amount * (p.percentage / 100)).toLocaleString()} ${currency}
   - 기한: ${p.due_date}`
  )
  .join("\n\n")}`,
  };

  // 법무 검토 필요 사항
  const legalReviewNotes: z.infer<typeof OutputSchema>["legal_review_notes"] = [
    {
      section: "제8조 해지",
      note: "해지 시 환불 비율이 업계 표준과 일치하는지 확인 필요",
      priority: "medium",
    },
    {
      section: "제9조 책임 제한",
      note: "책임 제한 조항의 법적 유효성 검토 필요",
      priority: "high",
    },
  ];

  if (contract_settings.include_exclusivity) {
    legalReviewNotes.push({
      section: "제2조 독점권",
      note: "독점권 범위 및 위반 시 구제수단 명확화 필요",
      priority: "high",
    });
  }

  if (negotiation_outcome.special_terms && negotiation_outcome.special_terms.length > 0) {
    legalReviewNotes.push({
      section: "특별 조건",
      note: `${negotiation_outcome.special_terms.length}개 특별 조건의 법적 검토 필요`,
      priority: "high",
    });
  }

  const output: Output = {
    contract_draft_id: generateUUID(),
    event_id: validatedInput.event_id,
    contract_metadata: {
      contract_number: contractNumber,
      version: "1.0",
      created_at: nowISO(),
      sponsor_name: negotiation_outcome.sponsor_name,
      event_name: event_details.event_name,
      total_value: negotiation_outcome.agreed_amount,
      currency,
    },
    contract_sections: contractSections,
    legal_review_notes: legalReviewNotes,
    summary: {
      key_terms: [
        `${negotiation_outcome.agreed_tier} 등급 스폰서십`,
        `총 ${negotiation_outcome.agreed_amount.toLocaleString()} ${currency}`,
        `${negotiation_outcome.agreed_benefits.length}개 혜택 포함`,
        `${negotiation_outcome.payment_schedule.length}회 분할 결제`,
      ],
      total_pages_estimate: 12,
      special_provisions_count: negotiation_outcome.special_terms?.length || 0,
    },
    generated_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-013",
  taskName: "스폰서 계약서 초안 작성",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 7.1.i",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
