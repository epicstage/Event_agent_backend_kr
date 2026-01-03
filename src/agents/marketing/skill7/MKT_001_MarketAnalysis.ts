/**
 * MKT-001: 시장 분석
 * CMP-IS Reference: 7.1.a - Conducting market research and analysis
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Market Analysis Agent for event marketing.
CMP-IS Standard: 7.1.a - Conducting market research and competitive analysis for events.
You analyze market trends, competitor events, and identify opportunities.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_type: z.string(),
  target_market: z.string(),
  geographic_scope: z.string().default("national"),
  competitors: z.array(z.object({
    name: z.string(),
    event_name: z.string().optional(),
    estimated_attendance: z.number().optional(),
  })).optional(),
  industry_vertical: z.string(),
  analysis_depth: z.enum(["basic", "standard", "comprehensive"]).default("standard"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  market_overview: z.object({
    market_size: z.string(),
    growth_trend: z.enum(["growing", "stable", "declining"]),
    key_drivers: z.array(z.string()),
    key_challenges: z.array(z.string()),
  }),
  competitive_landscape: z.array(z.object({
    competitor: z.string(),
    positioning: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    market_share_estimate: z.string(),
  })),
  target_audience: z.object({
    primary_segments: z.array(z.string()),
    estimated_size: z.number(),
    key_demographics: z.record(z.string()),
    behavioral_traits: z.array(z.string()),
  }),
  opportunities: z.array(z.object({
    opportunity: z.string(),
    potential_impact: z.enum(["high", "medium", "low"]),
    feasibility: z.enum(["high", "medium", "low"]),
  })),
  threats: z.array(z.object({
    threat: z.string(),
    likelihood: z.enum(["high", "medium", "low"]),
    severity: z.enum(["high", "medium", "low"]),
  })),
  recommendations: z.array(z.string()),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const competitorAnalysis = (validatedInput.competitors || []).map(comp => ({
    competitor: comp.name,
    positioning: "직접 경쟁사",
    strengths: ["브랜드 인지도", "기존 네트워크"],
    weaknesses: ["혁신 부족", "높은 가격"],
    market_share_estimate: "15-20%",
  }));

  if (competitorAnalysis.length === 0) {
    competitorAnalysis.push({
      competitor: "일반 경쟁 이벤트",
      positioning: "간접 경쟁사",
      strengths: ["낮은 진입장벽"],
      weaknesses: ["차별화 부족"],
      market_share_estimate: "분산됨",
    });
  }

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    market_overview: {
      market_size: validatedInput.geographic_scope === "national" ? "약 5조원 규모" : "약 1조원 규모",
      growth_trend: "growing",
      key_drivers: [
        "디지털 전환 가속화",
        "네트워킹 수요 증가",
        "지식 공유 플랫폼 확대",
        "하이브리드 이벤트 수요",
      ],
      key_challenges: [
        "경쟁 심화",
        "참가자 기대치 상승",
        "비용 상승 압력",
        "온라인 대체재 증가",
      ],
    },
    competitive_landscape: competitorAnalysis,
    target_audience: {
      primary_segments: [
        `${validatedInput.industry_vertical} 종사자`,
        "의사결정권자",
        "실무 담당자",
        "신규 진입자",
      ],
      estimated_size: 50000,
      key_demographics: {
        age_range: "25-55세",
        job_level: "과장급 이상",
        company_size: "중견기업 이상",
      },
      behavioral_traits: [
        "지속적 학습 추구",
        "네트워킹 중시",
        "최신 트렌드 관심",
        "ROI 중심 의사결정",
      ],
    },
    opportunities: [
      {
        opportunity: "하이브리드 형식으로 도달 범위 확대",
        potential_impact: "high",
        feasibility: "high",
      },
      {
        opportunity: "니치 세그먼트 타겟팅",
        potential_impact: "medium",
        feasibility: "high",
      },
      {
        opportunity: "스폰서십 패키지 다각화",
        potential_impact: "high",
        feasibility: "medium",
      },
    ],
    threats: [
      {
        threat: "대형 경쟁사의 시장 진입",
        likelihood: "medium",
        severity: "high",
      },
      {
        threat: "경기 침체로 인한 예산 축소",
        likelihood: "medium",
        severity: "medium",
      },
    ],
    recommendations: [
      "차별화된 콘텐츠로 포지셔닝 강화",
      "타겟 세그먼트별 맞춤 메시지 개발",
      "조기 등록 인센티브로 수요 확보",
      "파트너십을 통한 도달 범위 확대",
      "데이터 기반 마케팅 전략 수립",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-001";
export const taskName = "시장 분석";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.1.a";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.1: Market Research";

export default {
  taskId,
  taskName,
  taskType,
  cmpReference,
  skill,
  subSkill,
  AGENT_PERSONA,
  InputSchema,
  OutputSchema,
  execute,
};
