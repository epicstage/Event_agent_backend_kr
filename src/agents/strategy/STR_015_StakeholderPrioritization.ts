/**
 * STR-015: 이해관계자 우선순위화
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Stakeholder Prioritization)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Prioritization Agent for strategic event planning.

Your expertise includes:
- Multi-criteria stakeholder prioritization
- Resource allocation based on stakeholder importance
- Salience model application (Power, Legitimacy, Urgency)
- Prioritization frameworks and scoring

CMP-IS Standard: Domain A - Strategic Planning (Stakeholder Prioritization)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  stakeholders: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    power: z.number().min(1).max(10),
    legitimacy: z.number().min(1).max(10).optional(),
    urgency: z.number().min(1).max(10).optional(),
    interest: z.number().min(1).max(10),
    resource_requirement: z.enum(["high", "medium", "low"]).optional(),
  })),
  prioritization_criteria: z.array(z.object({
    criterion: z.string(),
    weight: z.number().min(0).max(100),
  })).optional(),
  available_resources: z.object({
    budget_percent: z.number().optional(),
    time_hours: z.number().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  prioritization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  prioritized_list: z.array(z.object({
    rank: z.number(),
    stakeholder_id: z.string(),
    name: z.string(),
    priority_score: z.number(),
    salience_type: z.enum(["definitive", "dominant", "dangerous", "dependent", "dormant", "discretionary", "demanding", "non_stakeholder"]),
    tier: z.enum(["tier_1_critical", "tier_2_important", "tier_3_supportive", "tier_4_monitor"]),
    resource_allocation: z.object({
      budget_percent: z.number(),
      time_percent: z.number(),
      attention_level: z.enum(["intensive", "regular", "periodic", "minimal"]),
    }),
    engagement_approach: z.string(),
  })),
  tier_summary: z.object({
    tier_1: z.number(),
    tier_2: z.number(),
    tier_3: z.number(),
    tier_4: z.number(),
  }),
  resource_distribution: z.object({
    total_budget_allocated: z.number(),
    time_distribution: z.record(z.string(), z.number()),
  }),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-015",
  taskName: "Stakeholder Prioritization",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자 우선순위를 결정하고 자원 배분 계획을 수립합니다.",
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

type SalienceType = "definitive" | "dominant" | "dangerous" | "dependent" | "dormant" | "discretionary" | "demanding" | "non_stakeholder";

function determineSalience(power: number, legitimacy: number, urgency: number): SalienceType {
  const p = power >= 6, l = legitimacy >= 6, u = urgency >= 6;
  if (p && l && u) return "definitive";
  if (p && l) return "dominant";
  if (p && u) return "dangerous";
  if (l && u) return "dependent";
  if (p) return "dormant";
  if (l) return "discretionary";
  if (u) return "demanding";
  return "non_stakeholder";
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const scored = validated.stakeholders.map(s => {
    const legitimacy = s.legitimacy ?? 5;
    const urgency = s.urgency ?? 5;
    const score = s.power * 0.4 + s.interest * 0.3 + legitimacy * 0.15 + urgency * 0.15;
    const salience = determineSalience(s.power, legitimacy, urgency);
    return { ...s, score: Math.round(score * 10), salience, legitimacy, urgency };
  }).sort((a, b) => b.score - a.score);

  const prioritized = scored.map((s, index) => {
    const tier = index < scored.length * 0.2 ? "tier_1_critical" :
      index < scored.length * 0.5 ? "tier_2_important" :
      index < scored.length * 0.8 ? "tier_3_supportive" : "tier_4_monitor";

    const budgetAlloc = tier === "tier_1_critical" ? 35 : tier === "tier_2_important" ? 25 : tier === "tier_3_supportive" ? 10 : 5;

    return {
      rank: index + 1,
      stakeholder_id: s.id,
      name: s.name,
      priority_score: s.score,
      salience_type: s.salience,
      tier: tier as "tier_1_critical" | "tier_2_important" | "tier_3_supportive" | "tier_4_monitor",
      resource_allocation: {
        budget_percent: budgetAlloc,
        time_percent: budgetAlloc,
        attention_level: tier === "tier_1_critical" ? "intensive" as const :
          tier === "tier_2_important" ? "regular" as const :
          tier === "tier_3_supportive" ? "periodic" as const : "minimal" as const,
      },
      engagement_approach: tier === "tier_1_critical" ? "직접적이고 빈번한 소통, 의사결정 참여" :
        tier === "tier_2_important" ? "정기적 업데이트 및 협의" :
        tier === "tier_3_supportive" ? "주기적 정보 공유" : "필요시 연락",
    };
  });

  return {
    prioritization_id: generateUUID(),
    event_id: validated.event_id,
    prioritized_list: prioritized,
    tier_summary: {
      tier_1: prioritized.filter(p => p.tier === "tier_1_critical").length,
      tier_2: prioritized.filter(p => p.tier === "tier_2_important").length,
      tier_3: prioritized.filter(p => p.tier === "tier_3_supportive").length,
      tier_4: prioritized.filter(p => p.tier === "tier_4_monitor").length,
    },
    resource_distribution: {
      total_budget_allocated: 100,
      time_distribution: Object.fromEntries(prioritized.slice(0, 5).map(p => [p.name, p.resource_allocation.time_percent])),
    },
    recommendations: [
      "Tier 1 이해관계자에게 가장 많은 리소스를 집중하세요.",
      "Tier 4라도 갑작스러운 영향력 증가에 대비하여 모니터링하세요.",
      "분기별로 우선순위를 재검토하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
