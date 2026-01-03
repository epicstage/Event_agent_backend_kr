/**
 * HR-002: Job Description Design
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 직무 설계 및 직무 기술서 작성
 */

import { z } from "zod";

export const HR_002_InputSchema = z.object({
  event_id: z.string().uuid(),
  position_type: z.enum([
    "registration", "security", "catering", "av_tech", "logistics",
    "vip_services", "information", "medical", "cleaning", "coordinator",
    "supervisor", "volunteer_lead", "interpreter", "photographer"
  ]),
  employment_type: z.enum(["full_time", "part_time", "contractor", "volunteer"]),
  service_level: z.enum(["basic", "standard", "premium"]).default("standard"),
  language_requirements: z.array(z.string()).optional(),
  special_requirements: z.array(z.string()).optional(),
});

export const HR_002_OutputSchema = z.object({
  event_id: z.string(),
  job_description: z.object({
    job_title: z.string(),
    job_code: z.string(),
    department: z.string(),
    reports_to: z.string(),
    summary: z.string(),
    key_responsibilities: z.array(z.string()),
    required_qualifications: z.object({
      education: z.string(),
      experience: z.string(),
      certifications: z.array(z.string()),
      skills: z.array(z.string()),
      languages: z.array(z.string()),
      physical_requirements: z.array(z.string()),
    }),
    preferred_qualifications: z.array(z.string()),
    working_conditions: z.object({
      schedule: z.string(),
      location: z.string(),
      physical_demands: z.string(),
      dress_code: z.string(),
    }),
    compensation: z.object({
      type: z.string(),
      rate_range: z.string(),
      benefits: z.array(z.string()),
    }),
  }),
  screening_criteria: z.array(z.object({
    criterion: z.string(),
    weight: z.number(),
    evaluation_method: z.string(),
  })),
  interview_questions: z.array(z.string()),
  onboarding_checklist: z.array(z.string()),
});

export type HR_002_Input = z.infer<typeof HR_002_InputSchema>;
export type HR_002_Output = z.infer<typeof HR_002_OutputSchema>;

const JOB_TEMPLATES: Record<string, {
  title: string;
  department: string;
  summary: string;
  responsibilities: string[];
  certifications: string[];
  skills: string[];
}> = {
  registration: {
    title: "등록 데스크 스태프",
    department: "Registration",
    summary: "참가자 등록 및 안내 업무를 담당하며, 원활한 행사 입장을 지원합니다.",
    responsibilities: [
      "참가자 등록 확인 및 배지 발급",
      "등록 시스템 운영 및 현장 등록 처리",
      "참가자 문의 응대 및 안내",
      "VIP 및 특별 참가자 별도 안내",
      "등록 데이터 정확성 관리",
    ],
    certifications: [],
    skills: ["고객응대", "데이터 입력", "문제 해결", "멀티태스킹"],
  },
  security: {
    title: "행사 보안 요원",
    department: "Security",
    summary: "행사장 내외부 보안을 담당하며, 참가자와 시설의 안전을 책임집니다.",
    responsibilities: [
      "출입 통제 및 보안 검색 실시",
      "행사장 순찰 및 이상 상황 보고",
      "긴급 상황 대응 및 대피 유도",
      "분실물 관리 및 처리",
      "VIP 경호 지원",
    ],
    certifications: ["경비업법 자격증", "응급처치 자격증"],
    skills: ["상황 판단력", "체력", "의사소통", "침착함"],
  },
  catering: {
    title: "케이터링 서비스 스태프",
    department: "F&B",
    summary: "식음료 서비스를 제공하며, 위생적이고 효율적인 케이터링을 담당합니다.",
    responsibilities: [
      "식음료 준비 및 서빙",
      "뷔페 테이블 관리 및 보충",
      "식기류 정리 및 위생 관리",
      "특수 식이요법 대응",
      "음료 서비스 및 바 운영 지원",
    ],
    certifications: ["위생교육 이수증", "식품위생관리사"],
    skills: ["서비스 마인드", "위생 의식", "팀워크", "체력"],
  },
  av_tech: {
    title: "AV 기술 스태프",
    department: "Technical",
    summary: "영상/음향 장비 운영 및 기술 지원을 담당합니다.",
    responsibilities: [
      "음향/영상 장비 설치 및 운영",
      "프레젠테이션 및 화상회의 기술 지원",
      "실시간 방송/스트리밍 운영",
      "장비 문제 해결 및 유지보수",
      "발표자 리허설 기술 지원",
    ],
    certifications: ["전기기능사", "방송장비기능사"],
    skills: ["기술 문제해결", "장비 운용", "신속한 대응", "프레젠테이션 SW"],
  },
  logistics: {
    title: "물류 운영 스태프",
    department: "Logistics",
    summary: "행사 물류 및 장비 이동을 담당하며, 효율적인 현장 운영을 지원합니다.",
    responsibilities: [
      "장비 및 물품 하역/적재",
      "전시물 설치 및 철거 지원",
      "재고 관리 및 물품 배분",
      "현장 레이아웃 구성 지원",
      "쓰레기 및 폐기물 처리",
    ],
    certifications: ["지게차 운전 면허"],
    skills: ["체력", "조직력", "안전 의식", "팀워크"],
  },
  vip_services: {
    title: "VIP 서비스 담당",
    department: "VIP Services",
    summary: "VIP 및 특별 참가자에게 맞춤형 서비스를 제공합니다.",
    responsibilities: [
      "VIP 영접 및 에스코트",
      "개인별 일정 관리 및 안내",
      "특별 요청 사항 처리",
      "VIP 라운지 관리",
      "의전 프로토콜 준수",
    ],
    certifications: ["호텔서비스사", "국제매너자격증"],
    skills: ["호스피탈리티", "외국어", "문제해결", "재량권"],
  },
  coordinator: {
    title: "행사 코디네이터",
    department: "Operations",
    summary: "행사 전반의 현장 운영을 조율하고 관리합니다.",
    responsibilities: [
      "현장 스태프 지휘 및 조율",
      "일정 관리 및 진행 모니터링",
      "문제 상황 신속 대응",
      "부서 간 커뮤니케이션 조율",
      "운영 보고서 작성",
    ],
    certifications: ["이벤트플래너자격증"],
    skills: ["리더십", "의사소통", "멀티태스킹", "위기관리"],
  },
  medical: {
    title: "현장 의료 스태프",
    department: "Medical",
    summary: "응급 상황 대응 및 참가자 건강 관리를 담당합니다.",
    responsibilities: [
      "응급 상황 초기 대응",
      "경미한 부상 및 질병 처치",
      "의료 시설 연계 및 이송",
      "의료 기록 관리",
      "건강 상담 제공",
    ],
    certifications: ["간호사 면허", "응급구조사 자격증", "BLS 인증"],
    skills: ["응급처치", "침착함", "판단력", "의사소통"],
  },
  information: {
    title: "안내 데스크 스태프",
    department: "Information",
    summary: "참가자에게 행사 정보와 안내 서비스를 제공합니다.",
    responsibilities: [
      "행사 정보 및 일정 안내",
      "시설 위치 및 동선 안내",
      "분실물 접수 및 안내",
      "관광 및 지역 정보 제공",
      "교통 정보 안내",
    ],
    certifications: ["관광통역안내사"],
    skills: ["고객응대", "지역지식", "외국어", "친절함"],
  },
  cleaning: {
    title: "시설 관리 스태프",
    department: "Facilities",
    summary: "행사장 청결 유지 및 시설 관리를 담당합니다.",
    responsibilities: [
      "행사장 청소 및 위생 관리",
      "화장실 청결 유지",
      "쓰레기 수거 및 분리수거",
      "소모품 보충",
      "오염 및 훼손 신속 처리",
    ],
    certifications: [],
    skills: ["성실함", "위생의식", "체력", "시간관리"],
  },
  supervisor: {
    title: "현장 슈퍼바이저",
    department: "Operations",
    summary: "담당 부서의 스태프를 관리하고 운영을 감독합니다.",
    responsibilities: [
      "담당 부서 스태프 관리 및 지도",
      "근무 배치 및 휴식 관리",
      "성과 모니터링 및 피드백",
      "문제 상황 에스컬레이션",
      "본부와 실시간 소통",
    ],
    certifications: [],
    skills: ["리더십", "의사소통", "문제해결", "스태프 관리"],
  },
  volunteer_lead: {
    title: "봉사자 팀장",
    department: "Volunteer Services",
    summary: "봉사자 팀을 이끌고 업무를 조율합니다.",
    responsibilities: [
      "봉사자 팀 관리 및 배치",
      "업무 지시 및 교육",
      "봉사자 근태 관리",
      "동기부여 및 격려",
      "봉사활동 기록 관리",
    ],
    certifications: [],
    skills: ["리더십", "동기부여", "조직력", "봉사정신"],
  },
  interpreter: {
    title: "현장 통역사",
    department: "Language Services",
    summary: "다국어 통역 및 번역 서비스를 제공합니다.",
    responsibilities: [
      "회의 및 세션 동시/순차 통역",
      "VIP 수행 통역",
      "현장 문서 번역 지원",
      "참가자 언어 지원",
      "다국어 안내 지원",
    ],
    certifications: ["통역번역사 자격증"],
    skills: ["언어능력", "순발력", "전문지식", "집중력"],
  },
  photographer: {
    title: "현장 포토그래퍼",
    department: "Media",
    summary: "행사 현장을 촬영하고 기록합니다.",
    responsibilities: [
      "주요 세션 및 순간 촬영",
      "참가자 인터뷰 촬영",
      "SNS용 실시간 사진 제공",
      "VIP 및 공식 촬영",
      "사진 선별 및 기본 편집",
    ],
    certifications: [],
    skills: ["촬영기술", "구도감각", "기민함", "사진편집"],
  },
};

export async function execute(input: HR_002_Input): Promise<HR_002_Output> {
  const template = JOB_TEMPLATES[input.position_type] || JOB_TEMPLATES.registration;

  const compensationRates: Record<string, { min: number; max: number }> = {
    full_time: { min: 15000, max: 30000 },
    part_time: { min: 12000, max: 20000 },
    contractor: { min: 25000, max: 50000 },
    volunteer: { min: 0, max: 0 },
  };

  const rate = compensationRates[input.employment_type];
  const benefits =
    input.employment_type === "volunteer"
      ? ["식사 제공", "교통비 지원", "봉사활동 인증서", "기념품"]
      : ["식사 제공", "교통비 지원", "유니폼 제공", "휴게 공간 이용"];

  const languages = input.language_requirements || ["한국어"];

  return {
    event_id: input.event_id,
    job_description: {
      job_title: template.title,
      job_code: `${input.position_type.toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      department: template.department,
      reports_to: input.position_type.includes("supervisor") ? "행사 총괄 매니저" : "현장 슈퍼바이저",
      summary: template.summary,
      key_responsibilities: template.responsibilities,
      required_qualifications: {
        education: input.position_type === "medical" ? "관련 학과 전공자" : "학력 무관",
        experience: input.service_level === "premium" ? "관련 경력 1년 이상" : "경력 무관 (경력자 우대)",
        certifications: template.certifications,
        skills: template.skills,
        languages,
        physical_requirements:
          ["security", "logistics", "cleaning"].includes(input.position_type)
            ? ["장시간 서서 근무 가능", "물건 운반 가능 (최대 20kg)"]
            : ["장시간 서서 근무 가능"],
      },
      preferred_qualifications: [
        "유사 행사 근무 경험자",
        "고객 서비스 경험자",
        languages.length > 1 ? "다국어 능통자" : "영어 회화 가능자",
      ],
      working_conditions: {
        schedule:
          input.employment_type === "full_time"
            ? "주 5일, 1일 8시간 (시프트제)"
            : "행사 기간 중 지정 시간대",
        location: "행사장 현장",
        physical_demands: "서서 근무, 이동 잦음",
        dress_code: "제공되는 유니폼 착용 필수",
      },
      compensation: {
        type: input.employment_type === "volunteer" ? "무보수 봉사" : "시급제",
        rate_range:
          input.employment_type === "volunteer"
            ? "봉사활동 (무보수)"
            : `시급 ${rate.min.toLocaleString()}원 ~ ${rate.max.toLocaleString()}원`,
        benefits,
      },
    },
    screening_criteria: [
      { criterion: "관련 경험", weight: 30, evaluation_method: "이력서 검토" },
      { criterion: "필수 자격증 보유", weight: 20, evaluation_method: "자격증 사본 확인" },
      { criterion: "언어 능력", weight: 20, evaluation_method: "면접 또는 테스트" },
      { criterion: "가용 시간대 적합성", weight: 15, evaluation_method: "일정 확인" },
      { criterion: "태도 및 서비스 마인드", weight: 15, evaluation_method: "면접 평가" },
    ],
    interview_questions: [
      "이전에 유사한 행사에서 근무한 경험이 있으신가요?",
      "예상치 못한 상황에서 어떻게 대처하셨나요?",
      "팀으로 일할 때 가장 중요하게 생각하는 것은 무엇인가요?",
      "이 포지션에 지원하신 동기는 무엇인가요?",
      "업무 중 고객과의 갈등 상황을 어떻게 해결하시겠습니까?",
    ],
    onboarding_checklist: [
      "신분증 사본 수집",
      "근로계약서 작성",
      "비밀유지 서약서 서명",
      "유니폼 사이즈 확인 및 지급",
      "사전 교육 일정 안내",
      "비상 연락처 수집",
      "현장 배치 및 동선 안내",
    ],
  };
}

export const HR_002_JobDesign = {
  id: "HR-002",
  name: "Job Description Design",
  description: "직무 설계 및 직무 기술서 작성",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.2",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_002_InputSchema,
  outputSchema: HR_002_OutputSchema,
  persona: `당신은 인사 관리 전문가로서 명확하고 실용적인 직무 기술서를 작성합니다.
각 포지션의 역할과 책임을 명확히 정의하여 채용과 운영 효율을 높입니다.`,
};

export default HR_002_JobDesign;
