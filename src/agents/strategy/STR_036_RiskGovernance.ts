/**
 * STR-036: 리스크 거버넌스
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Governance)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Governance Agent for event planning.

Your expertise includes:
- Risk management framework design
- Roles and responsibilities definition
- Risk policies and procedures
- Governance structure optimization

CMP-IS Standard: Domain A - Strategic Planning (Risk Governance)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  organization_context: z.object({
    organization_size: z.enum(["small", "medium", "large"]),
    event_complexity: z.enum(["simple", "moderate", "complex"]),
    regulatory_requirements: z.array(z.string()).optional(),
    existing_frameworks: z.array(z.string()).optional(),
  }),
  stakeholder_roles: z.array(z.object({
    role: z.string(),
    current_responsibilities: z.array(z.string()).optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  governance_id: z.string().uuid(),
  event_id: z.string().uuid(),
  governance_framework: z.object({
    framework_name: z.string(),
    objectives: z.array(z.string()),
    principles: z.array(z.object({
      principle: z.string(),
      description: z.string(),
    })),
    scope: z.string(),
  }),
  organizational_structure: z.object({
    governance_bodies: z.array(z.object({
      body_name: z.string(),
      purpose: z.string(),
      composition: z.array(z.string()),
      meeting_frequency: z.string(),
      key_responsibilities: z.array(z.string()),
    })),
    reporting_lines: z.array(z.object({
      from: z.string(),
      to: z.string(),
      report_type: z.string(),
      frequency: z.string(),
    })),
  }),
  roles_and_responsibilities: z.array(z.object({
    role: z.string(),
    risk_responsibilities: z.array(z.string()),
    authority_level: z.enum(["strategic", "tactical", "operational"]),
    accountability: z.string(),
    decision_rights: z.array(z.string()),
  })),
  policies_and_procedures: z.array(z.object({
    policy_id: z.string(),
    policy_name: z.string(),
    purpose: z.string(),
    key_requirements: z.array(z.string()),
    applies_to: z.array(z.string()),
    review_frequency: z.string(),
  })),
  risk_appetite_statement: z.object({
    overall_appetite: z.enum(["risk_averse", "risk_neutral", "risk_seeking"]),
    by_category: z.array(z.object({
      category: z.string(),
      appetite: z.string(),
      tolerance_threshold: z.string(),
    })),
    boundaries: z.array(z.string()),
  }),
  assurance_mechanisms: z.array(z.object({
    mechanism: z.string(),
    purpose: z.string(),
    frequency: z.string(),
    responsible: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-036",
  taskName: "Risk Governance",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "리스크 관리 거버넌스 체계를 수립합니다.",
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

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { organization_context, event_name } = validated;
  const isLarge = organization_context.organization_size === "large" || organization_context.event_complexity === "complex";

  return {
    governance_id: generateUUID(),
    event_id: validated.event_id,
    governance_framework: {
      framework_name: `${event_name} 리스크 관리 프레임워크`,
      objectives: [
        "이벤트 목표 달성을 위한 리스크의 효과적 관리",
        "이해관계자 보호 및 신뢰 유지",
        "법규 준수 및 평판 보호",
        "지속적인 리스크 관리 역량 향상",
      ],
      principles: [
        { principle: "통합적 접근", description: "리스크 관리를 모든 의사결정 과정에 통합" },
        { principle: "투명성", description: "리스크 정보의 적시 공유 및 투명한 커뮤니케이션" },
        { principle: "책임성", description: "명확한 역할과 책임 부여" },
        { principle: "지속적 개선", description: "경험을 통한 학습과 개선" },
        { principle: "비례성", description: "리스크 수준에 비례한 대응" },
      ],
      scope: `${event_name} 기획, 준비, 실행, 사후 전 단계의 모든 리스크`,
    },
    organizational_structure: {
      governance_bodies: isLarge ? [
        {
          body_name: "리스크 관리 위원회",
          purpose: "전략적 리스크 감독 및 의사결정",
          composition: ["경영진", "총괄 책임자", "리스크 담당 임원"],
          meeting_frequency: "월 1회",
          key_responsibilities: ["리스크 정책 승인", "주요 리스크 검토", "자원 배분 결정"],
        },
        {
          body_name: "리스크 실무 그룹",
          purpose: "일상적 리스크 관리 실행",
          composition: ["리스크 담당자", "각 부문 대표"],
          meeting_frequency: "주 1회",
          key_responsibilities: ["리스크 식별/평가", "완화 계획 실행", "모니터링"],
        },
      ] : [
        {
          body_name: "리스크 관리 팀",
          purpose: "리스크 관리 전반",
          composition: ["프로젝트 매니저", "리스크 담당자"],
          meeting_frequency: "주 1회",
          key_responsibilities: ["리스크 전 과정 관리"],
        },
      ],
      reporting_lines: [
        { from: "리스크 담당자", to: "프로젝트 매니저", report_type: "일일 현황", frequency: "매일" },
        { from: "프로젝트 매니저", to: "경영진", report_type: "주간 요약", frequency: "주간" },
        { from: "리스크 담당자", to: "경영진", report_type: "Critical 리스크 즉시 보고", frequency: "발생 시 즉시" },
      ],
    },
    roles_and_responsibilities: [
      {
        role: "경영진/스폰서",
        risk_responsibilities: ["리스크 정책 승인", "자원 배분", "중대 리스크 의사결정"],
        authority_level: "strategic",
        accountability: "전체 리스크 관리 감독",
        decision_rights: ["정책 승인", "예산 승인", "이벤트 취소/변경 결정"],
      },
      {
        role: "프로젝트 매니저",
        risk_responsibilities: ["일상적 리스크 관리 감독", "팀 조율", "이해관계자 커뮤니케이션"],
        authority_level: "tactical",
        accountability: "운영 수준 리스크 관리",
        decision_rights: ["완화 조치 승인", "자원 재배분", "에스컬레이션"],
      },
      {
        role: "리스크 담당자",
        risk_responsibilities: ["리스크 식별/평가", "모니터링 실행", "보고서 작성"],
        authority_level: "operational",
        accountability: "리스크 관리 프로세스 실행",
        decision_rights: ["모니터링 방법 결정", "알림 발송"],
      },
      {
        role: "팀원",
        risk_responsibilities: ["담당 영역 리스크 식별", "이슈 보고", "완화 조치 실행"],
        authority_level: "operational",
        accountability: "담당 영역 리스크 관리",
        decision_rights: ["경미한 이슈 즉시 대응"],
      },
    ],
    policies_and_procedures: [
      {
        policy_id: "POL-001",
        policy_name: "리스크 관리 정책",
        purpose: "리스크 관리의 기본 원칙과 접근법 정의",
        key_requirements: ["체계적 리스크 식별", "정기 평가", "문서화"],
        applies_to: ["전체 팀"],
        review_frequency: "연 1회",
      },
      {
        policy_id: "POL-002",
        policy_name: "리스크 에스컬레이션 절차",
        purpose: "리스크 에스컬레이션 기준과 절차 정의",
        key_requirements: ["에스컬레이션 기준 준수", "적시 보고", "문서화"],
        applies_to: ["전체 팀"],
        review_frequency: "반기 1회",
      },
      {
        policy_id: "POL-003",
        policy_name: "비상 대응 절차",
        purpose: "비상 상황 대응 절차 정의",
        key_requirements: ["대응팀 구성", "연락망 유지", "훈련 실시"],
        applies_to: ["비상 대응팀", "운영팀"],
        review_frequency: "분기 1회",
      },
    ],
    risk_appetite_statement: {
      overall_appetite: "risk_neutral",
      by_category: [
        { category: "안전", appetite: "매우 낮음 (Risk Averse)", tolerance_threshold: "인명 사고 제로" },
        { category: "재정", appetite: "중간 (Risk Neutral)", tolerance_threshold: "예산의 10% 이내 초과" },
        { category: "운영", appetite: "중간 (Risk Neutral)", tolerance_threshold: "일정 지연 1주 이내" },
        { category: "평판", appetite: "낮음 (Risk Averse)", tolerance_threshold: "부정적 언론 보도 최소화" },
      ],
      boundaries: [
        "인명 안전을 위협하는 리스크는 절대 수용 불가",
        "법규 위반 리스크는 수용 불가",
        "이벤트 취소를 초래할 수 있는 리스크는 즉시 에스컬레이션",
      ],
    },
    assurance_mechanisms: [
      { mechanism: "내부 리스크 감사", purpose: "리스크 관리 프로세스 준수 확인", frequency: "분기 1회", responsible: "내부 감사팀" },
      { mechanism: "경영진 리뷰", purpose: "전략적 리스크 감독", frequency: "월 1회", responsible: "경영진" },
      { mechanism: "외부 감사 (필요시)", purpose: "독립적 검증", frequency: "연 1회", responsible: "외부 감사인" },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
