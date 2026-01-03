/**
 * PRO-015: 규제 준수 관리
 * CMP-IS Reference: 20.5.a - Regulatory compliance management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Regulatory Compliance Manager for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_type: z.enum(["conference", "exhibition", "festival", "corporate", "hybrid"]).optional(),
  venue_location: z.object({
    country: z.string(),
    city: z.string(),
    venue_type: z.string(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  regulatory_report_id: z.string(),
  event_id: z.string(),
  compliance_overview: z.object({
    total_requirements: z.number(),
    compliant: z.number(),
    in_progress: z.number(),
    non_compliant: z.number(),
    compliance_rate: z.number(),
  }),
  regulatory_categories: z.array(z.object({
    category: z.string(),
    regulations: z.array(z.object({
      regulation_name: z.string(),
      authority: z.string(),
      requirement: z.string(),
      compliance_status: z.enum(["compliant", "in_progress", "non_compliant", "not_applicable"]),
      deadline: z.string(),
      documentation: z.array(z.string()),
      notes: z.string(),
    })),
    category_compliance: z.number(),
  })),
  permits_licenses: z.array(z.object({
    permit_type: z.string(),
    issuing_authority: z.string(),
    status: z.enum(["approved", "pending", "submitted", "not_applied"]),
    application_date: z.string(),
    approval_date: z.string(),
    expiry_date: z.string(),
    conditions: z.array(z.string()),
  })),
  inspections: z.array(z.object({
    inspection_type: z.string(),
    scheduled_date: z.string(),
    inspector: z.string(),
    status: z.enum(["scheduled", "passed", "failed", "conditional"]),
    findings: z.array(z.string()),
    corrective_actions: z.array(z.string()),
  })),
  upcoming_deadlines: z.array(z.object({
    requirement: z.string(),
    deadline: z.string(),
    days_remaining: z.number(),
    responsible_party: z.string(),
    status: z.enum(["on_track", "at_risk", "overdue"]),
  })),
  action_items: z.array(z.object({
    action: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    deadline: z.string(),
    responsible_party: z.string(),
  })),
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
    regulatory_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    compliance_overview: {
      total_requirements: 24,
      compliant: 18,
      in_progress: 4,
      non_compliant: 2,
      compliance_rate: 75,
    },
    regulatory_categories: [
      {
        category: "안전 및 소방",
        regulations: [
          {
            regulation_name: "화재예방법",
            authority: "관할 소방서",
            requirement: "대규모 행사 사전 신고 및 안전 계획 제출",
            compliance_status: "in_progress",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            documentation: ["안전 관리 계획서", "비상 대피 계획"],
            notes: "서류 준비 완료, 제출 예정",
          },
          {
            regulation_name: "다중이용시설 안전관리법",
            authority: "행정안전부",
            requirement: "안전 관리자 배치 및 교육 이수",
            compliance_status: "compliant",
            deadline: "-",
            documentation: ["안전 관리자 자격증", "교육 이수증"],
            notes: "완료",
          },
        ],
        category_compliance: 85,
      },
      {
        category: "식품 위생",
        regulations: [
          {
            regulation_name: "식품위생법",
            authority: "식품의약품안전처",
            requirement: "케이터링 업체 위생 점검",
            compliance_status: "compliant",
            deadline: "-",
            documentation: ["영업 허가증", "위생 점검 확인서"],
            notes: "완료",
          },
          {
            regulation_name: "집단급식소 신고",
            authority: "관할 보건소",
            requirement: "500인 이상 급식 시 신고",
            compliance_status: "in_progress",
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            documentation: ["급식 신고서"],
            notes: "신고서 작성 중",
          },
        ],
        category_compliance: 75,
      },
      {
        category: "환경",
        regulations: [
          {
            regulation_name: "소음진동관리법",
            authority: "환경부",
            requirement: "야간 소음 기준 준수",
            compliance_status: "compliant",
            deadline: "-",
            documentation: ["행사 운영 계획서 (소음 관리)"],
            notes: "22시 이후 음량 제한 계획",
          },
          {
            regulation_name: "폐기물관리법",
            authority: "환경부",
            requirement: "대규모 폐기물 처리 계획",
            compliance_status: "non_compliant",
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            documentation: [],
            notes: "폐기물 처리 업체 계약 필요",
          },
        ],
        category_compliance: 50,
      },
    ],
    permits_licenses: [
      {
        permit_type: "행사 개최 허가",
        issuing_authority: "관할 구청",
        status: "approved",
        application_date: "2025-01-05",
        approval_date: "2025-01-12",
        expiry_date: "2025-02-28",
        conditions: ["야간 소음 제한", "교통 통제 협조"],
      },
      {
        permit_type: "임시 영업 허가 (식음료)",
        issuing_authority: "보건소",
        status: "pending",
        application_date: "2025-01-10",
        approval_date: "-",
        expiry_date: "-",
        conditions: [],
      },
      {
        permit_type: "옥외 광고물 허가",
        issuing_authority: "구청 광고물 담당",
        status: "approved",
        application_date: "2025-01-03",
        approval_date: "2025-01-08",
        expiry_date: "2025-02-28",
        conditions: ["규격 준수", "행사 종료 후 철거"],
      },
    ],
    inspections: [
      {
        inspection_type: "소방 안전 점검",
        scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        inspector: "강남소방서",
        status: "scheduled",
        findings: [],
        corrective_actions: [],
      },
      {
        inspection_type: "식품 위생 점검",
        scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        inspector: "강남구 보건소",
        status: "scheduled",
        findings: [],
        corrective_actions: [],
      },
    ],
    upcoming_deadlines: [
      {
        requirement: "소방서 사전 신고",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        days_remaining: 7,
        responsible_party: "안전팀",
        status: "on_track",
      },
      {
        requirement: "폐기물 처리 계약",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        days_remaining: 10,
        responsible_party: "운영팀",
        status: "at_risk",
      },
      {
        requirement: "집단급식 신고",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        days_remaining: 14,
        responsible_party: "F&B팀",
        status: "on_track",
      },
    ],
    action_items: [
      { action: "폐기물 처리 업체 계약 체결", priority: "critical", deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), responsible_party: "운영팀" },
      { action: "소방서 안전 계획서 제출", priority: "high", deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), responsible_party: "안전팀" },
      { action: "임시 영업 허가 승인 확인", priority: "high", deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), responsible_party: "F&B팀" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-015",
  taskName: "규제 준수 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.5.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.5: Regulatory Compliance",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
