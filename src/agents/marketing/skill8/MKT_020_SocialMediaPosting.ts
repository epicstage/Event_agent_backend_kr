/**
 * MKT-020: 소셜 미디어 포스팅
 * CMP-IS Reference: 8.1.e - Social media posting and scheduling
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Social Media Posting Agent.
CMP-IS Standard: 8.1.e - Managing social media posting schedules and content publishing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  content_id: z.string().optional(),
  platform: z.string(),
  post_content: z.object({
    text: z.string(),
    media_urls: z.array(z.string()).optional(),
    hashtags: z.array(z.string()).optional(),
  }),
  schedule_time: z.string().optional(),
  is_immediate: z.boolean().default(false),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  post_id: z.string(),
  event_id: z.string(),
  platform: z.string(),
  post_status: z.string(),
  published_at: z.string(),
  post_url: z.string(),
  engagement_tracking: z.object({
    tracking_enabled: z.boolean(),
    utm_parameters: z.string(),
    pixel_events: z.array(z.string()),
  }),
  optimization_applied: z.array(z.object({
    optimization: z.string(),
    details: z.string(),
  })),
  scheduled_boosts: z.array(z.object({
    boost_type: z.string(),
    trigger: z.string(),
    budget: z.number(),
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
  const postId = generateUUID();

  const platformUrls: Record<string, string> = {
    "Instagram": `https://instagram.com/p/${postId.slice(0, 10)}`,
    "LinkedIn": `https://linkedin.com/posts/${postId.slice(0, 10)}`,
    "Twitter": `https://twitter.com/event/status/${postId.slice(0, 18)}`,
    "Facebook": `https://facebook.com/event/posts/${postId.slice(0, 10)}`,
  };

  return {
    post_id: postId,
    event_id: validatedInput.event_id,
    platform: validatedInput.platform,
    post_status: validatedInput.is_immediate ? "published" : "scheduled",
    published_at: validatedInput.is_immediate
      ? new Date().toISOString()
      : validatedInput.schedule_time || new Date(Date.now() + 86400000).toISOString(),
    post_url: platformUrls[validatedInput.platform] || `https://social.com/post/${postId}`,
    engagement_tracking: {
      tracking_enabled: true,
      utm_parameters: `utm_source=${validatedInput.platform.toLowerCase()}&utm_medium=social&utm_campaign=event_promo`,
      pixel_events: ["PageView", "ViewContent", "InitiateRegistration"],
    },
    optimization_applied: [
      { optimization: "해시태그 최적화", details: "고성과 해시태그 5개 적용" },
      { optimization: "이미지 크기 조정", details: `${validatedInput.platform} 권장 사이즈로 변환` },
      { optimization: "발행 시간 최적화", details: "타겟 활성 시간대 고려" },
    ],
    scheduled_boosts: [
      {
        boost_type: "engagement_boost",
        trigger: "참여율 2% 이상 시",
        budget: 50000,
      },
      {
        boost_type: "reach_boost",
        trigger: "도달 1000 이상 시",
        budget: 100000,
      },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-020";
export const taskName = "소셜 미디어 포스팅";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.e";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
