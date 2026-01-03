/**
 * Finance Domain Agent Registry
 *
 * CMP-IS Domain D: Financial Management
 * - Skill 7: Manage Event Funding (FIN-001 ~ FIN-030)
 * - Skill 8: Develop and Manage Event Budget (FIN-031 ~ FIN-057)
 * - Skill 9: Manage Monetary Transactions (FIN-058 ~ FIN-068)
 *
 * Total: 68 Agents (AI: 35, Human: 14, Hybrid: 19)
 */

// =============================================================================
// SKILL 7 AGENT IMPORTS (FIN-001 ~ FIN-030)
// =============================================================================

// 7.1: Develop Sponsorship Packages
import FIN_001 from "./skill7/FIN_001_SponsorshipValueAssessment";
import FIN_002 from "./skill7/FIN_002_BenefitCostEstimation";
import FIN_003 from "./skill7/FIN_003_StakeholderApproval";
import FIN_004 from "./skill7/FIN_004_LegalReviewRequest";

// 7.2: Manage Sponsorship
import FIN_005 from "./skill7/FIN_005_PotentialSponsorIdentification";
import FIN_006 from "./skill7/FIN_006_SponsorFitAnalysis";
import FIN_007 from "./skill7/FIN_007_ExclusivityConflictCheck";
import FIN_008 from "./skill7/FIN_008_SponsorProposalGenerator";
import FIN_009 from "./skill7/FIN_009_ProposalDistribution";
import FIN_010 from "./skill7/FIN_010_InitialSponsorContact";
import FIN_011 from "./skill7/FIN_011_SupportTypeIdentification";
import FIN_012 from "./skill7/FIN_012_CommitmentNegotiation";
import FIN_013 from "./skill7/FIN_013_ContractDrafting";
import FIN_014 from "./skill7/FIN_014_RelationshipMaintenance";
import FIN_015 from "./skill7/FIN_015_ContractFulfillmentTracking";
import FIN_016 from "./skill7/FIN_016_SponsorROIEvaluation";

// 7.3: Manage Registration Revenue
import FIN_017 from "./skill7/FIN_017_RegistrationFinancialGoals";
import FIN_018 from "./skill7/FIN_018_PastRegistrationAnalysis";
import FIN_019 from "./skill7/FIN_019_AttendeeTypeIdentification";
import FIN_020 from "./skill7/FIN_020_RegistrationPacketGeneration";
import FIN_021 from "./skill7/FIN_021_RegistrationSystemIdentification";

// 7.4: Manage Exhibit Sales
import FIN_022 from "./skill7/FIN_022_ExhibitProspectIdentification";
import FIN_023 from "./skill7/FIN_023_ExhibitPackageDevelopment";
import FIN_024 from "./skill7/FIN_024_ExhibitSalesTracking";
import FIN_025 from "./skill7/FIN_025_ExhibitorContractManagement";
import FIN_026 from "./skill7/FIN_026_ExhibitRevenueForecasting";

// 7.5: Additional Revenue Sources
import FIN_027 from "./skill7/FIN_027_AdditionalRevenueIdentification";
import FIN_028 from "./skill7/FIN_028_MerchandiseSalesPlanning";
import FIN_029 from "./skill7/FIN_029_FBRevenueOptimization";
import FIN_030 from "./skill7/FIN_030_ContentMonetization";

// =============================================================================
// SKILL 8 AGENT IMPORTS (FIN-031 ~ FIN-057)
// =============================================================================

// 8.1: Develop Budget
import FIN_031 from "./skill8/FIN_031_BudgetStructureDesign";
import FIN_032 from "./skill8/FIN_032_HistoricalCostAnalysis";
import FIN_033 from "./skill8/FIN_033_VendorQuoteCollection";
import FIN_034 from "./skill8/FIN_034_BudgetLineItemization";
import FIN_035 from "./skill8/FIN_035_ContingencyPlanning";
import FIN_036 from "./skill8/FIN_036_RevenueProjection";
import FIN_037 from "./skill8/FIN_037_BreakEvenAnalysis";
import FIN_038 from "./skill8/FIN_038_CashFlowProjection";
import FIN_039 from "./skill8/FIN_039_BudgetApprovalProcess";
import FIN_040 from "./skill8/FIN_040_BudgetDocumentation";
import FIN_041 from "./skill8/FIN_041_ScenarioPlanning";
import FIN_042 from "./skill8/FIN_042_BudgetCommunication";

// 8.2: Establish Pricing
import FIN_043 from "./skill8/FIN_043_PricingStrategyDevelopment";
import FIN_044 from "./skill8/FIN_044_CompetitorPricingAnalysis";
import FIN_045 from "./skill8/FIN_045_DiscountPolicyDesign";
import FIN_046 from "./skill8/FIN_046_DynamicPricingRules";
import FIN_047 from "./skill8/FIN_047_PricePointValidation";
import FIN_048 from "./skill8/FIN_048_RefundPolicyCreation";
import FIN_049 from "./skill8/FIN_049_PaymentTermsDesign";
import FIN_050 from "./skill8/FIN_050_PricingCommunication";

// 8.3: Monitor and Revise Budget
import FIN_051 from "./skill8/FIN_051_BudgetTrackingSetup";
import FIN_052 from "./skill8/FIN_052_ActualVsBudgetAnalysis";
import FIN_053 from "./skill8/FIN_053_VarianceReporting";
import FIN_054 from "./skill8/FIN_054_BudgetReallocation";
import FIN_055 from "./skill8/FIN_055_ForecastUpdate";
import FIN_056 from "./skill8/FIN_056_CostControlActions";
import FIN_057 from "./skill8/FIN_057_PostEventFinancialReconciliation";

// =============================================================================
// SKILL 9 AGENT IMPORTS (FIN-058 ~ FIN-068)
// =============================================================================

// 9.1: Establish Monetary Transaction Procedures
import FIN_058 from "./skill9/FIN_058_PaymentProcessingSetup";
import FIN_059 from "./skill9/FIN_059_CashHandlingProcedures";
import FIN_060 from "./skill9/FIN_060_RefundPolicyImplementation";
import FIN_061 from "./skill9/FIN_061_FinancialControlsSetup";
import FIN_062 from "./skill9/FIN_062_TaxComplianceSetup";
import FIN_063 from "./skill9/FIN_063_AuditTrailConfiguration";

// 9.2: Manage Monetary Transactions Process
import FIN_064 from "./skill9/FIN_064_PaymentProcessing";
import FIN_065 from "./skill9/FIN_065_RefundProcessing";
import FIN_066 from "./skill9/FIN_066_InvoiceGeneration";
import FIN_067 from "./skill9/FIN_067_CollectionsManagement";
import FIN_068 from "./skill9/FIN_068_FinancialReporting";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type TaskType = "AI" | "Human" | "Hybrid";

export interface AgentMetadata {
  taskId: string;
  taskName: string;
  taskType: TaskType;
  cmpReference: string;
  skill: string;
  subSkill: string;
  inputSchema: unknown;
  outputSchema: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (input: any) => Promise<any>;
}

export interface AgentRegistry {
  [taskId: string]: AgentMetadata;
}

// =============================================================================
// SKILL 7 REGISTRY (FIN-001 ~ FIN-030)
// =============================================================================

export const skill7Agents: AgentRegistry = {
  // 7.1: Develop Sponsorship Packages
  "FIN-001": FIN_001,
  "FIN-002": FIN_002,
  "FIN-003": FIN_003,
  "FIN-004": FIN_004,
  // 7.2: Manage Sponsorship
  "FIN-005": FIN_005,
  "FIN-006": FIN_006,
  "FIN-007": FIN_007,
  "FIN-008": FIN_008,
  "FIN-009": FIN_009,
  "FIN-010": FIN_010,
  "FIN-011": FIN_011,
  "FIN-012": FIN_012,
  "FIN-013": FIN_013,
  "FIN-014": FIN_014,
  "FIN-015": FIN_015,
  "FIN-016": FIN_016,
  // 7.3: Manage Registration Revenue
  "FIN-017": FIN_017,
  "FIN-018": FIN_018,
  "FIN-019": FIN_019,
  "FIN-020": FIN_020,
  "FIN-021": FIN_021,
  // 7.4: Manage Exhibit Sales
  "FIN-022": FIN_022,
  "FIN-023": FIN_023,
  "FIN-024": FIN_024,
  "FIN-025": FIN_025,
  "FIN-026": FIN_026,
  // 7.5: Additional Revenue Sources
  "FIN-027": FIN_027,
  "FIN-028": FIN_028,
  "FIN-029": FIN_029,
  "FIN-030": FIN_030,
};

// =============================================================================
// SKILL 8 REGISTRY (FIN-031 ~ FIN-057)
// =============================================================================

export const skill8Agents: AgentRegistry = {
  // 8.1: Develop Budget
  "FIN-031": FIN_031,
  "FIN-032": FIN_032,
  "FIN-033": FIN_033,
  "FIN-034": FIN_034,
  "FIN-035": FIN_035,
  "FIN-036": FIN_036,
  "FIN-037": FIN_037,
  "FIN-038": FIN_038,
  "FIN-039": FIN_039,
  "FIN-040": FIN_040,
  "FIN-041": FIN_041,
  "FIN-042": FIN_042,
  // 8.2: Establish Pricing
  "FIN-043": FIN_043,
  "FIN-044": FIN_044,
  "FIN-045": FIN_045,
  "FIN-046": FIN_046,
  "FIN-047": FIN_047,
  "FIN-048": FIN_048,
  "FIN-049": FIN_049,
  "FIN-050": FIN_050,
  // 8.3: Monitor and Revise Budget
  "FIN-051": FIN_051,
  "FIN-052": FIN_052,
  "FIN-053": FIN_053,
  "FIN-054": FIN_054,
  "FIN-055": FIN_055,
  "FIN-056": FIN_056,
  "FIN-057": FIN_057,
};

// =============================================================================
// SKILL 9 REGISTRY (FIN-058 ~ FIN-068)
// =============================================================================

export const skill9Agents: AgentRegistry = {
  // 9.1: Establish Monetary Transaction Procedures
  "FIN-058": FIN_058,
  "FIN-059": FIN_059,
  "FIN-060": FIN_060,
  "FIN-061": FIN_061,
  "FIN-062": FIN_062,
  "FIN-063": FIN_063,
  // 9.2: Manage Monetary Transactions Process
  "FIN-064": FIN_064,
  "FIN-065": FIN_065,
  "FIN-066": FIN_066,
  "FIN-067": FIN_067,
  "FIN-068": FIN_068,
};

// =============================================================================
// FULL FINANCE REGISTRY (Domain D)
// =============================================================================

export const financeAgents: AgentRegistry = {
  ...skill7Agents,
  ...skill8Agents,
  ...skill9Agents,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * 태스크 ID로 에이전트 조회
 */
export function getAgent(taskId: string): AgentMetadata | undefined {
  return financeAgents[taskId];
}

/**
 * 태스크 타입별 에이전트 필터링
 */
export function getAgentsByType(taskType: TaskType): AgentMetadata[] {
  return Object.values(financeAgents).filter(
    (agent) => agent.taskType === taskType
  );
}

/**
 * 스킬별 에이전트 필터링
 */
export function getAgentsBySkill(skillNumber: number): AgentMetadata[] {
  const skillPrefix = `Skill ${skillNumber}:`;
  return Object.values(financeAgents).filter((agent) =>
    agent.skill.startsWith(skillPrefix)
  );
}

/**
 * CMP-IS 레퍼런스로 에이전트 조회
 */
export function getAgentByCmpReference(
  reference: string
): AgentMetadata | undefined {
  return Object.values(financeAgents).find(
    (agent) => agent.cmpReference === reference
  );
}

/**
 * 에이전트 실행 (로컬 로직만)
 */
export async function executeAgent(
  taskId: string,
  input: unknown
): Promise<unknown> {
  const agent = getAgent(taskId);
  if (!agent) {
    throw new Error(`Agent not found: ${taskId}`);
  }
  return agent.execute(input);
}

/**
 * AGENT_PERSONA 가져오기 (타입 안전)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPersona(agent: any): string {
  return agent.AGENT_PERSONA || agent.taskName || "Event Planning Agent";
}

/**
 * AGENT_PERSONA 맵 (동적 import 대신 정적 매핑)
 */
const agentPersonas: Record<string, string> = {
  "FIN-001": getPersona(FIN_001),
  "FIN-002": getPersona(FIN_002),
  "FIN-003": getPersona(FIN_003),
  "FIN-004": getPersona(FIN_004),
  "FIN-005": getPersona(FIN_005),
  "FIN-006": getPersona(FIN_006),
  "FIN-007": getPersona(FIN_007),
  "FIN-008": getPersona(FIN_008),
  "FIN-009": getPersona(FIN_009),
  "FIN-010": getPersona(FIN_010),
  "FIN-011": getPersona(FIN_011),
  "FIN-012": getPersona(FIN_012),
  "FIN-013": getPersona(FIN_013),
  "FIN-014": getPersona(FIN_014),
  "FIN-015": getPersona(FIN_015),
  "FIN-016": getPersona(FIN_016),
  "FIN-017": getPersona(FIN_017),
  "FIN-018": getPersona(FIN_018),
  "FIN-019": getPersona(FIN_019),
  "FIN-020": getPersona(FIN_020),
  "FIN-021": getPersona(FIN_021),
  "FIN-022": getPersona(FIN_022),
  "FIN-023": getPersona(FIN_023),
  "FIN-024": getPersona(FIN_024),
  "FIN-025": getPersona(FIN_025),
  "FIN-026": getPersona(FIN_026),
  "FIN-027": getPersona(FIN_027),
  "FIN-028": getPersona(FIN_028),
  "FIN-029": getPersona(FIN_029),
  "FIN-030": getPersona(FIN_030),
  "FIN-031": getPersona(FIN_031),
  "FIN-032": getPersona(FIN_032),
  "FIN-033": getPersona(FIN_033),
  "FIN-034": getPersona(FIN_034),
  "FIN-035": getPersona(FIN_035),
  "FIN-036": getPersona(FIN_036),
  "FIN-037": getPersona(FIN_037),
  "FIN-038": getPersona(FIN_038),
  "FIN-039": getPersona(FIN_039),
  "FIN-040": getPersona(FIN_040),
  "FIN-041": getPersona(FIN_041),
  "FIN-042": getPersona(FIN_042),
  "FIN-043": getPersona(FIN_043),
  "FIN-044": getPersona(FIN_044),
  "FIN-045": getPersona(FIN_045),
  "FIN-046": getPersona(FIN_046),
  "FIN-047": getPersona(FIN_047),
  "FIN-048": getPersona(FIN_048),
  "FIN-049": getPersona(FIN_049),
  "FIN-050": getPersona(FIN_050),
  "FIN-051": getPersona(FIN_051),
  "FIN-052": getPersona(FIN_052),
  "FIN-053": getPersona(FIN_053),
  "FIN-054": getPersona(FIN_054),
  "FIN-055": getPersona(FIN_055),
  "FIN-056": getPersona(FIN_056),
  "FIN-057": getPersona(FIN_057),
  "FIN-058": getPersona(FIN_058),
  "FIN-059": getPersona(FIN_059),
  "FIN-060": getPersona(FIN_060),
  "FIN-061": getPersona(FIN_061),
  "FIN-062": getPersona(FIN_062),
  "FIN-063": getPersona(FIN_063),
  "FIN-064": getPersona(FIN_064),
  "FIN-065": getPersona(FIN_065),
  "FIN-066": getPersona(FIN_066),
  "FIN-067": getPersona(FIN_067),
  "FIN-068": getPersona(FIN_068),
};

/**
 * 에이전트 실행 + Cloudflare Workers AI 보강
 *
 * 1. 로컬 로직 실행
 * 2. Llama 3.3으로 결과 검토 및 보강
 * 3. Short-term Memory 세션 컨텍스트 지원
 */
export async function executeAgentWithLLM(
  taskId: string,
  input: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai: any,
  shortTermMemory?: string, // 세션 컨텍스트 (최근 대화 요약)
  userPreferences?: {
    language?: string;
    detail_level?: "brief" | "standard" | "detailed";
    industry_focus?: string;
    past_topics?: string[];
  }
): Promise<{
  result: unknown;
  ai_enhanced: boolean;
  ai_insights?: {
    analysis: string;
    recommendations: string[];
    risk_factors: string[];
    confidence_score: number;
    evolution_note?: string; // AI 자기 학습 메모
    gap_detected?: {
      type: "MISSING_FEAT" | "LOGIC_ERROR" | "USER_FRUSTRATION" | "DATA_GAP" | "PERF_ISSUE";
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      suggested_fix?: string;
    };
  };
  ai_error?: string;
}> {
  const agent = getAgent(taskId);
  if (!agent) {
    throw new Error(`Agent not found: ${taskId}`);
  }

  // 1. 로컬 로직 실행
  const localResult = await agent.execute(input);

  // 2. AI 타입 에이전트만 LLM으로 보강
  if (agent.taskType !== "AI") {
    return {
      result: localResult,
      ai_enhanced: false,
    };
  }

  // 3. Cloudflare Workers AI 연동 + Short-term Memory + User Preferences 주입
  try {
    const { createAIClient } = await import("../../lib/ai");
    const aiClient = createAIClient(ai);

    const persona = agentPersonas[taskId] || agent.skill;

    const context = {
      taskId: agent.taskId,
      taskName: agent.taskName,
      persona,
      input,
      localResult,
      shortTermMemory, // 세션 컨텍스트 주입
      userPreferences, // 사용자 선호도 주입
    };

    const enhanced = await aiClient.enhanceAgentResult(context);

    return {
      result: enhanced.enhanced_result || localResult,
      ai_enhanced: true,
      ai_insights: enhanced.ai_insights,
    };
  } catch (error) {
    // AI 실패 시 로컬 결과 반환
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Cloudflare AI enhancement failed:", errorMessage);
    return {
      result: localResult,
      ai_enhanced: false,
      ai_error: errorMessage,
    };
  }
}

/**
 * 레지스트리 요약 출력
 */
export function getRegistrySummary(): {
  total: number;
  byType: Record<TaskType, number>;
  bySkill: Record<string, number>;
} {
  const agents = Object.values(financeAgents);

  const byType: Record<TaskType, number> = {
    AI: 0,
    Human: 0,
    Hybrid: 0,
  };

  const bySkill: Record<string, number> = {};

  for (const agent of agents) {
    byType[agent.taskType]++;

    const skillKey = agent.skill.split(":")[0];
    bySkill[skillKey] = (bySkill[skillKey] || 0) + 1;
  }

  return {
    total: agents.length,
    byType,
    bySkill,
  };
}

/**
 * 에이전트 목록 조회
 */
export function listAgents(): Array<{
  taskId: string;
  taskName: string;
  taskType: TaskType;
  skill: string;
}> {
  return Object.values(financeAgents).map((agent) => ({
    taskId: agent.taskId,
    taskName: agent.taskName,
    taskType: agent.taskType,
    skill: agent.skill,
  }));
}

// =============================================================================
// EXPORTS
// =============================================================================

export default financeAgents;

// Re-export individual agents for direct imports
export {
  // Skill 7
  FIN_001, FIN_002, FIN_003, FIN_004, FIN_005,
  FIN_006, FIN_007, FIN_008, FIN_009, FIN_010,
  FIN_011, FIN_012, FIN_013, FIN_014, FIN_015,
  FIN_016, FIN_017, FIN_018, FIN_019, FIN_020,
  FIN_021, FIN_022, FIN_023, FIN_024, FIN_025,
  FIN_026, FIN_027, FIN_028, FIN_029, FIN_030,
  // Skill 8
  FIN_031, FIN_032, FIN_033, FIN_034, FIN_035,
  FIN_036, FIN_037, FIN_038, FIN_039, FIN_040,
  FIN_041, FIN_042, FIN_043, FIN_044, FIN_045,
  FIN_046, FIN_047, FIN_048, FIN_049, FIN_050,
  FIN_051, FIN_052, FIN_053, FIN_054, FIN_055,
  FIN_056, FIN_057,
  // Skill 9
  FIN_058, FIN_059, FIN_060, FIN_061, FIN_062,
  FIN_063, FIN_064, FIN_065, FIN_066, FIN_067,
  FIN_068,
};
