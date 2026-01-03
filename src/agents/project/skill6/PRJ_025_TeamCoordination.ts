/**
 * PRJ-025: 팀 조율
 * CMP-IS Reference: 6.2.a - Coordinating project team
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Team Coordination Agent for event projects.
CMP-IS Standard: 6.2.a - Coordinating project team`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  team_members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    department: z.string(),
    availability: z.number().min(0).max(100),
    current_tasks: z.number(),
    skills: z.array(z.string()).optional(),
  })),
  pending_tasks: z.array(z.object({
    task_id: z.string(),
    task_name: z.string(),
    required_skills: z.array(z.string()),
    priority: z.enum(["critical", "high", "medium", "low"]),
    estimated_hours: z.number(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  team_overview: z.object({
    total_members: z.number(),
    average_availability: z.number(),
    average_workload: z.number(),
    capacity_status: z.enum(["underutilized", "optimal", "overloaded"]),
  }),
  member_analysis: z.array(z.object({
    member_id: z.string(),
    name: z.string(),
    role: z.string(),
    workload_score: z.number(),
    status: z.enum(["available", "busy", "overloaded"]),
    recommended_action: z.string(),
  })),
  task_assignments: z.array(z.object({
    task_id: z.string(),
    task_name: z.string(),
    assigned_to: z.string(),
    reason: z.string(),
    expected_completion: z.string(),
  })),
  coordination_plan: z.object({
    daily_standup: z.string(),
    weekly_sync: z.string(),
    escalation_path: z.array(z.string()),
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

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { team_members, pending_tasks } = validatedInput;

  const avgAvailability = team_members.reduce((sum, m) => sum + m.availability, 0) / team_members.length;
  const avgWorkload = team_members.reduce((sum, m) => sum + m.current_tasks, 0) / team_members.length;

  const capacityStatus = avgAvailability > 50 && avgWorkload < 5 ? "underutilized"
    : avgAvailability < 20 || avgWorkload > 8 ? "overloaded" : "optimal";

  const memberAnalysis = team_members.map(member => {
    const workloadScore = (100 - member.availability) + (member.current_tasks * 10);
    const status: "available" | "busy" | "overloaded" =
      workloadScore < 40 ? "available" : workloadScore < 70 ? "busy" : "overloaded";

    return {
      member_id: member.id,
      name: member.name,
      role: member.role,
      workload_score: Math.min(100, workloadScore),
      status,
      recommended_action: status === "available"
        ? "추가 업무 할당 가능"
        : status === "busy"
        ? "현재 업무 유지"
        : "업무 재분배 필요",
    };
  });

  // 태스크 할당 (가용 인력 우선)
  const availableMembers = memberAnalysis.filter(m => m.status !== "overloaded");
  const taskAssignments = (pending_tasks || []).map((task, idx) => {
    const assignee = availableMembers[idx % availableMembers.length];
    return {
      task_id: task.task_id,
      task_name: task.task_name,
      assigned_to: assignee?.name || "미배정",
      reason: assignee ? `가용률 높음, ${task.required_skills[0] || "일반"} 역량 보유` : "가용 인력 없음",
      expected_completion: "TBD",
    };
  });

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    team_overview: {
      total_members: team_members.length,
      average_availability: Math.round(avgAvailability),
      average_workload: Math.round(avgWorkload * 10) / 10,
      capacity_status: capacityStatus,
    },
    member_analysis: memberAnalysis,
    task_assignments: taskAssignments,
    coordination_plan: {
      daily_standup: "매일 오전 9:30 (15분)",
      weekly_sync: "매주 월요일 오후 2:00 (1시간)",
      escalation_path: ["팀 리드", "PM", "이벤트 오너"],
    },
    recommendations: [
      capacityStatus === "overloaded" ? "추가 인력 투입 검토" : "현재 팀 구성 유지",
      "일일 스탠드업 미팅으로 진행 상황 공유",
      "역할별 백업 담당자 지정",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-025",
  taskName: "팀 조율",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.2.a",
  skill: "Skill 6: Manage Project",
  subSkill: "6.2: Coordinate Project Team",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
