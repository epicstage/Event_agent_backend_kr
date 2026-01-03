/**
 * PRJ-029: 지식 공유
 * CMP-IS Reference: 6.2.e - Facilitating knowledge sharing
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Knowledge Sharing Agent for event projects.
CMP-IS Standard: 6.2.e - Facilitating knowledge sharing`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  knowledge_items: z.array(z.object({
    title: z.string(),
    category: z.enum(["process", "technical", "vendor", "stakeholder", "lesson_learned"]),
    content: z.string(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
  })),
  team_members: z.array(z.object({
    name: z.string(),
    role: z.string(),
    expertise_areas: z.array(z.string()).optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  knowledge_repository: z.object({
    total_items: z.number(),
    by_category: z.array(z.object({
      category: z.string(),
      count: z.number(),
    })),
    recent_additions: z.array(z.string()),
  }),
  knowledge_map: z.array(z.object({
    item_id: z.string(),
    title: z.string(),
    category: z.string(),
    relevance_score: z.number(),
    target_audience: z.array(z.string()),
    access_level: z.enum(["public", "team", "restricted"]),
  })),
  sharing_plan: z.array(z.object({
    method: z.string(),
    description: z.string(),
    frequency: z.string(),
    responsible: z.string(),
  })),
  expertise_directory: z.array(z.object({
    expert: z.string(),
    areas: z.array(z.string()),
    contact_for: z.array(z.string()),
  })),
  recommendations: z.array(z.string()),
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
  const { knowledge_items, team_members } = validatedInput;

  // 카테고리별 분류
  const categoryCount: Record<string, number> = {};
  knowledge_items.forEach(item => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  const byCategory = Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count,
  }));

  // 지식 맵
  const knowledgeMap = knowledge_items.map((item, idx) => ({
    item_id: `KN-${String(idx + 1).padStart(3, "0")}`,
    title: item.title,
    category: item.category,
    relevance_score: item.category === "lesson_learned" ? 95 : 80 + (idx * 2) % 15,
    target_audience: item.category === "technical" ? ["개발팀", "기술팀"] : ["전체 팀"],
    access_level: "team" as const,
  }));

  // 전문가 디렉토리
  const expertiseDirectory = (team_members || []).map(member => ({
    expert: member.name,
    areas: member.expertise_areas || [member.role],
    contact_for: [`${member.role} 관련 질문`],
  }));

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    knowledge_repository: {
      total_items: knowledge_items.length,
      by_category: byCategory,
      recent_additions: knowledge_items.slice(0, 3).map(k => k.title),
    },
    knowledge_map: knowledgeMap,
    sharing_plan: [
      {
        method: "주간 지식 공유 세션",
        description: "팀원들이 돌아가며 배운 점 공유",
        frequency: "주간",
        responsible: "팀 리드",
      },
      {
        method: "문서화 (Wiki/Notion)",
        description: "모든 프로세스 및 교훈 문서화",
        frequency: "실시간",
        responsible: "전체 팀",
      },
      {
        method: "온보딩 패키지",
        description: "신규 팀원용 핵심 지식 정리",
        frequency: "필요 시",
        responsible: "PM",
      },
      {
        method: "회고 미팅",
        description: "프로젝트 단계별 교훈 수집",
        frequency: "마일스톤별",
        responsible: "PM",
      },
    ],
    expertise_directory: expertiseDirectory,
    recommendations: [
      "정기적인 지식 공유 세션 운영",
      "모든 결정과 교훈을 문서화",
      "전문가 네트워크 활용 권장",
      "지식 저장소 정기 업데이트",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-029",
  taskName: "지식 공유",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.2.e",
  skill: "Skill 6: Manage Project",
  subSkill: "6.2: Coordinate Project Team",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
