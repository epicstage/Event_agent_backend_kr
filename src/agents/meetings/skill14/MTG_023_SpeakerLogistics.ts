/**
 * MTG-023: Speaker Logistics
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_023_InputSchema = z.object({
  event_id: z.string().uuid(),
  speaker_id: z.string(),
  speaker_name: z.string(),
  origin_city: z.string(),
  event_dates: z.object({ start: z.string(), end: z.string() }),
  session_datetime: z.string(),
  special_requirements: z.array(z.string()).optional(),
});

export const MTG_023_OutputSchema = z.object({
  event_id: z.string(),
  logistics_plan: z.object({
    speaker_id: z.string(),
    travel: z.object({
      arrival: z.object({ date: z.string(), preferred_time: z.string(), notes: z.string() }),
      departure: z.object({ date: z.string(), preferred_time: z.string(), notes: z.string() }),
      ground_transport: z.array(z.object({ leg: z.string(), mode: z.string(), time: z.string() })),
    }),
    accommodation: z.object({ hotel: z.string(), check_in: z.string(), check_out: z.string(), room_type: z.string() }),
    onsite_schedule: z.array(z.object({ time: z.string(), activity: z.string(), location: z.string() })),
    contacts: z.array(z.object({ role: z.string(), name: z.string(), phone: z.string() })),
  }),
  checklist: z.array(z.object({ item: z.string(), due_date: z.string(), owner: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_023_Input = z.infer<typeof MTG_023_InputSchema>;
export type MTG_023_Output = z.infer<typeof MTG_023_OutputSchema>;

export async function execute(input: MTG_023_Input): Promise<MTG_023_Output> {
  return {
    event_id: input.event_id,
    logistics_plan: {
      speaker_id: input.speaker_id,
      travel: {
        arrival: { date: input.event_dates.start, preferred_time: "By 6 PM day before session", notes: "Allow time for rest and tech check" },
        departure: { date: input.event_dates.end, preferred_time: "After 2 PM post-session", notes: "Time for networking and wrap-up" },
        ground_transport: [
          { leg: "Airport to hotel", mode: "Private car/taxi", time: "Upon arrival" },
          { leg: "Hotel to venue", mode: "Shuttle/walk", time: "Morning of session" },
          { leg: "Venue to airport", mode: "Private car", time: "Post-session" },
        ],
      },
      accommodation: {
        hotel: "[Event Hotel - to be confirmed]",
        check_in: input.event_dates.start + " 3:00 PM",
        check_out: input.event_dates.end + " 12:00 PM",
        room_type: "Standard king with desk",
      },
      onsite_schedule: [
        { time: "Day before, 5 PM", activity: "Tech check and run-through", location: "Main stage" },
        { time: "Day before, 7 PM", activity: "Speaker dinner", location: "Private dining room" },
        { time: "Session day, -90 min", activity: "Green room arrival", location: "Speaker lounge" },
        { time: "Session day, -30 min", activity: "Final prep and mic check", location: "Backstage" },
        { time: "Session time", activity: "Presentation", location: "As scheduled" },
        { time: "Post-session", activity: "Meet and greet / signing", location: "Networking area" },
      ],
      contacts: [
        { role: "Speaker liaison", name: "[TBD]", phone: "+1-XXX-XXX-XXXX" },
        { role: "Production manager", name: "[TBD]", phone: "+1-XXX-XXX-XXXX" },
        { role: "Emergency contact", name: "Event Director", phone: "+1-XXX-XXX-XXXX" },
      ],
    },
    checklist: [
      { item: "Confirm flight details", due_date: "4 weeks prior", owner: "Travel coordinator" },
      { item: "Book hotel room", due_date: "4 weeks prior", owner: "Logistics team" },
      { item: "Send arrival instructions", due_date: "1 week prior", owner: "Speaker liaison" },
      { item: "Confirm ground transport", due_date: "3 days prior", owner: "Logistics team" },
      { item: "Prepare welcome package", due_date: "2 days prior", owner: "Speaker liaison" },
      { item: "Schedule tech check", due_date: "1 week prior", owner: "Production team" },
    ],
    recommendations: [
      "Send detailed logistics doc 1 week ahead",
      "Include local tips and restaurant recommendations",
      "Assign dedicated speaker liaison",
      "Have backup contact numbers on hand",
    ],
  };
}

export const MTG_023_SpeakerLogistics = {
  id: "MTG-023", name: "Speaker Logistics", description: "연사 로지스틱스",
  inputSchema: MTG_023_InputSchema, outputSchema: MTG_023_OutputSchema, execute,
  tags: ["speaker", "logistics", "travel"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
