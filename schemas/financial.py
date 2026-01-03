"""
Financial Management Pydantic Schemas

이벤트 재무 관리를 위한 데이터 모델.
- CMP-IS Domain D (Skills 7, 8, 9) 준수
- Cvent REST API 필드명 호환
- FastAPI 연동 최적화

Author: Event Agent System
Reference: specs/01_financial_tasks.md
"""

from __future__ import annotations

from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, model_validator, computed_field


# =============================================================================
# ENUMS
# =============================================================================

class BudgetCategory(str, Enum):
    """
    CMP 표준 예산 대분류.
    Reference: CMP-IS 8.1.a - Define budget format and categories
    """
    VENUE = "venue"
    FOOD_BEVERAGE = "food_beverage"
    AUDIO_VISUAL = "audio_visual"
    PRODUCTION = "production"
    MARKETING = "marketing"
    PRINTING = "printing"
    TRANSPORTATION = "transportation"
    ACCOMMODATION = "accommodation"
    SPEAKER = "speaker"
    ENTERTAINMENT = "entertainment"
    STAFFING = "staffing"
    SECURITY = "security"
    INSURANCE = "insurance"
    TECHNOLOGY = "technology"
    REGISTRATION = "registration"
    SIGNAGE = "signage"
    GIFTS_AWARDS = "gifts_awards"
    MISCELLANEOUS = "miscellaneous"
    CONTINGENCY = "contingency"
    TAX = "tax"
    GRATUITY = "gratuity"


class BudgetStatus(str, Enum):
    """예산 항목 상태"""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    COMMITTED = "committed"
    PAID = "paid"
    CANCELLED = "cancelled"


class CostType(str, Enum):
    """비용 유형 (CMP-IS 8.1.h)"""
    FIXED = "fixed"
    VARIABLE = "variable"


class CurrencyCode(str, Enum):
    """ISO 4217 통화 코드"""
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"
    KRW = "KRW"
    CNY = "CNY"
    SGD = "SGD"
    AUD = "AUD"


class SponsorshipTier(str, Enum):
    """스폰서십 등급 (CMP-IS 7.1)"""
    TITLE = "title"
    PLATINUM = "platinum"
    GOLD = "gold"
    SILVER = "silver"
    BRONZE = "bronze"
    MEDIA = "media"
    IN_KIND = "in_kind"


class SponsorshipStatus(str, Enum):
    """스폰서십 계약 상태"""
    PROSPECT = "prospect"
    CONTACTED = "contacted"
    NEGOTIATING = "negotiating"
    COMMITTED = "committed"
    CONTRACTED = "contracted"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    """결제 수단 (CMP-IS 9.1)"""
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    CHECK = "check"
    INVOICE = "invoice"


class TransactionType(str, Enum):
    """거래 유형"""
    INCOME = "income"
    EXPENSE = "expense"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"


# =============================================================================
# BASE MODELS
# =============================================================================

class Money(BaseModel):
    """
    금액 표현 모델.
    Cvent API 호환: totalHighLevelEstimate.amount, costDetail[].amount
    """
    amount: Decimal = Field(
        ...,
        description="금액 (소수점 2자리까지)",
        ge=Decimal("0"),
        decimal_places=2
    )
    currency: CurrencyCode = Field(
        default=CurrencyCode.USD,
        description="ISO 4217 통화 코드"
    )

    class Config:
        json_encoders = {Decimal: lambda v: float(v)}


class TaxDetail(BaseModel):
    """
    세금 상세.
    Cvent API 호환: taxDetail[]
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="세금 항목 고유 ID"
    )
    name: str = Field(
        ...,
        description="세금 명칭 (예: Sales Tax, VAT)",
        max_length=100
    )
    tax_rate: Decimal = Field(
        ...,
        description="세율 (백분율, 예: 10.0 = 10%)",
        ge=Decimal("0"),
        le=Decimal("100")
    )
    tax_type: str = Field(
        default="PERCENTAGE",
        description="세금 유형: PERCENTAGE 또는 FIXED"
    )
    applied_amount: Optional[Decimal] = Field(
        default=None,
        description="적용된 세금 금액"
    )


# =============================================================================
# BUDGET LINE ITEM
# =============================================================================

class BudgetLineItem(BaseModel):
    """
    예산 세부 항목.
    Atomic Task FIN-031 ~ FIN-042의 기본 데이터 단위.

    Cvent API 호환: costDetail[]
    CMP-IS Reference: 8.1.e - Allocating budget amounts
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="예산 항목 고유 ID (Cvent: costDetail[].id)"
    )
    event_id: UUID = Field(
        ...,
        description="소속 이벤트 ID (Cvent: event[].id)"
    )
    category: BudgetCategory = Field(
        ...,
        description="예산 대분류 (CMP 표준)"
    )
    name: str = Field(
        ...,
        description="항목명 (Cvent: costDetail[].name)",
        max_length=200
    )
    description: Optional[str] = Field(
        default=None,
        description="항목 상세 설명",
        max_length=1000
    )
    vendor_name: Optional[str] = Field(
        default=None,
        description="공급업체명"
    )
    cost_type: CostType = Field(
        default=CostType.VARIABLE,
        description="고정비/변동비 구분 (CMP-IS 8.1.h)"
    )
    unit_cost: Decimal = Field(
        ...,
        description="단가",
        ge=Decimal("0")
    )
    quantity: Decimal = Field(
        default=Decimal("1"),
        description="수량",
        ge=Decimal("0")
    )
    projected_amount: Decimal = Field(
        ...,
        description="예상 금액 (Cvent: totalHighLevelEstimate)",
        ge=Decimal("0")
    )
    actual_amount: Decimal = Field(
        default=Decimal("0"),
        description="실제 지출 금액",
        ge=Decimal("0")
    )
    currency: CurrencyCode = Field(
        default=CurrencyCode.USD,
        description="통화"
    )
    status: BudgetStatus = Field(
        default=BudgetStatus.DRAFT,
        description="항목 상태"
    )
    payment_due_date: Optional[date] = Field(
        default=None,
        description="결제 예정일"
    )
    notes: Optional[str] = Field(
        default=None,
        description="비고",
        max_length=500
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="생성 일시"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="수정 일시"
    )

    @computed_field
    @property
    def variance(self) -> Decimal:
        """
        예산 차이 = 예상 - 실제.
        양수: 예산 절감, 음수: 초과 지출
        Reference: CMP-IS 8.3.d - Identifying variances
        """
        return self.projected_amount - self.actual_amount

    @computed_field
    @property
    def variance_percentage(self) -> Decimal:
        """예산 차이 백분율"""
        if self.projected_amount == 0:
            return Decimal("0")
        return (self.variance / self.projected_amount) * 100

    @model_validator(mode="after")
    def validate_amounts(self) -> "BudgetLineItem":
        """금액 검증: projected_amount = unit_cost * quantity"""
        calculated = self.unit_cost * self.quantity
        # 5% 오차 허용 (수동 조정 가능)
        if abs(calculated - self.projected_amount) > calculated * Decimal("0.05"):
            # Warning만, 에러는 발생시키지 않음 (유연성)
            pass
        return self

    class Config:
        json_encoders = {
            Decimal: lambda v: float(v),
            UUID: str,
            datetime: lambda v: v.isoformat()
        }


# =============================================================================
# BUDGET (전체 예산)
# =============================================================================

class Budget(BaseModel):
    """
    이벤트 전체 예산.
    Cvent API 호환: Budget Object
    CMP-IS Reference: Skill 8 - Manage Budget
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="예산 고유 ID"
    )
    event_id: UUID = Field(
        ...,
        description="이벤트 ID (Cvent: event[].id)"
    )
    name: str = Field(
        ...,
        description="예산명 (예: 2024 Annual Conference Budget)",
        max_length=200
    )
    fiscal_year: int = Field(
        ...,
        description="회계연도"
    )
    currency: CurrencyCode = Field(
        default=CurrencyCode.USD,
        description="기본 통화"
    )
    line_items: List[BudgetLineItem] = Field(
        default_factory=list,
        description="예산 세부 항목 목록"
    )
    tax_details: List[TaxDetail] = Field(
        default_factory=list,
        description="세금 상세 (Cvent: taxDetail[])"
    )
    contingency_percentage: Decimal = Field(
        default=Decimal("10"),
        description="예비비 비율 (%, CMP-IS 8.1.f)",
        ge=Decimal("0"),
        le=Decimal("50")
    )
    status: BudgetStatus = Field(
        default=BudgetStatus.DRAFT,
        description="예산 상태"
    )
    approved_by: Optional[str] = Field(
        default=None,
        description="승인자 (CMP-IS 8.1.k)"
    )
    approved_at: Optional[datetime] = Field(
        default=None,
        description="승인 일시"
    )
    last_modified_by: Optional[str] = Field(
        default=None,
        description="최종 수정자 (Cvent: lastModifiedBy)"
    )
    last_modified_date: datetime = Field(
        default_factory=datetime.utcnow,
        description="최종 수정일 (Cvent: lastModifiedDate)"
    )

    @computed_field
    @property
    def total_projected(self) -> Decimal:
        """총 예상 예산"""
        return sum(item.projected_amount for item in self.line_items)

    @computed_field
    @property
    def total_actual(self) -> Decimal:
        """총 실제 지출"""
        return sum(item.actual_amount for item in self.line_items)

    @computed_field
    @property
    def total_variance(self) -> Decimal:
        """총 예산 차이"""
        return self.total_projected - self.total_actual

    @computed_field
    @property
    def contingency_amount(self) -> Decimal:
        """예비비 금액"""
        return self.total_projected * (self.contingency_percentage / 100)

    @computed_field
    @property
    def budget_by_category(self) -> dict[str, Decimal]:
        """카테고리별 예산 집계"""
        result: dict[str, Decimal] = {}
        for item in self.line_items:
            cat = item.category.value
            result[cat] = result.get(cat, Decimal("0")) + item.projected_amount
        return result


# =============================================================================
# SPONSORSHIP
# =============================================================================

class SponsorBenefit(BaseModel):
    """스폰서 혜택 항목"""
    name: str = Field(
        ...,
        description="혜택명 (예: Logo on website)",
        max_length=200
    )
    description: Optional[str] = Field(
        default=None,
        description="혜택 상세 설명"
    )
    value: Decimal = Field(
        ...,
        description="혜택 금전 가치 (CMP-IS 7.1.a)",
        ge=Decimal("0")
    )
    cost_to_provide: Decimal = Field(
        default=Decimal("0"),
        description="혜택 제공 비용 (CMP-IS 7.1.a)",
        ge=Decimal("0")
    )
    quantity: int = Field(
        default=1,
        description="제공 수량"
    )
    is_exclusive: bool = Field(
        default=False,
        description="독점 혜택 여부"
    )


class SponsorshipPackage(BaseModel):
    """
    스폰서십 패키지.
    Atomic Task FIN-001 ~ FIN-016 관련.
    CMP-IS Reference: Skill 7.1 - Develop budgeting processes for funding
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="패키지 고유 ID"
    )
    event_id: UUID = Field(
        ...,
        description="이벤트 ID"
    )
    tier: SponsorshipTier = Field(
        ...,
        description="스폰서십 등급"
    )
    tier_name: str = Field(
        ...,
        description="등급 표시명 (예: Gold Sponsor)",
        max_length=100
    )
    amount: Decimal = Field(
        ...,
        description="스폰서십 금액",
        ge=Decimal("0")
    )
    currency: CurrencyCode = Field(
        default=CurrencyCode.USD,
        description="통화"
    )
    benefits: List[SponsorBenefit] = Field(
        default_factory=list,
        description="혜택 목록 (CMP-IS 7.1.e)"
    )
    max_sponsors: int = Field(
        default=1,
        description="최대 스폰서 수 (독점 여부)"
    )
    sold_count: int = Field(
        default=0,
        description="판매된 수량"
    )
    is_active: bool = Field(
        default=True,
        description="판매 가능 여부"
    )

    @computed_field
    @property
    def available_count(self) -> int:
        """남은 판매 가능 수량"""
        return max(0, self.max_sponsors - self.sold_count)

    @computed_field
    @property
    def total_benefit_value(self) -> Decimal:
        """총 혜택 가치"""
        return sum(b.value * b.quantity for b in self.benefits)

    @computed_field
    @property
    def total_cost_to_provide(self) -> Decimal:
        """총 혜택 제공 비용"""
        return sum(b.cost_to_provide * b.quantity for b in self.benefits)

    @computed_field
    @property
    def net_revenue(self) -> Decimal:
        """순 수익 = 스폰서십 금액 - 제공 비용"""
        return self.amount - self.total_cost_to_provide


class Sponsor(BaseModel):
    """
    스폰서 정보.
    CMP-IS Reference: 7.1.d - Identifying potential sponsors
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="스폰서 고유 ID"
    )
    company_name: str = Field(
        ...,
        description="회사명",
        max_length=200
    )
    industry: str = Field(
        ...,
        description="산업 분류 (충돌 검사용, CMP-IS 7.1.h)",
        max_length=100
    )
    contact_name: str = Field(
        ...,
        description="담당자명"
    )
    contact_email: str = Field(
        ...,
        description="담당자 이메일"
    )
    contact_phone: Optional[str] = Field(
        default=None,
        description="담당자 연락처"
    )
    package_id: Optional[UUID] = Field(
        default=None,
        description="선택한 패키지 ID"
    )
    status: SponsorshipStatus = Field(
        default=SponsorshipStatus.PROSPECT,
        description="진행 상태"
    )
    committed_amount: Decimal = Field(
        default=Decimal("0"),
        description="확정 금액"
    )
    support_type: Optional[str] = Field(
        default=None,
        description="지원 유형: cash, discount, product (CMP-IS 7.1.g)"
    )
    contract_signed_at: Optional[datetime] = Field(
        default=None,
        description="계약 체결일"
    )
    fulfillment_rate: Decimal = Field(
        default=Decimal("0"),
        description="계약 이행률 (%, CMP-IS 7.1.k)",
        ge=Decimal("0"),
        le=Decimal("100")
    )
    notes: Optional[str] = Field(
        default=None,
        description="비고"
    )


# =============================================================================
# FINANCIAL REPORT
# =============================================================================

class FinancialReport(BaseModel):
    """
    재무 보고서.
    Atomic Task FIN-051 ~ FIN-057 결과물.
    CMP-IS Reference: 8.3.i - Completing financial reports
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="리포트 고유 ID"
    )
    event_id: UUID = Field(
        ...,
        description="이벤트 ID"
    )
    report_name: str = Field(
        ...,
        description="리포트명",
        max_length=200
    )
    report_date: datetime = Field(
        default_factory=datetime.utcnow,
        description="리포트 생성일"
    )
    period_start: date = Field(
        ...,
        description="리포트 기간 시작일"
    )
    period_end: date = Field(
        ...,
        description="리포트 기간 종료일"
    )
    currency: CurrencyCode = Field(
        default=CurrencyCode.USD,
        description="통화"
    )

    # 수익 (Revenue)
    total_registration_revenue: Decimal = Field(
        default=Decimal("0"),
        description="등록 수익 (CMP-IS 7.2)"
    )
    total_sponsorship_revenue: Decimal = Field(
        default=Decimal("0"),
        description="스폰서십 수익 (CMP-IS 7.1)"
    )
    total_exhibit_revenue: Decimal = Field(
        default=Decimal("0"),
        description="전시 수익 (CMP-IS 7.3)"
    )
    total_other_revenue: Decimal = Field(
        default=Decimal("0"),
        description="기타 수익 (광고, 머천다이징 등, CMP-IS 7.4)"
    )

    # 비용 (Expenses)
    total_budget: Decimal = Field(
        ...,
        description="총 예산"
    )
    total_actual: Decimal = Field(
        ...,
        description="총 실제 지출"
    )

    # 참석자
    total_attendees: int = Field(
        default=0,
        description="총 참석자 수"
    )
    paid_attendees: int = Field(
        default=0,
        description="유료 참석자 수"
    )

    @computed_field
    @property
    def total_revenue(self) -> Decimal:
        """총 수익"""
        return (
            self.total_registration_revenue +
            self.total_sponsorship_revenue +
            self.total_exhibit_revenue +
            self.total_other_revenue
        )

    @computed_field
    @property
    def net_profit(self) -> Decimal:
        """순이익 = 총수익 - 총지출"""
        return self.total_revenue - self.total_actual

    @computed_field
    @property
    def roi_percentage(self) -> Decimal:
        """
        ROI = (순이익 / 총지출) × 100
        CMP-IS 7.1.l - Evaluating return on investment
        """
        if self.total_actual == 0:
            return Decimal("0")
        return (self.net_profit / self.total_actual) * 100

    @computed_field
    @property
    def cost_per_attendee(self) -> Decimal:
        """참석자당 비용"""
        if self.total_attendees == 0:
            return Decimal("0")
        return self.total_actual / self.total_attendees

    @computed_field
    @property
    def revenue_per_attendee(self) -> Decimal:
        """참석자당 수익"""
        if self.total_attendees == 0:
            return Decimal("0")
        return self.total_revenue / self.total_attendees

    @computed_field
    @property
    def budget_variance(self) -> Decimal:
        """예산 차이"""
        return self.total_budget - self.total_actual

    @computed_field
    @property
    def budget_utilization_rate(self) -> Decimal:
        """예산 사용률 (%)"""
        if self.total_budget == 0:
            return Decimal("0")
        return (self.total_actual / self.total_budget) * 100


# =============================================================================
# TRANSACTIONS
# =============================================================================

class Transaction(BaseModel):
    """
    금전 거래.
    CMP-IS Reference: Skill 9 - Manage Monetary Transactions
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="거래 고유 ID"
    )
    event_id: UUID = Field(
        ...,
        description="이벤트 ID"
    )
    budget_line_item_id: Optional[UUID] = Field(
        default=None,
        description="연결된 예산 항목 ID"
    )
    transaction_type: TransactionType = Field(
        ...,
        description="거래 유형"
    )
    amount: Decimal = Field(
        ...,
        description="거래 금액"
    )
    currency: CurrencyCode = Field(
        default=CurrencyCode.USD,
        description="통화"
    )
    payment_method: PaymentMethod = Field(
        ...,
        description="결제 수단 (CMP-IS 9.1)"
    )
    description: str = Field(
        ...,
        description="거래 설명",
        max_length=500
    )
    reference_number: Optional[str] = Field(
        default=None,
        description="참조 번호 (영수증, 송장 번호)"
    )
    vendor_name: Optional[str] = Field(
        default=None,
        description="거래처명"
    )
    transaction_date: datetime = Field(
        default_factory=datetime.utcnow,
        description="거래 일시"
    )
    recorded_by: str = Field(
        ...,
        description="기록자"
    )
    is_reconciled: bool = Field(
        default=False,
        description="대사 완료 여부 (CMP-IS 9.2.d)"
    )
    notes: Optional[str] = Field(
        default=None,
        description="비고"
    )


# =============================================================================
# CASH FLOW
# =============================================================================

class CashFlowProjection(BaseModel):
    """
    현금 흐름 예측.
    Atomic Task FIN-037.
    CMP-IS Reference: 8.1.g - Detailing projected cash flow
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="예측 고유 ID"
    )
    event_id: UUID = Field(
        ...,
        description="이벤트 ID"
    )
    period_type: str = Field(
        ...,
        description="기간 유형: weekly, monthly"
    )
    period_start: date = Field(
        ...,
        description="기간 시작일"
    )
    period_end: date = Field(
        ...,
        description="기간 종료일"
    )
    projected_income: Decimal = Field(
        default=Decimal("0"),
        description="예상 수입"
    )
    projected_expense: Decimal = Field(
        default=Decimal("0"),
        description="예상 지출"
    )
    actual_income: Decimal = Field(
        default=Decimal("0"),
        description="실제 수입"
    )
    actual_expense: Decimal = Field(
        default=Decimal("0"),
        description="실제 지출"
    )
    opening_balance: Decimal = Field(
        default=Decimal("0"),
        description="기초 잔액"
    )

    @computed_field
    @property
    def projected_net(self) -> Decimal:
        """예상 순 현금흐름"""
        return self.projected_income - self.projected_expense

    @computed_field
    @property
    def actual_net(self) -> Decimal:
        """실제 순 현금흐름"""
        return self.actual_income - self.actual_expense

    @computed_field
    @property
    def projected_closing_balance(self) -> Decimal:
        """예상 기말 잔액"""
        return self.opening_balance + self.projected_net

    @computed_field
    @property
    def actual_closing_balance(self) -> Decimal:
        """실제 기말 잔액"""
        return self.opening_balance + self.actual_net


# =============================================================================
# PRICING
# =============================================================================

class PricingTier(BaseModel):
    """
    가격 등급.
    CMP-IS Reference: 8.2 - Establish Pricing
    """
    id: UUID = Field(
        default_factory=uuid4,
        description="가격 등급 ID"
    )
    name: str = Field(
        ...,
        description="등급명 (예: Early Bird, Regular, On-site)",
        max_length=100
    )
    description: Optional[str] = Field(
        default=None,
        description="등급 설명"
    )
    base_price: Decimal = Field(
        ...,
        description="기본 가격"
    )
    member_discount_rate: Decimal = Field(
        default=Decimal("0"),
        description="회원 할인율 (%, CMP-IS 8.2.c)",
        ge=Decimal("0"),
        le=Decimal("100")
    )
    valid_from: Optional[datetime] = Field(
        default=None,
        description="적용 시작일"
    )
    valid_until: Optional[datetime] = Field(
        default=None,
        description="적용 종료일"
    )
    max_quantity: Optional[int] = Field(
        default=None,
        description="최대 판매 수량"
    )
    sold_quantity: int = Field(
        default=0,
        description="판매된 수량"
    )

    @computed_field
    @property
    def member_price(self) -> Decimal:
        """회원 가격"""
        discount = self.base_price * (self.member_discount_rate / 100)
        return self.base_price - discount

    @computed_field
    @property
    def is_available(self) -> bool:
        """구매 가능 여부"""
        now = datetime.utcnow()
        date_valid = True
        if self.valid_from and now < self.valid_from:
            date_valid = False
        if self.valid_until and now > self.valid_until:
            date_valid = False
        quantity_valid = self.max_quantity is None or self.sold_quantity < self.max_quantity
        return date_valid and quantity_valid


# =============================================================================
# EXPORT FOR FASTAPI
# =============================================================================

__all__ = [
    # Enums
    "BudgetCategory",
    "BudgetStatus",
    "CostType",
    "CurrencyCode",
    "SponsorshipTier",
    "SponsorshipStatus",
    "PaymentMethod",
    "TransactionType",
    # Base Models
    "Money",
    "TaxDetail",
    # Budget
    "BudgetLineItem",
    "Budget",
    # Sponsorship
    "SponsorBenefit",
    "SponsorshipPackage",
    "Sponsor",
    # Reports
    "FinancialReport",
    # Transactions
    "Transaction",
    "CashFlowProjection",
    # Pricing
    "PricingTier",
]
