/**
 * HR-005: Training Program Design
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 스태프 교육 프로그램 설계
 */

import { z } from "zod";

export const HR_005_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  target_roles: z.array(z.string()),
  staff_count: z.number().min(1),
  training_days_available: z.number().min(1),
  include_online: z.boolean().default(true),
  special_requirements: z.array(z.string()).optional(),
});

export const HR_005_OutputSchema = z.object({
  event_id: z.string(),
  training_program: z.object({
    program_name: z.string(),
    total_duration_hours: z.number(),
    modules: z.array(z.object({
      module_id: z.string(),
      title: z.string(),
      duration_hours: z.number(),
      delivery_method: z.enum(["online", "in_person", "hybrid"]),
      mandatory: z.boolean(),
      target_roles: z.array(z.string()),
      learning_objectives: z.array(z.string()),
      content_outline: z.array(z.string()),
      assessment_method: z.string(),
    })),
    schedule: z.object({
      online_phase: z.object({
        start_date: z.string(),
        end_date: z.string(),
        modules: z.array(z.string()),
      }),
      onsite_phase: z.object({
        date: z.string(),
        location: z.string(),
        modules: z.array(z.string()),
      }),
    }),
    materials_needed: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      cost_estimate: z.number(),
    })),
  }),
  trainer_requirements: z.array(z.object({
    role: z.string(),
    count: z.number(),
    qualifications: z.array(z.string()),
  })),
  evaluation_plan: z.object({
    pre_assessment: z.string(),
    post_assessment: z.string(),
    passing_criteria: z.string(),
    certification: z.boolean(),
  }),
  budget_estimate: z.object({
    total: z.number(),
    breakdown: z.record(z.number()),
  }),
});

export type HR_005_Input = z.infer<typeof HR_005_InputSchema>;
export type HR_005_Output = z.infer<typeof HR_005_OutputSchema>;

const TRAINING_MODULES = [
  {
    id: "TM-001",
    title: "행사 개요 및 오리엔테이션",
    duration: 1,
    method: "hybrid" as const,
    mandatory: true,
    roles: ["all"],
    objectives: ["행사 목적과 비전 이해", "조직 구조 파악", "기대 역할 인식"],
    content: ["행사 소개", "조직도 및 지휘체계", "일정 개요", "질의응답"],
    assessment: "이해도 퀴즈",
  },
  {
    id: "TM-002",
    title: "고객 서비스 기본",
    duration: 2,
    method: "online" as const,
    mandatory: true,
    roles: ["all"],
    objectives: ["고객 응대 기본 원칙 습득", "문제 상황 대처법 학습", "서비스 마인드 함양"],
    content: ["인사와 첫인상", "경청과 공감", "불만 고객 응대", "문화적 다양성 이해"],
    assessment: "역할극 시연",
  },
  {
    id: "TM-003",
    title: "현장 안전 및 비상 대응",
    duration: 1.5,
    method: "hybrid" as const,
    mandatory: true,
    roles: ["all"],
    objectives: ["안전 수칙 숙지", "비상 대피 절차 학습", "응급 상황 초기 대응"],
    content: ["안전 규정", "비상구 및 대피 경로", "응급처치 기본", "보고 체계"],
    assessment: "비상 대피 훈련",
  },
  {
    id: "TM-004",
    title: "등록 시스템 운영",
    duration: 2,
    method: "in_person" as const,
    mandatory: false,
    roles: ["registration"],
    objectives: ["등록 시스템 조작법 숙달", "현장 등록 처리", "문제 해결"],
    content: ["시스템 로그인/사용법", "배지 출력", "현장 등록", "트러블슈팅"],
    assessment: "실습 테스트",
  },
  {
    id: "TM-005",
    title: "보안 및 출입 통제",
    duration: 2,
    method: "in_person" as const,
    mandatory: false,
    roles: ["security"],
    objectives: ["출입 통제 절차 숙지", "보안 검색 실시", "위험 상황 대응"],
    content: ["출입 정책", "검색 절차", "군중 통제", "긴급 대응"],
    assessment: "시나리오 테스트",
  },
  {
    id: "TM-006",
    title: "케이터링 서비스 교육",
    duration: 1.5,
    method: "in_person" as const,
    mandatory: false,
    roles: ["catering"],
    objectives: ["서빙 기술 습득", "위생 관리", "특수 식이 대응"],
    content: ["서빙 기본", "식품 위생", "알레르기 대응", "뷔페 관리"],
    assessment: "위생 퀴즈 + 실습",
  },
  {
    id: "TM-007",
    title: "AV 장비 운용",
    duration: 3,
    method: "in_person" as const,
    mandatory: false,
    roles: ["av_tech"],
    objectives: ["음향/영상 장비 조작", "프레젠테이션 지원", "트러블슈팅"],
    content: ["장비 개요", "마이크/스피커 설정", "프로젝터 연결", "녹화/스트리밍"],
    assessment: "실기 테스트",
  },
  {
    id: "TM-008",
    title: "VIP 의전 및 프로토콜",
    duration: 2,
    method: "in_person" as const,
    mandatory: false,
    roles: ["vip_services"],
    objectives: ["VIP 응대 프로토콜 숙지", "의전 기본 이해", "문제 상황 대처"],
    content: ["VIP 등급별 서비스", "에스코트 방법", "의전 순서", "비밀 유지"],
    assessment: "시나리오 역할극",
  },
  {
    id: "TM-009",
    title: "팀 리더십 및 스태프 관리",
    duration: 2,
    method: "hybrid" as const,
    mandatory: false,
    roles: ["supervisor", "coordinator"],
    objectives: ["팀 리딩 스킬 개발", "문제 해결 능력 향상", "동기 부여 기법"],
    content: ["리더십 스타일", "피드백 제공", "갈등 관리", "동기 부여"],
    assessment: "케이스 스터디",
  },
  {
    id: "TM-010",
    title: "커뮤니케이션 도구 사용법",
    duration: 1,
    method: "online" as const,
    mandatory: true,
    roles: ["all"],
    objectives: ["무전기 사용법 숙지", "보고 체계 이해", "디지털 도구 활용"],
    content: ["무전기 에티켓", "카카오톡 운영방 사용", "보고 양식", "에스컬레이션"],
    assessment: "통신 테스트",
  },
];

export async function execute(input: HR_005_Input): Promise<HR_005_Output> {
  // Filter modules based on target roles
  const relevantModules = TRAINING_MODULES.filter((m) =>
    m.roles.includes("all") || m.roles.some((r) => input.target_roles.some((tr) => tr.toLowerCase().includes(r)))
  );

  const modules = relevantModules.map((m) => ({
    module_id: m.id,
    title: m.title,
    duration_hours: m.duration,
    delivery_method: m.method,
    mandatory: m.mandatory,
    target_roles: m.roles.includes("all") ? input.target_roles : m.roles,
    learning_objectives: m.objectives,
    content_outline: m.content,
    assessment_method: m.assessment,
  }));

  const totalHours = modules.reduce((sum, m) => sum + m.duration_hours, 0);

  // Schedule calculation
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 30);

  const onlineStart = new Date(eventDate);
  onlineStart.setDate(onlineStart.getDate() - 14);

  const onlineEnd = new Date(eventDate);
  onlineEnd.setDate(onlineEnd.getDate() - 4);

  const onsiteDate = new Date(eventDate);
  onsiteDate.setDate(onsiteDate.getDate() - 2);

  // Materials calculation
  const materials = [
    { item: "교육 핸드북", quantity: input.staff_count, cost_estimate: 5000 * input.staff_count },
    { item: "명찰 및 명찰 홀더", quantity: input.staff_count, cost_estimate: 2000 * input.staff_count },
    { item: "필기구 세트", quantity: input.staff_count, cost_estimate: 1500 * input.staff_count },
    { item: "교육 수료증", quantity: input.staff_count, cost_estimate: 1000 * input.staff_count },
    { item: "간식 및 음료", quantity: Math.ceil(input.staff_count * 1.2), cost_estimate: 10000 * Math.ceil(input.staff_count / 20) },
  ];

  // Trainer requirements
  const trainers = [
    { role: "수석 트레이너", count: 1, qualifications: ["교육 경력 5년 이상", "행사 운영 경험"] },
    { role: "모듈별 전문 강사", count: Math.ceil(modules.length / 3), qualifications: ["해당 분야 전문가", "강의 경험"] },
    { role: "실습 보조 강사", count: Math.ceil(input.staff_count / 15), qualifications: ["현장 경험 2년 이상"] },
  ];

  // Budget calculation
  const trainerCost = trainers.reduce((sum, t) => sum + t.count * 300000, 0);
  const materialsCost = materials.reduce((sum, m) => sum + m.cost_estimate, 0);
  const venueCost = input.staff_count > 50 ? 500000 : 200000;
  const breakdown: Record<string, number> = {
    "강사비": trainerCost,
    "교육 자료비": materialsCost,
    "장소 대여비": venueCost,
    "온라인 플랫폼": 100000,
    "예비비": Math.round((trainerCost + materialsCost + venueCost) * 0.1),
  };

  return {
    event_id: input.event_id,
    training_program: {
      program_name: `${input.event_type} 스태프 역량 강화 프로그램`,
      total_duration_hours: totalHours,
      modules,
      schedule: {
        online_phase: {
          start_date: onlineStart.toISOString().split("T")[0],
          end_date: onlineEnd.toISOString().split("T")[0],
          modules: modules.filter((m) => m.delivery_method === "online" || m.delivery_method === "hybrid").map((m) => m.module_id),
        },
        onsite_phase: {
          date: onsiteDate.toISOString().split("T")[0],
          location: "행사장 또는 지정 교육장",
          modules: modules.filter((m) => m.delivery_method === "in_person" || m.delivery_method === "hybrid").map((m) => m.module_id),
        },
      },
      materials_needed: materials,
    },
    trainer_requirements: trainers,
    evaluation_plan: {
      pre_assessment: "온라인 사전 테스트 (기본 지식 평가)",
      post_assessment: "모듈별 평가 + 종합 테스트",
      passing_criteria: "전체 모듈 이수 + 평균 70점 이상",
      certification: true,
    },
    budget_estimate: {
      total: Object.values(breakdown).reduce((sum, v) => sum + v, 0),
      breakdown,
    },
  };
}

export const HR_005_TrainingDesign = {
  id: "HR-005",
  name: "Training Program Design",
  description: "스태프 교육 프로그램 설계",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.5",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_005_InputSchema,
  outputSchema: HR_005_OutputSchema,
  persona: `당신은 기업 교육 전문가입니다.
효과적인 성인 학습 이론과 실무 중심 교육 설계 경험이 풍부합니다.
온/오프라인 블렌디드 러닝을 통해 효율적인 교육을 제공합니다.`,
};

export default HR_005_TrainingDesign;
