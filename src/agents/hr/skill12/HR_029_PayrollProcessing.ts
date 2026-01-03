/**
 * HR-029: Payroll Processing
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 급여 정산 및 지급 처리
 */

import { z } from "zod";

export const HR_029_InputSchema = z.object({
  event_id: z.string().uuid(),
  payroll_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  staff_records: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    employment_type: z.enum(["full_time", "part_time", "contractor"]),
    hourly_rate: z.number(),
    hours_worked: z.number(),
    overtime_hours: z.number(),
    deductions: z.number().optional(),
    bonuses: z.number().optional(),
  })),
  tax_settings: z.object({
    withholding_rate: z.number().default(0.033),
    insurance_deduction: z.boolean().default(true),
  }),
});

export const HR_029_OutputSchema = z.object({
  event_id: z.string(),
  payroll_summary: z.object({
    period: z.string(),
    total_staff: z.number(),
    total_gross_pay: z.number(),
    total_deductions: z.number(),
    total_net_pay: z.number(),
    total_employer_cost: z.number(),
  }),
  individual_payslips: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    employment_type: z.string(),
    earnings: z.object({
      base_pay: z.number(),
      overtime_pay: z.number(),
      bonuses: z.number(),
      gross_pay: z.number(),
    }),
    deductions: z.object({
      income_tax: z.number(),
      insurance: z.number(),
      other: z.number(),
      total_deductions: z.number(),
    }),
    net_pay: z.number(),
  })),
  payment_schedule: z.object({
    payment_date: z.string(),
    payment_method: z.string(),
    batch_details: z.array(z.object({
      bank: z.string(),
      count: z.number(),
      total_amount: z.number(),
    })),
  }),
  compliance_report: z.object({
    minimum_wage_check: z.object({
      compliant_count: z.number(),
      violation_count: z.number(),
    }),
    tax_withholding: z.object({
      total_withheld: z.number(),
      reporting_deadline: z.string(),
    }),
    insurance_contributions: z.object({
      employee_portion: z.number(),
      employer_portion: z.number(),
    }),
  }),
  action_items: z.array(z.object({
    action: z.string(),
    deadline: z.string(),
    responsible: z.string(),
  })),
});

export type HR_029_Input = z.infer<typeof HR_029_InputSchema>;
export type HR_029_Output = z.infer<typeof HR_029_OutputSchema>;

const MINIMUM_WAGE = 9860;
const OVERTIME_MULTIPLIER = 1.5;

export async function execute(input: HR_029_Input): Promise<HR_029_Output> {
  const payslips = input.staff_records.map((staff) => {
    const basePay = staff.hourly_rate * staff.hours_worked;
    const overtimePay = Math.round(staff.hourly_rate * OVERTIME_MULTIPLIER * staff.overtime_hours);
    const bonuses = staff.bonuses || 0;
    const grossPay = basePay + overtimePay + bonuses;

    // 세금 계산 (프리랜서 3.3%, 직원 간이세액)
    const incomeTax = staff.employment_type === "contractor"
      ? Math.round(grossPay * input.tax_settings.withholding_rate)
      : Math.round(grossPay * 0.03);

    // 보험료 (4대보험 근로자 부담분 약 9%)
    const insurance = input.tax_settings.insurance_deduction && staff.employment_type !== "contractor"
      ? Math.round(grossPay * 0.09)
      : 0;

    const otherDeductions = staff.deductions || 0;
    const totalDeductions = incomeTax + insurance + otherDeductions;
    const netPay = grossPay - totalDeductions;

    return {
      staff_id: staff.staff_id,
      name: staff.name,
      employment_type: staff.employment_type,
      earnings: {
        base_pay: basePay,
        overtime_pay: overtimePay,
        bonuses,
        gross_pay: grossPay,
      },
      deductions: {
        income_tax: incomeTax,
        insurance,
        other: otherDeductions,
        total_deductions: totalDeductions,
      },
      net_pay: netPay,
    };
  });

  const totalGrossPay = payslips.reduce((sum, p) => sum + p.earnings.gross_pay, 0);
  const totalDeductions = payslips.reduce((sum, p) => sum + p.deductions.total_deductions, 0);
  const totalNetPay = payslips.reduce((sum, p) => sum + p.net_pay, 0);

  // 고용주 부담 (4대보험 사업주 부담분 약 10%)
  const employerInsurance = Math.round(
    payslips
      .filter((p) => p.employment_type !== "contractor")
      .reduce((sum, p) => sum + p.earnings.gross_pay * 0.1, 0)
  );
  const totalEmployerCost = totalGrossPay + employerInsurance;

  // 최저임금 체크
  const minWageViolations = input.staff_records.filter(
    (s) => s.hourly_rate < MINIMUM_WAGE
  ).length;

  return {
    event_id: input.event_id,
    payroll_summary: {
      period: `${input.payroll_period.start_date} ~ ${input.payroll_period.end_date}`,
      total_staff: input.staff_records.length,
      total_gross_pay: totalGrossPay,
      total_deductions: totalDeductions,
      total_net_pay: totalNetPay,
      total_employer_cost: totalEmployerCost,
    },
    individual_payslips: payslips,
    payment_schedule: {
      payment_date: "급여 지급일 (행사 종료 후 7일 이내)",
      payment_method: "계좌이체",
      batch_details: [
        { bank: "국민은행", count: Math.ceil(payslips.length * 0.3), total_amount: Math.round(totalNetPay * 0.3) },
        { bank: "신한은행", count: Math.ceil(payslips.length * 0.25), total_amount: Math.round(totalNetPay * 0.25) },
        { bank: "우리은행", count: Math.ceil(payslips.length * 0.2), total_amount: Math.round(totalNetPay * 0.2) },
        { bank: "기타", count: Math.ceil(payslips.length * 0.25), total_amount: Math.round(totalNetPay * 0.25) },
      ],
    },
    compliance_report: {
      minimum_wage_check: {
        compliant_count: input.staff_records.length - minWageViolations,
        violation_count: minWageViolations,
      },
      tax_withholding: {
        total_withheld: payslips.reduce((sum, p) => sum + p.deductions.income_tax, 0),
        reporting_deadline: "익월 10일",
      },
      insurance_contributions: {
        employee_portion: payslips.reduce((sum, p) => sum + p.deductions.insurance, 0),
        employer_portion: employerInsurance,
      },
    },
    action_items: [
      { action: "급여 명세서 개별 발송", deadline: "지급일 3일 전", responsible: "HR 담당" },
      { action: "계좌이체 배치 파일 생성", deadline: "지급일 2일 전", responsible: "회계팀" },
      { action: "이체 실행 및 확인", deadline: "지급일", responsible: "회계팀" },
      { action: "원천세 신고", deadline: "익월 10일", responsible: "회계팀" },
      { action: "4대보험 신고", deadline: "익월 15일", responsible: "HR 담당" },
    ],
  };
}

export const HR_029_PayrollProcessing = {
  id: "HR-029",
  name: "Payroll Processing",
  description: "급여 정산 및 지급 처리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.14",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_029_InputSchema,
  outputSchema: HR_029_OutputSchema,
  persona: `당신은 급여 담당자입니다. 정확한 급여 계산과 적법한 원천징수로 공정한 보상을 보장합니다.`,
};

export default HR_029_PayrollProcessing;
