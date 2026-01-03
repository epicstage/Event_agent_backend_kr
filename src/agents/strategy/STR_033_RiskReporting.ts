/**
 * STR-033: 리스크 보고
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Reporting)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Reporting Agent for event planning.

Your expertise includes:
- Risk report generation for various audiences
- Risk visualization and communication
- Trend analysis and reporting
- Executive risk summaries

CMP-IS Standard: Domain A - Strategic Planning (Risk Reporting)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  report_type: z.enum(["executive", "operational", "detailed", "trend"]),
  target_audience: z.string(),
  risk_data: z.object({
    total_risks: z.number(),
    by_status: z.object({
      critical: z.number(),
      high: z.number(),
      medium: z.number(),
      low: z.number(),
    }),
    by_category: z.array(z.object({
      category: z.string(),
      count: z.number(),
    })),
    recent_changes: z.array(z.object({
      risk_id: z.string(),
      change: z.string(),
      date: z.string(),
    })).optional(),
  }),
  reporting_period: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  report_header: z.object({
    title: z.string(),
    type: z.string(),
    audience: z.string(),
    period: z.string(),
    generated_at: z.string(),
  }),
  executive_summary: z.object({
    risk_posture: z.enum(["strong", "adequate", "needs_attention", "critical"]),
    key_message: z.string(),
    top_concerns: z.array(z.string()),
    positive_developments: z.array(z.string()),
    action_required: z.array(z.string()),
  }),
  risk_overview: z.object({
    total_risks: z.number(),
    status_breakdown: z.array(z.object({
      status: z.string(),
      count: z.number(),
      percentage: z.number(),
      visual: z.string(),
    })),
    category_breakdown: z.array(z.object({
      category: z.string(),
      count: z.number(),
      trend: z.enum(["up", "down", "stable"]),
    })),
    comparison_to_previous: z.object({
      change: z.number(),
      direction: z.enum(["improved", "worsened", "unchanged"]),
      commentary: z.string(),
    }),
  }),
  detailed_sections: z.array(z.object({
    section_title: z.string(),
    content: z.array(z.object({
      item: z.string(),
      details: z.string(),
      status_indicator: z.string(),
    })),
  })),
  visualizations: z.array(z.object({
    chart_type: z.string(),
    title: z.string(),
    data_description: z.string(),
    purpose: z.string(),
  })),
  recommendations: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    recommendation: z.string(),
    rationale: z.string(),
    owner: z.string(),
  })),
  appendix: z.array(z.object({
    title: z.string(),
    content_summary: z.string(),
  })).optional(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-033",
  taskName: "Risk Reporting",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "이해관계자별 맞춤형 리스크 보고서를 생성합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { risk_data, report_type, target_audience, event_name, reporting_period } = validated;

  const totalByStatus = risk_data.by_status.critical + risk_data.by_status.high + risk_data.by_status.medium + risk_data.by_status.low;

  const riskPosture = risk_data.by_status.critical > 2 ? "critical" as const :
    risk_data.by_status.critical > 0 || risk_data.by_status.high > 5 ? "needs_attention" as const :
    risk_data.by_status.high > 2 ? "adequate" as const : "strong" as const;

  const statusBreakdown = [
    { status: "Critical", count: risk_data.by_status.critical, percentage: Math.round((risk_data.by_status.critical / totalByStatus) * 100), visual: "🔴" },
    { status: "High", count: risk_data.by_status.high, percentage: Math.round((risk_data.by_status.high / totalByStatus) * 100), visual: "🟠" },
    { status: "Medium", count: risk_data.by_status.medium, percentage: Math.round((risk_data.by_status.medium / totalByStatus) * 100), visual: "🟡" },
    { status: "Low", count: risk_data.by_status.low, percentage: Math.round((risk_data.by_status.low / totalByStatus) * 100), visual: "🟢" },
  ];

  const categoryBreakdown = risk_data.by_category.map(cat => ({
    category: cat.category,
    count: cat.count,
    trend: "stable" as const,
  }));

  const detailedSections = report_type === "executive" ? [
    {
      section_title: "핵심 리스크 요약",
      content: [
        { item: "Critical 리스크", details: `${risk_data.by_status.critical}건 - 즉각 대응 필요`, status_indicator: "🔴" },
        { item: "High 리스크", details: `${risk_data.by_status.high}건 - 면밀한 모니터링`, status_indicator: "🟠" },
      ],
    },
  ] : [
    {
      section_title: "카테고리별 상세",
      content: risk_data.by_category.map(cat => ({
        item: cat.category,
        details: `${cat.count}건의 리스크 식별`,
        status_indicator: cat.count > 5 ? "🟠" : "🟢",
      })),
    },
    {
      section_title: "최근 변경 사항",
      content: (risk_data.recent_changes || []).map(change => ({
        item: change.risk_id,
        details: `${change.change} (${change.date})`,
        status_indicator: "ℹ️",
      })),
    },
  ];

  return {
    report_id: generateUUID(),
    event_id: validated.event_id,
    report_header: {
      title: `${event_name} 리스크 ${report_type === "executive" ? "임원" : report_type === "operational" ? "운영" : "상세"} 보고서`,
      type: report_type,
      audience: target_audience,
      period: `${reporting_period.start} ~ ${reporting_period.end}`,
      generated_at: new Date().toISOString(),
    },
    executive_summary: {
      risk_posture: riskPosture,
      key_message: riskPosture === "strong" ? "리스크가 효과적으로 관리되고 있습니다." :
        riskPosture === "adequate" ? "대부분의 리스크가 관리되나 일부 주의가 필요합니다." :
        riskPosture === "needs_attention" ? "여러 고위험 리스크에 대한 집중 관리가 필요합니다." :
        "즉각적인 경영진 개입이 필요한 심각한 리스크가 있습니다.",
      top_concerns: [
        `Critical 리스크 ${risk_data.by_status.critical}건 존재`,
        "운영 리스크 카테고리 집중 모니터링 필요",
      ],
      positive_developments: [
        `Low 리스크 ${risk_data.by_status.low}건으로 양호`,
        "완화 조치 진행 중",
      ],
      action_required: risk_data.by_status.critical > 0 ? ["Critical 리스크 즉시 대응", "경영진 리뷰 일정 확보"] : ["정기 모니터링 유지"],
    },
    risk_overview: {
      total_risks: risk_data.total_risks,
      status_breakdown: statusBreakdown,
      category_breakdown: categoryBreakdown,
      comparison_to_previous: {
        change: 0,
        direction: "unchanged" as const,
        commentary: "전 기간 대비 리스크 수준 유지",
      },
    },
    detailed_sections: detailedSections,
    visualizations: [
      { chart_type: "도넛 차트", title: "리스크 상태 분포", data_description: "Critical/High/Medium/Low 비율", purpose: "전체 리스크 구성 파악" },
      { chart_type: "막대 차트", title: "카테고리별 리스크", data_description: "카테고리별 리스크 수", purpose: "집중 관리 영역 식별" },
      { chart_type: "추세선", title: "리스크 추이", data_description: "기간별 리스크 변화", purpose: "관리 효과 확인" },
    ],
    recommendations: [
      { priority: "high", recommendation: "Critical 리스크 일일 모니터링", rationale: "즉각 대응 필요", owner: "리스크 담당자" },
      { priority: "medium", recommendation: "카테고리별 완화 계획 강화", rationale: "사전 예방 효과", owner: "각 영역 담당자" },
      { priority: "low", recommendation: "리스크 관리 교육 실시", rationale: "팀 역량 강화", owner: "운영팀" },
    ],
    appendix: report_type === "detailed" ? [
      { title: "전체 리스크 목록", content_summary: "모든 식별된 리스크 상세" },
      { title: "완화 조치 현황", content_summary: "진행 중인 완화 조치 목록" },
    ] : undefined,
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
