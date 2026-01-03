/**
 * MTG-027: Content Production
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_027_InputSchema = z.object({
  event_id: z.string().uuid(),
  content_items: z.array(z.object({
    item_type: z.enum(["video", "slides", "handout", "transcript", "graphic"]),
    title: z.string(),
    source_material: z.string().optional(),
    deadline: z.string(),
  })),
  brand_guidelines: z.object({ primary_color: z.string(), font: z.string(), logo_url: z.string() }).optional(),
  distribution_channels: z.array(z.enum(["website", "app", "email", "print", "social"])),
});

export const MTG_027_OutputSchema = z.object({
  event_id: z.string(),
  production_plan: z.object({
    items: z.array(z.object({
      item_type: z.string(),
      title: z.string(),
      production_steps: z.array(z.object({ step: z.string(), duration: z.string(), owner: z.string() })),
      quality_checkpoints: z.array(z.string()),
      output_formats: z.array(z.object({ format: z.string(), use_case: z.string() })),
    })),
    timeline: z.array(z.object({ milestone: z.string(), date: z.string(), items_due: z.array(z.string()) })),
    resources_needed: z.array(z.object({ resource: z.string(), quantity: z.string(), purpose: z.string() })),
  }),
  distribution_matrix: z.array(z.object({ item: z.string(), channels: z.array(z.string()), timing: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_027_Input = z.infer<typeof MTG_027_InputSchema>;
export type MTG_027_Output = z.infer<typeof MTG_027_OutputSchema>;

export async function execute(input: MTG_027_Input): Promise<MTG_027_Output> {
  const items = input.content_items.map(item => ({
    item_type: item.item_type,
    title: item.title,
    production_steps: item.item_type === "video" ? [
      { step: "Script review", duration: "2 days", owner: "Content team" },
      { step: "Recording/editing", duration: "5 days", owner: "Video producer" },
      { step: "Review and revisions", duration: "3 days", owner: "Content lead" },
      { step: "Final render and QA", duration: "2 days", owner: "Video producer" },
    ] : item.item_type === "slides" ? [
      { step: "Content gathering", duration: "2 days", owner: "Content coordinator" },
      { step: "Design and layout", duration: "3 days", owner: "Designer" },
      { step: "Review and revisions", duration: "2 days", owner: "Content lead" },
    ] : [
      { step: "Content creation", duration: "3 days", owner: "Content team" },
      { step: "Design", duration: "2 days", owner: "Designer" },
      { step: "Review", duration: "1 day", owner: "Content lead" },
    ],
    quality_checkpoints: ["Brand compliance check", "Accessibility review", "Technical accuracy review", "Final approval"],
    output_formats: item.item_type === "video" ? [
      { format: "MP4 1080p", use_case: "Website/streaming" },
      { format: "MP4 720p", use_case: "Mobile/app" },
      { format: "Audio MP3", use_case: "Podcast version" },
    ] : item.item_type === "slides" ? [
      { format: "PDF", use_case: "Download/print" },
      { format: "PPT", use_case: "Editable for speakers" },
    ] : [
      { format: "PDF", use_case: "Digital distribution" },
      { format: "Print-ready", use_case: "Physical handouts" },
    ],
  }));

  return {
    event_id: input.event_id,
    production_plan: {
      items,
      timeline: [
        { milestone: "Content collection complete", date: "6 weeks before", items_due: input.content_items.filter(i => i.item_type === "slides").map(i => i.title) },
        { milestone: "First drafts ready", date: "4 weeks before", items_due: input.content_items.map(i => i.title) },
        { milestone: "Final versions approved", date: "2 weeks before", items_due: input.content_items.map(i => i.title) },
        { milestone: "Distribution ready", date: "1 week before", items_due: ["All items"] },
      ],
      resources_needed: [
        { resource: "Graphic designer", quantity: "20 hours", purpose: "Slide design and graphics" },
        { resource: "Video editor", quantity: "40 hours", purpose: "Video production" },
        { resource: "Content writer", quantity: "15 hours", purpose: "Copywriting and editing" },
      ],
    },
    distribution_matrix: input.content_items.map(item => ({
      item: item.title,
      channels: input.distribution_channels,
      timing: item.item_type === "video" ? "Post-event" : "Pre and during event",
    })),
    recommendations: [
      "Create content production calendar",
      "Use project management tool for tracking",
      "Build buffer time for revisions",
      "Establish clear approval workflow",
    ],
  };
}

export const MTG_027_ContentProduction = {
  id: "MTG-027", name: "Content Production", description: "콘텐츠 제작",
  inputSchema: MTG_027_InputSchema, outputSchema: MTG_027_OutputSchema, execute,
  tags: ["content", "production", "media"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
