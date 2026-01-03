/**
 * MKTADV-015: 콘텐츠 성과 분석
 * CMP-IS Reference: 17.8.a - Content performance analysis
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Content Performance Analyst for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  content_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  content_types: z.array(z.enum(["blog", "video", "social", "email", "whitepaper", "webinar", "infographic"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  content_summary: z.object({
    total_pieces: z.number(),
    total_views: z.number(),
    total_engagement: z.number(),
    avg_engagement_rate: z.number(),
  }),
  content_performance: z.array(z.object({
    content_type: z.string(),
    pieces: z.number(),
    views: z.number(),
    engagement: z.number(),
    shares: z.number(),
    conversions: z.number(),
    avg_time_on_content: z.string(),
  })),
  top_performing: z.array(z.object({
    title: z.string(),
    type: z.string(),
    views: z.number(),
    engagement_rate: z.number(),
    conversions: z.number(),
  })),
  content_gaps: z.array(z.object({
    topic: z.string(),
    demand_indicator: z.string(),
    recommended_format: z.string(),
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

  const contentTypes = validatedInput.content_types || ["blog", "video", "social", "email"];
  const contentPerformance = contentTypes.map(type => ({
    content_type: type,
    pieces: Math.floor(Math.random() * 20) + 5,
    views: Math.floor(Math.random() * 50000) + 5000,
    engagement: Math.floor(Math.random() * 5000) + 500,
    shares: Math.floor(Math.random() * 500) + 50,
    conversions: Math.floor(Math.random() * 100) + 10,
    avg_time_on_content: type === "video" ? "3:45" : type === "blog" ? "2:30" : "0:45",
  }));

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    content_summary: {
      total_pieces: contentPerformance.reduce((sum, c) => sum + c.pieces, 0),
      total_views: contentPerformance.reduce((sum, c) => sum + c.views, 0),
      total_engagement: contentPerformance.reduce((sum, c) => sum + c.engagement, 0),
      avg_engagement_rate: 4.5,
    },
    content_performance: contentPerformance,
    top_performing: [
      { title: "2024 이벤트 트렌드 가이드", type: "blog", views: 15000, engagement_rate: 8.2, conversions: 45 },
      { title: "키노트 연사 인터뷰 영상", type: "video", views: 12000, engagement_rate: 12.5, conversions: 38 },
      { title: "네트워킹 팁 인포그래픽", type: "infographic", views: 8000, engagement_rate: 15.0, conversions: 25 },
    ],
    content_gaps: [
      { topic: "연사별 세션 미리보기", demand_indicator: "검색량 높음", recommended_format: "video" },
      { topic: "참가자 성공 사례", demand_indicator: "SNS 요청 다수", recommended_format: "blog/video" },
      { topic: "FAQ 및 가이드", demand_indicator: "CS 문의 빈발", recommended_format: "infographic" },
    ],
    recommendations: [
      "비디오 콘텐츠 확대 - 가장 높은 참여율",
      "연사 인터뷰 시리즈 제작으로 등록 유도",
      "인포그래픽을 SNS 공유 최적화",
      "블로그 SEO 강화로 유기적 유입 증가",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-015",
  taskName: "콘텐츠 성과 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.8.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.8: Content Analytics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
