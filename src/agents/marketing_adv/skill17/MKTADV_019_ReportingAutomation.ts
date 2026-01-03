/**
 * MKTADV-019: 리포팅 자동화
 * CMP-IS Reference: 17.11.b - Automated marketing reporting
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Report Automation Specialist for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  report_type: z.enum(["daily", "weekly", "monthly", "campaign_end", "custom"]),
  recipients: z.array(z.string()).optional(),
  metrics_to_include: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  report_metadata: z.object({
    report_type: z.string(),
    generated_at: z.string(),
    period_covered: z.object({
      start: z.string(),
      end: z.string(),
    }),
    recipients: z.array(z.string()),
  }),
  executive_summary: z.object({
    headline: z.string(),
    key_achievements: z.array(z.string()),
    areas_of_concern: z.array(z.string()),
    next_period_focus: z.array(z.string()),
  }),
  metrics_snapshot: z.array(z.object({
    category: z.string(),
    metrics: z.array(z.object({
      name: z.string(),
      value: z.string(),
      vs_target: z.string(),
      vs_previous: z.string(),
    })),
  })),
  visualizations: z.array(z.object({
    chart_type: z.string(),
    title: z.string(),
    data_summary: z.string(),
  })),
  action_items: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    owner: z.string(),
    due_date: z.string(),
  })),
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

  const now = new Date();
  const periodEnd = now.toISOString().split("T")[0];
  const periodStart = new Date(now.setDate(now.getDate() - 7)).toISOString().split("T")[0];

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    report_metadata: {
      report_type: validatedInput.report_type,
      generated_at: new Date().toISOString(),
      period_covered: {
        start: periodStart,
        end: periodEnd,
      },
      recipients: validatedInput.recipients || ["marketing@company.com", "management@company.com"],
    },
    executive_summary: {
      headline: "등록률 12% 증가, 목표 달성률 85.6%",
      key_achievements: [
        "이메일 캠페인 오픈율 32% 달성 (목표 25%)",
        "검색 광고 CPA 15% 개선",
        "소셜 미디어 참여도 2배 증가",
      ],
      areas_of_concern: [
        "등록 완료율 57.8%로 하락 (전주 대비 -5%)",
        "모바일 전환율 데스크톱 대비 40% 낮음",
      ],
      next_period_focus: [
        "등록 폼 최적화로 완료율 개선",
        "모바일 UX 개선 캠페인 시작",
        "D-14 리마인더 캠페인 실행",
      ],
    },
    metrics_snapshot: [
      {
        category: "등록 성과",
        metrics: [
          { name: "신규 등록", value: "145명", vs_target: "+8%", vs_previous: "+12%" },
          { name: "누적 등록", value: "856명", vs_target: "-14.4%", vs_previous: "+18%" },
          { name: "전환율", value: "4.2%", vs_target: "-16%", vs_previous: "+0.5%p" },
        ],
      },
      {
        category: "마케팅 효율",
        metrics: [
          { name: "CPA", value: "$45", vs_target: "+10%", vs_previous: "-10%" },
          { name: "ROI", value: "3.8x", vs_target: "-5%", vs_previous: "+8%" },
          { name: "광고 지출", value: "$12,500", vs_target: "100%", vs_previous: "+5%" },
        ],
      },
      {
        category: "채널 성과",
        metrics: [
          { name: "이메일 오픈율", value: "32%", vs_target: "+28%", vs_previous: "+4%p" },
          { name: "검색 CTR", value: "3.8%", vs_target: "+15%", vs_previous: "+0.3%p" },
          { name: "소셜 참여율", value: "5.2%", vs_target: "+30%", vs_previous: "+1.2%p" },
        ],
      },
    ],
    visualizations: [
      { chart_type: "line", title: "일별 등록 추이", data_summary: "지난 7일간 꾸준한 상승세, 주말 감소" },
      { chart_type: "bar", title: "채널별 전환 비교", data_summary: "이메일 > 검색 > 소셜 > 오가닉 순" },
      { chart_type: "funnel", title: "등록 퍼널", data_summary: "폼 완료 단계에서 42.2% 이탈" },
      { chart_type: "pie", title: "예산 배분 현황", data_summary: "검색 35%, 소셜 30%, 이메일 20%, 기타 15%" },
    ],
    action_items: [
      { priority: "high", action: "등록 폼 필수 필드 축소 (12개 → 6개)", owner: "UX팀", due_date: "D+2" },
      { priority: "high", action: "모바일 등록 페이지 A/B 테스트 시작", owner: "마케팅팀", due_date: "D+3" },
      { priority: "medium", action: "이메일 예산 20% 증액 요청", owner: "마케팅팀", due_date: "D+5" },
      { priority: "low", action: "인플루언서 협업 검토", owner: "PR팀", due_date: "D+7" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-019",
  taskName: "리포팅 자동화",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.11.b",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.11: Dashboard & Reporting",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
