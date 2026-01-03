/**
 * STR-018: 이해관계자 커뮤니케이션 계획
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Communication Planning)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Communication Planning Agent.

Your expertise includes:
- Multi-stakeholder communication strategy
- Channel optimization and message tailoring
- Communication calendar development
- Crisis communication preparation

CMP-IS Standard: Domain A - Strategic Planning (Communication Planning)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  stakeholder_groups: z.array(z.object({
    group: z.string(),
    members: z.number(),
    priority: z.enum(["high", "medium", "low"]),
    preferred_channels: z.array(z.string()),
    information_needs: z.array(z.string()),
  })),
  key_milestones: z.array(z.object({
    milestone: z.string(),
    date: z.string(),
  })),
  available_channels: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  communication_matrix: z.array(z.object({
    stakeholder_group: z.string(),
    primary_channel: z.string(),
    secondary_channel: z.string(),
    message_frequency: z.string(),
    key_messages: z.array(z.string()),
    sender: z.string(),
    feedback_mechanism: z.string(),
  })),
  content_calendar: z.array(z.object({
    date: z.string(),
    milestone: z.string(),
    communications: z.array(z.object({
      target_group: z.string(),
      message_type: z.string(),
      channel: z.string(),
      content_summary: z.string(),
    })),
  })),
  message_templates: z.array(z.object({
    template_id: z.string(),
    name: z.string(),
    purpose: z.string(),
    audience: z.string(),
    key_elements: z.array(z.string()),
  })),
  crisis_protocol: z.object({
    trigger_events: z.array(z.string()),
    response_team: z.array(z.string()),
    communication_sequence: z.array(z.string()),
    holding_statements: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-018",
  taskName: "Communication Planning",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자별 커뮤니케이션 계획을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const matrix = validated.stakeholder_groups.map(g => ({
    stakeholder_group: g.group,
    primary_channel: g.preferred_channels[0] || "이메일",
    secondary_channel: g.preferred_channels[1] || "전화",
    message_frequency: g.priority === "high" ? "주 1회" : g.priority === "medium" ? "격주" : "월 1회",
    key_messages: g.information_needs.slice(0, 3),
    sender: g.priority === "high" ? "프로젝트 디렉터" : "프로젝트 매니저",
    feedback_mechanism: g.priority === "high" ? "직접 미팅/화상회의" : "이메일 회신",
  }));

  const calendar = validated.key_milestones.map(m => ({
    date: m.date,
    milestone: m.milestone,
    communications: validated.stakeholder_groups.map(g => ({
      target_group: g.group,
      message_type: "마일스톤 업데이트",
      channel: g.preferred_channels[0] || "이메일",
      content_summary: `${m.milestone}에 대한 ${g.group} 대상 업데이트`,
    })),
  }));

  return {
    plan_id: generateUUID(),
    event_id: validated.event_id,
    communication_matrix: matrix,
    content_calendar: calendar,
    message_templates: [
      { template_id: "TPL-001", name: "정기 업데이트", purpose: "진행 상황 공유", audience: "전체", key_elements: ["진행률", "주요 성과", "다음 단계"] },
      { template_id: "TPL-002", name: "마일스톤 공지", purpose: "중요 이정표 달성", audience: "전체", key_elements: ["달성 내용", "의미", "감사 인사"] },
      { template_id: "TPL-003", name: "긴급 공지", purpose: "변경/이슈 알림", audience: "영향받는 그룹", key_elements: ["상황 설명", "영향", "대응 방안", "연락처"] },
    ],
    crisis_protocol: {
      trigger_events: ["주요 일정 변경", "핵심 인력/벤더 이탈", "예산 초과 20%", "안전 사고"],
      response_team: ["프로젝트 디렉터", "커뮤니케이션 담당", "법무 담당"],
      communication_sequence: ["1. 내부 팀 긴급 브리핑", "2. 핵심 이해관계자 직접 연락", "3. 전체 공지", "4. 미디어 대응(필요시)"],
      holding_statements: ["현재 상황을 파악 중이며 추가 정보가 확인되는 대로 알려드리겠습니다.", "참가자 안전이 최우선이며 모든 필요한 조치를 취하고 있습니다."],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
