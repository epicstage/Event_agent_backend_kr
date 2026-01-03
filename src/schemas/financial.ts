/**
 * Financial Management Zod Schemas
 *
 * 이벤트 재무 관리를 위한 데이터 모델.
 * - CMP-IS Domain D (Skills 7, 8, 9) 준수
 * - Cvent REST API 필드명 호환
 *
 * Reference: specs/01_financial_tasks.md
 */

import { z } from "zod";

// =============================================================================
// ENUMS
// =============================================================================

/**
 * CMP 표준 예산 대분류.
 * Reference: CMP-IS 8.1.a - Define budget format and categories
 */
export const BudgetCategory = z.enum([
  "venue",
  "food_beverage",
  "audio_visual",
  "production",
  "marketing",
  "printing",
  "transportation",
  "accommodation",
  "speaker",
  "entertainment",
  "staffing",
  "security",
  "insurance",
  "technology",
  "registration",
  "signage",
  "gifts_awards",
  "miscellaneous",
  "contingency",
  "tax",
  "gratuity",
]);
export type BudgetCategory = z.infer<typeof BudgetCategory>;

/** 예산 항목 상태 */
export const BudgetStatus = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "committed",
  "paid",
  "cancelled",
]);
export type BudgetStatus = z.infer<typeof BudgetStatus>;

/** 비용 유형 (CMP-IS 8.1.h) */
export const CostType = z.enum(["fixed", "variable"]);
export type CostType = z.infer<typeof CostType>;

/** ISO 4217 통화 코드 */
export const CurrencyCode = z.enum([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "KRW",
  "CNY",
  "SGD",
  "AUD",
]);
export type CurrencyCode = z.infer<typeof CurrencyCode>;

/** 스폰서십 등급 (CMP-IS 7.1) */
export const SponsorshipTier = z.enum([
  "title",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "media",
  "in_kind",
]);
export type SponsorshipTier = z.infer<typeof SponsorshipTier>;

/** 스폰서십 계약 상태 */
export const SponsorshipStatus = z.enum([
  "prospect",
  "contacted",
  "negotiating",
  "committed",
  "contracted",
  "fulfilled",
  "cancelled",
]);
export type SponsorshipStatus = z.infer<typeof SponsorshipStatus>;

/** 결제 수단 (CMP-IS 9.1) */
export const PaymentMethod = z.enum([
  "cash",
  "credit_card",
  "bank_transfer",
  "check",
  "invoice",
]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

/** 거래 유형 */
export const TransactionType = z.enum([
  "income",
  "expense",
  "refund",
  "adjustment",
]);
export type TransactionType = z.infer<typeof TransactionType>;

// =============================================================================
// BASE SCHEMAS
// =============================================================================

/** 금액 표현 모델. Cvent API 호환 */
export const MoneySchema = z.object({
  amount: z.number().min(0).describe("금액 (소수점 2자리까지)"),
  currency: CurrencyCode.default("USD").describe("ISO 4217 통화 코드"),
});
export type Money = z.infer<typeof MoneySchema>;

/** 세금 상세. Cvent API 호환: taxDetail[] */
export const TaxDetailSchema = z.object({
  id: z.string().uuid().describe("세금 항목 고유 ID"),
  name: z.string().max(100).describe("세금 명칭 (예: Sales Tax, VAT)"),
  tax_rate: z
    .number()
    .min(0)
    .max(100)
    .describe("세율 (백분율, 예: 10.0 = 10%)"),
  tax_type: z.string().default("PERCENTAGE").describe("세금 유형"),
  applied_amount: z.number().optional().describe("적용된 세금 금액"),
});
export type TaxDetail = z.infer<typeof TaxDetailSchema>;

// =============================================================================
// BUDGET LINE ITEM
// =============================================================================

/**
 * 예산 세부 항목.
 * Atomic Task FIN-031 ~ FIN-042의 기본 데이터 단위.
 * Cvent API 호환: costDetail[]
 * CMP-IS Reference: 8.1.e - Allocating budget amounts
 */
export const BudgetLineItemSchema = z.object({
  id: z.string().uuid().describe("예산 항목 고유 ID"),
  event_id: z.string().uuid().describe("소속 이벤트 ID"),
  category: BudgetCategory.describe("예산 대분류 (CMP 표준)"),
  name: z.string().max(200).describe("항목명"),
  description: z.string().max(1000).optional().describe("항목 상세 설명"),
  vendor_name: z.string().optional().describe("공급업체명"),
  cost_type: CostType.default("variable").describe("고정비/변동비 구분"),
  unit_cost: z.number().min(0).describe("단가"),
  quantity: z.number().min(0).default(1).describe("수량"),
  projected_amount: z.number().min(0).describe("예상 금액"),
  actual_amount: z.number().min(0).default(0).describe("실제 지출 금액"),
  currency: CurrencyCode.default("USD").describe("통화"),
  status: BudgetStatus.default("draft").describe("항목 상태"),
  payment_due_date: z.string().optional().describe("결제 예정일 (ISO date)"),
  notes: z.string().max(500).optional().describe("비고"),
  created_at: z.string().describe("생성 일시"),
  updated_at: z.string().describe("수정 일시"),
});
export type BudgetLineItem = z.infer<typeof BudgetLineItemSchema>;

/** 예산 항목 생성 요청 */
export const BudgetItemCreateSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  category: BudgetCategory.describe("예산 카테고리"),
  name: z.string().max(200).describe("항목명"),
  description: z.string().optional().describe("상세 설명"),
  vendor_name: z.string().optional().describe("공급업체명"),
  cost_type: CostType.default("variable").describe("고정비/변동비"),
  unit_cost: z.number().min(0).describe("단가"),
  quantity: z.number().min(0).default(1).describe("수량"),
  currency: CurrencyCode.default("USD").describe("통화"),
  payment_due_date: z.string().optional().describe("결제 예정일"),
  notes: z.string().optional().describe("비고"),
});
export type BudgetItemCreate = z.infer<typeof BudgetItemCreateSchema>;

/** 예산 항목 수정 요청 */
export const BudgetItemUpdateSchema = z.object({
  category: BudgetCategory.optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  vendor_name: z.string().optional(),
  cost_type: CostType.optional(),
  unit_cost: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  actual_amount: z.number().min(0).optional(),
  status: BudgetStatus.optional(),
  notes: z.string().optional(),
});
export type BudgetItemUpdate = z.infer<typeof BudgetItemUpdateSchema>;

// =============================================================================
// SPONSORSHIP
// =============================================================================

/** 스폰서 혜택 항목 */
export const SponsorBenefitSchema = z.object({
  name: z.string().max(200).describe("혜택명"),
  description: z.string().optional().describe("혜택 상세 설명"),
  value: z.number().min(0).describe("혜택 금전 가치"),
  cost_to_provide: z.number().min(0).default(0).describe("혜택 제공 비용"),
  quantity: z.number().int().default(1).describe("제공 수량"),
  is_exclusive: z.boolean().default(false).describe("독점 혜택 여부"),
});
export type SponsorBenefit = z.infer<typeof SponsorBenefitSchema>;

/**
 * 스폰서십 패키지.
 * CMP-IS Reference: Skill 7.1 - Develop budgeting processes for funding
 */
export const SponsorshipPackageSchema = z.object({
  id: z.string().uuid().describe("패키지 고유 ID"),
  event_id: z.string().uuid().describe("이벤트 ID"),
  tier: SponsorshipTier.describe("스폰서십 등급"),
  tier_name: z.string().max(100).describe("등급 표시명"),
  amount: z.number().min(0).describe("스폰서십 금액"),
  currency: CurrencyCode.default("USD").describe("통화"),
  benefits: z.array(SponsorBenefitSchema).default([]).describe("혜택 목록"),
  max_sponsors: z.number().int().default(1).describe("최대 스폰서 수"),
  sold_count: z.number().int().default(0).describe("판매된 수량"),
  is_active: z.boolean().default(true).describe("판매 가능 여부"),
});
export type SponsorshipPackage = z.infer<typeof SponsorshipPackageSchema>;

/**
 * 스폰서 정보.
 * CMP-IS Reference: 7.1.d - Identifying potential sponsors
 */
export const SponsorSchema = z.object({
  id: z.string().uuid().describe("스폰서 고유 ID"),
  company_name: z.string().max(200).describe("회사명"),
  industry: z.string().max(100).describe("산업 분류"),
  contact_name: z.string().describe("담당자명"),
  contact_email: z.string().email().describe("담당자 이메일"),
  contact_phone: z.string().optional().describe("담당자 연락처"),
  package_id: z.string().uuid().optional().describe("선택한 패키지 ID"),
  status: SponsorshipStatus.default("prospect").describe("진행 상태"),
  committed_amount: z.number().min(0).default(0).describe("확정 금액"),
  support_type: z.string().optional().describe("지원 유형"),
  contract_signed_at: z.string().optional().describe("계약 체결일"),
  fulfillment_rate: z.number().min(0).max(100).default(0).describe("계약 이행률"),
  notes: z.string().optional().describe("비고"),
});
export type Sponsor = z.infer<typeof SponsorSchema>;

// =============================================================================
// FINANCIAL REPORT
// =============================================================================

/** 리포트 생성 요청 */
export const ReportGenerateRequestSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  report_name: z.string().default("Financial Summary Report").describe("리포트명"),
  period_start: z.string().describe("기간 시작일 (ISO date)"),
  period_end: z.string().describe("기간 종료일 (ISO date)"),
  total_attendees: z.number().int().default(0).describe("총 참석자 수"),
  paid_attendees: z.number().int().default(0).describe("유료 참석자 수"),
});
export type ReportGenerateRequest = z.infer<typeof ReportGenerateRequestSchema>;

/**
 * 재무 보고서.
 * CMP-IS Reference: 8.3.i - Completing financial reports
 */
export const FinancialReportSchema = z.object({
  id: z.string().uuid().describe("리포트 고유 ID"),
  event_id: z.string().uuid().describe("이벤트 ID"),
  report_name: z.string().max(200).describe("리포트명"),
  report_date: z.string().describe("리포트 생성일"),
  period_start: z.string().describe("리포트 기간 시작일"),
  period_end: z.string().describe("리포트 기간 종료일"),
  currency: CurrencyCode.default("USD").describe("통화"),
  // Revenue
  total_registration_revenue: z.number().default(0).describe("등록 수익"),
  total_sponsorship_revenue: z.number().default(0).describe("스폰서십 수익"),
  total_exhibit_revenue: z.number().default(0).describe("전시 수익"),
  total_other_revenue: z.number().default(0).describe("기타 수익"),
  // Expenses
  total_budget: z.number().describe("총 예산"),
  total_actual: z.number().describe("총 실제 지출"),
  // Attendees
  total_attendees: z.number().int().default(0).describe("총 참석자 수"),
  paid_attendees: z.number().int().default(0).describe("유료 참석자 수"),
  // Computed (calculated on response)
  total_revenue: z.number().describe("총 수익"),
  net_profit: z.number().describe("순이익"),
  roi_percentage: z.number().describe("ROI %"),
  cost_per_attendee: z.number().describe("참석자당 비용"),
  revenue_per_attendee: z.number().describe("참석자당 수익"),
  budget_variance: z.number().describe("예산 차이"),
  budget_utilization_rate: z.number().describe("예산 사용률"),
});
export type FinancialReport = z.infer<typeof FinancialReportSchema>;

// =============================================================================
// BUDGET SUMMARY
// =============================================================================

export const BudgetSummarySchema = z.object({
  total_items: z.number().int().describe("총 항목 수"),
  total_projected: z.number().describe("총 예상 금액"),
  total_actual: z.number().describe("총 실제 금액"),
  total_variance: z.number().describe("총 차이"),
  by_category: z.record(z.any()).describe("카테고리별 집계"),
  by_status: z.record(z.number()).describe("상태별 집계"),
});
export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Variance 계산 (예상 - 실제) */
export function calcVariance(projected: number, actual: number): number {
  return projected - actual;
}

/** Variance % 계산 */
export function calcVariancePercentage(
  projected: number,
  actual: number
): number {
  if (projected === 0) return 0;
  return ((projected - actual) / projected) * 100;
}

/** ROI 계산 */
export function calcROI(netProfit: number, totalActual: number): number {
  if (totalActual === 0) return 0;
  return (netProfit / totalActual) * 100;
}

/** 참석자당 비용 계산 */
export function calcCostPerAttendee(
  totalActual: number,
  totalAttendees: number
): number {
  if (totalAttendees === 0) return 0;
  return totalActual / totalAttendees;
}

/** UUID 생성 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/** 현재 ISO 시간 문자열 */
export function nowISO(): string {
  return new Date().toISOString();
}
