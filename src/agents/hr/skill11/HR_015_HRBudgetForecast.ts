/**
 * HR-015: HR Budget Forecast
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 인건비 예산 예측 및 재정 계획
 */

import { z } from "zod";

export const HR_015_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_dates: z.array(z.string()),
  staffing_plan: z.array(z.object({
    role: z.string(),
    count: z.number(),
    employment_type: z.enum(["full_time", "part_time", "contractor", "volunteer"]),
    hourly_rate: z.number(),
    hours_per_day: z.number(),
  })),
  include_benefits: z.boolean().default(true),
  include_training: z.boolean().default(true),
  include_uniforms: z.boolean().default(true),
  contingency_rate: z.number().default(0.1),
});

export const HR_015_OutputSchema = z.object({
  event_id: z.string(),
  budget_summary: z.object({
    total_labor_cost: z.number(),
    total_support_costs: z.number(),
    contingency: z.number(),
    grand_total: z.number(),
    per_day_cost: z.number(),
    per_staff_cost: z.number(),
  }),
  labor_breakdown: z.object({
    by_employment_type: z.array(z.object({
      type: z.string(),
      headcount: z.number(),
      base_wages: z.number(),
      overtime_estimate: z.number(),
      benefits: z.number(),
      subtotal: z.number(),
    })),
    by_role: z.array(z.object({
      role: z.string(),
      headcount: z.number(),
      total_cost: z.number(),
      percentage: z.number(),
    })),
    by_day: z.array(z.object({
      date: z.string(),
      labor_cost: z.number(),
      staff_count: z.number(),
    })),
  }),
  support_costs: z.object({
    training: z.object({
      materials: z.number(),
      venue: z.number(),
      trainer_fees: z.number(),
      total: z.number(),
    }),
    uniforms_equipment: z.object({
      uniforms: z.number(),
      id_badges: z.number(),
      equipment: z.number(),
      total: z.number(),
    }),
    operations: z.object({
      meals: z.number(),
      transport: z.number(),
      communication: z.number(),
      total: z.number(),
    }),
  }),
  cash_flow_projection: z.array(z.object({
    phase: z.string(),
    timing: z.string(),
    amount: z.number(),
    description: z.string(),
  })),
  cost_optimization: z.array(z.object({
    recommendation: z.string(),
    potential_savings: z.number(),
    trade_off: z.string(),
  })),
  comparison: z.object({
    industry_benchmark: z.number(),
    our_cost_per_attendee: z.number(),
    status: z.enum(["below_benchmark", "at_benchmark", "above_benchmark"]),
  }),
});

export type HR_015_Input = z.infer<typeof HR_015_InputSchema>;
export type HR_015_Output = z.infer<typeof HR_015_OutputSchema>;

export async function execute(input: HR_015_Input): Promise<HR_015_Output> {
  const eventDays = input.event_dates.length;
  const totalStaff = input.staffing_plan.reduce((sum, s) => sum + s.count, 0);

  // 고용 유형별 계산
  const byEmploymentType = ["full_time", "part_time", "contractor", "volunteer"].map((type) => {
    const staffOfType = input.staffing_plan.filter((s) => s.employment_type === type);
    const headcount = staffOfType.reduce((sum, s) => sum + s.count, 0);
    const baseWages = staffOfType.reduce((sum, s) => {
      return sum + (s.hourly_rate * s.hours_per_day * eventDays * s.count);
    }, 0);
    const overtimeEstimate = type === "volunteer" ? 0 : Math.round(baseWages * 0.05);
    const benefits = type === "volunteer"
      ? headcount * eventDays * 30000 // 봉사자 간식/교통비
      : input.include_benefits ? Math.round(baseWages * 0.15) : 0;

    return {
      type: getEmploymentTypeLabel(type),
      headcount,
      base_wages: baseWages,
      overtime_estimate: overtimeEstimate,
      benefits,
      subtotal: baseWages + overtimeEstimate + benefits,
    };
  }).filter((t) => t.headcount > 0);

  // 역할별 계산
  const totalLaborCost = byEmploymentType.reduce((sum, t) => sum + t.subtotal, 0);
  const byRole = input.staffing_plan.map((s) => {
    const roleCost = s.hourly_rate * s.hours_per_day * eventDays * s.count;
    const withBenefits = s.employment_type === "volunteer"
      ? roleCost + (s.count * eventDays * 30000)
      : roleCost * (input.include_benefits ? 1.2 : 1.05);
    return {
      role: s.role,
      headcount: s.count,
      total_cost: Math.round(withBenefits),
      percentage: Math.round((withBenefits / totalLaborCost) * 100),
    };
  });

  // 일별 계산
  const avgDailyCost = Math.round(totalLaborCost / eventDays);
  const byDay = input.event_dates.map((date, idx) => ({
    date,
    labor_cost: avgDailyCost + (idx === 0 || idx === eventDays - 1 ? Math.round(avgDailyCost * 0.1) : 0),
    staff_count: totalStaff,
  }));

  // 지원 비용
  const trainingCosts = input.include_training ? {
    materials: totalStaff * 5000,
    venue: eventDays > 1 ? 500000 : 0,
    trainer_fees: 300000,
    total: totalStaff * 5000 + (eventDays > 1 ? 500000 : 0) + 300000,
  } : { materials: 0, venue: 0, trainer_fees: 0, total: 0 };

  const uniformCosts = input.include_uniforms ? {
    uniforms: totalStaff * 20000,
    id_badges: totalStaff * 3000,
    equipment: totalStaff * 5000,
    total: totalStaff * 28000,
  } : { uniforms: 0, id_badges: 0, equipment: 0, total: 0 };

  const operationsCosts = {
    meals: totalStaff * eventDays * 12000,
    transport: Math.round(totalStaff * 0.5 * eventDays * 10000),
    communication: Math.ceil(totalStaff * 0.15) * 150000,
    total: 0,
  };
  operationsCosts.total = operationsCosts.meals + operationsCosts.transport + operationsCosts.communication;

  const totalSupportCosts = trainingCosts.total + uniformCosts.total + operationsCosts.total;
  const contingency = Math.round((totalLaborCost + totalSupportCosts) * input.contingency_rate);
  const grandTotal = totalLaborCost + totalSupportCosts + contingency;

  // 현금 흐름 예측
  const cashFlow = [
    {
      phase: "사전 준비",
      timing: "D-30",
      amount: Math.round(grandTotal * 0.1),
      description: "교육비, 유니폼 선급금, 인력 파견 계약금",
    },
    {
      phase: "온보딩 기간",
      timing: "D-7 ~ D-1",
      amount: Math.round(grandTotal * 0.15),
      description: "교육 참가비, 유니폼/장비 잔금",
    },
    {
      phase: "행사 기간",
      timing: "D-Day",
      amount: Math.round(grandTotal * 0.5),
      description: "일일 급여, 식대, 교통비",
    },
    {
      phase: "행사 후 정산",
      timing: "D+7",
      amount: Math.round(grandTotal * 0.25),
      description: "최종 급여 정산, 성과금, 미지급분",
    },
  ];

  // 비용 최적화 제안
  const optimizations = [
    {
      recommendation: "봉사자 비율 10% 증가",
      potential_savings: Math.round(totalLaborCost * 0.05),
      trade_off: "서비스 품질 모니터링 강화 필요",
    },
    {
      recommendation: "파트타임 인력 활용 확대",
      potential_savings: Math.round(totalLaborCost * 0.03),
      trade_off: "교육 및 관리 복잡도 증가",
    },
    {
      recommendation: "기존 인력풀 우선 채용",
      potential_savings: Math.round(trainingCosts.total * 0.3),
      trade_off: "신규 인력 다양성 감소",
    },
    {
      recommendation: "교육 온라인 전환",
      potential_savings: trainingCosts.venue,
      trade_off: "대면 교육 효과 감소 가능",
    },
  ];

  // 벤치마크 비교 (행사 규모에 따른 추정)
  const industryBenchmark = 8500; // 스태프 1인당 평균 비용
  const ourCostPerStaff = Math.round(grandTotal / totalStaff);

  return {
    event_id: input.event_id,
    budget_summary: {
      total_labor_cost: totalLaborCost,
      total_support_costs: totalSupportCosts,
      contingency,
      grand_total: grandTotal,
      per_day_cost: Math.round(grandTotal / eventDays),
      per_staff_cost: ourCostPerStaff,
    },
    labor_breakdown: {
      by_employment_type: byEmploymentType,
      by_role: byRole,
      by_day: byDay,
    },
    support_costs: {
      training: trainingCosts,
      uniforms_equipment: uniformCosts,
      operations: operationsCosts,
    },
    cash_flow_projection: cashFlow,
    cost_optimization: optimizations,
    comparison: {
      industry_benchmark: industryBenchmark,
      our_cost_per_attendee: ourCostPerStaff,
      status: ourCostPerStaff > industryBenchmark * 1.1
        ? "above_benchmark"
        : ourCostPerStaff < industryBenchmark * 0.9
          ? "below_benchmark"
          : "at_benchmark",
    },
  };
}

function getEmploymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    full_time: "정규직",
    part_time: "파트타임",
    contractor: "프리랜서/용역",
    volunteer: "봉사자",
  };
  return labels[type] || type;
}

export const HR_015_HRBudgetForecast = {
  id: "HR-015",
  name: "HR Budget Forecast",
  description: "인건비 예산 예측 및 재정 계획",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.15",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_015_InputSchema,
  outputSchema: HR_015_OutputSchema,
  persona: `당신은 HR 재무 분석가입니다. 인건비 예산을 정확히 예측하고 비용 효율성을 분석하여 최적의 HR 투자 결정을 지원합니다.`,
};

export default HR_015_HRBudgetForecast;
