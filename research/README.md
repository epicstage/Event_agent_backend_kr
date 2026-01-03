# Event Agent Research Materials

이벤트 관리 에이전트 개발을 위한 업계 표준 자료 모음

## 폴더 구조

```
research/
├── cvent/              # Cvent REST API 문서
├── eventbrite/         # Eventbrite API 문서
├── eic_apex/           # EIC APEX 표준 자료
├── embok/              # EMBOK 프레임워크
├── PAID_RESOURCES.md   # 유료 구매 필요 자료 목록
└── README.md
```

---

## 1. Cvent REST API (`cvent/`)
- **목적**: JSON 데이터 구조 확보
- **내용**:
  - `01_API_Overview.md` - API 구조 및 주요 객체
  - `02_RFP_Objects_JSON.md` - RFP 관련 JSON 스키마
  - `03_Budget_Session_Attendee_Schema.md` - Budget/Session/Attendee 상세 스키마 ⭐NEW

### 주요 객체
- Budget, Attendee, Session, RFP
- Event, Registration, Transaction
- Attendee Activities (행동 추적)

---

## 2. Eventbrite API (`eventbrite/`)
- **목적**: 이벤트 플랫폼 데이터 모델 참조
- **내용**:
  - `01_API_Overview.md` - API 기본 개념
  - `02_Event_Object_JSON.md` - Event 객체 스키마
  - `03_Attendee_Object_JSON.md` - Attendee 객체 스키마
  - `04_Order_Object_Schema.md` - Order 객체 상세 스키마 ⭐NEW

### 주요 객체
- Event, Order, Attendee, Organization, Venue
- Ticket Class, Costs, Pagination

---

## 3. EIC APEX (`eic_apex/`)
- **목적**: 업계 표준 용어 및 양식 확보
- **내용**:
  - `01_APEX_Overview.md` - APEX 이니셔티브 개요
  - `02_Post_Event_Report_Template.md` - 결과보고서 템플릿
  - `03_APEX_Glossary_Excerpt.md` - 주요 용어집 발췌 (A-C)
  - `04_APEX_Templates_Links.md` - 다운로드 가능 템플릿 링크 ⭐NEW

### 다운로드 가능 템플릿
| 파일 | 형식 | 상태 |
|------|------|------|
| Post-Event Report | PDF | ✅ 가능 |
| Event Specifications Guide | PDF | ✅ 가능 |
| Single Facility RFP | PDF | ✅ 가능 |
| Transportation RFP | DOC | ✅ 가능 |

---

## 4. EMBOK (`embok/`)
- **목적**: 에이전트 역할 분담 기준
- **내용**:
  - `01_EMBOK_Overview.md` - EMBOK 프레임워크 개요
  - `02_EMBOK_5x5_Matrix.md` - 5x5 지식 영역 매트릭스
  - `03_EMBOK_Phases_Processes.md` - Phases & Processes 상세 ⭐NEW
  - `04_EMBOK_Domain_Taxonomy.md` - Domain 분류체계 상세 ⭐NEW

### 5대 Knowledge Domains
1. **Administration** - 관리/행정 (재무, 인사, 조달)
2. **Design** - 디자인 (콘텐츠, 환경, 프로덕션)
3. **Marketing** - 마케팅 (홍보, 판매, 스폰서십)
4. **Operations** - 운영 (참석자, 장소, 물류)
5. **Risk** - 리스크 관리 (안전, 법률, 보안)

### 5단계 Phases
1. Initiation → 2. Planning → 3. Implementation → 4. Event → 5. Closure

### 5가지 Processes
Assess → Select → Monitor → Integrate → Document

---

## 5. 유료 자료 (`PAID_RESOURCES.md`)

### 구매 권장 (필수)
| 자료 | 가격 | 용도 |
|------|------|------|
| EIC Glossary 2019 (Digital) | $25.95 | 용어 표준화 |
| EIC Manual 9th Ed (Digital) | $69.95 | 전체 프로세스 |
| **합계** | **$95.90** | |

---

## 활용 방안

### 데이터 스키마 설계
- Cvent/Eventbrite JSON 구조 참조
- APEX 용어로 변수명 통일
- Budget, Session, Attendee, Order 객체 매핑

### 에이전트 역할 분담
```
EMBOK 5 Domains → 5개 전문 에이전트

Administration Agent (예산, 인력, 조달)
Design Agent (콘텐츠, 프로그램, 테마)
Marketing Agent (홍보, 판매, 스폰서)
Operations Agent (참석자, 물류, 현장)
Risk Agent (안전, 법률, 비상대응)
```

### 표준 양식 활용
- RFP 템플릿 → 제안서 자동 생성
- Post-Event Report → 결과보고서 자동화
- Event Specifications → 운영 지침서

---

## 원본 소스

| 자료 | URL |
|------|-----|
| Cvent Developer | https://developers.cvent.com/docs |
| Eventbrite Platform | https://www.eventbrite.com/platform/docs |
| EIC Resources | https://eventscouncil.org |
| EIC Insights | https://insights.eventscouncil.org |
| EMBOK Project | https://www.embok.org/juliasilvers/embok.html |
| APEX Glossary PDF (2005) | http://mmiresource.hotelpros.biz/doc-folder/Guest_services/Glossary_CIC.pdf |

---

## 수집 현황

| 카테고리 | 파일 수 | 상태 |
|----------|---------|------|
| Cvent API | 3 | ✅ 완료 |
| Eventbrite API | 4 | ✅ 완료 |
| EIC APEX | 4 | ✅ 완료 |
| EMBOK | 4 | ✅ 완료 |
| **총계** | **15** | |

---
*최종 업데이트: 2026-01-02*
