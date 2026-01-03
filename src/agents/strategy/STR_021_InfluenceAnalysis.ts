/**
 * STR-021: 이해관계자 영향력 분석
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Influence Analysis)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Influence Analysis Agent.

Your expertise includes:
- Mapping formal and informal influence networks
- Identifying key influencers and decision makers
- Analyzing influence patterns and dynamics
- Developing influence strategies

CMP-IS Standard: Domain A - Strategic Planning (Influence Analysis)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  stakeholders: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    organization: z.string().optional(),
    formal_authority: z.number().min(1).max(10),
    informal_influence: z.number().min(1).max(10),
    network_reach: z.number().min(1).max(10),
    expertise_respect: z.number().min(1).max(10).optional(),
    resource_control: z.number().min(1).max(10).optional(),
    connections: z.array(z.string()).optional(),
  })),
  decision_points: z.array(z.object({
    decision: z.string(),
    importance: z.enum(["critical", "high", "medium", "low"]),
    stakeholders_involved: z.array(z.string()),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid(),
  event_id: z.string().uuid(),
  influence_map: z.array(z.object({
    stakeholder_id: z.string(),
    name: z.string(),
    influence_score: z.number(),
    influence_type: z.enum(["formal_authority", "expert", "networker", "resource_holder", "opinion_leader"]),
    influence_reach: z.enum(["broad", "focused", "limited"]),
    influence_direction: z.enum(["positive", "neutral", "negative", "unknown"]),
    key_influence_areas: z.array(z.string()),
    influence_tactics: z.array(z.string()),
  })),
  influence_network: z.object({
    central_nodes: z.array(z.object({
      stakeholder_id: z.string(),
      name: z.string(),
      centrality_score: z.number(),
      role_in_network: z.string(),
    })),
    clusters: z.array(z.object({
      cluster_name: z.string(),
      members: z.array(z.string()),
      key_connector: z.string(),
      cluster_influence: z.enum(["high", "medium", "low"]),
    })),
    bridges: z.array(z.object({
      stakeholder_id: z.string(),
      name: z.string(),
      connects: z.array(z.string()),
      strategic_value: z.string(),
    })),
  }),
  influence_strategies: z.array(z.object({
    objective: z.string(),
    target_stakeholders: z.array(z.string()),
    approach: z.string(),
    key_influencers_to_engage: z.array(z.string()),
    tactics: z.array(z.string()),
    expected_outcome: z.string(),
  })),
  risk_assessment: z.array(z.object({
    risk: z.string(),
    negative_influencers: z.array(z.string()),
    mitigation: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-021",
  taskName: "Influence Analysis",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자의 영향력 구조와 네트워크를 분석합니다.",
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

type InfluenceType = "formal_authority" | "expert" | "networker" | "resource_holder" | "opinion_leader";

function determineInfluenceType(s: {
  formal_authority: number;
  informal_influence: number;
  network_reach: number;
  expertise_respect?: number;
  resource_control?: number;
}): InfluenceType {
  const scores = {
    formal_authority: s.formal_authority,
    expert: s.expertise_respect || 5,
    networker: s.network_reach,
    resource_holder: s.resource_control || 5,
    opinion_leader: s.informal_influence,
  };

  const maxKey = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  return maxKey as InfluenceType;
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const influenceMap = validated.stakeholders.map(s => {
    const score = Math.round(
      (s.formal_authority * 0.3 +
        s.informal_influence * 0.25 +
        s.network_reach * 0.2 +
        (s.expertise_respect || 5) * 0.15 +
        (s.resource_control || 5) * 0.1) * 10
    );

    const influenceType = determineInfluenceType(s);
    const reach = s.network_reach >= 8 ? "broad" as const : s.network_reach >= 5 ? "focused" as const : "limited" as const;

    return {
      stakeholder_id: s.id,
      name: s.name,
      influence_score: score,
      influence_type: influenceType,
      influence_reach: reach,
      influence_direction: "neutral" as const,
      key_influence_areas: [s.role, "의사결정", "여론 형성"],
      influence_tactics: influenceType === "formal_authority"
        ? ["공식 채널 활용", "정책 결정 참여", "승인 권한 행사"]
        : influenceType === "expert"
        ? ["전문 의견 제시", "기술 자문", "교육/멘토링"]
        : influenceType === "networker"
        ? ["연결/소개", "정보 공유", "협력 촉진"]
        : influenceType === "resource_holder"
        ? ["자원 배분", "예산 통제", "인력 지원"]
        : ["여론 형성", "비공식 설득", "분위기 조성"],
    };
  });

  // Sort by influence score for network analysis
  const sorted = [...influenceMap].sort((a, b) => b.influence_score - a.influence_score);
  const centralNodes = sorted.slice(0, 3).map((s, idx) => ({
    stakeholder_id: s.stakeholder_id,
    name: s.name,
    centrality_score: s.influence_score,
    role_in_network: idx === 0 ? "핵심 허브" : idx === 1 ? "주요 연결자" : "영향력자",
  }));

  // Create clusters based on influence type
  const clusters = [
    {
      cluster_name: "의사결정권자 그룹",
      members: influenceMap.filter(s => s.influence_type === "formal_authority").map(s => s.name),
      key_connector: sorted[0]?.name || "미정",
      cluster_influence: "high" as const,
    },
    {
      cluster_name: "전문가 그룹",
      members: influenceMap.filter(s => s.influence_type === "expert").map(s => s.name),
      key_connector: influenceMap.find(s => s.influence_type === "expert")?.name || "미정",
      cluster_influence: "medium" as const,
    },
  ].filter(c => c.members.length > 0);

  // Identify bridges
  const bridges = influenceMap
    .filter(s => s.influence_type === "networker" && s.influence_reach === "broad")
    .slice(0, 2)
    .map(s => ({
      stakeholder_id: s.stakeholder_id,
      name: s.name,
      connects: clusters.map(c => c.cluster_name),
      strategic_value: "그룹 간 소통 촉진",
    }));

  return {
    analysis_id: generateUUID(),
    event_id: validated.event_id,
    influence_map: influenceMap,
    influence_network: {
      central_nodes: centralNodes,
      clusters,
      bridges,
    },
    influence_strategies: [
      {
        objective: "핵심 의사결정 지지 확보",
        target_stakeholders: sorted.slice(0, 3).map(s => s.name),
        approach: "상향식 영향력 활용",
        key_influencers_to_engage: centralNodes.map(n => n.name),
        tactics: ["1:1 미팅", "공식 제안서", "데이터 기반 설득"],
        expected_outcome: "주요 의사결정 승인",
      },
      {
        objective: "광범위한 지지 구축",
        target_stakeholders: influenceMap.filter(s => s.influence_type === "opinion_leader").map(s => s.name),
        approach: "여론 형성자 활용",
        key_influencers_to_engage: influenceMap.filter(s => s.influence_type === "opinion_leader").slice(0, 2).map(s => s.name),
        tactics: ["비공식 브리핑", "참여 기회 제공", "인정과 감사"],
        expected_outcome: "전반적 긍정 여론",
      },
    ],
    risk_assessment: [
      {
        risk: "핵심 영향력자 이탈",
        negative_influencers: sorted.slice(0, 2).map(s => s.name),
        mitigation: "긴밀한 관계 유지 및 대체 영향력 경로 확보",
      },
      {
        risk: "부정적 여론 확산",
        negative_influencers: [],
        mitigation: "조기 경보 시스템 및 신속 대응 체계",
      },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
