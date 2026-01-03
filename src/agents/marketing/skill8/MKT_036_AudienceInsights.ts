/**
 * MKT-036: 오디언스 인사이트
 * CMP-IS Reference: 8.4.c - Audience insights and behavioral analysis
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Audience Insights Agent.
CMP-IS Standard: 8.4.c - Analyzing audience behavior and generating actionable insights.`;

export const InputSchema = z.object({
  event_id: z.string(),
  audience_source: z.string().optional(),
  analysis_depth: z.enum(["basic", "detailed", "comprehensive"]).default("detailed"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  insights_id: z.string(),
  event_id: z.string(),
  audience_overview: z.object({
    total_audience: z.number(),
    new_visitors: z.number(),
    returning_visitors: z.number(),
    engaged_users: z.number(),
    converters: z.number(),
  }),
  demographic_profile: z.object({
    age_distribution: z.array(z.object({ age_group: z.string(), percentage: z.number() })),
    gender_split: z.object({ male: z.number(), female: z.number(), other: z.number() }),
    location_top: z.array(z.object({ location: z.string(), percentage: z.number() })),
    industry_top: z.array(z.object({ industry: z.string(), percentage: z.number() })),
  }),
  behavioral_insights: z.object({
    avg_session_duration: z.number(),
    pages_per_session: z.number(),
    bounce_rate: z.number(),
    peak_activity_times: z.array(z.string()),
    preferred_devices: z.array(z.object({ device: z.string(), percentage: z.number() })),
    content_preferences: z.array(z.object({ content_type: z.string(), engagement_rate: z.number() })),
  }),
  conversion_patterns: z.object({
    avg_touchpoints: z.number(),
    avg_days_to_convert: z.number(),
    top_conversion_paths: z.array(z.object({ path: z.string(), percentage: z.number() })),
    drop_off_points: z.array(z.object({ stage: z.string(), drop_rate: z.number() })),
  }),
  segmentation_recommendations: z.array(z.object({ segment: z.string(), characteristics: z.array(z.string()), strategy: z.string() })),
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
    insights_id: generateUUID(),
    event_id: validatedInput.event_id,
    audience_overview: { total_audience: 50000, new_visitors: 35000, returning_visitors: 15000, engaged_users: 20000, converters: 1800 },
    demographic_profile: {
      age_distribution: [
        { age_group: "25-34", percentage: 35 },
        { age_group: "35-44", percentage: 30 },
        { age_group: "45-54", percentage: 20 },
        { age_group: "18-24", percentage: 10 },
        { age_group: "55+", percentage: 5 },
      ],
      gender_split: { male: 58, female: 40, other: 2 },
      location_top: [
        { location: "서울", percentage: 45 },
        { location: "경기", percentage: 20 },
        { location: "부산", percentage: 8 },
        { location: "대구", percentage: 5 },
        { location: "기타", percentage: 22 },
      ],
      industry_top: [
        { industry: "IT/테크", percentage: 35 },
        { industry: "금융", percentage: 15 },
        { industry: "제조", percentage: 12 },
        { industry: "컨설팅", percentage: 10 },
        { industry: "기타", percentage: 28 },
      ],
    },
    behavioral_insights: {
      avg_session_duration: 185,
      pages_per_session: 3.2,
      bounce_rate: 42,
      peak_activity_times: ["오전 10시", "오후 2시", "오후 8시"],
      preferred_devices: [
        { device: "모바일", percentage: 55 },
        { device: "데스크톱", percentage: 40 },
        { device: "태블릿", percentage: 5 },
      ],
      content_preferences: [
        { content_type: "연사 정보", engagement_rate: 8.5 },
        { content_type: "세션 상세", engagement_rate: 7.2 },
        { content_type: "네트워킹 안내", engagement_rate: 6.8 },
        { content_type: "가격/등록", engagement_rate: 5.5 },
      ],
    },
    conversion_patterns: {
      avg_touchpoints: 4.2,
      avg_days_to_convert: 8.5,
      top_conversion_paths: [
        { path: "광고 → 랜딩 → 이메일 → 등록", percentage: 25 },
        { path: "오가닉 검색 → 직접 방문 → 등록", percentage: 20 },
        { path: "소셜 → 리타겟팅 → 등록", percentage: 18 },
      ],
      drop_off_points: [
        { stage: "랜딩페이지", drop_rate: 55 },
        { stage: "등록 시작", drop_rate: 35 },
        { stage: "결제 단계", drop_rate: 25 },
      ],
    },
    segmentation_recommendations: [
      { segment: "고관여 잠재고객", characteristics: ["3회+ 방문", "5분+ 체류", "콘텐츠 다운로드"], strategy: "개인화 이메일 + 1:1 영업" },
      { segment: "가격 민감층", characteristics: ["가격 페이지 다회 방문", "얼리버드 관심"], strategy: "할인/혜택 강조 리타겟팅" },
      { segment: "정보 탐색자", characteristics: ["연사/세션 상세 조회", "비교 행동"], strategy: "상세 콘텐츠 제공" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-036";
export const taskName = "오디언스 인사이트";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.4.c";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.4: Reporting & Analysis";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
