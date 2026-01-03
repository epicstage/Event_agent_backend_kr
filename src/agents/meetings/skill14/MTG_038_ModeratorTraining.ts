/**
 * MTG-038: Moderator Training
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_038_InputSchema = z.object({
  event_id: z.string().uuid(),
  moderator_count: z.number(),
  session_types: z.array(z.enum(["panel", "qa", "workshop", "fishbowl", "debate"])),
  experience_level: z.enum(["novice", "intermediate", "experienced"]),
  training_format: z.enum(["in_person", "virtual", "self_paced"]),
});

export const MTG_038_OutputSchema = z.object({
  event_id: z.string(),
  training_program: z.object({
    curriculum: z.array(z.object({ module: z.string(), duration: z.string(), objectives: z.array(z.string()), methods: z.array(z.string()) })),
    materials: z.array(z.object({ material: z.string(), format: z.string(), purpose: z.string() })),
    practice_sessions: z.array(z.object({ exercise: z.string(), scenario: z.string(), skills_practiced: z.array(z.string()) })),
    assessment: z.object({ method: z.string(), criteria: z.array(z.string()), passing_score: z.number() }),
  }),
  moderator_toolkit: z.object({
    pre_session: z.array(z.string()),
    during_session: z.array(z.string()),
    troubleshooting: z.array(z.object({ situation: z.string(), response: z.string() })),
  }),
  schedule: z.object({ total_hours: z.number(), sessions: z.array(z.object({ session: z.string(), date: z.string(), duration: z.string() })) }),
  recommendations: z.array(z.string()),
});

export type MTG_038_Input = z.infer<typeof MTG_038_InputSchema>;
export type MTG_038_Output = z.infer<typeof MTG_038_OutputSchema>;

export async function execute(input: MTG_038_Input): Promise<MTG_038_Output> {
  const baseHours = input.experience_level === "novice" ? 6 : input.experience_level === "intermediate" ? 4 : 2;

  return {
    event_id: input.event_id,
    training_program: {
      curriculum: [
        {
          module: "Moderator Fundamentals",
          duration: "60 min",
          objectives: ["Understand moderator role", "Learn preparation essentials", "Know event context"],
          methods: ["Presentation", "Discussion", "Examples"],
        },
        {
          module: "Session-Specific Techniques",
          duration: "90 min",
          objectives: ["Master format-specific skills", "Practice key techniques", "Handle transitions"],
          methods: ["Demo", "Role-play", "Peer feedback"],
        },
        {
          module: "Audience Engagement",
          duration: "60 min",
          objectives: ["Facilitate Q&A effectively", "Manage audience dynamics", "Use technology tools"],
          methods: ["Interactive exercises", "Scenario practice"],
        },
        {
          module: "Troubleshooting & Crisis Management",
          duration: "45 min",
          objectives: ["Handle difficult situations", "Manage time overruns", "Technical backup plans"],
          methods: ["Case studies", "Problem-solving exercises"],
        },
      ],
      materials: [
        { material: "Moderator Handbook", format: "PDF", purpose: "Comprehensive reference" },
        { material: "Quick Reference Card", format: "Laminated card", purpose: "On-stage reference" },
        { material: "Session Prep Template", format: "Word doc", purpose: "Preparation checklist" },
        { material: "Question Bank", format: "Document", purpose: "Backup questions" },
      ],
      practice_sessions: [
        { exercise: "Mock panel moderation", scenario: "3 panelists, 30 min discussion", skills_practiced: ["Time management", "Equal airtime", "Follow-up questions"] },
        { exercise: "Difficult Q&A handling", scenario: "Hostile questioner, off-topic questions", skills_practiced: ["Defusing tension", "Redirecting", "Polite cutoffs"] },
        { exercise: "Technical failure recovery", scenario: "Slides won't work, mic dies", skills_practiced: ["Staying calm", "Engaging audience", "Buying time"] },
      ],
      assessment: {
        method: "Practice session observation + self-assessment",
        criteria: ["Preparation completeness", "Time management", "Audience engagement", "Crisis handling"],
        passing_score: 80,
      },
    },
    moderator_toolkit: {
      pre_session: [
        "Review panelist bios and prep notes",
        "Prepare 2x questions needed",
        "Do tech check 30 min before",
        "Meet panelists 15 min before",
        "Confirm time signals with stage manager",
      ],
      during_session: [
        "Introduce session objectives upfront",
        "Keep eye contact with audience",
        "Watch the clock - give time warnings",
        "Summarize key points periodically",
        "Save 5 min for wrap-up",
      ],
      troubleshooting: [
        { situation: "Panelist dominates", response: "Thank them and specifically invite others: 'Let's hear from...' " },
        { situation: "Dead air / no questions", response: "Use prepared questions or share audience-submitted ones" },
        { situation: "Hostile question", response: "Acknowledge concern, reframe constructively, move on" },
        { situation: "Running over time", response: "Signal panelists, summarize, and close gracefully" },
        { situation: "Technical issues", response: "Keep audience engaged with discussion while issue is resolved" },
      ],
    },
    schedule: {
      total_hours: baseHours,
      sessions: [
        { session: "Core Training", date: "2 weeks before event", duration: baseHours > 4 ? "3 hours" : "2 hours" },
        { session: "Practice Run", date: "1 week before event", duration: baseHours > 4 ? "2 hours" : "1 hour" },
        { session: "Final Briefing", date: "Day before event", duration: "1 hour" },
      ],
    },
    recommendations: [
      "Pair new moderators with experienced ones",
      "Provide session-specific prep docs",
      "Record practice for self-review",
      "Build ongoing moderator community",
    ],
  };
}

export const MTG_038_ModeratorTraining = {
  id: "MTG-038", name: "Moderator Training", description: "모더레이터 교육",
  inputSchema: MTG_038_InputSchema, outputSchema: MTG_038_OutputSchema, execute,
  tags: ["moderator", "training", "facilitation"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
