/**
 * STR-040: 리스크 문화 구축
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Culture)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Culture Development Agent for event planning.

Your expertise includes:
- Risk awareness program design
- Risk culture assessment
- Training and education strategies
- Behavioral change for risk management

CMP-IS Standard: Domain A - Strategic Planning (Risk Culture)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  organization_name: z.string(),
  current_state: z.object({
    risk_awareness_level: z.enum(["low", "medium", "high"]).optional(),
    existing_training: z.array(z.string()).optional(),
    past_incidents: z.array(z.string()).optional(),
    leadership_engagement: z.enum(["low", "medium", "high"]).optional(),
  }).optional(),
  team_profile: z.object({
    total_members: z.number(),
    departments: z.array(z.string()),
    experience_levels: z.object({
      senior: z.number(),
      mid: z.number(),
      junior: z.number(),
    }).optional(),
  }),
  goals: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  culture_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  culture_assessment: z.object({
    current_maturity: z.enum(["initial", "developing", "defined", "managed", "optimized"]),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    priority_areas: z.array(z.string()),
  }),
  vision_and_principles: z.object({
    risk_culture_vision: z.string(),
    core_principles: z.array(z.object({
      principle: z.string(),
      description: z.string(),
      behaviors: z.array(z.string()),
    })),
    expected_behaviors: z.array(z.object({
      role: z.string(),
      behaviors: z.array(z.string()),
    })),
  }),
  awareness_program: z.object({
    objectives: z.array(z.string()),
    campaigns: z.array(z.object({
      campaign_name: z.string(),
      target_audience: z.string(),
      duration: z.string(),
      activities: z.array(z.string()),
      success_measures: z.array(z.string()),
    })),
    communication_materials: z.array(z.object({
      material_type: z.string(),
      purpose: z.string(),
      content_outline: z.array(z.string()),
    })),
  }),
  training_plan: z.array(z.object({
    training_name: z.string(),
    target_audience: z.array(z.string()),
    format: z.enum(["in_person", "online", "blended", "workshop"]),
    duration: z.string(),
    learning_objectives: z.array(z.string()),
    content_modules: z.array(z.string()),
    assessment_method: z.string(),
    frequency: z.string(),
  })),
  engagement_initiatives: z.array(z.object({
    initiative: z.string(),
    description: z.string(),
    target_outcome: z.string(),
    implementation: z.array(z.string()),
  })),
  measurement_framework: z.object({
    kpis: z.array(z.object({
      kpi: z.string(),
      measurement_method: z.string(),
      target: z.string(),
      frequency: z.string(),
    })),
    survey_approach: z.object({
      survey_type: z.string(),
      frequency: z.string(),
      key_questions: z.array(z.string()),
    }),
    progress_tracking: z.array(z.object({
      milestone: z.string(),
      timeline: z.string(),
      indicator: z.string(),
    })),
  }),
  leadership_role: z.object({
    expectations: z.array(z.string()),
    actions: z.array(z.object({
      action: z.string(),
      purpose: z.string(),
      frequency: z.string(),
    })),
    accountability: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-040",
  taskName: "Risk Culture",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "조직 내 리스크 관리 문화를 구축하고 강화하는 계획을 수립합니다.",
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

type Maturity = "initial" | "developing" | "defined" | "managed" | "optimized";

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { current_state, team_profile, organization_name } = validated;

  const awarenessLevel = current_state?.risk_awareness_level || "medium";
  const leadershipLevel = current_state?.leadership_engagement || "medium";

  const maturity: Maturity =
    awarenessLevel === "low" ? "initial" :
    awarenessLevel === "medium" && leadershipLevel === "low" ? "developing" :
    awarenessLevel === "medium" ? "defined" :
    leadershipLevel === "high" ? "managed" : "defined";

  const strengths = [
    leadershipLevel !== "low" ? "리더십의 리스크 관리 관심" : "",
    current_state?.existing_training && current_state.existing_training.length > 0 ? "기존 교육 프로그램 존재" : "",
    team_profile.total_members > 0 ? "팀 구성 완료" : "",
  ].filter(Boolean);

  const gaps = [
    awarenessLevel === "low" ? "전반적인 리스크 인식 부족" : "",
    !current_state?.existing_training || current_state.existing_training.length === 0 ? "체계적 교육 프로그램 부재" : "",
    leadershipLevel === "low" ? "리더십 참여 부족" : "",
    "리스크 보고 문화 미정착",
  ].filter(Boolean);

  return {
    culture_plan_id: generateUUID(),
    event_id: validated.event_id,
    culture_assessment: {
      current_maturity: maturity,
      strengths,
      gaps,
      priority_areas: [
        "리스크 인식 향상",
        "리더십 참여 강화",
        "보고 문화 정착",
      ],
    },
    vision_and_principles: {
      risk_culture_vision: `${organization_name}은(는) 모든 구성원이 리스크를 인식하고, 적극적으로 관리하며, 투명하게 소통하는 문화를 구축합니다.`,
      core_principles: [
        {
          principle: "선제적 인식",
          description: "리스크를 사후 대응이 아닌 사전에 인식하고 대비",
          behaviors: ["정기적 리스크 점검", "이상 징후 즉시 공유", "예방적 조치 우선"],
        },
        {
          principle: "투명한 소통",
          description: "리스크 정보를 숨기지 않고 적시에 공유",
          behaviors: ["문제 발생 시 즉시 보고", "비난 없는 보고 문화", "정보 공유 활성화"],
        },
        {
          principle: "공동 책임",
          description: "리스크 관리는 모든 구성원의 책임",
          behaviors: ["담당 영역 리스크 소유", "팀 간 협력", "상호 지원"],
        },
      ],
      expected_behaviors: [
        { role: "리더십", behaviors: ["리스크 관리 우선순위 명시", "자원 지원", "모범적 행동"] },
        { role: "관리자", behaviors: ["팀 리스크 모니터링", "보고 장려", "교육 참여 독려"] },
        { role: "팀원", behaviors: ["리스크 식별 및 보고", "교육 이수", "절차 준수"] },
      ],
    },
    awareness_program: {
      objectives: [
        "전 직원의 리스크 관리 기본 개념 이해",
        "리스크 보고의 중요성 인식",
        "각자 역할에서의 리스크 관리 책임 인지",
      ],
      campaigns: [
        {
          campaign_name: "리스크 인식 주간",
          target_audience: "전 직원",
          duration: "1주",
          activities: ["일일 리스크 팁 공유", "사례 발표", "퀴즈 이벤트"],
          success_measures: ["참여율 80%", "인지도 조사 향상"],
        },
        {
          campaign_name: "Near Miss 공유 캠페인",
          target_audience: "운영팀",
          duration: "지속",
          activities: ["Near Miss 보고 장려", "베스트 보고자 포상", "사례 공유회"],
          success_measures: ["월간 Near Miss 보고 건수", "사고 예방 효과"],
        },
      ],
      communication_materials: [
        { material_type: "포스터", purpose: "리스크 인식 상기", content_outline: ["핵심 원칙", "보고 방법", "연락처"] },
        { material_type: "뉴스레터", purpose: "정기 리스크 업데이트", content_outline: ["주요 리스크 현황", "성공 사례", "교육 일정"] },
        { material_type: "동영상", purpose: "교육 및 인식 향상", content_outline: ["리스크 관리 중요성", "실제 사례", "대응 방법"] },
      ],
    },
    training_plan: [
      {
        training_name: "리스크 관리 기초",
        target_audience: ["전 직원"],
        format: "online",
        duration: "2시간",
        learning_objectives: ["리스크 개념 이해", "식별 방법 학습", "보고 절차 숙지"],
        content_modules: ["리스크란 무엇인가", "리스크 식별 기법", "보고 및 에스컬레이션"],
        assessment_method: "온라인 퀴즈",
        frequency: "신규 입사 시 + 연 1회 재교육",
      },
      {
        training_name: "리스크 관리 심화",
        target_audience: ["관리자", "리스크 담당자"],
        format: "workshop",
        duration: "4시간",
        learning_objectives: ["리스크 평가 수행", "완화 전략 수립", "모니터링 관리"],
        content_modules: ["리스크 평가 프레임워크", "완화 전략 개발", "KRI 설계"],
        assessment_method: "실습 과제",
        frequency: "연 1회",
      },
    ],
    engagement_initiatives: [
      {
        initiative: "리스크 챔피언 프로그램",
        description: "부서별 리스크 챔피언 지정 및 활동",
        target_outcome: "부서 내 리스크 문화 전파",
        implementation: ["챔피언 선발", "월간 챔피언 미팅", "부서 리스크 리뷰 주관"],
      },
      {
        initiative: "리스크 보고 포상 제도",
        description: "적극적인 리스크 보고에 대한 인정과 보상",
        target_outcome: "보고 문화 활성화",
        implementation: ["월간 베스트 보고자 선정", "분기 포상", "사례 공유"],
      },
    ],
    measurement_framework: {
      kpis: [
        { kpi: "리스크 보고 건수", measurement_method: "시스템 집계", target: "월 20건 이상", frequency: "월간" },
        { kpi: "교육 이수율", measurement_method: "LMS 기록", target: "95%", frequency: "분기" },
        { kpi: "리스크 인지도 점수", measurement_method: "설문조사", target: "4.0/5.0", frequency: "반기" },
      ],
      survey_approach: {
        survey_type: "리스크 문화 진단 설문",
        frequency: "반기 1회",
        key_questions: [
          "리스크 보고가 장려되고 있다고 느끼나요?",
          "리스크 관리에 필요한 자원이 충분한가요?",
          "리더십이 리스크 관리를 중요시한다고 느끼나요?",
        ],
      },
      progress_tracking: [
        { milestone: "기초 교육 완료", timeline: "1개월", indicator: "전 직원 교육 이수" },
        { milestone: "챔피언 프로그램 가동", timeline: "2개월", indicator: "부서별 챔피언 지정" },
        { milestone: "문화 정착", timeline: "6개월", indicator: "설문 점수 4.0 이상" },
      ],
    },
    leadership_role: {
      expectations: [
        "리스크 관리에 대한 명확한 지지 표명",
        "자원 및 시간 배분",
        "모범적 행동 및 참여",
      ],
      actions: [
        { action: "리스크 리뷰 미팅 주재", purpose: "리더십 관심 표명", frequency: "월 1회" },
        { action: "교육 참여 및 격려", purpose: "문화 정착 지원", frequency: "분기 1회" },
        { action: "우수 사례 공유 및 인정", purpose: "동기 부여", frequency: "수시" },
      ],
      accountability: [
        "팀 내 리스크 관리 수준에 대한 책임",
        "리스크 이슈 에스컬레이션 적시 수행",
        "리스크 문화 KPI 달성",
      ],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
