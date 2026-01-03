/**
 * MKT-018: 미디어 바잉
 * CMP-IS Reference: 8.1.c - Media buying and placement execution
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Media Buying Agent.
CMP-IS Standard: 8.1.c - Executing media buying with optimized placement and bidding strategies.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string(),
  total_budget: z.number(),
  currency: z.string().default("KRW"),
  platforms: z.array(z.string()),
  campaign_objective: z.string(),
  start_date: z.string(),
  end_date: z.string(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  media_buy_id: z.string(),
  event_id: z.string(),
  campaign_id: z.string(),
  platform_allocations: z.array(z.object({
    platform: z.string(),
    budget: z.number(),
    objective: z.string(),
    bidding_strategy: z.string(),
    target_cpm: z.number(),
    target_cpc: z.number(),
    daily_budget: z.number(),
    placements: z.array(z.string()),
  })),
  targeting_setup: z.object({
    demographics: z.object({
      age_range: z.string(),
      gender: z.string(),
      locations: z.array(z.string()),
    }),
    interests: z.array(z.string()),
    behaviors: z.array(z.string()),
    custom_audiences: z.array(z.string()),
    lookalike_audiences: z.array(z.string()),
  }),
  schedule: z.object({
    flight_dates: z.string(),
    dayparting: z.array(z.object({
      day: z.string(),
      hours: z.string(),
    })),
  }),
  tracking_setup: z.array(z.object({
    tracking_type: z.string(),
    status: z.string(),
    details: z.string(),
  })),
  projected_performance: z.object({
    impressions: z.number(),
    reach: z.number(),
    clicks: z.number(),
    conversions: z.number(),
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
  const { total_budget, platforms, start_date, end_date } = validatedInput;

  const days = Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24));
  const budgetPerPlatform = total_budget / platforms.length;

  const platformConfigs: Record<string, {objective: string, bidding: string, cpm: number, cpc: number, placements: string[]}> = {
    "Google": { objective: "Conversions", bidding: "Target CPA", cpm: 3000, cpc: 500, placements: ["Search", "Display Network", "YouTube"] },
    "Meta": { objective: "Conversions", bidding: "Lowest Cost", cpm: 2500, cpc: 400, placements: ["Facebook Feed", "Instagram Feed", "Stories", "Reels"] },
    "LinkedIn": { objective: "Lead Generation", bidding: "Maximum Delivery", cpm: 8000, cpc: 2000, placements: ["Feed", "Inbox", "Audience Network"] },
    "Naver": { objective: "Traffic", bidding: "CPC", cpm: 2000, cpc: 300, placements: ["Search", "Display", "Band"] },
  };

  const platformAllocations = platforms.map(platform => {
    const config = platformConfigs[platform] || platformConfigs["Meta"];
    return {
      platform,
      budget: budgetPerPlatform,
      objective: config.objective,
      bidding_strategy: config.bidding,
      target_cpm: config.cpm,
      target_cpc: config.cpc,
      daily_budget: Math.round(budgetPerPlatform / days),
      placements: config.placements,
    };
  });

  const totalImpressions = platforms.reduce((sum, p) => {
    const cpm = platformConfigs[p]?.cpm || 3000;
    return sum + (budgetPerPlatform / cpm) * 1000;
  }, 0);

  return {
    media_buy_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaign_id: validatedInput.campaign_id,
    platform_allocations: platformAllocations,
    targeting_setup: {
      demographics: {
        age_range: "25-54",
        gender: "All",
        locations: ["서울", "경기", "부산", "대구", "인천"],
      },
      interests: ["비즈니스", "테크놀로지", "네트워킹", "전문 개발"],
      behaviors: ["이벤트 참석 이력", "온라인 구매", "비즈니스 관심"],
      custom_audiences: ["웹사이트 방문자", "이메일 구독자", "과거 참석자"],
      lookalike_audiences: ["과거 참석자 유사", "전환자 유사 1%"],
    },
    schedule: {
      flight_dates: `${start_date} ~ ${end_date}`,
      dayparting: [
        { day: "월-금", hours: "09:00-22:00" },
        { day: "토", hours: "10:00-20:00" },
        { day: "일", hours: "12:00-18:00" },
      ],
    },
    tracking_setup: [
      { tracking_type: "Facebook Pixel", status: "active", details: "이벤트: PageView, Registration, Purchase" },
      { tracking_type: "Google Tag Manager", status: "active", details: "GA4 + Google Ads 연동" },
      { tracking_type: "LinkedIn Insight Tag", status: "active", details: "전환 추적 활성화" },
      { tracking_type: "UTM Parameters", status: "active", details: "캠페인별 UTM 설정 완료" },
    ],
    projected_performance: {
      impressions: Math.round(totalImpressions),
      reach: Math.round(totalImpressions * 0.6),
      clicks: Math.round(totalImpressions * 0.02),
      conversions: Math.round(totalImpressions * 0.0006),
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-018";
export const taskName = "미디어 바잉";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.c";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
