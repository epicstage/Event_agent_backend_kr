/**
 * Project Management Domain Registry
 * CMP-IS Domain B: Project Management (Skills 5-6)
 * Total: 40 Agents
 */

// Skill 5: Plan Project (PRJ-001 ~ PRJ-013)
import PRJ_001_ProjectScheduling from "./skill5/PRJ_001_ProjectScheduling";
import PRJ_002_ResourcePlanning from "./skill5/PRJ_002_ResourcePlanning";
import PRJ_003_VendorSelection from "./skill5/PRJ_003_VendorSelection";
import PRJ_004_ContractNegotiation from "./skill5/PRJ_004_ContractNegotiation";
import PRJ_005_WBSCreation from "./skill5/PRJ_005_WBSCreation";
import PRJ_006_MilestoneDefinition from "./skill5/PRJ_006_MilestoneDefinition";
import PRJ_007_DependencyMapping from "./skill5/PRJ_007_DependencyMapping";
import PRJ_008_CommunicationPlan from "./skill5/PRJ_008_CommunicationPlan";
import PRJ_009_QualityPlan from "./skill5/PRJ_009_QualityPlan";
import PRJ_010_RiskPlan from "./skill5/PRJ_010_RiskPlan";
import PRJ_011_ProcurementPlan from "./skill5/PRJ_011_ProcurementPlan";
import PRJ_012_StakeholderPlan from "./skill5/PRJ_012_StakeholderPlan";
import PRJ_013_BaselineSetting from "./skill5/PRJ_013_BaselineSetting";

// Skill 6: Manage Project (PRJ-014 ~ PRJ-040)
import PRJ_014_ProgressTracking from "./skill6/PRJ_014_ProgressTracking";
import PRJ_015_ChangeControl from "./skill6/PRJ_015_ChangeControl";
import PRJ_016_IssueManagement from "./skill6/PRJ_016_IssueManagement";
import PRJ_017_RiskMonitoring from "./skill6/PRJ_017_RiskMonitoring";
import PRJ_018_BudgetControl from "./skill6/PRJ_018_BudgetControl";
import PRJ_019_QualityControl from "./skill6/PRJ_019_QualityControl";
import PRJ_020_ResourceControl from "./skill6/PRJ_020_ResourceControl";
import PRJ_021_VendorPerformance from "./skill6/PRJ_021_VendorPerformance";
import PRJ_022_StakeholderEngagement from "./skill6/PRJ_022_StakeholderEngagement";
import PRJ_023_PerformanceReporting from "./skill6/PRJ_023_PerformanceReporting";
import PRJ_024_LessonsCapture from "./skill6/PRJ_024_LessonsCapture";
import PRJ_025_TeamCoordination from "./skill6/PRJ_025_TeamCoordination";
import PRJ_026_ConflictResolution from "./skill6/PRJ_026_ConflictResolution";
import PRJ_027_MeetingManagement from "./skill6/PRJ_027_MeetingManagement";
import PRJ_028_DecisionLog from "./skill6/PRJ_028_DecisionLog";
import PRJ_029_KnowledgeSharing from "./skill6/PRJ_029_KnowledgeSharing";
import PRJ_030_TeamDevelopment from "./skill6/PRJ_030_TeamDevelopment";
import PRJ_031_HandoverManagement from "./skill6/PRJ_031_HandoverManagement";
import PRJ_032_ContractClosure from "./skill6/PRJ_032_ContractClosure";
import PRJ_033_FinalReporting from "./skill6/PRJ_033_FinalReporting";
import PRJ_034_ArchiveManagement from "./skill6/PRJ_034_ArchiveManagement";
import PRJ_035_PostEventEvaluation from "./skill6/PRJ_035_PostEventEvaluation";
import PRJ_036_ResourceRelease from "./skill6/PRJ_036_ResourceRelease";
import PRJ_037_StakeholderSignoff from "./skill6/PRJ_037_StakeholderSignoff";
import PRJ_038_FinancialClosure from "./skill6/PRJ_038_FinancialClosure";
import PRJ_039_CelebrationRecognition from "./skill6/PRJ_039_CelebrationRecognition";
import PRJ_040_ProjectClosure from "./skill6/PRJ_040_ProjectClosure";

export const PROJECT_AGENTS = {
  // Skill 5: Plan Project
  "PRJ-001": PRJ_001_ProjectScheduling,
  "PRJ-002": PRJ_002_ResourcePlanning,
  "PRJ-003": PRJ_003_VendorSelection,
  "PRJ-004": PRJ_004_ContractNegotiation,
  "PRJ-005": PRJ_005_WBSCreation,
  "PRJ-006": PRJ_006_MilestoneDefinition,
  "PRJ-007": PRJ_007_DependencyMapping,
  "PRJ-008": PRJ_008_CommunicationPlan,
  "PRJ-009": PRJ_009_QualityPlan,
  "PRJ-010": PRJ_010_RiskPlan,
  "PRJ-011": PRJ_011_ProcurementPlan,
  "PRJ-012": PRJ_012_StakeholderPlan,
  "PRJ-013": PRJ_013_BaselineSetting,

  // Skill 6: Manage Project
  "PRJ-014": PRJ_014_ProgressTracking,
  "PRJ-015": PRJ_015_ChangeControl,
  "PRJ-016": PRJ_016_IssueManagement,
  "PRJ-017": PRJ_017_RiskMonitoring,
  "PRJ-018": PRJ_018_BudgetControl,
  "PRJ-019": PRJ_019_QualityControl,
  "PRJ-020": PRJ_020_ResourceControl,
  "PRJ-021": PRJ_021_VendorPerformance,
  "PRJ-022": PRJ_022_StakeholderEngagement,
  "PRJ-023": PRJ_023_PerformanceReporting,
  "PRJ-024": PRJ_024_LessonsCapture,
  "PRJ-025": PRJ_025_TeamCoordination,
  "PRJ-026": PRJ_026_ConflictResolution,
  "PRJ-027": PRJ_027_MeetingManagement,
  "PRJ-028": PRJ_028_DecisionLog,
  "PRJ-029": PRJ_029_KnowledgeSharing,
  "PRJ-030": PRJ_030_TeamDevelopment,
  "PRJ-031": PRJ_031_HandoverManagement,
  "PRJ-032": PRJ_032_ContractClosure,
  "PRJ-033": PRJ_033_FinalReporting,
  "PRJ-034": PRJ_034_ArchiveManagement,
  "PRJ-035": PRJ_035_PostEventEvaluation,
  "PRJ-036": PRJ_036_ResourceRelease,
  "PRJ-037": PRJ_037_StakeholderSignoff,
  "PRJ-038": PRJ_038_FinancialClosure,
  "PRJ-039": PRJ_039_CelebrationRecognition,
  "PRJ-040": PRJ_040_ProjectClosure,
};

export const PROJECT_AGENT_LIST = Object.entries(PROJECT_AGENTS).map(([taskId, agent]) => ({
  taskId,
  taskName: agent.taskName,
  taskType: agent.taskType,
  cmpReference: agent.cmpReference,
  skill: agent.skill,
  subSkill: agent.subSkill,
}));

export function getProjectAgent(taskId: string) {
  return PROJECT_AGENTS[taskId as keyof typeof PROJECT_AGENTS];
}

export function getProjectAgentsBySkill(skill: string) {
  return PROJECT_AGENT_LIST.filter(agent => agent.skill === skill);
}

export function getProjectAgentsByTaskType(taskType: "AI" | "Human" | "Hybrid") {
  return PROJECT_AGENT_LIST.filter(agent => agent.taskType === taskType);
}

// Domain metadata
export const PROJECT_DOMAIN = {
  id: "B",
  name: "Project Management",
  nameKo: "프로젝트 관리",
  skills: [
    {
      id: "5",
      name: "Plan Project",
      nameKo: "프로젝트 계획",
      agentCount: 13,
      taskIdRange: "PRJ-001 ~ PRJ-013",
    },
    {
      id: "6",
      name: "Manage Project",
      nameKo: "프로젝트 관리",
      agentCount: 27,
      taskIdRange: "PRJ-014 ~ PRJ-040",
    },
  ],
  totalAgents: 40,
  prefix: "PRJ",
};

/**
 * List all registered agents
 */
export function listAgents() {
  return PROJECT_AGENT_LIST;
}

/**
 * Get a specific agent by taskId
 */
export function getAgent(taskId: string) {
  const agent = PROJECT_AGENTS[taskId as keyof typeof PROJECT_AGENTS];
  if (!agent) return null;
  return {
    taskId,
    taskName: agent.taskName,
    taskType: agent.taskType,
    cmpReference: agent.cmpReference,
    skill: agent.skill,
    subSkill: agent.subSkill,
  };
}

/**
 * Execute an agent with the given input
 */
export async function executeAgent(taskId: string, input: Record<string, unknown>) {
  const agent = PROJECT_AGENTS[taskId as keyof typeof PROJECT_AGENTS];
  if (!agent) {
    throw new Error(`Agent ${taskId} not found`);
  }
  return await agent.execute(input as never);
}

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
  const agent = PROJECT_AGENTS[taskId as keyof typeof PROJECT_AGENTS];
  if (!agent) {
    throw new Error(`Agent ${taskId} not found`);
  }

  // Execute the base agent
  const result = await agent.execute(input as never);

  // Generate AI insights
  const agentPersona = "AGENT_PERSONA" in agent ? (agent as { AGENT_PERSONA: string }).AGENT_PERSONA : "";
  const systemPrompt = `You are an AI assistant enhancing project management agent outputs.
${agentPersona}

${shortTermMemory ? `Recent Context:\n${shortTermMemory}` : ""}
${userPreferences ? `User Preferences:\n${JSON.stringify(userPreferences)}` : ""}

Analyze the agent output and provide:
1. Key insights and analysis
2. Practical recommendations
3. Risk considerations
4. A confidence score (0.0-1.0)`;

  const userPrompt = `Agent: ${agent.taskName} (${taskId})
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
      ai_insights: aiInsights,
      model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    };
  } catch (error) {
    return {
      result,
      ai_insights: null,
      ai_error: error instanceof Error ? error.message : "Unknown AI error",
    };
  }
}

export default PROJECT_AGENTS;
