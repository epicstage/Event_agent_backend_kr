/**
 * MTG-022: Speaker Contract Management
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_022_InputSchema = z.object({
  event_id: z.string().uuid(),
  speaker_id: z.string(),
  speaker_name: z.string(),
  session_type: z.enum(["keynote", "panel", "workshop", "breakout", "masterclass"]),
  honorarium: z.number().optional(),
  travel_covered: z.boolean().default(true),
  accommodation_nights: z.number().default(0),
  recording_rights: z.boolean().default(true),
});

export const MTG_022_OutputSchema = z.object({
  event_id: z.string(),
  contract_details: z.object({
    speaker_id: z.string(),
    contract_type: z.string(),
    terms: z.array(z.object({ section: z.string(), content: z.string() })),
    deliverables: z.array(z.object({ item: z.string(), deadline: z.string() })),
    compensation: z.object({ honorarium: z.number(), travel: z.string(), accommodation: z.string(), other: z.array(z.string()) }),
  }),
  milestones: z.array(z.object({ milestone: z.string(), due_date: z.string(), status: z.string() })),
  risk_mitigation: z.array(z.object({ risk: z.string(), mitigation: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_022_Input = z.infer<typeof MTG_022_InputSchema>;
export type MTG_022_Output = z.infer<typeof MTG_022_OutputSchema>;

export async function execute(input: MTG_022_Input): Promise<MTG_022_Output> {
  return {
    event_id: input.event_id,
    contract_details: {
      speaker_id: input.speaker_id,
      contract_type: input.session_type === "keynote" ? "Premium Speaker Agreement" : "Standard Speaker Agreement",
      terms: [
        { section: "Engagement", content: `${input.speaker_name} agrees to present at [Event Name] on [Date]` },
        { section: "Session Details", content: `Session type: ${input.session_type}` },
        { section: "Exclusivity", content: "Speaker agrees not to present same content at competing events within 30 days" },
        { section: "Cancellation", content: "Either party may cancel with 30 days notice; honorarium pro-rated" },
        { section: "Recording Rights", content: input.recording_rights ? "Event may record and distribute content" : "No recording permitted without separate agreement" },
        { section: "Liability", content: "Speaker responsible for original content; event provides standard insurance" },
      ],
      deliverables: [
        { item: "Bio (150 words) + headshot", deadline: "8 weeks before event" },
        { item: "Session abstract (200 words)", deadline: "6 weeks before event" },
        { item: "Presentation slides", deadline: "2 weeks before event" },
        { item: "AV requirements", deadline: "4 weeks before event" },
      ],
      compensation: {
        honorarium: input.honorarium || 0,
        travel: input.travel_covered ? "Economy class flights covered" : "Not covered",
        accommodation: input.accommodation_nights > 0 ? `${input.accommodation_nights} nights at event hotel` : "Not covered",
        other: ["Speaker gift", "VIP event access", "Networking dinner invitation"],
      },
    },
    milestones: [
      { milestone: "Contract signed", due_date: "Upon agreement", status: "pending" },
      { milestone: "Bio/headshot received", due_date: "8 weeks prior", status: "pending" },
      { milestone: "Travel booked", due_date: "6 weeks prior", status: "pending" },
      { milestone: "Slides received", due_date: "2 weeks prior", status: "pending" },
      { milestone: "Tech check completed", due_date: "1 day prior", status: "pending" },
    ],
    risk_mitigation: [
      { risk: "Speaker cancellation", mitigation: "Maintain backup speaker list; require 30-day notice" },
      { risk: "Content not delivered", mitigation: "Staged deadlines with escalation process" },
      { risk: "Travel disruption", mitigation: "Virtual backup option; travel insurance required" },
      { risk: "Content quality issues", mitigation: "Review slides 2 weeks ahead; offer design support" },
    ],
    recommendations: [
      "Get signed contract before marketing speaker",
      "Include force majeure clause",
      "Clarify intellectual property ownership",
      "Build in content review checkpoint",
    ],
  };
}

export const MTG_022_SpeakerContract = {
  id: "MTG-022", name: "Speaker Contract Management", description: "연사 계약 관리",
  inputSchema: MTG_022_InputSchema, outputSchema: MTG_022_OutputSchema, execute,
  tags: ["speaker", "contract", "legal"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
