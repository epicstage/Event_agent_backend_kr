/**
 * MKT-012: 인플루언서 전략
 * CMP-IS Reference: 7.2.i - Influencer marketing strategy and collaboration planning
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Influencer Marketing Strategy Agent.
CMP-IS Standard: 7.2.i - Planning influencer collaborations for authentic event promotion.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  target_audience: z.object({
    age_range: z.string().optional(),
    interests: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
  }),
  influencer_budget: z.number().optional(),
  campaign_objectives: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  influencer_strategy_id: z.string(),
  event_id: z.string(),
  influencer_tiers: z.array(z.object({
    tier: z.string(),
    follower_range: z.string(),
    count_target: z.number(),
    engagement_rate: z.string(),
    budget_per_person: z.string(),
    content_deliverables: z.array(z.string()),
  })),
  platform_strategy: z.array(z.object({
    platform: z.string(),
    content_types: z.array(z.string()),
    best_practices: z.array(z.string()),
    hashtags: z.array(z.string()),
  })),
  collaboration_types: z.array(z.object({
    type: z.string(),
    description: z.string(),
    suitable_for: z.string(),
    expected_outcome: z.string(),
  })),
  selection_criteria: z.array(z.object({
    criterion: z.string(),
    weight: z.number(),
    evaluation_method: z.string(),
  })),
  campaign_timeline: z.array(z.object({
    phase: z.string(),
    timing: z.string(),
    activities: z.array(z.string()),
  })),
  kpis: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    measurement: z.string(),
  })),
  risk_management: z.object({
    potential_risks: z.array(z.string()),
    mitigation_strategies: z.array(z.string()),
  }),
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
    influencer_strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    influencer_tiers: [
      {
        tier: "매크로 인플루언서",
        follower_range: "100K - 1M",
        count_target: 2,
        engagement_rate: "2-5%",
        budget_per_person: "500만-1000만원",
        content_deliverables: ["피드 포스트 2개", "스토리 4개", "현장 라이브"],
      },
      {
        tier: "미드 인플루언서",
        follower_range: "10K - 100K",
        count_target: 5,
        engagement_rate: "5-10%",
        budget_per_person: "100만-300만원",
        content_deliverables: ["피드 포스트 1개", "스토리 3개", "후기 콘텐츠"],
      },
      {
        tier: "마이크로 인플루언서",
        follower_range: "1K - 10K",
        count_target: 15,
        engagement_rate: "10-20%",
        budget_per_person: "상품권/초대권",
        content_deliverables: ["스토리 2개", "후기 1개"],
      },
      {
        tier: "나노 인플루언서/전문가",
        follower_range: "500 - 1K",
        count_target: 20,
        engagement_rate: "15-25%",
        budget_per_person: "초대권/네트워킹",
        content_deliverables: ["진정성 있는 후기", "전문가 관점 공유"],
      },
    ],
    platform_strategy: [
      {
        platform: "Instagram",
        content_types: ["피드 이미지", "스토리", "릴스", "라이브"],
        best_practices: [
          "비주얼 중심의 행사 스냅",
          "비하인드 씬 스토리",
          "연사/세션 하이라이트 릴스",
        ],
        hashtags: ["#이벤트명", "#콘퍼런스2026", "#네트워킹", "#업계행사"],
      },
      {
        platform: "YouTube",
        content_types: ["브이로그", "인터뷰", "하이라이트"],
        best_practices: [
          "참가 후기 브이로그",
          "연사 인터뷰 클립",
          "행사 하이라이트 영상",
        ],
        hashtags: ["#이벤트명", "#컨퍼런스후기", "#브이로그"],
      },
      {
        platform: "LinkedIn",
        content_types: ["인사이트 포스트", "네트워킹 후기", "전문 콘텐츠"],
        best_practices: [
          "비즈니스 인사이트 공유",
          "전문가 네트워킹 경험담",
          "세션 핵심 내용 정리",
        ],
        hashtags: ["#이벤트명", "#전문가네트워킹", "#업계트렌드"],
      },
      {
        platform: "TikTok",
        content_types: ["숏폼 영상", "트렌드 챌린지", "하이라이트"],
        best_practices: [
          "트렌디한 BGM 활용",
          "행사 분위기 압축 영상",
          "참여형 챌린지",
        ],
        hashtags: ["#이벤트명", "#컨퍼런스", "#틱톡이벤트"],
      },
    ],
    collaboration_types: [
      {
        type: "앰버서더",
        description: "장기 파트너십으로 지속적인 홍보",
        suitable_for: "매크로/미드 인플루언서",
        expected_outcome: "브랜드 인지도 및 신뢰도 구축",
      },
      {
        type: "초청 참가",
        description: "VIP 초청 후 자발적 콘텐츠 생성",
        suitable_for: "전 티어",
        expected_outcome: "진정성 있는 후기 콘텐츠",
      },
      {
        type: "콘텐츠 제작 의뢰",
        description: "특정 콘텐츠 제작 계약",
        suitable_for: "미드/매크로 인플루언서",
        expected_outcome: "고품질 홍보 콘텐츠",
      },
      {
        type: "현장 취재",
        description: "현장에서 실시간 콘텐츠 생성",
        suitable_for: "미드/마이크로 인플루언서",
        expected_outcome: "실시간 버즈 생성",
      },
    ],
    selection_criteria: [
      {
        criterion: "타겟 적합도",
        weight: 30,
        evaluation_method: "팔로워 인구통계 분석",
      },
      {
        criterion: "참여율(Engagement Rate)",
        weight: 25,
        evaluation_method: "최근 30일 평균 참여율",
      },
      {
        criterion: "콘텐츠 품질",
        weight: 20,
        evaluation_method: "최근 콘텐츠 10개 리뷰",
      },
      {
        criterion: "브랜드 적합성",
        weight: 15,
        evaluation_method: "기존 협찬 이력 및 톤 분석",
      },
      {
        criterion: "비용 효율성",
        weight: 10,
        evaluation_method: "예상 CPE(Cost Per Engagement)",
      },
    ],
    campaign_timeline: [
      {
        phase: "인플루언서 발굴",
        timing: "D-60 ~ D-45",
        activities: ["후보 리스트 작성", "분석 및 평가", "우선순위 선정"],
      },
      {
        phase: "섭외 및 계약",
        timing: "D-45 ~ D-30",
        activities: ["콜라보 제안", "조건 협의", "계약 체결"],
      },
      {
        phase: "사전 콘텐츠",
        timing: "D-30 ~ D-7",
        activities: ["티저 콘텐츠 발행", "카운트다운 참여", "팔로워 기대감 조성"],
      },
      {
        phase: "현장 콘텐츠",
        timing: "D-day",
        activities: ["실시간 스토리/라이브", "현장 스냅 공유", "참여 인증"],
      },
      {
        phase: "사후 콘텐츠",
        timing: "D+1 ~ D+14",
        activities: ["후기 콘텐츠 발행", "하이라이트 공유", "성과 분석"],
      },
    ],
    kpis: [
      { metric: "총 도달(Reach)", target: "500,000+", measurement: "플랫폼 인사이트" },
      { metric: "참여 수(Engagement)", target: "25,000+", measurement: "좋아요+댓글+저장+공유" },
      { metric: "콘텐츠 수", target: "50개+", measurement: "해시태그 트래킹" },
      { metric: "UTM 클릭", target: "5,000+", measurement: "GA4" },
      { metric: "프로모코드 사용", target: "200건+", measurement: "등록 시스템" },
    ],
    risk_management: {
      potential_risks: [
        "인플루언서 계약 불이행",
        "부정적/논란 콘텐츠",
        "저조한 참여율",
        "경쟁사 동시 협업",
      ],
      mitigation_strategies: [
        "명확한 계약서 및 가이드라인",
        "콘텐츠 사전 검토 조항",
        "단계별 성과 체크포인트",
        "독점 조항 검토",
      ],
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-012";
export const taskName = "인플루언서 전략";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.i";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
