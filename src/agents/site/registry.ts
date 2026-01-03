/**
 * Site Domain Registry
 *
 * CMP-IS Domain H: Site Management
 * 40개 에이전트 통합 레지스트리
 */

import { Skill15Agents } from "./skill15";
import { SKILL16_AGENTS } from "./skill16";

// Skill16 객체를 배열로 변환
const skill16Array = Object.values(SKILL16_AGENTS);

// 모든 Site 에이전트 병합
export const siteAgents = [...Skill15Agents, ...skill16Array];

// ID로 에이전트 찾기
export function getSiteAgentById(id: string) {
  return siteAgents.find((agent) => agent.taskId === id);
}

// 태스크 타입별 필터
export function getSiteAgentsByTaskType(taskType: "AI" | "Hybrid" | "Human") {
  return siteAgents.filter((agent) => agent.taskType === taskType);
}

// 스킬별 필터
export function getSiteAgentsBySkill(skill: 15 | 16) {
  if (skill === 15) return Skill15Agents;
  if (skill === 16) return skill16Array;
  return [];
}

// 검색 (이름/설명)
export function searchSiteAgents(query: string) {
  const lowerQuery = query.toLowerCase();
  return siteAgents.filter(
    (agent) =>
      agent.taskName.toLowerCase().includes(lowerQuery) ||
      agent.skill.toLowerCase().includes(lowerQuery)
  );
}

// 에이전트 메타데이터 목록
export function listSiteAgents() {
  return siteAgents.map((agent) => ({
    id: agent.taskId,
    name: agent.taskName,
    taskType: agent.taskType,
    skill: agent.skill,
    cmpStandard: agent.cmpReference,
  }));
}

// 에이전트 실행
export async function executeSiteAgent(agentId: string, input: unknown) {
  const agent = getSiteAgentById(agentId);
  if (!agent) {
    throw new Error(`Site Agent not found: ${agentId}`);
  }

  // 입력 검증
  const validatedInput = agent.inputSchema.parse(input);

  // 실행
  const result = await agent.execute(validatedInput as never);

  // 출력 검증
  const validatedOutput = agent.outputSchema.parse(result);

  return {
    agentId: agent.taskId,
    agentName: agent.taskName,
    taskType: agent.taskType,
    result: validatedOutput,
    executedAt: new Date().toISOString(),
  };
}

// LLM 강화 에이전트 실행 (AI Insights 포함)
export async function executeAgentWithLLM(
  taskId: string,
  input: Record<string, unknown>,
  ai: Ai,
  shortTermMemory?: string,
  userPreferences?: Record<string, unknown>
) {
  const agent = getSiteAgentById(taskId);
  if (!agent) {
    throw new Error(`Site Agent ${taskId} not found`);
  }

  // Execute the base agent
  const result = await agent.execute(input as never);

  // Generate AI insights
  const agentPersona = (agent as { persona?: string }).persona || "";
  const systemPrompt = `You are an AI assistant enhancing site management and housing coordination agent outputs.
${agentPersona}

${shortTermMemory ? `Recent Context:\n${shortTermMemory}` : ""}
${userPreferences ? `User Preferences:\n${JSON.stringify(userPreferences)}` : ""}

Analyze the agent output and provide:
1. Key insights for venue, logistics, or housing management
2. Practical recommendations for implementation
3. Potential risks or operational issues to watch for
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
      ai_error: error instanceof Error ? error.message : "AI enhancement failed",
    };
  }
}

export default siteAgents;
