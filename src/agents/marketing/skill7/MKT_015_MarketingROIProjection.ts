/**
 * MKT-015: 마케팅 ROI 예측
 * CMP-IS Reference: 7.2.l - Marketing ROI projection and performance forecasting
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing ROI Projection Agent.
CMP-IS Standard: 7.2.l - Projecting marketing ROI and forecasting campaign performance.`;

export const InputSchema = z.object({
  event_id: z.string(),
  marketing_budget: z.number(),
  currency: z.string().default("KRW"),
  ticket_price_average: z.number(),
  target_attendees: z.number(),
  channel_allocations: z.array(z.object({
    channel: z.string(),
    budget: z.number(),
  })).optional(),
  historical_conversion_rate: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  roi_projection_id: z.string(),
  event_id: z.string(),
  summary: z.object({
    total_marketing_spend: z.number(),
    projected_revenue: z.number(),
    projected_roi: z.number(),
    break_even_registrations: z.number(),
    confidence_level: z.string(),
  }),
  channel_projections: z.array(z.object({
    channel: z.string(),
    budget: z.number(),
    projected_reach: z.number(),
    projected_clicks: z.number(),
    projected_conversions: z.number(),
    cpa: z.number(),
    projected_revenue: z.number(),
    channel_roi: z.number(),
  })),
  funnel_projections: z.object({
    impressions: z.number(),
    reach: z.number(),
    clicks: z.number(),
    landing_page_visitors: z.number(),
    registration_starts: z.number(),
    completed_registrations: z.number(),
    paid_attendees: z.number(),
  }),
  conversion_rates: z.object({
    impression_to_click: z.number(),
    click_to_visit: z.number(),
    visit_to_registration_start: z.number(),
    registration_start_to_complete: z.number(),
    registration_to_attendance: z.number(),
  }),
  scenarios: z.array(z.object({
    scenario: z.string(),
    assumptions: z.array(z.string()),
    projected_registrations: z.number(),
    projected_revenue: z.number(),
    projected_roi: z.number(),
  })),
  optimization_recommendations: z.array(z.object({
    recommendation: z.string(),
    potential_impact: z.string(),
    implementation_effort: z.string(),
  })),
  risk_factors: z.array(z.object({
    risk: z.string(),
    likelihood: z.string(),
    impact: z.string(),
    mitigation: z.string(),
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
  const { marketing_budget, ticket_price_average, target_attendees } = validatedInput;

  // Channel allocation defaults
  const defaultChannels = [
    { channel: "검색 광고 (Google/Naver)", budget: marketing_budget * 0.25 },
    { channel: "소셜 미디어 (Meta)", budget: marketing_budget * 0.20 },
    { channel: "LinkedIn", budget: marketing_budget * 0.15 },
    { channel: "이메일 마케팅", budget: marketing_budget * 0.10 },
    { channel: "콘텐츠 마케팅", budget: marketing_budget * 0.10 },
    { channel: "PR/미디어", budget: marketing_budget * 0.10 },
    { channel: "파트너/제휴", budget: marketing_budget * 0.05 },
    { channel: "기타", budget: marketing_budget * 0.05 },
  ];

  const channels = validatedInput.channel_allocations || defaultChannels;

  // Calculate channel projections
  const channelProjections = channels.map(ch => {
    let cpm = 3000, ctr = 0.02, convRate = 0.03;

    if (ch.channel.includes("검색")) { cpm = 5000; ctr = 0.035; convRate = 0.05; }
    else if (ch.channel.includes("LinkedIn")) { cpm = 8000; ctr = 0.015; convRate = 0.04; }
    else if (ch.channel.includes("이메일")) { cpm = 500; ctr = 0.05; convRate = 0.08; }
    else if (ch.channel.includes("콘텐츠")) { cpm = 2000; ctr = 0.025; convRate = 0.04; }

    const impressions = (ch.budget / cpm) * 1000;
    const clicks = impressions * ctr;
    const conversions = Math.round(clicks * convRate);
    const revenue = conversions * ticket_price_average;
    const roi = ((revenue - ch.budget) / ch.budget) * 100;

    return {
      channel: ch.channel,
      budget: ch.budget,
      projected_reach: Math.round(impressions * 0.6),
      projected_clicks: Math.round(clicks),
      projected_conversions: conversions,
      cpa: conversions > 0 ? Math.round(ch.budget / conversions) : 0,
      projected_revenue: revenue,
      channel_roi: Math.round(roi),
    };
  });

  const totalConversions = channelProjections.reduce((sum, ch) => sum + ch.projected_conversions, 0);
  const totalRevenue = totalConversions * ticket_price_average;
  const totalROI = ((totalRevenue - marketing_budget) / marketing_budget) * 100;
  const breakEven = Math.ceil(marketing_budget / ticket_price_average);

  return {
    roi_projection_id: generateUUID(),
    event_id: validatedInput.event_id,
    summary: {
      total_marketing_spend: marketing_budget,
      projected_revenue: totalRevenue,
      projected_roi: Math.round(totalROI),
      break_even_registrations: breakEven,
      confidence_level: "Medium (기본 산업 벤치마크 기반)",
    },
    channel_projections: channelProjections,
    funnel_projections: {
      impressions: Math.round(marketing_budget / 3 * 1000),
      reach: Math.round(marketing_budget / 5 * 1000),
      clicks: Math.round(marketing_budget / 100),
      landing_page_visitors: Math.round(marketing_budget / 120),
      registration_starts: Math.round(marketing_budget / 400),
      completed_registrations: totalConversions,
      paid_attendees: Math.round(totalConversions * 0.85),
    },
    conversion_rates: {
      impression_to_click: 2.5,
      click_to_visit: 85.0,
      visit_to_registration_start: 25.0,
      registration_start_to_complete: 60.0,
      registration_to_attendance: 85.0,
    },
    scenarios: [
      {
        scenario: "보수적 (Conservative)",
        assumptions: ["전환율 -20%", "CPA +30%", "외부 환경 악화"],
        projected_registrations: Math.round(totalConversions * 0.7),
        projected_revenue: Math.round(totalRevenue * 0.7),
        projected_roi: Math.round(((totalRevenue * 0.7 - marketing_budget) / marketing_budget) * 100),
      },
      {
        scenario: "기본 (Base)",
        assumptions: ["산업 평균 전환율", "계획된 예산 집행"],
        projected_registrations: totalConversions,
        projected_revenue: totalRevenue,
        projected_roi: Math.round(totalROI),
      },
      {
        scenario: "낙관적 (Optimistic)",
        assumptions: ["전환율 +30%", "바이럴 효과", "강력한 콘텐츠 성과"],
        projected_registrations: Math.round(totalConversions * 1.4),
        projected_revenue: Math.round(totalRevenue * 1.4),
        projected_roi: Math.round(((totalRevenue * 1.4 - marketing_budget) / marketing_budget) * 100),
      },
    ],
    optimization_recommendations: [
      {
        recommendation: "A/B 테스트 강화",
        potential_impact: "전환율 15-25% 향상",
        implementation_effort: "Low",
      },
      {
        recommendation: "리타겟팅 예산 확대",
        potential_impact: "CPA 20-30% 감소",
        implementation_effort: "Low",
      },
      {
        recommendation: "고성과 채널 예산 재배분",
        potential_impact: "ROI 20% 향상",
        implementation_effort: "Medium",
      },
      {
        recommendation: "랜딩페이지 최적화",
        potential_impact: "등록 완료율 25% 향상",
        implementation_effort: "Medium",
      },
      {
        recommendation: "얼리버드 할인 전략",
        potential_impact: "초기 등록 50% 증가",
        implementation_effort: "Low",
      },
    ],
    risk_factors: [
      {
        risk: "시장 경쟁 심화",
        likelihood: "Medium",
        impact: "High",
        mitigation: "차별화된 가치 제안 강화",
      },
      {
        risk: "광고 비용 상승",
        likelihood: "High",
        impact: "Medium",
        mitigation: "오가닉 채널 비중 확대",
      },
      {
        risk: "타겟 피로도",
        likelihood: "Medium",
        impact: "Medium",
        mitigation: "콘텐츠 다양화 및 리프레시",
      },
      {
        risk: "경기 침체",
        likelihood: "Low",
        impact: "High",
        mitigation: "가격 탄력성 있는 티어 구성",
      },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-015";
export const taskName = "마케팅 ROI 예측";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.l";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
