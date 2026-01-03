/**
 * FIN-062: 세금 준수 설정
 *
 * CMP-IS Reference: 9.1.e
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Tax Compliance Setup.
CMP-IS Standard: 9.1.e - Setting up tax compliance procedures (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_location: z.object({
    country: z.string(),
    state_province: z.string().optional(),
    city: z.string(),
  }),
  organization_type: z.enum(["for_profit", "non_profit", "government", "hybrid"]),
  revenue_types: z.array(z.object({
    type: z.string(),
    estimated_amount: z.number(),
    taxable: z.boolean(),
  })),
  expense_types: z.array(z.object({
    type: z.string(),
    estimated_amount: z.number(),
    deductible: z.boolean(),
  })),
  international_aspects: z.object({
    foreign_vendors: z.boolean(),
    foreign_attendees: z.boolean(),
    cross_border_payments: z.boolean(),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  compliance_id: z.string().uuid(),
  event_id: z.string().uuid(),
  tax_registration_requirements: z.array(z.object({
    tax_type: z.string(),
    registration_required: z.boolean(),
    registration_deadline: z.string(),
    authority: z.string(),
    status: z.enum(["required", "complete", "not_applicable"]),
  })),
  tax_collection_requirements: z.object({
    sales_tax: z.object({
      applicable: z.boolean(),
      rate: z.number(),
      exemptions: z.array(z.string()),
      collection_method: z.string(),
    }),
    vat: z.object({
      applicable: z.boolean(),
      rate: z.number(),
      registration_threshold: z.number(),
    }).optional(),
    withholding_tax: z.object({
      applicable: z.boolean(),
      scenarios: z.array(z.object({
        payment_type: z.string(),
        withholding_rate: z.number(),
        reporting_requirement: z.string(),
      })),
    }),
  }),
  reporting_calendar: z.array(z.object({
    report_type: z.string(),
    frequency: z.string(),
    due_date: z.string(),
    filing_method: z.string(),
    responsible_party: z.string(),
  })),
  documentation_requirements: z.array(z.object({
    document_type: z.string(),
    purpose: z.string(),
    collection_timing: z.string(),
    retention_period: z.string(),
  })),
  vendor_tax_compliance: z.object({
    required_forms: z.array(z.object({
      form_name: z.string(),
      required_from: z.string(),
      due_before: z.string(),
    })),
    verification_process: z.array(z.string()),
  }),
  international_considerations: z.object({
    treaty_benefits: z.array(z.string()),
    transfer_pricing: z.string(),
    currency_considerations: z.array(z.string()),
  }).optional(),
  risk_areas: z.array(z.object({
    area: z.string(),
    risk_level: z.enum(["low", "medium", "high"]),
    mitigation: z.string(),
  })),
  action_items: z.array(z.object({
    action: z.string(),
    responsible: z.string(),
    deadline: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const isKorea = validated.event_location.country.toLowerCase().includes("korea") ||
    validated.event_location.country.toLowerCase().includes("한국");

  const totalRevenue = validated.revenue_types.reduce((sum, r) => sum + r.estimated_amount, 0);
  const taxableRevenue = validated.revenue_types.filter(r => r.taxable).reduce((sum, r) => sum + r.estimated_amount, 0);

  const output: Output = {
    compliance_id: generateUUID(),
    event_id: validated.event_id,
    tax_registration_requirements: [
      {
        tax_type: "사업자등록",
        registration_required: true,
        registration_deadline: "이벤트 60일 전",
        authority: "국세청",
        status: "required",
      },
      {
        tax_type: "부가가치세",
        registration_required: validated.organization_type !== "non_profit",
        registration_deadline: "사업 개시 20일 이내",
        authority: "국세청",
        status: validated.organization_type === "non_profit" ? "not_applicable" : "required",
      },
      {
        tax_type: "원천세",
        registration_required: true,
        registration_deadline: "급여 지급 전",
        authority: "국세청",
        status: "required",
      },
    ],
    tax_collection_requirements: {
      sales_tax: {
        applicable: validated.organization_type !== "non_profit",
        rate: isKorea ? 10 : 0,
        exemptions: [
          "교육 목적 행사 (일부)",
          "비영리 단체 주최 행사",
          "정부 주관 행사",
        ],
        collection_method: "등록비에 포함하여 징수, 세금계산서 발행",
      },
      vat: isKorea ? {
        applicable: true,
        rate: 10,
        registration_threshold: 0,
      } : undefined,
      withholding_tax: {
        applicable: true,
        scenarios: [
          {
            payment_type: "프리랜서/외부 강연자 사례비",
            withholding_rate: isKorea ? 3.3 : 0,
            reporting_requirement: "지급일이 속한 달의 다음 달 10일까지 신고",
          },
          {
            payment_type: "외국인 지급",
            withholding_rate: isKorea ? 22 : 0,
            reporting_requirement: "지급일이 속한 달의 다음 달 10일까지 신고",
          },
          {
            payment_type: "기타소득",
            withholding_rate: isKorea ? 4.4 : 0,
            reporting_requirement: "지급일이 속한 달의 다음 달 10일까지 신고",
          },
        ],
      },
    },
    reporting_calendar: [
      {
        report_type: "부가가치세 신고",
        frequency: "분기",
        due_date: "분기 종료 후 25일",
        filing_method: "홈택스 전자신고",
        responsible_party: "재무팀/세무대리인",
      },
      {
        report_type: "원천세 신고",
        frequency: "월",
        due_date: "다음 달 10일",
        filing_method: "홈택스 전자신고",
        responsible_party: "재무팀",
      },
      {
        report_type: "법인세 신고",
        frequency: "연",
        due_date: "사업연도 종료 후 3개월",
        filing_method: "홈택스 전자신고",
        responsible_party: "세무대리인",
      },
      {
        report_type: "지급명세서 제출",
        frequency: "반기/연",
        due_date: "반기 종료 후 1개월",
        filing_method: "홈택스 전자제출",
        responsible_party: "재무팀",
      },
    ],
    documentation_requirements: [
      {
        document_type: "세금계산서",
        purpose: "부가세 매입/매출 증빙",
        collection_timing: "거래 시점 또는 익월 10일까지",
        retention_period: "5년",
      },
      {
        document_type: "원천징수영수증",
        purpose: "원천세 납부 증빙",
        collection_timing: "지급 시",
        retention_period: "5년",
      },
      {
        document_type: "통장 사본 및 거래내역",
        purpose: "금융거래 증빙",
        collection_timing: "월말",
        retention_period: "5년",
      },
      {
        document_type: "사업자등록증 사본",
        purpose: "공급자 확인",
        collection_timing: "거래 시작 전",
        retention_period: "5년",
      },
      {
        document_type: "외국인 신원확인 서류",
        purpose: "원천세 적용률 확인",
        collection_timing: "계약/지급 전",
        retention_period: "5년",
      },
    ],
    vendor_tax_compliance: {
      required_forms: [
        {
          form_name: "사업자등록증 사본",
          required_from: "모든 법인/개인사업자 공급자",
          due_before: "첫 거래 전",
        },
        {
          form_name: "통장 사본",
          required_from: "대금 수령 업체",
          due_before: "첫 결제 전",
        },
        {
          form_name: "신분증 사본 (개인)",
          required_from: "프리랜서/개인",
          due_before: "첫 결제 전",
        },
        {
          form_name: "외국인등록증/여권",
          required_from: "외국인 용역 제공자",
          due_before: "첫 결제 전",
        },
      ],
      verification_process: [
        "사업자등록번호 진위 확인 (홈택스)",
        "휴/폐업 여부 확인",
        "세금계산서 발행 가능 여부 확인",
        "계좌 명의 일치 확인",
      ],
    },
    international_considerations: validated.international_aspects.cross_border_payments ? {
      treaty_benefits: [
        "조세조약에 따른 원천징수세율 감면 가능",
        "이중과세 방지 혜택",
        "거주자 증명서 필요",
      ],
      transfer_pricing: "관계사 거래 시 정상가격 원칙 적용 필요",
      currency_considerations: [
        "외화 거래 시 환율 적용 기준일 확인",
        "환차손익 세무 처리",
        "해외 송금 시 대외지급수단 신고 (건당 $5,000 초과)",
      ],
    } : undefined,
    risk_areas: [
      {
        area: "부가세 신고 누락",
        risk_level: "high",
        mitigation: "월별 세금계산서 수취 현황 점검, 자동 알림 설정",
      },
      {
        area: "원천세 미신고",
        risk_level: "high",
        mitigation: "지급 전 원천세 대상 여부 확인 체크리스트",
      },
      {
        area: "영수증 미수취",
        risk_level: "medium",
        mitigation: "지출 시 즉시 증빙 수취 의무화",
      },
      {
        area: "외국인 과세 오류",
        risk_level: validated.international_aspects.foreign_vendors ? "high" : "low",
        mitigation: "조세조약 확인, 전문가 상담",
      },
      {
        area: "면세/과세 구분 오류",
        risk_level: "medium",
        mitigation: "수익 유형별 과세 여부 사전 확인",
      },
    ],
    action_items: [
      {
        action: "사업자등록 확인 및 세금계산서 발행 준비",
        responsible: "재무팀",
        deadline: "D-60",
        priority: "high",
      },
      {
        action: "세무대리인 선정 및 계약",
        responsible: "재무팀",
        deadline: "D-45",
        priority: "high",
      },
      {
        action: "공급자 세금 서류 수집 체계 구축",
        responsible: "재무팀",
        deadline: "D-30",
        priority: "medium",
      },
      {
        action: "원천세 신고 일정 캘린더 설정",
        responsible: "재무팀",
        deadline: "D-30",
        priority: "medium",
      },
      {
        action: "외국인 지급 관련 조세조약 검토",
        responsible: "세무대리인",
        deadline: "D-21",
        priority: validated.international_aspects.foreign_vendors ? "high" : "low",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-062",
  taskName: "세금 준수 설정",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 9.1.e",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.1: Establish Monetary Transaction Procedures",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
