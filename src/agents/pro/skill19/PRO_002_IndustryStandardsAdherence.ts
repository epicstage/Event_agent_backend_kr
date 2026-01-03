/**
 * PRO-002: 산업 표준 준수
 * CMP-IS Reference: 19.2.a - Industry standards adherence
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Industry Standards Specialist for event management.`;

export const InputSchema = z.object({
  event_id: z.string(),
  standards_to_assess: z.array(z.enum(["ISO20121", "APEX", "ASTM", "CIC", "MPI", "GRI"])).optional(),
  certification_goal: z.boolean().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string(),
  event_id: z.string(),
  standards_summary: z.object({
    total_standards: z.number(),
    fully_compliant: z.number(),
    partially_compliant: z.number(),
    overall_score: z.number(),
  }),
  standards_assessment: z.array(z.object({
    standard_name: z.string(),
    standard_version: z.string(),
    compliance_level: z.enum(["full", "partial", "in_progress", "not_applicable"]),
    compliance_score: z.number(),
    key_requirements: z.array(z.object({
      requirement: z.string(),
      status: z.enum(["met", "partial", "not_met"]),
      evidence: z.string(),
    })),
    gaps: z.array(z.string()),
    certification_status: z.string(),
  })),
  action_plan: z.array(z.object({
    standard: z.string(),
    action: z.string(),
    priority: z.enum(["high", "medium", "low"]),
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
  const standards = validatedInput.standards_to_assess || ["ISO20121", "APEX", "CIC"];

  return {
    assessment_id: generateUUID(),
    event_id: validatedInput.event_id,
    standards_summary: {
      total_standards: standards.length,
      fully_compliant: 1,
      partially_compliant: 2,
      overall_score: 78,
    },
    standards_assessment: [
      {
        standard_name: "ISO 20121",
        standard_version: "2012",
        compliance_level: "partial",
        compliance_score: 72,
        key_requirements: [
          { requirement: "지속가능성 관리 시스템 문서화", status: "met", evidence: "SMS 문서 v2.3" },
          { requirement: "이해관계자 참여 프로세스", status: "met", evidence: "이해관계자 매핑 완료" },
          { requirement: "공급망 지속가능성 평가", status: "partial", evidence: "주요 벤더 50% 평가 완료" },
          { requirement: "탄소 발자국 측정", status: "not_met", evidence: "측정 시스템 미구축" },
        ],
        gaps: ["탄소 배출량 측정 시스템 필요", "전체 공급망 평가 미완료"],
        certification_status: "인증 진행 중 - 2025 Q2 목표",
      },
      {
        standard_name: "APEX/ASTM",
        standard_version: "2019",
        compliance_level: "full",
        compliance_score: 95,
        key_requirements: [
          { requirement: "친환경 회의 기준", status: "met", evidence: "Green Meeting 인증 획득" },
          { requirement: "폐기물 관리 프로토콜", status: "met", evidence: "Zero Waste 목표 90% 달성" },
          { requirement: "에너지 관리", status: "met", evidence: "재생에너지 60% 사용" },
        ],
        gaps: [],
        certification_status: "인증 완료 (유효: 2026.06)",
      },
    ],
    action_plan: [
      { standard: "ISO 20121", action: "탄소 발자국 측정 도구 도입", priority: "high", deadline: "2025-02-28", responsible_party: "지속가능성 팀" },
      { standard: "ISO 20121", action: "나머지 벤더 지속가능성 평가 완료", priority: "medium", deadline: "2025-03-15", responsible_party: "조달팀" },
      { standard: "CIC", action: "CMP 표준 통합 체크리스트 개발", priority: "medium", deadline: "2025-02-15", responsible_party: "운영팀" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-002",
  taskName: "산업 표준 준수",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.2.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.2: Industry Standards",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
