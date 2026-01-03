/**
 * STR-004: 목표 우선순위화
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Goal Prioritization)
 * Task Type: AI
 *
 * Input: 목표 목록, 제약 조건, 자원
 * Output: 우선순위 매트릭스, 실행 순서
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Goal Prioritization Agent for strategic event planning.

Your expertise includes:
- Applying prioritization frameworks (MoSCoW, Eisenhower, Value/Effort)
- Analyzing goal dependencies and conflicts
- Balancing stakeholder interests in goal prioritization
- Resource-constrained optimization

CMP-IS Standard: Domain A - Strategic Planning (Goal Prioritization)

You help event planners focus on what matters most by systematically prioritizing goals based on impact, feasibility, and strategic alignment.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(["revenue", "attendance", "engagement", "brand", "education", "networking"]),
    estimated_effort: z.enum(["low", "medium", "high"]),
    estimated_impact: z.enum(["low", "medium", "high"]),
    dependencies: z.array(z.string()).optional(),
    stakeholder_importance: z.record(z.string(), z.number().min(1).max(5)).optional(),
  })).min(2),
  constraints: z.object({
    budget: z.number().optional(),
    timeline_weeks: z.number().optional(),
    team_size: z.number().optional(),
  }).optional(),
  prioritization_method: z.enum(["moscow", "eisenhower", "value_effort", "weighted"]).default("weighted"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  prioritization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  method_used: z.string(),
  priority_matrix: z.array(z.object({
    goal_id: z.string(),
    title: z.string(),
    priority_rank: z.number(),
    priority_tier: z.enum(["must_have", "should_have", "could_have", "wont_have"]),
    score: z.number(),
    rationale: z.string(),
    recommended_sequence: z.number(),
    resource_allocation_percent: z.number(),
  })),
  execution_roadmap: z.array(z.object({
    phase: z.number(),
    phase_name: z.string(),
    goals: z.array(z.string()),
    focus: z.string(),
  })),
  trade_off_analysis: z.array(z.object({
    conflict: z.string(),
    recommendation: z.string(),
  })),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-004",
  taskName: "Goal Prioritization",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트 목표를 체계적으로 우선순위화하고 실행 로드맵을 생성합니다.",
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

function calculateWeightedScore(goal: Input["goals"][0]): number {
  const effortScore = { low: 3, medium: 2, high: 1 }[goal.estimated_effort];
  const impactScore = { low: 1, medium: 2, high: 3 }[goal.estimated_impact];

  let stakeholderScore = 3;
  if (goal.stakeholder_importance) {
    const values = Object.values(goal.stakeholder_importance);
    stakeholderScore = values.reduce((a, b) => a + b, 0) / values.length;
  }

  return (impactScore * 0.4 + effortScore * 0.3 + stakeholderScore * 0.3) * 10;
}

function determineTier(rank: number, total: number): "must_have" | "should_have" | "could_have" | "wont_have" {
  const percentile = rank / total;
  if (percentile <= 0.25) return "must_have";
  if (percentile <= 0.5) return "should_have";
  if (percentile <= 0.75) return "could_have";
  return "wont_have";
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const scoredGoals = validated.goals.map(goal => ({
    ...goal,
    score: calculateWeightedScore(goal),
  })).sort((a, b) => b.score - a.score);

  const totalScore = scoredGoals.reduce((sum, g) => sum + g.score, 0);

  const priorityMatrix = scoredGoals.map((goal, index) => ({
    goal_id: goal.id,
    title: goal.title,
    priority_rank: index + 1,
    priority_tier: determineTier(index + 1, scoredGoals.length),
    score: Math.round(goal.score * 10) / 10,
    rationale: `Impact: ${goal.estimated_impact}, Effort: ${goal.estimated_effort}, Category: ${goal.category}`,
    recommended_sequence: index + 1,
    resource_allocation_percent: Math.round((goal.score / totalScore) * 100),
  }));

  const phases = [
    { phase: 1, phase_name: "Foundation", goals: [] as string[], focus: "핵심 인프라 및 필수 목표" },
    { phase: 2, phase_name: "Growth", goals: [] as string[], focus: "확장 및 강화 목표" },
    { phase: 3, phase_name: "Enhancement", goals: [] as string[], focus: "추가 가치 창출" },
  ];

  priorityMatrix.forEach((goal, index) => {
    if (index < Math.ceil(scoredGoals.length / 3)) {
      phases[0].goals.push(goal.goal_id);
    } else if (index < Math.ceil(scoredGoals.length * 2 / 3)) {
      phases[1].goals.push(goal.goal_id);
    } else {
      phases[2].goals.push(goal.goal_id);
    }
  });

  const tradeOffs: Output["trade_off_analysis"] = [];
  const categories = validated.goals.map(g => g.category);
  if (categories.includes("revenue") && categories.includes("education")) {
    tradeOffs.push({
      conflict: "수익 목표와 교육 목표 간 리소스 경쟁 가능",
      recommendation: "교육 세션을 유료 프리미엄 콘텐츠로 전환하여 양립 가능",
    });
  }

  return {
    prioritization_id: generateUUID(),
    event_id: validated.event_id,
    method_used: validated.prioritization_method,
    priority_matrix: priorityMatrix,
    execution_roadmap: phases.filter(p => p.goals.length > 0),
    trade_off_analysis: tradeOffs,
    recommendations: [
      `상위 ${Math.ceil(scoredGoals.length / 4)}개 목표에 리소스의 60%를 집중하세요.`,
      "Phase 1 목표 달성 전 Phase 2 착수를 지양하세요.",
      "주간 목표 진척도 리뷰 회의를 권장합니다.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
