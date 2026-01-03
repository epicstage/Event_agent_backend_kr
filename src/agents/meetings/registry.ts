/**
 * Meetings Domain Registry
 *
 * CMP-IS Domain G: Meetings & Contents
 * 40개 에이전트 통합 레지스트리
 */

import { Skill13Agents } from "./skill13";
import { Skill14Agents } from "./skill14";

// 모든 Meetings 에이전트 병합
export const meetingsAgents = [...Skill13Agents, ...Skill14Agents];

// ID로 에이전트 찾기
export function getMeetingsAgentById(id: string) {
  return meetingsAgents.find((agent) => agent.id === id);
}

// 태스크 타입별 필터
export function getMeetingsAgentsByTaskType(taskType: "AI" | "Hybrid" | "Human") {
  return meetingsAgents.filter((agent) => agent.taskType === taskType);
}

// 스킬별 필터
export function getMeetingsAgentsBySkill(skill: 13 | 14) {
  if (skill === 13) return Skill13Agents;
  if (skill === 14) return Skill14Agents;
  return [];
}

// 검색 (이름/설명)
export function searchMeetingsAgents(query: string) {
  const lowerQuery = query.toLowerCase();
  return meetingsAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery)
  );
}

// 에이전트 메타데이터 목록
export function listMeetingsAgents() {
  return meetingsAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    taskType: agent.taskType,
    cmpStandard: `CMP-IS Domain G: Skill ${agent.skill}`,
  }));
}

// 에이전트 실행
export async function executeMeetingsAgent(agentId: string, input: unknown) {
  const agent = getMeetingsAgentById(agentId);
  if (!agent) {
    throw new Error(`Meetings Agent not found: ${agentId}`);
  }

  // 입력 검증
  const validatedInput = agent.inputSchema.parse(input);

  // 실행
  const result = await agent.execute(validatedInput as never);

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
  const agent = getMeetingsAgentById(taskId);
  if (!agent) {
    throw new Error(`Meetings Agent ${taskId} not found`);
  }

  // Execute the base agent
  const result = await agent.execute(input as never);

  // Generate AI insights
  const agentPersona = (agent as { persona?: string }).persona || "";
  const systemPrompt = `You are an AI assistant enhancing event program and content management agent outputs.
${agentPersona}

${shortTermMemory ? `Recent Context:\n${shortTermMemory}` : ""}
${userPreferences ? `User Preferences:\n${JSON.stringify(userPreferences)}` : ""}

Analyze the agent output and provide:
1. Key insights for program design or speaker management
2. Practical recommendations for implementation
3. Potential issues or conflicts to watch for
4. A confidence score (0.0-1.0)`;

  const userPrompt = `Agent: ${agent.name} (${taskId})
Input: ${JSON.stringify(input)}
Output: ${JSON.stringify(result)}

Provide insights in JSON format:
{
  "analysis": "brief analysis",
  "recommendations": ["rec1", "rec2"],
  "potential_issues": ["issue1", "issue2"],
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

// Meetings 도메인 통계
export const meetingsDomainStats = {
  totalAgents: meetingsAgents.length,
  skill13Count: Skill13Agents.length,
  skill14Count: Skill14Agents.length,
  byTaskType: {
    AI: meetingsAgents.filter((a) => (a.taskType as string) === "AI").length,
    Hybrid: meetingsAgents.filter((a) => (a.taskType as string) === "Hybrid").length,
    Human: meetingsAgents.filter((a) => (a.taskType as string) === "Human").length,
  },
};

export default {
  agents: meetingsAgents,
  getById: getMeetingsAgentById,
  getByTaskType: getMeetingsAgentsByTaskType,
  getBySkill: getMeetingsAgentsBySkill,
  search: searchMeetingsAgents,
  list: listMeetingsAgents,
  execute: executeMeetingsAgent,
  stats: meetingsDomainStats,
};
