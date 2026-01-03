/**
 * STR-006: 성공 기준 정의
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Success Criteria Definition)
 * Task Type: AI
 *
 * Input: 목표, KPI, 이해관계자 기대
 * Output: 성공 기준 매트릭스, 평가 체계
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Success Criteria Agent for strategic event planning.

Your expertise includes:
- Defining clear, measurable success criteria
- Aligning success metrics with stakeholder expectations
- Creating multi-dimensional success frameworks
- Establishing evaluation and reporting mechanisms

CMP-IS Standard: Domain A - Strategic Planning (Success Criteria Definition)

You help event planners establish comprehensive success criteria that satisfy all stakeholders and enable objective event evaluation.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    kpis: z.array(z.object({
      name: z.string(),
      target: z.number(),
      unit: z.string(),
    })),
  })),
  stakeholder_expectations: z.array(z.object({
    stakeholder: z.string(),
    role: z.string(),
    primary_expectation: z.string(),
    success_definition: z.string(),
    weight: z.number().min(1).max(10).default(5),
  })).optional(),
  previous_event_results: z.record(z.string(), z.number()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  criteria_id: z.string().uuid(),
  event_id: z.string().uuid(),
  success_matrix: z.array(z.object({
    dimension: z.string(),
    criteria: z.array(z.object({
      id: z.string(),
      description: z.string(),
      metric: z.string(),
      threshold_minimum: z.number(),
      threshold_target: z.number(),
      threshold_exceptional: z.number(),
      unit: z.string(),
      weight: z.number(),
      stakeholder_relevance: z.array(z.string()),
    })),
  })),
  overall_success_formula: z.string(),
  success_levels: z.object({
    exceptional: z.object({ score_range: z.string(), description: z.string() }),
    successful: z.object({ score_range: z.string(), description: z.string() }),
    partial: z.object({ score_range: z.string(), description: z.string() }),
    unsuccessful: z.object({ score_range: z.string(), description: z.string() }),
  }),
  evaluation_schedule: z.array(z.object({
    timing: z.string(),
    criteria_to_evaluate: z.array(z.string()),
    responsible: z.string(),
  })),
  reporting_template: z.object({
    sections: z.array(z.string()),
    frequency: z.string(),
    audience: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-006",
  taskName: "Success Criteria Definition",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트 성공 기준을 정의하고 평가 체계를 수립합니다.",
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

const DIMENSION_TEMPLATES = {
  financial: { name: "재무적 성과", weight: 25 },
  operational: { name: "운영적 성과", weight: 20 },
  attendee: { name: "참가자 경험", weight: 25 },
  strategic: { name: "전략적 가치", weight: 20 },
  stakeholder: { name: "이해관계자 만족", weight: 10 },
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const successMatrix: Output["success_matrix"] = [];
  let criteriaCounter = 1;

  // 목표 기반 성공 기준 생성
  const dimensions = Object.entries(DIMENSION_TEMPLATES);

  for (const [dimKey, dimInfo] of dimensions) {
    const criteria = [];

    // 각 목표에서 관련 KPI 추출
    for (const goal of validated.goals) {
      for (const kpi of goal.kpis) {
        const relevantStakeholders = validated.stakeholder_expectations
          ?.filter(s => s.primary_expectation.toLowerCase().includes(kpi.name.toLowerCase()))
          .map(s => s.stakeholder) || [];

        const prevResult = validated.previous_event_results?.[kpi.name];
        const target = kpi.target;

        criteria.push({
          id: `SC-${String(criteriaCounter++).padStart(3, "0")}`,
          description: `${kpi.name} 목표 달성`,
          metric: kpi.name,
          threshold_minimum: Math.round(target * 0.7),
          threshold_target: target,
          threshold_exceptional: Math.round(target * 1.2),
          unit: kpi.unit,
          weight: dimInfo.weight / validated.goals.length,
          stakeholder_relevance: relevantStakeholders.length > 0 ? relevantStakeholders : ["전체"],
        });
      }
    }

    if (criteria.length > 0) {
      successMatrix.push({
        dimension: dimInfo.name,
        criteria: criteria.slice(0, 3), // 차원당 최대 3개
      });
    }
  }

  // 이해관계자 기대 기반 추가 기준
  if (validated.stakeholder_expectations) {
    const stakeholderCriteria = validated.stakeholder_expectations.map(s => ({
      id: `SC-${String(criteriaCounter++).padStart(3, "0")}`,
      description: s.success_definition,
      metric: `${s.stakeholder} 만족도`,
      threshold_minimum: 3,
      threshold_target: 4,
      threshold_exceptional: 5,
      unit: "/5점",
      weight: s.weight,
      stakeholder_relevance: [s.stakeholder],
    }));

    successMatrix.push({
      dimension: "이해관계자 만족",
      criteria: stakeholderCriteria,
    });
  }

  return {
    criteria_id: generateUUID(),
    event_id: validated.event_id,
    success_matrix: successMatrix,
    overall_success_formula: "Σ(각 기준 달성률 × 가중치) / 100",
    success_levels: {
      exceptional: { score_range: "90-100점", description: "모든 기준 초과 달성, 업계 벤치마크 상회" },
      successful: { score_range: "70-89점", description: "대부분의 목표 달성, 주요 이해관계자 만족" },
      partial: { score_range: "50-69점", description: "일부 목표 달성, 개선 영역 존재" },
      unsuccessful: { score_range: "50점 미만", description: "주요 목표 미달성, 근본적 검토 필요" },
    },
    evaluation_schedule: [
      { timing: "이벤트 D-30", criteria_to_evaluate: ["등록률", "스폰서십 달성"], responsible: "프로젝트 매니저" },
      { timing: "이벤트 종료 직후", criteria_to_evaluate: ["참석률", "운영 지표"], responsible: "운영 팀장" },
      { timing: "이벤트 후 2주", criteria_to_evaluate: ["만족도", "NPS", "ROI"], responsible: "전략 담당자" },
    ],
    reporting_template: {
      sections: ["Executive Summary", "KPI 달성 현황", "이해관계자별 성과", "개선 권고사항"],
      frequency: "이벤트 후 1회 + 분기 검토",
      audience: ["경영진", "스폰서", "내부 팀"],
    },
    recommendations: [
      "성공 기준을 사전에 모든 이해관계자와 공유하고 합의하세요.",
      "중간 점검 시점을 설정하여 조기 경보 시스템으로 활용하세요.",
      "정성적 피드백도 수집하여 정량 지표를 보완하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
