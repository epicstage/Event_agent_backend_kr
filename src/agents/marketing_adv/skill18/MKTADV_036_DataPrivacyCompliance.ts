/**
 * MKTADV-036: 데이터 프라이버시 준수
 * CMP-IS Reference: 18.10.b - Data privacy compliance management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Data Privacy Compliance Specialist for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  compliance_framework: z.array(z.enum(["gdpr", "ccpa", "lgpd", "pipa", "custom"])).optional(),
  audit_scope: z.enum(["full", "marketing", "registration", "crm"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  compliance_id: z.string(),
  event_id: z.string(),
  compliance_status: z.object({
    overall_score: z.number(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    last_audit_date: z.string(),
    next_audit_due: z.string(),
  }),
  framework_compliance: z.array(z.object({
    framework: z.string(),
    compliance_score: z.number(),
    status: z.enum(["compliant", "partial", "non_compliant"]),
    gaps: z.array(z.string()),
    required_actions: z.array(z.string()),
  })),
  consent_management: z.object({
    total_records: z.number(),
    with_consent: z.number(),
    consent_rate: z.number(),
    consent_types: z.array(z.object({
      type: z.string(),
      count: z.number(),
      percentage: z.number(),
    })),
    opt_out_rate: z.number(),
  }),
  data_inventory: z.array(z.object({
    data_category: z.string(),
    pii_fields: z.number(),
    retention_policy: z.string(),
    encryption_status: z.enum(["encrypted", "partial", "none"]),
    access_controls: z.enum(["strict", "moderate", "open"]),
  })),
  risk_assessment: z.array(z.object({
    risk: z.string(),
    severity: z.enum(["critical", "high", "medium", "low"]),
    likelihood: z.enum(["high", "medium", "low"]),
    mitigation: z.string(),
    status: z.enum(["mitigated", "in_progress", "open"]),
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

  const frameworks = validatedInput.compliance_framework || ["gdpr", "ccpa"];

  return {
    compliance_id: generateUUID(),
    event_id: validatedInput.event_id,
    compliance_status: {
      overall_score: 85,
      risk_level: "low",
      last_audit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_audit_due: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    framework_compliance: frameworks.map(framework => ({
      framework: framework.toUpperCase(),
      compliance_score: framework === "gdpr" ? 88 : 82,
      status: "compliant" as const,
      gaps: framework === "gdpr"
        ? ["데이터 이동권 프로세스 문서화 필요", "제3자 공유 동의 세분화 필요"]
        : ["판매 금지 옵션 UI 개선 필요"],
      required_actions: framework === "gdpr"
        ? ["DPA 업데이트", "프로세서 목록 갱신"]
        : ["프라이버시 노티스 업데이트"],
    })),
    consent_management: {
      total_records: 2450,
      with_consent: 2280,
      consent_rate: 93,
      consent_types: [
        { type: "마케팅 이메일", count: 2150, percentage: 87.8 },
        { type: "파트너 공유", count: 1450, percentage: 59.2 },
        { type: "행동 추적", count: 1820, percentage: 74.3 },
        { type: "프로파일링", count: 1250, percentage: 51.0 },
      ],
      opt_out_rate: 3.2,
    },
    data_inventory: [
      { data_category: "등록 데이터", pii_fields: 12, retention_policy: "이벤트 후 3년", encryption_status: "encrypted", access_controls: "strict" },
      { data_category: "결제 데이터", pii_fields: 8, retention_policy: "법적 요구 기간", encryption_status: "encrypted", access_controls: "strict" },
      { data_category: "행동 데이터", pii_fields: 5, retention_policy: "18개월", encryption_status: "encrypted", access_controls: "moderate" },
      { data_category: "마케팅 데이터", pii_fields: 6, retention_policy: "동의 철회 시까지", encryption_status: "partial", access_controls: "moderate" },
    ],
    risk_assessment: [
      { risk: "제3자 데이터 공유 미문서화", severity: "medium", likelihood: "low", mitigation: "DPA 체결 및 문서화", status: "in_progress" },
      { risk: "동의 기록 불완전", severity: "high", likelihood: "low", mitigation: "동의 로깅 시스템 구축", status: "mitigated" },
      { risk: "데이터 보존 정책 미준수", severity: "medium", likelihood: "medium", mitigation: "자동 삭제 프로세스 구현", status: "in_progress" },
      { risk: "크로스보더 전송 규정", severity: "high", likelihood: "low", mitigation: "SCC 체결", status: "mitigated" },
    ],
    recommendations: [
      "마케팅 데이터 암호화 완료 필요 - 현재 부분 적용",
      "동의 갱신 캠페인으로 동의율 95% 이상 달성",
      "연간 프라이버시 교육 실시 (다음 일정: 다음 분기)",
      "데이터 이동권 요청 프로세스 자동화",
      "쿠키 동의 배너 UX 개선으로 동의율 향상",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-036",
  taskName: "데이터 프라이버시 준수",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.10.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.10: Data Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
