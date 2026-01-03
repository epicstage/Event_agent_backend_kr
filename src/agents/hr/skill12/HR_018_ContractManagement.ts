/**
 * HR-018: Contract Management
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 근로계약 및 용역계약 관리
 */

import { z } from "zod";

export const HR_018_InputSchema = z.object({
  event_id: z.string().uuid(),
  staff_list: z.array(z.object({
    name: z.string(),
    employment_type: z.enum(["full_time", "part_time", "contractor", "volunteer"]),
    role: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    hourly_rate: z.number().optional(),
  })),
  employer_info: z.object({
    company_name: z.string(),
    representative: z.string(),
    address: z.string(),
  }),
});

export const HR_018_OutputSchema = z.object({
  event_id: z.string(),
  contract_summary: z.object({
    total_contracts: z.number(),
    by_type: z.array(z.object({
      type: z.string(),
      count: z.number(),
      template: z.string(),
    })),
    status: z.object({
      pending: z.number(),
      signed: z.number(),
      completed: z.number(),
    }),
  }),
  contract_templates: z.array(z.object({
    type: z.string(),
    key_clauses: z.array(z.object({
      clause: z.string(),
      description: z.string(),
      mandatory: z.boolean(),
    })),
    required_attachments: z.array(z.string()),
  })),
  compliance_checklist: z.array(z.object({
    item: z.string(),
    requirement: z.string(),
    applicable_to: z.array(z.string()),
  })),
  signing_process: z.array(z.object({
    step: z.number(),
    action: z.string(),
    method: z.string(),
    responsible: z.string(),
  })),
  document_management: z.object({
    storage_location: z.string(),
    retention_period: z.string(),
    access_control: z.array(z.string()),
  }),
});

export type HR_018_Input = z.infer<typeof HR_018_InputSchema>;
export type HR_018_Output = z.infer<typeof HR_018_OutputSchema>;

export async function execute(input: HR_018_Input): Promise<HR_018_Output> {
  const byType = [
    { type: "full_time", label: "정규직 근로계약", count: 0, template: "standard_employment" },
    { type: "part_time", label: "단시간 근로계약", count: 0, template: "part_time_employment" },
    { type: "contractor", label: "프리랜서 용역계약", count: 0, template: "contractor_agreement" },
    { type: "volunteer", label: "봉사활동 서약서", count: 0, template: "volunteer_agreement" },
  ];

  for (const staff of input.staff_list) {
    const typeEntry = byType.find((t) => t.type === staff.employment_type);
    if (typeEntry) typeEntry.count++;
  }

  return {
    event_id: input.event_id,
    contract_summary: {
      total_contracts: input.staff_list.length,
      by_type: byType.filter((t) => t.count > 0).map((t) => ({
        type: t.label,
        count: t.count,
        template: t.template,
      })),
      status: {
        pending: Math.round(input.staff_list.length * 0.3),
        signed: Math.round(input.staff_list.length * 0.5),
        completed: Math.round(input.staff_list.length * 0.2),
      },
    },
    contract_templates: [
      {
        type: "단시간 근로계약서",
        key_clauses: [
          { clause: "계약 기간", description: "근무 시작일 및 종료일 명시", mandatory: true },
          { clause: "근무 장소", description: "행사장 주소 및 배치 구역", mandatory: true },
          { clause: "근무 시간", description: "일일 근무시간 및 휴게시간", mandatory: true },
          { clause: "임금", description: "시급, 지급일, 지급 방법", mandatory: true },
          { clause: "주휴수당", description: "주 15시간 이상 시 적용", mandatory: true },
          { clause: "4대보험", description: "가입 여부 및 부담 비율", mandatory: true },
          { clause: "해지 조건", description: "계약 해지 사유 및 절차", mandatory: false },
        ],
        required_attachments: ["신분증 사본", "통장 사본", "주민등록등본(필요 시)"],
      },
      {
        type: "프리랜서 용역계약서",
        key_clauses: [
          { clause: "용역 내용", description: "수행할 업무 범위 구체적 명시", mandatory: true },
          { clause: "용역 기간", description: "계약 시작일 및 종료일", mandatory: true },
          { clause: "용역 대가", description: "총액 또는 일당, 지급 조건", mandatory: true },
          { clause: "독립 수행", description: "지휘감독 없이 독립적 업무 수행", mandatory: true },
          { clause: "비밀유지", description: "행사 관련 정보 비밀 유지 의무", mandatory: true },
          { clause: "세금 처리", description: "3.3% 원천징수 또는 사업소득", mandatory: true },
        ],
        required_attachments: ["신분증 사본", "통장 사본", "사업자등록증(해당 시)"],
      },
      {
        type: "봉사활동 서약서",
        key_clauses: [
          { clause: "활동 내용", description: "봉사 업무 및 역할", mandatory: true },
          { clause: "활동 기간", description: "봉사 날짜 및 시간", mandatory: true },
          { clause: "준수 사항", description: "행동 규범 및 안전 수칙", mandatory: true },
          { clause: "보험", description: "봉사자 상해보험 가입 고지", mandatory: true },
          { clause: "지원 사항", description: "식사, 교통비 등 실비 지원", mandatory: false },
        ],
        required_attachments: ["신분증 사본", "보호자 동의서(미성년자)"],
      },
    ],
    compliance_checklist: [
      { item: "계약서 서면 작성", requirement: "근로계약은 반드시 서면 작성", applicable_to: ["정규직", "단시간"] },
      { item: "계약서 교부", requirement: "체결 즉시 근로자에게 1부 교부", applicable_to: ["정규직", "단시간"] },
      { item: "필수 기재 사항", requirement: "근로기준법 제17조 명시 항목 포함", applicable_to: ["정규직", "단시간"] },
      { item: "최저임금 준수", requirement: "시급 9,860원 이상", applicable_to: ["정규직", "단시간"] },
      { item: "4대보험 가입", requirement: "1개월/60시간 이상 근로 시", applicable_to: ["정규직", "단시간"] },
      { item: "용역 독립성", requirement: "근로자성 인정 방지 조항", applicable_to: ["프리랜서"] },
    ],
    signing_process: [
      { step: 1, action: "계약서 작성 및 검토", method: "HR 시스템 또는 수기", responsible: "HR 담당자" },
      { step: 2, action: "계약서 발송", method: "이메일 (전자서명) 또는 대면", responsible: "HR 담당자" },
      { step: 3, action: "스태프 서명", method: "전자서명 또는 자필", responsible: "스태프" },
      { step: 4, action: "고용주 서명", method: "전자서명 또는 직인", responsible: "인사 책임자" },
      { step: 5, action: "계약서 교부", method: "PDF 발송 또는 사본 교부", responsible: "HR 담당자" },
      { step: 6, action: "원본 보관", method: "디지털 아카이브 + 물리 보관", responsible: "HR 담당자" },
    ],
    document_management: {
      storage_location: "HR 시스템 + 보안 파일 서버",
      retention_period: "근로관계 종료 후 3년",
      access_control: ["HR 매니저", "법무팀", "회계팀(급여 관련)"],
    },
  };
}

export const HR_018_ContractManagement = {
  id: "HR-018",
  name: "Contract Management",
  description: "근로계약 및 용역계약 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.3",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_018_InputSchema,
  outputSchema: HR_018_OutputSchema,
  persona: `당신은 인사 계약 전문가입니다. 노무 컴플라이언스를 준수하는 적법한 계약을 체결하고 관리합니다.`,
};

export default HR_018_ContractManagement;
