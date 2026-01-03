/**
 * PRO-009: 내부 고발자 보호
 * CMP-IS Reference: 19.9.a - Whistleblower protection program
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Whistleblower Protection Program Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  report_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }).optional(),
  program_review: z.boolean().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  program_id: z.string(),
  event_id: z.string(),
  program_status: z.object({
    is_active: z.boolean(),
    channels_available: z.number(),
    awareness_rate: z.number(),
    trust_score: z.number(),
  }),
  reporting_channels: z.array(z.object({
    channel_name: z.string(),
    channel_type: z.enum(["hotline", "email", "web_portal", "in_person", "external"]),
    is_anonymous: z.boolean(),
    availability: z.string(),
    response_time_hours: z.number(),
  })),
  report_statistics: z.object({
    total_reports: z.number(),
    substantiated: z.number(),
    unsubstantiated: z.number(),
    under_investigation: z.number(),
    avg_resolution_days: z.number(),
  }),
  report_categories: z.array(z.object({
    category: z.string(),
    count: z.number(),
    percentage: z.number(),
    trend: z.enum(["increasing", "stable", "decreasing"]),
  })),
  protection_measures: z.array(z.object({
    measure: z.string(),
    implementation_status: z.enum(["fully_implemented", "partial", "planned"]),
    effectiveness_rating: z.number(),
  })),
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

  return {
    program_id: generateUUID(),
    event_id: validatedInput.event_id,
    program_status: {
      is_active: true,
      channels_available: 4,
      awareness_rate: 78,
      trust_score: 72,
    },
    reporting_channels: [
      { channel_name: "익명 핫라인", channel_type: "hotline", is_anonymous: true, availability: "24/7", response_time_hours: 24 },
      { channel_name: "윤리 이메일", channel_type: "email", is_anonymous: false, availability: "업무시간", response_time_hours: 48 },
      { channel_name: "온라인 신고 포털", channel_type: "web_portal", is_anonymous: true, availability: "24/7", response_time_hours: 24 },
      { channel_name: "외부 법률 사무소", channel_type: "external", is_anonymous: true, availability: "업무시간", response_time_hours: 72 },
    ],
    report_statistics: {
      total_reports: 12,
      substantiated: 5,
      unsubstantiated: 4,
      under_investigation: 3,
      avg_resolution_days: 21,
    },
    report_categories: [
      { category: "이해충돌", count: 4, percentage: 33.3, trend: "stable" },
      { category: "정책 위반", count: 3, percentage: 25.0, trend: "decreasing" },
      { category: "괴롭힘/차별", count: 2, percentage: 16.7, trend: "stable" },
      { category: "재정 부정", count: 2, percentage: 16.7, trend: "stable" },
      { category: "안전 문제", count: 1, percentage: 8.3, trend: "decreasing" },
    ],
    protection_measures: [
      { measure: "신원 기밀 보장", implementation_status: "fully_implemented", effectiveness_rating: 90 },
      { measure: "보복 금지 정책", implementation_status: "fully_implemented", effectiveness_rating: 85 },
      { measure: "익명 신고 시스템", implementation_status: "fully_implemented", effectiveness_rating: 88 },
      { measure: "독립적 조사 프로세스", implementation_status: "partial", effectiveness_rating: 75 },
      { measure: "법적 보호 안내", implementation_status: "fully_implemented", effectiveness_rating: 80 },
    ],
    recommendations: [
      "정기 프로그램 인식 캠페인 실시 (현재 78% → 목표 90%)",
      "외부 독립 조사관 확대 활용",
      "신고자 후속 지원 프로그램 강화",
      "전 직원 대상 프로그램 재교육 실시",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-009",
  taskName: "내부 고발자 보호",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.9.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.9: Whistleblower Protection",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
