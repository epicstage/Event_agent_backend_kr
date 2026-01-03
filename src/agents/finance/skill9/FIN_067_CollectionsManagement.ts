/**
 * FIN-067: 수금 관리
 *
 * CMP-IS Reference: 9.2.d
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Collections Management.
CMP-IS Standard: 9.2.d - Managing collections and accounts receivable.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  outstanding_invoices: z.array(z.object({
    invoice_id: z.string().uuid(),
    invoice_number: z.string(),
    customer_name: z.string(),
    customer_email: z.string().email(),
    amount: z.number(),
    invoice_date: z.string(),
    due_date: z.string(),
    days_overdue: z.number().int(),
    previous_reminders: z.number().int(),
    payment_history: z.enum(["good", "fair", "poor", "new"]),
  })),
  collection_policy: z.object({
    reminder_schedule_days: z.array(z.number().int()),
    escalation_threshold_days: z.number().int(),
    write_off_threshold_days: z.number().int(),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  collection_report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  report_date: z.string(),
  summary: z.object({
    total_outstanding: z.number(),
    total_invoices: z.number().int(),
    current: z.object({
      amount: z.number(),
      count: z.number().int(),
    }),
    overdue_1_30: z.object({
      amount: z.number(),
      count: z.number().int(),
    }),
    overdue_31_60: z.object({
      amount: z.number(),
      count: z.number().int(),
    }),
    overdue_61_90: z.object({
      amount: z.number(),
      count: z.number().int(),
    }),
    overdue_90_plus: z.object({
      amount: z.number(),
      count: z.number().int(),
    }),
  }),
  action_items: z.array(z.object({
    invoice_id: z.string().uuid(),
    invoice_number: z.string(),
    customer_name: z.string(),
    amount: z.number(),
    days_overdue: z.number().int(),
    recommended_action: z.enum([
      "send_reminder", "phone_call", "final_notice",
      "escalate_to_management", "collection_agency", "write_off_review",
    ]),
    priority: z.enum(["low", "medium", "high", "critical"]),
    communication_template: z.string(),
  })),
  reminder_queue: z.array(z.object({
    invoice_id: z.string().uuid(),
    customer_email: z.string(),
    reminder_type: z.string(),
    scheduled_date: z.string(),
    message_preview: z.string(),
  })),
  escalation_list: z.array(z.object({
    invoice_id: z.string().uuid(),
    customer_name: z.string(),
    amount: z.number(),
    escalation_reason: z.string(),
    recommended_contact: z.string(),
  })),
  collection_forecast: z.object({
    expected_collections_7_days: z.number(),
    expected_collections_30_days: z.number(),
    at_risk_amount: z.number(),
  }),
  performance_metrics: z.object({
    average_days_to_collect: z.number(),
    collection_rate_30_days: z.number(),
    bad_debt_ratio: z.number(),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const current = validated.outstanding_invoices.filter(i => i.days_overdue <= 0);
  const overdue1_30 = validated.outstanding_invoices.filter(i => i.days_overdue > 0 && i.days_overdue <= 30);
  const overdue31_60 = validated.outstanding_invoices.filter(i => i.days_overdue > 30 && i.days_overdue <= 60);
  const overdue61_90 = validated.outstanding_invoices.filter(i => i.days_overdue > 60 && i.days_overdue <= 90);
  const overdue90Plus = validated.outstanding_invoices.filter(i => i.days_overdue > 90);

  const sumAmount = (invoices: typeof validated.outstanding_invoices) =>
    invoices.reduce((sum, i) => sum + i.amount, 0);

  const actionItems = validated.outstanding_invoices
    .filter(i => i.days_overdue > 0)
    .map(invoice => {
      let action: "send_reminder" | "phone_call" | "final_notice" | "escalate_to_management" | "collection_agency" | "write_off_review";
      let priority: "low" | "medium" | "high" | "critical";
      let template: string;

      if (invoice.days_overdue <= 15) {
        action = "send_reminder";
        priority = "low";
        template = "첫 번째 독촉: 친절한 알림";
      } else if (invoice.days_overdue <= 30) {
        action = "send_reminder";
        priority = "medium";
        template = "두 번째 독촉: 결제 요청";
      } else if (invoice.days_overdue <= 45) {
        action = "phone_call";
        priority = "medium";
        template = "전화 연락: 결제 확인 및 일정 협의";
      } else if (invoice.days_overdue <= 60) {
        action = "final_notice";
        priority = "high";
        template = "최종 통보: 기한 내 미결제 시 조치 안내";
      } else if (invoice.days_overdue <= 90) {
        action = "escalate_to_management";
        priority = "high";
        template = "경영진 보고: 수금 지연 현황";
      } else if (invoice.days_overdue <= validated.collection_policy.write_off_threshold_days) {
        action = "collection_agency";
        priority = "critical";
        template = "추심 업체 의뢰 검토";
      } else {
        action = "write_off_review";
        priority = "critical";
        template = "대손 상각 검토";
      }

      return {
        invoice_id: invoice.invoice_id,
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customer_name,
        amount: invoice.amount,
        days_overdue: invoice.days_overdue,
        recommended_action: action,
        priority,
        communication_template: template,
      };
    })
    .sort((a, b) => b.days_overdue - a.days_overdue);

  const reminderQueue = validated.outstanding_invoices
    .filter(i => i.days_overdue > 0 && i.days_overdue <= 60)
    .map(invoice => ({
      invoice_id: invoice.invoice_id,
      customer_email: invoice.customer_email,
      reminder_type: invoice.days_overdue <= 15 ? "첫 번째 알림" :
        invoice.days_overdue <= 30 ? "두 번째 알림" : "최종 알림",
      scheduled_date: nowISO().split("T")[0],
      message_preview: `${invoice.customer_name}님, ${invoice.invoice_number} 인보이스 결제(${invoice.amount.toLocaleString()}원)가 ${invoice.days_overdue}일 연체되었습니다.`,
    }));

  const escalationList = validated.outstanding_invoices
    .filter(i => i.days_overdue > validated.collection_policy.escalation_threshold_days)
    .map(invoice => ({
      invoice_id: invoice.invoice_id,
      customer_name: invoice.customer_name,
      amount: invoice.amount,
      escalation_reason: `${invoice.days_overdue}일 연체 (기준: ${validated.collection_policy.escalation_threshold_days}일)`,
      recommended_contact: invoice.days_overdue > 90 ? "법무팀/추심업체" : "영업 담당자",
    }));

  const expectedCollections7Days = sumAmount(overdue1_30) * 0.5 + sumAmount(current) * 0.3;
  const expectedCollections30Days = sumAmount(overdue1_30) * 0.8 + sumAmount(overdue31_60) * 0.5 + sumAmount(current) * 0.9;
  const atRiskAmount = sumAmount(overdue61_90) + sumAmount(overdue90Plus);

  const output: Output = {
    collection_report_id: generateUUID(),
    event_id: validated.event_id,
    report_date: nowISO().split("T")[0],
    summary: {
      total_outstanding: sumAmount(validated.outstanding_invoices),
      total_invoices: validated.outstanding_invoices.length,
      current: {
        amount: sumAmount(current),
        count: current.length,
      },
      overdue_1_30: {
        amount: sumAmount(overdue1_30),
        count: overdue1_30.length,
      },
      overdue_31_60: {
        amount: sumAmount(overdue31_60),
        count: overdue31_60.length,
      },
      overdue_61_90: {
        amount: sumAmount(overdue61_90),
        count: overdue61_90.length,
      },
      overdue_90_plus: {
        amount: sumAmount(overdue90Plus),
        count: overdue90Plus.length,
      },
    },
    action_items: actionItems,
    reminder_queue: reminderQueue,
    escalation_list: escalationList,
    collection_forecast: {
      expected_collections_7_days: Math.round(expectedCollections7Days),
      expected_collections_30_days: Math.round(expectedCollections30Days),
      at_risk_amount: Math.round(atRiskAmount),
    },
    performance_metrics: {
      average_days_to_collect: validated.outstanding_invoices.length > 0
        ? Math.round(validated.outstanding_invoices.reduce((sum, i) => sum + Math.max(0, i.days_overdue), 0) / validated.outstanding_invoices.length)
        : 0,
      collection_rate_30_days: validated.outstanding_invoices.length > 0
        ? Math.round((current.length + overdue1_30.length) / validated.outstanding_invoices.length * 100)
        : 100,
      bad_debt_ratio: sumAmount(validated.outstanding_invoices) > 0
        ? Math.round(sumAmount(overdue90Plus) / sumAmount(validated.outstanding_invoices) * 100 * 10) / 10
        : 0,
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-067",
  taskName: "수금 관리",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 9.2.d",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.2: Manage Monetary Transactions Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
