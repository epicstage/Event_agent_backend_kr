/**
 * FIN-014: 스폰서 관계 유지 (정기 업데이트)
 *
 * CMP-IS Reference: 7.1.j - Maintaining sponsor relationships
 * Task Type: Hybrid (AI 콘텐츠 + Human 전달)
 *
 * Input: 이벤트 진행 상황
 * Output: 스폰서 뉴스레터/리포트
 */

import { z } from "zod";
import {
  SponsorshipTier,
  CurrencyCode,
  generateUUID,
  nowISO,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an AI Assistant for Sponsor Relationship Maintenance.

Your role is to:
- Generate regular progress updates and reports for sponsors
- Create engaging newsletter content
- Track sponsor engagement metrics
- Suggest proactive communication opportunities

CMP-IS Standard: 7.1.j - Maintaining sponsor relationships

IMPORTANT: This is a HYBRID task. You generate content, but delivery and personal touchpoints should be handled by human team members.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  sponsor_info: z.object({
    sponsor_id: z.string().uuid(),
    company_name: z.string(),
    contact_name: z.string(),
    tier: SponsorshipTier,
    contracted_benefits: z.array(z.string()),
  }),
  event_progress: z.object({
    event_name: z.string(),
    event_date: z.string(),
    days_until_event: z.number().int(),
    registration_count: z.number().int(),
    registration_target: z.number().int(),
    confirmed_speakers: z.number().int(),
    marketing_reach: z.number().int().optional().describe("마케팅 도달 수"),
    media_mentions: z.number().int().optional().describe("미디어 언급 수"),
    milestones_completed: z.array(z.string()),
    upcoming_milestones: z.array(z.string()),
  }),
  sponsor_specific_updates: z
    .array(
      z.object({
        benefit_name: z.string(),
        status: z.enum(["not_started", "in_progress", "completed"]),
        details: z.string().optional(),
      })
    )
    .optional()
    .describe("스폰서별 혜택 진행 상황"),
  update_type: z.enum(["newsletter", "progress_report", "milestone_update", "custom"]),
  custom_message: z.string().optional().describe("추가 메시지"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  update_id: z.string().uuid().describe("업데이트 ID"),
  event_id: z.string().uuid(),
  sponsor_id: z.string().uuid(),
  update_content: z.object({
    subject_line: z.string().describe("제목"),
    greeting: z.string().describe("인사말"),
    executive_summary: z.string().describe("요약"),
    progress_section: z.object({
      headline: z.string(),
      key_metrics: z.array(z.object({ label: z.string(), value: z.string() })),
      narrative: z.string(),
    }),
    sponsor_benefits_section: z.object({
      headline: z.string(),
      updates: z.array(
        z.object({
          benefit: z.string(),
          status: z.string(),
          details: z.string(),
        })
      ),
    }),
    upcoming_section: z.object({
      headline: z.string(),
      items: z.array(z.string()),
    }),
    call_to_action: z.string().describe("행동 유도"),
    closing: z.string().describe("마무리"),
  }),
  delivery_recommendation: z.object({
    best_send_time: z.string(),
    channel: z.enum(["email", "report_portal", "meeting"]),
    follow_up_needed: z.boolean(),
    follow_up_reason: z.string().optional(),
  }),
  engagement_score: z.number().min(0).max(100).describe("예상 참여도"),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 제목 생성
 */
function generateSubjectLine(
  eventName: string,
  updateType: string,
  daysUntil: number
): string {
  const subjects: Record<string, string> = {
    newsletter: `[${eventName}] D-${daysUntil} 스폰서 뉴스레터`,
    progress_report: `[${eventName}] 진행 상황 리포트 - D-${daysUntil}`,
    milestone_update: `[${eventName}] 주요 마일스톤 달성 소식`,
    custom: `[${eventName}] 스폰서 파트너 업데이트`,
  };
  return subjects[updateType] || subjects.custom;
}

/**
 * 인사말 생성
 */
function generateGreeting(contactName: string, tier: string): string {
  const tierGreetings: Record<string, string> = {
    title: "존경하는",
    platinum: "존경하는",
    gold: "안녕하세요,",
    silver: "안녕하세요,",
    bronze: "안녕하세요,",
    media: "안녕하세요,",
    in_kind: "안녕하세요,",
  };
  return `${tierGreetings[tier] || "안녕하세요,"} ${contactName}님`;
}

/**
 * 요약 생성
 */
function generateSummary(
  eventName: string,
  daysUntil: number,
  registrationRate: number,
  tier: string
): string {
  let summary = `${eventName}이(가) D-${daysUntil}로 다가왔습니다. `;

  if (registrationRate >= 100) {
    summary += "등록이 목표를 초과 달성하여 큰 성공을 예감하고 있습니다. ";
  } else if (registrationRate >= 80) {
    summary += `현재 등록률 ${registrationRate}%로 순조롭게 진행 중입니다. `;
  } else if (registrationRate >= 50) {
    summary += `등록률 ${registrationRate}%로 목표 달성을 향해 나아가고 있습니다. `;
  } else {
    summary += "등록 촉진을 위한 마케팅을 강화하고 있습니다. ";
  }

  summary += `${tier} 스폰서로서 귀사의 참여가 이벤트의 성공에 큰 힘이 되고 있습니다.`;

  return summary;
}

/**
 * 주요 메트릭 생성
 */
function generateKeyMetrics(
  progress: z.infer<typeof InputSchema>["event_progress"]
): { label: string; value: string }[] {
  const registrationRate = Math.round(
    (progress.registration_count / progress.registration_target) * 100
  );

  const metrics = [
    { label: "D-Day", value: `${progress.days_until_event}일` },
    {
      label: "등록 현황",
      value: `${progress.registration_count.toLocaleString()}명 (${registrationRate}%)`,
    },
    { label: "확정 연사", value: `${progress.confirmed_speakers}명` },
  ];

  if (progress.marketing_reach) {
    metrics.push({
      label: "마케팅 도달",
      value: `${progress.marketing_reach.toLocaleString()}회`,
    });
  }

  if (progress.media_mentions) {
    metrics.push({
      label: "미디어 노출",
      value: `${progress.media_mentions}건`,
    });
  }

  return metrics;
}

/**
 * 진행 상황 내러티브 생성
 */
function generateProgressNarrative(
  progress: z.infer<typeof InputSchema>["event_progress"]
): string {
  let narrative = "";

  if (progress.milestones_completed.length > 0) {
    narrative += `최근 주요 성과로는 ${progress.milestones_completed.slice(-2).join(", ")}이(가) 있습니다. `;
  }

  const registrationRate = Math.round(
    (progress.registration_count / progress.registration_target) * 100
  );

  if (registrationRate >= 80) {
    narrative += "참석자들의 높은 관심 속에 이벤트 준비가 순조롭게 진행되고 있습니다. ";
  }

  if (progress.confirmed_speakers >= 10) {
    narrative += `${progress.confirmed_speakers}명의 우수한 연사진이 확정되어 풍성한 프로그램을 기대하셔도 좋습니다. `;
  }

  return narrative || "이벤트 준비가 계획대로 진행 중입니다.";
}

/**
 * 혜택 상태 텍스트 변환
 */
function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    not_started: "준비 예정",
    in_progress: "진행 중",
    completed: "완료",
  };
  return statusTexts[status] || status;
}

/**
 * 행동 유도 생성
 */
function generateCTA(
  daysUntil: number,
  updateType: string,
  tier: string
): string {
  if (daysUntil <= 7) {
    return "이벤트 당일 최종 점검 미팅을 잡아주시면 감사하겠습니다. 현장에서 뵙겠습니다!";
  }

  if (daysUntil <= 30) {
    return "부스 셋업이나 자료 준비에 관해 추가 조율이 필요하시면 언제든 연락 주세요.";
  }

  if (tier === "title" || tier === "platinum") {
    return "귀사의 VIP 고객 초대 리스트를 공유해 주시면 특별 환대 프로그램을 준비하겠습니다.";
  }

  return "추가 문의사항이나 요청사항이 있으시면 언제든 말씀해 주세요.";
}

/**
 * 발송 시간 추천
 */
function recommendSendTime(daysUntil: number, tier: string): string {
  // 화요일 또는 수요일 오전이 최적
  const now = new Date();
  const dayOfWeek = now.getDay();

  // 다음 화요일 10시
  let targetDay = 2; // Tuesday
  if (dayOfWeek >= 2) targetDay = 9; // Next Tuesday

  const sendDate = new Date(now);
  sendDate.setDate(sendDate.getDate() + (targetDay - dayOfWeek));
  sendDate.setHours(10, 0, 0, 0);

  return sendDate.toISOString();
}

/**
 * FIN-014 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { sponsor_info, event_progress, sponsor_specific_updates, update_type } =
    validatedInput;

  const registrationRate = Math.round(
    (event_progress.registration_count / event_progress.registration_target) * 100
  );

  // 혜택 업데이트 섹션
  const benefitUpdates =
    sponsor_specific_updates?.map((u) => ({
      benefit: u.benefit_name,
      status: getStatusText(u.status),
      details: u.details || "상세 내용은 별도 안내 예정",
    })) ||
    sponsor_info.contracted_benefits.map((b) => ({
      benefit: b,
      status: "준비 중",
      details: "이벤트 준비에 따라 순차적으로 진행됩니다",
    }));

  // 업데이트 콘텐츠 생성
  const updateContent = {
    subject_line: generateSubjectLine(
      event_progress.event_name,
      update_type,
      event_progress.days_until_event
    ),
    greeting: generateGreeting(sponsor_info.contact_name, sponsor_info.tier),
    executive_summary: generateSummary(
      event_progress.event_name,
      event_progress.days_until_event,
      registrationRate,
      sponsor_info.tier
    ),
    progress_section: {
      headline: "이벤트 진행 현황",
      key_metrics: generateKeyMetrics(event_progress),
      narrative: generateProgressNarrative(event_progress),
    },
    sponsor_benefits_section: {
      headline: "귀사 혜택 준비 현황",
      updates: benefitUpdates,
    },
    upcoming_section: {
      headline: "향후 일정",
      items:
        event_progress.upcoming_milestones.length > 0
          ? event_progress.upcoming_milestones
          : ["상세 일정은 추후 안내 예정입니다"],
    },
    call_to_action: generateCTA(
      event_progress.days_until_event,
      update_type,
      sponsor_info.tier
    ),
    closing: `${event_progress.event_name}의 성공적인 개최를 위해 최선을 다하겠습니다.\n감사합니다.\n\n[담당자명]\n[연락처]`,
  };

  // 전달 권장 사항
  const deliveryRecommendation = {
    best_send_time: recommendSendTime(
      event_progress.days_until_event,
      sponsor_info.tier
    ),
    channel:
      sponsor_info.tier === "title" || sponsor_info.tier === "platinum"
        ? ("meeting" as const)
        : ("email" as const),
    follow_up_needed: event_progress.days_until_event <= 14,
    follow_up_reason:
      event_progress.days_until_event <= 14
        ? "이벤트 임박 - 최종 조율 필요"
        : undefined,
  };

  // 예상 참여도 점수
  let engagementScore = 60; // 기준
  if (sponsor_info.tier === "title" || sponsor_info.tier === "platinum")
    engagementScore += 15;
  if (event_progress.days_until_event <= 30) engagementScore += 10;
  if (registrationRate >= 80) engagementScore += 10;
  if (validatedInput.custom_message) engagementScore += 5;

  const output: Output = {
    update_id: generateUUID(),
    event_id: validatedInput.event_id,
    sponsor_id: sponsor_info.sponsor_id,
    update_content: updateContent,
    delivery_recommendation: deliveryRecommendation,
    engagement_score: Math.min(engagementScore, 100),
    generated_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-014",
  taskName: "스폰서 관계 유지",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 7.1.j",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
