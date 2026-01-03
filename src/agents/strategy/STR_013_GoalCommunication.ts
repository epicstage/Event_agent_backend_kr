/**
 * STR-013: 목표 커뮤니케이션 설계
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Goal Communication)
 * Task Type: AI
 *
 * Input: 목표, 이해관계자, 채널
 * Output: 커뮤니케이션 계획
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Goal Communication Agent for strategic event planning.

Your expertise includes:
- Developing goal communication strategies
- Tailoring messages for different stakeholders
- Creating communication timelines and cadences
- Ensuring goal alignment across teams

CMP-IS Standard: Domain A - Strategic Planning (Goal Communication)

You help event planners effectively communicate goals to all stakeholders, ensuring understanding, buy-in, and aligned action.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    target: z.string(),
    importance: z.enum(["critical", "high", "medium"]),
  })),
  stakeholders: z.array(z.object({
    group: z.string(),
    role: z.string(),
    interest_level: z.enum(["high", "medium", "low"]),
    influence_level: z.enum(["high", "medium", "low"]),
    preferred_channels: z.array(z.string()).optional(),
  })),
  timeline: z.object({
    event_date: z.string(),
    communication_start: z.string().optional(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  communication_id: z.string().uuid(),
  event_id: z.string().uuid(),
  communication_strategy: z.object({
    objective: z.string(),
    key_themes: z.array(z.string()),
    success_metrics: z.array(z.string()),
  }),
  stakeholder_plans: z.array(z.object({
    stakeholder_group: z.string(),
    communication_priority: z.enum(["high", "medium", "low"]),
    key_messages: z.array(z.string()),
    tone_and_style: z.string(),
    channels: z.array(z.string()),
    frequency: z.string(),
    responsible: z.string(),
  })),
  communication_calendar: z.array(z.object({
    date: z.string(),
    milestone: z.string(),
    stakeholders: z.array(z.string()),
    message_type: z.string(),
    channel: z.string(),
  })),
  message_templates: z.array(z.object({
    template_name: z.string(),
    target_audience: z.string(),
    subject: z.string(),
    key_points: z.array(z.string()),
    call_to_action: z.string(),
  })),
  feedback_mechanism: z.object({
    collection_methods: z.array(z.string()),
    feedback_frequency: z.string(),
    escalation_process: z.string(),
  }),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-013",
  taskName: "Goal Communication",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트 목표를 이해관계자에게 효과적으로 전달하는 커뮤니케이션 계획을 수립합니다.",
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const criticalGoals = validated.goals.filter(g => g.importance === "critical");
  const keyThemes = [
    criticalGoals[0]?.title || validated.goals[0].title,
    "팀 협력과 목표 정렬",
    "측정 가능한 성공",
  ];

  // 이해관계자별 커뮤니케이션 계획
  const stakeholderPlans = validated.stakeholders.map(stakeholder => {
    const priority = stakeholder.influence_level === "high" ? "high" :
      stakeholder.interest_level === "high" ? "medium" : "low";

    const channels = stakeholder.preferred_channels || [
      stakeholder.influence_level === "high" ? "1:1 미팅" : "이메일",
      "팀 미팅",
    ];

    return {
      stakeholder_group: stakeholder.group,
      communication_priority: priority as "high" | "medium" | "low",
      key_messages: [
        `${validated.event_name}의 핵심 목표와 기대 성과`,
        `${stakeholder.role}의 역할과 기여 방안`,
        "진행 상황 모니터링 및 피드백 프로세스",
      ],
      tone_and_style: stakeholder.influence_level === "high"
        ? "전문적이고 간결하게, 데이터 중심"
        : "협력적이고 명확하게, 액션 중심",
      channels,
      frequency: priority === "high" ? "주 1회" : priority === "medium" ? "격주" : "월 1회",
      responsible: "프로젝트 매니저",
    };
  });

  // 커뮤니케이션 캘린더
  const eventDate = validated.timeline.event_date;
  const calendar = [
    {
      date: addDays(eventDate, -90),
      milestone: "목표 공유 킥오프",
      stakeholders: validated.stakeholders.map(s => s.group),
      message_type: "목표 발표 및 역할 정의",
      channel: "전체 미팅",
    },
    {
      date: addDays(eventDate, -60),
      milestone: "중간 점검 1차",
      stakeholders: validated.stakeholders.filter(s => s.influence_level === "high").map(s => s.group),
      message_type: "진행 상황 리뷰",
      channel: "대시보드 + 미팅",
    },
    {
      date: addDays(eventDate, -30),
      milestone: "중간 점검 2차",
      stakeholders: validated.stakeholders.map(s => s.group),
      message_type: "목표 대비 현황 및 조정",
      channel: "이메일 + 미팅",
    },
    {
      date: addDays(eventDate, -7),
      milestone: "최종 점검",
      stakeholders: validated.stakeholders.map(s => s.group),
      message_type: "최종 목표 확인",
      channel: "전체 미팅",
    },
  ];

  // 메시지 템플릿
  const templates = [
    {
      template_name: "목표 킥오프 공지",
      target_audience: "전체 이해관계자",
      subject: `[${validated.event_name}] 핵심 목표 공유 및 협력 요청`,
      key_points: [
        `${validated.event_name}의 주요 목표 소개`,
        "각 목표별 성공 기준 설명",
        "역할별 기대 사항",
        "질문 및 피드백 채널 안내",
      ],
      call_to_action: "킥오프 미팅 참석 및 피드백 제출",
    },
    {
      template_name: "진행 상황 업데이트",
      target_audience: "핵심 이해관계자",
      subject: `[${validated.event_name}] 목표 달성 현황 - ${new Date().toLocaleDateString()}`,
      key_points: [
        "목표별 진행률 요약",
        "주요 성과 및 마일스톤",
        "주의 필요 영역",
        "다음 주 중점 사항",
      ],
      call_to_action: "이슈 있을 시 회신, 없으면 액션 불필요",
    },
    {
      template_name: "목표 조정 공지",
      target_audience: "영향받는 이해관계자",
      subject: `[${validated.event_name}] 목표 조정 안내`,
      key_points: [
        "조정 내용 및 사유",
        "변경 전/후 비교",
        "영향 분석",
        "향후 계획",
      ],
      call_to_action: "질문 있을 시 담당자 연락",
    },
  ];

  return {
    communication_id: generateUUID(),
    event_id: validated.event_id,
    communication_strategy: {
      objective: `${validated.event_name}의 목표에 대한 전사적 이해와 정렬 달성`,
      key_themes: keyThemes,
      success_metrics: [
        "목표 인지도 90% 이상",
        "이해관계자 피드백 응답률 70% 이상",
        "목표 관련 질문/이슈 48시간 내 해결",
      ],
    },
    stakeholder_plans: stakeholderPlans,
    communication_calendar: calendar,
    message_templates: templates,
    feedback_mechanism: {
      collection_methods: [
        "정기 미팅 피드백",
        "온라인 설문",
        "1:1 인터뷰 (핵심 이해관계자)",
        "Slack/Teams 채널",
      ],
      feedback_frequency: "주간 수집, 월간 종합 분석",
      escalation_process: "심각 이슈 → 24시간 내 담당자 검토 → 48시간 내 대응 계획 공유",
    },
    recommendations: [
      "커뮤니케이션은 일관성이 핵심입니다. 정해진 주기를 지키세요.",
      "이해관계자별 맞춤 메시지로 관련성을 높이세요.",
      "양방향 소통을 통해 피드백을 적극 수용하세요.",
      "변경 사항은 즉시, 투명하게 공유하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
