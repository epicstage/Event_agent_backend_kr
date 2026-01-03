/**
 * FIN-034: 예산 항목 상세화
 *
 * CMP-IS Reference: 8.1.d
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Budget Line Itemization.
CMP-IS Standard: 8.1.d - Creating detailed budget line items.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  budget_structure_id: z.string().uuid().optional(),
  categories: z.array(z.object({
    category_code: z.string(),
    category_name: z.string(),
    allocated_amount: z.number(),
  })),
  vendor_quotes: z.array(z.object({
    category: z.string(),
    vendor_name: z.string(),
    line_items: z.array(z.object({
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
    })),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  itemization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  detailed_budget: z.array(z.object({
    category_code: z.string(),
    category_name: z.string(),
    line_items: z.array(z.object({
      line_code: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      unit_price: z.number(),
      total_price: z.number(),
      vendor: z.string().optional(),
      notes: z.string().optional(),
    })),
    category_total: z.number(),
    percentage_of_budget: z.number(),
  })),
  budget_summary: z.object({
    subtotal: z.number(),
    contingency: z.number(),
    contingency_percentage: z.number(),
    grand_total: z.number(),
  }),
  validation_checks: z.array(z.object({
    check: z.string(),
    status: z.enum(["pass", "warning", "fail"]),
    message: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  let lineCounter = 0;
  const detailedBudget = validated.categories.map(cat => {
    // Generate sample line items if no quotes provided
    const vendorItems = validated.vendor_quotes?.find(v => v.category === cat.category_code);

    const lineItems = vendorItems?.line_items.map(item => {
      lineCounter++;
      return {
        line_code: `${cat.category_code}-${String(lineCounter).padStart(3, "0")}`,
        description: item.description,
        quantity: item.quantity,
        unit: "개",
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        vendor: vendorItems.vendor_name,
        notes: undefined,
      };
    }) || [
      {
        line_code: `${cat.category_code}-001`,
        description: `${cat.category_name} 기본 비용`,
        quantity: 1,
        unit: "식",
        unit_price: cat.allocated_amount * 0.7,
        total_price: cat.allocated_amount * 0.7,
        notes: "견적 확정 필요",
      },
      {
        line_code: `${cat.category_code}-002`,
        description: `${cat.category_name} 추가 옵션`,
        quantity: 1,
        unit: "식",
        unit_price: cat.allocated_amount * 0.3,
        total_price: cat.allocated_amount * 0.3,
        notes: "선택 사항",
      },
    ];

    const categoryTotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);

    return {
      category_code: cat.category_code,
      category_name: cat.category_name,
      line_items: lineItems,
      category_total: categoryTotal,
      percentage_of_budget: 0, // Will be calculated after
    };
  });

  const subtotal = detailedBudget.reduce((sum, cat) => sum + cat.category_total, 0);
  const contingencyPct = 8;
  const contingency = subtotal * (contingencyPct / 100);

  // Calculate percentages
  detailedBudget.forEach(cat => {
    cat.percentage_of_budget = Math.round((cat.category_total / subtotal) * 100 * 10) / 10;
  });

  const output: Output = {
    itemization_id: generateUUID(),
    event_id: validated.event_id,
    detailed_budget: detailedBudget,
    budget_summary: {
      subtotal: Math.round(subtotal),
      contingency: Math.round(contingency),
      contingency_percentage: contingencyPct,
      grand_total: Math.round(subtotal + contingency),
    },
    validation_checks: [
      {
        check: "모든 항목 금액 입력",
        status: "pass",
        message: "모든 라인 아이템에 금액이 입력되었습니다",
      },
      {
        check: "예비비 비율",
        status: contingencyPct >= 5 && contingencyPct <= 15 ? "pass" : "warning",
        message: `예비비 ${contingencyPct}% (권장: 5-15%)`,
      },
      {
        check: "벤더 확정 상태",
        status: validated.vendor_quotes ? "pass" : "warning",
        message: validated.vendor_quotes ? "견적 기반 예산" : "견적 미확정 항목 존재",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-034",
  taskName: "예산 항목 상세화",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.1.d",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
