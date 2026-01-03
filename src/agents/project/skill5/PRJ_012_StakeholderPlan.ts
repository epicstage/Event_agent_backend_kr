/**
 * PRJ-012: 이해관계자 관리 계획
 *
 * CMP-IS Reference: 5.1.j - Developing stakeholder management plan
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Management Planning Agent for event projects.

Your expertise includes:
- Identifying and analyzing stakeholders
- Assessing stakeholder influence and interest
- Developing engagement strategies
- Managing stakeholder expectations

CMP-IS Standard: 5.1.j - Developing stakeholder management plan`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_type: z.enum(["conference", "exhibition", "seminar", "gala", "hybrid", "virtual", "other"]).default("conference"),
  stakeholders: z.array(z.object({
    name: z.string(),
    role: z.string(),
    organization: z.string().optional(),
    influence: z.enum(["high", "medium", "low"]).optional(),
    interest: z.enum(["high", "medium", "low"]).optional(),
    expectations: z.array(z.string()).optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  stakeholder_register: z.array(z.object({
    stakeholder_id: z.string(),
    name: z.string(),
    role: z.string(),
    organization: z.string(),
    category: z.enum(["internal", "external", "sponsor", "vendor", "attendee", "media", "government"]),
    influence_level: z.enum(["high", "medium", "low"]),
    interest_level: z.enum(["high", "medium", "low"]),
    quadrant: z.enum(["manage_closely", "keep_satisfied", "keep_informed", "monitor"]),
    expectations: z.array(z.string()),
    potential_issues: z.array(z.string()),
    success_criteria: z.array(z.string()),
  })),
  engagement_strategies: z.array(z.object({
    quadrant: z.string(),
    strategy: z.string(),
    communication_frequency: z.string(),
    communication_channels: z.array(z.string()),
    key_messages: z.array(z.string()),
    responsible: z.string(),
  })),
  stakeholder_matrix: z.object({
    manage_closely: z.array(z.string()),
    keep_satisfied: z.array(z.string()),
    keep_informed: z.array(z.string()),
    monitor: z.array(z.string()),
  }),
  engagement_calendar: z.array(z.object({
    phase: z.string(),
    activities: z.array(z.object({
      activity: z.string(),
      target_stakeholders: z.array(z.string()),
      timing: z.string(),
      deliverable: z.string(),
    })),
  })),
  issue_management: z.object({
    escalation_matrix: z.array(z.object({
      issue_type: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      escalate_to: z.string(),
      response_time: z.string(),
    })),
    feedback_channels: z.array(z.string()),
  }),
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

  // 기본 이해관계자 템플릿
  const defaultStakeholders = [
    {
      name: "이벤트 오너",
      role: "주최자",
      organization: "주최 기관",
      category: "internal" as const,
      influence: "high" as const,
      interest: "high" as const,
      expectations: ["성공적인 이벤트 개최", "목표 달성", "예산 준수"],
      potential_issues: ["범위 확대 요구", "의사결정 지연"],
      success_criteria: ["KPI 달성률 90% 이상", "예산 내 완료"],
    },
    {
      name: "주요 스폰서",
      role: "타이틀 스폰서",
      organization: "스폰서 기업",
      category: "sponsor" as const,
      influence: "high" as const,
      interest: "medium" as const,
      expectations: ["브랜드 노출", "리드 확보", "ROI"],
      potential_issues: ["노출 부족 불만", "추가 요구"],
      success_criteria: ["합의된 혜택 100% 이행", "리드 목표 달성"],
    },
    {
      name: "마케팅팀",
      role: "홍보/마케팅",
      organization: "내부팀",
      category: "internal" as const,
      influence: "medium" as const,
      interest: "high" as const,
      expectations: ["브랜드 인지도 향상", "등록 목표 달성"],
      potential_issues: ["예산 부족", "일정 촉박"],
      success_criteria: ["등록 목표 100%", "미디어 커버리지"],
    },
    {
      name: "운영팀",
      role: "현장 운영",
      organization: "내부팀",
      category: "internal" as const,
      influence: "medium" as const,
      interest: "high" as const,
      expectations: ["명확한 지침", "충분한 리소스"],
      potential_issues: ["인력 부족", "역할 불명확"],
      success_criteria: ["무사고 운영", "참가자 만족"],
    },
    {
      name: "주요 연사",
      role: "기조 연사",
      organization: "외부",
      category: "external" as const,
      influence: "medium" as const,
      interest: "medium" as const,
      expectations: ["적절한 대우", "원활한 진행"],
      potential_issues: ["일정 변경", "요구사항 추가"],
      success_criteria: ["세션 만족도 4.0 이상"],
    },
    {
      name: "참가자 대표",
      role: "일반 참가자",
      organization: "다양",
      category: "attendee" as const,
      influence: "low" as const,
      interest: "high" as const,
      expectations: ["가치있는 콘텐츠", "네트워킹 기회", "편안한 환경"],
      potential_issues: ["기대 미충족", "불편 사항"],
      success_criteria: ["만족도 4.5 이상", "NPS 50 이상"],
    },
    {
      name: "장소 담당자",
      role: "베뉴 매니저",
      organization: "행사장",
      category: "vendor" as const,
      influence: "medium" as const,
      interest: "medium" as const,
      expectations: ["계약 조건 준수", "원활한 커뮤니케이션"],
      potential_issues: ["시설 제한", "추가 비용"],
      success_criteria: ["SLA 준수", "문제 발생 시 신속 대응"],
    },
    {
      name: "미디어",
      role: "언론/블로거",
      organization: "미디어",
      category: "media" as const,
      influence: "medium" as const,
      interest: "low" as const,
      expectations: ["뉴스 가치", "취재 편의"],
      potential_issues: ["부정적 보도", "관심 부족"],
      success_criteria: ["긍정 보도 건수", "미디어 노출 목표 달성"],
    },
  ];

  // 사용자 지정 이해관계자 병합
  const allStakeholders = validatedInput.stakeholders?.length
    ? validatedInput.stakeholders.map((sh, idx) => ({
        ...sh,
        category: "external" as const,
        influence: sh.influence || "medium" as const,
        interest: sh.interest || "medium" as const,
        expectations: sh.expectations || [],
        potential_issues: [],
        success_criteria: [],
      }))
    : defaultStakeholders;

  // 이해관계자 등록부 생성
  const stakeholderRegister: Output["stakeholder_register"] = allStakeholders.map((sh, idx) => {
    // 영향력-관심도 사분면 결정
    let quadrant: "manage_closely" | "keep_satisfied" | "keep_informed" | "monitor";
    if (sh.influence === "high" && sh.interest === "high") {
      quadrant = "manage_closely";
    } else if (sh.influence === "high" && sh.interest !== "high") {
      quadrant = "keep_satisfied";
    } else if (sh.influence !== "high" && sh.interest === "high") {
      quadrant = "keep_informed";
    } else {
      quadrant = "monitor";
    }

    return {
      stakeholder_id: `SH-${String(idx + 1).padStart(3, "0")}`,
      name: sh.name,
      role: sh.role,
      organization: sh.organization || "미지정",
      category: sh.category,
      influence_level: sh.influence,
      interest_level: sh.interest,
      quadrant,
      expectations: sh.expectations,
      potential_issues: sh.potential_issues,
      success_criteria: sh.success_criteria,
    };
  });

  // 이해관계자 매트릭스
  const stakeholderMatrix: Output["stakeholder_matrix"] = {
    manage_closely: stakeholderRegister.filter(s => s.quadrant === "manage_closely").map(s => s.name),
    keep_satisfied: stakeholderRegister.filter(s => s.quadrant === "keep_satisfied").map(s => s.name),
    keep_informed: stakeholderRegister.filter(s => s.quadrant === "keep_informed").map(s => s.name),
    monitor: stakeholderRegister.filter(s => s.quadrant === "monitor").map(s => s.name),
  };

  // 사분면별 참여 전략
  const engagementStrategies: Output["engagement_strategies"] = [
    {
      quadrant: "Manage Closely (높은 영향력 + 높은 관심)",
      strategy: "적극적 참여 및 협업. 모든 주요 의사결정에 참여시키고 정기적으로 1:1 미팅 진행",
      communication_frequency: "매일 또는 수시",
      communication_channels: ["1:1 미팅", "전화", "메신저", "이메일"],
      key_messages: ["프로젝트 진행 상황", "의사결정 사항", "리스크 및 이슈"],
      responsible: "PM",
    },
    {
      quadrant: "Keep Satisfied (높은 영향력 + 낮은 관심)",
      strategy: "핵심 정보 위주 간결하게 보고. 그들의 시간을 존중하고 요청 시 신속 대응",
      communication_frequency: "주간",
      communication_channels: ["주간 보고서", "이메일", "요청 시 미팅"],
      key_messages: ["주요 성과", "마일스톤 현황", "승인 필요 사항"],
      responsible: "PM",
    },
    {
      quadrant: "Keep Informed (낮은 영향력 + 높은 관심)",
      strategy: "정기적인 정보 공유. 피드백 채널을 열어두고 의견 청취",
      communication_frequency: "주 2회 또는 주간",
      communication_channels: ["이메일", "뉴스레터", "공유 문서", "Slack"],
      key_messages: ["업무 진행 상황", "일정 변경", "협조 요청"],
      responsible: "담당 팀원",
    },
    {
      quadrant: "Monitor (낮은 영향력 + 낮은 관심)",
      strategy: "모니터링 위주. 필요 시에만 커뮤니케이션하고 상태 변화 주시",
      communication_frequency: "월간 또는 필요 시",
      communication_channels: ["이메일", "뉴스레터"],
      key_messages: ["주요 업데이트", "중요 변경사항"],
      responsible: "담당 팀원",
    },
  ];

  // 참여 캘린더
  const engagementCalendar: Output["engagement_calendar"] = [
    {
      phase: "기획 단계",
      activities: [
        {
          activity: "킥오프 미팅",
          target_stakeholders: ["이벤트 오너", "주요 스폰서", "내부 팀"],
          timing: "프로젝트 시작",
          deliverable: "프로젝트 헌장, 역할 정의",
        },
        {
          activity: "요구사항 워크숍",
          target_stakeholders: ["이벤트 오너", "마케팅팀", "운영팀"],
          timing: "킥오프 후 1주",
          deliverable: "요구사항 문서",
        },
      ],
    },
    {
      phase: "준비 단계",
      activities: [
        {
          activity: "스폰서 협의",
          target_stakeholders: ["주요 스폰서"],
          timing: "월간",
          deliverable: "스폰서 요구사항 업데이트",
        },
        {
          activity: "진행 상황 보고",
          target_stakeholders: ["이벤트 오너"],
          timing: "주간",
          deliverable: "주간 보고서",
        },
        {
          activity: "연사 브리핑",
          target_stakeholders: ["주요 연사"],
          timing: "D-30, D-7",
          deliverable: "연사 가이드, 일정표",
        },
      ],
    },
    {
      phase: "실행 단계",
      activities: [
        {
          activity: "일일 브리핑",
          target_stakeholders: ["내부 팀", "벤더"],
          timing: "이벤트 기간 매일",
          deliverable: "당일 런시트",
        },
        {
          activity: "VIP 응대",
          target_stakeholders: ["스폰서", "주요 연사"],
          timing: "이벤트 당일",
          deliverable: "VIP 프로그램",
        },
      ],
    },
    {
      phase: "마무리 단계",
      activities: [
        {
          activity: "감사 인사",
          target_stakeholders: ["모든 이해관계자"],
          timing: "이벤트 후 1주 내",
          deliverable: "감사 메일, 사진 공유",
        },
        {
          activity: "결과 보고",
          target_stakeholders: ["이벤트 오너", "스폰서"],
          timing: "이벤트 후 2주 내",
          deliverable: "최종 결과 보고서",
        },
      ],
    },
  ];

  // 이슈 관리
  const issueManagement: Output["issue_management"] = {
    escalation_matrix: [
      {
        issue_type: "일반 문의",
        severity: "low",
        escalate_to: "담당 팀원",
        response_time: "24시간",
      },
      {
        issue_type: "불만 제기",
        severity: "medium",
        escalate_to: "팀 리드",
        response_time: "12시간",
      },
      {
        issue_type: "계약/협약 관련",
        severity: "high",
        escalate_to: "PM",
        response_time: "4시간",
      },
      {
        issue_type: "위기 상황",
        severity: "critical",
        escalate_to: "이벤트 오너",
        response_time: "즉시",
      },
    ],
    feedback_channels: [
      "전용 이메일 (feedback@event.com)",
      "전화 핫라인",
      "이벤트 앱 피드백",
      "현장 안내 데스크",
      "정기 설문조사",
    ],
  };

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    stakeholder_register: stakeholderRegister,
    engagement_strategies: engagementStrategies,
    stakeholder_matrix: stakeholderMatrix,
    engagement_calendar: engagementCalendar,
    issue_management: issueManagement,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-012",
  taskName: "이해관계자 관리 계획",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.j",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
