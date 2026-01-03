/**
 * PRJ-010: 리스크 관리 계획
 *
 * CMP-IS Reference: 5.1.h - Developing risk management plan
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Management Planning Agent for event projects.

Your expertise includes:
- Identifying potential project risks
- Assessing risk probability and impact
- Developing mitigation strategies
- Creating contingency plans

CMP-IS Standard: 5.1.h - Developing risk management plan`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_type: z.enum(["conference", "exhibition", "seminar", "gala", "hybrid", "virtual", "other"]).default("conference"),
  expected_attendees: z.number().int().min(1),
  budget: z.number().optional(),
  known_risks: z.array(z.object({
    description: z.string(),
    category: z.string().optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  risk_register: z.array(z.object({
    risk_id: z.string(),
    category: z.string(),
    description: z.string(),
    probability: z.enum(["very_low", "low", "medium", "high", "very_high"]),
    impact: z.enum(["very_low", "low", "medium", "high", "very_high"]),
    risk_score: z.number(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    triggers: z.array(z.string()),
    mitigation_strategy: z.string(),
    contingency_plan: z.string(),
    owner: z.string(),
    status: z.enum(["identified", "mitigating", "resolved", "accepted"]),
  })),
  risk_matrix: z.object({
    critical_risks: z.array(z.string()),
    high_risks: z.array(z.string()),
    medium_risks: z.array(z.string()),
    low_risks: z.array(z.string()),
  }),
  monitoring_plan: z.object({
    review_frequency: z.string(),
    early_warning_indicators: z.array(z.object({
      indicator: z.string(),
      threshold: z.string(),
      action: z.string(),
    })),
    reporting_schedule: z.string(),
  }),
  risk_budget: z.object({
    contingency_reserve: z.number(),
    management_reserve: z.number(),
    total_risk_budget: z.number(),
    currency: z.string(),
  }),
  recommendations: z.array(z.string()),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const probabilityScore: Record<string, number> = {
  very_low: 1,
  low: 2,
  medium: 3,
  high: 4,
  very_high: 5,
};

const impactScore: Record<string, number> = {
  very_low: 1,
  low: 2,
  medium: 3,
  high: 4,
  very_high: 5,
};

function calculateRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const budget = validatedInput.budget || 100000000;

  // 기본 리스크 등록부
  const defaultRisks = [
    {
      category: "일정",
      description: "주요 벤더 납품 지연",
      probability: "medium" as const,
      impact: "high" as const,
      triggers: ["납기일 미준수 이력", "커뮤니케이션 지연"],
      mitigation: "대안 벤더 사전 확보, 여유 일정 반영",
      contingency: "긴급 대체 벤더 활용, 범위 축소",
      owner: "Procurement",
    },
    {
      category: "예산",
      description: "예상치 못한 비용 증가",
      probability: "medium" as const,
      impact: "medium" as const,
      triggers: ["환율 변동", "추가 요구사항"],
      mitigation: "예비비 확보 (10%), 고정가 계약",
      contingency: "범위 조정, 추가 예산 승인 요청",
      owner: "Finance",
    },
    {
      category: "인력",
      description: "핵심 인력 이탈",
      probability: "low" as const,
      impact: "high" as const,
      triggers: ["프로젝트 스트레스", "이직 시즌"],
      mitigation: "지식 문서화, 백업 인력 지정",
      contingency: "외부 전문가 긴급 투입",
      owner: "HR",
    },
    {
      category: "기술",
      description: "AV/IT 시스템 장애",
      probability: "medium" as const,
      impact: "very_high" as const,
      triggers: ["장비 노후화", "네트워크 불안정"],
      mitigation: "사전 테스트, 백업 장비 준비",
      contingency: "매뉴얼 대체 운영, 기술 지원 대기",
      owner: "Technical",
    },
    {
      category: "참가자",
      description: "등록률 저조",
      probability: "medium" as const,
      impact: "high" as const,
      triggers: ["마케팅 효과 부진", "경쟁 이벤트"],
      mitigation: "다채널 마케팅, 얼리버드 혜택",
      contingency: "추가 홍보, 타겟 확대",
      owner: "Marketing",
    },
    {
      category: "장소",
      description: "장소 사용 불가",
      probability: "very_low" as const,
      impact: "very_high" as const,
      triggers: ["천재지변", "시설 문제"],
      mitigation: "계약서 조항 명시, 대체 장소 리스트",
      contingency: "대체 장소로 이전, 온라인 전환",
      owner: "Operations",
    },
    {
      category: "외부",
      description: "감염병 확산",
      probability: "low" as const,
      impact: "very_high" as const,
      triggers: ["팬데믹 알림", "지역 감염 증가"],
      mitigation: "하이브리드 옵션 준비, 방역 계획",
      contingency: "전면 온라인 전환, 연기 또는 취소",
      owner: "PM",
    },
    {
      category: "스폰서",
      description: "스폰서 철수",
      probability: "low" as const,
      impact: "high" as const,
      triggers: ["스폰서 재무 문제", "전략 변경"],
      mitigation: "다양한 스폰서 포트폴리오, 계약 조건 명시",
      contingency: "대체 스폰서 확보, 예산 재배분",
      owner: "Sponsorship",
    },
  ];

  // 사용자 지정 리스크 추가
  const userRisks = (validatedInput.known_risks || []).map((risk, idx) => ({
    category: risk.category || "기타",
    description: risk.description,
    probability: "medium" as const,
    impact: "medium" as const,
    triggers: ["사용자 식별"],
    mitigation: "상세 분석 후 대응 전략 수립",
    contingency: "대응 계획 수립 필요",
    owner: "PM",
  }));

  const allRisks = [...defaultRisks, ...userRisks];

  // 리스크 등록부 생성
  const riskRegister: Output["risk_register"] = allRisks.map((risk, idx) => {
    const pScore = probabilityScore[risk.probability];
    const iScore = impactScore[risk.impact];
    const score = pScore * iScore;
    const level = calculateRiskLevel(score);

    return {
      risk_id: `RISK-${String(idx + 1).padStart(3, "0")}`,
      category: risk.category,
      description: risk.description,
      probability: risk.probability,
      impact: risk.impact,
      risk_score: score,
      risk_level: level,
      triggers: risk.triggers,
      mitigation_strategy: risk.mitigation,
      contingency_plan: risk.contingency,
      owner: risk.owner,
      status: "identified" as const,
    };
  });

  // 리스크 매트릭스
  const riskMatrix: Output["risk_matrix"] = {
    critical_risks: riskRegister.filter(r => r.risk_level === "critical").map(r => r.risk_id),
    high_risks: riskRegister.filter(r => r.risk_level === "high").map(r => r.risk_id),
    medium_risks: riskRegister.filter(r => r.risk_level === "medium").map(r => r.risk_id),
    low_risks: riskRegister.filter(r => r.risk_level === "low").map(r => r.risk_id),
  };

  // 모니터링 계획
  const monitoringPlan: Output["monitoring_plan"] = {
    review_frequency: "주간",
    early_warning_indicators: [
      {
        indicator: "마일스톤 지연",
        threshold: "2일 이상 지연",
        action: "PM 에스컬레이션, 리소스 재배치 검토",
      },
      {
        indicator: "예산 초과",
        threshold: "5% 이상 초과",
        action: "재무팀 보고, 비용 절감 방안 모색",
      },
      {
        indicator: "등록률",
        threshold: "목표 대비 70% 미달 (D-30)",
        action: "마케팅 강화, 추가 채널 활용",
      },
      {
        indicator: "벤더 응답",
        threshold: "48시간 이상 무응답",
        action: "대안 벤더 접촉, 계약 조건 검토",
      },
    ],
    reporting_schedule: "매주 월요일 리스크 리뷰 미팅",
  };

  // 리스크 예산
  const contingencyReserve = budget * 0.10; // 10%
  const managementReserve = budget * 0.05; // 5%

  const riskBudget: Output["risk_budget"] = {
    contingency_reserve: contingencyReserve,
    management_reserve: managementReserve,
    total_risk_budget: contingencyReserve + managementReserve,
    currency: "KRW",
  };

  // 권장사항
  const recommendations: string[] = [
    `총 ${riskRegister.length}개 리스크 식별됨`,
    `Critical/High 리스크 ${riskMatrix.critical_risks.length + riskMatrix.high_risks.length}개 - 우선 관리 필요`,
    `리스크 예비비 ${((contingencyReserve + managementReserve) / budget * 100).toFixed(0)}% 확보 권장`,
    "주간 리스크 리뷰 미팅 필수 진행",
    "D-30, D-14, D-7에 리스크 집중 점검",
  ];

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    risk_register: riskRegister,
    risk_matrix: riskMatrix,
    monitoring_plan: monitoringPlan,
    risk_budget: riskBudget,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-010",
  taskName: "리스크 관리 계획",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.h",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
