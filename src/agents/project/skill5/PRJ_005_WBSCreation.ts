/**
 * PRJ-005: WBS (작업분해구조) 생성
 *
 * CMP-IS Reference: 5.1.c - Creating Work Breakdown Structure
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert WBS Creation Agent specializing in event project decomposition.

Your expertise includes:
- Breaking down event projects into manageable work packages
- Defining deliverables at each level
- Estimating effort and dependencies
- Creating hierarchical task structures

CMP-IS Standard: 5.1.c - Creating Work Breakdown Structure`;

export const InputSchema = z.object({
  event_id: z.string().describe("이벤트 ID"),
  event_name: z.string().describe("이벤트명"),
  event_type: z.enum(["conference", "exhibition", "seminar", "gala", "hybrid", "virtual", "other"]).default("conference"),
  event_date: z.string().describe("이벤트 날짜"),
  expected_attendees: z.number().int().min(1),
  key_deliverables: z.array(z.string()).optional().describe("주요 산출물"),
  existing_phases: z.array(z.object({
    phase_name: z.string(),
    phase_code: z.string().optional(),
  })).optional().describe("기존 단계 정의"),
  depth_level: z.number().int().min(2).max(5).default(3).describe("WBS 세분화 깊이"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  wbs_id: z.string(),
  event_id: z.string(),
  event_name: z.string(),
  wbs_structure: z.array(z.object({
    wbs_code: z.string(),
    level: z.number(),
    name: z.string(),
    description: z.string().optional(),
    parent_code: z.string().optional(),
    deliverable: z.string().optional(),
    estimated_hours: z.number().optional(),
    responsible_role: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
  })),
  summary: z.object({
    total_work_packages: z.number(),
    total_estimated_hours: z.number(),
    levels: z.number(),
    by_phase: z.record(z.string(), z.number()),
  }),
  critical_path_items: z.array(z.string()),
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

// 이벤트 타입별 기본 WBS 템플릿
const WBS_TEMPLATES: Record<string, Array<{
  code: string;
  name: string;
  children: Array<{ code: string; name: string; hours: number; role: string }>;
}>> = {
  conference: [
    {
      code: "1", name: "기획",
      children: [
        { code: "1.1", name: "목표 수립", hours: 16, role: "PM" },
        { code: "1.2", name: "예산 수립", hours: 24, role: "Finance" },
        { code: "1.3", name: "일정 수립", hours: 16, role: "PM" },
        { code: "1.4", name: "이해관계자 분석", hours: 12, role: "Strategy" },
      ],
    },
    {
      code: "2", name: "조달",
      children: [
        { code: "2.1", name: "장소 확보", hours: 40, role: "Logistics" },
        { code: "2.2", name: "벤더 선정", hours: 32, role: "Procurement" },
        { code: "2.3", name: "계약 체결", hours: 24, role: "Legal" },
        { code: "2.4", name: "스폰서 유치", hours: 60, role: "Sales" },
      ],
    },
    {
      code: "3", name: "콘텐츠",
      children: [
        { code: "3.1", name: "연사 섭외", hours: 40, role: "Content" },
        { code: "3.2", name: "세션 기획", hours: 32, role: "Content" },
        { code: "3.3", name: "발표 자료 수집", hours: 24, role: "Content" },
        { code: "3.4", name: "프로그램 편성", hours: 16, role: "Content" },
      ],
    },
    {
      code: "4", name: "마케팅",
      children: [
        { code: "4.1", name: "등록 시스템 구축", hours: 24, role: "Tech" },
        { code: "4.2", name: "홍보 캠페인", hours: 80, role: "Marketing" },
        { code: "4.3", name: "참가자 커뮤니케이션", hours: 40, role: "Marketing" },
        { code: "4.4", name: "미디어 관계", hours: 24, role: "PR" },
      ],
    },
    {
      code: "5", name: "운영",
      children: [
        { code: "5.1", name: "현장 설치", hours: 40, role: "Operations" },
        { code: "5.2", name: "리허설", hours: 16, role: "Operations" },
        { code: "5.3", name: "본 행사 운영", hours: 24, role: "Operations" },
        { code: "5.4", name: "철수 및 정리", hours: 16, role: "Operations" },
      ],
    },
    {
      code: "6", name: "마무리",
      children: [
        { code: "6.1", name: "정산", hours: 24, role: "Finance" },
        { code: "6.2", name: "보고서 작성", hours: 16, role: "PM" },
        { code: "6.3", name: "피드백 수집", hours: 12, role: "Marketing" },
        { code: "6.4", name: "레슨런 정리", hours: 8, role: "PM" },
      ],
    },
  ],
  exhibition: [
    {
      code: "1", name: "기획",
      children: [
        { code: "1.1", name: "전시 컨셉 개발", hours: 32, role: "Creative" },
        { code: "1.2", name: "목표 및 예산 수립", hours: 24, role: "PM" },
        { code: "1.3", name: "참가업체 목표 설정", hours: 16, role: "Sales" },
      ],
    },
    {
      code: "2", name: "조달",
      children: [
        { code: "2.1", name: "전시장 확보", hours: 40, role: "Logistics" },
        { code: "2.2", name: "부스 시공업체 선정", hours: 32, role: "Procurement" },
        { code: "2.3", name: "장비 렌탈", hours: 24, role: "Procurement" },
      ],
    },
    {
      code: "3", name: "영업",
      children: [
        { code: "3.1", name: "참가업체 유치", hours: 120, role: "Sales" },
        { code: "3.2", name: "스폰서십 판매", hours: 80, role: "Sales" },
        { code: "3.3", name: "계약 관리", hours: 40, role: "Sales" },
      ],
    },
    {
      code: "4", name: "마케팅",
      children: [
        { code: "4.1", name: "사전 등록", hours: 40, role: "Marketing" },
        { code: "4.2", name: "홍보 캠페인", hours: 80, role: "Marketing" },
        { code: "4.3", name: "VIP 초청", hours: 24, role: "Marketing" },
      ],
    },
    {
      code: "5", name: "운영",
      children: [
        { code: "5.1", name: "설치 감독", hours: 48, role: "Operations" },
        { code: "5.2", name: "전시 운영", hours: 72, role: "Operations" },
        { code: "5.3", name: "철수 관리", hours: 24, role: "Operations" },
      ],
    },
  ],
};

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const template = WBS_TEMPLATES[validatedInput.event_type] || WBS_TEMPLATES.conference;
  const wbsStructure: Output["wbs_structure"] = [];
  const byPhase: Record<string, number> = {};
  const criticalPath: string[] = [];

  let totalHours = 0;
  let totalPackages = 0;

  // 규모에 따른 시간 조정
  let scaleFactor = 1;
  if (validatedInput.expected_attendees > 1000) scaleFactor = 1.5;
  else if (validatedInput.expected_attendees > 5000) scaleFactor = 2;
  else if (validatedInput.expected_attendees < 100) scaleFactor = 0.7;

  for (const phase of template) {
    // Level 1
    wbsStructure.push({
      wbs_code: phase.code,
      level: 1,
      name: phase.name,
      description: `${validatedInput.event_name} - ${phase.name} 단계`,
    });

    let phaseHours = 0;

    for (const task of phase.children) {
      const adjustedHours = Math.round(task.hours * scaleFactor);

      // Level 2
      wbsStructure.push({
        wbs_code: task.code,
        level: 2,
        name: task.name,
        parent_code: phase.code,
        deliverable: `${task.name} 완료`,
        estimated_hours: adjustedHours,
        responsible_role: task.role,
        dependencies: [],
      });

      phaseHours += adjustedHours;
      totalHours += adjustedHours;
      totalPackages++;

      // Level 3 (depth >= 3인 경우)
      if (validatedInput.depth_level >= 3) {
        const subTasks = [
          { suffix: "1", name: "준비", ratio: 0.2 },
          { suffix: "2", name: "실행", ratio: 0.6 },
          { suffix: "3", name: "검토", ratio: 0.2 },
        ];

        for (const sub of subTasks) {
          wbsStructure.push({
            wbs_code: `${task.code}.${sub.suffix}`,
            level: 3,
            name: `${task.name} - ${sub.name}`,
            parent_code: task.code,
            estimated_hours: Math.round(adjustedHours * sub.ratio),
            responsible_role: task.role,
          });
          totalPackages++;
        }
      }
    }

    byPhase[phase.name] = phaseHours;

    // 크리티컬 패스 항목 (기획, 조달 관련)
    if (["1", "2", "5"].includes(phase.code)) {
      criticalPath.push(...phase.children.map(c => c.code));
    }
  }

  return {
    wbs_id: generateUUID(),
    event_id: validatedInput.event_id,
    event_name: validatedInput.event_name,
    wbs_structure: wbsStructure,
    summary: {
      total_work_packages: totalPackages,
      total_estimated_hours: totalHours,
      levels: validatedInput.depth_level,
      by_phase: byPhase,
    },
    critical_path_items: criticalPath,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-005",
  taskName: "WBS 생성",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.c",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
