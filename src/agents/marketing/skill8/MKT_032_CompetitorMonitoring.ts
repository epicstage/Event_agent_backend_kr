/**
 * MKT-032: 경쟁사 모니터링
 * CMP-IS Reference: 8.3.d - Competitor marketing monitoring
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Competitor Monitoring Agent.
CMP-IS Standard: 8.3.d - Monitoring competitor marketing activities.`;

export const InputSchema = z.object({
  event_id: z.string(),
  competitors: z.array(z.string()),
  monitoring_aspects: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  monitoring_id: z.string(),
  event_id: z.string(),
  competitor_analysis: z.array(z.object({
    competitor: z.string(),
    event_info: z.object({ name: z.string(), date: z.string(), positioning: z.string() }),
    marketing_activities: z.array(z.object({ channel: z.string(), activity: z.string(), frequency: z.string() })),
    messaging: z.object({ key_themes: z.array(z.string()), unique_selling_points: z.array(z.string()) }),
    estimated_spend: z.string(),
    threat_level: z.string(),
  })),
  market_insights: z.array(z.object({ insight: z.string(), implication: z.string(), action: z.string() })),
  opportunities: z.array(z.object({ opportunity: z.string(), rationale: z.string(), priority: z.string() })),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  return {
    monitoring_id: generateUUID(),
    event_id: validatedInput.event_id,
    competitor_analysis: validatedInput.competitors.map((competitor, idx) => ({
      competitor,
      event_info: {
        name: `${competitor} Conference 2026`,
        date: `2026-0${3 + idx}-15`,
        positioning: idx === 0 ? "프리미엄 전문가 행사" : "대중적 네트워킹 행사",
      },
      marketing_activities: [
        { channel: "LinkedIn", activity: "스폰서드 콘텐츠", frequency: "주 3회" },
        { channel: "Email", activity: "뉴스레터 캠페인", frequency: "주 2회" },
        { channel: "Google Ads", activity: "검색 광고", frequency: "상시" },
      ],
      messaging: {
        key_themes: ["업계 최신 트렌드", "네트워킹 기회", "실무 인사이트"],
        unique_selling_points: ["글로벌 연사 라인업", "1:1 미팅 매칭", "온오프 하이브리드"],
      },
      estimated_spend: idx === 0 ? "5000만원+" : "2000만원+",
      threat_level: idx === 0 ? "high" : "medium",
    })),
    market_insights: [
      { insight: "경쟁사 모두 LinkedIn 집중", implication: "LinkedIn 광고 경쟁 심화", action: "차별화된 콘텐츠 필요" },
      { insight: "얼리버드 할인 공격적 운영", implication: "가격 경쟁 압박", action: "부가가치 강조" },
      { insight: "하이브리드 포맷 확대", implication: "온라인 참석 옵션 기대", action: "온라인 경험 강화" },
    ],
    opportunities: [
      { opportunity: "YouTube/TikTok 채널 미활용", rationale: "경쟁사 대비 선점 가능", priority: "high" },
      { opportunity: "인플루언서 마케팅 부재", rationale: "신선한 접근으로 차별화", priority: "medium" },
      { opportunity: "커뮤니티 빌딩 약함", rationale: "장기 관계 구축 기회", priority: "medium" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-032";
export const taskName = "경쟁사 모니터링";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.3.d";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.3: Performance Monitoring";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
