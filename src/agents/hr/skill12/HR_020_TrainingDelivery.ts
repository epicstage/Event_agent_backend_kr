/**
 * HR-020: Training Delivery
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 교육 프로그램 실행 및 이수 관리
 */

import { z } from "zod";

export const HR_020_InputSchema = z.object({
  event_id: z.string().uuid(),
  training_modules: z.array(z.object({
    module_id: z.string(),
    title: z.string(),
    duration_minutes: z.number(),
    is_mandatory: z.boolean(),
    has_assessment: z.boolean(),
    passing_score: z.number().optional(),
  })),
  staff_count: z.number(),
  delivery_date: z.string(),
});

export const HR_020_OutputSchema = z.object({
  event_id: z.string(),
  training_summary: z.object({
    total_modules: z.number(),
    mandatory_count: z.number(),
    total_training_hours: z.number(),
    overall_completion_rate: z.number(),
    average_score: z.number(),
  }),
  module_status: z.array(z.object({
    module_id: z.string(),
    title: z.string(),
    enrolled: z.number(),
    completed: z.number(),
    in_progress: z.number(),
    not_started: z.number(),
    pass_rate: z.number(),
    average_score: z.number(),
  })),
  staff_progress: z.object({
    fully_completed: z.number(),
    partially_completed: z.number(),
    not_started: z.number(),
    requires_attention: z.array(z.object({
      category: z.string(),
      count: z.number(),
      action: z.string(),
    })),
  }),
  certificates: z.object({
    issued: z.number(),
    pending: z.number(),
    template: z.string(),
  }),
  action_items: z.array(z.object({
    action: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    deadline: z.string(),
  })),
});

export type HR_020_Input = z.infer<typeof HR_020_InputSchema>;
export type HR_020_Output = z.infer<typeof HR_020_OutputSchema>;

export async function execute(input: HR_020_Input): Promise<HR_020_Output> {
  const totalTrainingMinutes = input.training_modules.reduce((sum, m) => sum + m.duration_minutes, 0);
  const mandatoryCount = input.training_modules.filter((m) => m.is_mandatory).length;

  const moduleStatus = input.training_modules.map((module) => {
    const enrolled = input.staff_count;
    const completedRate = 0.7 + Math.random() * 0.25;
    const completed = Math.round(enrolled * completedRate);
    const inProgress = Math.round((enrolled - completed) * 0.6);
    const notStarted = enrolled - completed - inProgress;
    const passRate = module.has_assessment ? 80 + Math.random() * 18 : 100;
    const avgScore = module.has_assessment ? 75 + Math.random() * 20 : 0;

    return {
      module_id: module.module_id,
      title: module.title,
      enrolled,
      completed,
      in_progress: inProgress,
      not_started: notStarted,
      pass_rate: Math.round(passRate),
      average_score: Math.round(avgScore * 10) / 10,
    };
  });

  const overallCompletionRate = Math.round(
    moduleStatus.reduce((sum, m) => sum + (m.completed / m.enrolled), 0) / moduleStatus.length * 100
  );

  const avgScore = Math.round(
    moduleStatus.filter((m) => m.average_score > 0).reduce((sum, m) => sum + m.average_score, 0) /
    moduleStatus.filter((m) => m.average_score > 0).length * 10
  ) / 10;

  const fullyCompleted = Math.round(input.staff_count * 0.65);
  const partiallyCompleted = Math.round(input.staff_count * 0.25);
  const notStartedStaff = input.staff_count - fullyCompleted - partiallyCompleted;

  return {
    event_id: input.event_id,
    training_summary: {
      total_modules: input.training_modules.length,
      mandatory_count: mandatoryCount,
      total_training_hours: Math.round(totalTrainingMinutes / 60 * 10) / 10,
      overall_completion_rate: overallCompletionRate,
      average_score: avgScore,
    },
    module_status: moduleStatus,
    staff_progress: {
      fully_completed: fullyCompleted,
      partially_completed: partiallyCompleted,
      not_started: notStartedStaff,
      requires_attention: [
        { category: "필수 교육 미이수", count: Math.round(input.staff_count * 0.08), action: "개별 연락 및 재교육 일정" },
        { category: "평가 미통과", count: Math.round(input.staff_count * 0.05), action: "재시험 기회 제공" },
        { category: "교육 시작 안함", count: notStartedStaff, action: "긴급 리마인더 + 1:1 지원" },
      ],
    },
    certificates: {
      issued: fullyCompleted,
      pending: partiallyCompleted,
      template: "행사 스태프 교육 이수증",
    },
    action_items: [
      { action: "미이수자 개별 연락", priority: "high", deadline: "D-3" },
      { action: "재시험 대상자 안내", priority: "high", deadline: "D-3" },
      { action: "이수증 일괄 발급", priority: "medium", deadline: "D-2" },
      { action: "교육 피드백 수집", priority: "low", deadline: "D+3" },
      { action: "교육 효과성 분석 보고서", priority: "low", deadline: "D+7" },
    ],
  };
}

export const HR_020_TrainingDelivery = {
  id: "HR-020",
  name: "Training Delivery",
  description: "교육 프로그램 실행 및 이수 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.5",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_020_InputSchema,
  outputSchema: HR_020_OutputSchema,
  persona: `당신은 교육 운영 전문가입니다. 효과적인 교육 전달과 체계적인 이수 관리로 스태프 역량을 강화합니다.`,
};

export default HR_020_TrainingDelivery;
