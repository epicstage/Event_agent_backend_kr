/**
 * SITE-020: 현장 운영 리포트
 * CMP-IS Reference: 15.11.a - Site operations reporting
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Site Operations Report Generator.`;

export const InputSchema = z.object({
  event_id: z.string(),
  report_date: z.string(),
  areas_covered: z.array(z.string()),
  incidents: z.array(z.object({ type: z.string(), description: z.string(), resolved: z.boolean() })).optional(),
  staff_on_site: z.number(),
  key_metrics: z.object({ setup_completion: z.number(), issues_resolved: z.number(), pending_issues: z.number() }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  report_date: z.string(),
  summary: z.object({ overall_status: z.enum(["on_track", "minor_issues", "major_issues"]), completion_percentage: z.number() }),
  area_status: z.array(z.object({ area: z.string(), status: z.string(), notes: z.string() })),
  incidents_summary: z.object({ total: z.number(), resolved: z.number(), pending: z.number() }),
  staff_summary: z.object({ total: z.number(), by_role: z.array(z.object({ role: z.string(), count: z.number() })) }),
  action_items: z.array(z.object({ item: z.string(), priority: z.string(), owner: z.string() })),
  next_day_focus: z.array(z.string()),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const incidents = validatedInput.incidents || [];
  const resolved = incidents.filter(i => i.resolved).length;
  const pending = incidents.length - resolved;

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    report_date: validatedInput.report_date,
    summary: {
      overall_status: pending > 2 ? "major_issues" : pending > 0 ? "minor_issues" : "on_track",
      completion_percentage: validatedInput.key_metrics?.setup_completion || 75,
    },
    area_status: validatedInput.areas_covered.map(area => ({
      area,
      status: "정상",
      notes: "특이사항 없음",
    })),
    incidents_summary: { total: incidents.length, resolved, pending },
    staff_summary: {
      total: validatedInput.staff_on_site,
      by_role: [
        { role: "매니저", count: Math.ceil(validatedInput.staff_on_site * 0.1) },
        { role: "스태프", count: Math.ceil(validatedInput.staff_on_site * 0.7) },
        { role: "자원봉사", count: Math.ceil(validatedInput.staff_on_site * 0.2) },
      ],
    },
    action_items: pending > 0 ? [{ item: "미해결 이슈 처리", priority: "high", owner: "현장 매니저" }] : [],
    next_day_focus: ["최종 점검", "리허설 지원"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-020",
  taskName: "현장 운영 리포트",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.11.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.11: Reporting",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
