/**
 * MTG-037: Content Rights Management
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_037_InputSchema = z.object({
  event_id: z.string().uuid(),
  content_items: z.array(z.object({
    content_id: z.string(),
    content_type: z.enum(["presentation", "video", "paper", "image", "music"]),
    creator: z.string(),
    contains_third_party: z.boolean(),
  })),
  intended_uses: z.array(z.enum(["live_event", "recording", "streaming", "download", "commercial", "derivative"])),
  distribution_scope: z.enum(["attendees_only", "members", "public"]),
});

export const MTG_037_OutputSchema = z.object({
  event_id: z.string(),
  rights_assessment: z.object({
    content_rights: z.array(z.object({
      content_id: z.string(),
      current_status: z.enum(["cleared", "pending", "needs_attention", "restricted"]),
      rights_held: z.array(z.string()),
      rights_needed: z.array(z.string()),
      actions_required: z.array(z.string()),
    })),
    third_party_licenses: z.array(z.object({ item: z.string(), license_type: z.string(), cost: z.string(), status: z.string() })),
  }),
  legal_framework: z.object({
    agreements_needed: z.array(z.object({ agreement: z.string(), parties: z.string(), key_clauses: z.array(z.string()) })),
    compliance_checklist: z.array(z.object({ item: z.string(), status: z.enum(["complete", "in_progress", "not_started"]) })),
  }),
  risk_assessment: z.array(z.object({ risk: z.string(), likelihood: z.string(), impact: z.string(), mitigation: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_037_Input = z.infer<typeof MTG_037_InputSchema>;
export type MTG_037_Output = z.infer<typeof MTG_037_OutputSchema>;

export async function execute(input: MTG_037_Input): Promise<MTG_037_Output> {
  const contentRights = input.content_items.map(item => ({
    content_id: item.content_id,
    current_status: (item.contains_third_party ? "needs_attention" : "pending") as "cleared" | "pending" | "needs_attention" | "restricted",
    rights_held: ["Creator permission"],
    rights_needed: [
      ...input.intended_uses.includes("recording") ? ["Recording rights"] : [],
      ...input.intended_uses.includes("streaming") ? ["Streaming rights"] : [],
      ...input.intended_uses.includes("commercial") ? ["Commercial use rights"] : [],
      ...item.contains_third_party ? ["Third-party clearance"] : [],
    ],
    actions_required: [
      ...item.contains_third_party ? ["Identify and clear third-party content"] : [],
      "Obtain signed release from " + item.creator,
      ...input.distribution_scope === "public" ? ["Review for public distribution"] : [],
    ],
  }));

  return {
    event_id: input.event_id,
    rights_assessment: {
      content_rights: contentRights,
      third_party_licenses: [
        { item: "Stock images", license_type: "Extended commercial", cost: "$50-200 per image", status: "Verify per image" },
        { item: "Background music", license_type: "Sync license", cost: "$100-500 per track", status: "Required if used" },
        { item: "Software demos", license_type: "Vendor permission", cost: "Usually free", status: "Request in writing" },
      ],
    },
    legal_framework: {
      agreements_needed: [
        {
          agreement: "Speaker Content Release",
          parties: "Event organizer + Speaker",
          key_clauses: ["Grant of rights", "Permitted uses", "Attribution requirements", "Warranty of originality"],
        },
        {
          agreement: "Attendee Media Consent",
          parties: "Event organizer + Attendees",
          key_clauses: ["Consent to be recorded", "Use of likeness", "Opt-out mechanism"],
        },
        {
          agreement: "Third-Party License",
          parties: "Event organizer + Content owner",
          key_clauses: ["Scope of use", "Duration", "Territory", "Payment terms"],
        },
      ],
      compliance_checklist: [
        { item: "All speakers signed release", status: "in_progress" },
        { item: "Attendee consent collected", status: "in_progress" },
        { item: "Third-party content identified", status: "not_started" },
        { item: "Music licenses obtained", status: "not_started" },
        { item: "Privacy policy updated", status: "complete" },
      ],
    },
    risk_assessment: [
      { risk: "Copyright infringement claim", likelihood: "Medium", impact: "High", mitigation: "Thorough clearance process" },
      { risk: "Speaker disputes use", likelihood: "Low", impact: "Medium", mitigation: "Clear contracts upfront" },
      { risk: "GDPR/privacy violation", likelihood: "Low", impact: "High", mitigation: "Consent mechanisms" },
    ],
    recommendations: [
      "Include rights clause in all speaker contracts",
      "Create content submission checklist",
      "Use royalty-free music library",
      "Document all clearances centrally",
      "Consult legal for complex situations",
    ],
  };
}

export const MTG_037_ContentRights = {
  id: "MTG-037", name: "Content Rights Management", description: "콘텐츠 권리 관리",
  inputSchema: MTG_037_InputSchema, outputSchema: MTG_037_OutputSchema, execute,
  tags: ["rights", "legal", "copyright"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
