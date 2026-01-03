/**
 * FIN-023: 전시 패키지 개발
 *
 * CMP-IS Reference: 7.3.b
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Exhibit Package Development.
CMP-IS Standard: 7.3.b - Creating attractive exhibit packages for different exhibitor needs.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  venue_info: z.object({
    total_exhibit_space: z.number(),
    location_tiers: z.array(z.string()),
  }),
  target_exhibitor_profiles: z.array(z.object({
    profile_name: z.string(),
    budget_range: z.object({ min: z.number(), max: z.number() }),
    key_needs: z.array(z.string()),
  })),
  competitor_pricing: z.array(z.object({
    event_name: z.string(),
    package_price: z.number(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  package_set_id: z.string().uuid(),
  event_id: z.string().uuid(),
  packages: z.array(z.object({
    package_name: z.string(),
    tier: z.string(),
    booth_size: z.string(),
    price: z.number(),
    inclusions: z.array(z.string()),
    add_ons: z.array(z.object({
      item: z.string(),
      price: z.number(),
    })),
    target_audience: z.string(),
    value_proposition: z.string(),
  })),
  pricing_rationale: z.string(),
  upsell_strategy: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const output: Output = {
    package_set_id: generateUUID(),
    event_id: validated.event_id,
    packages: [
      {
        package_name: "프리미엄 부스",
        tier: "Premium",
        booth_size: "6m x 6m (36㎡)",
        price: 25000,
        inclusions: [
          "프라임 위치 배정",
          "전기/인터넷 포함",
          "가구 세트 제공",
          "VIP 참석자 명단",
          "로고 전시",
          "소셜미디어 홍보",
        ],
        add_ons: [
          { item: "추가 전력 (220V)", price: 500 },
          { item: "리드 스캐너 대여", price: 300 },
          { item: "케이터링 패키지", price: 1500 },
        ],
        target_audience: "대기업 및 업계 리더",
        value_proposition: "최고의 가시성과 VIP 접근성 확보",
      },
      {
        package_name: "스탠다드 부스",
        tier: "Standard",
        booth_size: "3m x 3m (9㎡)",
        price: 8000,
        inclusions: [
          "표준 위치 배정",
          "기본 전기 제공",
          "테이블/의자 포함",
          "참가자 명단 제공",
        ],
        add_ons: [
          { item: "추가 전력", price: 300 },
          { item: "리드 스캐너", price: 300 },
          { item: "배너 스탠드", price: 200 },
        ],
        target_audience: "중견기업",
        value_proposition: "합리적 비용으로 효과적인 참여",
      },
      {
        package_name: "스타트업 부스",
        tier: "Startup",
        booth_size: "2m x 2m (4㎡)",
        price: 3500,
        inclusions: [
          "지정 구역 배정",
          "기본 전기",
          "카운터 테이블",
        ],
        add_ons: [
          { item: "모니터 대여", price: 150 },
          { item: "브로슈어 거치대", price: 50 },
        ],
        target_audience: "스타트업 및 신규 진입사",
        value_proposition: "저비용으로 시장 진입 기회 확보",
      },
    ],
    pricing_rationale: "경쟁사 대비 10-15% 프리미엄, 포함 항목 확대로 가치 차별화",
    upsell_strategy: [
      "얼리버드 할인으로 조기 결정 유도",
      "스폰서십 연계 패키지 제안",
      "다년 계약 시 추가 할인",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-023",
  taskName: "전시 패키지 개발",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.3.b",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.3: Develop and Manage Exhibit/Sponsorship Sales Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
