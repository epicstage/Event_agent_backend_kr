/**
 * STR-034: 리스크 커뮤니케이션
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Communication)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Communication Agent for event planning.

Your expertise includes:
- Stakeholder-appropriate risk messaging
- Crisis communication preparation
- Risk awareness campaigns
- Transparent risk disclosure strategies

CMP-IS Standard: Domain A - Strategic Planning (Risk Communication)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  communication_context: z.object({
    purpose: z.enum(["routine_update", "escalation", "crisis", "awareness", "closure"]),
    urgency: z.enum(["immediate", "urgent", "standard"]),
  }),
  target_audiences: z.array(z.object({
    audience: z.string(),
    role: z.string(),
    information_needs: z.array(z.string()),
    preferred_format: z.enum(["brief", "detailed", "visual"]).optional(),
    preferred_channel: z.string().optional(),
  })),
  risk_information: z.object({
    risks_to_communicate: z.array(z.object({
      risk_id: z.string(),
      risk_name: z.string(),
      severity: z.enum(["critical", "high", "medium", "low"]),
      status: z.string(),
      impact_on_audience: z.string().optional(),
    })),
    overall_status: z.string(),
    key_actions: z.array(z.string()).optional(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  communication_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  communication_strategy: z.object({
    key_messages: z.array(z.string()),
    tone: z.string(),
    transparency_level: z.enum(["full", "appropriate", "limited"]),
    timing_considerations: z.array(z.string()),
  }),
  audience_specific_communications: z.array(z.object({
    audience: z.string(),
    communication_package: z.object({
      headline: z.string(),
      key_points: z.array(z.string()),
      detailed_message: z.string(),
      call_to_action: z.string(),
      what_we_are_doing: z.array(z.string()),
      what_audience_should_do: z.array(z.string()),
    }),
    delivery: z.object({
      channel: z.string(),
      format: z.string(),
      timing: z.string(),
      sender: z.string(),
    }),
    follow_up: z.object({
      mechanism: z.string(),
      timeline: z.string(),
    }),
  })),
  qa_preparation: z.array(z.object({
    anticipated_question: z.string(),
    recommended_answer: z.string(),
    audience: z.string(),
    sensitive_points: z.array(z.string()).optional(),
  })),
  escalation_protocol: z.object({
    triggers: z.array(z.string()),
    escalation_chain: z.array(z.object({
      level: z.number(),
      recipient: z.string(),
      method: z.string(),
      timeframe: z.string(),
    })),
    holding_statements: z.array(z.string()),
  }),
  feedback_loop: z.object({
    collection_methods: z.array(z.string()),
    response_handling: z.string(),
    update_frequency: z.string(),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-034",
  taskName: "Risk Communication",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "이해관계자에게 리스크 정보를 효과적으로 전달하는 커뮤니케이션 계획을 수립합니다.",
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

  const { communication_context, target_audiences, risk_information, event_name } = validated;

  const tone = communication_context.purpose === "crisis" ? "긴급하고 명확한" :
    communication_context.purpose === "escalation" ? "진지하고 행동 지향적인" :
    "전문적이고 투명한";

  const transparencyLevel = communication_context.purpose === "crisis" ? "full" as const :
    communication_context.purpose === "routine_update" ? "appropriate" as const : "appropriate" as const;

  const audienceCommunications = target_audiences.map(audience => {
    const criticalRisks = risk_information.risks_to_communicate.filter(r => r.severity === "critical");
    const format = audience.preferred_format || "brief";

    return {
      audience: audience.audience,
      communication_package: {
        headline: communication_context.purpose === "crisis"
          ? `[긴급] ${event_name} 관련 중요 안내`
          : `${event_name} 리스크 현황 업데이트`,
        key_points: [
          `현재 상태: ${risk_information.overall_status}`,
          criticalRisks.length > 0 ? `주의 사항: ${criticalRisks.length}건의 중요 리스크` : "중요 리스크 없음",
          "대응 조치 진행 중",
        ],
        detailed_message: format === "detailed"
          ? `${audience.audience}님께,\n\n${event_name} 리스크 관리 현황을 공유드립니다.\n\n현재 ${risk_information.risks_to_communicate.length}건의 리스크가 모니터링되고 있으며, 그 중 ${criticalRisks.length}건이 집중 관리 대상입니다.\n\n${risk_information.key_actions?.join("\n") || "완화 조치가 진행 중입니다."}\n\n추가 문의 사항이 있으시면 연락 주시기 바랍니다.`
          : `${event_name} 리스크 현황: ${risk_information.overall_status}. ${criticalRisks.length > 0 ? "일부 리스크에 대한 관리 강화 중." : "정상 관리 중."}`,
        call_to_action: communication_context.urgency === "immediate"
          ? "즉시 확인 및 대응 요청"
          : "내용 확인 후 질문 사항 회신 요청",
        what_we_are_doing: risk_information.key_actions || ["리스크 모니터링 강화", "완화 조치 실행 중", "상황 업데이트 예정"],
        what_audience_should_do: audience.information_needs.includes("action_required")
          ? ["본 내용 검토", "담당 영역 점검", "이슈 발생 시 즉시 보고"]
          : ["내용 숙지", "필요 시 문의"],
      },
      delivery: {
        channel: audience.preferred_channel || "이메일",
        format: format === "visual" ? "인포그래픽 첨부 이메일" : format === "detailed" ? "상세 보고서" : "요약 메시지",
        timing: communication_context.urgency === "immediate" ? "즉시" : communication_context.urgency === "urgent" ? "2시간 내" : "금일 중",
        sender: communication_context.purpose === "crisis" ? "총괄 책임자" : "리스크 담당자",
      },
      follow_up: {
        mechanism: "회신 이메일 또는 미팅 요청",
        timeline: communication_context.urgency === "immediate" ? "24시간 내" : "1주일 내",
      },
    };
  });

  return {
    communication_plan_id: generateUUID(),
    event_id: validated.event_id,
    communication_strategy: {
      key_messages: [
        "리스크 상황을 투명하게 공유합니다",
        "적극적인 관리 조치가 진행 중입니다",
        "이해관계자의 협조가 필요합니다",
      ],
      tone,
      transparency_level: transparencyLevel,
      timing_considerations: [
        "핵심 이해관계자 우선 통보",
        "언론/외부 노출 전 내부 공유",
        "근무 시간 고려 (긴급 시 제외)",
      ],
    },
    audience_specific_communications: audienceCommunications,
    qa_preparation: [
      {
        anticipated_question: "리스크의 영향 범위는 어느 정도인가요?",
        recommended_answer: "현재 파악된 영향 범위를 설명하고, 완화 조치를 통해 영향을 최소화하고 있음을 강조합니다.",
        audience: "경영진",
        sensitive_points: ["재정적 영향 수치는 확정 전 공개 주의"],
      },
      {
        anticipated_question: "언제 해결될 예정인가요?",
        recommended_answer: "구체적 일정은 상황에 따라 달라질 수 있으나, 현재 계획과 진행 상황을 공유합니다.",
        audience: "전체",
      },
      {
        anticipated_question: "참가자/고객에게 영향이 있나요?",
        recommended_answer: "현재 영향을 최소화하기 위한 조치를 취하고 있으며, 필요 시 적시에 안내드리겠습니다.",
        audience: "운영팀",
      },
    ],
    escalation_protocol: {
      triggers: [
        "Critical 리스크 신규 발생",
        "기존 리스크 심각도 상승",
        "미디어 노출 또는 문의",
        "이해관계자 불만 접수",
      ],
      escalation_chain: [
        { level: 1, recipient: "리스크 담당자", method: "메신저/전화", timeframe: "즉시" },
        { level: 2, recipient: "운영 총괄", method: "전화", timeframe: "15분 내" },
        { level: 3, recipient: "경영진", method: "전화 + 이메일", timeframe: "30분 내" },
      ],
      holding_statements: [
        "현재 상황을 파악 중이며, 확인 후 추가 안내드리겠습니다.",
        "이해관계자의 안전과 이익을 최우선으로 대응하고 있습니다.",
        "투명하게 정보를 공유하겠습니다. 잠시만 기다려 주시기 바랍니다.",
      ],
    },
    feedback_loop: {
      collection_methods: ["이메일 회신", "전화 문의", "설문조사"],
      response_handling: "24시간 내 1차 응답, 상세 답변은 48시간 내",
      update_frequency: communication_context.purpose === "crisis" ? "4시간마다" : "일 1회 또는 변동 시",
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
