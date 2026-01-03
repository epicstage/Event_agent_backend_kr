/**
 * STR-016: 이해관계자 참여 전략
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Engagement Strategy)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Engagement Strategy Agent for event planning.

Your expertise includes:
- Designing tailored engagement strategies
- Multi-channel communication planning
- Stakeholder journey mapping
- Engagement metric definition

CMP-IS Standard: Domain A - Strategic Planning (Engagement Strategy)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  stakeholders: z.array(z.object({
    id: z.string(),
    name: z.string(),
    tier: z.enum(["tier_1", "tier_2", "tier_3", "tier_4"]),
    preferences: z.object({
      communication_style: z.enum(["formal", "informal", "mixed"]).optional(),
      preferred_channels: z.array(z.string()).optional(),
      meeting_frequency: z.string().optional(),
    }).optional(),
    goals: z.array(z.string()).optional(),
    concerns: z.array(z.string()).optional(),
  })),
  event_timeline: z.object({
    start_date: z.string(),
    event_date: z.string(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  strategy_id: z.string().uuid(),
  event_id: z.string().uuid(),
  engagement_plans: z.array(z.object({
    stakeholder_id: z.string(),
    name: z.string(),
    engagement_objectives: z.array(z.string()),
    tactics: z.array(z.object({
      tactic: z.string(),
      channel: z.string(),
      frequency: z.string(),
      owner: z.string(),
    })),
    key_touchpoints: z.array(z.object({
      phase: z.string(),
      touchpoint: z.string(),
      purpose: z.string(),
    })),
    success_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
    })),
    risk_mitigation: z.array(z.string()),
  })),
  engagement_calendar: z.array(z.object({
    week: z.number(),
    activities: z.array(z.object({
      stakeholder: z.string(),
      activity: z.string(),
      channel: z.string(),
    })),
  })),
  resources_required: z.object({
    team_members: z.array(z.string()),
    tools: z.array(z.string()),
    budget_estimate: z.number(),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-016",
  taskName: "Engagement Strategy",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자별 맞춤형 참여 전략을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const engagementPlans = validated.stakeholders.map(s => {
    const channels = s.preferences?.preferred_channels || ["이메일", "미팅"];
    const freq = s.tier === "tier_1" ? "주 1회" : s.tier === "tier_2" ? "격주" : "월 1회";

    return {
      stakeholder_id: s.id,
      name: s.name,
      engagement_objectives: s.goals || ["이벤트 성공 지원", "지속적 관계 유지"],
      tactics: [
        { tactic: "정기 업데이트", channel: channels[0] || "이메일", frequency: freq, owner: "프로젝트 매니저" },
        { tactic: "진행 상황 공유", channel: "대시보드", frequency: "실시간", owner: "운영팀" },
      ],
      key_touchpoints: [
        { phase: "기획", touchpoint: "킥오프 미팅", purpose: "목표 공유 및 기대 조율" },
        { phase: "준비", touchpoint: "중간 점검", purpose: "진행 상황 검토" },
        { phase: "실행", touchpoint: "이벤트 참석", purpose: "현장 경험 및 피드백" },
        { phase: "사후", touchpoint: "성과 보고", purpose: "결과 공유 및 관계 유지" },
      ],
      success_metrics: [
        { metric: "응답률", target: s.tier === "tier_1" ? "90%" : "70%" },
        { metric: "만족도", target: "4.0/5.0" },
      ],
      risk_mitigation: s.concerns || ["기대치 관리 필요", "소통 채널 다변화"],
    };
  });

  const calendar = [1, 2, 3, 4].map(week => ({
    week,
    activities: validated.stakeholders
      .filter(s => s.tier === "tier_1" || (s.tier === "tier_2" && week % 2 === 0))
      .map(s => ({
        stakeholder: s.name,
        activity: week === 1 ? "킥오프" : week === 4 ? "중간 점검" : "진행 상황 업데이트",
        channel: s.preferences?.preferred_channels?.[0] || "이메일",
      })),
  }));

  return {
    strategy_id: generateUUID(),
    event_id: validated.event_id,
    engagement_plans: engagementPlans,
    engagement_calendar: calendar,
    resources_required: {
      team_members: ["프로젝트 매니저", "커뮤니케이션 담당자"],
      tools: ["CRM", "이메일 마케팅 도구", "프로젝트 관리 도구"],
      budget_estimate: validated.stakeholders.length * 500,
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
