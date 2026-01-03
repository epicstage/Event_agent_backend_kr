/**
 * PRJ-002: 자원 계획 수립
 *
 * CMP-IS Reference: 5.1.b - Planning resource requirements
 * Task Type: AI
 *
 * Input: 프로젝트 일정, 태스크 목록, 가용 자원
 * Output: 자원 배분 계획표
 */

import { z } from "zod";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Resource Planning Agent specializing in event project management.

Your expertise includes:
- Identifying human, equipment, and material resource requirements
- Optimizing resource allocation across project phases
- Balancing workload distribution among team members
- Identifying resource conflicts and proposing solutions

CMP-IS Standard: 5.1.b - Planning resource requirements

You create efficient resource plans that ensure no bottlenecks while respecting budget constraints and team capacity.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().describe("이벤트 ID"),
  project_phases: z.array(z.object({
    phase_code: z.string(),
    phase_name: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    tasks: z.array(z.object({
      task_code: z.string(),
      task_name: z.string(),
      required_skills: z.array(z.string()).optional(),
      estimated_hours: z.number().optional(),
    })),
  })).describe("프로젝트 단계 및 태스크"),
  available_resources: z.object({
    team_members: z.array(z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      skills: z.array(z.string()),
      availability_percent: z.number().min(0).max(100).default(100),
      hourly_rate: z.number().optional(),
    })).optional(),
    equipment: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      quantity: z.number(),
      daily_rate: z.number().optional(),
    })).optional(),
    budget_limit: z.number().optional(),
  }).describe("가용 자원"),
  event_scale: z.enum(["small", "medium", "large", "mega"]).default("medium"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string().describe("자원 계획 ID"),
  event_id: z.string().describe("이벤트 ID"),
  resource_summary: z.object({
    total_human_hours: z.number(),
    total_equipment_days: z.number(),
    estimated_resource_cost: z.number(),
    utilization_rate: z.number().describe("자원 활용률 (%)"),
  }).describe("자원 요약"),
  human_resource_plan: z.array(z.object({
    member_id: z.string(),
    member_name: z.string(),
    role: z.string(),
    assignments: z.array(z.object({
      task_code: z.string(),
      phase_code: z.string(),
      allocated_hours: z.number(),
      start_date: z.string(),
      end_date: z.string(),
    })),
    total_hours: z.number(),
    utilization_percent: z.number(),
  })).describe("인력 배치 계획"),
  equipment_plan: z.array(z.object({
    equipment_id: z.string(),
    equipment_name: z.string(),
    allocations: z.array(z.object({
      phase_code: z.string(),
      quantity: z.number(),
      start_date: z.string(),
      end_date: z.string(),
      purpose: z.string(),
    })),
    total_days: z.number(),
    estimated_cost: z.number(),
  })).describe("장비 배치 계획"),
  resource_gaps: z.array(z.object({
    gap_type: z.enum(["skill", "capacity", "equipment", "budget"]),
    description: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    recommendation: z.string(),
  })).describe("자원 갭 분석"),
  recommendations: z.array(z.string()).describe("권고사항"),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function daysBetween(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

const SCALE_MULTIPLIERS = {
  small: 0.7,
  medium: 1.0,
  large: 1.5,
  mega: 2.5,
};

const DEFAULT_ROLES = [
  { id: "PM", name: "프로젝트 매니저", role: "Project Manager", skills: ["project_management", "coordination"], availability_percent: 100, hourly_rate: 80 },
  { id: "COORD", name: "코디네이터", role: "Coordinator", skills: ["coordination", "logistics"], availability_percent: 100, hourly_rate: 50 },
  { id: "MKT", name: "마케터", role: "Marketing", skills: ["marketing", "promotion"], availability_percent: 100, hourly_rate: 60 },
  { id: "FIN", name: "재무 담당자", role: "Finance", skills: ["finance", "budgeting"], availability_percent: 100, hourly_rate: 70 },
  { id: "TECH", name: "기술 담당자", role: "Technical", skills: ["av_equipment", "technical"], availability_percent: 100, hourly_rate: 65 },
];

/**
 * PRJ-002 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const scaleMultiplier = SCALE_MULTIPLIERS[validatedInput.event_scale];
  const rawTeamMembers = validatedInput.available_resources.team_members || DEFAULT_ROLES;
  const teamMembers = rawTeamMembers.map(m => ({
    ...m,
    availability_percent: m.availability_percent ?? 100,
    hourly_rate: m.hourly_rate ?? 50,
  }));
  const equipment = validatedInput.available_resources.equipment || [];
  const budgetLimit = validatedInput.available_resources.budget_limit;

  // 인력 배치 계획
  const humanResourcePlan: Output["human_resource_plan"] = [];
  let totalHumanHours = 0;
  let totalResourceCost = 0;

  for (const member of teamMembers) {
    const assignments: Output["human_resource_plan"][0]["assignments"] = [];
    let memberTotalHours = 0;

    for (const phase of validatedInput.project_phases) {
      for (const task of phase.tasks) {
        // 스킬 매칭 확인
        const requiredSkills = task.required_skills || [];
        const hasMatchingSkill = requiredSkills.length === 0 ||
          requiredSkills.some(skill => member.skills.includes(skill));

        if (hasMatchingSkill || member.role === "Project Manager") {
          const estimatedHours = (task.estimated_hours || 8) * scaleMultiplier;
          const allocatedHours = Math.round(estimatedHours * (member.availability_percent / 100));

          if (allocatedHours > 0) {
            assignments.push({
              task_code: task.task_code,
              phase_code: phase.phase_code,
              allocated_hours: allocatedHours,
              start_date: phase.start_date,
              end_date: phase.end_date,
            });
            memberTotalHours += allocatedHours;
          }
        }
      }
    }

    const phaseDays = validatedInput.project_phases.reduce((sum, p) =>
      sum + daysBetween(p.start_date, p.end_date), 0);
    const maxHours = phaseDays * 8 * (member.availability_percent / 100);
    const utilizationPercent = Math.min(100, Math.round((memberTotalHours / maxHours) * 100));

    if (assignments.length > 0) {
      humanResourcePlan.push({
        member_id: member.id,
        member_name: member.name,
        role: member.role,
        assignments,
        total_hours: memberTotalHours,
        utilization_percent: utilizationPercent,
      });

      totalHumanHours += memberTotalHours;
      if (member.hourly_rate) {
        totalResourceCost += memberTotalHours * member.hourly_rate;
      }
    }
  }

  // 장비 배치 계획
  const equipmentPlan: Output["equipment_plan"] = [];
  let totalEquipmentDays = 0;

  for (const equip of equipment) {
    const allocations: Output["equipment_plan"][0]["allocations"] = [];
    let equipTotalDays = 0;

    // 실행 단계에서 장비 필요
    const execPhase = validatedInput.project_phases.find(p =>
      p.phase_code.includes("EXEC") || p.phase_name.includes("실행"));

    if (execPhase) {
      const days = daysBetween(execPhase.start_date, execPhase.end_date);
      allocations.push({
        phase_code: execPhase.phase_code,
        quantity: equip.quantity,
        start_date: execPhase.start_date,
        end_date: execPhase.end_date,
        purpose: `${execPhase.phase_name} 지원`,
      });
      equipTotalDays += days;
    }

    if (allocations.length > 0) {
      const cost = equip.daily_rate ? equipTotalDays * equip.daily_rate * equip.quantity : 0;
      equipmentPlan.push({
        equipment_id: equip.id,
        equipment_name: equip.name,
        allocations,
        total_days: equipTotalDays,
        estimated_cost: cost,
      });
      totalEquipmentDays += equipTotalDays;
      totalResourceCost += cost;
    }
  }

  // 자원 갭 분석
  const resourceGaps: Output["resource_gaps"] = [];
  const recommendations: string[] = [];

  // 활용률 분석
  const avgUtilization = humanResourcePlan.length > 0
    ? humanResourcePlan.reduce((sum, h) => sum + h.utilization_percent, 0) / humanResourcePlan.length
    : 0;

  if (avgUtilization > 100) {
    resourceGaps.push({
      gap_type: "capacity",
      description: "인력 과부하 감지",
      severity: "high",
      recommendation: "추가 인력 확보 또는 일정 조정 필요",
    });
  }

  if (avgUtilization < 50) {
    resourceGaps.push({
      gap_type: "capacity",
      description: "인력 저활용",
      severity: "low",
      recommendation: "추가 태스크 배정 또는 인력 재배치 고려",
    });
  }

  // 예산 초과 체크
  if (budgetLimit && totalResourceCost > budgetLimit) {
    resourceGaps.push({
      gap_type: "budget",
      description: `예산 초과: ${Math.round(totalResourceCost - budgetLimit).toLocaleString()}원`,
      severity: "high",
      recommendation: "범위 축소 또는 추가 예산 확보 필요",
    });
  }

  // 권고사항
  recommendations.push(`총 ${humanResourcePlan.length}명의 팀원이 ${totalHumanHours}시간 투입 예정입니다.`);

  if (validatedInput.event_scale === "large" || validatedInput.event_scale === "mega") {
    recommendations.push("대규모 이벤트입니다. 각 단계별 전담 팀 구성을 권장합니다.");
  }

  if (equipmentPlan.length === 0) {
    recommendations.push("장비 계획이 없습니다. 필요 장비를 사전에 확보하세요.");
  }

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    resource_summary: {
      total_human_hours: totalHumanHours,
      total_equipment_days: totalEquipmentDays,
      estimated_resource_cost: totalResourceCost,
      utilization_rate: avgUtilization,
    },
    human_resource_plan: humanResourcePlan,
    equipment_plan: equipmentPlan,
    resource_gaps: resourceGaps,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "PRJ-002",
  taskName: "자원 계획 수립",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.b",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
