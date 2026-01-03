/**
 * HR-025: Performance Tracking
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 실시간 성과 추적 및 피드백
 */

import { z } from "zod";

export const HR_025_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_date: z.string(),
  staff_observations: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    department: z.string(),
    observations: z.array(z.object({
      time: z.string(),
      type: z.enum(["positive", "negative", "neutral"]),
      category: z.string(),
      description: z.string(),
      observer: z.string(),
    })),
  })),
});

export const HR_025_OutputSchema = z.object({
  event_id: z.string(),
  performance_snapshot: z.object({
    total_staff_observed: z.number(),
    positive_observations: z.number(),
    negative_observations: z.number(),
    average_performance_score: z.number(),
    top_performers: z.array(z.object({
      name: z.string(),
      department: z.string(),
      score: z.number(),
      highlights: z.array(z.string()),
    })),
  }),
  department_summary: z.array(z.object({
    department: z.string(),
    staff_count: z.number(),
    avg_score: z.number(),
    strengths: z.array(z.string()),
    areas_for_improvement: z.array(z.string()),
  })),
  individual_tracking: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    performance_score: z.number(),
    trend: z.enum(["improving", "stable", "declining"]),
    key_observations: z.array(z.string()),
    feedback_given: z.boolean(),
  })),
  intervention_needed: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    issue: z.string(),
    recommended_action: z.string(),
    urgency: z.enum(["immediate", "end_of_shift", "post_event"]),
  })),
  recognition_queue: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    achievement: z.string(),
    recognition_type: z.string(),
  })),
});

export type HR_025_Input = z.infer<typeof HR_025_InputSchema>;
export type HR_025_Output = z.infer<typeof HR_025_OutputSchema>;

export async function execute(input: HR_025_Input): Promise<HR_025_Output> {
  const individualTracking = input.staff_observations.map((staff) => {
    const positiveCount = staff.observations.filter((o) => o.type === "positive").length;
    const negativeCount = staff.observations.filter((o) => o.type === "negative").length;
    const totalObs = staff.observations.length;

    const score = totalObs > 0
      ? Math.min(100, Math.max(0, 70 + (positiveCount * 10) - (negativeCount * 15)))
      : 70;

    return {
      staff_id: staff.staff_id,
      name: staff.name,
      department: staff.department,
      performance_score: score,
      trend: positiveCount > negativeCount ? "improving" as const : negativeCount > positiveCount ? "declining" as const : "stable" as const,
      key_observations: staff.observations.slice(0, 3).map((o) => o.description),
      feedback_given: negativeCount > 0,
      positiveCount,
      negativeCount,
    };
  });

  const positiveTotal = individualTracking.reduce((sum, s) => sum + s.positiveCount, 0);
  const negativeTotal = individualTracking.reduce((sum, s) => sum + s.negativeCount, 0);
  const avgScore = Math.round(individualTracking.reduce((sum, s) => sum + s.performance_score, 0) / individualTracking.length);

  const topPerformers = individualTracking
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 5)
    .map((s) => ({
      name: s.name,
      department: s.department,
      score: s.performance_score,
      highlights: s.key_observations.filter((_, i) => i < 2),
    }));

  // 부서별 요약
  const departments = [...new Set(individualTracking.map((s) => s.department))];
  const departmentSummary = departments.map((dept) => {
    const deptStaff = individualTracking.filter((s) => s.department === dept);
    const deptAvg = Math.round(deptStaff.reduce((sum, s) => sum + s.performance_score, 0) / deptStaff.length);

    return {
      department: dept,
      staff_count: deptStaff.length,
      avg_score: deptAvg,
      strengths: deptAvg >= 80 ? ["팀워크 우수", "고객 응대 적극적"] : ["기본 업무 수행"],
      areas_for_improvement: deptAvg < 75 ? ["응대 속도", "적극성"] : [],
    };
  });

  // 개입 필요 대상
  const interventionNeeded = individualTracking
    .filter((s) => s.performance_score < 60 || s.negativeCount >= 2)
    .map((s) => ({
      staff_id: s.staff_id,
      name: s.name,
      issue: s.negativeCount >= 2 ? "반복적 부정 관찰" : "성과 미달",
      recommended_action: s.negativeCount >= 2 ? "즉시 1:1 면담" : "코칭 및 모니터링",
      urgency: s.negativeCount >= 3 ? "immediate" as const : "end_of_shift" as const,
    }));

  // 인정 대기열
  const recognitionQueue = individualTracking
    .filter((s) => s.performance_score >= 90)
    .map((s) => ({
      staff_id: s.staff_id,
      name: s.name,
      achievement: "우수한 서비스 제공",
      recognition_type: s.performance_score >= 95 ? "MVP 후보" : "칭찬 카드",
    }));

  return {
    event_id: input.event_id,
    performance_snapshot: {
      total_staff_observed: input.staff_observations.length,
      positive_observations: positiveTotal,
      negative_observations: negativeTotal,
      average_performance_score: avgScore,
      top_performers: topPerformers,
    },
    department_summary: departmentSummary,
    individual_tracking: individualTracking.map((s) => ({
      staff_id: s.staff_id,
      name: s.name,
      performance_score: s.performance_score,
      trend: s.trend,
      key_observations: s.key_observations,
      feedback_given: s.feedback_given,
    })),
    intervention_needed: interventionNeeded,
    recognition_queue: recognitionQueue,
  };
}

export const HR_025_PerformanceTracking = {
  id: "HR-025",
  name: "Performance Tracking",
  description: "실시간 성과 추적 및 피드백",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.10",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_025_InputSchema,
  outputSchema: HR_025_OutputSchema,
  persona: `당신은 성과 관리 전문가입니다. 실시간 관찰을 통해 우수 인력을 발굴하고 문제 상황에 조기 개입합니다.`,
};

export default HR_025_PerformanceTracking;
