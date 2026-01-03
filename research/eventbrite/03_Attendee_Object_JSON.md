# Eventbrite Attendee Object - JSON Schema

## 소스
- https://www.eventbrite.com/platform/docs/attendees

## Attendee Object 예시
```json
{
  "team": null,
  "costs": {
    "base_price": {
      "display": "CA$0.00",
      "currency": "CAD",
      "value": 0,
      "major_value": "0.00"
    },
    "eventbrite_fee": {
      "display": "CA$0.00",
      "currency": "CAD",
      "value": 0,
      "major_value": "0.00"
    },
    "gross": {
      "display": "CA$0.00",
      "currency": "CAD",
      "value": 0,
      "major_value": "0.00"
    }
  },
  "changed": "2018-11-02T22:36:48Z",
  "checkin_type": 0,
  "checkin_method": "search",
  "is_printed": false,
  "answers": [],
  "checked_in": true,
  "cancelled": false,
  "refunded": false,
  "affiliate": null,
  "guestlist_id": null,
  "invited_by": null,
  "status": "Checked In",
  "ticket_class_name": "General Admission",
  "delivery_method": "electronic",
  "event_id": "12345",
  "order_id": "123123123"
}
```

## 주요 필드

| Field | Type | Description |
|-------|------|-------------|
| `checked_in` | boolean | 체크인 여부 (true/false) |
| `status` | string | 체크인 상태 ("Checked In") |
| `cancelled` | boolean | 취소 여부 |
| `refunded` | boolean | 환불 여부 |
| `ticket_class_name` | string | 티켓 클래스 이름 |
| `delivery_method` | string | 티켓 전달 방식 |
| `event_id` | string | 이벤트 ID |
| `order_id` | string | 주문 ID |

## Costs Object

| Field | Description |
|-------|-------------|
| `base_price` | 기본 가격 |
| `eventbrite_fee` | Eventbrite 수수료 |
| `gross` | 총액 |

## 금액 Object 구조
```json
{
  "display": "CA$0.00",
  "currency": "CAD",
  "value": 0,
  "major_value": "0.00"
}
```

## Attendee Status 필터
- `attending` - 체크인 완료
- `not_attending` - 체크인 미완료
- `unpaid` - 미결제

## API 호출 예시

### 특정 Attendee 조회
```bash
curl -X GET \
  -H 'Authorization: Bearer PERSONAL_OAUTH_TOKEN' \
  https://www.eventbriteapi.com/v3/events/{event_id}/attendees/{attendee_id}/
```

### 체크인한 Attendees 조회
```bash
curl -X GET \
  -H 'Authorization: Bearer PERSONAL_OAUTH_TOKEN' \
  https://www.eventbriteapi.com/v3/events/{event_id}/attendees/?status=attending
```
