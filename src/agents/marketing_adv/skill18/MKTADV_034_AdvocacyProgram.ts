/**
 * MKTADV-034: 옹호자 프로그램
 * CMP-IS Reference: 18.9.b - Customer advocacy program
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Customer Advocacy Program Manager for event brand amplification.`;

export const InputSchema = z.object({
  event_id: z.string(),
  program_focus: z.enum(["testimonials", "reviews", "speaking", "content_creation", "social_amplification"]).optional(),
  advocacy_tier: z.enum(["all", "vip", "champions", "new"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  program_id: z.string(),
  event_id: z.string(),
  program_overview: z.object({
    total_advocates: z.number(),
    active_advocates: z.number(),
    advocacy_activities_ytd: z.number(),
    estimated_earned_media_value: z.number(),
    advocate_satisfaction: z.number(),
  }),
  advocate_tiers: z.array(z.object({
    tier: z.string(),
    advocates: z.number(),
    requirements: z.array(z.string()),
    benefits: z.array(z.string()),
    avg_activities_per_year: z.number(),
  })),
  activity_types: z.array(z.object({
    activity: z.string(),
    completions: z.number(),
    avg_reach: z.number(),
    impact_score: z.number(),
    reward_points: z.number(),
  })),
  top_advocates: z.array(z.object({
    advocate_id: z.string(),
    name: z.string(),
    tier: z.string(),
    activities_completed: z.number(),
    total_reach: z.number(),
    impact_score: z.number(),
  })),
  content_library: z.object({
    testimonials: z.number(),
    case_studies: z.number(),
    video_testimonials: z.number(),
    reviews: z.number(),
    social_posts: z.number(),
  }),
  recruitment_pipeline: z.object({
    prospects: z.number(),
    invited: z.number(),
    onboarding: z.number(),
    conversion_rate: z.number(),
  }),
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
    program_id: generateUUID(),
    event_id: validatedInput.event_id,
    program_overview: {
      total_advocates: 145,
      active_advocates: 92,
      advocacy_activities_ytd: 456,
      estimated_earned_media_value: 185000,
      advocate_satisfaction: 4.6,
    },
    advocate_tiers: [
      { tier: "Ambassador", advocates: 12, requirements: ["연 10+ 활동", "고품질 콘텐츠", "2년+ 참가"], benefits: ["전 이벤트 무료", "전용 네트워킹", "연사 기회", "전담 담당자"], avg_activities_per_year: 15 },
      { tier: "Champion", advocates: 35, requirements: ["연 5-9 활동", "적극적 추천", "1년+ 참가"], benefits: ["50% 할인", "VIP 라운지", "얼리 액세스", "굿즈 패키지"], avg_activities_per_year: 7 },
      { tier: "Advocate", advocates: 48, requirements: ["연 2-4 활동", "참여 의지"], benefits: ["20% 할인", "전용 콘텐츠", "뉴스레터 특집"], avg_activities_per_year: 3 },
      { tier: "Supporter", advocates: 50, requirements: ["연 1+ 활동"], benefits: ["10% 할인", "인정 배지"], avg_activities_per_year: 1.5 },
    ],
    activity_types: [
      { activity: "소셜 미디어 공유", completions: 185, avg_reach: 1200, impact_score: 6, reward_points: 25 },
      { activity: "리뷰 작성", completions: 78, avg_reach: 500, impact_score: 8, reward_points: 50 },
      { activity: "추천인 소개", completions: 92, avg_reach: 0, impact_score: 10, reward_points: 100 },
      { activity: "테스티모니얼 제공", completions: 45, avg_reach: 2500, impact_score: 9, reward_points: 75 },
      { activity: "사례 연구 참여", completions: 18, avg_reach: 5000, impact_score: 10, reward_points: 200 },
      { activity: "연사/패널 참여", completions: 12, avg_reach: 8000, impact_score: 10, reward_points: 300 },
    ],
    top_advocates: [
      { advocate_id: "ADV-001", name: "김철수", tier: "Ambassador", activities_completed: 22, total_reach: 45000, impact_score: 95 },
      { advocate_id: "ADV-002", name: "이영희", tier: "Ambassador", activities_completed: 18, total_reach: 38000, impact_score: 92 },
      { advocate_id: "ADV-003", name: "박지민", tier: "Ambassador", activities_completed: 16, total_reach: 32000, impact_score: 88 },
      { advocate_id: "ADV-004", name: "최수진", tier: "Champion", activities_completed: 12, total_reach: 25000, impact_score: 82 },
      { advocate_id: "ADV-005", name: "정민수", tier: "Champion", activities_completed: 10, total_reach: 22000, impact_score: 78 },
    ],
    content_library: {
      testimonials: 68,
      case_studies: 12,
      video_testimonials: 24,
      reviews: 156,
      social_posts: 420,
    },
    recruitment_pipeline: {
      prospects: 85,
      invited: 45,
      onboarding: 18,
      conversion_rate: 40,
    },
    recommendations: [
      "Ambassador 티어 확대를 위한 Champion 육성 프로그램 강화",
      "비디오 테스티모니얼 캠페인으로 콘텐츠 자산 확대",
      "옹호자 전용 슬랙 채널로 커뮤니티 강화",
      "분기별 옹호자 인정 이벤트로 참여 유지",
      "신규 옹호자 온보딩 프로세스 간소화",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-034",
  taskName: "옹호자 프로그램",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.9.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.9: Community Engagement",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
