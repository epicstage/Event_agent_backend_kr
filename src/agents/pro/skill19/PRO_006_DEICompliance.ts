/**
 * PRO-006: 다양성/형평성/포용성(DEI) 준수
 * CMP-IS Reference: 19.6.a - DEI compliance management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert DEI (Diversity, Equity, Inclusion) Compliance Specialist for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  assessment_scope: z.array(z.enum(["speakers", "vendors", "content", "accessibility", "marketing", "staff"])).optional(),
  reporting_requirements: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  dei_report_id: z.string(),
  event_id: z.string(),
  dei_scorecard: z.object({
    overall_score: z.number(),
    diversity_score: z.number(),
    equity_score: z.number(),
    inclusion_score: z.number(),
    rating: z.enum(["excellent", "good", "needs_improvement", "poor"]),
  }),
  representation_metrics: z.array(z.object({
    category: z.string(),
    metric_name: z.string(),
    current_value: z.number(),
    target_value: z.number(),
    gap: z.number(),
    trend: z.enum(["improving", "stable", "declining"]),
  })),
  accessibility_assessment: z.object({
    physical_accessibility: z.number(),
    digital_accessibility: z.number(),
    cognitive_accessibility: z.number(),
    accommodations_available: z.array(z.string()),
    gaps_identified: z.array(z.string()),
  }),
  inclusive_practices: z.array(z.object({
    practice: z.string(),
    category: z.string(),
    implementation_status: z.enum(["implemented", "partial", "planned", "not_started"]),
    impact_level: z.enum(["high", "medium", "low"]),
  })),
  action_items: z.array(z.object({
    action: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    responsible_party: z.string(),
    deadline: z.string(),
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

  return {
    dei_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    dei_scorecard: {
      overall_score: 76,
      diversity_score: 72,
      equity_score: 78,
      inclusion_score: 80,
      rating: "good",
    },
    representation_metrics: [
      { category: "연사", metric_name: "여성 비율", current_value: 42, target_value: 50, gap: -8, trend: "improving" },
      { category: "연사", metric_name: "소수 인종/민족", current_value: 25, target_value: 30, gap: -5, trend: "improving" },
      { category: "벤더", metric_name: "소수자 소유 기업", current_value: 18, target_value: 25, gap: -7, trend: "stable" },
      { category: "스태프", metric_name: "장애인 고용", current_value: 5, target_value: 8, gap: -3, trend: "improving" },
      { category: "콘텐츠", metric_name: "DEI 관련 세션", current_value: 15, target_value: 20, gap: -5, trend: "improving" },
    ],
    accessibility_assessment: {
      physical_accessibility: 85,
      digital_accessibility: 72,
      cognitive_accessibility: 68,
      accommodations_available: [
        "휠체어 접근성",
        "수어 통역",
        "보청 시스템",
        "점자 자료",
        "조용한 휴식 공간",
        "자막 서비스",
      ],
      gaps_identified: [
        "웹사이트 WCAG 2.1 AA 미달",
        "일부 워크숍 공간 휠체어 접근 제한",
        "쉬운 읽기 자료 부족",
      ],
    },
    inclusive_practices: [
      { practice: "성중립 화장실 제공", category: "시설", implementation_status: "implemented", impact_level: "high" },
      { practice: "대명사 명찰 옵션", category: "등록", implementation_status: "implemented", impact_level: "medium" },
      { practice: "다양한 식이 옵션", category: "F&B", implementation_status: "implemented", impact_level: "high" },
      { practice: "조용한 네트워킹 시간", category: "프로그램", implementation_status: "partial", impact_level: "medium" },
      { practice: "무의식적 편견 교육", category: "스태프", implementation_status: "planned", impact_level: "high" },
    ],
    action_items: [
      { action: "웹사이트 접근성 개선 (WCAG 2.1 AA)", priority: "critical", responsible_party: "IT팀", deadline: "2025-02-15" },
      { action: "소수자 소유 기업 벤더 발굴", priority: "high", responsible_party: "조달팀", deadline: "2025-03-01" },
      { action: "전 직원 무의식적 편견 교육 실시", priority: "high", responsible_party: "HR팀", deadline: "2025-02-28" },
      { action: "워크숍 공간 접근성 개선", priority: "medium", responsible_party: "시설팀", deadline: "2025-03-15" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-006",
  taskName: "다양성/형평성/포용성(DEI) 준수",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.6.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.6: DEI Compliance",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
