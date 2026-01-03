/**
 * HR-036: Staff Communication Dispatch
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 스태프 커뮤니케이션 발송 관리
 */

import { z } from "zod";

export const HR_036_InputSchema = z.object({
  event_id: z.string().uuid(),
  communication_type: z.enum([
    "recruitment",
    "schedule_update",
    "reminder",
    "emergency",
    "feedback_request",
    "thank_you",
    "general",
  ]),
  recipients: z.object({
    target_group: z.enum(["all", "department", "role", "individual", "custom"]),
    filter: z.object({
      departments: z.array(z.string()).optional(),
      roles: z.array(z.string()).optional(),
      staff_ids: z.array(z.string()).optional(),
    }).optional(),
    total_count: z.number(),
  }),
  message: z.object({
    subject: z.string(),
    body: z.string(),
    attachments: z.array(z.string()).optional(),
  }),
  channels: z.array(z.enum(["sms", "email", "kakao", "app_push", "slack"])),
  scheduling: z.object({
    send_immediately: z.boolean(),
    scheduled_time: z.string().optional(),
    timezone: z.string().default("Asia/Seoul"),
  }),
});

export const HR_036_OutputSchema = z.object({
  event_id: z.string(),
  dispatch_id: z.string(),
  dispatch_status: z.object({
    status: z.enum(["sent", "scheduled", "failed", "partial"]),
    total_recipients: z.number(),
    successful: z.number(),
    failed: z.number(),
    pending: z.number(),
  }),
  channel_breakdown: z.array(z.object({
    channel: z.string(),
    sent: z.number(),
    delivered: z.number(),
    failed: z.number(),
    open_rate: z.number().optional(),
  })),
  message_preview: z.object({
    subject: z.string(),
    body_preview: z.string(),
    character_count: z.number(),
    estimated_cost: z.number(),
  }),
  scheduling_info: z.object({
    dispatched_at: z.string(),
    scheduled_for: z.string().optional(),
    timezone: z.string(),
  }),
  failed_deliveries: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    channel: z.string(),
    reason: z.string(),
    retry_scheduled: z.boolean(),
  })),
  follow_up_actions: z.array(z.object({
    action: z.string(),
    timing: z.string(),
    automated: z.boolean(),
  })),
  analytics_tracking: z.object({
    tracking_id: z.string(),
    metrics_available: z.array(z.string()),
    report_available_at: z.string(),
  }),
});

export type HR_036_Input = z.infer<typeof HR_036_InputSchema>;
export type HR_036_Output = z.infer<typeof HR_036_OutputSchema>;

const CHANNEL_COSTS: Record<string, number> = {
  sms: 20,
  email: 1,
  kakao: 15,
  app_push: 0,
  slack: 0,
};

export async function execute(input: HR_036_Input): Promise<HR_036_Output> {
  const dispatchId = `DISP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  // 발송 시뮬레이션
  const successRate = input.communication_type === "emergency" ? 0.98 : 0.95;
  const successful = Math.floor(input.recipients.total_count * successRate);
  const failed = input.recipients.total_count - successful;

  // 채널별 분석
  const channelBreakdown = input.channels.map((channel) => {
    const channelRecipients = Math.ceil(input.recipients.total_count / input.channels.length);
    const channelSuccessRate = channel === "app_push" ? 0.85 : channel === "email" ? 0.92 : 0.98;
    const sent = channelRecipients;
    const delivered = Math.floor(sent * channelSuccessRate);

    return {
      channel,
      sent,
      delivered,
      failed: sent - delivered,
      open_rate: channel === "email" ? 45 : channel === "app_push" ? 30 : undefined,
    };
  });

  // 비용 계산
  let estimatedCost = 0;
  for (const channel of input.channels) {
    const recipients = Math.ceil(input.recipients.total_count / input.channels.length);
    estimatedCost += recipients * CHANNEL_COSTS[channel];
  }

  // 실패 배달 시뮬레이션
  const failedDeliveries = [];
  if (failed > 0) {
    const reasons = [
      "잘못된 전화번호",
      "수신 거부",
      "이메일 주소 오류",
      "푸시 토큰 만료",
      "슬랙 연동 해제",
    ];

    for (let i = 0; i < Math.min(failed, 5); i++) {
      failedDeliveries.push({
        staff_id: `STAFF-${1000 + i}`,
        name: `스태프 ${i + 1}`,
        channel: input.channels[i % input.channels.length],
        reason: reasons[i % reasons.length],
        retry_scheduled: i < 3,
      });
    }
  }

  // 후속 조치
  const followUpActions = [];

  if (input.communication_type === "recruitment") {
    followUpActions.push({
      action: "미응답자 리마인더 발송",
      timing: "D+3",
      automated: true,
    });
  }

  if (input.communication_type === "schedule_update") {
    followUpActions.push({
      action: "확인 응답 수집",
      timing: "D+1",
      automated: true,
    });
  }

  followUpActions.push({
    action: "발송 결과 리포트 생성",
    timing: "D+1",
    automated: true,
  });

  if (failed > 0) {
    followUpActions.push({
      action: "실패 건 재발송",
      timing: "+1시간",
      automated: true,
    });
    followUpActions.push({
      action: "연락처 정보 업데이트 요청",
      timing: "D+2",
      automated: false,
    });
  }

  return {
    event_id: input.event_id,
    dispatch_id: dispatchId,
    dispatch_status: {
      status: input.scheduling.send_immediately
        ? (failed === 0 ? "sent" : "partial")
        : "scheduled",
      total_recipients: input.recipients.total_count,
      successful,
      failed,
      pending: input.scheduling.send_immediately ? 0 : input.recipients.total_count,
    },
    channel_breakdown: channelBreakdown,
    message_preview: {
      subject: input.message.subject,
      body_preview: input.message.body.substring(0, 100) + (input.message.body.length > 100 ? "..." : ""),
      character_count: input.message.body.length,
      estimated_cost: estimatedCost,
    },
    scheduling_info: {
      dispatched_at: input.scheduling.send_immediately ? now : "",
      scheduled_for: input.scheduling.scheduled_time,
      timezone: input.scheduling.timezone,
    },
    failed_deliveries: failedDeliveries,
    follow_up_actions: followUpActions,
    analytics_tracking: {
      tracking_id: dispatchId,
      metrics_available: [
        "delivery_rate",
        "open_rate",
        "click_rate",
        "response_rate",
        "opt_out_rate",
      ],
      report_available_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

export const HR_036_CommunicationDispatch = {
  id: "HR-036",
  name: "Staff Communication Dispatch",
  description: "스태프 커뮤니케이션 발송 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.21",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_036_InputSchema,
  outputSchema: HR_036_OutputSchema,
  persona: `당신은 커뮤니케이션 전문가입니다. 효과적인 메시지 전달로 스태프와의 원활한 소통을 보장합니다.`,
};

export default HR_036_CommunicationDispatch;
