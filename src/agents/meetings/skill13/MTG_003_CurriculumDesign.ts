/**
 * MTG-003: Curriculum & Learning Path Design
 *
 * CMP-IS Domain G: Meetings & Contents - Skill 13: Program Design
 * 교육 프로그램 커리큘럼 및 학습 경로 설계
 */

import { z } from "zod";

export const MTG_003_InputSchema = z.object({
  event_id: z.string().uuid(),
  program_type: z.enum(["certification", "professional_development", "workshop", "bootcamp", "masterclass"]),
  skill_domain: z.string(),
  target_level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  duration_hours: z.number().min(1).max(100),
  ce_credits_required: z.boolean().default(false),
  learning_objectives: z.array(z.string()).min(1),
});

export const MTG_003_OutputSchema = z.object({
  event_id: z.string(),
  curriculum: z.object({
    title: z.string(),
    overview: z.string(),
    modules: z.array(z.object({
      module_id: z.string(),
      title: z.string(),
      duration_hours: z.number(),
      learning_objectives: z.array(z.string()),
      topics: z.array(z.string()),
      activities: z.array(z.object({
        type: z.enum(["lecture", "discussion", "exercise", "case_study", "lab", "assessment"]),
        duration_minutes: z.number(),
        description: z.string(),
      })),
      assessment: z.object({
        type: z.string(),
        weight: z.number(),
      }).optional(),
    })),
    learning_path: z.object({
      prerequisites: z.array(z.string()),
      sequence: z.array(z.string()),
      milestones: z.array(z.object({
        after_module: z.string(),
        checkpoint: z.string(),
      })),
    }),
    total_hours: z.number(),
    ce_credits: z.number().optional(),
  }),
  resources: z.object({
    materials_needed: z.array(z.string()),
    instructor_requirements: z.object({
      count: z.number(),
      qualifications: z.array(z.string()),
    }),
    technical_requirements: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_003_Input = z.infer<typeof MTG_003_InputSchema>;
export type MTG_003_Output = z.infer<typeof MTG_003_OutputSchema>;

export async function execute(input: MTG_003_Input): Promise<MTG_003_Output> {
  const { skill_domain, duration_hours, learning_objectives, target_level, program_type } = input;

  const moduleCount = Math.max(3, Math.ceil(duration_hours / 4));
  const hoursPerModule = duration_hours / moduleCount;

  const modules = learning_objectives.slice(0, moduleCount).map((obj, idx) => ({
    module_id: `MOD-${String(idx + 1).padStart(2, "0")}`,
    title: `Module ${idx + 1}: ${obj.substring(0, 50)}`,
    duration_hours: hoursPerModule,
    learning_objectives: [obj],
    topics: [`${skill_domain} - Topic ${idx + 1}A`, `${skill_domain} - Topic ${idx + 1}B`],
    activities: [
      { type: "lecture" as const, duration_minutes: Math.round(hoursPerModule * 20), description: "개념 설명 및 이론" },
      { type: "exercise" as const, duration_minutes: Math.round(hoursPerModule * 25), description: "실습 활동" },
      { type: "discussion" as const, duration_minutes: Math.round(hoursPerModule * 15), description: "그룹 토론" },
    ],
    assessment: idx === moduleCount - 1 ? { type: "final_project", weight: 40 } : { type: "quiz", weight: 20 / (moduleCount - 1) },
  }));

  return {
    event_id: input.event_id,
    curriculum: {
      title: `${skill_domain} ${program_type.charAt(0).toUpperCase() + program_type.slice(1)} Program`,
      overview: `${target_level} 레벨 대상 ${skill_domain} 역량 강화 프로그램`,
      modules,
      learning_path: {
        prerequisites: target_level === "beginner" ? [] : [`${skill_domain} 기초 지식`, "관련 업무 경험 1년 이상"],
        sequence: modules.map(m => m.module_id),
        milestones: [
          { after_module: modules[Math.floor(moduleCount / 2)]?.module_id || "MOD-02", checkpoint: "중간 점검 및 피드백" },
          { after_module: modules[moduleCount - 1]?.module_id || "MOD-03", checkpoint: "최종 평가 및 수료" },
        ],
      },
      total_hours: duration_hours,
      ce_credits: input.ce_credits_required ? Math.floor(duration_hours * 0.8) : undefined,
    },
    resources: {
      materials_needed: ["강의 자료(PDF/PPT)", "실습 워크북", "사례 연구 자료", "평가 도구"],
      instructor_requirements: {
        count: Math.ceil(duration_hours / 20),
        qualifications: [`${skill_domain} 분야 전문가`, "강의 경력 3년 이상", "관련 자격증 보유"],
      },
      technical_requirements: ["프로젝터", "노트북", "화이트보드", program_type === "bootcamp" ? "실습용 소프트웨어" : ""],
    },
    recommendations: [
      "사전 학습 자료 배포로 수업 효율 극대화",
      "모듈별 Q&A 세션 별도 운영 권장",
      input.ce_credits_required ? "CE 인증 기관 사전 승인 필요" : "수료증 디자인 사전 준비",
      "참가자 수 15-20명 권장 (실습 효과 최적화)",
    ],
  };
}

export const MTG_003_CurriculumDesign = {
  id: "MTG-003",
  name: "Curriculum & Learning Path Design",
  description: "교육 프로그램 커리큘럼 설계",
  inputSchema: MTG_003_InputSchema,
  outputSchema: MTG_003_OutputSchema,
  execute,
  tags: ["curriculum", "learning", "education", "training"],
  domain: "meetings",
  skill: 13,
  taskType: "AI" as const,
};
