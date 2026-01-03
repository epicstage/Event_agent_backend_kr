/**
 * FIN-004: 스폰서십 법적 검토 요청
 *
 * CMP-IS Reference: 7.1.c - Requesting legal review of sponsorship contracts
 * Task Type: Hybrid (AI 초안 + Human 검토)
 *
 * Input: 스폰서 계약 초안
 * Output: 법적 의견서
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

export const AGENT_PERSONA = `You are an AI Assistant for Legal Review Request preparation in sponsorship contracts.

Your role is to:
- Identify clauses requiring legal attention
- Flag potential legal risks and compliance issues
- Prepare structured review requests for legal team
- Track legal review status and deadlines

CMP-IS Standard: 7.1.c - Requesting legal review of sponsorship contracts

IMPORTANT: This is a HYBRID task. You prepare documentation and identify issues, but actual legal review must be performed by qualified legal professionals.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  contract_draft: z.object({
    contract_id: z.string().uuid().describe("계약 초안 ID"),
    sponsor_name: z.string().describe("스폰서명"),
    sponsorship_tier: SponsorshipTier,
    contract_value: z.number().describe("계약 금액"),
    currency: CurrencyCode.default("USD"),
    contract_start: z.string().describe("계약 시작일"),
    contract_end: z.string().describe("계약 종료일"),
    key_clauses: z
      .array(
        z.object({
          clause_number: z.string(),
          clause_title: z.string(),
          clause_content: z.string(),
        })
      )
      .describe("주요 계약 조항"),
    special_terms: z.array(z.string()).optional().describe("특수 조건"),
  }),
  review_priority: z.enum(["routine", "expedited", "urgent"]).default("routine"),
  specific_concerns: z.array(z.string()).optional().describe("특정 우려 사항"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  review_request_id: z.string().uuid().describe("검토 요청 ID"),
  event_id: z.string().uuid(),
  contract_id: z.string().uuid(),
  status: z
    .enum(["draft", "submitted", "in_review", "completed", "revision_needed"])
    .describe("검토 상태"),
  risk_flags: z
    .array(
      z.object({
        clause_number: z.string(),
        risk_level: z.enum(["low", "medium", "high", "critical"]),
        risk_category: z.enum([
          "liability",
          "ip_rights",
          "termination",
          "payment",
          "exclusivity",
          "compliance",
          "other",
        ]),
        description: z.string(),
        recommended_action: z.string(),
      })
    )
    .describe("위험 플래그"),
  review_checklist: z
    .array(
      z.object({
        item: z.string(),
        category: z.string(),
        requires_review: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .describe("검토 체크리스트"),
  estimated_review_time: z.string().describe("예상 검토 소요 시간"),
  legal_team_notes: z.string().optional().describe("법무팀 전달 사항"),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 조항 키워드 기반 리스크 카테고리 분류
 */
const RISK_KEYWORDS: Record<string, { category: string; baseLevel: string }> = {
  liability: { category: "liability", baseLevel: "high" },
  indemnify: { category: "liability", baseLevel: "high" },
  indemnification: { category: "liability", baseLevel: "high" },
  damages: { category: "liability", baseLevel: "medium" },
  intellectual: { category: "ip_rights", baseLevel: "high" },
  trademark: { category: "ip_rights", baseLevel: "medium" },
  copyright: { category: "ip_rights", baseLevel: "medium" },
  license: { category: "ip_rights", baseLevel: "medium" },
  termination: { category: "termination", baseLevel: "medium" },
  cancel: { category: "termination", baseLevel: "medium" },
  breach: { category: "termination", baseLevel: "high" },
  payment: { category: "payment", baseLevel: "medium" },
  refund: { category: "payment", baseLevel: "medium" },
  exclusive: { category: "exclusivity", baseLevel: "high" },
  "non-compete": { category: "exclusivity", baseLevel: "high" },
  compliance: { category: "compliance", baseLevel: "medium" },
  regulatory: { category: "compliance", baseLevel: "medium" },
};

/**
 * 조항 분석 및 리스크 플래그 생성
 */
function analyzeClause(clause: {
  clause_number: string;
  clause_title: string;
  clause_content: string;
}): z.infer<typeof OutputSchema>["risk_flags"][0] | null {
  const contentLower = clause.clause_content.toLowerCase();
  const titleLower = clause.clause_title.toLowerCase();
  const combined = `${titleLower} ${contentLower}`;

  for (const [keyword, config] of Object.entries(RISK_KEYWORDS)) {
    if (combined.includes(keyword)) {
      return {
        clause_number: clause.clause_number,
        risk_level: config.baseLevel as "low" | "medium" | "high" | "critical",
        risk_category: config.category as any,
        description: `"${clause.clause_title}" 조항에 ${keyword} 관련 내용이 포함되어 있습니다.`,
        recommended_action: `법무팀의 ${config.category} 전문가 검토 필요`,
      };
    }
  }

  return null;
}

/**
 * 표준 검토 체크리스트 생성
 */
function generateChecklist(
  contractValue: number,
  specialTerms: string[] | undefined
): z.infer<typeof OutputSchema>["review_checklist"] {
  const checklist = [
    {
      item: "계약 당사자 정보 정확성",
      category: "기본 사항",
      requires_review: true,
    },
    {
      item: "계약 기간 및 갱신 조건",
      category: "기본 사항",
      requires_review: true,
    },
    {
      item: "결제 조건 및 일정",
      category: "재무",
      requires_review: true,
    },
    {
      item: "혜택 제공 의무 명확성",
      category: "의무 사항",
      requires_review: true,
    },
    {
      item: "지식재산권 조항",
      category: "IP",
      requires_review: true,
    },
    {
      item: "책임 제한 조항",
      category: "책임",
      requires_review: true,
    },
    {
      item: "계약 해지 조건",
      category: "종료",
      requires_review: true,
    },
    {
      item: "분쟁 해결 조항",
      category: "분쟁",
      requires_review: true,
    },
  ];

  // 고액 계약 추가 검토
  if (contractValue > 100000) {
    checklist.push({
      item: "대규모 거래 승인 요건 충족 여부",
      category: "내부 통제",
      requires_review: true,
      notes: `계약 금액 ${contractValue.toLocaleString()} - 고액 거래 기준 초과`,
    } as any);
  }

  // 특수 조건 검토
  if (specialTerms && specialTerms.length > 0) {
    checklist.push({
      item: "특수 조건 적법성 및 이행 가능성",
      category: "특수 조건",
      requires_review: true,
      notes: `${specialTerms.length}개 특수 조건 포함`,
    } as any);
  }

  return checklist;
}

/**
 * 예상 검토 시간 산출
 */
function estimateReviewTime(
  priority: string,
  riskCount: number,
  contractValue: number
): string {
  let baseDays = 5;

  if (priority === "expedited") baseDays = 3;
  if (priority === "urgent") baseDays = 1;

  // 리스크 수에 따른 추가
  baseDays += Math.ceil(riskCount / 3);

  // 고액 계약 추가 시간
  if (contractValue > 100000) baseDays += 2;

  return `영업일 ${baseDays}일`;
}

/**
 * FIN-004 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { contract_draft } = validatedInput;

  // 조항별 리스크 분석
  const riskFlags: z.infer<typeof OutputSchema>["risk_flags"] = [];
  for (const clause of contract_draft.key_clauses) {
    const risk = analyzeClause(clause);
    if (risk) {
      riskFlags.push(risk);
    }
  }

  // 특수 조건 리스크 추가
  if (contract_draft.special_terms) {
    for (const term of contract_draft.special_terms) {
      riskFlags.push({
        clause_number: "Special",
        risk_level: "medium",
        risk_category: "other",
        description: `특수 조건: ${term}`,
        recommended_action: "특수 조건의 법적 구속력 및 이행 방안 검토 필요",
      });
    }
  }

  // 사용자 우려 사항 추가
  if (validatedInput.specific_concerns) {
    for (const concern of validatedInput.specific_concerns) {
      riskFlags.push({
        clause_number: "User",
        risk_level: "medium",
        risk_category: "other",
        description: `사용자 우려 사항: ${concern}`,
        recommended_action: "해당 우려 사항에 대한 법적 자문 필요",
      });
    }
  }

  // 체크리스트 생성
  const reviewChecklist = generateChecklist(
    contract_draft.contract_value,
    contract_draft.special_terms
  );

  // 법무팀 전달 사항
  const criticalRisks = riskFlags.filter(
    (r) => r.risk_level === "critical" || r.risk_level === "high"
  );
  const legalNotes =
    criticalRisks.length > 0
      ? `주의: ${criticalRisks.length}개의 고위험 항목이 식별되었습니다. 우선 검토 요청드립니다.`
      : undefined;

  const output: Output = {
    review_request_id: generateUUID(),
    event_id: validatedInput.event_id,
    contract_id: contract_draft.contract_id,
    status: "draft",
    risk_flags: riskFlags,
    review_checklist: reviewChecklist,
    estimated_review_time: estimateReviewTime(
      validatedInput.review_priority,
      riskFlags.length,
      contract_draft.contract_value
    ),
    legal_team_notes: legalNotes,
    created_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-004",
  taskName: "스폰서십 법적 검토 요청",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 7.1.c",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
