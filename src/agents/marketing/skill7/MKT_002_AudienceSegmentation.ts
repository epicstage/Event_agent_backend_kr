/**
 * MKT-002: 청중 세분화
 * CMP-IS Reference: 7.1.b - Defining and segmenting target audiences
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Audience Segmentation Agent for event marketing.
CMP-IS Standard: 7.1.b - Defining and segmenting target audiences for effective marketing.
You create detailed audience profiles and segmentation strategies.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_type: z.string(),
  industry: z.string(),
  existing_data: z.object({
    past_attendees: z.number().optional(),
    email_subscribers: z.number().optional(),
    social_followers: z.number().optional(),
  }).optional(),
  segmentation_criteria: z.array(z.enum([
    "demographic", "firmographic", "behavioral", "psychographic", "geographic"
  ])).default(["demographic", "behavioral"]),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  segmentation_id: z.string(),
  event_id: z.string(),
  segments: z.array(z.object({
    segment_id: z.string(),
    segment_name: z.string(),
    segment_type: z.string(),
    description: z.string(),
    estimated_size: z.number(),
    priority: z.enum(["primary", "secondary", "tertiary"]),
    characteristics: z.record(z.string()),
    pain_points: z.array(z.string()),
    motivations: z.array(z.string()),
    preferred_channels: z.array(z.string()),
    conversion_potential: z.enum(["high", "medium", "low"]),
    messaging_angle: z.string(),
  })),
  total_addressable_market: z.number(),
  targeting_strategy: z.object({
    approach: z.string(),
    primary_focus: z.string(),
    secondary_focus: z.string(),
    exclusions: z.array(z.string()),
  }),
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

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const segments: Output["segments"] = [
    {
      segment_id: generateUUID(),
      segment_name: "의사결정권자",
      segment_type: "firmographic",
      description: "C-level 및 임원급 의사결정권자",
      estimated_size: 5000,
      priority: "primary",
      characteristics: {
        job_level: "C-level, VP, Director",
        company_size: "직원 100명 이상",
        budget_authority: "있음",
      },
      pain_points: ["시간 부족", "ROI 입증 필요", "정보 과부하"],
      motivations: ["전략적 인사이트", "네트워킹", "트렌드 파악"],
      preferred_channels: ["이메일", "LinkedIn", "업계 매체"],
      conversion_potential: "high",
      messaging_angle: "전략적 가치와 ROI 중심",
    },
    {
      segment_id: generateUUID(),
      segment_name: "실무 전문가",
      segment_type: "behavioral",
      description: "실무를 담당하는 중간관리자 및 전문가",
      estimated_size: 15000,
      priority: "primary",
      characteristics: {
        job_level: "Manager, Senior",
        experience: "5년 이상",
        learning_motivation: "높음",
      },
      pain_points: ["스킬 업그레이드 필요", "실무 적용 방법", "동료 벤치마킹"],
      motivations: ["실무 노하우", "자격증/인증", "커리어 발전"],
      preferred_channels: ["소셜미디어", "이메일", "커뮤니티"],
      conversion_potential: "high",
      messaging_angle: "실무 적용 가능한 인사이트와 스킬",
    },
    {
      segment_id: generateUUID(),
      segment_name: "신규 진입자",
      segment_type: "demographic",
      description: "업계 신규 진입자 및 주니어",
      estimated_size: 20000,
      priority: "secondary",
      characteristics: {
        job_level: "Entry, Junior",
        experience: "3년 미만",
        price_sensitivity: "높음",
      },
      pain_points: ["지식 부족", "네트워크 부재", "커리어 방향"],
      motivations: ["학습", "멘토링", "취업/이직"],
      preferred_channels: ["인스타그램", "유튜브", "커뮤니티"],
      conversion_potential: "medium",
      messaging_angle: "학습 기회와 네트워킹 강조",
    },
    {
      segment_id: generateUUID(),
      segment_name: "솔루션 제공자",
      segment_type: "firmographic",
      description: "벤더, 파트너사, 솔루션 제공 기업",
      estimated_size: 3000,
      priority: "tertiary",
      characteristics: {
        company_type: "B2B 솔루션 기업",
        interest: "리드 제너레이션",
        budget: "마케팅 예산 보유",
      },
      pain_points: ["리드 품질", "브랜드 인지도", "경쟁 차별화"],
      motivations: ["리드 확보", "브랜딩", "파트너십"],
      preferred_channels: ["영업 접촉", "이메일", "LinkedIn"],
      conversion_potential: "medium",
      messaging_angle: "스폰서십/전시 기회와 ROI",
    },
  ];

  const totalAddressableMarket = segments.reduce((sum, s) => sum + s.estimated_size, 0);

  return {
    segmentation_id: generateUUID(),
    event_id: validatedInput.event_id,
    segments,
    total_addressable_market: totalAddressableMarket,
    targeting_strategy: {
      approach: "다층적 세그먼트 타겟팅",
      primary_focus: "의사결정권자 및 실무 전문가",
      secondary_focus: "신규 진입자 (할인 티켓)",
      exclusions: ["학생 (별도 프로그램)", "경쟁사 직원"],
    },
    recommendations: [
      "세그먼트별 맞춤 랜딩 페이지 구축",
      "의사결정권자 대상 VIP 프로그램 운영",
      "실무자 대상 워크샵 강조",
      "조기등록 할인으로 가격 민감 세그먼트 공략",
      "LinkedIn 광고로 firmographic 타겟팅",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-002";
export const taskName = "청중 세분화";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.1.b";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.1: Market Research";

export default {
  taskId,
  taskName,
  taskType,
  cmpReference,
  skill,
  subSkill,
  AGENT_PERSONA,
  InputSchema,
  OutputSchema,
  execute,
};
