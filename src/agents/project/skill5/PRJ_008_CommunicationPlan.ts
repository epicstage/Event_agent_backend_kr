/**
 * PRJ-008: 커뮤니케이션 계획 수립
 *
 * CMP-IS Reference: 5.1.f - Developing communication plan
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Communication Planning Agent for event project management.

Your expertise includes:
- Designing stakeholder communication strategies
- Defining communication channels and frequency
- Creating reporting templates and escalation paths
- Ensuring timely information flow across teams

CMP-IS Standard: 5.1.f - Developing communication plan`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  stakeholders: z.array(z.object({
    name: z.string(),
    role: z.string(),
    influence_level: z.enum(["high", "medium", "low"]).default("medium"),
    interest_level: z.enum(["high", "medium", "low"]).default("medium"),
    preferred_channel: z.enum(["email", "phone", "meeting", "slack", "report"]).optional(),
  })).optional(),
  project_phases: z.array(z.string()).optional(),
  team_size: z.number().int().min(1).default(5),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  stakeholder_matrix: z.array(z.object({
    stakeholder_name: z.string(),
    stakeholder_role: z.string(),
    communication_strategy: z.enum(["manage_closely", "keep_satisfied", "keep_informed", "monitor"]),
    channels: z.array(z.string()),
    frequency: z.string(),
    content_type: z.array(z.string()),
    responsible: z.string(),
  })),
  communication_channels: z.array(z.object({
    channel_name: z.string(),
    purpose: z.string(),
    audience: z.array(z.string()),
    frequency: z.string(),
    owner: z.string(),
  })),
  meeting_schedule: z.array(z.object({
    meeting_type: z.string(),
    purpose: z.string(),
    frequency: z.string(),
    duration_minutes: z.number(),
    participants: z.array(z.string()),
    agenda_template: z.array(z.string()),
  })),
  escalation_path: z.object({
    levels: z.array(z.object({
      level: z.number(),
      threshold: z.string(),
      escalate_to: z.string(),
      response_time: z.string(),
    })),
  }),
  reporting_schedule: z.array(z.object({
    report_type: z.string(),
    frequency: z.string(),
    audience: z.array(z.string()),
    contents: z.array(z.string()),
    due_day: z.string(),
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

  // 기본 이해관계자 템플릿
  const defaultStakeholders = [
    { name: "이벤트 오너", role: "Event Owner", influence_level: "high" as const, interest_level: "high" as const },
    { name: "스폰서 담당", role: "Sponsor", influence_level: "high" as const, interest_level: "medium" as const },
    { name: "마케팅팀", role: "Marketing", influence_level: "medium" as const, interest_level: "high" as const },
    { name: "운영팀", role: "Operations", influence_level: "medium" as const, interest_level: "high" as const },
    { name: "재무팀", role: "Finance", influence_level: "medium" as const, interest_level: "medium" as const },
  ];

  const stakeholders = validatedInput.stakeholders?.length ? validatedInput.stakeholders : defaultStakeholders;

  // 이해관계자 매트릭스
  const stakeholderMatrix: Output["stakeholder_matrix"] = stakeholders.map(sh => {
    let strategy: "manage_closely" | "keep_satisfied" | "keep_informed" | "monitor";
    let frequency: string;
    let channels: string[];
    let contentType: string[];

    if (sh.influence_level === "high" && sh.interest_level === "high") {
      strategy = "manage_closely";
      frequency = "매일";
      channels = ["meeting", "email", "phone"];
      contentType = ["상세 진행상황", "의사결정 사항", "리스크 알림"];
    } else if (sh.influence_level === "high" && sh.interest_level !== "high") {
      strategy = "keep_satisfied";
      frequency = "주간";
      channels = ["email", "report"];
      contentType = ["주간 요약", "주요 마일스톤", "예산 현황"];
    } else if (sh.influence_level !== "high" && sh.interest_level === "high") {
      strategy = "keep_informed";
      frequency = "주 2회";
      channels = ["email", "slack"];
      contentType = ["업무 업데이트", "일정 변경", "협조 요청"];
    } else {
      strategy = "monitor";
      frequency = "월간";
      channels = ["email"];
      contentType = ["월간 뉴스레터", "주요 변경사항"];
    }

    return {
      stakeholder_name: sh.name,
      stakeholder_role: sh.role,
      communication_strategy: strategy,
      channels,
      frequency,
      content_type: contentType,
      responsible: "PM",
    };
  });

  // 커뮤니케이션 채널
  const communicationChannels: Output["communication_channels"] = [
    {
      channel_name: "Slack #event-project",
      purpose: "실시간 팀 커뮤니케이션",
      audience: ["전체 프로젝트 팀"],
      frequency: "실시간",
      owner: "PM",
    },
    {
      channel_name: "이메일",
      purpose: "공식 커뮤니케이션 및 기록",
      audience: ["이해관계자", "벤더"],
      frequency: "필요시",
      owner: "각 담당자",
    },
    {
      channel_name: "주간 보고서",
      purpose: "진행상황 정기 보고",
      audience: ["경영진", "스폰서"],
      frequency: "매주 금요일",
      owner: "PM",
    },
    {
      channel_name: "공유 드라이브",
      purpose: "문서 중앙 저장소",
      audience: ["프로젝트 팀"],
      frequency: "상시",
      owner: "PM",
    },
  ];

  // 회의 일정
  const meetingSchedule: Output["meeting_schedule"] = [
    {
      meeting_type: "일일 스탠드업",
      purpose: "당일 업무 공유 및 블로커 해결",
      frequency: "매일 오전 9:30",
      duration_minutes: 15,
      participants: ["PM", "팀 리드"],
      agenda_template: ["어제 완료 사항", "오늘 계획", "블로커/이슈"],
    },
    {
      meeting_type: "주간 프로젝트 회의",
      purpose: "주간 진행상황 리뷰 및 다음 주 계획",
      frequency: "매주 월요일 10:00",
      duration_minutes: 60,
      participants: ["전체 프로젝트 팀"],
      agenda_template: ["주간 진행 현황", "마일스톤 점검", "리스크 리뷰", "다음 주 계획"],
    },
    {
      meeting_type: "이해관계자 업데이트",
      purpose: "주요 이해관계자에게 프로젝트 상태 공유",
      frequency: "격주 수요일 14:00",
      duration_minutes: 30,
      participants: ["PM", "이벤트 오너", "주요 스폰서"],
      agenda_template: ["프로젝트 하이라이트", "예산 현황", "일정 현황", "주요 의사결정 사항"],
    },
    {
      meeting_type: "벤더 협력 회의",
      purpose: "벤더 조율 및 진행상황 확인",
      frequency: "필요시",
      duration_minutes: 45,
      participants: ["PM", "조달 담당", "해당 벤더"],
      agenda_template: ["서비스 진행상황", "이슈 및 변경사항", "다음 단계"],
    },
  ];

  // 에스컬레이션 경로
  const escalationPath: Output["escalation_path"] = {
    levels: [
      {
        level: 1,
        threshold: "일반 이슈 (일정 1-2일 지연, 예산 5% 이내 변동)",
        escalate_to: "팀 리드",
        response_time: "4시간 이내",
      },
      {
        level: 2,
        threshold: "중요 이슈 (일정 3-5일 지연, 예산 10% 변동, 범위 변경)",
        escalate_to: "PM",
        response_time: "24시간 이내",
      },
      {
        level: 3,
        threshold: "심각 이슈 (주요 마일스톤 위험, 예산 20% 초과, 벤더 계약 문제)",
        escalate_to: "이벤트 오너",
        response_time: "4시간 이내",
      },
      {
        level: 4,
        threshold: "위기 상황 (이벤트 취소 위험, 법적 이슈, 안전 문제)",
        escalate_to: "경영진",
        response_time: "즉시",
      },
    ],
  };

  // 보고 일정
  const reportingSchedule: Output["reporting_schedule"] = [
    {
      report_type: "일일 진행 보고",
      frequency: "매일",
      audience: ["PM", "팀 리드"],
      contents: ["완료 태스크", "진행 중 태스크", "이슈 및 블로커"],
      due_day: "매일 오후 5시",
    },
    {
      report_type: "주간 상태 보고",
      frequency: "주간",
      audience: ["이벤트 오너", "주요 이해관계자"],
      contents: ["주간 요약", "마일스톤 현황", "예산 집행 현황", "다음 주 계획"],
      due_day: "매주 금요일 오후",
    },
    {
      report_type: "월간 종합 보고",
      frequency: "월간",
      audience: ["경영진", "스폰서"],
      contents: ["월간 성과", "예산 분석", "리스크 현황", "주요 의사결정"],
      due_day: "매월 말일",
    },
  ];

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    stakeholder_matrix: stakeholderMatrix,
    communication_channels: communicationChannels,
    meeting_schedule: meetingSchedule,
    escalation_path: escalationPath,
    reporting_schedule: reportingSchedule,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-008",
  taskName: "커뮤니케이션 계획 수립",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.f",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
