/**
 * FIN-041: 시나리오 플래닝
 *
 * CMP-IS Reference: 8.1.k
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Scenario Planning.
CMP-IS Standard: 8.1.k - Developing budget scenarios for different outcomes.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  base_budget: z.object({
    total_costs: z.number(),
    total_revenue: z.number(),
    expected_attendees: z.number().int(),
  }),
  variables: z.array(z.object({
    name: z.string(),
    base_value: z.number(),
    min_value: z.number(),
    max_value: z.number(),
    impact_type: z.enum(["cost", "revenue", "both"]),
  })),
  external_factors: z.array(z.object({
    factor: z.string(),
    probability: z.enum(["low", "medium", "high"]),
    impact: z.enum(["positive", "negative", "mixed"]),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  scenario_id: z.string().uuid(),
  event_id: z.string().uuid(),
  scenarios: z.array(z.object({
    scenario_name: z.string(),
    probability: z.number(),
    description: z.string(),
    key_assumptions: z.array(z.string()),
    financial_impact: z.object({
      adjusted_costs: z.number(),
      adjusted_revenue: z.number(),
      net_result: z.number(),
      variance_from_base: z.number(),
    }),
    attendee_projection: z.number().int(),
    action_plan: z.array(z.string()),
  })),
  comparison_matrix: z.object({
    metrics: z.array(z.string()),
    scenario_values: z.record(z.string(), z.array(z.number())),
  }),
  recommended_scenario: z.string(),
  contingency_triggers: z.array(z.object({
    trigger: z.string(),
    threshold: z.string(),
    scenario_activated: z.string(),
    response_actions: z.array(z.string()),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const base = validated.base_budget;
  const baseNet = base.total_revenue - base.total_costs;

  const scenarios = [
    {
      scenario_name: "낙관적 (Optimistic)",
      probability: 20,
      description: "모든 지표가 목표를 초과 달성하는 시나리오",
      key_assumptions: [
        "등록자 120% 달성",
        "스폰서십 추가 확보",
        "비용 효율화 성공",
      ],
      financial_impact: {
        adjusted_costs: Math.round(base.total_costs * 0.95),
        adjusted_revenue: Math.round(base.total_revenue * 1.25),
        net_result: Math.round(base.total_revenue * 1.25 - base.total_costs * 0.95),
        variance_from_base: Math.round((base.total_revenue * 1.25 - base.total_costs * 0.95) - baseNet),
      },
      attendee_projection: Math.round(base.expected_attendees * 1.2),
      action_plan: [
        "수용 인원 확대 준비",
        "추가 스폰서 혜택 제공",
        "성공 사례 기록",
      ],
    },
    {
      scenario_name: "기본 (Base)",
      probability: 50,
      description: "계획대로 진행되는 기본 시나리오",
      key_assumptions: [
        "등록자 목표 달성",
        "예산 범위 내 집행",
        "스폰서십 계획대로 확보",
      ],
      financial_impact: {
        adjusted_costs: base.total_costs,
        adjusted_revenue: base.total_revenue,
        net_result: baseNet,
        variance_from_base: 0,
      },
      attendee_projection: base.expected_attendees,
      action_plan: [
        "계획대로 진행",
        "정기 모니터링 유지",
        "예비비 보존",
      ],
    },
    {
      scenario_name: "보수적 (Conservative)",
      probability: 25,
      description: "일부 지표가 목표에 미달하는 시나리오",
      key_assumptions: [
        "등록자 80% 달성",
        "일부 비용 증가",
        "경쟁 이벤트 영향",
      ],
      financial_impact: {
        adjusted_costs: Math.round(base.total_costs * 1.05),
        adjusted_revenue: Math.round(base.total_revenue * 0.85),
        net_result: Math.round(base.total_revenue * 0.85 - base.total_costs * 1.05),
        variance_from_base: Math.round((base.total_revenue * 0.85 - base.total_costs * 1.05) - baseNet),
      },
      attendee_projection: Math.round(base.expected_attendees * 0.8),
      action_plan: [
        "비용 절감 조치 시행",
        "마케팅 강화",
        "스폰서 추가 확보",
      ],
    },
    {
      scenario_name: "비관적 (Pessimistic)",
      probability: 5,
      description: "주요 리스크가 현실화되는 최악의 시나리오",
      key_assumptions: [
        "등록자 60% 달성",
        "주요 스폰서 취소",
        "비용 초과",
      ],
      financial_impact: {
        adjusted_costs: Math.round(base.total_costs * 1.15),
        adjusted_revenue: Math.round(base.total_revenue * 0.6),
        net_result: Math.round(base.total_revenue * 0.6 - base.total_costs * 1.15),
        variance_from_base: Math.round((base.total_revenue * 0.6 - base.total_costs * 1.15) - baseNet),
      },
      attendee_projection: Math.round(base.expected_attendees * 0.6),
      action_plan: [
        "긴급 비용 삭감",
        "규모 축소 검토",
        "스케일 다운 플랜 가동",
        "이해관계자 커뮤니케이션",
      ],
    },
  ];

  const output: Output = {
    scenario_id: generateUUID(),
    event_id: validated.event_id,
    scenarios,
    comparison_matrix: {
      metrics: ["총 비용", "총 수익", "순이익", "참석자", "ROI"],
      scenario_values: {
        "낙관적": [
          scenarios[0].financial_impact.adjusted_costs,
          scenarios[0].financial_impact.adjusted_revenue,
          scenarios[0].financial_impact.net_result,
          scenarios[0].attendee_projection,
          Math.round((scenarios[0].financial_impact.net_result / scenarios[0].financial_impact.adjusted_costs) * 100),
        ],
        "기본": [
          scenarios[1].financial_impact.adjusted_costs,
          scenarios[1].financial_impact.adjusted_revenue,
          scenarios[1].financial_impact.net_result,
          scenarios[1].attendee_projection,
          Math.round((scenarios[1].financial_impact.net_result / scenarios[1].financial_impact.adjusted_costs) * 100),
        ],
        "보수적": [
          scenarios[2].financial_impact.adjusted_costs,
          scenarios[2].financial_impact.adjusted_revenue,
          scenarios[2].financial_impact.net_result,
          scenarios[2].attendee_projection,
          Math.round((scenarios[2].financial_impact.net_result / scenarios[2].financial_impact.adjusted_costs) * 100),
        ],
        "비관적": [
          scenarios[3].financial_impact.adjusted_costs,
          scenarios[3].financial_impact.adjusted_revenue,
          scenarios[3].financial_impact.net_result,
          scenarios[3].attendee_projection,
          Math.round((scenarios[3].financial_impact.net_result / scenarios[3].financial_impact.adjusted_costs) * 100),
        ],
      },
    },
    recommended_scenario: "기본 (Base)",
    contingency_triggers: [
      {
        trigger: "등록률 저조",
        threshold: "목표 대비 80% 미만 (D-30 기준)",
        scenario_activated: "보수적",
        response_actions: ["추가 마케팅", "할인 프로모션", "비용 재검토"],
      },
      {
        trigger: "스폰서 취소",
        threshold: "주요 스폰서 1사 이상 취소",
        scenario_activated: "보수적",
        response_actions: ["대체 스폰서 확보", "예산 조정", "혜택 재배분"],
      },
      {
        trigger: "복합 위기",
        threshold: "등록 60% 미만 + 스폰서 취소",
        scenario_activated: "비관적",
        response_actions: ["긴급 회의", "규모 축소", "취소 옵션 검토"],
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-041",
  taskName: "시나리오 플래닝",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.1.k",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
