/**
 * MKT-010: PR 전략
 * CMP-IS Reference: 7.2.g - Public relations and media outreach planning
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert PR Strategy Agent.
CMP-IS Standard: 7.2.g - Planning public relations and media outreach for event visibility.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  key_messages: z.array(z.string()),
  target_media: z.array(z.string()).optional(),
  spokespersons: z.array(z.string()).optional(),
  pr_budget: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  pr_strategy_id: z.string(),
  event_id: z.string(),
  key_messages: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    supporting_points: z.array(z.string()),
  }),
  media_targets: z.array(z.object({
    category: z.string(),
    outlets: z.array(z.string()),
    priority: z.string(),
    approach: z.string(),
  })),
  pr_activities: z.array(z.object({
    activity: z.string(),
    timing: z.string(),
    description: z.string(),
    expected_outcome: z.string(),
  })),
  content_calendar: z.array(z.object({
    week: z.string(),
    content_type: z.string(),
    description: z.string(),
    channel: z.string(),
  })),
  crisis_preparedness: z.object({
    potential_issues: z.array(z.string()),
    response_guidelines: z.array(z.string()),
    escalation_contacts: z.array(z.string()),
  }),
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
    pr_strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    key_messages: {
      primary: `${validatedInput.event_name} - 업계를 선도하는 혁신의 장`,
      secondary: [
        "글로벌 전문가들의 인사이트 공유",
        "네트워킹과 비즈니스 기회의 플랫폼",
        "최신 트렌드와 기술 시연",
      ],
      supporting_points: validatedInput.key_messages.length > 0
        ? validatedInput.key_messages
        : [
            "업계 리더 100+ 참여",
            "실무 중심 세션 구성",
            "참석자 만족도 95% 목표",
          ],
    },
    media_targets: [
      {
        category: "산업 전문지",
        outlets: ["산업일보", "전문매거진", "업계포털"],
        priority: "high",
        approach: "독점 인터뷰 및 사전 기사",
      },
      {
        category: "경제 매체",
        outlets: ["한국경제", "매일경제", "이데일리"],
        priority: "high",
        approach: "보도자료 배포 + 기자간담회",
      },
      {
        category: "온라인 매체",
        outlets: ["IT조선", "지디넷", "블로터"],
        priority: "medium",
        approach: "뉴스 기사 + 리뷰 콘텐츠",
      },
      {
        category: "방송",
        outlets: ["YTN", "연합뉴스TV", "SBS Biz"],
        priority: "medium",
        approach: "현장 취재 유치",
      },
    ],
    pr_activities: [
      {
        activity: "프레스킷 준비",
        timing: "D-45",
        description: "보도자료, 팩트시트, 고화질 이미지, 인터뷰 Q&A",
        expected_outcome: "기자들의 쉬운 기사 작성 지원",
      },
      {
        activity: "미디어 브리핑",
        timing: "D-30",
        description: "주요 기자 대상 사전 설명회",
        expected_outcome: "심층 기사 5건 이상",
      },
      {
        activity: "보도자료 1차 배포",
        timing: "D-21",
        description: "이벤트 개요 및 하이라이트 발표",
        expected_outcome: "온라인 기사 20건 이상",
      },
      {
        activity: "인플루언서 초청",
        timing: "D-14",
        description: "업계 인플루언서 사전 투어",
        expected_outcome: "SNS 노출 50만+ 도달",
      },
      {
        activity: "현장 프레스룸 운영",
        timing: "D-day",
        description: "기자 전용 공간 및 지원",
        expected_outcome: "실시간 보도 10건 이상",
      },
      {
        activity: "사후 보도자료",
        timing: "D+3",
        description: "행사 결과 및 성과 발표",
        expected_outcome: "후속 기사 15건 이상",
      },
    ],
    content_calendar: [
      { week: "D-6주", content_type: "티저", description: "이벤트 예고 콘텐츠", channel: "SNS/블로그" },
      { week: "D-5주", content_type: "연사 소개", description: "키노트 연사 인터뷰", channel: "유튜브/블로그" },
      { week: "D-4주", content_type: "프로그램 공개", description: "세션 라인업 발표", channel: "뉴스레터/SNS" },
      { week: "D-3주", content_type: "비하인드", description: "준비 과정 스토리", channel: "인스타그램" },
      { week: "D-2주", content_type: "카운트다운", description: "D-day 카운트다운", channel: "전 채널" },
      { week: "D-1주", content_type: "최종 안내", description: "참가자 가이드", channel: "이메일/앱푸시" },
    ],
    crisis_preparedness: {
      potential_issues: [
        "연사 취소/변경",
        "기술적 문제",
        "부정적 SNS 반응",
        "경쟁사 공격적 마케팅",
      ],
      response_guidelines: [
        "24시간 이내 공식 입장 발표",
        "사실 기반의 투명한 커뮤니케이션",
        "대안 제시와 함께 발표",
        "내부 승인 후 외부 발표",
      ],
      escalation_contacts: [
        "PR 담당자",
        "이벤트 디렉터",
        "법무팀",
        "대표이사",
      ],
    },
    success_metrics: [
      { metric: "미디어 노출 수", target: "50건 이상" },
      { metric: "광고환산가치(AVE)", target: "예산의 5배" },
      { metric: "소셜 멘션", target: "1,000건 이상" },
      { metric: "미디어 톤", target: "긍정 90% 이상" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-010";
export const taskName = "PR 전략";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.g";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
