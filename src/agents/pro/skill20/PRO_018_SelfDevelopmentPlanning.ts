/**
 * PRO-018: 자기 개발 계획
 * CMP-IS Reference: 20.8.a - Self-development planning
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Professional Development Coach for event professionals.`;

export const InputSchema = z.object({
  event_id: z.string(),
  staff_id: z.string().optional(),
  planning_horizon: z.enum(["short_term", "annual", "long_term"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  development_plan_id: z.string(),
  event_id: z.string(),
  staff_profile: z.object({
    staff_id: z.string(),
    name: z.string(),
    current_role: z.string(),
    years_experience: z.number(),
    current_certifications: z.array(z.string()),
    key_strengths: z.array(z.string()),
    development_areas: z.array(z.string()),
  }),
  career_goals: z.object({
    short_term: z.object({
      goal: z.string(),
      timeline: z.string(),
      key_milestones: z.array(z.string()),
    }),
    medium_term: z.object({
      goal: z.string(),
      timeline: z.string(),
      key_milestones: z.array(z.string()),
    }),
    long_term: z.object({
      goal: z.string(),
      timeline: z.string(),
      key_milestones: z.array(z.string()),
    }),
  }),
  skill_assessment: z.array(z.object({
    skill_category: z.string(),
    current_level: z.number(),
    target_level: z.number(),
    gap: z.number(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    development_activities: z.array(z.string()),
  })),
  development_activities: z.array(z.object({
    activity: z.string(),
    type: z.enum(["training", "certification", "project", "mentorship", "networking", "self_study"]),
    target_skill: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    status: z.enum(["planned", "in_progress", "completed", "deferred"]),
    estimated_hours: z.number(),
    cost: z.number(),
    expected_outcome: z.string(),
  })),
  progress_tracking: z.object({
    overall_progress: z.number(),
    activities_completed: z.number(),
    activities_in_progress: z.number(),
    activities_planned: z.number(),
    skills_improved: z.number(),
    feedback_received: z.array(z.object({
      source: z.string(),
      date: z.string(),
      feedback: z.string(),
      action_taken: z.string(),
    })),
  }),
  resources_needed: z.object({
    budget_required: z.number(),
    time_required_hours: z.number(),
    manager_support: z.array(z.string()),
    tools_resources: z.array(z.string()),
  }),
  next_review_date: z.string(),
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
    development_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    staff_profile: {
      staff_id: validatedInput.staff_id || "STF-002",
      name: "이영희",
      current_role: "시니어 프로젝트 매니저",
      years_experience: 7,
      current_certifications: ["CMP"],
      key_strengths: ["프로젝트 관리", "고객 관계", "문제 해결", "팀 협업"],
      development_areas: ["전략적 사고", "재무 분석", "기술 활용", "리더십"],
    },
    career_goals: {
      short_term: {
        goal: "대규모 국제 컨퍼런스 단독 리드",
        timeline: "6개월",
        key_milestones: [
          "1,000인 규모 이벤트 성공적 관리",
          "멀티벤더 조율 역량 입증",
          "예산 10% 절감 달성",
        ],
      },
      medium_term: {
        goal: "이벤트 디렉터 승진",
        timeline: "2년",
        key_milestones: [
          "CSEP 또는 CEM 추가 취득",
          "팀 리더 경험 6개월 이상",
          "신규 비즈니스 유치 기여",
        ],
      },
      long_term: {
        goal: "이벤트 사업부 총괄",
        timeline: "5년",
        key_milestones: [
          "P&L 책임 경험",
          "팀 빌딩 및 성장 주도",
          "업계 thought leadership 확립",
        ],
      },
    },
    skill_assessment: [
      {
        skill_category: "전략적 기획",
        current_level: 6,
        target_level: 9,
        gap: 3,
        priority: "critical",
        development_activities: ["전략 기획 워크숍", "시니어 리더 섀도잉", "케이스 스터디"],
      },
      {
        skill_category: "재무 관리",
        current_level: 5,
        target_level: 8,
        gap: 3,
        priority: "high",
        development_activities: ["재무 분석 과정", "예산 관리 프로젝트 리드", "CFO 멘토링"],
      },
      {
        skill_category: "리더십",
        current_level: 6,
        target_level: 8,
        gap: 2,
        priority: "high",
        development_activities: ["리더십 교육", "주니어 멘토링", "크로스팀 프로젝트 리드"],
      },
      {
        skill_category: "이벤트 기술",
        current_level: 5,
        target_level: 7,
        gap: 2,
        priority: "medium",
        development_activities: ["이벤트 테크 컨퍼런스", "새 플랫폼 학습", "기술 파트너십 관리"],
      },
    ],
    development_activities: [
      {
        activity: "CSEP 자격 취득",
        type: "certification",
        target_skill: "전문성 인증",
        start_date: "2025-03-01",
        end_date: "2025-09-30",
        status: "planned",
        estimated_hours: 80,
        cost: 1800000,
        expected_outcome: "CSEP 자격 취득으로 전문성 공인",
      },
      {
        activity: "이벤트 재무 관리 과정",
        type: "training",
        target_skill: "재무 관리",
        start_date: "2025-02-15",
        end_date: "2025-04-15",
        status: "in_progress",
        estimated_hours: 24,
        cost: 650000,
        expected_outcome: "예산 수립 및 P&L 분석 역량 향상",
      },
      {
        activity: "디렉터급 섀도잉 프로그램",
        type: "mentorship",
        target_skill: "전략적 기획",
        start_date: "2025-01-01",
        end_date: "2025-06-30",
        status: "in_progress",
        estimated_hours: 30,
        cost: 0,
        expected_outcome: "고객 미팅 및 전략 결정 과정 학습",
      },
      {
        activity: "주니어 PM 2명 멘토링",
        type: "mentorship",
        target_skill: "리더십",
        start_date: "2025-01-15",
        end_date: "2025-12-31",
        status: "in_progress",
        estimated_hours: 48,
        cost: 0,
        expected_outcome: "코칭 및 피드백 역량 개발",
      },
      {
        activity: "IMEX Frankfurt 참가",
        type: "networking",
        target_skill: "업계 네트워크",
        start_date: "2025-05-13",
        end_date: "2025-05-15",
        status: "planned",
        estimated_hours: 24,
        cost: 3500000,
        expected_outcome: "글로벌 트렌드 파악 및 네트워크 확대",
      },
    ],
    progress_tracking: {
      overall_progress: 25,
      activities_completed: 0,
      activities_in_progress: 3,
      activities_planned: 2,
      skills_improved: 1,
      feedback_received: [
        {
          source: "직속 상사 (김민수 디렉터)",
          date: "2025-01-10",
          feedback: "재무 분석 역량이 빠르게 성장 중, 프레젠테이션 스킬 추가 개발 권장",
          action_taken: "프레젠테이션 교육 계획에 추가",
        },
        {
          source: "360도 피드백",
          date: "2024-12-15",
          feedback: "팀 내 협업 우수, 타 부서 소통 시 더 선제적 접근 필요",
          action_taken: "크로스팀 프로젝트 적극 참여",
        },
      ],
    },
    resources_needed: {
      budget_required: 6000000,
      time_required_hours: 206,
      manager_support: [
        "CSEP 시험 준비 시간 확보",
        "IMEX 출장 승인",
        "섀도잉 미팅 동석 허용",
      ],
      tools_resources: [
        "온라인 학습 플랫폼 구독",
        "재무 분석 소프트웨어 접근권",
        "업계 협회 멤버십",
      ],
    },
    next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-018",
  taskName: "자기 개발 계획",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.8.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.8: Self-Development",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
