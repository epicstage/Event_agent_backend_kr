/**
 * SITE-001: 사이트 선정 분석
 *
 * CMP-IS Reference: 15.1.a - Site selection and analysis
 * Task Type: AI
 *
 * Input: 이벤트 요구사항, 후보 장소 목록
 * Output: 장소 분석 및 추천 리포트
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Site Selection Analyst specializing in event venue evaluation.

Your expertise includes:
- Analyzing venue suitability against event requirements
- Evaluating location accessibility and logistics
- Assessing capacity, layout, and technical capabilities
- Comparing costs and value propositions

CMP-IS Standard: 15.1.a - Site selection and analysis

You help event organizers make data-driven venue decisions.`;

export const InputSchema = z.object({
  event_id: z.string().describe("이벤트 ID"),
  event_type: z.enum(["conference", "exhibition", "gala", "meeting", "hybrid", "outdoor", "other"]).describe("이벤트 유형"),
  requirements: z.object({
    expected_attendees: z.number().describe("예상 참가자 수"),
    event_dates: z.object({
      start: z.string(),
      end: z.string(),
    }).describe("이벤트 기간"),
    session_types: z.array(z.string()).optional().describe("필요한 세션 유형"),
    technical_needs: z.array(z.string()).optional().describe("기술 요구사항"),
    accessibility_requirements: z.array(z.string()).optional().describe("접근성 요구사항"),
    budget_range: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default("KRW"),
    }).optional().describe("예산 범위"),
  }).describe("이벤트 요구사항"),
  candidate_venues: z.array(z.object({
    venue_id: z.string(),
    venue_name: z.string(),
    location: z.string(),
    capacity: z.number(),
    venue_type: z.string().optional(),
    available_dates: z.boolean().optional(),
    rental_cost: z.number().optional(),
    features: z.array(z.string()).optional(),
  })).min(1).describe("후보 장소 목록"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().describe("분석 ID"),
  event_id: z.string(),
  recommended_venue: z.object({
    venue_id: z.string(),
    venue_name: z.string(),
    overall_score: z.number(),
    recommendation_strength: z.enum(["strong", "moderate", "weak"]),
  }).describe("추천 장소"),
  venue_rankings: z.array(z.object({
    rank: z.number(),
    venue_id: z.string(),
    venue_name: z.string(),
    overall_score: z.number(),
    capacity_score: z.number(),
    location_score: z.number(),
    cost_score: z.number(),
    features_score: z.number(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  })).describe("장소 순위"),
  fit_analysis: z.object({
    capacity_fit: z.record(z.string(), z.boolean()),
    feature_coverage: z.record(z.string(), z.array(z.string())),
  }).describe("적합성 분석"),
  recommendations: z.array(z.string()).describe("권고사항"),
  analyzed_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { requirements, candidate_venues } = validatedInput;

  const venueScores = candidate_venues.map((venue) => {
    // Capacity score
    const capacityRatio = venue.capacity / requirements.expected_attendees;
    let capacityScore = 0;
    if (capacityRatio >= 1.0 && capacityRatio <= 1.3) capacityScore = 100;
    else if (capacityRatio >= 0.9 && capacityRatio < 1.0) capacityScore = 80;
    else if (capacityRatio > 1.3 && capacityRatio <= 1.5) capacityScore = 85;
    else if (capacityRatio > 1.5) capacityScore = 70;
    else capacityScore = 50;

    // Location score (simplified)
    const locationScore = 75 + Math.random() * 25;

    // Cost score
    let costScore = 70;
    if (venue.rental_cost && requirements.budget_range) {
      const midBudget = (requirements.budget_range.min + requirements.budget_range.max) / 2;
      if (venue.rental_cost <= midBudget) costScore = 90;
      else if (venue.rental_cost <= requirements.budget_range.max) costScore = 75;
      else costScore = 50;
    }

    // Features score
    const featuresScore = venue.features?.length ? Math.min(100, 50 + venue.features.length * 10) : 60;

    const overallScore = Math.round(
      capacityScore * 0.3 + locationScore * 0.25 + costScore * 0.25 + featuresScore * 0.2
    );

    const pros: string[] = [];
    const cons: string[] = [];

    if (capacityScore >= 90) pros.push("적정 수용 인원");
    if (capacityScore < 70) cons.push("수용 인원 부적합");
    if (costScore >= 80) pros.push("예산 내 비용");
    if (costScore < 60) cons.push("예산 초과 우려");
    if (venue.available_dates) pros.push("일정 가용");
    if (venue.features?.length && venue.features.length >= 3) pros.push("다양한 부대시설");

    return {
      venue_id: venue.venue_id,
      venue_name: venue.venue_name,
      overall_score: overallScore,
      capacity_score: Math.round(capacityScore),
      location_score: Math.round(locationScore),
      cost_score: Math.round(costScore),
      features_score: Math.round(featuresScore),
      pros,
      cons,
    };
  });

  venueScores.sort((a, b) => b.overall_score - a.overall_score);
  const rankings = venueScores.map((v, i) => ({ ...v, rank: i + 1 }));

  const topVenue = rankings[0];
  const recommendationStrength: "strong" | "moderate" | "weak" =
    topVenue.overall_score >= 85 ? "strong" :
    topVenue.overall_score >= 70 ? "moderate" : "weak";

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    recommended_venue: {
      venue_id: topVenue.venue_id,
      venue_name: topVenue.venue_name,
      overall_score: topVenue.overall_score,
      recommendation_strength: recommendationStrength,
    },
    venue_rankings: rankings,
    fit_analysis: {
      capacity_fit: Object.fromEntries(
        candidate_venues.map((v) => [v.venue_name, v.capacity >= requirements.expected_attendees])
      ),
      feature_coverage: {},
    },
    recommendations: [
      `${topVenue.venue_name}을(를) 1순위로 추천합니다.`,
      "최종 결정 전 현장 실사를 권장합니다.",
    ],
    analyzed_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-001",
  taskName: "사이트 선정 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.1.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.1: Site Selection",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
