/**
 * STR-045: 자원 정렬
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Resource Alignment)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Resource Alignment Agent for event planning.

Your expertise includes:
- Strategic resource allocation
- Capacity planning
- Budget-strategy alignment
- Resource optimization

CMP-IS Standard: Domain A - Strategic Planning (Resource Alignment)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  strategic_priorities: z.array(z.object({
    priority_id: z.string(),
    priority_name: z.string(),
    importance_weight: z.number(),
  })),
  available_resources: z.object({
    total_budget: z.number(),
    human_resources: z.array(z.object({
      role: z.string(),
      count: z.number(),
      cost_per_unit: z.number().optional(),
    })),
    time_available_days: z.number(),
    physical_resources: z.array(z.string()).optional(),
  }),
  current_allocation: z.array(z.object({
    priority_id: z.string(),
    allocated_budget: z.number(),
    allocated_staff: z.number(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  alignment_id: z.string().uuid(),
  event_id: z.string().uuid(),
  alignment_assessment: z.object({
    overall_alignment_score: z.number(),
    alignment_status: z.enum(["well_aligned", "moderately_aligned", "misaligned"]),
    key_findings: z.array(z.string()),
  }),
  recommended_allocation: z.object({
    budget_allocation: z.array(z.object({
      priority_id: z.string(),
      priority_name: z.string(),
      recommended_budget: z.number(),
      recommended_percentage: z.number(),
      rationale: z.string(),
    })),
    human_resource_allocation: z.array(z.object({
      priority_id: z.string(),
      priority_name: z.string(),
      recommended_fte: z.number(),
      roles_needed: z.array(z.object({
        role: z.string(),
        count: z.number(),
      })),
    })),
    time_allocation: z.array(z.object({
      priority_id: z.string(),
      priority_name: z.string(),
      recommended_days: z.number(),
      percentage: z.number(),
    })),
  }),
  gap_analysis: z.array(z.object({
    priority_id: z.string(),
    resource_type: z.enum(["budget", "staff", "time", "equipment"]),
    gap_description: z.string(),
    gap_size: z.string(),
    impact: z.string(),
    resolution_options: z.array(z.string()),
  })),
  optimization_opportunities: z.array(z.object({
    opportunity: z.string(),
    description: z.string(),
    potential_savings: z.string(),
    implementation_difficulty: z.enum(["easy", "moderate", "difficult"]),
  })),
  reallocation_plan: z.object({
    immediate_actions: z.array(z.object({
      action: z.string(),
      from: z.string(),
      to: z.string(),
      amount: z.string(),
    })),
    phased_adjustments: z.array(z.object({
      phase: z.string(),
      adjustments: z.array(z.string()),
      timeline: z.string(),
    })),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-045",
  taskName: "Resource Alignment",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "전략적 우선순위에 맞게 자원을 정렬하고 최적화합니다.",
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

  const { strategic_priorities, available_resources, current_allocation } = validated;
  const totalBudget = available_resources.total_budget;
  const totalStaff = available_resources.human_resources.reduce((sum, r) => sum + r.count, 0);
  const totalDays = available_resources.time_available_days;

  // Calculate weights
  const totalWeight = strategic_priorities.reduce((sum, p) => sum + p.importance_weight, 0);

  // Recommended allocation based on weights
  const budgetAllocation = strategic_priorities.map(p => {
    const percentage = (p.importance_weight / totalWeight) * 100;
    return {
      priority_id: p.priority_id,
      priority_name: p.priority_name,
      recommended_budget: Math.round(totalBudget * (percentage / 100)),
      recommended_percentage: Math.round(percentage),
      rationale: `중요도 가중치 ${p.importance_weight} 기반 배분`,
    };
  });

  const hrAllocation = strategic_priorities.map(p => {
    const percentage = (p.importance_weight / totalWeight) * 100;
    const fte = Math.round(totalStaff * (percentage / 100));
    return {
      priority_id: p.priority_id,
      priority_name: p.priority_name,
      recommended_fte: Math.max(1, fte),
      roles_needed: available_resources.human_resources.slice(0, 2).map(r => ({
        role: r.role,
        count: Math.max(1, Math.round(r.count * (percentage / 100))),
      })),
    };
  });

  const timeAllocation = strategic_priorities.map(p => {
    const percentage = (p.importance_weight / totalWeight) * 100;
    return {
      priority_id: p.priority_id,
      priority_name: p.priority_name,
      recommended_days: Math.round(totalDays * (percentage / 100)),
      percentage: Math.round(percentage),
    };
  });

  // Gap analysis
  const gaps = current_allocation ? current_allocation.map(ca => {
    const recommended = budgetAllocation.find(b => b.priority_id === ca.priority_id);
    if (recommended && ca.allocated_budget < recommended.recommended_budget * 0.8) {
      return {
        priority_id: ca.priority_id,
        resource_type: "budget" as const,
        gap_description: "현재 배분이 권장 수준 미달",
        gap_size: `${recommended.recommended_budget - ca.allocated_budget}원 부족`,
        impact: "목표 달성 지연 가능",
        resolution_options: ["예산 재배분", "비용 효율화", "우선순위 조정"],
      };
    }
    return null;
  }).filter(Boolean) as Output["gap_analysis"] : [];

  // Calculate alignment score
  let alignmentScore = 80;
  if (gaps.length > 0) alignmentScore -= gaps.length * 10;
  const alignmentStatus = alignmentScore >= 80 ? "well_aligned" as const :
                          alignmentScore >= 60 ? "moderately_aligned" as const : "misaligned" as const;

  return {
    alignment_id: generateUUID(),
    event_id: validated.event_id,
    alignment_assessment: {
      overall_alignment_score: alignmentScore,
      alignment_status: alignmentStatus,
      key_findings: [
        alignmentStatus === "well_aligned" ? "자원 배분이 전략적 우선순위와 잘 정렬됨" : "자원 재배분 필요",
        `총 ${strategic_priorities.length}개 우선순위에 대한 자원 배분 완료`,
      ],
    },
    recommended_allocation: {
      budget_allocation: budgetAllocation,
      human_resource_allocation: hrAllocation,
      time_allocation: timeAllocation,
    },
    gap_analysis: gaps,
    optimization_opportunities: [
      {
        opportunity: "공유 자원 활용",
        description: "여러 우선순위 간 공통 자원 공유로 효율성 제고",
        potential_savings: "10-15%",
        implementation_difficulty: "moderate",
      },
      {
        opportunity: "외부 협력",
        description: "비핵심 활동 외부 위탁으로 내부 자원 집중",
        potential_savings: "5-10%",
        implementation_difficulty: "easy",
      },
    ],
    reallocation_plan: {
      immediate_actions: gaps.length > 0 ? [{
        action: "긴급 예산 재배분",
        from: "여유 항목",
        to: gaps[0]?.priority_id || "미정",
        amount: gaps[0]?.gap_size || "확인 필요",
      }] : [],
      phased_adjustments: [
        {
          phase: "1단계",
          adjustments: ["현황 파악", "재배분 계획 수립"],
          timeline: "1주차",
        },
        {
          phase: "2단계",
          adjustments: ["점진적 재배분 실행", "모니터링"],
          timeline: "2-4주차",
        },
      ],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
