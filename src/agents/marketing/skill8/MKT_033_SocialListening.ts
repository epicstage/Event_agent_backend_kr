/**
 * MKT-033: 소셜 리스닝
 * CMP-IS Reference: 8.3.e - Social media listening and sentiment analysis
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Social Listening Agent.
CMP-IS Standard: 8.3.e - Monitoring social media conversations and sentiment.`;

export const InputSchema = z.object({
  event_id: z.string(),
  keywords: z.array(z.string()),
  platforms: z.array(z.string()).optional(),
  date_range: z.object({ start: z.string(), end: z.string() }).optional(),
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
  }),
  platform_breakdown: z.array(z.object({
    platform: z.string(),
    mentions: z.number(),
    sentiment: z.string(),
    top_topics: z.array(z.string()),
  })),
  trending_topics: z.array(z.object({ topic: z.string(), mentions: z.number(), sentiment: z.string(), trend: z.string() })),
  influencer_mentions: z.array(z.object({ name: z.string(), platform: z.string(), followers: z.number(), sentiment: z.string(), post_summary: z.string() })),
  action_items: z.array(z.object({ priority: z.string(), item: z.string(), reason: z.string() })),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  return {
    listening_id: generateUUID(),
    event_id: validatedInput.event_id,
    mention_summary: { total_mentions: 1250, unique_authors: 890, potential_reach: 2500000, engagement: 45000 },
    sentiment_analysis: { positive: 65, neutral: 28, negative: 7, sentiment_score: 72 },
    platform_breakdown: [
      { platform: "Twitter/X", mentions: 450, sentiment: "positive", top_topics: ["연사 라인업", "얼리버드", "네트워킹"] },
      { platform: "LinkedIn", mentions: 380, sentiment: "positive", top_topics: ["업계 트렌드", "비즈니스 기회", "전문성"] },
      { platform: "Instagram", mentions: 280, sentiment: "neutral", top_topics: ["행사장", "경험", "사진"] },
      { platform: "Facebook", mentions: 140, sentiment: "neutral", top_topics: ["일정", "등록", "가격"] },
    ],
    trending_topics: [
      { topic: "키노트 연사 발표", mentions: 320, sentiment: "positive", trend: "rising" },
      { topic: "얼리버드 마감", mentions: 180, sentiment: "mixed", trend: "stable" },
      { topic: "네트워킹 프로그램", mentions: 150, sentiment: "positive", trend: "rising" },
      { topic: "가격 정책", mentions: 80, sentiment: "negative", trend: "declining" },
    ],
    influencer_mentions: [
      { name: "업계전문가A", platform: "LinkedIn", followers: 50000, sentiment: "positive", post_summary: "올해 꼭 참석해야 할 행사로 추천" },
      { name: "테크블로거B", platform: "Twitter", followers: 30000, sentiment: "positive", post_summary: "연사 라인업이 역대급" },
      { name: "비즈니스인플루언서C", platform: "Instagram", followers: 80000, sentiment: "neutral", post_summary: "작년 참석 후기 공유" },
    ],
    action_items: [
      { priority: "high", item: "가격 관련 부정 멘션 대응", reason: "가격 정당성 콘텐츠 필요" },
      { priority: "medium", item: "인플루언서 언급에 감사 댓글", reason: "관계 강화 및 추가 홍보" },
      { priority: "low", item: "네트워킹 프로그램 상세 콘텐츠", reason: "관심 증가 추세 활용" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-033";
export const taskName = "소셜 리스닝";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.3.e";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.3: Performance Monitoring";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
