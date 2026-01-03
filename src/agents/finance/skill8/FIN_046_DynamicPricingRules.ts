/**
 * FIN-046: 동적 가격 규칙
 *
 * CMP-IS Reference: 8.2.d
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Dynamic Pricing Rules.
CMP-IS Standard: 8.2.d - Establishing dynamic pricing rules and triggers.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  base_price: z.number(),
  capacity: z.number().int(),
  event_date: z.string(),
  pricing_objectives: z.object({
    maximize_revenue: z.boolean().default(true),
    ensure_sellout: z.boolean().default(false),
    balance_early_late: z.boolean().default(true),
  }),
  historical_patterns: z.object({
    avg_early_bird_uptake: z.number().optional(),
    avg_last_minute_surge: z.number().optional(),
    price_elasticity: z.enum(["low", "medium", "high"]).optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  rules_id: z.string().uuid(),
  event_id: z.string().uuid(),
  pricing_phases: z.array(z.object({
    phase_name: z.string(),
    trigger: z.object({
      type: z.enum(["date", "capacity", "time_to_event", "combination"]),
      condition: z.string(),
    }),
    price_adjustment: z.object({
      type: z.enum(["absolute", "percentage"]),
      value: z.number(),
      direction: z.enum(["increase", "decrease"]),
    }),
    resulting_price: z.number(),
    duration: z.string(),
  })),
  capacity_based_rules: z.array(z.object({
    threshold_percentage: z.number(),
    action: z.string(),
    price_impact: z.number(),
  })),
  time_based_rules: z.array(z.object({
    time_trigger: z.string(),
    action: z.string(),
    price_impact: z.number(),
  })),
  surge_pricing_rules: z.object({
    enabled: z.boolean(),
    triggers: z.array(z.object({
      condition: z.string(),
      max_surge_percentage: z.number(),
    })),
    cap: z.number(),
  }),
  automation_config: z.object({
    auto_adjust: z.boolean(),
    manual_override_allowed: z.boolean(),
    notification_recipients: z.array(z.string()),
    review_frequency: z.string(),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);
  const base = validated.base_price;

  const output: Output = {
    rules_id: generateUUID(),
    event_id: validated.event_id,
    pricing_phases: [
      {
        phase_name: "Super Early Bird",
        trigger: {
          type: "combination",
          condition: "D-120 이전 AND 등록률 < 20%",
        },
        price_adjustment: {
          type: "percentage",
          value: 25,
          direction: "decrease",
        },
        resulting_price: Math.round(base * 0.75),
        duration: "최대 4주 또는 100명 한정",
      },
      {
        phase_name: "Early Bird",
        trigger: {
          type: "date",
          condition: "D-120 ~ D-60",
        },
        price_adjustment: {
          type: "percentage",
          value: 15,
          direction: "decrease",
        },
        resulting_price: Math.round(base * 0.85),
        duration: "60일간",
      },
      {
        phase_name: "Regular",
        trigger: {
          type: "date",
          condition: "D-60 ~ D-14",
        },
        price_adjustment: {
          type: "percentage",
          value: 0,
          direction: "increase",
        },
        resulting_price: base,
        duration: "46일간",
      },
      {
        phase_name: "Late Registration",
        trigger: {
          type: "time_to_event",
          condition: "D-14 ~ D-0",
        },
        price_adjustment: {
          type: "percentage",
          value: 10,
          direction: "increase",
        },
        resulting_price: Math.round(base * 1.1),
        duration: "14일간",
      },
      {
        phase_name: "Onsite",
        trigger: {
          type: "date",
          condition: "D-0 (이벤트 당일)",
        },
        price_adjustment: {
          type: "percentage",
          value: 20,
          direction: "increase",
        },
        resulting_price: Math.round(base * 1.2),
        duration: "당일",
      },
    ],
    capacity_based_rules: [
      {
        threshold_percentage: 50,
        action: "Early Bird 종료 고려",
        price_impact: Math.round(base * 0.15),
      },
      {
        threshold_percentage: 75,
        action: "할인 정책 축소",
        price_impact: Math.round(base * 0.1),
      },
      {
        threshold_percentage: 90,
        action: "프리미엄 가격 적용",
        price_impact: Math.round(base * 0.15),
      },
      {
        threshold_percentage: 95,
        action: "매진 임박 프리미엄",
        price_impact: Math.round(base * 0.25),
      },
    ],
    time_based_rules: [
      {
        time_trigger: "D-30 등록률 < 50%",
        action: "프로모션 할인 연장",
        price_impact: Math.round(base * -0.1),
      },
      {
        time_trigger: "D-7 잔여 좌석 > 30%",
        action: "Last Minute 프로모션",
        price_impact: Math.round(base * -0.15),
      },
    ],
    surge_pricing_rules: {
      enabled: validated.pricing_objectives.maximize_revenue,
      triggers: [
        {
          condition: "1시간 내 등록 50건 초과",
          max_surge_percentage: 10,
        },
        {
          condition: "특정 세션 매진 임박",
          max_surge_percentage: 15,
        },
      ],
      cap: Math.round(base * 1.3),
    },
    automation_config: {
      auto_adjust: true,
      manual_override_allowed: true,
      notification_recipients: ["pricing_manager@event.com", "finance@event.com"],
      review_frequency: "일일 리뷰, 주요 가격 변경 시 즉시",
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-046",
  taskName: "동적 가격 규칙",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.2.d",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
