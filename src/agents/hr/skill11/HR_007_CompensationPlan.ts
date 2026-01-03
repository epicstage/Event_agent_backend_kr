/**
 * HR-007: Compensation Planning
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 보상 체계 설계 및 인건비 계획
 */

import { z } from "zod";

export const HR_007_InputSchema = z.object({
  event_id: z.string().uuid(),
  positions: z.array(z.object({
    role: z.string(),
    count: z.number(),
    employment_type: z.enum(["full_time", "part_time", "contractor", "volunteer"]),
    skill_level: z.enum(["entry", "intermediate", "senior", "specialist"]),
    hours_per_day: z.number(),
    days: z.number(),
  })),
  location: z.string(),
  budget_constraint: z.number().optional(),
  include_benefits: z.boolean().default(true),
});

export const HR_007_OutputSchema = z.object({
  event_id: z.string(),
  compensation_plan: z.object({
    total_labor_cost: z.number(),
    positions: z.array(z.object({
      role: z.string(),
      count: z.number(),
      hourly_rate: z.number(),
      daily_rate: z.number(),
      total_per_person: z.number(),
      position_total: z.number(),
      benefits_cost: z.number(),
    })),
    summary: z.object({
      base_wages: z.number(),
      overtime_estimate: z.number(),
      benefits_total: z.number(),
      taxes_and_insurance: z.number(),
      contingency: z.number(),
    }),
  }),
  market_comparison: z.object({
    market_average: z.number(),
    our_position: z.enum(["below_market", "at_market", "above_market"]),
    competitiveness_score: z.number(),
  }),
  compliance_check: z.array(z.object({
    item: z.string(),
    status: z.enum(["compliant", "warning", "violation"]),
    note: z.string(),
  })),
  recommendations: z.array(z.string()),
});

export type HR_007_Input = z.infer<typeof HR_007_InputSchema>;
export type HR_007_Output = z.infer<typeof HR_007_OutputSchema>;

const BASE_RATES: Record<string, Record<string, number>> = {
  entry: { full_time: 10500, part_time: 11000, contractor: 15000 },
  intermediate: { full_time: 13000, part_time: 14000, contractor: 20000 },
  senior: { full_time: 18000, part_time: 19000, contractor: 30000 },
  specialist: { full_time: 25000, part_time: 27000, contractor: 45000 },
};

export async function execute(input: HR_007_Input): Promise<HR_007_Output> {
  const positions = input.positions.map((pos) => {
    const baseRate = BASE_RATES[pos.skill_level]?.[pos.employment_type] || 12000;
    const hourlyRate = pos.employment_type === "volunteer" ? 0 : baseRate;
    const dailyRate = hourlyRate * pos.hours_per_day;
    const totalPerPerson = dailyRate * pos.days;
    const benefitsCost = input.include_benefits && pos.employment_type !== "volunteer"
      ? Math.round(totalPerPerson * 0.15)
      : pos.employment_type === "volunteer" ? Math.round(pos.days * 30000) : 0;

    return {
      role: pos.role,
      count: pos.count,
      hourly_rate: hourlyRate,
      daily_rate: dailyRate,
      total_per_person: totalPerPerson,
      position_total: (totalPerPerson + benefitsCost) * pos.count,
      benefits_cost: benefitsCost * pos.count,
    };
  });

  const baseWages = positions.reduce((sum, p) => sum + (p.total_per_person * p.count), 0);
  const overtimeEstimate = Math.round(baseWages * 0.05);
  const benefitsTotal = positions.reduce((sum, p) => sum + p.benefits_cost, 0);
  const taxesAndInsurance = Math.round(baseWages * 0.1);
  const contingency = Math.round((baseWages + overtimeEstimate + benefitsTotal) * 0.05);
  const totalLaborCost = baseWages + overtimeEstimate + benefitsTotal + taxesAndInsurance + contingency;

  const marketAverage = positions.reduce((sum, p) => {
    const marketRate = BASE_RATES.intermediate[input.positions.find((i) => i.role === p.role)?.employment_type || "part_time"] || 14000;
    return sum + marketRate;
  }, 0) / positions.length;

  const ourAverage = positions.filter((p) => p.hourly_rate > 0).reduce((sum, p) => sum + p.hourly_rate, 0) /
    positions.filter((p) => p.hourly_rate > 0).length;

  return {
    event_id: input.event_id,
    compensation_plan: {
      total_labor_cost: totalLaborCost,
      positions,
      summary: {
        base_wages: baseWages,
        overtime_estimate: overtimeEstimate,
        benefits_total: benefitsTotal,
        taxes_and_insurance: taxesAndInsurance,
        contingency,
      },
    },
    market_comparison: {
      market_average: Math.round(marketAverage),
      our_position: ourAverage > marketAverage * 1.1 ? "above_market" : ourAverage < marketAverage * 0.9 ? "below_market" : "at_market",
      competitiveness_score: Math.min(100, Math.round((ourAverage / marketAverage) * 100)),
    },
    compliance_check: [
      { item: "최저임금 준수", status: positions.every((p) => p.hourly_rate >= 9860 || p.hourly_rate === 0) ? "compliant" : "violation", note: "2024년 최저임금 9,860원 기준" },
      { item: "주휴수당 적용", status: "compliant", note: "주 15시간 이상 근무자 대상 반영" },
      { item: "4대보험", status: input.include_benefits ? "compliant" : "warning", note: "1개월 이상 고용 시 필수" },
      { item: "야간/휴일 수당", status: "compliant", note: "해당 시 1.5배 적용" },
    ],
    recommendations: [
      `총 인건비 예상: ${totalLaborCost.toLocaleString()}원`,
      ourAverage < marketAverage * 0.9 ? "시장 평균 대비 낮은 급여로 인력 확보 어려움 가능" : "급여 수준 적정",
      "성과급 또는 인센티브 제도 도입 검토",
      "우수 인력 확보를 위한 조기 채용 권장",
    ],
  };
}

export const HR_007_CompensationPlan = {
  id: "HR-007",
  name: "Compensation Planning",
  description: "보상 체계 설계 및 인건비 계획",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.7",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_007_InputSchema,
  outputSchema: HR_007_OutputSchema,
  persona: `당신은 보상 및 급여 전문가입니다. 공정한 보상 체계와 노무 컴플라이언스를 동시에 관리합니다.`,
};

export default HR_007_CompensationPlan;
