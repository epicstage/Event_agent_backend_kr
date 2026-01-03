/**
 * MKTADV-006: 오디언스 세분화
 * CMP-IS Reference: 17.4.a - Audience segmentation and profiling
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Audience Segmentation Analyst for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  data_sources: z.array(z.enum(["crm", "website", "social", "email", "survey", "past_events"])),
  segmentation_criteria: z.array(z.enum(["demographics", "behavior", "psychographics", "firmographics", "engagement"])),
  min_segment_size: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  segmentation_id: z.string(),
  event_id: z.string(),
  segments: z.array(z.object({
    segment_id: z.string(),
    segment_name: z.string(),
    size: z.number(),
    percentage: z.number(),
    profile: z.object({
      demographics: z.string(),
      interests: z.array(z.string()),
      behavior_pattern: z.string(),
      preferred_channels: z.array(z.string()),
    }),
    engagement_score: z.number(),
    conversion_potential: z.enum(["high", "medium", "low"]),
    recommended_approach: z.string(),
  })),
  segment_overlap: z.array(z.object({
    segment_a: z.string(),
    segment_b: z.string(),
    overlap_percent: z.number(),
  })),
  targeting_recommendations: z.array(z.string()),
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

  const segments = [
    {
      segment_id: generateUUID(),
      segment_name: "Tech Innovators",
      size: 2500,
      percentage: 25,
      profile: {
        demographics: "25-40세, 대도시, 고소득",
        interests: ["AI/ML", "Cloud", "DevOps"],
        behavior_pattern: "얼리어답터, 적극적 네트워킹",
        preferred_channels: ["LinkedIn", "Tech Blogs", "Podcasts"],
      },
      engagement_score: 85,
      conversion_potential: "high" as const,
      recommended_approach: "기술 심화 세션 및 핸즈온 워크숍 강조",
    },
    {
      segment_id: generateUUID(),
      segment_name: "Business Leaders",
      size: 1800,
      percentage: 18,
      profile: {
        demographics: "35-55세, C-레벨/VP",
        interests: ["전략", "디지털 전환", "리더십"],
        behavior_pattern: "고가치, 시간 제약",
        preferred_channels: ["Email", "Executive Briefings"],
      },
      engagement_score: 72,
      conversion_potential: "high" as const,
      recommended_approach: "VIP 프로그램 및 1:1 미팅 기회 제공",
    },
    {
      segment_id: generateUUID(),
      segment_name: "Career Developers",
      size: 3200,
      percentage: 32,
      profile: {
        demographics: "25-35세, 주니어-미드 레벨",
        interests: ["커리어 개발", "네트워킹", "스킬업"],
        behavior_pattern: "가격 민감, 학습 중심",
        preferred_channels: ["Instagram", "YouTube", "Email"],
      },
      engagement_score: 68,
      conversion_potential: "medium" as const,
      recommended_approach: "얼리버드 할인 및 학습 콘텐츠 강조",
    },
    {
      segment_id: generateUUID(),
      segment_name: "Casual Explorers",
      size: 2500,
      percentage: 25,
      profile: {
        demographics: "다양한 연령대",
        interests: ["트렌드", "네트워킹"],
        behavior_pattern: "저참여, 탐색 중심",
        preferred_channels: ["Social Media", "Display Ads"],
      },
      engagement_score: 45,
      conversion_potential: "low" as const,
      recommended_approach: "리타겟팅 및 소셜 프루프 활용",
    },
  ];

  return {
    segmentation_id: generateUUID(),
    event_id: validatedInput.event_id,
    segments,
    segment_overlap: [
      { segment_a: "Tech Innovators", segment_b: "Business Leaders", overlap_percent: 15 },
      { segment_a: "Tech Innovators", segment_b: "Career Developers", overlap_percent: 22 },
    ],
    targeting_recommendations: [
      "Tech Innovators와 Business Leaders에 마케팅 예산 60% 집중",
      "Career Developers를 위한 특별 할인 코드 배포",
      "Casual Explorers 대상 리타겟팅 캠페인으로 전환 유도",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-006",
  taskName: "오디언스 세분화",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.4.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.4: Audience Analysis",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
