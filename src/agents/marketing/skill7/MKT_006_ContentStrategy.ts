/**
 * MKT-006: 콘텐츠 전략
 * CMP-IS Reference: 7.2.c - Developing content marketing strategy
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Content Strategy Agent for event marketing.
CMP-IS Standard: 7.2.c - Developing comprehensive content strategy to attract and engage audiences.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_type: z.string(),
  target_segments: z.array(z.string()),
  content_themes: z.array(z.string()).optional(),
  available_resources: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  strategy_id: z.string(),
  event_id: z.string(),
  content_pillars: z.array(z.object({
    pillar: z.string(),
    description: z.string(),
    content_types: z.array(z.string()),
    target_segment: z.string(),
    frequency: z.string(),
  })),
  content_calendar: z.array(z.object({
    week: z.string(),
    theme: z.string(),
    content_pieces: z.array(z.object({
      type: z.string(),
      title: z.string(),
      channel: z.string(),
    })),
  })),
  content_formats: z.array(z.object({
    format: z.string(),
    purpose: z.string(),
    production_effort: z.string(),
    expected_engagement: z.string(),
  })),
  recommendations: z.array(z.string()),
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
    strategy_id: generateUUID(),
    event_id: validatedInput.event_id,
    content_pillars: [
      { pillar: "연사 스포트라이트", description: "연사 소개 및 인사이트", content_types: ["인터뷰", "프로필", "미리보기"], target_segment: "전체", frequency: "주 2회" },
      { pillar: "업계 트렌드", description: "최신 트렌드 및 전망", content_types: ["아티클", "인포그래픽", "리포트"], target_segment: "의사결정권자", frequency: "주 1회" },
      { pillar: "참가자 스토리", description: "과거 참가자 후기", content_types: ["케이스 스터디", "영상 후기"], target_segment: "고려 단계", frequency: "주 1회" },
      { pillar: "행사 안내", description: "등록, 일정, 혜택 안내", content_types: ["공지", "FAQ", "가이드"], target_segment: "전환 단계", frequency: "상시" },
    ],
    content_calendar: [
      { week: "W1-2", theme: "티저 및 발표", content_pieces: [{ type: "블로그", title: "행사 개최 발표", channel: "웹사이트" }, { type: "영상", title: "티저 영상", channel: "유튜브" }] },
      { week: "W3-4", theme: "연사 발표", content_pieces: [{ type: "인터뷰", title: "기조연사 인터뷰", channel: "블로그" }, { type: "카드뉴스", title: "연사 라인업", channel: "인스타그램" }] },
      { week: "W5-6", theme: "콘텐츠 심화", content_pieces: [{ type: "웨비나", title: "미리보기 세션", channel: "줌" }, { type: "리포트", title: "트렌드 리포트", channel: "이메일" }] },
    ],
    content_formats: [
      { format: "블로그 포스트", purpose: "SEO 및 정보 제공", production_effort: "중", expected_engagement: "중" },
      { format: "영상 콘텐츠", purpose: "참여 및 공유", production_effort: "고", expected_engagement: "고" },
      { format: "인포그래픽", purpose: "정보 시각화", production_effort: "중", expected_engagement: "고" },
      { format: "이메일 뉴스레터", purpose: "직접 전환", production_effort: "저", expected_engagement: "중" },
    ],
    recommendations: [
      "연사 콘텐츠를 최우선으로 제작",
      "짧은 형식 영상으로 소셜 참여 유도",
      "참가자 후기로 신뢰도 구축",
      "콘텐츠 재활용으로 효율성 극대화",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-006";
export const taskName = "콘텐츠 전략";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.c";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
