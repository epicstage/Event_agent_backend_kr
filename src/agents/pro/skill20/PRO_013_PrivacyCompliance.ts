/**
 * PRO-013: 개인정보 보호 준수
 * CMP-IS Reference: 20.3.a - Privacy and data protection compliance
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Privacy and Data Protection Compliance Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  compliance_target: z.array(z.enum(["GDPR", "PIPA", "CCPA", "LGPD", "APPI"])).optional(),
  data_processing_scope: z.array(z.enum(["registration", "payment", "marketing", "analytics", "third_party"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  privacy_report_id: z.string(),
  event_id: z.string(),
  compliance_summary: z.object({
    overall_compliance_level: z.enum(["compliant", "mostly_compliant", "partial", "non_compliant"]),
    compliance_score: z.number(),
    regulations_in_scope: z.array(z.string()),
    last_audit_date: z.string(),
  }),
  data_inventory: z.object({
    total_data_categories: z.number(),
    personal_data_types: z.array(z.object({
      data_type: z.string(),
      sensitivity: z.enum(["standard", "sensitive", "special_category"]),
      collection_purpose: z.string(),
      retention_period: z.string(),
      legal_basis: z.string(),
    })),
    data_subjects: z.array(z.object({
      category: z.string(),
      estimated_count: z.number(),
      consent_obtained: z.boolean(),
    })),
  }),
  regulation_compliance: z.array(z.object({
    regulation: z.string(),
    requirements: z.array(z.object({
      requirement: z.string(),
      status: z.enum(["compliant", "partial", "non_compliant", "not_applicable"]),
      evidence: z.string(),
      gap: z.string(),
    })),
    overall_status: z.enum(["compliant", "partial", "non_compliant"]),
  })),
  consent_management: z.object({
    consent_mechanism: z.string(),
    opt_in_rate: z.number(),
    withdrawal_requests: z.number(),
    pending_requests: z.number(),
  }),
  data_subject_rights: z.object({
    access_requests: z.number(),
    deletion_requests: z.number(),
    rectification_requests: z.number(),
    avg_response_time_days: z.number(),
    compliance_rate: z.number(),
  }),
  third_party_processors: z.array(z.object({
    processor_name: z.string(),
    processing_purpose: z.string(),
    dpa_status: z.enum(["signed", "pending", "not_required"]),
    security_assessment: z.enum(["passed", "conditional", "failed", "pending"]),
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
    privacy_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    compliance_summary: {
      overall_compliance_level: "mostly_compliant",
      compliance_score: 85,
      regulations_in_scope: ["개인정보보호법(PIPA)", "GDPR(EU 참석자)", "CCPA(미국 참석자)"],
      last_audit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    data_inventory: {
      total_data_categories: 8,
      personal_data_types: [
        { data_type: "성명", sensitivity: "standard", collection_purpose: "등록 및 명찰", retention_period: "행사 후 2년", legal_basis: "계약 이행" },
        { data_type: "이메일", sensitivity: "standard", collection_purpose: "커뮤니케이션", retention_period: "동의 철회 시까지", legal_basis: "동의" },
        { data_type: "연락처", sensitivity: "standard", collection_purpose: "긴급 연락", retention_period: "행사 후 1년", legal_basis: "정당한 이익" },
        { data_type: "식이 제한", sensitivity: "sensitive", collection_purpose: "케이터링", retention_period: "행사 종료 후 삭제", legal_basis: "명시적 동의" },
        { data_type: "결제 정보", sensitivity: "sensitive", collection_purpose: "등록비 처리", retention_period: "법적 보관 기간(5년)", legal_basis: "계약 이행" },
      ],
      data_subjects: [
        { category: "참석자", estimated_count: 2500, consent_obtained: true },
        { category: "연사", estimated_count: 45, consent_obtained: true },
        { category: "스폰서 담당자", estimated_count: 80, consent_obtained: true },
        { category: "언론", estimated_count: 30, consent_obtained: false },
      ],
    },
    regulation_compliance: [
      {
        regulation: "개인정보보호법(PIPA)",
        requirements: [
          { requirement: "개인정보 수집 동의", status: "compliant", evidence: "등록 시 동의서", gap: "-" },
          { requirement: "처리 목적 고지", status: "compliant", evidence: "개인정보처리방침", gap: "-" },
          { requirement: "파기 절차", status: "partial", evidence: "파기 지침 문서화", gap: "자동 파기 시스템 미구축" },
          { requirement: "안전성 확보 조치", status: "compliant", evidence: "보안 점검 보고서", gap: "-" },
        ],
        overall_status: "compliant",
      },
      {
        regulation: "GDPR",
        requirements: [
          { requirement: "적법한 처리 근거", status: "compliant", evidence: "동의 및 계약", gap: "-" },
          { requirement: "정보주체 권리 보장", status: "partial", evidence: "권리 행사 절차", gap: "자동화된 응대 시스템 부재" },
          { requirement: "DPA 체결", status: "compliant", evidence: "프로세서 계약서", gap: "-" },
        ],
        overall_status: "partial",
      },
    ],
    consent_management: {
      consent_mechanism: "등록 시 체크박스 + 별도 마케팅 동의",
      opt_in_rate: 72,
      withdrawal_requests: 15,
      pending_requests: 2,
    },
    data_subject_rights: {
      access_requests: 8,
      deletion_requests: 12,
      rectification_requests: 5,
      avg_response_time_days: 3.5,
      compliance_rate: 96,
    },
    third_party_processors: [
      { processor_name: "이벤터스 (등록 플랫폼)", processing_purpose: "참석자 등록", dpa_status: "signed", security_assessment: "passed" },
      { processor_name: "스트라이프 (결제)", processing_purpose: "결제 처리", dpa_status: "signed", security_assessment: "passed" },
      { processor_name: "메일침프 (마케팅)", processing_purpose: "이메일 마케팅", dpa_status: "signed", security_assessment: "conditional" },
      { processor_name: "줌 (온라인 플랫폼)", processing_purpose: "하이브리드 참여", dpa_status: "pending", security_assessment: "pending" },
    ],
    action_items: [
      { action: "줌 DPA 체결 완료", priority: "high", deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), responsible_party: "법무팀" },
      { action: "자동 파기 시스템 구축", priority: "medium", deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), responsible_party: "IT팀" },
      { action: "언론 관계자 동의 절차 보완", priority: "high", deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), responsible_party: "홍보팀" },
      { action: "GDPR 정보주체 권리 자동 응대 시스템", priority: "medium", deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), responsible_party: "IT팀" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-013",
  taskName: "개인정보 보호 준수",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.3.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.3: Privacy Compliance",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
