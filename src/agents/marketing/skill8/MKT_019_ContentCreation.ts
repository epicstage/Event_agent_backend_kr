/**
 * MKT-019: 콘텐츠 제작
 * CMP-IS Reference: 8.1.d - Content creation and production
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Content Creation Agent.
CMP-IS Standard: 8.1.d - Creating engaging content for event marketing across channels.`;

export const InputSchema = z.object({
  event_id: z.string(),
  content_type: z.string(),
  topic: z.string(),
  target_platform: z.string(),
  tone: z.string().optional(),
  length: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  content_id: z.string(),
  event_id: z.string(),
  content_type: z.string(),
  platform: z.string(),
  content: z.object({
    title: z.string(),
    hook: z.string(),
    body: z.string(),
    cta: z.string(),
    hashtags: z.array(z.string()),
  }),
  seo_optimization: z.object({
    meta_title: z.string(),
    meta_description: z.string(),
    keywords: z.array(z.string()),
  }),
  content_variations: z.array(z.object({
    platform: z.string(),
    adapted_content: z.string(),
    character_count: z.number(),
  })),
  publishing_recommendations: z.object({
    best_time: z.string(),
    frequency: z.string(),
    engagement_tips: z.array(z.string()),
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

  const contentBody = `${validatedInput.topic}에 대한 심층 분석과 함께, 이번 이벤트에서 얻을 수 있는 핵심 인사이트를 공유합니다. 업계 전문가들의 생생한 경험담과 실무에 바로 적용 가능한 노하우를 만나보세요.`;

  return {
    content_id: generateUUID(),
    event_id: validatedInput.event_id,
    content_type: validatedInput.content_type,
    platform: validatedInput.target_platform,
    content: {
      title: `[필독] ${validatedInput.topic} - 놓치면 후회할 인사이트`,
      hook: `당신의 비즈니스를 한 단계 성장시킬 기회가 왔습니다.`,
      body: contentBody,
      cta: "지금 바로 등록하고 얼리버드 혜택을 받으세요!",
      hashtags: ["#이벤트", "#네트워킹", "#비즈니스성장", "#인사이트"],
    },
    seo_optimization: {
      meta_title: `${validatedInput.topic} | 2026 최고의 이벤트`,
      meta_description: `${validatedInput.topic}의 최신 트렌드와 실무 노하우를 배울 수 있는 기회. 지금 등록하세요.`,
      keywords: validatedInput.keywords || ["이벤트", "컨퍼런스", "네트워킹", "전문가"],
    },
    content_variations: [
      {
        platform: "Instagram",
        adapted_content: `✨ ${validatedInput.topic}\n\n${contentBody.slice(0, 100)}...\n\n👉 프로필 링크에서 등록하세요!`,
        character_count: 150,
      },
      {
        platform: "LinkedIn",
        adapted_content: `${validatedInput.topic}에 관심 있으신 분들께 추천드립니다.\n\n${contentBody}\n\n#전문성 #네트워킹 #비즈니스`,
        character_count: 300,
      },
      {
        platform: "Twitter",
        adapted_content: `🎯 ${validatedInput.topic}\n\n핵심 인사이트를 얻을 수 있는 기회! 지금 등록하세요 👇`,
        character_count: 100,
      },
    ],
    publishing_recommendations: {
      best_time: "화-목 오전 10시 또는 오후 2시",
      frequency: "주 2-3회",
      engagement_tips: [
        "질문으로 끝맺어 댓글 유도",
        "첫 1시간 내 댓글 응답",
        "관련 해시태그 5개 이하 사용",
      ],
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-019";
export const taskName = "콘텐츠 제작";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.d";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
