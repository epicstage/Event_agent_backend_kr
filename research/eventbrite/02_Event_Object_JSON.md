# Eventbrite Event Object - JSON Schema

## 소스
- https://www.eventbrite.com/platform/docs/events
- https://www.eventbrite.com/platform/docs/create-events

## Event 생성 필수 필드

| Field | Type | Description |
|-------|------|-------------|
| `name` | `multipart-text` | 이벤트 이름 (title) |
| `start` | `datetime-tz` | 시작 일시 (미래 날짜) |
| `end` | `datetime-tz` | 종료 일시 (시작 이후) |
| `currency` | `string` | ISO 4217 통화 코드 |

## multipart-text Type
```json
{
  "html": "My New Event",
  "text": "My New Event"
}
```

## datetime-tz Type
```json
{
  "timezone": "America/Los_Angeles",
  "utc": "2019-12-01T02:00:00Z"
}
```

## Event 생성 예시
```json
{
  "event": {
    "name": {
      "html": "My New Event"
    },
    "start": {
      "timezone": "America/Los_Angeles",
      "utc": "2019-12-01T02:00:00Z"
    },
    "end": {
      "timezone": "America/Los_Angeles",
      "utc": "2019-12-01T05:00:00Z"
    },
    "currency": "USD"
  }
}
```

## Ticket Classes (ticket_classes expansion)
```json
{
  "ticket_classes": [
    {
      "resource_uri": "https://...",
      "variant_id": null,
      "name": "test",
      "description": null,
      "donation": false,
      "free": true,
      "minimum_quantity": 1,
      "maximum_quantity": null,
      "maximum_quantity_per_order": 10,
      "maximum_quantity_per_order_without_pending": null,
      "on_sale_status": "AVAILABLE",
      "quantity_total": 100
    }
  ]
}
```

## Ticket Availability Object
```json
{
  "ticket_availability": {
    "has_available_tickets": true,
    "minimum_ticket_price": {
      "currency": "USD",
      "value": 100,
      "major_value": "1.00",
      "display": "1.00 USD"
    },
    "maximum_ticket_price": {
      "currency": "USD",
      "value": 100,
      "major_value": "1.00",
      "display": "1.00 USD"
    },
    "is_sold_out": false,
    "start_sales_date": {}
  }
}
```

## Ticket Class 생성
```json
{
  "ticket_class": {
    "name": "VIP",
    "quantity_total": 100,
    "cost": "USD,1000"
  }
}
```

## Expansions (추가 정보 조회)

| Expansion | Source | Description |
|-----------|--------|-------------|
| `venue` | `venue_id` | 상세 장소 정보 (주소 포함) |
| `organizer` | `organizer_id` | 이벤트 스폰서 정보 |
| `format` | `format_id` | 이벤트 형식 (conference, seminar, concert) |
| `category` | `category_id` | 이벤트 카테고리 (Music 등) |
