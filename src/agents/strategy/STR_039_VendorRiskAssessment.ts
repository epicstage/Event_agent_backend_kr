/**
 * STR-039: 벤더 리스크 평가
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Vendor Risk Assessment)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Vendor Risk Assessment Agent for event planning.

Your expertise includes:
- Vendor due diligence
- Supply chain risk analysis
- Vendor performance risk assessment
- Contractual risk management

CMP-IS Standard: Domain A - Strategic Planning (Vendor Risk Assessment)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  vendors: z.array(z.object({
    vendor_id: z.string(),
    vendor_name: z.string(),
    service_category: z.string(),
    criticality: z.enum(["critical", "high", "medium", "low"]),
    contract_value: z.number().optional(),
    previous_experience: z.boolean().optional(),
    financial_stability: z.enum(["strong", "stable", "concerning", "unknown"]).optional(),
    backup_available: z.boolean().optional(),
  })),
  event_context: z.object({
    event_date: z.string(),
    lead_time_weeks: z.number().optional(),
    budget_flexibility: z.enum(["none", "limited", "moderate", "high"]).optional(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string().uuid(),
  event_id: z.string().uuid(),
  vendor_risk_profiles: z.array(z.object({
    vendor_id: z.string(),
    vendor_name: z.string(),
    service_category: z.string(),
    risk_score: z.number(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    risk_factors: z.array(z.object({
      factor: z.string(),
      assessment: z.string(),
      score: z.number(),
    })),
    key_risks: z.array(z.object({
      risk: z.string(),
      likelihood: z.enum(["low", "medium", "high"]),
      impact: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    })),
    contract_recommendations: z.array(z.string()),
    monitoring_requirements: z.array(z.string()),
  })),
  supply_chain_analysis: z.object({
    single_points_of_failure: z.array(z.object({
      vendor: z.string(),
      service: z.string(),
      risk: z.string(),
      mitigation: z.string(),
    })),
    dependency_map: z.array(z.object({
      primary_vendor: z.string(),
      dependencies: z.array(z.string()),
      risk_if_failure: z.string(),
    })),
    overall_supply_chain_risk: z.enum(["low", "medium", "high"]),
  }),
  contingency_recommendations: z.array(z.object({
    vendor_id: z.string(),
    contingency_type: z.enum(["backup_vendor", "in_house", "reduce_scope", "insurance"]),
    recommendation: z.string(),
    estimated_cost: z.string(),
    activation_trigger: z.string(),
  })),
  due_diligence_checklist: z.array(z.object({
    vendor_id: z.string(),
    checklist_items: z.array(z.object({
      item: z.string(),
      status: z.enum(["complete", "pending", "not_applicable"]),
      notes: z.string().optional(),
    })),
  })),
  summary: z.object({
    total_vendors: z.number(),
    high_risk_vendors: z.number(),
    total_contract_value_at_risk: z.number(),
    priority_actions: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-039",
  taskName: "Vendor Risk Assessment",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "벤더/공급업체 리스크를 평가하고 관리 전략을 수립합니다.",
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

type RiskLevel = "low" | "medium" | "high" | "critical";

function calculateVendorRiskScore(vendor: {
  criticality: string;
  financial_stability?: string;
  previous_experience?: boolean;
  backup_available?: boolean;
}): { score: number; level: RiskLevel } {
  let score = 0;

  // Criticality impact
  score += { critical: 40, high: 30, medium: 20, low: 10 }[vendor.criticality] || 20;

  // Financial stability
  const stability = vendor.financial_stability || "unknown";
  score += { strong: 0, stable: 10, concerning: 30, unknown: 20 }[stability] || 20;

  // Previous experience
  score += vendor.previous_experience ? 0 : 15;

  // Backup availability
  score += vendor.backup_available ? 0 : 15;

  const level: RiskLevel = score >= 70 ? "critical" : score >= 50 ? "high" : score >= 30 ? "medium" : "low";

  return { score, level };
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const vendorProfiles = validated.vendors.map(vendor => {
    const { score, level } = calculateVendorRiskScore(vendor);

    const riskFactors = [
      { factor: "서비스 중요도", assessment: vendor.criticality, score: { critical: 40, high: 30, medium: 20, low: 10 }[vendor.criticality] || 20 },
      { factor: "재정 안정성", assessment: vendor.financial_stability || "unknown", score: { strong: 0, stable: 10, concerning: 30, unknown: 20 }[vendor.financial_stability || "unknown"] || 20 },
      { factor: "과거 협력 경험", assessment: vendor.previous_experience ? "있음" : "없음", score: vendor.previous_experience ? 0 : 15 },
      { factor: "백업 벤더 확보", assessment: vendor.backup_available ? "있음" : "없음", score: vendor.backup_available ? 0 : 15 },
    ];

    const keyRisks = [
      {
        risk: "서비스 미이행",
        likelihood: vendor.previous_experience ? "low" as const : "medium" as const,
        impact: vendor.criticality === "critical" ? "high" as const : "medium" as const,
        mitigation: "명확한 SLA 및 패널티 조항",
      },
      {
        risk: "품질 미달",
        likelihood: "medium" as const,
        impact: vendor.criticality === "critical" ? "high" as const : "medium" as const,
        mitigation: "사전 품질 검증 및 중간 점검",
      },
    ];

    if (vendor.financial_stability === "concerning" || vendor.financial_stability === "unknown") {
      keyRisks.push({
        risk: "재정적 문제로 인한 서비스 중단",
        likelihood: "medium" as const,
        impact: "high" as const,
        mitigation: "선금 최소화, 단계별 지급",
      });
    }

    return {
      vendor_id: vendor.vendor_id,
      vendor_name: vendor.vendor_name,
      service_category: vendor.service_category,
      risk_score: score,
      risk_level: level,
      risk_factors: riskFactors,
      key_risks: keyRisks,
      contract_recommendations: [
        "명확한 납품/서비스 기준 명시",
        "SLA 및 패널티 조항 포함",
        vendor.criticality === "critical" ? "성과 보증금 요구" : "지급 조건 분할",
        "취소/변경 조항 명확화",
      ],
      monitoring_requirements: [
        vendor.criticality === "critical" ? "주간 진행 체크" : "격주 진행 체크",
        "중간 점검 마일스톤 설정",
        "최종 납품 전 사전 확인",
      ],
    };
  });

  // Supply chain analysis
  const criticalVendors = validated.vendors.filter(v => v.criticality === "critical" && !v.backup_available);
  const singlePointsOfFailure = criticalVendors.map(v => ({
    vendor: v.vendor_name,
    service: v.service_category,
    risk: `${v.service_category} 서비스 완전 중단 시 이벤트 진행 불가`,
    mitigation: "백업 벤더 확보 또는 서비스 내재화",
  }));

  const overallSupplyChainRisk = criticalVendors.length > 2 ? "high" as const :
    criticalVendors.length > 0 ? "medium" as const : "low" as const;

  // Contingency recommendations
  const contingencies = validated.vendors
    .filter(v => v.criticality === "critical" || v.criticality === "high")
    .map(v => ({
      vendor_id: v.vendor_id,
      contingency_type: v.backup_available ? "backup_vendor" as const : "reduce_scope" as const,
      recommendation: v.backup_available
        ? `${v.vendor_name} 실패 시 백업 벤더 투입`
        : `백업 벤더 미확보 상태, 사전 대안 탐색 필요`,
      estimated_cost: v.backup_available ? "추가 비용 10-20%" : "확인 필요",
      activation_trigger: "서비스 이행 불가 확정 시",
    }));

  // Due diligence checklist
  const dueDiligence = validated.vendors.map(v => ({
    vendor_id: v.vendor_id,
    checklist_items: [
      { item: "사업자 등록 확인", status: "pending" as const },
      { item: "재무제표 검토", status: v.financial_stability === "strong" || v.financial_stability === "stable" ? "complete" as const : "pending" as const },
      { item: "과거 실적 확인", status: v.previous_experience ? "complete" as const : "pending" as const },
      { item: "보험 증빙 확인", status: "pending" as const },
      { item: "계약서 검토", status: "pending" as const },
    ],
  }));

  const highRiskVendors = vendorProfiles.filter(v => v.risk_level === "high" || v.risk_level === "critical");
  const totalValueAtRisk = validated.vendors
    .filter(v => highRiskVendors.some(hr => hr.vendor_id === v.vendor_id))
    .reduce((sum, v) => sum + (v.contract_value || 0), 0);

  return {
    assessment_id: generateUUID(),
    event_id: validated.event_id,
    vendor_risk_profiles: vendorProfiles,
    supply_chain_analysis: {
      single_points_of_failure: singlePointsOfFailure,
      dependency_map: criticalVendors.slice(0, 3).map(v => ({
        primary_vendor: v.vendor_name,
        dependencies: ["전력/인프라", "물류"],
        risk_if_failure: "해당 서비스 영역 완전 중단",
      })),
      overall_supply_chain_risk: overallSupplyChainRisk,
    },
    contingency_recommendations: contingencies,
    due_diligence_checklist: dueDiligence,
    summary: {
      total_vendors: validated.vendors.length,
      high_risk_vendors: highRiskVendors.length,
      total_contract_value_at_risk: totalValueAtRisk,
      priority_actions: [
        highRiskVendors.length > 0 ? `${highRiskVendors.length}개 고위험 벤더 집중 관리` : "",
        criticalVendors.length > 0 ? "백업 벤더 확보 시급" : "",
        "전체 벤더 실사 완료 필요",
      ].filter(Boolean),
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
