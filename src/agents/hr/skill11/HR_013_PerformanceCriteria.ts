/**
 * HR-013: Performance Criteria
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 성과 기준 및 평가 체계 설계
 */

import { z } from "zod";

export const HR_013_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  departments: z.array(z.string()),
  staff_types: z.array(z.enum(["full_time", "part_time", "contractor", "volunteer"])),
  event_duration_days: z.number(),
  performance_bonus_available: z.boolean().default(false),
});

export const HR_013_OutputSchema = z.object({
  event_id: z.string(),
  performance_framework: z.object({
    philosophy: z.string(),
    evaluation_approach: z.string(),
    rating_scale: z.array(z.object({
      score: z.number(),
      label: z.string(),
      description: z.string(),
    })),
  }),
  core_competencies: z.array(z.object({
    competency: z.string(),
    description: z.string(),
    weight: z.number(),
    behaviors: z.array(z.object({
      level: z.string(),
      description: z.string(),
    })),
  })),
  department_kpis: z.array(z.object({
    department: z.string(),
    kpis: z.array(z.object({
      kpi: z.string(),
      target: z.string(),
      measurement: z.string(),
      weight: z.number(),
    })),
  })),
  evaluation_process: z.object({
    evaluators: z.array(z.object({
      role: z.string(),
      evaluates: z.array(z.string()),
      weight: z.number(),
    })),
    timing: z.array(z.object({
      phase: z.string(),
      timing: z.string(),
      type: z.string(),
      actions: z.array(z.string()),
    })),
    documentation: z.array(z.object({
      document: z.string(),
      purpose: z.string(),
      frequency: z.string(),
    })),
  }),
  recognition_program: z.object({
    categories: z.array(z.object({
      award: z.string(),
      criteria: z.string(),
      prize: z.string(),
    })),
    informal_recognition: z.array(z.string()),
  }),
  improvement_plan: z.object({
    trigger_conditions: z.array(z.string()),
    steps: z.array(z.object({
      step: z.number(),
      action: z.string(),
      responsible: z.string(),
      timeframe: z.string(),
    })),
  }),
});

export type HR_013_Input = z.infer<typeof HR_013_InputSchema>;
export type HR_013_Output = z.infer<typeof HR_013_OutputSchema>;

export async function execute(input: HR_013_Input): Promise<HR_013_Output> {
  const coreCompetencies = [
    {
      competency: "고객 서비스",
      description: "참가자에게 친절하고 전문적인 서비스 제공",
      weight: 30,
      behaviors: [
        { level: "미흡", description: "불친절하거나 무관심한 태도, 문의 회피" },
        { level: "보통", description: "기본적인 응대는 하나 적극성 부족" },
        { level: "양호", description: "친절하고 신속한 응대, 문의 해결 노력" },
        { level: "우수", description: "참가자 기대 초과, 문제 예방적 대응" },
        { level: "탁월", description: "감동 서비스 제공, 칭찬 다수 수신" },
      ],
    },
    {
      competency: "팀워크",
      description: "동료와 협력하여 팀 목표 달성에 기여",
      weight: 25,
      behaviors: [
        { level: "미흡", description: "협력 거부, 팀 분위기 저해" },
        { level: "보통", description: "지시된 업무만 수행, 소극적 협력" },
        { level: "양호", description: "적극적 협력, 동료 지원" },
        { level: "우수", description: "팀 성과 향상에 주도적 기여" },
        { level: "탁월", description: "팀 리더십 발휘, 모범 사례 창출" },
      ],
    },
    {
      competency: "신뢰성",
      description: "정시 출근, 책임감 있는 업무 수행",
      weight: 20,
      behaviors: [
        { level: "미흡", description: "지각/조퇴 빈번, 무단 이탈" },
        { level: "보통", description: "출석은 양호하나 책임감 부족" },
        { level: "양호", description: "정시 출근, 맡은 업무 완수" },
        { level: "우수", description: "항상 신뢰 가능, 추가 업무도 수행" },
        { level: "탁월", description: "모범적 태도, 동료에게 긍정적 영향" },
      ],
    },
    {
      competency: "문제 해결",
      description: "예상치 못한 상황에 적절히 대응",
      weight: 15,
      behaviors: [
        { level: "미흡", description: "문제 발생 시 당황, 회피" },
        { level: "보통", description: "상급자 지시 후 대응" },
        { level: "양호", description: "기본적인 문제 독립 해결" },
        { level: "우수", description: "창의적 해결책 제시 및 실행" },
        { level: "탁월", description: "문제 예방, 프로세스 개선 제안" },
      ],
    },
    {
      competency: "전문성",
      description: "담당 업무에 대한 지식과 숙련도",
      weight: 10,
      behaviors: [
        { level: "미흡", description: "기본 업무도 미숙, 반복 질문" },
        { level: "보통", description: "기본 업무 수행 가능" },
        { level: "양호", description: "업무 숙달, 신규 인력 도움 가능" },
        { level: "우수", description: "전문가 수준, 어려운 상황 처리" },
        { level: "탁월", description: "동료 교육 가능, 베스트 프랙티스 공유" },
      ],
    },
  ];

  const departmentKPIs = input.departments.map((dept) => {
    const kpis = getKPIsForDepartment(dept);
    return { department: dept, kpis };
  });

  return {
    event_id: input.event_id,
    performance_framework: {
      philosophy: "공정하고 투명한 평가를 통해 우수 인력을 인정하고, 개선 기회를 제공하여 전체 서비스 품질을 향상시킵니다.",
      evaluation_approach: "역량 기반 + KPI 기반 복합 평가",
      rating_scale: [
        { score: 1, label: "미흡", description: "기대 수준에 미달, 즉각적인 개선 필요" },
        { score: 2, label: "보통", description: "최소 기준 충족, 개선 권장" },
        { score: 3, label: "양호", description: "기대 수준 충족, 안정적 성과" },
        { score: 4, label: "우수", description: "기대 초과, 탁월한 성과" },
        { score: 5, label: "탁월", description: "예외적 성과, 롤모델 수준" },
      ],
    },
    core_competencies: coreCompetencies,
    department_kpis: departmentKPIs,
    evaluation_process: {
      evaluators: [
        { role: "팀 리더", evaluates: ["담당 팀원"], weight: 50 },
        { role: "부서 매니저", evaluates: ["팀 리더", "주요 이슈 발생 스태프"], weight: 30 },
        { role: "동료 평가", evaluates: ["같은 팀원"], weight: 10 },
        { role: "자기 평가", evaluates: ["본인"], weight: 10 },
      ],
      timing: [
        {
          phase: "사전 기준 공유",
          timing: "온보딩 시",
          type: "교육",
          actions: ["평가 기준 설명", "기대사항 전달", "질의응답"],
        },
        {
          phase: "실시간 피드백",
          timing: "행사 기간 중",
          type: "관찰",
          actions: ["현장 관찰", "즉각적 피드백", "이슈 기록"],
        },
        {
          phase: "일일 평가",
          timing: "매일 종료 후",
          type: "기록",
          actions: ["출석 확인", "주요 관찰사항 기록", "특이사항 메모"],
        },
        {
          phase: "최종 평가",
          timing: "행사 종료 후 3일 이내",
          type: "종합",
          actions: ["평가지 작성", "점수 산정", "피드백 정리"],
        },
      ],
      documentation: [
        { document: "일일 관찰 기록지", purpose: "현장 관찰사항 기록", frequency: "매일" },
        { document: "이슈 보고서", purpose: "문제 상황 및 대응 기록", frequency: "발생 시" },
        { document: "칭찬/불만 카드", purpose: "외부 피드백 수집", frequency: "수시" },
        { document: "최종 평가서", purpose: "종합 평가 기록", frequency: "행사 종료 후" },
      ],
    },
    recognition_program: {
      categories: [
        { award: "MVP 스태프상", criteria: "종합 점수 최상위 + 리더 추천", prize: input.performance_bonus_available ? "보너스 20만원 + 인증서" : "감사패 + 선물" },
        { award: "베스트 서비스상", criteria: "고객 칭찬 최다 수신", prize: input.performance_bonus_available ? "보너스 10만원 + 인증서" : "감사패 + 선물" },
        { award: "팀워크상", criteria: "동료 평가 최고점", prize: "감사패 + 선물" },
        { award: "문제해결상", criteria: "어려운 상황 우수 대처", prize: "감사패 + 선물" },
        { award: "개근상", criteria: "무지각, 무조퇴, 무결근", prize: "소정의 상품" },
      ],
      informal_recognition: [
        "현장에서 즉각적인 칭찬과 격려",
        "매일 브리핑 시 우수 사례 공유",
        "SNS/그룹채팅에서 공개 감사",
        "간식 또는 음료 제공",
        "휴식 시간 우선 배정",
      ],
    },
    improvement_plan: {
      trigger_conditions: [
        "평가 점수 2점 미만",
        "심각한 고객 불만 발생",
        "무단 이탈 또는 지각 3회 이상",
        "안전 규정 위반",
        "팀워크 저해 행동",
      ],
      steps: [
        { step: 1, action: "문제 상황 확인 및 기록", responsible: "팀 리더", timeframe: "발생 즉시" },
        { step: 2, action: "1:1 면담 및 피드백 전달", responsible: "부서 매니저", timeframe: "당일 내" },
        { step: 3, action: "개선 계획 수립", responsible: "스태프 + 매니저", timeframe: "면담 후 즉시" },
        { step: 4, action: "집중 모니터링", responsible: "팀 리더", timeframe: "이후 근무 전체" },
        { step: 5, action: "재평가 및 조치 결정", responsible: "부서 매니저", timeframe: "다음 평가 시점" },
      ],
    },
  };
}

function getKPIsForDepartment(dept: string) {
  const kpiMap: Record<string, Array<{ kpi: string; target: string; measurement: string; weight: number }>> = {
    "등록": [
      { kpi: "체크인 처리 시간", target: "평균 2분 이내", measurement: "시스템 로그", weight: 30 },
      { kpi: "오류율", target: "1% 미만", measurement: "오류 건수/총 건수", weight: 25 },
      { kpi: "고객 만족도", target: "4.5/5.0 이상", measurement: "현장 설문", weight: 25 },
      { kpi: "대기열 관리", target: "대기 10분 이내", measurement: "관찰", weight: 20 },
    ],
    "안내": [
      { kpi: "문의 응대 정확도", target: "95% 이상", measurement: "미스터리 쇼퍼", weight: 35 },
      { kpi: "친절도", target: "4.5/5.0 이상", measurement: "현장 설문", weight: 35 },
      { kpi: "안내 구역 커버리지", target: "담당 구역 100%", measurement: "관찰", weight: 30 },
    ],
    "보안": [
      { kpi: "보안 이슈 대응 시간", target: "3분 이내", measurement: "보고 로그", weight: 35 },
      { kpi: "출입 통제 정확도", target: "100%", measurement: "점검", weight: 35 },
      { kpi: "순찰 완료율", target: "100%", measurement: "순찰 기록", weight: 30 },
    ],
    "케이터링": [
      { kpi: "서비스 대기 시간", target: "5분 이내", measurement: "관찰", weight: 30 },
      { kpi: "청결도", target: "위생 기준 100%", measurement: "위생 점검", weight: 30 },
      { kpi: "재고 관리", target: "품절 0건", measurement: "재고 기록", weight: 20 },
      { kpi: "고객 만족도", target: "4.0/5.0 이상", measurement: "설문", weight: 20 },
    ],
  };

  return kpiMap[dept] || [
    { kpi: "업무 완수율", target: "100%", measurement: "체크리스트", weight: 40 },
    { kpi: "고객 만족도", target: "4.0/5.0 이상", measurement: "설문", weight: 30 },
    { kpi: "팀 협업 기여도", target: "양호 이상", measurement: "동료 평가", weight: 30 },
  ];
}

export const HR_013_PerformanceCriteria = {
  id: "HR-013",
  name: "Performance Criteria",
  description: "성과 기준 및 평가 체계 설계",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.13",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_013_InputSchema,
  outputSchema: HR_013_OutputSchema,
  persona: `당신은 성과관리 전문가입니다. 공정하고 투명한 평가 체계를 설계하여 스태프 동기부여와 서비스 품질 향상을 이끌어냅니다.`,
};

export default HR_013_PerformanceCriteria;
