/**
 * STR-041: 전략 목표 수립
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Strategic Objectives)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Strategic Objectives Agent for event planning.

Your expertise includes:
- Strategic objective formulation
- Objective hierarchy design
- Balanced scorecard development
- Strategy-objective alignment

CMP-IS Standard: Domain A - Strategic Planning (Strategic Objectives)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  vision: z.string(),
  mission: z.string().optional(),
  strategic_priorities: z.array(z.string()),
  time_horizon: z.enum(["short_term", "medium_term", "long_term"]),
  organizational_context: z.object({
    industry: z.string().optional(),
    competitive_position: z.enum(["leader", "challenger", "follower", "niche"]).optional(),
    growth_stage: z.enum(["startup", "growth", "mature", "renewal"]).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  objectives_id: z.string().uuid(),
  event_id: z.string().uuid(),
  strategic_objectives: z.array(z.object({
    objective_id: z.string(),
    perspective: z.enum(["financial", "customer", "process", "learning_growth"]),
    objective: z.string(),
    description: z.string(),
    strategic_priority_link: z.string(),
    success_indicators: z.array(z.object({
      indicator: z.string(),
      target: z.string(),
      measurement_method: z.string(),
    })),
    time_frame: z.string(),
    owner: z.string(),
  })),
  objective_hierarchy: z.object({
    ultimate_goal: z.string(),
    strategic_themes: z.array(z.object({
      theme: z.string(),
      supporting_objectives: z.array(z.string()),
    })),
    causal_relationships: z.array(z.object({
      from_objective: z.string(),
      to_objective: z.string(),
      relationship: z.string(),
    })),
  }),
  balanced_scorecard: z.object({
    financial_perspective: z.array(z.object({
      objective: z.string(),
      measure: z.string(),
      target: z.string(),
      initiative: z.string(),
    })),
    customer_perspective: z.array(z.object({
      objective: z.string(),
      measure: z.string(),
      target: z.string(),
      initiative: z.string(),
    })),
    process_perspective: z.array(z.object({
      objective: z.string(),
      measure: z.string(),
      target: z.string(),
      initiative: z.string(),
    })),
    learning_growth_perspective: z.array(z.object({
      objective: z.string(),
      measure: z.string(),
      target: z.string(),
      initiative: z.string(),
    })),
  }),
  implementation_roadmap: z.array(z.object({
    phase: z.string(),
    objectives: z.array(z.string()),
    key_milestones: z.array(z.string()),
    timeline: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-041",
  taskName: "Strategic Objectives",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "이벤트의 전략적 목표를 수립하고 균형 성과표를 개발합니다.",
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

  const { strategic_priorities, vision, time_horizon } = validated;

  const perspectives: Array<"financial" | "customer" | "process" | "learning_growth"> = [
    "financial", "customer", "process", "learning_growth"
  ];

  let objectiveCounter = 1;
  const objectives = strategic_priorities.flatMap((priority, idx) => {
    return perspectives.slice(0, 2).map(perspective => ({
      objective_id: `OBJ-${String(objectiveCounter++).padStart(3, "0")}`,
      perspective,
      objective: perspective === "financial"
        ? `${priority} 통한 수익성 향상`
        : `${priority} 기반 고객 만족도 제고`,
      description: `${priority}와 관련된 ${perspective === "financial" ? "재무적" : "고객"} 성과 목표`,
      strategic_priority_link: priority,
      success_indicators: [
        {
          indicator: perspective === "financial" ? "ROI" : "고객 만족도",
          target: perspective === "financial" ? "15% 이상" : "4.5/5.0 이상",
          measurement_method: perspective === "financial" ? "재무제표 분석" : "설문조사",
        },
      ],
      time_frame: time_horizon === "short_term" ? "3개월" : time_horizon === "medium_term" ? "6개월" : "12개월",
      owner: perspective === "financial" ? "재무팀" : "마케팅팀",
    }));
  });

  return {
    objectives_id: generateUUID(),
    event_id: validated.event_id,
    strategic_objectives: objectives,
    objective_hierarchy: {
      ultimate_goal: vision,
      strategic_themes: strategic_priorities.map(priority => ({
        theme: priority,
        supporting_objectives: objectives
          .filter(o => o.strategic_priority_link === priority)
          .map(o => o.objective_id),
      })),
      causal_relationships: objectives.length > 1 ? [
        {
          from_objective: objectives[objectives.length - 1]?.objective_id || "OBJ-001",
          to_objective: objectives[0]?.objective_id || "OBJ-002",
          relationship: "역량 강화가 프로세스 효율성을 높임",
        },
      ] : [],
    },
    balanced_scorecard: {
      financial_perspective: [
        { objective: "수익성 향상", measure: "ROI", target: "15%", initiative: "비용 최적화" },
        { objective: "매출 성장", measure: "매출액", target: "전년 대비 20% 증가", initiative: "신규 고객 확보" },
      ],
      customer_perspective: [
        { objective: "고객 만족", measure: "NPS", target: "50 이상", initiative: "서비스 품질 향상" },
        { objective: "고객 유지", measure: "재참여율", target: "70%", initiative: "충성도 프로그램" },
      ],
      process_perspective: [
        { objective: "운영 효율화", measure: "처리 시간", target: "20% 단축", initiative: "프로세스 자동화" },
        { objective: "품질 향상", measure: "오류율", target: "1% 이하", initiative: "품질 관리 강화" },
      ],
      learning_growth_perspective: [
        { objective: "역량 강화", measure: "교육 이수율", target: "100%", initiative: "필수 교육 실시" },
        { objective: "혁신 문화", measure: "개선 제안 건수", target: "월 10건", initiative: "제안 제도 활성화" },
      ],
    },
    implementation_roadmap: [
      {
        phase: "준비 단계",
        objectives: objectives.slice(0, Math.ceil(objectives.length / 3)).map(o => o.objective_id),
        key_milestones: ["목표 확정", "자원 배분", "팀 구성"],
        timeline: "1개월",
      },
      {
        phase: "실행 단계",
        objectives: objectives.slice(Math.ceil(objectives.length / 3), Math.ceil(objectives.length * 2 / 3)).map(o => o.objective_id),
        key_milestones: ["핵심 활동 실행", "중간 점검", "조정"],
        timeline: "2-4개월",
      },
      {
        phase: "성과 창출 단계",
        objectives: objectives.slice(Math.ceil(objectives.length * 2 / 3)).map(o => o.objective_id),
        key_milestones: ["성과 측정", "결과 분석", "개선 계획"],
        timeline: "5-6개월",
      },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
