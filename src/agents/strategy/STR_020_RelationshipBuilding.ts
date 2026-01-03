/**
 * STR-020: 이해관계자 관계 구축
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Relationship Building)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Relationship Building Agent.

Your expertise includes:
- Trust building strategies
- Long-term relationship development
- Network expansion and maintenance
- Relationship value assessment

CMP-IS Standard: Domain A - Strategic Planning (Relationship Building)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  stakeholders: z.array(z.object({
    id: z.string(),
    name: z.string(),
    organization: z.string().optional(),
    role: z.string(),
    current_relationship: z.enum(["new", "developing", "established", "strong", "strained"]),
    strategic_value: z.enum(["critical", "high", "medium", "low"]),
    interaction_history: z.array(z.object({
      date: z.string(),
      type: z.string(),
      outcome: z.string(),
    })).optional(),
  })),
  relationship_goals: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  building_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  relationship_strategies: z.array(z.object({
    stakeholder_id: z.string(),
    name: z.string(),
    current_status: z.string(),
    target_status: z.string(),
    trust_building_actions: z.array(z.object({
      action: z.string(),
      purpose: z.string(),
      timing: z.string(),
      expected_outcome: z.string(),
    })),
    value_delivery: z.array(z.object({
      value_type: z.string(),
      description: z.string(),
      delivery_method: z.string(),
    })),
    touchpoint_plan: z.array(z.object({
      touchpoint: z.string(),
      frequency: z.string(),
      format: z.string(),
      owner: z.string(),
    })),
    success_metrics: z.array(z.object({
      metric: z.string(),
      baseline: z.string(),
      target: z.string(),
    })),
  })),
  network_development: z.object({
    expansion_targets: z.array(z.object({
      category: z.string(),
      target_count: z.number(),
      approach: z.string(),
    })),
    referral_strategy: z.array(z.string()),
    networking_events: z.array(z.object({
      event_type: z.string(),
      purpose: z.string(),
      target_attendees: z.array(z.string()),
    })),
  }),
  relationship_calendar: z.array(z.object({
    month: z.string(),
    activities: z.array(z.object({
      stakeholder: z.string(),
      activity: z.string(),
      objective: z.string(),
    })),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-020",
  taskName: "Relationship Building",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자와의 관계 구축 전략을 수립합니다.",
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

const TRUST_ACTIONS = {
  new: [
    { action: "소개 미팅", purpose: "상호 이해", timing: "즉시" },
    { action: "니즈 파악 인터뷰", purpose: "기대 이해", timing: "2주 내" },
    { action: "신속한 약속 이행", purpose: "신뢰 구축", timing: "지속" },
  ],
  developing: [
    { action: "정기 체크인", purpose: "관계 유지", timing: "격주" },
    { action: "가치 제공", purpose: "상호 이익", timing: "월별" },
    { action: "피드백 반영", purpose: "존중 표현", timing: "즉시" },
  ],
  established: [
    { action: "전략적 협의", purpose: "깊은 파트너십", timing: "월별" },
    { action: "공동 기회 탐색", purpose: "관계 확장", timing: "분기별" },
  ],
  strong: [
    { action: "전략 파트너 미팅", purpose: "장기 협력", timing: "분기별" },
    { action: "상호 추천/소개", purpose: "네트워크 확장", timing: "기회 발생시" },
  ],
  strained: [
    { action: "문제 해결 대화", purpose: "관계 복원", timing: "즉시" },
    { action: "신뢰 회복 액션", purpose: "재건", timing: "2주 내" },
    { action: "외부 중재", purpose: "객관적 해결", timing: "필요시" },
  ],
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const targetStatus = (current: string): string => {
    const progression: Record<string, string> = {
      new: "developing",
      developing: "established",
      established: "strong",
      strong: "strong",
      strained: "developing",
    };
    return progression[current] || "developing";
  };

  const strategies = validated.stakeholders.map(s => {
    const actions = TRUST_ACTIONS[s.current_relationship] || TRUST_ACTIONS.new;

    return {
      stakeholder_id: s.id,
      name: s.name,
      current_status: s.current_relationship,
      target_status: targetStatus(s.current_relationship),
      trust_building_actions: actions.map(a => ({
        action: a.action,
        purpose: a.purpose,
        timing: a.timing,
        expected_outcome: `${s.name}과의 관계 향상`,
      })),
      value_delivery: [
        {
          value_type: "정보 공유",
          description: "관련 업계 인사이트 및 트렌드 공유",
          delivery_method: "이메일/미팅",
        },
        {
          value_type: "네트워크 연결",
          description: "유용한 연락처 소개",
          delivery_method: "직접 소개",
        },
        {
          value_type: "인정과 감사",
          description: "기여에 대한 공식적 인정",
          delivery_method: "공개 감사/표창",
        },
      ],
      touchpoint_plan: [
        {
          touchpoint: "정기 미팅",
          frequency: s.strategic_value === "critical" ? "주 1회" : "월 1회",
          format: "대면/화상",
          owner: "프로젝트 매니저",
        },
        {
          touchpoint: "이메일 업데이트",
          frequency: "격주",
          format: "뉴스레터",
          owner: "커뮤니케이션 담당",
        },
      ],
      success_metrics: [
        { metric: "응답률", baseline: "60%", target: "90%" },
        { metric: "만족도", baseline: "3.5/5", target: "4.5/5" },
        { metric: "협력 의향", baseline: "보통", target: "매우 높음" },
      ],
    };
  });

  const months = ["1월", "2월", "3월"];
  const calendar = months.map((month, idx) => ({
    month,
    activities: validated.stakeholders.slice(0, 3).map(s => ({
      stakeholder: s.name,
      activity: idx === 0 ? "관계 시작/강화 미팅" : idx === 1 ? "가치 제공 활동" : "피드백 및 조정",
      objective: `${s.name}과의 관계 ${targetStatus(s.current_relationship)} 단계로 발전`,
    })),
  }));

  return {
    building_plan_id: generateUUID(),
    event_id: validated.event_id,
    relationship_strategies: strategies,
    network_development: {
      expansion_targets: [
        { category: "업계 리더", target_count: 5, approach: "소개를 통한 연결" },
        { category: "잠재 스폰서", target_count: 10, approach: "이벤트 초대 및 네트워킹" },
        { category: "미디어 관계자", target_count: 3, approach: "독점 정보 제공" },
      ],
      referral_strategy: [
        "기존 이해관계자에게 추천 요청",
        "상호 이익이 되는 소개 프로그램 운영",
        "성공 사례 공유를 통한 자연스러운 확산",
      ],
      networking_events: [
        { event_type: "VIP 디너", purpose: "핵심 이해관계자 관계 심화", target_attendees: ["Tier 1 이해관계자"] },
        { event_type: "업계 밋업", purpose: "네트워크 확장", target_attendees: ["잠재 파트너", "업계 관계자"] },
      ],
    },
    relationship_calendar: calendar,
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
