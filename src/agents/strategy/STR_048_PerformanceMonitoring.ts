/**
 * STR-048: 성과 모니터링
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Performance Monitoring)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Performance Monitoring Agent for event planning.

Your expertise includes:
- Performance tracking systems
- Real-time monitoring dashboards
- Variance analysis
- Performance alert management

CMP-IS Standard: Domain A - Strategic Planning (Performance Monitoring)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  monitoring_scope: z.object({
    kpis: z.array(z.object({
      kpi_id: z.string(),
      kpi_name: z.string(),
      target: z.string(),
      current_value: z.string().optional(),
    })),
    monitoring_period: z.enum(["daily", "weekly", "monthly"]),
  }),
  thresholds: z.object({
    alert_level: z.number().optional(),
    critical_level: z.number().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  monitoring_id: z.string().uuid(),
  event_id: z.string().uuid(),
  monitoring_dashboard: z.object({
    summary: z.object({
      total_kpis: z.number(),
      on_track: z.number(),
      at_risk: z.number(),
      off_track: z.number(),
      overall_health: z.enum(["excellent", "good", "fair", "poor"]),
    }),
    kpi_status: z.array(z.object({
      kpi_id: z.string(),
      kpi_name: z.string(),
      target: z.string(),
      current: z.string(),
      variance: z.string(),
      variance_percentage: z.number(),
      status: z.enum(["on_track", "at_risk", "off_track"]),
      trend: z.enum(["improving", "stable", "declining"]),
    })),
  }),
  variance_analysis: z.array(z.object({
    kpi_id: z.string(),
    variance_type: z.enum(["favorable", "unfavorable", "neutral"]),
    root_causes: z.array(z.string()),
    contributing_factors: z.array(z.string()),
    recommended_actions: z.array(z.string()),
  })),
  alerts: z.array(z.object({
    alert_id: z.string(),
    alert_type: z.enum(["warning", "critical"]),
    kpi_id: z.string(),
    message: z.string(),
    triggered_at: z.string(),
    recommended_response: z.string(),
    escalation_required: z.boolean(),
  })),
  reporting_schedule: z.object({
    daily_reports: z.array(z.string()),
    weekly_reports: z.array(z.string()),
    monthly_reports: z.array(z.string()),
    ad_hoc_triggers: z.array(z.string()),
  }),
  action_items: z.array(z.object({
    action: z.string(),
    priority: z.enum(["immediate", "high", "medium", "low"]),
    owner: z.string(),
    due_date: z.string(),
    related_kpi: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-048",
  taskName: "Performance Monitoring",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "성과를 모니터링하고 이슈를 조기에 식별합니다.",
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

  const { monitoring_scope, thresholds } = validated;
  const alertLevel = thresholds?.alert_level || 80;
  const criticalLevel = thresholds?.critical_level || 60;

  const kpiStatuses = monitoring_scope.kpis.map(kpi => {
    // Simulate current value if not provided
    const currentNum = kpi.current_value
      ? parseFloat(kpi.current_value.replace(/[^0-9.-]/g, "")) || 75
      : Math.round(50 + Math.random() * 50);
    const targetNum = parseFloat(kpi.target.replace(/[^0-9.-]/g, "")) || 100;
    const variancePercentage = Math.round(((currentNum - targetNum) / targetNum) * 100);

    const status = currentNum >= targetNum * (alertLevel / 100) ? "on_track" as const :
                   currentNum >= targetNum * (criticalLevel / 100) ? "at_risk" as const : "off_track" as const;

    return {
      kpi_id: kpi.kpi_id,
      kpi_name: kpi.kpi_name,
      target: kpi.target,
      current: kpi.current_value || `${currentNum}%`,
      variance: `${variancePercentage > 0 ? "+" : ""}${variancePercentage}%`,
      variance_percentage: variancePercentage,
      status,
      trend: variancePercentage >= 0 ? "improving" as const :
             variancePercentage >= -10 ? "stable" as const : "declining" as const,
    };
  });

  const onTrack = kpiStatuses.filter(k => k.status === "on_track").length;
  const atRisk = kpiStatuses.filter(k => k.status === "at_risk").length;
  const offTrack = kpiStatuses.filter(k => k.status === "off_track").length;
  const total = kpiStatuses.length;

  const healthRatio = (onTrack * 3 + atRisk) / (total * 3);
  const overallHealth = healthRatio >= 0.9 ? "excellent" as const :
                        healthRatio >= 0.7 ? "good" as const :
                        healthRatio >= 0.5 ? "fair" as const : "poor" as const;

  const varianceAnalysis = kpiStatuses
    .filter(k => k.status !== "on_track")
    .map(k => ({
      kpi_id: k.kpi_id,
      variance_type: k.variance_percentage >= 0 ? "favorable" as const : "unfavorable" as const,
      root_causes: ["자원 부족", "일정 지연", "외부 요인"].slice(0, k.status === "off_track" ? 3 : 2),
      contributing_factors: ["초기 계획 미비", "조율 부족"],
      recommended_actions: [
        "원인 분석 심화",
        "시정 조치 실행",
        k.status === "off_track" ? "긴급 대응 회의" : "모니터링 강화",
      ],
    }));

  const alerts = kpiStatuses
    .filter(k => k.status !== "on_track")
    .map((k, idx) => ({
      alert_id: `ALT-${String(idx + 1).padStart(3, "0")}`,
      alert_type: k.status === "off_track" ? "critical" as const : "warning" as const,
      kpi_id: k.kpi_id,
      message: k.status === "off_track"
        ? `${k.kpi_name} 심각한 미달 (${k.current} / 목표 ${k.target})`
        : `${k.kpi_name} 주의 필요 (${k.current} / 목표 ${k.target})`,
      triggered_at: new Date().toISOString(),
      recommended_response: k.status === "off_track" ? "즉시 시정 조치 착수" : "추가 모니터링 및 원인 파악",
      escalation_required: k.status === "off_track",
    }));

  const actionItems = kpiStatuses
    .filter(k => k.status !== "on_track")
    .map(k => ({
      action: k.status === "off_track" ? `${k.kpi_name} 긴급 개선 계획 수립` : `${k.kpi_name} 원인 분석`,
      priority: k.status === "off_track" ? "immediate" as const : "high" as const,
      owner: "성과 관리팀",
      due_date: k.status === "off_track" ? "24시간 내" : "1주 내",
      related_kpi: k.kpi_id,
    }));

  return {
    monitoring_id: generateUUID(),
    event_id: validated.event_id,
    monitoring_dashboard: {
      summary: {
        total_kpis: total,
        on_track: onTrack,
        at_risk: atRisk,
        off_track: offTrack,
        overall_health: overallHealth,
      },
      kpi_status: kpiStatuses,
    },
    variance_analysis: varianceAnalysis,
    alerts,
    reporting_schedule: {
      daily_reports: monitoring_scope.monitoring_period === "daily" ? ["일일 KPI 현황 보고"] : [],
      weekly_reports: ["주간 성과 요약", "이슈 및 조치 현황"],
      monthly_reports: ["월간 성과 분석", "추세 분석", "개선 계획"],
      ad_hoc_triggers: ["Critical 알림 발생 시 즉시 보고", "주요 마일스톤 달성 시"],
    },
    action_items: actionItems,
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
