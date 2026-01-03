/**
 * SITE-003: 현장 실사 관리
 * CMP-IS Reference: 15.1.c - Site inspection planning
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Site Inspector for event venues.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_id: z.string(),
  venue_name: z.string(),
  inspection_date: z.string(),
  inspection_type: z.enum(["initial_survey", "venue_walkthrough", "technical_assessment", "safety_audit", "final_inspection"]),
  areas_to_inspect: z.array(z.string()),
  checklist_items: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  inspection_id: z.string(),
  event_id: z.string(),
  venue_id: z.string(),
  checklist: z.array(z.object({ item: z.string(), category: z.string(), status: z.string(), notes: z.string() })),
  findings: z.array(z.object({ finding: z.string(), severity: z.string(), recommendation: z.string() })),
  overall_rating: z.number(),
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

  const defaultChecklist = [
    { item: "비상구 접근성", category: "safety", status: "pass", notes: "양호" },
    { item: "화재 경보 시스템", category: "safety", status: "pass", notes: "정상 작동" },
    { item: "휠체어 접근성", category: "accessibility", status: "pass", notes: "주요 구역 접근 가능" },
    { item: "전력 용량", category: "technical", status: "check", notes: "추가 확인 필요" },
    { item: "Wi-Fi 속도", category: "technical", status: "pass", notes: "100Mbps 이상" },
  ];

  return {
    inspection_id: generateUUID(),
    event_id: validatedInput.event_id,
    venue_id: validatedInput.venue_id,
    checklist: defaultChecklist,
    findings: [
      { finding: "전력 용량 추가 확인 필요", severity: "medium", recommendation: "전기 기술자와 사전 협의" },
    ],
    overall_rating: 4,
    recommendations: ["전력 용량 사전 확인", "비상 대피 계획 수립"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-003",
  taskName: "현장 실사 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.1.c",
  skill: "Skill 15: Site Operations",
  subSkill: "15.1: Site Selection",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
