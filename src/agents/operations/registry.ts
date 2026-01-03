/**
 * Operations Domain Agent Registry
 * CMP-IS Domain E: Operations Management
 *
 * 40 에이전트:
 * - Skill 9 (Site Management): OPS-001 ~ OPS-015
 * - Skill 10 (Logistics Management): OPS-016 ~ OPS-040
 */

// Skill 9: Site Management
import { OPS_001_VenueSourcing } from "./skill9/OPS_001_VenueSourcing";
import { OPS_002_SiteInspection } from "./skill9/OPS_002_SiteInspection";
import { OPS_003_VenueNegotiation } from "./skill9/OPS_003_VenueNegotiation";
import { OPS_004_FloorPlanDesign } from "./skill9/OPS_004_FloorPlanDesign";
import { OPS_005_CapacityPlanning } from "./skill9/OPS_005_CapacityPlanning";
import { OPS_006_AccessibilityPlanning } from "./skill9/OPS_006_AccessibilityPlanning";
import { OPS_007_VenueContracting } from "./skill9/OPS_007_VenueContracting";
import { OPS_008_CateringPlanning } from "./skill9/OPS_008_CateringPlanning";
import { OPS_009_AVPlanning } from "./skill9/OPS_009_AVPlanning";
import { OPS_010_SafetyPlanning } from "./skill9/OPS_010_SafetyPlanning";
import { OPS_011_TransportPlanning } from "./skill9/OPS_011_TransportPlanning";
import { OPS_012_SignagePlanning } from "./skill9/OPS_012_SignagePlanning";
import { OPS_013_StaffingPlan } from "./skill9/OPS_013_StaffingPlan";
import { OPS_014_VendorCoordination } from "./skill9/OPS_014_VendorCoordination";
import { OPS_015_PreEventChecklist } from "./skill9/OPS_015_PreEventChecklist";

// Skill 10: Logistics Management
import { OPS_016_LoadInManagement } from "./skill10/OPS_016_LoadInManagement";
import { OPS_017_EquipmentTracking } from "./skill10/OPS_017_EquipmentTracking";
import { OPS_018_FBExecution } from "./skill10/OPS_018_FBExecution";
import { OPS_019_AVOperation } from "./skill10/OPS_019_AVOperation";
import { OPS_020_RegistrationOps } from "./skill10/OPS_020_RegistrationOps";
import { OPS_021_SessionManagement } from "./skill10/OPS_021_SessionManagement";
import { OPS_022_CrowdManagement } from "./skill10/OPS_022_CrowdManagement";
import { OPS_023_SecurityOps } from "./skill10/OPS_023_SecurityOps";
import { OPS_024_MedicalOps } from "./skill10/OPS_024_MedicalOps";
import { OPS_025_ShuttleOps } from "./skill10/OPS_025_ShuttleOps";
import { OPS_026_VIPServices } from "./skill10/OPS_026_VIPServices";
import { OPS_027_SpeakerSupport } from "./skill10/OPS_027_SpeakerSupport";
import { OPS_028_ExhibitorServices } from "./skill10/OPS_028_ExhibitorServices";
import { OPS_029_NetworkingOps } from "./skill10/OPS_029_NetworkingOps";
import { OPS_030_LiveStreaming } from "./skill10/OPS_030_LiveStreaming";
import { OPS_031_Photography } from "./skill10/OPS_031_Photography";
import { OPS_032_LostAndFound } from "./skill10/OPS_032_LostAndFound";
import { OPS_033_WasteManagement } from "./skill10/OPS_033_WasteManagement";
import { OPS_034_PowerManagement } from "./skill10/OPS_034_PowerManagement";
import { OPS_035_ClimateControl } from "./skill10/OPS_035_ClimateControl";
import { OPS_036_AccessibilityOps } from "./skill10/OPS_036_AccessibilityOps";
import { OPS_037_SignageExecution } from "./skill10/OPS_037_SignageExecution";
import { OPS_038_OnsiteCommunication } from "./skill10/OPS_038_OnsiteCommunication";
import { OPS_039_RealTimeMonitoring } from "./skill10/OPS_039_RealTimeMonitoring";
import { OPS_040_LoadOut } from "./skill10/OPS_040_LoadOut";

export const OperationsAgentRegistry = {
  // Skill 9: Site Management (15 agents)
  "OPS-001": OPS_001_VenueSourcing,
  "OPS-002": OPS_002_SiteInspection,
  "OPS-003": OPS_003_VenueNegotiation,
  "OPS-004": OPS_004_FloorPlanDesign,
  "OPS-005": OPS_005_CapacityPlanning,
  "OPS-006": OPS_006_AccessibilityPlanning,
  "OPS-007": OPS_007_VenueContracting,
  "OPS-008": OPS_008_CateringPlanning,
  "OPS-009": OPS_009_AVPlanning,
  "OPS-010": OPS_010_SafetyPlanning,
  "OPS-011": OPS_011_TransportPlanning,
  "OPS-012": OPS_012_SignagePlanning,
  "OPS-013": OPS_013_StaffingPlan,
  "OPS-014": OPS_014_VendorCoordination,
  "OPS-015": OPS_015_PreEventChecklist,

  // Skill 10: Logistics Management (25 agents)
  "OPS-016": OPS_016_LoadInManagement,
  "OPS-017": OPS_017_EquipmentTracking,
  "OPS-018": OPS_018_FBExecution,
  "OPS-019": OPS_019_AVOperation,
  "OPS-020": OPS_020_RegistrationOps,
  "OPS-021": OPS_021_SessionManagement,
  "OPS-022": OPS_022_CrowdManagement,
  "OPS-023": OPS_023_SecurityOps,
  "OPS-024": OPS_024_MedicalOps,
  "OPS-025": OPS_025_ShuttleOps,
  "OPS-026": OPS_026_VIPServices,
  "OPS-027": OPS_027_SpeakerSupport,
  "OPS-028": OPS_028_ExhibitorServices,
  "OPS-029": OPS_029_NetworkingOps,
  "OPS-030": OPS_030_LiveStreaming,
  "OPS-031": OPS_031_Photography,
  "OPS-032": OPS_032_LostAndFound,
  "OPS-033": OPS_033_WasteManagement,
  "OPS-034": OPS_034_PowerManagement,
  "OPS-035": OPS_035_ClimateControl,
  "OPS-036": OPS_036_AccessibilityOps,
  "OPS-037": OPS_037_SignageExecution,
  "OPS-038": OPS_038_OnsiteCommunication,
  "OPS-039": OPS_039_RealTimeMonitoring,
  "OPS-040": OPS_040_LoadOut,
} as const;

export type OperationsAgentId = keyof typeof OperationsAgentRegistry;

export function getOperationsAgent(id: OperationsAgentId) {
  return OperationsAgentRegistry[id];
}

export function listOperationsAgents() {
  return Object.entries(OperationsAgentRegistry).map(([id, agent]) => ({
    id,
    name: agent.name,
    skill: agent.skill,
    cmpStandard: agent.cmpStandard,
  }));
}

export function getOperationsAgentsBySkill(skill: 9 | 10) {
  return Object.entries(OperationsAgentRegistry)
    .filter(([_, agent]) => agent.skill === skill)
    .map(([id, agent]) => ({
      id,
      name: agent.name,
      cmpStandard: agent.cmpStandard,
    }));
}

// Export count for statistics
export const OPERATIONS_AGENT_COUNT = Object.keys(OperationsAgentRegistry).length;

/**
 * Execute an agent with LLM enhancement
 */
export async function executeAgentWithLLM(
  taskId: string,
  input: Record<string, unknown>,
  ai: Ai,
  shortTermMemory?: string,
  userPreferences?: Record<string, unknown>
) {
  const agent = OperationsAgentRegistry[taskId as OperationsAgentId];
  if (!agent) {
    throw new Error(`Agent ${taskId} not found`);
  }

  // Execute the base agent
  const result = await agent.execute(input as never);

  // Generate AI insights
  const agentPersona = agent.persona || "";
  const systemPrompt = `You are an AI assistant enhancing operations management agent outputs.
${agentPersona}

${shortTermMemory ? `Recent Context:\n${shortTermMemory}` : ""}
${userPreferences ? `User Preferences:\n${JSON.stringify(userPreferences)}` : ""}

Analyze the agent output and provide:
1. Key insights and analysis
2. Practical recommendations
3. Risk considerations
4. A confidence score (0.0-1.0)`;

  const userPrompt = `Agent: ${agent.name} (${taskId})
Input: ${JSON.stringify(input)}
Output: ${JSON.stringify(result)}

Provide insights in JSON format:
{
  "analysis": "brief analysis",
  "recommendations": ["rec1", "rec2"],
  "risk_factors": ["risk1", "risk2"],
  "confidence_score": 0.85
}`;

  try {
    const aiResponse = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
    });

    let aiInsights = null;
    if (aiResponse && typeof aiResponse === "object" && "response" in aiResponse) {
      try {
        const responseText = aiResponse.response as string;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiInsights = JSON.parse(jsonMatch[0]);
        }
      } catch {
        aiInsights = { raw: aiResponse.response };
      }
    }

    return {
      result,
      ai_enhanced: true,
      ai_insights: aiInsights,
      model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    };
  } catch (error) {
    return {
      result,
      ai_enhanced: false,
      ai_insights: null,
      ai_error: error instanceof Error ? error.message : "Unknown AI error",
    };
  }
}
