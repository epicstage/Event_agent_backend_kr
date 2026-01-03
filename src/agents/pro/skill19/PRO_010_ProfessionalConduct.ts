/**
 * PRO-010: 전문가적 행동 기준
 * CMP-IS Reference: 19.10.a - Professional conduct standards
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Professional Conduct Standards Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  assessment_scope: z.array(z.enum(["staff", "contractors", "volunteers", "vendors"])).optional(),
  incident_review: z.boolean().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  conduct_report_id: z.string(),
  event_id: z.string(),
  conduct_overview: z.object({
    overall_rating: z.enum(["excellent", "good", "acceptable", "needs_improvement"]),
    compliance_score: z.number(),
    training_completion_rate: z.number(),
    incidents_this_period: z.number(),
  }),
  standards_compliance: z.array(z.object({
    standard_category: z.string(),
    compliance_rate: z.number(),
    key_behaviors: z.array(z.string()),
    common_gaps: z.array(z.string()),
  })),
  training_status: z.object({
    total_personnel: z.number(),
    completed_training: z.number(),
    pending_training: z.number(),
    overdue_training: z.number(),
    next_training_date: z.string(),
  }),
  incident_summary: z.array(z.object({
    incident_type: z.string(),
    count: z.number(),
    severity_breakdown: z.object({
      minor: z.number(),
      moderate: z.number(),
      serious: z.number(),
    }),
    trend: z.enum(["improving", "stable", "worsening"]),
  })),
  recognition_program: z.object({
    awards_given: z.number(),
    top_performers: z.array(z.object({
      name: z.string(),
      recognition: z.string(),
      category: z.string(),
    })),
  }),
  action_items: z.array(z.string()),
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
    conduct_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    conduct_overview: {
      overall_rating: "good",
      compliance_score: 88,
      training_completion_rate: 92,
      incidents_this_period: 5,
    },
    standards_compliance: [
      {
        standard_category: "고객 서비스",
        compliance_rate: 94,
        key_behaviors: ["적극적 경청", "문제 해결 지향", "시의적절한 대응"],
        common_gaps: ["VIP 프로토콜 미숙지"],
      },
      {
        standard_category: "팀워크 및 협업",
        compliance_rate: 90,
        key_behaviors: ["정보 공유", "상호 지원", "건설적 피드백"],
        common_gaps: ["크로스팀 커뮤니케이션 지연"],
      },
      {
        standard_category: "시간 관리",
        compliance_rate: 85,
        key_behaviors: ["일정 준수", "우선순위 설정", "마감 관리"],
        common_gaps: ["회의 시간 초과", "보고서 지연 제출"],
      },
      {
        standard_category: "기밀 유지",
        compliance_rate: 96,
        key_behaviors: ["정보 보안", "NDA 준수", "데이터 처리 규정 준수"],
        common_gaps: [],
      },
    ],
    training_status: {
      total_personnel: 120,
      completed_training: 110,
      pending_training: 7,
      overdue_training: 3,
      next_training_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    incident_summary: [
      {
        incident_type: "고객 불만",
        count: 3,
        severity_breakdown: { minor: 2, moderate: 1, serious: 0 },
        trend: "improving",
      },
      {
        incident_type: "내부 갈등",
        count: 1,
        severity_breakdown: { minor: 1, moderate: 0, serious: 0 },
        trend: "stable",
      },
      {
        incident_type: "정책 위반",
        count: 1,
        severity_breakdown: { minor: 0, moderate: 1, serious: 0 },
        trend: "stable",
      },
    ],
    recognition_program: {
      awards_given: 8,
      top_performers: [
        { name: "김민수", recognition: "올해의 고객 서비스상", category: "고객 서비스" },
        { name: "이영희", recognition: "협업 우수상", category: "팀워크" },
        { name: "박준호", recognition: "문제 해결상", category: "전문성" },
      ],
    },
    action_items: [
      "VIP 프로토콜 심화 교육 실시",
      "크로스팀 커뮤니케이션 워크숍 개최",
      "미완료 교육 대상자 독촉 및 일정 조정",
      "분기별 행동 기준 리마인더 발송",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-010",
  taskName: "전문가적 행동 기준",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.10.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.10: Professional Conduct",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
