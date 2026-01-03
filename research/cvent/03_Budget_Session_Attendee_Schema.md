# Cvent REST API - Budget, Session, Attendee 상세 스키마

## 소스
- https://developers.cvent.com/docs/rest-api/migration-guide/object-mappings/budget
- https://developers.cvent.com/docs/rest-api/migration-guide/object-mappings/session
- https://developers.cvent.com/docs/rest-api/explanation/attendee-activities

---

## 1. Budget Object

Budget 객체는 **읽기 전용**이며, Create/Update 호출이 없습니다.

### Budget 필드 매핑 (SOAP → REST)

| SOAP Field | Type | Read-Only | Searchable | REST Field |
|------------|------|-----------|------------|------------|
| EventCode | String | ✓ | ✓ | N/A (Use event[].id) |
| EventTitle | String | ✓ | ✓ | N/A (Use event[].id) |
| DefaultGratuity | Money | ✓ | | N/A |
| DefaultGratuityType | String | ✓ | | N/A |
| ModifiedBy | String | ✓ | | lastModifiedBy |
| LastModifiedDate | DateTime | ✓ | ✓ | lastModifiedDate |

### Tax Detail 배열

| SOAP Field | Type | REST Field |
|------------|------|------------|
| TaxId | GUID | taxDetail[].id |
| Tax | Decimal | taxDetail[].tax |
| TaxType | String | taxDetail[].taxType |
| TaxName | String | taxDetail[].name |

### Cost Detail 배열

| SOAP Field | Type | REST Field |
|------------|------|------------|
| CategoryName | String | costDetail[].name |
| HighLevelEstimate | Money | totalHighLevelEstimate[].amount |
| AmountDetailId | GUID | costDetail[].id |
| AmountName | String | costDetail[].name |

---

## 2. Session Object

### Session 필드 매핑

| SOAP Field | Type | Read-Only | Searchable | REST Field |
|------------|------|-----------|------------|------------|
| EventId | GUID | ✓ | ✓ | event[].id |
| ProductName | String | | ✓ | title |
| ProductCode | String | | ✓ | code |
| ProductType | String | ✓ | | type[].id |
| StartTime | DateTime | | | start |
| EndTime | DateTime | | | end |
| DataTagCode | String | | | dataTagCode |
| ProductDescription | String | | | description |
| SessionLocationName | String | | | location[].name |

### Custom Fields

| SOAP Field | Type | REST Field |
|------------|------|------------|
| FieldType | String | customFields[].type |
| FieldValue | String | customFields[].value |

---

## 3. Attendee Activities API

### 개요
참석자의 이벤트 내 활동을 추적하고 분석하는 API 스위트.

### 공통 필드 (모든 Activity에 포함)

```json
{
  "attendeeId": "GUID",
  "eventId": "GUID",
  "createdDateTime": "2024-01-15T10:30:00Z",
  "type": "ActivityType",
  "name": "Display Name",
  "data": { }
}
```

### Activity Types

| Type | 설명 | Data 객체 내용 |
|------|------|---------------|
| SESSION_CHECKIN | 세션 체크인 | sessionId, sessionName |
| BADGE_SCAN | 배지 스캔 | boothId, scanTime |
| SURVEY_RESPONSE | 설문 응답 | surveyId, answers[] |
| CONTENT_VIEW | 콘텐츠 조회 | contentId, duration |

### API 엔드포인트

```
GET /attendee-activities
  - 모든 이벤트의 모든 참석자 활동 목록

GET /attendees/{id}/activities
  - 특정 참석자의 활동 목록
```

### 활용 사례

1. **리드 스코링**
   - 인구통계 + 디지털 마케팅 + 현장 활동 통합

2. **참여도 측정**
   - 전체 참석자 활동 집계로 이벤트 효과 분석

3. **CRM 연동**
   - 통합 고객 프로필 구축

---

## JSON 예시

### Budget Response

```json
{
  "id": "budget-uuid",
  "event": {
    "id": "event-uuid"
  },
  "lastModifiedBy": "user@example.com",
  "lastModifiedDate": "2024-01-15T10:00:00Z",
  "taxDetail": [
    {
      "id": "tax-uuid",
      "name": "Sales Tax",
      "tax": 8.5,
      "taxType": "PERCENTAGE"
    }
  ],
  "costDetail": [
    {
      "id": "cost-uuid",
      "name": "Venue Rental",
      "amount": 5000.00
    }
  ],
  "totalHighLevelEstimate": {
    "amount": 25000.00,
    "currency": "USD"
  }
}
```

### Session Response

```json
{
  "id": "session-uuid",
  "event": {
    "id": "event-uuid"
  },
  "title": "Keynote: Future of Events",
  "code": "KEYNOTE-001",
  "type": {
    "id": "general-session"
  },
  "start": "2024-03-15T09:00:00Z",
  "end": "2024-03-15T10:30:00Z",
  "description": "Opening keynote presentation",
  "location": {
    "name": "Main Ballroom"
  },
  "customFields": [
    {
      "type": "TEXT",
      "value": "Custom Value"
    }
  ]
}
```

### Attendee Activity Response

```json
{
  "attendeeId": "attendee-uuid",
  "eventId": "event-uuid",
  "createdDateTime": "2024-03-15T09:15:00Z",
  "type": "SESSION_CHECKIN",
  "name": "Session Check-in",
  "data": {
    "sessionId": "session-uuid",
    "sessionName": "Keynote: Future of Events",
    "checkInMethod": "BADGE_SCAN"
  }
}
```
