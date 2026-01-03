/**
 * MKT-024: 파트너 활성화
 * CMP-IS Reference: 8.1.i - Partner activation and co-marketing execution
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Partner Activation Agent.
CMP-IS Standard: 8.1.i - Executing partner activations and co-marketing activities.`;

export const InputSchema = z.object({
  event_id: z.string(),
  partner_id: z.string(),
  partner_name: z.string(),
  partner_tier: z.string(),
  activation_type: z.string(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  activation_id: z.string(),
  event_id: z.string(),
  partner_id: z.string(),
  partner_name: z.string(),
  activation_status: z.string(),
  co_marketing_activities: z.array(z.object({
    activity: z.string(),
    status: z.string(),
    partner_contribution: z.string(),
    our_contribution: z.string(),
    deadline: z.string(),
    results: z.object({
      reach: z.number(),
      engagement: z.number(),
      conversions: z.number(),
    }).optional(),
  })),
  partner_assets_received: z.array(z.object({
    asset_type: z.string(),
    status: z.string(),
    usage_rights: z.string(),
  })),
  partner_promotion_codes: z.array(z.object({
    code: z.string(),
    discount: z.string(),
    usage_count: z.number(),
    max_usage: z.number(),
  })),
  communication_log: z.array(z.object({
    date: z.string(),
    type: z.string(),
    summary: z.string(),
    next_action: z.string(),
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
    activation_id: generateUUID(),
    event_id: validatedInput.event_id,
    partner_id: validatedInput.partner_id,
    partner_name: validatedInput.partner_name,
    activation_status: "active",
    co_marketing_activities: [
      {
        activity: "뉴스레터 교차 프로모션",
        status: "completed",
        partner_contribution: "뉴스레터 발송 (구독자 10,000명)",
        our_contribution: "콘텐츠 및 디자인 제공",
        deadline: new Date(Date.now() - 604800000).toISOString().split('T')[0],
        results: { reach: 8500, engagement: 425, conversions: 34 },
      },
      {
        activity: "공동 웨비나",
        status: "scheduled",
        partner_contribution: "연사 1명, 채널 홍보",
        our_contribution: "기획 및 운영",
        deadline: new Date(Date.now() + 1209600000).toISOString().split('T')[0],
      },
      {
        activity: "SNS 공동 캠페인",
        status: "in_progress",
        partner_contribution: "콘텐츠 3회 포스팅",
        our_contribution: "콘텐츠 제작, 해시태그 전략",
        deadline: new Date(Date.now() + 604800000).toISOString().split('T')[0],
        results: { reach: 15000, engagement: 750, conversions: 0 },
      },
    ],
    partner_assets_received: [
      { asset_type: "로고 (고해상도)", status: "received", usage_rights: "이벤트 기간 중 사용 가능" },
      { asset_type: "회사 소개 텍스트", status: "received", usage_rights: "수정 불가, 원본 사용" },
      { asset_type: "제품 이미지", status: "pending", usage_rights: "승인 후 사용" },
    ],
    partner_promotion_codes: [
      { code: `PARTNER${validatedInput.partner_name.slice(0,3).toUpperCase()}15`, discount: "15%", usage_count: 45, max_usage: 200 },
      { code: `VIP${validatedInput.partner_name.slice(0,3).toUpperCase()}20`, discount: "20%", usage_count: 12, max_usage: 50 },
    ],
    communication_log: [
      { date: new Date(Date.now() - 1209600000).toISOString().split('T')[0], type: "미팅", summary: "파트너십 조건 합의", next_action: "MOU 체결" },
      { date: new Date(Date.now() - 604800000).toISOString().split('T')[0], type: "이메일", summary: "MOU 서명 완료", next_action: "에셋 수집" },
      { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], type: "이메일", summary: "에셋 일부 수령", next_action: "누락 에셋 요청" },
      { date: new Date().toISOString().split('T')[0], type: "전화", summary: "캠페인 진행 상황 공유", next_action: "다음 주 성과 리포트" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-024";
export const taskName = "파트너 활성화";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.i";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
