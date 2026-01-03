/**
 * HR-010: Team Structure Design
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 팀 구조 및 조직도 설계
 */

import { z } from "zod";

export const HR_010_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_scale: z.enum(["small", "medium", "large", "mega"]),
  total_staff_count: z.number(),
  departments: z.array(z.string()),
  event_duration_days: z.number(),
  management_style: z.enum(["flat", "hierarchical", "matrix"]).default("hierarchical"),
});

export const HR_010_OutputSchema = z.object({
  event_id: z.string(),
  organization_structure: z.object({
    structure_type: z.string(),
    total_levels: z.number(),
    span_of_control: z.object({
      recommended: z.string(),
      rationale: z.string(),
    }),
    org_chart: z.array(z.object({
      level: z.number(),
      role: z.string(),
      title: z.string(),
      reports_to: z.string().nullable(),
      direct_reports: z.number(),
      responsibilities: z.array(z.string()),
      decision_authority: z.array(z.string()),
    })),
  }),
  department_structure: z.array(z.object({
    department: z.string(),
    head_title: z.string(),
    team_size: z.number(),
    sub_teams: z.array(z.object({
      name: z.string(),
      lead_title: z.string(),
      members: z.number(),
      functions: z.array(z.string()),
    })),
  })),
  communication_flow: z.object({
    reporting_lines: z.array(z.object({
      from: z.string(),
      to: z.string(),
      type: z.enum(["direct", "dotted", "functional"]),
      frequency: z.string(),
    })),
    meeting_structure: z.array(z.object({
      meeting_name: z.string(),
      participants: z.array(z.string()),
      frequency: z.string(),
      duration: z.string(),
      purpose: z.string(),
    })),
    escalation_path: z.array(z.object({
      issue_type: z.string(),
      level_1: z.string(),
      level_2: z.string(),
      level_3: z.string(),
    })),
  }),
  key_positions: z.array(z.object({
    position: z.string(),
    criticality: z.enum(["essential", "important", "supporting"]),
    backup_required: z.boolean(),
    skills_required: z.array(z.string()),
  })),
});

export type HR_010_Input = z.infer<typeof HR_010_InputSchema>;
export type HR_010_Output = z.infer<typeof HR_010_OutputSchema>;

const SCALE_CONFIG = {
  small: { levels: 3, spanOfControl: "1:8-10", supervisorRatio: 0.1 },
  medium: { levels: 4, spanOfControl: "1:6-8", supervisorRatio: 0.12 },
  large: { levels: 5, spanOfControl: "1:5-7", supervisorRatio: 0.15 },
  mega: { levels: 6, spanOfControl: "1:4-6", supervisorRatio: 0.18 },
};

export async function execute(input: HR_010_Input): Promise<HR_010_Output> {
  const config = SCALE_CONFIG[input.event_scale];
  const avgDeptSize = Math.ceil(input.total_staff_count / input.departments.length);

  const orgChart = [
    {
      level: 1,
      role: "executive",
      title: "행사 총괄 디렉터",
      reports_to: null,
      direct_reports: Math.min(input.departments.length, 8),
      responsibilities: [
        "전체 행사 총괄 지휘",
        "주요 의사결정",
        "VIP 및 주요 이해관계자 대응",
        "위기 상황 최종 결정",
      ],
      decision_authority: [
        "행사 진행/중단 결정",
        "예산 초과 승인",
        "주요 변경사항 승인",
        "외부 커뮤니케이션 승인",
      ],
    },
    {
      level: 2,
      role: "director",
      title: "운영 부총괄",
      reports_to: "행사 총괄 디렉터",
      direct_reports: Math.ceil(input.departments.length / 2),
      responsibilities: [
        "일상 운영 총괄",
        "부서 간 조율",
        "총괄 디렉터 부재 시 대행",
        "운영 이슈 해결",
      ],
      decision_authority: [
        "운영 일정 조정",
        "인력 재배치",
        "소규모 예산 조정",
        "협력업체 현장 이슈 해결",
      ],
    },
  ];

  // 부서장 레벨
  for (let i = 0; i < input.departments.length; i++) {
    orgChart.push({
      level: 3,
      role: "manager",
      title: `${input.departments[i]} 매니저`,
      reports_to: "운영 부총괄",
      direct_reports: Math.ceil(avgDeptSize / 8),
      responsibilities: [
        `${input.departments[i]} 부서 관리`,
        "팀원 업무 배분 및 감독",
        "부서 내 이슈 해결",
        "타 부서 협업 조율",
      ],
      decision_authority: [
        "팀원 휴식 시간 조정",
        "부서 내 역할 재배치",
        "소모품 긴급 요청",
        "경미한 고객 불만 처리",
      ],
    });
  }

  // 팀 리더 레벨
  if (config.levels >= 4) {
    orgChart.push({
      level: 4,
      role: "team_lead",
      title: "팀 리더",
      reports_to: "부서 매니저",
      direct_reports: Math.min(8, Math.ceil(avgDeptSize / 3)),
      responsibilities: [
        "팀원 직접 감독",
        "현장 업무 지시",
        "팀 내 소통 관리",
        "즉각적인 문제 해결",
      ],
      decision_authority: [
        "업무 우선순위 조정",
        "팀원 위치 조정",
        "간단한 고객 요청 처리",
      ],
    });
  }

  // 일반 스태프 레벨
  orgChart.push({
    level: config.levels,
    role: "staff",
    title: "스태프",
    reports_to: config.levels >= 4 ? "팀 리더" : "부서 매니저",
    direct_reports: 0,
    responsibilities: [
      "담당 업무 수행",
      "고객 서비스 제공",
      "이슈 발생 시 보고",
      "팀 협업 참여",
    ],
    decision_authority: [
      "정해진 프로토콜 내 대응",
    ],
  });

  // 부서별 구조
  const departmentStructure = input.departments.map((dept) => {
    const deptSize = avgDeptSize;
    const subTeamCount = Math.ceil(deptSize / 10);

    return {
      department: dept,
      head_title: `${dept} 매니저`,
      team_size: deptSize,
      sub_teams: Array.from({ length: subTeamCount }, (_, i) => ({
        name: `${dept} ${i + 1}팀`,
        lead_title: `${dept} ${i + 1}팀 리더`,
        members: Math.ceil(deptSize / subTeamCount),
        functions: getDepartmentFunctions(dept),
      })),
    };
  });

  return {
    event_id: input.event_id,
    organization_structure: {
      structure_type: input.management_style,
      total_levels: config.levels,
      span_of_control: {
        recommended: config.spanOfControl,
        rationale: "효과적인 감독과 빠른 의사소통을 위한 최적 비율",
      },
      org_chart: orgChart,
    },
    department_structure: departmentStructure,
    communication_flow: {
      reporting_lines: [
        { from: "스태프", to: "팀 리더", type: "direct", frequency: "실시간" },
        { from: "팀 리더", to: "부서 매니저", type: "direct", frequency: "시간당 1회 또는 이슈 발생 시" },
        { from: "부서 매니저", to: "운영 부총괄", type: "direct", frequency: "세션별 1회" },
        { from: "운영 부총괄", to: "총괄 디렉터", type: "direct", frequency: "주요 이슈 발생 시" },
        { from: "부서 매니저", to: "타 부서 매니저", type: "dotted", frequency: "필요 시" },
      ],
      meeting_structure: [
        {
          meeting_name: "전체 브리핑",
          participants: ["총괄 디렉터", "운영 부총괄", "부서 매니저"],
          frequency: "매일 시작 전",
          duration: "30분",
          purpose: "일일 목표 공유 및 주요 이슈 점검",
        },
        {
          meeting_name: "부서별 조회",
          participants: ["부서 매니저", "팀 리더", "스태프"],
          frequency: "세션 시작 전",
          duration: "15분",
          purpose: "업무 배분 및 주의사항 전달",
        },
        {
          meeting_name: "리더십 미팅",
          participants: ["총괄 디렉터", "운영 부총괄", "부서 매니저"],
          frequency: "세션 종료 후",
          duration: "20분",
          purpose: "당일 이슈 리뷰 및 익일 준비",
        },
      ],
      escalation_path: [
        { issue_type: "고객 불만", level_1: "팀 리더", level_2: "부서 매니저", level_3: "운영 부총괄" },
        { issue_type: "안전 사고", level_1: "현장 안전요원", level_2: "안전 매니저", level_3: "총괄 디렉터" },
        { issue_type: "인력 부족", level_1: "팀 리더", level_2: "부서 매니저", level_3: "운영 부총괄" },
        { issue_type: "장비 고장", level_1: "담당 스태프", level_2: "기술 팀 리더", level_3: "운영 부총괄" },
        { issue_type: "VIP 이슈", level_1: "VIP 담당자", level_2: "VIP 매니저", level_3: "총괄 디렉터" },
      ],
    },
    key_positions: [
      {
        position: "행사 총괄 디렉터",
        criticality: "essential",
        backup_required: true,
        skills_required: ["리더십", "위기관리", "의사결정", "커뮤니케이션"],
      },
      {
        position: "운영 부총괄",
        criticality: "essential",
        backup_required: true,
        skills_required: ["운영관리", "조율능력", "문제해결", "멀티태스킹"],
      },
      {
        position: "안전 매니저",
        criticality: "essential",
        backup_required: true,
        skills_required: ["안전관리", "응급처치", "위기대응", "관련 자격증"],
      },
      {
        position: "등록 매니저",
        criticality: "important",
        backup_required: true,
        skills_required: ["시스템 운영", "고객서비스", "데이터관리"],
      },
      {
        position: "팀 리더",
        criticality: "important",
        backup_required: false,
        skills_required: ["팀 관리", "현장 경험", "커뮤니케이션"],
      },
    ],
  };
}

function getDepartmentFunctions(dept: string): string[] {
  const functions: Record<string, string[]> = {
    "등록": ["참가자 체크인", "배지 발급", "문의 응대", "데이터 입력"],
    "안내": ["행사장 안내", "길 안내", "정보 제공", "분실물 처리"],
    "케이터링": ["식음료 서빙", "테이블 세팅", "청결 유지", "재고 관리"],
    "기술": ["AV 장비 운영", "기술 지원", "장비 점검", "트러블슈팅"],
    "보안": ["출입 통제", "안전 순찰", "비상 대응", "분실물 관리"],
    "VIP": ["VIP 응대", "의전", "특별 요청 처리", "에스코트"],
  };
  return functions[dept] || ["담당 업무 수행", "팀 협업", "고객 서비스"];
}

export const HR_010_TeamStructure = {
  id: "HR-010",
  name: "Team Structure Design",
  description: "팀 구조 및 조직도 설계",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.10",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_010_InputSchema,
  outputSchema: HR_010_OutputSchema,
  persona: `당신은 조직설계 전문가입니다. 행사 규모와 특성에 맞는 효율적인 팀 구조와 명확한 책임 체계를 설계합니다.`,
};

export default HR_010_TeamStructure;
