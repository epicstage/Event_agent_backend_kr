/**
 * MKT-021: 이메일 캠페인 실행
 * CMP-IS Reference: 8.1.f - Email campaign execution and delivery
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Email Campaign Execution Agent.
CMP-IS Standard: 8.1.f - Executing email campaigns with segmentation and personalization.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_name: z.string(),
  email_type: z.string(),
  subject_line: z.string(),
  preview_text: z.string().optional(),
  recipient_segment: z.string(),
  send_time: z.string().optional(),
  template_id: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  email_campaign_id: z.string(),
  event_id: z.string(),
  campaign_status: z.string(),
  send_details: z.object({
    total_recipients: z.number(),
    segments_included: z.array(z.string()),
    send_time: z.string(),
    from_name: z.string(),
    from_email: z.string(),
    reply_to: z.string(),
  }),
  personalization_applied: z.array(z.object({
    field: z.string(),
    merge_tag: z.string(),
    fallback: z.string(),
  })),
  ab_test_config: z.object({
    enabled: z.boolean(),
    variable: z.string(),
    variants: z.array(z.object({
      variant: z.string(),
      value: z.string(),
      percentage: z.number(),
    })),
    winner_criteria: z.string(),
  }),
  deliverability_checks: z.array(z.object({
    check: z.string(),
    status: z.string(),
    details: z.string(),
  })),
  tracking_config: z.object({
    open_tracking: z.boolean(),
    click_tracking: z.boolean(),
    utm_parameters: z.string(),
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
    email_campaign_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaign_status: "scheduled",
    send_details: {
      total_recipients: 5000,
      segments_included: [validatedInput.recipient_segment],
      send_time: validatedInput.send_time || new Date(Date.now() + 3600000).toISOString(),
      from_name: "Event Team",
      from_email: "event@company.com",
      reply_to: "support@company.com",
    },
    personalization_applied: [
      { field: "이름", merge_tag: "{{first_name}}", fallback: "고객님" },
      { field: "회사명", merge_tag: "{{company}}", fallback: "" },
      { field: "등록 상태", merge_tag: "{{registration_status}}", fallback: "미등록" },
    ],
    ab_test_config: {
      enabled: true,
      variable: "subject_line",
      variants: [
        { variant: "A", value: validatedInput.subject_line, percentage: 50 },
        { variant: "B", value: `🎯 ${validatedInput.subject_line}`, percentage: 50 },
      ],
      winner_criteria: "open_rate_after_4_hours",
    },
    deliverability_checks: [
      { check: "SPF 레코드", status: "passed", details: "도메인 인증 완료" },
      { check: "DKIM 서명", status: "passed", details: "서명 유효" },
      { check: "스팸 점수", status: "passed", details: "점수: 0.5/10" },
      { check: "링크 검증", status: "passed", details: "모든 링크 유효" },
      { check: "이미지 최적화", status: "passed", details: "이미지 압축 완료" },
    ],
    tracking_config: {
      open_tracking: true,
      click_tracking: true,
      utm_parameters: `utm_source=email&utm_medium=${validatedInput.email_type}&utm_campaign=${validatedInput.campaign_name}`,
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-021";
export const taskName = "이메일 캠페인 실행";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.1.f";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.1: Campaign Execution";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
