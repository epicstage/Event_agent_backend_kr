/**
 * MKTADV-038: 워크플로우 최적화
 * CMP-IS Reference: 18.11.b - Marketing workflow optimization
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Workflow Optimizer for event campaigns.`;

export const InputSchema = z.object({
  event_id: z.string(),
  workflow_id: z.string().optional(),
  optimization_type: z.enum(["timing", "content", "segmentation", "channel", "overall"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  optimization_id: z.string(),
  event_id: z.string(),
  workflow_analysis: z.array(z.object({
    workflow_name: z.string(),
    current_performance: z.object({
      completion_rate: z.number(),
      conversion_rate: z.number(),
      avg_time_to_complete: z.string(),
      drop_off_points: z.array(z.object({
        step: z.string(),
        drop_off_rate: z.number(),
      })),
    }),
    bottlenecks: z.array(z.object({
      issue: z.string(),
      impact: z.string(),
      severity: z.enum(["high", "medium", "low"]),
    })),
    optimization_suggestions: z.array(z.object({
      suggestion: z.string(),
      expected_improvement: z.string(),
      implementation_effort: z.enum(["low", "medium", "high"]),
    })),
  })),
  timing_optimization: z.object({
    current_send_times: z.array(z.object({
      workflow: z.string(),
      current_time: z.string(),
      optimal_time: z.string(),
      expected_lift: z.number(),
    })),
    day_of_week_analysis: z.array(z.object({
      day: z.string(),
      avg_open_rate: z.number(),
      avg_click_rate: z.number(),
      recommendation: z.string(),
    })),
  }),
  ab_test_results: z.array(z.object({
    test_name: z.string(),
    variant_a: z.object({
      name: z.string(),
      performance: z.number(),
    }),
    variant_b: z.object({
      name: z.string(),
      performance: z.number(),
    }),
    winner: z.string(),
    confidence: z.number(),
    recommendation: z.string(),
  })),
  implementation_roadmap: z.array(z.object({
    phase: z.number(),
    action: z.string(),
    expected_impact: z.string(),
    timeline: z.string(),
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
    optimization_id: generateUUID(),
    event_id: validatedInput.event_id,
    workflow_analysis: [
      {
        workflow_name: "Welcome Series",
        current_performance: {
          completion_rate: 72,
          conversion_rate: 35,
          avg_time_to_complete: "7일",
          drop_off_points: [
            { step: "2단계: 프로그램 소개", drop_off_rate: 15 },
            { step: "4단계: 결제 유도", drop_off_rate: 25 },
          ],
        },
        bottlenecks: [
          { issue: "4단계 CTA 클릭률 낮음", impact: "전환 손실 25%", severity: "high" },
          { issue: "2단계 콘텐츠 참여 부족", impact: "관심도 하락", severity: "medium" },
        ],
        optimization_suggestions: [
          { suggestion: "4단계 CTA 버튼 색상/문구 A/B 테스트", expected_improvement: "+12% 클릭률", implementation_effort: "low" },
          { suggestion: "2단계에 동영상 콘텐츠 추가", expected_improvement: "+8% 참여율", implementation_effort: "medium" },
          { suggestion: "조건부 분기로 관심사별 콘텐츠", expected_improvement: "+15% 전환율", implementation_effort: "high" },
        ],
      },
      {
        workflow_name: "Abandoned Cart",
        current_performance: {
          completion_rate: 45,
          conversion_rate: 22,
          avg_time_to_complete: "3일",
          drop_off_points: [
            { step: "1단계: 리마인더", drop_off_rate: 35 },
            { step: "3단계: 최종 제안", drop_off_rate: 20 },
          ],
        },
        bottlenecks: [
          { issue: "1단계 발송 타이밍 지연", impact: "긴급성 감소", severity: "high" },
          { issue: "인센티브 부재", impact: "전환 동기 부족", severity: "medium" },
        ],
        optimization_suggestions: [
          { suggestion: "1단계 발송을 1시간 내로 단축", expected_improvement: "+18% 전환율", implementation_effort: "low" },
          { suggestion: "2단계에 한정 할인 추가", expected_improvement: "+25% 전환율", implementation_effort: "low" },
          { suggestion: "SMS 채널 추가", expected_improvement: "+10% 도달률", implementation_effort: "medium" },
        ],
      },
    ],
    timing_optimization: {
      current_send_times: [
        { workflow: "Welcome Series", current_time: "09:00", optimal_time: "10:30", expected_lift: 12 },
        { workflow: "Abandoned Cart", current_time: "즉시", optimal_time: "1시간 후", expected_lift: 8 },
        { workflow: "Pre-Event Countdown", current_time: "08:00", optimal_time: "09:00", expected_lift: 5 },
      ],
      day_of_week_analysis: [
        { day: "월요일", avg_open_rate: 22, avg_click_rate: 3.5, recommendation: "인지도 콘텐츠" },
        { day: "화요일", avg_open_rate: 28, avg_click_rate: 4.8, recommendation: "전환 캠페인 최적" },
        { day: "수요일", avg_open_rate: 26, avg_click_rate: 4.2, recommendation: "전환 캠페인" },
        { day: "목요일", avg_open_rate: 25, avg_click_rate: 4.0, recommendation: "교육 콘텐츠" },
        { day: "금요일", avg_open_rate: 20, avg_click_rate: 3.0, recommendation: "가벼운 콘텐츠" },
      ],
    },
    ab_test_results: [
      { test_name: "CTA 버튼 색상", variant_a: { name: "파란색", performance: 4.2 }, variant_b: { name: "주황색", performance: 5.8 }, winner: "variant_b", confidence: 95, recommendation: "주황색 적용" },
      { test_name: "제목줄 길이", variant_a: { name: "짧은 (25자)", performance: 28 }, variant_b: { name: "긴 (45자)", performance: 32 }, winner: "variant_b", confidence: 88, recommendation: "긴 제목줄 적용" },
      { test_name: "이미지 유형", variant_a: { name: "연사 사진", performance: 35 }, variant_b: { name: "이벤트 장면", performance: 42 }, winner: "variant_b", confidence: 92, recommendation: "이벤트 장면 적용" },
    ],
    implementation_roadmap: [
      { phase: 1, action: "즉시 적용 가능 항목: CTA 색상, 제목줄, 이미지", expected_impact: "+15% 전반적 성과", timeline: "1주" },
      { phase: 2, action: "발송 타이밍 최적화 적용", expected_impact: "+8% 오픈율", timeline: "2주" },
      { phase: 3, action: "조건부 콘텐츠 분기 구현", expected_impact: "+12% 전환율", timeline: "4주" },
      { phase: 4, action: "크로스채널 (SMS) 통합", expected_impact: "+10% 도달률", timeline: "6주" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-038",
  taskName: "워크플로우 최적화",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.11.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.11: Automation",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
