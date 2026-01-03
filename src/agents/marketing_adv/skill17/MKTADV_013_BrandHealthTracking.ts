/**
 * MKTADV-013: 브랜드 건강도 추적
 * CMP-IS Reference: 17.6.b - Brand health tracking and measurement
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Brand Health Analyst for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  brand_name: z.string(),
  tracking_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  metrics: z.array(z.enum(["awareness", "consideration", "preference", "loyalty", "advocacy"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tracking_id: z.string(),
  event_id: z.string(),
  brand_health_scores: z.object({
    overall_score: z.number(),
    awareness: z.number(),
    consideration: z.number(),
    preference: z.number(),
    loyalty: z.number(),
    advocacy: z.number(),
  }),
  trend_analysis: z.array(z.object({
    metric: z.string(),
    current: z.number(),
    previous: z.number(),
    change: z.number(),
    trend: z.enum(["up", "down", "stable"]),
  })),
  competitive_position: z.object({
    rank: z.number(),
    total_competitors: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),
  key_drivers: z.array(z.object({
    driver: z.string(),
    impact: z.number(),
    current_score: z.number(),
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

  const scores = {
    awareness: 72,
    consideration: 65,
    preference: 58,
    loyalty: 70,
    advocacy: 55,
  };
  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b) / 5);

  return {
    tracking_id: generateUUID(),
    event_id: validatedInput.event_id,
    brand_health_scores: {
      overall_score: overallScore,
      ...scores,
    },
    trend_analysis: Object.entries(scores).map(([metric, current]) => ({
      metric,
      current,
      previous: current - Math.floor(Math.random() * 10 - 5),
      change: Math.floor(Math.random() * 10 - 3),
      trend: Math.random() > 0.5 ? "up" as const : "stable" as const,
    })),
    competitive_position: {
      rank: 3,
      total_competitors: 8,
      strengths: ["콘텐츠 품질", "연사 라인업", "네트워킹 기회"],
      weaknesses: ["가격 인식", "브랜드 인지도", "디지털 경험"],
    },
    key_drivers: [
      { driver: "콘텐츠 품질", impact: 0.30, current_score: 82 },
      { driver: "참가자 경험", impact: 0.25, current_score: 75 },
      { driver: "네트워킹 가치", impact: 0.20, current_score: 78 },
      { driver: "가격 대비 가치", impact: 0.15, current_score: 62 },
      { driver: "브랜드 신뢰도", impact: 0.10, current_score: 70 },
    ],
    recommendations: [
      "Advocacy 점수 개선을 위한 추천 프로그램 도입",
      "가격 인식 개선을 위한 가치 커뮤니케이션 강화",
      "디지털 경험 투자로 Preference 점수 향상",
      "참가자 성공 사례 콘텐츠로 Consideration 개선",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-013",
  taskName: "브랜드 건강도 추적",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.6.b",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.6: Social Intelligence",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
