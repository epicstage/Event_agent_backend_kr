# Cvent REST API Documentation

## 소스
- https://developers.cvent.com/docs/rest-api/overview
- https://developers.cvent.com/docs/rest-api/reference/reference

## 주요 Data Models

### Event 관련 Objects
- Event
- EventParameters
- EventDetail
- Session
- Invitee
- Registration
- Guest
- EventEmailHistory
- Transaction
- Travel
- Budget
- BudgetItem
- EventQuestion
- Speaker
- TableAssignment

### RFP Objects
- RFP (Request for Proposal)
- Proposal
- Venue

### API 카테고리

#### Budget Management Calls
- CreateBudgetItem
- DeleteBudgetItem
- CreateConversionRate
- DeleteConversionRate

#### Meeting Request Management Calls
- CreateMeetingRequest
- UpdateMeetingRequest
- CreateApprover
- UpdateApprover
- DeleteApprover

#### RFP Management Calls
- RFP 생성/수정/조회

#### Attendee Management
- SendEmail
- Checkin
- UpdateRegistrationType
- UpdateInviteeInternalInfo
- UpdateGuestInfo
- SimpleEventRegistration
- SessionRegAction
- CreatePostEventFeedback
- CreateTransaction
- TransferInvitee
- ValidateInvitee

## REST API 특징
- JSON 포맷 사용
- OAuth 2.0 인증
- Workspace 기반 권한 관리
- Rate limiting 적용 (HTTP 429)
