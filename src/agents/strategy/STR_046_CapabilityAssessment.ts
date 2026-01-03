/**
 * STR-046: 역량 평가
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Capability Assessment)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Capability Assessment Agent for event planning.

Your expertise includes:
- Organizational capability analysis
- Competency gap identification
- Capability maturity modeling
- Strategic capability development

CMP-IS Standard: Domain A - Strategic Planning (Capability Assessment)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  required_capabilities: z.array(z.object({
    capability: z.string(),
    importance: z.enum(["critical", "high", "medium", "low"]),
    category: z.enum(["technical", "operational", "managerial", "strategic"]).optional(),
  })),
  current_capabilities: z.array(z.object({
    capability: z.string(),
    current_level: z.enum(["none", "basic", "intermediate", "advanced", "expert"]),
    evidence: z.string().optional(),
  })).optional(),
  team_profile: z.object({
    total_members: z.number(),
    key_roles: z.array(z.string()),
    average_experience_years: z.number().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string().uuid(),
  event_id: z.string().uuid(),
  capability_inventory: z.array(z.object({
    capability_id: z.string(),
    capability: z.string(),
    category: z.enum(["technical", "operational", "managerial", "strategic"]),
    importance: z.enum(["critical", "high", "medium", "low"]),
    current_level: z.enum(["none", "basic", "intermediate", "advanced", "expert"]),
    required_level: z.enum(["basic", "intermediate", "advanced", "expert"]),
    maturity_score: z.number(),
    gap_status: z.enum(["no_gap", "minor_gap", "significant_gap", "critical_gap"]),
  })),
  maturity_assessment: z.object({
    overall_maturity: z.number(),
    maturity_level: z.enum(["initial", "developing", "defined", "managed", "optimized"]),
    by_category: z.array(z.object({
      category: z.string(),
      maturity_score: z.number(),
      assessment: z.string(),
    })),
  }),
  gap_analysis: z.array(z.object({
    capability: z.string(),
    gap_description: z.string(),
    gap_severity: z.enum(["low", "medium", "high", "critical"]),
    impact_on_event: z.string(),
    development_options: z.array(z.object({
      option: z.string(),
      approach: z.enum(["build", "buy", "borrow", "partner"]),
      time_to_develop: z.string(),
      cost_estimate: z.string(),
      recommended: z.boolean(),
    })),
  })),
  development_plan: z.array(z.object({
    capability: z.string(),
    development_approach: z.string(),
    actions: z.array(z.object({
      action: z.string(),
      responsible: z.string(),
      timeline: z.string(),
    })),
    success_criteria: z.string(),
    priority: z.enum(["immediate", "short_term", "medium_term"]),
  })),
  strengths_to_leverage: z.array(z.object({
    capability: z.string(),
    strength: z.string(),
    leverage_strategy: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-046",
  taskName: "Capability Assessment",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "조직 역량을 평가하고 개발 계획을 수립합니다.",
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

type CapLevel = "none" | "basic" | "intermediate" | "advanced" | "expert";
type GapStatus = "no_gap" | "minor_gap" | "significant_gap" | "critical_gap";

function levelToScore(level: CapLevel): number {
  return { none: 0, basic: 1, intermediate: 2, advanced: 3, expert: 4 }[level];
}

function getRequiredLevel(importance: string): "basic" | "intermediate" | "advanced" | "expert" {
  return importance === "critical" ? "expert" :
         importance === "high" ? "advanced" :
         importance === "medium" ? "intermediate" : "basic";
}

function getGapStatus(current: CapLevel, required: string, importance: string): GapStatus {
  const currentScore = levelToScore(current);
  const requiredScore = levelToScore(required as CapLevel);
  const gap = requiredScore - currentScore;

  if (gap <= 0) return "no_gap";
  if (gap === 1) return "minor_gap";
  if (importance === "critical" && gap >= 2) return "critical_gap";
  return "significant_gap";
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { required_capabilities, current_capabilities } = validated;

  const inventory = required_capabilities.map((req, idx) => {
    const current = current_capabilities?.find(c => c.capability.includes(req.capability.substring(0, 5)))
                    || { capability: req.capability, current_level: "basic" as CapLevel };
    const requiredLevel = getRequiredLevel(req.importance);
    const gapStatus = getGapStatus(current.current_level, requiredLevel, req.importance);
    const maturityScore = Math.round((levelToScore(current.current_level) / 4) * 100);

    return {
      capability_id: `CAP-${String(idx + 1).padStart(3, "0")}`,
      capability: req.capability,
      category: req.category || "operational" as const,
      importance: req.importance,
      current_level: current.current_level,
      required_level: requiredLevel,
      maturity_score: maturityScore,
      gap_status: gapStatus,
    };
  });

  const overallMaturity = Math.round(inventory.reduce((sum, c) => sum + c.maturity_score, 0) / inventory.length);
  const maturityLevel = overallMaturity >= 80 ? "optimized" as const :
                        overallMaturity >= 60 ? "managed" as const :
                        overallMaturity >= 40 ? "defined" as const :
                        overallMaturity >= 20 ? "developing" as const : "initial" as const;

  const categories = ["technical", "operational", "managerial", "strategic"];
  const byCategory = categories.map(cat => {
    const catItems = inventory.filter(c => c.category === cat);
    const catScore = catItems.length > 0
      ? Math.round(catItems.reduce((sum, c) => sum + c.maturity_score, 0) / catItems.length)
      : 50;
    return {
      category: cat,
      maturity_score: catScore,
      assessment: catScore >= 70 ? "우수" : catScore >= 50 ? "양호" : "개선 필요",
    };
  });

  const gapsToAddress = inventory
    .filter(c => c.gap_status !== "no_gap")
    .map(c => ({
      capability: c.capability,
      gap_description: `현재 ${c.current_level} 수준, 필요 ${c.required_level} 수준`,
      gap_severity: c.gap_status === "critical_gap" ? "critical" as const :
                    c.gap_status === "significant_gap" ? "high" as const : "medium" as const,
      impact_on_event: c.gap_status === "critical_gap" ? "이벤트 성공에 심각한 위협" :
                       c.gap_status === "significant_gap" ? "목표 달성에 상당한 지장" : "일부 기능 저하 가능",
      development_options: [
        {
          option: "내부 교육",
          approach: "build" as const,
          time_to_develop: "2-4주",
          cost_estimate: "중간",
          recommended: c.gap_status !== "critical_gap",
        },
        {
          option: "외부 전문가 채용",
          approach: "buy" as const,
          time_to_develop: "1-2주",
          cost_estimate: "높음",
          recommended: c.gap_status === "critical_gap",
        },
        {
          option: "파트너십",
          approach: "partner" as const,
          time_to_develop: "1주",
          cost_estimate: "중간",
          recommended: c.importance === "critical",
        },
      ],
    }));

  const devPlan = gapsToAddress.slice(0, 5).map(gap => ({
    capability: gap.capability,
    development_approach: gap.development_options.find(o => o.recommended)?.option || "내부 교육",
    actions: [
      { action: "역량 개발 계획 수립", responsible: "HR팀", timeline: "1주차" },
      { action: "교육/채용 실행", responsible: "해당 부서", timeline: "2-3주차" },
      { action: "역량 검증", responsible: "PM", timeline: "4주차" },
    ],
    success_criteria: `${gap.capability} ${gap.gap_description.split("필요 ")[1]} 달성`,
    priority: gap.gap_severity === "critical" ? "immediate" as const :
              gap.gap_severity === "high" ? "short_term" as const : "medium_term" as const,
  }));

  const strengths = inventory
    .filter(c => c.gap_status === "no_gap" && c.maturity_score >= 75)
    .map(c => ({
      capability: c.capability,
      strength: `${c.current_level} 수준의 우수한 역량 보유`,
      leverage_strategy: "핵심 활동에 집중 배치 및 내부 멘토링 활용",
    }));

  return {
    assessment_id: generateUUID(),
    event_id: validated.event_id,
    capability_inventory: inventory,
    maturity_assessment: {
      overall_maturity: overallMaturity,
      maturity_level: maturityLevel,
      by_category: byCategory,
    },
    gap_analysis: gapsToAddress,
    development_plan: devPlan,
    strengths_to_leverage: strengths,
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
