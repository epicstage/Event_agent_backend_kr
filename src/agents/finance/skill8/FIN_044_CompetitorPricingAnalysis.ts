/**
 * FIN-044: 경쟁사 가격 분석
 *
 * CMP-IS Reference: 8.2.b
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Competitor Pricing Analysis.
CMP-IS Standard: 8.2.b - Analyzing competitor pricing for strategic positioning.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  our_event: z.object({
    name: z.string(),
    type: z.string(),
    proposed_price_range: z.object({ min: z.number(), max: z.number() }),
    key_features: z.array(z.string()),
  }),
  competitors: z.array(z.object({
    event_name: z.string(),
    organizer: z.string().optional(),
    pricing: z.object({
      standard_price: z.number(),
      early_bird_price: z.number().optional(),
      vip_price: z.number().optional(),
    }),
    features: z.array(z.string()),
    attendee_count: z.number().int().optional(),
    reputation: z.enum(["leader", "established", "emerging", "niche"]).optional(),
  })),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid(),
  event_id: z.string().uuid(),
  market_overview: z.object({
    price_range: z.object({ min: z.number(), max: z.number(), avg: z.number() }),
    market_segments: z.array(z.object({
      segment: z.string(),
      price_range: z.string(),
      characteristics: z.array(z.string()),
    })),
  }),
  competitor_analysis: z.array(z.object({
    competitor_name: z.string(),
    price_position: z.enum(["premium", "mid-market", "budget"]),
    price_per_feature_score: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    competitive_threat: z.enum(["high", "medium", "low"]),
  })),
  positioning_recommendation: z.object({
    recommended_position: z.string(),
    price_range: z.object({ min: z.number(), max: z.number() }),
    differentiation_strategy: z.array(z.string()),
    pricing_advantages: z.array(z.string()),
  }),
  price_sensitivity_insights: z.array(z.object({
    insight: z.string(),
    implication: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const prices = validated.competitors.map(c => c.pricing.standard_price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const competitorAnalysis = validated.competitors.map(c => {
    const position = c.pricing.standard_price > avgPrice * 1.2 ? "premium" :
      c.pricing.standard_price < avgPrice * 0.8 ? "budget" : "mid-market";

    const featureScore = c.features.length > 0 ?
      Math.round(c.pricing.standard_price / c.features.length) : 0;

    return {
      competitor_name: c.event_name,
      price_position: position as "premium" | "mid-market" | "budget",
      price_per_feature_score: featureScore,
      strengths: [
        c.reputation === "leader" ? "업계 리더 포지션" : "성장 잠재력",
        c.features.length > 5 ? "다양한 프로그램" : "집중된 콘텐츠",
      ],
      weaknesses: [
        position === "premium" ? "높은 가격 장벽" : "차별화 부족 가능",
        c.attendee_count && c.attendee_count < 500 ? "규모의 경제 부족" : "유연성 제한",
      ],
      competitive_threat: (c.reputation === "leader" ? "high" :
        c.reputation === "established" ? "medium" : "low") as "high" | "medium" | "low",
    };
  });

  const ourPosition = validated.our_event.proposed_price_range;
  const ourAvg = (ourPosition.min + ourPosition.max) / 2;

  const output: Output = {
    analysis_id: generateUUID(),
    event_id: validated.event_id,
    market_overview: {
      price_range: {
        min: minPrice,
        max: maxPrice,
        avg: Math.round(avgPrice),
      },
      market_segments: [
        {
          segment: "프리미엄",
          price_range: `${Math.round(avgPrice * 1.2).toLocaleString()}+ 원`,
          characteristics: ["VIP 경험", "독점 네트워킹", "프리미엄 서비스"],
        },
        {
          segment: "미드마켓",
          price_range: `${Math.round(avgPrice * 0.8).toLocaleString()} - ${Math.round(avgPrice * 1.2).toLocaleString()} 원`,
          characteristics: ["균형잡힌 가치", "표준 서비스", "경쟁적 가격"],
        },
        {
          segment: "버짓",
          price_range: `${Math.round(avgPrice * 0.8).toLocaleString()} 원 이하`,
          characteristics: ["접근성 중시", "기본 서비스", "가격 민감"],
        },
      ],
    },
    competitor_analysis: competitorAnalysis,
    positioning_recommendation: {
      recommended_position: ourAvg > avgPrice ? "가치 차별화 프리미엄" : "경쟁력 있는 가격",
      price_range: {
        min: Math.round(avgPrice * 0.9),
        max: Math.round(avgPrice * 1.1),
      },
      differentiation_strategy: [
        "독점 콘텐츠로 가치 정당화",
        "네트워킹 품질 강조",
        "ROI 명확히 커뮤니케이션",
        ...validated.our_event.key_features.slice(0, 2),
      ],
      pricing_advantages: [
        "Early Bird로 가격 경쟁력 확보",
        "그룹 할인으로 기업 참여 촉진",
        "VIP 옵션으로 수익 최대화",
      ],
    },
    price_sensitivity_insights: [
      {
        insight: "B2B 이벤트는 가격보다 ROI 중시",
        implication: "가치 메시지 강화, 가격 정당화 콘텐츠 필요",
      },
      {
        insight: "Early Bird 할인율 15-20%가 최적",
        implication: "높은 할인율은 가치 인식 하락 위험",
      },
      {
        insight: "VIP 티켓 수요는 전체의 10-15%",
        implication: "프리미엄 옵션 제한으로 희소성 유지",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-044",
  taskName: "경쟁사 가격 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.2.b",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
