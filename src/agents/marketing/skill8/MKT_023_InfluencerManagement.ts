/**
 * MKT-023: 인플루언서 관리
 * CMP-IS Reference: 8.1.h - Influencer relationship and campaign management
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Influencer Management Agent.
CMP-IS Standard: 8.1.h - Managing influencer relationships and campaign execution.`;

export const InputSchema = z.object({
  event_id: z.string(),
  influencer_id: z.string().optional(),
  action_type: z.enum(["onboard", "brief", "track", "report"]),
  influencer_details: z.object({
    name: z.string(),
    platform: z.string(),
    followers: z.number().optional(),
    engagement_rate: z.number().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  management_id: z.string(),
  event_id: z.string(),
  influencer_roster: z.array(z.object({
    influencer_id: z.string(),
    name: z.string(),
    platform: z.string(),
    tier: z.string(),
    status: z.string(),
    contracted_deliverables: z.array(z.string()),
    completed_deliverables: z.array(z.string()),
    pending_deliverables: z.array(z.string()),
  })),
  campaign_briefs: z.array(z.object({
    brief_id: z.string(),
    influencer_name: z.string(),
    key_messages: z.array(z.string()),
    content_requirements: z.array(z.string()),
    deadline: z.string(),
    approval_status: z.string(),
  })),
  content_tracking: z.array(z.object({
    content_id: z.string(),
    influencer_name: z.string(),
    platform: z.string(),
    content_type: z.string(),
    published_date: z.string(),
    metrics: z.object({
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
      shares: z.number(),
      engagement_rate: z.number(),
    }),
  })),
  payment_status: z.array(z.object({
    influencer_name: z.string(),
    total_fee: z.number(),
    paid: z.number(),
    pending: z.number(),
    payment_schedule: z.string(),
  })),
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

  return {
    management_id: generateUUID(),
    event_id: validatedInput.event_id,
    influencer_roster: [
      {
        influencer_id: generateUUID(),
        name: "인플루언서A",
        platform: "Instagram",
        tier: "Macro",
        status: "active",
        contracted_deliverables: ["피드 포스트 2개", "스토리 4개", "현장 라이브"],
        completed_deliverables: ["피드 포스트 1개", "스토리 2개"],
        pending_deliverables: ["피드 포스트 1개", "스토리 2개", "현장 라이브"],
      },
      {
        influencer_id: generateUUID(),
        name: "인플루언서B",
        platform: "YouTube",
        tier: "Mid",
        status: "active",
        contracted_deliverables: ["브이로그 1개", "쇼츠 2개"],
        completed_deliverables: ["쇼츠 1개"],
        pending_deliverables: ["브이로그 1개", "쇼츠 1개"],
      },
      {
        influencer_id: generateUUID(),
        name: "인플루언서C",
        platform: "LinkedIn",
        tier: "Micro",
        status: "briefed",
        contracted_deliverables: ["포스트 2개", "아티클 1개"],
        completed_deliverables: [],
        pending_deliverables: ["포스트 2개", "아티클 1개"],
      },
    ],
    campaign_briefs: [
      {
        brief_id: generateUUID(),
        influencer_name: "인플루언서A",
        key_messages: ["업계 최고의 네트워킹 기회", "실무 인사이트 공유", "얼리버드 할인"],
        content_requirements: ["이벤트 해시태그 필수", "프로모 코드 언급", "등록 링크 포함"],
        deadline: new Date(Date.now() + 604800000).toISOString().split('T')[0],
        approval_status: "approved",
      },
    ],
    content_tracking: [
      {
        content_id: generateUUID(),
        influencer_name: "인플루언서A",
        platform: "Instagram",
        content_type: "피드 포스트",
        published_date: new Date(Date.now() - 172800000).toISOString(),
        metrics: {
          views: 45000,
          likes: 2300,
          comments: 156,
          shares: 89,
          engagement_rate: 5.7,
        },
      },
      {
        content_id: generateUUID(),
        influencer_name: "인플루언서B",
        platform: "YouTube",
        content_type: "쇼츠",
        published_date: new Date(Date.now() - 86400000).toISOString(),
        metrics: {
          views: 12000,
          likes: 890,
          comments: 45,
          shares: 23,
          engagement_rate: 8.0,
        },
      },
    ],
    payment_status: [
      { influencer_name: "인플루언서A", total_fee: 3000000, paid: 1500000, pending: 1500000, payment_schedule: "50% 선금, 50% 완료 후" },
      { influencer_name: "인플루언서B", total_fee: 1500000, paid: 750000, pending: 750000, payment_schedule: "50% 선금, 50% 완료 후" },
      { influencer_name: "인플루언서C", total_fee: 500000, paid: 0, pending: 500000, payment_schedule: "100% 완료 후" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-023";
export const taskName = "인플루언서 관리";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.h";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
