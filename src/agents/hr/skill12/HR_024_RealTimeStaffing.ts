/**
 * HR-024: Real-Time Staffing
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 실시간 인력 현황 모니터링
 */

import { z } from "zod";

export const HR_024_InputSchema = z.object({
  event_id: z.string().uuid(),
  timestamp: z.string(),
  zones: z.array(z.object({
    zone_id: z.string(),
    zone_name: z.string(),
    required_staff: z.number(),
    current_staff: z.number(),
    visitor_count: z.number().optional(),
  })),
  on_call_available: z.number(),
});

export const HR_024_OutputSchema = z.object({
  event_id: z.string(),
  snapshot: z.object({
    timestamp: z.string(),
    total_on_duty: z.number(),
    total_required: z.number(),
    overall_coverage: z.number(),
    status: z.enum(["optimal", "adequate", "understaffed", "critical"]),
  }),
  zone_status: z.array(z.object({
    zone_id: z.string(),
    zone_name: z.string(),
    required: z.number(),
    current: z.number(),
    coverage: z.number(),
    status: z.enum(["overstaffed", "optimal", "understaffed", "critical"]),
    staff_to_visitor_ratio: z.string(),
    action_needed: z.string(),
  })),
  reallocation_suggestions: z.array(z.object({
    from_zone: z.string(),
    to_zone: z.string(),
    staff_count: z.number(),
    reason: z.string(),
    urgency: z.enum(["immediate", "within_15min", "when_convenient"]),
  })),
  alerts: z.array(z.object({
    severity: z.enum(["info", "warning", "critical"]),
    message: z.string(),
    zone: z.string(),
    recommended_action: z.string(),
  })),
  on_call_status: z.object({
    available: z.number(),
    activated: z.number(),
    eta_if_called: z.string(),
  }),
});

export type HR_024_Input = z.infer<typeof HR_024_InputSchema>;
export type HR_024_Output = z.infer<typeof HR_024_OutputSchema>;

export async function execute(input: HR_024_Input): Promise<HR_024_Output> {
  const totalOnDuty = input.zones.reduce((sum, z) => sum + z.current_staff, 0);
  const totalRequired = input.zones.reduce((sum, z) => sum + z.required_staff, 0);
  const overallCoverage = Math.round((totalOnDuty / totalRequired) * 100);

  let overallStatus: "optimal" | "adequate" | "understaffed" | "critical" = "optimal";
  if (overallCoverage < 70) overallStatus = "critical";
  else if (overallCoverage < 85) overallStatus = "understaffed";
  else if (overallCoverage < 95) overallStatus = "adequate";

  const zoneStatus = input.zones.map((zone) => {
    const coverage = Math.round((zone.current_staff / zone.required_staff) * 100);
    let status: "overstaffed" | "optimal" | "understaffed" | "critical" = "optimal";
    if (coverage > 120) status = "overstaffed";
    else if (coverage < 70) status = "critical";
    else if (coverage < 90) status = "understaffed";

    const ratio = zone.visitor_count
      ? `1:${Math.round(zone.visitor_count / zone.current_staff)}`
      : "N/A";

    let actionNeeded = "유지";
    if (status === "critical") actionNeeded = "즉시 인력 충원";
    else if (status === "understaffed") actionNeeded = "추가 인력 요청";
    else if (status === "overstaffed") actionNeeded = "인력 재배치 가능";

    return {
      zone_id: zone.zone_id,
      zone_name: zone.zone_name,
      required: zone.required_staff,
      current: zone.current_staff,
      coverage,
      status,
      staff_to_visitor_ratio: ratio,
      action_needed: actionNeeded,
    };
  });

  // 재배치 제안
  const overstaffedZones = zoneStatus.filter((z) => z.status === "overstaffed");
  const understaffedZones = zoneStatus.filter((z) => z.status === "understaffed" || z.status === "critical");

  const reallocationSuggestions = [];
  for (const under of understaffedZones) {
    for (const over of overstaffedZones) {
      const surplus = over.current - over.required;
      const deficit = under.required - under.current;
      if (surplus > 0 && deficit > 0) {
        reallocationSuggestions.push({
          from_zone: over.zone_name,
          to_zone: under.zone_name,
          staff_count: Math.min(surplus, deficit),
          reason: `${over.zone_name} 잉여 인력 → ${under.zone_name} 부족 해소`,
          urgency: under.status === "critical" ? "immediate" as const : "within_15min" as const,
        });
      }
    }
  }

  // 알림 생성
  const alerts = [];
  for (const zone of zoneStatus) {
    if (zone.status === "critical") {
      alerts.push({
        severity: "critical" as const,
        message: `${zone.zone_name} 인력 심각 부족 (${zone.coverage}%)`,
        zone: zone.zone_name,
        recommended_action: "대기 인력 즉시 투입 또는 타 구역 인력 이동",
      });
    } else if (zone.status === "understaffed") {
      alerts.push({
        severity: "warning" as const,
        message: `${zone.zone_name} 인력 부족 (${zone.coverage}%)`,
        zone: zone.zone_name,
        recommended_action: "15분 내 추가 인력 배치 권장",
      });
    }
  }

  return {
    event_id: input.event_id,
    snapshot: {
      timestamp: input.timestamp,
      total_on_duty: totalOnDuty,
      total_required: totalRequired,
      overall_coverage: overallCoverage,
      status: overallStatus,
    },
    zone_status: zoneStatus,
    reallocation_suggestions: reallocationSuggestions,
    alerts,
    on_call_status: {
      available: input.on_call_available,
      activated: 0,
      eta_if_called: "15-30분",
    },
  };
}

export const HR_024_RealTimeStaffing = {
  id: "HR-024",
  name: "Real-Time Staffing",
  description: "실시간 인력 현황 모니터링",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.9",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_024_InputSchema,
  outputSchema: HR_024_OutputSchema,
  persona: `당신은 현장 인력 관제 담당자입니다. 실시간 인력 현황을 모니터링하고 최적의 배치를 유지합니다.`,
};

export default HR_024_RealTimeStaffing;
