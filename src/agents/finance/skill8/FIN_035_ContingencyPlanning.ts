/**
 * FIN-035: 예비비 계획
 *
 * CMP-IS Reference: 8.1.e
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Contingency Planning.
CMP-IS Standard: 8.1.e - Planning and allocating contingency funds.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  total_budget: z.number(),
  event_profile: z.object({
    type: z.string(),
    is_first_time: z.boolean().default(false),
    complexity_level: z.enum(["low", "medium", "high"]),
    outdoor_elements: z.boolean().default(false),
    international_elements: z.boolean().default(false),
  }),
  known_risks: z.array(z.object({
    risk: z.string(),
    probability: z.enum(["low", "medium", "high"]),
    impact: z.enum(["low", "medium", "high"]),
  })).optional(),
  historical_overruns: z.array(z.object({
    category: z.string(),
    overrun_percentage: z.number(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  contingency_id: z.string().uuid(),
  event_id: z.string().uuid(),
  recommended_contingency: z.object({
    percentage: z.number(),
    amount: z.number(),
    rationale: z.string(),
  }),
  contingency_allocation: z.array(z.object({
    category: z.string(),
    allocated_amount: z.number(),
    purpose: z.string(),
    release_criteria: z.string(),
  })),
  risk_provisions: z.array(z.object({
    risk: z.string(),
    provision_amount: z.number(),
    trigger_condition: z.string(),
    mitigation_actions: z.array(z.string()),
  })),
  usage_guidelines: z.object({
    approval_process: z.array(z.string()),
    documentation_requirements: z.array(z.string()),
    prohibited_uses: z.array(z.string()),
  }),
  monitoring_plan: z.object({
    review_frequency: z.string(),
    escalation_triggers: z.array(z.string()),
    reporting_format: z.string(),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  // Calculate recommended contingency percentage
  let baseContingency = 5;

  if (validated.event_profile.is_first_time) baseContingency += 3;
  if (validated.event_profile.complexity_level === "high") baseContingency += 3;
  if (validated.event_profile.complexity_level === "medium") baseContingency += 1;
  if (validated.event_profile.outdoor_elements) baseContingency += 2;
  if (validated.event_profile.international_elements) baseContingency += 2;

  const contingencyAmount = validated.total_budget * (baseContingency / 100);

  const output: Output = {
    contingency_id: generateUUID(),
    event_id: validated.event_id,
    recommended_contingency: {
      percentage: baseContingency,
      amount: Math.round(contingencyAmount),
      rationale: `이벤트 특성 기반 산정: 기본 5% + ${validated.event_profile.is_first_time ? "첫 개최 3% + " : ""}${validated.event_profile.complexity_level === "high" ? "고복잡도 3% + " : ""}${validated.event_profile.outdoor_elements ? "야외 요소 2% + " : ""}${validated.event_profile.international_elements ? "국제 요소 2%" : ""}`,
    },
    contingency_allocation: [
      {
        category: "운영 예비비",
        allocated_amount: Math.round(contingencyAmount * 0.4),
        purpose: "예상치 못한 운영 비용",
        release_criteria: "팀장 승인 + 사유 문서화",
      },
      {
        category: "기술 예비비",
        allocated_amount: Math.round(contingencyAmount * 0.25),
        purpose: "AV/기술 장애 대응",
        release_criteria: "기술팀장 요청 + 디렉터 승인",
      },
      {
        category: "날씨/외부 요인",
        allocated_amount: Math.round(contingencyAmount * 0.2),
        purpose: "외부 환경 변화 대응",
        release_criteria: "긴급 상황 선언 시",
      },
      {
        category: "일반 예비비",
        allocated_amount: Math.round(contingencyAmount * 0.15),
        purpose: "기타 미분류 긴급 상황",
        release_criteria: "VP 승인 필요",
      },
    ],
    risk_provisions: (validated.known_risks || []).map(risk => ({
      risk: risk.risk,
      provision_amount: Math.round(contingencyAmount *
        (risk.probability === "high" ? 0.15 : risk.probability === "medium" ? 0.1 : 0.05) *
        (risk.impact === "high" ? 2 : risk.impact === "medium" ? 1.5 : 1)),
      trigger_condition: `${risk.risk} 발생 시`,
      mitigation_actions: [
        "즉시 상황 보고",
        "대안 실행",
        "비용 문서화",
      ],
    })),
    usage_guidelines: {
      approval_process: [
        "$1,000 이하: 팀장 승인",
        "$1,000-$5,000: 디렉터 승인",
        "$5,000 초과: VP 승인",
        "모든 사용: 48시간 내 문서화",
      ],
      documentation_requirements: [
        "사용 사유 명시",
        "대안 검토 결과",
        "예상 금액 vs 실제 금액",
        "향후 예방 방안",
      ],
      prohibited_uses: [
        "계획된 비용 부족분 보전",
        "스코프 확대",
        "비승인 추가 기능",
        "개인 경비",
      ],
    },
    monitoring_plan: {
      review_frequency: "주간 검토",
      escalation_triggers: [
        "예비비 50% 소진 시 경고",
        "예비비 75% 소진 시 긴급 회의",
        "단일 항목 $5,000 초과 시 보고",
      ],
      reporting_format: "예비비 사용 현황 대시보드 + 주간 보고서",
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-035",
  taskName: "예비비 계획",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.1.e",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
