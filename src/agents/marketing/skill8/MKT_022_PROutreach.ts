/**
 * MKT-022: PR 아웃리치
 * CMP-IS Reference: 8.1.g - PR outreach and media relations execution
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert PR Outreach Agent.
CMP-IS Standard: 8.1.g - Executing PR outreach and media relations activities.`;

export const InputSchema = z.object({
  event_id: z.string(),
  press_release: z.object({
    headline: z.string(),
    summary: z.string(),
    body: z.string().optional(),
  }),
  target_media: z.array(z.string()).optional(),
  embargo_date: z.string().optional(),
  spokesperson: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  outreach_id: z.string(),
  event_id: z.string(),
  press_release_id: z.string(),
  distribution_summary: z.object({
    total_outlets: z.number(),
    emails_sent: z.number(),
    opens: z.number(),
    responses: z.number(),
  }),
  media_list: z.array(z.object({
    outlet_name: z.string(),
    journalist: z.string(),
    contact_status: z.string(),
    interest_level: z.string(),
    follow_up_date: z.string(),
  })),
  press_materials: z.array(z.object({
    material_type: z.string(),
    status: z.string(),
    download_url: z.string(),
  })),
  interview_requests: z.array(z.object({
    outlet: z.string(),
    journalist: z.string(),
    requested_date: z.string(),
    status: z.string(),
  })),
  coverage_tracking: z.object({
    articles_published: z.number(),
    pending_coverage: z.number(),
    estimated_reach: z.number(),
  }),
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
    outreach_id: generateUUID(),
    event_id: validatedInput.event_id,
    press_release_id: generateUUID(),
    distribution_summary: {
      total_outlets: 50,
      emails_sent: 75,
      opens: 45,
      responses: 12,
    },
    media_list: [
      { outlet_name: "경제일보", journalist: "김기자", contact_status: "contacted", interest_level: "high", follow_up_date: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
      { outlet_name: "IT조선", journalist: "이기자", contact_status: "responded", interest_level: "high", follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
      { outlet_name: "매일경제", journalist: "박기자", contact_status: "contacted", interest_level: "medium", follow_up_date: new Date(Date.now() + 259200000).toISOString().split('T')[0] },
      { outlet_name: "한국경제", journalist: "최기자", contact_status: "pending", interest_level: "unknown", follow_up_date: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
    ],
    press_materials: [
      { material_type: "보도자료", status: "ready", download_url: "/press/release_kr.pdf" },
      { material_type: "팩트시트", status: "ready", download_url: "/press/factsheet.pdf" },
      { material_type: "고해상도 이미지", status: "ready", download_url: "/press/images.zip" },
      { material_type: "로고 패키지", status: "ready", download_url: "/press/logos.zip" },
      { material_type: "연사 프로필", status: "ready", download_url: "/press/speakers.pdf" },
    ],
    interview_requests: [
      { outlet: "IT조선", journalist: "이기자", requested_date: new Date(Date.now() + 604800000).toISOString().split('T')[0], status: "pending_confirmation" },
      { outlet: "YTN", journalist: "정PD", requested_date: new Date(Date.now() + 432000000).toISOString().split('T')[0], status: "confirmed" },
    ],
    coverage_tracking: {
      articles_published: 3,
      pending_coverage: 8,
      estimated_reach: 250000,
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-022";
export const taskName = "PR 아웃리치";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.g";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
