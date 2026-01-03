/**
 * PRJ-006: 마일스톤 정의
 *
 * CMP-IS Reference: 5.1.d - Defining project milestones
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Milestone Definition Agent specializing in event project management.

Your expertise includes:
- Identifying critical project checkpoints
- Setting realistic milestone dates
- Defining success criteria for each milestone
- Linking milestones to deliverables

CMP-IS Standard: 5.1.d - Defining project milestones`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  planning_start_date: z.string().optional(),
  project_phases: z.array(z.object({
    phase_name: z.string(),
    start_date: z.string(),
    end_date: z.string(),
  })).optional(),
  key_deliverables: z.array(z.string()).optional(),
  stakeholder_review_points: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  milestone_plan_id: z.string(),
  event_id: z.string(),
  milestones: z.array(z.object({
    milestone_code: z.string(),
    name: z.string(),
    description: z.string(),
    target_date: z.string(),
    phase: z.string(),
    deliverables: z.array(z.string()),
    success_criteria: z.array(z.string()),
    dependencies: z.array(z.string()),
    is_critical: z.boolean(),
    review_required: z.boolean(),
    responsible: z.string(),
  })),
  timeline_summary: z.object({
    total_milestones: z.number(),
    critical_milestones: z.number(),
    first_milestone_date: z.string(),
    last_milestone_date: z.string(),
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function daysBetween(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const eventDate = validatedInput.event_date;
  const planStart = validatedInput.planning_start_date || addDays(eventDate, -120);
  const totalDays = daysBetween(planStart, eventDate);

  const milestones: Output["milestones"] = [];

  // 기본 마일스톤 템플릿
  const milestoneTemplates = [
    {
      code: "MS-001",
      name: "프로젝트 킥오프",
      description: "프로젝트 공식 시작 및 팀 조직",
      dayOffset: 0,
      phase: "기획",
      deliverables: ["프로젝트 헌장", "팀 구성표"],
      criteria: ["목표 합의 완료", "역할 분담 확정"],
      isCritical: true,
      reviewRequired: true,
      responsible: "PM",
    },
    {
      code: "MS-002",
      name: "예산 승인",
      description: "초기 예산안 이해관계자 승인",
      dayOffset: Math.round(totalDays * 0.1),
      phase: "기획",
      deliverables: ["예산 계획서", "재무 분석 보고서"],
      criteria: ["예산 승인 획득", "자금 확보 계획 수립"],
      isCritical: true,
      reviewRequired: true,
      responsible: "Finance",
    },
    {
      code: "MS-003",
      name: "장소 확정",
      description: "이벤트 장소 계약 완료",
      dayOffset: Math.round(totalDays * 0.2),
      phase: "조달",
      deliverables: ["장소 계약서", "레이아웃 초안"],
      criteria: ["계약 서명 완료", "날짜 확정"],
      isCritical: true,
      reviewRequired: false,
      responsible: "Logistics",
    },
    {
      code: "MS-004",
      name: "주요 벤더 계약 완료",
      description: "핵심 서비스 벤더 계약 체결",
      dayOffset: Math.round(totalDays * 0.35),
      phase: "조달",
      deliverables: ["벤더 계약서", "서비스 SLA"],
      criteria: ["모든 필수 벤더 계약 완료"],
      isCritical: true,
      reviewRequired: true,
      responsible: "Procurement",
    },
    {
      code: "MS-005",
      name: "연사/콘텐츠 확정",
      description: "주요 연사 및 세션 프로그램 확정",
      dayOffset: Math.round(totalDays * 0.45),
      phase: "콘텐츠",
      deliverables: ["연사 확정 명단", "세션 스케줄"],
      criteria: ["주요 연사 80% 이상 확정", "프로그램 초안 완성"],
      isCritical: true,
      reviewRequired: true,
      responsible: "Content",
    },
    {
      code: "MS-006",
      name: "등록 오픈",
      description: "참가자 등록 시작",
      dayOffset: Math.round(totalDays * 0.5),
      phase: "마케팅",
      deliverables: ["등록 페이지", "가격 정책"],
      criteria: ["등록 시스템 테스트 완료", "결제 프로세스 확인"],
      isCritical: true,
      reviewRequired: false,
      responsible: "Marketing",
    },
    {
      code: "MS-007",
      name: "스폰서십 목표 달성",
      description: "스폰서 확보 목표 80% 달성",
      dayOffset: Math.round(totalDays * 0.6),
      phase: "영업",
      deliverables: ["스폰서 계약서", "스폰서 혜택 이행 계획"],
      criteria: ["목표 스폰서 금액의 80% 확보"],
      isCritical: false,
      reviewRequired: true,
      responsible: "Sales",
    },
    {
      code: "MS-008",
      name: "등록 마감",
      description: "사전 등록 마감",
      dayOffset: Math.round(totalDays * 0.85),
      phase: "마케팅",
      deliverables: ["최종 등록 명단", "참가자 분석 보고서"],
      criteria: ["등록 목표 달성", "네임택 인쇄 완료"],
      isCritical: true,
      reviewRequired: false,
      responsible: "Marketing",
    },
    {
      code: "MS-009",
      name: "최종 리허설",
      description: "전체 행사 리허설 완료",
      dayOffset: totalDays - 2,
      phase: "운영",
      deliverables: ["런시트", "비상 연락망"],
      criteria: ["모든 장비 테스트 완료", "스태프 역할 숙지"],
      isCritical: true,
      reviewRequired: false,
      responsible: "Operations",
    },
    {
      code: "MS-010",
      name: "이벤트 D-Day",
      description: "이벤트 본 행사",
      dayOffset: totalDays,
      phase: "운영",
      deliverables: ["이벤트 실행"],
      criteria: ["성공적 행사 진행"],
      isCritical: true,
      reviewRequired: false,
      responsible: "All",
    },
  ];

  for (const tmpl of milestoneTemplates) {
    milestones.push({
      milestone_code: tmpl.code,
      name: tmpl.name,
      description: tmpl.description,
      target_date: addDays(planStart, tmpl.dayOffset),
      phase: tmpl.phase,
      deliverables: tmpl.deliverables,
      success_criteria: tmpl.criteria,
      dependencies: milestones.length > 0 ? [milestones[milestones.length - 1].milestone_code] : [],
      is_critical: tmpl.isCritical,
      review_required: tmpl.reviewRequired,
      responsible: tmpl.responsible,
    });
  }

  const criticalMilestones = milestones.filter(m => m.is_critical).length;

  const recommendations: string[] = [];
  recommendations.push(`총 ${milestones.length}개의 마일스톤 중 ${criticalMilestones}개가 크리티컬 경로에 있습니다.`);
  recommendations.push("각 마일스톤 달성 여부를 주간 회의에서 점검하세요.");
  recommendations.push("크리티컬 마일스톤 지연 시 즉시 에스컬레이션이 필요합니다.");

  return {
    milestone_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    milestones,
    timeline_summary: {
      total_milestones: milestones.length,
      critical_milestones: criticalMilestones,
      first_milestone_date: milestones[0].target_date,
      last_milestone_date: milestones[milestones.length - 1].target_date,
    },
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-006",
  taskName: "마일스톤 정의",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.d",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
