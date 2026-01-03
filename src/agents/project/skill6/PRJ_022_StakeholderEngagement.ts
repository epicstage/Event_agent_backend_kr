/**
 * PRJ-022: 이해관계자 참여 관리
 * CMP-IS Reference: 6.1.i - Managing stakeholder engagement
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Engagement Agent for event projects.
CMP-IS Standard: 6.1.i - Managing stakeholder engagement`;

export const InputSchema = z.object({
  event_id: z.string(),
  stakeholders: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    engagement_level: z.enum(["unaware", "resistant", "neutral", "supportive", "leading"]),
    target_engagement: z.enum(["unaware", "resistant", "neutral", "supportive", "leading"]),
    last_interaction: z.string().optional(),
    satisfaction_score: z.number().optional(),
  })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  engagement_summary: z.object({
    total_stakeholders: z.number(),
    on_target: z.number(),
    below_target: z.number(),
    above_target: z.number(),
    average_satisfaction: z.number(),
  }),
  engagement_analysis: z.array(z.object({
    stakeholder_id: z.string(),
    name: z.string(),
    current_level: z.string(),
    target_level: z.string(),
    gap: z.number(),
    priority: z.enum(["high", "medium", "low"]),
    recommended_actions: z.array(z.string()),
  })),
  engagement_plan: z.array(z.object({
    stakeholder_id: z.string(),
    activities: z.array(z.string()),
    frequency: z.string(),
    owner: z.string(),
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

const engagementScore: Record<string, number> = {
  unaware: 1, resistant: 2, neutral: 3, supportive: 4, leading: 5,
};

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const stakeholders = validatedInput.stakeholders;

  const engagementAnalysis = stakeholders.map(sh => {
    const current = engagementScore[sh.engagement_level];
    const target = engagementScore[sh.target_engagement];
    const gap = target - current;

    let priority: "high" | "medium" | "low" = "low";
    if (gap >= 2) priority = "high";
    else if (gap === 1) priority = "medium";

    const actions: string[] = [];
    if (gap > 0) {
      actions.push("정기 미팅 빈도 증가");
      actions.push("맞춤형 커뮤니케이션 강화");
      if (gap >= 2) actions.push("1:1 대면 미팅 진행");
    }

    return {
      stakeholder_id: sh.id,
      name: sh.name,
      current_level: sh.engagement_level,
      target_level: sh.target_engagement,
      gap,
      priority,
      recommended_actions: actions,
    };
  });

  const onTarget = engagementAnalysis.filter(e => e.gap <= 0).length;
  const belowTarget = engagementAnalysis.filter(e => e.gap > 0).length;
  const avgSatisfaction = stakeholders.reduce((sum, s) => sum + (s.satisfaction_score || 70), 0) / stakeholders.length;

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    engagement_summary: {
      total_stakeholders: stakeholders.length,
      on_target: onTarget,
      below_target: belowTarget,
      above_target: engagementAnalysis.filter(e => e.gap < 0).length,
      average_satisfaction: Math.round(avgSatisfaction),
    },
    engagement_analysis: engagementAnalysis,
    engagement_plan: engagementAnalysis.filter(e => e.gap > 0).map(e => ({
      stakeholder_id: e.stakeholder_id,
      activities: e.recommended_actions,
      frequency: e.priority === "high" ? "주간" : "격주",
      owner: "PM",
    })),
    recommendations: [
      `참여도 미달 이해관계자 ${belowTarget}명 관리 필요`,
      "정기 피드백 수집 권장",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-022",
  taskName: "이해관계자 참여 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.i",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
