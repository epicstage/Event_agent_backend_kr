/**
 * SITE-005: 안전 및 보안 계획
 * CMP-IS Reference: 15.3.a - Safety and security planning
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Safety and Security Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_id: z.string(),
  attendee_count: z.number(),
  event_type: z.string(),
  vip_attendees: z.boolean().default(false),
  risk_level: z.enum(["low", "medium", "high"]).default("medium"),
  special_considerations: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  security_plan: z.object({
    security_level: z.string(),
    personnel_required: z.number(),
    access_control: z.array(z.string()),
    monitoring: z.array(z.string()),
  }),
  safety_plan: z.object({
    emergency_procedures: z.array(z.object({ scenario: z.string(), procedure: z.string() })),
    medical_coverage: z.object({ first_aid_stations: z.number(), medical_staff: z.number() }),
    evacuation_plan: z.object({ routes: z.array(z.string()), assembly_points: z.array(z.string()) }),
  }),
  risk_mitigation: z.array(z.object({ risk: z.string(), mitigation: z.string(), owner: z.string() })),
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
  const personnelRequired = Math.ceil(validatedInput.attendee_count / 100) * (validatedInput.vip_attendees ? 2 : 1);

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    security_plan: {
      security_level: validatedInput.risk_level === "high" ? "Level 3" : validatedInput.risk_level === "medium" ? "Level 2" : "Level 1",
      personnel_required: personnelRequired,
      access_control: ["배지 확인", "가방 검사", "금속 탐지기"],
      monitoring: ["CCTV", "순찰", "통제실"],
    },
    safety_plan: {
      emergency_procedures: [
        { scenario: "화재", procedure: "대피 경보 발령 → 안내원 유도 → 집결지 이동" },
        { scenario: "의료 응급", procedure: "119 신고 → 응급 처치 → 이송" },
      ],
      medical_coverage: {
        first_aid_stations: Math.ceil(validatedInput.attendee_count / 500),
        medical_staff: Math.ceil(validatedInput.attendee_count / 250),
      },
      evacuation_plan: {
        routes: ["Route A: 메인홀 → 정문", "Route B: 전시장 → 측문"],
        assembly_points: ["주차장 A", "광장"],
      },
    },
    risk_mitigation: [
      { risk: "과밀", mitigation: "입장 인원 통제", owner: "운영팀" },
      { risk: "화재", mitigation: "소화기 배치, 대피 훈련", owner: "안전팀" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-005",
  taskName: "안전 및 보안 계획",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.3.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.3: Safety & Security",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
