/**
 * HR-003: Recruitment Planning
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 채용 계획 수립 및 채용 채널 전략
 */

import { z } from "zod";

export const HR_003_InputSchema = z.object({
  event_id: z.string().uuid(),
  positions_needed: z.array(z.object({
    role: z.string(),
    count: z.number().min(1),
    urgency: z.enum(["low", "medium", "high", "critical"]),
  })),
  event_date: z.string(),
  budget_for_recruitment: z.number().optional(),
  location: z.string(),
  preferred_channels: z.array(z.string()).optional(),
});

export const HR_003_OutputSchema = z.object({
  event_id: z.string(),
  recruitment_plan: z.object({
    total_positions: z.number(),
    timeline: z.object({
      recruitment_start: z.string(),
      application_deadline: z.string(),
      screening_period: z.string(),
      interview_period: z.string(),
      offer_deadline: z.string(),
      onboarding_start: z.string(),
    }),
    channel_strategy: z.array(z.object({
      channel: z.string(),
      target_roles: z.array(z.string()),
      estimated_reach: z.number(),
      cost: z.number(),
      priority: z.enum(["primary", "secondary", "backup"]),
      action_items: z.array(z.string()),
    })),
    budget_allocation: z.object({
      total_budget: z.number(),
      breakdown: z.record(z.number()),
    }),
    kpis: z.array(z.object({
      metric: z.string(),
      target: z.string(),
    })),
  }),
  risk_mitigation: z.array(z.object({
    risk: z.string(),
    mitigation: z.string(),
  })),
  recommendations: z.array(z.string()),
});

export type HR_003_Input = z.infer<typeof HR_003_InputSchema>;
export type HR_003_Output = z.infer<typeof HR_003_OutputSchema>;

const RECRUITMENT_CHANNELS = [
  {
    name: "기존 인력풀",
    description: "이전 행사 근무자 재고용",
    costPerHire: 0,
    timeToFill: 3,
    qualityScore: 0.9,
    suitableFor: ["all"],
  },
  {
    name: "직원 추천",
    description: "현 스태프 추천 프로그램",
    costPerHire: 50000,
    timeToFill: 7,
    qualityScore: 0.85,
    suitableFor: ["all"],
  },
  {
    name: "대학 채용",
    description: "대학 취업센터 및 동아리",
    costPerHire: 20000,
    timeToFill: 14,
    qualityScore: 0.7,
    suitableFor: ["registration", "information", "volunteer"],
  },
  {
    name: "구인구직 사이트",
    description: "잡코리아, 사람인 등",
    costPerHire: 100000,
    timeToFill: 10,
    qualityScore: 0.75,
    suitableFor: ["all"],
  },
  {
    name: "SNS 채용",
    description: "인스타그램, 카카오톡 채널",
    costPerHire: 30000,
    timeToFill: 7,
    qualityScore: 0.65,
    suitableFor: ["part_time", "volunteer", "youth"],
  },
  {
    name: "전문 인력 에이전시",
    description: "행사 전문 파견업체",
    costPerHire: 200000,
    timeToFill: 5,
    qualityScore: 0.8,
    suitableFor: ["security", "catering", "av_tech"],
  },
  {
    name: "봉사활동 플랫폼",
    description: "1365, VMS 등",
    costPerHire: 0,
    timeToFill: 14,
    qualityScore: 0.6,
    suitableFor: ["volunteer"],
  },
  {
    name: "전문가 네트워크",
    description: "링크드인, 업계 커뮤니티",
    costPerHire: 150000,
    timeToFill: 14,
    qualityScore: 0.85,
    suitableFor: ["coordinator", "supervisor", "av_tech", "interpreter"],
  },
];

export async function execute(input: HR_003_Input): Promise<HR_003_Output> {
  const totalPositions = input.positions_needed.reduce((sum, p) => sum + p.count, 0);
  const eventDate = new Date(input.event_date);
  const today = new Date();
  const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Timeline calculation
  const recruitmentStart = new Date(today);
  recruitmentStart.setDate(recruitmentStart.getDate() + 3);

  const applicationDeadline = new Date(eventDate);
  applicationDeadline.setDate(applicationDeadline.getDate() - 21);

  const screeningEnd = new Date(eventDate);
  screeningEnd.setDate(screeningEnd.getDate() - 17);

  const interviewEnd = new Date(eventDate);
  interviewEnd.setDate(interviewEnd.getDate() - 12);

  const offerDeadline = new Date(eventDate);
  offerDeadline.setDate(offerDeadline.getDate() - 10);

  const onboardingStart = new Date(eventDate);
  onboardingStart.setDate(onboardingStart.getDate() - 7);

  // Channel strategy based on positions
  const channelStrategy = RECRUITMENT_CHANNELS.map((channel, idx) => {
    const targetRoles = input.positions_needed
      .filter((p) => channel.suitableFor.includes("all") || channel.suitableFor.some((s) => p.role.toLowerCase().includes(s)))
      .map((p) => p.role);

    const estimatedReach = Math.ceil(totalPositions * (channel.qualityScore * 3));
    const cost = channel.costPerHire * Math.ceil(targetRoles.length > 0 ? totalPositions * 0.2 : 0);

    return {
      channel: channel.name,
      target_roles: targetRoles.length > 0 ? targetRoles : ["일반 스태프"],
      estimated_reach: estimatedReach,
      cost,
      priority: (idx < 2 ? "primary" : idx < 5 ? "secondary" : "backup") as "primary" | "secondary" | "backup",
      action_items: [
        `${channel.name} 채널 공고 등록`,
        `지원자 트래킹 시스템 설정`,
        `응답률 모니터링`,
      ],
    };
  });

  // Budget allocation
  const defaultBudget = input.budget_for_recruitment || totalPositions * 50000;
  const breakdown: Record<string, number> = {
    "구인 광고": Math.round(defaultBudget * 0.3),
    "에이전시 수수료": Math.round(defaultBudget * 0.25),
    "추천 보너스": Math.round(defaultBudget * 0.15),
    "채용 행정비": Math.round(defaultBudget * 0.1),
    "면접 비용": Math.round(defaultBudget * 0.1),
    "예비비": Math.round(defaultBudget * 0.1),
  };

  return {
    event_id: input.event_id,
    recruitment_plan: {
      total_positions: totalPositions,
      timeline: {
        recruitment_start: recruitmentStart.toISOString().split("T")[0],
        application_deadline: applicationDeadline.toISOString().split("T")[0],
        screening_period: `${applicationDeadline.toISOString().split("T")[0]} ~ ${screeningEnd.toISOString().split("T")[0]}`,
        interview_period: `${screeningEnd.toISOString().split("T")[0]} ~ ${interviewEnd.toISOString().split("T")[0]}`,
        offer_deadline: offerDeadline.toISOString().split("T")[0],
        onboarding_start: onboardingStart.toISOString().split("T")[0],
      },
      channel_strategy: channelStrategy,
      budget_allocation: {
        total_budget: defaultBudget,
        breakdown,
      },
      kpis: [
        { metric: "지원자 수", target: `${totalPositions * 3}명 이상` },
        { metric: "적격 지원자 비율", target: "50% 이상" },
        { metric: "채용 완료율", target: "100% (${totalPositions}명)" },
        { metric: "채용 소요 기간", target: `${Math.ceil(daysUntilEvent * 0.5)}일 이내` },
        { metric: "비용 효율성", target: `인당 ${Math.round(defaultBudget / totalPositions).toLocaleString()}원 이하` },
      ],
    },
    risk_mitigation: [
      {
        risk: "지원자 부족",
        mitigation: "다중 채널 동시 공고, 추천 보너스 상향, 급여 조정 검토",
      },
      {
        risk: "급한 일정으로 인한 품질 저하",
        mitigation: "기존 인력풀 우선 접촉, 에이전시 활용",
      },
      {
        risk: "노쇼(No-show) 리스크",
        mitigation: "20% 초과 채용, 백업 인력 확보, 확정 보증금 제도",
      },
      {
        risk: "예산 초과",
        mitigation: "봉사자 비율 확대, 저비용 채널 우선 활용",
      },
    ],
    recommendations: [
      "기존 인력풀 우선 연락으로 검증된 인력 확보",
      "동시에 3개 이상 채널에서 공고 진행",
      `${input.location} 지역 대학 및 커뮤니티 타겟팅`,
      "조기 지원자 대상 인센티브 제공 검토",
      "정기적인 채용 현황 보고 (주 2회)",
    ],
  };
}

export const HR_003_RecruitmentPlan = {
  id: "HR-003",
  name: "Recruitment Planning",
  description: "채용 계획 수립 및 채용 채널 전략",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.3",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_003_InputSchema,
  outputSchema: HR_003_OutputSchema,
  persona: `당신은 이벤트 인력 채용 전문가입니다.
효율적인 채용 전략 수립과 다양한 채널 활용 경험이 풍부합니다.
비용 효율과 품질의 균형을 추구합니다.`,
};

export default HR_003_RecruitmentPlan;
