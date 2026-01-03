/**
 * MKT-004: 마케팅 전략 수립
 * CMP-IS Reference: 7.2.a - Developing comprehensive marketing strategy
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Strategy Agent for event marketing.
CMP-IS Standard: 7.2.a - Developing comprehensive marketing strategies aligned with event goals.
You create integrated marketing plans with clear objectives and tactics.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  target_registrations: z.number(),
  marketing_budget: z.number(),
  currency: z.string().default("KRW"),
  target_segments: z.array(z.string()),
  key_objectives: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  strategy_id: z.string(),
  event_id: z.string(),
  executive_summary: z.string(),
  strategic_objectives: z.array(z.object({
    objective: z.string(),
    kpi: z.string(),
    target: z.string(),
    measurement_method: z.string(),
  })),
  marketing_mix: z.object({
    channels: z.array(z.object({
      channel: z.string(),
      budget_allocation_percent: z.number(),
      primary_objective: z.string(),
      tactics: z.array(z.string()),
    })),
    content_pillars: z.array(z.string()),
    campaign_phases: z.array(z.object({
      phase: z.string(),
      duration: z.string(),
      focus: z.string(),
      key_activities: z.array(z.string()),
    })),
  }),
  budget_allocation: z.object({
    total_budget: z.number(),
    by_channel: z.record(z.number()),
    by_phase: z.record(z.number()),
    contingency_percent: z.number(),
  }),
  timeline: z.array(z.object({
    week: z.string(),
    activities: z.array(z.string()),
  })),
  success_metrics: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    tracking_method: z.string(),
  })),
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
  const { event_name, target_registrations, marketing_budget } = validatedInput;

  const channelBudgets: Record<string, number> = {
    "디지털 광고": marketing_budget * 0.35,
    "이메일 마케팅": marketing_budget * 0.15,
    "콘텐츠 마케팅": marketing_budget * 0.20,
    "소셜 미디어": marketing_budget * 0.15,
    "파트너 마케팅": marketing_budget * 0.10,
    "예비비": marketing_budget * 0.05,
  };

  return {
    strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    executive_summary: `${event_name}의 마케팅 전략은 ${target_registrations}명 등록 목표 달성을 위해 ` +
      `총 ${(marketing_budget / 1000000).toFixed(0)}M 예산으로 디지털 중심의 통합 마케팅을 실행합니다.`,
    strategic_objectives: [
      {
        objective: "등록 목표 달성",
        kpi: "총 등록자 수",
        target: `${target_registrations}명`,
        measurement_method: "등록 시스템 데이터",
      },
      {
        objective: "브랜드 인지도 향상",
        kpi: "브랜드 검색량 증가율",
        target: "전년 대비 30% 증가",
        measurement_method: "Google Trends, 네이버 검색량",
      },
      {
        objective: "마케팅 효율성 확보",
        kpi: "등록당 비용 (CPA)",
        target: `${Math.round(marketing_budget / target_registrations).toLocaleString()}원 이하`,
        measurement_method: "채널별 비용/등록 추적",
      },
    ],
    marketing_mix: {
      channels: [
        {
          channel: "디지털 광고",
          budget_allocation_percent: 35,
          primary_objective: "인지도 및 트래픽",
          tactics: ["Google/Naver 검색광고", "LinkedIn 광고", "리타겟팅"],
        },
        {
          channel: "이메일 마케팅",
          budget_allocation_percent: 15,
          primary_objective: "전환 유도",
          tactics: ["뉴스레터", "세그먼트별 캠페인", "자동화 시퀀스"],
        },
        {
          channel: "콘텐츠 마케팅",
          budget_allocation_percent: 20,
          primary_objective: "리드 제너레이션",
          tactics: ["블로그", "웨비나", "연사 인터뷰", "인포그래픽"],
        },
        {
          channel: "소셜 미디어",
          budget_allocation_percent: 15,
          primary_objective: "참여 및 확산",
          tactics: ["오가닉 포스트", "유료 프로모션", "인플루언서 협업"],
        },
        {
          channel: "파트너 마케팅",
          budget_allocation_percent: 10,
          primary_objective: "도달 범위 확대",
          tactics: ["미디어 파트너", "커뮤니티 협력", "협회 제휴"],
        },
      ],
      content_pillars: [
        "연사 및 세션 하이라이트",
        "참가자 성공 스토리",
        "업계 인사이트 및 트렌드",
        "네트워킹 기회 강조",
      ],
      campaign_phases: [
        {
          phase: "인지도 구축",
          duration: "D-90 ~ D-60",
          focus: "이벤트 인지도 및 관심 유발",
          key_activities: ["티저 캠페인", "연사 발표", "얼리버드 오픈"],
        },
        {
          phase: "리드 확보",
          duration: "D-60 ~ D-30",
          focus: "등록 전환 유도",
          key_activities: ["콘텐츠 집중", "광고 본격화", "이메일 캠페인"],
        },
        {
          phase: "전환 가속",
          duration: "D-30 ~ D-7",
          focus: "등록 마감 독려",
          key_activities: ["긴급성 메시지", "마감 임박 알림", "소셜 프루프"],
        },
        {
          phase: "막판 푸시",
          duration: "D-7 ~ D-Day",
          focus: "남은 좌석 채우기",
          key_activities: ["최종 할인", "직접 연락", "현장 등록 안내"],
        },
      ],
    },
    budget_allocation: {
      total_budget: marketing_budget,
      by_channel: channelBudgets,
      by_phase: {
        "인지도 구축": marketing_budget * 0.25,
        "리드 확보": marketing_budget * 0.35,
        "전환 가속": marketing_budget * 0.30,
        "막판 푸시": marketing_budget * 0.10,
      },
      contingency_percent: 5,
    },
    timeline: [
      { week: "D-90~D-75", activities: ["전략 확정", "크리에이티브 제작", "채널 셋업"] },
      { week: "D-75~D-60", activities: ["얼리버드 론칭", "티저 캠페인", "파트너 협의"] },
      { week: "D-60~D-45", activities: ["연사 콘텐츠", "광고 본격 시작", "PR 활동"] },
      { week: "D-45~D-30", activities: ["리타겟팅 강화", "이메일 시퀀스", "웨비나 진행"] },
      { week: "D-30~D-14", activities: ["마감 임박 캠페인", "추천 프로그램", "최적화"] },
      { week: "D-14~D-Day", activities: ["최종 푸시", "사전 등록자 케어", "현장 준비"] },
    ],
    success_metrics: [
      { metric: "총 등록자 수", target: `${target_registrations}명`, tracking_method: "등록 시스템" },
      { metric: "웹사이트 방문자", target: `${target_registrations * 20}명`, tracking_method: "GA4" },
      { metric: "이메일 오픈율", target: "25% 이상", tracking_method: "이메일 플랫폼" },
      { metric: "광고 클릭률", target: "2% 이상", tracking_method: "광고 플랫폼" },
      { metric: "전환율", target: "5% 이상", tracking_method: "등록 퍼널 분석" },
    ],
    recommendations: [
      "얼리버드 기간에 집중 투자로 초기 모멘텀 확보",
      "세그먼트별 맞춤 메시지로 전환율 최적화",
      "주간 성과 리뷰로 실시간 최적화",
      "연사 네트워크 활용한 오가닉 확산",
      "참가자 추천 인센티브 프로그램 운영",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-004";
export const taskName = "마케팅 전략 수립";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.a";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default {
  taskId,
  taskName,
  taskType,
  cmpReference,
  skill,
  subSkill,
  AGENT_PERSONA,
  InputSchema,
  OutputSchema,
  execute,
};
