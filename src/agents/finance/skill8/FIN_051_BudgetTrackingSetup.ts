/**
 * FIN-051: 예산 추적 설정
 *
 * CMP-IS Reference: 8.3.a
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Budget Tracking Setup.
CMP-IS Standard: 8.3.a - Setting up budget tracking systems and processes.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  budget_structure: z.object({
    categories: z.array(z.object({
      code: z.string(),
      name: z.string(),
      allocated: z.number(),
    })),
    total_budget: z.number(),
    contingency: z.number(),
  }),
  organizational_systems: z.object({
    accounting_software: z.string().optional(),
    expense_management_tool: z.string().optional(),
    approval_workflow: z.boolean().default(true),
  }).optional(),
  reporting_requirements: z.object({
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
    stakeholders: z.array(z.string()),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  setup_id: z.string().uuid(),
  event_id: z.string().uuid(),
  tracking_framework: z.object({
    tracking_dimensions: z.array(z.object({
      dimension: z.string(),
      description: z.string(),
      data_source: z.string(),
    })),
    kpis: z.array(z.object({
      kpi_name: z.string(),
      formula: z.string(),
      target: z.string(),
      alert_threshold: z.string(),
    })),
  }),
  expense_workflow: z.object({
    submission_process: z.array(z.string()),
    approval_matrix: z.array(z.object({
      amount_range: z.string(),
      approver: z.string(),
      sla_hours: z.number().int(),
    })),
    documentation_requirements: z.array(z.string()),
  }),
  reporting_setup: z.object({
    report_types: z.array(z.object({
      name: z.string(),
      frequency: z.string(),
      recipients: z.array(z.string()),
      key_metrics: z.array(z.string()),
    })),
    dashboard_views: z.array(z.object({
      view_name: z.string(),
      audience: z.string(),
      components: z.array(z.string()),
    })),
  }),
  tools_and_templates: z.array(z.object({
    tool_name: z.string(),
    purpose: z.string(),
    access_info: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const output: Output = {
    setup_id: generateUUID(),
    event_id: validated.event_id,
    tracking_framework: {
      tracking_dimensions: [
        { dimension: "카테고리별", description: "예산 카테고리 기준 추적", data_source: "회계 시스템" },
        { dimension: "공급사별", description: "공급사/벤더 기준 추적", data_source: "구매 시스템" },
        { dimension: "시간별", description: "월별/주별 집행 추이", data_source: "자동 집계" },
        { dimension: "승인 상태별", description: "승인/대기/반려 현황", data_source: "워크플로우" },
      ],
      kpis: [
        {
          kpi_name: "예산 소진율",
          formula: "(실제 지출 / 총 예산) × 100",
          target: "이벤트 D-day 기준 95%",
          alert_threshold: "일정 대비 +15% 초과 시",
        },
        {
          kpi_name: "카테고리별 variance",
          formula: "(실제 - 예산) / 예산 × 100",
          target: "±10% 이내",
          alert_threshold: "±15% 초과 시",
        },
        {
          kpi_name: "예비비 사용률",
          formula: "(예비비 사용액 / 예비비 총액) × 100",
          target: "50% 이하",
          alert_threshold: "75% 초과 시",
        },
        {
          kpi_name: "미결제 금액",
          formula: "발주액 - 결제완료액",
          target: "D-7 기준 10% 이하",
          alert_threshold: "20% 초과 시",
        },
      ],
    },
    expense_workflow: {
      submission_process: [
        "비용 발생 시 즉시 시스템 입력",
        "영수증/인보이스 첨부 필수",
        "카테고리 및 비용 코드 지정",
        "승인자 자동 라우팅",
        "승인 후 회계 시스템 연동",
      ],
      approval_matrix: [
        { amount_range: "~ $500", approver: "팀장", sla_hours: 24 },
        { amount_range: "$500 ~ $2,000", approver: "디렉터", sla_hours: 48 },
        { amount_range: "$2,000 ~ $10,000", approver: "VP", sla_hours: 72 },
        { amount_range: "$10,000 ~", approver: "CFO", sla_hours: 96 },
      ],
      documentation_requirements: [
        "세금계산서 또는 영수증 원본",
        "구매 요청서 (PO)",
        "납품 확인서 (해당 시)",
        "계약서 사본 (신규 거래처)",
      ],
    },
    reporting_setup: {
      report_types: [
        {
          name: "일일 스냅샷",
          frequency: "매일 09:00",
          recipients: ["프로젝트 매니저", "재무 담당자"],
          key_metrics: ["오늘 지출", "누적 지출", "잔여 예산", "긴급 승인 건"],
        },
        {
          name: "주간 예산 리뷰",
          frequency: "매주 월요일",
          recipients: validated.reporting_requirements.stakeholders,
          key_metrics: ["주간 지출 추이", "카테고리별 현황", "예측 vs 실제", "리스크 항목"],
        },
        {
          name: "경영진 월간 보고",
          frequency: "매월 1일",
          recipients: ["CEO", "CFO", "이벤트 디렉터"],
          key_metrics: ["전체 예산 현황", "주요 variance", "예비비 현황", "예측"],
        },
      ],
      dashboard_views: [
        {
          view_name: "Executive Dashboard",
          audience: "경영진",
          components: ["총괄 게이지", "트렌드 차트", "주요 KPI 카드"],
        },
        {
          view_name: "Operations Dashboard",
          audience: "운영팀",
          components: ["카테고리별 상세", "승인 대기 건", "일정별 지출"],
        },
        {
          view_name: "Finance Dashboard",
          audience: "재무팀",
          components: ["현금흐름", "미결제 현황", "공급사별 분석"],
        },
      ],
    },
    tools_and_templates: [
      {
        tool_name: "예산 추적 스프레드시트",
        purpose: "실시간 예산 현황 관리",
        access_info: "[구글 시트 링크]",
      },
      {
        tool_name: "비용 청구 양식",
        purpose: "비용 청구 표준화",
        access_info: "[양식 다운로드 링크]",
      },
      {
        tool_name: "승인 워크플로우 시스템",
        purpose: "전자 승인 및 추적",
        access_info: validated.organizational_systems?.expense_management_tool || "이메일 승인",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-051",
  taskName: "예산 추적 설정",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.3.a",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.3: Monitor and Revise Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
