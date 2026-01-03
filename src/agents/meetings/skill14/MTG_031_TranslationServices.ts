/**
 * MTG-031: Translation Services
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_031_InputSchema = z.object({
  event_id: z.string().uuid(),
  primary_language: z.string(),
  target_languages: z.array(z.string()),
  sessions_requiring_interpretation: z.number(),
  materials_to_translate: z.array(z.object({ material_type: z.string(), word_count: z.number() })),
  interpretation_type: z.enum(["simultaneous", "consecutive", "whisper"]).default("simultaneous"),
});

export const MTG_031_OutputSchema = z.object({
  event_id: z.string(),
  translation_plan: z.object({
    interpretation: z.object({
      type: z.string(),
      setup: z.array(z.object({ item: z.string(), quantity: z.number() })),
      staffing: z.array(z.object({ language_pair: z.string(), interpreters: z.number(), hours: z.number() })),
      workflow: z.array(z.object({ phase: z.string(), actions: z.array(z.string()) })),
    }),
    document_translation: z.array(z.object({
      material: z.string(),
      languages: z.array(z.string()),
      word_count: z.number(),
      turnaround: z.string(),
      cost_estimate: z.string(),
    })),
    quality_assurance: z.array(z.object({ check: z.string(), responsible: z.string() })),
  }),
  technology: z.array(z.object({ tool: z.string(), purpose: z.string(), cost_tier: z.string() })),
  budget_estimate: z.object({ interpretation: z.string(), translation: z.string(), equipment: z.string(), total: z.string() }),
  recommendations: z.array(z.string()),
});

export type MTG_031_Input = z.infer<typeof MTG_031_InputSchema>;
export type MTG_031_Output = z.infer<typeof MTG_031_OutputSchema>;

export async function execute(input: MTG_031_Input): Promise<MTG_031_Output> {
  const interpreterCount = input.interpretation_type === "simultaneous" ? 2 : 1;
  const totalWords = input.materials_to_translate.reduce((sum, m) => sum + m.word_count, 0);

  return {
    event_id: input.event_id,
    translation_plan: {
      interpretation: {
        type: input.interpretation_type,
        setup: input.interpretation_type === "simultaneous" ? [
          { item: "Interpretation booth", quantity: input.target_languages.length },
          { item: "Interpreter console", quantity: input.target_languages.length * 2 },
          { item: "Receiver units", quantity: 200 },
          { item: "Headphones", quantity: 200 },
        ] : [
          { item: "Portable interpretation kit", quantity: 1 },
          { item: "Headphones", quantity: 50 },
        ],
        staffing: input.target_languages.map(lang => ({
          language_pair: `${input.primary_language} <> ${lang}`,
          interpreters: interpreterCount,
          hours: input.sessions_requiring_interpretation * 1.5,
        })),
        workflow: [
          { phase: "Pre-event", actions: ["Brief interpreters", "Share presentations", "Technical test"] },
          { phase: "During event", actions: ["Rotate interpreters every 30 min", "Monitor audio quality", "Handle terminology issues"] },
          { phase: "Post-event", actions: ["Collect feedback", "Archive glossaries"] },
        ],
      },
      document_translation: input.materials_to_translate.map(m => ({
        material: m.material_type,
        languages: input.target_languages,
        word_count: m.word_count,
        turnaround: m.word_count < 1000 ? "2-3 days" : m.word_count < 5000 ? "1 week" : "2 weeks",
        cost_estimate: `$${Math.round(m.word_count * 0.15 * input.target_languages.length)}`,
      })),
      quality_assurance: [
        { check: "Terminology consistency", responsible: "Project manager" },
        { check: "Cultural adaptation", responsible: "Native reviewer" },
        { check: "Technical accuracy", responsible: "Subject matter expert" },
        { check: "Final proofreading", responsible: "Second translator" },
      ],
    },
    technology: [
      { tool: "Translation management system", purpose: "Workflow coordination", cost_tier: "$$" },
      { tool: "Interpretation equipment", purpose: "Real-time interpretation", cost_tier: "$$$" },
      { tool: "CAT tools", purpose: "Translation consistency", cost_tier: "$" },
      { tool: "AI-assisted translation", purpose: "First pass drafts", cost_tier: "$" },
    ],
    budget_estimate: {
      interpretation: `$${input.sessions_requiring_interpretation * input.target_languages.length * interpreterCount * 400}`,
      translation: `$${Math.round(totalWords * 0.15 * input.target_languages.length)}`,
      equipment: input.interpretation_type === "simultaneous" ? "$2,000-5,000 rental" : "$500-1,000 rental",
      total: `$${Math.round((input.sessions_requiring_interpretation * input.target_languages.length * interpreterCount * 400) + (totalWords * 0.15 * input.target_languages.length) + 3000)}`,
    },
    recommendations: [
      "Book interpreters 2+ months ahead",
      "Provide all materials to interpreters 1 week early",
      "Create event-specific glossary",
      "Test equipment day before event",
      "Consider hybrid: AI for materials, human for live",
    ],
  };
}

export const MTG_031_TranslationServices = {
  id: "MTG-031", name: "Translation Services", description: "번역 서비스 관리",
  inputSchema: MTG_031_InputSchema, outputSchema: MTG_031_OutputSchema, execute,
  tags: ["translation", "interpretation", "language"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
