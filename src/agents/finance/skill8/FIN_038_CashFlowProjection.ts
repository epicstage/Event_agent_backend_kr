/**
 * FIN-038: 현금흐름 예측
 *
 * CMP-IS Reference: 8.1.h
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Cash Flow Projection.
CMP-IS Standard: 8.1.h - Projecting cash flow throughout the event lifecycle.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_date: z.string(),
  planning_start_date: z.string(),
  expected_inflows: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    expected_timing: z.string(),
    certainty: z.enum(["confirmed", "likely", "possible"]),
  })),
  expected_outflows: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    payment_timing: z.string(),
    is_deposit: z.boolean().optional(),
  })),
  starting_balance: z.number().default(0),
  credit_facility: z.number().optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  projection_id: z.string().uuid(),
  event_id: z.string().uuid(),
  monthly_cashflow: z.array(z.object({
    month: z.string(),
    opening_balance: z.number(),
    inflows: z.number(),
    outflows: z.number(),
    net_cashflow: z.number(),
    closing_balance: z.number(),
    inflow_details: z.array(z.object({
      source: z.string(),
      amount: z.number(),
    })),
    outflow_details: z.array(z.object({
      category: z.string(),
      amount: z.number(),
    })),
  })),
  cash_position_summary: z.object({
    peak_deficit: z.number(),
    peak_deficit_month: z.string(),
    peak_surplus: z.number(),
    peak_surplus_month: z.string(),
    average_balance: z.number(),
  }),
  funding_requirements: z.object({
    max_funding_needed: z.number(),
    funding_duration_months: z.number(),
    suggested_funding_sources: z.array(z.string()),
  }),
  risk_analysis: z.array(z.object({
    risk: z.string(),
    cash_impact: z.number(),
    mitigation: z.string(),
  })),
  recommendations: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  // Create 12-month projection
  const months = ["M-12", "M-10", "M-8", "M-6", "M-4", "M-3", "M-2", "M-1", "M-0", "M+1"];
  let balance = validated.starting_balance;

  const totalInflow = validated.expected_inflows.reduce((sum, i) => sum + i.amount, 0);
  const totalOutflow = validated.expected_outflows.reduce((sum, o) => sum + o.amount, 0);

  // Distribute flows across months (simplified model)
  const monthlyData = months.map((month, idx) => {
    const opening = balance;

    // Calculate inflows for this month
    const monthInflows: { source: string; amount: number }[] = [];
    let inflowTotal = 0;

    if (month === "M-6") {
      // Early bird registrations
      const earlyBird = totalInflow * 0.15;
      monthInflows.push({ source: "Early Bird 등록", amount: earlyBird });
      inflowTotal += earlyBird;
    } else if (month === "M-3") {
      // Regular registrations + some sponsorship
      const regular = totalInflow * 0.25;
      monthInflows.push({ source: "정규 등록", amount: regular * 0.6 });
      monthInflows.push({ source: "스폰서십", amount: regular * 0.4 });
      inflowTotal += regular;
    } else if (month === "M-1") {
      // Late registrations
      const late = totalInflow * 0.35;
      monthInflows.push({ source: "Late 등록", amount: late * 0.7 });
      monthInflows.push({ source: "전시 부스", amount: late * 0.3 });
      inflowTotal += late;
    } else if (month === "M-0") {
      // Final payments
      const final = totalInflow * 0.25;
      monthInflows.push({ source: "현장 등록", amount: final * 0.5 });
      monthInflows.push({ source: "기타 수익", amount: final * 0.5 });
      inflowTotal += final;
    }

    // Calculate outflows for this month
    const monthOutflows: { category: string; amount: number }[] = [];
    let outflowTotal = 0;

    if (month === "M-12") {
      // Deposits
      const deposits = totalOutflow * 0.15;
      monthOutflows.push({ category: "장소 계약금", amount: deposits * 0.7 });
      monthOutflows.push({ category: "AV 계약금", amount: deposits * 0.3 });
      outflowTotal += deposits;
    } else if (month === "M-6") {
      const mid = totalOutflow * 0.2;
      monthOutflows.push({ category: "마케팅", amount: mid * 0.6 });
      monthOutflows.push({ category: "연사 섭외", amount: mid * 0.4 });
      outflowTotal += mid;
    } else if (month === "M-2") {
      const prePay = totalOutflow * 0.25;
      monthOutflows.push({ category: "장소 잔금", amount: prePay * 0.4 });
      monthOutflows.push({ category: "케이터링", amount: prePay * 0.35 });
      monthOutflows.push({ category: "AV 장비", amount: prePay * 0.25 });
      outflowTotal += prePay;
    } else if (month === "M-1") {
      const final = totalOutflow * 0.25;
      monthOutflows.push({ category: "운영 비용", amount: final * 0.5 });
      monthOutflows.push({ category: "물류", amount: final * 0.3 });
      monthOutflows.push({ category: "스태프", amount: final * 0.2 });
      outflowTotal += final;
    } else if (month === "M-0") {
      const event = totalOutflow * 0.15;
      monthOutflows.push({ category: "현장 비용", amount: event });
      outflowTotal += event;
    }

    const net = inflowTotal - outflowTotal;
    balance = opening + net;

    return {
      month,
      opening_balance: Math.round(opening),
      inflows: Math.round(inflowTotal),
      outflows: Math.round(outflowTotal),
      net_cashflow: Math.round(net),
      closing_balance: Math.round(balance),
      inflow_details: monthInflows.map(i => ({ ...i, amount: Math.round(i.amount) })),
      outflow_details: monthOutflows.map(o => ({ ...o, amount: Math.round(o.amount) })),
    };
  });

  // Calculate summary
  const balances = monthlyData.map(m => m.closing_balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const avgBalance = balances.reduce((a, b) => a + b, 0) / balances.length;

  const output: Output = {
    projection_id: generateUUID(),
    event_id: validated.event_id,
    monthly_cashflow: monthlyData,
    cash_position_summary: {
      peak_deficit: minBalance < 0 ? Math.abs(minBalance) : 0,
      peak_deficit_month: monthlyData.find(m => m.closing_balance === minBalance)?.month || "N/A",
      peak_surplus: maxBalance,
      peak_surplus_month: monthlyData.find(m => m.closing_balance === maxBalance)?.month || "M-0",
      average_balance: Math.round(avgBalance),
    },
    funding_requirements: {
      max_funding_needed: minBalance < 0 ? Math.abs(minBalance) : 0,
      funding_duration_months: monthlyData.filter(m => m.closing_balance < 0).length,
      suggested_funding_sources: [
        "조직 운영 자금",
        "스폰서 조기 결제 요청",
        "단기 신용 한도",
        "등록 조기 마감 인센티브",
      ],
    },
    risk_analysis: [
      {
        risk: "스폰서 결제 지연",
        cash_impact: Math.round(totalInflow * 0.2),
        mitigation: "계약서 결제 조건 강화, 마일스톤 기반 청구",
      },
      {
        risk: "등록 저조",
        cash_impact: Math.round(totalInflow * 0.3),
        mitigation: "마케팅 강화, 얼리버드 연장",
      },
      {
        risk: "예상치 못한 비용",
        cash_impact: Math.round(totalOutflow * 0.1),
        mitigation: "예비비 확보, 승인 프로세스 강화",
      },
    ],
    recommendations: [
      "스폰서십 조기 계약으로 현금흐름 개선",
      "얼리버드 인센티브로 조기 등록 유도",
      "공급사 결제 조건 협상 (Net 30 → Net 60)",
      minBalance < 0 ? `최소 ${Math.abs(minBalance).toLocaleString()}원 운영 자금 확보 필요` : "현금흐름 양호",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-038",
  taskName: "현금흐름 예측",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.1.h",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
