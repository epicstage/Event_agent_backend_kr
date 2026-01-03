/**
 * PRO-012: 계약 준수 관리
 * CMP-IS Reference: 20.2.a - Contract compliance management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Contract Compliance Manager for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  contract_ids: z.array(z.string()).optional(),
  compliance_check_type: z.enum(["full_audit", "milestone_check", "deliverable_review"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  compliance_report_id: z.string(),
  event_id: z.string(),
  summary: z.object({
    total_contracts: z.number(),
    fully_compliant: z.number(),
    partially_compliant: z.number(),
    non_compliant: z.number(),
    overall_compliance_rate: z.number(),
  }),
  contract_compliance: z.array(z.object({
    contract_id: z.string(),
    contract_type: z.string(),
    counterparty: z.string(),
    compliance_status: z.enum(["compliant", "partial", "non_compliant", "pending_review"]),
    compliance_score: z.number(),
    obligations: z.array(z.object({
      obligation: z.string(),
      due_date: z.string(),
      status: z.enum(["met", "in_progress", "overdue", "at_risk"]),
      evidence: z.string(),
    })),
    issues: z.array(z.object({
      issue: z.string(),
      severity: z.enum(["critical", "major", "minor"]),
      resolution_status: z.enum(["open", "in_progress", "resolved"]),
      action_required: z.string(),
    })),
  })),
  upcoming_obligations: z.array(z.object({
    contract_id: z.string(),
    counterparty: z.string(),
    obligation: z.string(),
    due_date: z.string(),
    days_remaining: z.number(),
    assigned_to: z.string(),
  })),
  financial_obligations: z.object({
    total_payable: z.number(),
    paid: z.number(),
    outstanding: z.number(),
    overdue: z.number(),
    upcoming_30_days: z.number(),
  }),
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

  return {
    compliance_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    summary: {
      total_contracts: 15,
      fully_compliant: 10,
      partially_compliant: 4,
      non_compliant: 1,
      overall_compliance_rate: 87,
    },
    contract_compliance: [
      {
        contract_id: "CTR-001",
        contract_type: "베뉴",
        counterparty: "그랜드 컨벤션 센터",
        compliance_status: "compliant",
        compliance_score: 95,
        obligations: [
          { obligation: "계약금 지급", due_date: "2025-01-15", status: "met", evidence: "송금 확인서" },
          { obligation: "최종 참석자 수 통보", due_date: "2025-02-01", status: "in_progress", evidence: "-" },
          { obligation: "케이터링 메뉴 확정", due_date: "2025-01-25", status: "met", evidence: "메뉴 승인서" },
        ],
        issues: [],
      },
      {
        contract_id: "CTR-002",
        contract_type: "AV 장비",
        counterparty: "프로 미디어",
        compliance_status: "partial",
        compliance_score: 72,
        obligations: [
          { obligation: "장비 목록 제출", due_date: "2025-01-10", status: "met", evidence: "장비 명세서" },
          { obligation: "기술 리허설", due_date: "2025-02-10", status: "at_risk", evidence: "-" },
        ],
        issues: [
          {
            issue: "LED 스크린 사양 변경 요청 미반영",
            severity: "major",
            resolution_status: "in_progress",
            action_required: "수정 계약서 검토 및 서명",
          },
        ],
      },
      {
        contract_id: "CTR-003",
        contract_type: "스폰서십",
        counterparty: "테크 이노베이션",
        compliance_status: "non_compliant",
        compliance_score: 45,
        obligations: [
          { obligation: "로고 자료 제출", due_date: "2025-01-05", status: "overdue", evidence: "-" },
          { obligation: "스폰서 소개 원고", due_date: "2025-01-20", status: "overdue", evidence: "-" },
        ],
        issues: [
          {
            issue: "스폰서 측 담당자 변경으로 커뮤니케이션 지연",
            severity: "critical",
            resolution_status: "open",
            action_required: "신규 담당자 긴급 미팅 요청",
          },
        ],
      },
    ],
    upcoming_obligations: [
      {
        contract_id: "CTR-001",
        counterparty: "그랜드 컨벤션 센터",
        obligation: "최종 참석자 수 통보",
        due_date: "2025-02-01",
        days_remaining: 14,
        assigned_to: "등록팀",
      },
      {
        contract_id: "CTR-004",
        counterparty: "케이터링 플러스",
        obligation: "알레르기 정보 제출",
        due_date: "2025-01-28",
        days_remaining: 10,
        assigned_to: "F&B팀",
      },
      {
        contract_id: "CTR-005",
        counterparty: "프린트웍스",
        obligation: "인쇄물 디자인 최종 승인",
        due_date: "2025-01-22",
        days_remaining: 4,
        assigned_to: "마케팅팀",
      },
    ],
    financial_obligations: {
      total_payable: 850000000,
      paid: 340000000,
      outstanding: 510000000,
      overdue: 25000000,
      upcoming_30_days: 285000000,
    },
    recommendations: [
      "테크 이노베이션 스폰서 긴급 연락 및 기한 재협의",
      "프로 미디어 기술 리허설 일정 조기 확정",
      "미지급 25M 원 조속 처리 (지연 이자 발생 위험)",
      "다음 주 의무 이행 사항 담당자 리마인더 발송",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-012",
  taskName: "계약 준수 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.2.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.2: Contract Compliance",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
