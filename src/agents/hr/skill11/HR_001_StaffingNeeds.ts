/**
 * HR-001: Staffing Needs Assessment
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 이벤트 규모와 유형에 따른 인력 수요 분석 및 예측
 */

import { z } from "zod";

export const HR_001_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.enum(["conference", "exhibition", "festival", "concert", "corporate", "wedding", "sports", "hybrid"]),
  expected_attendees: z.number().min(1),
  event_duration_days: z.number().min(1),
  venue_size_sqm: z.number().optional(),
  service_level: z.enum(["basic", "standard", "premium", "luxury"]).default("standard"),
  special_requirements: z.array(z.string()).optional(),
});

export const HR_001_OutputSchema = z.object({
  event_id: z.string(),
  staffing_analysis: z.object({
    total_staff_needed: z.number(),
    total_person_days: z.number(),
    departments: z.array(z.object({
      department: z.string(),
      role: z.string(),
      count: z.number(),
      shift_coverage: z.string(),
      skills_required: z.array(z.string()),
      priority: z.enum(["critical", "high", "medium", "low"]),
    })),
  }),
  staffing_mix: z.object({
    full_time_recommended: z.number(),
    part_time_recommended: z.number(),
    volunteers_recommended: z.number(),
    contractors_recommended: z.number(),
  }),
  timeline: z.object({
    recruitment_start: z.string(),
    training_start: z.string(),
    final_confirmation: z.string(),
  }),
  budget_estimate: z.object({
    total_labor_cost: z.number(),
    breakdown: z.record(z.number()),
  }),
  risk_factors: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type HR_001_Input = z.infer<typeof HR_001_InputSchema>;
export type HR_001_Output = z.infer<typeof HR_001_OutputSchema>;

// Staffing ratios per attendee by service level
const STAFFING_RATIOS = {
  basic: { registration: 100, security: 150, catering: 80, cleaning: 200 },
  standard: { registration: 75, security: 100, catering: 60, cleaning: 150 },
  premium: { registration: 50, security: 75, catering: 40, cleaning: 100 },
  luxury: { registration: 30, security: 50, catering: 25, cleaning: 75 },
};

export async function execute(input: HR_001_Input): Promise<HR_001_Output> {
  const serviceLevel = input.service_level || "standard";
  const ratios = STAFFING_RATIOS[serviceLevel] || STAFFING_RATIOS.standard;
  const attendees = input.expected_attendees;
  const days = input.event_duration_days;

  // Calculate department staffing
  const departments = [
    {
      department: "registration",
      role: "Registration Staff",
      count: Math.ceil(attendees / ratios.registration),
      shift_coverage: "peak hours + setup/teardown",
      skills_required: ["customer_service", "data_entry", "multilingual"],
      priority: "critical" as const,
    },
    {
      department: "security",
      role: "Security Personnel",
      count: Math.ceil(attendees / ratios.security),
      shift_coverage: "full event + overnight",
      skills_required: ["security_license", "crowd_control", "first_aid"],
      priority: "critical" as const,
    },
    {
      department: "catering",
      role: "F&B Staff",
      count: Math.ceil(attendees / ratios.catering),
      shift_coverage: "meal times + breaks",
      skills_required: ["food_handler_cert", "customer_service"],
      priority: "high" as const,
    },
    {
      department: "cleaning",
      role: "Housekeeping",
      count: Math.ceil(attendees / ratios.cleaning),
      shift_coverage: "continuous + after hours",
      skills_required: ["cleaning_protocols"],
      priority: "medium" as const,
    },
    {
      department: "av_tech",
      role: "AV Technician",
      count: Math.ceil(attendees / 500) + 2,
      shift_coverage: "sessions + rehearsals",
      skills_required: ["av_equipment", "live_streaming", "troubleshooting"],
      priority: "high" as const,
    },
    {
      department: "information",
      role: "Information Desk",
      count: Math.ceil(attendees / 200),
      shift_coverage: "event hours",
      skills_required: ["customer_service", "multilingual", "local_knowledge"],
      priority: "medium" as const,
    },
    {
      department: "vip_services",
      role: "VIP Liaison",
      count: input.service_level === "luxury" ? Math.ceil(attendees * 0.1) : Math.ceil(attendees * 0.02),
      shift_coverage: "vip arrival to departure",
      skills_required: ["hospitality", "discretion", "problem_solving"],
      priority: input.service_level === "luxury" ? "critical" as const : "medium" as const,
    },
    {
      department: "logistics",
      role: "Logistics Coordinator",
      count: Math.ceil(input.venue_size_sqm ? input.venue_size_sqm / 2000 : attendees / 300) + 2,
      shift_coverage: "setup + event + teardown",
      skills_required: ["logistics", "forklift_license", "inventory_management"],
      priority: "high" as const,
    },
  ];

  const totalStaff = departments.reduce((sum, d) => sum + d.count, 0);
  const totalPersonDays = totalStaff * days * 1.2; // 20% buffer for shift coverage

  // Staffing mix recommendation
  const staffingMix = {
    full_time_recommended: Math.ceil(totalStaff * 0.15),
    part_time_recommended: Math.ceil(totalStaff * 0.35),
    volunteers_recommended: Math.ceil(totalStaff * 0.25),
    contractors_recommended: Math.ceil(totalStaff * 0.25),
  };

  // Timeline calculation
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 60);

  const timeline = {
    recruitment_start: new Date(eventDate.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    training_start: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    final_confirmation: new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  };

  // Budget estimate
  const hourlyRates: Record<string, number> = {
    registration: 12000,
    security: 15000,
    catering: 11000,
    cleaning: 10000,
    av_tech: 25000,
    information: 12000,
    vip_services: 18000,
    logistics: 14000,
  };

  const breakdown: Record<string, number> = {};
  let totalLaborCost = 0;
  departments.forEach((dept) => {
    const rate = hourlyRates[dept.department] || 12000;
    const cost = dept.count * 8 * days * rate; // 8 hours per day
    breakdown[dept.department] = cost;
    totalLaborCost += cost;
  });

  return {
    event_id: input.event_id,
    staffing_analysis: {
      total_staff_needed: totalStaff,
      total_person_days: Math.ceil(totalPersonDays),
      departments,
    },
    staffing_mix: staffingMix,
    timeline,
    budget_estimate: {
      total_labor_cost: totalLaborCost,
      breakdown,
    },
    risk_factors: [
      attendees > 5000 ? "대규모 행사로 인력 확보 경쟁 예상" : null,
      days > 3 ? "장기 행사로 인한 스태프 피로도 관리 필요" : null,
      input.service_level === "luxury" ? "고급 서비스 수준에 맞는 경험자 확보 필요" : null,
      "성수기 시즌 인력 확보 어려움 가능성",
    ].filter(Boolean) as string[],
    recommendations: [
      "조기 채용 시작으로 우수 인력 선점",
      "인력 풀 데이터베이스 활용한 재고용 우선 진행",
      "백업 인력 20% 추가 확보 권장",
      `총 예상 인건비: ${totalLaborCost.toLocaleString()}원`,
    ],
  };
}

export const HR_001_StaffingNeeds = {
  id: "HR-001",
  name: "Staffing Needs Assessment",
  description: "이벤트 규모와 유형에 따른 인력 수요 분석 및 예측",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.1",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_001_InputSchema,
  outputSchema: HR_001_OutputSchema,
  persona: `당신은 20년 경력의 이벤트 인력 관리 전문가입니다.
다양한 규모와 유형의 이벤트에서 최적의 인력 배치를 설계해왔습니다.
인력 수요 예측, 비용 효율화, 서비스 품질 균형을 중시합니다.`,
};

export default HR_001_StaffingNeeds;
