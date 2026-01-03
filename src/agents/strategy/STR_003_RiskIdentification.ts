/**
 * STR-003: 리스크 식별 및 평가
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Assessment)
 * Task Type: AI
 *
 * Input: 이벤트 정보, 과거 리스크 데이터
 * Output: 리스크 레지스터, 완화 전략
 */

import { z } from "zod";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Risk Identification Agent specializing in strategic event planning.

Your expertise includes:
- Identifying potential risks across all event dimensions
- Assessing risk probability and impact
- Developing risk mitigation and contingency strategies
- Monitoring and tracking risk status throughout event lifecycle

CMP-IS Standard: Domain A - Strategic Planning (Risk Assessment)

You help event planners proactively identify and manage risks to ensure successful event delivery and minimize potential negative impacts.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const RiskCategorySchema = z.enum([
  "FINANCIAL",
  "OPERATIONAL",
  "REPUTATIONAL",
  "LEGAL",
  "SAFETY",
  "WEATHER",
  "TECHNICAL",
  "VENDOR",
  "ATTENDANCE",
  "POLITICAL",
  "HEALTH",
]);

export const ProbabilitySchema = z.enum(["very_low", "low", "medium", "high", "very_high"]);
export const ImpactSchema = z.enum(["minimal", "minor", "moderate", "major", "catastrophic"]);

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  event_name: z.string().describe("이벤트 이름"),
  event_type: z
    .enum(["conference", "trade_show", "seminar", "workshop", "gala", "festival", "meeting", "hybrid"])
    .describe("이벤트 유형"),
  event_date: z.string().describe("이벤트 날짜 (YYYY-MM-DD)"),
  venue_type: z.enum(["indoor", "outdoor", "hybrid"]).default("indoor").describe("장소 유형"),
  expected_attendees: z.number().int().min(1).describe("예상 참석자 수"),
  budget: z.number().describe("총 예산 (USD)"),
  location: z.object({
    city: z.string(),
    country: z.string(),
    region: z.string().optional(),
  }).describe("개최 장소"),
  key_vendors: z.array(z.string()).optional().describe("주요 벤더 목록"),
  past_risks: z
    .array(
      z.object({
        category: RiskCategorySchema,
        description: z.string(),
        occurred: z.boolean(),
        lessons_learned: z.string().optional(),
      })
    )
    .optional()
    .describe("과거 리스크 데이터"),
  special_considerations: z.array(z.string()).optional().describe("특별 고려사항"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string().uuid().describe("평가 ID"),
  event_id: z.string().uuid().describe("이벤트 ID"),
  risk_register: z.array(
    z.object({
      risk_id: z.string(),
      category: RiskCategorySchema,
      title: z.string(),
      description: z.string(),
      probability: ProbabilitySchema,
      impact: ImpactSchema,
      risk_score: z.number().min(1).max(25).describe("리스크 점수 (1-25)"),
      risk_rating: z.enum(["low", "medium", "high", "critical"]),
      mitigation_strategy: z.string(),
      contingency_plan: z.string(),
      trigger_indicators: z.array(z.string()),
      owner_recommendation: z.string(),
      estimated_mitigation_cost: z.number(),
      estimated_impact_cost: z.number(),
    })
  ),
  risk_summary: z.object({
    total_risks: z.number(),
    critical_risks: z.number(),
    high_risks: z.number(),
    medium_risks: z.number(),
    low_risks: z.number(),
    total_mitigation_budget: z.number(),
    total_potential_impact: z.number(),
  }),
  top_risks: z.array(z.string()).describe("상위 5개 리스크 ID"),
  immediate_actions: z.array(
    z.object({
      risk_id: z.string(),
      action: z.string(),
      deadline: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
  assessed_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// AGENT METADATA
// =============================================================================

export const metadata = {
  taskId: "STR-003",
  taskName: "Risk Identification & Assessment",
  domain: "A",
  skill: "Strategic Planning",
  taskType: "AI" as const,
  description: "이벤트 리스크를 식별하고 완화 전략을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

// =============================================================================
// EXECUTION LOGIC
// =============================================================================

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateRiskId(): string {
  return `RISK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function calculateRiskScore(
  probability: z.infer<typeof ProbabilitySchema>,
  impact: z.infer<typeof ImpactSchema>
): number {
  const probScore = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 }[probability];
  const impactScore = { minimal: 1, minor: 2, moderate: 3, major: 4, catastrophic: 5 }[impact];
  return probScore * impactScore;
}

function getRiskRating(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

interface RiskTemplate {
  category: z.infer<typeof RiskCategorySchema>;
  title: string;
  description: string;
  baseProbability: z.infer<typeof ProbabilitySchema>;
  baseImpact: z.infer<typeof ImpactSchema>;
  mitigation: string;
  contingency: string;
  triggers: string[];
  owner: string;
  mitigationCostRatio: number;
  impactCostRatio: number;
}

function getBaseRisks(
  eventType: string,
  venueType: string,
  attendeeCount: number
): RiskTemplate[] {
  const baseRisks: RiskTemplate[] = [
    // FINANCIAL
    {
      category: "FINANCIAL",
      title: "예산 초과",
      description: "예상치 못한 비용 발생으로 예산 초과 위험",
      baseProbability: "medium",
      baseImpact: "major",
      mitigation: "10-15% 예비비 확보, 주간 예산 모니터링",
      contingency: "비필수 항목 축소, 대체 벤더 계약",
      triggers: ["예산 소진율 70% 초과", "예상치 못한 비용 발생"],
      owner: "재무 담당자",
      mitigationCostRatio: 0.02,
      impactCostRatio: 0.15,
    },
    {
      category: "FINANCIAL",
      title: "스폰서 취소",
      description: "주요 스폰서의 계약 취소 또는 축소",
      baseProbability: "low",
      baseImpact: "major",
      mitigation: "계약서 위약금 조항 명시, 스폰서 다변화",
      contingency: "대체 스폰서 리스트 확보, 예비 예산 활용",
      triggers: ["스폰서 재정 상태 악화 뉴스", "커뮤니케이션 감소"],
      owner: "스폰서십 담당자",
      mitigationCostRatio: 0.01,
      impactCostRatio: 0.20,
    },

    // OPERATIONAL
    {
      category: "OPERATIONAL",
      title: "인력 부족",
      description: "핵심 운영 인력 부족 또는 이탈",
      baseProbability: "medium",
      baseImpact: "moderate",
      mitigation: "교차 훈련 실시, 백업 인력 확보",
      contingency: "임시 인력 풀 구축, 업무 재배분",
      triggers: ["핵심 인력 이탈 징후", "채용 지연"],
      owner: "운영 매니저",
      mitigationCostRatio: 0.03,
      impactCostRatio: 0.10,
    },
    {
      category: "OPERATIONAL",
      title: "물류 지연",
      description: "장비, 자재 등의 배송 지연",
      baseProbability: "medium",
      baseImpact: "moderate",
      mitigation: "여유 있는 배송 일정, 다중 공급업체",
      contingency: "현지 대체 조달, 급행 배송",
      triggers: ["배송 추적 이상", "공급업체 경고"],
      owner: "물류 담당자",
      mitigationCostRatio: 0.02,
      impactCostRatio: 0.08,
    },

    // TECHNICAL
    {
      category: "TECHNICAL",
      title: "AV 장비 고장",
      description: "음향, 영상 등 핵심 장비 장애",
      baseProbability: "medium",
      baseImpact: "major",
      mitigation: "사전 테스트, 백업 장비 확보",
      contingency: "즉시 대체 장비 투입, 기술 지원팀 대기",
      triggers: ["장비 노후화", "이전 이벤트 장애 이력"],
      owner: "기술 감독",
      mitigationCostRatio: 0.04,
      impactCostRatio: 0.12,
    },
    {
      category: "TECHNICAL",
      title: "네트워크/인터넷 장애",
      description: "Wi-Fi, 인터넷 연결 문제",
      baseProbability: "medium",
      baseImpact: "moderate",
      mitigation: "이중화 네트워크, 대역폭 여유 확보",
      contingency: "모바일 핫스팟, 오프라인 모드",
      triggers: ["네트워크 테스트 실패", "ISP 경고"],
      owner: "IT 담당자",
      mitigationCostRatio: 0.03,
      impactCostRatio: 0.08,
    },

    // VENDOR
    {
      category: "VENDOR",
      title: "케이터링 문제",
      description: "음식 품질, 수량, 배송 문제",
      baseProbability: "low",
      baseImpact: "moderate",
      mitigation: "신뢰할 수 있는 업체 선정, 메뉴 사전 테스트",
      contingency: "백업 케이터링 업체, 긴급 조달",
      triggers: ["케이터링 업체 재정 문제", "품질 불만"],
      owner: "행사 코디네이터",
      mitigationCostRatio: 0.02,
      impactCostRatio: 0.06,
    },

    // ATTENDANCE
    {
      category: "ATTENDANCE",
      title: "등록자 저조",
      description: "예상보다 낮은 등록률",
      baseProbability: "medium",
      baseImpact: "major",
      mitigation: "다채널 마케팅, 얼리버드 할인",
      contingency: "추가 프로모션, 타겟 마케팅 강화",
      triggers: ["등록률 목표 대비 50% 미달", "마케팅 반응 저조"],
      owner: "마케팅 담당자",
      mitigationCostRatio: 0.05,
      impactCostRatio: 0.25,
    },

    // SAFETY
    {
      category: "SAFETY",
      title: "안전 사고",
      description: "참가자 부상 또는 의료 응급상황",
      baseProbability: "low",
      baseImpact: "catastrophic",
      mitigation: "안전 점검, 의료 인력 배치, 보험",
      contingency: "응급 대응 프로토콜, 병원 연계",
      triggers: ["안전 점검 미비", "위험 요소 발견"],
      owner: "안전 담당자",
      mitigationCostRatio: 0.03,
      impactCostRatio: 0.30,
    },

    // LEGAL
    {
      category: "LEGAL",
      title: "계약 분쟁",
      description: "벤더 또는 파트너와의 계약 분쟁",
      baseProbability: "low",
      baseImpact: "major",
      mitigation: "명확한 계약서, 법률 검토",
      contingency: "법적 자문, 중재 절차",
      triggers: ["계약 조건 불명확", "분쟁 조짐"],
      owner: "법무 담당자",
      mitigationCostRatio: 0.01,
      impactCostRatio: 0.15,
    },
  ];

  // 야외 이벤트 추가 리스크
  if (venueType === "outdoor" || venueType === "hybrid") {
    baseRisks.push({
      category: "WEATHER",
      title: "악천후",
      description: "비, 폭풍, 극한 기온 등 날씨 문제",
      baseProbability: "medium",
      baseImpact: "major",
      mitigation: "날씨 모니터링, 대체 장소 확보, 텐트/차양",
      contingency: "실내 대체 장소로 이동, 일정 변경",
      triggers: ["기상 예보 악화", "현지 날씨 경고"],
      owner: "현장 감독",
      mitigationCostRatio: 0.05,
      impactCostRatio: 0.20,
    });
  }

  // 대규모 이벤트 추가 리스크
  if (attendeeCount > 1000) {
    baseRisks.push({
      category: "HEALTH",
      title: "전염병/감염병",
      description: "대규모 감염병 발생 또는 확산",
      baseProbability: "low",
      baseImpact: "catastrophic",
      mitigation: "방역 프로토콜, 위생 시설, 건강 체크",
      contingency: "이벤트 축소/연기, 하이브리드 전환",
      triggers: ["지역 감염병 발생", "보건 당국 경고"],
      owner: "보건 담당자",
      mitigationCostRatio: 0.04,
      impactCostRatio: 0.50,
    });

    baseRisks.push({
      category: "OPERATIONAL",
      title: "군중 관리 실패",
      description: "대규모 인파 통제 문제",
      baseProbability: "medium",
      baseImpact: "major",
      mitigation: "동선 계획, 보안 인력 배치",
      contingency: "응급 대피 프로토콜",
      triggers: ["예상 인원 초과", "동선 혼잡"],
      owner: "보안 팀장",
      mitigationCostRatio: 0.04,
      impactCostRatio: 0.18,
    });
  }

  // 하이브리드 이벤트 추가 리스크
  if (eventType === "hybrid") {
    baseRisks.push({
      category: "TECHNICAL",
      title: "라이브 스트리밍 장애",
      description: "온라인 참가자 대상 스트리밍 문제",
      baseProbability: "medium",
      baseImpact: "major",
      mitigation: "이중화 스트리밍, 백업 플랫폼",
      contingency: "녹화 후 제공, 재방송",
      triggers: ["스트리밍 테스트 실패", "대역폭 부족"],
      owner: "스트리밍 담당자",
      mitigationCostRatio: 0.04,
      impactCostRatio: 0.15,
    });
  }

  return baseRisks;
}

export async function execute(input: unknown): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const baseRisks = getBaseRisks(
    validatedInput.event_type,
    validatedInput.venue_type,
    validatedInput.expected_attendees
  );

  // 과거 리스크 데이터 반영
  const pastRiskCategories = validatedInput.past_risks
    ?.filter((r) => r.occurred)
    .map((r) => r.category) || [];

  const riskRegister = baseRisks.map((risk) => {
    const riskId = generateRiskId();

    // 과거에 발생한 리스크는 확률 상향
    let adjustedProbability = risk.baseProbability;
    if (pastRiskCategories.includes(risk.category)) {
      const probOrder: z.infer<typeof ProbabilitySchema>[] = [
        "very_low",
        "low",
        "medium",
        "high",
        "very_high",
      ];
      const currentIndex = probOrder.indexOf(adjustedProbability);
      if (currentIndex < probOrder.length - 1) {
        adjustedProbability = probOrder[currentIndex + 1];
      }
    }

    const riskScore = calculateRiskScore(adjustedProbability, risk.baseImpact);
    const riskRating = getRiskRating(riskScore);

    return {
      risk_id: riskId,
      category: risk.category,
      title: risk.title,
      description: risk.description,
      probability: adjustedProbability,
      impact: risk.baseImpact,
      risk_score: riskScore,
      risk_rating: riskRating,
      mitigation_strategy: risk.mitigation,
      contingency_plan: risk.contingency,
      trigger_indicators: risk.triggers,
      owner_recommendation: risk.owner,
      estimated_mitigation_cost: Math.round(validatedInput.budget * risk.mitigationCostRatio),
      estimated_impact_cost: Math.round(validatedInput.budget * risk.impactCostRatio),
    };
  });

  // 리스크 점수로 정렬
  riskRegister.sort((a, b) => b.risk_score - a.risk_score);

  const summary = {
    total_risks: riskRegister.length,
    critical_risks: riskRegister.filter((r) => r.risk_rating === "critical").length,
    high_risks: riskRegister.filter((r) => r.risk_rating === "high").length,
    medium_risks: riskRegister.filter((r) => r.risk_rating === "medium").length,
    low_risks: riskRegister.filter((r) => r.risk_rating === "low").length,
    total_mitigation_budget: riskRegister.reduce((sum, r) => sum + r.estimated_mitigation_cost, 0),
    total_potential_impact: riskRegister.reduce((sum, r) => sum + r.estimated_impact_cost, 0),
  };

  const topRisks = riskRegister.slice(0, 5).map((r) => r.risk_id);

  const criticalAndHighRisks = riskRegister.filter(
    (r) => r.risk_rating === "critical" || r.risk_rating === "high"
  );

  const immediateActions = criticalAndHighRisks.slice(0, 3).map((risk) => ({
    risk_id: risk.risk_id,
    action: `${risk.title} 완화를 위한 ${risk.mitigation_strategy.split(",")[0]}`,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1주일 후
  }));

  const recommendations = [
    `총 ${summary.critical_risks + summary.high_risks}개의 높은 우선순위 리스크에 대해 즉각적인 조치가 필요합니다.`,
    `리스크 완화를 위해 최소 ${summary.total_mitigation_budget.toLocaleString()} USD의 예비비를 확보하세요.`,
    "리스크 담당자를 지정하고 주간 모니터링 회의를 진행하세요.",
  ];

  if (summary.critical_risks > 0) {
    recommendations.push(
      "크리티컬 리스크가 존재합니다. 경영진 보고 및 특별 관리 체계를 구축하세요."
    );
  }

  if (validatedInput.venue_type === "outdoor") {
    recommendations.push("야외 이벤트입니다. 날씨 모니터링 및 대체 계획을 반드시 수립하세요.");
  }

  return {
    assessment_id: generateUUID(),
    event_id: validatedInput.event_id,
    risk_register: riskRegister,
    risk_summary: summary,
    top_risks: topRisks,
    immediate_actions: immediateActions,
    recommendations,
    assessed_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
