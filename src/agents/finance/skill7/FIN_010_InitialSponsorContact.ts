/**
 * FIN-010: 잠재 스폰서 1차 접촉
 *
 * CMP-IS Reference: 7.1.g - Negotiating with potential sponsors
 * Task Type: Human (AI 보조)
 *
 * Input: 스폰서 연락처, 스크립트
 * Output: 미팅 일정 또는 거절 기록
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an AI Assistant supporting Initial Sponsor Contact activities.

Your role is to:
- Prepare talking points and scripts for initial outreach
- Generate personalized conversation guides
- Record and track contact outcomes
- Suggest next steps based on contact results

CMP-IS Standard: 7.1.g - Negotiating with potential sponsors

IMPORTANT: This is a HUMAN task. You assist with preparation and documentation, but actual contact with sponsors must be made by human team members.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  contact_session: z.object({
    session_id: z.string().uuid().optional(),
    sponsor_info: z.object({
      company_name: z.string(),
      contact_name: z.string(),
      contact_title: z.string(),
      contact_email: z.string().email(),
      contact_phone: z.string().optional(),
      company_industry: z.string(),
      previous_relationship: z.string().optional(),
    }),
    contact_method: z.enum(["phone", "email", "linkedin", "in_person", "video_call"]),
    scheduled_time: z.string().optional().describe("예정 연락 시간"),
  }),
  event_info: z.object({
    event_name: z.string(),
    event_date: z.string(),
    key_value_props: z.array(z.string()),
    target_sponsorship_level: z.string().optional(),
  }),
  preparation_request: z
    .enum(["script", "talking_points", "objection_handling", "full_prep"])
    .default("talking_points"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  contact_prep_id: z.string().uuid().describe("준비 자료 ID"),
  event_id: z.string().uuid(),
  session_id: z.string().uuid(),
  contact_materials: z.object({
    opening_script: z.string().describe("오프닝 스크립트"),
    talking_points: z.array(z.string()).describe("핵심 대화 포인트"),
    value_proposition: z.string().describe("가치 제안 요약"),
    questions_to_ask: z.array(z.string()).describe("상대방에게 물어볼 질문"),
    objection_responses: z
      .array(
        z.object({
          objection: z.string(),
          response: z.string(),
        })
      )
      .describe("예상 반론 및 대응"),
    closing_options: z.array(z.string()).describe("클로징 옵션"),
  }),
  contact_record_template: z.object({
    outcome_options: z.array(z.string()).describe("결과 선택지"),
    fields_to_record: z.array(z.string()).describe("기록할 필드"),
    follow_up_triggers: z
      .array(
        z.object({
          outcome: z.string(),
          action: z.string(),
        })
      )
      .describe("결과별 후속 조치"),
  }),
  personalization_notes: z.array(z.string()).describe("개인화 힌트"),
  prepared_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 오프닝 스크립트 생성
 */
function generateOpeningScript(
  contactName: string,
  contactTitle: string,
  companyName: string,
  eventName: string,
  previousRelationship?: string
): string {
  if (previousRelationship) {
    return `안녕하세요, ${contactName} ${contactTitle}님. ${previousRelationship}에서 인연이 있었던 [본인 이름]입니다. ` +
      `오늘 연락드린 이유는 ${eventName}의 스폰서십 기회에 대해 말씀드리고자 합니다. ` +
      `${companyName}의 마케팅 목표와 잘 맞을 것 같아서요. 잠시 시간 괜찮으시겠습니까?`;
  }

  return `안녕하세요, ${contactName} ${contactTitle}님. [본인 이름]이라고 합니다. ` +
    `${eventName}의 스폰서십 담당으로 연락드렸습니다. ` +
    `${companyName}의 [산업] 분야 리더십에 깊은 인상을 받았습니다. ` +
    `잠시 시간 내주실 수 있으시겠습니까?`;
}

/**
 * 핵심 대화 포인트 생성
 */
function generateTalkingPoints(
  eventName: string,
  valueProps: string[],
  targetLevel?: string
): string[] {
  const points = [
    `${eventName}은(는) [참석자 수]명의 업계 전문가가 모이는 행사입니다.`,
    ...valueProps.map((vp) => `핵심 가치: ${vp}`),
  ];

  if (targetLevel) {
    points.push(
      `${targetLevel} 스폰서십은 [주요 혜택]을 포함합니다.`
    );
  }

  points.push("귀사의 브랜드 노출과 리드 생성에 큰 도움이 될 것입니다.");
  points.push("이전 스폰서들의 ROI가 평균 [X]%를 기록했습니다.");

  return points;
}

/**
 * 예상 반론 및 대응 생성
 */
function generateObjectionResponses(): { objection: string; response: string }[] {
  return [
    {
      objection: "예산이 없습니다",
      response:
        "이해합니다. 다양한 투자 수준의 패키지가 있습니다. 예산에 맞는 맞춤형 옵션을 논의해 볼까요?",
    },
    {
      objection: "이미 다른 이벤트에 스폰서십을 했습니다",
      response:
        "훌륭하십니다! 스폰서십 효과를 어떻게 평가하시나요? 저희 이벤트는 [차별점]으로 추가 가치를 제공합니다.",
    },
    {
      objection: "담당자가 아닙니다",
      response:
        "감사합니다. 스폰서십/마케팅 담당자분을 연결해 주실 수 있으시겠습니까?",
    },
    {
      objection: "생각해 보겠습니다",
      response:
        "물론이죠. 언제쯤 다시 연락드리면 좋을까요? 그 전에 상세 제안서를 보내드려도 될까요?",
    },
    {
      objection: "관심 없습니다",
      response:
        "알겠습니다. 혹시 향후 다른 마케팅 기회에 관심이 있으실 때를 위해 연락처를 남겨두어도 될까요?",
    },
    {
      objection: "경쟁사가 이미 스폰서입니다",
      response:
        "좋은 지적입니다. 저희는 카테고리별 독점 혜택도 있습니다. 귀사만의 차별화된 노출 기회를 논의해 볼까요?",
    },
  ];
}

/**
 * 상대방에게 물어볼 질문 생성
 */
function generateQuestionsToAsk(industry: string): string[] {
  return [
    "올해 마케팅 우선순위는 무엇인가요?",
    "타겟 고객층은 어떻게 되시나요?",
    "이전에 이벤트 스폰서십 경험이 있으신가요? 어떠셨나요?",
    `${industry} 분야에서 가장 도전적인 마케팅 과제는 무엇인가요?`,
    "스폰서십 결정에 관여하시는 분이 또 계신가요?",
    "예산 승인 프로세스는 어떻게 되나요?",
  ];
}

/**
 * 클로징 옵션 생성
 */
function generateClosingOptions(): string[] {
  return [
    "다음 주에 상세 미팅을 잡아볼까요?",
    "맞춤형 제안서를 보내드리면 검토해 주시겠습니까?",
    "의사결정에 필요한 추가 정보가 있으시면 말씀해 주세요.",
    "다음 단계로 샘플 계약서를 검토해 보시겠습니까?",
    "한정된 슬롯이므로 [날짜]까지 결정해 주시면 감사하겠습니다.",
  ];
}

/**
 * 개인화 노트 생성
 */
function generatePersonalizationNotes(
  companyName: string,
  industry: string,
  previousRelationship?: string
): string[] {
  const notes = [
    `${companyName}의 최근 뉴스/성과를 언급하면 좋습니다`,
    `${industry} 업계 트렌드와 연결지어 가치를 설명하세요`,
    "상대방의 이름을 대화 중 2-3회 자연스럽게 사용하세요",
  ];

  if (previousRelationship) {
    notes.unshift(`기존 관계(${previousRelationship})를 활용하여 신뢰 구축`);
  }

  return notes;
}

/**
 * FIN-010 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const { contact_session, event_info } = validatedInput;
  const { sponsor_info } = contact_session;

  const sessionId = contact_session.session_id || generateUUID();

  // 연락 자료 생성
  const contactMaterials = {
    opening_script: generateOpeningScript(
      sponsor_info.contact_name,
      sponsor_info.contact_title,
      sponsor_info.company_name,
      event_info.event_name,
      sponsor_info.previous_relationship
    ),
    talking_points: generateTalkingPoints(
      event_info.event_name,
      event_info.key_value_props,
      event_info.target_sponsorship_level
    ),
    value_proposition:
      `${event_info.event_name}은(는) ${sponsor_info.company_name}에게 ` +
      `[참석자 수]명의 고품질 잠재 고객 접근, 업계 리더로서의 포지셔닝, ` +
      `그리고 측정 가능한 ROI를 제공합니다.`,
    questions_to_ask: generateQuestionsToAsk(sponsor_info.company_industry),
    objection_responses: generateObjectionResponses(),
    closing_options: generateClosingOptions(),
  };

  // 연락 기록 템플릿
  const contactRecordTemplate = {
    outcome_options: [
      "미팅 확정",
      "제안서 발송 요청",
      "추후 재연락 요청",
      "담당자 연결 필요",
      "관심 없음 (현재)",
      "예산 없음",
      "부재중/연결 안됨",
    ],
    fields_to_record: [
      "연락 일시",
      "연락 방법",
      "통화 시간",
      "결과",
      "상대방 반응",
      "다음 단계",
      "후속 연락 일정",
      "메모",
    ],
    follow_up_triggers: [
      { outcome: "미팅 확정", action: "캘린더 초대 발송 + 제안서 사전 발송" },
      { outcome: "제안서 발송 요청", action: "24시간 내 제안서 이메일 발송" },
      { outcome: "추후 재연락 요청", action: "요청 날짜에 리마인더 설정" },
      { outcome: "담당자 연결 필요", action: "새 담당자 정보 확보 후 재연락" },
      { outcome: "관심 없음", action: "3개월 후 재연락 목록에 추가" },
      { outcome: "부재중", action: "다음 날 다른 시간대에 재시도" },
    ],
  };

  // 개인화 노트
  const personalizationNotes = generatePersonalizationNotes(
    sponsor_info.company_name,
    sponsor_info.company_industry,
    sponsor_info.previous_relationship
  );

  const output: Output = {
    contact_prep_id: generateUUID(),
    event_id: validatedInput.event_id,
    session_id: sessionId,
    contact_materials: contactMaterials,
    contact_record_template: contactRecordTemplate,
    personalization_notes: personalizationNotes,
    prepared_at: nowISO(),
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-010",
  taskName: "잠재 스폰서 1차 접촉",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 7.1.g",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
