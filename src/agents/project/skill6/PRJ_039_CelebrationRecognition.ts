/**
 * PRJ-039: 축하 및 인정
 * CMP-IS Reference: 6.3.i - Celebrating success and recognizing contributions
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Celebration and Recognition Agent for event projects.
CMP-IS Standard: 6.3.i - Celebrating success and recognizing contributions`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  team_members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    department: z.string(),
    contributions: z.array(z.string()).optional(),
    exceptional_performance: z.boolean().default(false),
  })),
  project_achievements: z.array(z.object({
    achievement: z.string(),
    impact: z.string(),
    key_contributors: z.array(z.string()),
  })),
  budget_for_celebration: z.number().optional(),
  currency: z.string().default("KRW"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  recognition_id: z.string(),
  event_id: z.string(),
  recognition_summary: z.object({
    event_name: z.string(),
    team_size: z.number(),
    achievements_count: z.number(),
    top_performers: z.number(),
  }),
  achievement_highlights: z.array(z.object({
    achievement: z.string(),
    impact: z.string(),
    recognition_type: z.string(),
    key_contributors: z.array(z.string()),
  })),
  individual_recognitions: z.array(z.object({
    member_id: z.string(),
    member_name: z.string(),
    role: z.string(),
    recognition_type: z.enum(["outstanding", "excellent", "good", "participation"]),
    contributions_summary: z.string(),
    recommended_reward: z.string(),
  })),
  team_recognition: z.object({
    team_award: z.string(),
    message: z.string(),
    celebration_event: z.object({
      type: z.string(),
      date: z.string(),
      budget: z.number(),
      activities: z.array(z.string()),
    }),
  }),
  communication_plan: z.array(z.object({
    channel: z.string(),
    audience: z.string(),
    message_type: z.string(),
    timing: z.string(),
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

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { team_members, project_achievements, budget_for_celebration, currency } = validatedInput;

  const topPerformers = team_members.filter(m => m.exceptional_performance);
  const celebrationBudget = budget_for_celebration || team_members.length * 100000;

  // 성과 하이라이트
  const achievementHighlights = project_achievements.map(ach => ({
    achievement: ach.achievement,
    impact: ach.impact,
    recognition_type: "팀 공로상",
    key_contributors: ach.key_contributors,
  }));

  // 개인 인정
  const individualRecognitions = team_members.map(member => {
    const recognitionType: "outstanding" | "excellent" | "good" | "participation" =
      member.exceptional_performance ? "outstanding" :
      (member.contributions?.length || 0) >= 3 ? "excellent" :
      (member.contributions?.length || 0) >= 1 ? "good" : "participation";

    const rewards: Record<string, string> = {
      outstanding: "인센티브 + 표창장 + 상품권",
      excellent: "표창장 + 상품권",
      good: "감사장 + 소정의 선물",
      participation: "감사장",
    };

    return {
      member_id: member.id,
      member_name: member.name,
      role: member.role,
      recognition_type: recognitionType,
      contributions_summary: member.contributions?.join(", ") || `${member.role} 역할 수행`,
      recommended_reward: rewards[recognitionType],
    };
  });

  return {
    recognition_id: generateUUID(),
    event_id: validatedInput.event_id,
    recognition_summary: {
      event_name: validatedInput.event_name,
      team_size: team_members.length,
      achievements_count: project_achievements.length,
      top_performers: topPerformers.length,
    },
    achievement_highlights: achievementHighlights,
    individual_recognitions: individualRecognitions,
    team_recognition: {
      team_award: "프로젝트 성공 달성상",
      message: `${validatedInput.event_name} 프로젝트를 성공적으로 완수한 모든 팀원분들께 감사드립니다. ` +
        `여러분의 헌신과 노력으로 훌륭한 결과를 이끌어낼 수 있었습니다.`,
      celebration_event: {
        type: "팀 회식 및 시상식",
        date: addDays(7),
        budget: celebrationBudget,
        activities: [
          "프로젝트 성과 발표",
          "개인 및 팀 시상",
          "감사 메시지 공유",
          "팀 회식",
          "추억 영상 시청",
        ],
      },
    },
    communication_plan: [
      {
        channel: "전체 이메일",
        audience: "전사",
        message_type: "프로젝트 성공 공지",
        timing: "즉시",
      },
      {
        channel: "사내 인트라넷",
        audience: "전사",
        message_type: "성과 하이라이트 게시",
        timing: "1주일 내",
      },
      {
        channel: "팀 미팅",
        audience: "프로젝트 팀",
        message_type: "개인 감사 및 피드백",
        timing: "축하 행사 시",
      },
      {
        channel: "경영진 보고",
        audience: "경영진",
        message_type: "우수 인력 추천",
        timing: "2주일 내",
      },
    ],
    recommendations: [
      "개인별 공로를 구체적으로 언급하여 인정",
      "축하 행사는 프로젝트 종료 2주 내 진행",
      "우수 팀원 인사 평가 반영",
      "성공 사례를 조직 전체와 공유",
      "향후 프로젝트 핵심 인력으로 육성",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-039",
  taskName: "축하 및 인정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.i",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
