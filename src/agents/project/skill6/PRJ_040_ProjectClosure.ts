/**
 * PRJ-040: 프로젝트 종결
 * CMP-IS Reference: 6.3.j - Formally closing the project
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Project Closure Agent for event projects.
CMP-IS Standard: 6.3.j - Formally closing the project`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  project_start_date: z.string(),
  project_end_date: z.string(),
  closure_checklist: z.array(z.object({
    item: z.string(),
    category: z.enum(["deliverables", "contracts", "finance", "documentation", "resources", "stakeholders"]),
    status: z.enum(["completed", "in_progress", "pending", "waived"]),
  })),
  final_metrics: z.object({
    objectives_achieved: z.number(),
    objectives_total: z.number(),
    budget_variance_percentage: z.number(),
    schedule_variance_days: z.number(),
    stakeholder_satisfaction: z.number(),
  }),
  outstanding_issues: z.array(z.object({
    issue: z.string(),
    severity: z.enum(["critical", "high", "medium", "low"]),
    resolution_plan: z.string(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  closure_id: z.string(),
  event_id: z.string(),
  closure_declaration: z.object({
    event_name: z.string(),
    closure_date: z.string(),
    closure_status: z.enum(["closed", "conditionally_closed", "pending_closure"]),
    closure_statement: z.string(),
  }),
  project_summary: z.object({
    duration: z.object({
      planned_start: z.string(),
      planned_end: z.string(),
      actual_end: z.string(),
      variance_days: z.number(),
    }),
    performance: z.object({
      objectives_achievement_rate: z.number(),
      budget_performance: z.string(),
      schedule_performance: z.string(),
      quality_rating: z.number(),
      overall_success_rating: z.enum(["excellent", "successful", "partial", "unsuccessful"]),
    }),
  }),
  closure_checklist_summary: z.object({
    total_items: z.number(),
    completed: z.number(),
    pending: z.number(),
    waived: z.number(),
    completion_rate: z.number(),
    by_category: z.array(z.object({
      category: z.string(),
      completed: z.number(),
      total: z.number(),
    })),
  }),
  outstanding_items: z.object({
    critical_issues: z.array(z.object({
      issue: z.string(),
      resolution: z.string(),
      owner: z.string(),
      deadline: z.string(),
    })),
    post_project_actions: z.array(z.object({
      action: z.string(),
      responsible: z.string(),
      timeline: z.string(),
    })),
  }),
  formal_closure: z.object({
    approval_status: z.enum(["approved", "pending_approval"]),
    approvers: z.array(z.object({
      name: z.string(),
      role: z.string(),
      status: z.enum(["approved", "pending"]),
      date: z.string().optional(),
    })),
    closure_certificate: z.object({
      certificate_number: z.string(),
      issue_date: z.string(),
      validity: z.string(),
    }),
  }),
  lessons_learned_summary: z.array(z.string()),
  recommendations_for_future: z.array(z.string()),
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

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { closure_checklist, final_metrics, outstanding_issues } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  // 체크리스트 분석
  const completed = closure_checklist.filter(c => c.status === "completed").length;
  const pending = closure_checklist.filter(c => c.status === "pending" || c.status === "in_progress").length;
  const waived = closure_checklist.filter(c => c.status === "waived").length;
  const completionRate = Math.round((completed / closure_checklist.length) * 100);

  // 카테고리별 집계
  const categoryMap: Record<string, { completed: number; total: number }> = {};
  closure_checklist.forEach(item => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { completed: 0, total: 0 };
    }
    categoryMap[item.category].total++;
    if (item.status === "completed") {
      categoryMap[item.category].completed++;
    }
  });

  const byCategory = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    completed: data.completed,
    total: data.total,
  }));

  // 성과 평가
  const achievementRate = (final_metrics.objectives_achieved / final_metrics.objectives_total) * 100;
  const overallSuccess = achievementRate >= 90 && final_metrics.budget_variance_percentage <= 10 ? "excellent" :
    achievementRate >= 80 ? "successful" :
    achievementRate >= 60 ? "partial" : "unsuccessful";

  // 종결 상태
  const criticalIssues = (outstanding_issues || []).filter(i => i.severity === "critical");
  const closureStatus = criticalIssues.length > 0 ? "conditionally_closed" :
    pending > 0 ? "pending_closure" : "closed";

  return {
    closure_id: generateUUID(),
    event_id: validatedInput.event_id,
    closure_declaration: {
      event_name: validatedInput.event_name,
      closure_date: today,
      closure_status: closureStatus,
      closure_statement: closureStatus === "closed"
        ? `${validatedInput.event_name} 프로젝트가 ${today}부로 공식 종결되었습니다. 모든 산출물이 인도되고 계약이 종료되었습니다.`
        : `${validatedInput.event_name} 프로젝트가 조건부 종결되었습니다. 미결 사항 해결 후 최종 종결 예정입니다.`,
    },
    project_summary: {
      duration: {
        planned_start: validatedInput.project_start_date,
        planned_end: validatedInput.project_end_date,
        actual_end: today,
        variance_days: final_metrics.schedule_variance_days,
      },
      performance: {
        objectives_achievement_rate: Math.round(achievementRate),
        budget_performance: final_metrics.budget_variance_percentage <= 0 ? "예산 내 완료" :
          final_metrics.budget_variance_percentage <= 10 ? "소폭 초과" : "초과",
        schedule_performance: final_metrics.schedule_variance_days <= 0 ? "일정 준수" :
          final_metrics.schedule_variance_days <= 7 ? "소폭 지연" : "지연",
        quality_rating: final_metrics.stakeholder_satisfaction,
        overall_success_rating: overallSuccess,
      },
    },
    closure_checklist_summary: {
      total_items: closure_checklist.length,
      completed,
      pending,
      waived,
      completion_rate: completionRate,
      by_category: byCategory,
    },
    outstanding_items: {
      critical_issues: criticalIssues.map(issue => ({
        issue: issue.issue,
        resolution: issue.resolution_plan,
        owner: "PM",
        deadline: addDays(14),
      })),
      post_project_actions: [
        { action: "미결 계약 정리", responsible: "Procurement", timeline: "2주 내" },
        { action: "재무 정산 완료", responsible: "Finance", timeline: "1개월 내" },
        { action: "아카이브 완료", responsible: "Admin", timeline: "2주 내" },
      ],
    },
    formal_closure: {
      approval_status: closureStatus === "closed" ? "approved" : "pending_approval",
      approvers: [
        { name: "PM", role: "Project Manager", status: "approved", date: today },
        { name: "이벤트 오너", role: "Event Owner", status: closureStatus === "closed" ? "approved" : "pending" },
        { name: "재무 담당", role: "Finance", status: "pending" },
      ],
      closure_certificate: {
        certificate_number: `CERT-${validatedInput.event_id.substring(0, 8).toUpperCase()}-${today.replace(/-/g, "")}`,
        issue_date: closureStatus === "closed" ? today : "발급 대기",
        validity: "영구 보존",
      },
    },
    lessons_learned_summary: [
      "사전 계획의 중요성 재확인",
      "이해관계자 커뮤니케이션 강화 필요",
      "리스크 조기 식별 및 대응 효과적",
      "벤더 관리 체계화 권장",
    ],
    recommendations_for_future: [
      "프로젝트 초기 리스크 워크샵 도입",
      "주간 상태 보고 체계 유지",
      "벤더 평가 결과 차기 프로젝트 반영",
      "성공 사례 템플릿화",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-040",
  taskName: "프로젝트 종결",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.j",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
