/**
 * STR-043: KPI 설계
 *
 * CMP-IS Reference: Domain A - Strategic Planning (KPI Design)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert KPI Design Agent for event planning.

Your expertise includes:
- Key Performance Indicator development
- SMART goal formulation
- Leading vs lagging indicator design
- Performance measurement systems

CMP-IS Standard: Domain A - Strategic Planning (KPI Design)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  strategic_objectives: z.array(z.object({
    objective_id: z.string(),
    objective: z.string(),
    perspective: z.string(),
  })),
  measurement_constraints: z.object({
    data_availability: z.enum(["limited", "moderate", "comprehensive"]).optional(),
    reporting_frequency: z.enum(["daily", "weekly", "monthly", "quarterly"]).optional(),
    resource_constraints: z.array(z.string()).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  kpi_design_id: z.string().uuid(),
  event_id: z.string().uuid(),
  kpi_framework: z.array(z.object({
    kpi_id: z.string(),
    objective_id: z.string(),
    kpi_name: z.string(),
    kpi_type: z.enum(["leading", "lagging"]),
    definition: z.string(),
    formula: z.string(),
    unit: z.string(),
    baseline: z.string(),
    target: z.object({
      value: z.string(),
      rationale: z.string(),
    }),
    thresholds: z.object({
      red: z.string(),
      yellow: z.string(),
      green: z.string(),
    }),
    data_source: z.string(),
    measurement_frequency: z.string(),
    responsible: z.string(),
    smart_check: z.object({
      specific: z.boolean(),
      measurable: z.boolean(),
      achievable: z.boolean(),
      relevant: z.boolean(),
      time_bound: z.boolean(),
    }),
  })),
  kpi_relationships: z.array(z.object({
    leading_kpi: z.string(),
    lagging_kpi: z.string(),
    expected_lag_time: z.string(),
    correlation_strength: z.enum(["weak", "moderate", "strong"]),
  })),
  dashboard_design: z.object({
    executive_view: z.array(z.object({
      kpi_id: z.string(),
      visualization: z.string(),
    })),
    operational_view: z.array(z.object({
      kpi_id: z.string(),
      visualization: z.string(),
    })),
  }),
  data_collection_plan: z.array(z.object({
    kpi_id: z.string(),
    data_source: z.string(),
    collection_method: z.string(),
    frequency: z.string(),
    responsible: z.string(),
    quality_checks: z.array(z.string()),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-043",
  taskName: "KPI Design",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "전략 목표에 대한 KPI를 설계하고 측정 체계를 수립합니다.",
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

  const { strategic_objectives, measurement_constraints } = validated;
  const frequency = measurement_constraints?.reporting_frequency || "monthly";

  const kpis = strategic_objectives.flatMap((obj, idx) => {
    const baseKpiId = `KPI-${String(idx * 2 + 1).padStart(3, "0")}`;
    const leadingKpiId = `KPI-${String(idx * 2 + 2).padStart(3, "0")}`;

    const laggingKpi = {
      kpi_id: baseKpiId,
      objective_id: obj.objective_id,
      kpi_name: `${obj.objective} 달성률`,
      kpi_type: "lagging" as const,
      definition: `${obj.objective} 목표 대비 실제 달성 비율`,
      formula: "(실적 / 목표) × 100",
      unit: "%",
      baseline: "0%",
      target: {
        value: "100%",
        rationale: "목표 완전 달성",
      },
      thresholds: {
        red: "70% 미만",
        yellow: "70-90%",
        green: "90% 이상",
      },
      data_source: "성과 관리 시스템",
      measurement_frequency: frequency === "daily" ? "일간" : frequency === "weekly" ? "주간" : frequency === "monthly" ? "월간" : "분기",
      responsible: "성과 관리팀",
      smart_check: {
        specific: true,
        measurable: true,
        achievable: true,
        relevant: true,
        time_bound: true,
      },
    };

    const leadingKpi = {
      kpi_id: leadingKpiId,
      objective_id: obj.objective_id,
      kpi_name: `${obj.objective} 진행률`,
      kpi_type: "leading" as const,
      definition: `${obj.objective} 달성을 위한 핵심 활동 진행률`,
      formula: "(완료 활동 / 계획 활동) × 100",
      unit: "%",
      baseline: "0%",
      target: {
        value: "100%",
        rationale: "계획 활동 완전 이행",
      },
      thresholds: {
        red: "50% 미만",
        yellow: "50-80%",
        green: "80% 이상",
      },
      data_source: "프로젝트 관리 시스템",
      measurement_frequency: frequency === "daily" ? "일간" : "주간",
      responsible: "프로젝트 관리팀",
      smart_check: {
        specific: true,
        measurable: true,
        achievable: true,
        relevant: true,
        time_bound: true,
      },
    };

    return [laggingKpi, leadingKpi];
  });

  const relationships = strategic_objectives.map((_, idx) => ({
    leading_kpi: `KPI-${String(idx * 2 + 2).padStart(3, "0")}`,
    lagging_kpi: `KPI-${String(idx * 2 + 1).padStart(3, "0")}`,
    expected_lag_time: "1-2주",
    correlation_strength: "strong" as const,
  }));

  return {
    kpi_design_id: generateUUID(),
    event_id: validated.event_id,
    kpi_framework: kpis,
    kpi_relationships: relationships,
    dashboard_design: {
      executive_view: kpis.filter(k => k.kpi_type === "lagging").slice(0, 5).map(k => ({
        kpi_id: k.kpi_id,
        visualization: "게이지 차트",
      })),
      operational_view: kpis.filter(k => k.kpi_type === "leading").map(k => ({
        kpi_id: k.kpi_id,
        visualization: "추세선 차트",
      })),
    },
    data_collection_plan: kpis.map(k => ({
      kpi_id: k.kpi_id,
      data_source: k.data_source,
      collection_method: "시스템 자동 수집",
      frequency: k.measurement_frequency,
      responsible: k.responsible,
      quality_checks: ["데이터 완전성 확인", "이상치 검토", "정합성 검증"],
    })),
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
