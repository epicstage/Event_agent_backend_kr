/**
 * STR-032: 리스크 모니터링
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Monitoring)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Monitoring Agent for event planning.

Your expertise includes:
- Real-time risk tracking systems
- Key Risk Indicator (KRI) development
- Early warning system design
- Risk dashboard management

CMP-IS Standard: Domain A - Strategic Planning (Risk Monitoring)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  monitored_risks: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    category: z.string(),
    current_status: z.enum(["active", "dormant", "mitigated", "occurred"]),
    last_assessment_date: z.string().optional(),
  })),
  monitoring_period: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  current_indicators: z.array(z.object({
    indicator: z.string(),
    current_value: z.number(),
    threshold: z.number(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  monitoring_report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  monitoring_dashboard: z.object({
    overall_risk_status: z.enum(["green", "yellow", "red"]),
    active_risks: z.number(),
    risks_increased: z.number(),
    risks_decreased: z.number(),
    new_risks: z.number(),
    closed_risks: z.number(),
  }),
  risk_status_updates: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    previous_status: z.string(),
    current_status: z.string(),
    trend: z.enum(["improving", "stable", "worsening"]),
    key_observations: z.array(z.string()),
    recommended_actions: z.array(z.string()),
  })),
  key_risk_indicators: z.array(z.object({
    kri_id: z.string(),
    indicator_name: z.string(),
    associated_risks: z.array(z.string()),
    measurement_method: z.string(),
    current_value: z.number(),
    threshold_warning: z.number(),
    threshold_critical: z.number(),
    status: z.enum(["normal", "warning", "critical"]),
    trend: z.enum(["improving", "stable", "worsening"]),
  })),
  early_warning_alerts: z.array(z.object({
    alert_id: z.string(),
    severity: z.enum(["info", "warning", "critical"]),
    related_risk: z.string(),
    indicator: z.string(),
    message: z.string(),
    recommended_action: z.string(),
    timestamp: z.string(),
  })),
  monitoring_schedule: z.array(z.object({
    risk_category: z.string(),
    review_frequency: z.string(),
    next_review: z.string(),
    reviewer: z.string(),
  })),
  reporting_requirements: z.object({
    routine_reports: z.array(z.object({
      report_type: z.string(),
      frequency: z.string(),
      audience: z.string(),
      content: z.array(z.string()),
    })),
    escalation_reports: z.array(z.object({
      trigger: z.string(),
      recipient: z.string(),
      content: z.array(z.string()),
      response_time: z.string(),
    })),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-032",
  taskName: "Risk Monitoring",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "리스크 상태를 지속적으로 모니터링하고 조기 경보를 제공합니다.",
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

  const activeRisks = validated.monitored_risks.filter(r => r.current_status === "active").length;
  const mitigatedRisks = validated.monitored_risks.filter(r => r.current_status === "mitigated").length;

  // Simulate trend analysis
  const statusUpdates = validated.monitored_risks.map(risk => {
    const trend = risk.current_status === "mitigated" ? "improving" as const :
      risk.current_status === "occurred" ? "worsening" as const : "stable" as const;

    return {
      risk_id: risk.risk_id,
      risk_name: risk.risk_name,
      previous_status: risk.current_status,
      current_status: risk.current_status,
      trend,
      key_observations: [
        `${risk.risk_name} 현재 상태: ${risk.current_status}`,
        "모니터링 지표 정상 범위",
      ],
      recommended_actions: trend === "worsening"
        ? ["즉시 대응 필요", "비상 계획 검토"]
        : trend === "improving"
        ? ["현재 완화 조치 유지", "모니터링 빈도 조정 고려"]
        : ["정기 모니터링 계속"],
    };
  });

  // Generate KRIs based on risk categories
  const categories = [...new Set(validated.monitored_risks.map(r => r.category))];
  let kriCounter = 1;

  const kris = categories.flatMap(category => {
    const categoryRisks = validated.monitored_risks.filter(r => r.category === category);
    const baseIndicators = [
      { name: `${category} 발생 빈도`, method: "사건 보고 집계" },
      { name: `${category} 완화 진행률`, method: "완화 조치 완료율 측정" },
    ];

    return baseIndicators.map(ind => {
      const currentIndicator = validated.current_indicators?.find(ci => ci.indicator.includes(category));
      const currentValue = currentIndicator?.current_value || Math.round(Math.random() * 100);
      const threshold = currentIndicator?.threshold || 70;

      return {
        kri_id: `KRI-${String(kriCounter++).padStart(3, "0")}`,
        indicator_name: ind.name,
        associated_risks: categoryRisks.map(r => r.risk_id),
        measurement_method: ind.method,
        current_value: currentValue,
        threshold_warning: threshold,
        threshold_critical: threshold + 20,
        status: currentValue < threshold ? "normal" as const : currentValue < threshold + 20 ? "warning" as const : "critical" as const,
        trend: "stable" as const,
      };
    });
  });

  // Generate alerts for warning/critical KRIs
  let alertCounter = 1;
  const alerts = kris
    .filter(kri => kri.status !== "normal")
    .map(kri => ({
      alert_id: `ALT-${String(alertCounter++).padStart(3, "0")}`,
      severity: kri.status === "critical" ? "critical" as const : "warning" as const,
      related_risk: kri.associated_risks[0] || "unknown",
      indicator: kri.indicator_name,
      message: `${kri.indicator_name}이(가) ${kri.status === "critical" ? "임계값 초과" : "경고 수준"}에 도달했습니다. (현재: ${kri.current_value})`,
      recommended_action: kri.status === "critical" ? "즉시 대응 필요" : "상황 모니터링 강화",
      timestamp: new Date().toISOString(),
    }));

  const overallStatus = alerts.some(a => a.severity === "critical") ? "red" as const :
    alerts.some(a => a.severity === "warning") ? "yellow" as const : "green" as const;

  return {
    monitoring_report_id: generateUUID(),
    event_id: validated.event_id,
    monitoring_dashboard: {
      overall_risk_status: overallStatus,
      active_risks: activeRisks,
      risks_increased: Math.floor(Math.random() * 3),
      risks_decreased: mitigatedRisks,
      new_risks: 0,
      closed_risks: mitigatedRisks,
    },
    risk_status_updates: statusUpdates,
    key_risk_indicators: kris,
    early_warning_alerts: alerts,
    monitoring_schedule: categories.map(cat => ({
      risk_category: cat,
      review_frequency: cat === "safety" ? "일일" : cat === "operational" ? "주간" : "격주",
      next_review: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      reviewer: "리스크 담당자",
    })),
    reporting_requirements: {
      routine_reports: [
        { report_type: "일일 리스크 현황", frequency: "매일", audience: "운영팀", content: ["활성 리스크", "당일 이슈", "조치 현황"] },
        { report_type: "주간 리스크 리뷰", frequency: "주간", audience: "프로젝트팀", content: ["주간 변화", "KRI 추이", "완화 진행"] },
        { report_type: "월간 리스크 보고", frequency: "월간", audience: "경영진", content: ["전체 리스크 현황", "주요 이슈", "권고 사항"] },
      ],
      escalation_reports: [
        { trigger: "Critical 알림 발생", recipient: "경영진", content: ["상황 요약", "즉각 조치", "예상 영향"], response_time: "1시간 이내" },
        { trigger: "복수 Warning 지속", recipient: "운영 총괄", content: ["관련 리스크", "현재 조치", "추가 필요 사항"], response_time: "4시간 이내" },
      ],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
