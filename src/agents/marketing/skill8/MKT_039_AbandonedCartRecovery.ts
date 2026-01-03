/**
 * MKT-039: 장바구니 이탈 복구
 * CMP-IS Reference: 8.5.c - Abandoned cart/registration recovery
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Abandoned Cart Recovery Agent.
CMP-IS Standard: 8.5.c - Recovering abandoned registrations through targeted follow-up.`;

export const InputSchema = z.object({
  event_id: z.string(),
  abandonment_stage: z.string(),
  time_since_abandonment: z.string().optional(),
  user_email: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  recovery_id: z.string(),
  event_id: z.string(),
  abandonment_analysis: z.object({
    total_abandonments: z.number(),
    abandonment_rate: z.number(),
    top_drop_off_points: z.array(z.object({ stage: z.string(), percentage: z.number() })),
    common_reasons: z.array(z.string()),
  }),
  recovery_sequence: z.array(z.object({
    step: z.number(),
    timing: z.string(),
    channel: z.string(),
    subject: z.string(),
    message_focus: z.string(),
    incentive: z.string(),
    expected_recovery_rate: z.number(),
  })),
  personalization_rules: z.array(z.object({
    condition: z.string(),
    action: z.string(),
    message_variant: z.string(),
  })),
  recovery_metrics: z.object({
    emails_sent: z.number(),
    open_rate: z.number(),
    click_rate: z.number(),
    recovered: z.number(),
    recovery_rate: z.number(),
    revenue_recovered: z.number(),
  }),
  optimization_suggestions: z.array(z.object({ suggestion: z.string(), expected_impact: z.string() })),
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
    recovery_id: generateUUID(),
    event_id: validatedInput.event_id,
    abandonment_analysis: {
      total_abandonments: 450,
      abandonment_rate: 65,
      top_drop_off_points: [
        { stage: "정보 입력", percentage: 35 },
        { stage: "결제 단계", percentage: 40 },
        { stage: "최종 확인", percentage: 25 },
      ],
      common_reasons: ["가격 확인 목적", "결정 미루기", "복잡한 폼", "결제 수단 부재", "기술적 오류"],
    },
    recovery_sequence: [
      { step: 1, timing: "1시간 후", channel: "Email", subject: "등록을 완료해주세요", message_focus: "남은 단계 안내", incentive: "없음", expected_recovery_rate: 8 },
      { step: 2, timing: "24시간 후", channel: "Email", subject: "자리가 줄어들고 있습니다", message_focus: "희소성/긴급성", incentive: "없음", expected_recovery_rate: 5 },
      { step: 3, timing: "48시간 후", channel: "Email", subject: "특별 할인 제공", message_focus: "인센티브", incentive: "5% 추가 할인", expected_recovery_rate: 7 },
      { step: 4, timing: "72시간 후", channel: "SMS", subject: "마지막 기회", message_focus: "최종 제안", incentive: "무료 업그레이드", expected_recovery_rate: 3 },
    ],
    personalization_rules: [
      { condition: "VIP 고객", action: "1:1 콜 스케줄", message_variant: "전담 매니저 안내" },
      { condition: "가격 페이지 다회 방문", action: "할인 코드 즉시 발송", message_variant: "가격 민감 대응" },
      { condition: "기업 이메일", action: "그룹 할인 안내", message_variant: "단체 등록 혜택" },
      { condition: "결제 단계 이탈", action: "대안 결제 수단 안내", message_variant: "결제 옵션 다양화" },
    ],
    recovery_metrics: {
      emails_sent: 1350,
      open_rate: 52,
      click_rate: 18,
      recovered: 95,
      recovery_rate: 21,
      revenue_recovered: 4750000,
    },
    optimization_suggestions: [
      { suggestion: "세션 저장 기능 추가", expected_impact: "이탈률 -15%" },
      { suggestion: "실시간 채팅 지원", expected_impact: "전환율 +10%" },
      { suggestion: "간편 결제 옵션 확대", expected_impact: "결제 이탈 -20%" },
      { suggestion: "모바일 폼 최적화", expected_impact: "모바일 전환 +25%" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-039";
export const taskName = "장바구니 이탈 복구";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.5.c";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.5: Lead Management";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
