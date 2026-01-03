/**
 * SITE-014: 접근성 준수
 * CMP-IS Reference: 15.8.a - Accessibility compliance
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Accessibility Consultant.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_id: z.string(),
  expected_attendees_with_disabilities: z.number().optional(),
  accessibility_features_needed: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string(),
  event_id: z.string(),
  compliance_checklist: z.array(z.object({ requirement: z.string(), status: z.enum(["compliant", "partial", "non_compliant", "not_applicable"]), action_needed: z.string().optional() })),
  accommodations: z.array(z.object({ type: z.string(), description: z.string(), quantity: z.number() })),
  compliance_score: z.number(),
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

  const checklist = [
    { requirement: "휠체어 접근 가능 입구", status: "compliant" as const },
    { requirement: "장애인 화장실", status: "compliant" as const },
    { requirement: "점자 안내", status: "partial" as const, action_needed: "점자 안내판 추가 설치" },
    { requirement: "수화 통역", status: "partial" as const, action_needed: "수화 통역사 섭외" },
    { requirement: "청각 보조 시스템", status: "non_compliant" as const, action_needed: "FM 수신기 렌탈" },
  ];

  const compliantCount = checklist.filter(c => c.status === "compliant").length;
  const score = Math.round((compliantCount / checklist.length) * 100);

  return {
    assessment_id: generateUUID(),
    event_id: validatedInput.event_id,
    compliance_checklist: checklist,
    accommodations: [
      { type: "휠체어 좌석", description: "앞줄 지정석", quantity: 10 },
      { type: "청각 보조", description: "FM 수신기", quantity: 20 },
      { type: "수화 통역", description: "메인 세션", quantity: 2 },
    ],
    compliance_score: score,
    recommendations: ["장애인 참가자 사전 수요 조사", "접근성 안내 사전 공지"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-014",
  taskName: "접근성 준수",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.8.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.8: Accessibility",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
