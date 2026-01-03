/**
 * PRJ-016: 이슈 관리
 *
 * CMP-IS Reference: 6.1.c - Managing project issues
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Issue Management Agent for event projects.

Your expertise includes:
- Identifying and logging project issues
- Prioritizing and categorizing issues
- Assigning resolution owners
- Tracking issue resolution

CMP-IS Standard: 6.1.c - Managing project issues`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  issue: z.object({
    title: z.string(),
    description: z.string(),
    reported_by: z.string(),
    reported_date: z.string(),
    category: z.enum(["technical", "resource", "vendor", "budget", "schedule", "quality", "communication", "other"]),
    affected_area: z.string(),
  }),
  related_tasks: z.array(z.string()).optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  issue_id: z.string(),
  event_id: z.string(),
  issue_details: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    reported_by: z.string(),
    reported_date: z.string(),
    status: z.enum(["open", "in_progress", "resolved", "closed", "escalated"]),
  }),
  assessment: z.object({
    severity: z.enum(["minor", "moderate", "major", "critical"]),
    urgency: z.enum(["low", "medium", "high", "critical"]),
    priority_score: z.number(),
    priority_level: z.enum(["P1", "P2", "P3", "P4"]),
    impact_analysis: z.object({
      schedule_impact: z.string(),
      budget_impact: z.string(),
      quality_impact: z.string(),
      stakeholder_impact: z.string(),
    }),
  }),
  resolution_plan: z.object({
    assigned_to: z.string(),
    target_resolution_date: z.string(),
    resolution_approach: z.string(),
    action_items: z.array(z.object({
      action: z.string(),
      owner: z.string(),
      due_date: z.string(),
      status: z.enum(["pending", "in_progress", "completed"]),
    })),
    required_resources: z.array(z.string()),
    estimated_effort_hours: z.number(),
  }),
  escalation: z.object({
    escalation_needed: z.boolean(),
    escalation_level: z.number(),
    escalate_to: z.string(),
    escalation_reason: z.string(),
    escalation_deadline: z.string(),
  }),
  communication: z.object({
    stakeholders_to_inform: z.array(z.string()),
    communication_template: z.string(),
    update_frequency: z.string(),
  }),
  workaround: z.object({
    available: z.boolean(),
    description: z.string(),
    limitations: z.array(z.string()),
  }),
  related_items: z.object({
    affected_tasks: z.array(z.string()),
    related_risks: z.array(z.string()),
    similar_past_issues: z.array(z.string()),
  }),
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

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { issue, event_date } = validatedInput;
  const today = new Date().toISOString().split("T")[0];
  const daysToEvent = daysBetween(today, event_date);

  const issueId = `ISS-${Date.now().toString(36).toUpperCase()}`;

  // 심각도 평가 (카테고리 기반)
  const severityByCategory: Record<string, "minor" | "moderate" | "major" | "critical"> = {
    technical: "major",
    resource: "moderate",
    vendor: "major",
    budget: "moderate",
    schedule: "major",
    quality: "moderate",
    communication: "minor",
    other: "minor",
  };
  const severity = severityByCategory[issue.category] || "moderate";

  // 긴급도 (D-Day 근접도 반영)
  let urgency = validatedInput.urgency || "medium";
  if (daysToEvent <= 7) {
    urgency = severity === "critical" || severity === "major" ? "critical" : "high";
  } else if (daysToEvent <= 14) {
    urgency = severity === "major" ? "high" : urgency;
  }

  // 우선순위 점수 계산
  const severityScore = { minor: 1, moderate: 2, major: 3, critical: 4 };
  const urgencyScore = { low: 1, medium: 2, high: 3, critical: 4 };
  const priorityScore = severityScore[severity] * urgencyScore[urgency];

  const priorityLevel: "P1" | "P2" | "P3" | "P4" =
    priorityScore >= 12 ? "P1" :
    priorityScore >= 8 ? "P2" :
    priorityScore >= 4 ? "P3" : "P4";

  // 영향 분석
  const impactAnalysis = {
    schedule_impact: severity === "critical" || severity === "major"
      ? "일정 지연 가능성 높음"
      : "일정 영향 미미",
    budget_impact: issue.category === "budget" || issue.category === "vendor"
      ? "추가 비용 발생 가능"
      : "예산 영향 없음",
    quality_impact: issue.category === "quality" || issue.category === "technical"
      ? "품질 저하 우려"
      : "품질 영향 낮음",
    stakeholder_impact: severity === "critical"
      ? "이해관계자 신뢰도 영향 가능"
      : "이해관계자 영향 제한적",
  };

  // 담당자 배정
  const ownerByCategory: Record<string, string> = {
    technical: "기술팀 리드",
    resource: "HR 담당",
    vendor: "조달 담당",
    budget: "재무 담당",
    schedule: "PM",
    quality: "QA 담당",
    communication: "마케팅 담당",
    other: "PM",
  };
  const assignedTo = ownerByCategory[issue.category] || "PM";

  // 목표 해결일
  const resolutionDays =
    priorityLevel === "P1" ? 1 :
    priorityLevel === "P2" ? 3 :
    priorityLevel === "P3" ? 7 : 14;
  const targetResolutionDate = addDays(today, Math.min(resolutionDays, daysToEvent - 1));

  // 해결 접근법
  const resolutionApproaches: Record<string, string> = {
    technical: "기술적 원인 분석 후 수정 또는 대안 구현",
    resource: "리소스 재배치 또는 추가 확보",
    vendor: "벤더 협의 및 SLA 검토, 필요시 대체 벤더 활용",
    budget: "예비비 활용 또는 비용 절감 방안 모색",
    schedule: "일정 재조정 또는 병렬 작업 투입",
    quality: "품질 기준 검토 및 개선 조치",
    communication: "커뮤니케이션 채널 및 프로세스 개선",
    other: "원인 분석 후 맞춤 해결 방안 수립",
  };

  // 액션 아이템
  const actionItems = [
    {
      action: "이슈 상세 분석",
      owner: assignedTo,
      due_date: addDays(today, 1),
      status: "pending" as const,
    },
    {
      action: "해결 방안 수립",
      owner: assignedTo,
      due_date: addDays(today, Math.ceil(resolutionDays / 2)),
      status: "pending" as const,
    },
    {
      action: "해결 방안 실행",
      owner: assignedTo,
      due_date: targetResolutionDate,
      status: "pending" as const,
    },
    {
      action: "결과 검증 및 종료",
      owner: "PM",
      due_date: addDays(targetResolutionDate, 1),
      status: "pending" as const,
    },
  ];

  // 에스컬레이션
  const escalationNeeded = priorityLevel === "P1" || (priorityLevel === "P2" && daysToEvent <= 7);
  const escalationLevel = priorityLevel === "P1" ? 3 : priorityLevel === "P2" ? 2 : 1;

  const escalateToByLevel: Record<number, string> = {
    1: "팀 리드",
    2: "PM",
    3: "이벤트 오너",
  };

  // 커뮤니케이션
  const stakeholdersToInform =
    priorityLevel === "P1" ? ["이벤트 오너", "PM", "관련 팀 리드", "영향받는 벤더"]
    : priorityLevel === "P2" ? ["PM", "관련 팀 리드"]
    : ["PM"];

  const updateFrequency =
    priorityLevel === "P1" ? "매일"
    : priorityLevel === "P2" ? "격일"
    : "주간";

  // 우회 방안
  const workaroundAvailable = validatedInput.urgency !== "critical" && daysToEvent > 3;

  return {
    issue_id: issueId,
    event_id: validatedInput.event_id,
    issue_details: {
      title: issue.title,
      description: issue.description,
      category: issue.category,
      reported_by: issue.reported_by,
      reported_date: issue.reported_date,
      status: "open",
    },
    assessment: {
      severity,
      urgency: urgency as "low" | "medium" | "high" | "critical",
      priority_score: priorityScore,
      priority_level: priorityLevel,
      impact_analysis: impactAnalysis,
    },
    resolution_plan: {
      assigned_to: assignedTo,
      target_resolution_date: targetResolutionDate,
      resolution_approach: resolutionApproaches[issue.category] || resolutionApproaches.other,
      action_items: actionItems,
      required_resources: ["담당자 시간", "필요시 예비비"],
      estimated_effort_hours: priorityLevel === "P1" ? 16 : priorityLevel === "P2" ? 8 : 4,
    },
    escalation: {
      escalation_needed: escalationNeeded,
      escalation_level: escalationLevel,
      escalate_to: escalateToByLevel[escalationLevel],
      escalation_reason: escalationNeeded ? "우선순위 높음 또는 D-Day 임박" : "일반 처리",
      escalation_deadline: addDays(today, priorityLevel === "P1" ? 0 : 1),
    },
    communication: {
      stakeholders_to_inform: stakeholdersToInform,
      communication_template: `[${priorityLevel}] 이슈 발생: ${issue.title}\n상태: 조사 중\n담당: ${assignedTo}\n예상 해결: ${targetResolutionDate}`,
      update_frequency: updateFrequency,
    },
    workaround: {
      available: workaroundAvailable,
      description: workaroundAvailable ? "임시 대안으로 진행 가능" : "우회 방안 없음 - 즉시 해결 필요",
      limitations: workaroundAvailable ? ["임시 방편", "완전한 해결 아님"] : [],
    },
    related_items: {
      affected_tasks: validatedInput.related_tasks || [],
      related_risks: [`${issue.category} 리스크 증가`],
      similar_past_issues: [],
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-016",
  taskName: "이슈 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.c",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
