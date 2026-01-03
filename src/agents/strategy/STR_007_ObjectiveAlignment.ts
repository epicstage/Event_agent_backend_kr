/**
 * STR-007: 목표 정렬 분석
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Objective Alignment)
 * Task Type: AI
 *
 * Input: 조직 전략, 이벤트 목표
 * Output: 정렬 매트릭스, 갭 분석
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Objective Alignment Agent for strategic event planning.

Your expertise includes:
- Analyzing alignment between event and organizational objectives
- Identifying strategic gaps and misalignments
- Recommending realignment strategies
- Cascading objectives across organizational levels

CMP-IS Standard: Domain A - Strategic Planning (Objective Alignment)

You help event planners ensure their events directly contribute to organizational strategic objectives and demonstrate clear value alignment.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  organizational_objectives: z.array(z.object({
    id: z.string(),
    objective: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    timeframe: z.string(),
    key_results: z.array(z.string()).optional(),
  })),
  event_objectives: z.array(z.object({
    id: z.string(),
    objective: z.string(),
    expected_contribution: z.string(),
    measurable_outcome: z.string(),
  })),
  department: z.string().optional(),
  fiscal_year: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  alignment_id: z.string().uuid(),
  event_id: z.string().uuid(),
  alignment_matrix: z.array(z.object({
    event_objective_id: z.string(),
    event_objective: z.string(),
    aligned_org_objectives: z.array(z.object({
      org_objective_id: z.string(),
      org_objective: z.string(),
      alignment_strength: z.enum(["strong", "moderate", "weak", "none"]),
      alignment_score: z.number().min(0).max(100),
      contribution_description: z.string(),
    })),
    overall_alignment_score: z.number(),
  })),
  gap_analysis: z.object({
    unaligned_event_objectives: z.array(z.object({
      objective_id: z.string(),
      objective: z.string(),
      recommendation: z.string(),
    })),
    uncovered_org_objectives: z.array(z.object({
      objective_id: z.string(),
      objective: z.string(),
      suggested_event_action: z.string(),
    })),
  }),
  alignment_summary: z.object({
    overall_score: z.number(),
    rating: z.enum(["excellent", "good", "fair", "poor"]),
    critical_objectives_coverage: z.number(),
    high_priority_coverage: z.number(),
  }),
  improvement_plan: z.array(z.object({
    action: z.string(),
    priority: z.enum(["immediate", "short_term", "long_term"]),
    expected_impact: z.string(),
  })),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-007",
  taskName: "Objective Alignment Analysis",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트 목표와 조직 전략 간의 정렬도를 분석합니다.",
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

function calculateAlignmentScore(eventObj: string, orgObj: string): { strength: "strong" | "moderate" | "weak" | "none"; score: number } {
  const eventLower = eventObj.toLowerCase();
  const orgLower = orgObj.toLowerCase();

  // 키워드 매칭 기반 점수
  const keywords = [
    "매출", "수익", "revenue", "성장", "growth",
    "브랜드", "인지도", "brand", "awareness",
    "고객", "customer", "참가자", "attendee",
    "교육", "learning", "개발", "development",
    "네트워크", "관계", "partnership", "engagement",
    "혁신", "innovation", "리더십", "leadership",
  ];

  let matchCount = 0;
  for (const keyword of keywords) {
    if (eventLower.includes(keyword) && orgLower.includes(keyword)) {
      matchCount++;
    }
  }

  // 직접적 언급 체크
  const directMatch = eventLower.includes(orgLower.slice(0, 10)) || orgLower.includes(eventLower.slice(0, 10));

  let score = matchCount * 15 + (directMatch ? 30 : 0);
  score = Math.min(100, Math.max(0, score + Math.random() * 20));

  let strength: "strong" | "moderate" | "weak" | "none";
  if (score >= 70) strength = "strong";
  else if (score >= 40) strength = "moderate";
  else if (score >= 20) strength = "weak";
  else strength = "none";

  return { strength, score: Math.round(score) };
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const alignmentMatrix: Output["alignment_matrix"] = [];
  const unalignedEventObjectives: Output["gap_analysis"]["unaligned_event_objectives"] = [];
  const uncoveredOrgObjectives: Output["gap_analysis"]["uncovered_org_objectives"] = [];

  const orgObjectiveCoverage = new Map<string, number>();
  validated.organizational_objectives.forEach(o => orgObjectiveCoverage.set(o.id, 0));

  // 각 이벤트 목표에 대해 조직 목표와의 정렬 분석
  for (const eventObj of validated.event_objectives) {
    const alignments = [];
    let hasAlignment = false;

    for (const orgObj of validated.organizational_objectives) {
      const { strength, score } = calculateAlignmentScore(eventObj.objective, orgObj.objective);

      if (strength !== "none") {
        hasAlignment = true;
        orgObjectiveCoverage.set(orgObj.id, Math.max(orgObjectiveCoverage.get(orgObj.id) || 0, score));
      }

      alignments.push({
        org_objective_id: orgObj.id,
        org_objective: orgObj.objective,
        alignment_strength: strength,
        alignment_score: score,
        contribution_description: score > 50
          ? `이벤트를 통해 ${orgObj.objective} 달성에 직접 기여`
          : score > 20
          ? `간접적으로 ${orgObj.objective} 지원 가능`
          : "직접적 연관성 낮음",
      });
    }

    const overallScore = alignments.length > 0
      ? Math.round(alignments.reduce((sum, a) => sum + a.alignment_score, 0) / alignments.length)
      : 0;

    alignmentMatrix.push({
      event_objective_id: eventObj.id,
      event_objective: eventObj.objective,
      aligned_org_objectives: alignments.sort((a, b) => b.alignment_score - a.alignment_score),
      overall_alignment_score: overallScore,
    });

    if (!hasAlignment || overallScore < 30) {
      unalignedEventObjectives.push({
        objective_id: eventObj.id,
        objective: eventObj.objective,
        recommendation: "이 목표를 조직 전략과 명확히 연결하거나 재검토 필요",
      });
    }
  }

  // 커버되지 않은 조직 목표 식별
  for (const [objId, coverage] of orgObjectiveCoverage.entries()) {
    if (coverage < 30) {
      const orgObj = validated.organizational_objectives.find(o => o.id === objId);
      if (orgObj) {
        uncoveredOrgObjectives.push({
          objective_id: objId,
          objective: orgObj.objective,
          suggested_event_action: `${orgObj.objective}를 지원하는 이벤트 요소 추가 고려`,
        });
      }
    }
  }

  // 전체 점수 계산
  const overallScore = alignmentMatrix.length > 0
    ? Math.round(alignmentMatrix.reduce((sum, m) => sum + m.overall_alignment_score, 0) / alignmentMatrix.length)
    : 0;

  const criticalObjs = validated.organizational_objectives.filter(o => o.priority === "critical");
  const criticalCovered = criticalObjs.filter(o => (orgObjectiveCoverage.get(o.id) || 0) >= 50).length;

  const highObjs = validated.organizational_objectives.filter(o => o.priority === "high");
  const highCovered = highObjs.filter(o => (orgObjectiveCoverage.get(o.id) || 0) >= 40).length;

  return {
    alignment_id: generateUUID(),
    event_id: validated.event_id,
    alignment_matrix: alignmentMatrix,
    gap_analysis: {
      unaligned_event_objectives: unalignedEventObjectives,
      uncovered_org_objectives: uncoveredOrgObjectives,
    },
    alignment_summary: {
      overall_score: overallScore,
      rating: overallScore >= 70 ? "excellent" : overallScore >= 50 ? "good" : overallScore >= 30 ? "fair" : "poor",
      critical_objectives_coverage: criticalObjs.length > 0 ? Math.round((criticalCovered / criticalObjs.length) * 100) : 100,
      high_priority_coverage: highObjs.length > 0 ? Math.round((highCovered / highObjs.length) * 100) : 100,
    },
    improvement_plan: [
      ...(unalignedEventObjectives.length > 0 ? [{
        action: `${unalignedEventObjectives.length}개 미정렬 목표 재검토 및 재정의`,
        priority: "immediate" as const,
        expected_impact: "전략적 일관성 강화",
      }] : []),
      ...(uncoveredOrgObjectives.length > 0 ? [{
        action: `${uncoveredOrgObjectives.length}개 미커버 조직 목표 지원 요소 추가`,
        priority: "short_term" as const,
        expected_impact: "전략적 가치 증대",
      }] : []),
    ],
    recommendations: [
      overallScore < 50 ? "전반적인 목표 재정렬이 필요합니다." : "목표 정렬도가 양호합니다.",
      "분기별로 정렬 상태를 재점검하세요.",
      "조직 전략 변경 시 이벤트 목표도 함께 업데이트하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
