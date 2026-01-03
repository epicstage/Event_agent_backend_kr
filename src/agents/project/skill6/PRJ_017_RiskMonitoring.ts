/**
 * PRJ-017: 리스크 모니터링
 *
 * CMP-IS Reference: 6.1.d - Monitoring project risks
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Monitoring Agent for event projects.

Your expertise includes:
- Tracking identified risks
- Monitoring risk triggers
- Assessing risk status changes
- Evaluating mitigation effectiveness

CMP-IS Standard: 6.1.d - Monitoring project risks`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  risks: z.array(z.object({
    risk_id: z.string(),
    description: z.string(),
    category: z.string(),
    probability: z.enum(["very_low", "low", "medium", "high", "very_high"]),
    impact: z.enum(["very_low", "low", "medium", "high", "very_high"]),
    status: z.enum(["identified", "mitigating", "resolved", "accepted", "occurred"]),
    mitigation_status: z.string().optional(),
    owner: z.string(),
  })),
  new_risks: z.array(z.object({
    description: z.string(),
    category: z.string().optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  reporting_date: z.string(),
  risk_summary: z.object({
    total_risks: z.number(),
    active_risks: z.number(),
    resolved_risks: z.number(),
    occurred_risks: z.number(),
    new_risks_identified: z.number(),
    overall_risk_level: z.enum(["low", "medium", "high", "critical"]),
  }),
  risk_status: z.array(z.object({
    risk_id: z.string(),
    description: z.string(),
    current_status: z.string(),
    previous_status: z.string(),
    status_change: z.enum(["improved", "unchanged", "worsened", "new"]),
    risk_score: z.number(),
    trend: z.enum(["decreasing", "stable", "increasing"]),
    mitigation_effectiveness: z.enum(["effective", "partially_effective", "ineffective", "not_applicable"]),
    days_until_trigger: z.number().optional(),
    recommended_action: z.string(),
  })),
  trigger_alerts: z.array(z.object({
    risk_id: z.string(),
    trigger_description: z.string(),
    trigger_status: z.enum(["not_triggered", "approaching", "triggered"]),
    alert_level: z.enum(["info", "warning", "critical"]),
    immediate_action: z.string(),
  })),
  mitigation_review: z.array(z.object({
    risk_id: z.string(),
    mitigation_action: z.string(),
    status: z.enum(["not_started", "in_progress", "completed"]),
    effectiveness: z.string(),
    adjustment_needed: z.boolean(),
    adjusted_action: z.string().optional(),
  })),
  risk_metrics: z.object({
    risk_exposure_index: z.number(),
    mitigation_coverage: z.number(),
    contingency_utilization: z.number(),
    risk_velocity: z.string(),
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

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

const probabilityScore: Record<string, number> = {
  very_low: 1, low: 2, medium: 3, high: 4, very_high: 5,
};

const impactScore: Record<string, number> = {
  very_low: 1, low: 2, medium: 3, high: 4, very_high: 5,
};

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const today = new Date().toISOString().split("T")[0];
  const daysToEvent = daysBetween(today, validatedInput.event_date);

  const risks = validatedInput.risks;
  const newRisks = validatedInput.new_risks || [];

  // 리스크 요약
  const activeRisks = risks.filter(r => r.status !== "resolved");
  const resolvedRisks = risks.filter(r => r.status === "resolved");
  const occurredRisks = risks.filter(r => r.status === "occurred");

  const totalRiskScore = activeRisks.reduce((sum, r) =>
    sum + probabilityScore[r.probability] * impactScore[r.impact], 0);

  const overallRiskLevel: "low" | "medium" | "high" | "critical" =
    totalRiskScore > 50 ? "critical" :
    totalRiskScore > 30 ? "high" :
    totalRiskScore > 15 ? "medium" : "low";

  const riskSummary: Output["risk_summary"] = {
    total_risks: risks.length + newRisks.length,
    active_risks: activeRisks.length,
    resolved_risks: resolvedRisks.length,
    occurred_risks: occurredRisks.length,
    new_risks_identified: newRisks.length,
    overall_risk_level: overallRiskLevel,
  };

  // 개별 리스크 상태
  const riskStatus: Output["risk_status"] = risks.map(risk => {
    const score = probabilityScore[risk.probability] * impactScore[risk.impact];

    let statusChange: "improved" | "unchanged" | "worsened" | "new" = "unchanged";
    let trend: "decreasing" | "stable" | "increasing" = "stable";
    let effectiveness: "effective" | "partially_effective" | "ineffective" | "not_applicable" = "not_applicable";

    if (risk.status === "resolved") {
      statusChange = "improved";
      trend = "decreasing";
      effectiveness = "effective";
    } else if (risk.status === "occurred") {
      statusChange = "worsened";
      trend = "increasing";
      effectiveness = "ineffective";
    } else if (risk.status === "mitigating") {
      effectiveness = "partially_effective";
    }

    let recommendedAction = "모니터링 지속";
    if (score >= 16 && daysToEvent <= 14) {
      recommendedAction = "즉시 대응 필요 - 완화 조치 강화";
    } else if (score >= 12) {
      recommendedAction = "주간 점검 강화";
    }

    return {
      risk_id: risk.risk_id,
      description: risk.description,
      current_status: risk.status,
      previous_status: risk.status, // 실제로는 이전 상태 조회
      status_change: statusChange,
      risk_score: score,
      trend,
      mitigation_effectiveness: effectiveness,
      days_until_trigger: daysToEvent <= 7 ? daysToEvent : undefined,
      recommended_action: recommendedAction,
    };
  });

  // 트리거 알림
  const triggerAlerts: Output["trigger_alerts"] = activeRisks
    .filter(r => r.status !== "resolved" && probabilityScore[r.probability] >= 3)
    .map(risk => {
      const isApproaching = daysToEvent <= 14;
      const isTriggered = risk.status === "occurred";

      return {
        risk_id: risk.risk_id,
        trigger_description: `${risk.category} 관련 리스크 트리거 감시 중`,
        trigger_status: isTriggered ? "triggered" : isApproaching ? "approaching" : "not_triggered",
        alert_level: isTriggered ? "critical" : isApproaching ? "warning" : "info",
        immediate_action: isTriggered
          ? "비상 대응 계획 실행"
          : isApproaching
            ? "완화 조치 점검 및 강화"
            : "정기 모니터링",
      };
    });

  // 완화 조치 검토
  const mitigationReview: Output["mitigation_review"] = activeRisks.map(risk => ({
    risk_id: risk.risk_id,
    mitigation_action: risk.mitigation_status || "완화 조치 진행 중",
    status: risk.status === "mitigating" ? "in_progress" : "not_started",
    effectiveness: risk.status === "mitigating" ? "모니터링 중" : "평가 전",
    adjustment_needed: probabilityScore[risk.probability] >= 4,
    adjusted_action: probabilityScore[risk.probability] >= 4
      ? "완화 조치 강화 또는 추가 대안 마련"
      : undefined,
  }));

  // 리스크 메트릭
  const riskExposureIndex = Math.round(totalRiskScore / Math.max(activeRisks.length, 1) * 10);
  const mitigatingCount = risks.filter(r => r.status === "mitigating").length;
  const mitigationCoverage = Math.round((mitigatingCount / Math.max(activeRisks.length, 1)) * 100);

  const riskMetrics: Output["risk_metrics"] = {
    risk_exposure_index: riskExposureIndex,
    mitigation_coverage: mitigationCoverage,
    contingency_utilization: occurredRisks.length > 0 ? 30 : 0,
    risk_velocity: daysToEvent <= 7 ? "높음 - D-Day 임박" : "보통",
  };

  // 권장사항
  const recommendations: string[] = [];
  recommendations.push(`현재 전체 리스크 수준: ${overallRiskLevel}`);

  if (activeRisks.length > 0) {
    recommendations.push(`활성 리스크 ${activeRisks.length}개 모니터링 중`);
  }

  if (newRisks.length > 0) {
    recommendations.push(`신규 리스크 ${newRisks.length}개 식별됨 - 평가 필요`);
  }

  if (daysToEvent <= 7) {
    recommendations.push("D-Day 임박 - 일일 리스크 리뷰 필수");
  }

  if (occurredRisks.length > 0) {
    recommendations.push(`발생한 리스크 ${occurredRisks.length}개 - 비상 대응 검토`);
  }

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    reporting_date: today,
    risk_summary: riskSummary,
    risk_status: riskStatus,
    trigger_alerts: triggerAlerts,
    mitigation_review: mitigationReview,
    risk_metrics: riskMetrics,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-017",
  taskName: "리스크 모니터링",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.d",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
