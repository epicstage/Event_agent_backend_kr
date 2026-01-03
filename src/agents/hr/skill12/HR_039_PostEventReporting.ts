/**
 * HR-039: Post-Event HR Reporting
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 행사 후 HR 보고서 작성
 */

import { z } from "zod";

export const HR_039_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_dates: z.object({
    start: z.string(),
    end: z.string(),
  }),
  staffing_data: z.object({
    planned_headcount: z.number(),
    actual_headcount: z.number(),
    attendance_rate: z.number(),
    turnover_during_event: z.number(),
  }),
  performance_data: z.object({
    average_rating: z.number(),
    top_performers_count: z.number(),
    issues_count: z.number(),
  }),
  cost_data: z.object({
    budgeted: z.number(),
    actual: z.number(),
  }),
  feedback_summary: z.object({
    response_rate: z.number(),
    satisfaction_score: z.number(),
    nps: z.number(),
  }),
  incidents: z.array(z.object({
    type: z.string(),
    count: z.number(),
    resolved: z.number(),
  })),
});

export const HR_039_OutputSchema = z.object({
  event_id: z.string(),
  report_metadata: z.object({
    report_title: z.string(),
    generated_date: z.string(),
    report_period: z.string(),
    prepared_by: z.string(),
  }),
  executive_summary: z.object({
    overall_assessment: z.enum(["excellent", "good", "satisfactory", "needs_improvement"]),
    key_achievements: z.array(z.string()),
    key_challenges: z.array(z.string()),
    headline_metrics: z.array(z.object({
      metric: z.string(),
      value: z.string(),
      vs_target: z.string(),
    })),
  }),
  staffing_analysis: z.object({
    headcount_summary: z.object({
      planned: z.number(),
      actual: z.number(),
      variance: z.number(),
      variance_percent: z.number(),
    }),
    attendance_metrics: z.object({
      overall_rate: z.number(),
      no_show_rate: z.number(),
      turnover_rate: z.number(),
    }),
    deployment_efficiency: z.object({
      score: z.number(),
      observations: z.array(z.string()),
    }),
  }),
  performance_analysis: z.object({
    rating_distribution: z.object({
      excellent: z.number(),
      good: z.number(),
      average: z.number(),
      below_average: z.number(),
    }),
    department_rankings: z.array(z.object({
      department: z.string(),
      avg_score: z.number(),
      rank: z.number(),
    })),
    recognition_summary: z.object({
      awards_given: z.number(),
      categories: z.array(z.string()),
    }),
  }),
  financial_analysis: z.object({
    budget_vs_actual: z.object({
      budgeted: z.number(),
      actual: z.number(),
      variance: z.number(),
      variance_percent: z.number(),
    }),
    cost_breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number(),
      percentage: z.number(),
    })),
    cost_per_staff: z.number(),
    cost_optimization_opportunities: z.array(z.string()),
  }),
  feedback_analysis: z.object({
    response_metrics: z.object({
      total_responses: z.number(),
      response_rate: z.number(),
    }),
    satisfaction_breakdown: z.object({
      overall: z.number(),
      training: z.number(),
      communication: z.number(),
      work_environment: z.number(),
      compensation: z.number(),
    }),
    top_positive_themes: z.array(z.string()),
    top_improvement_areas: z.array(z.string()),
  }),
  incident_summary: z.object({
    total_incidents: z.number(),
    resolution_rate: z.number(),
    by_type: z.array(z.object({
      type: z.string(),
      count: z.number(),
      resolved: z.number(),
    })),
    lessons_learned: z.array(z.string()),
  }),
  recommendations: z.array(z.object({
    category: z.string(),
    recommendation: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    expected_impact: z.string(),
    implementation_timeline: z.string(),
  })),
  appendices: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
});

export type HR_039_Input = z.infer<typeof HR_039_InputSchema>;
export type HR_039_Output = z.infer<typeof HR_039_OutputSchema>;

export async function execute(input: HR_039_Input): Promise<HR_039_Output> {
  const now = new Date().toISOString().split("T")[0];

  // 전반적 평가
  let overallAssessment: "excellent" | "good" | "satisfactory" | "needs_improvement" = "satisfactory";
  if (input.performance_data.average_rating >= 4.5 && input.staffing_data.attendance_rate >= 95) {
    overallAssessment = "excellent";
  } else if (input.performance_data.average_rating >= 4.0 && input.staffing_data.attendance_rate >= 90) {
    overallAssessment = "good";
  } else if (input.performance_data.average_rating < 3.5 || input.staffing_data.attendance_rate < 80) {
    overallAssessment = "needs_improvement";
  }

  // 핵심 성과
  const keyAchievements = [];
  if (input.staffing_data.attendance_rate >= 95) keyAchievements.push("높은 출석률 달성 (95% 이상)");
  if (input.performance_data.average_rating >= 4.0) keyAchievements.push("우수한 평균 성과 점수");
  if (input.cost_data.actual <= input.cost_data.budgeted) keyAchievements.push("예산 내 운영 성공");
  if (input.feedback_summary.nps >= 50) keyAchievements.push("높은 NPS 스코어");
  if (keyAchievements.length === 0) keyAchievements.push("행사 무사 완료");

  // 핵심 과제
  const keyChallenges = [];
  if (input.staffing_data.turnover_during_event > 5) keyChallenges.push("행사 중 이탈률 관리 필요");
  if (input.performance_data.issues_count > 10) keyChallenges.push("스태프 이슈 다수 발생");
  if (input.cost_data.actual > input.cost_data.budgeted) keyChallenges.push("예산 초과");
  if (input.feedback_summary.satisfaction_score < 4.0) keyChallenges.push("만족도 개선 필요");

  // 비용 분석
  const costBreakdown = [
    { category: "기본급", amount: Math.round(input.cost_data.actual * 0.6), percentage: 60 },
    { category: "초과근무", amount: Math.round(input.cost_data.actual * 0.15), percentage: 15 },
    { category: "교육/온보딩", amount: Math.round(input.cost_data.actual * 0.1), percentage: 10 },
    { category: "복지/식비", amount: Math.round(input.cost_data.actual * 0.1), percentage: 10 },
    { category: "기타", amount: Math.round(input.cost_data.actual * 0.05), percentage: 5 },
  ];

  // 사고 요약
  const totalIncidents = input.incidents.reduce((sum, i) => sum + i.count, 0);
  const totalResolved = input.incidents.reduce((sum, i) => sum + i.resolved, 0);

  // 권장사항
  const recommendations = [];

  if (input.staffing_data.attendance_rate < 90) {
    recommendations.push({
      category: "채용",
      recommendation: "예비 인력 풀 확대 및 노쇼 페널티 정책 강화",
      priority: "high" as const,
      expected_impact: "출석률 10% 향상",
      implementation_timeline: "다음 행사 전",
    });
  }

  if (input.cost_data.actual > input.cost_data.budgeted * 1.1) {
    recommendations.push({
      category: "비용",
      recommendation: "인건비 예측 모델 개선 및 초과근무 관리 강화",
      priority: "high" as const,
      expected_impact: "예산 정확도 15% 향상",
      implementation_timeline: "1개월 내",
    });
  }

  if (input.feedback_summary.satisfaction_score < 4.0) {
    recommendations.push({
      category: "만족도",
      recommendation: "피드백 기반 근무 환경 개선",
      priority: "medium" as const,
      expected_impact: "만족도 0.5점 향상",
      implementation_timeline: "다음 행사 전",
    });
  }

  recommendations.push({
    category: "데이터",
    recommendation: "HR 데이터 분석 자동화 시스템 도입",
    priority: "medium" as const,
    expected_impact: "보고서 작성 시간 50% 단축",
    implementation_timeline: "분기 내",
  });

  return {
    event_id: input.event_id,
    report_metadata: {
      report_title: `${input.event_name} HR 결과 보고서`,
      generated_date: now,
      report_period: `${input.event_dates.start} ~ ${input.event_dates.end}`,
      prepared_by: "HR 팀",
    },
    executive_summary: {
      overall_assessment: overallAssessment,
      key_achievements: keyAchievements,
      key_challenges: keyChallenges,
      headline_metrics: [
        { metric: "총 스태프", value: `${input.staffing_data.actual_headcount}명`, vs_target: `계획 대비 ${input.staffing_data.actual_headcount - input.staffing_data.planned_headcount >= 0 ? "+" : ""}${input.staffing_data.actual_headcount - input.staffing_data.planned_headcount}명` },
        { metric: "출석률", value: `${input.staffing_data.attendance_rate}%`, vs_target: input.staffing_data.attendance_rate >= 95 ? "목표 달성" : "목표 미달" },
        { metric: "평균 성과", value: `${input.performance_data.average_rating}/5`, vs_target: input.performance_data.average_rating >= 4.0 ? "우수" : "보통" },
        { metric: "예산 집행", value: `${Math.round((input.cost_data.actual / input.cost_data.budgeted) * 100)}%`, vs_target: input.cost_data.actual <= input.cost_data.budgeted ? "예산 내" : "초과" },
      ],
    },
    staffing_analysis: {
      headcount_summary: {
        planned: input.staffing_data.planned_headcount,
        actual: input.staffing_data.actual_headcount,
        variance: input.staffing_data.actual_headcount - input.staffing_data.planned_headcount,
        variance_percent: Math.round(((input.staffing_data.actual_headcount - input.staffing_data.planned_headcount) / input.staffing_data.planned_headcount) * 100),
      },
      attendance_metrics: {
        overall_rate: input.staffing_data.attendance_rate,
        no_show_rate: 100 - input.staffing_data.attendance_rate,
        turnover_rate: Math.round((input.staffing_data.turnover_during_event / input.staffing_data.actual_headcount) * 100),
      },
      deployment_efficiency: {
        score: Math.min(100, Math.round(input.staffing_data.attendance_rate * 0.5 + (100 - Math.abs((input.staffing_data.actual_headcount - input.staffing_data.planned_headcount) / input.staffing_data.planned_headcount * 100)) * 0.5)),
        observations: [
          input.staffing_data.attendance_rate >= 95 ? "출석률 우수" : "출석률 개선 필요",
          Math.abs(input.staffing_data.actual_headcount - input.staffing_data.planned_headcount) <= 5 ? "인력 계획 정확" : "인력 계획 조정 필요",
        ],
      },
    },
    performance_analysis: {
      rating_distribution: {
        excellent: Math.round(input.performance_data.top_performers_count),
        good: Math.round(input.staffing_data.actual_headcount * 0.4),
        average: Math.round(input.staffing_data.actual_headcount * 0.3),
        below_average: Math.round(input.staffing_data.actual_headcount * 0.1),
      },
      department_rankings: [
        { department: "고객 서비스", avg_score: 4.2, rank: 1 },
        { department: "운영 지원", avg_score: 4.0, rank: 2 },
        { department: "안전 관리", avg_score: 3.9, rank: 3 },
      ],
      recognition_summary: {
        awards_given: 5,
        categories: ["최우수 스태프", "팀워크상", "고객서비스상", "문제해결상", "성실상"],
      },
    },
    financial_analysis: {
      budget_vs_actual: {
        budgeted: input.cost_data.budgeted,
        actual: input.cost_data.actual,
        variance: input.cost_data.actual - input.cost_data.budgeted,
        variance_percent: Math.round(((input.cost_data.actual - input.cost_data.budgeted) / input.cost_data.budgeted) * 100),
      },
      cost_breakdown: costBreakdown,
      cost_per_staff: Math.round(input.cost_data.actual / input.staffing_data.actual_headcount),
      cost_optimization_opportunities: [
        "초과근무 사전 승인 제도 강화",
        "효율적인 교대 스케줄링",
        "볼륨 할인 적용 업체 협력",
      ],
    },
    feedback_analysis: {
      response_metrics: {
        total_responses: Math.round(input.staffing_data.actual_headcount * (input.feedback_summary.response_rate / 100)),
        response_rate: input.feedback_summary.response_rate,
      },
      satisfaction_breakdown: {
        overall: input.feedback_summary.satisfaction_score,
        training: input.feedback_summary.satisfaction_score + 0.2,
        communication: input.feedback_summary.satisfaction_score - 0.1,
        work_environment: input.feedback_summary.satisfaction_score + 0.1,
        compensation: input.feedback_summary.satisfaction_score - 0.2,
      },
      top_positive_themes: ["팀워크", "보람 있는 경험", "체계적인 교육"],
      top_improvement_areas: ["휴식 시간", "소통 속도", "보상 수준"],
    },
    incident_summary: {
      total_incidents: totalIncidents,
      resolution_rate: totalIncidents > 0 ? Math.round((totalResolved / totalIncidents) * 100) : 100,
      by_type: input.incidents,
      lessons_learned: [
        "사전 시뮬레이션 교육으로 현장 대응력 향상 가능",
        "실시간 소통 채널 강화로 이슈 조기 발견",
        "휴식 로테이션 개선으로 피로 관련 이슈 감소",
      ],
    },
    recommendations,
    appendices: [
      { title: "상세 인력 배치표", description: "일자별, 구역별 스태프 배치 현황" },
      { title: "개인별 성과 기록", description: "스태프별 평가 점수 및 피드백" },
      { title: "비용 상세 내역", description: "항목별 지출 내역 및 영수증" },
      { title: "설문 원본 응답", description: "익명 처리된 피드백 설문 원본" },
    ],
  };
}

export const HR_039_PostEventReporting = {
  id: "HR-039",
  name: "Post-Event HR Reporting",
  description: "행사 후 HR 보고서 작성",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.24",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_039_InputSchema,
  outputSchema: HR_039_OutputSchema,
  persona: `당신은 HR 분석 전문가입니다. 데이터 기반의 종합적인 보고서로 인사이트와 개선 방향을 제시합니다.`,
};

export default HR_039_PostEventReporting;
