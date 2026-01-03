/**
 * HR-037: Safety Compliance Monitor
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 안전 규정 준수 모니터링
 */

import { z } from "zod";

export const HR_037_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  venue_type: z.enum(["indoor", "outdoor", "mixed"]),
  safety_data: z.object({
    staff_count: z.number(),
    trained_first_aiders: z.number(),
    safety_officers: z.number(),
    fire_marshals: z.number(),
  }),
  equipment_status: z.array(z.object({
    item: z.string(),
    required: z.number(),
    available: z.number(),
    last_inspection: z.string(),
  })),
  incidents_today: z.array(z.object({
    type: z.string(),
    severity: z.enum(["minor", "moderate", "serious"]),
    time: z.string(),
    resolved: z.boolean(),
  })).optional(),
  weather_conditions: z.object({
    temperature: z.number(),
    humidity: z.number(),
    conditions: z.string(),
  }).optional(),
});

export const HR_037_OutputSchema = z.object({
  event_id: z.string(),
  compliance_status: z.object({
    overall_status: z.enum(["compliant", "partially_compliant", "non_compliant"]),
    score: z.number(),
    last_updated: z.string(),
  }),
  staffing_compliance: z.object({
    first_aid_ratio: z.object({
      required: z.string(),
      actual: z.string(),
      compliant: z.boolean(),
    }),
    safety_officer_ratio: z.object({
      required: z.string(),
      actual: z.string(),
      compliant: z.boolean(),
    }),
    fire_marshal_ratio: z.object({
      required: z.string(),
      actual: z.string(),
      compliant: z.boolean(),
    }),
  }),
  equipment_compliance: z.array(z.object({
    item: z.string(),
    status: z.enum(["ok", "low", "critical", "expired"]),
    action_required: z.string().optional(),
  })),
  risk_assessment: z.object({
    current_risk_level: z.enum(["low", "medium", "high", "critical"]),
    risk_factors: z.array(z.object({
      factor: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    })),
  }),
  incident_summary: z.object({
    total_today: z.number(),
    by_severity: z.object({
      minor: z.number(),
      moderate: z.number(),
      serious: z.number(),
    }),
    all_resolved: z.boolean(),
  }),
  required_actions: z.array(z.object({
    priority: z.enum(["immediate", "urgent", "routine"]),
    action: z.string(),
    responsible: z.string(),
    deadline: z.string(),
  })),
  safety_briefing: z.object({
    key_points: z.array(z.string()),
    emergency_contacts: z.array(z.object({
      role: z.string(),
      name: z.string(),
      contact: z.string(),
    })),
    evacuation_routes: z.array(z.string()),
  }),
  documentation: z.array(z.object({
    document: z.string(),
    status: z.enum(["complete", "incomplete", "missing"]),
    due_date: z.string().optional(),
  })),
});

export type HR_037_Input = z.infer<typeof HR_037_InputSchema>;
export type HR_037_Output = z.infer<typeof HR_037_OutputSchema>;

export async function execute(input: HR_037_Input): Promise<HR_037_Output> {
  const now = new Date().toISOString();

  // 인력 비율 계산 (산업안전보건법 기준)
  const requiredFirstAiders = Math.ceil(input.safety_data.staff_count / 50);
  const requiredSafetyOfficers = Math.ceil(input.safety_data.staff_count / 100);
  const requiredFireMarshals = input.venue_type === "indoor"
    ? Math.ceil(input.safety_data.staff_count / 50)
    : Math.ceil(input.safety_data.staff_count / 100);

  const staffingCompliance = {
    first_aid_ratio: {
      required: `1:50 (최소 ${requiredFirstAiders}명)`,
      actual: `${input.safety_data.trained_first_aiders}명`,
      compliant: input.safety_data.trained_first_aiders >= requiredFirstAiders,
    },
    safety_officer_ratio: {
      required: `1:100 (최소 ${requiredSafetyOfficers}명)`,
      actual: `${input.safety_data.safety_officers}명`,
      compliant: input.safety_data.safety_officers >= requiredSafetyOfficers,
    },
    fire_marshal_ratio: {
      required: `1:${input.venue_type === "indoor" ? 50 : 100} (최소 ${requiredFireMarshals}명)`,
      actual: `${input.safety_data.fire_marshals}명`,
      compliant: input.safety_data.fire_marshals >= requiredFireMarshals,
    },
  };

  // 장비 상태 확인
  const equipmentCompliance = input.equipment_status.map((eq) => {
    const lastInspection = new Date(eq.last_inspection);
    const daysSinceInspection = Math.ceil(
      (Date.now() - lastInspection.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: "ok" | "low" | "critical" | "expired" = "ok";
    let actionRequired: string | undefined;

    if (daysSinceInspection > 365) {
      status = "expired";
      actionRequired = "즉시 재점검 필요";
    } else if (eq.available < eq.required * 0.5) {
      status = "critical";
      actionRequired = "즉시 보충 필요";
    } else if (eq.available < eq.required) {
      status = "low";
      actionRequired = "보충 권장";
    }

    return {
      item: eq.item,
      status,
      action_required: actionRequired,
    };
  });

  // 리스크 평가
  const riskFactors = [];

  if (!staffingCompliance.first_aid_ratio.compliant) {
    riskFactors.push({
      factor: "응급처치 인력 부족",
      severity: "high" as const,
      mitigation: "추가 자격자 배치 또는 외부 응급 서비스 대기",
    });
  }

  if (input.weather_conditions) {
    if (input.weather_conditions.temperature > 33) {
      riskFactors.push({
        factor: "고온 환경",
        severity: "high" as const,
        mitigation: "휴식 시간 증가, 음료 제공, 그늘막 설치",
      });
    } else if (input.weather_conditions.temperature < 0) {
      riskFactors.push({
        factor: "저온 환경",
        severity: "medium" as const,
        mitigation: "방한 용품 제공, 난방 공간 확보",
      });
    }

    if (input.weather_conditions.conditions.includes("비") || input.weather_conditions.conditions.includes("눈")) {
      riskFactors.push({
        factor: "악천후",
        severity: "medium" as const,
        mitigation: "미끄럼 방지 조치, 우천 대비 장비",
      });
    }
  }

  if (equipmentCompliance.some((e) => e.status === "critical" || e.status === "expired")) {
    riskFactors.push({
      factor: "안전 장비 부족/미점검",
      severity: "high" as const,
      mitigation: "즉시 보충 및 점검 실시",
    });
  }

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  const highRisks = riskFactors.filter((r) => r.severity === "high").length;
  if (highRisks >= 2) riskLevel = "critical";
  else if (highRisks >= 1) riskLevel = "high";
  else if (riskFactors.length > 0) riskLevel = "medium";

  // 사고 요약
  const incidents = input.incidents_today || [];
  const incidentSummary = {
    total_today: incidents.length,
    by_severity: {
      minor: incidents.filter((i) => i.severity === "minor").length,
      moderate: incidents.filter((i) => i.severity === "moderate").length,
      serious: incidents.filter((i) => i.severity === "serious").length,
    },
    all_resolved: incidents.every((i) => i.resolved),
  };

  // 필요 조치
  const requiredActions = [];

  if (!staffingCompliance.first_aid_ratio.compliant) {
    requiredActions.push({
      priority: "immediate" as const,
      action: `응급처치 자격자 ${requiredFirstAiders - input.safety_data.trained_first_aiders}명 추가 배치`,
      responsible: "안전 담당",
      deadline: "즉시",
    });
  }

  for (const eq of equipmentCompliance.filter((e) => e.status === "critical" || e.status === "expired")) {
    requiredActions.push({
      priority: eq.status === "critical" ? "immediate" as const : "urgent" as const,
      action: eq.action_required!,
      responsible: "시설 담당",
      deadline: eq.status === "critical" ? "1시간 이내" : "당일",
    });
  }

  if (!incidentSummary.all_resolved) {
    requiredActions.push({
      priority: "urgent" as const,
      action: "미해결 사고 처리 완료",
      responsible: "안전 담당",
      deadline: "2시간 이내",
    });
  }

  // 전체 점수 계산
  let score = 100;
  if (!staffingCompliance.first_aid_ratio.compliant) score -= 20;
  if (!staffingCompliance.safety_officer_ratio.compliant) score -= 15;
  if (!staffingCompliance.fire_marshal_ratio.compliant) score -= 15;
  score -= equipmentCompliance.filter((e) => e.status === "critical").length * 10;
  score -= equipmentCompliance.filter((e) => e.status === "expired").length * 15;
  score -= incidentSummary.by_severity.serious * 10;
  score = Math.max(0, score);

  let overallStatus: "compliant" | "partially_compliant" | "non_compliant" = "compliant";
  if (score < 60) overallStatus = "non_compliant";
  else if (score < 80) overallStatus = "partially_compliant";

  return {
    event_id: input.event_id,
    compliance_status: {
      overall_status: overallStatus,
      score,
      last_updated: now,
    },
    staffing_compliance: staffingCompliance,
    equipment_compliance: equipmentCompliance,
    risk_assessment: {
      current_risk_level: riskLevel,
      risk_factors: riskFactors,
    },
    incident_summary: incidentSummary,
    required_actions: requiredActions,
    safety_briefing: {
      key_points: [
        "비상구 위치 및 대피 경로 숙지",
        "응급 상황 발생 시 안전 담당자에게 즉시 보고",
        "소화기 및 AED 위치 확인",
        "개인 안전 장비 착용 필수",
        "무리한 작업 금지, 휴식 시간 준수",
      ],
      emergency_contacts: [
        { role: "안전 총괄", name: "안전 담당자", contact: "내선 911" },
        { role: "응급 의료", name: "의무실", contact: "내선 119" },
        { role: "화재 신고", name: "소방서", contact: "119" },
      ],
      evacuation_routes: [
        "주출입구 → 외부 집결지 A",
        "비상구 1 → 외부 집결지 B",
        "비상구 2 → 외부 집결지 C",
      ],
    },
    documentation: [
      { document: "안전 관리 계획서", status: "complete" as const },
      { document: "비상 대응 매뉴얼", status: "complete" as const },
      { document: "안전 교육 이수 명단", status: score >= 80 ? "complete" as const : "incomplete" as const },
      { document: "장비 점검 기록", status: equipmentCompliance.some((e) => e.status === "expired") ? "incomplete" as const : "complete" as const },
    ],
  };
}

export const HR_037_SafetyCompliance = {
  id: "HR-037",
  name: "Safety Compliance Monitor",
  description: "안전 규정 준수 모니터링",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.22",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_037_InputSchema,
  outputSchema: HR_037_OutputSchema,
  persona: `당신은 산업안전 전문가입니다. 법적 기준과 모범 사례에 따라 안전한 근무 환경을 보장합니다.`,
};

export default HR_037_SafetyCompliance;
