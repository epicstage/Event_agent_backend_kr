/**
 * PRO-005: 지속가능성 기준 관리
 * CMP-IS Reference: 19.5.a - Sustainability standards management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Sustainability Standards Manager for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  sustainability_goals: z.array(z.string()).optional(),
  assessment_areas: z.array(z.enum(["energy", "waste", "water", "transport", "procurement", "social"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string(),
  event_id: z.string(),
  sustainability_score: z.object({
    overall: z.number(),
    vs_industry_avg: z.number(),
    vs_previous_event: z.number(),
    certification_eligible: z.boolean(),
  }),
  impact_metrics: z.array(z.object({
    category: z.string(),
    metric_name: z.string(),
    value: z.number(),
    unit: z.string(),
    target: z.number(),
    achievement_rate: z.number(),
    trend: z.enum(["improving", "stable", "declining"]),
  })),
  initiatives: z.array(z.object({
    initiative_name: z.string(),
    category: z.string(),
    impact_level: z.enum(["high", "medium", "low"]),
    cost_savings: z.number(),
    implementation_status: z.enum(["completed", "in_progress", "planned"]),
  })),
  carbon_footprint: z.object({
    total_emissions_kg: z.number(),
    per_attendee_kg: z.number(),
    breakdown: z.array(z.object({
      source: z.string(),
      emissions_kg: z.number(),
      percentage: z.number(),
    })),
    offset_strategy: z.string(),
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

  return {
    assessment_id: generateUUID(),
    event_id: validatedInput.event_id,
    sustainability_score: {
      overall: 78,
      vs_industry_avg: 12,
      vs_previous_event: 8,
      certification_eligible: true,
    },
    impact_metrics: [
      { category: "에너지", metric_name: "재생에너지 사용률", value: 65, unit: "%", target: 80, achievement_rate: 81, trend: "improving" },
      { category: "폐기물", metric_name: "재활용률", value: 72, unit: "%", target: 80, achievement_rate: 90, trend: "improving" },
      { category: "폐기물", metric_name: "음식물 쓰레기 감소", value: 35, unit: "%", target: 40, achievement_rate: 87, trend: "stable" },
      { category: "교통", metric_name: "대중교통 이용 참가자", value: 45, unit: "%", target: 50, achievement_rate: 90, trend: "improving" },
      { category: "조달", metric_name: "지속가능 벤더 비율", value: 68, unit: "%", target: 75, achievement_rate: 90, trend: "improving" },
    ],
    initiatives: [
      { initiative_name: "디지털 명찰 도입", category: "폐기물", impact_level: "high", cost_savings: 5000000, implementation_status: "completed" },
      { initiative_name: "친환경 케이터링", category: "조달", impact_level: "medium", cost_savings: 2000000, implementation_status: "completed" },
      { initiative_name: "탄소 상쇄 프로그램", category: "탄소", impact_level: "high", cost_savings: 0, implementation_status: "in_progress" },
      { initiative_name: "현지 셔틀버스 운영", category: "교통", impact_level: "medium", cost_savings: 1500000, implementation_status: "planned" },
    ],
    carbon_footprint: {
      total_emissions_kg: 125000,
      per_attendee_kg: 25,
      breakdown: [
        { source: "항공 이동", emissions_kg: 75000, percentage: 60 },
        { source: "에너지 사용", emissions_kg: 25000, percentage: 20 },
        { source: "F&B", emissions_kg: 12500, percentage: 10 },
        { source: "폐기물", emissions_kg: 7500, percentage: 6 },
        { source: "기타", emissions_kg: 5000, percentage: 4 },
      ],
      offset_strategy: "국내 산림 조성 프로젝트를 통한 100% 탄소 상쇄 계획",
    },
    recommendations: [
      "가상 참여 옵션 확대로 항공 이동 감소",
      "현지 식재료 비율 90%로 상향",
      "태양광 발전 베뉴 우선 선정",
      "참가자 탄소 발자국 계산기 제공",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-005",
  taskName: "지속가능성 기준 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.5.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.5: Sustainability",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
