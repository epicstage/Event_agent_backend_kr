/**
 * HR-004: Volunteer Program Design
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 봉사자 프로그램 설계 및 관리 계획
 */

import { z } from "zod";

export const HR_004_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_type: z.enum(["conference", "exhibition", "festival", "sports", "cultural", "charity"]),
  volunteers_needed: z.number().min(1),
  event_duration_days: z.number().min(1),
  target_demographics: z.array(z.string()).optional(),
  budget_for_program: z.number().optional(),
});

export const HR_004_OutputSchema = z.object({
  event_id: z.string(),
  program_design: z.object({
    program_name: z.string(),
    program_theme: z.string(),
    roles: z.array(z.object({
      role_name: z.string(),
      count: z.number(),
      responsibilities: z.array(z.string()),
      requirements: z.array(z.string()),
      shift_hours: z.number(),
    })),
    recruitment_strategy: z.object({
      target_groups: z.array(z.string()),
      channels: z.array(z.string()),
      messaging: z.string(),
      timeline: z.object({
        recruitment_open: z.string(),
        recruitment_close: z.string(),
        selection_complete: z.string(),
      }),
    }),
    incentive_package: z.object({
      tangible_benefits: z.array(z.string()),
      intangible_benefits: z.array(z.string()),
      recognition_program: z.array(z.string()),
      estimated_cost_per_volunteer: z.number(),
    }),
    training_plan: z.object({
      orientation_duration: z.string(),
      topics: z.array(z.string()),
      delivery_method: z.string(),
    }),
    management_structure: z.object({
      volunteer_coordinator: z.string(),
      team_leads: z.number(),
      communication_channels: z.array(z.string()),
    }),
  }),
  retention_strategies: z.array(z.string()),
  evaluation_metrics: z.array(z.object({
    metric: z.string(),
    measurement_method: z.string(),
  })),
  budget_estimate: z.object({
    total: z.number(),
    breakdown: z.record(z.number()),
  }),
});

export type HR_004_Input = z.infer<typeof HR_004_InputSchema>;
export type HR_004_Output = z.infer<typeof HR_004_OutputSchema>;

export async function execute(input: HR_004_Input): Promise<HR_004_Output> {
  const volunteersNeeded = input.volunteers_needed;
  const days = input.event_duration_days;

  // Role distribution
  const roles = [
    {
      role_name: "등록/안내 봉사자",
      count: Math.ceil(volunteersNeeded * 0.3),
      responsibilities: ["참가자 등록 지원", "행사장 안내", "질의 응대"],
      requirements: ["친절한 태도", "기본 외국어 가능자 우대"],
      shift_hours: 6,
    },
    {
      role_name: "현장 운영 봉사자",
      count: Math.ceil(volunteersNeeded * 0.25),
      responsibilities: ["세션룸 관리", "자료 배포", "좌석 안내"],
      requirements: ["체력 좋은 분", "책임감 있는 분"],
      shift_hours: 6,
    },
    {
      role_name: "VIP 의전 봉사자",
      count: Math.ceil(volunteersNeeded * 0.1),
      responsibilities: ["VIP 에스코트", "의전 지원", "통역 보조"],
      requirements: ["외국어 능통자", "단정한 용모"],
      shift_hours: 8,
    },
    {
      role_name: "미디어/홍보 봉사자",
      count: Math.ceil(volunteersNeeded * 0.15),
      responsibilities: ["사진/영상 촬영", "SNS 실시간 업로드", "참가자 인터뷰"],
      requirements: ["촬영 장비 보유자 우대", "SNS 활용 능숙자"],
      shift_hours: 6,
    },
    {
      role_name: "물류/환경 봉사자",
      count: Math.ceil(volunteersNeeded * 0.2),
      responsibilities: ["물품 이동 지원", "행사장 정리", "쓰레기 분리수거"],
      requirements: ["체력 좋은 분"],
      shift_hours: 5,
    },
  ];

  // Target demographics
  const targetGroups = input.target_demographics || [
    "대학생 (관광/이벤트 전공)",
    "청년 구직자",
    "지역 주민",
    "시니어 봉사자",
    "관련 동아리/학회 회원",
  ];

  // Incentive calculation
  const costPerVolunteer = input.budget_for_program
    ? Math.floor(input.budget_for_program / volunteersNeeded)
    : 50000;

  // Timeline
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 60);

  const recruitmentOpen = new Date(eventDate);
  recruitmentOpen.setDate(recruitmentOpen.getDate() - 45);

  const recruitmentClose = new Date(eventDate);
  recruitmentClose.setDate(recruitmentClose.getDate() - 21);

  const selectionComplete = new Date(eventDate);
  selectionComplete.setDate(selectionComplete.getDate() - 14);

  // Budget breakdown
  const totalBudget = input.budget_for_program || volunteersNeeded * 50000;
  const breakdown: Record<string, number> = {
    "식비 (식사/간식)": Math.round(totalBudget * 0.35),
    "교통비 지원": Math.round(totalBudget * 0.2),
    "유니폼/명찰": Math.round(totalBudget * 0.15),
    "기념품/인증서": Math.round(totalBudget * 0.15),
    "보험료": Math.round(totalBudget * 0.1),
    "예비비": Math.round(totalBudget * 0.05),
  };

  return {
    event_id: input.event_id,
    program_design: {
      program_name: `${input.event_name} 서포터즈`,
      program_theme: "함께 만드는 성공적인 행사",
      roles,
      recruitment_strategy: {
        target_groups: targetGroups,
        channels: [
          "1365 자원봉사포털",
          "VMS (사회복지 자원봉사인증관리)",
          "대학 봉사센터",
          "SNS (인스타그램/페이스북)",
          "지역 자원봉사센터",
        ],
        messaging: `${input.event_name}과 함께할 열정 가득한 봉사자를 모집합니다! ` +
          `실무 경험과 네트워킹 기회, 봉사활동 인증서까지 다양한 혜택이 준비되어 있습니다.`,
        timeline: {
          recruitment_open: recruitmentOpen.toISOString().split("T")[0],
          recruitment_close: recruitmentClose.toISOString().split("T")[0],
          selection_complete: selectionComplete.toISOString().split("T")[0],
        },
      },
      incentive_package: {
        tangible_benefits: [
          "식사 및 간식 제공",
          "교통비 지원 (1일 최대 15,000원)",
          "공식 유니폼 및 명찰 제공",
          "봉사활동 인증서 발급",
          "기념품 증정",
          "행사 참여 기회 (일부 세션)",
        ],
        intangible_benefits: [
          "이벤트 운영 실무 경험",
          "업계 네트워킹 기회",
          "포트폴리오 활용 가능",
          "추천서 발급 (우수 봉사자)",
        ],
        recognition_program: [
          "일일 우수 봉사자 선정",
          "최우수 봉사자 시상 (행사 종료 시)",
          "SNS 감사 게시물",
          "차기 행사 우선 참여권",
        ],
        estimated_cost_per_volunteer: costPerVolunteer,
      },
      training_plan: {
        orientation_duration: "3시간",
        topics: [
          "행사 개요 및 프로그램 소개",
          "역할별 업무 안내",
          "현장 동선 및 시설 안내",
          "응급 상황 대처 요령",
          "고객 응대 기본 교육",
          "커뮤니케이션 채널 및 보고 체계",
        ],
        delivery_method: "대면 교육 + 온라인 사전 학습 병행",
      },
      management_structure: {
        volunteer_coordinator: "봉사자 총괄 코디네이터 1명",
        team_leads: Math.ceil(volunteersNeeded / 10),
        communication_channels: [
          "카카오톡 오픈채팅방",
          "현장 무전기 (팀장 대상)",
          "긴급 연락망",
        ],
      },
    },
    retention_strategies: [
      "명확한 역할 부여와 권한 위임",
      "정기적인 감사 표현 및 격려",
      "팀 빌딩 활동 (간단한 레크레이션)",
      "충분한 휴식 시간 보장",
      "피드백 수렴 및 즉시 반영",
      "우수 봉사자 추가 인센티브",
    ],
    evaluation_metrics: [
      { metric: "봉사자 충원율", measurement_method: "확정 인원 / 목표 인원 × 100" },
      { metric: "출석률", measurement_method: "실제 출석 / 배정 인원 × 100" },
      { metric: "봉사자 만족도", measurement_method: "사후 설문조사 (5점 척도)" },
      { metric: "운영팀 평가", measurement_method: "슈퍼바이저 피드백 종합" },
      { metric: "재참여 의향", measurement_method: "사후 설문 재참여 의향 문항" },
    ],
    budget_estimate: {
      total: totalBudget,
      breakdown,
    },
  };
}

export const HR_004_VolunteerProgram = {
  id: "HR-004",
  name: "Volunteer Program Design",
  description: "봉사자 프로그램 설계 및 관리 계획",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.4",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_004_InputSchema,
  outputSchema: HR_004_OutputSchema,
  persona: `당신은 봉사자 프로그램 전문가입니다.
봉사자의 동기 부여와 효과적인 관리 노하우를 보유하고 있습니다.
봉사자와 행사 모두에게 윈윈이 되는 프로그램을 설계합니다.`,
};

export default HR_004_VolunteerProgram;
