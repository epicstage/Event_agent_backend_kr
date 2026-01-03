/**
 * SITE-026: 숙박 인보이스 관리
 * CMP-IS Reference: 16.5.a - Housing invoicing
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Invoice Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_id: z.string(),
  hotel_name: z.string(),
  billing_period: z.object({ start: z.string(), end: z.string() }),
  room_nights: z.array(z.object({ date: z.string(), rooms: z.number(), rate: z.number() })),
  additional_charges: z.array(z.object({ description: z.string(), amount: z.number() })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  invoice_id: z.string(),
  event_id: z.string(),
  hotel_id: z.string(),
  invoice_details: z.object({ subtotal_rooms: z.number(), subtotal_extras: z.number(), taxes: z.number(), total: z.number() }),
  line_items: z.array(z.object({ description: z.string(), quantity: z.number(), unit_price: z.number(), total: z.number() })),
  payment_terms: z.object({ due_date: z.string(), payment_method: z.string() }),
  discrepancies: z.array(z.object({ item: z.string(), expected: z.number(), actual: z.number() })),
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
  const lineItems = validatedInput.room_nights.map(rn => ({
    description: `객실 - ${rn.date}`,
    quantity: rn.rooms,
    unit_price: rn.rate,
    total: rn.rooms * rn.rate,
  }));
  const subtotalRooms = lineItems.reduce((sum, li) => sum + li.total, 0);
  const subtotalExtras = validatedInput.additional_charges?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const taxes = Math.round((subtotalRooms + subtotalExtras) * 0.1);

  return {
    invoice_id: generateUUID(),
    event_id: validatedInput.event_id,
    hotel_id: validatedInput.hotel_id,
    invoice_details: {
      subtotal_rooms: subtotalRooms,
      subtotal_extras: subtotalExtras,
      taxes,
      total: subtotalRooms + subtotalExtras + taxes,
    },
    line_items: lineItems,
    payment_terms: {
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      payment_method: "계좌이체",
    },
    discrepancies: [],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-026",
  taskName: "숙박 인보이스 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.5.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.5: Financial Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
