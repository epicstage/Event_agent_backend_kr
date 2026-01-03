/**
 * FIN-021: 등록 시스템 공급자 식별
 *
 * CMP-IS Reference: 7.2.c
 * Task Type: AI
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Registration System Provider Identification.
CMP-IS Standard: 7.2.c - Identifying and comparing registration system vendors.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  requirements: z.object({
    expected_registrations: z.number().int(),
    budget_range: z.object({ min: z.number(), max: z.number() }),
    features_needed: z.array(z.string()),
    integration_requirements: z.array(z.string()).optional(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  comparison_id: z.string().uuid(),
  event_id: z.string().uuid(),
  vendors: z.array(z.object({
    vendor_name: z.string(),
    pricing_model: z.string(),
    estimated_cost: z.number(),
    features_match: z.number().min(0).max(100),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    recommendation_score: z.number().min(0).max(100),
  })),
  top_recommendation: z.string(),
  decision_factors: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const output: Output = {
    comparison_id: generateUUID(),
    event_id: validated.event_id,
    vendors: [
      {
        vendor_name: "Cvent",
        pricing_model: "등록당 과금",
        estimated_cost: validated.requirements.expected_registrations * 5,
        features_match: 95,
        pros: ["풍부한 기능", "글로벌 지원", "API 연동"],
        cons: ["높은 가격", "학습 곡선"],
        recommendation_score: 88,
      },
      {
        vendor_name: "Eventbrite",
        pricing_model: "수수료 기반",
        estimated_cost: validated.requirements.expected_registrations * 2.5,
        features_match: 75,
        pros: ["사용 용이", "빠른 설정", "저렴한 비용"],
        cons: ["제한된 커스터마이징", "엔터프라이즈 기능 부족"],
        recommendation_score: 72,
      },
      {
        vendor_name: "Hopin",
        pricing_model: "월정액",
        estimated_cost: 3000,
        features_match: 85,
        pros: ["가상/하이브리드 특화", "통합 플랫폼"],
        cons: ["오프라인 이벤트 기능 제한"],
        recommendation_score: 78,
      },
    ],
    top_recommendation: "Cvent",
    decision_factors: [
      "예상 등록자 수에 적합한 확장성",
      "요구 기능 충족도",
      "예산 범위 내 비용",
      "기술 지원 가용성",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-021",
  taskName: "등록 시스템 공급자 식별",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.2.c",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.2: Develop and Manage Registration Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
