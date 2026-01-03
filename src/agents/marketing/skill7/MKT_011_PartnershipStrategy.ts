/**
 * MKT-011: 파트너십 전략
 * CMP-IS Reference: 7.2.h - Strategic partnership and co-marketing planning
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Partnership Strategy Agent.
CMP-IS Standard: 7.2.h - Planning strategic partnerships and co-marketing initiatives for expanded reach.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_type: z.string(),
  target_audience: z.string(),
  partnership_goals: z.array(z.string()).optional(),
  existing_partners: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  partnership_strategy_id: z.string(),
  event_id: z.string(),
  partnership_tiers: z.array(z.object({
    tier_name: z.string(),
    benefits: z.array(z.string()),
    expected_contribution: z.string(),
    target_count: z.number(),
  })),
  potential_partners: z.array(z.object({
    category: z.string(),
    partner_types: z.array(z.string()),
    value_proposition: z.string(),
    approach_strategy: z.string(),
  })),
  co_marketing_activities: z.array(z.object({
    activity: z.string(),
    description: z.string(),
    partner_role: z.string(),
    our_role: z.string(),
    expected_reach: z.number(),
  })),
  partnership_packages: z.array(z.object({
    package_name: z.string(),
    inclusions: z.array(z.string()),
    partner_obligations: z.array(z.string()),
    value_exchange: z.string(),
  })),
  outreach_timeline: z.array(z.object({
    phase: z.string(),
    timing: z.string(),
    activities: z.array(z.string()),
  })),
  success_metrics: z.array(z.object({
    metric: z.string(),
    target: z.string(),
  })),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  return {
    partnership_strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    partnership_tiers: [
      {
        tier_name: "전략적 파트너",
        benefits: ["공동 브랜딩", "VIP 초대권", "콘텐츠 공동 제작", "데이터 공유"],
        expected_contribution: "콘텐츠/연사/프로모션 전 영역 협력",
        target_count: 2,
      },
      {
        tier_name: "프로모션 파트너",
        benefits: ["공동 홍보", "할인 코드", "뉴스레터 교차 프로모션"],
        expected_contribution: "채널을 통한 홍보 및 도달 확대",
        target_count: 5,
      },
      {
        tier_name: "미디어 파트너",
        benefits: ["기사 게재", "배너 노출", "현장 취재"],
        expected_contribution: "미디어 노출 및 인지도 향상",
        target_count: 3,
      },
      {
        tier_name: "커뮤니티 파트너",
        benefits: ["회원 할인", "공동 이벤트", "콘텐츠 공유"],
        expected_contribution: "타겟 커뮤니티 접근",
        target_count: 5,
      },
    ],
    potential_partners: [
      {
        category: "산업 협회",
        partner_types: ["업종 협회", "전문가 단체", "학회"],
        value_proposition: "회원 대상 전문 교육 기회 제공",
        approach_strategy: "협회 사무국 통한 공식 제안",
      },
      {
        category: "기업 파트너",
        partner_types: ["솔루션 기업", "서비스 제공사", "컨설팅사"],
        value_proposition: "타겟 고객 접점 및 리드 생성",
        approach_strategy: "마케팅/BD 부서 직접 접촉",
      },
      {
        category: "교육 기관",
        partner_types: ["대학교", "연구소", "교육센터"],
        value_proposition: "산학연 연계 및 인재 발굴",
        approach_strategy: "학과장/연구책임자 네트워크",
      },
      {
        category: "미디어",
        partner_types: ["전문지", "온라인 매체", "팟캐스트"],
        value_proposition: "양질의 콘텐츠 제공",
        approach_strategy: "편집국/콘텐츠팀 미팅",
      },
    ],
    co_marketing_activities: [
      {
        activity: "공동 웨비나",
        description: "파트너사와 사전 웨비나 개최",
        partner_role: "연사 섭외 및 채널 홍보",
        our_role: "기획 및 운영",
        expected_reach: 500,
      },
      {
        activity: "교차 이메일 마케팅",
        description: "서로의 뉴스레터에 소개",
        partner_role: "뉴스레터 발송",
        our_role: "콘텐츠 제공",
        expected_reach: 10000,
      },
      {
        activity: "공동 콘텐츠 제작",
        description: "백서/가이드북 공동 발간",
        partner_role: "전문 지식 기여",
        our_role: "제작 및 디자인",
        expected_reach: 2000,
      },
      {
        activity: "SNS 공동 캠페인",
        description: "해시태그 캠페인 공동 운영",
        partner_role: "콘텐츠 공유 및 참여",
        our_role: "캠페인 기획 및 리드",
        expected_reach: 50000,
      },
    ],
    partnership_packages: [
      {
        package_name: "전략적 파트너 패키지",
        inclusions: [
          "공동 브랜딩 (모든 홍보물)",
          "VIP 초대권 10매",
          "공동 세션 운영권",
          "참석자 데이터 공유",
        ],
        partner_obligations: [
          "3회 이상 채널 홍보",
          "연사 1명 섭외 지원",
          "콘텐츠 1건 공동 제작",
        ],
        value_exchange: "비금전적 - 상호 가치 교환",
      },
      {
        package_name: "프로모션 파트너 패키지",
        inclusions: [
          "할인 코드 (15% off)",
          "초대권 5매",
          "로고 노출 (웹사이트)",
        ],
        partner_obligations: [
          "2회 이상 SNS 홍보",
          "뉴스레터 1회 포함",
        ],
        value_exchange: "비금전적 - 홍보 가치 교환",
      },
    ],
    outreach_timeline: [
      {
        phase: "1단계: 전략적 파트너",
        timing: "D-90 ~ D-75",
        activities: ["핵심 파트너 리스트 작성", "개별 미팅 및 제안", "MOU 체결"],
      },
      {
        phase: "2단계: 프로모션/미디어 파트너",
        timing: "D-75 ~ D-60",
        activities: ["일괄 제안서 발송", "관심 표명 파트너 미팅", "파트너십 확정"],
      },
      {
        phase: "3단계: 커뮤니티 파트너",
        timing: "D-60 ~ D-45",
        activities: ["커뮤니티 매니저 접촉", "협력 조건 협의", "프로모션 시작"],
      },
      {
        phase: "4단계: 공동 활동 실행",
        timing: "D-45 ~ D-day",
        activities: ["공동 마케팅 실행", "성과 모니터링", "파트너 커뮤니케이션"],
      },
    ],
    success_metrics: [
      { metric: "파트너 확보 수", target: "15개사 이상" },
      { metric: "파트너 채널 도달", target: "100,000명+" },
      { metric: "공동 콘텐츠 수", target: "5건 이상" },
      { metric: "파트너 추천 등록", target: "전체의 20%" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-011";
export const taskName = "파트너십 전략";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.h";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
