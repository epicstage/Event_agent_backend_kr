/**
 * SITE-007: 장비 인벤토리 관리
 * CMP-IS Reference: 15.4.b - Equipment inventory management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Equipment Inventory Manager for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  inventory_items: z.array(z.object({
    item_code: z.string(),
    item_name: z.string(),
    category: z.string(),
    quantity: z.number(),
    supplier: z.string().optional(),
    cost_per_unit: z.number().optional(),
    rental_or_purchase: z.enum(["rental", "purchase"]).optional(),
  })),
  action: z.enum(["create", "update", "verify", "report"]).default("create"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  inventory_id: z.string(),
  event_id: z.string(),
  summary: z.object({ total_items: z.number(), total_quantity: z.number(), categories: z.number(), estimated_cost: z.number() }),
  by_category: z.array(z.object({ category: z.string(), items: z.number(), quantity: z.number() })),
  recommendations: z.array(z.string()),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const items = validatedInput.inventory_items;
  const categories = [...new Set(items.map(i => i.category))];
  const totalCost = items.reduce((sum, i) => sum + (i.cost_per_unit || 0) * i.quantity, 0);

  return {
    inventory_id: generateUUID(),
    event_id: validatedInput.event_id,
    summary: {
      total_items: items.length,
      total_quantity: items.reduce((sum, i) => sum + i.quantity, 0),
      categories: categories.length,
      estimated_cost: totalCost,
    },
    by_category: categories.map(cat => ({
      category: cat,
      items: items.filter(i => i.category === cat).length,
      quantity: items.filter(i => i.category === cat).reduce((sum, i) => sum + i.quantity, 0),
    })),
    recommendations: ["배송 전 수량 재확인", "예비 장비 10% 확보 권장"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-007",
  taskName: "장비 인벤토리 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.4.b",
  skill: "Skill 15: Site Operations",
  subSkill: "15.4: Logistics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
