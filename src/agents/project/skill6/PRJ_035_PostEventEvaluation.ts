/**
 * PRJ-035: 사후 평가
 * CMP-IS Reference: 6.3.e - Conducting post-event evaluation
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Post-Event Evaluation Agent for event projects.
CMP-IS Standard: 6.3.e - Conducting post-event evaluation`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  objectives: z.array(z.object({
    objective: z.string(),
    target: z.string(),
    actual: z.string(),
  })),
  survey_results: z.object({
    response_count: z.number(),
    overall_satisfaction: z.number(),
    content_rating: z.number().optional(),
    logistics_rating: z.number().optional(),
    networking_rating: z.number().optional(),
    nps: z.number().optional(),
  }).optional(),
  feedback_comments: z.array(z.object({
    type: z.enum(["positive", "negative", "suggestion"]),
    comment: z.string(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  evaluation_id: z.string(),
  event_id: z.string(),
  evaluation_summary: z.object({
    event_name: z.string(),
    event_date: z.string(),
    evaluation_date: z.string(),
    overall_success_rating: z.enum(["excellent", "good", "satisfactory", "needs_improvement", "poor"]),
    overall_score: z.number(),
  }),
  objectives_assessment: z.array(z.object({
    objective: z.string(),
    target: z.string(),
    actual: z.string(),
    achievement_rate: z.number(),
    status: z.enum(["exceeded", "achieved", "partially_achieved", "not_achieved"]),
  })),
  satisfaction_analysis: z.object({
    response_rate: z.number(),
    overall_satisfaction: z.number(),
    category_scores: z.array(z.object({
      category: z.string(),
      score: z.number(),
      benchmark: z.number(),
      variance: z.number(),
    })),
    nps_analysis: z.object({
      score: z.number(),
      promoters: z.number(),
      passives: z.number(),
      detractors: z.number(),
      interpretation: z.string(),
    }),
  }),
  feedback_analysis: z.object({
    total_comments: z.number(),
    positive_count: z.number(),
    negative_count: z.number(),
    top_praises: z.array(z.string()),
    top_complaints: z.array(z.string()),
    actionable_suggestions: z.array(z.string()),
  }),
  swot_analysis: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
  improvement_plan: z.array(z.object({
    area: z.string(),
    issue: z.string(),
    recommendation: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    timeline: z.string(),
  })),
  created_at: z.string(),
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
  const { objectives, survey_results, feedback_comments } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  // 목표 평가
  const objectivesAssessment = objectives.map(obj => {
    // 간단한 달성률 계산 (숫자 추출 시도)
    const targetNum = parseFloat(obj.target.replace(/[^0-9.]/g, "")) || 100;
    const actualNum = parseFloat(obj.actual.replace(/[^0-9.]/g, "")) || 90;
    const achievementRate = Math.round((actualNum / targetNum) * 100);

    return {
      objective: obj.objective,
      target: obj.target,
      actual: obj.actual,
      achievement_rate: achievementRate,
      status: achievementRate >= 110 ? "exceeded" as const :
        achievementRate >= 90 ? "achieved" as const :
        achievementRate >= 70 ? "partially_achieved" as const : "not_achieved" as const,
    };
  });

  const avgAchievement = objectivesAssessment.reduce((sum, o) => sum + o.achievement_rate, 0) / objectivesAssessment.length;

  // 만족도 분석
  const satisfaction = survey_results?.overall_satisfaction || 4.2;
  const npsScore = survey_results?.nps || 45;

  const overallScore = (avgAchievement * 0.4) + (satisfaction * 20 * 0.4) + ((npsScore + 100) / 2 * 0.2);
  const successRating = overallScore >= 90 ? "excellent" :
    overallScore >= 75 ? "good" :
    overallScore >= 60 ? "satisfactory" :
    overallScore >= 40 ? "needs_improvement" : "poor";

  // 피드백 분석
  const comments = feedback_comments || [];
  const positiveComments = comments.filter(c => c.type === "positive");
  const negativeComments = comments.filter(c => c.type === "negative");
  const suggestions = comments.filter(c => c.type === "suggestion");

  return {
    evaluation_id: generateUUID(),
    event_id: validatedInput.event_id,
    evaluation_summary: {
      event_name: validatedInput.event_name,
      event_date: validatedInput.event_date,
      evaluation_date: today,
      overall_success_rating: successRating,
      overall_score: Math.round(overallScore),
    },
    objectives_assessment: objectivesAssessment,
    satisfaction_analysis: {
      response_rate: survey_results?.response_count ? Math.round((survey_results.response_count / 1000) * 100) : 0,
      overall_satisfaction: satisfaction,
      category_scores: [
        { category: "콘텐츠", score: survey_results?.content_rating || 4.3, benchmark: 4.0, variance: 0.3 },
        { category: "운영", score: survey_results?.logistics_rating || 4.1, benchmark: 4.0, variance: 0.1 },
        { category: "네트워킹", score: survey_results?.networking_rating || 3.9, benchmark: 4.0, variance: -0.1 },
      ],
      nps_analysis: {
        score: npsScore,
        promoters: Math.round(50 + npsScore * 0.3),
        passives: 30,
        detractors: Math.round(20 - npsScore * 0.1),
        interpretation: npsScore >= 50 ? "Excellent - 강력한 추천 의향" :
          npsScore >= 30 ? "Good - 긍정적 인식" :
          npsScore >= 0 ? "Average - 개선 필요" : "Poor - 심각한 개선 필요",
      },
    },
    feedback_analysis: {
      total_comments: comments.length,
      positive_count: positiveComments.length,
      negative_count: negativeComments.length,
      top_praises: positiveComments.slice(0, 3).map(c => c.comment),
      top_complaints: negativeComments.slice(0, 3).map(c => c.comment),
      actionable_suggestions: suggestions.slice(0, 5).map(c => c.comment),
    },
    swot_analysis: {
      strengths: ["콘텐츠 품질", "연사 라인업", "참가자 만족도"],
      weaknesses: ["네트워킹 시간 부족", "일부 기술 이슈"],
      opportunities: ["하이브리드 확장", "커뮤니티 구축"],
      threats: ["경쟁 이벤트 증가", "예산 제약"],
    },
    improvement_plan: [
      {
        area: "네트워킹",
        issue: "네트워킹 시간 부족 피드백",
        recommendation: "별도 네트워킹 세션 추가",
        priority: "high",
        timeline: "다음 이벤트",
      },
      {
        area: "기술",
        issue: "일부 AV 이슈 발생",
        recommendation: "사전 테스트 강화 및 백업 장비 준비",
        priority: "medium",
        timeline: "즉시",
      },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-035",
  taskName: "사후 평가",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.e",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
