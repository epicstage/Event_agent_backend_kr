/**
 * MTG-010: Program Book Generation
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_010_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_title: z.string(),
  event_dates: z.string(),
  venue: z.string(),
  sessions: z.array(z.object({ title: z.string(), time: z.string(), room: z.string(), speakers: z.array(z.string()) })),
  sponsors: z.array(z.object({ name: z.string(), tier: z.string() })).optional(),
});

export const MTG_010_OutputSchema = z.object({
  event_id: z.string(),
  program_book: z.object({
    table_of_contents: z.array(z.object({ section: z.string(), page: z.number() })),
    sections: z.array(z.object({ title: z.string(), content_type: z.string(), estimated_pages: z.number() })),
    total_pages: z.number(),
    print_specs: z.object({ size: z.string(), binding: z.string(), paper: z.string() }),
  }),
  digital_version: z.object({ formats: z.array(z.string()), features: z.array(z.string()) }),
  recommendations: z.array(z.string()),
});

export type MTG_010_Input = z.infer<typeof MTG_010_InputSchema>;
export type MTG_010_Output = z.infer<typeof MTG_010_OutputSchema>;

export async function execute(input: MTG_010_Input): Promise<MTG_010_Output> {
  const sessionPages = Math.ceil(input.sessions.length / 4);
  return {
    event_id: input.event_id,
    program_book: {
      table_of_contents: [
        { section: "Welcome Message", page: 2 },
        { section: "Event Schedule", page: 4 },
        { section: "Session Details", page: 6 },
        { section: "Speaker Bios", page: 6 + sessionPages },
        { section: "Venue Map", page: 6 + sessionPages + 4 },
        { section: "Sponsors", page: 6 + sessionPages + 6 },
      ],
      sections: [
        { title: "Welcome & Overview", content_type: "text", estimated_pages: 2 },
        { title: "At-a-Glance Schedule", content_type: "table", estimated_pages: 2 },
        { title: "Detailed Program", content_type: "mixed", estimated_pages: sessionPages },
        { title: "Speaker Directory", content_type: "profiles", estimated_pages: 4 },
        { title: "Venue Information", content_type: "maps", estimated_pages: 2 },
      ],
      total_pages: 16 + sessionPages,
      print_specs: { size: "A5", binding: "Saddle stitch", paper: "100gsm matte" },
    },
    digital_version: {
      formats: ["PDF", "Mobile App", "Web"],
      features: ["Searchable", "Bookmarks", "Session reminders", "Interactive maps"],
    },
    recommendations: ["Include QR codes linking to session recordings", "Add personal schedule builder feature"],
  };
}

export const MTG_010_ProgramBook = {
  id: "MTG-010", name: "Program Book Generation", description: "프로그램북 생성",
  inputSchema: MTG_010_InputSchema, outputSchema: MTG_010_OutputSchema, execute,
  tags: ["program", "book", "publication"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
