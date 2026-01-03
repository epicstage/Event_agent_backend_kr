/**
 * PRJ-013: 기준선 설정
 *
 * CMP-IS Reference: 5.1.k - Establishing project baselines
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Baseline Setting Agent for event projects.

Your expertise includes:
- Establishing scope baseline
- Setting schedule baseline
- Defining cost baseline
- Creating performance measurement baselines

CMP-IS Standard: 5.1.k - Establishing project baselines`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  scope_statement: z.string().optional(),
  total_budget: z.number(),
  currency: z.string().default("KRW"),
  milestones: z.array(z.object({
    name: z.string(),
    target_date: z.string(),
  })).optional(),
  deliverables: z.array(z.string()).optional(),
  kpis: z.array(z.object({
    name: z.string(),
    target: z.string(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  baseline_id: z.string(),
  event_id: z.string(),
  baseline_date: z.string(),
  version: z.string(),
  scope_baseline: z.object({
    project_scope_statement: z.string(),
    deliverables: z.array(z.object({
      deliverable_id: z.string(),
      name: z.string(),
      description: z.string(),
      acceptance_criteria: z.array(z.string()),
      due_date: z.string(),
    })),
    exclusions: z.array(z.string()),
    assumptions: z.array(z.string()),
    constraints: z.array(z.string()),
  }),
  schedule_baseline: z.object({
    project_start: z.string(),
    project_end: z.string(),
    total_duration_days: z.number(),
    milestones: z.array(z.object({
      milestone_id: z.string(),
      name: z.string(),
      baseline_date: z.string(),
      is_critical: z.boolean(),
    })),
    critical_path_summary: z.string(),
  }),
  cost_baseline: z.object({
    total_budget: z.number(),
    currency: z.string(),
    budget_breakdown: z.array(z.object({
      category: z.string(),
      baseline_amount: z.number(),
      percentage: z.number(),
    })),
    contingency_reserve: z.number(),
    management_reserve: z.number(),
    cash_flow_schedule: z.array(z.object({
      period: z.string(),
      planned_expenditure: z.number(),
      cumulative: z.number(),
    })),
  }),
  performance_baseline: z.object({
    kpis: z.array(z.object({
      kpi_id: z.string(),
      name: z.string(),
      baseline_value: z.string(),
      target_value: z.string(),
      measurement_method: z.string(),
      measurement_frequency: z.string(),
    })),
    earned_value_metrics: z.object({
      planned_value_at_completion: z.number(),
      schedule_performance_target: z.number(),
      cost_performance_target: z.number(),
    }),
  }),
  change_control: z.object({
    baseline_version_history: z.array(z.object({
      version: z.string(),
      date: z.string(),
      changes: z.string(),
      approved_by: z.string(),
    })),
    change_request_process: z.array(z.string()),
    approval_authority: z.array(z.object({
      change_type: z.string(),
      threshold: z.string(),
      approver: z.string(),
    })),
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
  const diff = d2.getTime() - d1.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const today = new Date().toISOString().split("T")[0];
  const eventDate = validatedInput.event_date;
  const totalBudget = validatedInput.total_budget;

  // 범위 기준선
  const defaultDeliverables = [
    { name: "프로젝트 계획서", description: "상세 프로젝트 계획 및 일정", dueOffset: -60 },
    { name: "벤더 계약", description: "모든 주요 벤더 계약 완료", dueOffset: -45 },
    { name: "마케팅 자료", description: "홍보물, 웹사이트, SNS 콘텐츠", dueOffset: -30 },
    { name: "등록 시스템", description: "등록 페이지 및 결제 시스템", dueOffset: -45 },
    { name: "현장 준비", description: "장소 셋업 및 장비 설치", dueOffset: -1 },
    { name: "이벤트 실행", description: "성공적인 이벤트 개최", dueOffset: 0 },
    { name: "사후 보고서", description: "최종 결과 보고서 및 정산", dueOffset: 14 },
  ];

  const deliverables = (validatedInput.deliverables?.length
    ? validatedInput.deliverables.map((d, idx) => ({
        name: d,
        description: d,
        dueOffset: -30 + idx * 5,
      }))
    : defaultDeliverables
  ).map((d, idx) => ({
    deliverable_id: `DEL-${String(idx + 1).padStart(3, "0")}`,
    name: d.name,
    description: d.description,
    acceptance_criteria: [
      "담당자 검토 완료",
      "품질 기준 충족",
      "이해관계자 승인",
    ],
    due_date: addDays(eventDate, d.dueOffset),
  }));

  const scopeBaseline: Output["scope_baseline"] = {
    project_scope_statement: validatedInput.scope_statement ||
      `${validatedInput.event_name} 이벤트의 성공적인 기획, 준비, 실행 및 마무리. ` +
      `목표 참가자 유치, 스폰서 만족도 달성, 예산 내 완료를 목표로 함.`,
    deliverables,
    exclusions: [
      "참가자 개인 여행 및 숙박 수배",
      "이벤트 외 별도 프로그램 운영",
      "사후 마케팅 캠페인",
    ],
    assumptions: [
      "예산이 승인된 금액으로 확정됨",
      "주요 이해관계자의 적시 의사결정",
      "벤더들의 계약 조건 이행",
      "예상 참가자 수의 ±20% 변동 가능",
    ],
    constraints: [
      `이벤트 일자: ${eventDate} 고정`,
      `총 예산: ${totalBudget.toLocaleString()} ${validatedInput.currency}`,
      "행사장 수용 인원 제한",
      "법적 규제 및 안전 규정 준수",
    ],
  };

  // 일정 기준선
  const defaultMilestones = [
    { name: "프로젝트 킥오프", offset: -90 },
    { name: "기획 완료", offset: -60 },
    { name: "벤더 선정 완료", offset: -45 },
    { name: "마케팅 런칭", offset: -45 },
    { name: "등록 오픈", offset: -42 },
    { name: "콘텐츠 확정", offset: -21 },
    { name: "최종 리허설", offset: -1 },
    { name: "이벤트 실행", offset: 0 },
    { name: "사후 정산 완료", offset: 14 },
  ];

  const milestones = (validatedInput.milestones?.length
    ? validatedInput.milestones.map((m, idx) => ({
        name: m.name,
        baseline_date: m.target_date,
        is_critical: idx < 3,
      }))
    : defaultMilestones.map(m => ({
        name: m.name,
        baseline_date: addDays(eventDate, m.offset),
        is_critical: m.offset >= -7,
      }))
  ).map((m, idx) => ({
    milestone_id: `MS-${String(idx + 1).padStart(3, "0")}`,
    ...m,
  }));

  const projectStart = milestones[0]?.baseline_date || addDays(eventDate, -90);
  const projectEnd = milestones[milestones.length - 1]?.baseline_date || addDays(eventDate, 14);

  const scheduleBaseline: Output["schedule_baseline"] = {
    project_start: projectStart,
    project_end: projectEnd,
    total_duration_days: daysBetween(projectStart, projectEnd),
    milestones,
    critical_path_summary: "기획 → 벤더 선정 → 콘텐츠 확정 → 현장 준비 → 이벤트 실행",
  };

  // 비용 기준선
  const budgetBreakdown = [
    { category: "장소", percentage: 25 },
    { category: "케이터링", percentage: 20 },
    { category: "AV/기술", percentage: 15 },
    { category: "마케팅", percentage: 12 },
    { category: "인력", percentage: 10 },
    { category: "장식/사이니지", percentage: 8 },
    { category: "인쇄물", percentage: 3 },
    { category: "교통", percentage: 2 },
  ].map(b => ({
    category: b.category,
    baseline_amount: Math.round(totalBudget * b.percentage / 100),
    percentage: b.percentage,
  }));

  const contingency = totalBudget * 0.05;
  const operatingBudget = totalBudget - contingency;

  // 현금 흐름 계획
  const totalDays = daysBetween(projectStart, projectEnd);
  const phases = [
    { period: "Phase 1 (기획)", ratio: 0.10 },
    { period: "Phase 2 (계약)", ratio: 0.30 },
    { period: "Phase 3 (준비)", ratio: 0.35 },
    { period: "Phase 4 (실행)", ratio: 0.20 },
    { period: "Phase 5 (정산)", ratio: 0.05 },
  ];

  let cumulative = 0;
  const cashFlowSchedule = phases.map(p => {
    const expenditure = Math.round(operatingBudget * p.ratio);
    cumulative += expenditure;
    return {
      period: p.period,
      planned_expenditure: expenditure,
      cumulative,
    };
  });

  const costBaseline: Output["cost_baseline"] = {
    total_budget: totalBudget,
    currency: validatedInput.currency,
    budget_breakdown: budgetBreakdown,
    contingency_reserve: contingency,
    management_reserve: 0, // 별도 관리
    cash_flow_schedule: cashFlowSchedule,
  };

  // 성과 기준선
  const defaultKpis = [
    { name: "참가자 수", target: "목표 인원 100%", baseline: "0명" },
    { name: "참가자 만족도", target: "4.5/5.0", baseline: "N/A" },
    { name: "예산 집행률", target: "95-100%", baseline: "0%" },
    { name: "일정 준수율", target: "100%", baseline: "100%" },
    { name: "스폰서 만족도", target: "4.0/5.0", baseline: "N/A" },
    { name: "NPS", target: "50 이상", baseline: "N/A" },
  ];

  const kpis = (validatedInput.kpis?.length
    ? validatedInput.kpis.map(k => ({
        name: k.name,
        target: k.target,
        baseline: "측정 시작 전",
      }))
    : defaultKpis
  ).map((k, idx) => ({
    kpi_id: `KPI-${String(idx + 1).padStart(3, "0")}`,
    name: k.name,
    baseline_value: k.baseline,
    target_value: k.target,
    measurement_method: "시스템 데이터 + 설문조사",
    measurement_frequency: k.name.includes("만족도") || k.name.includes("NPS") ? "이벤트 후" : "주간",
  }));

  const performanceBaseline: Output["performance_baseline"] = {
    kpis,
    earned_value_metrics: {
      planned_value_at_completion: operatingBudget,
      schedule_performance_target: 1.0, // SPI >= 1.0
      cost_performance_target: 1.0, // CPI >= 1.0
    },
  };

  // 변경 통제
  const changeControl: Output["change_control"] = {
    baseline_version_history: [
      {
        version: "1.0",
        date: today,
        changes: "초기 기준선 설정",
        approved_by: "PM",
      },
    ],
    change_request_process: [
      "1. 변경 요청서 작성 (요청자)",
      "2. 영향 분석 수행 (PM)",
      "3. 변경 통제 위원회 검토",
      "4. 승인/반려 결정",
      "5. 승인 시 기준선 업데이트",
      "6. 이해관계자 통보",
    ],
    approval_authority: [
      {
        change_type: "범위 변경",
        threshold: "소규모 (일정/예산 5% 미만 영향)",
        approver: "PM",
      },
      {
        change_type: "범위 변경",
        threshold: "중규모 (일정/예산 5-15% 영향)",
        approver: "이벤트 오너",
      },
      {
        change_type: "범위 변경",
        threshold: "대규모 (일정/예산 15% 초과)",
        approver: "경영진",
      },
      {
        change_type: "일정 변경",
        threshold: "마일스톤 변경",
        approver: "이벤트 오너",
      },
      {
        change_type: "예산 변경",
        threshold: "예비비 사용",
        approver: "PM + 재무",
      },
    ],
  };

  return {
    baseline_id: generateUUID(),
    event_id: validatedInput.event_id,
    baseline_date: today,
    version: "1.0",
    scope_baseline: scopeBaseline,
    schedule_baseline: scheduleBaseline,
    cost_baseline: costBaseline,
    performance_baseline: performanceBaseline,
    change_control: changeControl,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-013",
  taskName: "기준선 설정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.k",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
