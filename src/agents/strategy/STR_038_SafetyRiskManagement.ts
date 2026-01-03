/**
 * STR-038: 안전 리스크 관리
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Safety Risk Management)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Safety Risk Management Agent for event planning.

Your expertise includes:
- Safety hazard identification
- Safety protocol development
- Emergency response planning
- Regulatory compliance for safety

CMP-IS Standard: Domain A - Strategic Planning (Safety Risk Management)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  venue_details: z.object({
    venue_type: z.enum(["indoor", "outdoor", "hybrid", "virtual"]),
    capacity: z.number(),
    floors: z.number().optional(),
    special_features: z.array(z.string()).optional(),
  }),
  event_activities: z.array(z.object({
    activity: z.string(),
    risk_level: z.enum(["low", "medium", "high"]).optional(),
    special_equipment: z.array(z.string()).optional(),
  })),
  attendee_profile: z.object({
    expected_count: z.number(),
    includes_children: z.boolean().optional(),
    includes_elderly: z.boolean().optional(),
    includes_disabled: z.boolean().optional(),
    vip_attendees: z.boolean().optional(),
  }),
  duration: z.object({
    hours: z.number(),
    overnight: z.boolean().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  safety_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  safety_assessment: z.object({
    overall_risk_level: z.enum(["low", "medium", "high", "very_high"]),
    key_safety_concerns: z.array(z.string()),
    regulatory_requirements: z.array(z.string()),
  }),
  hazard_identification: z.array(z.object({
    hazard_id: z.string(),
    hazard: z.string(),
    category: z.enum(["fire", "crowd", "structural", "electrical", "weather", "health", "security", "activity_specific"]),
    location: z.string(),
    potential_harm: z.string(),
    affected_persons: z.array(z.string()),
    likelihood: z.enum(["rare", "unlikely", "possible", "likely", "almost_certain"]),
    severity: z.enum(["negligible", "minor", "moderate", "major", "catastrophic"]),
    risk_rating: z.enum(["low", "medium", "high", "extreme"]),
  })),
  control_measures: z.array(z.object({
    hazard_id: z.string(),
    control_type: z.enum(["elimination", "substitution", "engineering", "administrative", "ppe"]),
    measure: z.string(),
    responsible: z.string(),
    verification_method: z.string(),
    residual_risk: z.enum(["low", "medium", "high"]),
  })),
  emergency_procedures: z.object({
    evacuation_plan: z.object({
      primary_routes: z.array(z.string()),
      assembly_points: z.array(z.string()),
      sweep_teams: z.array(z.string()),
      special_needs_procedures: z.array(z.string()),
    }),
    medical_emergency: z.object({
      first_aid_locations: z.array(z.string()),
      medical_team: z.array(z.string()),
      hospital_contacts: z.array(z.string()),
      aed_locations: z.array(z.string()),
    }),
    fire_emergency: z.object({
      fire_equipment_locations: z.array(z.string()),
      fire_wardens: z.array(z.string()),
      fire_brigade_contact: z.string(),
    }),
    security_incident: z.object({
      security_team_contact: z.string(),
      police_contact: z.string(),
      lockdown_procedure: z.array(z.string()),
    }),
  }),
  safety_staffing: z.object({
    required_personnel: z.array(z.object({
      role: z.string(),
      count: z.number(),
      qualifications: z.array(z.string()),
      positioning: z.string(),
    })),
    training_requirements: z.array(z.object({
      training: z.string(),
      participants: z.array(z.string()),
      timing: z.string(),
    })),
  }),
  safety_checklist: z.array(z.object({
    phase: z.string(),
    items: z.array(z.object({
      item: z.string(),
      responsible: z.string(),
      completed: z.boolean(),
    })),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-038",
  taskName: "Safety Risk Management",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "이벤트 안전 리스크를 식별하고 관리 계획을 수립합니다.",
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

type HazardCategory = "fire" | "crowd" | "structural" | "electrical" | "weather" | "health" | "security" | "activity_specific";
type Likelihood = "rare" | "unlikely" | "possible" | "likely" | "almost_certain";
type Severity = "negligible" | "minor" | "moderate" | "major" | "catastrophic";
type RiskRating = "low" | "medium" | "high" | "extreme";

function calculateRiskRating(likelihood: Likelihood, severity: Severity): RiskRating {
  const lScore = { rare: 1, unlikely: 2, possible: 3, likely: 4, almost_certain: 5 }[likelihood];
  const sScore = { negligible: 1, minor: 2, moderate: 3, major: 4, catastrophic: 5 }[severity];
  const total = lScore * sScore;
  if (total <= 4) return "low";
  if (total <= 9) return "medium";
  if (total <= 16) return "high";
  return "extreme";
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { venue_details, event_activities, attendee_profile } = validated;

  const isOutdoor = venue_details.venue_type === "outdoor" || venue_details.venue_type === "hybrid";
  const isLarge = attendee_profile.expected_count > 500;
  const hasHighRiskActivities = event_activities.some(a => a.risk_level === "high");
  const hasVulnerableGroups = attendee_profile.includes_children || attendee_profile.includes_elderly || attendee_profile.includes_disabled;

  const overallRisk = (hasHighRiskActivities && isLarge) ? "very_high" as const :
    (hasHighRiskActivities || isLarge) ? "high" as const :
    isOutdoor ? "medium" as const : "low" as const;

  // Generate hazards
  const hazards: Output["hazard_identification"] = [];
  let hazardCounter = 1;

  const addHazard = (hazard: string, category: HazardCategory, location: string, harm: string, affected: string[], likelihood: Likelihood, severity: Severity) => {
    hazards.push({
      hazard_id: `HAZ-${String(hazardCounter++).padStart(3, "0")}`,
      hazard,
      category,
      location,
      potential_harm: harm,
      affected_persons: affected,
      likelihood,
      severity,
      risk_rating: calculateRiskRating(likelihood, severity),
    });
  };

  // Standard hazards
  addHazard("화재 발생", "fire", "전 구역", "화상, 질식, 사망", ["참가자", "스태프"], "unlikely", "catastrophic");
  addHazard("군중 밀집/압사", "crowd", "입구, 무대 앞", "부상, 질식, 사망", ["참가자"], isLarge ? "possible" : "unlikely", "major");
  addHazard("전기 사고", "electrical", "무대, 장비 구역", "감전, 화재", ["스태프", "참가자"], "unlikely", "major");

  if (isOutdoor) {
    addHazard("기상 악화 (폭우, 낙뢰)", "weather", "야외 구역", "낙뢰, 미끄러짐, 저체온", ["참가자", "스태프"], "possible", "major");
    addHazard("구조물 붕괴 (텐트, 무대)", "structural", "임시 구조물", "부상, 사망", ["참가자", "스태프"], "unlikely", "catastrophic");
  }

  if (hasVulnerableGroups) {
    addHazard("취약계층 안전 사고", "health", "전 구역", "부상, 건강 악화", ["어린이", "노인", "장애인"], "possible", "moderate");
  }

  // Activity-specific hazards
  event_activities.filter(a => a.risk_level === "high").forEach(activity => {
    addHazard(`${activity.activity} 관련 사고`, "activity_specific", "해당 활동 구역", "부상", ["참가자"], "possible", "moderate");
  });

  // Control measures
  const controls = hazards.map(h => ({
    hazard_id: h.hazard_id,
    control_type: h.category === "fire" ? "engineering" as const :
      h.category === "crowd" ? "administrative" as const : "engineering" as const,
    measure: h.category === "fire" ? "소화 설비 설치 및 점검, 비상구 확보" :
      h.category === "crowd" ? "입장 통제, 구역 분리, 안전 요원 배치" :
      h.category === "electrical" ? "정기 점검, 접지, 누전 차단기" :
      h.category === "weather" ? "기상 모니터링, 대피 계획, 방수 시설" :
      "안전 수칙 수립 및 교육",
    responsible: "안전 담당자",
    verification_method: "현장 점검 및 체크리스트",
    residual_risk: "low" as const,
  }));

  // Safety staffing calculation
  const securityRatio = isLarge ? 50 : 100; // 1 per 50 or 100 attendees
  const medicalRatio = 250; // 1 per 250 attendees
  const securityCount = Math.ceil(attendee_profile.expected_count / securityRatio);
  const medicalCount = Math.max(2, Math.ceil(attendee_profile.expected_count / medicalRatio));

  return {
    safety_plan_id: generateUUID(),
    event_id: validated.event_id,
    safety_assessment: {
      overall_risk_level: overallRisk,
      key_safety_concerns: hazards.filter(h => h.risk_rating === "high" || h.risk_rating === "extreme").map(h => h.hazard),
      regulatory_requirements: [
        "공연법 및 안전 관리 규정 준수",
        "소방법 및 소방 시설 기준 준수",
        "다중이용시설 안전관리법 준수",
        isLarge ? "대규모 집회 안전 신고" : "",
      ].filter(Boolean),
    },
    hazard_identification: hazards,
    control_measures: controls,
    emergency_procedures: {
      evacuation_plan: {
        primary_routes: ["메인 출구", "비상구 A", "비상구 B"],
        assembly_points: ["주차장", "인근 공원"],
        sweep_teams: ["안전팀 A (1층)", "안전팀 B (2층)"],
        special_needs_procedures: ["휠체어 이용자 전용 대피로", "시각/청각 장애인 동행 대피"],
      },
      medical_emergency: {
        first_aid_locations: ["메인 홀 의무실", "야외 구역 의무실"],
        medical_team: ["응급 의료팀", "현장 간호사"],
        hospital_contacts: ["인근 종합병원 응급실"],
        aed_locations: ["입구", "메인 홀", "야외 구역"],
      },
      fire_emergency: {
        fire_equipment_locations: ["각 층 복도", "주방", "무대 옆"],
        fire_wardens: ["층별 화재 대피 요원"],
        fire_brigade_contact: "119",
      },
      security_incident: {
        security_team_contact: "보안팀 핫라인",
        police_contact: "112",
        lockdown_procedure: ["입구 폐쇄", "참가자 대기 안내", "상황 전파"],
      },
    },
    safety_staffing: {
      required_personnel: [
        { role: "안전 관리자", count: 1, qualifications: ["안전관리 자격증"], positioning: "통제실" },
        { role: "보안 요원", count: securityCount, qualifications: ["경비업 자격"], positioning: "입구, 주요 구역" },
        { role: "응급 의료진", count: medicalCount, qualifications: ["응급처치 자격", "간호사"], positioning: "의무실" },
        { role: "화재 대피 요원", count: Math.ceil(venue_details.floors || 1) * 2, qualifications: ["소방 교육 이수"], positioning: "각 층" },
      ],
      training_requirements: [
        { training: "비상 대피 훈련", participants: ["전체 스태프"], timing: "이벤트 1주일 전" },
        { training: "응급처치 교육", participants: ["핵심 스태프"], timing: "이벤트 2주일 전" },
        { training: "화재 대응 교육", participants: ["화재 대피 요원"], timing: "이벤트 1주일 전" },
      ],
    },
    safety_checklist: [
      {
        phase: "사전 준비",
        items: [
          { item: "소방 시설 점검", responsible: "시설팀", completed: false },
          { item: "비상구 확보 확인", responsible: "안전팀", completed: false },
          { item: "의료 물품 준비", responsible: "의료팀", completed: false },
          { item: "안전 브리핑", responsible: "안전 관리자", completed: false },
        ],
      },
      {
        phase: "당일 점검",
        items: [
          { item: "입장 통제 시스템 확인", responsible: "보안팀", completed: false },
          { item: "응급 장비 작동 확인", responsible: "의료팀", completed: false },
          { item: "통신 장비 테스트", responsible: "안전팀", completed: false },
        ],
      },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
