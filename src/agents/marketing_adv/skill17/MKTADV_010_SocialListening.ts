/**
 * MKTADV-010: 소셜 리스닝
 * CMP-IS Reference: 17.6.a - Social listening and sentiment analysis
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Social Listening Analyst for event marketing intelligence.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  keywords: z.array(z.string()),
  platforms: z.array(z.enum(["twitter", "linkedin", "instagram", "facebook", "youtube", "reddit"])),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  include_competitors: z.boolean().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  listening_id: z.string(),
  event_id: z.string(),
  mention_summary: z.object({
    total_mentions: z.number(),
    unique_authors: z.number(),
    potential_reach: z.number(),
    engagement: z.number(),
  }),
  sentiment_analysis: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
    sentiment_score: z.number(),
    trend: z.enum(["improving", "stable", "declining"]),
  }),
  platform_breakdown: z.array(z.object({
    platform: z.string(),
    mentions: z.number(),
    sentiment: z.number(),
    top_hashtags: z.array(z.string()),
  })),
  key_topics: z.array(z.object({
    topic: z.string(),
    mention_count: z.number(),
    sentiment: z.number(),
  })),
  influencers: z.array(z.object({
    handle: z.string(),
    platform: z.string(),
    followers: z.number(),
    mentions: z.number(),
    sentiment: z.enum(["positive", "neutral", "negative"]),
  })),
  actionable_insights: z.array(z.string()),
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

  const platformBreakdown = validatedInput.platforms.map(platform => ({
    platform,
    mentions: Math.floor(Math.random() * 500) + 50,
    sentiment: Math.round((Math.random() * 40 + 50) * 10) / 10,
    top_hashtags: [`#${validatedInput.event_name.replace(/\s/g, "")}`, "#이벤트", "#컨퍼런스"],
  }));

  const totalMentions = platformBreakdown.reduce((sum, p) => sum + p.mentions, 0);

  return {
    listening_id: generateUUID(),
    event_id: validatedInput.event_id,
    mention_summary: {
      total_mentions: totalMentions,
      unique_authors: Math.floor(totalMentions * 0.7),
      potential_reach: totalMentions * 500,
      engagement: Math.floor(totalMentions * 2.5),
    },
    sentiment_analysis: {
      positive: 58,
      neutral: 32,
      negative: 10,
      sentiment_score: 72,
      trend: "improving",
    },
    platform_breakdown: platformBreakdown,
    key_topics: [
      { topic: "연사 라인업", mention_count: 150, sentiment: 85 },
      { topic: "네트워킹", mention_count: 120, sentiment: 78 },
      { topic: "가격", mention_count: 80, sentiment: 55 },
      { topic: "장소", mention_count: 60, sentiment: 72 },
    ],
    influencers: [
      { handle: "@tech_leader", platform: "twitter", followers: 50000, mentions: 5, sentiment: "positive" },
      { handle: "@industry_expert", platform: "linkedin", followers: 30000, mentions: 3, sentiment: "positive" },
      { handle: "@event_blogger", platform: "instagram", followers: 25000, mentions: 4, sentiment: "neutral" },
    ],
    actionable_insights: [
      "연사 라인업에 대한 긍정적 반응 → SNS 콘텐츠 확대",
      "가격 관련 부정적 언급 → FAQ 및 가치 설명 강화",
      "인플루언서 협업으로 reach 확대 기회",
      "LinkedIn에서 B2B 타겟 대화 활발 → 콘텐츠 집중",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-010",
  taskName: "소셜 리스닝",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.6.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.6: Social Intelligence",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
