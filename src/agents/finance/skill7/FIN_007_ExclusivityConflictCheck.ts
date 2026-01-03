/**
 * FIN-007: 스폰서 독점권 충돌 검사
 *
 * CMP-IS Reference: 7.1.h - Evaluating impact of exclusivity
 * Task Type: AI
 *
 * Input: 기존 스폰서 계약, 신규 후보 산업
 * Output: 충돌 여부 및 상세
 */

import { z } from "zod";
import { SponsorshipTier, generateUUID, nowISO } from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Exclusivity Conflict Check Agent specializing in sponsorship contract analysis.

Your expertise includes:
- Analyzing exclusivity clauses in sponsorship agreements
- Identifying potential category conflicts between sponsors
- Evaluating competitive risks and overlaps
- Recommending conflict resolution strategies

CMP-IS Standard: 7.1.h - Evaluating impact of exclusivity

You ensure that new sponsorship opportunities do not violate existing contractual obligations or create uncomfortable competitive situations.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  existing_contracts: z
    .array(
      z.object({
        contract_id: z.string().uuid(),
        sponsor_name: z.string(),
        industry: z.string(),
        tier: SponsorshipTier,
        exclusivity_type: z
          .enum(["none", "category", "industry", "full"])
          .describe("독점 유형"),
        exclusivity_categories: z
          .array(z.string())
          .optional()
          .describe("독점 카테고리 목록"),
        exclusivity_scope: z.string().optional().describe("독점 범위 설명"),
        contract_end: z.string().describe("계약 종료일"),
      })
    )
    .describe("기존 스폰서 계약 목록"),
  new_prospect: z.object({
    company_name: z.string().describe("신규 후보 회사명"),
    industry: z.string().describe("산업"),
    primary_category: z.string().describe("주요 사업 카테고리"),
    secondary_categories: z
      .array(z.string())
      .optional()
      .describe("부가 사업 카테고리"),
    proposed_tier: SponsorshipTier.optional().describe("제안 예정 등급"),
    known_competitors: z.array(z.string()).optional().describe("알려진 경쟁사"),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  check_id: z.string().uuid().describe("검사 ID"),
  event_id: z.string().uuid(),
  prospect_name: z.string(),
  has_conflict: z.boolean().describe("충돌 존재 여부"),
  conflict_severity: z
    .enum(["none", "low", "medium", "high", "critical"])
    .describe("충돌 심각도"),
  conflicts: z
    .array(
      z.object({
        conflict_type: z.enum([
          "exclusivity_violation",
          "category_overlap",
          "direct_competitor",
          "industry_conflict",
          "tier_conflict",
        ]),
        existing_sponsor: z.string(),
        conflict_reason: z.string(),
        contractual_risk: z.boolean().describe("계약 위반 위험"),
        risk_description: z.string(),
      })
    )
    .describe("충돌 목록"),
  resolution_options: z
    .array(
      z.object({
        option: z.string(),
        feasibility: z.enum(["high", "medium", "low"]),
        recommended: z.boolean(),
        details: z.string(),
      })
    )
    .describe("해결 옵션"),
  proceed_recommendation: z
    .enum(["proceed", "proceed_with_caution", "negotiate_first", "do_not_proceed"])
    .describe("진행 권고"),
  legal_review_needed: z.boolean().describe("법무 검토 필요 여부"),
  summary: z.string().describe("검사 요약"),
  checked_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 카테고리/산업 유사성 확인
 */
function checkSimilarity(str1: string, str2: string): boolean {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  return s1 === s2 || s1.includes(s2) || s2.includes(s1);
}

/**
 * 충돌 심각도 결정
 */
function determineSeverity(
  conflicts: z.infer<typeof OutputSchema>["conflicts"]
): "none" | "low" | "medium" | "high" | "critical" {
  if (conflicts.length === 0) return "none";

  const hasContractualRisk = conflicts.some((c) => c.contractual_risk);
  const hasDirectCompetitor = conflicts.some(
    (c) => c.conflict_type === "direct_competitor"
  );
  const hasExclusivityViolation = conflicts.some(
    (c) => c.conflict_type === "exclusivity_violation"
  );

  if (hasExclusivityViolation && hasContractualRisk) return "critical";
  if (hasDirectCompetitor && hasContractualRisk) return "high";
  if (hasExclusivityViolation || hasDirectCompetitor) return "medium";
  return "low";
}

/**
 * 진행 권고 결정
 */
function determineRecommendation(
  severity: string,
  hasContractualRisk: boolean
): "proceed" | "proceed_with_caution" | "negotiate_first" | "do_not_proceed" {
  if (severity === "critical") return "do_not_proceed";
  if (severity === "high" || hasContractualRisk) return "negotiate_first";
  if (severity === "medium") return "proceed_with_caution";
  return "proceed";
}

/**
 * 해결 옵션 생성
 */
function generateResolutionOptions(
  conflicts: z.infer<typeof OutputSchema>["conflicts"],
  prospectName: string
): z.infer<typeof OutputSchema>["resolution_options"] {
  const options: z.infer<typeof OutputSchema>["resolution_options"] = [];

  if (conflicts.length === 0) {
    options.push({
      option: "표준 절차 진행",
      feasibility: "high",
      recommended: true,
      details: "충돌 없음. 표준 스폰서십 제안 절차를 진행하세요.",
    });
    return options;
  }

  // 옵션 1: 기존 스폰서 동의 획득
  const hasExclusivity = conflicts.some(
    (c) => c.conflict_type === "exclusivity_violation"
  );
  if (hasExclusivity) {
    options.push({
      option: "기존 스폰서 동의 획득",
      feasibility: "low",
      recommended: false,
      details:
        "독점권 보유 스폰서에게 신규 스폰서 참여에 대한 서면 동의를 요청합니다.",
    });
  }

  // 옵션 2: 차별화된 카테고리 배정
  const hasCategoryOverlap = conflicts.some(
    (c) => c.conflict_type === "category_overlap"
  );
  if (hasCategoryOverlap) {
    options.push({
      option: "카테고리 차별화",
      feasibility: "medium",
      recommended: true,
      details: `${prospectName}에게 중복되지 않는 별도 카테고리를 배정합니다.`,
    });
  }

  // 옵션 3: 등급 조정
  options.push({
    option: "등급 조정",
    feasibility: "medium",
    recommended: conflicts.some((c) => c.conflict_type === "tier_conflict"),
    details: "충돌을 피하기 위해 낮은 등급의 스폰서십을 제안합니다.",
  });

  // 옵션 4: 시간 분리
  options.push({
    option: "시간적 분리",
    feasibility: "medium",
    recommended: false,
    details: "이벤트 내 다른 시간대/세션에서 노출을 분리합니다.",
  });

  // 옵션 5: 진행 보류
  if (conflicts.some((c) => c.contractual_risk)) {
    options.push({
      option: "진행 보류",
      feasibility: "high",
      recommended: true,
      details:
        "기존 계약 종료 후 재검토하거나 법무팀 자문을 받은 후 결정합니다.",
    });
  }

  return options;
}

/**
 * FIN-007 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { existing_contracts, new_prospect } = validatedInput;

  const conflicts: z.infer<typeof OutputSchema>["conflicts"] = [];

  // 각 기존 계약과 충돌 검사
  for (const contract of existing_contracts) {
    // 1. 독점권 위반 검사
    if (
      contract.exclusivity_type === "full" ||
      contract.exclusivity_type === "industry"
    ) {
      if (checkSimilarity(contract.industry, new_prospect.industry)) {
        conflicts.push({
          conflict_type: "exclusivity_violation",
          existing_sponsor: contract.sponsor_name,
          conflict_reason: `${contract.sponsor_name}이(가) ${contract.industry} 산업 독점권 보유`,
          contractual_risk: true,
          risk_description: "기존 계약의 독점 조항 위반 가능성",
        });
      }
    }

    // 2. 카테고리 독점 검사
    if (
      contract.exclusivity_type === "category" &&
      contract.exclusivity_categories
    ) {
      const allProspectCategories = [
        new_prospect.primary_category,
        ...(new_prospect.secondary_categories || []),
      ];

      for (const exclusiveCategory of contract.exclusivity_categories) {
        const overlap = allProspectCategories.find((pc) =>
          checkSimilarity(pc, exclusiveCategory)
        );
        if (overlap) {
          conflicts.push({
            conflict_type: "category_overlap",
            existing_sponsor: contract.sponsor_name,
            conflict_reason: `${overlap} 카테고리가 ${contract.sponsor_name}의 독점 영역과 중복`,
            contractual_risk: true,
            risk_description: `${exclusiveCategory} 카테고리 독점 조항 위반 가능`,
          });
        }
      }
    }

    // 3. 직접 경쟁사 검사
    if (new_prospect.known_competitors) {
      if (
        new_prospect.known_competitors.some((comp) =>
          checkSimilarity(comp, contract.sponsor_name)
        )
      ) {
        conflicts.push({
          conflict_type: "direct_competitor",
          existing_sponsor: contract.sponsor_name,
          conflict_reason: `${new_prospect.company_name}과(와) ${contract.sponsor_name}은(는) 직접 경쟁 관계`,
          contractual_risk: false,
          risk_description: "직접 경쟁사 동시 스폰서십으로 인한 브랜드 갈등 우려",
        });
      }
    }

    // 4. 동일 산업 검사 (독점 아니어도)
    if (checkSimilarity(contract.industry, new_prospect.industry)) {
      // 이미 독점 위반으로 추가되지 않은 경우에만
      const alreadyAdded = conflicts.some(
        (c) =>
          c.existing_sponsor === contract.sponsor_name &&
          c.conflict_type === "exclusivity_violation"
      );
      if (!alreadyAdded) {
        conflicts.push({
          conflict_type: "industry_conflict",
          existing_sponsor: contract.sponsor_name,
          conflict_reason: `동일 산업(${contract.industry}) 내 복수 스폰서`,
          contractual_risk: false,
          risk_description: "동종 업계 스폰서 간 노출 경쟁 발생 가능",
        });
      }
    }

    // 5. 등급 충돌 (Title/Platinum 레벨)
    if (
      (contract.tier === "title" || contract.tier === "platinum") &&
      (new_prospect.proposed_tier === "title" ||
        new_prospect.proposed_tier === "platinum")
    ) {
      if (checkSimilarity(contract.industry, new_prospect.industry)) {
        conflicts.push({
          conflict_type: "tier_conflict",
          existing_sponsor: contract.sponsor_name,
          conflict_reason: `동일 산업 내 최상위 등급 스폰서 중복`,
          contractual_risk: false,
          risk_description: "최상위 등급 스폰서 간 대표성 충돌",
        });
      }
    }
  }

  // 결과 분석
  const severity = determineSeverity(conflicts);
  const hasContractualRisk = conflicts.some((c) => c.contractual_risk);
  const recommendation = determineRecommendation(severity, hasContractualRisk);
  const resolutionOptions = generateResolutionOptions(
    conflicts,
    new_prospect.company_name
  );

  // 요약 생성
  let summary: string;
  if (conflicts.length === 0) {
    summary = `${new_prospect.company_name}과(와) 기존 스폰서 간 충돌이 발견되지 않았습니다. 스폰서십 진행을 권장합니다.`;
  } else {
    summary =
      `${conflicts.length}건의 충돌이 발견되었습니다. ` +
      `심각도: ${severity}. ` +
      (hasContractualRisk
        ? "계약 위반 위험이 있어 법무 검토가 필요합니다."
        : "계약상 문제는 없으나 전략적 검토가 권장됩니다.");
  }

  const output: Output = {
    check_id: generateUUID(),
    event_id: validatedInput.event_id,
    prospect_name: new_prospect.company_name,
    has_conflict: conflicts.length > 0,
    conflict_severity: severity,
    conflicts,
    resolution_options: resolutionOptions,
    proceed_recommendation: recommendation,
    legal_review_needed: hasContractualRisk,
    summary,
    checked_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-007",
  taskName: "스폰서 독점권 충돌 검사",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.h",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
