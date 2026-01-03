/**
 * MKT-035: 캠페인 분석
 * CMP-IS Reference: 8.4.b - Campaign performance analysis
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Campaign Analysis Agent.
CMP-IS Standard: 8.4.b - Analyzing campaign performance and deriving insights.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string(),
  campaign_name: z.string(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  campaign_id: z.string(),
  campaign_overview: z.object({
    name: z.string(),
    objective: z.string(),
    duration: z.string(),
    total_budget: z.number(),
    spend: z.number(),
    status: z.string(),
  }),
  performance_metrics: z.object({
    impressions: z.number(),
    reach: z.number(),
    clicks: z.number(),
    ctr: z.number(),
    conversions: z.number(),
    conversion_rate: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    revenue: z.number(),
    roas: z.number(),
  }),
  audience_insights: z.object({
    top_demographics: z.array(z.object({ segment: z.string(), conversions: z.number(), rate: z.number() })),
    top_geos: z.array(z.object({ location: z.string(), conversions: z.number() })),
    device_breakdown: z.array(z.object({ device: z.string(), percentage: z.number(), conversion_rate: z.number() })),
  }),
  creative_performance: z.array(z.object({
    creative_name: z.string(),
    impressions: z.number(),
    ctr: z.number(),
    conversions: z.number(),
    cpa: z.number(),
    status: z.string(),
  })),
  key_learnings: z.array(z.object({ learning: z.string(), evidence: z.string(), application: z.string() })),
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
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaign_id: validatedInput.campaign_id,
    campaign_overview: {
      name: validatedInput.campaign_name,
      objective: "이벤트 등록 증대",
      duration: "4주",
      total_budget: 20000000,
      spend: 18500000,
      status: "completed",
    },
    performance_metrics: {
      impressions: 1500000,
      reach: 600000,
      clicks: 45000,
      ctr: 3.0,
      conversions: 900,
      conversion_rate: 2.0,
      cpc: 411,
      cpa: 20556,
      revenue: 45000000,
      roas: 2.4,
    },
    audience_insights: {
      top_demographics: [
        { segment: "35-44세 남성", conversions: 280, rate: 3.2 },
        { segment: "25-34세 여성", conversions: 220, rate: 2.8 },
        { segment: "45-54세 남성", conversions: 180, rate: 2.5 },
      ],
      top_geos: [
        { location: "서울", conversions: 450 },
        { location: "경기", conversions: 200 },
        { location: "부산", conversions: 100 },
      ],
      device_breakdown: [
        { device: "모바일", percentage: 65, conversion_rate: 1.8 },
        { device: "데스크톱", percentage: 30, conversion_rate: 2.8 },
        { device: "태블릿", percentage: 5, conversion_rate: 2.2 },
      ],
    },
    creative_performance: [
      { creative_name: "연사 하이라이트 A", impressions: 400000, ctr: 3.8, conversions: 320, cpa: 15000, status: "top_performer" },
      { creative_name: "얼리버드 혜택 B", impressions: 350000, ctr: 3.2, conversions: 250, cpa: 18000, status: "good" },
      { creative_name: "네트워킹 강조 C", impressions: 300000, ctr: 2.5, conversions: 180, cpa: 22000, status: "average" },
      { creative_name: "일반 소개 D", impressions: 250000, ctr: 1.8, conversions: 100, cpa: 35000, status: "underperforming" },
    ],
    key_learnings: [
      { learning: "연사 중심 크리에이티브 최고 성과", evidence: "CPA 27% 낮음", application: "연사 콘텐츠 비중 확대" },
      { learning: "데스크톱 전환율 56% 높음", evidence: "2.8% vs 1.8%", application: "데스크톱 타겟 강화" },
      { learning: "35-44세 세그먼트 최적", evidence: "전환율 3.2%", application: "타겟팅 집중" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-035";
export const taskName = "캠페인 분석";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.4.b";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.4: Reporting & Analysis";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
