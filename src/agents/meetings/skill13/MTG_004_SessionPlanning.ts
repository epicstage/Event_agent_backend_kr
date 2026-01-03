/**
 * MTG-004: Session Planning & Scheduling
 *
 * CMP-IS Domain G: Meetings & Contents - Skill 13: Program Design
 * 개별 세션 기획 및 시간표 최적화
 */

import { z } from "zod";

export const MTG_004_InputSchema = z.object({
  event_id: z.string().uuid(),
  session_type: z.enum(["keynote", "plenary", "breakout", "workshop", "panel", "roundtable", "poster", "networking"]),
  title: z.string(),
  description: z.string().optional(),
  track_id: z.string().optional(),
  duration_minutes: z.number().min(15).max(480),
  expected_attendees: z.number().min(1),
  speakers: z.array(z.object({
    speaker_id: z.string(),
    name: z.string(),
    role: z.enum(["presenter", "co_presenter", "moderator", "panelist"]),
  })).optional(),
  av_requirements: z.array(z.string()).optional(),
  preferred_time: z.enum(["morning", "afternoon", "any"]).default("any"),
});

export const MTG_004_OutputSchema = z.object({
  event_id: z.string(),
  session_plan: z.object({
    session_id: z.string(),
    title: z.string(),
    session_type: z.string(),
    duration_minutes: z.number(),
    agenda: z.array(z.object({
      segment: z.string(),
      duration_minutes: z.number(),
      responsible: z.string(),
      notes: z.string(),
    })),
    room_requirements: z.object({
      capacity: z.number(),
      layout: z.enum(["theater", "classroom", "roundtable", "u_shape", "cabaret", "hollow_square"]),
      av_setup: z.array(z.string()),
    }),
    timing: z.object({
      recommended_slot: z.string(),
      setup_time_minutes: z.number(),
      teardown_time_minutes: z.number(),
      buffer_after_minutes: z.number(),
    }),
    materials: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      responsible: z.string(),
    })),
  }),
  speaker_briefing: z.object({
    arrival_time: z.string(),
    tech_check_duration: z.number(),
    key_points: z.array(z.string()),
  }),
  contingency: z.object({
    if_speaker_late: z.string(),
    if_technical_issue: z.string(),
    if_low_attendance: z.string(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_004_Input = z.infer<typeof MTG_004_InputSchema>;
export type MTG_004_Output = z.infer<typeof MTG_004_OutputSchema>;

const LAYOUT_BY_TYPE: Record<string, "theater" | "classroom" | "roundtable" | "u_shape" | "cabaret" | "hollow_square"> = {
  keynote: "theater",
  plenary: "theater",
  breakout: "classroom",
  workshop: "cabaret",
  panel: "theater",
  roundtable: "roundtable",
  poster: "theater",
  networking: "cabaret",
};

export async function execute(input: MTG_004_Input): Promise<MTG_004_Output> {
  const { session_type, duration_minutes, expected_attendees, speakers = [] } = input;
  const sessionId = `SES-${Date.now().toString(36).toUpperCase()}`;

  // Build session agenda
  const agenda = [];
  let remainingTime = duration_minutes;

  if (session_type === "keynote" || session_type === "plenary") {
    agenda.push({ segment: "Introduction", duration_minutes: 5, responsible: "MC/Moderator", notes: "연사 소개" });
    agenda.push({ segment: "Presentation", duration_minutes: Math.round(remainingTime * 0.7), responsible: speakers[0]?.name || "Speaker", notes: "메인 발표" });
    agenda.push({ segment: "Q&A", duration_minutes: Math.round(remainingTime * 0.2), responsible: "Moderator", notes: "청중 질문" });
    agenda.push({ segment: "Closing", duration_minutes: 5, responsible: "MC", notes: "마무리 및 다음 세션 안내" });
  } else if (session_type === "panel") {
    agenda.push({ segment: "Introduction", duration_minutes: 5, responsible: "Moderator", notes: "패널 소개" });
    agenda.push({ segment: "Opening Statements", duration_minutes: Math.round(remainingTime * 0.25), responsible: "Panelists", notes: "각 패널리스트 오프닝" });
    agenda.push({ segment: "Moderated Discussion", duration_minutes: Math.round(remainingTime * 0.4), responsible: "Moderator", notes: "주제별 토론" });
    agenda.push({ segment: "Audience Q&A", duration_minutes: Math.round(remainingTime * 0.25), responsible: "Moderator", notes: "청중 질문" });
    agenda.push({ segment: "Closing", duration_minutes: 5, responsible: "Moderator", notes: "요약 및 마무리" });
  } else if (session_type === "workshop") {
    agenda.push({ segment: "Introduction & Objectives", duration_minutes: 10, responsible: "Facilitator", notes: "목표 설명" });
    agenda.push({ segment: "Concept Overview", duration_minutes: Math.round(remainingTime * 0.2), responsible: "Facilitator", notes: "개념 설명" });
    agenda.push({ segment: "Hands-on Exercise", duration_minutes: Math.round(remainingTime * 0.5), responsible: "Participants", notes: "실습 진행" });
    agenda.push({ segment: "Debrief & Discussion", duration_minutes: Math.round(remainingTime * 0.2), responsible: "Facilitator", notes: "결과 공유" });
    agenda.push({ segment: "Wrap-up", duration_minutes: 10, responsible: "Facilitator", notes: "정리 및 Q&A" });
  } else {
    agenda.push({ segment: "Opening", duration_minutes: 5, responsible: "Host", notes: "시작" });
    agenda.push({ segment: "Main Content", duration_minutes: Math.round(remainingTime * 0.8), responsible: speakers[0]?.name || "Presenter", notes: "주요 내용" });
    agenda.push({ segment: "Closing", duration_minutes: Math.round(remainingTime * 0.1), responsible: "Host", notes: "마무리" });
  }

  const layout = LAYOUT_BY_TYPE[session_type] || "classroom";

  return {
    event_id: input.event_id,
    session_plan: {
      session_id: sessionId,
      title: input.title,
      session_type,
      duration_minutes,
      agenda,
      room_requirements: {
        capacity: Math.ceil(expected_attendees * 1.2),
        layout,
        av_setup: input.av_requirements || ["projector", "wireless_mic", "lectern"],
      },
      timing: {
        recommended_slot: input.preferred_time === "morning" ? "09:00-12:00" : input.preferred_time === "afternoon" ? "14:00-17:00" : "유동적",
        setup_time_minutes: session_type === "workshop" ? 30 : 15,
        teardown_time_minutes: 10,
        buffer_after_minutes: session_type === "keynote" ? 15 : 10,
      },
      materials: [
        { item: "Name badges", quantity: expected_attendees, responsible: "Registration Team" },
        { item: "Handouts", quantity: Math.ceil(expected_attendees * 1.1), responsible: "Content Team" },
        { item: "Evaluation forms", quantity: expected_attendees, responsible: "Event Team" },
      ],
    },
    speaker_briefing: {
      arrival_time: "세션 시작 30분 전",
      tech_check_duration: 15,
      key_points: [
        "발표 자료 USB 및 클라우드 백업 준비",
        "시간 엄수 (종료 5분 전 신호)",
        "Q&A 시 마이크 사용 안내",
        "평가 설문 참여 독려",
      ],
    },
    contingency: {
      if_speaker_late: "15분 대기 후 순서 변경 또는 패널 토론으로 대체",
      if_technical_issue: "백업 노트북 준비, 필요시 화이트보드 활용",
      if_low_attendance: "좌석 재배치하여 밀집도 높임, 참여형 진행으로 전환",
    },
    recommendations: [
      "리허설 진행으로 타이밍 검증",
      session_type === "workshop" ? "보조 진행자 1명 추가 배치" : "사회자 큐시트 사전 공유",
      "비디오 녹화 시 동의서 사전 수집",
      "SNS 해시태그 및 실시간 질문 도구 준비",
    ],
  };
}

export const MTG_004_SessionPlanning = {
  id: "MTG-004",
  name: "Session Planning & Scheduling",
  description: "개별 세션 기획 및 시간표 최적화",
  inputSchema: MTG_004_InputSchema,
  outputSchema: MTG_004_OutputSchema,
  execute,
  tags: ["session", "planning", "scheduling", "agenda"],
  domain: "meetings",
  skill: 13,
  taskType: "AI" as const,
};
