/**
 * MKT-017: 광고 크리에이티브 제작
 * CMP-IS Reference: 8.1.b - Ad creative production and management
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Ad Creative Production Agent.
CMP-IS Standard: 8.1.b - Managing advertising creative production across formats and platforms.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string(),
  platforms: z.array(z.string()),
  creative_brief: z.object({
    key_message: z.string(),
    cta: z.string(),
    tone: z.string().optional(),
    brand_guidelines: z.string().optional(),
  }),
  formats_needed: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  production_id: z.string(),
  event_id: z.string(),
  creative_assets: z.array(z.object({
    asset_id: z.string(),
    platform: z.string(),
    format: z.string(),
    dimensions: z.string(),
    file_type: z.string(),
    status: z.string(),
    copy: z.object({
      headline: z.string(),
      body: z.string(),
      cta: z.string(),
    }),
  })),
  production_timeline: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    deliverables: z.array(z.string()),
  })),
  ab_test_variants: z.array(z.object({
    variant: z.string(),
    variable: z.string(),
    hypothesis: z.string(),
  })),
  approval_status: z.string(),
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

  const platformSpecs: Record<string, Array<{format: string, dimensions: string}>> = {
    "Instagram": [
      { format: "Feed Image", dimensions: "1080x1080" },
      { format: "Story", dimensions: "1080x1920" },
      { format: "Reels", dimensions: "1080x1920" },
    ],
    "Facebook": [
      { format: "Feed Image", dimensions: "1200x628" },
      { format: "Carousel", dimensions: "1080x1080" },
    ],
    "LinkedIn": [
      { format: "Sponsored Content", dimensions: "1200x627" },
      { format: "Message Ad", dimensions: "300x250" },
    ],
    "Google": [
      { format: "Display Banner", dimensions: "300x250" },
      { format: "Leaderboard", dimensions: "728x90" },
      { format: "Responsive Display", dimensions: "Multiple" },
    ],
  };

  const creativeAssets: Array<z.infer<typeof OutputSchema>["creative_assets"][0]> = [];

  validatedInput.platforms.forEach(platform => {
    const specs = platformSpecs[platform] || [{ format: "Standard", dimensions: "1200x628" }];
    specs.forEach(spec => {
      creativeAssets.push({
        asset_id: generateUUID(),
        platform,
        format: spec.format,
        dimensions: spec.dimensions,
        file_type: spec.format.includes("Video") || spec.format.includes("Reels") ? "MP4" : "PNG",
        status: "in_production",
        copy: {
          headline: validatedInput.creative_brief.key_message.slice(0, 40),
          body: validatedInput.creative_brief.key_message,
          cta: validatedInput.creative_brief.cta,
        },
      });
    });
  });

  return {
    production_id: generateUUID(),
    event_id: validatedInput.event_id,
    creative_assets: creativeAssets,
    production_timeline: [
      { phase: "브리프 확정", duration: "Day 1", deliverables: ["크리에이티브 브리프", "레퍼런스 수집"] },
      { phase: "컨셉 개발", duration: "Day 2-3", deliverables: ["컨셉 시안 3종", "카피 초안"] },
      { phase: "디자인 제작", duration: "Day 4-6", deliverables: ["전 사이즈 제작", "애니메이션"] },
      { phase: "내부 리뷰", duration: "Day 7", deliverables: ["피드백 반영", "수정본"] },
      { phase: "최종 승인", duration: "Day 8", deliverables: ["최종 파일", "플랫폼 업로드"] },
    ],
    ab_test_variants: [
      { variant: "A", variable: "헤드라인", hypothesis: "혜택 강조가 전환율 높음" },
      { variant: "B", variable: "헤드라인", hypothesis: "긴급성 강조가 CTR 높음" },
      { variant: "C", variable: "비주얼", hypothesis: "인물 이미지가 참여율 높음" },
    ],
    approval_status: "pending_review",
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-017";
export const taskName = "광고 크리에이티브 제작";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.b";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
