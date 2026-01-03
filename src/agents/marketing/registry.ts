/**
 * Marketing Domain Registry
 * Domain C: Marketing Management (MKT-001 ~ MKT-040)
 * CMP-IS Reference: Skills 7-8
 */

// Skill 7: Plan Marketing (MKT-001 ~ MKT-015)
import MKT_001 from "./skill7/MKT_001_MarketAnalysis";
import MKT_002 from "./skill7/MKT_002_AudienceSegmentation";
import MKT_003 from "./skill7/MKT_003_BrandPositioning";
import MKT_004 from "./skill7/MKT_004_MarketingStrategy";
import MKT_005 from "./skill7/MKT_005_ChannelPlanning";
import MKT_006 from "./skill7/MKT_006_ContentStrategy";
import MKT_007 from "./skill7/MKT_007_CampaignPlanning";
import MKT_008 from "./skill7/MKT_008_BudgetPlanning";
import MKT_009 from "./skill7/MKT_009_MediaPlanning";
import MKT_010 from "./skill7/MKT_010_PRStrategy";
import MKT_011 from "./skill7/MKT_011_PartnershipStrategy";
import MKT_012 from "./skill7/MKT_012_InfluencerStrategy";
import MKT_013 from "./skill7/MKT_013_EmailMarketingStrategy";
import MKT_014 from "./skill7/MKT_014_SocialMediaStrategy";
import MKT_015 from "./skill7/MKT_015_MarketingROIProjection";

// Skill 8: Execute Marketing (MKT-016 ~ MKT-040)
import MKT_016 from "./skill8/MKT_016_CampaignLaunch";
import MKT_017 from "./skill8/MKT_017_AdCreativeProduction";
import MKT_018 from "./skill8/MKT_018_MediaBuying";
import MKT_019 from "./skill8/MKT_019_ContentCreation";
import MKT_020 from "./skill8/MKT_020_SocialMediaPosting";
import MKT_021 from "./skill8/MKT_021_EmailCampaignExecution";
import MKT_022 from "./skill8/MKT_022_PROutreach";
import MKT_023 from "./skill8/MKT_023_InfluencerManagement";
import MKT_024 from "./skill8/MKT_024_PartnerActivation";
import MKT_025 from "./skill8/MKT_025_LandingPageOptimization";
import MKT_026 from "./skill8/MKT_026_ABTesting";
import MKT_027 from "./skill8/MKT_027_CampaignOptimization";
import MKT_028 from "./skill8/MKT_028_BudgetReallocation";
import MKT_029 from "./skill8/MKT_029_PerformanceTracking";
import MKT_030 from "./skill8/MKT_030_ConversionTracking";
import MKT_031 from "./skill8/MKT_031_ROIAnalysis";
import MKT_032 from "./skill8/MKT_032_CompetitorMonitoring";
import MKT_033 from "./skill8/MKT_033_SocialListening";
import MKT_034 from "./skill8/MKT_034_MarketingReporting";
import MKT_035 from "./skill8/MKT_035_CampaignAnalysis";
import MKT_036 from "./skill8/MKT_036_AudienceInsights";
import MKT_037 from "./skill8/MKT_037_LeadNurturing";
import MKT_038 from "./skill8/MKT_038_RetargetingCampaign";
import MKT_039 from "./skill8/MKT_039_AbandonedCartRecovery";
import MKT_040 from "./skill8/MKT_040_PostEventMarketing";

export interface MarketingAgent {
  taskId: string;
  taskName: string;
  taskType: "AI" | "API" | "Hybrid";
  cmpReference: string;
  skill: string;
  subSkill: string;
  execute: (input: unknown) => Promise<unknown>;
  InputSchema: unknown;
  OutputSchema: unknown;
  AGENT_PERSONA: string;
}

export const MARKETING_AGENTS: Record<string, MarketingAgent> = {
  // Skill 7: Plan Marketing
  "MKT-001": MKT_001 as unknown as MarketingAgent,
  "MKT-002": MKT_002 as unknown as MarketingAgent,
  "MKT-003": MKT_003 as unknown as MarketingAgent,
  "MKT-004": MKT_004 as unknown as MarketingAgent,
  "MKT-005": MKT_005 as unknown as MarketingAgent,
  "MKT-006": MKT_006 as unknown as MarketingAgent,
  "MKT-007": MKT_007 as unknown as MarketingAgent,
  "MKT-008": MKT_008 as unknown as MarketingAgent,
  "MKT-009": MKT_009 as unknown as MarketingAgent,
  "MKT-010": MKT_010 as unknown as MarketingAgent,
  "MKT-011": MKT_011 as unknown as MarketingAgent,
  "MKT-012": MKT_012 as unknown as MarketingAgent,
  "MKT-013": MKT_013 as unknown as MarketingAgent,
  "MKT-014": MKT_014 as unknown as MarketingAgent,
  "MKT-015": MKT_015 as unknown as MarketingAgent,
  // Skill 8: Execute Marketing
  "MKT-016": MKT_016 as unknown as MarketingAgent,
  "MKT-017": MKT_017 as unknown as MarketingAgent,
  "MKT-018": MKT_018 as unknown as MarketingAgent,
  "MKT-019": MKT_019 as unknown as MarketingAgent,
  "MKT-020": MKT_020 as unknown as MarketingAgent,
  "MKT-021": MKT_021 as unknown as MarketingAgent,
  "MKT-022": MKT_022 as unknown as MarketingAgent,
  "MKT-023": MKT_023 as unknown as MarketingAgent,
  "MKT-024": MKT_024 as unknown as MarketingAgent,
  "MKT-025": MKT_025 as unknown as MarketingAgent,
  "MKT-026": MKT_026 as unknown as MarketingAgent,
  "MKT-027": MKT_027 as unknown as MarketingAgent,
  "MKT-028": MKT_028 as unknown as MarketingAgent,
  "MKT-029": MKT_029 as unknown as MarketingAgent,
  "MKT-030": MKT_030 as unknown as MarketingAgent,
  "MKT-031": MKT_031 as unknown as MarketingAgent,
  "MKT-032": MKT_032 as unknown as MarketingAgent,
  "MKT-033": MKT_033 as unknown as MarketingAgent,
  "MKT-034": MKT_034 as unknown as MarketingAgent,
  "MKT-035": MKT_035 as unknown as MarketingAgent,
  "MKT-036": MKT_036 as unknown as MarketingAgent,
  "MKT-037": MKT_037 as unknown as MarketingAgent,
  "MKT-038": MKT_038 as unknown as MarketingAgent,
  "MKT-039": MKT_039 as unknown as MarketingAgent,
  "MKT-040": MKT_040 as unknown as MarketingAgent,
};

export function getMarketingAgent(taskId: string): MarketingAgent | undefined {
  return MARKETING_AGENTS[taskId];
}

export function listMarketingAgents(): Array<{
  taskId: string;
  taskName: string;
  taskType: string;
  skill: string;
  subSkill: string;
  cmpReference: string;
}> {
  return Object.values(MARKETING_AGENTS).map((agent) => ({
    taskId: agent.taskId,
    taskName: agent.taskName,
    taskType: agent.taskType,
    skill: agent.skill,
    subSkill: agent.subSkill,
    cmpReference: agent.cmpReference,
  }));
}

export function getMarketingAgentsBySkill(skill: string): MarketingAgent[] {
  return Object.values(MARKETING_AGENTS).filter((agent) =>
    agent.skill.toLowerCase().includes(skill.toLowerCase())
  );
}

export function getMarketingAgentsBySubSkill(subSkill: string): MarketingAgent[] {
  return Object.values(MARKETING_AGENTS).filter((agent) =>
    agent.subSkill.toLowerCase().includes(subSkill.toLowerCase())
  );
}

export const MARKETING_DOMAIN_INFO = {
  domain: "C",
  name: "Marketing Management",
  description: "마케팅 전략 수립 및 실행 도메인",
  skills: {
    "Skill 7": {
      name: "Plan Marketing",
      agents: 15,
      range: "MKT-001 ~ MKT-015",
      subSkills: ["7.1: Market Research", "7.2: Marketing Planning"],
    },
    "Skill 8": {
      name: "Execute Marketing",
      agents: 25,
      range: "MKT-016 ~ MKT-040",
      subSkills: [
        "8.1: Campaign Execution",
        "8.2: Performance Optimization",
        "8.3: Performance Monitoring",
        "8.4: Reporting & Analysis",
        "8.5: Lead Management",
        "8.6: Post-Event Marketing",
      ],
    },
  },
  totalAgents: 40,
};

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
  const agent = MARKETING_AGENTS[taskId];
  if (!agent) {
    throw new Error(`Agent ${taskId} not found`);
  }

  // Execute the base agent
  const result = await agent.execute(input);

  // Generate AI insights
  const agentPersona = agent.AGENT_PERSONA || "";
  const systemPrompt = `You are an AI assistant enhancing marketing agent outputs.
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

export default MARKETING_AGENTS;
