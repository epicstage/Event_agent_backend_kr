/**
 * MKT-025: 랜딩페이지 최적화
 * CMP-IS Reference: 8.2.a - Landing page optimization and conversion improvement
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Landing Page Optimization Agent.
CMP-IS Standard: 8.2.a - Optimizing landing pages for maximum conversion rates.`;

export const InputSchema = z.object({
  event_id: z.string(),
  landing_page_url: z.string(),
  current_conversion_rate: z.number().optional(),
  target_conversion_rate: z.number().optional(),
  traffic_source: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  optimization_id: z.string(),
  event_id: z.string(),
  current_metrics: z.object({
    visitors: z.number(),
    conversions: z.number(),
    conversion_rate: z.number(),
    bounce_rate: z.number(),
    avg_time_on_page: z.number(),
  }),
  optimization_recommendations: z.array(z.object({
    element: z.string(),
    current_state: z.string(),
    recommendation: z.string(),
    expected_impact: z.string(),
    priority: z.string(),
    implementation_effort: z.string(),
  })),
  ab_tests_proposed: z.array(z.object({
    test_name: z.string(),
    hypothesis: z.string(),
    control: z.string(),
    variant: z.string(),
    success_metric: z.string(),
    required_sample_size: z.number(),
  })),
  ux_improvements: z.array(z.object({
    area: z.string(),
    issue: z.string(),
    solution: z.string(),
  })),
  technical_optimizations: z.array(z.object({
    aspect: z.string(),
    current_score: z.number(),
    target_score: z.number(),
    action: z.string(),
  })),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  return {
    optimization_id: generateUUID(),
    event_id: validatedInput.event_id,
    current_metrics: {
      visitors: 5000,
      conversions: 150,
      conversion_rate: validatedInput.current_conversion_rate || 3.0,
      bounce_rate: 45,
      avg_time_on_page: 120,
    },
    optimization_recommendations: [
      { element: "헤드라인", current_state: "일반적인 이벤트 소개", recommendation: "핵심 가치 제안 강조", expected_impact: "전환율 +15%", priority: "high", implementation_effort: "low" },
      { element: "CTA 버튼", current_state: "하단 1개", recommendation: "Above-the-fold에 추가 CTA", expected_impact: "전환율 +10%", priority: "high", implementation_effort: "low" },
      { element: "사회적 증거", current_state: "없음", recommendation: "참석자 후기, 기업 로고 추가", expected_impact: "신뢰도 향상", priority: "medium", implementation_effort: "medium" },
      { element: "가격 표시", current_state: "별도 페이지", recommendation: "가격 및 혜택 즉시 노출", expected_impact: "이탈률 -20%", priority: "high", implementation_effort: "low" },
      { element: "폼 필드", current_state: "8개 필드", recommendation: "필수 4개로 축소", expected_impact: "폼 완료율 +25%", priority: "high", implementation_effort: "medium" },
    ],
    ab_tests_proposed: [
      { test_name: "헤드라인 테스트", hypothesis: "혜택 중심 헤드라인이 전환율 향상", control: "이벤트명 강조", variant: "참석자 혜택 강조", success_metric: "등록 전환율", required_sample_size: 1000 },
      { test_name: "CTA 색상 테스트", hypothesis: "대비되는 색상이 클릭률 향상", control: "브랜드 색상", variant: "고대비 오렌지", success_metric: "CTA 클릭률", required_sample_size: 2000 },
      { test_name: "폼 길이 테스트", hypothesis: "짧은 폼이 완료율 향상", control: "8개 필드", variant: "4개 필드", success_metric: "폼 완료율", required_sample_size: 1500 },
    ],
    ux_improvements: [
      { area: "모바일 경험", issue: "버튼 터치 영역 작음", solution: "최소 44px 터치 타겟" },
      { area: "스크롤 유도", issue: "Above-the-fold 정보 과다", solution: "핵심 정보만 배치, 스크롤 인디케이터 추가" },
      { area: "로딩 상태", issue: "폼 제출 시 피드백 없음", solution: "로딩 스피너 및 성공 메시지" },
    ],
    technical_optimizations: [
      { aspect: "페이지 속도 (Mobile)", current_score: 65, target_score: 90, action: "이미지 최적화, 코드 분할" },
      { aspect: "Core Web Vitals - LCP", current_score: 3.2, target_score: 2.5, action: "히어로 이미지 최적화" },
      { aspect: "Core Web Vitals - CLS", current_score: 0.15, target_score: 0.1, action: "이미지 크기 명시" },
      { aspect: "접근성 점수", current_score: 78, target_score: 95, action: "ARIA 레이블, 색상 대비 개선" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-025";
export const taskName = "랜딩페이지 최적화";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.2.a";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.2: Performance Optimization";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
