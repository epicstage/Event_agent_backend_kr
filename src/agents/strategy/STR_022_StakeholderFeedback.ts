/**
 * STR-022: 이해관계자 피드백 관리
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Stakeholder Feedback)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Feedback Management Agent.

Your expertise includes:
- Feedback collection strategy design
- Feedback analysis and categorization
- Action planning based on feedback
- Closing the feedback loop

CMP-IS Standard: Domain A - Strategic Planning (Stakeholder Feedback)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  feedback_sources: z.array(z.object({
    source_type: z.enum(["survey", "interview", "meeting", "email", "social_media", "observation"]),
    stakeholder_group: z.string(),
    collected_at: z.string(),
    feedback_items: z.array(z.object({
      content: z.string(),
      sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
      category: z.string().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
    })),
  })),
  event_phase: z.enum(["planning", "preparation", "execution", "post_event"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  feedback_report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  feedback_summary: z.object({
    total_items: z.number(),
    by_sentiment: z.object({
      positive: z.number(),
      neutral: z.number(),
      negative: z.number(),
    }),
    by_category: z.array(z.object({
      category: z.string(),
      count: z.number(),
      top_items: z.array(z.string()),
    })),
    by_stakeholder: z.array(z.object({
      group: z.string(),
      sentiment_score: z.number(),
      key_themes: z.array(z.string()),
    })),
  }),
  priority_issues: z.array(z.object({
    issue_id: z.string(),
    description: z.string(),
    affected_stakeholders: z.array(z.string()),
    severity: z.enum(["critical", "high", "medium", "low"]),
    root_cause: z.string(),
    recommended_action: z.string(),
    owner: z.string(),
    deadline: z.string(),
  })),
  positive_highlights: z.array(z.object({
    highlight: z.string(),
    source: z.string(),
    leverage_opportunity: z.string(),
  })),
  action_plan: z.array(z.object({
    action_id: z.string(),
    action: z.string(),
    addresses: z.array(z.string()),
    priority: z.enum(["immediate", "short_term", "medium_term"]),
    responsible: z.string(),
    resources_needed: z.array(z.string()),
    success_criteria: z.string(),
  })),
  feedback_loop_plan: z.object({
    acknowledgment_timeline: z.string(),
    update_frequency: z.string(),
    communication_channels: z.array(z.string()),
    closure_process: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-022",
  taskName: "Stakeholder Feedback",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자 피드백을 수집, 분석하고 대응 계획을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const CATEGORIES = ["프로그램 내용", "운영/물류", "커뮤니케이션", "비용/가치", "일정", "기타"];

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  // Flatten all feedback items
  const allItems = validated.feedback_sources.flatMap(source =>
    source.feedback_items.map(item => ({
      ...item,
      source_type: source.source_type,
      stakeholder_group: source.stakeholder_group,
      sentiment: item.sentiment || "neutral",
      category: item.category || "기타",
      priority: item.priority || "medium",
    }))
  );

  const totalItems = allItems.length;
  const bySentiment = {
    positive: allItems.filter(i => i.sentiment === "positive").length,
    neutral: allItems.filter(i => i.sentiment === "neutral").length,
    negative: allItems.filter(i => i.sentiment === "negative").length,
  };

  // Group by category
  const categoryGroups = new Map<string, typeof allItems>();
  allItems.forEach(item => {
    const cat = item.category || "기타";
    if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
    categoryGroups.get(cat)!.push(item);
  });

  const byCategory = Array.from(categoryGroups.entries()).map(([category, items]) => ({
    category,
    count: items.length,
    top_items: items.slice(0, 3).map(i => i.content),
  }));

  // Group by stakeholder
  const stakeholderGroups = new Map<string, typeof allItems>();
  allItems.forEach(item => {
    if (!stakeholderGroups.has(item.stakeholder_group)) stakeholderGroups.set(item.stakeholder_group, []);
    stakeholderGroups.get(item.stakeholder_group)!.push(item);
  });

  const byStakeholder = Array.from(stakeholderGroups.entries()).map(([group, items]) => {
    const sentimentScore = items.reduce((acc, item) => {
      return acc + (item.sentiment === "positive" ? 1 : item.sentiment === "negative" ? -1 : 0);
    }, 0) / items.length;

    return {
      group,
      sentiment_score: Math.round((sentimentScore + 1) * 50), // Convert to 0-100 scale
      key_themes: [...new Set(items.map(i => i.category || "기타"))].slice(0, 3),
    };
  });

  // Identify priority issues from negative feedback
  const negativeItems = allItems.filter(i => i.sentiment === "negative" && i.priority === "high");
  const priorityIssues = negativeItems.slice(0, 5).map((item, idx) => ({
    issue_id: `ISS-${String(idx + 1).padStart(3, "0")}`,
    description: item.content,
    affected_stakeholders: [item.stakeholder_group],
    severity: "high" as const,
    root_cause: "분석 필요",
    recommended_action: "해당 이해관계자와 직접 대화 후 개선안 수립",
    owner: "프로젝트 매니저",
    deadline: "2주 내",
  }));

  // Identify positive highlights
  const positiveItems = allItems.filter(i => i.sentiment === "positive");
  const positiveHighlights = positiveItems.slice(0, 3).map(item => ({
    highlight: item.content,
    source: item.stakeholder_group,
    leverage_opportunity: "성공 사례로 다른 이해관계자에게 공유",
  }));

  // Create action plan
  let actionCounter = 1;
  const actionPlan = priorityIssues.slice(0, 3).map(issue => ({
    action_id: `ACT-${String(actionCounter++).padStart(3, "0")}`,
    action: issue.recommended_action,
    addresses: [issue.issue_id],
    priority: "immediate" as const,
    responsible: issue.owner,
    resources_needed: ["담당자 시간", "미팅 조율"],
    success_criteria: "이해관계자 만족도 개선",
  }));

  return {
    feedback_report_id: generateUUID(),
    event_id: validated.event_id,
    feedback_summary: {
      total_items: totalItems,
      by_sentiment: bySentiment,
      by_category: byCategory,
      by_stakeholder: byStakeholder,
    },
    priority_issues: priorityIssues,
    positive_highlights: positiveHighlights,
    action_plan: actionPlan,
    feedback_loop_plan: {
      acknowledgment_timeline: "피드백 접수 후 24시간 이내 확인 응답",
      update_frequency: "주요 조치 사항 주 1회 업데이트",
      communication_channels: ["이메일", "정기 미팅", "대시보드"],
      closure_process: [
        "1. 피드백 접수 및 확인",
        "2. 분석 및 조치 계획 수립",
        "3. 조치 실행",
        "4. 결과 공유 및 피드백자에게 감사",
        "5. 효과 모니터링",
      ],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
