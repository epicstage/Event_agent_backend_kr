/**
 * HR-009: Onboarding Design
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 신규 인력 온보딩 프로그램 설계
 */

import { z } from "zod";

export const HR_009_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_date: z.string(),
  staff_types: z.array(z.enum(["full_time", "part_time", "contractor", "volunteer"])),
  departments: z.array(z.string()),
  onboarding_days_available: z.number().default(3),
  delivery_mode: z.enum(["in_person", "online", "hybrid"]).default("hybrid"),
});

export const HR_009_OutputSchema = z.object({
  event_id: z.string(),
  onboarding_program: z.object({
    program_name: z.string(),
    total_duration_hours: z.number(),
    delivery_mode: z.string(),
    phases: z.array(z.object({
      phase: z.string(),
      timing: z.string(),
      duration_hours: z.number(),
      objectives: z.array(z.string()),
      activities: z.array(z.object({
        activity: z.string(),
        duration_minutes: z.number(),
        format: z.string(),
        materials_needed: z.array(z.string()),
      })),
    })),
  }),
  welcome_kit: z.array(z.object({
    item: z.string(),
    purpose: z.string(),
    distribution_timing: z.string(),
  })),
  documentation_checklist: z.array(z.object({
    document: z.string(),
    required_for: z.array(z.string()),
    collection_method: z.string(),
  })),
  buddy_system: z.object({
    enabled: z.boolean(),
    buddy_ratio: z.string(),
    buddy_responsibilities: z.array(z.string()),
    matching_criteria: z.array(z.string()),
  }),
  success_metrics: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    measurement_method: z.string(),
  })),
});

export type HR_009_Input = z.infer<typeof HR_009_InputSchema>;
export type HR_009_Output = z.infer<typeof HR_009_OutputSchema>;

export async function execute(input: HR_009_Input): Promise<HR_009_Output> {
  const hoursPerDay = 4;
  const totalHours = input.onboarding_days_available * hoursPerDay;

  const phases = [
    {
      phase: "사전 온보딩 (Pre-boarding)",
      timing: "D-7 ~ D-3",
      duration_hours: 1,
      objectives: [
        "필수 서류 사전 수집",
        "온라인 기초 교육 완료",
        "커뮤니케이션 채널 가입",
      ],
      activities: [
        {
          activity: "환영 이메일 및 사전 안내 발송",
          duration_minutes: 0,
          format: "자동화 이메일",
          materials_needed: ["환영 이메일 템플릿", "사전 안내 문서"],
        },
        {
          activity: "온라인 사전 교육 수강",
          duration_minutes: 60,
          format: "e-Learning",
          materials_needed: ["LMS 접속 정보", "사전 교육 영상"],
        },
        {
          activity: "필수 서류 온라인 제출",
          duration_minutes: 30,
          format: "온라인 폼",
          materials_needed: ["서류 제출 링크", "제출 가이드"],
        },
      ],
    },
    {
      phase: "오리엔테이션 (Day 1)",
      timing: "D-2",
      duration_hours: totalHours * 0.4,
      objectives: [
        "행사 개요 및 목표 이해",
        "조직 구조 및 역할 파악",
        "팀원 소개 및 관계 형성",
      ],
      activities: [
        {
          activity: "환영 세션 및 아이스브레이킹",
          duration_minutes: 30,
          format: "그룹 활동",
          materials_needed: ["이름표", "간식", "아이스브레이킹 도구"],
        },
        {
          activity: "행사 비전 및 목표 공유",
          duration_minutes: 45,
          format: "프레젠테이션",
          materials_needed: ["PPT 자료", "프로젝터"],
        },
        {
          activity: "조직도 및 역할 소개",
          duration_minutes: 30,
          format: "프레젠테이션",
          materials_needed: ["조직도", "역할 설명서"],
        },
        {
          activity: "팀별 미팅 및 버디 매칭",
          duration_minutes: 45,
          format: "소그룹",
          materials_needed: ["팀별 공간", "버디 매칭 리스트"],
        },
        {
          activity: "시설 투어 (현장 또는 가상)",
          duration_minutes: 60,
          format: input.delivery_mode === "online" ? "가상 투어" : "현장 투어",
          materials_needed: input.delivery_mode === "online"
            ? ["360도 영상", "시설 안내 자료"]
            : ["투어 루트맵", "안전 조끼"],
        },
      ],
    },
    {
      phase: "직무 교육 (Day 2)",
      timing: "D-1",
      duration_hours: totalHours * 0.4,
      objectives: [
        "부서별 업무 프로세스 숙지",
        "시스템 및 장비 사용법 습득",
        "비상 상황 대응 훈련",
      ],
      activities: [
        {
          activity: "부서별 직무 교육",
          duration_minutes: 90,
          format: "워크숍",
          materials_needed: ["직무 매뉴얼", "체크리스트"],
        },
        {
          activity: "시스템 실습 (등록, POS 등)",
          duration_minutes: 60,
          format: "핸즈온 실습",
          materials_needed: ["연습용 계정", "실습 시나리오"],
        },
        {
          activity: "안전 및 비상대응 교육",
          duration_minutes: 45,
          format: "강의 + 실습",
          materials_needed: ["안전 매뉴얼", "비상연락망", "대피도"],
        },
        {
          activity: "Q&A 및 역할극",
          duration_minutes: 45,
          format: "인터랙티브",
          materials_needed: ["시나리오 카드", "피드백 양식"],
        },
      ],
    },
    {
      phase: "실전 리허설 (Day 3)",
      timing: "D-Day 오전",
      duration_hours: totalHours * 0.2,
      objectives: [
        "실제 환경에서 업무 시뮬레이션",
        "팀 협업 확인",
        "최종 점검 완료",
      ],
      activities: [
        {
          activity: "현장 배치 확인 및 장비 점검",
          duration_minutes: 30,
          format: "현장 실습",
          materials_needed: ["배치도", "장비 체크리스트"],
        },
        {
          activity: "모의 운영 (드라이런)",
          duration_minutes: 60,
          format: "시뮬레이션",
          materials_needed: ["시나리오", "타이머", "평가표"],
        },
        {
          activity: "최종 브리핑 및 동기부여",
          duration_minutes: 30,
          format: "전체 미팅",
          materials_needed: ["최종 안내사항", "응원 메시지"],
        },
      ],
    },
  ];

  return {
    event_id: input.event_id,
    onboarding_program: {
      program_name: `${input.event_name} 스태프 온보딩 프로그램`,
      total_duration_hours: totalHours,
      delivery_mode: input.delivery_mode,
      phases,
    },
    welcome_kit: [
      { item: "스태프 ID 카드", purpose: "신분 확인 및 출입 통제", distribution_timing: "오리엔테이션 당일" },
      { item: "유니폼/티셔츠", purpose: "소속감 및 통일성", distribution_timing: "오리엔테이션 당일" },
      { item: "스태프 핸드북", purpose: "필수 정보 참조", distribution_timing: "사전 발송 또는 당일 배포" },
      { item: "비상연락망 카드", purpose: "긴급 상황 대응", distribution_timing: "오리엔테이션 당일" },
      { item: "무전기/통신 장비", purpose: "실시간 커뮤니케이션", distribution_timing: "직무 교육 시" },
      { item: "식권 또는 케이터링 안내", purpose: "식사 제공", distribution_timing: "오리엔테이션 당일" },
      { item: "감사 카드/소정의 선물", purpose: "동기부여 및 감사 표현", distribution_timing: "행사 종료 후" },
    ],
    documentation_checklist: [
      { document: "신분증 사본", required_for: ["full_time", "part_time", "contractor"], collection_method: "온라인 제출" },
      { document: "근로계약서", required_for: ["full_time", "part_time"], collection_method: "서명 후 스캔 제출" },
      { document: "용역계약서", required_for: ["contractor"], collection_method: "서명 후 스캔 제출" },
      { document: "봉사자 서약서", required_for: ["volunteer"], collection_method: "온라인 서명" },
      { document: "개인정보 동의서", required_for: ["full_time", "part_time", "contractor", "volunteer"], collection_method: "온라인 서명" },
      { document: "통장 사본", required_for: ["full_time", "part_time", "contractor"], collection_method: "온라인 제출" },
      { document: "안전교육 이수증", required_for: ["full_time", "part_time", "contractor", "volunteer"], collection_method: "교육 완료 후 자동 발급" },
    ],
    buddy_system: {
      enabled: true,
      buddy_ratio: "1:3",
      buddy_responsibilities: [
        "신규 인력 현장 안내",
        "업무 관련 질문 응대",
        "첫 휴식시간 함께하기",
        "비상 상황 시 1차 연락처",
        "피드백 수집 및 전달",
      ],
      matching_criteria: [
        "동일 또는 유사 부서",
        "경험 있는 기존 스태프",
        "커뮤니케이션 능력 우수자",
        "가능한 경우 언어 매칭",
      ],
    },
    success_metrics: [
      { metric: "온보딩 완료율", target: "95% 이상", measurement_method: "출석 및 교육 이수 기록" },
      { metric: "사전 서류 제출률", target: "100%", measurement_method: "서류 수집 시스템" },
      { metric: "신규 스태프 만족도", target: "4.0/5.0 이상", measurement_method: "온보딩 후 설문조사" },
      { metric: "업무 숙지도 테스트", target: "80점 이상", measurement_method: "직무 퀴즈" },
      { metric: "첫날 이탈률", target: "5% 미만", measurement_method: "출석 체크 데이터" },
    ],
  };
}

export const HR_009_OnboardingDesign = {
  id: "HR-009",
  name: "Onboarding Design",
  description: "신규 인력 온보딩 프로그램 설계",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.9",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_009_InputSchema,
  outputSchema: HR_009_OutputSchema,
  persona: `당신은 온보딩 경험 디자이너입니다. 신규 인력이 빠르게 적응하고 소속감을 느낄 수 있는 체계적인 온보딩 프로그램을 설계합니다.`,
};

export default HR_009_OnboardingDesign;
