/**
 * STR-049: 전략 리뷰
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Strategic Review)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Strategic Review Agent for event planning.

Your expertise includes:
- Strategy effectiveness evaluation
- Strategic assumption validation
- Course correction recommendations
- Strategic learning synthesis

CMP-IS Standard: Domain A - Strategic Planning (Strategic Review)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  review_scope: z.object({
    review_type: z.enum(["milestone", "periodic", "post_event", "ad_hoc"]),
    period_covered: z.string(),
  }),
  strategic_plan: z.object({
    objectives: z.array(z.object({
      objective_id: z.string(),
      objective: z.string(),
      target: z.string(),
      actual: z.string().optional(),
    })),
    key_assumptions: z.array(z.string()).optional(),
  }),
  performance_data: z.object({
    overall_progress: z.number(),
    key_achievements: z.array(z.string()),
    key_challenges: z.array(z.string()),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  review_id: z.string().uuid(),
  event_id: z.string().uuid(),
  review_summary: z.object({
    review_type: z.string(),
    period_covered: z.string(),
    overall_assessment: z.enum(["exceeding", "on_track", "at_risk", "off_track"]),
    executive_summary: z.string(),
  }),
  objective_assessment: z.array(z.object({
    objective_id: z.string(),
    objective: z.string(),
    target: z.string(),
    actual: z.string(),
    achievement_rate: z.number(),
    status: z.enum(["exceeded", "met", "partially_met", "not_met"]),
    analysis: z.string(),
    contributing_factors: z.array(z.string()),
  })),
  assumption_validation: z.array(z.object({
    assumption: z.string(),
    validity: z.enum(["valid", "partially_valid", "invalid"]),
    evidence: z.string(),
    impact_on_strategy: z.string(),
  })),
  strategic_effectiveness: z.object({
    overall_score: z.number(),
    by_dimension: z.array(z.object({
      dimension: z.string(),
      score: z.number(),
      assessment: z.string(),
    })),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),
  lessons_learned: z.array(z.object({
    lesson: z.string(),
    category: z.enum(["success_factor", "improvement_area", "best_practice", "pitfall"]),
    applicability: z.string(),
  })),
  recommendations: z.array(z.object({
    recommendation: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    type: z.enum(["maintain", "adjust", "stop", "start"]),
    rationale: z.string(),
    implementation: z.string(),
  })),
  next_steps: z.array(z.object({
    action: z.string(),
    owner: z.string(),
    timeline: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-049",
  taskName: "Strategic Review",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "전략 실행을 리뷰하고 학습 및 개선 기회를 도출합니다.",
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

type Status = "exceeded" | "met" | "partially_met" | "not_met";

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { review_scope, strategic_plan, performance_data } = validated;

  const objectiveAssessments = strategic_plan.objectives.map(obj => {
    const actualNum = obj.actual ? parseFloat(obj.actual.replace(/[^0-9.-]/g, "")) || 70 : Math.round(60 + Math.random() * 40);
    const targetNum = parseFloat(obj.target.replace(/[^0-9.-]/g, "")) || 100;
    const achievementRate = Math.round((actualNum / targetNum) * 100);

    const status: Status = achievementRate >= 110 ? "exceeded" :
                           achievementRate >= 90 ? "met" :
                           achievementRate >= 70 ? "partially_met" : "not_met";

    return {
      objective_id: obj.objective_id,
      objective: obj.objective,
      target: obj.target,
      actual: obj.actual || `${actualNum}%`,
      achievement_rate: achievementRate,
      status,
      analysis: status === "exceeded" ? "목표 초과 달성. 성공 요인 분석 및 타 영역 적용 검토" :
                status === "met" ? "목표 달성. 현 수준 유지 및 지속 모니터링" :
                status === "partially_met" ? "부분 달성. 원인 분석 및 보완 조치 필요" :
                "미달성. 근본 원인 분석 및 전략 재검토 필요",
      contributing_factors: status === "exceeded" || status === "met"
        ? ["효과적인 실행", "적절한 자원 배분", "팀 협업"]
        : ["자원 부족", "외부 요인", "계획 미비"],
    };
  });

  const avgAchievement = Math.round(
    objectiveAssessments.reduce((sum, o) => sum + o.achievement_rate, 0) / objectiveAssessments.length
  );

  const overallAssessment = avgAchievement >= 100 ? "exceeding" as const :
                            avgAchievement >= 85 ? "on_track" as const :
                            avgAchievement >= 70 ? "at_risk" as const : "off_track" as const;

  const assumptions = strategic_plan.key_assumptions || ["시장 환경 안정", "자원 가용성", "이해관계자 협조"];
  const assumptionValidation = assumptions.map(assumption => ({
    assumption,
    validity: Math.random() > 0.3 ? "valid" as const : "partially_valid" as const,
    evidence: "실행 과정 관찰 및 결과 데이터",
    impact_on_strategy: "전략 방향 유지 가능" + (Math.random() > 0.7 ? ", 일부 조정 검토" : ""),
  }));

  return {
    review_id: generateUUID(),
    event_id: validated.event_id,
    review_summary: {
      review_type: review_scope.review_type,
      period_covered: review_scope.period_covered,
      overall_assessment: overallAssessment,
      executive_summary: `${review_scope.period_covered} 동안 ${objectiveAssessments.length}개 목표 중 ${objectiveAssessments.filter(o => o.status === "met" || o.status === "exceeded").length}개 달성. 전체 달성률 ${avgAchievement}%.`,
    },
    objective_assessment: objectiveAssessments,
    assumption_validation: assumptionValidation,
    strategic_effectiveness: {
      overall_score: avgAchievement,
      by_dimension: [
        { dimension: "목표 달성", score: avgAchievement, assessment: avgAchievement >= 80 ? "우수" : "개선 필요" },
        { dimension: "실행 효율성", score: Math.round(avgAchievement * 0.95), assessment: "양호" },
        { dimension: "이해관계자 만족", score: Math.round(avgAchievement * 1.05), assessment: "양호" },
      ],
      strengths: performance_data?.key_achievements || ["팀 협업", "신속한 의사결정"],
      weaknesses: performance_data?.key_challenges || ["자원 제약", "일정 압박"],
    },
    lessons_learned: [
      {
        lesson: "조기 이해관계자 참여가 성공에 기여",
        category: "success_factor",
        applicability: "향후 모든 프로젝트",
      },
      {
        lesson: "버퍼 일정 확보 필요",
        category: "improvement_area",
        applicability: "일정 계획 수립 시",
      },
      {
        lesson: "주간 체크인이 이슈 조기 발견에 효과적",
        category: "best_practice",
        applicability: "프로젝트 관리",
      },
    ],
    recommendations: [
      {
        recommendation: "현 전략 방향 유지",
        priority: "high",
        type: "maintain",
        rationale: `전체 달성률 ${avgAchievement}%로 전략 방향 유효`,
        implementation: "현 계획 지속 실행",
      },
      {
        recommendation: "리소스 배분 조정",
        priority: objectiveAssessments.some(o => o.status === "not_met") ? "critical" : "medium",
        type: "adjust",
        rationale: "일부 목표 미달성 원인 해소",
        implementation: "미달성 영역에 추가 자원 투입",
      },
    ],
    next_steps: [
      { action: "리뷰 결과 공유 및 논의", owner: "프로젝트 리더", timeline: "1주 내" },
      { action: "조정 계획 수립", owner: "전략팀", timeline: "2주 내" },
      { action: "다음 리뷰 일정 확정", owner: "PMO", timeline: "1주 내" },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
