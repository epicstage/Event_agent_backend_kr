/**
 * STR-028: 리스크 평가
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Assessment)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Assessment Agent for event planning.

Your expertise includes:
- Probability and impact analysis
- Risk scoring and prioritization
- Qualitative and quantitative assessment methods
- Risk matrix development

CMP-IS Standard: Domain A - Strategic Planning (Risk Assessment)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  risks: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    category: z.string(),
    description: z.string().optional(),
    historical_occurrence: z.boolean().optional(),
  })),
  assessment_criteria: z.object({
    probability_scale: z.enum(["3_point", "5_point"]).optional(),
    impact_dimensions: z.array(z.enum(["schedule", "cost", "quality", "safety", "reputation"])).optional(),
  }).optional(),
  context: z.object({
    event_budget: z.number().optional(),
    event_timeline_days: z.number().optional(),
    risk_tolerance: z.enum(["low", "medium", "high"]).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string().uuid(),
  event_id: z.string().uuid(),
  risk_assessments: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    probability: z.object({
      score: z.number(),
      level: z.enum(["very_low", "low", "medium", "high", "very_high"]),
      rationale: z.string(),
    }),
    impact: z.object({
      overall_score: z.number(),
      level: z.enum(["negligible", "minor", "moderate", "major", "severe"]),
      by_dimension: z.array(z.object({
        dimension: z.string(),
        score: z.number(),
        description: z.string(),
      })),
    }),
    risk_score: z.number(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    priority_rank: z.number(),
  })),
  risk_matrix: z.object({
    high_probability_high_impact: z.array(z.string()),
    high_probability_low_impact: z.array(z.string()),
    low_probability_high_impact: z.array(z.string()),
    low_probability_low_impact: z.array(z.string()),
  }),
  priority_summary: z.object({
    critical_risks: z.array(z.object({
      risk_id: z.string(),
      risk_name: z.string(),
      risk_score: z.number(),
      immediate_action: z.string(),
    })),
    high_risks: z.array(z.string()),
    medium_risks: z.array(z.string()),
    low_risks: z.array(z.string()),
  }),
  exposure_analysis: z.object({
    total_risk_exposure: z.number(),
    exposure_by_category: z.array(z.object({
      category: z.string(),
      exposure: z.number(),
      percentage: z.number(),
    })),
    acceptable_threshold: z.number(),
    status: z.enum(["within_tolerance", "needs_attention", "exceeds_tolerance"]),
  }),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-028",
  taskName: "Risk Assessment",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "식별된 리스크의 확률과 영향을 평가하고 우선순위를 결정합니다.",
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

type ProbLevel = "very_low" | "low" | "medium" | "high" | "very_high";
type ImpactLevel = "negligible" | "minor" | "moderate" | "major" | "severe";
type RiskLevel = "low" | "medium" | "high" | "critical";

function getProbabilityLevel(score: number): ProbLevel {
  if (score <= 1) return "very_low";
  if (score <= 2) return "low";
  if (score <= 3) return "medium";
  if (score <= 4) return "high";
  return "very_high";
}

function getImpactLevel(score: number): ImpactLevel {
  if (score <= 1) return "negligible";
  if (score <= 2) return "minor";
  if (score <= 3) return "moderate";
  if (score <= 4) return "major";
  return "severe";
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 5) return "low";
  if (score <= 10) return "medium";
  if (score <= 15) return "high";
  return "critical";
}

// Simulated probability scores based on category
const CATEGORY_PROBABILITY: Record<string, number> = {
  operational: 3.5,
  financial: 3,
  technical: 2.5,
  external: 2,
  safety: 1.5,
  strategic: 2.5,
  compliance: 2,
  reputational: 2,
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const dimensions = validated.assessment_criteria?.impact_dimensions || ["schedule", "cost", "quality", "safety", "reputation"];
  const tolerance = validated.context?.risk_tolerance || "medium";
  const toleranceThreshold = tolerance === "low" ? 100 : tolerance === "medium" ? 150 : 200;

  const assessments = validated.risks.map(risk => {
    // Simulate probability based on category and history
    const baseProb = CATEGORY_PROBABILITY[risk.category] || 2.5;
    const probScore = risk.historical_occurrence ? Math.min(baseProb + 1, 5) : baseProb + (Math.random() - 0.5);
    const probRounded = Math.round(probScore * 10) / 10;

    // Simulate impact by dimension
    const dimImpacts = dimensions.map(dim => ({
      dimension: dim,
      score: Math.round((2 + Math.random() * 2) * 10) / 10,
      description: `${dim} 영역에 미치는 영향`,
    }));

    const avgImpact = dimImpacts.reduce((sum, d) => sum + d.score, 0) / dimImpacts.length;
    const impactRounded = Math.round(avgImpact * 10) / 10;

    const riskScore = Math.round(probRounded * impactRounded * 10) / 10;

    return {
      risk_id: risk.risk_id,
      risk_name: risk.risk_name,
      probability: {
        score: probRounded,
        level: getProbabilityLevel(probRounded),
        rationale: `${risk.category} 유형 리스크의 일반적 발생 확률 기반`,
      },
      impact: {
        overall_score: impactRounded,
        level: getImpactLevel(impactRounded),
        by_dimension: dimImpacts,
      },
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore),
      priority_rank: 0, // Will be set after sorting
    };
  });

  // Sort by risk score and assign ranks
  assessments.sort((a, b) => b.risk_score - a.risk_score);
  assessments.forEach((a, idx) => {
    a.priority_rank = idx + 1;
  });

  // Build risk matrix
  const riskMatrix = {
    high_probability_high_impact: assessments.filter(a => a.probability.score >= 3 && a.impact.overall_score >= 3).map(a => a.risk_id),
    high_probability_low_impact: assessments.filter(a => a.probability.score >= 3 && a.impact.overall_score < 3).map(a => a.risk_id),
    low_probability_high_impact: assessments.filter(a => a.probability.score < 3 && a.impact.overall_score >= 3).map(a => a.risk_id),
    low_probability_low_impact: assessments.filter(a => a.probability.score < 3 && a.impact.overall_score < 3).map(a => a.risk_id),
  };

  // Priority summary
  const criticalRisks = assessments.filter(a => a.risk_level === "critical").map(a => ({
    risk_id: a.risk_id,
    risk_name: a.risk_name,
    risk_score: a.risk_score,
    immediate_action: "즉시 대응 계획 수립 및 실행 필요",
  }));

  // Calculate exposure
  const totalExposure = assessments.reduce((sum, a) => sum + a.risk_score, 0);
  const categoryExposure = new Map<string, number>();
  validated.risks.forEach((r, idx) => {
    const score = assessments[idx].risk_score;
    categoryExposure.set(r.category, (categoryExposure.get(r.category) || 0) + score);
  });

  const exposureByCategory = Array.from(categoryExposure.entries()).map(([category, exposure]) => ({
    category,
    exposure: Math.round(exposure * 10) / 10,
    percentage: Math.round((exposure / totalExposure) * 100),
  }));

  return {
    assessment_id: generateUUID(),
    event_id: validated.event_id,
    risk_assessments: assessments,
    risk_matrix: riskMatrix,
    priority_summary: {
      critical_risks: criticalRisks,
      high_risks: assessments.filter(a => a.risk_level === "high").map(a => a.risk_id),
      medium_risks: assessments.filter(a => a.risk_level === "medium").map(a => a.risk_id),
      low_risks: assessments.filter(a => a.risk_level === "low").map(a => a.risk_id),
    },
    exposure_analysis: {
      total_risk_exposure: Math.round(totalExposure * 10) / 10,
      exposure_by_category: exposureByCategory,
      acceptable_threshold: toleranceThreshold,
      status: totalExposure <= toleranceThreshold * 0.7 ? "within_tolerance" : totalExposure <= toleranceThreshold ? "needs_attention" : "exceeds_tolerance",
    },
    recommendations: [
      `Critical/High 리스크 ${criticalRisks.length + assessments.filter(a => a.risk_level === "high").length}건에 대한 즉각적 대응 계획 필요`,
      "고확률-고영향 리스크에 자원 우선 배분",
      "정기적 리스크 재평가 일정 수립",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
