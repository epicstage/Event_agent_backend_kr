# Eventbrite API - Order Object 상세 스키마

## 소스
- https://www.eventbrite.com/platform/docs/orders
- https://www.eventbrite.com/platform/docs/order-lookup

---

## Order Object 개요

Order는 하나 이상의 Ticket Class에 대한 Eventbrite 주문을 나타냅니다.

### 핵심 특성
- 하나의 Order에 여러 티켓 포함 가능
- 기본적으로 **재무/거래 정보**만 반환
- **Private Object** - Order Owner 또는 Organization Member만 접근 가능
- Expansion을 통해 추가 데이터 조회

---

## API 엔드포인트

### 단일 Order 조회

```bash
GET https://www.eventbriteapi.com/v3/orders/{order_id}/
Authorization: Bearer PERSONAL_OAUTH_TOKEN
```

### Order 목록 조회

#### 1. 특정 Event의 Orders

```bash
GET https://www.eventbriteapi.com/v3/events/{event_id}/orders/
```

#### 2. 사용자가 구매한 Orders

```bash
GET https://www.eventbriteapi.com/v3/users/me/orders/
```

#### 3. Organization의 모든 Orders

```bash
GET https://www.eventbriteapi.com/v3/organizations/{organization_id}/orders/
```

---

## Query Parameters

### 공통 필터

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `active` - 참석 중<br>`inactive` - 미참석<br>`both` - 삭제 포함 전체<br>`all_not_deleted` - 삭제 제외 전체 |
| `changed_since` | datetime | 지정 시간 이후 변경된 주문<br>Format: `YYYY-MM-DDThh:mm:ssZ` |
| `only_emails` | array[string] | 특정 이메일 주소의 주문만 |
| `exclude_emails` | array[string] | 특정 이메일 주소 제외 |
| `last_item_seen` | string | 페이지네이션 - 해당 ID 이후 항목 |

### 시간 필터 (users/me/orders)

| Parameter | Type | Description |
|-----------|------|-------------|
| `time_filter` | string | `all` - 전체<br>`past` - 과거 이벤트<br>`current_future` - 현재/미래 이벤트 |

---

## Order Response Object

### 기본 필드

```json
{
  "id": "1234567890",
  "created": "2024-01-15T10:30:00Z",
  "changed": "2024-01-15T10:30:00Z",
  "name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "status": "placed",
  "resource_uri": "https://www.eventbriteapi.com/v3/orders/1234567890/"
}
```

### 재무 정보 필드

```json
{
  "costs": {
    "base_price": {
      "display": "$50.00",
      "currency": "USD",
      "value": 5000,
      "major_value": "50.00"
    },
    "eventbrite_fee": {
      "display": "$5.00",
      "currency": "USD",
      "value": 500,
      "major_value": "5.00"
    },
    "gross": {
      "display": "$55.00",
      "currency": "USD",
      "value": 5500,
      "major_value": "55.00"
    },
    "payment_fee": {
      "display": "$2.00",
      "currency": "USD",
      "value": 200,
      "major_value": "2.00"
    },
    "tax": {
      "display": "$0.00",
      "currency": "USD",
      "value": 0,
      "major_value": "0.00"
    }
  }
}
```

### Order Status Values

| Status | Description |
|--------|-------------|
| `placed` | 주문 완료 |
| `pending` | 처리 대기 중 |
| `refunded` | 환불됨 |
| `cancelled` | 취소됨 |

---

## Expansions

추가 데이터를 위한 expand 파라미터:

```bash
GET /events/{event_id}/orders/?expand=attendees
```

### 사용 가능한 Expansions

| Expansion | 포함 데이터 |
|-----------|------------|
| `attendees` | 주문에 포함된 참석자 목록 |
| `event` | 이벤트 상세 정보 |
| `ticket_classes` | 티켓 클래스 정보 |
| `promotional_code` | 적용된 프로모션 코드 |

### Expanded Order with Attendees

```json
{
  "id": "1234567890",
  "status": "placed",
  "attendees": [
    {
      "id": "attendee-1",
      "ticket_class_id": "ticket-class-uuid",
      "ticket_class_name": "General Admission",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "checked_in": false,
      "cancelled": false
    },
    {
      "id": "attendee-2",
      "ticket_class_id": "ticket-class-uuid",
      "ticket_class_name": "General Admission",
      "profile": {
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@example.com"
      },
      "checked_in": false,
      "cancelled": false
    }
  ]
}
```

---

## 페이지네이션

응답에 `pagination` 객체 포함:

```json
{
  "pagination": {
    "object_count": 150,
    "page_number": 1,
    "page_size": 50,
    "page_count": 3,
    "has_more_items": true
  },
  "orders": [...]
}
```

---

## 에러 응답

### 권한 없음 (403)

```json
{
  "status_code": 403,
  "error_description": "You do not have permission to access this order",
  "error": "FORBIDDEN"
}
```

### 찾을 수 없음 (404)

```json
{
  "status_code": 404,
  "error_description": "Order not found",
  "error": "NOT_FOUND"
}
```
