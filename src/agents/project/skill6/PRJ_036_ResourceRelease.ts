/**
 * PRJ-036: 자원 해제
 * CMP-IS Reference: 6.3.f - Releasing project resources
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Resource Release Agent for event projects.
CMP-IS Standard: 6.3.f - Releasing project resources`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  resources: z.array(z.object({
    resource_id: z.string(),
    resource_name: z.string(),
    resource_type: z.enum(["human", "equipment", "venue", "software", "other"]),
    allocated_from: z.string(),
    allocated_to: z.string(),
    current_assignment: z.string().optional(),
    return_to: z.string().optional(),
  })),
  project_end_date: z.string(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  release_id: z.string(),
  event_id: z.string(),
  release_summary: z.object({
    event_name: z.string(),
    project_end_date: z.string(),
    release_date: z.string(),
    total_resources: z.number(),
    released: z.number(),
    pending: z.number(),
  }),
  resource_releases: z.array(z.object({
    resource_id: z.string(),
    resource_name: z.string(),
    resource_type: z.string(),
    release_status: z.enum(["released", "pending", "retained"]),
    release_date: z.string(),
    return_to: z.string(),
    handover_notes: z.string(),
  })),
  human_resources: z.object({
    team_members_released: z.number(),
    transition_plan: z.array(z.object({
      member_name: z.string(),
      current_role: z.string(),
      next_assignment: z.string(),
      release_date: z.string(),
      knowledge_transfer_status: z.enum(["completed", "in_progress", "pending"]),
    })),
  }),
  equipment_returns: z.array(z.object({
    equipment: z.string(),
    condition: z.enum(["good", "fair", "damaged"]),
    return_to: z.string(),
    return_date: z.string(),
    notes: z.string(),
  })),
  checklist: z.array(z.object({
    task: z.string(),
    status: z.enum(["completed", "in_progress", "pending"]),
    responsible: z.string(),
  })),
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { resources, project_end_date } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  const humanResources = resources.filter(r => r.resource_type === "human");
  const equipmentResources = resources.filter(r => r.resource_type === "equipment" || r.resource_type === "venue");

  // 자원 해제 상태
  const resourceReleases = resources.map(resource => ({
    resource_id: resource.resource_id,
    resource_name: resource.resource_name,
    resource_type: resource.resource_type,
    release_status: today >= project_end_date ? "released" as const : "pending" as const,
    release_date: addDays(project_end_date, resource.resource_type === "human" ? 7 : 1),
    return_to: resource.return_to || "원 소속",
    handover_notes: resource.resource_type === "human"
      ? "지식 이전 완료 후 해제"
      : "상태 점검 후 반납",
  }));

  // 인력 전환 계획
  const transitionPlan = humanResources.map(hr => ({
    member_name: hr.resource_name,
    current_role: hr.current_assignment || "프로젝트 팀원",
    next_assignment: hr.return_to || "대기 (신규 프로젝트 배정 예정)",
    release_date: addDays(project_end_date, 7),
    knowledge_transfer_status: "in_progress" as const,
  }));

  // 장비 반납
  const equipmentReturns = equipmentResources.map(eq => ({
    equipment: eq.resource_name,
    condition: "good" as const,
    return_to: eq.return_to || "장비 창고",
    return_date: addDays(project_end_date, 1),
    notes: "정상 반납 예정",
  }));

  const releasedCount = resourceReleases.filter(r => r.release_status === "released").length;

  return {
    release_id: generateUUID(),
    event_id: validatedInput.event_id,
    release_summary: {
      event_name: validatedInput.event_name,
      project_end_date,
      release_date: today,
      total_resources: resources.length,
      released: releasedCount,
      pending: resources.length - releasedCount,
    },
    resource_releases: resourceReleases,
    human_resources: {
      team_members_released: humanResources.length,
      transition_plan: transitionPlan,
    },
    equipment_returns: equipmentReturns,
    checklist: [
      { task: "모든 인력 지식 이전 완료", status: "in_progress", responsible: "PM" },
      { task: "장비 상태 점검 및 반납", status: "pending", responsible: "Operations" },
      { task: "소프트웨어 라이선스 해제", status: "pending", responsible: "IT" },
      { task: "임대 장소 원상 복구", status: "pending", responsible: "Operations" },
      { task: "최종 자원 정산", status: "pending", responsible: "Finance" },
      { task: "자원 해제 완료 보고", status: "pending", responsible: "PM" },
    ],
    recommendations: [
      "인력 해제 전 충분한 지식 이전 기간 확보",
      "장비 반납 전 상태 점검 및 사진 기록",
      "우수 인력 향후 프로젝트 우선 배정",
      "자원 활용 효율성 분석 및 피드백",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-036",
  taskName: "자원 해제",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.f",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
