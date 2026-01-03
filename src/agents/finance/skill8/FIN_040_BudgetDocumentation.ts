/**
 * FIN-040: 예산 문서화
 *
 * CMP-IS Reference: 8.1.j
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Budget Documentation.
CMP-IS Standard: 8.1.j - Creating comprehensive budget documentation.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  budget_data: z.object({
    budget_id: z.string().uuid(),
    version: z.string(),
    total_budget: z.number(),
    categories: z.array(z.object({
      name: z.string(),
      allocated: z.number(),
      line_items: z.array(z.object({
        description: z.string(),
        amount: z.number(),
      })),
    })),
  }),
  revenue_data: z.object({
    total_projected: z.number(),
    sources: z.array(z.object({
      source: z.string(),
      amount: z.number(),
    })),
  }),
  assumptions: z.array(z.string()).optional(),
  approvals: z.array(z.object({
    approver: z.string(),
    date: z.string(),
    status: z.string(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  document_id: z.string().uuid(),
  event_id: z.string().uuid(),
  document_metadata: z.object({
    title: z.string(),
    version: z.string(),
    created_date: z.string(),
    author: z.string(),
    status: z.string(),
  }),
  executive_summary: z.object({
    overview: z.string(),
    key_figures: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
    highlights: z.array(z.string()),
  }),
  detailed_sections: z.array(z.object({
    section_title: z.string(),
    content: z.string(),
    tables: z.array(z.object({
      table_title: z.string(),
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    })).optional(),
  })),
  appendices: z.array(z.object({
    appendix_id: z.string(),
    title: z.string(),
    description: z.string(),
  })),
  revision_history: z.array(z.object({
    version: z.string(),
    date: z.string(),
    changes: z.string(),
    author: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const netPosition = validated.revenue_data.total_projected - validated.budget_data.total_budget;

  const categoryTable = {
    table_title: "카테고리별 예산 배분",
    headers: ["카테고리", "배정액", "비율"],
    rows: validated.budget_data.categories.map(c => [
      c.name,
      `${c.allocated.toLocaleString()}원`,
      `${Math.round((c.allocated / validated.budget_data.total_budget) * 100)}%`,
    ]),
  };

  const revenueTable = {
    table_title: "수익원별 예상 수익",
    headers: ["수익원", "예상액", "비율"],
    rows: validated.revenue_data.sources.map(s => [
      s.source,
      `${s.amount.toLocaleString()}원`,
      `${Math.round((s.amount / validated.revenue_data.total_projected) * 100)}%`,
    ]),
  };

  const output: Output = {
    document_id: generateUUID(),
    event_id: validated.event_id,
    document_metadata: {
      title: "이벤트 예산 문서",
      version: validated.budget_data.version,
      created_date: nowISO(),
      author: "Finance AI Agent",
      status: "Draft",
    },
    executive_summary: {
      overview: `본 문서는 이벤트 예산 ${validated.budget_data.total_budget.toLocaleString()}원과 예상 수익 ${validated.revenue_data.total_projected.toLocaleString()}원에 대한 상세 내역을 담고 있습니다. 예상 ${netPosition >= 0 ? "순이익" : "순손실"}은 ${Math.abs(netPosition).toLocaleString()}원입니다.`,
      key_figures: [
        { label: "총 예산", value: `${validated.budget_data.total_budget.toLocaleString()}원` },
        { label: "예상 수익", value: `${validated.revenue_data.total_projected.toLocaleString()}원` },
        { label: "순이익/손실", value: `${netPosition >= 0 ? "+" : ""}${netPosition.toLocaleString()}원` },
        { label: "비용 카테고리 수", value: `${validated.budget_data.categories.length}개` },
        { label: "수익원 수", value: `${validated.revenue_data.sources.length}개` },
      ],
      highlights: [
        `최대 비용 항목: ${validated.budget_data.categories.sort((a, b) => b.allocated - a.allocated)[0]?.name || "N/A"}`,
        `최대 수익원: ${validated.revenue_data.sources.sort((a, b) => b.amount - a.amount)[0]?.source || "N/A"}`,
        `예산 버전: ${validated.budget_data.version}`,
      ],
    },
    detailed_sections: [
      {
        section_title: "1. 예산 개요",
        content: "본 섹션에서는 이벤트 예산의 전체 구조와 주요 비용 항목을 설명합니다.",
        tables: [categoryTable],
      },
      {
        section_title: "2. 수익 계획",
        content: "예상 수익원과 각 항목별 금액을 상세히 기술합니다.",
        tables: [revenueTable],
      },
      {
        section_title: "3. 주요 가정",
        content: validated.assumptions?.join("\n") || "별도 가정 사항 없음",
      },
      {
        section_title: "4. 승인 이력",
        content: validated.approvals?.map(a =>
          `${a.date}: ${a.approver} - ${a.status}`
        ).join("\n") || "승인 대기 중",
      },
    ],
    appendices: [
      { appendix_id: "A", title: "상세 라인 아이템", description: "카테고리별 세부 항목 목록" },
      { appendix_id: "B", title: "공급사 견적서", description: "주요 공급사 견적 첨부" },
      { appendix_id: "C", title: "현금흐름 예측", description: "월별 현금흐름 상세" },
      { appendix_id: "D", title: "리스크 분석", description: "예산 관련 리스크 및 대응 방안" },
    ],
    revision_history: [
      {
        version: validated.budget_data.version,
        date: nowISO(),
        changes: "초기 버전 생성",
        author: "System",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-040",
  taskName: "예산 문서화",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.1.j",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
