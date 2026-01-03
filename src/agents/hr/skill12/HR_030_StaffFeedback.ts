/**
 * HR-030: Staff Feedback Collection
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 스태프 피드백 수집 및 분석
 */

import { z } from "zod";

export const HR_030_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  survey_responses: z.array(z.object({
    staff_id: z.string().optional(),
    department: z.string(),
    employment_type: z.enum(["full_time", "part_time", "contractor", "volunteer"]),
    ratings: z.object({
      overall_experience: z.number().min(1).max(5),
      training_quality: z.number().min(1).max(5),
      communication: z.number().min(1).max(5),
      work_environment: z.number().min(1).max(5),
      leadership: z.number().min(1).max(5),
      compensation: z.number().min(1).max(5),
    }),
    open_feedback: z.object({
      liked_most: z.string().optional(),
      improvement_suggestions: z.string().optional(),
      would_work_again: z.boolean(),
    }),
  })),
});

export const HR_030_OutputSchema = z.object({
  event_id: z.string(),
  response_summary: z.object({
    total_responses: z.number(),
    response_rate: z.number(),
    anonymous_responses: z.number(),
  }),
  overall_scores: z.object({
    average_overall: z.number(),
    nps_score: z.number(),
    would_return_rate: z.number(),
    category_scores: z.array(z.object({
      category: z.string(),
      score: z.number(),
      trend: z.enum(["up", "stable", "down"]),
    })),
  }),
  department_analysis: z.array(z.object({
    department: z.string(),
    response_count: z.number(),
    avg_score: z.number(),
    strengths: z.array(z.string()),
    areas_for_improvement: z.array(z.string()),
  })),
  qualitative_insights: z.object({
    top_positives: z.array(z.object({
      theme: z.string(),
      frequency: z.number(),
      sample_quotes: z.array(z.string()),
    })),
    top_concerns: z.array(z.object({
      theme: z.string(),
      frequency: z.number(),
      sample_quotes: z.array(z.string()),
      recommended_action: z.string(),
    })),
  }),
  action_plan: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    area: z.string(),
    action: z.string(),
    owner: z.string(),
    timeline: z.string(),
  })),
  benchmarks: z.object({
    industry_average: z.number(),
    our_score: z.number(),
    ranking: z.string(),
  }),
});

export type HR_030_Input = z.infer<typeof HR_030_InputSchema>;
export type HR_030_Output = z.infer<typeof HR_030_OutputSchema>;

export async function execute(input: HR_030_Input): Promise<HR_030_Output> {
  const totalResponses = input.survey_responses.length;
  const anonymousCount = input.survey_responses.filter((r) => !r.staff_id).length;

  // 카테고리별 점수 계산
  const categoryScores = [
    { category: "전반적 경험", key: "overall_experience" as const },
    { category: "교육 품질", key: "training_quality" as const },
    { category: "커뮤니케이션", key: "communication" as const },
    { category: "근무 환경", key: "work_environment" as const },
    { category: "리더십", key: "leadership" as const },
    { category: "보상", key: "compensation" as const },
  ].map((cat) => {
    const scores = input.survey_responses.map((r) => r.ratings[cat.key]);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
    return {
      category: cat.category,
      score: avg,
      trend: avg >= 4 ? "up" as const : avg >= 3 ? "stable" as const : "down" as const,
    };
  });

  const avgOverall = categoryScores[0].score;

  // NPS 계산 (Promoters - Detractors)
  const promoters = input.survey_responses.filter((r) => r.ratings.overall_experience >= 4).length;
  const detractors = input.survey_responses.filter((r) => r.ratings.overall_experience <= 2).length;
  const npsScore = Math.round(((promoters - detractors) / totalResponses) * 100);

  // 재참여 의향
  const wouldReturn = input.survey_responses.filter((r) => r.open_feedback.would_work_again).length;
  const wouldReturnRate = Math.round((wouldReturn / totalResponses) * 100);

  // 부서별 분석
  const departments = [...new Set(input.survey_responses.map((r) => r.department))];
  const departmentAnalysis = departments.map((dept) => {
    const deptResponses = input.survey_responses.filter((r) => r.department === dept);
    const deptAvg = Math.round(
      deptResponses.reduce((sum, r) => sum + r.ratings.overall_experience, 0) / deptResponses.length * 10
    ) / 10;

    const strengths = [];
    const improvements = [];

    const deptCatScores = categoryScores.map((cat) => {
      const catKey = cat.category === "전반적 경험" ? "overall_experience" :
        cat.category === "교육 품질" ? "training_quality" :
          cat.category === "커뮤니케이션" ? "communication" :
            cat.category === "근무 환경" ? "work_environment" :
              cat.category === "리더십" ? "leadership" : "compensation";

      const avg = deptResponses.reduce((sum, r) => sum + r.ratings[catKey as keyof typeof r.ratings], 0) / deptResponses.length;
      return { category: cat.category, avg };
    });

    for (const score of deptCatScores) {
      if (score.avg >= 4) strengths.push(score.category);
      if (score.avg < 3.5) improvements.push(score.category);
    }

    return {
      department: dept,
      response_count: deptResponses.length,
      avg_score: deptAvg,
      strengths,
      areas_for_improvement: improvements,
    };
  });

  // 정성적 분석 (시뮬레이션)
  const topPositives = [
    { theme: "팀워크 및 동료", frequency: Math.round(totalResponses * 0.4), sample_quotes: ["팀원들이 정말 좋았어요", "서로 도와주는 분위기"] },
    { theme: "보람 있는 경험", frequency: Math.round(totalResponses * 0.35), sample_quotes: ["의미 있는 일이었습니다", "성취감을 느꼈어요"] },
    { theme: "체계적인 교육", frequency: Math.round(totalResponses * 0.25), sample_quotes: ["교육이 잘 되어있었어요", "무엇을 해야 할지 명확했음"] },
  ];

  const topConcerns = [
    { theme: "휴식 시간 부족", frequency: Math.round(totalResponses * 0.2), sample_quotes: ["쉴 시간이 부족했어요"], recommended_action: "휴식 로테이션 개선" },
    { theme: "소통 지연", frequency: Math.round(totalResponses * 0.15), sample_quotes: ["정보 전달이 늦었음"], recommended_action: "실시간 공지 시스템 강화" },
    { theme: "보상 수준", frequency: Math.round(totalResponses * 0.1), sample_quotes: ["시급이 조금 낮은 편"], recommended_action: "시장 급여 재검토" },
  ];

  return {
    event_id: input.event_id,
    response_summary: {
      total_responses: totalResponses,
      response_rate: 75, // 가정
      anonymous_responses: anonymousCount,
    },
    overall_scores: {
      average_overall: avgOverall,
      nps_score: npsScore,
      would_return_rate: wouldReturnRate,
      category_scores: categoryScores,
    },
    department_analysis: departmentAnalysis,
    qualitative_insights: {
      top_positives: topPositives,
      top_concerns: topConcerns,
    },
    action_plan: [
      { priority: "high", area: "휴식 관리", action: "휴식 로테이션 시스템 개선", owner: "운영팀", timeline: "다음 행사 전" },
      { priority: "medium", area: "커뮤니케이션", action: "실시간 공지 앱 기능 강화", owner: "IT/HR", timeline: "1개월 내" },
      { priority: "medium", area: "보상", action: "업계 급여 벤치마킹 및 조정 검토", owner: "HR/재무", timeline: "분기 내" },
      { priority: "low", area: "교육", action: "실전 시뮬레이션 교육 추가", owner: "HR", timeline: "다음 행사 전" },
    ],
    benchmarks: {
      industry_average: 3.8,
      our_score: avgOverall,
      ranking: avgOverall >= 4.2 ? "상위 10%" : avgOverall >= 3.8 ? "평균 이상" : "개선 필요",
    },
  };
}

export const HR_030_StaffFeedback = {
  id: "HR-030",
  name: "Staff Feedback Collection",
  description: "스태프 피드백 수집 및 분석",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.15",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_030_InputSchema,
  outputSchema: HR_030_OutputSchema,
  persona: `당신은 조직개발 전문가입니다. 스태프 피드백을 체계적으로 분석하여 실질적인 개선 방안을 도출합니다.`,
};

export default HR_030_StaffFeedback;
