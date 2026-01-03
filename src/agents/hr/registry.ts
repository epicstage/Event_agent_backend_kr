/**
 * HR Domain Registry
 *
 * CMP-IS Domain F: Human Resources
 * 40개 에이전트 통합 레지스트리
 */

import { skill11Agents } from "./skill11";
import { skill12Agents } from "./skill12";

// 모든 HR 에이전트 병합
export const hrAgents = [...skill11Agents, ...skill12Agents];

// ID로 에이전트 찾기
export function getHRAgentById(id: string) {
  return hrAgents.find((agent) => agent.id === id);
}

// 태스크 타입별 필터
export function getHRAgentsByTaskType(taskType: "AI" | "Hybrid" | "Human") {
  return hrAgents.filter((agent) => agent.taskType === taskType);
}

// 스킬별 필터
export function getHRAgentsBySkill(skill: 11 | 12) {
  if (skill === 11) return skill11Agents;
  if (skill === 12) return skill12Agents;
  return [];
}

// 검색 (이름/설명)
export function searchHRAgents(query: string) {
  const lowerQuery = query.toLowerCase();
  return hrAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery)
  );
}

// 에이전트 메타데이터 목록
export function listHRAgents() {
  return hrAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    taskType: agent.taskType,
    cmpStandard: agent.cmpStandard,
  }));
}

// 에이전트 실행
export async function executeHRAgent(agentId: string, input: unknown) {
  const agent = getHRAgentById(agentId);
  if (!agent) {
    throw new Error(`HR Agent not found: ${agentId}`);
  }

  // 입력 검증
  const validatedInput = agent.inputSchema.parse(input);

  // 실행
  const result = await agent.execute(validatedInput);

  // 출력 검증
  const validatedOutput = agent.outputSchema.parse(result);

  return {
    agentId: agent.id,
    agentName: agent.name,
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
  const agent = getHRAgentById(taskId);
  if (!agent) {
    throw new Error(`HR Agent ${taskId} not found`);
  }

  // Execute the base agent
  const result = await agent.execute(input as never);

  // Generate AI insights
  const agentPersona = agent.persona || "";
  const systemPrompt = `You are an AI assistant enhancing HR management agent outputs.
${agentPersona}

${shortTermMemory ? `Recent Context:\n${shortTermMemory}` : ""}
${userPreferences ? `User Preferences:\n${JSON.stringify(userPreferences)}` : ""}

Analyze the agent output and provide:
1. Key insights and analysis
2. Practical recommendations
3. Risk considerations (especially labor law compliance)
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

// HR 도메인 통계
export const hrDomainStats = {
  totalAgents: hrAgents.length,
  skill11Count: skill11Agents.length,
  skill12Count: skill12Agents.length,
  byTaskType: {
    AI: hrAgents.filter((a) => a.taskType === "AI").length,
    Hybrid: hrAgents.filter((a) => a.taskType === "Hybrid").length,
    Human: hrAgents.filter((a) => a.taskType === "Human").length,
  },
};

export default {
  agents: hrAgents,
  getById: getHRAgentById,
  getByTaskType: getHRAgentsByTaskType,
  getBySkill: getHRAgentsBySkill,
  search: searchHRAgents,
  list: listHRAgents,
  execute: executeHRAgent,
  stats: hrDomainStats,
};
