/**
 * MKT-016: 캠페인 런칭
 * CMP-IS Reference: 8.1.a - Campaign launch and activation
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Campaign Launch Agent.
CMP-IS Standard: 8.1.a - Executing campaign launches with coordinated activation across channels.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string(),
  campaign_name: z.string(),
  launch_date: z.string(),
  channels: z.array(z.string()),
  budget: z.number(),
  target_audience: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  launch_id: z.string(),
  event_id: z.string(),
  campaign_id: z.string(),
  status: z.string(),
  launch_checklist: z.array(z.object({
    item: z.string(),
    status: z.string(),
    responsible: z.string(),
  })),
  channel_activations: z.array(z.object({
    channel: z.string(),
    status: z.string(),
    activation_time: z.string(),
    initial_metrics: z.object({
      impressions: z.number(),
      reach: z.number(),
    }),
  })),
  launch_summary: z.object({
    total_channels: z.number(),
    activated_channels: z.number(),
    budget_allocated: z.number(),
    expected_reach_day1: z.number(),
  }),
  next_steps: z.array(z.string()),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  const channelActivations = validatedInput.channels.map(channel => ({
    channel,
    status: "activated",
    activation_time: new Date().toISOString(),
    initial_metrics: {
      impressions: Math.floor(Math.random() * 10000) + 5000,
      reach: Math.floor(Math.random() * 5000) + 2000,
    },
  }));

  return {
    launch_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaign_id: validatedInput.campaign_id,
    status: "launched",
    launch_checklist: [
      { item: "크리에이티브 최종 승인", status: "completed", responsible: "Creative Team" },
      { item: "랜딩페이지 라이브", status: "completed", responsible: "Web Team" },
      { item: "트래킹 코드 설치", status: "completed", responsible: "Analytics" },
      { item: "광고 계정 설정", status: "completed", responsible: "Media Team" },
      { item: "예산 배분 확정", status: "completed", responsible: "Marketing Manager" },
      { item: "A/B 테스트 설정", status: "completed", responsible: "Growth Team" },
    ],
    channel_activations: channelActivations,
    launch_summary: {
      total_channels: validatedInput.channels.length,
      activated_channels: validatedInput.channels.length,
      budget_allocated: validatedInput.budget,
      expected_reach_day1: channelActivations.reduce((sum, ch) => sum + ch.initial_metrics.reach, 0),
    },
    next_steps: [
      "1시간 후 초기 지표 확인",
      "4시간 후 성과 리포트 작성",
      "24시간 후 첫 최적화 진행",
      "저성과 광고 소재 교체 준비",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-016";
export const taskName = "캠페인 런칭";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.a";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
