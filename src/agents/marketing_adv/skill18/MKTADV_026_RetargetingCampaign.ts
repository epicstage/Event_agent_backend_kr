/**
 * MKTADV-026: 리타겟팅 캠페인
 * CMP-IS Reference: 18.5.a - Retargeting campaign management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Retargeting Campaign Specialist for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  retargeting_type: z.enum(["website_visitors", "cart_abandoners", "email_non_openers", "past_attendees", "lookalike"]).optional(),
  platforms: z.array(z.enum(["google", "facebook", "linkedin", "twitter", "programmatic"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  campaign_id: z.string(),
  event_id: z.string(),
  audience_config: z.object({
    primary_audience: z.string(),
    audience_size: z.number(),
    match_rate: z.number(),
    segments: z.array(z.object({
      segment_name: z.string(),
      size: z.number(),
      intent_score: z.number(),
      days_since_activity: z.number(),
    })),
  }),
  campaign_setup: z.array(z.object({
    platform: z.string(),
    campaign_type: z.string(),
    budget_daily: z.number(),
    bid_strategy: z.string(),
    ad_formats: z.array(z.string()),
    targeting_layers: z.array(z.string()),
  })),
  creative_recommendations: z.array(z.object({
    audience_segment: z.string(),
    message_theme: z.string(),
    cta: z.string(),
    urgency_level: z.enum(["high", "medium", "low"]),
    expected_ctr: z.number(),
  })),
  frequency_caps: z.object({
    daily_impressions: z.number(),
    weekly_impressions: z.number(),
    burn_pixel_days: z.number(),
  }),
  performance_forecast: z.object({
    estimated_reach: z.number(),
    estimated_conversions: z.number(),
    estimated_cpa: z.number(),
    estimated_roas: z.number(),
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

  const platforms = validatedInput.platforms || ["google", "facebook", "linkedin"];

  return {
    campaign_id: generateUUID(),
    event_id: validatedInput.event_id,
    audience_config: {
      primary_audience: validatedInput.retargeting_type || "website_visitors",
      audience_size: 15000,
      match_rate: 72,
      segments: [
        { segment_name: "프로그램 페이지 방문자", size: 8500, intent_score: 75, days_since_activity: 7 },
        { segment_name: "등록 시작 후 이탈", size: 2200, intent_score: 90, days_since_activity: 3 },
        { segment_name: "가격 페이지 방문자", size: 3100, intent_score: 85, days_since_activity: 5 },
        { segment_name: "콘텐츠 다운로더", size: 1200, intent_score: 70, days_since_activity: 14 },
      ],
    },
    campaign_setup: platforms.map(platform => ({
      platform,
      campaign_type: "remarketing",
      budget_daily: platform === "linkedin" ? 150 : 100,
      bid_strategy: "target_cpa",
      ad_formats: platform === "facebook" ? ["carousel", "video", "single_image"] :
                  platform === "linkedin" ? ["sponsored_content", "message_ad"] :
                  ["responsive_display", "video"],
      targeting_layers: ["custom_audience", "interest_layering", "demographic_filter"],
    })),
    creative_recommendations: [
      { audience_segment: "등록 이탈자", message_theme: "마감 임박 + 혜택 강조", cta: "지금 등록하기", urgency_level: "high", expected_ctr: 2.8 },
      { audience_segment: "가격 탐색자", message_theme: "가치 제안 + ROI", cta: "투자 가치 확인", urgency_level: "medium", expected_ctr: 2.2 },
      { audience_segment: "콘텐츠 관심자", message_theme: "연사/세션 하이라이트", cta: "프로그램 보기", urgency_level: "low", expected_ctr: 1.8 },
      { audience_segment: "과거 참가자", message_theme: "로열티 + 신규 콘텐츠", cta: "재등록 혜택", urgency_level: "medium", expected_ctr: 3.2 },
    ],
    frequency_caps: {
      daily_impressions: 3,
      weekly_impressions: 12,
      burn_pixel_days: 30,
    },
    performance_forecast: {
      estimated_reach: 12000,
      estimated_conversions: 180,
      estimated_cpa: 42,
      estimated_roas: 4.5,
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-026",
  taskName: "리타겟팅 캠페인",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.5.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.5: Retargeting",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
