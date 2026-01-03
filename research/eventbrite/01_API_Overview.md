# Eventbrite API Documentation

## 소스
- https://www.eventbrite.com/platform/docs/introduction
- https://www.eventbrite.com/platform/docs/api-basics
- https://www.eventbrite.com/platform/api

## API 특징
- REST API
- JSON 포맷 (UTF-8 인코딩, URL encoded values)
- OAuth 인증

## 주요 Objects

### Event Object
- 이벤트 생성, 수정, 삭제, 조회
- Organization이 소유

### Order Object
- 하나 이상의 Ticket Class에 대한 주문
- 단일 Order에 여러 티켓 포함 가능

### Attendee Object
- 이벤트 참석자 정보
- 티켓당 1 Attendee

### Organization Object
- 비즈니스 구조 (예: 마케팅 부서)
- 이벤트 생성 및 관리 단위
- 한 User가 소유, 여러 Member 가능

### Organizer Object
- 이벤트를 주최하는 공개 엔티티
- Eventbrite 계정 없음, 이벤트 소유하지 않음

### Venue Object
- 이벤트 장소 정보
- 주소 포함

### Ticket Class Object
- 티켓 유형 및 가격 정보

### Discount Object
- 티켓 구매 시 적용 가능한 할인

## HTTP Verbs

| Verb | Description | Example |
|------|-------------|---------|
| GET | 리소스 조회 | List all Events by Venue |
| POST | 리소스 생성/수정 | Create an Event |
| DELETE | 리소스 삭제 | Delete an Event |

## Webhooks
- Event, Order, Attendee, Organizer, Ticket Class, Venue 추적
