/**
 * SITE-038: 숙박 컴플라이언스
 * CMP-IS Reference: 16.12.a - Housing compliance management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Compliance Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotels: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    certifications: z.array(z.string()).optional(),
    safety_features: z.array(z.string()).optional(),
    accessibility_features: z.array(z.string()).optional(),
    last_inspection_date: z.string().optional(),
  })),
  compliance_requirements: z.array(z.string()),
  guest_special_needs: z.array(z.object({
    need_type: z.string(),
    count: z.number(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  compliance_report_id: z.string(),
  event_id: z.string(),
  hotel_compliance: z.array(z.object({
    hotel_name: z.string(),
    compliance_score: z.number(),
    met_requirements: z.array(z.string()),
    unmet_requirements: z.array(z.string()),
    certifications: z.array(z.string()),
    status: z.string(),
  })),
  accessibility_assessment: z.object({
    total_accessible_rooms: z.number(),
    needs_met: z.boolean(),
    gaps: z.array(z.string()),
  }),
  action_items: z.array(z.object({ hotel: z.string(), requirement: z.string(), action: z.string(), deadline: z.string() })),
  overall_compliance_rate: z.number(),
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

  const hotelCompliance = validatedInput.hotels.map(h => {
    const allFeatures = [...(h.certifications || []), ...(h.safety_features || []), ...(h.accessibility_features || [])];
    const met = validatedInput.compliance_requirements.filter(r => allFeatures.some(f => f.toLowerCase().includes(r.toLowerCase())));
    const unmet = validatedInput.compliance_requirements.filter(r => !met.includes(r));
    const score = Math.round((met.length / validatedInput.compliance_requirements.length) * 100);

    return {
      hotel_name: h.hotel_name,
      compliance_score: score,
      met_requirements: met,
      unmet_requirements: unmet,
      certifications: h.certifications || [],
      status: score >= 80 ? "compliant" : score >= 60 ? "partial" : "non_compliant",
    };
  });

  const totalAccessibleRooms = validatedInput.hotels.filter(h => h.accessibility_features?.length).length * 5; // 추정
  const accessibilityNeeds = validatedInput.guest_special_needs?.filter(n => n.need_type.includes("accessibility")) || [];
  const totalNeeds = accessibilityNeeds.reduce((sum, n) => sum + n.count, 0);

  const actionItems = hotelCompliance
    .filter(h => h.unmet_requirements.length > 0)
    .flatMap(h => h.unmet_requirements.map(r => ({
      hotel: h.hotel_name,
      requirement: r,
      action: "호텔에 요구사항 충족 확인 요청",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })));

  const avgCompliance = Math.round(hotelCompliance.reduce((sum, h) => sum + h.compliance_score, 0) / hotelCompliance.length);

  return {
    compliance_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    hotel_compliance: hotelCompliance,
    accessibility_assessment: {
      total_accessible_rooms: totalAccessibleRooms,
      needs_met: totalAccessibleRooms >= totalNeeds,
      gaps: totalAccessibleRooms < totalNeeds ? [`접근성 객실 ${totalNeeds - totalAccessibleRooms}실 부족`] : [],
    },
    action_items: actionItems,
    overall_compliance_rate: avgCompliance,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-038",
  taskName: "숙박 컴플라이언스",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.12.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.12: Compliance",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
