/**
 * MTG-019: Accessibility Program Design
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_019_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_format: z.enum(["in_person", "virtual", "hybrid"]),
  expected_attendees: z.number(),
  venue_type: z.string().optional(),
  content_types: z.array(z.enum(["presentations", "videos", "documents", "live_sessions", "networking"])),
  budget_allocation: z.number().optional(),
});

export const MTG_019_OutputSchema = z.object({
  event_id: z.string(),
  accessibility_plan: z.object({
    physical: z.array(z.object({ requirement: z.string(), implementation: z.string(), priority: z.enum(["mandatory", "recommended"]) })),
    digital: z.array(z.object({ requirement: z.string(), implementation: z.string(), priority: z.enum(["mandatory", "recommended"]) })),
    communication: z.array(z.object({ service: z.string(), coverage: z.string(), booking_lead_time: z.string() })),
    content: z.array(z.object({ format: z.string(), accessibility_feature: z.string() })),
  }),
  compliance: z.object({
    standards: z.array(z.string()),
    checklist: z.array(z.object({ item: z.string(), status: z.enum(["required", "in_progress", "planned"]) })),
  }),
  budget_estimate: z.object({
    services: z.array(z.object({ service: z.string(), estimated_cost: z.string() })),
    total_range: z.string(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_019_Input = z.infer<typeof MTG_019_InputSchema>;
export type MTG_019_Output = z.infer<typeof MTG_019_OutputSchema>;

export async function execute(input: MTG_019_Input): Promise<MTG_019_Output> {
  const isPhysical = input.event_format !== "virtual";
  const isVirtual = input.event_format !== "in_person";

  return {
    event_id: input.event_id,
    accessibility_plan: {
      physical: isPhysical ? [
        { requirement: "Wheelchair accessibility", implementation: "Ramps, elevators, accessible seating", priority: "mandatory" },
        { requirement: "Accessible restrooms", implementation: "Verify venue compliance", priority: "mandatory" },
        { requirement: "Service animal accommodation", implementation: "Relief areas, water stations", priority: "mandatory" },
        { requirement: "Quiet room", implementation: "Designated low-stimulation space", priority: "recommended" },
        { requirement: "Assistive listening devices", implementation: "Hearing loops or FM systems", priority: "recommended" },
      ] : [],
      digital: isVirtual ? [
        { requirement: "Screen reader compatibility", implementation: "WCAG 2.1 AA compliant platform", priority: "mandatory" },
        { requirement: "Keyboard navigation", implementation: "Test all interactive elements", priority: "mandatory" },
        { requirement: "Color contrast", implementation: "4.5:1 ratio minimum", priority: "mandatory" },
        { requirement: "Closed captions", implementation: "Real-time CART or auto-captions", priority: "mandatory" },
        { requirement: "Audio descriptions", implementation: "For video content", priority: "recommended" },
      ] : [],
      communication: [
        { service: "Sign language interpretation", coverage: "All main sessions", booking_lead_time: "4-6 weeks" },
        { service: "CART (real-time captioning)", coverage: "All sessions", booking_lead_time: "2-3 weeks" },
        { service: "Large print materials", coverage: "Program, signage", booking_lead_time: "1 week" },
        { service: "Braille materials", coverage: "Key documents on request", booking_lead_time: "2 weeks" },
      ],
      content: input.content_types.map(type => ({
        format: type,
        accessibility_feature: type === "videos" ? "Captions + audio descriptions" :
          type === "presentations" ? "Alt text for images, readable fonts" :
          type === "documents" ? "Tagged PDFs, screen reader friendly" :
          type === "live_sessions" ? "Live captions + sign interpretation" : "Multiple interaction modes",
      })),
    },
    compliance: {
      standards: ["ADA (US)", "WCAG 2.1 AA", "Section 508", "EN 301 549 (EU)"],
      checklist: [
        { item: "Accessibility statement published", status: "required" },
        { item: "Registration form asks for accommodations", status: "required" },
        { item: "Venue accessibility verified", status: "required" },
        { item: "Digital platform tested", status: "in_progress" },
        { item: "Staff training completed", status: "planned" },
      ],
    },
    budget_estimate: {
      services: [
        { service: "Sign language interpreters", estimated_cost: "$50-75/hour each" },
        { service: "CART services", estimated_cost: "$100-200/hour" },
        { service: "Assistive listening devices", estimated_cost: "$500-1500 rental" },
        { service: "Accessible materials production", estimated_cost: "$500-2000" },
      ],
      total_range: `$${Math.round(input.expected_attendees * 5)}-${Math.round(input.expected_attendees * 15)}`,
    },
    recommendations: [
      "Ask about needs during registration",
      "Train all staff on accessibility etiquette",
      "Test everything with actual users when possible",
      "Publish accessibility information prominently",
      "Have a dedicated accessibility contact",
    ],
  };
}

export const MTG_019_AccessibilityProgram = {
  id: "MTG-019", name: "Accessibility Program Design", description: "접근성 프로그램 설계",
  inputSchema: MTG_019_InputSchema, outputSchema: MTG_019_OutputSchema, execute,
  tags: ["accessibility", "inclusion", "compliance"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
