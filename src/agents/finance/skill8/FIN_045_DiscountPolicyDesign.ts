/**
 * FIN-045: 할인 정책 설계
 *
 * CMP-IS Reference: 8.2.c
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Discount Policy Design.
CMP-IS Standard: 8.2.c - Designing effective discount policies.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  base_pricing: z.object({
    standard_price: z.number(),
    tiers: z.array(z.object({
      name: z.string(),
      price: z.number(),
    })),
  }),
  target_segments: z.array(z.object({
    segment: z.string(),
    price_sensitivity: z.enum(["low", "medium", "high"]),
    strategic_importance: z.enum(["low", "medium", "high"]),
  })),
  objectives: z.object({
    early_registration_target: z.number().optional(),
    group_sales_target: z.number().optional(),
    member_retention_goal: z.boolean().optional(),
  }).optional(),
  constraints: z.object({
    max_discount_percentage: z.number().default(30),
    min_margin_requirement: z.number().optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  policy_id: z.string().uuid(),
  event_id: z.string().uuid(),
  discount_policies: z.array(z.object({
    policy_name: z.string(),
    discount_type: z.enum(["percentage", "fixed_amount", "bundled"]),
    discount_value: z.number(),
    eligibility_criteria: z.array(z.string()),
    validity_period: z.object({
      start: z.string(),
      end: z.string(),
    }),
    stackable: z.boolean(),
    code_required: z.boolean(),
    promo_code: z.string().optional(),
    expected_uptake: z.number(),
    revenue_impact: z.number(),
  })),
  policy_matrix: z.object({
    combinations_allowed: z.array(z.array(z.string())),
    combinations_prohibited: z.array(z.array(z.string())),
    max_combined_discount: z.number(),
  }),
  implementation_rules: z.array(z.object({
    rule: z.string(),
    rationale: z.string(),
  })),
  monitoring_metrics: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    alert_threshold: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);
  const stdPrice = validated.base_pricing.standard_price;

  const policies = [
    {
      policy_name: "Early Bird",
      discount_type: "percentage" as const,
      discount_value: 20,
      eligibility_criteria: ["마감일 전 등록", "전액 선결제"],
      validity_period: { start: "D-180", end: "D-90" },
      stackable: false,
      code_required: false,
      expected_uptake: 25,
      revenue_impact: Math.round(stdPrice * 0.2 * 0.25 * -1),
    },
    {
      policy_name: "Super Early Bird",
      discount_type: "percentage" as const,
      discount_value: 25,
      eligibility_criteria: ["최초 100명 한정", "전액 선결제"],
      validity_period: { start: "D-180", end: "D-120" },
      stackable: false,
      code_required: false,
      expected_uptake: 10,
      revenue_impact: Math.round(stdPrice * 0.25 * 0.1 * -1),
    },
    {
      policy_name: "그룹 할인",
      discount_type: "percentage" as const,
      discount_value: 15,
      eligibility_criteria: ["동일 조직 5인 이상", "일괄 결제"],
      validity_period: { start: "D-180", end: "D-7" },
      stackable: true,
      code_required: true,
      promo_code: "GROUP15",
      expected_uptake: 20,
      revenue_impact: Math.round(stdPrice * 0.15 * 0.2 * -1),
    },
    {
      policy_name: "회원 할인",
      discount_type: "percentage" as const,
      discount_value: 10,
      eligibility_criteria: ["협회/단체 회원", "회원증 확인"],
      validity_period: { start: "D-180", end: "D-0" },
      stackable: true,
      code_required: true,
      promo_code: "MEMBER10",
      expected_uptake: 15,
      revenue_impact: Math.round(stdPrice * 0.1 * 0.15 * -1),
    },
    {
      policy_name: "학생 할인",
      discount_type: "percentage" as const,
      discount_value: 50,
      eligibility_criteria: ["재학증명서 제출", "25세 이하"],
      validity_period: { start: "D-180", end: "D-0" },
      stackable: false,
      code_required: true,
      promo_code: "STUDENT50",
      expected_uptake: 5,
      revenue_impact: Math.round(stdPrice * 0.5 * 0.05 * -1),
    },
    {
      policy_name: "리피터 할인",
      discount_type: "percentage" as const,
      discount_value: 15,
      eligibility_criteria: ["전년도 참가자", "이메일 확인"],
      validity_period: { start: "D-180", end: "D-30" },
      stackable: true,
      code_required: true,
      promo_code: "RETURNER15",
      expected_uptake: 20,
      revenue_impact: Math.round(stdPrice * 0.15 * 0.2 * -1),
    },
  ];

  const output: Output = {
    policy_id: generateUUID(),
    event_id: validated.event_id,
    discount_policies: policies,
    policy_matrix: {
      combinations_allowed: [
        ["그룹 할인", "회원 할인"],
        ["리피터 할인", "회원 할인"],
      ],
      combinations_prohibited: [
        ["Early Bird", "Super Early Bird"],
        ["Early Bird", "그룹 할인"],
        ["학생 할인", "기타 모든 할인"],
      ],
      max_combined_discount: 25,
    },
    implementation_rules: [
      {
        rule: "최대 할인율 25% 제한",
        rationale: "수익성 보호 및 가치 인식 유지",
      },
      {
        rule: "Early Bird와 그룹 할인 중복 불가",
        rationale: "과도한 할인 방지",
      },
      {
        rule: "학생 할인은 단독 적용",
        rationale: "이미 최대 할인 적용",
      },
      {
        rule: "프로모션 코드 사전 승인 필수",
        rationale: "무분별한 코드 유출 방지",
      },
    ],
    monitoring_metrics: [
      {
        metric: "할인 적용률",
        target: "전체 등록의 40% 이하",
        alert_threshold: "50% 초과 시",
      },
      {
        metric: "평균 할인율",
        target: "15% 이하",
        alert_threshold: "20% 초과 시",
      },
      {
        metric: "Early Bird 전환율",
        target: "목표 등록의 25%",
        alert_threshold: "15% 미만 시",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-045",
  taskName: "할인 정책 설계",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.2.c",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
