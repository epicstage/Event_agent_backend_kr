/**
 * PRO-017: 계속 교육 추적
 * CMP-IS Reference: 20.7.a - Continuing education tracking
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Continuing Education Coordinator for event professionals.`;

export const InputSchema = z.object({
  event_id: z.string(),
  tracking_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }).optional(),
  staff_ids: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  ce_report_id: z.string(),
  event_id: z.string(),
  summary: z.object({
    total_staff_tracked: z.number(),
    average_ce_hours: z.number(),
    meeting_requirements: z.number(),
    below_requirements: z.number(),
    total_ce_hours_earned: z.number(),
  }),
  ce_by_category: z.array(z.object({
    category: z.string(),
    hours_earned: z.number(),
    percentage: z.number(),
    popular_topics: z.array(z.string()),
  })),
  individual_tracking: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    certification_held: z.array(z.string()),
    ce_requirement: z.number(),
    ce_earned: z.number(),
    progress_percentage: z.number(),
    deadline: z.string(),
    status: z.enum(["on_track", "behind", "completed", "at_risk"]),
    recent_activities: z.array(z.object({
      activity: z.string(),
      date: z.string(),
      hours: z.number(),
      category: z.string(),
      provider: z.string(),
    })),
  })),
  available_opportunities: z.array(z.object({
    opportunity_name: z.string(),
    provider: z.string(),
    format: z.enum(["webinar", "workshop", "conference", "online_course", "self_study"]),
    ce_hours: z.number(),
    cost: z.number(),
    date: z.string(),
    applicable_certifications: z.array(z.string()),
  })),
  learning_budget: z.object({
    annual_budget: z.number(),
    spent: z.number(),
    remaining: z.number(),
    average_per_person: z.number(),
  }),
  recommendations: z.array(z.string()),
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

  return {
    ce_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    summary: {
      total_staff_tracked: 25,
      average_ce_hours: 12.5,
      meeting_requirements: 18,
      below_requirements: 7,
      total_ce_hours_earned: 312.5,
    },
    ce_by_category: [
      { category: "이벤트 기획", hours_earned: 85, percentage: 27.2, popular_topics: ["전략적 기획", "예산 관리", "RFP 작성"] },
      { category: "마케팅", hours_earned: 62, percentage: 19.8, popular_topics: ["디지털 마케팅", "소셜 미디어", "브랜딩"] },
      { category: "기술", hours_earned: 55, percentage: 17.6, popular_topics: ["이벤트 테크", "하이브리드 이벤트", "AI 활용"] },
      { category: "리더십", hours_earned: 48, percentage: 15.4, popular_topics: ["팀 관리", "커뮤니케이션", "의사결정"] },
      { category: "안전/리스크", hours_earned: 35, percentage: 11.2, popular_topics: ["위기 관리", "안전 프로토콜", "보험"] },
      { category: "지속가능성", hours_earned: 27.5, percentage: 8.8, popular_topics: ["친환경 이벤트", "ESG", "탄소 발자국"] },
    ],
    individual_tracking: [
      {
        staff_id: "STF-001",
        name: "김민수",
        certification_held: ["CMP"],
        ce_requirement: 25,
        ce_earned: 18,
        progress_percentage: 72,
        deadline: "2027-05-15",
        status: "on_track",
        recent_activities: [
          { activity: "이벤트 테크 트렌드 2025", date: "2025-01-10", hours: 3, category: "기술", provider: "PCMA" },
          { activity: "전략적 이벤트 기획", date: "2024-11-15", hours: 5, category: "이벤트 기획", provider: "MPI" },
        ],
      },
      {
        staff_id: "STF-002",
        name: "이영희",
        certification_held: ["CMP"],
        ce_requirement: 25,
        ce_earned: 12,
        progress_percentage: 48,
        deadline: "2028-03-20",
        status: "on_track",
        recent_activities: [
          { activity: "이벤트 마케팅 마스터클래스", date: "2025-01-05", hours: 4, category: "마케팅", provider: "SITE" },
          { activity: "지속가능한 이벤트 기초", date: "2024-12-20", hours: 2, category: "지속가능성", provider: "GMIC" },
        ],
      },
      {
        staff_id: "STF-004",
        name: "최서연",
        certification_held: ["CSEP"],
        ce_requirement: 20,
        ce_earned: 8,
        progress_percentage: 40,
        deadline: "2025-06-30",
        status: "behind",
        recent_activities: [
          { activity: "특별 이벤트 디자인", date: "2024-10-15", hours: 4, category: "이벤트 기획", provider: "ILEA" },
        ],
      },
    ],
    available_opportunities: [
      {
        opportunity_name: "CMP Conclave 2025",
        provider: "Events Industry Council",
        format: "conference",
        ce_hours: 15,
        cost: 850000,
        date: "2025-06-15",
        applicable_certifications: ["CMP"],
      },
      {
        opportunity_name: "하이브리드 이벤트 설계 웨비나",
        provider: "PCMA",
        format: "webinar",
        ce_hours: 2,
        cost: 50000,
        date: "2025-02-20",
        applicable_certifications: ["CMP", "CSEP", "CEM"],
      },
      {
        opportunity_name: "이벤트 리스크 관리 온라인 과정",
        provider: "MPI Academy",
        format: "online_course",
        ce_hours: 8,
        cost: 250000,
        date: "상시",
        applicable_certifications: ["CMP", "CSEP"],
      },
      {
        opportunity_name: "지속가능 이벤트 워크숍",
        provider: "GMIC Korea",
        format: "workshop",
        ce_hours: 6,
        cost: 180000,
        date: "2025-03-10",
        applicable_certifications: ["CMP", "CSEP", "CEM"],
      },
    ],
    learning_budget: {
      annual_budget: 25000000,
      spent: 8500000,
      remaining: 16500000,
      average_per_person: 1000000,
    },
    recommendations: [
      "최서연 CE 크레딧 6개월 내 12시간 필요 - 긴급 계획 수립",
      "Q2 팀 워크숍으로 지속가능성 교육 일괄 진행 검토",
      "온라인 과정 활용도 높여 비용 효율성 개선",
      "CMP Conclave 참가자 선정 및 예산 확보",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-017",
  taskName: "계속 교육 추적",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.7.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.7: Continuing Education",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
