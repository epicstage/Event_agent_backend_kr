/**
 * PRJ-021: 벤더 성과 관리
 *
 * CMP-IS Reference: 6.1.h - Managing vendor performance
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Vendor Performance Management Agent for event projects.

Your expertise includes:
- Evaluating vendor service delivery
- Tracking SLA compliance
- Managing vendor relationships
- Addressing performance issues

CMP-IS Standard: 6.1.h - Managing vendor performance`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  vendors: z.array(z.object({
    vendor_id: z.string(),
    vendor_name: z.string(),
    category: z.string(),
    contract_value: z.number(),
    sla_metrics: z.array(z.object({
      metric_name: z.string(),
      target: z.number(),
      actual: z.number(),
      unit: z.string(),
    })).optional(),
    deliverables: z.array(z.object({
      deliverable: z.string(),
      due_date: z.string(),
      status: z.enum(["pending", "delivered", "delayed", "rejected"]),
      quality_score: z.number().optional(),
    })).optional(),
    communication_score: z.number().optional(),
    issues: z.array(z.string()).optional(),
  })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  reporting_date: z.string(),
  vendor_summary: z.object({
    total_vendors: z.number(),
    performing_well: z.number(),
    needs_attention: z.number(),
    underperforming: z.number(),
    total_contract_value: z.number(),
    average_performance_score: z.number(),
  }),
  vendor_scorecards: z.array(z.object({
    vendor_id: z.string(),
    vendor_name: z.string(),
    category: z.string(),
    overall_score: z.number(),
    performance_rating: z.enum(["excellent", "good", "satisfactory", "poor", "critical"]),
    sla_compliance: z.number(),
    delivery_performance: z.number(),
    quality_score: z.number(),
    communication_score: z.number(),
    trend: z.enum(["improving", "stable", "declining"]),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  })),
  sla_analysis: z.array(z.object({
    vendor_id: z.string(),
    vendor_name: z.string(),
    sla_metrics: z.array(z.object({
      metric: z.string(),
      target: z.number(),
      actual: z.number(),
      compliance: z.boolean(),
      variance: z.number(),
    })),
    overall_sla_compliance: z.number(),
  })),
  performance_issues: z.array(z.object({
    issue_id: z.string(),
    vendor_id: z.string(),
    vendor_name: z.string(),
    issue_type: z.string(),
    description: z.string(),
    impact: z.enum(["low", "medium", "high", "critical"]),
    recommended_action: z.string(),
    escalation_needed: z.boolean(),
  })),
  action_items: z.array(z.object({
    action_id: z.string(),
    vendor_id: z.string(),
    action: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    owner: z.string(),
    due_date: z.string(),
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const today = new Date().toISOString().split("T")[0];
  const vendors = validatedInput.vendors;

  // 벤더별 스코어카드 계산
  const vendorScorecards: Output["vendor_scorecards"] = vendors.map(vendor => {
    // SLA 준수율
    const slaMetrics = vendor.sla_metrics || [];
    const slaCompliance = slaMetrics.length > 0
      ? slaMetrics.filter(m => m.actual >= m.target).length / slaMetrics.length * 100
      : 100;

    // 납품 성과
    const deliverables = vendor.deliverables || [];
    const deliveredOnTime = deliverables.filter(d => d.status === "delivered").length;
    const deliveryPerformance = deliverables.length > 0
      ? (deliveredOnTime / deliverables.length) * 100
      : 100;

    // 품질 점수
    const qualityScores = deliverables.filter(d => d.quality_score !== undefined).map(d => d.quality_score!);
    const qualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length
      : 80;

    // 커뮤니케이션 점수
    const communicationScore = vendor.communication_score || 80;

    // 종합 점수
    const overallScore = Math.round(
      slaCompliance * 0.3 +
      deliveryPerformance * 0.3 +
      qualityScore * 0.25 +
      communicationScore * 0.15
    );

    let performanceRating: "excellent" | "good" | "satisfactory" | "poor" | "critical";
    if (overallScore >= 90) performanceRating = "excellent";
    else if (overallScore >= 80) performanceRating = "good";
    else if (overallScore >= 70) performanceRating = "satisfactory";
    else if (overallScore >= 60) performanceRating = "poor";
    else performanceRating = "critical";

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (slaCompliance >= 90) strengths.push("SLA 준수 우수");
    else if (slaCompliance < 70) weaknesses.push("SLA 준수율 낮음");

    if (deliveryPerformance >= 90) strengths.push("납기 준수 우수");
    else if (deliveryPerformance < 70) weaknesses.push("납기 지연 발생");

    if (qualityScore >= 85) strengths.push("품질 우수");
    else if (qualityScore < 70) weaknesses.push("품질 개선 필요");

    if (communicationScore >= 85) strengths.push("소통 원활");
    else if (communicationScore < 70) weaknesses.push("소통 개선 필요");

    return {
      vendor_id: vendor.vendor_id,
      vendor_name: vendor.vendor_name,
      category: vendor.category,
      overall_score: overallScore,
      performance_rating: performanceRating,
      sla_compliance: Math.round(slaCompliance),
      delivery_performance: Math.round(deliveryPerformance),
      quality_score: Math.round(qualityScore),
      communication_score: Math.round(communicationScore),
      trend: "stable",
      strengths,
      weaknesses,
    };
  });

  // 요약
  const performingWell = vendorScorecards.filter(v => v.overall_score >= 80).length;
  const needsAttention = vendorScorecards.filter(v => v.overall_score >= 60 && v.overall_score < 80).length;
  const underperforming = vendorScorecards.filter(v => v.overall_score < 60).length;
  const avgScore = vendorScorecards.reduce((sum, v) => sum + v.overall_score, 0) / vendorScorecards.length;

  const vendorSummary: Output["vendor_summary"] = {
    total_vendors: vendors.length,
    performing_well: performingWell,
    needs_attention: needsAttention,
    underperforming: underperforming,
    total_contract_value: vendors.reduce((sum, v) => sum + v.contract_value, 0),
    average_performance_score: Math.round(avgScore),
  };

  // SLA 분석
  const slaAnalysis: Output["sla_analysis"] = vendors.map(vendor => ({
    vendor_id: vendor.vendor_id,
    vendor_name: vendor.vendor_name,
    sla_metrics: (vendor.sla_metrics || []).map(m => ({
      metric: m.metric_name,
      target: m.target,
      actual: m.actual,
      compliance: m.actual >= m.target,
      variance: Math.round(((m.actual - m.target) / m.target) * 100),
    })),
    overall_sla_compliance: Math.round(
      (vendor.sla_metrics || []).length > 0
        ? (vendor.sla_metrics || []).filter(m => m.actual >= m.target).length / (vendor.sla_metrics || []).length * 100
        : 100
    ),
  }));

  // 성과 이슈
  const performanceIssues: Output["performance_issues"] = [];
  let issueCount = 0;

  vendorScorecards.forEach(scorecard => {
    const vendor = vendors.find(v => v.vendor_id === scorecard.vendor_id)!;

    if (scorecard.sla_compliance < 70) {
      issueCount++;
      performanceIssues.push({
        issue_id: `VI-${String(issueCount).padStart(3, "0")}`,
        vendor_id: scorecard.vendor_id,
        vendor_name: scorecard.vendor_name,
        issue_type: "SLA 미준수",
        description: `SLA 준수율 ${scorecard.sla_compliance}%로 목표 미달`,
        impact: scorecard.sla_compliance < 50 ? "critical" : "high",
        recommended_action: "벤더 미팅 및 개선 계획 요청",
        escalation_needed: scorecard.sla_compliance < 50,
      });
    }

    if (scorecard.delivery_performance < 70) {
      issueCount++;
      performanceIssues.push({
        issue_id: `VI-${String(issueCount).padStart(3, "0")}`,
        vendor_id: scorecard.vendor_id,
        vendor_name: scorecard.vendor_name,
        issue_type: "납기 지연",
        description: `납기 준수율 ${scorecard.delivery_performance}%`,
        impact: "high",
        recommended_action: "납기 관리 강화 및 페널티 검토",
        escalation_needed: false,
      });
    }

    (vendor.issues || []).forEach(issue => {
      issueCount++;
      performanceIssues.push({
        issue_id: `VI-${String(issueCount).padStart(3, "0")}`,
        vendor_id: scorecard.vendor_id,
        vendor_name: scorecard.vendor_name,
        issue_type: "기타 이슈",
        description: issue,
        impact: "medium",
        recommended_action: "상세 확인 필요",
        escalation_needed: false,
      });
    });
  });

  // 액션 아이템
  const actionItems: Output["action_items"] = [];
  let actionCount = 0;

  performanceIssues.forEach(issue => {
    actionCount++;
    actionItems.push({
      action_id: `VA-${String(actionCount).padStart(3, "0")}`,
      vendor_id: issue.vendor_id,
      action: issue.recommended_action,
      priority: issue.impact === "critical" ? "high" : issue.impact === "high" ? "high" : "medium",
      owner: "조달 담당",
      due_date: addDays(today, issue.impact === "critical" ? 2 : 7),
    });
  });

  // 권장사항
  const recommendations: string[] = [];
  recommendations.push(`평균 벤더 성과 점수: ${Math.round(avgScore)}점`);

  if (underperforming > 0) {
    recommendations.push(`성과 미달 벤더 ${underperforming}개사 관리 강화 필요`);
  }

  if (performingWell === vendors.length) {
    recommendations.push("모든 벤더 양호 - 현 관리 수준 유지");
  }

  if (performanceIssues.filter(i => i.escalation_needed).length > 0) {
    recommendations.push("에스컬레이션 필요 이슈 존재 - 즉시 조치");
  }

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    reporting_date: today,
    vendor_summary: vendorSummary,
    vendor_scorecards: vendorScorecards,
    sla_analysis: slaAnalysis,
    performance_issues: performanceIssues,
    action_items: actionItems,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-021",
  taskName: "벤더 성과 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.h",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
