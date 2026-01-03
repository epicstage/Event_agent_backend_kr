# Financial Management - Atomic Task Decomposition

## Overview
- **Domain**: EMBOK Administration > Financial Management
- **CMP-IS Reference**: Domain D (Skills 7, 8, 9)
- **Scope**: 이벤트 재무 관리의 모든 태스크를 원자 단위로 분해

---

## Task Classification Criteria

| Classification | Definition | Examples |
|---------------|------------|----------|
| **AI** | 데이터 처리, 계산, 패턴 인식, 자동화 가능 | 예산 계산, 데이터 추출, 비교 분석 |
| **Human** | 판단, 협상, 법적 책임, 관계 구축 필요 | 계약 협상, 스폰서 미팅, 최종 승인 |
| **Hybrid** | AI 보조 + 인간 검토/결정 | 예산안 작성(AI) + 승인(Human) |

---

## Skill 7: Manage Event Funding and Financial Resources

### Sub-Skill 7.1: Develop Budgeting Processes for Funding

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-001 | 스폰서십 프로그램 재정 가치 산정 | AI | 스폰서 혜택 목록, 시장 벤치마크 | 금전/현물 가치 평가표 | CMP-IS 7.1.a |
| FIN-002 | 스폰서 혜택 제공 비용 추정 | AI | 혜택 항목별 원가, 수량 | 혜택별 예상 비용 | CMP-IS 7.1.a |
| FIN-003 | 이해관계자 스폰서십 승인 획득 | Human | 스폰서십 제안서 | 승인/거부 결정 | CMP-IS 7.1.b |
| FIN-004 | 스폰서십 법적 검토 요청 | Hybrid | 스폰서 계약 초안 | 법적 의견서 | CMP-IS 7.1.c |
| FIN-005 | 잠재 스폰서 후보 식별 | AI | 이벤트 유형, 타겟 산업, 과거 스폰서 DB | 스폰서 후보 리스트 (순위화) | CMP-IS 7.1.d |
| FIN-006 | 스폰서 적합성 분석 (이벤트 호환성) | AI | 스폰서 브랜드 정보, 이벤트 성격 | 적합성 점수 및 이유 | CMP-IS 7.1.d |
| FIN-007 | 스폰서 독점권 충돌 검사 | AI | 기존 스폰서 계약, 신규 후보 산업 | 충돌 여부 및 상세 | CMP-IS 7.1.h |
| FIN-008 | 스폰서 혜택 패키지 문서 생성 | AI | 이벤트 개요, 참석자 인구통계, ROI 데이터 | 스폰서 제안서 PDF | CMP-IS 7.1.e |
| FIN-009 | 스폰서 제안서 배포 | AI | 스폰서 연락처, 제안서 | 발송 확인 및 추적 | CMP-IS 7.1.f |
| FIN-010 | 잠재 스폰서 1차 접촉 | Human | 스폰서 연락처, 스크립트 | 미팅 일정 또는 거절 기록 | CMP-IS 7.1.g |
| FIN-011 | 스폰서 지원 유형 파악 | Human | 스폰서 미팅 노트 | 현금/할인/제품 지원 유형 | CMP-IS 7.1.g |
| FIN-012 | 스폰서 커밋먼트 협상 | Human | 스폰서 요구사항, 이벤트 제공 가능 혜택 | 협상 결과 (합의 조건) | CMP-IS 7.1.g |
| FIN-013 | 스폰서 계약서 초안 작성 | Hybrid | 협상 결과, 표준 계약 템플릿 | 스폰서 계약서 초안 | CMP-IS 7.1.i |
| FIN-014 | 스폰서 관계 유지 (정기 업데이트) | Hybrid | 이벤트 진행 상황 | 스폰서 뉴스레터/리포트 | CMP-IS 7.1.j |
| FIN-015 | 스폰서 계약 이행 추적 | AI | 계약 조건, 실행 현황 | 이행률 리포트 | CMP-IS 7.1.k |
| FIN-016 | 스폰서 ROI 평가 (스폰서 관점) | AI | 스폰서 노출 데이터, 리드 수 | ROI 분석 리포트 | CMP-IS 7.1.l |

### Sub-Skill 7.2: Develop and Manage Registration Process

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-017 | 등록 재정 목표 설정 | Hybrid | 과거 등록 데이터, 이벤트 예산 | 등록 수익 목표액 | CMP-IS 7.2.a |
| FIN-018 | 과거 등록 리스트 분석 | AI | 이전 이벤트 등록 DB | 등록 패턴 분석 리포트 | CMP-IS 7.2.b |
| FIN-019 | 잠재 참석자 유형 식별 | AI | 타겟 오디언스 정의, 과거 데이터 | 참석자 세그먼트 목록 | CMP-IS 7.2.a |
| FIN-020 | 등록 사전 안내 패킷 생성 | AI | 이벤트 정보, 요금, 일정 | 등록 안내 문서 | CMP-IS 7.2.b |
| FIN-021 | 등록 시스템 공급자 식별 | AI | 요구사항, 시장 공급자 DB | 후보 업체 비교표 | CMP-IS 7.2.c |

### Sub-Skill 7.3: Develop and Manage Exhibit Sales

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-022 | 전시 요금 설정 | Hybrid | 공간 원가, 시장 벤치마크 | 전시 부스별 요금표 | CMP-IS 7.3.a |
| FIN-023 | 잠재 전시업체 식별 | AI | 이벤트 산업, 과거 전시자 DB | 전시업체 후보 리스트 | CMP-IS 7.3.b |
| FIN-024 | 전시자 혜택 패키지 생성 | AI | 이벤트 정보, 참석자 통계 | 전시 제안서 (Prospectus) | CMP-IS 7.3.c |
| FIN-025 | 전시자 계약 협상 | Human | 전시자 요구, 가용 공간 | 계약 조건 합의 | CMP-IS 7.3.e |
| FIN-026 | 전시자 관계 관리 | Hybrid | 전시자 피드백 | 만족도 리포트, 개선안 | CMP-IS 7.3.f |

### Sub-Skill 7.4: Manage Additional Revenue Sources

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-027 | 광고 수익 기회 분석 | AI | 이벤트 자산 (앱, 웹, 인쇄물) | 광고 슬롯 및 예상 수익 | CMP-IS 7.4.a |
| FIN-028 | 머천다이징 아이템 기획 | Hybrid | 이벤트 테마, 타겟 오디언스 | 굿즈 아이템 목록 및 예상 마진 | CMP-IS 7.4.b |
| FIN-029 | 커미션 요율 협상 | Human | 파트너 제안, 시장 표준 | 합의된 커미션 요율 | CMP-IS 7.4.c |
| FIN-030 | 로열티 요율 결정 | Hybrid | 라이선스 대상, 사용 범위 | 로열티 요율표 | CMP-IS 7.4.d |

---

## Skill 8: Manage Budget

### Sub-Skill 8.1: Develop Budget

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-031 | 예산 포맷 및 카테고리 정의 | Hybrid | 이벤트 유형, 조직 표준 | 예산 템플릿 | CMP-IS 8.1.a |
| FIN-032 | 과거 예산/감사 데이터 수집 | AI | 이전 이벤트 재무 DB | 과거 예산 데이터셋 | CMP-IS 8.1.b |
| FIN-033 | 내외부 예산 영향 요인 분석 | AI | 법규 변경, 시장 트렌드 | 영향 요인 리포트 | CMP-IS 8.1.c |
| FIN-034 | 수익원 목록화 | AI | 이벤트 자산, 스폰서, 등록 | 수익원별 예상 금액 | CMP-IS 8.1.d |
| FIN-035 | 비용 항목별 예산 배정 | AI | 프로그램, 마케팅, HR 등 항목 | 항목별 배정 예산 | CMP-IS 8.1.e |
| FIN-036 | 예비비(Contingency) 설정 | Hybrid | 총 예산, 리스크 평가 | 예비비 금액 및 사용 조건 | CMP-IS 8.1.f |
| FIN-037 | 주간/월간 현금흐름 예측 | AI | 수익/지출 타이밍 | 현금흐름 프로젝션 차트 | CMP-IS 8.1.g |
| FIN-038 | 고정비/변동비 분류 | AI | 비용 항목 리스트 | 비용 유형 분류표 | CMP-IS 8.1.h |
| FIN-039 | 예산 통제 가이드라인 준수 검토 | AI | 조직 정책, 예산안 | 준수 여부 체크리스트 | CMP-IS 8.1.i |
| FIN-040 | 정기 예산 검토 일정 수립 | Hybrid | 이벤트 타임라인 | 예산 검토 스케줄 | CMP-IS 8.1.j |
| FIN-041 | 예산 승인 요청 | Human | 예산안, 경영진 연락처 | 승인/수정 요청 결과 | CMP-IS 8.1.k |
| FIN-042 | 예산 결정 사항 공유 | Hybrid | 승인된 예산 | 팀별 예산 공유 문서 | CMP-IS 8.1.l |

### Sub-Skill 8.2: Establish Pricing

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-043 | 이익 요구사항 및 마진 분석 | AI | 목표 수익률, 비용 구조 | 필요 마진율 | CMP-IS 8.2.a |
| FIN-044 | 판매 원가 계산 | AI | 상품/서비스별 원가 | 원가 명세서 | CMP-IS 8.2.b |
| FIN-045 | 고객 프로파일 분석 | AI | 과거 참석자 데이터 | 고객 세그먼트별 지불 의향 | CMP-IS 8.2.c |
| FIN-046 | 소비자 물가지수 트렌드 반영 | AI | CPI 데이터 | 가격 조정 권고안 | CMP-IS 8.2.d |
| FIN-047 | 다국적 행사 환율/카드 수수료 분석 | AI | 환율 데이터, 카드 수수료율 | 가격 책정 시 반영 금액 | CMP-IS 8.2.e,f,g |
| FIN-048 | 현지 세금 구조 분석 | AI | 개최지 세법 | 세금 반영 가격 | CMP-IS 8.2.h |
| FIN-049 | 시장 가치 인식 조사 | Hybrid | 설문 데이터, 경쟁사 가격 | 적정 가격대 분석 | CMP-IS 8.2.i |
| FIN-050 | 가격 구조 수립 (회원 할인 등) | Hybrid | 원가, 마진, 정책 | 최종 가격표 | CMP-IS 8.2.c |

### Sub-Skill 8.3: Monitor and Revise Budget

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-051 | 예산 vs 실적 비교 | AI | 예산안, 실제 수입/지출 | 차이 분석 리포트 | CMP-IS 8.3.c |
| FIN-052 | 예산 이탈(Variance) 원인 파악 | Hybrid | 차이 분석 리포트 | 원인 분석 및 대응안 | CMP-IS 8.3.d |
| FIN-053 | 예산 개선 기회 식별 | AI | 공급자 DB, 수익 트렌드 | 개선 아이디어 리스트 | CMP-IS 8.3.e |
| FIN-054 | 수정 예산 승인 요청 | Human | 수정 예산안 | 승인 결과 | CMP-IS 8.3.f |
| FIN-055 | 수입 증대/비용 절감 아이디어 추진 | Hybrid | 개선 아이디어 | 실행 결과 | CMP-IS 8.3.g |
| FIN-056 | 예산 성과 커뮤니케이션 | AI | 예산 실적 데이터 | 경영진 리포트 | CMP-IS 8.3.h |
| FIN-057 | 재무 보고서 작성 및 배포 | AI | 전체 재무 데이터 | 최종 재무 보고서 | CMP-IS 8.3.i |

---

## Skill 9: Manage Monetary Transactions

### Sub-Skill 9.1: Establish Monetary Transaction Procedures

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-058 | 현금 취급 정책/절차 수립 | Hybrid | 조직 정책, 법규 | 현금 취급 매뉴얼 | CMP-IS 9.1.a |
| FIN-059 | 중앙 현금 사무소 설치 계획 | Hybrid | 행사장 도면, 보안 요건 | 현금 사무소 설치 계획서 | CMP-IS 9.1.b |
| FIN-060 | 영수증 기록 시스템 구축 | AI | 시스템 요구사항 | 영수증 시스템 설정 | CMP-IS 9.1.b |
| FIN-061 | 현금 수거/입금 시스템 구축 | Hybrid | 보안 요건, 은행 정보 | 수거/입금 프로세스 | CMP-IS 9.1.b |
| FIN-062 | 보안 및 감사 시스템 배치 | Human | 보안 요건, 감사 정책 | 보안/감사 계획 | CMP-IS 9.1.b |
| FIN-063 | 신용카드 처리 설정 | AI | PG사 정보, 수수료 | 카드 결제 시스템 설정 | CMP-IS 9.1.b |

### Sub-Skill 9.2: Manage Monetary Transactions Process

| Task ID | Task Name (Atomic) | AI/Human/Hybrid | Input Data | Output Data | Reference |
|---------|-------------------|-----------------|------------|-------------|-----------|
| FIN-064 | 보안 절차 검토 | Human | 현행 보안 절차, 체크리스트 | 검토 결과 및 개선안 | CMP-IS 9.2.a |
| FIN-065 | 수입/지출 모니터링 | AI | 거래 데이터 | 실시간 수입/지출 대시보드 | CMP-IS 9.2.b |
| FIN-066 | 현금 취급 절차 모니터링 | Hybrid | 현장 관찰, 거래 로그 | 준수 여부 리포트 | CMP-IS 9.2.c |
| FIN-067 | 감사 문서 모니터링 | AI | 감사 로그 | 이상 거래 알림 | CMP-IS 9.2.d |
| FIN-068 | 거래 절차 수정 | Hybrid | 모니터링 결과 | 수정된 절차 문서 | CMP-IS 9.2.e |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Atomic Tasks | 68 |
| AI Tasks | 35 (51%) |
| Human Tasks | 14 (21%) |
| Hybrid Tasks | 19 (28%) |

---

## Next Steps

1. **Step 2**: 각 Task에 대해 AI/Human 분류 기준 상세화
2. **Step 3**: AI Task를 담당할 Agent 그룹핑
3. **Step 4**: Human Task를 위한 UI/UX 인터페이스 설계
4. **Step 5**: Hybrid Task의 AI-Human 협업 워크플로우 정의
