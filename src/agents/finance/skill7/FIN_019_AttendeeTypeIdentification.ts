/**
 * FIN-019: 잠재 참석자 유형 식별
 *
 * CMP-IS Reference: 7.2.a
 * Task Type: AI
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Attendee Type Identification.
CMP-IS Standard: 7.2.a - Identifying potential attendee segments.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  event_industry: z.string(),
  target_audience_definition: z.string(),
  past_attendee_data: z.array(z.object({
    job_title: z.string().optional(),
    company_size: z.string().optional(),
    industry: z.string().optional(),
    seniority: z.string().optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  identification_id: z.string().uuid(),
  event_id: z.string().uuid(),
  segments: z.array(z.object({
    segment_name: z.string(),
    description: z.string(),
    estimated_percentage: z.number(),
    key_characteristics: z.array(z.string()),
    engagement_strategy: z.string(),
    ticket_preference: z.string(),
  })),
  primary_segment: z.string(),
  market_size_estimate: z.string(),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const output: Output = {
    identification_id: generateUUID(),
    event_id: validated.event_id,
    segments: [
      {
        segment_name: "의사결정자",
        description: "C-Level 및 VP급 임원",
        estimated_percentage: 20,
        key_characteristics: ["예산 결정권 보유", "전략적 관심", "네트워킹 중시"],
        engagement_strategy: "VIP 프로그램, 독점 세션",
        ticket_preference: "VIP/Premium",
      },
      {
        segment_name: "실무자",
        description: "매니저 및 전문가",
        estimated_percentage: 50,
        key_characteristics: ["실무 지식 습득 목적", "동종업계 교류"],
        engagement_strategy: "워크숍, 실습 세션",
        ticket_preference: "Standard",
      },
      {
        segment_name: "학생/신입",
        description: "신입사원 및 학생",
        estimated_percentage: 15,
        key_characteristics: ["커리어 개발", "멘토링 관심"],
        engagement_strategy: "할인, 커리어 세션",
        ticket_preference: "Student/Early Career",
      },
      {
        segment_name: "파트너사",
        description: "스폰서 및 전시업체 관계자",
        estimated_percentage: 15,
        key_characteristics: ["비즈니스 기회 탐색", "리드 확보"],
        engagement_strategy: "비즈니스 매칭",
        ticket_preference: "Exhibitor/Partner",
      },
    ],
    primary_segment: "실무자",
    market_size_estimate: `${validated.event_industry} 분야 잠재 참석자 약 5,000-10,000명 추정`,
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-019",
  taskName: "잠재 참석자 유형 식별",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.2.a",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.2: Develop and Manage Registration Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
