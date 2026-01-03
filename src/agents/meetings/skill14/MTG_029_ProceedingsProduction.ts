/**
 * MTG-029: Proceedings Production
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_029_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  paper_count: z.number(),
  format: z.enum(["print", "digital", "both"]).default("digital"),
  indexing: z.array(z.enum(["ISBN", "DOI", "Scopus", "Web_of_Science"])).optional(),
  publication_deadline: z.string(),
});

export const MTG_029_OutputSchema = z.object({
  event_id: z.string(),
  production_plan: z.object({
    format_specifications: z.object({ page_size: z.string(), margins: z.string(), font: z.string(), file_format: z.string() }),
    structure: z.array(z.object({ section: z.string(), contents: z.string() })),
    workflow: z.array(z.object({ phase: z.string(), duration: z.string(), tasks: z.array(z.string()) })),
    quality_checks: z.array(z.object({ check: z.string(), criteria: z.string() })),
  }),
  indexing_plan: z.object({
    registrations: z.array(z.object({ index: z.string(), timeline: z.string(), requirements: z.array(z.string()) })),
    doi_assignment: z.boolean(),
  }),
  distribution: z.object({
    channels: z.array(z.object({ channel: z.string(), format: z.string(), timing: z.string() })),
    access_policy: z.string(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_029_Input = z.infer<typeof MTG_029_InputSchema>;
export type MTG_029_Output = z.infer<typeof MTG_029_OutputSchema>;

export async function execute(input: MTG_029_Input): Promise<MTG_029_Output> {
  const indexingPlan = (input.indexing || []).map(idx => ({
    index: idx,
    timeline: idx === "ISBN" ? "2 weeks for assignment" : idx === "DOI" ? "1 week per paper" : "3-6 months post-publication",
    requirements: idx === "ISBN" ? ["Publisher registration", "Metadata submission"] :
      idx === "DOI" ? ["DOI registration", "Metadata schema", "Landing pages"] :
      ["Peer review documentation", "Quality standards", "Publisher agreement"],
  }));

  return {
    event_id: input.event_id,
    production_plan: {
      format_specifications: {
        page_size: "A4 (210 x 297 mm)",
        margins: "25mm all sides",
        font: "Times New Roman 10pt body, 14pt title",
        file_format: "PDF/A for archival",
      },
      structure: [
        { section: "Front matter", contents: "Title page, copyright, committee, preface" },
        { section: "Table of contents", contents: "Session-organized paper listing" },
        { section: "Keynote abstracts", contents: "Invited speaker summaries" },
        { section: "Full papers", contents: "Accepted papers organized by track" },
        { section: "Poster abstracts", contents: "Extended abstracts of poster presentations" },
        { section: "Author index", contents: "Alphabetical author listing with page numbers" },
      ],
      workflow: [
        { phase: "Template distribution", duration: "Immediately post-acceptance", tasks: ["Send templates", "Provide guidelines", "Set deadlines"] },
        { phase: "Paper collection", duration: "4 weeks", tasks: ["Collect camera-ready papers", "Send reminders", "Track submissions"] },
        { phase: "Formatting review", duration: "2 weeks", tasks: ["Check compliance", "Request corrections", "Compile papers"] },
        { phase: "Compilation", duration: "1 week", tasks: ["Assemble proceedings", "Generate indices", "Create front matter"] },
        { phase: "Quality assurance", duration: "1 week", tasks: ["Final review", "Proof check", "Test links"] },
        { phase: "Publication", duration: "3 days", tasks: ["Generate final PDF", "Upload to platform", "Distribute"] },
      ],
      quality_checks: [
        { check: "Format compliance", criteria: "Matches template specifications" },
        { check: "Copyright verification", criteria: "All permissions obtained" },
        { check: "Plagiarism check", criteria: "<15% similarity index" },
        { check: "Technical review", criteria: "Links work, figures readable" },
      ],
    },
    indexing_plan: {
      registrations: indexingPlan,
      doi_assignment: input.indexing?.includes("DOI") || false,
    },
    distribution: {
      channels: [
        { channel: "Event website", format: "PDF", timing: "During event" },
        { channel: "Digital library", format: "PDF/A", timing: "Post-event" },
        ...(input.format !== "digital" ? [{ channel: "Print copies", format: "Bound book", timing: "At event" }] : []),
        { channel: "Author copies", format: "PDF + certificate", timing: "Post-event" },
      ],
      access_policy: "Open access for attendees; public after 6 months",
    },
    recommendations: [
      "Start camera-ready collection immediately after notifications",
      "Use proceedings management platform",
      "Budget for professional typesetting if needed",
      "Plan for post-event errata process",
    ],
  };
}

export const MTG_029_ProceedingsProduction = {
  id: "MTG-029", name: "Proceedings Production", description: "논문집 제작",
  inputSchema: MTG_029_InputSchema, outputSchema: MTG_029_OutputSchema, execute,
  tags: ["proceedings", "publication", "papers"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
