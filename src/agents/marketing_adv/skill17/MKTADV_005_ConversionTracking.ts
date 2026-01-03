/**
 * MKTADV-005: 전환 추적
 * CMP-IS Reference: 17.2.b - Conversion tracking and funnel analysis
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Conversion Optimization Analyst for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  tracking_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  funnel_stages: z.array(z.string()).optional(),
  conversion_goals: z.array(z.object({
    goal_name: z.string(),
    target_value: z.number(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tracking_id: z.string(),
  event_id: z.string(),
  funnel_analysis: z.array(z.object({
    stage: z.string(),
    visitors: z.number(),
    conversion_rate: z.number(),
    drop_off_rate: z.number(),
    avg_time_in_stage: z.string(),
  })),
  conversion_summary: z.object({
    total_visitors: z.number(),
    total_conversions: z.number(),
    overall_conversion_rate: z.number(),
    cost_per_conversion: z.number(),
  }),
  micro_conversions: z.array(z.object({
    action: z.string(),
    count: z.number(),
    value: z.number(),
  })),
  bottlenecks: z.array(z.object({
    stage: z.string(),
    issue: z.string(),
    recommended_fix: z.string(),
  })),
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

  const stages = validatedInput.funnel_stages || [
    "Landing Page", "Event Details", "Registration Start", "Payment", "Confirmation"
  ];

  let visitors = 10000;
  const funnelAnalysis = stages.map((stage, idx) => {
    const dropOff = 0.15 + Math.random() * 0.15;
    const stageVisitors = idx === 0 ? visitors : Math.floor(visitors * (1 - dropOff));
    visitors = stageVisitors;
    return {
      stage,
      visitors: stageVisitors,
      conversion_rate: Math.round((1 - dropOff) * 100 * 10) / 10,
      drop_off_rate: Math.round(dropOff * 100 * 10) / 10,
      avg_time_in_stage: `${Math.floor(Math.random() * 120) + 30}s`,
    };
  });

  const totalVisitors = funnelAnalysis[0].visitors;
  const totalConversions = funnelAnalysis[funnelAnalysis.length - 1].visitors;

  return {
    tracking_id: generateUUID(),
    event_id: validatedInput.event_id,
    funnel_analysis: funnelAnalysis,
    conversion_summary: {
      total_visitors: totalVisitors,
      total_conversions: totalConversions,
      overall_conversion_rate: Math.round(totalConversions / totalVisitors * 100 * 10) / 10,
      cost_per_conversion: Math.round((Math.random() * 30 + 20) * 100) / 100,
    },
    micro_conversions: [
      { action: "Newsletter Signup", count: 1500, value: 5 },
      { action: "Session Bookmark", count: 800, value: 2 },
      { action: "Speaker Profile View", count: 2500, value: 1 },
      { action: "Share Event", count: 300, value: 10 },
    ],
    bottlenecks: [
      { stage: "Payment", issue: "높은 이탈률 (32%)", recommended_fix: "결제 단계 간소화 및 다양한 결제 옵션 추가" },
      { stage: "Registration Start", issue: "긴 폼 작성 시간", recommended_fix: "소셜 로그인 및 자동 완성 기능 도입" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-005",
  taskName: "전환 추적",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.2.b",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.2: ROI Measurement",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
