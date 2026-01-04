/**
 * Intelligent Agent Router
 *
 * Cloudflare Workers AI를 사용한 지능형 에이전트 라우터.
 * - 사용자 질문을 분석하여 가장 적합한 에이전트 선택
 * - Intent 기반 라우팅 (키워드 매칭 아님)
 * - STR-001~054 (54개) + FIN-001~068 (68개) + PRJ-001~040 (40개) + MKT-001~040 (40개) + OPS-001~040 (40개) + HR-001~040 (40개) + MTG-001~040 (40개) + SITE-001~040 (40개) + MKTADV-001~040 (40개) + PRO-001~020 (20개) = 총 442개 에이전트 지원
 */

// =============================================================================
// TYPES
// =============================================================================

export interface RouterInput {
  question: string;
  context?: {
    event_id?: string;
    event_type?: string;
    previous_tasks?: string[];
  };
}

export interface RouterOutput {
  taskId: string;
  domain: "finance" | "strategy" | "project" | "marketing" | "marketing_adv" | "operations" | "hr" | "meetings" | "site" | "professionalism" | "out_of_scope";
  confidence: number;
  reasoning: string;
  suggested_input?: Record<string, unknown>;
  isOutOfScope?: boolean;
}

// 복합 쿼리 지원을 위한 ExecutionPlan
export interface ExecutionStep {
  stepNumber: number;
  taskId: string;
  domain: "finance" | "strategy" | "project" | "marketing" | "marketing_adv" | "operations" | "hr" | "meetings" | "site" | "professionalism";
  purpose: string;
  dependsOn: number[]; // 의존하는 이전 step 번호들
  inputMapping?: Record<string, string>; // 이전 step 출력에서 가져올 필드 매핑
}

export interface ExecutionPlan {
  planId: string;
  isComplex: boolean;
  steps: ExecutionStep[];
  totalSteps: number;
  reasoning: string;
  estimatedComplexity: "simple" | "moderate" | "complex";
}

export interface ComplexRouterOutput extends RouterOutput {
  executionPlan?: ExecutionPlan;
}

export interface AgentMetadata {
  taskId: string;
  taskName: string;
  domain: "finance" | "strategy" | "project" | "marketing" | "marketing_adv" | "operations" | "hr" | "meetings" | "site" | "professionalism";
  keywords: string[];
  intentPatterns: string[];
}

// =============================================================================
// AGENT CATALOG
// =============================================================================

const AGENT_CATALOG: AgentMetadata[] = [
  // ============ STRATEGY DOMAIN - Skill 1: Goal Setting (STR-001~013) ============
  {
    taskId: "STR-001",
    taskName: "Event Goal Setting",
    domain: "strategy",
    keywords: ["목표", "KPI", "성과", "지표", "달성", "목적", "SMART", "성공 기준"],
    intentPatterns: [
      "이벤트 목표를 설정하고 싶다",
      "KPI를 정의하고 싶다",
      "성과 지표가 필요하다",
      "무엇을 달성해야 하는가",
    ],
  },
  {
    taskId: "STR-002",
    taskName: "Stakeholder Analysis",
    domain: "strategy",
    keywords: ["이해관계자", "참여자", "관계자", "영향력", "관심도", "stakeholder", "누가"],
    intentPatterns: [
      "이해관계자를 분석하고 싶다",
      "누가 참여하는가",
      "관계자 매트릭스가 필요하다",
      "영향력 있는 사람이 누구인가",
    ],
  },
  {
    taskId: "STR-003",
    taskName: "Risk Identification & Assessment",
    domain: "strategy",
    keywords: ["리스크", "위험", "risk", "위협", "문제", "대비", "완화", "contingency"],
    intentPatterns: [
      "리스크를 식별하고 싶다",
      "위험 요소가 뭔가",
      "어떤 문제가 생길 수 있나",
      "대비책이 필요하다",
    ],
  },
  {
    taskId: "STR-004",
    taskName: "Vision Definition",
    domain: "strategy",
    keywords: ["비전", "vision", "미래상", "방향", "지향점"],
    intentPatterns: ["이벤트 비전을 정의하고 싶다", "미래 방향이 필요하다"],
  },
  {
    taskId: "STR-005",
    taskName: "Mission Statement",
    domain: "strategy",
    keywords: ["미션", "mission", "사명", "존재 이유", "가치"],
    intentPatterns: ["이벤트 미션이 필요하다", "왜 이 이벤트를 하는가"],
  },
  {
    taskId: "STR-006",
    taskName: "Objective Setting",
    domain: "strategy",
    keywords: ["목적", "objective", "달성", "목표 설정"],
    intentPatterns: ["구체적인 목적을 설정하고 싶다", "목표를 세분화하고 싶다"],
  },
  {
    taskId: "STR-007",
    taskName: "Goal Alignment",
    domain: "strategy",
    keywords: ["정렬", "alignment", "일치", "연계", "조화"],
    intentPatterns: ["목표들이 서로 맞는지 확인하고 싶다", "목표 정렬이 필요하다"],
  },
  {
    taskId: "STR-008",
    taskName: "Success Criteria",
    domain: "strategy",
    keywords: ["성공 기준", "success criteria", "평가 기준", "달성 기준"],
    intentPatterns: ["성공을 어떻게 측정하나", "성공 기준이 필요하다"],
  },
  {
    taskId: "STR-009",
    taskName: "Goal Prioritization",
    domain: "strategy",
    keywords: ["우선순위", "priority", "중요도", "순서"],
    intentPatterns: ["목표 우선순위를 정하고 싶다", "무엇을 먼저 해야 하나"],
  },
  {
    taskId: "STR-010",
    taskName: "Milestone Definition",
    domain: "strategy",
    keywords: ["마일스톤", "milestone", "중간 목표", "이정표"],
    intentPatterns: ["마일스톤이 필요하다", "중간 체크포인트를 정하고 싶다"],
  },
  {
    taskId: "STR-011",
    taskName: "Goal Communication",
    domain: "strategy",
    keywords: ["목표 전달", "communication", "공유", "알림"],
    intentPatterns: ["목표를 팀에 전달하고 싶다", "목표 공유 방법이 필요하다"],
  },
  {
    taskId: "STR-012",
    taskName: "Goal Tracking",
    domain: "strategy",
    keywords: ["추적", "tracking", "모니터링", "진행 상황"],
    intentPatterns: ["목표 달성 진행상황을 추적하고 싶다", "어디까지 왔나"],
  },
  {
    taskId: "STR-013",
    taskName: "Goal Review",
    domain: "strategy",
    keywords: ["검토", "review", "평가", "재검토"],
    intentPatterns: ["목표를 검토하고 싶다", "목표 달성 여부 평가"],
  },

  // ============ STRATEGY DOMAIN - Skill 2: Stakeholder Analysis (STR-014~026) ============
  {
    taskId: "STR-014",
    taskName: "Stakeholder Identification",
    domain: "strategy",
    keywords: ["이해관계자 식별", "stakeholder identification", "누가 관련", "관계자 찾기"],
    intentPatterns: ["이해관계자가 누군가", "관련된 사람을 찾고 싶다"],
  },
  {
    taskId: "STR-015",
    taskName: "Stakeholder Mapping",
    domain: "strategy",
    keywords: ["매핑", "mapping", "매트릭스", "영향-관심"],
    intentPatterns: ["이해관계자 매핑이 필요하다", "영향력 매트릭스"],
  },
  {
    taskId: "STR-016",
    taskName: "Stakeholder Prioritization",
    domain: "strategy",
    keywords: ["이해관계자 우선순위", "stakeholder priority", "중요 관계자"],
    intentPatterns: ["누구를 먼저 관리해야 하나", "중요한 이해관계자는 누구"],
  },
  {
    taskId: "STR-017",
    taskName: "Stakeholder Engagement",
    domain: "strategy",
    keywords: ["참여", "engagement", "관여", "협력"],
    intentPatterns: ["이해관계자 참여를 높이고 싶다", "어떻게 관계자를 관여시키나"],
  },
  {
    taskId: "STR-018",
    taskName: "Expectation Management",
    domain: "strategy",
    keywords: ["기대 관리", "expectation", "요구사항", "예상"],
    intentPatterns: ["이해관계자 기대를 관리하고 싶다", "무엇을 기대하는가"],
  },
  {
    taskId: "STR-019",
    taskName: "Conflict Resolution",
    domain: "strategy",
    keywords: ["갈등", "conflict", "충돌", "해결", "조정"],
    intentPatterns: ["이해관계자 간 갈등이 있다", "갈등을 해결하고 싶다"],
  },
  {
    taskId: "STR-020",
    taskName: "Relationship Building",
    domain: "strategy",
    keywords: ["관계 구축", "relationship", "신뢰", "네트워킹"],
    intentPatterns: ["관계를 강화하고 싶다", "신뢰를 쌓고 싶다"],
  },
  {
    taskId: "STR-021",
    taskName: "Influence Analysis",
    domain: "strategy",
    keywords: ["영향력 분석", "influence", "파워", "권한"],
    intentPatterns: ["누가 영향력이 있나", "영향력을 분석하고 싶다"],
  },
  {
    taskId: "STR-022",
    taskName: "Stakeholder Feedback",
    domain: "strategy",
    keywords: ["피드백", "feedback", "의견", "반응"],
    intentPatterns: ["이해관계자 피드백을 수집하고 싶다", "의견을 들어보고 싶다"],
  },
  {
    taskId: "STR-023",
    taskName: "Coalition Building",
    domain: "strategy",
    keywords: ["연합", "coalition", "동맹", "지지"],
    intentPatterns: ["지지 세력을 만들고 싶다", "연합을 구축하고 싶다"],
  },
  {
    taskId: "STR-024",
    taskName: "Negotiation Support",
    domain: "strategy",
    keywords: ["협상", "negotiation", "교섭", "타협"],
    intentPatterns: ["협상을 준비하고 싶다", "협상 전략이 필요하다"],
  },
  {
    taskId: "STR-025",
    taskName: "Stakeholder Reporting",
    domain: "strategy",
    keywords: ["이해관계자 보고", "stakeholder report", "현황 보고"],
    intentPatterns: ["이해관계자에게 보고하고 싶다", "현황을 공유하고 싶다"],
  },
  {
    taskId: "STR-026",
    taskName: "Stakeholder Journey",
    domain: "strategy",
    keywords: ["여정", "journey", "경험", "터치포인트"],
    intentPatterns: ["이해관계자 여정을 설계하고 싶다", "경험을 매핑하고 싶다"],
  },

  // ============ STRATEGY DOMAIN - Skill 3: Risk Management (STR-027~040) ============
  {
    taskId: "STR-027",
    taskName: "Risk Identification",
    domain: "strategy",
    keywords: ["리스크 식별", "risk identification", "위험 찾기", "리스크 발견"],
    intentPatterns: ["어떤 리스크가 있나", "위험을 찾고 싶다"],
  },
  {
    taskId: "STR-028",
    taskName: "Risk Assessment",
    domain: "strategy",
    keywords: ["리스크 평가", "risk assessment", "위험 분석", "영향도"],
    intentPatterns: ["리스크를 평가하고 싶다", "위험 수준이 어떤가"],
  },
  {
    taskId: "STR-029",
    taskName: "Risk Prioritization",
    domain: "strategy",
    keywords: ["리스크 우선순위", "risk priority", "중요 리스크"],
    intentPatterns: ["어떤 리스크를 먼저 다뤄야 하나", "리스크 순위를 정하고 싶다"],
  },
  {
    taskId: "STR-030",
    taskName: "Risk Mitigation",
    domain: "strategy",
    keywords: ["완화", "mitigation", "대응", "저감"],
    intentPatterns: ["리스크를 줄이고 싶다", "완화 방안이 필요하다"],
  },
  {
    taskId: "STR-031",
    taskName: "Contingency Planning",
    domain: "strategy",
    keywords: ["비상 계획", "contingency", "백업", "대안"],
    intentPatterns: ["비상 계획이 필요하다", "만약의 경우 대비책"],
  },
  {
    taskId: "STR-032",
    taskName: "Risk Monitoring",
    domain: "strategy",
    keywords: ["리스크 모니터링", "risk monitoring", "감시", "추적"],
    intentPatterns: ["리스크를 지속 모니터링하고 싶다", "위험 추적이 필요하다"],
  },
  {
    taskId: "STR-033",
    taskName: "Risk Reporting",
    domain: "strategy",
    keywords: ["리스크 보고", "risk report", "현황 보고"],
    intentPatterns: ["리스크 현황을 보고하고 싶다", "위험 상태 공유"],
  },
  {
    taskId: "STR-034",
    taskName: "Risk Communication",
    domain: "strategy",
    keywords: ["리스크 커뮤니케이션", "위험 전달", "공유"],
    intentPatterns: ["리스크를 팀에 알리고 싶다", "위험 정보를 공유하고 싶다"],
  },
  {
    taskId: "STR-035",
    taskName: "Risk Review",
    domain: "strategy",
    keywords: ["리스크 검토", "risk review", "재평가"],
    intentPatterns: ["리스크를 다시 검토하고 싶다", "위험 상황이 바뀌었다"],
  },
  {
    taskId: "STR-036",
    taskName: "Risk Governance",
    domain: "strategy",
    keywords: ["리스크 거버넌스", "governance", "관리 체계", "의사결정"],
    intentPatterns: ["리스크 관리 체계가 필요하다", "누가 어떻게 결정하나"],
  },
  {
    taskId: "STR-037",
    taskName: "Insurance Analysis",
    domain: "strategy",
    keywords: ["보험", "insurance", "보장", "커버리지"],
    intentPatterns: ["보험이 필요한가", "어떤 보험이 필요하나"],
  },
  {
    taskId: "STR-038",
    taskName: "Safety Risk Management",
    domain: "strategy",
    keywords: ["안전", "safety", "사고", "재해"],
    intentPatterns: ["안전 리스크를 관리하고 싶다", "사고 예방이 필요하다"],
  },
  {
    taskId: "STR-039",
    taskName: "Vendor Risk Assessment",
    domain: "strategy",
    keywords: ["공급사 리스크", "vendor risk", "협력업체 위험"],
    intentPatterns: ["공급사 리스크를 평가하고 싶다", "벤더 신뢰성 확인"],
  },
  {
    taskId: "STR-040",
    taskName: "Risk Culture",
    domain: "strategy",
    keywords: ["리스크 문화", "risk culture", "인식", "태도"],
    intentPatterns: ["팀의 리스크 인식을 높이고 싶다", "리스크 문화를 만들고 싶다"],
  },

  // ============ STRATEGY DOMAIN - Skill 4: Strategic Alignment (STR-041~054) ============
  {
    taskId: "STR-041",
    taskName: "Strategic Objectives",
    domain: "strategy",
    keywords: ["전략 목표", "strategic objectives", "BSC", "밸런스드 스코어카드"],
    intentPatterns: ["전략적 목표를 수립하고 싶다", "BSC가 필요하다"],
  },
  {
    taskId: "STR-042",
    taskName: "Strategy Mapping",
    domain: "strategy",
    keywords: ["전략 맵", "strategy map", "인과관계", "연결"],
    intentPatterns: ["전략 맵이 필요하다", "목표 간 연결을 보고 싶다"],
  },
  {
    taskId: "STR-043",
    taskName: "KPI Design",
    domain: "strategy",
    keywords: ["KPI 설계", "지표 설계", "측정", "대시보드"],
    intentPatterns: ["KPI를 설계하고 싶다", "무엇을 측정해야 하나"],
  },
  {
    taskId: "STR-044",
    taskName: "Initiative Planning",
    domain: "strategy",
    keywords: ["이니셔티브", "initiative", "실행 계획", "프로젝트"],
    intentPatterns: ["실행 이니셔티브를 계획하고 싶다", "프로젝트를 정의하고 싶다"],
  },
  {
    taskId: "STR-045",
    taskName: "Resource Alignment",
    domain: "strategy",
    keywords: ["자원 정렬", "resource alignment", "배분", "할당"],
    intentPatterns: ["자원을 전략에 맞게 배분하고 싶다", "예산 정렬이 필요하다"],
  },
  {
    taskId: "STR-046",
    taskName: "Capability Assessment",
    domain: "strategy",
    keywords: ["역량 평가", "capability", "능력", "강점 약점"],
    intentPatterns: ["우리 역량이 어떤가", "역량 갭을 분석하고 싶다"],
  },
  {
    taskId: "STR-047",
    taskName: "Change Management",
    domain: "strategy",
    keywords: ["변화 관리", "change management", "변경", "전환"],
    intentPatterns: ["변화를 관리하고 싶다", "조직 변화가 필요하다"],
  },
  {
    taskId: "STR-048",
    taskName: "Performance Monitoring",
    domain: "strategy",
    keywords: ["성과 모니터링", "performance monitoring", "KPI 추적"],
    intentPatterns: ["성과를 모니터링하고 싶다", "진행 상황을 보고 싶다"],
  },
  {
    taskId: "STR-049",
    taskName: "Strategic Review",
    domain: "strategy",
    keywords: ["전략 검토", "strategic review", "평가", "효과성"],
    intentPatterns: ["전략을 검토하고 싶다", "전략이 효과적인가"],
  },
  {
    taskId: "STR-050",
    taskName: "Strategy Adaptation",
    domain: "strategy",
    keywords: ["전략 적응", "adaptation", "조정", "피벗"],
    intentPatterns: ["전략을 조정해야 하나", "환경이 변해서 전략 수정"],
  },
  {
    taskId: "STR-051",
    taskName: "Benchmark Analysis",
    domain: "strategy",
    keywords: ["벤치마크", "benchmark", "비교", "베스트 프랙티스"],
    intentPatterns: ["벤치마크 분석이 필요하다", "다른 데와 비교하고 싶다"],
  },
  {
    taskId: "STR-052",
    taskName: "Value Proposition",
    domain: "strategy",
    keywords: ["가치 제안", "value proposition", "차별화", "USP"],
    intentPatterns: ["가치 제안이 필요하다", "왜 우리 이벤트인가"],
  },
  {
    taskId: "STR-053",
    taskName: "Scenario Planning",
    domain: "strategy",
    keywords: ["시나리오 플래닝", "scenario", "미래 예측", "what-if"],
    intentPatterns: ["시나리오를 만들고 싶다", "여러 상황을 대비하고 싶다"],
  },
  {
    taskId: "STR-054",
    taskName: "Strategic Integration",
    domain: "strategy",
    keywords: ["전략 통합", "integration", "조정", "시너지"],
    intentPatterns: ["전략을 통합하고 싶다", "부서 간 조율이 필요하다"],
  },

  // ============ FINANCE DOMAIN - Skill 7: 스폰서십/수익 관리 (FIN-001~030) ============
  {
    taskId: "FIN-001",
    taskName: "스폰서십 프로그램 재정 가치 산정",
    domain: "finance",
    keywords: ["스폰서십", "가치", "산정", "평가", "sponsorship", "value"],
    intentPatterns: ["스폰서십 가치를 계산하고 싶다", "스폰서 프로그램 가치가 얼마인가"],
  },
  {
    taskId: "FIN-002",
    taskName: "스폰서 혜택 제공 비용 추정",
    domain: "finance",
    keywords: ["스폰서", "혜택", "비용", "추정", "benefit", "cost"],
    intentPatterns: ["스폰서 혜택 비용이 얼마인가", "혜택 제공에 드는 비용"],
  },
  {
    taskId: "FIN-003",
    taskName: "이해관계자 스폰서십 승인 획득",
    domain: "finance",
    keywords: ["스폰서십", "승인", "결재", "approval"],
    intentPatterns: ["스폰서십 승인을 받고 싶다", "승인 프로세스가 필요하다"],
  },
  {
    taskId: "FIN-004",
    taskName: "스폰서십 법적 검토 요청",
    domain: "finance",
    keywords: ["법적", "검토", "legal", "계약", "검수", "리뷰"],
    intentPatterns: ["계약서 법적 검토가 필요하다", "법무팀 검토 요청"],
  },
  {
    taskId: "FIN-005",
    taskName: "잠재 스폰서 후보 식별",
    domain: "finance",
    keywords: ["스폰서", "후보", "잠재", "찾기", "식별", "prospect"],
    intentPatterns: ["스폰서를 찾고 싶다", "누가 스폰서가 될 수 있나"],
  },
  {
    taskId: "FIN-006",
    taskName: "스폰서 적합성 분석",
    domain: "finance",
    keywords: ["스폰서", "적합", "분석", "fit", "매칭"],
    intentPatterns: ["이 스폰서가 적합한가", "스폰서 매칭 분석"],
  },
  {
    taskId: "FIN-007",
    taskName: "스폰서 독점권 충돌 검사",
    domain: "finance",
    keywords: ["독점", "배타", "exclusivity", "충돌", "경쟁"],
    intentPatterns: ["독점권 충돌이 있나", "배타적 조항 검토"],
  },
  {
    taskId: "FIN-008",
    taskName: "스폰서 혜택 패키지 문서 생성",
    domain: "finance",
    keywords: ["제안서", "proposal", "패키지", "문서", "PDF"],
    intentPatterns: ["스폰서 제안서를 만들고 싶다", "패키지 문서 생성"],
  },
  {
    taskId: "FIN-009",
    taskName: "스폰서 제안서 배포",
    domain: "finance",
    keywords: ["배포", "발송", "distribution", "전달", "이메일"],
    intentPatterns: ["제안서를 보내고 싶다", "스폰서에게 제안서 배포"],
  },
  {
    taskId: "FIN-010",
    taskName: "잠재 스폰서 1차 접촉",
    domain: "finance",
    keywords: ["접촉", "연락", "contact", "미팅", "콜드콜"],
    intentPatterns: ["스폰서에게 연락하고 싶다", "1차 미팅 잡기"],
  },
  {
    taskId: "FIN-011",
    taskName: "스폰서 지원 유형 파악",
    domain: "finance",
    keywords: ["지원", "현금", "현물", "in-kind", "타입"],
    intentPatterns: ["어떤 지원을 받을 수 있나", "현금 vs 현물 지원"],
  },
  {
    taskId: "FIN-012",
    taskName: "스폰서 커밋먼트 협상",
    domain: "finance",
    keywords: ["협상", "커밋", "약정", "negotiation", "조건"],
    intentPatterns: ["스폰서와 협상하고 싶다", "후원 조건 협상"],
  },
  {
    taskId: "FIN-013",
    taskName: "스폰서 계약서 초안 작성",
    domain: "finance",
    keywords: ["계약서", "초안", "draft", "작성", "문서화"],
    intentPatterns: ["계약서를 작성하고 싶다", "스폰서 계약 초안"],
  },
  {
    taskId: "FIN-014",
    taskName: "스폰서 관계 유지",
    domain: "finance",
    keywords: ["관계", "유지", "relationship", "뉴스레터", "업데이트"],
    intentPatterns: ["스폰서와 관계 유지", "정기 업데이트 보내기"],
  },
  {
    taskId: "FIN-015",
    taskName: "스폰서 계약 이행 추적",
    domain: "finance",
    keywords: ["이행", "추적", "fulfillment", "모니터링", "진행"],
    intentPatterns: ["계약 이행 상황 확인", "혜택 제공 추적"],
  },
  {
    taskId: "FIN-016",
    taskName: "스폰서 ROI 평가",
    domain: "finance",
    keywords: ["ROI", "투자수익", "스폰서", "성과", "return"],
    intentPatterns: ["스폰서 ROI가 얼마인가", "투자 대비 수익"],
  },
  {
    taskId: "FIN-017",
    taskName: "등록 재정 목표 설정",
    domain: "finance",
    keywords: ["등록", "재정", "목표", "registration", "revenue"],
    intentPatterns: ["등록 수익 목표를 설정하고 싶다", "참가비 수익 목표"],
  },
  {
    taskId: "FIN-018",
    taskName: "과거 등록 리스트 분석",
    domain: "finance",
    keywords: ["과거", "등록", "분석", "historical", "registration"],
    intentPatterns: ["이전 등록 데이터 분석", "과거 참가자 패턴"],
  },
  {
    taskId: "FIN-019",
    taskName: "잠재 참석자 유형 식별",
    domain: "finance",
    keywords: ["참석자", "유형", "세그먼트", "segment", "타입"],
    intentPatterns: ["참석자 유형을 파악하고 싶다", "대상 세그먼트 분석"],
  },
  {
    taskId: "FIN-020",
    taskName: "등록 사전 안내 패킷 생성",
    domain: "finance",
    keywords: ["등록", "패킷", "안내", "정보", "packet"],
    intentPatterns: ["등록 안내 문서 만들기", "사전 정보 패킷"],
  },
  {
    taskId: "FIN-021",
    taskName: "등록 시스템 공급자 식별",
    domain: "finance",
    keywords: ["등록", "시스템", "vendor", "플랫폼", "공급자"],
    intentPatterns: ["등록 시스템을 찾고 싶다", "플랫폼 비교"],
  },
  {
    taskId: "FIN-022",
    taskName: "전시 잠재 고객 식별",
    domain: "finance",
    keywords: ["전시", "전시사", "exhibitor", "부스", "booth"],
    intentPatterns: ["전시사를 찾고 싶다", "부스 판매 대상"],
  },
  {
    taskId: "FIN-023",
    taskName: "전시 패키지 개발",
    domain: "finance",
    keywords: ["전시", "패키지", "booth", "부스", "가격"],
    intentPatterns: ["부스 패키지를 만들고 싶다", "전시 가격 책정"],
  },
  {
    taskId: "FIN-024",
    taskName: "전시 판매 진행 추적",
    domain: "finance",
    keywords: ["전시", "판매", "추적", "파이프라인", "진행"],
    intentPatterns: ["부스 판매 현황", "전시 영업 추적"],
  },
  {
    taskId: "FIN-025",
    taskName: "전시사 계약 관리",
    domain: "finance",
    keywords: ["전시사", "계약", "관리", "contract", "exhibitor"],
    intentPatterns: ["전시사 계약 관리", "부스 계약서"],
  },
  {
    taskId: "FIN-026",
    taskName: "전시 수익 예측",
    domain: "finance",
    keywords: ["전시", "수익", "예측", "exhibition", "forecast"],
    intentPatterns: ["전시 수익이 얼마일까", "부스 판매 수익 예측"],
  },
  {
    taskId: "FIN-027",
    taskName: "추가 수익원 식별",
    domain: "finance",
    keywords: ["수익원", "추가", "다각화", "additional", "revenue stream"],
    intentPatterns: ["추가 수익을 만들고 싶다", "다른 수익원이 뭐가 있나"],
  },
  {
    taskId: "FIN-028",
    taskName: "상품 판매 기획",
    domain: "finance",
    keywords: ["상품", "굿즈", "merchandise", "판매", "MD"],
    intentPatterns: ["이벤트 굿즈를 팔고 싶다", "상품 판매 기획"],
  },
  {
    taskId: "FIN-029",
    taskName: "F&B 수익 최적화",
    domain: "finance",
    keywords: ["F&B", "식음료", "케이터링", "음식", "catering"],
    intentPatterns: ["케이터링 수익을 높이고 싶다", "식음료 수익 최적화"],
  },
  {
    taskId: "FIN-030",
    taskName: "콘텐츠 수익화",
    domain: "finance",
    keywords: ["콘텐츠", "수익화", "monetization", "유료"],
    intentPatterns: ["콘텐츠로 수익을 내고 싶다", "세션 녹화 판매"],
  },

  // ============ FINANCE DOMAIN - Skill 8: 예산 관리 (FIN-031~057) ============
  {
    taskId: "FIN-031",
    taskName: "예산 구조 설계",
    domain: "finance",
    keywords: ["예산", "구조", "설계", "budget", "structure", "framework"],
    intentPatterns: ["예산을 짜고 싶다", "예산 구조가 필요하다"],
  },
  {
    taskId: "FIN-032",
    taskName: "과거 비용 분석",
    domain: "finance",
    keywords: ["과거", "비용", "분석", "historical", "cost"],
    intentPatterns: ["이전 이벤트 비용이 얼마였나", "과거 지출 분석"],
  },
  {
    taskId: "FIN-033",
    taskName: "공급사 견적 수집",
    domain: "finance",
    keywords: ["견적", "공급사", "벤더", "quote", "vendor"],
    intentPatterns: ["견적을 받고 싶다", "공급사 가격 비교"],
  },
  {
    taskId: "FIN-034",
    taskName: "예산 항목 상세화",
    domain: "finance",
    keywords: ["예산", "항목", "세부", "line item", "detail"],
    intentPatterns: ["예산 항목을 구체화하고 싶다", "세부 비용 내역"],
  },
  {
    taskId: "FIN-035",
    taskName: "예비비 계획",
    domain: "finance",
    keywords: ["예비비", "contingency", "여유", "reserve"],
    intentPatterns: ["예비비를 얼마나 잡아야 하나", "불확실성 대비 예산"],
  },
  {
    taskId: "FIN-036",
    taskName: "수익 예측",
    domain: "finance",
    keywords: ["수익", "예측", "forecast", "projection", "매출"],
    intentPatterns: ["수익이 얼마나 될까", "매출 예측"],
  },
  {
    taskId: "FIN-037",
    taskName: "손익분기점 분석",
    domain: "finance",
    keywords: ["손익분기", "BEP", "break-even", "흑자", "적자"],
    intentPatterns: ["몇 명이 와야 손익분기인가", "손익분기점 계산"],
  },
  {
    taskId: "FIN-038",
    taskName: "현금흐름 예측",
    domain: "finance",
    keywords: ["현금흐름", "cash flow", "자금", "유동성"],
    intentPatterns: ["현금 흐름이 어떻게 되나", "자금 필요 시점"],
  },
  {
    taskId: "FIN-039",
    taskName: "예산 승인 프로세스",
    domain: "finance",
    keywords: ["승인", "결재", "approval", "프로세스", "워크플로우"],
    intentPatterns: ["예산 승인을 받고 싶다", "결재 프로세스 진행"],
  },
  {
    taskId: "FIN-040",
    taskName: "예산 문서화",
    domain: "finance",
    keywords: ["문서화", "documentation", "기록", "보고서", "정리"],
    intentPatterns: ["예산 문서를 정리하고 싶다", "예산 보고서 작성"],
  },
  {
    taskId: "FIN-041",
    taskName: "시나리오 플래닝",
    domain: "finance",
    keywords: ["시나리오", "scenario", "최악", "최선", "가정"],
    intentPatterns: ["다양한 시나리오를 보고 싶다", "최악의 경우 예산"],
  },
  {
    taskId: "FIN-042",
    taskName: "예산 커뮤니케이션",
    domain: "finance",
    keywords: ["커뮤니케이션", "전달", "공유", "보고", "stakeholder"],
    intentPatterns: ["예산을 팀에 공유하고 싶다", "예산 현황 전달"],
  },
  {
    taskId: "FIN-043",
    taskName: "가격 책정 전략 개발",
    domain: "finance",
    keywords: ["가격", "책정", "pricing", "참가비", "티켓"],
    intentPatterns: ["참가비를 얼마로 할까", "가격 전략이 필요하다"],
  },
  {
    taskId: "FIN-044",
    taskName: "경쟁사 가격 분석",
    domain: "finance",
    keywords: ["경쟁사", "가격", "비교", "competitor", "benchmark"],
    intentPatterns: ["경쟁 이벤트 가격이 얼마인가", "시장 가격 분석"],
  },
  {
    taskId: "FIN-045",
    taskName: "할인 정책 설계",
    domain: "finance",
    keywords: ["할인", "discount", "얼리버드", "그룹", "early bird"],
    intentPatterns: ["할인을 어떻게 적용할까", "얼리버드 가격"],
  },
  {
    taskId: "FIN-046",
    taskName: "동적 가격 규칙",
    domain: "finance",
    keywords: ["동적", "dynamic", "가격", "변동", "surge"],
    intentPatterns: ["가격을 동적으로 조정하고 싶다", "수요에 따른 가격"],
  },
  {
    taskId: "FIN-047",
    taskName: "가격 포인트 검증",
    domain: "finance",
    keywords: ["가격", "검증", "validation", "테스트", "시장조사", "지불의향"],
    intentPatterns: ["가격이 적정한지 검증하고 싶다", "가격 테스트가 필요하다"],
  },
  {
    taskId: "FIN-048",
    taskName: "환불 정책 생성",
    domain: "finance",
    keywords: ["환불", "취소", "refund", "cancellation"],
    intentPatterns: ["환불 정책이 필요하다", "취소 시 환불 규정"],
  },
  {
    taskId: "FIN-049",
    taskName: "결제 조건 설계",
    domain: "finance",
    keywords: ["결제", "조건", "payment terms", "분할", "할부"],
    intentPatterns: ["결제 조건을 설계하고 싶다", "분할 결제 옵션"],
  },
  {
    taskId: "FIN-050",
    taskName: "가격 커뮤니케이션",
    domain: "finance",
    keywords: ["가격", "커뮤니케이션", "안내", "메시지", "전달"],
    intentPatterns: ["가격을 어떻게 안내할까", "가격 정보 전달"],
  },
  {
    taskId: "FIN-051",
    taskName: "예산 추적 설정",
    domain: "finance",
    keywords: ["추적", "tracking", "모니터링", "설정", "시스템"],
    intentPatterns: ["예산 추적 시스템이 필요하다", "지출 모니터링 설정"],
  },
  {
    taskId: "FIN-052",
    taskName: "실제 vs 예산 분석",
    domain: "finance",
    keywords: ["실제", "actual", "예산", "비교", "variance"],
    intentPatterns: ["예산 대비 실제 지출이 어떤가", "차이 분석"],
  },
  {
    taskId: "FIN-053",
    taskName: "차이 보고",
    domain: "finance",
    keywords: ["차이", "variance", "보고서", "리포트", "report"],
    intentPatterns: ["예산 차이 보고서가 필요하다", "variance report 작성"],
  },
  {
    taskId: "FIN-054",
    taskName: "예산 재배분",
    domain: "finance",
    keywords: ["재배분", "조정", "reallocation", "이동"],
    intentPatterns: ["예산을 다시 배분하고 싶다", "항목 간 이동"],
  },
  {
    taskId: "FIN-055",
    taskName: "예측 업데이트",
    domain: "finance",
    keywords: ["예측", "forecast", "업데이트", "수정", "전망"],
    intentPatterns: ["예산 예측을 업데이트하고 싶다", "forecast 수정"],
  },
  {
    taskId: "FIN-056",
    taskName: "비용 통제 조치",
    domain: "finance",
    keywords: ["비용", "통제", "절감", "cost control", "saving"],
    intentPatterns: ["비용을 줄이고 싶다", "절감 방안"],
  },
  {
    taskId: "FIN-057",
    taskName: "이벤트 후 재무 정산",
    domain: "finance",
    keywords: ["정산", "마감", "결산", "post-event", "settlement"],
    intentPatterns: ["이벤트 끝나고 정산하고 싶다", "최종 재무 정리"],
  },

  // ============ FINANCE DOMAIN - Skill 9: 금전 거래 (FIN-058~068) ============
  {
    taskId: "FIN-058",
    taskName: "결제 처리 시스템 설정",
    domain: "finance",
    keywords: ["결제", "payment", "시스템", "PG", "카드"],
    intentPatterns: ["결제 시스템을 설정하고 싶다", "온라인 결제 방법"],
  },
  {
    taskId: "FIN-059",
    taskName: "현금 취급 절차",
    domain: "finance",
    keywords: ["현금", "cash", "취급", "handling", "정산"],
    intentPatterns: ["현금 관리 절차가 필요하다", "cash handling 프로세스"],
  },
  {
    taskId: "FIN-060",
    taskName: "환불 정책 구현",
    domain: "finance",
    keywords: ["환불", "구현", "처리", "refund", "process"],
    intentPatterns: ["환불을 처리하고 싶다", "환불 시스템 구축"],
  },
  {
    taskId: "FIN-061",
    taskName: "재무 통제 설정",
    domain: "finance",
    keywords: ["통제", "control", "내부통제", "승인", "권한"],
    intentPatterns: ["재무 통제를 설정하고 싶다", "승인 권한 체계"],
  },
  {
    taskId: "FIN-062",
    taskName: "세금 준수 설정",
    domain: "finance",
    keywords: ["세금", "tax", "VAT", "부가세", "compliance"],
    intentPatterns: ["세금 처리가 필요하다", "부가세 설정"],
  },
  {
    taskId: "FIN-063",
    taskName: "감사 추적 구성",
    domain: "finance",
    keywords: ["감사", "audit", "추적", "trail", "로그", "기록"],
    intentPatterns: ["감사 추적이 필요하다", "audit trail 설정"],
  },
  {
    taskId: "FIN-064",
    taskName: "결제 처리",
    domain: "finance",
    keywords: ["결제", "수납", "payment", "수금"],
    intentPatterns: ["결제를 받고 싶다", "참가비 수납"],
  },
  {
    taskId: "FIN-065",
    taskName: "환불 처리",
    domain: "finance",
    keywords: ["환불", "처리", "refund", "돌려주다"],
    intentPatterns: ["환불해야 한다", "돈을 돌려줘야 한다"],
  },
  {
    taskId: "FIN-066",
    taskName: "인보이스 생성",
    domain: "finance",
    keywords: ["인보이스", "청구서", "invoice", "bill"],
    intentPatterns: ["청구서를 만들고 싶다", "인보이스 발행"],
  },
  {
    taskId: "FIN-067",
    taskName: "수금 관리",
    domain: "finance",
    keywords: ["수금", "미수", "collection", "receivable"],
    intentPatterns: ["미수금을 관리하고 싶다", "안 낸 사람 추적"],
  },
  {
    taskId: "FIN-068",
    taskName: "재무 보고",
    domain: "finance",
    keywords: ["재무", "보고", "report", "리포트", "보고서"],
    intentPatterns: ["재무 보고서가 필요하다", "재정 현황 보고"],
  },

  // ============ PROJECT DOMAIN - Skill 5: Plan Project (PRJ-001~013) ============
  {
    taskId: "PRJ-001",
    taskName: "프로젝트 일정 수립",
    domain: "project",
    keywords: ["일정", "스케줄", "schedule", "WBS", "타임라인", "timeline"],
    intentPatterns: ["일정을 수립하고 싶다", "프로젝트 스케줄이 필요하다"],
  },
  {
    taskId: "PRJ-002",
    taskName: "자원 계획",
    domain: "project",
    keywords: ["자원", "리소스", "resource", "인력", "배정", "할당"],
    intentPatterns: ["자원을 계획하고 싶다", "필요한 인력이 몇 명인가"],
  },
  {
    taskId: "PRJ-003",
    taskName: "범위 정의",
    domain: "project",
    keywords: ["범위", "scope", "포함", "제외", "경계"],
    intentPatterns: ["프로젝트 범위를 정의하고 싶다", "무엇이 포함되나"],
  },
  {
    taskId: "PRJ-004",
    taskName: "산출물 정의",
    domain: "project",
    keywords: ["산출물", "deliverable", "결과물", "성과물"],
    intentPatterns: ["산출물을 정의하고 싶다", "무엇을 만들어야 하나"],
  },
  {
    taskId: "PRJ-005",
    taskName: "마일스톤 계획",
    domain: "project",
    keywords: ["마일스톤", "milestone", "이정표", "체크포인트"],
    intentPatterns: ["마일스톤을 설정하고 싶다", "중간 점검 시점"],
  },
  {
    taskId: "PRJ-006",
    taskName: "의존성 분석",
    domain: "project",
    keywords: ["의존성", "dependency", "선행", "후행", "순서"],
    intentPatterns: ["작업 간 의존성을 분석하고 싶다", "무엇을 먼저 해야 하나"],
  },
  {
    taskId: "PRJ-007",
    taskName: "WBS 생성",
    domain: "project",
    keywords: ["WBS", "작업분해", "work breakdown", "분해"],
    intentPatterns: ["WBS를 만들고 싶다", "작업을 분해하고 싶다"],
  },
  {
    taskId: "PRJ-008",
    taskName: "크리티컬 패스 분석",
    domain: "project",
    keywords: ["크리티컬 패스", "critical path", "CP", "임계 경로"],
    intentPatterns: ["크리티컬 패스가 뭔가", "가장 긴 경로"],
  },
  {
    taskId: "PRJ-009",
    taskName: "프로젝트 차터",
    domain: "project",
    keywords: ["차터", "charter", "헌장", "프로젝트 정의"],
    intentPatterns: ["프로젝트 차터가 필요하다", "프로젝트를 정의하고 싶다"],
  },
  {
    taskId: "PRJ-010",
    taskName: "역할 책임 정의",
    domain: "project",
    keywords: ["역할", "책임", "RACI", "담당자", "role"],
    intentPatterns: ["역할을 정의하고 싶다", "누가 뭘 하나"],
  },
  {
    taskId: "PRJ-011",
    taskName: "커뮤니케이션 계획",
    domain: "project",
    keywords: ["커뮤니케이션", "communication", "소통", "보고 체계"],
    intentPatterns: ["커뮤니케이션 계획이 필요하다", "어떻게 소통하나"],
  },
  {
    taskId: "PRJ-012",
    taskName: "품질 계획",
    domain: "project",
    keywords: ["품질", "quality", "QA", "검수", "기준"],
    intentPatterns: ["품질 계획이 필요하다", "품질 기준이 뭔가"],
  },
  {
    taskId: "PRJ-013",
    taskName: "조달 계획",
    domain: "project",
    keywords: ["조달", "procurement", "구매", "계약", "공급"],
    intentPatterns: ["조달 계획이 필요하다", "무엇을 구매해야 하나"],
  },

  // ============ PROJECT DOMAIN - Skill 6: Manage Project (PRJ-014~040) ============
  {
    taskId: "PRJ-014",
    taskName: "일정 모니터링",
    domain: "project",
    keywords: ["일정 추적", "진행", "지연", "delay", "모니터링"],
    intentPatterns: ["일정이 어떻게 되고 있나", "지연이 있나"],
  },
  {
    taskId: "PRJ-015",
    taskName: "자원 모니터링",
    domain: "project",
    keywords: ["자원 추적", "사용량", "가용", "utilization"],
    intentPatterns: ["자원 사용 현황이 어떤가", "누가 바쁜가"],
  },
  {
    taskId: "PRJ-016",
    taskName: "범위 관리",
    domain: "project",
    keywords: ["범위 변경", "scope change", "변경 요청", "추가"],
    intentPatterns: ["범위가 변경되었다", "새로운 요청이 들어왔다"],
  },
  {
    taskId: "PRJ-017",
    taskName: "이슈 관리",
    domain: "project",
    keywords: ["이슈", "issue", "문제", "해결", "트래킹"],
    intentPatterns: ["이슈가 발생했다", "문제를 추적하고 싶다"],
  },
  {
    taskId: "PRJ-018",
    taskName: "변경 관리",
    domain: "project",
    keywords: ["변경", "change", "요청", "승인", "관리"],
    intentPatterns: ["변경을 관리하고 싶다", "변경 요청 처리"],
  },
  {
    taskId: "PRJ-019",
    taskName: "진척도 보고",
    domain: "project",
    keywords: ["진척도", "progress", "상태", "현황", "보고"],
    intentPatterns: ["진척도를 보고하고 싶다", "현재 상태가 어떤가"],
  },
  {
    taskId: "PRJ-020",
    taskName: "EVM 분석",
    domain: "project",
    keywords: ["EVM", "earned value", "SPI", "CPI", "가치"],
    intentPatterns: ["EVM 분석이 필요하다", "SPI/CPI가 어떤가"],
  },
  {
    taskId: "PRJ-021",
    taskName: "리스크 대응",
    domain: "project",
    keywords: ["리스크 대응", "위험 처리", "완화", "회피"],
    intentPatterns: ["리스크에 대응하고 싶다", "위험이 현실화되었다"],
  },
  {
    taskId: "PRJ-022",
    taskName: "프로젝트 보고서",
    domain: "project",
    keywords: ["프로젝트 보고서", "주간 보고", "월간 보고", "status report"],
    intentPatterns: ["프로젝트 보고서가 필요하다", "주간 보고를 작성하고 싶다"],
  },
  {
    taskId: "PRJ-023",
    taskName: "성과 보고",
    domain: "project",
    keywords: ["성과", "performance", "KPI", "지표", "달성"],
    intentPatterns: ["성과를 보고하고 싶다", "KPI 달성 현황"],
  },
  {
    taskId: "PRJ-024",
    taskName: "교훈 수집",
    domain: "project",
    keywords: ["교훈", "lessons learned", "배운 점", "경험"],
    intentPatterns: ["교훈을 수집하고 싶다", "뭘 배웠나"],
  },
  {
    taskId: "PRJ-025",
    taskName: "팀 조율",
    domain: "project",
    keywords: ["팀", "조율", "coordination", "협력", "워크로드"],
    intentPatterns: ["팀을 조율하고 싶다", "업무 분담이 필요하다"],
  },
  {
    taskId: "PRJ-026",
    taskName: "갈등 해결",
    domain: "project",
    keywords: ["갈등", "conflict", "충돌", "팀 문제"],
    intentPatterns: ["팀 갈등이 있다", "갈등을 해결하고 싶다"],
  },
  {
    taskId: "PRJ-027",
    taskName: "회의 관리",
    domain: "project",
    keywords: ["회의", "meeting", "미팅", "아젠다", "회의록"],
    intentPatterns: ["회의를 준비하고 싶다", "미팅 아젠다가 필요하다"],
  },
  {
    taskId: "PRJ-028",
    taskName: "의사결정 기록",
    domain: "project",
    keywords: ["의사결정", "decision", "결정", "로그", "기록"],
    intentPatterns: ["결정 사항을 기록하고 싶다", "어떤 결정이 있었나"],
  },
  {
    taskId: "PRJ-029",
    taskName: "지식 공유",
    domain: "project",
    keywords: ["지식", "knowledge", "공유", "저장소", "repository"],
    intentPatterns: ["지식을 공유하고 싶다", "자료를 정리하고 싶다"],
  },
  {
    taskId: "PRJ-030",
    taskName: "팀 역량 개발",
    domain: "project",
    keywords: ["역량", "skill", "교육", "training", "개발"],
    intentPatterns: ["팀 역량을 높이고 싶다", "교육이 필요하다"],
  },
  {
    taskId: "PRJ-031",
    taskName: "인수인계 관리",
    domain: "project",
    keywords: ["인수인계", "handover", "전달", "이관"],
    intentPatterns: ["인수인계를 준비하고 싶다", "전달할 것이 뭔가"],
  },
  {
    taskId: "PRJ-032",
    taskName: "계약 종료",
    domain: "project",
    keywords: ["계약 종료", "contract close", "완료", "정산"],
    intentPatterns: ["계약을 종료하고 싶다", "벤더 정산이 필요하다"],
  },
  {
    taskId: "PRJ-033",
    taskName: "최종 보고서",
    domain: "project",
    keywords: ["최종 보고서", "final report", "종합", "결과"],
    intentPatterns: ["최종 보고서가 필요하다", "프로젝트 결과를 정리하고 싶다"],
  },
  {
    taskId: "PRJ-034",
    taskName: "문서 보관",
    domain: "project",
    keywords: ["문서", "보관", "archive", "아카이브", "저장"],
    intentPatterns: ["문서를 보관하고 싶다", "자료를 아카이브하고 싶다"],
  },
  {
    taskId: "PRJ-035",
    taskName: "사후 평가",
    domain: "project",
    keywords: ["사후 평가", "post-event", "평가", "분석", "SWOT"],
    intentPatterns: ["사후 평가를 하고 싶다", "이벤트 평가가 필요하다"],
  },
  {
    taskId: "PRJ-036",
    taskName: "자원 해제",
    domain: "project",
    keywords: ["자원 해제", "release", "반납", "종료"],
    intentPatterns: ["자원을 해제하고 싶다", "팀을 해산해야 한다"],
  },
  {
    taskId: "PRJ-037",
    taskName: "이해관계자 승인",
    domain: "project",
    keywords: ["승인", "sign-off", "사인오프", "완료 확인"],
    intentPatterns: ["승인을 받고 싶다", "완료 확인이 필요하다"],
  },
  {
    taskId: "PRJ-038",
    taskName: "재무 마감",
    domain: "project",
    keywords: ["재무 마감", "financial close", "정산", "결산"],
    intentPatterns: ["재무를 마감하고 싶다", "예산 정산이 필요하다"],
  },
  {
    taskId: "PRJ-039",
    taskName: "축하 및 인정",
    domain: "project",
    keywords: ["축하", "celebration", "인정", "recognition", "포상"],
    intentPatterns: ["팀을 축하하고 싶다", "성과를 인정하고 싶다"],
  },
  {
    taskId: "PRJ-040",
    taskName: "프로젝트 종료",
    domain: "project",
    keywords: ["프로젝트 종료", "project close", "클로징", "마무리"],
    intentPatterns: ["프로젝트를 종료하고 싶다", "공식적으로 끝내고 싶다"],
  },
  {
    taskId: "PRJ-041",
    taskName: "일정 일괄 조정",
    domain: "project",
    keywords: ["일정 조정", "미루기", "연기", "앞당기기", "당기기", "shift", "reschedule", "전체 일정", "일괄"],
    intentPatterns: [
      "일정을 미루고 싶다",
      "전체 일정을 연기해줘",
      "모든 일정을 당겨줘",
      "2일 미뤄줘",
      "일정을 앞당기고 싶다",
      "D-Day가 변경됐어",
      "전체적으로 다 미워줘",
    ],
  },

  // ============ MARKETING DOMAIN - Skill 7: Plan Marketing (MKT-001~015) ============
  {
    taskId: "MKT-001",
    taskName: "시장 조사",
    domain: "marketing",
    keywords: ["시장 조사", "market research", "리서치", "분석", "조사"],
    intentPatterns: ["시장 조사가 필요하다", "시장을 분석하고 싶다"],
  },
  {
    taskId: "MKT-002",
    taskName: "타겟 오디언스 정의",
    domain: "marketing",
    keywords: ["타겟", "오디언스", "target audience", "대상자", "고객층"],
    intentPatterns: ["타겟을 정하고 싶다", "누구를 대상으로 하나"],
  },
  {
    taskId: "MKT-003",
    taskName: "경쟁사 분석",
    domain: "marketing",
    keywords: ["경쟁사", "competitor", "경쟁 분석", "벤치마킹"],
    intentPatterns: ["경쟁사를 분석하고 싶다", "경쟁 이벤트가 뭐가 있나"],
  },
  {
    taskId: "MKT-004",
    taskName: "브랜드 전략",
    domain: "marketing",
    keywords: ["브랜드", "brand", "아이덴티티", "포지셔닝"],
    intentPatterns: ["브랜드 전략이 필요하다", "브랜드를 어떻게 할까"],
  },
  {
    taskId: "MKT-005",
    taskName: "채널 전략",
    domain: "marketing",
    keywords: ["채널", "channel", "마케팅 채널", "홍보 채널"],
    intentPatterns: ["어떤 채널을 사용할까", "홍보 채널 전략"],
  },
  {
    taskId: "MKT-006",
    taskName: "컨텐츠 전략",
    domain: "marketing",
    keywords: ["컨텐츠", "content", "콘텐츠 전략", "스토리텔링"],
    intentPatterns: ["컨텐츠 전략이 필요하다", "어떤 컨텐츠를 만들까"],
  },
  {
    taskId: "MKT-007",
    taskName: "캠페인 전략",
    domain: "marketing",
    keywords: ["캠페인", "campaign", "마케팅 캠페인", "프로모션"],
    intentPatterns: ["캠페인을 기획하고 싶다", "마케팅 캠페인 전략"],
  },
  {
    taskId: "MKT-008",
    taskName: "마케팅 예산 수립",
    domain: "marketing",
    keywords: ["마케팅 예산", "marketing budget", "광고비", "홍보비"],
    intentPatterns: ["마케팅 예산이 얼마나 필요하나", "홍보 예산을 짜고 싶다"],
  },
  {
    taskId: "MKT-009",
    taskName: "미디어 플래닝",
    domain: "marketing",
    keywords: ["미디어", "media planning", "광고", "매체"],
    intentPatterns: ["미디어 계획이 필요하다", "어떤 매체에 광고하나"],
  },
  {
    taskId: "MKT-010",
    taskName: "PR 전략",
    domain: "marketing",
    keywords: ["PR", "홍보", "언론", "보도자료", "press"],
    intentPatterns: ["PR 전략이 필요하다", "언론 홍보 계획"],
  },
  {
    taskId: "MKT-011",
    taskName: "파트너십 전략",
    domain: "marketing",
    keywords: ["파트너십", "partnership", "협력", "제휴"],
    intentPatterns: ["파트너십을 맺고 싶다", "협력 전략"],
  },
  {
    taskId: "MKT-012",
    taskName: "인플루언서 전략",
    domain: "marketing",
    keywords: ["인플루언서", "influencer", "KOL", "셀럽"],
    intentPatterns: ["인플루언서를 활용하고 싶다", "인플루언서 마케팅"],
  },
  {
    taskId: "MKT-013",
    taskName: "이메일 마케팅 전략",
    domain: "marketing",
    keywords: ["이메일", "email marketing", "뉴스레터", "EDM"],
    intentPatterns: ["이메일 마케팅을 하고 싶다", "뉴스레터 전략"],
  },
  {
    taskId: "MKT-014",
    taskName: "소셜 미디어 전략",
    domain: "marketing",
    keywords: ["소셜", "SNS", "social media", "인스타그램", "페이스북"],
    intentPatterns: ["소셜 미디어 전략이 필요하다", "SNS 마케팅"],
  },
  {
    taskId: "MKT-015",
    taskName: "마케팅 ROI 예측",
    domain: "marketing",
    keywords: ["마케팅 ROI", "투자수익", "효과 예측", "성과 전망"],
    intentPatterns: ["마케팅 ROI가 얼마일까", "마케팅 효과 예측"],
  },

  // ============ MARKETING DOMAIN - Skill 8: Execute Marketing (MKT-016~040) ============
  {
    taskId: "MKT-016",
    taskName: "캠페인 런칭",
    domain: "marketing",
    keywords: ["캠페인 런칭", "campaign launch", "시작", "활성화"],
    intentPatterns: ["캠페인을 시작하고 싶다", "마케팅 런칭"],
  },
  {
    taskId: "MKT-017",
    taskName: "광고 크리에이티브 제작",
    domain: "marketing",
    keywords: ["크리에이티브", "광고 소재", "배너", "비주얼"],
    intentPatterns: ["광고 소재가 필요하다", "크리에이티브 제작"],
  },
  {
    taskId: "MKT-018",
    taskName: "미디어 바잉",
    domain: "marketing",
    keywords: ["미디어 바잉", "media buying", "광고 구매", "매체 집행"],
    intentPatterns: ["광고를 집행하고 싶다", "미디어 바잉"],
  },
  {
    taskId: "MKT-019",
    taskName: "콘텐츠 제작",
    domain: "marketing",
    keywords: ["콘텐츠 제작", "content creation", "제작", "영상", "글"],
    intentPatterns: ["콘텐츠를 만들고 싶다", "제작이 필요하다"],
  },
  {
    taskId: "MKT-020",
    taskName: "소셜 미디어 포스팅",
    domain: "marketing",
    keywords: ["포스팅", "posting", "게시", "업로드"],
    intentPatterns: ["소셜에 올리고 싶다", "포스팅 일정"],
  },
  {
    taskId: "MKT-021",
    taskName: "이메일 캠페인 실행",
    domain: "marketing",
    keywords: ["이메일 발송", "email send", "캠페인 발송"],
    intentPatterns: ["이메일을 보내고 싶다", "뉴스레터 발송"],
  },
  {
    taskId: "MKT-022",
    taskName: "PR 아웃리치",
    domain: "marketing",
    keywords: ["PR 아웃리치", "언론 홍보", "보도자료 배포"],
    intentPatterns: ["언론에 알리고 싶다", "보도자료 배포"],
  },
  {
    taskId: "MKT-023",
    taskName: "인플루언서 관리",
    domain: "marketing",
    keywords: ["인플루언서 관리", "KOL 관리", "협업"],
    intentPatterns: ["인플루언서와 협업하고 싶다", "인플루언서 관리"],
  },
  {
    taskId: "MKT-024",
    taskName: "파트너 활성화",
    domain: "marketing",
    keywords: ["파트너 활성화", "partner activation", "공동 마케팅"],
    intentPatterns: ["파트너와 함께 홍보하고 싶다", "공동 마케팅"],
  },
  {
    taskId: "MKT-025",
    taskName: "랜딩페이지 최적화",
    domain: "marketing",
    keywords: ["랜딩페이지", "landing page", "CRO", "전환율"],
    intentPatterns: ["랜딩페이지를 최적화하고 싶다", "전환율을 높이고 싶다"],
  },
  {
    taskId: "MKT-026",
    taskName: "A/B 테스팅",
    domain: "marketing",
    keywords: ["A/B 테스트", "실험", "테스팅", "변형"],
    intentPatterns: ["A/B 테스트를 하고 싶다", "뭐가 더 효과적인지"],
  },
  {
    taskId: "MKT-027",
    taskName: "캠페인 최적화",
    domain: "marketing",
    keywords: ["캠페인 최적화", "optimization", "개선", "조정"],
    intentPatterns: ["캠페인을 개선하고 싶다", "성과를 높이고 싶다"],
  },
  {
    taskId: "MKT-028",
    taskName: "예산 재배분",
    domain: "marketing",
    keywords: ["마케팅 예산 재배분", "budget reallocation", "예산 조정"],
    intentPatterns: ["마케팅 예산을 조정하고 싶다", "효과적인 채널에 집중"],
  },
  {
    taskId: "MKT-029",
    taskName: "성과 트래킹",
    domain: "marketing",
    keywords: ["트래킹", "tracking", "추적", "모니터링"],
    intentPatterns: ["성과를 추적하고 싶다", "어떻게 되고 있나"],
  },
  {
    taskId: "MKT-030",
    taskName: "전환 추적",
    domain: "marketing",
    keywords: ["전환 추적", "conversion tracking", "어트리뷰션"],
    intentPatterns: ["전환을 추적하고 싶다", "어디서 왔는지"],
  },
  {
    taskId: "MKT-031",
    taskName: "ROI 분석",
    domain: "marketing",
    keywords: ["ROI 분석", "마케팅 ROI", "투자수익 분석"],
    intentPatterns: ["마케팅 ROI를 분석하고 싶다", "투자 대비 효과"],
  },
  {
    taskId: "MKT-032",
    taskName: "경쟁사 모니터링",
    domain: "marketing",
    keywords: ["경쟁사 모니터링", "competitor monitoring", "경쟁 분석"],
    intentPatterns: ["경쟁사를 모니터링하고 싶다", "경쟁사가 뭘 하나"],
  },
  {
    taskId: "MKT-033",
    taskName: "소셜 리스닝",
    domain: "marketing",
    keywords: ["소셜 리스닝", "social listening", "브랜드 모니터링"],
    intentPatterns: ["사람들이 뭐라고 하나", "소셜 반응"],
  },
  {
    taskId: "MKT-034",
    taskName: "마케팅 리포팅",
    domain: "marketing",
    keywords: ["마케팅 리포트", "보고서", "대시보드", "reporting"],
    intentPatterns: ["마케팅 리포트가 필요하다", "성과 보고"],
  },
  {
    taskId: "MKT-035",
    taskName: "캠페인 분석",
    domain: "marketing",
    keywords: ["캠페인 분석", "campaign analysis", "효과 분석"],
    intentPatterns: ["캠페인 효과를 분석하고 싶다", "캠페인이 어땠나"],
  },
  {
    taskId: "MKT-036",
    taskName: "오디언스 인사이트",
    domain: "marketing",
    keywords: ["오디언스 인사이트", "audience insight", "고객 분석"],
    intentPatterns: ["고객을 더 알고 싶다", "오디언스 분석"],
  },
  {
    taskId: "MKT-037",
    taskName: "리드 너처링",
    domain: "marketing",
    keywords: ["리드 너처링", "lead nurturing", "잠재고객", "육성"],
    intentPatterns: ["리드를 육성하고 싶다", "잠재고객 관리"],
  },
  {
    taskId: "MKT-038",
    taskName: "리타겟팅 캠페인",
    domain: "marketing",
    keywords: ["리타겟팅", "retargeting", "리마케팅", "재방문"],
    intentPatterns: ["리타겟팅을 하고 싶다", "다시 광고하고 싶다"],
  },
  {
    taskId: "MKT-039",
    taskName: "이탈 고객 리커버리",
    domain: "marketing",
    keywords: ["이탈", "recovery", "장바구니", "abandoned"],
    intentPatterns: ["이탈한 고객을 되찾고 싶다", "장바구니 포기 고객"],
  },
  {
    taskId: "MKT-040",
    taskName: "사후 이벤트 마케팅",
    domain: "marketing",
    keywords: ["사후 마케팅", "post-event", "팔로업", "후속"],
    intentPatterns: ["이벤트 끝나고 마케팅", "팔로업이 필요하다"],
  },

  // ============ OPERATIONS DOMAIN - Skill 9: Site Management (OPS-001~015) ============
  {
    taskId: "OPS-001",
    taskName: "Venue Sourcing",
    domain: "operations",
    keywords: ["장소", "베뉴", "venue", "행사장", "공간", "site", "장소 찾기"],
    intentPatterns: ["장소를 찾고 싶다", "베뉴를 소싱하고 싶다", "행사장이 필요하다"],
  },
  {
    taskId: "OPS-002",
    taskName: "Venue Evaluation",
    domain: "operations",
    keywords: ["장소 평가", "베뉴 평가", "venue evaluation", "행사장 비교"],
    intentPatterns: ["장소를 평가하고 싶다", "베뉴를 비교하고 싶다"],
  },
  {
    taskId: "OPS-003",
    taskName: "Venue Contract",
    domain: "operations",
    keywords: ["장소 계약", "베뉴 계약", "venue contract", "행사장 계약"],
    intentPatterns: ["장소 계약이 필요하다", "베뉴 계약 조건"],
  },
  {
    taskId: "OPS-004",
    taskName: "Site Inspection",
    domain: "operations",
    keywords: ["현장 답사", "site inspection", "사전 방문", "현장 점검"],
    intentPatterns: ["현장 답사가 필요하다", "장소를 점검하고 싶다"],
  },
  {
    taskId: "OPS-005",
    taskName: "Floor Plan Design",
    domain: "operations",
    keywords: ["평면도", "floor plan", "배치도", "레이아웃", "공간 설계"],
    intentPatterns: ["평면도를 만들고 싶다", "배치를 설계하고 싶다"],
  },
  {
    taskId: "OPS-006",
    taskName: "Room Setup",
    domain: "operations",
    keywords: ["룸 셋업", "room setup", "좌석 배치", "시어터", "클래스룸"],
    intentPatterns: ["룸 셋업이 필요하다", "좌석을 배치하고 싶다"],
  },
  {
    taskId: "OPS-007",
    taskName: "AV Equipment Planning",
    domain: "operations",
    keywords: ["음향", "영상", "AV", "audio visual", "마이크", "스피커", "프로젝터"],
    intentPatterns: ["AV 장비가 필요하다", "음향 시스템을 계획하고 싶다"],
  },
  {
    taskId: "OPS-008",
    taskName: "Lighting Design",
    domain: "operations",
    keywords: ["조명", "lighting", "무대 조명", "분위기 조명"],
    intentPatterns: ["조명을 설계하고 싶다", "무대 조명이 필요하다"],
  },
  {
    taskId: "OPS-009",
    taskName: "Stage Design",
    domain: "operations",
    keywords: ["무대", "stage", "스테이지", "무대 설계", "백드롭"],
    intentPatterns: ["무대를 설계하고 싶다", "스테이지가 필요하다"],
  },
  {
    taskId: "OPS-010",
    taskName: "Signage Planning",
    domain: "operations",
    keywords: ["사이니지", "signage", "안내판", "표지판", "웨이파인딩"],
    intentPatterns: ["사이니지를 계획하고 싶다", "안내판이 필요하다"],
  },
  {
    taskId: "OPS-011",
    taskName: "Accessibility Planning",
    domain: "operations",
    keywords: ["접근성", "accessibility", "장애인", "휠체어", "배리어프리"],
    intentPatterns: ["접근성을 고려하고 싶다", "장애인 편의시설"],
  },
  {
    taskId: "OPS-012",
    taskName: "Safety Compliance",
    domain: "operations",
    keywords: ["안전", "safety", "소방", "비상구", "안전 규정"],
    intentPatterns: ["안전 규정을 확인하고 싶다", "소방 검사가 필요하다"],
  },
  {
    taskId: "OPS-013",
    taskName: "Permit Management",
    domain: "operations",
    keywords: ["허가", "permit", "인허가", "승인", "라이선스"],
    intentPatterns: ["허가가 필요하다", "인허가 절차"],
  },
  {
    taskId: "OPS-014",
    taskName: "Venue Liaison",
    domain: "operations",
    keywords: ["베뉴 연락", "venue liaison", "장소 담당자", "소통"],
    intentPatterns: ["베뉴와 소통하고 싶다", "장소 담당자 연락"],
  },
  {
    taskId: "OPS-015",
    taskName: "Decoration Planning",
    domain: "operations",
    keywords: ["장식", "decoration", "데코레이션", "꽃", "테이블 세팅"],
    intentPatterns: ["장식을 계획하고 싶다", "데코레이션이 필요하다"],
  },

  // ============ OPERATIONS DOMAIN - Skill 10: Logistics Management (OPS-016~040) ============
  {
    taskId: "OPS-016",
    taskName: "F&B Planning",
    domain: "operations",
    keywords: ["케이터링", "식사", "F&B", "음식", "식음료", "catering"],
    intentPatterns: ["케이터링을 계획하고 싶다", "식사 제공이 필요하다"],
  },
  {
    taskId: "OPS-017",
    taskName: "Menu Development",
    domain: "operations",
    keywords: ["메뉴", "menu", "음식 메뉴", "식단"],
    intentPatterns: ["메뉴를 개발하고 싶다", "어떤 음식을 제공할까"],
  },
  {
    taskId: "OPS-018",
    taskName: "Dietary Management",
    domain: "operations",
    keywords: ["식이 제한", "dietary", "알레르기", "채식", "할랄"],
    intentPatterns: ["식이 제한을 관리하고 싶다", "알레르기 대응"],
  },
  {
    taskId: "OPS-019",
    taskName: "Beverage Service",
    domain: "operations",
    keywords: ["음료", "beverage", "커피", "바", "칵테일"],
    intentPatterns: ["음료 서비스가 필요하다", "바를 운영하고 싶다"],
  },
  {
    taskId: "OPS-020",
    taskName: "Transportation Planning",
    domain: "operations",
    keywords: ["교통", "transportation", "셔틀", "버스", "이동"],
    intentPatterns: ["교통을 계획하고 싶다", "셔틀이 필요하다"],
  },
  {
    taskId: "OPS-021",
    taskName: "Parking Management",
    domain: "operations",
    keywords: ["주차", "parking", "주차장", "발렛"],
    intentPatterns: ["주차를 관리하고 싶다", "주차 공간이 필요하다"],
  },
  {
    taskId: "OPS-022",
    taskName: "Accommodation Planning",
    domain: "operations",
    keywords: ["숙박", "accommodation", "호텔", "숙소"],
    intentPatterns: ["숙박을 계획하고 싶다", "호텔이 필요하다"],
  },
  {
    taskId: "OPS-023",
    taskName: "Registration Setup",
    domain: "operations",
    keywords: ["등록", "registration", "체크인", "현장 등록"],
    intentPatterns: ["등록 시스템을 셋업하고 싶다", "현장 등록 준비"],
  },
  {
    taskId: "OPS-024",
    taskName: "Badge Production",
    domain: "operations",
    keywords: ["배지", "badge", "명찰", "네임택", "ID"],
    intentPatterns: ["배지를 만들고 싶다", "명찰 제작"],
  },
  {
    taskId: "OPS-025",
    taskName: "Security Planning",
    domain: "operations",
    keywords: ["보안", "security", "경비", "출입 통제", "VIP 보안"],
    intentPatterns: ["보안을 계획하고 싶다", "경비가 필요하다"],
  },
  {
    taskId: "OPS-026",
    taskName: "Medical Services",
    domain: "operations",
    keywords: ["의료", "medical", "응급", "구급", "의료진"],
    intentPatterns: ["의료 서비스가 필요하다", "응급 상황 대비"],
  },
  {
    taskId: "OPS-027",
    taskName: "Speaker Support",
    domain: "operations",
    keywords: ["연사 지원", "speaker support", "발표자", "그린룸"],
    intentPatterns: ["연사를 지원하고 싶다", "발표자 관리"],
  },
  {
    taskId: "OPS-028",
    taskName: "Exhibitor Services",
    domain: "operations",
    keywords: ["전시 서비스", "exhibitor", "부스 서비스", "전시사"],
    intentPatterns: ["전시 서비스가 필요하다", "전시사 지원"],
  },
  {
    taskId: "OPS-029",
    taskName: "Networking Operations",
    domain: "operations",
    keywords: ["네트워킹", "networking", "미팅 존", "매칭"],
    intentPatterns: ["네트워킹을 운영하고 싶다", "미팅 존 설치"],
  },
  {
    taskId: "OPS-030",
    taskName: "Live Streaming",
    domain: "operations",
    keywords: ["라이브 스트리밍", "streaming", "온라인 방송", "하이브리드"],
    intentPatterns: ["라이브 스트리밍이 필요하다", "온라인 방송 준비"],
  },
  {
    taskId: "OPS-031",
    taskName: "Photography & Video",
    domain: "operations",
    keywords: ["사진", "영상", "photography", "촬영", "카메라"],
    intentPatterns: ["촬영이 필요하다", "사진/영상팀 필요"],
  },
  {
    taskId: "OPS-032",
    taskName: "Lost & Found",
    domain: "operations",
    keywords: ["분실물", "lost and found", "분실", "습득"],
    intentPatterns: ["분실물 관리가 필요하다", "분실물 센터"],
  },
  {
    taskId: "OPS-033",
    taskName: "Waste Management",
    domain: "operations",
    keywords: ["폐기물", "waste", "쓰레기", "재활용", "지속가능성"],
    intentPatterns: ["폐기물을 관리하고 싶다", "친환경 행사"],
  },
  {
    taskId: "OPS-034",
    taskName: "Power Management",
    domain: "operations",
    keywords: ["전력", "power", "전기", "발전기", "배전"],
    intentPatterns: ["전력을 관리하고 싶다", "전기가 더 필요하다"],
  },
  {
    taskId: "OPS-035",
    taskName: "Climate Control",
    domain: "operations",
    keywords: ["온도", "climate", "냉난방", "환기", "공조"],
    intentPatterns: ["온도를 관리하고 싶다", "냉난방 조절"],
  },
  {
    taskId: "OPS-036",
    taskName: "Accessibility Operations",
    domain: "operations",
    keywords: ["접근성 운영", "accessibility ops", "장애인 지원"],
    intentPatterns: ["접근성 서비스를 운영하고 싶다", "장애인 지원"],
  },
  {
    taskId: "OPS-037",
    taskName: "Signage Execution",
    domain: "operations",
    keywords: ["사이니지 실행", "signage execution", "표지판 설치"],
    intentPatterns: ["사이니지를 설치하고 싶다", "안내판 배치"],
  },
  {
    taskId: "OPS-038",
    taskName: "On-site Communication",
    domain: "operations",
    keywords: ["현장 소통", "on-site communication", "무전", "팀 소통"],
    intentPatterns: ["현장 소통이 필요하다", "무전기 계획"],
  },
  {
    taskId: "OPS-039",
    taskName: "Real-time Monitoring",
    domain: "operations",
    keywords: ["실시간 모니터링", "monitoring", "대시보드", "상황실"],
    intentPatterns: ["실시간으로 모니터링하고 싶다", "상황실 운영"],
  },
  {
    taskId: "OPS-040",
    taskName: "Load-Out Management",
    domain: "operations",
    keywords: ["철수", "load-out", "해체", "원상복구", "마무리"],
    intentPatterns: ["철수를 계획하고 싶다", "행사 후 정리"],
  },

  // ============ HR DOMAIN - Skill 11: HR Planning (HR-001~015) ============
  {
    taskId: "HR-001",
    taskName: "Staff Requirements Analysis",
    domain: "hr",
    keywords: ["인력 요구", "스태프 분석", "인원 계획", "staffing", "인력 산정"],
    intentPatterns: ["몇 명이 필요한가", "인력 요구사항을 분석하고 싶다"],
  },
  {
    taskId: "HR-002",
    taskName: "Role Definition",
    domain: "hr",
    keywords: ["역할 정의", "직무", "role", "업무 분장", "R&R"],
    intentPatterns: ["역할을 정의하고 싶다", "누가 무슨 일을 하는가"],
  },
  {
    taskId: "HR-003",
    taskName: "Organizational Structure",
    domain: "hr",
    keywords: ["조직 구조", "조직도", "체계", "organization", "구성"],
    intentPatterns: ["조직 구조가 필요하다", "조직도를 만들고 싶다"],
  },
  {
    taskId: "HR-004",
    taskName: "Skills Matrix",
    domain: "hr",
    keywords: ["스킬 매트릭스", "역량", "skills", "능력", "자격"],
    intentPatterns: ["필요한 스킬을 정의하고 싶다", "역량 매트릭스가 필요하다"],
  },
  {
    taskId: "HR-005",
    taskName: "Recruitment Planning",
    domain: "hr",
    keywords: ["채용 계획", "모집", "recruitment", "인력 확보", "구인"],
    intentPatterns: ["채용 계획을 세우고 싶다", "어떻게 모집하나"],
  },
  {
    taskId: "HR-006",
    taskName: "Training Needs Analysis",
    domain: "hr",
    keywords: ["교육 분석", "training", "훈련", "학습", "역량 개발"],
    intentPatterns: ["어떤 교육이 필요한가", "교육 요구를 분석하고 싶다"],
  },
  {
    taskId: "HR-007",
    taskName: "Training Program Design",
    domain: "hr",
    keywords: ["교육 설계", "프로그램", "커리큘럼", "교육 과정"],
    intentPatterns: ["교육 프로그램을 설계하고 싶다", "교육 과정이 필요하다"],
  },
  {
    taskId: "HR-008",
    taskName: "Compensation Planning",
    domain: "hr",
    keywords: ["보상 계획", "급여", "수당", "compensation", "임금"],
    intentPatterns: ["급여를 어떻게 책정하나", "보상 계획이 필요하다"],
  },
  {
    taskId: "HR-009",
    taskName: "Scheduling Framework",
    domain: "hr",
    keywords: ["스케줄", "근무표", "일정", "schedule", "교대"],
    intentPatterns: ["근무 스케줄이 필요하다", "일정을 계획하고 싶다"],
  },
  {
    taskId: "HR-010",
    taskName: "Labor Compliance Check",
    domain: "hr",
    keywords: ["노동법", "근로기준법", "compliance", "규정", "법적 준수"],
    intentPatterns: ["노동법을 준수하는지 확인하고 싶다", "규정 검토가 필요하다"],
  },
  {
    taskId: "HR-011",
    taskName: "Volunteer Strategy",
    domain: "hr",
    keywords: ["봉사자", "자원봉사", "volunteer", "무급", "지원자"],
    intentPatterns: ["봉사자를 어떻게 관리하나", "자원봉사 전략이 필요하다"],
  },
  {
    taskId: "HR-012",
    taskName: "HR Budget Estimation",
    domain: "hr",
    keywords: ["인건비 예산", "HR 비용", "labor cost", "인력 비용"],
    intentPatterns: ["인건비 예산이 필요하다", "HR 비용을 산정하고 싶다"],
  },
  {
    taskId: "HR-013",
    taskName: "Staff Communication Plan",
    domain: "hr",
    keywords: ["스태프 커뮤니케이션", "소통", "전달", "공지", "연락"],
    intentPatterns: ["스태프와 어떻게 소통하나", "커뮤니케이션 계획이 필요하다"],
  },
  {
    taskId: "HR-014",
    taskName: "Uniform & Equipment Planning",
    domain: "hr",
    keywords: ["유니폼", "장비", "uniform", "복장", "물품"],
    intentPatterns: ["유니폼이 필요하다", "장비 계획을 세우고 싶다"],
  },
  {
    taskId: "HR-015",
    taskName: "Contingency Staffing",
    domain: "hr",
    keywords: ["비상 인력", "contingency", "대체", "예비", "백업"],
    intentPatterns: ["비상 인력이 필요하다", "대체 인력 계획"],
  },

  // ============ HR DOMAIN - Skill 12: HR Management (HR-016~040) ============
  {
    taskId: "HR-016",
    taskName: "Staff Recruitment",
    domain: "hr",
    keywords: ["스태프 채용", "recruitment", "모집 실행", "지원자"],
    intentPatterns: ["스태프를 채용하고 싶다", "모집을 시작하고 싶다"],
  },
  {
    taskId: "HR-017",
    taskName: "Interview Management",
    domain: "hr",
    keywords: ["면접", "interview", "심사", "선발"],
    intentPatterns: ["면접을 진행하고 싶다", "후보자 평가가 필요하다"],
  },
  {
    taskId: "HR-018",
    taskName: "Contract Management",
    domain: "hr",
    keywords: ["계약", "contract", "근로계약서", "서명", "고용"],
    intentPatterns: ["계약을 관리하고 싶다", "근로계약이 필요하다"],
  },
  {
    taskId: "HR-019",
    taskName: "Onboarding Execution",
    domain: "hr",
    keywords: ["온보딩", "onboarding", "입사", "적응", "OJT"],
    intentPatterns: ["온보딩을 진행하고 싶다", "신규 인원 적응"],
  },
  {
    taskId: "HR-020",
    taskName: "Training Delivery",
    domain: "hr",
    keywords: ["교육 실행", "training delivery", "강의", "워크숍"],
    intentPatterns: ["교육을 실행하고 싶다", "트레이닝을 진행하고 싶다"],
  },
  {
    taskId: "HR-021",
    taskName: "Shift Assignment",
    domain: "hr",
    keywords: ["교대 배정", "shift", "근무 배치", "로테이션"],
    intentPatterns: ["교대를 배정하고 싶다", "근무 배치가 필요하다"],
  },
  {
    taskId: "HR-022",
    taskName: "Attendance Tracking",
    domain: "hr",
    keywords: ["출석", "attendance", "체크인", "출근", "근태"],
    intentPatterns: ["출석을 관리하고 싶다", "근태 추적이 필요하다"],
  },
  {
    taskId: "HR-023",
    taskName: "Break Management",
    domain: "hr",
    keywords: ["휴식", "break", "쉬는 시간", "휴게"],
    intentPatterns: ["휴식을 관리하고 싶다", "쉬는 시간 계획"],
  },
  {
    taskId: "HR-024",
    taskName: "Real-Time Staffing",
    domain: "hr",
    keywords: ["실시간 인력", "real-time", "현장 배치", "재배치"],
    intentPatterns: ["실시간 인력 조정이 필요하다", "현장에서 재배치"],
  },
  {
    taskId: "HR-025",
    taskName: "Performance Tracking",
    domain: "hr",
    keywords: ["성과 추적", "performance", "평가", "업무 수행"],
    intentPatterns: ["성과를 추적하고 싶다", "직원 평가가 필요하다"],
  },
  {
    taskId: "HR-026",
    taskName: "Issue Resolution",
    domain: "hr",
    keywords: ["이슈 해결", "문제", "issue", "갈등", "불만"],
    intentPatterns: ["인력 이슈를 해결하고 싶다", "문제가 발생했다"],
  },
  {
    taskId: "HR-027",
    taskName: "Emergency Staffing",
    domain: "hr",
    keywords: ["비상 인력", "emergency", "긴급", "대체 투입"],
    intentPatterns: ["비상 상황에 인력이 필요하다", "긴급 투입"],
  },
  {
    taskId: "HR-028",
    taskName: "Volunteer Coordination",
    domain: "hr",
    keywords: ["봉사자 조율", "volunteer coordination", "자원봉사 관리"],
    intentPatterns: ["봉사자를 조율하고 싶다", "자원봉사 운영"],
  },
  {
    taskId: "HR-029",
    taskName: "Payroll Processing",
    domain: "hr",
    keywords: ["급여 처리", "payroll", "임금 지급", "정산"],
    intentPatterns: ["급여를 처리하고 싶다", "임금 정산이 필요하다"],
  },
  {
    taskId: "HR-030",
    taskName: "Staff Feedback",
    domain: "hr",
    keywords: ["스태프 피드백", "feedback", "의견 수집", "설문"],
    intentPatterns: ["스태프 피드백을 받고 싶다", "의견을 수집하고 싶다"],
  },
  {
    taskId: "HR-031",
    taskName: "Staff Recognition",
    domain: "hr",
    keywords: ["인정", "recognition", "포상", "표창", "시상"],
    intentPatterns: ["스태프를 인정하고 싶다", "포상이 필요하다"],
  },
  {
    taskId: "HR-032",
    taskName: "Offboarding",
    domain: "hr",
    keywords: ["오프보딩", "offboarding", "퇴직", "철수", "마무리"],
    intentPatterns: ["오프보딩이 필요하다", "스태프 철수 처리"],
  },
  {
    taskId: "HR-033",
    taskName: "Labor Cost Tracking",
    domain: "hr",
    keywords: ["인건비 추적", "labor cost", "비용 모니터링"],
    intentPatterns: ["인건비를 추적하고 싶다", "비용 현황이 필요하다"],
  },
  {
    taskId: "HR-034",
    taskName: "Staff Pool Management",
    domain: "hr",
    keywords: ["인력풀", "staff pool", "인재 풀", "데이터베이스"],
    intentPatterns: ["인력풀을 관리하고 싶다", "스태프 DB가 필요하다"],
  },
  {
    taskId: "HR-035",
    taskName: "Credential Verification",
    domain: "hr",
    keywords: ["자격 검증", "credential", "자격증", "인증"],
    intentPatterns: ["자격을 검증하고 싶다", "자격증 확인이 필요하다"],
  },
  {
    taskId: "HR-036",
    taskName: "Communication Dispatch",
    domain: "hr",
    keywords: ["커뮤니케이션 발송", "dispatch", "공지 발송", "메시지"],
    intentPatterns: ["공지를 발송하고 싶다", "스태프에게 연락하고 싶다"],
  },
  {
    taskId: "HR-037",
    taskName: "Safety Compliance",
    domain: "hr",
    keywords: ["안전 준수", "safety", "산업안전", "보건"],
    intentPatterns: ["안전 규정을 확인하고 싶다", "산업안전 준수"],
  },
  {
    taskId: "HR-038",
    taskName: "Staff Welfare",
    domain: "hr",
    keywords: ["복지", "welfare", "복리후생", "케어"],
    intentPatterns: ["스태프 복지가 필요하다", "복리후생을 제공하고 싶다"],
  },
  {
    taskId: "HR-039",
    taskName: "Post-Event HR Reporting",
    domain: "hr",
    keywords: ["HR 보고", "post-event", "결과 보고", "분석"],
    intentPatterns: ["HR 결과를 보고하고 싶다", "행사 후 HR 분석"],
  },
  {
    taskId: "HR-040",
    taskName: "Lessons Learned",
    domain: "hr",
    keywords: ["교훈", "lessons learned", "개선점", "회고"],
    intentPatterns: ["교훈을 정리하고 싶다", "HR 개선점이 필요하다"],
  },

  // ============ MEETINGS DOMAIN - Skill 13: Program Design (MTG-001~020) ============
  {
    taskId: "MTG-001",
    taskName: "Program Design & Structure",
    domain: "meetings",
    keywords: ["프로그램", "일정", "구조", "설계", "트랙", "세션 배치", "타임테이블"],
    intentPatterns: ["프로그램을 설계하고 싶다", "일정 구조가 필요하다", "트랙을 구성하고 싶다"],
  },
  {
    taskId: "MTG-002",
    taskName: "Session Scheduling",
    domain: "meetings",
    keywords: ["세션", "스케줄", "시간표", "배치", "일정표", "타임슬롯"],
    intentPatterns: ["세션 일정을 잡고 싶다", "스케줄을 최적화하고 싶다"],
  },
  {
    taskId: "MTG-003",
    taskName: "Track Management",
    domain: "meetings",
    keywords: ["트랙", "병렬", "세션 트랙", "주제별", "분야별"],
    intentPatterns: ["트랙을 관리하고 싶다", "병렬 세션을 구성하고 싶다"],
  },
  {
    taskId: "MTG-004",
    taskName: "Keynote Planning",
    domain: "meetings",
    keywords: ["키노트", "기조연설", "메인 세션", "오프닝"],
    intentPatterns: ["키노트를 기획하고 싶다", "기조연설 계획이 필요하다"],
  },
  {
    taskId: "MTG-005",
    taskName: "Breakout Session Design",
    domain: "meetings",
    keywords: ["분과", "breakout", "워크숍", "소그룹"],
    intentPatterns: ["분과 세션을 설계하고 싶다", "워크숍을 기획하고 싶다"],
  },
  {
    taskId: "MTG-006",
    taskName: "Panel Discussion Format",
    domain: "meetings",
    keywords: ["패널", "토론", "좌담", "포럼"],
    intentPatterns: ["패널 토론을 구성하고 싶다", "좌담회 형식이 필요하다"],
  },
  {
    taskId: "MTG-007",
    taskName: "Networking Session Design",
    domain: "meetings",
    keywords: ["네트워킹", "교류", "만남", "커피브레이크"],
    intentPatterns: ["네트워킹 세션을 기획하고 싶다", "참석자 교류 시간이 필요하다"],
  },
  {
    taskId: "MTG-008",
    taskName: "Workshop Planning",
    domain: "meetings",
    keywords: ["워크숍", "실습", "hands-on", "참여형"],
    intentPatterns: ["워크숍을 계획하고 싶다", "실습 세션이 필요하다"],
  },
  {
    taskId: "MTG-009",
    taskName: "Poster Session Management",
    domain: "meetings",
    keywords: ["포스터", "poster", "발표", "전시"],
    intentPatterns: ["포스터 세션을 관리하고 싶다", "포스터 발표를 계획하고 싶다"],
  },
  {
    taskId: "MTG-010",
    taskName: "Award Ceremony Design",
    domain: "meetings",
    keywords: ["시상식", "어워드", "수상", "표창"],
    intentPatterns: ["시상식을 기획하고 싶다", "어워드 세레모니가 필요하다"],
  },
  {
    taskId: "MTG-011",
    taskName: "Entertainment Programming",
    domain: "meetings",
    keywords: ["엔터테인먼트", "공연", "갈라", "만찬"],
    intentPatterns: ["엔터테인먼트를 기획하고 싶다", "공연 프로그램이 필요하다"],
  },
  {
    taskId: "MTG-012",
    taskName: "Program Timing Optimizer",
    domain: "meetings",
    keywords: ["타이밍", "시간 배분", "최적화", "일정 조정"],
    intentPatterns: ["프로그램 시간을 최적화하고 싶다", "일정 조정이 필요하다"],
  },
  {
    taskId: "MTG-013",
    taskName: "Room Assignment",
    domain: "meetings",
    keywords: ["룸 배정", "장소 배치", "공간 할당"],
    intentPatterns: ["세션별 룸을 배정하고 싶다", "공간을 배치하고 싶다"],
  },
  {
    taskId: "MTG-014",
    taskName: "Hybrid Session Design",
    domain: "meetings",
    keywords: ["하이브리드", "온라인", "가상", "혼합"],
    intentPatterns: ["하이브리드 세션을 설계하고 싶다", "온라인 참여를 계획하고 싶다"],
  },
  {
    taskId: "MTG-015",
    taskName: "Audience Engagement",
    domain: "meetings",
    keywords: ["청중 참여", "engagement", "인터랙션", "Q&A"],
    intentPatterns: ["청중 참여를 높이고 싶다", "인터랙션을 계획하고 싶다"],
  },
  {
    taskId: "MTG-016",
    taskName: "Program Conflict Resolution",
    domain: "meetings",
    keywords: ["충돌", "conflict", "겹침", "조정"],
    intentPatterns: ["프로그램 충돌을 해결하고 싶다", "세션 겹침을 조정하고 싶다"],
  },
  {
    taskId: "MTG-017",
    taskName: "Special Events Planning",
    domain: "meetings",
    keywords: ["특별 행사", "사이드 이벤트", "부대행사"],
    intentPatterns: ["특별 행사를 기획하고 싶다", "사이드 이벤트가 필요하다"],
  },
  {
    taskId: "MTG-018",
    taskName: "Program Accessibility",
    domain: "meetings",
    keywords: ["접근성", "통역", "자막", "장애인"],
    intentPatterns: ["프로그램 접근성을 확보하고 싶다", "통역이 필요하다"],
  },
  {
    taskId: "MTG-019",
    taskName: "Run of Show Creator",
    domain: "meetings",
    keywords: ["런시트", "run sheet", "진행표", "큐시트"],
    intentPatterns: ["런시트를 만들고 싶다", "진행표가 필요하다"],
  },
  {
    taskId: "MTG-020",
    taskName: "Program KPI Tracker",
    domain: "meetings",
    keywords: ["프로그램 KPI", "성과 지표", "측정"],
    intentPatterns: ["프로그램 성과를 측정하고 싶다", "KPI를 추적하고 싶다"],
  },

  // ============ MEETINGS DOMAIN - Skill 14: Speaker & Content (MTG-021~040) ============
  {
    taskId: "MTG-021",
    taskName: "Speaker Recruitment",
    domain: "meetings",
    keywords: ["연사", "발표자", "초청", "섭외", "speaker"],
    intentPatterns: ["연사를 섭외하고 싶다", "발표자를 모집하고 싶다"],
  },
  {
    taskId: "MTG-022",
    taskName: "Speaker Profile Management",
    domain: "meetings",
    keywords: ["연사 프로필", "이력", "바이오", "소개"],
    intentPatterns: ["연사 프로필을 관리하고 싶다", "발표자 정보가 필요하다"],
  },
  {
    taskId: "MTG-023",
    taskName: "Speaker Communication",
    domain: "meetings",
    keywords: ["연사 소통", "커뮤니케이션", "안내", "메일"],
    intentPatterns: ["연사와 소통하고 싶다", "발표자 안내가 필요하다"],
  },
  {
    taskId: "MTG-024",
    taskName: "Speaker Fee Negotiation",
    domain: "meetings",
    keywords: ["연사비", "사례금", "협상", "계약"],
    intentPatterns: ["연사비를 협상하고 싶다", "사례금 책정이 필요하다"],
  },
  {
    taskId: "MTG-025",
    taskName: "Speaker Travel Coordination",
    domain: "meetings",
    keywords: ["연사 여행", "항공", "숙소", "교통"],
    intentPatterns: ["연사 여행을 조율하고 싶다", "숙박을 예약하고 싶다"],
  },
  {
    taskId: "MTG-026",
    taskName: "Abstract Management",
    domain: "meetings",
    keywords: ["초록", "abstract", "논문", "발표 신청"],
    intentPatterns: ["초록을 관리하고 싶다", "발표 신청을 받고 싶다"],
  },
  {
    taskId: "MTG-027",
    taskName: "Peer Review Coordination",
    domain: "meetings",
    keywords: ["심사", "peer review", "평가", "선정"],
    intentPatterns: ["심사를 진행하고 싶다", "초록 평가가 필요하다"],
  },
  {
    taskId: "MTG-028",
    taskName: "Presentation Guidelines",
    domain: "meetings",
    keywords: ["발표 가이드", "템플릿", "규정", "양식"],
    intentPatterns: ["발표 가이드라인을 만들고 싶다", "템플릿이 필요하다"],
  },
  {
    taskId: "MTG-029",
    taskName: "Content Collection",
    domain: "meetings",
    keywords: ["콘텐츠 수집", "자료 수합", "PPT", "발표자료"],
    intentPatterns: ["발표 자료를 수집하고 싶다", "콘텐츠를 모으고 싶다"],
  },
  {
    taskId: "MTG-030",
    taskName: "Content Review & QA",
    domain: "meetings",
    keywords: ["콘텐츠 검토", "QA", "품질", "확인"],
    intentPatterns: ["콘텐츠를 검토하고 싶다", "품질 확인이 필요하다"],
  },
  {
    taskId: "MTG-031",
    taskName: "CE/CME Credit Management",
    domain: "meetings",
    keywords: ["CE", "CME", "학점", "인증", "평점"],
    intentPatterns: ["CE 학점을 관리하고 싶다", "인증 프로그램이 필요하다"],
  },
  {
    taskId: "MTG-032",
    taskName: "Technical Rehearsal",
    domain: "meetings",
    keywords: ["리허설", "기술 점검", "사전 테스트", "드라이런"],
    intentPatterns: ["리허설을 계획하고 싶다", "기술 점검이 필요하다"],
  },
  {
    taskId: "MTG-033",
    taskName: "Speaker Ready Room",
    domain: "meetings",
    keywords: ["스피커 룸", "대기실", "준비실"],
    intentPatterns: ["스피커 룸을 운영하고 싶다", "대기실이 필요하다"],
  },
  {
    taskId: "MTG-034",
    taskName: "Presentation Recording",
    domain: "meetings",
    keywords: ["녹화", "recording", "영상", "아카이브"],
    intentPatterns: ["발표를 녹화하고 싶다", "영상 아카이브가 필요하다"],
  },
  {
    taskId: "MTG-035",
    taskName: "On-demand Content",
    domain: "meetings",
    keywords: ["온디맨드", "on-demand", "VOD", "다시보기"],
    intentPatterns: ["온디맨드 콘텐츠를 제공하고 싶다", "VOD가 필요하다"],
  },
  {
    taskId: "MTG-036",
    taskName: "Session Feedback Analysis",
    domain: "meetings",
    keywords: ["세션 피드백", "평가", "설문", "만족도"],
    intentPatterns: ["세션 피드백을 분석하고 싶다", "만족도를 측정하고 싶다"],
  },
  {
    taskId: "MTG-037",
    taskName: "Content Repurposing",
    domain: "meetings",
    keywords: ["콘텐츠 재활용", "repurpose", "편집", "재가공"],
    intentPatterns: ["콘텐츠를 재활용하고 싶다", "편집이 필요하다"],
  },
  {
    taskId: "MTG-038",
    taskName: "Event App Content",
    domain: "meetings",
    keywords: ["앱 콘텐츠", "모바일", "디지털"],
    intentPatterns: ["앱 콘텐츠를 준비하고 싶다", "모바일 정보가 필요하다"],
  },
  {
    taskId: "MTG-039",
    taskName: "Proceedings Publication",
    domain: "meetings",
    keywords: ["학술 발표집", "proceedings", "출판", "논문집"],
    intentPatterns: ["발표집을 출판하고 싶다", "proceedings가 필요하다"],
  },
  {
    taskId: "MTG-040",
    taskName: "Speaker Recognition",
    domain: "meetings",
    keywords: ["연사 감사", "표창", "인정", "기념"],
    intentPatterns: ["연사에게 감사하고 싶다", "표창이 필요하다"],
  },

  // ============ SITE DOMAIN - Skill 15: Site Selection & Design (SITE-001~020) ============
  {
    taskId: "SITE-001",
    taskName: "Site Selection Analysis",
    domain: "site",
    keywords: ["사이트 선정", "장소 분석", "베뉴 평가", "site selection", "장소 비교"],
    intentPatterns: ["행사장을 선정하고 싶다", "장소를 분석하고 싶다", "베뉴를 평가하고 싶다"],
  },
  {
    taskId: "SITE-002",
    taskName: "Venue Contract Negotiation",
    domain: "site",
    keywords: ["베뉴 계약", "장소 협상", "venue contract", "임대 계약"],
    intentPatterns: ["베뉴 계약을 협상하고 싶다", "장소 계약이 필요하다"],
  },
  {
    taskId: "SITE-003",
    taskName: "Site Inspection",
    domain: "site",
    keywords: ["현장 답사", "사이트 점검", "site inspection", "장소 확인"],
    intentPatterns: ["현장 답사를 하고 싶다", "사이트를 점검하고 싶다"],
  },
  {
    taskId: "SITE-004",
    taskName: "Floor Plan Design",
    domain: "site",
    keywords: ["평면도", "배치도", "floor plan", "레이아웃", "공간 설계"],
    intentPatterns: ["평면도를 설계하고 싶다", "배치를 계획하고 싶다"],
  },
  {
    taskId: "SITE-005",
    taskName: "Safety & Security Planning",
    domain: "site",
    keywords: ["안전 계획", "보안 계획", "safety", "security", "비상 대응"],
    intentPatterns: ["안전 계획을 세우고 싶다", "보안을 계획하고 싶다"],
  },
  {
    taskId: "SITE-006",
    taskName: "Logistics Coordination",
    domain: "site",
    keywords: ["물류", "logistics", "운송", "배송", "반입"],
    intentPatterns: ["물류를 조율하고 싶다", "운송 계획이 필요하다"],
  },
  {
    taskId: "SITE-007",
    taskName: "Equipment Inventory",
    domain: "site",
    keywords: ["장비 목록", "equipment", "인벤토리", "기자재"],
    intentPatterns: ["장비 목록을 관리하고 싶다", "기자재를 확인하고 싶다"],
  },
  {
    taskId: "SITE-008",
    taskName: "Setup Schedule",
    domain: "site",
    keywords: ["셋업 일정", "setup", "설치", "준비 일정"],
    intentPatterns: ["셋업 일정을 잡고 싶다", "설치 계획이 필요하다"],
  },
  {
    taskId: "SITE-009",
    taskName: "Teardown Planning",
    domain: "site",
    keywords: ["철거", "teardown", "철수", "원상복구"],
    intentPatterns: ["철수를 계획하고 싶다", "철거 일정이 필요하다"],
  },
  {
    taskId: "SITE-010",
    taskName: "Signage & Wayfinding",
    domain: "site",
    keywords: ["사이니지", "안내판", "signage", "wayfinding", "동선"],
    intentPatterns: ["사이니지를 계획하고 싶다", "안내 체계가 필요하다"],
  },
  {
    taskId: "SITE-011",
    taskName: "Power & Electrical",
    domain: "site",
    keywords: ["전력", "전기", "power", "electrical", "콘센트"],
    intentPatterns: ["전력 계획이 필요하다", "전기 배치를 하고 싶다"],
  },
  {
    taskId: "SITE-012",
    taskName: "Network & Connectivity",
    domain: "site",
    keywords: ["네트워크", "WiFi", "인터넷", "connectivity", "통신"],
    intentPatterns: ["네트워크를 설치하고 싶다", "WiFi가 필요하다"],
  },
  {
    taskId: "SITE-013",
    taskName: "AV & Technical Setup",
    domain: "site",
    keywords: ["AV", "음향", "영상", "기술 장비", "스크린"],
    intentPatterns: ["AV 장비를 설치하고 싶다", "기술 셋업이 필요하다"],
  },
  {
    taskId: "SITE-014",
    taskName: "Accessibility Compliance",
    domain: "site",
    keywords: ["접근성", "accessibility", "장애인", "휠체어", "배리어프리"],
    intentPatterns: ["접근성을 확보하고 싶다", "장애인 편의를 계획하고 싶다"],
  },
  {
    taskId: "SITE-015",
    taskName: "Emergency Procedures",
    domain: "site",
    keywords: ["비상 절차", "emergency", "대피", "응급", "긴급"],
    intentPatterns: ["비상 절차를 수립하고 싶다", "긴급 상황 대응이 필요하다"],
  },
  {
    taskId: "SITE-016",
    taskName: "Vendor Coordination",
    domain: "site",
    keywords: ["공급업체", "vendor", "협력사", "외주"],
    intentPatterns: ["공급업체를 조율하고 싶다", "벤더 관리가 필요하다"],
  },
  {
    taskId: "SITE-017",
    taskName: "Parking & Traffic",
    domain: "site",
    keywords: ["주차", "교통", "parking", "traffic", "차량"],
    intentPatterns: ["주차를 계획하고 싶다", "교통 관리가 필요하다"],
  },
  {
    taskId: "SITE-018",
    taskName: "Waste Management",
    domain: "site",
    keywords: ["폐기물", "쓰레기", "waste", "청소", "분리수거"],
    intentPatterns: ["폐기물 관리가 필요하다", "쓰레기 처리를 계획하고 싶다"],
  },
  {
    taskId: "SITE-019",
    taskName: "Cleaning Services",
    domain: "site",
    keywords: ["청소", "cleaning", "위생", "미화"],
    intentPatterns: ["청소 서비스가 필요하다", "위생 관리를 계획하고 싶다"],
  },
  {
    taskId: "SITE-020",
    taskName: "Site Operations Report",
    domain: "site",
    keywords: ["사이트 보고", "현장 보고", "운영 리포트"],
    intentPatterns: ["사이트 운영을 보고하고 싶다", "현장 상황을 정리하고 싶다"],
  },

  // ============ SITE DOMAIN - Skill 16: Housing Management (SITE-021~040) ============
  {
    taskId: "SITE-021",
    taskName: "Hotel Block Negotiation",
    domain: "site",
    keywords: ["호텔 블록", "숙박 협상", "hotel block", "객실 계약"],
    intentPatterns: ["호텔 블록을 협상하고 싶다", "객실 계약이 필요하다"],
  },
  {
    taskId: "SITE-022",
    taskName: "Room Allocation",
    domain: "site",
    keywords: ["객실 배정", "room allocation", "방 배치"],
    intentPatterns: ["객실을 배정하고 싶다", "방 배치가 필요하다"],
  },
  {
    taskId: "SITE-023",
    taskName: "Guest Accommodation",
    domain: "site",
    keywords: ["게스트 숙박", "guest accommodation", "VIP 숙소"],
    intentPatterns: ["게스트 숙박을 관리하고 싶다", "VIP 숙소가 필요하다"],
  },
  {
    taskId: "SITE-024",
    taskName: "Housing Inventory",
    domain: "site",
    keywords: ["숙박 인벤토리", "housing inventory", "객실 현황"],
    intentPatterns: ["숙박 현황을 파악하고 싶다", "객실 인벤토리가 필요하다"],
  },
  {
    taskId: "SITE-025",
    taskName: "Housing Budget",
    domain: "site",
    keywords: ["숙박 예산", "housing budget", "숙박비"],
    intentPatterns: ["숙박 예산을 관리하고 싶다", "숙박비를 계획하고 싶다"],
  },
  {
    taskId: "SITE-026",
    taskName: "Housing Invoicing",
    domain: "site",
    keywords: ["숙박 인보이스", "housing invoice", "숙박 청구"],
    intentPatterns: ["숙박 인보이스를 관리하고 싶다", "숙박비 청구가 필요하다"],
  },
  {
    taskId: "SITE-027",
    taskName: "Check-in/Check-out Management",
    domain: "site",
    keywords: ["체크인", "체크아웃", "check-in", "check-out"],
    intentPatterns: ["체크인을 관리하고 싶다", "체크아웃 일정이 필요하다"],
  },
  {
    taskId: "SITE-028",
    taskName: "Rooming List Management",
    domain: "site",
    keywords: ["루밍 리스트", "rooming list", "숙박 명단"],
    intentPatterns: ["루밍 리스트를 관리하고 싶다", "숙박 명단이 필요하다"],
  },
  {
    taskId: "SITE-029",
    taskName: "Housing-Transportation Coordination",
    domain: "site",
    keywords: ["숙박 교통", "셔틀", "transportation", "이동"],
    intentPatterns: ["숙박과 교통을 연계하고 싶다", "셔틀이 필요하다"],
  },
  {
    taskId: "SITE-030",
    taskName: "VIP Housing Management",
    domain: "site",
    keywords: ["VIP 숙박", "VIP housing", "귀빈 숙소"],
    intentPatterns: ["VIP 숙박을 관리하고 싶다", "귀빈 숙소가 필요하다"],
  },
  {
    taskId: "SITE-031",
    taskName: "Attrition Management",
    domain: "site",
    keywords: ["감실", "attrition", "미사용 객실", "패널티"],
    intentPatterns: ["감실을 관리하고 싶다", "감실 패널티를 줄이고 싶다"],
  },
  {
    taskId: "SITE-032",
    taskName: "Housing Communications",
    domain: "site",
    keywords: ["숙박 안내", "housing communication", "숙박 공지"],
    intentPatterns: ["숙박 안내를 보내고 싶다", "숙박 관련 소통이 필요하다"],
  },
  {
    taskId: "SITE-033",
    taskName: "Post-Event Reconciliation",
    domain: "site",
    keywords: ["사후 정산", "reconciliation", "숙박 정산"],
    intentPatterns: ["숙박비를 정산하고 싶다", "사후 정산이 필요하다"],
  },
  {
    taskId: "SITE-034",
    taskName: "Group Room Block Management",
    domain: "site",
    keywords: ["그룹 룸", "group block", "단체 숙박"],
    intentPatterns: ["그룹 숙박을 관리하고 싶다", "단체 객실이 필요하다"],
  },
  {
    taskId: "SITE-035",
    taskName: "Housing Reporting",
    domain: "site",
    keywords: ["숙박 리포트", "housing report", "숙박 현황 보고"],
    intentPatterns: ["숙박 현황을 보고하고 싶다", "숙박 리포트가 필요하다"],
  },
  {
    taskId: "SITE-036",
    taskName: "Hotel Service Level Management",
    domain: "site",
    keywords: ["호텔 서비스", "service level", "SLA"],
    intentPatterns: ["호텔 서비스를 관리하고 싶다", "서비스 수준이 필요하다"],
  },
  {
    taskId: "SITE-037",
    taskName: "Room Block Release",
    domain: "site",
    keywords: ["블록 릴리스", "room release", "객실 반납"],
    intentPatterns: ["객실 블록을 릴리스하고 싶다", "미사용 객실을 반납하고 싶다"],
  },
  {
    taskId: "SITE-038",
    taskName: "Housing Compliance",
    domain: "site",
    keywords: ["숙박 컴플라이언스", "housing compliance", "규정 준수"],
    intentPatterns: ["숙박 규정을 준수하고 싶다", "컴플라이언스 확인이 필요하다"],
  },
  {
    taskId: "SITE-039",
    taskName: "Housing Technology Integration",
    domain: "site",
    keywords: ["숙박 기술", "housing tech", "시스템 연동"],
    intentPatterns: ["숙박 시스템을 연동하고 싶다", "기술 통합이 필요하다"],
  },
  {
    taskId: "SITE-040",
    taskName: "Housing Emergency Response",
    domain: "site",
    keywords: ["숙박 비상", "housing emergency", "긴급 대응"],
    intentPatterns: ["숙박 비상 상황에 대응하고 싶다", "긴급 대피가 필요하다"],
  },

  // ============ MARKETING ADVANCED DOMAIN - Skill 17: Marketing Analytics (MKTADV-001~020) ============
  {
    taskId: "MKTADV-001",
    taskName: "Marketing Data Analysis",
    domain: "marketing_adv",
    keywords: ["마케팅 데이터", "marketing data", "데이터 분석", "마케팅 분석"],
    intentPatterns: ["마케팅 데이터를 분석하고 싶다", "마케팅 성과를 측정하고 싶다"],
  },
  {
    taskId: "MKTADV-002",
    taskName: "Demand Forecasting",
    domain: "marketing_adv",
    keywords: ["수요 예측", "demand forecasting", "참가자 예측", "등록 예측"],
    intentPatterns: ["수요를 예측하고 싶다", "참가자 수를 예측하고 싶다"],
  },
  {
    taskId: "MKTADV-003",
    taskName: "ROI Measurement",
    domain: "marketing_adv",
    keywords: ["ROI 측정", "마케팅 ROI", "투자수익률", "캠페인 ROI"],
    intentPatterns: ["마케팅 ROI를 측정하고 싶다", "투자수익률을 계산하고 싶다"],
  },
  {
    taskId: "MKTADV-004",
    taskName: "Competitor Analysis",
    domain: "marketing_adv",
    keywords: ["경쟁사 분석", "competitor analysis", "시장 경쟁", "경쟁 이벤트"],
    intentPatterns: ["경쟁사를 분석하고 싶다", "경쟁 이벤트를 파악하고 싶다"],
  },
  {
    taskId: "MKTADV-005",
    taskName: "Conversion Tracking",
    domain: "marketing_adv",
    keywords: ["전환 추적", "conversion tracking", "등록 전환", "퍼널 분석"],
    intentPatterns: ["전환율을 추적하고 싶다", "등록 퍼널을 분석하고 싶다"],
  },
  {
    taskId: "MKTADV-006",
    taskName: "Audience Segmentation",
    domain: "marketing_adv",
    keywords: ["오디언스 세분화", "audience segmentation", "타겟 세분화", "고객 분류"],
    intentPatterns: ["오디언스를 세분화하고 싶다", "타겟 그룹을 나누고 싶다"],
  },
  {
    taskId: "MKTADV-007",
    taskName: "Campaign Performance",
    domain: "marketing_adv",
    keywords: ["캠페인 성과", "campaign performance", "광고 성과", "마케팅 캠페인"],
    intentPatterns: ["캠페인 성과를 분석하고 싶다", "광고 효과를 측정하고 싶다"],
  },
  {
    taskId: "MKTADV-008",
    taskName: "Attribution Modeling",
    domain: "marketing_adv",
    keywords: ["어트리뷰션", "attribution modeling", "성과 귀속", "채널 기여도"],
    intentPatterns: ["어트리뷰션 모델을 적용하고 싶다", "채널별 기여도를 분석하고 싶다"],
  },
  {
    taskId: "MKTADV-009",
    taskName: "A/B Test Analysis",
    domain: "marketing_adv",
    keywords: ["A/B 테스트", "split test", "실험 분석", "변형 테스트"],
    intentPatterns: ["A/B 테스트를 분석하고 싶다", "실험 결과를 확인하고 싶다"],
  },
  {
    taskId: "MKTADV-010",
    taskName: "Social Listening",
    domain: "marketing_adv",
    keywords: ["소셜 리스닝", "social listening", "SNS 모니터링", "버즈 분석"],
    intentPatterns: ["소셜 반응을 모니터링하고 싶다", "SNS 버즈를 분석하고 싶다"],
  },
  {
    taskId: "MKTADV-011",
    taskName: "Predictive Analytics",
    domain: "marketing_adv",
    keywords: ["예측 분석", "predictive analytics", "행동 예측", "ML 예측"],
    intentPatterns: ["예측 분석을 하고 싶다", "고객 행동을 예측하고 싶다"],
  },
  {
    taskId: "MKTADV-012",
    taskName: "Customer Journey Mapping",
    domain: "marketing_adv",
    keywords: ["고객 여정", "customer journey", "터치포인트 분석", "여정 맵"],
    intentPatterns: ["고객 여정을 매핑하고 싶다", "터치포인트를 분석하고 싶다"],
  },
  {
    taskId: "MKTADV-013",
    taskName: "Brand Health Tracking",
    domain: "marketing_adv",
    keywords: ["브랜드 건강", "brand health", "브랜드 인지도", "브랜드 추적"],
    intentPatterns: ["브랜드 건강을 추적하고 싶다", "브랜드 인지도를 측정하고 싶다"],
  },
  {
    taskId: "MKTADV-014",
    taskName: "Market Trend Analysis",
    domain: "marketing_adv",
    keywords: ["시장 트렌드", "market trend", "업계 동향", "트렌드 분석"],
    intentPatterns: ["시장 트렌드를 분석하고 싶다", "업계 동향을 파악하고 싶다"],
  },
  {
    taskId: "MKTADV-015",
    taskName: "Content Performance",
    domain: "marketing_adv",
    keywords: ["콘텐츠 성과", "content performance", "콘텐츠 분석", "콘텐츠 효과"],
    intentPatterns: ["콘텐츠 성과를 분석하고 싶다", "콘텐츠 효과를 측정하고 싶다"],
  },
  {
    taskId: "MKTADV-016",
    taskName: "Email Performance",
    domain: "marketing_adv",
    keywords: ["이메일 성과", "email performance", "이메일 분석", "오픈율"],
    intentPatterns: ["이메일 성과를 분석하고 싶다", "이메일 캠페인을 최적화하고 싶다"],
  },
  {
    taskId: "MKTADV-017",
    taskName: "Channel Mix Optimization",
    domain: "marketing_adv",
    keywords: ["채널 믹스", "channel mix", "채널 최적화", "미디어 믹스"],
    intentPatterns: ["채널 믹스를 최적화하고 싶다", "마케팅 채널을 조정하고 싶다"],
  },
  {
    taskId: "MKTADV-018",
    taskName: "Marketing Dashboard",
    domain: "marketing_adv",
    keywords: ["마케팅 대시보드", "marketing dashboard", "KPI 대시보드", "성과 대시보드"],
    intentPatterns: ["마케팅 대시보드를 만들고 싶다", "KPI를 모니터링하고 싶다"],
  },
  {
    taskId: "MKTADV-019",
    taskName: "Reporting Automation",
    domain: "marketing_adv",
    keywords: ["리포팅 자동화", "reporting automation", "자동 보고서", "보고서 생성"],
    intentPatterns: ["리포팅을 자동화하고 싶다", "보고서를 자동 생성하고 싶다"],
  },
  {
    taskId: "MKTADV-020",
    taskName: "Marketing Insights Summary",
    domain: "marketing_adv",
    keywords: ["마케팅 인사이트", "marketing insights", "인사이트 요약", "분석 요약"],
    intentPatterns: ["마케팅 인사이트를 정리하고 싶다", "분석 결과를 요약하고 싶다"],
  },

  // ============ MARKETING ADVANCED DOMAIN - Skill 18: CRM Integration (MKTADV-021~040) ============
  {
    taskId: "MKTADV-021",
    taskName: "CRM Integration",
    domain: "marketing_adv",
    keywords: ["CRM 연동", "CRM integration", "고객 데이터 연동", "Salesforce"],
    intentPatterns: ["CRM을 연동하고 싶다", "고객 데이터를 통합하고 싶다"],
  },
  {
    taskId: "MKTADV-022",
    taskName: "Lead Scoring",
    domain: "marketing_adv",
    keywords: ["리드 스코어링", "lead scoring", "잠재고객 점수", "리드 평가"],
    intentPatterns: ["리드를 점수화하고 싶다", "잠재고객을 평가하고 싶다"],
  },
  {
    taskId: "MKTADV-023",
    taskName: "Lead Nurturing",
    domain: "marketing_adv",
    keywords: ["리드 너처링", "lead nurturing", "리드 육성", "잠재고객 육성"],
    intentPatterns: ["리드를 너처링하고 싶다", "잠재고객을 육성하고 싶다"],
  },
  {
    taskId: "MKTADV-024",
    taskName: "Personalization Engine",
    domain: "marketing_adv",
    keywords: ["개인화 엔진", "personalization", "맞춤 콘텐츠", "개인화 추천"],
    intentPatterns: ["개인화를 적용하고 싶다", "맞춤 콘텐츠를 제공하고 싶다"],
  },
  {
    taskId: "MKTADV-025",
    taskName: "Behavior Tracking",
    domain: "marketing_adv",
    keywords: ["행동 추적", "behavior tracking", "사용자 행동", "행동 분석"],
    intentPatterns: ["행동을 추적하고 싶다", "사용자 행동을 분석하고 싶다"],
  },
  {
    taskId: "MKTADV-026",
    taskName: "Retargeting Campaign",
    domain: "marketing_adv",
    keywords: ["리타겟팅", "retargeting", "재타겟팅", "리마케팅"],
    intentPatterns: ["리타겟팅 캠페인을 만들고 싶다", "이탈자를 다시 타겟팅하고 싶다"],
  },
  {
    taskId: "MKTADV-027",
    taskName: "Customer Lifetime Value",
    domain: "marketing_adv",
    keywords: ["고객 생애 가치", "CLV", "LTV", "customer lifetime value"],
    intentPatterns: ["고객 생애 가치를 계산하고 싶다", "CLV를 분석하고 싶다"],
  },
  {
    taskId: "MKTADV-028",
    taskName: "Churn Prediction",
    domain: "marketing_adv",
    keywords: ["이탈 예측", "churn prediction", "고객 이탈", "이탈 방지"],
    intentPatterns: ["이탈을 예측하고 싶다", "고객 이탈을 방지하고 싶다"],
  },
  {
    taskId: "MKTADV-029",
    taskName: "Loyalty Program",
    domain: "marketing_adv",
    keywords: ["로열티 프로그램", "loyalty program", "충성도 프로그램", "포인트 적립"],
    intentPatterns: ["로열티 프로그램을 설계하고 싶다", "고객 충성도를 높이고 싶다"],
  },
  {
    taskId: "MKTADV-030",
    taskName: "Referral Program",
    domain: "marketing_adv",
    keywords: ["추천 프로그램", "referral program", "친구 추천", "바이럴 마케팅"],
    intentPatterns: ["추천 프로그램을 만들고 싶다", "바이럴 마케팅을 하고 싶다"],
  },
  {
    taskId: "MKTADV-031",
    taskName: "Post-Event Follow-Up",
    domain: "marketing_adv",
    keywords: ["이벤트 후속", "post-event", "후속 조치", "팔로우업"],
    intentPatterns: ["이벤트 후 팔로우업을 하고 싶다", "후속 조치를 계획하고 싶다"],
  },
  {
    taskId: "MKTADV-032",
    taskName: "Feedback Analysis",
    domain: "marketing_adv",
    keywords: ["피드백 분석", "feedback analysis", "설문 분석", "NPS 분석"],
    intentPatterns: ["피드백을 분석하고 싶다", "설문 결과를 분석하고 싶다"],
  },
  {
    taskId: "MKTADV-033",
    taskName: "Community Management",
    domain: "marketing_adv",
    keywords: ["커뮤니티 관리", "community management", "온라인 커뮤니티", "팬 커뮤니티"],
    intentPatterns: ["커뮤니티를 관리하고 싶다", "온라인 커뮤니티를 운영하고 싶다"],
  },
  {
    taskId: "MKTADV-034",
    taskName: "Advocacy Program",
    domain: "marketing_adv",
    keywords: ["옹호자 프로그램", "advocacy", "브랜드 앰배서더", "고객 옹호"],
    intentPatterns: ["옹호자 프로그램을 만들고 싶다", "브랜드 앰배서더를 모집하고 싶다"],
  },
  {
    taskId: "MKTADV-035",
    taskName: "Data Enrichment",
    domain: "marketing_adv",
    keywords: ["데이터 보강", "data enrichment", "데이터 강화", "프로필 보강"],
    intentPatterns: ["데이터를 보강하고 싶다", "고객 프로필을 강화하고 싶다"],
  },
  {
    taskId: "MKTADV-036",
    taskName: "Data Privacy Compliance",
    domain: "marketing_adv",
    keywords: ["데이터 프라이버시", "GDPR", "개인정보 보호", "데이터 규정"],
    intentPatterns: ["데이터 규정을 준수하고 싶다", "GDPR 준수 상태를 확인하고 싶다"],
  },
  {
    taskId: "MKTADV-037",
    taskName: "Marketing Automation",
    domain: "marketing_adv",
    keywords: ["마케팅 자동화", "marketing automation", "자동화 워크플로우", "드립 캠페인"],
    intentPatterns: ["마케팅을 자동화하고 싶다", "자동화 워크플로우를 만들고 싶다"],
  },
  {
    taskId: "MKTADV-038",
    taskName: "Workflow Optimization",
    domain: "marketing_adv",
    keywords: ["워크플로우 최적화", "workflow optimization", "프로세스 개선", "효율화"],
    intentPatterns: ["워크플로우를 최적화하고 싶다", "마케팅 프로세스를 개선하고 싶다"],
  },
  {
    taskId: "MKTADV-039",
    taskName: "Cross-Sell Upsell",
    domain: "marketing_adv",
    keywords: ["크로스셀", "업셀", "cross-sell", "upsell", "추가 판매"],
    intentPatterns: ["크로스셀 기회를 찾고 싶다", "업셀 전략을 세우고 싶다"],
  },
  {
    taskId: "MKTADV-040",
    taskName: "Revenue Attribution",
    domain: "marketing_adv",
    keywords: ["매출 귀속", "revenue attribution", "매출 기여", "수익 분석"],
    intentPatterns: ["매출 귀속을 분석하고 싶다", "마케팅 수익 기여도를 측정하고 싶다"],
  },

  // ============ PROFESSIONALISM DOMAIN - Skill 19: Ethics & Standards (PRO-001~010) ============
  {
    taskId: "PRO-001",
    taskName: "Ethics Code Compliance",
    domain: "professionalism",
    keywords: ["윤리", "ethics", "윤리 강령", "행동 규범", "code of conduct"],
    intentPatterns: ["윤리 강령을 확인하고 싶다", "윤리 준수 현황이 필요하다"],
  },
  {
    taskId: "PRO-002",
    taskName: "Industry Standards Adherence",
    domain: "professionalism",
    keywords: ["산업 표준", "industry standards", "ISO20121", "APEX", "MPI", "CIC"],
    intentPatterns: ["산업 표준을 확인하고 싶다", "표준 준수 여부를 평가하고 싶다"],
  },
  {
    taskId: "PRO-003",
    taskName: "Business Etiquette",
    domain: "professionalism",
    keywords: ["비즈니스 에티켓", "business etiquette", "예절", "문화", "프로토콜"],
    intentPatterns: ["비즈니스 에티켓이 필요하다", "국제 행사 예절을 알고 싶다"],
  },
  {
    taskId: "PRO-004",
    taskName: "Vendor Ethics Screening",
    domain: "professionalism",
    keywords: ["공급업체 윤리", "vendor ethics", "공급업체 심사", "윤리 평가"],
    intentPatterns: ["공급업체 윤리를 평가하고 싶다", "벤더 심사가 필요하다"],
  },
  {
    taskId: "PRO-005",
    taskName: "Sustainability Standards",
    domain: "professionalism",
    keywords: ["지속가능성", "sustainability", "ESG", "탄소 발자국", "친환경"],
    intentPatterns: ["지속가능성 표준을 확인하고 싶다", "친환경 이벤트를 기획하고 싶다"],
  },
  {
    taskId: "PRO-006",
    taskName: "DEI Compliance",
    domain: "professionalism",
    keywords: ["다양성", "DEI", "포용성", "형평성", "접근성"],
    intentPatterns: ["DEI 준수 현황을 확인하고 싶다", "다양성을 높이고 싶다"],
  },
  {
    taskId: "PRO-007",
    taskName: "Conflict of Interest",
    domain: "professionalism",
    keywords: ["이해충돌", "conflict of interest", "COI", "이해관계"],
    intentPatterns: ["이해충돌을 관리하고 싶다", "COI 신고가 필요하다"],
  },
  {
    taskId: "PRO-008",
    taskName: "Gift Policy Management",
    domain: "professionalism",
    keywords: ["선물 정책", "gift policy", "접대", "향응", "뇌물"],
    intentPatterns: ["선물 정책을 확인하고 싶다", "선물 수령 규정이 필요하다"],
  },
  {
    taskId: "PRO-009",
    taskName: "Whistleblower Protection",
    domain: "professionalism",
    keywords: ["내부고발", "whistleblower", "제보", "익명 신고", "보호"],
    intentPatterns: ["내부고발 채널이 필요하다", "제보자 보호 정책을 확인하고 싶다"],
  },
  {
    taskId: "PRO-010",
    taskName: "Professional Conduct",
    domain: "professionalism",
    keywords: ["전문가 행동", "professional conduct", "행동 지침", "품위"],
    intentPatterns: ["전문가 행동 지침이 필요하다", "품위 유지 기준을 확인하고 싶다"],
  },

  // ============ PROFESSIONALISM DOMAIN - Skill 20: Legal Compliance & Professional Development (PRO-011~020) ============
  {
    taskId: "PRO-011",
    taskName: "Legal Risk Review",
    domain: "professionalism",
    keywords: ["법적 리스크", "legal risk", "법률 검토", "법적 위험"],
    intentPatterns: ["법적 리스크를 검토하고 싶다", "법률적 위험을 평가하고 싶다"],
  },
  {
    taskId: "PRO-012",
    taskName: "Contract Compliance",
    domain: "professionalism",
    keywords: ["계약 준수", "contract compliance", "계약 의무", "이행"],
    intentPatterns: ["계약 준수 현황을 확인하고 싶다", "계약 의무를 점검하고 싶다"],
  },
  {
    taskId: "PRO-013",
    taskName: "Privacy Compliance",
    domain: "professionalism",
    keywords: ["개인정보", "privacy", "GDPR", "개인정보보호법", "동의"],
    intentPatterns: ["개인정보 보호 준수를 확인하고 싶다", "GDPR 준수가 필요하다"],
  },
  {
    taskId: "PRO-014",
    taskName: "Intellectual Property Protection",
    domain: "professionalism",
    keywords: ["지적재산권", "IP", "저작권", "상표", "특허"],
    intentPatterns: ["지적재산권을 보호하고 싶다", "저작권 문제를 확인하고 싶다"],
  },
  {
    taskId: "PRO-015",
    taskName: "Regulatory Compliance",
    domain: "professionalism",
    keywords: ["규제 준수", "regulatory", "법규", "허가", "신고"],
    intentPatterns: ["규제 준수 현황을 확인하고 싶다", "필요한 허가를 알고 싶다"],
  },
  {
    taskId: "PRO-016",
    taskName: "Professional Certification Management",
    domain: "professionalism",
    keywords: ["자격증", "certification", "CMP", "CSEP", "자격 관리"],
    intentPatterns: ["자격증 관리가 필요하다", "전문 자격을 확인하고 싶다"],
  },
  {
    taskId: "PRO-017",
    taskName: "Continuing Education Tracking",
    domain: "professionalism",
    keywords: ["계속 교육", "CE", "교육 이수", "학습", "보수 교육"],
    intentPatterns: ["교육 이수 현황을 확인하고 싶다", "CE 학점이 필요하다"],
  },
  {
    taskId: "PRO-018",
    taskName: "Self-Development Planning",
    domain: "professionalism",
    keywords: ["자기 개발", "self-development", "성장 계획", "역량 개발"],
    intentPatterns: ["자기 개발 계획이 필요하다", "역량 개발을 계획하고 싶다"],
  },
  {
    taskId: "PRO-019",
    taskName: "Mentorship Program",
    domain: "professionalism",
    keywords: ["멘토십", "mentorship", "멘토", "멘티", "코칭"],
    intentPatterns: ["멘토십 프로그램이 필요하다", "멘토를 찾고 싶다"],
  },
  {
    taskId: "PRO-020",
    taskName: "Career Development",
    domain: "professionalism",
    keywords: ["경력 개발", "career development", "커리어", "승진", "경력 경로"],
    intentPatterns: ["경력 개발 계획이 필요하다", "커리어 경로를 설계하고 싶다"],
  },
];

// =============================================================================
// ROUTER CLASS
// =============================================================================

export class IntelligentRouter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ai: any;
  private model = "@cf/meta/llama-3.1-70b-instruct";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(ai: any) {
    this.ai = ai;
  }

  /**
   * 사용자 질문을 분석하여 가장 적합한 에이전트 선택
   */
  async route(input: RouterInput): Promise<RouterOutput> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(input);

    try {
      const response = await this.ai.run(this.model, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 512,
        temperature: 0.3, // 낮은 temperature로 일관된 라우팅
      });

      const responseText =
        typeof response === "string"
          ? response
          : (response as { response?: string }).response || "";

      return this.parseRouterResponse(responseText, input.question);
    } catch (error) {
      console.error("Router error:", error);
      // Fallback: 키워드 기반 라우팅
      return this.fallbackRoute(input.question);
    }
  }

  /**
   * 시스템 프롬프트 생성
   */
  private buildSystemPrompt(): string {
    const agentList = AGENT_CATALOG.map(
      (a) => `- ${a.taskId}: ${a.taskName} [${a.domain}] - Keywords: ${a.keywords.slice(0, 5).join(", ")}`
    ).join("\n");

    return `You are an intelligent routing assistant for an Event Management AI system.
Your job is to analyze the user's question and select the SINGLE MOST APPROPRIATE agent to handle it.

## CRITICAL: OUT-OF-SCOPE DETECTION

This system is ONLY for EVENT PLANNING and MANAGEMENT. If the question is about:
- Weather, news, general knowledge
- Personal questions (relationships, health, etc.)
- Unrelated topics (cooking, sports scores, etc.)
- Technical support for unrelated products
- Any topic NOT related to event planning, finance, strategy, marketing, or management

You MUST return "out_of_scope" domain with taskId "NONE".

## Available Agents (422 total)

### Strategy Domain (STR-001~054) - CMP-IS Domain A: Strategic Planning
**Skill 1: Goal Setting (STR-001~013)**
- STR-001~013: 이벤트 목표 설정, 비전/미션, KPI, 마일스톤, 목표 추적/검토

**Skill 2: Stakeholder Analysis (STR-014~026)**
- STR-014~026: 이해관계자 식별/매핑/우선순위, 기대 관리, 갈등 해결, 협상

**Skill 3: Risk Management (STR-027~040)**
- STR-027~040: 리스크 식별/평가/우선순위, 완화/비상계획, 보험, 안전 리스크

**Skill 4: Strategic Alignment (STR-041~054)**
- STR-041~054: 전략 목표(BSC), KPI 설계, 변화 관리, 벤치마크, 시나리오 플래닝

### Project Domain (PRJ-001~041) - CMP-IS Domain B: Project Management
**Skill 5: Plan Project (PRJ-001~013)**
- PRJ-001~013: 일정 수립, 자원 계획, 범위 정의, WBS, 마일스톤, 역할 책임, 품질/조달 계획

**Skill 6: Manage Project (PRJ-014~041)**
- PRJ-014~027: 일정/자원/이슈 모니터링, 변경 관리, 진척도 보고, EVM, 팀 조율
- PRJ-028~040: 지식 공유, 인수인계, 계약 종료, 사후 평가, 자원 해제, 프로젝트 종료
- PRJ-041: 일정 일괄 조정 (전체 일정 미루기/앞당기기, "2일 미뤄줘", "일정 연기")

### Marketing Domain (MKT-001~040) - CMP-IS Domain C: Marketing Management
**Skill 7: Plan Marketing (MKT-001~015)**
- MKT-001~015: 시장 조사, 타겟 정의, 경쟁사 분석, 브랜드/채널/콘텐츠/캠페인 전략, 마케팅 예산, 미디어 플래닝, PR/파트너십/인플루언서/이메일/소셜 전략, ROI 예측

**Skill 8: Execute Marketing (MKT-016~040)**
- MKT-016~025: 캠페인 런칭, 크리에이티브 제작, 미디어 바잉, 콘텐츠 제작, 소셜/이메일/PR/인플루언서/파트너 실행, 랜딩페이지 최적화
- MKT-026~040: A/B 테스팅, 캠페인 최적화, 예산 재배분, 성과/전환 추적, ROI 분석, 경쟁사/소셜 모니터링, 리포팅, 캠페인 분석, 리드 너처링, 리타겟팅, 사후 마케팅

### Finance Domain (FIN-001~068) - CMP-IS Domain D: Financial Management
**Skill 7: Manage Event Funding (FIN-001~030)**
- FIN-001~030: 스폰서십 가치 산정, 스폰서 ROI, 등록 수익, 전시 수익, 추가 수익원

**Skill 8: Manage Budget (FIN-031~057)**
- FIN-031~057: 예산 구조, 비용 분석, 수익 예측, 손익분기점, 가격 책정, 예산 통제

**Skill 9: Manage Monetary Transactions (FIN-058~068)**
- FIN-058~068: 결제 시스템, 환불, 세금, 인보이스, 수금, 재무 보고

### Operations Domain (OPS-001~040) - CMP-IS Domain E: Operations Management
**Skill 9: Site Management (OPS-001~015)**
- OPS-001~015: 장소 소싱/평가/계약, 현장 답사, 평면도, 룸 셋업, AV/조명/무대, 사이니지, 접근성, 안전, 허가, 장식

**Skill 10: Logistics Management (OPS-016~040)**
- OPS-016~026: F&B/메뉴/음료, 교통/주차/숙박, 등록/배지, 보안/의료
- OPS-027~040: 연사/전시사 지원, 네트워킹, 라이브 스트리밍, 촬영, 분실물, 폐기물, 전력, 온도, 접근성 운영, 사이니지 실행, 현장 소통, 모니터링, 철수

### HR Domain (HR-001~040) - CMP-IS Domain F: Human Resources
**Skill 11: HR Planning (HR-001~015)**
- HR-001~015: 인력 요구 분석, 역할 정의, 조직 구조, 스킬 매트릭스, 채용 계획, 교육 분석/설계, 보상 계획, 스케줄링, 노동법 준수, 봉사자 전략, HR 예산, 커뮤니케이션 계획, 유니폼/장비, 비상 인력

**Skill 12: HR Management (HR-016~040)**
- HR-016~025: 스태프 채용, 면접, 계약, 온보딩, 교육 실행, 교대 배정, 출석 추적, 휴식 관리, 실시간 인력, 성과 추적
- HR-026~040: 이슈 해결, 비상 인력, 봉사자 조율, 급여 처리, 피드백, 인정, 오프보딩, 인건비 추적, 인력풀, 자격 검증, 커뮤니케이션 발송, 안전 준수, 복지, HR 보고, 교훈

### Meetings Domain (MTG-001~040) - CMP-IS Domain G: Meetings & Contents
**Skill 13: Program Design (MTG-001~020)**
- MTG-001~010: 프로그램 구조 설계, 세션 스케줄링, 트랙 관리, 키노트/브레이크아웃/패널/네트워킹/워크숍 기획
- MTG-011~020: 시상식, 엔터테인먼트, 타이밍 최적화, 룸 배정, 하이브리드 설계, 청중 참여, 충돌 해결, 특별행사, 접근성, 런시트, KPI 추적

**Skill 14: Speaker & Content Management (MTG-021~040)**
- MTG-021~030: 연사 섭외/프로필/소통/사례금/여행 조율, 초록 관리, 심사, 발표 가이드, 콘텐츠 수집/검토
- MTG-031~040: CE/CME 학점, 리허설, 스피커룸, 녹화, 온디맨드, 피드백 분석, 콘텐츠 재활용, 앱 콘텐츠, 발표집, 연사 인정

### Site Domain (SITE-001~040) - CMP-IS Domain H: Site Management
**Skill 15: Site Selection & Design (SITE-001~020)**
- SITE-001~010: 사이트 선정, 베뉴 계약, 현장 답사, 평면도 설계, 안전/보안 계획, 동선 설계, 물류 계획, 장비 관리
- SITE-011~020: 셋업/철거 관리, 세션룸 배치, AV 기술, 전력 인프라, 폐기물/지속가능성, 온도관리, 비상계획, 허가/컴플라이언스, 장식, 접근성, 현장 기술

**Skill 16: Housing Management (SITE-021~040)**
- SITE-021~030: 호텔 블록 협상, 객실 배정, 숙박 인벤토리, 숙박 예산, 인보이스, 체크인/아웃, 루밍 리스트, 교통 조율, VIP 숙박
- SITE-031~040: 감실 관리, 숙박 커뮤니케이션, 정산, 그룹 블록, 숙박 보고, 서비스 레벨, 블록 릴리스, 컴플라이언스, 기술 통합, 비상 대응

### Professionalism Domain (PRO-001~020) - CMP-IS Domain J: Professional Development
**Skill 19: Ethics & Standards (PRO-001~010)**
- PRO-001~005: 윤리 강령 준수, 이해충돌 관리, 선물/접대 정책, 기밀 유지, 이해충돌 신고
- PRO-006~010: 윤리 딜레마 해결, 비리 신고(Whistleblower), 공급업체 윤리 평가, 위기 윤리 대응

**Skill 20: Legal Compliance & Professional Development (PRO-011~020)**
- PRO-011~015: 법적 리스크 검토, 계약 준수, 개인정보보호(GDPR/PIPA), 지적재산권, 규제 준수
- PRO-016~020: 전문자격 관리(CMP/CSEP), 평생교육 학점(CE), 자기개발 계획, 멘토십 프로그램, 커리어 개발

## ROUTING RULES

1. **Out-of-Scope Check FIRST**: If NOT related to event management, return out_of_scope immediately
2. **Intent-Based Selection**: Focus on what the user WANTS TO DO, not just keywords
3. **Domain Priority**:
   - Questions about GOALS, STAKEHOLDERS, RISKS → Strategy (STR-*)
   - Questions about PROJECT PLANNING, SCHEDULING, WBS, RESOURCES, MILESTONES → Project (PRJ-*)
   - Questions about PROJECT EXECUTION, ISSUES, PROGRESS, CLOSURE → Project (PRJ-*)
   - Questions about MARKETING, PROMOTION, CAMPAIGNS, ADVERTISING, SNS, PR, INFLUENCER → Marketing (MKT-*)
   - Questions about MONEY, BUDGET, PRICING, SPONSORS → Finance (FIN-*)
   - Questions about VENUE, SITE, F&B, CATERING, AV, LIGHTING, SECURITY, REGISTRATION, LOGISTICS → Operations (OPS-*)
   - Questions about STAFF, RECRUITMENT, TRAINING, PAYROLL, VOLUNTEER, SCHEDULING, ATTENDANCE, ONBOARDING → HR (HR-*)
   - Questions about PROGRAM, SESSIONS, SPEAKERS, PRESENTERS, TRACKS, KEYNOTE, ABSTRACTS, CONTENT, CE/CME → Meetings (MTG-*)
   - Questions about SITE SELECTION, VENUE CONTRACT, FLOOR PLAN, SETUP, TEARDOWN, HOUSING, HOTEL BLOCKS, ROOM ALLOCATION, VIP HOUSING, TRANSPORTATION → Site (SITE-*)
   - Questions about ETHICS, COMPLIANCE, LEGAL RISK, PRIVACY (GDPR/PIPA), INTELLECTUAL PROPERTY, CONTRACTS, CERTIFICATION (CMP/CSEP), CONTINUING EDUCATION, CAREER DEVELOPMENT, MENTORSHIP, WHISTLEBLOWER, CONFLICT OF INTEREST → Professionalism (PRO-*)
4. **Specificity**: Choose the most specific agent that matches the intent
5. **Confidence**: Rate your confidence from 0.0 to 1.0

## OUTPUT FORMAT (STRICT JSON)

You MUST respond with ONLY a valid JSON object:
{
  "taskId": "FIN-001 or STR-001 or PRJ-001 or MKT-001 or OPS-001 or HR-001 or MTG-001 or SITE-001 or PRO-001 or NONE",
  "domain": "finance" or "strategy" or "project" or "marketing" or "operations" or "hr" or "meetings" or "site" or "professionalism" or "out_of_scope",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this agent was selected or why it's out of scope"
}

CRITICAL: Output ONLY the JSON object, nothing else.`;
  }

  /**
   * 사용자 프롬프트 생성
   */
  private buildUserPrompt(input: RouterInput): string {
    let prompt = `## User Question\n"${input.question}"`;

    if (input.context) {
      prompt += `\n\n## Context`;
      if (input.context.event_type) {
        prompt += `\nEvent Type: ${input.context.event_type}`;
      }
      if (input.context.previous_tasks?.length) {
        prompt += `\nPrevious Tasks: ${input.context.previous_tasks.join(", ")}`;
      }
    }

    prompt += `\n\nAnalyze this question and select the single best agent. Output ONLY valid JSON.`;

    return prompt;
  }

  /**
   * LLM 응답 파싱
   */
  private parseRouterResponse(responseText: string, originalQuestion: string): RouterOutput {
    try {
      // JSON 블록 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      const parsed = JSON.parse(jsonStr.trim());

      // Out-of-Scope 체크
      if (parsed.domain === "out_of_scope" || parsed.taskId === "NONE") {
        return {
          taskId: "NONE",
          domain: "out_of_scope",
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
          reasoning: parsed.reasoning || "This question is outside the scope of event management",
          isOutOfScope: true,
        };
      }

      // 유효한 taskId인지 확인
      const validAgent = AGENT_CATALOG.find((a) => a.taskId === parsed.taskId);
      if (!validAgent) {
        throw new Error(`Invalid taskId: ${parsed.taskId}`);
      }

      return {
        taskId: parsed.taskId,
        domain: validAgent.domain,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
        reasoning: parsed.reasoning || "AI-selected agent",
        isOutOfScope: false,
      };
    } catch {
      // 파싱 실패 시 fallback
      return this.fallbackRoute(originalQuestion);
    }
  }

  /**
   * Out-of-Scope 키워드 체크
   */
  private isOutOfScopeQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase();

    // Out-of-scope 키워드 패턴
    const outOfScopePatterns = [
      // 날씨
      "날씨", "기온", "비가", "눈이", "weather", "temperature", "forecast",
      // 일반 지식
      "뉴스", "news", "정치", "politics", "축구", "야구", "basketball",
      // 개인적 질문
      "연애", "데이트", "건강", "다이어트", "요리", "레시피", "cooking",
      // 기술 지원 (비이벤트)
      "아이폰", "iphone", "안드로이드", "android", "컴퓨터 수리",
      // 기타
      "주식", "stock", "비트코인", "bitcoin", "crypto",
    ];

    // 이벤트 관련 키워드 - 이게 있으면 out-of-scope 아님
    const eventRelatedPatterns = [
      "이벤트", "event", "행사", "컨퍼런스", "conference", "세미나", "seminar",
      "목표", "goal", "예산", "budget", "스폰서", "sponsor", "리스크", "risk",
      "이해관계자", "stakeholder", "전략", "strategy", "참가자", "attendee",
      "등록", "registration", "가격", "price", "비용", "cost", "수익", "revenue",
      // Project Domain keywords
      "프로젝트", "project", "일정", "schedule", "WBS", "마일스톤", "milestone",
      "자원", "resource", "범위", "scope", "산출물", "deliverable", "팀", "team",
      "진척", "progress", "이슈", "issue", "변경", "change", "품질", "quality",
      "인수인계", "handover", "종료", "closure", "교훈", "lessons",
      // Marketing Domain keywords
      "마케팅", "marketing", "홍보", "promotion", "광고", "advertising", "캠페인", "campaign",
      "소셜", "SNS", "social media", "인스타그램", "페이스북", "링크드인", "유튜브",
      "인플루언서", "influencer", "PR", "보도자료", "언론", "미디어", "media",
      "타겟", "target", "오디언스", "audience", "브랜드", "brand", "콘텐츠", "content",
      "크리에이티브", "creative", "리타겟팅", "retargeting", "전환", "conversion",
      "랜딩페이지", "landing page", "이메일", "email", "뉴스레터", "newsletter",
      // Operations Domain keywords
      "장소", "베뉴", "venue", "행사장", "site", "현장", "답사",
      "음향", "AV", "조명", "lighting", "무대", "stage", "스테이지",
      "케이터링", "catering", "식사", "F&B", "음식", "메뉴", "음료",
      "셔틀", "교통", "주차", "숙박", "호텔", "accommodation",
      "등록", "배지", "badge", "체크인", "현장 등록",
      "보안", "security", "경비", "의료", "medical", "응급",
      "연사", "speaker", "발표자", "그린룸", "전시사", "exhibitor",
      "사이니지", "signage", "안내판", "장식", "decoration",
      "접근성", "accessibility", "휠체어", "안전", "safety",
      "철수", "load-out", "원상복구", "하이브리드", "스트리밍",
      // HR Domain keywords
      "스태프", "staff", "인력", "인원", "채용", "recruitment", "모집",
      "교육", "training", "훈련", "온보딩", "onboarding",
      "급여", "payroll", "임금", "보상", "compensation",
      "봉사자", "volunteer", "자원봉사",
      "근무", "shift", "교대", "스케줄", "출석", "attendance", "근태",
      "역할", "role", "직무", "R&R", "조직",
      "노동법", "근로기준법", "compliance",
      "면접", "interview", "계약", "contract",
      "성과", "performance", "평가", "피드백", "feedback",
      "복지", "welfare", "휴식", "break",
      // Site Domain keywords
      "사이트", "site", "현장 답사", "베뉴 계약", "venue contract",
      "평면도", "floor plan", "동선", "flow", "물류", "logistics",
      "셋업", "setup", "철거", "teardown", "load-out",
      "전력", "power", "인프라", "infrastructure",
      "하우징", "housing", "호텔 블록", "hotel block", "객실 배정", "room allocation",
      "루밍 리스트", "rooming list", "체크인", "check-in", "체크아웃", "check-out",
      "VIP 숙박", "VIP housing", "감실", "attrition",
      "컴플라이언스", "compliance", "허가", "permit",
      "지속가능성", "sustainability", "폐기물", "waste",
    ];

    // 이벤트 관련 키워드가 있으면 out-of-scope 아님
    for (const pattern of eventRelatedPatterns) {
      if (lowerQuestion.includes(pattern)) {
        return false;
      }
    }

    // Out-of-scope 키워드가 있으면 true
    for (const pattern of outOfScopePatterns) {
      if (lowerQuestion.includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Fallback: 키워드 기반 라우팅
   */
  private fallbackRoute(question: string): RouterOutput {
    const lowerQuestion = question.toLowerCase();

    // Out-of-scope 체크
    if (this.isOutOfScopeQuestion(question)) {
      return {
        taskId: "NONE",
        domain: "out_of_scope",
        confidence: 0.85,
        reasoning: "This question is not related to event management",
        isOutOfScope: true,
      };
    }

    // 키워드 매칭 점수 계산
    let bestMatch: { agent: AgentMetadata; score: number } | null = null;

    for (const agent of AGENT_CATALOG) {
      let score = 0;

      // 키워드 매칭
      for (const keyword of agent.keywords) {
        if (lowerQuestion.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Intent 패턴 매칭
      for (const pattern of agent.intentPatterns) {
        if (lowerQuestion.includes(pattern.substring(0, 5).toLowerCase())) {
          score += 5;
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { agent, score };
      }
    }

    // 기본값: 목표가 언급되면 STR-001, 그 외 FIN-031 (예산)
    if (!bestMatch || bestMatch.score === 0) {
      if (lowerQuestion.includes("목표") || lowerQuestion.includes("goal")) {
        return {
          taskId: "STR-001",
          domain: "strategy",
          confidence: 0.5,
          reasoning: "Fallback: Goal-related keywords detected",
          isOutOfScope: false,
        };
      }
      return {
        taskId: "FIN-031",
        domain: "finance",
        confidence: 0.3,
        reasoning: "Fallback: No strong keyword match, defaulting to budget structure",
        isOutOfScope: false,
      };
    }

    return {
      taskId: bestMatch.agent.taskId,
      domain: bestMatch.agent.domain,
      confidence: Math.min(bestMatch.score / 30, 0.9),
      reasoning: `Keyword matching: ${bestMatch.agent.taskName}`,
      isOutOfScope: false,
    };
  }

  /**
   * 복합 쿼리 분석 - 여러 에이전트가 필요한 질문인지 판단
   */
  async analyzeComplexQuery(input: RouterInput): Promise<ComplexRouterOutput> {
    // 먼저 단순 라우팅 수행
    const simpleRoute = await this.route(input);

    // Out-of-scope면 바로 반환
    if (simpleRoute.isOutOfScope) {
      return simpleRoute;
    }

    // 복합 쿼리 패턴 감지
    const complexityIndicators = this.detectComplexityIndicators(input.question);

    if (!complexityIndicators.isComplex) {
      // 단순 쿼리면 그대로 반환
      return simpleRoute;
    }

    // 복합 쿼리 - ExecutionPlan 생성
    try {
      const executionPlan = await this.generateExecutionPlan(input, complexityIndicators);

      return {
        ...simpleRoute,
        taskId: executionPlan.steps[0]?.taskId ?? simpleRoute.taskId,
        reasoning: `Complex query detected: ${executionPlan.reasoning}`,
        executionPlan,
      };
    } catch (error) {
      console.error("ExecutionPlan generation failed:", error);
      return simpleRoute;
    }
  }

  /**
   * 복합 쿼리 패턴 감지
   */
  private detectComplexityIndicators(question: string): {
    isComplex: boolean;
    patterns: string[];
    suggestedDomains: string[];
  } {
    const patterns: string[] = [];
    const suggestedDomains: Set<string> = new Set();
    const lowerQuestion = question.toLowerCase();

    // 접속사/연결어 패턴 - 복합 질문 감지
    const conjunctionPatterns = [
      { pattern: /그리고|또한|더불어|함께|동시에/, name: "sequential" },
      { pattern: /그 다음에?|이후에?|완료되면|끝나면/, name: "dependent" },
      { pattern: /비교해|대비해|vs|versus|어떤 게 나은/, name: "comparison" },
      { pattern: /전체적으로|종합적으로|전반적으로/, name: "comprehensive" },
      { pattern: /먼저.*(그 다음|이후|그리고)/, name: "ordered_sequence" },
    ];

    for (const { pattern, name } of conjunctionPatterns) {
      if (pattern.test(lowerQuestion)) {
        patterns.push(name);
      }
    }

    // 도메인 키워드 감지
    const domainPatterns = [
      { domain: "strategy", keywords: ["목표", "비전", "리스크", "이해관계자", "전략"] },
      { domain: "finance", keywords: ["예산", "비용", "스폰서", "수익", "ROI", "가격"] },
      { domain: "project", keywords: ["일정", "WBS", "마일스톤", "진척", "프로젝트"] },
      { domain: "marketing", keywords: ["홍보", "마케팅", "캠페인", "SNS", "광고"] },
      { domain: "operations", keywords: ["장소", "베뉴", "케이터링", "등록", "현장"] },
      { domain: "hr", keywords: ["스태프", "인력", "채용", "교육", "급여", "봉사자"] },
      { domain: "meetings", keywords: ["프로그램", "세션", "연사", "발표", "트랙", "키노트", "초록", "콘텐츠"] },
    ];

    for (const { domain, keywords } of domainPatterns) {
      for (const keyword of keywords) {
        if (lowerQuestion.includes(keyword)) {
          suggestedDomains.add(domain);
          break;
        }
      }
    }

    // 복합 쿼리 판단 기준:
    // 1. 여러 도메인 키워드가 섞여 있음 (2개 이상)
    // 2. 접속사/연결어 패턴이 발견됨
    const isComplex = suggestedDomains.size >= 2 || patterns.length > 0;

    return {
      isComplex,
      patterns,
      suggestedDomains: Array.from(suggestedDomains),
    };
  }

  /**
   * 복합 쿼리에 대한 ExecutionPlan 생성
   */
  private async generateExecutionPlan(
    input: RouterInput,
    indicators: { patterns: string[]; suggestedDomains: string[] }
  ): Promise<ExecutionPlan> {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // LLM을 사용하여 실행 계획 생성
    const systemPrompt = `You are an execution planner for an Event Management AI system.
Given a complex question that requires multiple agents, create an ordered execution plan.

## Available Domains and Example Agents
- strategy: STR-001 (Goal Setting), STR-002 (Stakeholder Analysis), STR-003 (Risk Assessment)
- project: PRJ-001 (Scope Definition), PRJ-005 (WBS Creation), PRJ-014 (Schedule Monitoring)
- marketing: MKT-001 (Market Analysis), MKT-007 (Campaign Planning), MKT-014 (Social Media)
- finance: FIN-001 (Sponsorship Valuation), FIN-031 (Budget Structure), FIN-037 (Break-Even)
- operations: OPS-001 (Venue Sourcing), OPS-008 (Catering), OPS-022 (Crowd Management)
- hr: HR-001 (Staffing Needs), HR-016 (Recruitment), HR-022 (Attendance)
- meetings: MTG-001 (Program Design), MTG-021 (Speaker Recruitment), MTG-026 (Abstract Management)

## Rules for Creating Execution Plan
1. Order steps logically - strategy/planning before execution
2. Mark dependencies between steps
3. Use the most specific agent for each sub-task
4. Keep plans concise (2-5 steps typically)

## Output Format (STRICT JSON)
{
  "steps": [
    {
      "stepNumber": 1,
      "taskId": "STR-001",
      "domain": "strategy",
      "purpose": "Define event goals first",
      "dependsOn": [],
      "inputMapping": {}
    },
    {
      "stepNumber": 2,
      "taskId": "FIN-031",
      "domain": "finance",
      "purpose": "Create budget based on goals",
      "dependsOn": [1],
      "inputMapping": {"goals": "step1.output.goals"}
    }
  ],
  "reasoning": "Brief explanation of the plan"
}

Output ONLY valid JSON.`;

    const userPrompt = `Question: "${input.question}"

Detected patterns: ${indicators.patterns.join(", ") || "none"}
Suggested domains: ${indicators.suggestedDomains.join(", ")}

Create an execution plan with 2-5 steps to answer this complex question.`;

    try {
      const response = await this.ai.run(this.model, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      });

      const responseText =
        typeof response === "string"
          ? response
          : (response as { response?: string }).response || "";

      // JSON 추출 및 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 유효성 검증 및 정제
        const steps: ExecutionStep[] = (parsed.steps || [])
          .filter((step: Record<string, unknown>) => step && typeof step.taskId === "string")
          .map((step: Record<string, unknown>, index: number) => ({
            stepNumber: typeof step.stepNumber === "number" ? step.stepNumber : index + 1,
            taskId: String(step.taskId || ""),
            domain: this.validateDomain(step.domain),
            purpose: String(step.purpose || ""),
            dependsOn: Array.isArray(step.dependsOn) ? step.dependsOn.filter((d: unknown) => typeof d === "number") : [],
            inputMapping: typeof step.inputMapping === "object" && step.inputMapping !== null ? step.inputMapping as Record<string, string> : undefined,
          }));

        return {
          planId,
          isComplex: true,
          steps,
          totalSteps: steps.length,
          reasoning: String(parsed.reasoning || "Multi-step execution plan generated"),
          estimatedComplexity: steps.length <= 2 ? "moderate" : "complex",
        };
      }
    } catch (error) {
      console.error("ExecutionPlan LLM error:", error);
    }

    // Fallback: 감지된 도메인 기반으로 단순 계획 생성
    return this.createFallbackPlan(planId, indicators.suggestedDomains);
  }

  /**
   * 도메인 값 검증
   */
  private validateDomain(domain: unknown): "finance" | "strategy" | "project" | "marketing" | "marketing_adv" | "operations" | "hr" | "meetings" | "site" | "professionalism" {
    const validDomains = ["finance", "strategy", "project", "marketing", "marketing_adv", "operations", "hr", "meetings", "site", "professionalism"] as const;
    if (typeof domain === "string" && validDomains.includes(domain as typeof validDomains[number])) {
      return domain as typeof validDomains[number];
    }
    return "strategy"; // 기본값
  }

  /**
   * Fallback 실행 계획 생성
   */
  private createFallbackPlan(planId: string, suggestedDomains: string[]): ExecutionPlan {
    // 도메인 우선순위 순서
    const domainOrder = ["strategy", "project", "finance", "marketing", "operations", "hr"];
    const sortedDomains = suggestedDomains.sort((a, b) =>
      domainOrder.indexOf(a) - domainOrder.indexOf(b)
    );

    // 각 도메인의 대표 에이전트 매핑
    const domainDefaultAgents: Record<string, string> = {
      strategy: "STR-001",
      project: "PRJ-001",
      finance: "FIN-031",
      marketing: "MKT-001",
      operations: "OPS-001",
      hr: "HR-001",
    };

    const steps: ExecutionStep[] = sortedDomains.slice(0, 4).map((domain, index) => ({
      stepNumber: index + 1,
      taskId: domainDefaultAgents[domain] || "STR-001",
      domain: domain as ExecutionStep["domain"],
      purpose: `Process ${domain} domain aspects`,
      dependsOn: index > 0 ? [index] : [],
      inputMapping: undefined,
    }));

    return {
      planId,
      isComplex: true,
      steps,
      totalSteps: steps.length,
      reasoning: "Fallback plan based on detected domain keywords",
      estimatedComplexity: steps.length <= 2 ? "moderate" : "complex",
    };
  }

  /**
   * 에이전트 카탈로그 조회
   */
  static getAgentCatalog(): AgentMetadata[] {
    return AGENT_CATALOG;
  }

  /**
   * 에이전트 통계 조회
   */
  static getAgentStats(): {
    total: number;
    byDomain: Record<string, number>;
  } {
    const stats = {
      total: AGENT_CATALOG.length,
      byDomain: {} as Record<string, number>,
    };

    for (const agent of AGENT_CATALOG) {
      if (!stats.byDomain[agent.domain]) {
        stats.byDomain[agent.domain] = 0;
      }
      stats.byDomain[agent.domain]++;
    }

    return stats;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createRouter(ai: any): IntelligentRouter {
  if (!ai) {
    throw new Error("Cloudflare AI binding is required");
  }
  return new IntelligentRouter(ai);
}

export default IntelligentRouter;
