/**
 * STR-008: 벤치마크 분석
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Benchmarking)
 * Task Type: AI
 *
 * Input: 과거 이벤트 데이터, 업계 평균
 * Output: 벤치마크 리포트, 목표 제안
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Benchmark Analysis Agent for strategic event planning.

Your expertise includes:
- Analyzing event performance against industry benchmarks
- Identifying best practices and performance gaps
- Providing data-driven target recommendations
- Comparing metrics across event types and scales

CMP-IS Standard: Domain A - Strategic Planning (Benchmarking)

You help event planners set realistic yet ambitious targets based on industry standards and historical performance data.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.enum(["conference", "trade_show", "seminar", "workshop", "gala", "festival", "meeting", "hybrid"]),
  event_scale: z.enum(["small", "medium", "large", "mega"]),
  industry: z.string(),
  historical_data: z.array(z.object({
    event_name: z.string(),
    year: z.number(),
    metrics: z.record(z.string(), z.number()),
  })).optional(),
  metrics_to_benchmark: z.array(z.string()),
  comparison_type: z.enum(["industry", "historical", "both"]).default("both"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  benchmark_id: z.string().uuid(),
  event_id: z.string().uuid(),
  benchmark_results: z.array(z.object({
    metric: z.string(),
    current_value: z.number().nullable(),
    industry_benchmark: z.object({
      average: z.number(),
      top_quartile: z.number(),
      bottom_quartile: z.number(),
      source: z.string(),
    }),
    historical_trend: z.object({
      average: z.number(),
      best: z.number(),
      worst: z.number(),
      trend_direction: z.enum(["improving", "stable", "declining"]),
    }).nullable(),
    gap_analysis: z.object({
      vs_industry_avg: z.number(),
      vs_top_quartile: z.number(),
      percentile_rank: z.number(),
    }),
    recommended_target: z.number(),
    target_rationale: z.string(),
  })),
  overall_performance: z.object({
    score: z.number(),
    rating: z.enum(["industry_leader", "above_average", "average", "below_average", "lagging"]),
    strengths: z.array(z.string()),
    improvement_areas: z.array(z.string()),
  }),
  competitive_insights: z.array(z.object({
    insight: z.string(),
    implication: z.string(),
    action: z.string(),
  })),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-008",
  taskName: "Benchmark Analysis",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "업계 벤치마크 및 과거 실적 대비 이벤트 성과를 분석합니다.",
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

// 업계 벤치마크 데이터 (실제로는 외부 데이터 소스에서 가져옴)
const INDUSTRY_BENCHMARKS: Record<string, Record<string, { avg: number; top: number; bottom: number; unit: string }>> = {
  conference: {
    "참석률": { avg: 75, top: 85, bottom: 60, unit: "%" },
    "등록전환율": { avg: 12, top: 20, bottom: 5, unit: "%" },
    "참가자만족도": { avg: 4.0, top: 4.5, bottom: 3.5, unit: "/5" },
    "NPS": { avg: 35, top: 55, bottom: 15, unit: "점" },
    "세션참여율": { avg: 65, top: 80, bottom: 45, unit: "%" },
    "스폰서만족도": { avg: 4.1, top: 4.6, bottom: 3.6, unit: "/5" },
    "참가자당비용": { avg: 150, top: 100, bottom: 250, unit: "USD" },
    "ROI": { avg: 120, top: 200, bottom: 80, unit: "%" },
  },
  trade_show: {
    "참석률": { avg: 70, top: 82, bottom: 55, unit: "%" },
    "리드수집": { avg: 200, top: 400, bottom: 80, unit: "건/부스" },
    "부스방문율": { avg: 40, top: 60, bottom: 20, unit: "%" },
    "참가자만족도": { avg: 3.9, top: 4.4, bottom: 3.4, unit: "/5" },
    "전시업체만족도": { avg: 4.0, top: 4.5, bottom: 3.5, unit: "/5" },
    "ROI": { avg: 150, top: 250, bottom: 90, unit: "%" },
  },
  seminar: {
    "참석률": { avg: 80, top: 90, bottom: 65, unit: "%" },
    "학습만족도": { avg: 4.2, top: 4.7, bottom: 3.7, unit: "/5" },
    "지식향상도": { avg: 25, top: 40, bottom: 15, unit: "%" },
    "참가자만족도": { avg: 4.1, top: 4.6, bottom: 3.6, unit: "/5" },
    "재참석의향": { avg: 70, top: 85, bottom: 50, unit: "%" },
  },
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const benchmarks = INDUSTRY_BENCHMARKS[validated.event_type] || INDUSTRY_BENCHMARKS.conference;
  const results: Output["benchmark_results"] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  let totalScore = 0;
  let metricCount = 0;

  for (const metric of validated.metrics_to_benchmark) {
    const benchmark = benchmarks[metric];
    if (!benchmark) continue;

    // 과거 데이터에서 해당 메트릭 추출
    let currentValue: number | null = null;
    let historicalTrend: Output["benchmark_results"][0]["historical_trend"] = null;

    if (validated.historical_data && validated.historical_data.length > 0) {
      const historicalValues = validated.historical_data
        .filter(h => h.metrics[metric] !== undefined)
        .map(h => ({ year: h.year, value: h.metrics[metric] }))
        .sort((a, b) => b.year - a.year);

      if (historicalValues.length > 0) {
        currentValue = historicalValues[0].value;
        const values = historicalValues.map(h => h.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        let trend: "improving" | "stable" | "declining" = "stable";
        if (historicalValues.length >= 2) {
          const recentAvg = values.slice(0, Math.ceil(values.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(values.length / 2);
          const olderAvg = values.slice(Math.ceil(values.length / 2)).reduce((a, b) => a + b, 0) / (values.length - Math.ceil(values.length / 2));
          if (recentAvg > olderAvg * 1.1) trend = "improving";
          else if (recentAvg < olderAvg * 0.9) trend = "declining";
        }

        historicalTrend = {
          average: Math.round(avg * 10) / 10,
          best: Math.max(...values),
          worst: Math.min(...values),
          trend_direction: trend,
        };
      }
    }

    const comparisonValue = currentValue ?? benchmark.avg;
    const vsAvg = Math.round(((comparisonValue - benchmark.avg) / benchmark.avg) * 100);
    const vsTop = Math.round(((comparisonValue - benchmark.top) / benchmark.top) * 100);

    // 백분위 계산 (간단한 선형 보간)
    let percentile = 50;
    if (comparisonValue >= benchmark.top) percentile = 90;
    else if (comparisonValue >= benchmark.avg) percentile = 50 + ((comparisonValue - benchmark.avg) / (benchmark.top - benchmark.avg)) * 40;
    else if (comparisonValue >= benchmark.bottom) percentile = 10 + ((comparisonValue - benchmark.bottom) / (benchmark.avg - benchmark.bottom)) * 40;
    else percentile = 10;

    // 목표 설정: 현재보다 10-15% 향상, 최소 업계 평균 이상
    const targetBase = Math.max(comparisonValue * 1.1, benchmark.avg);
    const recommendedTarget = Math.round(Math.min(targetBase, benchmark.top * 0.95) * 10) / 10;

    results.push({
      metric,
      current_value: currentValue,
      industry_benchmark: {
        average: benchmark.avg,
        top_quartile: benchmark.top,
        bottom_quartile: benchmark.bottom,
        source: "Industry Report 2024",
      },
      historical_trend: historicalTrend,
      gap_analysis: {
        vs_industry_avg: vsAvg,
        vs_top_quartile: vsTop,
        percentile_rank: Math.round(percentile),
      },
      recommended_target: recommendedTarget,
      target_rationale: vsAvg >= 0
        ? `현재 업계 평균 이상, Top Quartile 달성 목표`
        : `업계 평균 도달을 우선 목표로 설정`,
    });

    totalScore += percentile;
    metricCount++;

    if (percentile >= 70) strengths.push(metric);
    else if (percentile < 40) improvements.push(metric);
  }

  const avgScore = metricCount > 0 ? Math.round(totalScore / metricCount) : 50;

  return {
    benchmark_id: generateUUID(),
    event_id: validated.event_id,
    benchmark_results: results,
    overall_performance: {
      score: avgScore,
      rating: avgScore >= 80 ? "industry_leader" : avgScore >= 60 ? "above_average" : avgScore >= 40 ? "average" : avgScore >= 20 ? "below_average" : "lagging",
      strengths: strengths.length > 0 ? strengths : ["분석 대상 메트릭에서 강점 미발견"],
      improvement_areas: improvements.length > 0 ? improvements : ["전반적으로 양호한 수준"],
    },
    competitive_insights: [
      {
        insight: `${validated.event_type} 업계 평균 참석률은 ${benchmarks["참석률"]?.avg || 75}%`,
        implication: "참석률 향상이 전체 성과에 직접적 영향",
        action: "등록 후 참석 전환 캠페인 강화",
      },
      {
        insight: "Top Quartile 이벤트는 개인화된 경험 제공에 집중",
        implication: "참가자 세분화 및 맞춤형 콘텐츠 필요",
        action: "참가자 여정 맵핑 및 개인화 전략 수립",
      },
    ],
    recommendations: [
      improvements.length > 0 ? `${improvements.join(", ")} 지표 개선에 우선 집중하세요.` : "현재 성과를 유지하며 Top Quartile 진입을 목표로 하세요.",
      "분기별 벤치마크 리뷰를 통해 시장 변화에 대응하세요.",
      "경쟁 이벤트 분석을 통해 차별화 포인트를 발굴하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
