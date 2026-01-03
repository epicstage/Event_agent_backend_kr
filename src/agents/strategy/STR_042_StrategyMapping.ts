/**
 * STR-042: 전략 맵 구축
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Strategy Mapping)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Strategy Mapping Agent for event planning.

Your expertise includes:
- Strategy map visualization
- Cause-effect relationship analysis
- Strategic theme identification
- Value chain alignment

CMP-IS Standard: Domain A - Strategic Planning (Strategy Mapping)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  strategic_objectives: z.array(z.object({
    objective_id: z.string(),
    objective: z.string(),
    perspective: z.enum(["financial", "customer", "process", "learning_growth"]),
  })),
  strategic_themes: z.array(z.string()).optional(),
  value_proposition: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  strategy_map_id: z.string().uuid(),
  event_id: z.string().uuid(),
  strategy_map: z.object({
    title: z.string(),
    description: z.string(),
    perspectives: z.array(z.object({
      name: z.string(),
      objectives: z.array(z.object({
        objective_id: z.string(),
        objective: z.string(),
        position: z.number(),
      })),
    })),
  }),
  cause_effect_chains: z.array(z.object({
    chain_id: z.string(),
    chain_name: z.string(),
    links: z.array(z.object({
      from_objective_id: z.string(),
      to_objective_id: z.string(),
      relationship_type: z.enum(["enables", "drives", "supports", "requires"]),
      description: z.string(),
      strength: z.enum(["weak", "moderate", "strong"]),
    })),
  })),
  strategic_themes: z.array(z.object({
    theme_id: z.string(),
    theme_name: z.string(),
    description: z.string(),
    related_objectives: z.array(z.string()),
    expected_outcomes: z.array(z.string()),
  })),
  value_creation_story: z.object({
    narrative: z.string(),
    key_hypotheses: z.array(z.object({
      hypothesis: z.string(),
      validation_method: z.string(),
    })),
  }),
  alignment_analysis: z.object({
    gaps: z.array(z.object({
      gap: z.string(),
      affected_objectives: z.array(z.string()),
      recommendation: z.string(),
    })),
    strengths: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-042",
  taskName: "Strategy Mapping",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "전략 맵을 구축하고 인과관계를 분석합니다.",
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

  const { strategic_objectives, event_name, strategic_themes } = validated;

  const perspectiveOrder = ["financial", "customer", "process", "learning_growth"];
  const groupedObjectives = perspectiveOrder.map((p, idx) => ({
    name: p === "financial" ? "재무 관점" :
          p === "customer" ? "고객 관점" :
          p === "process" ? "내부 프로세스 관점" : "학습과 성장 관점",
    objectives: strategic_objectives
      .filter(o => o.perspective === p)
      .map((o, i) => ({
        objective_id: o.objective_id,
        objective: o.objective,
        position: i + 1,
      })),
  }));

  // Build cause-effect chains
  const chains: Output["cause_effect_chains"] = [];
  const learningObjs = strategic_objectives.filter(o => o.perspective === "learning_growth");
  const processObjs = strategic_objectives.filter(o => o.perspective === "process");
  const customerObjs = strategic_objectives.filter(o => o.perspective === "customer");
  const financialObjs = strategic_objectives.filter(o => o.perspective === "financial");

  if (learningObjs.length > 0 && processObjs.length > 0) {
    chains.push({
      chain_id: "CHAIN-001",
      chain_name: "역량-프로세스 연결",
      links: [{
        from_objective_id: learningObjs[0].objective_id,
        to_objective_id: processObjs[0].objective_id,
        relationship_type: "enables",
        description: "역량 강화가 프로세스 효율성을 가능하게 함",
        strength: "strong",
      }],
    });
  }

  if (processObjs.length > 0 && customerObjs.length > 0) {
    chains.push({
      chain_id: "CHAIN-002",
      chain_name: "프로세스-고객 연결",
      links: [{
        from_objective_id: processObjs[0].objective_id,
        to_objective_id: customerObjs[0].objective_id,
        relationship_type: "drives",
        description: "프로세스 개선이 고객 가치를 창출함",
        strength: "strong",
      }],
    });
  }

  if (customerObjs.length > 0 && financialObjs.length > 0) {
    chains.push({
      chain_id: "CHAIN-003",
      chain_name: "고객-재무 연결",
      links: [{
        from_objective_id: customerObjs[0].objective_id,
        to_objective_id: financialObjs[0].objective_id,
        relationship_type: "drives",
        description: "고객 만족이 재무 성과를 이끌어냄",
        strength: "strong",
      }],
    });
  }

  const themes = (strategic_themes || ["성장", "효율성"]).map((theme, idx) => ({
    theme_id: `THEME-${String(idx + 1).padStart(3, "0")}`,
    theme_name: theme,
    description: `${theme}에 초점을 맞춘 전략적 방향`,
    related_objectives: strategic_objectives.slice(0, Math.ceil(strategic_objectives.length / 2)).map(o => o.objective_id),
    expected_outcomes: [`${theme} 관련 KPI 달성`, `${theme} 역량 강화`],
  }));

  return {
    strategy_map_id: generateUUID(),
    event_id: validated.event_id,
    strategy_map: {
      title: `${event_name} 전략 맵`,
      description: "균형 성과표 기반의 4대 관점 전략 맵",
      perspectives: groupedObjectives,
    },
    cause_effect_chains: chains,
    strategic_themes: themes,
    value_creation_story: {
      narrative: `${event_name}의 가치 창출은 학습과 성장 관점에서 시작하여, 내부 프로세스 최적화를 거쳐, 고객 가치를 전달하고, 궁극적으로 재무 성과를 달성하는 인과관계 사슬을 따릅니다.`,
      key_hypotheses: [
        {
          hypothesis: "역량 강화가 프로세스 효율성을 높인다",
          validation_method: "교육 이수율과 처리 시간 상관관계 분석",
        },
        {
          hypothesis: "프로세스 개선이 고객 만족을 높인다",
          validation_method: "프로세스 KPI와 NPS 상관관계 분석",
        },
        {
          hypothesis: "고객 만족이 매출 성장을 이끈다",
          validation_method: "NPS와 매출 추이 상관관계 분석",
        },
      ],
    },
    alignment_analysis: {
      gaps: learningObjs.length === 0 ? [{
        gap: "학습과 성장 관점 목표 부재",
        affected_objectives: processObjs.map(o => o.objective_id),
        recommendation: "역량 개발 관련 목표 추가 필요",
      }] : [],
      strengths: [
        "4대 관점 간 균형 잡힌 목표 구성",
        "명확한 인과관계 설정",
      ],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
