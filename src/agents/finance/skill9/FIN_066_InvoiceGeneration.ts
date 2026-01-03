/**
 * FIN-066: 인보이스 생성
 *
 * CMP-IS Reference: 9.2.c
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Invoice Generation.
CMP-IS Standard: 9.2.c - Generating invoices for sponsors, exhibitors, and other payers.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  invoice_type: z.enum(["sponsorship", "exhibit", "registration", "services", "advertising"]),
  customer_info: z.object({
    company_name: z.string(),
    contact_name: z.string(),
    email: z.string().email(),
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state_province: z.string().optional(),
      postal_code: z.string(),
      country: z.string(),
    }),
    tax_id: z.string().optional(),
  }),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    discount_percent: z.number().optional(),
    tax_rate: z.number().optional(),
  })),
  payment_terms: z.object({
    due_days: z.number().int(),
    early_payment_discount: z.number().optional(),
    early_payment_days: z.number().int().optional(),
    accepted_methods: z.array(z.string()),
  }),
  notes: z.string().optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  invoice_id: z.string().uuid(),
  event_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_date: z.string(),
  due_date: z.string(),
  customer: z.object({
    company_name: z.string(),
    contact_name: z.string(),
    email: z.string(),
    billing_address: z.string(),
    tax_id: z.string().optional(),
  }),
  line_items: z.array(z.object({
    item_number: z.number().int(),
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    discount: z.number(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
  })),
  totals: z.object({
    subtotal: z.number(),
    total_discount: z.number(),
    subtotal_after_discount: z.number(),
    total_tax: z.number(),
    grand_total: z.number(),
    currency: z.string(),
  }),
  payment_instructions: z.object({
    terms: z.string(),
    early_payment_offer: z.string().optional(),
    accepted_methods: z.array(z.string()),
    bank_details: z.object({
      bank_name: z.string(),
      account_name: z.string(),
      account_number: z.string(),
      routing_number: z.string(),
      swift_code: z.string().optional(),
    }).optional(),
    online_payment_link: z.string().optional(),
  }),
  legal_notes: z.array(z.string()),
  footer_notes: z.string().optional(),
  status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate.getTime() + validated.payment_terms.due_days * 24 * 60 * 60 * 1000);

  const invoiceNumber = `INV-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const processedLineItems = validated.line_items.map((item, idx) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const discount = itemSubtotal * (item.discount_percent || 0) / 100;
    const subtotalAfterDiscount = itemSubtotal - discount;
    const tax = subtotalAfterDiscount * (item.tax_rate || 0) / 100;
    const total = subtotalAfterDiscount + tax;

    return {
      item_number: idx + 1,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: Math.round(discount * 100) / 100,
      subtotal: Math.round(itemSubtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  });

  const totals = {
    subtotal: processedLineItems.reduce((sum, item) => sum + item.subtotal, 0),
    total_discount: processedLineItems.reduce((sum, item) => sum + item.discount, 0),
    subtotal_after_discount: processedLineItems.reduce((sum, item) => sum + item.subtotal - item.discount, 0),
    total_tax: processedLineItems.reduce((sum, item) => sum + item.tax, 0),
    grand_total: processedLineItems.reduce((sum, item) => sum + item.total, 0),
    currency: validated.currency,
  };

  const billingAddress = [
    validated.customer_info.address.line1,
    validated.customer_info.address.line2,
    `${validated.customer_info.address.city}${validated.customer_info.address.state_province ? `, ${validated.customer_info.address.state_province}` : ""} ${validated.customer_info.address.postal_code}`,
    validated.customer_info.address.country,
  ].filter(Boolean).join("\n");

  const output: Output = {
    invoice_id: generateUUID(),
    event_id: validated.event_id,
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate.toISOString().split("T")[0],
    due_date: dueDate.toISOString().split("T")[0],
    customer: {
      company_name: validated.customer_info.company_name,
      contact_name: validated.customer_info.contact_name,
      email: validated.customer_info.email,
      billing_address: billingAddress,
      tax_id: validated.customer_info.tax_id,
    },
    line_items: processedLineItems,
    totals: {
      subtotal: Math.round(totals.subtotal * 100) / 100,
      total_discount: Math.round(totals.total_discount * 100) / 100,
      subtotal_after_discount: Math.round(totals.subtotal_after_discount * 100) / 100,
      total_tax: Math.round(totals.total_tax * 100) / 100,
      grand_total: Math.round(totals.grand_total * 100) / 100,
      currency: validated.currency,
    },
    payment_instructions: {
      terms: `결제 기한: ${validated.payment_terms.due_days}일 이내 (${dueDate.toISOString().split("T")[0]})`,
      early_payment_offer: validated.payment_terms.early_payment_discount
        ? `${validated.payment_terms.early_payment_days}일 이내 결제 시 ${validated.payment_terms.early_payment_discount}% 할인`
        : undefined,
      accepted_methods: validated.payment_terms.accepted_methods,
      bank_details: {
        bank_name: "이벤트 은행",
        account_name: "이벤트 주최사",
        account_number: "123-456-789012",
        routing_number: "012345678",
        swift_code: "EVNTUS33",
      },
      online_payment_link: `https://pay.event.com/invoice/${invoiceNumber}`,
    },
    legal_notes: [
      "본 인보이스는 계약 조건에 따라 발행되었습니다.",
      "결제 지연 시 연 15%의 지연 이자가 부과될 수 있습니다.",
      "문의사항은 재무팀(finance@event.com)으로 연락 바랍니다.",
    ],
    footer_notes: validated.notes,
    status: "draft",
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-066",
  taskName: "인보이스 생성",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 9.2.c",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.2: Manage Monetary Transactions Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
