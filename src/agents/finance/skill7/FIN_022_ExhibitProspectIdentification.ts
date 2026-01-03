/**
 * FIN-022: 전시 잠재 고객 식별
 *
 * CMP-IS Reference: 7.3.a
 * Task Type: AI
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Exhibit Prospect Identification.
CMP-IS Standard: 7.3.a - Identifying potential exhibitors for events.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_info: z.object({
    name: z.string(),
    industry: z.string(),
    expected_attendees: z.number().int(),
    attendee_demographics: z.string().optional(),
  }),
  past_exhibitors: z.array(z.object({
    company_name: z.string(),
    industry: z.string(),
    booth_size: z.string().optional(),
    satisfaction_score: z.number().optional(),
  })).optional(),
  target_industries: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  prospect_list_id: z.string().uuid(),
  event_id: z.string().uuid(),
  prospects: z.array(z.object({
    company_name: z.string(),
    industry: z.string(),
    relevance_score: z.number().min(0).max(100),
    contact_priority: z.enum(["high", "medium", "low"]),
    rationale: z.string(),
    suggested_booth_size: z.string(),
    estimated_budget: z.string(),
  })),
  outreach_strategy: z.object({
    priority_sequence: z.array(z.string()),
    messaging_themes: z.array(z.string()),
    timeline_weeks: z.number(),
  }),
  total_prospects: z.number().int(),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const output: Output = {
    prospect_list_id: generateUUID(),
    event_id: validated.event_id,
    prospects: [
      {
        company_name: "테크솔루션 주식회사",
        industry: validated.event_info.industry,
        relevance_score: 92,
        contact_priority: "high",
        rationale: "주요 업계 리더, 과거 참여 이력 있음",
        suggested_booth_size: "Premium (6x6m)",
        estimated_budget: "$15,000-25,000",
      },
      {
        company_name: "이노베이트 코리아",
        industry: validated.event_info.industry,
        relevance_score: 85,
        contact_priority: "high",
        rationale: "신규 진출 기업, 브랜드 인지도 구축 필요",
        suggested_booth_size: "Standard (3x3m)",
        estimated_budget: "$8,000-12,000",
      },
      {
        company_name: "글로벌파트너스",
        industry: "관련 서비스",
        relevance_score: 78,
        contact_priority: "medium",
        rationale: "보완 서비스 제공업체",
        suggested_booth_size: "Standard (3x3m)",
        estimated_budget: "$6,000-10,000",
      },
    ],
    outreach_strategy: {
      priority_sequence: ["기존 참여사 재유치", "업계 리더", "신규 진출 희망사"],
      messaging_themes: ["ROI 강조", "네트워킹 기회", "브랜드 노출"],
      timeline_weeks: 12,
    },
    total_prospects: 3,
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-022",
  taskName: "전시 잠재 고객 식별",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.3.a",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.3: Develop and Manage Exhibit/Sponsorship Sales Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
