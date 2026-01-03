"""
Financial Management API Router

이벤트 재무 관리 API 엔드포인트.
- CMP-IS Domain D (Skills 7, 8, 9) 준수
- In-Memory 저장소 (MVP 단계)

Author: Event Agent System
"""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from schemas.financial import (
    BudgetLineItem,
    BudgetCategory,
    BudgetStatus,
    CostType,
    CurrencyCode,
    FinancialReport,
    SponsorshipPackage,
    SponsorshipTier,
    Sponsor,
    SponsorshipStatus,
)


# =============================================================================
# ROUTER SETUP
# =============================================================================

router = APIRouter(
    prefix="/finance",
    tags=["Financial Management"],
    responses={404: {"description": "Not found"}},
)


# =============================================================================
# IN-MEMORY STORAGE
# =============================================================================

# 예산 항목 저장소
budget_items_db: List[BudgetLineItem] = []

# 스폰서십 패키지 저장소
sponsorship_packages_db: List[SponsorshipPackage] = []

# 스폰서 저장소
sponsors_db: List[Sponsor] = []

# 리포트 저장소
reports_db: List[FinancialReport] = []


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class BudgetItemCreate(BaseModel):
    """예산 항목 생성 요청"""
    event_id: UUID = Field(..., description="이벤트 ID")
    category: BudgetCategory = Field(..., description="예산 카테고리")
    name: str = Field(..., description="항목명", max_length=200)
    description: Optional[str] = Field(None, description="상세 설명")
    vendor_name: Optional[str] = Field(None, description="공급업체명")
    cost_type: CostType = Field(default=CostType.VARIABLE, description="고정비/변동비")
    unit_cost: Decimal = Field(..., description="단가", ge=0)
    quantity: Decimal = Field(default=Decimal("1"), description="수량", ge=0)
    currency: CurrencyCode = Field(default=CurrencyCode.USD, description="통화")
    payment_due_date: Optional[date] = Field(None, description="결제 예정일")
    notes: Optional[str] = Field(None, description="비고")


class BudgetItemUpdate(BaseModel):
    """예산 항목 수정 요청"""
    category: Optional[BudgetCategory] = None
    name: Optional[str] = None
    description: Optional[str] = None
    vendor_name: Optional[str] = None
    cost_type: Optional[CostType] = None
    unit_cost: Optional[Decimal] = None
    quantity: Optional[Decimal] = None
    actual_amount: Optional[Decimal] = None
    status: Optional[BudgetStatus] = None
    notes: Optional[str] = None


class ReportGenerateRequest(BaseModel):
    """리포트 생성 요청"""
    event_id: UUID = Field(..., description="이벤트 ID")
    report_name: str = Field(
        default="Financial Summary Report",
        description="리포트명"
    )
    period_start: date = Field(..., description="기간 시작일")
    period_end: date = Field(..., description="기간 종료일")
    total_attendees: int = Field(default=0, description="총 참석자 수")
    paid_attendees: int = Field(default=0, description="유료 참석자 수")


class BudgetSummary(BaseModel):
    """예산 요약"""
    total_items: int
    total_projected: Decimal
    total_actual: Decimal
    total_variance: Decimal
    by_category: dict
    by_status: dict


# =============================================================================
# BUDGET ENDPOINTS
# =============================================================================

@router.post(
    "/budget-items",
    response_model=BudgetLineItem,
    status_code=201,
    summary="예산 항목 추가",
    description="""
새로운 예산 항목을 추가합니다.

**CMP-IS Reference**: Skill 8.1.e - Allocating budget amounts

**입력**: 카테고리, 항목명, 단가, 수량 등
**출력**: 생성된 예산 항목 (ID, 예상금액 자동 계산)
    """
)
async def create_budget_item(item: BudgetItemCreate) -> BudgetLineItem:
    """예산 항목 생성"""
    # projected_amount 자동 계산
    projected = item.unit_cost * item.quantity

    budget_item = BudgetLineItem(
        event_id=item.event_id,
        category=item.category,
        name=item.name,
        description=item.description,
        vendor_name=item.vendor_name,
        cost_type=item.cost_type,
        unit_cost=item.unit_cost,
        quantity=item.quantity,
        projected_amount=projected,
        actual_amount=Decimal("0"),
        currency=item.currency,
        status=BudgetStatus.DRAFT,
        payment_due_date=item.payment_due_date,
        notes=item.notes,
    )

    budget_items_db.append(budget_item)
    return budget_item


@router.get(
    "/budget-items",
    response_model=List[BudgetLineItem],
    summary="예산 항목 전체 조회",
    description="""
저장된 모든 예산 항목을 조회합니다.

**필터링 옵션**:
- `event_id`: 특정 이벤트의 항목만 조회
- `category`: 특정 카테고리만 조회
- `status`: 특정 상태만 조회
    """
)
async def list_budget_items(
    event_id: Optional[UUID] = Query(None, description="이벤트 ID로 필터"),
    category: Optional[BudgetCategory] = Query(None, description="카테고리로 필터"),
    status: Optional[BudgetStatus] = Query(None, description="상태로 필터"),
) -> List[BudgetLineItem]:
    """예산 항목 목록 조회"""
    result = budget_items_db

    if event_id:
        result = [i for i in result if i.event_id == event_id]
    if category:
        result = [i for i in result if i.category == category]
    if status:
        result = [i for i in result if i.status == status]

    return result


@router.get(
    "/budget-items/{item_id}",
    response_model=BudgetLineItem,
    summary="예산 항목 단일 조회",
    description="ID로 특정 예산 항목을 조회합니다."
)
async def get_budget_item(item_id: UUID) -> BudgetLineItem:
    """예산 항목 단일 조회"""
    for item in budget_items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail=f"Budget item {item_id} not found")


@router.patch(
    "/budget-items/{item_id}",
    response_model=BudgetLineItem,
    summary="예산 항목 수정",
    description="""
기존 예산 항목을 수정합니다.

**주요 사용 케이스**:
- 실제 지출액(actual_amount) 입력
- 상태 변경 (DRAFT → APPROVED → PAID)
- 수량/단가 조정

**CMP-IS Reference**: Skill 8.3 - Monitor and revise budget
    """
)
async def update_budget_item(item_id: UUID, update: BudgetItemUpdate) -> BudgetLineItem:
    """예산 항목 수정"""
    for i, item in enumerate(budget_items_db):
        if item.id == item_id:
            # 업데이트할 필드만 적용
            update_data = update.model_dump(exclude_unset=True)
            updated_item = item.model_copy(update=update_data)

            # unit_cost나 quantity가 변경되면 projected_amount 재계산
            if "unit_cost" in update_data or "quantity" in update_data:
                updated_item = updated_item.model_copy(
                    update={"projected_amount": updated_item.unit_cost * updated_item.quantity}
                )

            updated_item = updated_item.model_copy(update={"updated_at": datetime.utcnow()})
            budget_items_db[i] = updated_item
            return updated_item

    raise HTTPException(status_code=404, detail=f"Budget item {item_id} not found")


@router.delete(
    "/budget-items/{item_id}",
    status_code=204,
    summary="예산 항목 삭제",
    description="예산 항목을 삭제합니다."
)
async def delete_budget_item(item_id: UUID):
    """예산 항목 삭제"""
    for i, item in enumerate(budget_items_db):
        if item.id == item_id:
            budget_items_db.pop(i)
            return
    raise HTTPException(status_code=404, detail=f"Budget item {item_id} not found")


@router.get(
    "/budget-items/summary/{event_id}",
    response_model=BudgetSummary,
    summary="예산 요약 조회",
    description="""
특정 이벤트의 예산 요약 정보를 조회합니다.

**포함 정보**:
- 총 항목 수
- 총 예상/실제 금액
- 카테고리별 집계
- 상태별 집계
    """
)
async def get_budget_summary(event_id: UUID) -> BudgetSummary:
    """예산 요약"""
    items = [i for i in budget_items_db if i.event_id == event_id]

    if not items:
        return BudgetSummary(
            total_items=0,
            total_projected=Decimal("0"),
            total_actual=Decimal("0"),
            total_variance=Decimal("0"),
            by_category={},
            by_status={},
        )

    total_projected = sum(i.projected_amount for i in items)
    total_actual = sum(i.actual_amount for i in items)

    by_category = {}
    for item in items:
        cat = item.category.value
        if cat not in by_category:
            by_category[cat] = {"projected": Decimal("0"), "actual": Decimal("0"), "count": 0}
        by_category[cat]["projected"] += item.projected_amount
        by_category[cat]["actual"] += item.actual_amount
        by_category[cat]["count"] += 1

    by_status = {}
    for item in items:
        st = item.status.value
        by_status[st] = by_status.get(st, 0) + 1

    return BudgetSummary(
        total_items=len(items),
        total_projected=total_projected,
        total_actual=total_actual,
        total_variance=total_projected - total_actual,
        by_category={k: {"projected": float(v["projected"]), "actual": float(v["actual"]), "count": v["count"]} for k, v in by_category.items()},
        by_status=by_status,
    )


# =============================================================================
# REPORT ENDPOINTS
# =============================================================================

@router.post(
    "/reports/generate",
    response_model=FinancialReport,
    status_code=201,
    summary="재무 리포트 생성",
    description="""
저장된 예산 항목들을 기반으로 재무 리포트를 자동 생성합니다.

**자동 계산 항목**:
- 총 예산 / 실제 지출
- ROI 백분율
- 참석자당 비용

**CMP-IS Reference**: Skill 8.3.i - Completing financial reports
    """
)
async def generate_report(request: ReportGenerateRequest) -> FinancialReport:
    """재무 리포트 생성"""
    # 해당 이벤트의 예산 항목 필터링
    event_items = [i for i in budget_items_db if i.event_id == request.event_id]

    # 금액 집계
    total_budget = sum(i.projected_amount for i in event_items)
    total_actual = sum(i.actual_amount for i in event_items)

    # 스폰서십 수익 계산 (해당 이벤트)
    event_sponsors = [s for s in sponsors_db if s.status == SponsorshipStatus.CONTRACTED]
    total_sponsorship = sum(s.committed_amount for s in event_sponsors)

    report = FinancialReport(
        event_id=request.event_id,
        report_name=request.report_name,
        period_start=request.period_start,
        period_end=request.period_end,
        total_registration_revenue=Decimal("0"),  # TODO: 등록 시스템 연동
        total_sponsorship_revenue=total_sponsorship,
        total_exhibit_revenue=Decimal("0"),  # TODO: 전시 시스템 연동
        total_other_revenue=Decimal("0"),
        total_budget=total_budget,
        total_actual=total_actual,
        total_attendees=request.total_attendees,
        paid_attendees=request.paid_attendees,
    )

    reports_db.append(report)
    return report


@router.get(
    "/reports",
    response_model=List[FinancialReport],
    summary="리포트 목록 조회",
    description="생성된 모든 리포트를 조회합니다."
)
async def list_reports(
    event_id: Optional[UUID] = Query(None, description="이벤트 ID로 필터"),
) -> List[FinancialReport]:
    """리포트 목록 조회"""
    if event_id:
        return [r for r in reports_db if r.event_id == event_id]
    return reports_db


@router.get(
    "/reports/{report_id}",
    response_model=FinancialReport,
    summary="리포트 상세 조회",
    description="특정 리포트를 조회합니다."
)
async def get_report(report_id: UUID) -> FinancialReport:
    """리포트 상세 조회"""
    for report in reports_db:
        if report.id == report_id:
            return report
    raise HTTPException(status_code=404, detail=f"Report {report_id} not found")


# =============================================================================
# SPONSORSHIP ENDPOINTS
# =============================================================================

@router.post(
    "/sponsorship-packages",
    response_model=SponsorshipPackage,
    status_code=201,
    summary="스폰서십 패키지 생성",
    description="""
새로운 스폰서십 패키지를 생성합니다.

**CMP-IS Reference**: Skill 7.1.e - Producing sponsor benefit packages
    """
)
async def create_sponsorship_package(
    event_id: UUID,
    tier: SponsorshipTier,
    tier_name: str,
    amount: Decimal,
    max_sponsors: int = 1,
    currency: CurrencyCode = CurrencyCode.USD,
) -> SponsorshipPackage:
    """스폰서십 패키지 생성"""
    package = SponsorshipPackage(
        event_id=event_id,
        tier=tier,
        tier_name=tier_name,
        amount=amount,
        max_sponsors=max_sponsors,
        currency=currency,
    )
    sponsorship_packages_db.append(package)
    return package


@router.get(
    "/sponsorship-packages",
    response_model=List[SponsorshipPackage],
    summary="스폰서십 패키지 목록",
    description="모든 스폰서십 패키지를 조회합니다."
)
async def list_sponsorship_packages(
    event_id: Optional[UUID] = Query(None),
) -> List[SponsorshipPackage]:
    """스폰서십 패키지 목록"""
    if event_id:
        return [p for p in sponsorship_packages_db if p.event_id == event_id]
    return sponsorship_packages_db


@router.post(
    "/sponsors",
    response_model=Sponsor,
    status_code=201,
    summary="스폰서 등록",
    description="""
새로운 스폰서를 등록합니다.

**CMP-IS Reference**: Skill 7.1.d - Identifying potential sponsors
    """
)
async def create_sponsor(
    company_name: str,
    industry: str,
    contact_name: str,
    contact_email: str,
    contact_phone: Optional[str] = None,
) -> Sponsor:
    """스폰서 등록"""
    sponsor = Sponsor(
        company_name=company_name,
        industry=industry,
        contact_name=contact_name,
        contact_email=contact_email,
        contact_phone=contact_phone,
    )
    sponsors_db.append(sponsor)
    return sponsor


@router.get(
    "/sponsors",
    response_model=List[Sponsor],
    summary="스폰서 목록",
    description="등록된 모든 스폰서를 조회합니다."
)
async def list_sponsors(
    status: Optional[SponsorshipStatus] = Query(None),
) -> List[Sponsor]:
    """스폰서 목록"""
    if status:
        return [s for s in sponsors_db if s.status == status]
    return sponsors_db


@router.patch(
    "/sponsors/{sponsor_id}/status",
    response_model=Sponsor,
    summary="스폰서 상태 변경",
    description="""
스폰서의 진행 상태를 변경합니다.

**상태 흐름**: PROSPECT → CONTACTED → NEGOTIATING → COMMITTED → CONTRACTED → FULFILLED
    """
)
async def update_sponsor_status(
    sponsor_id: UUID,
    status: SponsorshipStatus,
    committed_amount: Optional[Decimal] = None,
    package_id: Optional[UUID] = None,
) -> Sponsor:
    """스폰서 상태 변경"""
    for i, sponsor in enumerate(sponsors_db):
        if sponsor.id == sponsor_id:
            update_data = {"status": status}
            if committed_amount is not None:
                update_data["committed_amount"] = committed_amount
            if package_id is not None:
                update_data["package_id"] = package_id
            if status == SponsorshipStatus.CONTRACTED:
                update_data["contract_signed_at"] = datetime.utcnow()

            updated = sponsor.model_copy(update=update_data)
            sponsors_db[i] = updated
            return updated

    raise HTTPException(status_code=404, detail=f"Sponsor {sponsor_id} not found")


# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@router.delete(
    "/reset",
    status_code=204,
    summary="데이터 초기화 (개발용)",
    description="In-Memory 저장소의 모든 데이터를 초기화합니다. 개발/테스트 용도."
)
async def reset_all_data():
    """모든 데이터 초기화"""
    budget_items_db.clear()
    sponsorship_packages_db.clear()
    sponsors_db.clear()
    reports_db.clear()
    return None
