/**
 * PRO-001: 윤리 강령 준수 관리
 * CMP-IS Reference: 19.1.a - Ethics code compliance management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Ethics & Compliance Officer for event management industry.`;

export const InputSchema = z.object({
  event_id: z.string(),
  assessment_scope: z.enum(["full", "vendor", "staff", "marketing", "data"]).optional(),
  stakeholder_groups: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  compliance_id: z.string(),
  event_id: z.string(),
  ethics_overview: z.object({
    overall_compliance_score: z.number(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    guidelines_active: z.number(),
    acknowledgments_pending: z.number(),
    violations_reported: z.number(),
  }),
  guideline_categories: z.array(z.object({
    category: z.string(),
    guidelines_count: z.number(),
    compliance_rate: z.number(),
    last_updated: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  stakeholder_compliance: z.array(z.object({
    stakeholder_group: z.string(),
    total_members: z.number(),
    acknowledged: z.number(),
    compliance_rate: z.number(),
    training_completed: z.number(),
  })),
  recent_issues: z.array(z.object({
    issue_type: z.string(),
    description: z.string(),
    severity: z.enum(["minor", "moderate", "major"]),
    status: z.enum(["open", "investigating", "resolved"]),
    reported_date: z.string(),
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
    compliance_id: generateUUID(),
    event_id: validatedInput.event_id,
    ethics_overview: {
      overall_compliance_score: 92,
      risk_level: "low",
      guidelines_active: 24,
      acknowledgments_pending: 15,
      violations_reported: 2,
    },
    guideline_categories: [
      { category: "벤더 관계", guidelines_count: 6, compliance_rate: 95, last_updated: new Date().toISOString(), priority: "high" },
      { category: "참가자 대우", guidelines_count: 5, compliance_rate: 98, last_updated: new Date().toISOString(), priority: "high" },
      { category: "지속가능성", guidelines_count: 4, compliance_rate: 88, last_updated: new Date().toISOString(), priority: "medium" },
      { category: "DEI (다양성/형평성/포용성)", guidelines_count: 5, compliance_rate: 90, last_updated: new Date().toISOString(), priority: "high" },
      { category: "데이터 사용", guidelines_count: 4, compliance_rate: 94, last_updated: new Date().toISOString(), priority: "high" },
    ],
    stakeholder_compliance: [
      { stakeholder_group: "내부 직원", total_members: 45, acknowledged: 43, compliance_rate: 95.5, training_completed: 40 },
      { stakeholder_group: "벤더/협력사", total_members: 32, acknowledged: 28, compliance_rate: 87.5, training_completed: 25 },
      { stakeholder_group: "스폰서", total_members: 15, acknowledged: 14, compliance_rate: 93.3, training_completed: 12 },
      { stakeholder_group: "연사/발표자", total_members: 20, acknowledged: 18, compliance_rate: 90.0, training_completed: 15 },
    ],
    recent_issues: [
      { issue_type: "이해충돌", description: "벤더 선정 과정에서 미공개 관계 발견", severity: "moderate", status: "resolved", reported_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { issue_type: "데이터 처리", description: "참가자 동의 없이 제3자 데이터 공유 시도", severity: "major", status: "investigating", reported_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    recommendations: [
      "벤더 윤리 교육 완료율 95% 목표 달성을 위한 리마인더 발송",
      "데이터 처리 가이드라인 강화 및 전 직원 재교육 실시",
      "분기별 윤리 감사 일정 수립",
      "익명 신고 채널 활성화를 위한 인식 캠페인 진행",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-001",
  taskName: "윤리 강령 준수 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.1.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.1: Ethics Code",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
