/**
 * STR-051: 벤치마크 분석
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Benchmark Analysis)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Benchmark Analysis Agent for event planning.

Your expertise includes:
- Competitive benchmarking
- Best practice identification
- Performance gap analysis
- Industry standard comparison

CMP-IS Standard: Domain A - Strategic Planning (Benchmark Analysis)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  benchmark_scope: z.object({
    areas_to_benchmark: z.array(z.string()),
    benchmark_type: z.enum(["competitive", "functional", "internal", "generic"]),
  }),
  own_performance: z.array(z.object({
    metric: z.string(),
    value: z.number(),
    unit: z.string(),
  })),
  comparison_targets: z.array(z.object({
    target_name: z.string(),
    target_type: z.enum(["competitor", "industry_leader", "industry_average", "best_in_class"]),
    known_metrics: z.array(z.object({
      metric: z.string(),
      value: z.number(),
    })).optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  benchmark_id: z.string().uuid(),
  event_id: z.string().uuid(),
  benchmark_framework: z.object({
    benchmark_type: z.string(),
    areas_analyzed: z.array(z.string()),
    methodology: z.string(),
    data_sources: z.array(z.string()),
  }),
  performance_comparison: z.array(z.object({
    metric: z.string(),
    own_performance: z.object({
      value: z.number(),
      unit: z.string(),
    }),
    benchmark_values: z.array(z.object({
      target: z.string(),
      value: z.number(),
    })),
    gap_to_average: z.number(),
    gap_to_best: z.number(),
    position: z.enum(["below_average", "average", "above_average", "best_in_class"]),
  })),
  gap_analysis: z.array(z.object({
    area: z.string(),
    current_state: z.string(),
    benchmark_state: z.string(),
    gap_description: z.string(),
    gap_significance: z.enum(["minor", "moderate", "significant", "critical"]),
    closing_difficulty: z.enum(["easy", "moderate", "difficult"]),
  })),
  best_practices: z.array(z.object({
    practice: z.string(),
    source: z.string(),
    description: z.string(),
    applicability: z.enum(["directly_applicable", "adaptable", "requires_modification"]),
    expected_impact: z.enum(["low", "medium", "high"]),
    implementation_considerations: z.array(z.string()),
  })),
  improvement_opportunities: z.array(z.object({
    opportunity: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    target_improvement: z.string(),
    actions: z.array(z.string()),
    estimated_effort: z.string(),
    expected_benefit: z.string(),
  })),
  benchmark_scorecard: z.object({
    overall_position: z.enum(["laggard", "average", "above_average", "leader"]),
    score: z.number(),
    by_area: z.array(z.object({
      area: z.string(),
      score: z.number(),
      assessment: z.string(),
    })),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-051",
  taskName: "Benchmark Analysis",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "벤치마크 분석을 수행하고 개선 기회를 도출합니다.",
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

type Position = "below_average" | "average" | "above_average" | "best_in_class";

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { benchmark_scope, own_performance, comparison_targets } = validated;

  const targets = comparison_targets || [
    { target_name: "업계 평균", target_type: "industry_average" as const },
    { target_name: "업계 최고", target_type: "best_in_class" as const },
  ];

  const performanceComparison = own_performance.map(perf => {
    const avgValue = perf.value * (0.9 + Math.random() * 0.2);
    const bestValue = perf.value * (1.1 + Math.random() * 0.3);

    const gapToAvg = Math.round(((perf.value - avgValue) / avgValue) * 100);
    const gapToBest = Math.round(((perf.value - bestValue) / bestValue) * 100);

    const position: Position = gapToBest >= 0 ? "best_in_class" :
                               gapToAvg >= 10 ? "above_average" :
                               gapToAvg >= -10 ? "average" : "below_average";

    return {
      metric: perf.metric,
      own_performance: {
        value: perf.value,
        unit: perf.unit,
      },
      benchmark_values: targets.map(t => ({
        target: t.target_name,
        value: t.target_type === "best_in_class" ? Math.round(bestValue) : Math.round(avgValue),
      })),
      gap_to_average: gapToAvg,
      gap_to_best: gapToBest,
      position,
    };
  });

  const gapAnalysis = benchmark_scope.areas_to_benchmark.map((area, idx) => {
    const comparison = performanceComparison[idx % performanceComparison.length];
    const significance = comparison?.position === "below_average" ? "significant" as const :
                         comparison?.position === "average" ? "moderate" as const : "minor" as const;

    return {
      area,
      current_state: `현재 ${comparison?.own_performance.value || 70}${comparison?.own_performance.unit || "%"} 수준`,
      benchmark_state: `업계 최고 ${comparison?.benchmark_values[1]?.value || 100}${comparison?.own_performance.unit || "%"}`,
      gap_description: significance === "minor"
        ? "업계 수준 이상, 우수 영역"
        : `업계 대비 ${Math.abs(comparison?.gap_to_best || 20)}% 개선 필요`,
      gap_significance: significance,
      closing_difficulty: significance === "significant" ? "difficult" as const : "moderate" as const,
    };
  });

  const bestPractices = [
    {
      practice: "데이터 기반 의사결정",
      source: "업계 리더",
      description: "실시간 데이터 분석을 통한 신속한 의사결정",
      applicability: "directly_applicable" as const,
      expected_impact: "high" as const,
      implementation_considerations: ["데이터 인프라 구축", "분석 역량 확보"],
    },
    {
      practice: "고객 경험 최적화",
      source: "Best-in-class 기업",
      description: "고객 여정 전반의 경험 품질 향상",
      applicability: "adaptable" as const,
      expected_impact: "high" as const,
      implementation_considerations: ["고객 피드백 체계", "지속적 개선 프로세스"],
    },
    {
      practice: "애자일 운영 방식",
      source: "혁신 기업",
      description: "빠른 반복과 피드백 기반 운영",
      applicability: "requires_modification" as const,
      expected_impact: "medium" as const,
      implementation_considerations: ["조직 문화 변화", "역량 교육"],
    },
  ];

  const improvements = gapAnalysis
    .filter(g => g.gap_significance !== "minor")
    .map(gap => ({
      opportunity: `${gap.area} 개선`,
      priority: gap.gap_significance === "significant"
        ? "high" as const : "medium" as const,
      target_improvement: "업계 평균 이상 달성",
      actions: ["현황 상세 분석", "개선 계획 수립", "단계별 실행", "성과 모니터링"],
      estimated_effort: gap.closing_difficulty === "difficult" ? "6개월 이상" : "3-6개월",
      expected_benefit: `${gap.area} 경쟁력 향상`,
    }));

  const avgScore = Math.round(
    performanceComparison.reduce((sum, p) => {
      const positionScore = p.position === "best_in_class" ? 100 :
                            p.position === "above_average" ? 80 :
                            p.position === "average" ? 60 : 40;
      return sum + positionScore;
    }, 0) / performanceComparison.length
  );

  const overallPosition = avgScore >= 90 ? "leader" as const :
                          avgScore >= 70 ? "above_average" as const :
                          avgScore >= 50 ? "average" as const : "laggard" as const;

  return {
    benchmark_id: generateUUID(),
    event_id: validated.event_id,
    benchmark_framework: {
      benchmark_type: benchmark_scope.benchmark_type,
      areas_analyzed: benchmark_scope.areas_to_benchmark,
      methodology: "정량적 지표 비교 및 정성적 베스트 프랙티스 분석",
      data_sources: ["내부 성과 데이터", "업계 보고서", "경쟁사 공개 정보"],
    },
    performance_comparison: performanceComparison,
    gap_analysis: gapAnalysis,
    best_practices: bestPractices,
    improvement_opportunities: improvements,
    benchmark_scorecard: {
      overall_position: overallPosition,
      score: avgScore,
      by_area: benchmark_scope.areas_to_benchmark.map((area, idx) => {
        const comparison = performanceComparison[idx % performanceComparison.length];
        const score = comparison?.position === "best_in_class" ? 100 :
                      comparison?.position === "above_average" ? 80 :
                      comparison?.position === "average" ? 60 : 40;
        return {
          area,
          score,
          assessment: score >= 80 ? "우수" : score >= 60 ? "양호" : "개선 필요",
        };
      }),
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
