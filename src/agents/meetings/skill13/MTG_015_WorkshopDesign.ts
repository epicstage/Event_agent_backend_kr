/**
 * MTG-015: Workshop Design
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_015_InputSchema = z.object({
  event_id: z.string().uuid(),
  workshop_title: z.string(),
  learning_objectives: z.array(z.string()),
  duration_hours: z.number(),
  max_participants: z.number(),
  hands_on_ratio: z.number().min(0).max(1).default(0.6),
});

export const MTG_015_OutputSchema = z.object({
  event_id: z.string(),
  workshop_design: z.object({
    structure: z.array(z.object({ segment: z.string(), duration_min: z.number(), type: z.enum(["lecture", "demo", "exercise", "discussion", "break"]) })),
    materials: z.array(z.object({ item: z.string(), per_participant: z.boolean(), quantity: z.number() })),
    facilitator_guide: z.array(z.string()),
    room_setup: z.object({ layout: z.string(), equipment: z.array(z.string()) }),
  }),
  assessment: z.object({ method: z.string(), success_criteria: z.array(z.string()) }),
  recommendations: z.array(z.string()),
});

export type MTG_015_Input = z.infer<typeof MTG_015_InputSchema>;
export type MTG_015_Output = z.infer<typeof MTG_015_OutputSchema>;

export async function execute(input: MTG_015_Input): Promise<MTG_015_Output> {
  const totalMin = input.duration_hours * 60;
  const handsOnMin = Math.round(totalMin * input.hands_on_ratio);
  return {
    event_id: input.event_id,
    workshop_design: {
      structure: [
        { segment: "Welcome & Objectives", duration_min: 10, type: "lecture" },
        { segment: "Concept Introduction", duration_min: Math.round(totalMin * 0.15), type: "lecture" },
        { segment: "Demonstration", duration_min: 15, type: "demo" },
        { segment: "Hands-on Exercise 1", duration_min: Math.round(handsOnMin * 0.4), type: "exercise" },
        { segment: "Break", duration_min: 15, type: "break" },
        { segment: "Hands-on Exercise 2", duration_min: Math.round(handsOnMin * 0.6), type: "exercise" },
        { segment: "Group Discussion", duration_min: 20, type: "discussion" },
        { segment: "Wrap-up & Q&A", duration_min: 10, type: "lecture" },
      ],
      materials: [
        { item: "Workbook", per_participant: true, quantity: input.max_participants },
        { item: "Exercise materials kit", per_participant: true, quantity: input.max_participants },
        { item: "Flipchart paper (pack)", per_participant: false, quantity: 2 },
      ],
      facilitator_guide: ["Arrive 30 min early", "Test all equipment", "Prepare backup activities", "Circulate during exercises"],
      room_setup: { layout: "Cabaret (round tables)", equipment: ["Projector", "Whiteboard", "Markers", "Timer"] },
    },
    assessment: { method: "Exercise completion + self-assessment", success_criteria: input.learning_objectives },
    recommendations: ["Cap at 20 participants for quality", "Assign table facilitators for groups >15", "Provide take-home resources"],
  };
}

export const MTG_015_WorkshopDesign = {
  id: "MTG-015", name: "Workshop Design", description: "워크숍 설계",
  inputSchema: MTG_015_InputSchema, outputSchema: MTG_015_OutputSchema, execute,
  tags: ["workshop", "training", "hands-on"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
