/**
 * SITE-037: 룸 블록 릴리스 관리
 * CMP-IS Reference: 16.3.b - Room block release management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Room Block Release Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_blocks: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    rooms_blocked: z.number(),
    rooms_picked_up: z.number(),
    cutoff_date: z.string(),
    release_policy: z.string().optional(),
  })),
  release_request: z.object({
    hotel_id: z.string(),
    rooms_to_release: z.number(),
    reason: z.string(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  release_plan_id: z.string(),
  event_id: z.string(),
  current_status: z.array(z.object({
    hotel_name: z.string(),
    blocked: z.number(),
    picked_up: z.number(),
    unreserved: z.number(),
    days_to_cutoff: z.number(),
    release_eligible: z.number(),
  })),
  release_recommendations: z.array(z.object({
    hotel: z.string(),
    recommended_release: z.number(),
    rationale: z.string(),
    financial_impact: z.string(),
  })),
  release_schedule: z.array(z.object({ hotel: z.string(), phase: z.string(), rooms: z.number(), date: z.string() })),
  risk_assessment: z.object({ demand_risk: z.string(), financial_risk: z.string() }),
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
  const now = new Date();

  const currentStatus = validatedInput.hotel_blocks.map(h => {
    const daysTo = Math.ceil((new Date(h.cutoff_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const unreserved = h.rooms_blocked - h.rooms_picked_up;
    const releaseEligible = daysTo > 14 ? Math.floor(unreserved * 0.5) : daysTo > 7 ? Math.floor(unreserved * 0.3) : 0;

    return {
      hotel_name: h.hotel_name,
      blocked: h.rooms_blocked,
      picked_up: h.rooms_picked_up,
      unreserved,
      days_to_cutoff: daysTo,
      release_eligible: releaseEligible,
    };
  });

  const recommendations = currentStatus
    .filter(h => h.release_eligible > 0)
    .map(h => ({
      hotel: h.hotel_name,
      recommended_release: h.release_eligible,
      rationale: h.days_to_cutoff > 14 ? "컷오프까지 여유 있음, 수요 패턴 기반 조기 릴리스 권장" : "컷오프 임박, 부분 릴리스만 권장",
      financial_impact: "감실 패널티 감소 예상",
    }));

  const releaseSchedule = currentStatus
    .filter(h => h.release_eligible > 0)
    .map(h => ({
      hotel: h.hotel_name,
      phase: h.days_to_cutoff > 14 ? "Phase 1" : "Phase 2",
      rooms: h.release_eligible,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }));

  const totalUnreserved = currentStatus.reduce((sum, h) => sum + h.unreserved, 0);
  const totalBlocked = currentStatus.reduce((sum, h) => sum + h.blocked, 0);

  return {
    release_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    current_status: currentStatus,
    release_recommendations: recommendations,
    release_schedule: releaseSchedule,
    risk_assessment: {
      demand_risk: totalUnreserved > totalBlocked * 0.3 ? "low" : "medium",
      financial_risk: recommendations.length > 0 ? "manageable" : "none",
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-037",
  taskName: "룸 블록 릴리스 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.3.b",
  skill: "Skill 16: Housing Management",
  subSkill: "16.3: Inventory Control",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
