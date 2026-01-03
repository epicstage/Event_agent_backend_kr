/**
 * HR-040: Lessons Learned Documentation
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 교훈 및 개선사항 문서화
 */

import { z } from "zod";

export const HR_040_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_dates: z.object({
    start: z.string(),
    end: z.string(),
  }),
  hr_performance_summary: z.object({
    overall_success_rate: z.number(),
    key_metrics: z.array(z.object({
      metric: z.string(),
      target: z.number(),
      actual: z.number(),
    })),
  }),
  feedback_highlights: z.object({
    staff_feedback: z.array(z.string()),
    management_feedback: z.array(z.string()),
    stakeholder_feedback: z.array(z.string()),
  }),
  incidents_and_issues: z.array(z.object({
    category: z.string(),
    description: z.string(),
    impact: z.enum(["low", "medium", "high"]),
    resolution: z.string(),
    preventable: z.boolean(),
  })),
  process_observations: z.array(z.object({
    process: z.string(),
    what_worked: z.array(z.string()),
    what_didnt: z.array(z.string()),
  })),
});

export const HR_040_OutputSchema = z.object({
  event_id: z.string(),
  document_info: z.object({
    title: z.string(),
    version: z.string(),
    date: z.string(),
    contributors: z.array(z.string()),
  }),
  executive_overview: z.object({
    event_summary: z.string(),
    hr_performance_rating: z.enum(["excellent", "good", "satisfactory", "needs_improvement"]),
    top_3_successes: z.array(z.string()),
    top_3_challenges: z.array(z.string()),
  }),
  lessons_by_category: z.array(z.object({
    category: z.string(),
    lessons: z.array(z.object({
      lesson_id: z.string(),
      title: z.string(),
      context: z.string(),
      what_happened: z.string(),
      lesson_learned: z.string(),
      recommendation: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    })),
  })),
  best_practices: z.array(z.object({
    practice: z.string(),
    description: z.string(),
    evidence: z.string(),
    replicability: z.enum(["high", "medium", "low"]),
  })),
  improvement_opportunities: z.array(z.object({
    area: z.string(),
    current_state: z.string(),
    desired_state: z.string(),
    gap_analysis: z.string(),
    action_items: z.array(z.object({
      action: z.string(),
      owner: z.string(),
      deadline: z.string(),
    })),
    expected_benefit: z.string(),
  })),
  metrics_analysis: z.object({
    targets_met: z.array(z.object({
      metric: z.string(),
      achievement: z.string(),
      contributing_factors: z.array(z.string()),
    })),
    targets_missed: z.array(z.object({
      metric: z.string(),
      gap: z.string(),
      root_causes: z.array(z.string()),
      corrective_actions: z.array(z.string()),
    })),
  }),
  knowledge_transfer: z.object({
    documentation_created: z.array(z.string()),
    training_updates_needed: z.array(z.string()),
    process_updates_needed: z.array(z.string()),
    tool_improvements: z.array(z.string()),
  }),
  action_plan: z.array(z.object({
    priority: z.enum(["immediate", "short_term", "long_term"]),
    action: z.string(),
    owner: z.string(),
    deadline: z.string(),
    success_criteria: z.string(),
    status: z.enum(["not_started", "in_progress", "completed"]),
  })),
  appendix: z.object({
    related_documents: z.array(z.string()),
    data_sources: z.array(z.string()),
    acknowledgments: z.string(),
  }),
});

export type HR_040_Input = z.infer<typeof HR_040_InputSchema>;
export type HR_040_Output = z.infer<typeof HR_040_OutputSchema>;

export async function execute(input: HR_040_Input): Promise<HR_040_Output> {
  const now = new Date().toISOString().split("T")[0];

  // 성과 평가
  let performanceRating: "excellent" | "good" | "satisfactory" | "needs_improvement" = "satisfactory";
  if (input.hr_performance_summary.overall_success_rate >= 90) performanceRating = "excellent";
  else if (input.hr_performance_summary.overall_success_rate >= 80) performanceRating = "good";
  else if (input.hr_performance_summary.overall_success_rate < 70) performanceRating = "needs_improvement";

  // 메트릭 분석
  const targetsMet = input.hr_performance_summary.key_metrics
    .filter((m) => m.actual >= m.target)
    .map((m) => ({
      metric: m.metric,
      achievement: `목표 ${m.target} 대비 ${m.actual} 달성 (${Math.round((m.actual / m.target) * 100)}%)`,
      contributing_factors: ["효과적인 계획", "팀 협업", "사전 준비"],
    }));

  const targetsMissed = input.hr_performance_summary.key_metrics
    .filter((m) => m.actual < m.target)
    .map((m) => ({
      metric: m.metric,
      gap: `목표 ${m.target} 대비 ${m.actual} (${Math.round(((m.target - m.actual) / m.target) * 100)}% 미달)`,
      root_causes: ["예상치 못한 상황", "자원 부족"],
      corrective_actions: ["프로세스 개선", "추가 자원 확보", "사전 리스크 관리 강화"],
    }));

  // 카테고리별 교훈
  const lessonsByCategory = [];

  // 채용 관련 교훈
  const recruitmentLessons = input.process_observations
    .filter((p) => p.process.includes("채용") || p.process.includes("모집"))
    .flatMap((p, idx) => [
      ...p.what_worked.map((w, i) => ({
        lesson_id: `REC-${idx}-${i}`,
        title: "효과적인 채용 방법",
        context: p.process,
        what_happened: w,
        lesson_learned: "이 방법이 효과적으로 작동함",
        recommendation: "향후 행사에도 동일 방법 적용",
        priority: "medium" as const,
      })),
      ...p.what_didnt.map((w, i) => ({
        lesson_id: `REC-${idx}-N${i}`,
        title: "개선 필요 채용 방법",
        context: p.process,
        what_happened: w,
        lesson_learned: "이 부분은 개선 필요",
        recommendation: "대안 모색 및 프로세스 개선",
        priority: "high" as const,
      })),
    ]);

  if (recruitmentLessons.length > 0) {
    lessonsByCategory.push({
      category: "채용 및 모집",
      lessons: recruitmentLessons.slice(0, 5),
    });
  }

  // 사고/이슈 관련 교훈
  const incidentLessons = input.incidents_and_issues
    .filter((i) => i.preventable)
    .map((i, idx) => ({
      lesson_id: `INC-${idx}`,
      title: `${i.category} 관련 교훈`,
      context: i.category,
      what_happened: i.description,
      lesson_learned: i.resolution,
      recommendation: "사전 예방 조치 강화",
      priority: i.impact === "high" ? "high" as const : i.impact === "medium" ? "medium" as const : "low" as const,
    }));

  if (incidentLessons.length > 0) {
    lessonsByCategory.push({
      category: "사고 및 이슈 대응",
      lessons: incidentLessons,
    });
  }

  // 일반 운영 교훈
  lessonsByCategory.push({
    category: "일반 운영",
    lessons: [
      {
        lesson_id: "OPS-001",
        title: "커뮤니케이션 효율성",
        context: "현장 운영",
        what_happened: "다채널 커뮤니케이션으로 정보 전달 속도 향상",
        lesson_learned: "복수 채널 운영이 효과적",
        recommendation: "주요 채널 외 백업 채널 항상 준비",
        priority: "medium" as const,
      },
    ],
  });

  // 베스트 프랙티스
  const bestPractices = input.process_observations
    .flatMap((p) => p.what_worked)
    .slice(0, 5)
    .map((w) => ({
      practice: w,
      description: `${w}를 통해 효율성 향상`,
      evidence: "스태프 피드백 및 성과 데이터",
      replicability: "high" as const,
    }));

  // 개선 기회
  const improvementOpportunities = input.incidents_and_issues
    .filter((i) => i.impact === "high")
    .slice(0, 3)
    .map((i) => ({
      area: i.category,
      current_state: i.description,
      desired_state: "이슈 없는 원활한 운영",
      gap_analysis: `현재 ${i.impact} 수준의 영향을 미치는 이슈 발생`,
      action_items: [
        { action: "프로세스 검토 및 개선", owner: "HR 팀", deadline: "다음 행사 2주 전" },
        { action: "교육 자료 업데이트", owner: "교육 담당", deadline: "1개월 내" },
      ],
      expected_benefit: "유사 이슈 재발 방지 및 운영 효율 향상",
    }));

  // 액션 플랜
  const actionPlan = [];

  // 즉시 조치
  for (const issue of input.incidents_and_issues.filter((i) => i.impact === "high" && i.preventable)) {
    actionPlan.push({
      priority: "immediate" as const,
      action: `${issue.category} 관련 프로세스 즉시 검토 및 개선`,
      owner: "HR 매니저",
      deadline: "2주 이내",
      success_criteria: "개선된 프로세스 문서화 완료",
      status: "not_started" as const,
    });
  }

  // 단기 조치
  actionPlan.push({
    priority: "short_term" as const,
    action: "스태프 피드백 기반 교육 프로그램 개선",
    owner: "교육 담당",
    deadline: "1개월 내",
    success_criteria: "개선된 교육 자료 완성",
    status: "not_started" as const,
  });

  actionPlan.push({
    priority: "short_term" as const,
    action: "HR 운영 매뉴얼 업데이트",
    owner: "HR 팀",
    deadline: "2개월 내",
    success_criteria: "매뉴얼 버전 업데이트 완료",
    status: "not_started" as const,
  });

  // 장기 조치
  actionPlan.push({
    priority: "long_term" as const,
    action: "HR 시스템 자동화 도입 검토",
    owner: "HR + IT",
    deadline: "분기 내",
    success_criteria: "자동화 요구사항 정의 및 벤더 선정",
    status: "not_started" as const,
  });

  return {
    event_id: input.event_id,
    document_info: {
      title: `${input.event_name} HR 교훈 문서`,
      version: "1.0",
      date: now,
      contributors: ["HR 팀", "운영 팀", "현장 매니저"],
    },
    executive_overview: {
      event_summary: `${input.event_name} 행사가 ${input.event_dates.start}부터 ${input.event_dates.end}까지 진행되었으며, HR 운영 성공률 ${input.hr_performance_summary.overall_success_rate}%를 달성했습니다.`,
      hr_performance_rating: performanceRating,
      top_3_successes: [
        targetsMet.length > 0 ? `${targetsMet[0].metric} 목표 달성` : "전반적 운영 안정성",
        "팀 협업 우수",
        "스태프 만족도 유지",
      ],
      top_3_challenges: input.incidents_and_issues
        .filter((i) => i.impact === "high")
        .slice(0, 3)
        .map((i) => i.description),
    },
    lessons_by_category: lessonsByCategory,
    best_practices: bestPractices,
    improvement_opportunities: improvementOpportunities,
    metrics_analysis: {
      targets_met: targetsMet,
      targets_missed: targetsMissed,
    },
    knowledge_transfer: {
      documentation_created: [
        "HR 결과 보고서",
        "스태프 피드백 분석",
        "사고 보고서",
        "비용 분석 보고서",
      ],
      training_updates_needed: [
        "신규 스태프 온보딩 자료 개선",
        "비상 대응 교육 강화",
        "현장 커뮤니케이션 가이드 추가",
      ],
      process_updates_needed: [
        "채용 프로세스 간소화",
        "실시간 인력 모니터링 강화",
        "피드백 수집 자동화",
      ],
      tool_improvements: [
        "스케줄링 시스템 업그레이드",
        "모바일 체크인 앱 개선",
        "실시간 대시보드 기능 추가",
      ],
    },
    action_plan: actionPlan,
    appendix: {
      related_documents: [
        "HR 결과 보고서",
        "스태프 설문 원본",
        "사고 보고서",
        "비용 내역서",
      ],
      data_sources: [
        "HR 관리 시스템",
        "설문 플랫폼",
        "현장 보고서",
        "매니저 인터뷰",
      ],
      acknowledgments: "본 문서 작성에 협조해주신 모든 스태프와 매니저에게 감사드립니다.",
    },
  };
}

export const HR_040_LessonsLearned = {
  id: "HR-040",
  name: "Lessons Learned Documentation",
  description: "교훈 및 개선사항 문서화",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.25",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_040_InputSchema,
  outputSchema: HR_040_OutputSchema,
  persona: `당신은 조직 학습 전문가입니다. 경험에서 교훈을 도출하여 지속적인 개선을 이끌어냅니다.`,
};

export default HR_040_LessonsLearned;
