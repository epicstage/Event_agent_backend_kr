/**
 * PRO-019: 멘토십 프로그램
 * CMP-IS Reference: 20.9.a - Mentorship program management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Mentorship Program Coordinator for event professionals.`;

export const InputSchema = z.object({
  event_id: z.string(),
  program_scope: z.enum(["internal", "industry", "cross_functional"]).optional(),
  participant_type: z.enum(["mentor", "mentee", "both"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  program_report_id: z.string(),
  event_id: z.string(),
  program_overview: z.object({
    program_name: z.string(),
    program_type: z.string(),
    active_pairs: z.number(),
    total_mentors: z.number(),
    total_mentees: z.number(),
    avg_program_duration_months: z.number(),
    completion_rate: z.number(),
  }),
  active_pairings: z.array(z.object({
    pairing_id: z.string(),
    mentor: z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      expertise: z.array(z.string()),
    }),
    mentee: z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      goals: z.array(z.string()),
    }),
    start_date: z.string(),
    target_end_date: z.string(),
    status: z.enum(["active", "completed", "on_hold", "early_termination"]),
    meetings_held: z.number(),
    next_meeting: z.string(),
    progress_rating: z.number(),
  })),
  program_metrics: z.object({
    satisfaction_mentor: z.number(),
    satisfaction_mentee: z.number(),
    goal_achievement_rate: z.number(),
    retention_improvement: z.number(),
    promotion_rate_mentees: z.number(),
  }),
  success_stories: z.array(z.object({
    mentee_name: z.string(),
    mentor_name: z.string(),
    achievement: z.string(),
    impact: z.string(),
    testimonial: z.string(),
  })),
  available_mentors: z.array(z.object({
    mentor_id: z.string(),
    name: z.string(),
    role: z.string(),
    expertise: z.array(z.string()),
    capacity: z.number(),
    current_mentees: z.number(),
    availability: z.enum(["available", "limited", "full"]),
  })),
  mentee_waitlist: z.array(z.object({
    mentee_id: z.string(),
    name: z.string(),
    role: z.string(),
    requested_expertise: z.array(z.string()),
    wait_time_days: z.number(),
  })),
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
    program_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    program_overview: {
      program_name: "이벤트 프로페셔널 멘토십",
      program_type: "내부 + 산업 협회 연계",
      active_pairs: 12,
      total_mentors: 8,
      total_mentees: 15,
      avg_program_duration_months: 9,
      completion_rate: 78,
    },
    active_pairings: [
      {
        pairing_id: "PAIR-001",
        mentor: {
          id: "STF-001",
          name: "김민수",
          role: "이벤트 디렉터",
          expertise: ["전략 기획", "고객 관계", "팀 리더십"],
        },
        mentee: {
          id: "STF-002",
          name: "이영희",
          role: "시니어 PM",
          goals: ["디렉터 승진 준비", "전략적 사고 개발", "리더십 역량 강화"],
        },
        start_date: "2024-09-01",
        target_end_date: "2025-06-30",
        status: "active",
        meetings_held: 8,
        next_meeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress_rating: 85,
      },
      {
        pairing_id: "PAIR-002",
        mentor: {
          id: "STF-005",
          name: "정수진",
          role: "마케팅 팀장",
          expertise: ["이벤트 마케팅", "디지털 전략", "브랜딩"],
        },
        mentee: {
          id: "STF-008",
          name: "박지은",
          role: "주니어 마케터",
          goals: ["마케팅 전략 이해", "캠페인 기획 역량", "데이터 분석"],
        },
        start_date: "2024-11-01",
        target_end_date: "2025-08-31",
        status: "active",
        meetings_held: 4,
        next_meeting: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        progress_rating: 72,
      },
      {
        pairing_id: "PAIR-003",
        mentor: {
          id: "EXT-001",
          name: "외부 멘토 (CMP 협회)",
          role: "협회 이사",
          expertise: ["CMP 시험 준비", "커리어 전환", "네트워킹"],
        },
        mentee: {
          id: "STF-010",
          name: "최준혁",
          role: "코디네이터",
          goals: ["CMP 취득", "PM 역할 전환", "업계 네트워크 확대"],
        },
        start_date: "2025-01-01",
        target_end_date: "2025-12-31",
        status: "active",
        meetings_held: 1,
        next_meeting: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        progress_rating: 60,
      },
    ],
    program_metrics: {
      satisfaction_mentor: 88,
      satisfaction_mentee: 92,
      goal_achievement_rate: 75,
      retention_improvement: 25,
      promotion_rate_mentees: 40,
    },
    success_stories: [
      {
        mentee_name: "강서윤",
        mentor_name: "김민수",
        achievement: "1년 내 시니어 PM 승진",
        impact: "대형 클라이언트 2건 독립 수주",
        testimonial: "멘토님의 전략적 사고 방식을 배운 것이 가장 큰 도움이 됐습니다.",
      },
      {
        mentee_name: "오현우",
        mentor_name: "정수진",
        achievement: "CMP 자격 취득",
        impact: "회사 내 CMP 홀더 비율 향상",
        testimonial: "시험 준비 방향과 실무 연계 팁이 합격에 결정적이었습니다.",
      },
    ],
    available_mentors: [
      {
        mentor_id: "STF-003",
        name: "박준호",
        role: "운영 팀장",
        expertise: ["현장 운영", "벤더 관리", "위기 대응"],
        capacity: 2,
        current_mentees: 1,
        availability: "available",
      },
      {
        mentor_id: "STF-006",
        name: "한지민",
        role: "시니어 디자이너",
        expertise: ["이벤트 디자인", "브랜딩", "공간 연출"],
        capacity: 2,
        current_mentees: 2,
        availability: "full",
      },
    ],
    mentee_waitlist: [
      {
        mentee_id: "STF-012",
        name: "김도현",
        role: "주니어 코디네이터",
        requested_expertise: ["현장 운영", "벤더 관리"],
        wait_time_days: 14,
      },
      {
        mentee_id: "STF-015",
        name: "이서연",
        role: "인턴",
        requested_expertise: ["이벤트 기획", "커리어 개발"],
        wait_time_days: 30,
      },
    ],
    recommendations: [
      "김도현 - 박준호 매칭 진행 (현장 운영 전문성 일치)",
      "외부 멘토 풀 확대 (디자인 분야 추가 필요)",
      "분기별 멘토-멘티 네트워킹 이벤트 개최",
      "멘토링 성과 연동 인센티브 제도 도입 검토",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-019",
  taskName: "멘토십 프로그램",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.9.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.9: Mentorship",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
