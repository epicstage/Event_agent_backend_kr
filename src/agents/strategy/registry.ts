/**
 * Strategy Domain Agent Registry
 *
 * CMP-IS Domain A: Strategic Planning
 * - Skill 1: Goal Setting (STR-001~013) - 13 Agents
 * - Skill 2: Stakeholder Analysis (STR-014~026) - 13 Agents
 * - Skill 3: Risk Management (STR-027~040) - 14 Agents
 * - Skill 4: Strategic Alignment (STR-041~054) - 14 Agents
 *
 * Total: 54 Agents (AI: 54)
 */

// =============================================================================
// AGENT IMPORTS - Skill 1: Goal Setting (실제 파일명 기준)
// =============================================================================

import STR_001 from "./STR_001_GoalSetting";
import STR_002 from "./STR_002_StakeholderAnalysis";
import STR_003 from "./STR_003_RiskIdentification";
import STR_004 from "./STR_004_GoalPrioritization";
import STR_005 from "./STR_005_KPIDefinition";
import STR_006 from "./STR_006_SuccessCriteria";
import STR_007 from "./STR_007_ObjectiveAlignment";
import STR_008 from "./STR_008_BenchmarkAnalysis";
import STR_009 from "./STR_009_GoalTracking";
import STR_010 from "./STR_010_GoalRevision";
import STR_011 from "./STR_011_ROIProjection";
import STR_012 from "./STR_012_ValueProposition";
import STR_013 from "./STR_013_GoalCommunication";

// =============================================================================
// AGENT IMPORTS - Skill 2: Stakeholder Analysis (실제 파일명 기준)
// =============================================================================

import STR_014 from "./STR_014_StakeholderMapping";
import STR_015 from "./STR_015_StakeholderPrioritization";
import STR_016 from "./STR_016_EngagementStrategy";
import STR_017 from "./STR_017_ExpectationManagement";
import STR_018 from "./STR_018_CommunicationPlanning";
import STR_019 from "./STR_019_ConflictResolution";
import STR_020 from "./STR_020_RelationshipBuilding";
import STR_021 from "./STR_021_InfluenceAnalysis";
import STR_022 from "./STR_022_StakeholderFeedback";
import STR_023 from "./STR_023_CoalitionBuilding";
import STR_024 from "./STR_024_NegotiationSupport";
import STR_025 from "./STR_025_StakeholderReporting";
import STR_026 from "./STR_026_StakeholderJourney";

// =============================================================================
// AGENT IMPORTS - Skill 3: Risk Management
// =============================================================================

import STR_027 from "./STR_027_RiskIdentification";
import STR_028 from "./STR_028_RiskAssessment";
import STR_029 from "./STR_029_RiskPrioritization";
import STR_030 from "./STR_030_RiskMitigation";
import STR_031 from "./STR_031_ContingencyPlanning";
import STR_032 from "./STR_032_RiskMonitoring";
import STR_033 from "./STR_033_RiskReporting";
import STR_034 from "./STR_034_RiskCommunication";
import STR_035 from "./STR_035_RiskReview";
import STR_036 from "./STR_036_RiskGovernance";
import STR_037 from "./STR_037_InsuranceAnalysis";
import STR_038 from "./STR_038_SafetyRiskManagement";
import STR_039 from "./STR_039_VendorRiskAssessment";
import STR_040 from "./STR_040_RiskCulture";

// =============================================================================
// AGENT IMPORTS - Skill 4: Strategic Alignment
// =============================================================================

import STR_041 from "./STR_041_StrategicObjectives";
import STR_042 from "./STR_042_StrategyMapping";
import STR_043 from "./STR_043_KPIDesign";
import STR_044 from "./STR_044_InitiativePlanning";
import STR_045 from "./STR_045_ResourceAlignment";
import STR_046 from "./STR_046_CapabilityAssessment";
import STR_047 from "./STR_047_ChangeManagement";
import STR_048 from "./STR_048_PerformanceMonitoring";
import STR_049 from "./STR_049_StrategicReview";
import STR_050 from "./STR_050_StrategyAdaptation";
import STR_051 from "./STR_051_BenchmarkAnalysis";
import STR_052 from "./STR_052_ValueProposition";
import STR_053 from "./STR_053_ScenarioPlanning";
import STR_054 from "./STR_054_StrategicIntegration";

// =============================================================================
// TYPES
// =============================================================================

export interface StrategyAgent {
  taskId: string;
  taskName: string;
  domain: string;
  skill: string;
  taskType: "AI" | "Human" | "Hybrid";
  description: string;
  inputSchema: unknown;
  outputSchema: unknown;
  persona: string;
  execute: (input: unknown) => Promise<unknown>;
}

// =============================================================================
// AGENT REGISTRY
// =============================================================================

const agents: StrategyAgent[] = [
  // Skill 1: Goal Setting
  STR_001,
  STR_002,
  STR_003,
  STR_004,
  STR_005,
  STR_006,
  STR_007,
  STR_008,
  STR_009,
  STR_010,
  STR_011,
  STR_012,
  STR_013,
  // Skill 2: Stakeholder Analysis
  STR_014,
  STR_015,
  STR_016,
  STR_017,
  STR_018,
  STR_019,
  STR_020,
  STR_021,
  STR_022,
  STR_023,
  STR_024,
  STR_025,
  STR_026,
  // Skill 3: Risk Management
  STR_027,
  STR_028,
  STR_029,
  STR_030,
  STR_031,
  STR_032,
  STR_033,
  STR_034,
  STR_035,
  STR_036,
  STR_037,
  STR_038,
  STR_039,
  STR_040,
  // Skill 4: Strategic Alignment
  STR_041,
  STR_042,
  STR_043,
  STR_044,
  STR_045,
  STR_046,
  STR_047,
  STR_048,
  STR_049,
  STR_050,
  STR_051,
  STR_052,
  STR_053,
  STR_054,
];

// Map for quick lookup
const agentMap = new Map<string, StrategyAgent>();
agents.forEach((agent) => {
  agentMap.set(agent.taskId, agent);
});

// =============================================================================
// AGENT PERSONAS (for LLM enhancement)
// =============================================================================

export const agentPersonas: Record<string, string> = {};
agents.forEach((agent) => {
  agentPersonas[agent.taskId] = agent.persona;
});

// =============================================================================
// REGISTRY FUNCTIONS
// =============================================================================

/**
 * 모든 에이전트 목록 조회
 */
export function listAgents(filters?: {
  skill?: string;
  taskType?: "AI" | "Human" | "Hybrid";
}): StrategyAgent[] {
  let result = [...agents];

  if (filters?.skill) {
    result = result.filter((a) => a.skill.toLowerCase().includes(filters.skill!.toLowerCase()));
  }

  if (filters?.taskType) {
    result = result.filter((a) => a.taskType === filters.taskType);
  }

  return result;
}

/**
 * 특정 에이전트 조회
 */
export function getAgent(taskId: string): StrategyAgent | undefined {
  return agentMap.get(taskId);
}

/**
 * 에이전트 실행
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
 * AI 보강 에이전트 실행
 *
 * Finance 도메인과 동일한 패턴:
 * 1. 로컬 로직 실행
 * 2. Llama 3.3으로 결과 검토 및 보강
 * 3. Short-term Memory 세션 컨텍스트 지원
 */
export async function executeAgentWithLLM(
  taskId: string,
  input: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai: any,
  shortTermMemory?: string,
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
    evolution_note?: string;
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
      shortTermMemory,
      userPreferences,
    };

    const enhanced = await aiClient.enhanceAgentResult(context);

    return {
      result: enhanced.enhanced_result || localResult,
      ai_enhanced: true,
      ai_insights: enhanced.ai_insights,
    };
  } catch (error) {
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
  bySkill: Record<string, number>;
  byTaskType: Record<string, number>;
} {
  const bySkill: Record<string, number> = {};
  const byTaskType: Record<string, number> = {};

  agents.forEach((agent) => {
    bySkill[agent.skill] = (bySkill[agent.skill] || 0) + 1;
    byTaskType[agent.taskType] = (byTaskType[agent.taskType] || 0) + 1;
  });

  return {
    total: agents.length,
    bySkill,
    byTaskType,
  };
}

export default {
  listAgents,
  getAgent,
  executeAgent,
  executeAgentWithLLM,
  getRegistrySummary,
};
