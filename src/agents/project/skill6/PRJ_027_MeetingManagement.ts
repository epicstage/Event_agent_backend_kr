/**
 * PRJ-027: 회의 관리
 * CMP-IS Reference: 6.2.c - Managing meetings
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Meeting Management Agent for event projects.
CMP-IS Standard: 6.2.c - Managing meetings`;

export const InputSchema = z.object({
  event_id: z.string(),
  meeting_type: z.enum(["kickoff", "status", "review", "planning", "retrospective", "ad_hoc"]),
  meeting_details: z.object({
    title: z.string(),
    date: z.string(),
    duration_minutes: z.number(),
    attendees: z.array(z.object({
      name: z.string(),
      role: z.string(),
      required: z.boolean().default(true),
    })),
    objectives: z.array(z.string()),
  }),
  previous_action_items: z.array(z.object({
    item: z.string(),
    owner: z.string(),
    status: z.enum(["completed", "in_progress", "pending", "blocked"]),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  meeting_id: z.string(),
  event_id: z.string(),
  meeting_plan: z.object({
    title: z.string(),
    type: z.string(),
    date: z.string(),
    duration: z.string(),
    location: z.string(),
  }),
  agenda: z.array(z.object({
    item_number: z.number(),
    topic: z.string(),
    presenter: z.string(),
    duration_minutes: z.number(),
    expected_outcome: z.string(),
  })),
  preparation_checklist: z.array(z.object({
    task: z.string(),
    responsible: z.string(),
    deadline: z.string(),
  })),
  attendee_list: z.array(z.object({
    name: z.string(),
    role: z.string(),
    attendance: z.enum(["required", "optional"]),
    preparation: z.string(),
  })),
  action_item_review: z.array(z.object({
    item: z.string(),
    owner: z.string(),
    status: z.string(),
    follow_up: z.string(),
  })),
  meeting_rules: z.array(z.string()),
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

const meetingAgendaTemplates: Record<string, { topic: string; duration: number }[]> = {
  kickoff: [
    { topic: "프로젝트 개요 및 목표", duration: 15 },
    { topic: "팀 소개 및 역할 정의", duration: 10 },
    { topic: "마일스톤 및 일정 공유", duration: 15 },
    { topic: "커뮤니케이션 계획", duration: 10 },
    { topic: "Q&A 및 논의", duration: 10 },
  ],
  status: [
    { topic: "지난 주 진행 사항", duration: 10 },
    { topic: "금주 계획", duration: 10 },
    { topic: "이슈 및 리스크 공유", duration: 10 },
    { topic: "액션 아이템 확인", duration: 10 },
  ],
  review: [
    { topic: "결과물 검토", duration: 20 },
    { topic: "피드백 수집", duration: 15 },
    { topic: "개선 사항 논의", duration: 10 },
    { topic: "다음 단계 합의", duration: 10 },
  ],
  planning: [
    { topic: "목표 설정", duration: 15 },
    { topic: "태스크 브레이크다운", duration: 20 },
    { topic: "일정 및 담당자 배정", duration: 15 },
    { topic: "리스크 식별", duration: 10 },
  ],
  retrospective: [
    { topic: "잘된 점 (Keep)", duration: 15 },
    { topic: "개선할 점 (Problem)", duration: 15 },
    { topic: "시도할 점 (Try)", duration: 15 },
    { topic: "액션 아이템 도출", duration: 10 },
  ],
  ad_hoc: [
    { topic: "긴급 안건 논의", duration: 20 },
    { topic: "의사결정", duration: 15 },
    { topic: "액션 아이템", duration: 10 },
  ],
};

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { meeting_type, meeting_details, previous_action_items } = validatedInput;

  const template = meetingAgendaTemplates[meeting_type];
  const agenda = template.map((item, idx) => ({
    item_number: idx + 1,
    topic: item.topic,
    presenter: meeting_details.attendees[idx % meeting_details.attendees.length]?.name || "TBD",
    duration_minutes: item.duration,
    expected_outcome: `${item.topic} 관련 합의/공유`,
  }));

  const attendeeList = meeting_details.attendees.map(att => ({
    name: att.name,
    role: att.role,
    attendance: att.required ? "required" as const : "optional" as const,
    preparation: "관련 자료 사전 검토",
  }));

  const actionItemReview = (previous_action_items || []).map(item => ({
    item: item.item,
    owner: item.owner,
    status: item.status,
    follow_up: item.status === "completed" ? "완료 확인"
      : item.status === "blocked" ? "장애 요인 논의"
      : "진행 상황 공유",
  }));

  return {
    meeting_id: generateUUID(),
    event_id: validatedInput.event_id,
    meeting_plan: {
      title: meeting_details.title,
      type: meeting_type,
      date: meeting_details.date,
      duration: `${meeting_details.duration_minutes}분`,
      location: "회의실 또는 화상 회의",
    },
    agenda,
    preparation_checklist: [
      { task: "아젠다 배포", responsible: "PM", deadline: "회의 1일 전" },
      { task: "자료 준비", responsible: "발표자", deadline: "회의 2시간 전" },
      { task: "회의실/화상회의 링크 확인", responsible: "PM", deadline: "회의 30분 전" },
    ],
    attendee_list: attendeeList,
    action_item_review: actionItemReview,
    meeting_rules: [
      "정시 시작, 정시 종료",
      "한 번에 한 사람만 발언",
      "논의는 아젠다 중심으로",
      "액션 아이템은 명확한 담당자와 기한 지정",
      "회의록은 24시간 내 공유",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-027",
  taskName: "회의 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.2.c",
  skill: "Skill 6: Manage Project",
  subSkill: "6.2: Coordinate Project Team",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
