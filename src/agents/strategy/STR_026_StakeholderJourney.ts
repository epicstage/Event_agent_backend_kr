/**
 * STR-026: 이해관계자 여정 매핑
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Stakeholder Journey)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Journey Mapping Agent.

Your expertise includes:
- Mapping stakeholder touchpoints across event lifecycle
- Experience design and optimization
- Pain point identification and resolution
- Journey personalization strategies

CMP-IS Standard: Domain A - Strategic Planning (Stakeholder Journey)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  stakeholder_type: z.object({
    name: z.string(),
    segment: z.string(),
    persona_description: z.string().optional(),
    goals: z.array(z.string()),
    pain_points: z.array(z.string()).optional(),
  }),
  event_phases: z.array(z.object({
    phase: z.string(),
    duration: z.string().optional(),
    key_activities: z.array(z.string()),
  })),
  current_touchpoints: z.array(z.object({
    touchpoint: z.string(),
    phase: z.string(),
    channel: z.string(),
    current_experience: z.enum(["excellent", "good", "neutral", "poor"]).optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  journey_map_id: z.string().uuid(),
  event_id: z.string().uuid(),
  stakeholder_profile: z.object({
    segment: z.string(),
    persona: z.string(),
    primary_goals: z.array(z.string()),
    success_definition: z.string(),
    key_concerns: z.array(z.string()),
  }),
  journey_stages: z.array(z.object({
    stage: z.string(),
    stakeholder_goals: z.array(z.string()),
    touchpoints: z.array(z.object({
      touchpoint: z.string(),
      channel: z.string(),
      action: z.string(),
      emotion: z.enum(["delighted", "satisfied", "neutral", "frustrated", "angry"]),
      pain_points: z.array(z.string()),
      opportunities: z.array(z.string()),
    })),
    key_moments: z.array(z.object({
      moment: z.string(),
      type: z.enum(["moment_of_truth", "wow_moment", "pain_point"]),
      impact: z.string(),
    })),
    desired_outcome: z.string(),
  })),
  experience_optimization: z.object({
    priority_improvements: z.array(z.object({
      area: z.string(),
      current_state: z.string(),
      desired_state: z.string(),
      actions: z.array(z.string()),
      impact: z.enum(["high", "medium", "low"]),
      effort: z.enum(["high", "medium", "low"]),
    })),
    quick_wins: z.array(z.object({
      improvement: z.string(),
      implementation: z.string(),
      expected_impact: z.string(),
    })),
    long_term_initiatives: z.array(z.object({
      initiative: z.string(),
      timeline: z.string(),
      resources_needed: z.array(z.string()),
    })),
  }),
  personalization_strategy: z.array(z.object({
    segment_variation: z.string(),
    customization: z.string(),
    trigger: z.string(),
  })),
  success_metrics: z.array(z.object({
    metric: z.string(),
    measurement_point: z.string(),
    target: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-026",
  taskName: "Stakeholder Journey",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자의 이벤트 여정을 매핑하고 경험을 최적화합니다.",
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

const STAGE_TOUCHPOINTS: Record<string, { touchpoints: string[]; channels: string[] }> = {
  인지: { touchpoints: ["광고 접촉", "소셜미디어 발견", "추천 받음"], channels: ["디지털 광고", "SNS", "구전"] },
  고려: { touchpoints: ["웹사이트 방문", "상세 정보 확인", "문의"], channels: ["웹사이트", "이메일", "전화"] },
  등록: { touchpoints: ["등록 양식 작성", "결제", "확인 메일"], channels: ["등록 시스템", "결제 시스템", "이메일"] },
  준비: { touchpoints: ["사전 안내", "일정 확인", "준비물 체크"], channels: ["이메일", "앱", "웹사이트"] },
  참여: { touchpoints: ["체크인", "세션 참여", "네트워킹"], channels: ["현장", "앱", "대면"] },
  사후: { touchpoints: ["감사 메일", "설문조사", "후속 콘텐츠"], channels: ["이메일", "웹사이트", "SNS"] },
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { stakeholder_type, event_phases } = validated;

  // Build journey stages
  const journeyStages = event_phases.map(phase => {
    const stageConfig = STAGE_TOUCHPOINTS[phase.phase] || { touchpoints: phase.key_activities, channels: ["다채널"] };

    const touchpoints = stageConfig.touchpoints.map((tp, idx) => ({
      touchpoint: tp,
      channel: stageConfig.channels[idx] || stageConfig.channels[0],
      action: `${tp} 수행`,
      emotion: "satisfied" as const,
      pain_points: stakeholder_type.pain_points?.filter(pp => pp.includes(phase.phase)).slice(0, 1) || [],
      opportunities: [`${tp} 경험 개선`],
    }));

    const keyMoments = [
      {
        moment: `${phase.phase} 단계 핵심 순간`,
        type: "moment_of_truth" as const,
        impact: "이해관계자 만족도에 직접적 영향",
      },
    ];

    return {
      stage: phase.phase,
      stakeholder_goals: stakeholder_type.goals.slice(0, 2),
      touchpoints,
      key_moments: keyMoments,
      desired_outcome: `${phase.phase} 단계 성공적 완료 및 긍정적 경험`,
    };
  });

  // Experience optimization
  const priorityImprovements = stakeholder_type.pain_points?.slice(0, 3).map(pp => ({
    area: pp,
    current_state: "개선 필요",
    desired_state: "원활한 경험",
    actions: ["프로세스 간소화", "커뮤니케이션 강화", "지원 확대"],
    impact: "high" as const,
    effort: "medium" as const,
  })) || [];

  const quickWins = [
    {
      improvement: "커뮤니케이션 타이밍 최적화",
      implementation: "자동화된 알림 시스템 구축",
      expected_impact: "문의 감소 및 만족도 향상",
    },
    {
      improvement: "셀프서비스 옵션 확대",
      implementation: "FAQ 및 가이드 콘텐츠 강화",
      expected_impact: "자율성 향상 및 지원 부담 감소",
    },
  ];

  return {
    journey_map_id: generateUUID(),
    event_id: validated.event_id,
    stakeholder_profile: {
      segment: stakeholder_type.segment,
      persona: stakeholder_type.persona_description || `${stakeholder_type.segment} 대표 이해관계자`,
      primary_goals: stakeholder_type.goals,
      success_definition: stakeholder_type.goals.join(", ") + " 달성",
      key_concerns: stakeholder_type.pain_points || ["시간 효율성", "가치 획득"],
    },
    journey_stages: journeyStages,
    experience_optimization: {
      priority_improvements: priorityImprovements,
      quick_wins: quickWins,
      long_term_initiatives: [
        {
          initiative: "개인화된 여정 제공",
          timeline: "6개월",
          resources_needed: ["데이터 분석", "시스템 개발", "콘텐츠 제작"],
        },
        {
          initiative: "옴니채널 경험 통합",
          timeline: "12개월",
          resources_needed: ["기술 인프라", "프로세스 재설계"],
        },
      ],
    },
    personalization_strategy: [
      {
        segment_variation: "VIP 이해관계자",
        customization: "전담 담당자 배정, 우선 응대",
        trigger: "VIP 상태 확인 시",
      },
      {
        segment_variation: "신규 이해관계자",
        customization: "온보딩 가이드, 추가 지원",
        trigger: "첫 참여 확인 시",
      },
      {
        segment_variation: "재참여 이해관계자",
        customization: "이전 경험 기반 맞춤 추천",
        trigger: "재등록 확인 시",
      },
    ],
    success_metrics: [
      { metric: "NPS (Net Promoter Score)", measurement_point: "이벤트 직후", target: "50+" },
      { metric: "전환율", measurement_point: "각 단계", target: "단계별 80% 이상" },
      { metric: "이탈률", measurement_point: "등록~참여", target: "10% 미만" },
      { metric: "만족도", measurement_point: "사후 설문", target: "4.5/5.0" },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
