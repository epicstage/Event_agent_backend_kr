/**
 * PRJ-026: 갈등 해결
 * CMP-IS Reference: 6.2.b - Resolving conflicts
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Conflict Resolution Agent for event projects.
CMP-IS Standard: 6.2.b - Resolving conflicts`;

export const InputSchema = z.object({
  event_id: z.string(),
  conflict: z.object({
    description: z.string(),
    parties_involved: z.array(z.object({
      name: z.string(),
      role: z.string(),
      position: z.string(),
    })),
    conflict_type: z.enum(["resource", "priority", "interpersonal", "scope", "schedule", "budget"]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    started_date: z.string().optional(),
  }),
  context: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  conflict_analysis: z.object({
    type: z.string(),
    severity: z.string(),
    root_causes: z.array(z.string()),
    impact_assessment: z.string(),
    stakeholder_positions: z.array(z.object({
      party: z.string(),
      position: z.string(),
      underlying_interest: z.string(),
    })),
  }),
  resolution_options: z.array(z.object({
    option_id: z.string(),
    approach: z.string(),
    description: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    likelihood_success: z.number(),
  })),
  recommended_approach: z.object({
    approach: z.string(),
    rationale: z.string(),
    action_steps: z.array(z.string()),
    timeline: z.string(),
    facilitator: z.string(),
  }),
  prevention_measures: z.array(z.string()),
  escalation_plan: z.object({
    trigger: z.string(),
    escalate_to: z.string(),
    timeline: z.string(),
  }),
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

const conflictApproaches = {
  resource: ["자원 재분배", "우선순위 조정", "추가 자원 확보"],
  priority: ["이해관계자 협의", "기준 명확화", "트레이드오프 분석"],
  interpersonal: ["중재 미팅", "역할 명확화", "커뮤니케이션 개선"],
  scope: ["범위 재정의", "변경 통제 프로세스", "이해관계자 합의"],
  schedule: ["일정 재조정", "크리티컬 패스 분석", "자원 추가 투입"],
  budget: ["예산 재배분", "범위 조정", "추가 예산 승인"],
};

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { conflict } = validatedInput;

  const approaches = conflictApproaches[conflict.conflict_type];

  const resolutionOptions = approaches.map((approach, idx) => ({
    option_id: `OPT-${String(idx + 1).padStart(2, "0")}`,
    approach,
    description: `${approach}을(를) 통한 갈등 해결`,
    pros: ["신속한 해결 가능", "관계 유지"],
    cons: ["일부 양보 필요", "후속 조치 필요"],
    likelihood_success: 70 - (idx * 10),
  }));

  const stakeholderPositions = conflict.parties_involved.map(party => ({
    party: party.name,
    position: party.position,
    underlying_interest: "프로젝트 성공 및 개인 목표 달성",
  }));

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    conflict_analysis: {
      type: conflict.conflict_type,
      severity: conflict.severity,
      root_causes: [
        "커뮤니케이션 부족",
        "역할/책임 불명확",
        "자원 제약",
      ],
      impact_assessment: conflict.severity === "critical" || conflict.severity === "high"
        ? "프로젝트 일정 및 품질에 심각한 영향"
        : "관리 가능한 수준, 조기 개입 권장",
      stakeholder_positions: stakeholderPositions,
    },
    resolution_options: resolutionOptions,
    recommended_approach: {
      approach: approaches[0],
      rationale: "가장 높은 성공 가능성과 관계 유지",
      action_steps: [
        "1. 당사자 개별 면담",
        "2. 중재 미팅 일정 조율",
        "3. 합의안 도출",
        "4. 문서화 및 후속 모니터링",
      ],
      timeline: conflict.severity === "critical" ? "24시간 내" : "3일 내",
      facilitator: "PM",
    },
    prevention_measures: [
      "정기 팀 미팅을 통한 조기 이슈 감지",
      "역할과 책임 명확한 문서화",
      "투명한 의사결정 프로세스 운영",
      "오픈 커뮤니케이션 문화 조성",
    ],
    escalation_plan: {
      trigger: "권장 접근법으로 해결 불가 시",
      escalate_to: conflict.severity === "critical" ? "이벤트 오너" : "팀 리드",
      timeline: conflict.severity === "critical" ? "즉시" : "48시간 내",
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-026",
  taskName: "갈등 해결",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.2.b",
  skill: "Skill 6: Manage Project",
  subSkill: "6.2: Coordinate Project Team",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
