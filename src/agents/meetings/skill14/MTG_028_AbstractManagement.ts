/**
 * MTG-028: Abstract Management System
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_028_InputSchema = z.object({
  event_id: z.string().uuid(),
  submission_deadline: z.string(),
  categories: z.array(z.string()),
  submission_types: z.array(z.enum(["oral", "poster", "workshop"])),
  review_process: z.enum(["single_blind", "double_blind", "open"]).default("double_blind"),
  reviewers_per_abstract: z.number().min(2).max(5).default(3),
});

export const MTG_028_OutputSchema = z.object({
  event_id: z.string(),
  management_system: z.object({
    submission_workflow: z.array(z.object({ stage: z.string(), description: z.string(), automated: z.boolean() })),
    review_criteria: z.array(z.object({ criterion: z.string(), weight: z.number(), scale: z.string() })),
    reviewer_assignment: z.object({ method: z.string(), conflict_check: z.boolean(), workload_balance: z.boolean() }),
    decision_matrix: z.array(z.object({ score_range: z.string(), recommendation: z.string(), action: z.string() })),
    communication_templates: z.array(z.object({ trigger: z.string(), template_name: z.string() })),
  }),
  timeline: z.array(z.object({ phase: z.string(), start: z.string(), end: z.string(), key_actions: z.array(z.string()) })),
  metrics_tracking: z.array(z.object({ metric: z.string(), target: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_028_Input = z.infer<typeof MTG_028_InputSchema>;
export type MTG_028_Output = z.infer<typeof MTG_028_OutputSchema>;

export async function execute(input: MTG_028_Input): Promise<MTG_028_Output> {
  return {
    event_id: input.event_id,
    management_system: {
      submission_workflow: [
        { stage: "Submission received", description: "Author submits abstract via portal", automated: true },
        { stage: "Initial screening", description: "Check completeness and scope", automated: false },
        { stage: "Reviewer assignment", description: "Assign " + input.reviewers_per_abstract + " reviewers", automated: true },
        { stage: "Peer review", description: input.review_process + " review process", automated: false },
        { stage: "Decision making", description: "Program committee decision", automated: false },
        { stage: "Author notification", description: "Send accept/reject notification", automated: true },
        { stage: "Final submission", description: "Collect camera-ready version", automated: true },
      ],
      review_criteria: [
        { criterion: "Originality", weight: 25, scale: "1-5" },
        { criterion: "Relevance to theme", weight: 25, scale: "1-5" },
        { criterion: "Scientific/Technical quality", weight: 25, scale: "1-5" },
        { criterion: "Clarity of presentation", weight: 15, scale: "1-5" },
        { criterion: "Practical applicability", weight: 10, scale: "1-5" },
      ],
      reviewer_assignment: {
        method: "Keyword matching + manual adjustment",
        conflict_check: true,
        workload_balance: true,
      },
      decision_matrix: [
        { score_range: "4.0-5.0", recommendation: "Accept Oral", action: "Invite for presentation" },
        { score_range: "3.5-3.99", recommendation: "Accept Poster", action: "Offer poster slot" },
        { score_range: "3.0-3.49", recommendation: "Conditional Accept", action: "Request revisions" },
        { score_range: "Below 3.0", recommendation: "Reject", action: "Send decline with feedback" },
      ],
      communication_templates: [
        { trigger: "Submission received", template_name: "submission_confirmation" },
        { trigger: "Review complete", template_name: "decision_notification" },
        { trigger: "Revision requested", template_name: "revision_request" },
        { trigger: "Final accepted", template_name: "acceptance_final" },
        { trigger: "Deadline reminder", template_name: "deadline_reminder" },
      ],
    },
    timeline: [
      { phase: "Submissions open", start: "Today", end: input.submission_deadline, key_actions: ["Promote CFP", "Support submitters"] },
      { phase: "Initial screening", start: input.submission_deadline, end: "+1 week", key_actions: ["Screen submissions", "Assign reviewers"] },
      { phase: "Peer review", start: "+1 week", end: "+4 weeks", key_actions: ["Monitor reviews", "Send reminders"] },
      { phase: "Decisions", start: "+4 weeks", end: "+5 weeks", key_actions: ["Committee meeting", "Finalize decisions"] },
      { phase: "Notifications", start: "+5 weeks", end: "+6 weeks", key_actions: ["Send notifications", "Handle appeals"] },
    ],
    metrics_tracking: [
      { metric: "Total submissions", target: "Based on past years + 10%" },
      { metric: "Review completion rate", target: ">95%" },
      { metric: "Average review time", target: "<7 days" },
      { metric: "Acceptance rate", target: "Based on capacity" },
    ],
    recommendations: [
      "Use dedicated abstract management platform",
      "Train reviewers on criteria and process",
      "Build buffer time for late reviews",
      "Prepare appeals process",
    ],
  };
}

export const MTG_028_AbstractManagement = {
  id: "MTG-028", name: "Abstract Management System", description: "초록 관리 시스템",
  inputSchema: MTG_028_InputSchema, outputSchema: MTG_028_OutputSchema, execute,
  tags: ["abstract", "management", "review"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
