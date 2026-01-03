/**
 * PRJ-024: 교훈 수집
 * CMP-IS Reference: 6.1.k - Capturing lessons learned
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Lessons Learned Capture Agent for event projects.
CMP-IS Standard: 6.1.k - Capturing lessons learned`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  project_phase: z.enum(["planning", "execution", "closing"]),
  incidents: z.array(z.object({
    description: z.string(),
    category: z.enum(["success", "challenge", "failure"]),
    impact: z.enum(["high", "medium", "low"]),
    root_cause: z.string().optional(),
    resolution: z.string().optional(),
  })),
  team_feedback: z.array(z.object({
    area: z.string(),
    feedback: z.string(),
    suggested_improvement: z.string().optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  project_phase: z.string(),
  lessons_summary: z.object({
    total_lessons: z.number(),
    successes: z.number(),
    challenges: z.number(),
    failures: z.number(),
  }),
  categorized_lessons: z.array(z.object({
    lesson_id: z.string(),
    category: z.string(),
    title: z.string(),
    description: z.string(),
    root_cause: z.string(),
    impact_level: z.string(),
    recommendations: z.array(z.string()),
    applicable_projects: z.array(z.string()),
  })),
  best_practices: z.array(z.object({
    practice: z.string(),
    benefit: z.string(),
    implementation_guide: z.string(),
  })),
  improvement_areas: z.array(z.object({
    area: z.string(),
    current_state: z.string(),
    target_state: z.string(),
    action_items: z.array(z.string()),
  })),
  knowledge_transfer: z.object({
    documents_to_update: z.array(z.string()),
    training_needs: z.array(z.string()),
    process_changes: z.array(z.string()),
  }),
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
  const { incidents, team_feedback } = validatedInput;

  const successes = incidents.filter(i => i.category === "success");
  const challenges = incidents.filter(i => i.category === "challenge");
  const failures = incidents.filter(i => i.category === "failure");

  const categorizedLessons = incidents.map((incident, idx) => ({
    lesson_id: `LL-${String(idx + 1).padStart(3, "0")}`,
    category: incident.category,
    title: incident.description.substring(0, 50),
    description: incident.description,
    root_cause: incident.root_cause || "분석 필요",
    impact_level: incident.impact,
    recommendations: incident.category === "success"
      ? ["표준 프로세스로 채택", "다음 프로젝트에 적용"]
      : ["재발 방지 프로세스 수립", "체크리스트 추가"],
    applicable_projects: ["유사 규모 이벤트", "동일 장르 이벤트"],
  }));

  const bestPractices = successes.map(s => ({
    practice: s.description,
    benefit: "성공적인 결과 도출",
    implementation_guide: s.resolution || "기존 방식 유지 및 문서화",
  }));

  const improvementAreas = (team_feedback || []).map(fb => ({
    area: fb.area,
    current_state: fb.feedback,
    target_state: fb.suggested_improvement || "개선 목표 설정 필요",
    action_items: ["담당자 지정", "개선 계획 수립", "실행 및 모니터링"],
  }));

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    project_phase: validatedInput.project_phase,
    lessons_summary: {
      total_lessons: incidents.length,
      successes: successes.length,
      challenges: challenges.length,
      failures: failures.length,
    },
    categorized_lessons: categorizedLessons,
    best_practices: bestPractices,
    improvement_areas: improvementAreas,
    knowledge_transfer: {
      documents_to_update: ["프로젝트 관리 가이드", "체크리스트", "벤더 평가 기준"],
      training_needs: failures.length > 0 ? ["실패 사례 교육", "프로세스 개선 교육"] : [],
      process_changes: challenges.length > 0 ? ["리스크 관리 강화", "커뮤니케이션 개선"] : [],
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-024",
  taskName: "교훈 수집",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.k",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
