/**
 * STR-030: 리스크 완화 전략
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Mitigation)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Mitigation Strategy Agent for event planning.

Your expertise includes:
- Mitigation strategy development (avoid, reduce, transfer, accept)
- Cost-benefit analysis for mitigation options
- Mitigation action planning
- Residual risk assessment

CMP-IS Standard: Domain A - Strategic Planning (Risk Mitigation)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  prioritized_risks: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    category: z.string(),
    risk_score: z.number(),
    probability: z.number(),
    impact: z.number(),
    priority_tier: z.enum(["immediate", "high", "medium", "low", "accept"]),
  })),
  constraints: z.object({
    budget_available: z.number().optional(),
    timeline: z.string().optional(),
    risk_appetite: z.enum(["risk_averse", "risk_neutral", "risk_tolerant"]).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  mitigation_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  mitigation_strategies: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    strategy_type: z.enum(["avoid", "reduce", "transfer", "accept"]),
    strategy_rationale: z.string(),
    mitigation_actions: z.array(z.object({
      action_id: z.string(),
      action: z.string(),
      description: z.string(),
      owner: z.string(),
      deadline: z.string(),
      resources_needed: z.array(z.string()),
      estimated_cost: z.number(),
    })),
    expected_reduction: z.object({
      probability_reduction: z.number(),
      impact_reduction: z.number(),
      residual_risk_score: z.number(),
    }),
    success_criteria: z.array(z.string()),
    fallback_plan: z.string(),
  })),
  cost_summary: z.object({
    total_mitigation_cost: z.number(),
    cost_by_strategy: z.array(z.object({
      strategy_type: z.string(),
      cost: z.number(),
      risk_count: z.number(),
    })),
    cost_effectiveness: z.array(z.object({
      risk_id: z.string(),
      cost: z.number(),
      risk_reduction: z.number(),
      cost_per_point: z.number(),
    })),
  }),
  residual_risk_profile: z.object({
    total_residual_exposure: z.number(),
    original_exposure: z.number(),
    reduction_percentage: z.number(),
    remaining_high_risks: z.array(z.string()),
  }),
  implementation_roadmap: z.array(z.object({
    phase: z.string(),
    timeline: z.string(),
    actions: z.array(z.string()),
    milestones: z.array(z.string()),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-030",
  taskName: "Risk Mitigation",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "리스크 완화 전략을 수립하고 실행 계획을 개발합니다.",
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

type StrategyType = "avoid" | "reduce" | "transfer" | "accept";

function selectStrategy(risk: { probability: number; impact: number; priority_tier: string }, appetite: string): StrategyType {
  if (risk.priority_tier === "accept") return "accept";
  if (risk.impact >= 4 && appetite === "risk_averse") return "avoid";
  if (risk.probability >= 4 && risk.impact >= 3) return "reduce";
  if (risk.impact >= 4 && risk.probability < 3) return "transfer";
  return "reduce";
}

const STRATEGY_ACTIONS: Record<StrategyType, { actions: string[]; costMultiplier: number }> = {
  avoid: {
    actions: ["리스크 원인 제거", "대안적 접근 방식 채택", "리스크 유발 활동 취소"],
    costMultiplier: 1.5,
  },
  reduce: {
    actions: ["예방적 통제 강화", "탐지 메커니즘 구축", "대응 역량 확보", "절차/프로세스 개선"],
    costMultiplier: 1.0,
  },
  transfer: {
    actions: ["보험 가입", "계약적 리스크 이전", "아웃소싱/파트너십"],
    costMultiplier: 0.8,
  },
  accept: {
    actions: ["리스크 모니터링", "비상 자금 확보"],
    costMultiplier: 0.2,
  },
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const appetite = validated.constraints?.risk_appetite || "risk_neutral";
  let actionCounter = 1;

  const strategies = validated.prioritized_risks.map(risk => {
    const strategyType = selectStrategy(risk, appetite);
    const template = STRATEGY_ACTIONS[strategyType];

    const baseCost = risk.risk_score * 1000;
    const estimatedCost = Math.round(baseCost * template.costMultiplier);

    const actions = template.actions.slice(0, 2).map(action => ({
      action_id: `ACT-${String(actionCounter++).padStart(3, "0")}`,
      action,
      description: `${risk.risk_name}에 대한 ${action}`,
      owner: "리스크 담당자",
      deadline: risk.priority_tier === "immediate" ? "1주 내" : risk.priority_tier === "high" ? "2주 내" : "1개월 내",
      resources_needed: ["인력", "예산"],
      estimated_cost: Math.round(estimatedCost / 2),
    }));

    const probReduction = strategyType === "avoid" ? risk.probability * 0.8 : strategyType === "reduce" ? risk.probability * 0.5 : risk.probability * 0.2;
    const impactReduction = strategyType === "avoid" ? risk.impact * 0.7 : strategyType === "reduce" ? risk.impact * 0.4 : risk.impact * 0.1;
    const residualScore = Math.max(1, Math.round((risk.risk_score - (probReduction * risk.impact + risk.probability * impactReduction) / 2) * 10) / 10);

    return {
      risk_id: risk.risk_id,
      risk_name: risk.risk_name,
      strategy_type: strategyType,
      strategy_rationale: strategyType === "avoid" ? "영향이 크고 회피 가능하여 원인 제거 선택" :
        strategyType === "reduce" ? "발생 확률 및 영향 감소를 통한 관리" :
        strategyType === "transfer" ? "제3자에게 리스크 이전이 효율적" :
        "리스크 수준이 수용 가능하여 모니터링만 진행",
      mitigation_actions: actions,
      expected_reduction: {
        probability_reduction: Math.round(probReduction * 10) / 10,
        impact_reduction: Math.round(impactReduction * 10) / 10,
        residual_risk_score: residualScore,
      },
      success_criteria: [
        `리스크 점수 ${risk.risk_score}에서 ${residualScore}로 감소`,
        "완화 조치 일정 내 완료",
      ],
      fallback_plan: strategyType === "accept" ? "상황 악화 시 즉시 대응 계획 발동" : "1차 완화 실패 시 대안 전략 실행",
    };
  });

  // Cost summary
  const totalCost = strategies.reduce((sum, s) => sum + s.mitigation_actions.reduce((aSum, a) => aSum + a.estimated_cost, 0), 0);

  const costByStrategy = ["avoid", "reduce", "transfer", "accept"].map(type => ({
    strategy_type: type,
    cost: strategies.filter(s => s.strategy_type === type).reduce((sum, s) => sum + s.mitigation_actions.reduce((aSum, a) => aSum + a.estimated_cost, 0), 0),
    risk_count: strategies.filter(s => s.strategy_type === type).length,
  }));

  const costEffectiveness = strategies.map(s => {
    const cost = s.mitigation_actions.reduce((sum, a) => sum + a.estimated_cost, 0);
    const originalRisk = validated.prioritized_risks.find(r => r.risk_id === s.risk_id)!;
    const reduction = originalRisk.risk_score - s.expected_reduction.residual_risk_score;
    return {
      risk_id: s.risk_id,
      cost,
      risk_reduction: Math.round(reduction * 10) / 10,
      cost_per_point: reduction > 0 ? Math.round(cost / reduction) : 0,
    };
  });

  // Residual risk profile
  const originalExposure = validated.prioritized_risks.reduce((sum, r) => sum + r.risk_score, 0);
  const residualExposure = strategies.reduce((sum, s) => sum + s.expected_reduction.residual_risk_score, 0);

  return {
    mitigation_plan_id: generateUUID(),
    event_id: validated.event_id,
    mitigation_strategies: strategies,
    cost_summary: {
      total_mitigation_cost: totalCost,
      cost_by_strategy: costByStrategy,
      cost_effectiveness: costEffectiveness,
    },
    residual_risk_profile: {
      total_residual_exposure: Math.round(residualExposure * 10) / 10,
      original_exposure: Math.round(originalExposure * 10) / 10,
      reduction_percentage: Math.round((1 - residualExposure / originalExposure) * 100),
      remaining_high_risks: strategies.filter(s => s.expected_reduction.residual_risk_score >= 10).map(s => s.risk_id),
    },
    implementation_roadmap: [
      {
        phase: "Phase 1: 즉시 대응",
        timeline: "1주",
        actions: strategies.filter(s => s.strategy_type === "avoid" || validated.prioritized_risks.find(r => r.risk_id === s.risk_id)?.priority_tier === "immediate").flatMap(s => s.mitigation_actions.map(a => a.action)),
        milestones: ["Critical 리스크 완화 완료"],
      },
      {
        phase: "Phase 2: 핵심 완화",
        timeline: "2-4주",
        actions: strategies.filter(s => validated.prioritized_risks.find(r => r.risk_id === s.risk_id)?.priority_tier === "high").flatMap(s => s.mitigation_actions.map(a => a.action)),
        milestones: ["High 리스크 완화 완료"],
      },
      {
        phase: "Phase 3: 지속 관리",
        timeline: "지속",
        actions: ["정기 모니터링", "잔여 리스크 관리"],
        milestones: ["리스크 관리 체계 안정화"],
      },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
