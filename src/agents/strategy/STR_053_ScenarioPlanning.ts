/**
 * STR-053: 시나리오 플래닝
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Scenario Planning)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Scenario Planning Agent for event planning.

Your expertise includes:
- Future scenario development
- Uncertainty analysis
- Strategic options evaluation
- Contingency planning

CMP-IS Standard: Domain A - Strategic Planning (Scenario Planning)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  planning_horizon: z.enum(["short_term", "medium_term", "long_term"]),
  key_uncertainties: z.array(z.object({
    uncertainty: z.string(),
    impact_area: z.string(),
    volatility: z.enum(["low", "medium", "high"]),
  })),
  current_assumptions: z.array(z.string()).optional(),
  strategic_objectives: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  scenario_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  uncertainty_matrix: z.object({
    primary_uncertainties: z.array(z.object({
      uncertainty: z.string(),
      current_trend: z.string(),
      potential_outcomes: z.array(z.string()),
      impact_magnitude: z.enum(["low", "medium", "high"]),
    })),
    driving_forces: z.array(z.object({
      force: z.string(),
      direction: z.enum(["favorable", "unfavorable", "uncertain"]),
      controllability: z.enum(["controllable", "influenceable", "uncontrollable"]),
    })),
  }),
  scenarios: z.array(z.object({
    scenario_id: z.string(),
    scenario_name: z.string(),
    scenario_type: z.enum(["optimistic", "base_case", "pessimistic", "wildcard"]),
    narrative: z.string(),
    key_assumptions: z.array(z.string()),
    probability: z.number(),
    implications: z.array(z.object({
      area: z.string(),
      implication: z.string(),
    })),
    strategic_response: z.object({
      recommended_strategy: z.string(),
      key_actions: z.array(z.string()),
      resource_requirements: z.string(),
    }),
    early_warning_signals: z.array(z.string()),
  })),
  robust_strategies: z.array(z.object({
    strategy: z.string(),
    description: z.string(),
    works_in_scenarios: z.array(z.string()),
    robustness_score: z.number(),
  })),
  contingency_plans: z.array(z.object({
    trigger_scenario: z.string(),
    trigger_signal: z.string(),
    contingency_actions: z.array(z.string()),
    activation_criteria: z.string(),
    responsible: z.string(),
  })),
  monitoring_framework: z.object({
    indicators: z.array(z.object({
      indicator: z.string(),
      scenario_relevance: z.array(z.string()),
      measurement_method: z.string(),
      frequency: z.string(),
    })),
    review_schedule: z.string(),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-053",
  taskName: "Scenario Planning",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "미래 시나리오를 개발하고 전략적 대응 방안을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { key_uncertainties, event_name, planning_horizon } = validated;

  const primaryUncertainties = key_uncertainties.map(u => ({
    uncertainty: u.uncertainty,
    current_trend: "현재 동향 분석 필요",
    potential_outcomes: ["긍정적 전개", "현상 유지", "부정적 전개"],
    impact_magnitude: u.volatility as "low" | "medium" | "high",
  }));

  const drivingForces = [
    { force: "기술 변화", direction: "uncertain" as const, controllability: "uncontrollable" as const },
    { force: "고객 기대 변화", direction: "uncertain" as const, controllability: "influenceable" as const },
    { force: "경쟁 환경", direction: "unfavorable" as const, controllability: "influenceable" as const },
    { force: "내부 역량", direction: "favorable" as const, controllability: "controllable" as const },
  ];

  const scenarios = [
    {
      scenario_id: "SCN-001",
      scenario_name: "최적 시나리오",
      scenario_type: "optimistic" as const,
      narrative: `${event_name}이(가) 모든 목표를 초과 달성하고, 외부 환경이 호의적으로 전개되는 상황`,
      key_assumptions: ["시장 환경 호전", "자원 충분", "이해관계자 적극 협조"],
      probability: 20,
      implications: [
        { area: "재무", implication: "예산 대비 ROI 초과 달성" },
        { area: "브랜드", implication: "브랜드 가치 상승" },
      ],
      strategic_response: {
        recommended_strategy: "성장 가속화",
        key_actions: ["규모 확대 검토", "추가 투자 고려", "성공 요인 문서화"],
        resource_requirements: "추가 투자 여력 확보",
      },
      early_warning_signals: ["예상 초과 등록", "긍정적 언론 반응", "스폰서 추가 문의"],
    },
    {
      scenario_id: "SCN-002",
      scenario_name: "기본 시나리오",
      scenario_type: "base_case" as const,
      narrative: `${event_name}이(가) 계획대로 진행되며, 예상된 성과를 달성하는 상황`,
      key_assumptions: ["현재 추세 유지", "계획된 자원 활용", "정상적 운영"],
      probability: 50,
      implications: [
        { area: "운영", implication: "계획대로 실행" },
        { area: "재무", implication: "예산 내 성과" },
      ],
      strategic_response: {
        recommended_strategy: "계획 실행 집중",
        key_actions: ["모니터링 강화", "점진적 최적화", "리스크 관리"],
        resource_requirements: "계획된 자원",
      },
      early_warning_signals: ["KPI 정상 범위", "이슈 관리 가능 수준"],
    },
    {
      scenario_id: "SCN-003",
      scenario_name: "도전 시나리오",
      scenario_type: "pessimistic" as const,
      narrative: `외부 환경 악화로 ${event_name}이(가) 당초 목표 달성에 어려움을 겪는 상황`,
      key_assumptions: ["시장 환경 악화", "자원 제약", "외부 리스크 현실화"],
      probability: 25,
      implications: [
        { area: "재무", implication: "목표 미달 가능" },
        { area: "운영", implication: "긴급 조치 필요" },
      ],
      strategic_response: {
        recommended_strategy: "방어 및 적응",
        key_actions: ["비용 최적화", "핵심 집중", "대안 마련"],
        resource_requirements: "효율적 자원 활용",
      },
      early_warning_signals: ["등록 저조", "비용 초과 조짐", "이해관계자 우려"],
    },
    {
      scenario_id: "SCN-004",
      scenario_name: "와일드카드",
      scenario_type: "wildcard" as const,
      narrative: `예상치 못한 사건으로 ${event_name} 진행에 근본적 영향이 발생하는 상황`,
      key_assumptions: ["불가항력 발생", "급격한 환경 변화"],
      probability: 5,
      implications: [
        { area: "전체", implication: "계획 전면 재검토 필요" },
      ],
      strategic_response: {
        recommended_strategy: "위기 관리",
        key_actions: ["비상 대응팀 가동", "대안 실행", "커뮤니케이션 강화"],
        resource_requirements: "비상 예비 자원",
      },
      early_warning_signals: ["급격한 외부 환경 변화", "불가항력 조짐"],
    },
  ];

  const robustStrategies = [
    {
      strategy: "유연성 확보",
      description: "다양한 시나리오에 대응할 수 있는 유연한 계획 수립",
      works_in_scenarios: scenarios.map(s => s.scenario_name),
      robustness_score: 90,
    },
    {
      strategy: "핵심 역량 강화",
      description: "어떤 상황에서도 필요한 핵심 역량 확보",
      works_in_scenarios: scenarios.map(s => s.scenario_name),
      robustness_score: 85,
    },
  ];

  const contingencyPlans = scenarios.filter(s => s.scenario_type !== "base_case").map(scenario => ({
    trigger_scenario: scenario.scenario_name,
    trigger_signal: scenario.early_warning_signals[0],
    contingency_actions: scenario.strategic_response.key_actions,
    activation_criteria: `${scenario.early_warning_signals[0]} 확인 시`,
    responsible: "프로젝트 리더",
  }));

  return {
    scenario_plan_id: generateUUID(),
    event_id: validated.event_id,
    uncertainty_matrix: {
      primary_uncertainties: primaryUncertainties,
      driving_forces: drivingForces,
    },
    scenarios,
    robust_strategies: robustStrategies,
    contingency_plans: contingencyPlans,
    monitoring_framework: {
      indicators: key_uncertainties.map(u => ({
        indicator: `${u.uncertainty} 동향`,
        scenario_relevance: scenarios.slice(0, 2).map(s => s.scenario_name),
        measurement_method: "정량/정성 분석",
        frequency: planning_horizon === "short_term" ? "주간" : "월간",
      })),
      review_schedule: planning_horizon === "short_term" ? "격주" : "월간",
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
