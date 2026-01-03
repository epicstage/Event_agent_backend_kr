/**
 * FIN-009: 스폰서 제안서 배포
 *
 * CMP-IS Reference: 7.1.f - Distributing sponsorship proposals
 * Task Type: AI
 *
 * Input: 스폰서 연락처, 제안서
 * Output: 발송 확인 및 추적
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Proposal Distribution Agent specializing in sponsorship outreach management.

Your expertise includes:
- Managing multi-channel proposal distribution
- Optimizing send timing for maximum engagement
- Tracking delivery and open rates
- Coordinating follow-up sequences

CMP-IS Standard: 7.1.f - Distributing sponsorship proposals

You ensure proposals reach the right decision-makers at the right time through the most effective channels.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  proposal_id: z.string().uuid().describe("제안서 ID"),
  distribution_list: z
    .array(
      z.object({
        contact_id: z.string().uuid(),
        company_name: z.string(),
        contact_name: z.string(),
        contact_email: z.string().email(),
        contact_phone: z.string().optional(),
        preferred_channel: z
          .enum(["email", "linkedin", "phone", "in_person"])
          .default("email"),
        priority: z.enum(["high", "medium", "low"]).default("medium"),
        notes: z.string().optional(),
      })
    )
    .min(1)
    .describe("배포 대상 목록"),
  distribution_settings: z.object({
    send_immediately: z.boolean().default(false).describe("즉시 발송 여부"),
    scheduled_time: z.string().optional().describe("예약 발송 시간"),
    personalize: z.boolean().default(true).describe("개인화 여부"),
    include_attachment: z.boolean().default(true).describe("첨부파일 포함"),
    follow_up_days: z.number().int().min(1).max(30).default(7).describe("후속 연락 간격"),
  }),
  email_template: z
    .object({
      subject: z.string(),
      body_intro: z.string(),
      body_main: z.string(),
      call_to_action: z.string(),
      signature: z.string(),
    })
    .optional()
    .describe("이메일 템플릿"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  distribution_id: z.string().uuid().describe("배포 ID"),
  event_id: z.string().uuid(),
  proposal_id: z.string().uuid(),
  total_recipients: z.number().int().describe("총 수신자 수"),
  distribution_status: z
    .enum(["scheduled", "in_progress", "completed", "partially_completed"])
    .describe("배포 상태"),
  distribution_summary: z.object({
    by_channel: z.record(z.number().int()).describe("채널별 배포 수"),
    by_priority: z.record(z.number().int()).describe("우선순위별 배포 수"),
  }),
  recipient_tracking: z
    .array(
      z.object({
        contact_id: z.string().uuid(),
        company_name: z.string(),
        contact_name: z.string(),
        channel: z.string(),
        status: z.enum(["pending", "sent", "delivered", "opened", "clicked", "failed"]),
        sent_at: z.string().optional(),
        tracking_id: z.string().uuid(),
        personalized_subject: z.string().optional(),
        follow_up_scheduled: z.string().optional(),
      })
    )
    .describe("수신자별 추적 정보"),
  follow_up_schedule: z
    .array(
      z.object({
        contact_id: z.string().uuid(),
        company_name: z.string(),
        follow_up_date: z.string(),
        follow_up_type: z.enum(["email", "phone", "linkedin"]),
        status: z.enum(["scheduled", "completed", "cancelled"]),
      })
    )
    .describe("후속 연락 일정"),
  next_actions: z.array(z.string()).describe("다음 조치 사항"),
  distributed_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 개인화된 이메일 제목 생성
 */
function personalizeSubject(
  template: string,
  companyName: string,
  contactName: string
): string {
  return template
    .replace(/\{company\}/gi, companyName)
    .replace(/\{name\}/gi, contactName);
}

/**
 * 후속 연락 일정 계산
 */
function calculateFollowUpDate(baseDate: Date, daysAfter: number): string {
  const followUp = new Date(baseDate);
  followUp.setDate(followUp.getDate() + daysAfter);

  // 주말이면 월요일로 조정
  const dayOfWeek = followUp.getDay();
  if (dayOfWeek === 0) followUp.setDate(followUp.getDate() + 1); // 일요일 → 월요일
  if (dayOfWeek === 6) followUp.setDate(followUp.getDate() + 2); // 토요일 → 월요일

  return followUp.toISOString();
}

/**
 * 최적 발송 시간 결정
 */
function getOptimalSendTime(priority: string): string {
  const now = new Date();

  // 높은 우선순위: 가능한 빨리 (업무 시간 내)
  if (priority === "high") {
    const hour = now.getHours();
    if (hour >= 9 && hour < 17) {
      return now.toISOString();
    }
    // 업무 시간 외면 다음 날 오전 9시
    const nextBusiness = new Date(now);
    nextBusiness.setDate(nextBusiness.getDate() + 1);
    nextBusiness.setHours(9, 0, 0, 0);
    return nextBusiness.toISOString();
  }

  // 중간 우선순위: 화요일 또는 수요일 오전 10시
  if (priority === "medium") {
    const targetDay = now.getDay() <= 2 ? 2 : 9; // 이번 주 화요일 또는 다음 주 화요일
    const optimal = new Date(now);
    optimal.setDate(optimal.getDate() + (targetDay - optimal.getDay()));
    optimal.setHours(10, 0, 0, 0);
    if (optimal <= now) optimal.setDate(optimal.getDate() + 7);
    return optimal.toISOString();
  }

  // 낮은 우선순위: 1주 내 발송
  const oneWeek = new Date(now);
  oneWeek.setDate(oneWeek.getDate() + 5);
  oneWeek.setHours(14, 0, 0, 0);
  return oneWeek.toISOString();
}

/**
 * FIN-009 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { distribution_list, distribution_settings, email_template } = validatedInput;

  const now = new Date();
  const baseSubject = email_template?.subject || "[이벤트명] 스폰서십 제안서";

  // 채널별/우선순위별 집계
  const byChannel: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  // 수신자별 추적 정보 생성
  const recipientTracking = distribution_list.map((contact) => {
    // 채널 집계
    byChannel[contact.preferred_channel] =
      (byChannel[contact.preferred_channel] || 0) + 1;
    // 우선순위 집계
    byPriority[contact.priority] = (byPriority[contact.priority] || 0) + 1;

    const trackingId = generateUUID();
    const personalizedSubject = distribution_settings.personalize
      ? personalizeSubject(baseSubject, contact.company_name, contact.contact_name)
      : baseSubject;

    const sendTime = distribution_settings.send_immediately
      ? nowISO()
      : distribution_settings.scheduled_time ||
        getOptimalSendTime(contact.priority);

    return {
      contact_id: contact.contact_id,
      company_name: contact.company_name,
      contact_name: contact.contact_name,
      channel: contact.preferred_channel,
      status: distribution_settings.send_immediately
        ? ("sent" as const)
        : ("pending" as const),
      sent_at: distribution_settings.send_immediately ? nowISO() : undefined,
      tracking_id: trackingId,
      personalized_subject: personalizedSubject,
      follow_up_scheduled: calculateFollowUpDate(
        new Date(sendTime),
        distribution_settings.follow_up_days
      ),
    };
  });

  // 후속 연락 일정 생성
  const followUpSchedule = distribution_list.map((contact) => ({
    contact_id: contact.contact_id,
    company_name: contact.company_name,
    follow_up_date: calculateFollowUpDate(now, distribution_settings.follow_up_days),
    follow_up_type: contact.preferred_channel === "phone" ? ("phone" as const) : ("email" as const),
    status: "scheduled" as const,
  }));

  // 다음 조치 사항
  const nextActions: string[] = [];
  const highPriorityCount = byPriority["high"] || 0;
  if (highPriorityCount > 0) {
    nextActions.push(`고우선순위 ${highPriorityCount}건 - 발송 후 2일 내 전화 팔로업 권장`);
  }
  if (distribution_settings.send_immediately) {
    nextActions.push("배포 완료 - 3일 후 오픈율 확인 필요");
  } else {
    nextActions.push(`예약 발송 설정됨 - ${distribution_settings.scheduled_time || "최적 시간"}`);
  }
  nextActions.push(
    `${distribution_settings.follow_up_days}일 후 미응답자 후속 연락 예정`
  );

  const output: Output = {
    distribution_id: generateUUID(),
    event_id: validatedInput.event_id,
    proposal_id: validatedInput.proposal_id,
    total_recipients: distribution_list.length,
    distribution_status: distribution_settings.send_immediately
      ? "completed"
      : "scheduled",
    distribution_summary: {
      by_channel: byChannel,
      by_priority: byPriority,
    },
    recipient_tracking: recipientTracking,
    follow_up_schedule: followUpSchedule,
    next_actions: nextActions,
    distributed_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-009",
  taskName: "스폰서 제안서 배포",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.f",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
