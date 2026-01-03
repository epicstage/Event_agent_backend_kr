/**
 * MKT-013: 이메일 마케팅 전략
 * CMP-IS Reference: 7.2.j - Email marketing strategy and automation planning
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Email Marketing Strategy Agent.
CMP-IS Standard: 7.2.j - Planning email marketing campaigns and automation flows for event promotion.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  target_segments: z.array(z.string()).optional(),
  email_list_size: z.number().optional(),
  campaign_goals: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  email_strategy_id: z.string(),
  event_id: z.string(),
  segmentation_strategy: z.array(z.object({
    segment_name: z.string(),
    criteria: z.array(z.string()),
    messaging_approach: z.string(),
    expected_size_percentage: z.number(),
  })),
  email_sequences: z.array(z.object({
    sequence_name: z.string(),
    trigger: z.string(),
    emails: z.array(z.object({
      email_name: z.string(),
      timing: z.string(),
      subject_line: z.string(),
      primary_cta: z.string(),
      content_focus: z.string(),
    })),
  })),
  automation_flows: z.array(z.object({
    flow_name: z.string(),
    trigger_event: z.string(),
    steps: z.array(z.string()),
    goal: z.string(),
  })),
  calendar: z.array(z.object({
    week: z.string(),
    email_type: z.string(),
    target_segment: z.string(),
    key_message: z.string(),
  })),
  best_practices: z.array(z.object({
    category: z.string(),
    recommendations: z.array(z.string()),
  })),
  kpis: z.array(z.object({
    metric: z.string(),
    benchmark: z.string(),
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
    email_strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    segmentation_strategy: [
      {
        segment_name: "VIP/기존 참석자",
        criteria: ["이전 행사 참석", "고가치 고객"],
        messaging_approach: "독점 혜택 및 얼리버드 우선 접근",
        expected_size_percentage: 15,
      },
      {
        segment_name: "관심 표명자",
        criteria: ["뉴스레터 구독자", "사이트 방문자"],
        messaging_approach: "행사 가치 강조 및 혜택 소구",
        expected_size_percentage: 35,
      },
      {
        segment_name: "신규 리드",
        criteria: ["최근 획득 리드", "광고 유입"],
        messaging_approach: "브랜드/행사 소개 중심",
        expected_size_percentage: 30,
      },
      {
        segment_name: "비활성 구독자",
        criteria: ["6개월+ 미오픈", "미참여"],
        messaging_approach: "재활성화 캠페인",
        expected_size_percentage: 20,
      },
    ],
    email_sequences: [
      {
        sequence_name: "얼리버드 시퀀스",
        trigger: "얼리버드 기간 시작",
        emails: [
          {
            email_name: "얼리버드 오픈",
            timing: "D-60",
            subject_line: `[${validatedInput.event_name}] 얼리버드 특가 오픈! 30% 할인`,
            primary_cta: "지금 등록하기",
            content_focus: "얼리버드 혜택 및 마감일",
          },
          {
            email_name: "프로그램 미리보기",
            timing: "D-53",
            subject_line: "놓치면 후회할 세션 라인업 공개",
            primary_cta: "프로그램 확인하기",
            content_focus: "연사 및 세션 하이라이트",
          },
          {
            email_name: "얼리버드 마감 임박",
            timing: "D-46",
            subject_line: "⏰ 얼리버드 종료까지 48시간!",
            primary_cta: "마감 전 등록하기",
            content_focus: "긴급성 및 FOMO",
          },
        ],
      },
      {
        sequence_name: "일반 등록 시퀀스",
        trigger: "일반 등록 기간",
        emails: [
          {
            email_name: "연사 스포트라이트",
            timing: "D-35",
            subject_line: "업계 리더들이 전하는 인사이트",
            primary_cta: "연사 프로필 보기",
            content_focus: "연사 소개 및 기대 가치",
          },
          {
            email_name: "네트워킹 기회",
            timing: "D-28",
            subject_line: "1,000+ 전문가와의 만남이 기다립니다",
            primary_cta: "네트워킹 신청",
            content_focus: "네트워킹 프로그램",
          },
          {
            email_name: "등록 마감 안내",
            timing: "D-14",
            subject_line: "등록 마감이 다가옵니다",
            primary_cta: "지금 등록하기",
            content_focus: "마지막 기회 강조",
          },
        ],
      },
      {
        sequence_name: "등록자 너처링",
        trigger: "등록 완료",
        emails: [
          {
            email_name: "등록 확인",
            timing: "즉시",
            subject_line: `[확인] ${validatedInput.event_name} 등록이 완료되었습니다`,
            primary_cta: "캘린더에 추가",
            content_focus: "등록 확인 및 다음 단계",
          },
          {
            email_name: "사전 준비 안내",
            timing: "D-7",
            subject_line: "행사 참여를 위한 사전 준비 가이드",
            primary_cta: "앱 다운로드",
            content_focus: "준비사항 체크리스트",
          },
          {
            email_name: "최종 안내",
            timing: "D-1",
            subject_line: "내일 뵙겠습니다! 최종 안내",
            primary_cta: "상세 일정 확인",
            content_focus: "장소, 시간, 주의사항",
          },
        ],
      },
    ],
    automation_flows: [
      {
        flow_name: "장바구니 이탈 복구",
        trigger_event: "등록 페이지 이탈",
        steps: [
          "1시간 후: 리마인더 이메일",
          "24시간 후: 혜택 강조 이메일",
          "72시간 후: 마지막 기회 이메일",
        ],
        goal: "이탈자 20% 전환",
      },
      {
        flow_name: "웰컴 시리즈",
        trigger_event: "뉴스레터 신규 구독",
        steps: [
          "즉시: 웰컴 이메일 + 행사 소개",
          "3일 후: 하이라이트 콘텐츠",
          "7일 후: 등록 CTA",
        ],
        goal: "신규 구독자 행사 인지",
      },
      {
        flow_name: "재참여 캠페인",
        trigger_event: "30일 미오픈",
        steps: [
          "재참여 유도 이메일",
          "7일 후 미응답: 설문 요청",
          "14일 후 미응답: 수신 설정 확인",
        ],
        goal: "리스트 클린업 및 재활성화",
      },
    ],
    calendar: [
      { week: "D-8주", email_type: "티저", target_segment: "전체", key_message: "행사 예고" },
      { week: "D-7주", email_type: "얼리버드 오픈", target_segment: "VIP 우선", key_message: "독점 얼리버드" },
      { week: "D-6주", email_type: "얼리버드", target_segment: "전체", key_message: "할인 혜택" },
      { week: "D-5주", email_type: "프로그램", target_segment: "관심자", key_message: "세션 라인업" },
      { week: "D-4주", email_type: "연사", target_segment: "전체", key_message: "연사 소개" },
      { week: "D-3주", email_type: "네트워킹", target_segment: "등록자", key_message: "네트워킹 기회" },
      { week: "D-2주", email_type: "마감 임박", target_segment: "미등록자", key_message: "마지막 기회" },
      { week: "D-1주", email_type: "사전 안내", target_segment: "등록자", key_message: "참여 준비" },
    ],
    best_practices: [
      {
        category: "제목줄",
        recommendations: [
          "50자 이내로 작성",
          "개인화 토큰 활용 (이름, 회사)",
          "이모지 전략적 사용",
          "A/B 테스트 실시",
        ],
      },
      {
        category: "콘텐츠",
        recommendations: [
          "모바일 최적화 필수",
          "단일 CTA 집중",
          "이미지:텍스트 = 40:60",
          "스캔 가능한 레이아웃",
        ],
      },
      {
        category: "발송",
        recommendations: [
          "화-목 오전 10시 최적",
          "세그먼트별 최적 시간 테스트",
          "주 2회 이하 발송",
          "중요 이메일은 화요일",
        ],
      },
    ],
    kpis: [
      { metric: "오픈율", benchmark: "20-25%", target: "30%" },
      { metric: "클릭률", benchmark: "2-3%", target: "5%" },
      { metric: "전환율", benchmark: "1-2%", target: "3%" },
      { metric: "수신거부율", benchmark: "<0.5%", target: "<0.3%" },
      { metric: "이메일 당 매출", benchmark: "-", target: "ROI 4:1" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-013";
export const taskName = "이메일 마케팅 전략";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.j";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
