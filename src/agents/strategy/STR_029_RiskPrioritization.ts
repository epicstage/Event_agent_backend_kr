/**
 * STR-029: 리스크 우선순위화
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Prioritization)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Prioritization Agent for event planning.

Your expertise includes:
- Multi-criteria risk prioritization
- Resource-constrained prioritization
- Stakeholder-weighted prioritization
- Dynamic re-prioritization strategies

CMP-IS Standard: Domain A - Strategic Planning (Risk Prioritization)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  assessed_risks: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    category: z.string(),
    risk_score: z.number(),
    probability: z.number(),
    impact: z.number(),
  })),
  prioritization_factors: z.object({
    stakeholder_concerns: z.array(z.object({
      stakeholder: z.string(),
      concerned_risks: z.array(z.string()),
      weight: z.number().optional(),
    })).optional(),
    resource_constraints: z.object({
      budget_for_mitigation: z.number().optional(),
      time_available: z.string().optional(),
      team_capacity: z.enum(["limited", "moderate", "high"]).optional(),
    }).optional(),
    strategic_priorities: z.array(z.string()).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  prioritization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  prioritized_risks: z.array(z.object({
    rank: z.number(),
    risk_id: z.string(),
    risk_name: z.string(),
    base_score: z.number(),
    adjusted_score: z.number(),
    adjustment_factors: z.array(z.object({
      factor: z.string(),
      adjustment: z.number(),
      reason: z.string(),
    })),
    priority_tier: z.enum(["immediate", "high", "medium", "low", "accept"]),
    recommended_attention: z.string(),
  })),
  prioritization_rationale: z.object({
    methodology: z.string(),
    key_factors: z.array(z.string()),
    trade_offs: z.array(z.object({
      decision: z.string(),
      rationale: z.string(),
    })),
  }),
  resource_allocation_guide: z.array(z.object({
    priority_tier: z.string(),
    risk_count: z.number(),
    recommended_budget_percent: z.number(),
    recommended_effort_percent: z.number(),
    timeline: z.string(),
  })),
  action_sequence: z.array(z.object({
    sequence: z.number(),
    risk_ids: z.array(z.string()),
    action_type: z.string(),
    rationale: z.string(),
  })),
  review_triggers: z.array(z.object({
    trigger: z.string(),
    action: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-029",
  taskName: "Risk Prioritization",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "평가된 리스크의 우선순위를 결정하고 자원 배분을 안내합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type PriorityTier = "immediate" | "high" | "medium" | "low" | "accept";

function getPriorityTier(score: number): PriorityTier {
  if (score >= 20) return "immediate";
  if (score >= 15) return "high";
  if (score >= 10) return "medium";
  if (score >= 5) return "low";
  return "accept";
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { assessed_risks, prioritization_factors } = validated;

  // Calculate stakeholder concern adjustments
  const stakeholderConcernMap = new Map<string, number>();
  prioritization_factors?.stakeholder_concerns?.forEach(sc => {
    const weight = sc.weight || 1;
    sc.concerned_risks.forEach(riskId => {
      stakeholderConcernMap.set(riskId, (stakeholderConcernMap.get(riskId) || 0) + weight);
    });
  });

  // Prioritize risks
  const prioritizedRisks = assessed_risks.map(risk => {
    const adjustments: { factor: string; adjustment: number; reason: string }[] = [];
    let adjustedScore = risk.risk_score;

    // Stakeholder concern adjustment
    const stakeholderWeight = stakeholderConcernMap.get(risk.risk_id) || 0;
    if (stakeholderWeight > 0) {
      const adj = stakeholderWeight * 2;
      adjustments.push({ factor: "이해관계자 우려", adjustment: adj, reason: `${stakeholderWeight}명의 이해관계자 우려` });
      adjustedScore += adj;
    }

    // Strategic priority adjustment
    if (prioritization_factors?.strategic_priorities?.some(sp => risk.risk_name.includes(sp) || risk.category.includes(sp))) {
      const adj = 3;
      adjustments.push({ factor: "전략적 우선순위", adjustment: adj, reason: "전략적 중요 영역과 연관" });
      adjustedScore += adj;
    }

    // High probability adjustment (risks likely to occur need attention)
    if (risk.probability >= 4) {
      const adj = 2;
      adjustments.push({ factor: "높은 발생 확률", adjustment: adj, reason: "발생 확률이 매우 높음" });
      adjustedScore += adj;
    }

    return {
      risk_id: risk.risk_id,
      risk_name: risk.risk_name,
      base_score: risk.risk_score,
      adjusted_score: Math.round(adjustedScore * 10) / 10,
      adjustment_factors: adjustments,
      priority_tier: getPriorityTier(adjustedScore),
      recommended_attention: "",
      rank: 0,
    };
  });

  // Sort and assign ranks
  prioritizedRisks.sort((a, b) => b.adjusted_score - a.adjusted_score);
  prioritizedRisks.forEach((r, idx) => {
    r.rank = idx + 1;
    r.recommended_attention = r.priority_tier === "immediate" ? "즉시 대응 필요, 일일 모니터링" :
      r.priority_tier === "high" ? "긴급 대응 계획 수립, 주간 모니터링" :
      r.priority_tier === "medium" ? "대응 계획 수립, 격주 모니터링" :
      r.priority_tier === "low" ? "모니터링, 필요시 대응" : "수용, 월간 점검";
  });

  // Resource allocation guide
  const tierCounts = {
    immediate: prioritizedRisks.filter(r => r.priority_tier === "immediate").length,
    high: prioritizedRisks.filter(r => r.priority_tier === "high").length,
    medium: prioritizedRisks.filter(r => r.priority_tier === "medium").length,
    low: prioritizedRisks.filter(r => r.priority_tier === "low").length,
    accept: prioritizedRisks.filter(r => r.priority_tier === "accept").length,
  };

  const resourceAllocation = [
    { priority_tier: "immediate", risk_count: tierCounts.immediate, recommended_budget_percent: 40, recommended_effort_percent: 50, timeline: "즉시 ~ 1주" },
    { priority_tier: "high", risk_count: tierCounts.high, recommended_budget_percent: 30, recommended_effort_percent: 30, timeline: "1~2주" },
    { priority_tier: "medium", risk_count: tierCounts.medium, recommended_budget_percent: 20, recommended_effort_percent: 15, timeline: "2~4주" },
    { priority_tier: "low", risk_count: tierCounts.low, recommended_budget_percent: 10, recommended_effort_percent: 5, timeline: "필요시" },
  ];

  // Action sequence
  const actionSequence = [
    {
      sequence: 1,
      risk_ids: prioritizedRisks.filter(r => r.priority_tier === "immediate").map(r => r.risk_id),
      action_type: "즉시 대응",
      rationale: "Critical 리스크 우선 처리",
    },
    {
      sequence: 2,
      risk_ids: prioritizedRisks.filter(r => r.priority_tier === "high").map(r => r.risk_id),
      action_type: "긴급 계획 수립",
      rationale: "High 리스크 대응 계획 확정",
    },
    {
      sequence: 3,
      risk_ids: prioritizedRisks.filter(r => r.priority_tier === "medium").map(r => r.risk_id),
      action_type: "표준 대응",
      rationale: "Medium 리스크 정기 관리",
    },
  ];

  return {
    prioritization_id: generateUUID(),
    event_id: validated.event_id,
    prioritized_risks: prioritizedRisks,
    prioritization_rationale: {
      methodology: "리스크 점수 + 이해관계자 우려 + 전략적 중요도 가중치 적용",
      key_factors: [
        "기본 리스크 점수 (확률 × 영향)",
        "이해관계자 우려 수준",
        "전략적 우선순위와의 연관성",
        "발생 확률 수준",
      ],
      trade_offs: [
        { decision: "높은 확률 리스크 우선", rationale: "실제 발생 가능성이 높아 선제 대응 필요" },
        { decision: "이해관계자 우려 반영", rationale: "주요 이해관계자 만족도 및 지지 확보" },
      ],
    },
    resource_allocation_guide: resourceAllocation,
    action_sequence: actionSequence,
    review_triggers: [
      { trigger: "새로운 리스크 식별", action: "우선순위 재평가" },
      { trigger: "리스크 상태 변화", action: "해당 리스크 우선순위 조정" },
      { trigger: "자원 상황 변화", action: "전체 배분 계획 재검토" },
      { trigger: "주간 리스크 리뷰", action: "Top 10 리스크 점검" },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
