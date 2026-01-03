/**
 * MKT-014: 소셜 미디어 전략
 * CMP-IS Reference: 7.2.k - Social media strategy and content planning
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Social Media Strategy Agent.
CMP-IS Standard: 7.2.k - Planning comprehensive social media strategy for event promotion and engagement.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  target_platforms: z.array(z.string()).optional(),
  brand_voice: z.string().optional(),
  hashtag_suggestions: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  social_strategy_id: z.string(),
  event_id: z.string(),
  platform_strategies: z.array(z.object({
    platform: z.string(),
    audience_profile: z.string(),
    content_pillars: z.array(z.string()),
    posting_frequency: z.string(),
    best_times: z.array(z.string()),
    content_formats: z.array(z.string()),
    engagement_tactics: z.array(z.string()),
  })),
  content_themes: z.array(z.object({
    theme: z.string(),
    description: z.string(),
    content_ideas: z.array(z.string()),
    platforms: z.array(z.string()),
  })),
  hashtag_strategy: z.object({
    primary_hashtag: z.string(),
    secondary_hashtags: z.array(z.string()),
    industry_hashtags: z.array(z.string()),
    usage_guidelines: z.array(z.string()),
  }),
  content_calendar: z.array(z.object({
    week: z.string(),
    theme: z.string(),
    content_types: z.array(z.string()),
    platforms: z.array(z.string()),
  })),
  community_management: z.object({
    response_guidelines: z.array(z.string()),
    escalation_triggers: z.array(z.string()),
    engagement_prompts: z.array(z.string()),
  }),
  paid_social_recommendations: z.array(z.object({
    platform: z.string(),
    objective: z.string(),
    target_audience: z.string(),
    budget_allocation: z.string(),
    ad_formats: z.array(z.string()),
  })),
  kpis: z.array(z.object({
    metric: z.string(),
    platform: z.string(),
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
  const eventHashtag = validatedInput.event_name.replace(/\s+/g, "");

  return {
    social_strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    platform_strategies: [
      {
        platform: "Instagram",
        audience_profile: "25-45세, 비주얼 중심 소비, 트렌드 민감",
        content_pillars: ["행사 비하인드", "연사 스포트라이트", "참가자 스토리", "카운트다운"],
        posting_frequency: "일 1-2회",
        best_times: ["오전 8시", "점심 12시", "저녁 7시"],
        content_formats: ["피드 이미지", "캐러셀", "릴스", "스토리"],
        engagement_tactics: ["스토리 폴", "Q&A 스티커", "카운트다운 스티커", "UGC 리포스트"],
      },
      {
        platform: "LinkedIn",
        audience_profile: "30-55세, B2B 전문가, 인사이트 추구",
        content_pillars: ["업계 트렌드", "전문가 인터뷰", "세션 프리뷰", "네트워킹 가치"],
        posting_frequency: "주 3-4회",
        best_times: ["오전 8시", "점심 12시", "오후 5시"],
        content_formats: ["텍스트 포스트", "이미지", "문서", "폴"],
        engagement_tactics: ["전문가 태그", "토론 유도", "인사이트 공유", "회사 페이지 연계"],
      },
      {
        platform: "YouTube",
        audience_profile: "전 연령대, 심층 콘텐츠 소비",
        content_pillars: ["연사 인터뷰", "행사 하이라이트", "교육 콘텐츠", "후기"],
        posting_frequency: "주 1-2회",
        best_times: ["주말 오후", "평일 저녁"],
        content_formats: ["롱폼 영상", "쇼츠", "라이브"],
        engagement_tactics: ["댓글 응답", "커뮤니티 탭 활용", "프리미어 활용"],
      },
      {
        platform: "Twitter/X",
        audience_profile: "실시간 정보 추구, 업계 뉴스 팔로우",
        content_pillars: ["실시간 업데이트", "연사 명언", "빠른 소식", "참여 유도"],
        posting_frequency: "일 3-5회",
        best_times: ["오전 9시", "점심", "오후 3시", "저녁 8시"],
        content_formats: ["텍스트", "이미지", "폴", "스레드"],
        engagement_tactics: ["라이브 트윗", "리트윗", "멘션 응답", "트렌드 활용"],
      },
    ],
    content_themes: [
      {
        theme: "연사 스포트라이트",
        description: "연사 소개 및 기대 인사이트 공유",
        content_ideas: ["연사 프로필 카드", "인터뷰 클립", "세션 티저", "Q&A"],
        platforms: ["Instagram", "LinkedIn", "YouTube"],
      },
      {
        theme: "비하인드 더 씬",
        description: "행사 준비 과정 공유로 기대감 조성",
        content_ideas: ["준비 현장", "팀 소개", "세팅 타임랩스", "리허설"],
        platforms: ["Instagram", "TikTok"],
      },
      {
        theme: "참가자 스토리",
        description: "참가자 경험담 및 기대 공유",
        content_ideas: ["참석 이유", "기대 포인트", "네트워킹 목표", "과거 후기"],
        platforms: ["LinkedIn", "Instagram"],
      },
      {
        theme: "인사이트 프리뷰",
        description: "세션 내용 일부 사전 공개",
        content_ideas: ["핵심 트렌드", "통계/데이터", "체크리스트", "가이드"],
        platforms: ["LinkedIn", "Twitter/X"],
      },
    ],
    hashtag_strategy: {
      primary_hashtag: `#${eventHashtag}`,
      secondary_hashtags: [
        `#${eventHashtag}2026`,
        "#이벤트등록오픈",
        "#업계컨퍼런스",
      ],
      industry_hashtags: [
        "#테크컨퍼런스",
        "#비즈니스네트워킹",
        "#프로페셔널이벤트",
        "#인더스트리트렌드",
      ],
      usage_guidelines: [
        "모든 포스트에 프라이머리 해시태그 포함",
        "Instagram: 최대 5개 해시태그",
        "LinkedIn: 3개 이하 해시태그",
        "Twitter: 2개 이하 해시태그",
      ],
    },
    content_calendar: [
      { week: "D-8주", theme: "티저/예고", content_types: ["티저 영상", "저장 유도 포스트"], platforms: ["Instagram", "LinkedIn"] },
      { week: "D-7주", theme: "얼리버드 오픈", content_types: ["할인 안내", "CTA 포스트"], platforms: ["전 채널"] },
      { week: "D-6주", theme: "연사 발표", content_types: ["연사 카드", "인터뷰 클립"], platforms: ["LinkedIn", "Instagram"] },
      { week: "D-5주", theme: "프로그램 공개", content_types: ["세션 라인업", "추천 세션"], platforms: ["전 채널"] },
      { week: "D-4주", theme: "네트워킹", content_types: ["네트워킹 가치", "참가자 인터뷰"], platforms: ["LinkedIn"] },
      { week: "D-3주", theme: "비하인드", content_types: ["준비 과정", "팀 소개"], platforms: ["Instagram", "TikTok"] },
      { week: "D-2주", theme: "카운트다운", content_types: ["D-day 카운트", "마감 임박"], platforms: ["전 채널"] },
      { week: "D-day", theme: "현장 라이브", content_types: ["실시간 업데이트", "하이라이트"], platforms: ["전 채널"] },
    ],
    community_management: {
      response_guidelines: [
        "1시간 이내 응답 목표",
        "친근하면서도 전문적인 톤",
        "질문에는 구체적 정보 제공",
        "부정적 댓글도 정중하게 대응",
      ],
      escalation_triggers: [
        "환불/취소 관련 문의",
        "불만 또는 클레임",
        "미디어/기자 문의",
        "법적 이슈 언급",
      ],
      engagement_prompts: [
        "어떤 세션이 가장 기대되시나요?",
        "행사에서 누구를 만나고 싶으신가요?",
        "작년 행사 참석하신 분 계신가요?",
        "궁금한 점 있으시면 댓글로 남겨주세요!",
      ],
    },
    paid_social_recommendations: [
      {
        platform: "Meta (Instagram/Facebook)",
        objective: "도달 및 인지도",
        target_audience: "관심사 기반 + 유사 타겟",
        budget_allocation: "40%",
        ad_formats: ["피드 광고", "스토리 광고", "릴스 광고"],
      },
      {
        platform: "LinkedIn",
        objective: "리드 생성 및 전환",
        target_audience: "직무/산업 기반 타겟팅",
        budget_allocation: "35%",
        ad_formats: ["스폰서드 콘텐츠", "메시지 광고", "다이내믹 광고"],
      },
      {
        platform: "YouTube",
        objective: "인지도 및 고려",
        target_audience: "관심사 + 맞춤 타겟",
        budget_allocation: "25%",
        ad_formats: ["인스트림 광고", "범퍼 광고", "디스커버리 광고"],
      },
    ],
    kpis: [
      { metric: "팔로워 증가", platform: "Instagram", target: "+2,000" },
      { metric: "참여율", platform: "Instagram", target: "5%+" },
      { metric: "도달", platform: "LinkedIn", target: "100,000+" },
      { metric: "영상 조회수", platform: "YouTube", target: "50,000+" },
      { metric: "해시태그 멘션", platform: "전체", target: "1,000+" },
      { metric: "UTM 클릭", platform: "전체", target: "10,000+" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-014";
export const taskName = "소셜 미디어 전략";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.k";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
