/**
 * PRO-007: 이해충돌 관리
 * CMP-IS Reference: 19.7.a - Conflict of interest management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Conflict of Interest Management Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  disclosure_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }).optional(),
  stakeholder_types: z.array(z.enum(["staff", "vendors", "sponsors", "speakers", "board"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  coi_report_id: z.string(),
  event_id: z.string(),
  disclosure_summary: z.object({
    total_disclosures: z.number(),
    new_this_period: z.number(),
    resolved: z.number(),
    active: z.number(),
    pending_review: z.number(),
  }),
  disclosures: z.array(z.object({
    disclosure_id: z.string(),
    stakeholder_type: z.string(),
    conflict_type: z.string(),
    description: z.string(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    mitigation_action: z.string(),
    status: z.enum(["disclosed", "under_review", "mitigated", "escalated"]),
    review_date: z.string(),
  })),
  risk_areas: z.array(z.object({
    area: z.string(),
    risk_count: z.number(),
    primary_concern: z.string(),
    recommended_controls: z.array(z.string()),
  })),
  compliance_metrics: z.object({
    disclosure_rate: z.number(),
    training_completion: z.number(),
    policy_acknowledgment: z.number(),
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
    coi_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    disclosure_summary: {
      total_disclosures: 15,
      new_this_period: 4,
      resolved: 10,
      active: 3,
      pending_review: 2,
    },
    disclosures: [
      {
        disclosure_id: "COI-001",
        stakeholder_type: "스태프",
        conflict_type: "가족 관계",
        description: "벤더 선정 담당자의 배우자가 후보 벤더 소속",
        risk_level: "high",
        mitigation_action: "해당 벤더 평가에서 담당자 제외",
        status: "mitigated",
        review_date: new Date().toISOString(),
      },
      {
        disclosure_id: "COI-002",
        stakeholder_type: "연사",
        conflict_type: "재정적 이해관계",
        description: "연사가 발표 주제 관련 기업의 자문위원",
        risk_level: "medium",
        mitigation_action: "세션 시작 시 이해관계 공개",
        status: "disclosed",
        review_date: new Date().toISOString(),
      },
      {
        disclosure_id: "COI-003",
        stakeholder_type: "스폰서",
        conflict_type: "경쟁 관계",
        description: "두 스폰서사가 동일 시장 경쟁 관계",
        risk_level: "medium",
        mitigation_action: "부스 배치 및 세션 시간 분리",
        status: "under_review",
        review_date: new Date().toISOString(),
      },
    ],
    risk_areas: [
      {
        area: "벤더 선정",
        risk_count: 5,
        primary_concern: "개인적 관계로 인한 편향된 결정",
        recommended_controls: ["위원회 기반 결정", "입찰 프로세스 투명성", "외부 감사"],
      },
      {
        area: "스폰서 관계",
        risk_count: 3,
        primary_concern: "스폰서 영향력으로 인한 콘텐츠 편향",
        recommended_controls: ["편집 독립성 보장", "스폰서십 가이드라인", "이해관계 공개"],
      },
    ],
    compliance_metrics: {
      disclosure_rate: 95,
      training_completion: 88,
      policy_acknowledgment: 92,
    },
    recommendations: [
      "분기별 이해충돌 교육 의무화",
      "벤더 선정 위원회 다양화",
      "익명 신고 채널 활성화 홍보",
      "스폰서십 가이드라인 업데이트",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-007",
  taskName: "이해충돌 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.7.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.7: Conflict of Interest",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
