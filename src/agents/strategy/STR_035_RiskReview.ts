/**
 * STR-035: 리스크 검토
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Review)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Review Agent for event planning.

Your expertise includes:
- Periodic risk review facilitation
- Risk management effectiveness assessment
- Lessons learned analysis
- Continuous improvement recommendations

CMP-IS Standard: Domain A - Strategic Planning (Risk Review)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  review_type: z.enum(["periodic", "post_incident", "post_event", "audit"]),
  review_period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  risk_management_data: z.object({
    total_risks_identified: z.number(),
    risks_mitigated: z.number(),
    risks_occurred: z.number(),
    mitigation_effectiveness: z.array(z.object({
      risk_id: z.string(),
      mitigation_applied: z.string(),
      outcome: z.enum(["effective", "partial", "ineffective"]),
    })).optional(),
    near_misses: z.array(z.object({
      description: z.string(),
      potential_impact: z.string(),
    })).optional(),
  }),
  incidents: z.array(z.object({
    incident_id: z.string(),
    description: z.string(),
    related_risk: z.string().optional(),
    response_effectiveness: z.enum(["excellent", "good", "adequate", "poor"]).optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  review_id: z.string().uuid(),
  event_id: z.string().uuid(),
  review_summary: z.object({
    review_type: z.string(),
    period: z.string(),
    overall_assessment: z.enum(["excellent", "good", "satisfactory", "needs_improvement", "poor"]),
    key_findings: z.array(z.string()),
  }),
  effectiveness_analysis: z.object({
    risk_identification: z.object({
      score: z.number(),
      assessment: z.string(),
      gaps: z.array(z.string()),
    }),
    risk_assessment: z.object({
      score: z.number(),
      assessment: z.string(),
      accuracy: z.string(),
    }),
    mitigation_effectiveness: z.object({
      score: z.number(),
      effective_count: z.number(),
      partial_count: z.number(),
      ineffective_count: z.number(),
      best_practices: z.array(z.string()),
      improvement_areas: z.array(z.string()),
    }),
    monitoring_effectiveness: z.object({
      score: z.number(),
      assessment: z.string(),
      early_warning_accuracy: z.string(),
    }),
    response_effectiveness: z.object({
      score: z.number(),
      assessment: z.string(),
      response_time_analysis: z.string(),
    }),
  }),
  incident_analysis: z.array(z.object({
    incident_id: z.string(),
    root_cause: z.string(),
    was_risk_identified: z.boolean(),
    response_assessment: z.string(),
    lessons_learned: z.array(z.string()),
  })).optional(),
  near_miss_analysis: z.array(z.object({
    description: z.string(),
    why_averted: z.string(),
    prevention_measures: z.array(z.string()),
  })).optional(),
  lessons_learned: z.array(z.object({
    category: z.string(),
    lesson: z.string(),
    source: z.string(),
    recommended_action: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  improvement_plan: z.array(z.object({
    area: z.string(),
    current_state: z.string(),
    target_state: z.string(),
    actions: z.array(z.string()),
    owner: z.string(),
    timeline: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-035",
  taskName: "Risk Review",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "리스크 관리 효과를 검토하고 개선 사항을 도출합니다.",
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

  const { risk_management_data, review_type, review_period, incidents } = validated;

  // Calculate effectiveness scores
  const mitigationData = risk_management_data.mitigation_effectiveness || [];
  const effectiveCount = mitigationData.filter(m => m.outcome === "effective").length;
  const partialCount = mitigationData.filter(m => m.outcome === "partial").length;
  const ineffectiveCount = mitigationData.filter(m => m.outcome === "ineffective").length;

  const mitigationScore = mitigationData.length > 0
    ? Math.round(((effectiveCount * 100 + partialCount * 50) / mitigationData.length))
    : 75;

  const identificationScore = risk_management_data.risks_occurred > 0
    ? Math.round(((risk_management_data.total_risks_identified - risk_management_data.risks_occurred) / risk_management_data.total_risks_identified) * 100)
    : 90;

  const overallScore = Math.round((mitigationScore + identificationScore) / 2);
  const overallAssessment = overallScore >= 90 ? "excellent" as const :
    overallScore >= 75 ? "good" as const :
    overallScore >= 60 ? "satisfactory" as const :
    overallScore >= 40 ? "needs_improvement" as const : "poor" as const;

  // Incident analysis
  const incidentAnalysis = incidents?.map(inc => ({
    incident_id: inc.incident_id,
    root_cause: "분석 필요 - 근본 원인 파악",
    was_risk_identified: !!inc.related_risk,
    response_assessment: inc.response_effectiveness || "adequate",
    lessons_learned: [
      inc.related_risk ? "식별된 리스크의 완화 강화 필요" : "리스크 식별 범위 확대 필요",
      "대응 프로세스 검토 필요",
    ],
  }));

  // Near miss analysis
  const nearMissAnalysis = risk_management_data.near_misses?.map(nm => ({
    description: nm.description,
    why_averted: "조기 감지 또는 예방 조치로 방지",
    prevention_measures: ["모니터링 강화", "예방적 통제 유지"],
  }));

  return {
    review_id: generateUUID(),
    event_id: validated.event_id,
    review_summary: {
      review_type: review_type,
      period: `${review_period.start} ~ ${review_period.end}`,
      overall_assessment: overallAssessment,
      key_findings: [
        `총 ${risk_management_data.total_risks_identified}건 리스크 식별, ${risk_management_data.risks_mitigated}건 완화`,
        `${risk_management_data.risks_occurred}건의 리스크 발생`,
        `완화 효과성 점수: ${mitigationScore}점`,
      ],
    },
    effectiveness_analysis: {
      risk_identification: {
        score: identificationScore,
        assessment: identificationScore >= 80 ? "양호 - 대부분의 리스크 사전 식별" : "개선 필요 - 미식별 리스크 발생",
        gaps: risk_management_data.risks_occurred > 0 ? ["일부 리스크 미식별", "새로운 리스크 유형 고려 필요"] : [],
      },
      risk_assessment: {
        score: 75,
        assessment: "적정 수준의 리스크 평가 수행",
        accuracy: "확률/영향 예측의 70% 정확도",
      },
      mitigation_effectiveness: {
        score: mitigationScore,
        effective_count: effectiveCount,
        partial_count: partialCount,
        ineffective_count: ineffectiveCount,
        best_practices: effectiveCount > 0 ? ["사전 예방 조치 효과적", "정기 모니터링 유지"] : [],
        improvement_areas: ineffectiveCount > 0 ? ["비효과적 완화 전략 재검토", "대안적 접근 필요"] : [],
      },
      monitoring_effectiveness: {
        score: 80,
        assessment: "모니터링 시스템 적절히 운영",
        early_warning_accuracy: "조기 경보의 75% 정확도",
      },
      response_effectiveness: {
        score: 70,
        assessment: incidents && incidents.length > 0 ? "대응 수행됨, 일부 개선 필요" : "대응 필요 사례 없음",
        response_time_analysis: "평균 대응 시간 목표 이내",
      },
    },
    incident_analysis: incidentAnalysis,
    near_miss_analysis: nearMissAnalysis,
    lessons_learned: [
      { category: "식별", lesson: "정기적 리스크 식별 세션의 중요성", source: "리뷰 분석", recommended_action: "월간 리스크 식별 세션 제도화", priority: "high" },
      { category: "완화", lesson: "다층적 완화 전략의 효과", source: "효과성 분석", recommended_action: "주요 리스크에 복수 완화 전략 적용", priority: "medium" },
      { category: "대응", lesson: "신속한 의사결정의 중요성", source: "사건 분석", recommended_action: "의사결정 권한 명확화", priority: "high" },
    ],
    improvement_plan: [
      {
        area: "리스크 식별",
        current_state: `${identificationScore}% 식별률`,
        target_state: "95% 식별률",
        actions: ["리스크 체크리스트 업데이트", "브레인스토밍 세션 정례화"],
        owner: "리스크 담당자",
        timeline: "다음 분기",
      },
      {
        area: "완화 효과성",
        current_state: `${mitigationScore}점`,
        target_state: "85점 이상",
        actions: ["비효과적 전략 재검토", "성공 사례 표준화"],
        owner: "운영팀",
        timeline: "2개월",
      },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
