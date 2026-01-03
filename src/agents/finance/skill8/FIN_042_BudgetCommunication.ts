/**
 * FIN-042: 예산 커뮤니케이션
 *
 * CMP-IS Reference: 8.1.l
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Budget Communication.
CMP-IS Standard: 8.1.l - Communicating budget information to stakeholders.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  budget_summary: z.object({
    total_budget: z.number(),
    total_revenue: z.number(),
    key_categories: z.array(z.object({
      name: z.string(),
      amount: z.number(),
    })),
    status: z.enum(["draft", "pending_approval", "approved", "in_execution"]),
  }),
  stakeholders: z.array(z.object({
    role: z.string(),
    name: z.string(),
    information_needs: z.array(z.string()),
    preferred_format: z.enum(["detailed", "summary", "visual"]),
  })),
  key_updates: z.array(z.object({
    update: z.string(),
    impact: z.string(),
    action_required: z.boolean(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  communication_id: z.string().uuid(),
  event_id: z.string().uuid(),
  communication_plan: z.object({
    frequency: z.string(),
    channels: z.array(z.string()),
    escalation_path: z.array(z.string()),
  }),
  stakeholder_packages: z.array(z.object({
    stakeholder_role: z.string(),
    package_type: z.string(),
    key_messages: z.array(z.string()),
    visualizations: z.array(z.string()),
    detail_level: z.string(),
    delivery_format: z.string(),
  })),
  executive_briefing: z.object({
    headline: z.string(),
    status_indicator: z.enum(["green", "yellow", "red"]),
    key_metrics: z.array(z.object({
      metric: z.string(),
      value: z.string(),
      trend: z.enum(["up", "down", "stable"]),
    })),
    action_items: z.array(z.string()),
  }),
  team_update: z.object({
    summary: z.string(),
    category_status: z.array(z.object({
      category: z.string(),
      status: z.enum(["on_track", "attention", "at_risk"]),
      note: z.string(),
    })),
    upcoming_deadlines: z.array(z.object({
      deadline: z.string(),
      item: z.string(),
    })),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const netPosition = validated.budget_summary.total_revenue - validated.budget_summary.total_budget;
  const statusIndicator = netPosition > 0 ? "green" : netPosition > -10000 ? "yellow" : "red";

  const stakeholderPackages = validated.stakeholders.map(s => ({
    stakeholder_role: s.role,
    package_type: s.preferred_format === "detailed" ? "상세 보고서" :
      s.preferred_format === "summary" ? "요약 보고서" : "대시보드",
    key_messages: [
      `총 예산: ${validated.budget_summary.total_budget.toLocaleString()}원`,
      `현재 상태: ${validated.budget_summary.status}`,
      ...s.information_needs.slice(0, 2),
    ],
    visualizations: s.preferred_format === "visual" ? [
      "예산 vs 실제 차트",
      "카테고리별 파이 차트",
      "추세 라인 그래프",
    ] : ["요약 테이블"],
    detail_level: s.preferred_format === "detailed" ? "라인 아이템 수준" :
      s.preferred_format === "summary" ? "카테고리 수준" : "총계 수준",
    delivery_format: s.preferred_format === "detailed" ? "Excel + PDF" :
      s.preferred_format === "visual" ? "대시보드 링크" : "이메일 요약",
  }));

  const output: Output = {
    communication_id: generateUUID(),
    event_id: validated.event_id,
    communication_plan: {
      frequency: "주간 업데이트 (이벤트 2주 전부터 일일)",
      channels: ["이메일 보고서", "대시보드", "주간 회의", "Slack 채널"],
      escalation_path: ["팀장", "디렉터", "VP", "CFO"],
    },
    stakeholder_packages: stakeholderPackages,
    executive_briefing: {
      headline: `이벤트 예산 ${validated.budget_summary.status === "approved" ? "승인됨" : "검토 중"} - ${statusIndicator === "green" ? "정상 진행" : statusIndicator === "yellow" ? "주의 필요" : "리스크 있음"}`,
      status_indicator: statusIndicator,
      key_metrics: [
        { metric: "총 예산", value: `${validated.budget_summary.total_budget.toLocaleString()}원`, trend: "stable" },
        { metric: "예상 수익", value: `${validated.budget_summary.total_revenue.toLocaleString()}원`, trend: "up" },
        { metric: "순이익", value: `${netPosition >= 0 ? "+" : ""}${netPosition.toLocaleString()}원`, trend: netPosition > 0 ? "up" : "down" },
      ],
      action_items: validated.key_updates
        ?.filter(u => u.action_required)
        .map(u => u.update) || ["현재 조치 필요 사항 없음"],
    },
    team_update: {
      summary: `예산 현황 업데이트: 총 ${validated.budget_summary.key_categories.length}개 카테고리, ${validated.budget_summary.status} 상태`,
      category_status: validated.budget_summary.key_categories.map((c, i) => ({
        category: c.name,
        status: i % 3 === 0 ? "on_track" : i % 3 === 1 ? "attention" : "on_track",
        note: i % 3 === 1 ? "예산 소진율 높음, 모니터링 중" : "계획대로 진행 중",
      })) as { category: string; status: "on_track" | "attention" | "at_risk"; note: string }[],
      upcoming_deadlines: [
        { deadline: "D-30", item: "공급사 최종 결제" },
        { deadline: "D-14", item: "스폰서십 인보이스 발행" },
        { deadline: "D-7", item: "현장 비용 정산" },
      ],
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-042",
  taskName: "예산 커뮤니케이션",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.1.l",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
