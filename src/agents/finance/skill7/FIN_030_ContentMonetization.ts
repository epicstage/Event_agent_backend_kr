/**
 * FIN-030: 콘텐츠 수익화
 *
 * CMP-IS Reference: 7.4.d
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Content Monetization.
CMP-IS Standard: 7.4.d - Monetizing event content through various channels.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  content_inventory: z.object({
    keynotes: z.number().int(),
    breakout_sessions: z.number().int(),
    workshops: z.number().int(),
    panel_discussions: z.number().int(),
  }),
  recording_capability: z.boolean().default(true),
  existing_platforms: z.array(z.string()).optional(),
  target_audience: z.object({
    live_attendees: z.number().int(),
    potential_virtual_audience: z.number().int().optional(),
    industry: z.string(),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  monetization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  content_products: z.array(z.object({
    product_name: z.string(),
    content_type: z.string(),
    delivery_format: z.string(),
    pricing_model: z.string(),
    price_point: z.number(),
    target_buyers: z.string(),
    estimated_sales: z.number().int(),
    projected_revenue: z.number(),
  })),
  platform_recommendations: z.array(z.object({
    platform: z.string(),
    use_case: z.string(),
    cost_structure: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  })),
  licensing_opportunities: z.array(z.object({
    opportunity: z.string(),
    potential_buyers: z.string(),
    revenue_model: z.string(),
    estimated_value: z.number(),
  })),
  implementation_timeline: z.array(z.object({
    phase: z.string(),
    activities: z.array(z.string()),
    duration_weeks: z.number(),
  })),
  total_revenue_potential: z.number(),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);
  const totalSessions = validated.content_inventory.keynotes +
    validated.content_inventory.breakout_sessions +
    validated.content_inventory.workshops;

  const virtualAudience = validated.target_audience.potential_virtual_audience ||
    validated.target_audience.live_attendees * 3;

  const products = [
    {
      product_name: "온디맨드 전체 패키지",
      content_type: "전체 세션",
      delivery_format: "스트리밍 + 다운로드",
      pricing_model: "일회성 구매",
      price_point: 299,
      target_buyers: "미참석자, 기업",
      estimated_sales: Math.round(virtualAudience * 0.02),
      projected_revenue: Math.round(virtualAudience * 0.02 * 299),
    },
    {
      product_name: "키노트 컬렉션",
      content_type: "키노트만",
      delivery_format: "스트리밍",
      pricing_model: "일회성 구매",
      price_point: 99,
      target_buyers: "개인 전문가",
      estimated_sales: Math.round(virtualAudience * 0.05),
      projected_revenue: Math.round(virtualAudience * 0.05 * 99),
    },
    {
      product_name: "월간 구독",
      content_type: "아카이브 전체",
      delivery_format: "플랫폼 접근",
      pricing_model: "월 구독",
      price_point: 29,
      target_buyers: "지속 학습자",
      estimated_sales: Math.round(virtualAudience * 0.03),
      projected_revenue: Math.round(virtualAudience * 0.03 * 29 * 6),
    },
    {
      product_name: "기업 라이선스",
      content_type: "LMS 통합용",
      delivery_format: "SCORM 패키지",
      pricing_model: "연간 라이선스",
      price_point: 5000,
      target_buyers: "기업 교육팀",
      estimated_sales: 10,
      projected_revenue: 50000,
    },
  ];

  const totalRevenue = products.reduce((sum, p) => sum + p.projected_revenue, 0);

  const output: Output = {
    monetization_id: generateUUID(),
    event_id: validated.event_id,
    content_products: products,
    platform_recommendations: [
      {
        platform: "Vimeo OTT",
        use_case: "프리미엄 온디맨드 판매",
        cost_structure: "월정액 + 거래 수수료",
        pros: ["전문적 외관", "결제 통합", "분석 기능"],
        cons: ["초기 설정 복잡", "월 비용"],
      },
      {
        platform: "Teachable",
        use_case: "코스 형태 판매",
        cost_structure: "월정액 + 수수료",
        pros: ["교육 콘텐츠 최적화", "인증서 발급"],
        cons: ["이벤트보다 교육 중심"],
      },
      {
        platform: "YouTube Members",
        use_case: "커뮤니티 기반 수익화",
        cost_structure: "30% 수수료",
        pros: ["넓은 도달 범위", "검색 노출"],
        cons: ["가격 책정 제한", "콘텐츠 보호 약함"],
      },
    ],
    licensing_opportunities: [
      {
        opportunity: "업계 미디어 파트너십",
        potential_buyers: "업계 전문 미디어",
        revenue_model: "수익 공유 (50:50)",
        estimated_value: 15000,
      },
      {
        opportunity: "대학 교육 자료",
        potential_buyers: "관련 학과",
        revenue_model: "연간 라이선스",
        estimated_value: 8000,
      },
    ],
    implementation_timeline: [
      {
        phase: "준비",
        activities: ["녹화 계획", "플랫폼 선정", "가격 책정"],
        duration_weeks: 4,
      },
      {
        phase: "제작",
        activities: ["녹화", "편집", "자막 추가"],
        duration_weeks: 6,
      },
      {
        phase: "론칭",
        activities: ["플랫폼 업로드", "마케팅", "판매 시작"],
        duration_weeks: 2,
      },
    ],
    total_revenue_potential: totalRevenue + 23000, // products + licensing
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-030",
  taskName: "콘텐츠 수익화",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.4.d",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.4: Identify and Develop Additional Revenue Streams",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
