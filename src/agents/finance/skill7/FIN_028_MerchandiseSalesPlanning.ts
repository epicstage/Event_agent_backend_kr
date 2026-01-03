/**
 * FIN-028: 상품 판매 기획
 *
 * CMP-IS Reference: 7.4.b
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Merchandise Sales Planning.
CMP-IS Standard: 7.4.b - Planning and managing event merchandise sales.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_info: z.object({
    name: z.string(),
    theme: z.string().optional(),
    brand_colors: z.array(z.string()).optional(),
    logo_available: z.boolean().default(true),
  }),
  attendee_profile: z.object({
    expected_count: z.number().int(),
    demographics: z.string().optional(),
    spending_capacity: z.enum(["low", "medium", "high"]).optional(),
  }),
  budget_for_inventory: z.number().optional(),
  sales_channels: z.array(z.enum(["onsite", "online_pre", "online_post"])).default(["onsite"]),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  product_lineup: z.array(z.object({
    product_name: z.string(),
    category: z.string(),
    unit_cost: z.number(),
    selling_price: z.number(),
    margin_percentage: z.number(),
    recommended_quantity: z.number().int(),
    design_notes: z.string(),
  })),
  inventory_investment: z.number(),
  projected_revenue: z.number(),
  projected_profit: z.number(),
  sales_strategy: z.object({
    pricing_approach: z.string(),
    bundle_offers: z.array(z.string()),
    promotional_tactics: z.array(z.string()),
  }),
  logistics: z.object({
    production_lead_time_weeks: z.number(),
    storage_requirements: z.string(),
    point_of_sale_needs: z.array(z.string()),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);
  const attendees = validated.attendee_profile.expected_count;

  const products = [
    {
      product_name: "공식 티셔츠",
      category: "의류",
      unit_cost: 8,
      selling_price: 25,
      margin_percentage: 68,
      recommended_quantity: Math.round(attendees * 0.15),
      design_notes: "이벤트 로고 + 연도 표기, 프리미엄 면 소재",
    },
    {
      product_name: "에코백",
      category: "가방",
      unit_cost: 4,
      selling_price: 15,
      margin_percentage: 73,
      recommended_quantity: Math.round(attendees * 0.2),
      design_notes: "친환경 소재, 실용적 크기",
    },
    {
      product_name: "프리미엄 노트북",
      category: "문구",
      unit_cost: 6,
      selling_price: 20,
      margin_percentage: 70,
      recommended_quantity: Math.round(attendees * 0.1),
      design_notes: "하드커버, 이벤트 브랜딩",
    },
    {
      product_name: "텀블러",
      category: "생활용품",
      unit_cost: 10,
      selling_price: 30,
      margin_percentage: 67,
      recommended_quantity: Math.round(attendees * 0.08),
      design_notes: "스테인리스, 이벤트 로고 각인",
    },
  ];

  const totalCost = products.reduce((sum, p) => sum + (p.unit_cost * p.recommended_quantity), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.selling_price * p.recommended_quantity), 0);

  const output: Output = {
    plan_id: generateUUID(),
    event_id: validated.event_id,
    product_lineup: products,
    inventory_investment: totalCost,
    projected_revenue: totalRevenue,
    projected_profit: totalRevenue - totalCost,
    sales_strategy: {
      pricing_approach: "프리미엄 가격 책정 - 기념품 가치 강조",
      bundle_offers: [
        "티셔츠 + 에코백 세트 35달러 (개별 40달러)",
        "풀 패키지 (전 품목) 80달러 (개별 90달러)",
      ],
      promotional_tactics: [
        "사전 온라인 주문 시 10% 할인",
        "SNS 공유 이벤트 참여 시 추가 할인",
        "VIP 참가자 한정판 증정",
      ],
    },
    logistics: {
      production_lead_time_weeks: 6,
      storage_requirements: "건조한 장소, 약 10㎡ 공간 필요",
      point_of_sale_needs: [
        "POS 시스템 (카드 결제 지원)",
        "재고 관리 앱",
        "판매 스태프 2-3명",
        "진열대 및 행거",
      ],
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-028",
  taskName: "상품 판매 기획",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 7.4.b",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.4: Identify and Develop Additional Revenue Streams",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
