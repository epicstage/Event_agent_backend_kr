/**
 * HR-008: Labor Compliance Planning
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 노무 컴플라이언스 계획 및 법적 요건 검토
 */

import { z } from "zod";

export const HR_008_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_dates: z.array(z.string()),
  staff_count: z.number(),
  staff_types: z.array(z.enum(["full_time", "part_time", "contractor", "volunteer", "intern"])),
  work_hours_per_day: z.number(),
  includes_night_work: z.boolean().default(false),
  includes_holiday_work: z.boolean().default(false),
  has_minors: z.boolean().default(false),
  location: z.string(),
});

export const HR_008_OutputSchema = z.object({
  event_id: z.string(),
  compliance_plan: z.object({
    applicable_laws: z.array(z.object({
      law_name: z.string(),
      description: z.string(),
      key_requirements: z.array(z.string()),
    })),
    work_hour_limits: z.object({
      regular_hours: z.number(),
      overtime_limit: z.number(),
      rest_period_required: z.number(),
      weekly_rest_day: z.boolean(),
    }),
    wage_requirements: z.object({
      minimum_wage: z.number(),
      overtime_rate: z.number(),
      night_rate: z.number(),
      holiday_rate: z.number(),
    }),
    insurance_requirements: z.array(z.object({
      type: z.string(),
      coverage: z.string(),
      applicable_to: z.array(z.string()),
    })),
    documentation_required: z.array(z.object({
      document: z.string(),
      purpose: z.string(),
      retention_period: z.string(),
    })),
  }),
  risk_assessment: z.array(z.object({
    area: z.string(),
    risk_level: z.enum(["low", "medium", "high"]),
    potential_penalty: z.string(),
    mitigation: z.string(),
  })),
  action_items: z.array(z.object({
    task: z.string(),
    deadline: z.string(),
    responsible: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(["required", "recommended", "optional"]),
    notes: z.string(),
  })),
});

export type HR_008_Input = z.infer<typeof HR_008_InputSchema>;
export type HR_008_Output = z.infer<typeof HR_008_OutputSchema>;

export async function execute(input: HR_008_Input): Promise<HR_008_Output> {
  const applicableLaws = [
    {
      law_name: "근로기준법",
      description: "근로조건의 기준을 정하여 근로자의 기본적 생활을 보장",
      key_requirements: [
        "근로계약서 서면 작성",
        "최저임금 이상 지급",
        "법정 근로시간 준수",
        "휴게시간 부여",
      ],
    },
    {
      law_name: "최저임금법",
      description: "근로자에 대해 최저임금 이상 지급 의무",
      key_requirements: [
        "2024년 최저임금 9,860원/시간",
        "수습 3개월 90% 적용 가능",
        "최저임금 고지 의무",
      ],
    },
    {
      law_name: "산업안전보건법",
      description: "산업재해 예방 및 쾌적한 작업환경 조성",
      key_requirements: [
        "안전보건교육 실시",
        "위험요소 사전 점검",
        "보호구 지급",
        "산업재해 발생 시 신고",
      ],
    },
  ];

  if (input.has_minors) {
    applicableLaws.push({
      law_name: "청소년 보호법",
      description: "18세 미만 근로자 특별 보호",
      key_requirements: [
        "1일 7시간, 주 35시간 제한",
        "야간근로(22시~06시) 금지",
        "휴일근로 원칙 금지",
        "친권자 동의서 필요",
      ],
    });
  }

  const riskAreas: Array<{
    area: string;
    risk_level: "low" | "medium" | "high";
    potential_penalty: string;
    mitigation: string;
  }> = [];

  // 근로시간 리스크
  if (input.work_hours_per_day > 8) {
    riskAreas.push({
      area: "초과근로",
      risk_level: "high",
      potential_penalty: "2년 이하 징역 또는 2천만원 이하 벌금",
      mitigation: "연장근로 동의서 확보 및 주 12시간 한도 준수",
    });
  }

  // 야간근로 리스크
  if (input.includes_night_work) {
    riskAreas.push({
      area: "야간근로",
      risk_level: input.has_minors ? "high" : "medium",
      potential_penalty: "2년 이하 징역 또는 2천만원 이하 벌금",
      mitigation: input.has_minors
        ? "미성년자 야간근로 절대 금지"
        : "야간근로 수당 50% 가산 지급",
    });
  }

  // 휴일근로 리스크
  if (input.includes_holiday_work) {
    riskAreas.push({
      area: "휴일근로",
      risk_level: "medium",
      potential_penalty: "2년 이하 징역 또는 2천만원 이하 벌금",
      mitigation: "휴일근로 수당 50% 가산 지급 및 대체휴무 고려",
    });
  }

  // 계약 리스크
  if (input.staff_types.includes("contractor")) {
    riskAreas.push({
      area: "프리랜서 위장도급",
      risk_level: "medium",
      potential_penalty: "근로자 지위 인정 시 4대보험 소급 및 퇴직금 지급",
      mitigation: "업무 독립성 보장, 지시 최소화, 명확한 용역계약서 작성",
    });
  }

  // 최저임금 리스크
  riskAreas.push({
    area: "최저임금",
    risk_level: "low",
    potential_penalty: "3년 이하 징역 또는 2천만원 이하 벌금",
    mitigation: "시급 계산 시 식대, 교통비 포함 여부 확인",
  });

  const actionItems = [
    {
      task: "근로계약서 양식 준비 및 검토",
      deadline: "행사 2주 전",
      responsible: "HR 담당자",
      priority: "high" as const,
    },
    {
      task: "4대보험 가입 대상자 파악",
      deadline: "행사 2주 전",
      responsible: "HR 담당자",
      priority: "high" as const,
    },
    {
      task: "안전보건교육 자료 준비",
      deadline: "행사 1주 전",
      responsible: "안전담당자",
      priority: "high" as const,
    },
    {
      task: "급여대장 및 출근부 양식 준비",
      deadline: "행사 3일 전",
      responsible: "HR 담당자",
      priority: "medium" as const,
    },
    {
      task: "비상연락망 및 응급 프로토콜 수립",
      deadline: "행사 전일",
      responsible: "운영팀장",
      priority: "high" as const,
    },
  ];

  if (input.has_minors) {
    actionItems.unshift({
      task: "미성년자 친권자 동의서 수집",
      deadline: "행사 1주 전",
      responsible: "HR 담당자",
      priority: "high" as const,
    });
  }

  return {
    event_id: input.event_id,
    compliance_plan: {
      applicable_laws: applicableLaws,
      work_hour_limits: {
        regular_hours: input.has_minors ? 7 : 8,
        overtime_limit: input.has_minors ? 0 : 12,
        rest_period_required: input.work_hours_per_day >= 8 ? 60 : input.work_hours_per_day >= 4 ? 30 : 0,
        weekly_rest_day: true,
      },
      wage_requirements: {
        minimum_wage: 9860,
        overtime_rate: 1.5,
        night_rate: 1.5,
        holiday_rate: 1.5,
      },
      insurance_requirements: [
        {
          type: "산업재해보상보험",
          coverage: "업무상 재해 보상",
          applicable_to: ["full_time", "part_time", "contractor"],
        },
        {
          type: "국민건강보험",
          coverage: "의료비 지원",
          applicable_to: ["full_time", "part_time"],
        },
        {
          type: "국민연금",
          coverage: "노후 연금",
          applicable_to: ["full_time", "part_time"],
        },
        {
          type: "고용보험",
          coverage: "실업급여 및 직업훈련",
          applicable_to: ["full_time", "part_time"],
        },
        {
          type: "행사배상책임보험",
          coverage: "제3자 피해 보상",
          applicable_to: ["full_time", "part_time", "contractor", "volunteer"],
        },
      ],
      documentation_required: [
        {
          document: "근로계약서",
          purpose: "근로조건 명시 및 분쟁 예방",
          retention_period: "3년",
        },
        {
          document: "급여대장",
          purpose: "임금 지급 증빙",
          retention_period: "3년",
        },
        {
          document: "출근부",
          purpose: "근로시간 관리",
          retention_period: "3년",
        },
        {
          document: "안전보건교육 이수증",
          purpose: "교육 이수 증빙",
          retention_period: "2년",
        },
        {
          document: "신분증 사본",
          purpose: "본인 확인",
          retention_period: "퇴직 후 파기",
        },
      ],
    },
    risk_assessment: riskAreas,
    action_items: actionItems,
    checklist: [
      { item: "근로계약서 서면 체결", status: "required", notes: "고용형태별 양식 준비" },
      { item: "최저임금 준수 확인", status: "required", notes: "시급 9,860원 이상" },
      { item: "4대보험 가입", status: "required", notes: "1개월 이상 또는 60시간 이상 근무자" },
      { item: "안전보건교육 실시", status: "required", notes: "신규 채용 시 8시간 이상" },
      { item: "휴게시간 보장", status: "required", notes: "4시간당 30분, 8시간당 1시간" },
      { item: "연장근로 동의서", status: input.work_hours_per_day > 8 ? "required" : "optional", notes: "주 12시간 한도" },
      { item: "야간근로 수당 가산", status: input.includes_night_work ? "required" : "optional", notes: "22:00~06:00 50% 가산" },
      { item: "미성년자 동의서", status: input.has_minors ? "required" : "optional", notes: "친권자 서면 동의 필수" },
    ],
  };
}

export const HR_008_LaborCompliance = {
  id: "HR-008",
  name: "Labor Compliance Planning",
  description: "노무 컴플라이언스 계획 및 법적 요건 검토",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.8",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_008_InputSchema,
  outputSchema: HR_008_OutputSchema,
  persona: `당신은 노무 컴플라이언스 전문가입니다. 근로기준법, 산업안전보건법 등 관련 법규를 정확히 이해하고 법적 리스크를 사전에 예방합니다.`,
};

export default HR_008_LaborCompliance;
