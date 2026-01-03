/**
 * MTG-039: Exhibitor Content Management
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_039_InputSchema = z.object({
  event_id: z.string().uuid(),
  exhibitor_count: z.number(),
  content_types: z.array(z.enum(["booth_graphics", "product_demos", "presentations", "videos", "collateral"])),
  submission_deadline: z.string(),
  review_required: z.boolean().default(true),
});

export const MTG_039_OutputSchema = z.object({
  event_id: z.string(),
  content_management: z.object({
    submission_portal: z.object({
      required_items: z.array(z.object({ item: z.string(), specifications: z.string(), mandatory: z.boolean() })),
      optional_items: z.array(z.object({ item: z.string(), specifications: z.string() })),
      deadlines: z.array(z.object({ item: z.string(), deadline: z.string(), late_fee: z.string() })),
    }),
    review_process: z.object({
      criteria: z.array(z.object({ criterion: z.string(), requirement: z.string() })),
      workflow: z.array(z.object({ step: z.string(), timeline: z.string(), responsible: z.string() })),
      rejection_handling: z.string(),
    }),
    display_guidelines: z.object({
      booth_requirements: z.array(z.string()),
      prohibited_items: z.array(z.string()),
      brand_standards: z.array(z.string()),
    }),
  }),
  communication_plan: z.array(z.object({ communication: z.string(), timing: z.string(), channel: z.string() })),
  tracking: z.object({ metrics: z.array(z.string()), reporting_frequency: z.string() }),
  recommendations: z.array(z.string()),
});

export type MTG_039_Input = z.infer<typeof MTG_039_InputSchema>;
export type MTG_039_Output = z.infer<typeof MTG_039_OutputSchema>;

export async function execute(input: MTG_039_Input): Promise<MTG_039_Output> {
  return {
    event_id: input.event_id,
    content_management: {
      submission_portal: {
        required_items: [
          { item: "Company logo (high-res)", specifications: "Vector/EPS or 300dpi PNG, transparent background", mandatory: true },
          { item: "Company description", specifications: "50-100 words", mandatory: true },
          { item: "Booth contact info", specifications: "Name, email, phone", mandatory: true },
          { item: "Product/service categories", specifications: "Select from list", mandatory: true },
        ],
        optional_items: [
          { item: "Product images", specifications: "Up to 5 images, 1920x1080 min" },
          { item: "Company video", specifications: "MP4, max 3 min, 1080p" },
          { item: "Promotional materials", specifications: "PDF, max 10 pages" },
          { item: "Demo request form", specifications: "For live demonstrations" },
        ],
        deadlines: [
          { item: "Required items", deadline: input.submission_deadline, late_fee: "N/A" },
          { item: "Booth graphics", deadline: "2 weeks before", late_fee: "$200" },
          { item: "AV requirements", deadline: "3 weeks before", late_fee: "May not be available" },
        ],
      },
      review_process: {
        criteria: [
          { criterion: "Brand appropriateness", requirement: "No offensive or competitor content" },
          { criterion: "Technical specifications", requirement: "Meets format requirements" },
          { criterion: "Accuracy", requirement: "Claims are verifiable" },
          { criterion: "Compliance", requirement: "Follows event and industry regulations" },
        ],
        workflow: [
          { step: "Submission received", timeline: "Immediate", responsible: "System" },
          { step: "Technical review", timeline: "2 business days", responsible: "Production team" },
          { step: "Content review", timeline: "3 business days", responsible: "Event team" },
          { step: "Approval/revision request", timeline: "Within 5 days", responsible: "Exhibitor manager" },
        ],
        rejection_handling: "Provide specific feedback and 48-hour revision window",
      },
      display_guidelines: {
        booth_requirements: [
          "All graphics must be submitted digitally",
          "No items extending beyond booth space",
          "Power usage within allocated limits",
          "Fire-retardant materials only",
        ],
        prohibited_items: [
          "Competitor materials",
          "Unapproved giveaways (food, alcohol)",
          "Loud audio/music",
          "Strobe lighting",
          "Live animals",
        ],
        brand_standards: [
          "Event logo cannot be altered",
          "Co-branding requires approval",
          "Press releases need review",
        ],
      },
    },
    communication_plan: [
      { communication: "Exhibitor kit", timing: "8 weeks before", channel: "Email + Portal" },
      { communication: "Submission reminder", timing: "4 weeks before", channel: "Email" },
      { communication: "Deadline reminder", timing: "1 week before deadline", channel: "Email" },
      { communication: "Approval confirmation", timing: "Upon approval", channel: "Email" },
      { communication: "Setup instructions", timing: "2 weeks before", channel: "Email + Portal" },
    ],
    tracking: {
      metrics: [
        "Submission completion rate",
        "On-time submission rate",
        "Revision request rate",
        "Approval turnaround time",
      ],
      reporting_frequency: "Weekly during submission period",
    },
    recommendations: [
      "Provide templates for common assets",
      "Offer design services for add-on fee",
      "Create FAQ document",
      "Assign dedicated exhibitor support contact",
      "Send proactive check-ins to lagging exhibitors",
    ],
  };
}

export const MTG_039_ExhibitorContent = {
  id: "MTG-039", name: "Exhibitor Content Management", description: "전시업체 콘텐츠 관리",
  inputSchema: MTG_039_InputSchema, outputSchema: MTG_039_OutputSchema, execute,
  tags: ["exhibitor", "content", "management"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
