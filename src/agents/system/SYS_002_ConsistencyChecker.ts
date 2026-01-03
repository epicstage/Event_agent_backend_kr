/**
 * SYS-002: Consistency Checker
 *
 * 새로운 지식이 기존 CMP 표준과 충돌하는지 검토하는 시스템 에이전트.
 * - CMP-IS 표준과의 일관성 검사
 * - 기존 에이전트 로직과의 충돌 감지
 * - 도메인 간 정합성 검증
 */

import { z } from "zod";

export const SYS_002_InputSchema = z.object({
  knowledge_id: z.string().uuid(),
  content_summary: z.string(),
  extracted_entities: z.array(z.record(z.unknown())).optional(),
  target_domain: z.enum(["strategy", "finance", "project", "marketing", "operations"]),
  target_agents: z.array(z.string()).optional(),
  new_rules: z
    .array(
      z.object({
        rule_type: z.string(),
        rule_content: z.string(),
        applies_to: z.string().optional(),
      })
    )
    .optional(),
  new_definitions: z
    .array(
      z.object({
        term: z.string(),
        definition: z.string(),
      })
    )
    .optional(),
});

export const SYS_002_OutputSchema = z.object({
  knowledge_id: z.string(),
  consistency_check: z.object({
    overall_status: z.enum(["consistent", "minor_conflicts", "major_conflicts", "incompatible"]),
    alignment_score: z.number().min(0).max(1),
    checked_at: z.string(),
  }),
  cmp_compliance: z.object({
    compliant: z.boolean(),
    compliance_score: z.number().min(0).max(1),
    violations: z.array(
      z.object({
        standard_id: z.string(),
        standard_name: z.string(),
        violation_type: z.enum(["contradiction", "gap", "ambiguity", "scope_mismatch"]),
        description: z.string(),
        severity: z.enum(["low", "medium", "high", "critical"]),
        suggested_resolution: z.string(),
      })
    ),
    recommendations: z.array(z.string()),
  }),
  agent_conflicts: z.array(
    z.object({
      agent_id: z.string(),
      agent_name: z.string(),
      conflict_type: z.enum(["logic", "data", "definition", "process", "output"]),
      description: z.string(),
      current_behavior: z.string(),
      new_behavior: z.string(),
      resolution_options: z.array(z.string()),
    })
  ),
  cross_domain_impacts: z.array(
    z.object({
      affected_domain: z.string(),
      impact_type: z.enum(["data_flow", "process", "definition", "calculation"]),
      description: z.string(),
      requires_update: z.boolean(),
    })
  ),
  approval_recommendation: z.object({
    can_auto_approve: z.boolean(),
    requires_review: z.boolean(),
    review_priority: z.enum(["low", "medium", "high", "urgent"]),
    review_notes: z.array(z.string()),
    suggested_reviewers: z.array(z.string()),
  }),
});

export type SYS_002_Input = z.infer<typeof SYS_002_InputSchema>;
export type SYS_002_Output = z.infer<typeof SYS_002_OutputSchema>;

// CMP-IS Standards Reference
const CMP_STANDARDS = {
  "CMP-A": {
    name: "Strategic Planning",
    domain: "strategy",
    skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
    key_principles: [
      "SMART 목표 설정",
      "이해관계자 중심 접근",
      "리스크 기반 의사결정",
      "전략-실행 정합성",
    ],
    required_outputs: ["event_goals", "stakeholder_map", "risk_register", "strategic_alignment"],
  },
  "CMP-B": {
    name: "Project Management",
    domain: "project",
    skills: ["Skill 5", "Skill 6"],
    key_principles: [
      "범위-일정-예산 균형",
      "마일스톤 기반 관리",
      "변경 통제 프로세스",
      "품질 기준 준수",
    ],
    required_outputs: ["project_plan", "wbs", "schedule", "resource_plan"],
  },
  "CMP-C": {
    name: "Marketing Management",
    domain: "marketing",
    skills: ["Skill 7", "Skill 8"],
    key_principles: [
      "타겟 청중 중심",
      "통합 마케팅 커뮤니케이션",
      "성과 측정 기반",
      "브랜드 일관성",
    ],
    required_outputs: ["marketing_strategy", "campaign_plan", "channel_mix", "performance_metrics"],
  },
  "CMP-D": {
    name: "Financial Management",
    domain: "finance",
    skills: ["Skill 7", "Skill 8", "Skill 9"],
    key_principles: [
      "예산 투명성",
      "ROI 기반 의사결정",
      "리스크 분산",
      "정확한 재무 보고",
    ],
    required_outputs: ["budget_structure", "pricing_model", "revenue_forecast", "financial_report"],
  },
  "CMP-E": {
    name: "Operations Management",
    domain: "operations",
    skills: ["Skill 9", "Skill 10"],
    key_principles: [
      "안전 최우선",
      "참가자 경험 중심",
      "효율적 자원 활용",
      "위기 대응 준비",
    ],
    required_outputs: ["venue_plan", "logistics_plan", "safety_plan", "operations_checklist"],
  },
};

// Definition conflicts checker
const STANDARD_DEFINITIONS: Record<string, string> = {
  ROI: "투자수익률 = (수익 - 비용) / 비용 × 100",
  손익분기점: "총 고정비용 / (단가 - 변동비)",
  NPS: "Net Promoter Score = 추천 비율 - 비추천 비율",
  이해관계자: "이벤트의 성공에 영향을 미치거나 영향을 받는 개인 또는 그룹",
  리스크: "이벤트 목표 달성에 부정적 영향을 미칠 수 있는 불확실한 사건",
};

/**
 * Check consistency of new knowledge against CMP standards
 */
export async function execute(input: SYS_002_Input): Promise<SYS_002_Output> {
  const violations: SYS_002_Output["cmp_compliance"]["violations"] = [];
  const agentConflicts: SYS_002_Output["agent_conflicts"] = [];
  const crossDomainImpacts: SYS_002_Output["cross_domain_impacts"] = [];

  // 1. Check CMP Standard compliance
  const targetStandard = Object.entries(CMP_STANDARDS).find(
    ([_, std]) => std.domain === input.target_domain
  );

  if (targetStandard) {
    const [standardId, standard] = targetStandard;

    // Check if new content aligns with key principles
    const contentLower = input.content_summary.toLowerCase();
    standard.key_principles.forEach((principle, idx) => {
      const principleKeywords = principle.toLowerCase().split(" ");
      const hasAlignment = principleKeywords.some((kw) => contentLower.includes(kw));
      if (!hasAlignment && contentLower.length > 100) {
        violations.push({
          standard_id: standardId,
          standard_name: standard.name,
          violation_type: "gap",
          description: `'${principle}' 원칙과의 명시적 연관성이 부족합니다.`,
          severity: "low",
          suggested_resolution: `${principle} 관련 내용을 보완하거나 관련성을 명시해주세요.`,
        });
      }
    });
  }

  // 2. Check definition conflicts
  if (input.new_definitions) {
    input.new_definitions.forEach((newDef) => {
      const standardDef = STANDARD_DEFINITIONS[newDef.term];
      if (standardDef && standardDef.toLowerCase() !== newDef.definition.toLowerCase()) {
        violations.push({
          standard_id: "DEF-001",
          standard_name: "Standard Definitions",
          violation_type: "contradiction",
          description: `'${newDef.term}' 정의가 표준 정의와 충돌합니다.`,
          severity: "high",
          suggested_resolution: `표준 정의: "${standardDef}" 사용을 권장합니다.`,
        });
      }
    });
  }

  // 3. Check for rule conflicts with existing agents
  if (input.new_rules && input.target_agents) {
    input.new_rules.forEach((rule) => {
      // Check if rule might conflict with agent logic
      const conflictKeywords = ["반드시", "절대", "항상", "무조건", "예외없이"];
      const hasStrictRule = conflictKeywords.some((kw) => rule.rule_content.includes(kw));

      if (hasStrictRule) {
        input.target_agents?.forEach((agentId) => {
          agentConflicts.push({
            agent_id: agentId,
            agent_name: `Agent ${agentId}`,
            conflict_type: "logic",
            description: `엄격한 규칙이 기존 에이전트 로직과 충돌할 수 있습니다: "${rule.rule_content}"`,
            current_behavior: "유연한 상황별 판단",
            new_behavior: rule.rule_content,
            resolution_options: [
              "규칙을 가이드라인으로 완화",
              "특정 조건에서만 적용되도록 제한",
              "기존 로직을 새 규칙으로 대체",
            ],
          });
        });
      }
    });
  }

  // 4. Check cross-domain impacts
  const domainDependencies: Record<string, string[]> = {
    strategy: ["finance", "project", "marketing", "operations"],
    finance: ["strategy", "project", "marketing"],
    project: ["strategy", "finance", "operations"],
    marketing: ["strategy", "finance"],
    operations: ["project", "finance"],
  };

  const affectedDomains = domainDependencies[input.target_domain] || [];
  affectedDomains.forEach((domain) => {
    // Check if content mentions cross-domain concepts
    const domainKeywords: Record<string, string[]> = {
      strategy: ["목표", "전략", "KPI"],
      finance: ["예산", "비용", "수익"],
      project: ["일정", "마일스톤", "태스크"],
      marketing: ["마케팅", "캠페인", "홍보"],
      operations: ["운영", "현장", "로지스틱"],
    };

    const keywords = domainKeywords[domain] || [];
    const hasCrossDomainReference = keywords.some((kw) =>
      input.content_summary.toLowerCase().includes(kw.toLowerCase())
    );

    if (hasCrossDomainReference) {
      crossDomainImpacts.push({
        affected_domain: domain,
        impact_type: "data_flow",
        description: `${domain} 도메인과 관련된 내용이 포함되어 있어 해당 도메인 에이전트 업데이트가 필요할 수 있습니다.`,
        requires_update: true,
      });
    }
  });

  // 5. Calculate overall scores
  const criticalViolations = violations.filter((v) => v.severity === "critical").length;
  const highViolations = violations.filter((v) => v.severity === "high").length;
  const mediumViolations = violations.filter((v) => v.severity === "medium").length;

  const complianceScore = Math.max(
    0,
    1 - criticalViolations * 0.3 - highViolations * 0.15 - mediumViolations * 0.05
  );

  const alignmentScore = Math.max(
    0,
    1 - agentConflicts.length * 0.1 - crossDomainImpacts.filter((i) => i.requires_update).length * 0.05
  );

  let overallStatus: SYS_002_Output["consistency_check"]["overall_status"];
  if (criticalViolations > 0 || complianceScore < 0.5) {
    overallStatus = "incompatible";
  } else if (highViolations > 0 || complianceScore < 0.7) {
    overallStatus = "major_conflicts";
  } else if (violations.length > 0 || agentConflicts.length > 0) {
    overallStatus = "minor_conflicts";
  } else {
    overallStatus = "consistent";
  }

  // 6. Determine approval recommendation
  const canAutoApprove =
    overallStatus === "consistent" && crossDomainImpacts.filter((i) => i.requires_update).length === 0;

  let reviewPriority: "low" | "medium" | "high" | "urgent";
  if (criticalViolations > 0) reviewPriority = "urgent";
  else if (highViolations > 0 || agentConflicts.length > 2) reviewPriority = "high";
  else if (violations.length > 0 || agentConflicts.length > 0) reviewPriority = "medium";
  else reviewPriority = "low";

  return {
    knowledge_id: input.knowledge_id,
    consistency_check: {
      overall_status: overallStatus,
      alignment_score: Math.round(alignmentScore * 100) / 100,
      checked_at: new Date().toISOString(),
    },
    cmp_compliance: {
      compliant: complianceScore >= 0.7,
      compliance_score: Math.round(complianceScore * 100) / 100,
      violations,
      recommendations: [
        violations.length > 0
          ? `${violations.length}개 항목에 대한 검토가 필요합니다.`
          : "CMP 표준과의 충돌이 없습니다.",
        ...violations.filter((v) => v.severity === "critical" || v.severity === "high").map((v) => v.suggested_resolution),
      ],
    },
    agent_conflicts: agentConflicts,
    cross_domain_impacts: crossDomainImpacts,
    approval_recommendation: {
      can_auto_approve: canAutoApprove,
      requires_review: !canAutoApprove,
      review_priority: reviewPriority,
      review_notes: [
        canAutoApprove
          ? "자동 승인 가능: CMP 표준과 일관성이 확인되었습니다."
          : "수동 검토 필요: 일부 충돌 또는 영향 분석이 필요합니다.",
        agentConflicts.length > 0 ? `${agentConflicts.length}개 에이전트와의 충돌 검토 필요` : "",
        crossDomainImpacts.filter((i) => i.requires_update).length > 0
          ? `${crossDomainImpacts.filter((i) => i.requires_update).length}개 도메인 업데이트 고려`
          : "",
      ].filter(Boolean),
      suggested_reviewers: [
        `${input.target_domain}_domain_admin`,
        ...crossDomainImpacts.filter((i) => i.requires_update).map((i) => `${i.affected_domain}_domain_admin`),
      ],
    },
  };
}

/**
 * AI-enhanced consistency check
 */
export async function checkWithAI(
  input: SYS_002_Input,
  ai: Ai
): Promise<SYS_002_Output> {
  // Get basic check first
  const basicResult = await execute(input);

  // Enhance with AI for semantic analysis
  const systemPrompt = `You are a consistency checker for an Event Management System based on CMP-IS Standards.
Your job is to identify potential conflicts between new knowledge and existing standards/agents.

Current CMP Standards for ${input.target_domain}:
${JSON.stringify(CMP_STANDARDS[`CMP-${input.target_domain.charAt(0).toUpperCase()}`], null, 2)}

Standard Definitions:
${JSON.stringify(STANDARD_DEFINITIONS, null, 2)}

Analyze the new content and identify any semantic conflicts or inconsistencies that the keyword-based check might have missed.`;

  const userPrompt = `New Knowledge Summary:
${input.content_summary}

Target Domain: ${input.target_domain}
Target Agents: ${input.target_agents?.join(", ") || "None specified"}

New Rules: ${input.new_rules ? JSON.stringify(input.new_rules) : "None"}
New Definitions: ${input.new_definitions ? JSON.stringify(input.new_definitions) : "None"}

Current Analysis:
- Violations found: ${basicResult.cmp_compliance.violations.length}
- Agent conflicts: ${basicResult.agent_conflicts.length}
- Cross-domain impacts: ${basicResult.cross_domain_impacts.length}

Identify any additional semantic conflicts or nuances that should be reviewed.
Respond in JSON format with additional_violations and additional_conflicts arrays.`;

  try {
    const aiResponse = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    });

    if (aiResponse && typeof aiResponse === "object" && "response" in aiResponse) {
      try {
        const responseText = aiResponse.response as string;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiEnhancement = JSON.parse(jsonMatch[0]);

          // Add AI-detected violations
          if (aiEnhancement.additional_violations) {
            basicResult.cmp_compliance.violations.push(
              ...aiEnhancement.additional_violations.map((v: Record<string, unknown>) => ({
                standard_id: "AI-DETECT",
                standard_name: "AI Semantic Analysis",
                violation_type: v.violation_type || "ambiguity",
                description: v.description || String(v),
                severity: v.severity || "medium",
                suggested_resolution: v.resolution || "관리자 검토 필요",
              }))
            );
          }

          // Recalculate if AI found more issues
          if (aiEnhancement.additional_violations?.length > 0 || aiEnhancement.additional_conflicts?.length > 0) {
            basicResult.approval_recommendation.can_auto_approve = false;
            basicResult.approval_recommendation.requires_review = true;
            basicResult.approval_recommendation.review_notes.push(
              "AI 분석에서 추가 검토 항목이 발견되었습니다."
            );
          }
        }
      } catch {
        // Keep basic result if AI parsing fails
      }
    }
  } catch {
    // Keep basic result if AI fails
  }

  return basicResult;
}

export const SYS_002_ConsistencyChecker = {
  id: "SYS-002",
  name: "Consistency Checker",
  description: "새로운 지식이 기존 CMP 표준과 충돌하는지 검토",
  type: "consistency_checker",
  execute,
  checkWithAI,
  InputSchema: SYS_002_InputSchema,
  OutputSchema: SYS_002_OutputSchema,
  requires_confirmation: false,
  can_write_kb: false,
};

export default SYS_002_ConsistencyChecker;
