/**
 * PRO-020: 경력 개발 관리
 * CMP-IS Reference: 20.10.a - Career development management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Career Development Advisor for event professionals.`;

export const InputSchema = z.object({
  event_id: z.string(),
  staff_id: z.string().optional(),
  development_focus: z.array(z.enum(["promotion", "lateral_move", "specialization", "leadership", "entrepreneurship"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  career_plan_id: z.string(),
  event_id: z.string(),
  career_summary: z.object({
    staff_id: z.string(),
    name: z.string(),
    current_position: z.string(),
    department: z.string(),
    tenure_years: z.number(),
    career_stage: z.enum(["early", "mid", "senior", "executive"]),
    readiness_for_next_level: z.number(),
  }),
  career_pathway: z.object({
    current_role: z.object({
      title: z.string(),
      level: z.string(),
      key_responsibilities: z.array(z.string()),
    }),
    potential_paths: z.array(z.object({
      path_name: z.string(),
      path_type: z.enum(["vertical", "lateral", "specialist", "management"]),
      target_roles: z.array(z.object({
        title: z.string(),
        level: z.string(),
        estimated_timeline: z.string(),
        requirements: z.array(z.string()),
        gap_analysis: z.array(z.object({
          requirement: z.string(),
          current_status: z.enum(["met", "partial", "not_met"]),
          action_needed: z.string(),
        })),
      })),
      recommended: z.boolean(),
      recommendation_reason: z.string(),
    })),
  }),
  competency_profile: z.object({
    core_competencies: z.array(z.object({
      competency: z.string(),
      current_level: z.number(),
      required_level: z.number(),
      gap: z.number(),
      development_priority: z.enum(["critical", "high", "medium", "low"]),
    })),
    leadership_competencies: z.array(z.object({
      competency: z.string(),
      current_level: z.number(),
      required_level: z.number(),
      gap: z.number(),
      development_priority: z.enum(["critical", "high", "medium", "low"]),
    })),
  }),
  development_plan: z.array(z.object({
    objective: z.string(),
    activities: z.array(z.object({
      activity: z.string(),
      type: z.string(),
      timeline: z.string(),
      success_metric: z.string(),
    })),
    resources_required: z.array(z.string()),
    support_needed: z.array(z.string()),
  })),
  market_insights: z.object({
    industry_trends: z.array(z.string()),
    in_demand_skills: z.array(z.string()),
    salary_benchmarks: z.object({
      current_role_range: z.object({ min: z.number(), median: z.number(), max: z.number() }),
      target_role_range: z.object({ min: z.number(), median: z.number(), max: z.number() }),
    }),
    growth_areas: z.array(z.string()),
  }),
  next_steps: z.array(z.object({
    action: z.string(),
    timeline: z.string(),
    owner: z.string(),
  })),
  review_schedule: z.object({
    next_review: z.string(),
    review_frequency: z.string(),
    stakeholders: z.array(z.string()),
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

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  return {
    career_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    career_summary: {
      staff_id: validatedInput.staff_id || "STF-002",
      name: "이영희",
      current_position: "시니어 프로젝트 매니저",
      department: "이벤트 운영팀",
      tenure_years: 7,
      career_stage: "mid",
      readiness_for_next_level: 75,
    },
    career_pathway: {
      current_role: {
        title: "시니어 프로젝트 매니저",
        level: "L4",
        key_responsibilities: [
          "중대형 이벤트 프로젝트 관리",
          "팀원 3-5명 리딩",
          "고객 관계 관리",
          "예산 관리 (5억 이하)",
        ],
      },
      potential_paths: [
        {
          path_name: "매니지먼트 트랙",
          path_type: "management",
          target_roles: [
            {
              title: "이벤트 디렉터",
              level: "L5",
              estimated_timeline: "1.5-2년",
              requirements: ["CMP 또는 CSEP 보유", "10억 이상 예산 관리 경험", "팀 빌딩 경험"],
              gap_analysis: [
                { requirement: "CMP 보유", current_status: "met", action_needed: "-" },
                { requirement: "10억 예산 경험", current_status: "partial", action_needed: "대형 프로젝트 리드 기회 확보" },
                { requirement: "팀 빌딩 경험", current_status: "partial", action_needed: "신규 인력 온보딩 리드" },
              ],
            },
            {
              title: "사업부장",
              level: "L6",
              estimated_timeline: "4-5년",
              requirements: ["디렉터 경험 2년+", "P&L 책임", "신규 비즈니스 개발"],
              gap_analysis: [
                { requirement: "디렉터 경험", current_status: "not_met", action_needed: "디렉터 승진 선행" },
                { requirement: "P&L 책임", current_status: "not_met", action_needed: "재무 교육 및 경험 축적" },
                { requirement: "신규 비즈니스 개발", current_status: "partial", action_needed: "세일즈 참여 확대" },
              ],
            },
          ],
          recommended: true,
          recommendation_reason: "리더십 역량과 고객 관계 강점을 살릴 수 있는 최적 경로",
        },
        {
          path_name: "스페셜리스트 트랙",
          path_type: "specialist",
          target_roles: [
            {
              title: "MICE 컨설턴트",
              level: "L4+",
              estimated_timeline: "1년",
              requirements: ["특정 분야 전문성", "컨설팅 경험", "업계 네트워크"],
              gap_analysis: [
                { requirement: "특정 분야 전문성", current_status: "partial", action_needed: "하이브리드 이벤트 전문성 구축" },
                { requirement: "컨설팅 경험", current_status: "not_met", action_needed: "내부 컨설팅 프로젝트 참여" },
                { requirement: "업계 네트워크", current_status: "met", action_needed: "-" },
              ],
            },
          ],
          recommended: false,
          recommendation_reason: "리더십 성향이 강해 매니지먼트 트랙이 더 적합",
        },
      ],
    },
    competency_profile: {
      core_competencies: [
        { competency: "프로젝트 관리", current_level: 8, required_level: 8, gap: 0, development_priority: "low" },
        { competency: "고객 관리", current_level: 8, required_level: 9, gap: 1, development_priority: "medium" },
        { competency: "예산 관리", current_level: 6, required_level: 8, gap: 2, development_priority: "high" },
        { competency: "전략적 사고", current_level: 6, required_level: 9, gap: 3, development_priority: "critical" },
        { competency: "이벤트 기술", current_level: 6, required_level: 7, gap: 1, development_priority: "medium" },
      ],
      leadership_competencies: [
        { competency: "팀 관리", current_level: 6, required_level: 8, gap: 2, development_priority: "high" },
        { competency: "의사결정", current_level: 6, required_level: 8, gap: 2, development_priority: "high" },
        { competency: "영향력", current_level: 5, required_level: 8, gap: 3, development_priority: "critical" },
        { competency: "변화 관리", current_level: 5, required_level: 7, gap: 2, development_priority: "medium" },
      ],
    },
    development_plan: [
      {
        objective: "전략적 사고 역량 강화",
        activities: [
          { activity: "전략 기획 워크숍 참가", type: "교육", timeline: "Q1 2025", success_metric: "수료 및 적용 프로젝트 1건" },
          { activity: "디렉터 섀도잉", type: "경험 학습", timeline: "Q1-Q2 2025", success_metric: "전략 미팅 10회 참석" },
          { activity: "케이스 스터디 발표", type: "자기 학습", timeline: "Q2 2025", success_metric: "경영진 발표 1회" },
        ],
        resources_required: ["교육비 100만원", "업무 조정"],
        support_needed: ["디렉터 멘토링 시간 확보", "발표 기회 제공"],
      },
      {
        objective: "대형 프로젝트 경험 축적",
        activities: [
          { activity: "10억 규모 프로젝트 리드", type: "실무 경험", timeline: "2025년", success_metric: "성공적 완료 및 수익 달성" },
          { activity: "신규 대형 클라이언트 피칭 참여", type: "영업 경험", timeline: "Q2 2025", success_metric: "피칭 2건 이상 참여" },
        ],
        resources_required: ["대형 프로젝트 배정"],
        support_needed: ["경영진 피칭 참여 기회", "리스크 백업 지원"],
      },
    ],
    market_insights: {
      industry_trends: [
        "하이브리드 이벤트 지속 성장",
        "지속가능성 중요도 증가",
        "데이터 기반 의사결정 확대",
        "AI/자동화 도구 도입 가속",
      ],
      in_demand_skills: [
        "하이브리드 이벤트 기획",
        "데이터 분석",
        "지속가능 이벤트 관리",
        "위기 관리",
        "디지털 마케팅",
      ],
      salary_benchmarks: {
        current_role_range: { min: 55000000, median: 65000000, max: 80000000 },
        target_role_range: { min: 80000000, median: 95000000, max: 120000000 },
      },
      growth_areas: [
        "기업 이벤트 (MICE)",
        "가상/하이브리드 플랫폼",
        "체험형 마케팅",
        "ESG 연계 이벤트",
      ],
    },
    next_steps: [
      { action: "디렉터와 경력 목표 논의", timeline: "2주 내", owner: "이영희" },
      { action: "전략 기획 워크숍 등록", timeline: "1개월 내", owner: "이영희" },
      { action: "대형 프로젝트 배정 협의", timeline: "1개월 내", owner: "직속 상사" },
      { action: "CSEP 시험 일정 확인", timeline: "Q1 2025", owner: "이영희" },
    ],
    review_schedule: {
      next_review: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      review_frequency: "분기별",
      stakeholders: ["직속 상사", "HR", "멘토"],
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-020",
  taskName: "경력 개발 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.10.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.10: Career Development",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
