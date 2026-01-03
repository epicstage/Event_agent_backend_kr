/**
 * FIN-037: 손익분기점 분석
 *
 * CMP-IS Reference: 8.1.g
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Break-Even Analysis.
CMP-IS Standard: 8.1.g - Calculating and analyzing break-even points.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  fixed_costs: z.array(z.object({
    category: z.string(),
    amount: z.number(),
  })),
  variable_costs_per_attendee: z.array(z.object({
    category: z.string(),
    amount: z.number(),
  })),
  revenue_per_attendee: z.object({
    avg_ticket_price: z.number(),
    ancillary_revenue: z.number().optional(),
  }),
  sponsorship_revenue: z.number().optional(),
  target_profit_margin: z.number().optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid(),
  event_id: z.string().uuid(),
  cost_structure: z.object({
    total_fixed_costs: z.number(),
    variable_cost_per_attendee: z.number(),
    fixed_cost_breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number(),
      percentage: z.number(),
    })),
  }),
  break_even_analysis: z.object({
    break_even_attendees: z.number().int(),
    break_even_revenue: z.number(),
    contribution_margin_per_attendee: z.number(),
    contribution_margin_ratio: z.number(),
  }),
  profit_scenarios: z.array(z.object({
    attendees: z.number().int(),
    revenue: z.number(),
    total_costs: z.number(),
    profit_loss: z.number(),
    margin_percentage: z.number(),
  })),
  target_achievement: z.object({
    target_profit: z.number(),
    required_attendees: z.number().int(),
    required_revenue: z.number(),
  }).optional(),
  sensitivity_analysis: z.array(z.object({
    scenario: z.string(),
    break_even_change: z.number().int(),
    impact_description: z.string(),
  })),
  recommendations: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalFixed = validated.fixed_costs.reduce((sum, c) => sum + c.amount, 0);
  const variablePerAttendee = validated.variable_costs_per_attendee.reduce((sum, c) => sum + c.amount, 0);

  const revenuePerAttendee = validated.revenue_per_attendee.avg_ticket_price +
    (validated.revenue_per_attendee.ancillary_revenue || 0);
  const sponsorship = validated.sponsorship_revenue || 0;

  const contributionMargin = revenuePerAttendee - variablePerAttendee;
  const breakEvenAttendees = Math.ceil((totalFixed - sponsorship) / contributionMargin);
  const breakEvenRevenue = breakEvenAttendees * revenuePerAttendee + sponsorship;

  const fixedBreakdown = validated.fixed_costs.map(c => ({
    category: c.category,
    amount: c.amount,
    percentage: Math.round((c.amount / totalFixed) * 100 * 10) / 10,
  }));

  // Profit scenarios
  const scenarios = [0.5, 0.75, 1, 1.25, 1.5].map(multiplier => {
    const attendees = Math.round(breakEvenAttendees * multiplier);
    const revenue = attendees * revenuePerAttendee + sponsorship;
    const totalCosts = totalFixed + (attendees * variablePerAttendee);
    const profitLoss = revenue - totalCosts;
    return {
      attendees,
      revenue: Math.round(revenue),
      total_costs: Math.round(totalCosts),
      profit_loss: Math.round(profitLoss),
      margin_percentage: Math.round((profitLoss / revenue) * 100 * 10) / 10,
    };
  });

  // Target profit calculation
  let targetAchievement;
  if (validated.target_profit_margin) {
    const targetProfit = totalFixed * (validated.target_profit_margin / 100);
    const requiredContribution = totalFixed + targetProfit - sponsorship;
    const requiredAttendees = Math.ceil(requiredContribution / contributionMargin);
    targetAchievement = {
      target_profit: Math.round(targetProfit),
      required_attendees: requiredAttendees,
      required_revenue: Math.round(requiredAttendees * revenuePerAttendee + sponsorship),
    };
  }

  const output: Output = {
    analysis_id: generateUUID(),
    event_id: validated.event_id,
    cost_structure: {
      total_fixed_costs: totalFixed,
      variable_cost_per_attendee: variablePerAttendee,
      fixed_cost_breakdown: fixedBreakdown,
    },
    break_even_analysis: {
      break_even_attendees: breakEvenAttendees,
      break_even_revenue: Math.round(breakEvenRevenue),
      contribution_margin_per_attendee: Math.round(contributionMargin * 100) / 100,
      contribution_margin_ratio: Math.round((contributionMargin / revenuePerAttendee) * 100 * 10) / 10,
    },
    profit_scenarios: scenarios,
    target_achievement: targetAchievement,
    sensitivity_analysis: [
      {
        scenario: "고정비 10% 증가",
        break_even_change: Math.ceil(breakEvenAttendees * 0.1),
        impact_description: `손익분기점 ${Math.ceil(breakEvenAttendees * 0.1)}명 상승`,
      },
      {
        scenario: "티켓 가격 10% 인상",
        break_even_change: -Math.ceil(breakEvenAttendees * 0.08),
        impact_description: `손익분기점 ${Math.ceil(breakEvenAttendees * 0.08)}명 하락`,
      },
      {
        scenario: "스폰서십 50% 추가 확보",
        break_even_change: -Math.ceil((sponsorship * 0.5) / contributionMargin),
        impact_description: `손익분기점 ${Math.ceil((sponsorship * 0.5) / contributionMargin)}명 하락`,
      },
    ],
    recommendations: [
      `최소 ${breakEvenAttendees}명 등록 확보 필수`,
      "스폰서십 추가 확보로 리스크 완화",
      "고정비 협상을 통한 손익분기점 낮추기",
      "Early Bird 할인으로 조기 등록 유도",
      `현재 기여마진율 ${Math.round((contributionMargin / revenuePerAttendee) * 100)}% - 적정 수준`,
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-037",
  taskName: "손익분기점 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.1.g",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
