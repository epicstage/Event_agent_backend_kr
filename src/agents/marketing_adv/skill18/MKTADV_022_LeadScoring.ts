/**
 * MKTADV-022: 리드 스코어링
 * CMP-IS Reference: 18.2.a - Lead scoring for event attendees
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Lead Scoring Analyst for event-driven sales enablement.`;

export const InputSchema = z.object({
  event_id: z.string(),
  scoring_model: z.enum(["demographic", "behavioral", "engagement", "hybrid"]).optional(),
  lead_ids: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  scoring_id: z.string(),
  event_id: z.string(),
  model_config: z.object({
    model_name: z.string(),
    factors: z.array(z.object({
      factor: z.string(),
      weight: z.number(),
      category: z.string(),
    })),
    score_ranges: z.array(z.object({
      label: z.string(),
      min_score: z.number(),
      max_score: z.number(),
      action: z.string(),
    })),
  }),
  scoring_results: z.object({
    total_leads: z.number(),
    scored_leads: z.number(),
    distribution: z.array(z.object({
      tier: z.string(),
      count: z.number(),
      percentage: z.number(),
    })),
    avg_score: z.number(),
    score_change: z.number(),
  }),
  top_leads: z.array(z.object({
    lead_id: z.string(),
    score: z.number(),
    tier: z.string(),
    key_signals: z.array(z.string()),
    recommended_action: z.string(),
  })),
  insights: z.array(z.object({
    insight: z.string(),
    impact: z.string(),
  })),
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

  return {
    scoring_id: generateUUID(),
    event_id: validatedInput.event_id,
    model_config: {
      model_name: "Event Engagement Hybrid Model v2",
      factors: [
        { factor: "세션 참석 수", weight: 0.20, category: "engagement" },
        { factor: "네트워킹 활동", weight: 0.15, category: "engagement" },
        { factor: "회사 규모", weight: 0.15, category: "demographic" },
        { factor: "직급", weight: 0.15, category: "demographic" },
        { factor: "부스 방문", weight: 0.12, category: "behavioral" },
        { factor: "자료 다운로드", weight: 0.10, category: "behavioral" },
        { factor: "Q&A 참여", weight: 0.08, category: "engagement" },
        { factor: "설문 완료", weight: 0.05, category: "behavioral" },
      ],
      score_ranges: [
        { label: "Hot", min_score: 80, max_score: 100, action: "즉시 영업 연락" },
        { label: "Warm", min_score: 60, max_score: 79, action: "육성 캠페인" },
        { label: "Cool", min_score: 40, max_score: 59, action: "콘텐츠 공유" },
        { label: "Cold", min_score: 0, max_score: 39, action: "장기 육성" },
      ],
    },
    scoring_results: {
      total_leads: 856,
      scored_leads: 842,
      distribution: [
        { tier: "Hot", count: 85, percentage: 10.1 },
        { tier: "Warm", count: 215, percentage: 25.5 },
        { tier: "Cool", count: 320, percentage: 38.0 },
        { tier: "Cold", count: 222, percentage: 26.4 },
      ],
      avg_score: 52.3,
      score_change: 8.5,
    },
    top_leads: [
      { lead_id: "LEAD-001", score: 95, tier: "Hot", key_signals: ["키노트 참석", "3개 부스 방문", "데모 요청"], recommended_action: "영업팀 즉시 후속" },
      { lead_id: "LEAD-002", score: 92, tier: "Hot", key_signals: ["VIP 세션 참석", "명함 교환 8건", "자료 5개 다운로드"], recommended_action: "임원 연결 미팅" },
      { lead_id: "LEAD-003", score: 88, tier: "Hot", key_signals: ["전 세션 참석", "Q&A 3회 참여", "네트워킹 활발"], recommended_action: "솔루션 데모 제안" },
      { lead_id: "LEAD-004", score: 85, tier: "Hot", key_signals: ["Enterprise 티켓", "파트너 세션 참석", "후속 미팅 요청"], recommended_action: "파트너십 논의" },
      { lead_id: "LEAD-005", score: 82, tier: "Hot", key_signals: ["재참가자", "5개 세션 참석", "설문 완료"], recommended_action: "업셀 기회 탐색" },
    ],
    insights: [
      { insight: "VIP 티켓 구매자의 평균 점수가 일반 대비 35% 높음", impact: "VIP 프로그램 강화 필요" },
      { insight: "네트워킹 참여가 높은 리드의 전환율 3배", impact: "네트워킹 기회 확대" },
      { insight: "3개 이상 세션 참석자의 Hot 비율 45%", impact: "다중 세션 참여 유도" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-022",
  taskName: "리드 스코어링",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.2.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.2: Lead Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
