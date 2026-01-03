/**
 * STR-047: 변화 관리
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Change Management)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Change Management Agent for event planning.

Your expertise includes:
- Change readiness assessment
- Change communication planning
- Resistance management
- Change adoption strategies

CMP-IS Standard: Domain A - Strategic Planning (Change Management)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  change_initiative: z.object({
    change_name: z.string(),
    change_description: z.string(),
    change_type: z.enum(["process", "technology", "organizational", "cultural"]),
    scope: z.enum(["small", "medium", "large", "transformational"]),
    urgency: z.enum(["low", "medium", "high", "critical"]),
  }),
  affected_groups: z.array(z.object({
    group_name: z.string(),
    size: z.number(),
    anticipated_reaction: z.enum(["supportive", "neutral", "resistant", "unknown"]).optional(),
  })),
  organization_context: z.object({
    change_history: z.enum(["positive", "mixed", "negative"]).optional(),
    current_workload: z.enum(["light", "normal", "heavy"]).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  change_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  change_overview: z.object({
    change_name: z.string(),
    vision_statement: z.string(),
    burning_platform: z.string(),
    success_definition: z.string(),
  }),
  readiness_assessment: z.object({
    overall_readiness: z.enum(["low", "medium", "high"]),
    readiness_score: z.number(),
    by_dimension: z.array(z.object({
      dimension: z.string(),
      score: z.number(),
      assessment: z.string(),
    })),
    key_enablers: z.array(z.string()),
    key_barriers: z.array(z.string()),
  }),
  stakeholder_change_analysis: z.array(z.object({
    group: z.string(),
    current_state: z.string(),
    desired_state: z.string(),
    change_impact: z.enum(["low", "medium", "high"]),
    anticipated_resistance: z.enum(["low", "medium", "high"]),
    engagement_strategy: z.string(),
    key_messages: z.array(z.string()),
  })),
  change_strategy: z.object({
    approach: z.enum(["directive", "participative", "negotiated", "facilitated"]),
    rationale: z.string(),
    phases: z.array(z.object({
      phase: z.string(),
      objectives: z.array(z.string()),
      key_activities: z.array(z.string()),
      duration: z.string(),
    })),
  }),
  communication_plan: z.object({
    key_messages: z.array(z.object({
      message: z.string(),
      target_audience: z.string(),
      channel: z.string(),
      timing: z.string(),
    })),
    feedback_mechanisms: z.array(z.string()),
  }),
  training_and_support: z.array(z.object({
    target_group: z.string(),
    training_needs: z.array(z.string()),
    support_mechanisms: z.array(z.string()),
    timeline: z.string(),
  })),
  resistance_management: z.object({
    anticipated_resistance: z.array(z.object({
      source: z.string(),
      type: z.enum(["rational", "emotional", "political"]),
      root_cause: z.string(),
      mitigation_strategy: z.string(),
    })),
    escalation_process: z.array(z.string()),
  }),
  success_metrics: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    measurement_method: z.string(),
    timing: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-047",
  taskName: "Change Management",
  domain: "A",
  skill: "Strategic Alignment",
  taskType: "AI" as const,
  description: "변화 관리 전략을 수립하고 실행 계획을 개발합니다.",
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

  const { change_initiative, affected_groups, organization_context } = validated;

  // Calculate readiness
  const historyScore = organization_context?.change_history === "positive" ? 80 :
                       organization_context?.change_history === "mixed" ? 50 : 30;
  const workloadScore = organization_context?.current_workload === "light" ? 80 :
                        organization_context?.current_workload === "normal" ? 60 : 30;
  const reactionScore = affected_groups.reduce((sum, g) => {
    return sum + (g.anticipated_reaction === "supportive" ? 80 :
                  g.anticipated_reaction === "neutral" ? 50 :
                  g.anticipated_reaction === "resistant" ? 20 : 40);
  }, 0) / affected_groups.length;

  const overallReadinessScore = Math.round((historyScore + workloadScore + reactionScore) / 3);
  const overallReadiness = overallReadinessScore >= 70 ? "high" as const :
                           overallReadinessScore >= 40 ? "medium" as const : "low" as const;

  const stakeholderAnalysis = affected_groups.map(g => ({
    group: g.group_name,
    current_state: "현재 프로세스/방식 사용",
    desired_state: `${change_initiative.change_name} 완전 적용`,
    change_impact: change_initiative.scope === "transformational" || change_initiative.scope === "large" ? "high" as const : "medium" as const,
    anticipated_resistance: g.anticipated_reaction === "resistant" ? "high" as const :
                            g.anticipated_reaction === "neutral" ? "medium" as const : "low" as const,
    engagement_strategy: g.anticipated_reaction === "resistant" ? "집중 소통 및 참여 유도" :
                         g.anticipated_reaction === "supportive" ? "변화 챔피언으로 활용" : "정보 공유 및 지원",
    key_messages: [
      `${change_initiative.change_name}이 ${g.group_name}에게 주는 이점`,
      "지원 및 교육 제공 계획",
      "피드백 수렴 채널",
    ],
  }));

  const approach = change_initiative.urgency === "critical" ? "directive" as const :
                   overallReadiness === "high" ? "participative" as const :
                   overallReadiness === "medium" ? "facilitated" as const : "negotiated" as const;

  return {
    change_plan_id: generateUUID(),
    event_id: validated.event_id,
    change_overview: {
      change_name: change_initiative.change_name,
      vision_statement: `${change_initiative.change_name}을(를) 통해 더 나은 성과와 경험을 제공합니다.`,
      burning_platform: change_initiative.urgency === "critical"
        ? "즉각적인 변화가 필요한 위기 상황"
        : "지속적 성장과 경쟁력 확보를 위한 변화",
      success_definition: "변화 완전 정착 및 목표 성과 달성",
    },
    readiness_assessment: {
      overall_readiness: overallReadiness,
      readiness_score: overallReadinessScore,
      by_dimension: [
        { dimension: "조직 문화", score: historyScore, assessment: historyScore >= 60 ? "우호적" : "개선 필요" },
        { dimension: "자원 가용성", score: workloadScore, assessment: workloadScore >= 60 ? "양호" : "부담" },
        { dimension: "이해관계자 태도", score: Math.round(reactionScore), assessment: reactionScore >= 60 ? "긍정적" : "관리 필요" },
      ],
      key_enablers: [
        "경영진 지원",
        affected_groups.some(g => g.anticipated_reaction === "supportive") ? "내부 지지자 존재" : "",
        change_initiative.urgency === "critical" ? "변화 필요성 인식" : "",
      ].filter(Boolean),
      key_barriers: [
        organization_context?.current_workload === "heavy" ? "높은 업무 부담" : "",
        affected_groups.some(g => g.anticipated_reaction === "resistant") ? "일부 저항 예상" : "",
        organization_context?.change_history === "negative" ? "과거 부정적 경험" : "",
      ].filter(Boolean),
    },
    stakeholder_change_analysis: stakeholderAnalysis,
    change_strategy: {
      approach,
      rationale: approach === "directive" ? "긴급성으로 인한 신속한 실행 필요" :
                 approach === "participative" ? "높은 준비도 활용한 참여형 추진" :
                 "저항 최소화를 위한 단계적 접근",
      phases: [
        {
          phase: "준비 단계",
          objectives: ["인식 제고", "지지자 확보", "계획 수립"],
          key_activities: ["킥오프 커뮤니케이션", "변화 챔피언 선정", "상세 계획 확정"],
          duration: "2주",
        },
        {
          phase: "실행 단계",
          objectives: ["변화 실행", "지원 제공", "피드백 수집"],
          key_activities: ["단계별 변화 적용", "교육 실시", "이슈 대응"],
          duration: "4-6주",
        },
        {
          phase: "정착 단계",
          objectives: ["안정화", "성과 확인", "지속 개선"],
          key_activities: ["성과 측정", "베스트 프랙티스 공유", "제도화"],
          duration: "2-4주",
        },
      ],
    },
    communication_plan: {
      key_messages: [
        {
          message: `${change_initiative.change_name} 배경 및 필요성`,
          target_audience: "전체",
          channel: "전체 미팅",
          timing: "변화 시작 전",
        },
        {
          message: "진행 상황 및 성과 공유",
          target_audience: "전체",
          channel: "뉴스레터/이메일",
          timing: "주간",
        },
      ],
      feedback_mechanisms: ["피드백 설문", "1:1 면담", "익명 제보 채널"],
    },
    training_and_support: affected_groups.map(g => ({
      target_group: g.group_name,
      training_needs: ["새 프로세스 교육", "도구 사용법"],
      support_mechanisms: ["헬프데스크", "FAQ", "멘토링"],
      timeline: "변화 실행 전 1주",
    })),
    resistance_management: {
      anticipated_resistance: affected_groups
        .filter(g => g.anticipated_reaction === "resistant")
        .map(g => ({
          source: g.group_name,
          type: "emotional" as const,
          root_cause: "익숙한 방식에 대한 집착 또는 불확실성",
          mitigation_strategy: "충분한 설명, 참여 기회 제공, 지원 강화",
        })),
      escalation_process: [
        "직속 관리자와 1차 논의",
        "변화 관리팀 개입",
        "경영진 에스컬레이션",
      ],
    },
    success_metrics: [
      { metric: "변화 채택률", target: "90%", measurement_method: "사용 현황 추적", timing: "실행 4주 후" },
      { metric: "이해관계자 만족도", target: "4.0/5.0", measurement_method: "설문조사", timing: "정착 단계" },
      { metric: "목표 성과 달성", target: "100%", measurement_method: "KPI 측정", timing: "변화 완료 후" },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
