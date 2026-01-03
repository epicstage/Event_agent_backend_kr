/**
 * MTG-021: Speaker Recruitment
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_021_InputSchema = z.object({
  event_id: z.string().uuid(),
  session_requirements: z.array(z.object({
    session_id: z.string(),
    topic: z.string(),
    session_type: z.enum(["keynote", "panel", "workshop", "breakout", "masterclass"]),
    speaker_slots: z.number().min(1).max(6),
  })),
  budget_total: z.number().optional(),
  target_industries: z.array(z.string()).optional(),
});

export const MTG_021_OutputSchema = z.object({
  event_id: z.string(),
  recruitment_plan: z.object({
    sourcing_channels: z.array(z.object({ channel: z.string(), expected_leads: z.number(), cost: z.string() })),
    outreach_timeline: z.array(z.object({ phase: z.string(), start_week: z.number(), activities: z.array(z.string()) })),
    speaker_profiles: z.array(z.object({ session_id: z.string(), ideal_profile: z.string(), tier: z.enum(["A", "B", "C"]), estimated_fee: z.string() })),
    evaluation_criteria: z.array(z.object({ criterion: z.string(), weight: z.number() })),
  }),
  outreach_templates: z.object({
    initial_contact: z.string(),
    follow_up: z.string(),
    confirmation: z.string(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_021_Input = z.infer<typeof MTG_021_InputSchema>;
export type MTG_021_Output = z.infer<typeof MTG_021_OutputSchema>;

export async function execute(input: MTG_021_Input): Promise<MTG_021_Output> {
  const speakerProfiles = input.session_requirements.map(req => ({
    session_id: req.session_id,
    ideal_profile: req.session_type === "keynote" ? "Industry thought leader with 10+ years" :
      req.session_type === "workshop" ? "Practitioner with hands-on expertise" : "Subject matter expert",
    tier: (req.session_type === "keynote" ? "A" : req.session_type === "masterclass" ? "B" : "C") as "A" | "B" | "C",
    estimated_fee: req.session_type === "keynote" ? "$5,000-25,000" : req.session_type === "masterclass" ? "$2,000-5,000" : "$500-2,000",
  }));

  return {
    event_id: input.event_id,
    recruitment_plan: {
      sourcing_channels: [
        { channel: "Speaker bureaus", expected_leads: 10, cost: "Agency fee 15-20%" },
        { channel: "Industry associations", expected_leads: 15, cost: "Free/membership" },
        { channel: "LinkedIn outreach", expected_leads: 25, cost: "Time + Premium" },
        { channel: "Past speaker referrals", expected_leads: 8, cost: "Free" },
        { channel: "Conference circuit", expected_leads: 12, cost: "Travel to scout" },
      ],
      outreach_timeline: [
        { phase: "Keynote recruitment", start_week: -24, activities: ["Identify targets", "Initial outreach", "Negotiation"] },
        { phase: "Featured speakers", start_week: -16, activities: ["Broad outreach", "Review responses", "Selection"] },
        { phase: "Breakout speakers", start_week: -12, activities: ["CFP promotion", "Shortlisting", "Confirmation"] },
        { phase: "Final confirmations", start_week: -8, activities: ["Contracts signed", "Bio/photo collection", "Briefings scheduled"] },
      ],
      speaker_profiles: speakerProfiles,
      evaluation_criteria: [
        { criterion: "Topic expertise", weight: 30 },
        { criterion: "Speaking experience", weight: 25 },
        { criterion: "Audience draw", weight: 20 },
        { criterion: "Diversity contribution", weight: 15 },
        { criterion: "Availability/flexibility", weight: 10 },
      ],
    },
    outreach_templates: {
      initial_contact: "Dear [Name], We're organizing [Event] on [Date] and believe your expertise in [Topic] would resonate with our audience of [Audience]. Would you be interested in discussing a [Session Type] opportunity?",
      follow_up: "Following up on my previous message about [Event]. We're finalizing our speaker lineup and wanted to confirm your interest before [Deadline]. Happy to schedule a call to discuss details.",
      confirmation: "Delighted to confirm your participation at [Event]! Attached is the speaker agreement. Please review and sign by [Date]. Our team will reach out shortly for logistics.",
    },
    recommendations: [
      "Start keynote recruitment 6+ months ahead",
      "Offer early commitment incentives",
      "Build speaker alumni network for future events",
      "Create speaker value proposition beyond fees",
    ],
  };
}

export const MTG_021_SpeakerRecruitment = {
  id: "MTG-021", name: "Speaker Recruitment", description: "연사 섭외",
  inputSchema: MTG_021_InputSchema, outputSchema: MTG_021_OutputSchema, execute,
  tags: ["speaker", "recruitment", "sourcing"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
