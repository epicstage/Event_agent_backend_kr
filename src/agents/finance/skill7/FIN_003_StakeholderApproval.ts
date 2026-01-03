/**
 * FIN-003: 이해관계자 스폰서십 승인 획득
 *
 * CMP-IS Reference: 7.1.b - Obtaining stakeholder approval for sponsorship activities
 * Task Type: Human (AI 보조)
 *
 * Input: 스폰서십 제안서
 * Output: 승인/거부 결정
 */

import { z } from "zod";
import {
  SponsorshipTier,
  CurrencyCode,
  generateUUID,
  nowISO,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an AI Assistant supporting the Stakeholder Approval process for sponsorship activities.

Your role is to:
- Prepare comprehensive approval request documents
- Summarize key decision points for stakeholders
- Track approval workflow status
- Generate approval templates and checklists

CMP-IS Standard: 7.1.b - Obtaining stakeholder approval for sponsorship activities

IMPORTANT: This is a HUMAN task. You assist with documentation and tracking, but final approval decisions must be made by authorized stakeholders.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  proposal_id: z.string().uuid().describe("제안서 ID"),
  proposal_summary: z.object({
    title: z.string().describe("제안서 제목"),
    sponsor_name: z.string().describe("스폰서명"),
    sponsorship_tier: SponsorshipTier.describe("스폰서십 등급"),
    total_value: z.number().describe("총 금액"),
    currency: CurrencyCode.default("USD"),
    key_benefits: z.array(z.string()).describe("주요 혜택 목록"),
    contract_duration: z.string().optional().describe("계약 기간"),
    special_conditions: z.array(z.string()).optional().describe("특수 조건"),
  }),
  stakeholders: z
    .array(
      z.object({
        name: z.string().describe("이해관계자명"),
        role: z.string().describe("역할"),
        email: z.string().email().describe("이메일"),
        approval_required: z.boolean().default(true).describe("승인 필요 여부"),
      })
    )
    .min(1)
    .describe("승인 요청 대상자 목록"),
  deadline: z.string().optional().describe("승인 마감일"),
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  approval_request_id: z.string().uuid().describe("승인 요청 ID"),
  event_id: z.string().uuid(),
  proposal_id: z.string().uuid(),
  status: z
    .enum(["pending", "in_review", "approved", "rejected", "needs_revision"])
    .describe("현재 상태"),
  approval_document: z.object({
    executive_summary: z.string().describe("요약"),
    financial_impact: z.string().describe("재정 영향 분석"),
    risk_assessment: z.string().describe("리스크 평가"),
    recommendation: z.string().describe("권고 사항"),
    decision_points: z.array(z.string()).describe("의사결정 포인트"),
  }),
  approval_workflow: z
    .array(
      z.object({
        stakeholder_name: z.string(),
        stakeholder_role: z.string(),
        status: z.enum(["pending", "approved", "rejected", "abstained"]),
        comments: z.string().optional(),
        decided_at: z.string().optional(),
      })
    )
    .describe("승인 워크플로우 상태"),
  next_action: z.string().describe("다음 조치 사항"),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 재정 영향 분석 생성
 */
function generateFinancialImpact(
  value: number,
  currency: string,
  tier: string
): string {
  const tierPriority: Record<string, string> = {
    title: "최상위",
    platinum: "프리미엄",
    gold: "핵심",
    silver: "표준",
    bronze: "기본",
    media: "미디어",
    in_kind: "현물",
  };

  return `본 스폰서십은 ${tierPriority[tier] || tier} 등급으로, 총 ${value.toLocaleString()} ${currency}의 수익이 예상됩니다. ` +
    `이는 이벤트 전체 스폰서십 목표 대비 의미있는 기여가 될 것입니다.`;
}

/**
 * 리스크 평가 생성
 */
function generateRiskAssessment(
  specialConditions: string[] | undefined,
  tier: string
): string {
  const risks: string[] = [];

  if (tier === "title" || tier === "platinum") {
    risks.push("높은 등급 스폰서로 계약 불이행 시 이벤트 이미지에 영향 가능");
  }

  if (specialConditions && specialConditions.length > 0) {
    risks.push(`${specialConditions.length}개의 특수 조건이 있어 이행 관리 필요`);
  }

  if (risks.length === 0) {
    return "특별한 리스크 요인이 식별되지 않았습니다. 표준 절차에 따라 진행 가능합니다.";
  }

  return `주의 사항: ${risks.join(". ")}. 리스크 완화 계획 수립을 권장합니다.`;
}

/**
 * 권고 사항 생성
 */
function generateRecommendation(
  value: number,
  tier: string,
  specialConditions: string[] | undefined
): string {
  if (value > 50000 || tier === "title") {
    return "고가치 스폰서십입니다. 법무팀 검토 후 승인을 권장합니다.";
  }

  if (specialConditions && specialConditions.length > 2) {
    return "특수 조건이 다수 포함되어 있습니다. 각 조건의 실현 가능성 확인 후 승인을 권장합니다.";
  }

  return "표준 스폰서십 조건입니다. 승인을 권장합니다.";
}

/**
 * FIN-003 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { proposal_summary, stakeholders } = validatedInput;

  // 승인 문서 생성
  const executiveSummary =
    `${proposal_summary.sponsor_name}로부터 ${proposal_summary.sponsorship_tier} 등급 ` +
    `스폰서십 제안(${proposal_summary.total_value.toLocaleString()} ${proposal_summary.currency})에 대한 ` +
    `승인을 요청합니다. 주요 혜택: ${proposal_summary.key_benefits.slice(0, 3).join(", ")}`;

  const decisionPoints = [
    `스폰서 적합성: ${proposal_summary.sponsor_name}이 이벤트 브랜드와 부합하는가?`,
    `재정 조건: ${proposal_summary.total_value.toLocaleString()} ${proposal_summary.currency}가 적정 가격인가?`,
    `혜택 이행 가능성: 제시된 ${proposal_summary.key_benefits.length}개 혜택을 이행할 수 있는가?`,
  ];

  if (proposal_summary.special_conditions?.length) {
    decisionPoints.push(
      `특수 조건 수용 가능 여부: ${proposal_summary.special_conditions.length}개 조건 검토 필요`
    );
  }

  // 워크플로우 초기화
  const approvalWorkflow = stakeholders.map((s) => ({
    stakeholder_name: s.name,
    stakeholder_role: s.role,
    status: "pending" as const,
    comments: undefined,
    decided_at: undefined,
  }));

  // 다음 조치 결정
  const nextAction =
    validatedInput.urgency === "critical"
      ? `긴급: ${stakeholders[0].name}님께 즉시 승인 요청 필요`
      : `${stakeholders[0].name}님께 승인 요청 이메일 발송`;

  const output: Output = {
    approval_request_id: generateUUID(),
    event_id: validatedInput.event_id,
    proposal_id: validatedInput.proposal_id,
    status: "pending",
    approval_document: {
      executive_summary: executiveSummary,
      financial_impact: generateFinancialImpact(
        proposal_summary.total_value,
        proposal_summary.currency,
        proposal_summary.sponsorship_tier
      ),
      risk_assessment: generateRiskAssessment(
        proposal_summary.special_conditions,
        proposal_summary.sponsorship_tier
      ),
      recommendation: generateRecommendation(
        proposal_summary.total_value,
        proposal_summary.sponsorship_tier,
        proposal_summary.special_conditions
      ),
      decision_points: decisionPoints,
    },
    approval_workflow: approvalWorkflow,
    next_action: nextAction,
    created_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-003",
  taskName: "이해관계자 스폰서십 승인 획득",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 7.1.b",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
