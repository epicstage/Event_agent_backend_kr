/**
 * PRO-011: 법적 리스크 검토
 * CMP-IS Reference: 20.1.a - Legal risk assessment and review
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Legal Risk Assessment Specialist for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  contract_type: z.enum(["venue", "vendor", "sponsor", "speaker", "media", "participant"]).optional(),
  region_code: z.string().optional(),
  risk_categories: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  risk_assessment_id: z.string(),
  event_id: z.string(),
  overall_risk_profile: z.object({
    risk_level: z.enum(["low", "moderate", "high", "critical"]),
    risk_score: z.number(),
    assessment_date: z.string(),
    next_review_date: z.string(),
  }),
  risk_categories: z.array(z.object({
    category: z.string(),
    risk_level: z.enum(["low", "moderate", "high", "critical"]),
    likelihood: z.number(),
    impact: z.number(),
    risk_score: z.number(),
    key_concerns: z.array(z.string()),
    mitigation_status: z.enum(["mitigated", "partial", "unmitigated"]),
  })),
  contract_risks: z.array(z.object({
    contract_type: z.string(),
    party: z.string(),
    risk_items: z.array(z.object({
      clause: z.string(),
      risk_description: z.string(),
      recommendation: z.string(),
      priority: z.enum(["critical", "high", "medium", "low"]),
    })),
  })),
  regulatory_requirements: z.array(z.object({
    regulation: z.string(),
    jurisdiction: z.string(),
    compliance_status: z.enum(["compliant", "partial", "non_compliant", "pending"]),
    deadline: z.string(),
    action_required: z.string(),
  })),
  insurance_coverage: z.object({
    total_coverage: z.number(),
    policies: z.array(z.object({
      policy_type: z.string(),
      coverage_amount: z.number(),
      adequacy: z.enum(["adequate", "review_needed", "insufficient"]),
    })),
    gaps_identified: z.array(z.string()),
  }),
  recommendations: z.array(z.object({
    recommendation: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    responsible_party: z.string(),
    deadline: z.string(),
  })),
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

  return {
    risk_assessment_id: generateUUID(),
    event_id: validatedInput.event_id,
    overall_risk_profile: {
      risk_level: "moderate",
      risk_score: 58,
      assessment_date: new Date().toISOString(),
      next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    risk_categories: [
      {
        category: "계약 리스크",
        risk_level: "moderate",
        likelihood: 3,
        impact: 4,
        risk_score: 12,
        key_concerns: ["불리한 취소 조항", "책임 한도 불명확", "지적재산권 귀속"],
        mitigation_status: "partial",
      },
      {
        category: "규제 리스크",
        risk_level: "low",
        likelihood: 2,
        impact: 4,
        risk_score: 8,
        key_concerns: ["개인정보보호법 준수", "소방/안전 규정", "식품위생법"],
        mitigation_status: "mitigated",
      },
      {
        category: "운영 리스크",
        risk_level: "moderate",
        likelihood: 3,
        impact: 3,
        risk_score: 9,
        key_concerns: ["기상 악화", "공급업체 이행 불능", "참석자 안전"],
        mitigation_status: "partial",
      },
      {
        category: "재정 리스크",
        risk_level: "high",
        likelihood: 3,
        impact: 5,
        risk_score: 15,
        key_concerns: ["스폰서 철회", "예상 미달 등록", "환불 요청"],
        mitigation_status: "unmitigated",
      },
    ],
    contract_risks: [
      {
        contract_type: "베뉴 계약",
        party: "그랜드 컨벤션 센터",
        risk_items: [
          {
            clause: "취소 조항 (제8조)",
            risk_description: "30일 이내 취소 시 100% 위약금",
            recommendation: "Force Majeure 조항 확대 협상",
            priority: "high",
          },
          {
            clause: "책임 제한 (제12조)",
            risk_description: "베뉴 측 과실 시 배상 한도 불명확",
            recommendation: "최대 배상액 명시 조항 추가",
            priority: "medium",
          },
        ],
      },
      {
        contract_type: "스폰서 계약",
        party: "ABC 테크놀로지",
        risk_items: [
          {
            clause: "독점권 (제5조)",
            risk_description: "동종 업계 타 스폰서 유치 제한",
            recommendation: "독점 범위 명확화 필요",
            priority: "medium",
          },
        ],
      },
    ],
    regulatory_requirements: [
      {
        regulation: "개인정보보호법",
        jurisdiction: "대한민국",
        compliance_status: "compliant",
        deadline: new Date().toISOString(),
        action_required: "참가자 동의서 양식 확인 완료",
      },
      {
        regulation: "화재예방법",
        jurisdiction: "서울시",
        compliance_status: "pending",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        action_required: "소방서 사전 신고 및 안전 계획서 제출",
      },
      {
        regulation: "집회 및 시위에 관한 법률",
        jurisdiction: "대한민국",
        compliance_status: "compliant",
        deadline: new Date().toISOString(),
        action_required: "대규모 행사 신고 완료",
      },
    ],
    insurance_coverage: {
      total_coverage: 5000000000,
      policies: [
        { policy_type: "종합배상책임보험", coverage_amount: 3000000000, adequacy: "adequate" },
        { policy_type: "행사취소보험", coverage_amount: 1500000000, adequacy: "review_needed" },
        { policy_type: "재물보험", coverage_amount: 500000000, adequacy: "adequate" },
      ],
      gaps_identified: [
        "사이버 책임 보험 미가입",
        "행사취소보험 전염병 면책 조항 확인 필요",
      ],
    },
    recommendations: [
      {
        recommendation: "베뉴 계약 취소 조항 재협상",
        priority: "high",
        responsible_party: "법무팀",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        recommendation: "사이버 책임 보험 가입 검토",
        priority: "medium",
        responsible_party: "재무팀",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        recommendation: "소방서 사전 신고 완료",
        priority: "critical",
        responsible_party: "운영팀",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-011",
  taskName: "법적 리스크 검토",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.1.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.1: Legal Risk Assessment",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
