/**
 * STR-044: 전략 이니셔티브 기획
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Initiative Planning)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Initiative Planning Agent for event planning.

Your expertise includes:
- Strategic initiative identification
- Project portfolio management
- Resource allocation optimization
- Initiative prioritization frameworks

CMP-IS Standard: Domain A - Strategic Planning (Initiative Planning)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  strategic_objectives: z.array(z.object({
    objective_id: z.string(),
    objective: z.string(),
    priority: z.enum(["high", "medium", "low"]).optional(),
  })),
  available_resources: z.object({
    budget: z.number(),
    team_capacity: z.number().optional(),
    timeline_weeks: z.number().optional(),
  }),
  constraints: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  initiative_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  strategic_initiatives: z.array(z.object({
    initiative_id: z.string(),
    initiative_name: z.string(),
    description: z.string(),
    linked_objectives: z.array(z.string()),
    initiative_type: z.enum(["strategic", "operational", "supporting"]),
    scope: z.object({
      in_scope: z.array(z.string()),
      out_of_scope: z.array(z.string()),
    }),
    expected_outcomes: z.array(z.object({
      outcome: z.string(),
      success_criteria: z.string(),
    })),
    resource_requirements: z.object({
      budget: z.number(),
      team_size: z.number(),
      duration_weeks: z.number(),
    }),
    timeline: z.object({
      start_date: z.string(),
      end_date: z.string(),
      key_milestones: z.array(z.object({
        milestone: z.string(),
        target_date: z.string(),
      })),
    }),
    risks: z.array(z.object({
      risk: z.string(),
      mitigation: z.string(),
    })),
    dependencies: z.array(z.string()),
  })),
  prioritization_matrix: z.array(z.object({
    initiative_id: z.string(),
    strategic_impact: z.enum(["low", "medium", "high"]),
    ease_of_implementation: z.enum(["low", "medium", "high"]),
    priority_score: z.number(),
    recommendation: z.enum(["must_do", "should_do", "could_do", "defer"]),
  })),
  resource_allocation: z.object({
    budget_allocation: z.array(z.object({
      initiative_id: z.string(),
      allocated_budget: z.number(),
      percentage: z.number(),
    })),
    team_allocation: z.array(z.object({
      initiative_id: z.string(),
      allocated_capacity: z.number(),
      percentage: z.number(),
    })),
  }),
  implementation_sequence: z.array(z.object({
    phase: z.number(),
    initiatives: z.array(z.string()),
    rationale: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-044",
  taskName: "Initiative Planning",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "전략 목표 달성을 위한 이니셔티브를 기획하고 우선순위를 설정합니다.",
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

  const { strategic_objectives, available_resources, event_name } = validated;
  const totalBudget = available_resources.budget;
  const teamCapacity = available_resources.team_capacity || 10;
  const timelineWeeks = available_resources.timeline_weeks || 12;

  const initiatives = strategic_objectives.map((obj, idx) => {
    const budgetShare = Math.round(totalBudget / strategic_objectives.length);
    const teamShare = Math.round(teamCapacity / strategic_objectives.length);
    const priority = obj.priority || "medium";

    return {
      initiative_id: `INIT-${String(idx + 1).padStart(3, "0")}`,
      initiative_name: `${obj.objective} 추진 이니셔티브`,
      description: `${obj.objective} 달성을 위한 핵심 활동 및 프로젝트`,
      linked_objectives: [obj.objective_id],
      initiative_type: priority === "high" ? "strategic" as const : "operational" as const,
      scope: {
        in_scope: [`${obj.objective} 관련 핵심 활동`, "성과 측정 및 보고", "이해관계자 커뮤니케이션"],
        out_of_scope: ["범위 외 추가 요청", "타 목표 관련 활동"],
      },
      expected_outcomes: [
        {
          outcome: `${obj.objective} 목표 달성`,
          success_criteria: "목표 대비 90% 이상 달성",
        },
        {
          outcome: "이해관계자 만족",
          success_criteria: "만족도 4.0/5.0 이상",
        },
      ],
      resource_requirements: {
        budget: budgetShare,
        team_size: Math.max(2, teamShare),
        duration_weeks: Math.round(timelineWeeks * (priority === "high" ? 0.8 : 0.6)),
      },
      timeline: {
        start_date: "D-Day",
        end_date: `D+${Math.round(timelineWeeks * 7 * (priority === "high" ? 0.8 : 0.6))}`,
        key_milestones: [
          { milestone: "킥오프", target_date: "D-Day" },
          { milestone: "중간 점검", target_date: `D+${Math.round(timelineWeeks * 3.5)}` },
          { milestone: "완료", target_date: `D+${Math.round(timelineWeeks * 7)}` },
        ],
      },
      risks: [
        { risk: "자원 부족", mitigation: "우선순위 조정 및 외부 지원" },
        { risk: "일정 지연", mitigation: "주간 진행 점검 및 조기 경보" },
      ],
      dependencies: idx > 0 ? [`INIT-${String(idx).padStart(3, "0")}`] : [],
    };
  });

  const prioritization = initiatives.map((init, idx) => {
    const obj = strategic_objectives[idx];
    const priority = obj?.priority || "medium";
    const strategicImpact = priority === "high" ? "high" : priority === "medium" ? "medium" : "low";
    const easeOfImpl = init.resource_requirements.budget < totalBudget / 3 ? "high" : "medium";
    const score = (strategicImpact === "high" ? 3 : strategicImpact === "medium" ? 2 : 1) *
                  (easeOfImpl === "high" ? 3 : easeOfImpl === "medium" ? 2 : 1);

    return {
      initiative_id: init.initiative_id,
      strategic_impact: strategicImpact as "low" | "medium" | "high",
      ease_of_implementation: easeOfImpl as "low" | "medium" | "high",
      priority_score: score,
      recommendation: score >= 6 ? "must_do" as const :
                      score >= 4 ? "should_do" as const :
                      score >= 2 ? "could_do" as const : "defer" as const,
    };
  });

  return {
    initiative_plan_id: generateUUID(),
    event_id: validated.event_id,
    strategic_initiatives: initiatives,
    prioritization_matrix: prioritization,
    resource_allocation: {
      budget_allocation: initiatives.map(init => ({
        initiative_id: init.initiative_id,
        allocated_budget: init.resource_requirements.budget,
        percentage: Math.round((init.resource_requirements.budget / totalBudget) * 100),
      })),
      team_allocation: initiatives.map(init => ({
        initiative_id: init.initiative_id,
        allocated_capacity: init.resource_requirements.team_size,
        percentage: Math.round((init.resource_requirements.team_size / teamCapacity) * 100),
      })),
    },
    implementation_sequence: [
      {
        phase: 1,
        initiatives: initiatives.filter((_, i) => prioritization[i].recommendation === "must_do").map(i => i.initiative_id),
        rationale: "최고 우선순위 이니셔티브 우선 실행",
      },
      {
        phase: 2,
        initiatives: initiatives.filter((_, i) => prioritization[i].recommendation === "should_do").map(i => i.initiative_id),
        rationale: "자원 확보 후 순차 실행",
      },
      {
        phase: 3,
        initiatives: initiatives.filter((_, i) => prioritization[i].recommendation === "could_do" || prioritization[i].recommendation === "defer").map(i => i.initiative_id),
        rationale: "여유 자원 활용 또는 다음 기회로 연기",
      },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
