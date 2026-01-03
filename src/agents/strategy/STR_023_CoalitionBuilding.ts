/**
 * STR-023: 이해관계자 연합 구축
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Coalition Building)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Coalition Building Agent.

Your expertise includes:
- Identifying common interests among stakeholders
- Building strategic alliances
- Coalition governance structures
- Sustaining collaborative relationships

CMP-IS Standard: Domain A - Strategic Planning (Coalition Building)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  strategic_objective: z.string(),
  potential_coalition_members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    organization: z.string().optional(),
    interests: z.array(z.string()),
    resources: z.array(z.string()),
    influence_level: z.enum(["high", "medium", "low"]),
    alignment_with_objective: z.enum(["strong", "moderate", "weak", "opposed"]),
    relationship_status: z.enum(["ally", "potential_ally", "neutral", "competitor"]),
  })),
  existing_alliances: z.array(z.object({
    members: z.array(z.string()),
    purpose: z.string(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  coalition_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  coalition_design: z.object({
    name: z.string(),
    purpose: z.string(),
    shared_vision: z.string(),
    core_members: z.array(z.object({
      stakeholder_id: z.string(),
      name: z.string(),
      role_in_coalition: z.string(),
      contribution: z.array(z.string()),
      benefit: z.array(z.string()),
    })),
    extended_network: z.array(z.object({
      stakeholder_id: z.string(),
      name: z.string(),
      engagement_level: z.enum(["active", "supportive", "observer"]),
    })),
  }),
  formation_strategy: z.object({
    phases: z.array(z.object({
      phase: z.string(),
      activities: z.array(z.string()),
      milestones: z.array(z.string()),
      timeline: z.string(),
    })),
    key_conversations: z.array(z.object({
      stakeholder: z.string(),
      objective: z.string(),
      talking_points: z.array(z.string()),
      potential_objections: z.array(z.string()),
      responses: z.array(z.string()),
    })),
    quick_wins: z.array(z.object({
      opportunity: z.string(),
      participants: z.array(z.string()),
      expected_outcome: z.string(),
    })),
  }),
  governance_structure: z.object({
    decision_making: z.string(),
    meeting_cadence: z.string(),
    communication_norms: z.array(z.string()),
    conflict_resolution: z.string(),
    roles: z.array(z.object({
      role: z.string(),
      responsibilities: z.array(z.string()),
      suggested_holder: z.string(),
    })),
  }),
  sustainability_plan: z.object({
    value_maintenance: z.array(z.string()),
    engagement_activities: z.array(z.object({
      activity: z.string(),
      frequency: z.string(),
      purpose: z.string(),
    })),
    success_indicators: z.array(z.string()),
    exit_strategy: z.string(),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-023",
  taskName: "Coalition Building",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "전략적 목표 달성을 위한 이해관계자 연합을 구축합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  // Identify core members (strong alignment + high influence)
  const coreEligible = validated.potential_coalition_members.filter(
    m => (m.alignment_with_objective === "strong" || m.alignment_with_objective === "moderate") &&
         (m.influence_level === "high" || m.influence_level === "medium")
  );

  const coreMembers = coreEligible.slice(0, 5).map(m => ({
    stakeholder_id: m.id,
    name: m.name,
    role_in_coalition: m.influence_level === "high" ? "핵심 리더" : "주요 참여자",
    contribution: m.resources,
    benefit: m.interests.slice(0, 2),
  }));

  // Extended network (potential allies and neutrals)
  const extended = validated.potential_coalition_members
    .filter(m => m.relationship_status === "potential_ally" || m.relationship_status === "neutral")
    .slice(0, 5)
    .map(m => ({
      stakeholder_id: m.id,
      name: m.name,
      engagement_level: m.relationship_status === "potential_ally" ? "supportive" as const : "observer" as const,
    }));

  // Key conversations needed
  const keyConversations = coreEligible.slice(0, 3).map(m => ({
    stakeholder: m.name,
    objective: "연합 참여 동의 확보",
    talking_points: [
      `공동 목표: ${validated.strategic_objective}`,
      `${m.name}의 기여 가능 영역: ${m.resources.join(", ")}`,
      "연합 참여를 통한 상호 이익",
    ],
    potential_objections: [
      "시간/자원 투자 부담",
      "다른 우선순위와의 충돌",
      "불명확한 ROI",
    ],
    responses: [
      "최소 참여 옵션 제시",
      "핵심 활동에만 집중",
      "구체적 이익 시나리오 제시",
    ],
  }));

  return {
    coalition_plan_id: generateUUID(),
    event_id: validated.event_id,
    coalition_design: {
      name: `${validated.event_name} 성공 연합`,
      purpose: validated.strategic_objective,
      shared_vision: `${validated.event_name}의 성공적 개최를 통한 모든 참여자의 목표 달성`,
      core_members: coreMembers,
      extended_network: extended,
    },
    formation_strategy: {
      phases: [
        {
          phase: "탐색 단계",
          activities: ["핵심 이해관계자 1:1 미팅", "공통 관심사 파악", "참여 의향 확인"],
          milestones: ["최소 3명의 핵심 멤버 확보"],
          timeline: "1-2주",
        },
        {
          phase: "형성 단계",
          activities: ["킥오프 미팅", "역할 및 책임 합의", "초기 목표 설정"],
          milestones: ["연합 공식 출범"],
          timeline: "2-3주",
        },
        {
          phase: "활성화 단계",
          activities: ["정기 회의 시작", "공동 프로젝트 착수", "확장 멤버 영입"],
          milestones: ["첫 공동 성과 달성"],
          timeline: "4-6주",
        },
      ],
      key_conversations: keyConversations,
      quick_wins: [
        {
          opportunity: "공동 정보 공유 플랫폼 구축",
          participants: coreMembers.slice(0, 3).map(m => m.name),
          expected_outcome: "협력의 가시적 시작점",
        },
        {
          opportunity: "공동 발표/성명",
          participants: coreMembers.map(m => m.name),
          expected_outcome: "연합의 대외적 인지도",
        },
      ],
    },
    governance_structure: {
      decision_making: "합의제 (핵심 사안) + 담당자 재량 (일상 사안)",
      meeting_cadence: "격주 정기 회의, 월 1회 전체 회의",
      communication_norms: [
        "중요 정보는 24시간 내 공유",
        "이슈는 공개 논의, 비난 금지",
        "결정 사항은 문서화",
      ],
      conflict_resolution: "당사자 대화 → 중재자 개입 → 전체 논의",
      roles: [
        {
          role: "연합 의장",
          responsibilities: ["회의 주재", "대외 대표", "방향 제시"],
          suggested_holder: coreMembers[0]?.name || "미정",
        },
        {
          role: "운영 간사",
          responsibilities: ["회의 조율", "문서 관리", "커뮤니케이션"],
          suggested_holder: "프로젝트 매니저",
        },
      ],
    },
    sustainability_plan: {
      value_maintenance: [
        "정기적 성과 공유 및 축하",
        "멤버 기여도 인정",
        "새로운 공동 목표 지속 발굴",
      ],
      engagement_activities: [
        { activity: "분기 성과 리뷰", frequency: "분기별", purpose: "성과 점검 및 방향 조정" },
        { activity: "네트워킹 이벤트", frequency: "반기별", purpose: "관계 강화" },
        { activity: "공동 학습 세션", frequency: "월별", purpose: "역량 강화 및 유대 강화" },
      ],
      success_indicators: [
        "멤버 참여율 80% 이상 유지",
        "공동 목표 달성률",
        "멤버 만족도 조사 결과",
      ],
      exit_strategy: "이벤트 종료 후 성과 정리 → 지속 협력 의향 확인 → 후속 연합 또는 해산",
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
