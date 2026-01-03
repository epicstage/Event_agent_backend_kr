/**
 * MKTADV-021: CRM 통합 관리
 * CMP-IS Reference: 18.1.a - CRM system integration
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert CRM Integration Specialist for event management.`;

export const InputSchema = z.object({
  event_id: z.string(),
  crm_system: z.enum(["salesforce", "hubspot", "dynamics", "zoho", "custom"]),
  integration_type: z.enum(["full_sync", "incremental", "bidirectional"]).optional(),
  data_scope: z.array(z.enum(["contacts", "registrations", "interactions", "campaigns"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  integration_id: z.string(),
  event_id: z.string(),
  sync_status: z.object({
    status: z.enum(["success", "partial", "failed"]),
    records_synced: z.number(),
    records_created: z.number(),
    records_updated: z.number(),
    records_failed: z.number(),
    last_sync: z.string(),
  }),
  field_mappings: z.array(z.object({
    event_field: z.string(),
    crm_field: z.string(),
    sync_direction: z.enum(["to_crm", "from_crm", "bidirectional"]),
    transform_rule: z.string().optional(),
  })),
  data_quality: z.object({
    completeness_score: z.number(),
    accuracy_score: z.number(),
    duplicate_rate: z.number(),
    issues_found: z.array(z.object({
      issue_type: z.string(),
      affected_records: z.number(),
      severity: z.enum(["high", "medium", "low"]),
    })),
  }),
  automation_rules: z.array(z.object({
    rule_name: z.string(),
    trigger: z.string(),
    action: z.string(),
    status: z.enum(["active", "paused", "error"]),
  })),
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
    integration_id: generateUUID(),
    event_id: validatedInput.event_id,
    sync_status: {
      status: "success",
      records_synced: 2450,
      records_created: 180,
      records_updated: 2250,
      records_failed: 20,
      last_sync: new Date().toISOString(),
    },
    field_mappings: [
      { event_field: "attendee_email", crm_field: "Email", sync_direction: "bidirectional" },
      { event_field: "company_name", crm_field: "Account.Name", sync_direction: "bidirectional" },
      { event_field: "registration_date", crm_field: "Event_Registration_Date__c", sync_direction: "to_crm" },
      { event_field: "ticket_type", crm_field: "Event_Ticket_Type__c", sync_direction: "to_crm" },
      { event_field: "attendance_status", crm_field: "Event_Attendance__c", sync_direction: "to_crm" },
      { event_field: "lead_score", crm_field: "Lead_Score__c", sync_direction: "from_crm" },
    ],
    data_quality: {
      completeness_score: 87,
      accuracy_score: 94,
      duplicate_rate: 3.2,
      issues_found: [
        { issue_type: "이메일 형식 오류", affected_records: 15, severity: "medium" },
        { issue_type: "중복 연락처", affected_records: 78, severity: "high" },
        { issue_type: "회사명 불일치", affected_records: 45, severity: "low" },
      ],
    },
    automation_rules: [
      { rule_name: "등록 완료 → CRM 리드 생성", trigger: "registration_completed", action: "create_lead", status: "active" },
      { rule_name: "결제 완료 → 기회 업데이트", trigger: "payment_completed", action: "update_opportunity", status: "active" },
      { rule_name: "참석 확인 → 캠페인 멤버 추가", trigger: "check_in", action: "add_campaign_member", status: "active" },
      { rule_name: "노쇼 → 후속 태스크 생성", trigger: "no_show", action: "create_follow_up_task", status: "active" },
    ],
    recommendations: [
      "중복 연락처 78건 병합 처리 필요",
      "회사명 표준화 규칙 적용 권장",
      "실시간 동기화로 전환하여 데이터 지연 최소화",
      "이메일 검증 자동화로 형식 오류 예방",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-021",
  taskName: "CRM 통합 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.1.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.1: CRM Sync",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
