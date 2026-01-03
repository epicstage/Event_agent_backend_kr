/**
 * HR-012: Staff Communication Plan
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 스태프 커뮤니케이션 계획
 */

import { z } from "zod";

export const HR_012_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  staff_count: z.number(),
  departments: z.array(z.string()),
  event_duration_days: z.number(),
  communication_preferences: z.array(z.enum(["app", "radio", "email", "sms", "slack", "kakao"])).default(["app", "radio", "kakao"]),
  multilingual: z.boolean().default(false),
  languages: z.array(z.string()).optional(),
});

export const HR_012_OutputSchema = z.object({
  event_id: z.string(),
  communication_strategy: z.object({
    objectives: z.array(z.string()),
    key_principles: z.array(z.string()),
    channels: z.array(z.object({
      channel: z.string(),
      purpose: z.string(),
      audience: z.string(),
      frequency: z.string(),
      owner: z.string(),
      tools: z.array(z.string()),
    })),
  }),
  pre_event_communication: z.array(z.object({
    timing: z.string(),
    message_type: z.string(),
    content_summary: z.string(),
    channel: z.string(),
    sender: z.string(),
  })),
  during_event_communication: z.object({
    regular_updates: z.array(z.object({
      timing: z.string(),
      type: z.string(),
      content: z.string(),
      channel: z.string(),
    })),
    emergency_protocol: z.object({
      trigger_conditions: z.array(z.string()),
      communication_chain: z.array(z.object({
        step: z.number(),
        action: z.string(),
        responsible: z.string(),
        timeframe: z.string(),
      })),
      code_words: z.array(z.object({
        code: z.string(),
        meaning: z.string(),
        action_required: z.string(),
      })),
    }),
  }),
  post_event_communication: z.array(z.object({
    timing: z.string(),
    message_type: z.string(),
    content: z.string(),
    channel: z.string(),
  })),
  feedback_system: z.object({
    during_event: z.array(z.object({
      method: z.string(),
      frequency: z.string(),
      responsible: z.string(),
    })),
    post_event: z.object({
      survey_timing: z.string(),
      survey_topics: z.array(z.string()),
      follow_up_actions: z.array(z.string()),
    }),
  }),
  templates: z.array(z.object({
    template_name: z.string(),
    purpose: z.string(),
    key_elements: z.array(z.string()),
  })),
});

export type HR_012_Input = z.infer<typeof HR_012_InputSchema>;
export type HR_012_Output = z.infer<typeof HR_012_OutputSchema>;

export async function execute(input: HR_012_Input): Promise<HR_012_Output> {
  const channels = [];

  if (input.communication_preferences.includes("radio")) {
    channels.push({
      channel: "무전기",
      purpose: "실시간 현장 커뮤니케이션",
      audience: "현장 리더십 및 핵심 스태프",
      frequency: "상시",
      owner: "운영 총괄",
      tools: ["디지털 무전기", "이어피스"],
    });
  }

  if (input.communication_preferences.includes("app")) {
    channels.push({
      channel: "스태프 앱",
      purpose: "일정 확인, 공지사항, 문서 접근",
      audience: "전체 스태프",
      frequency: "상시",
      owner: "HR 담당",
      tools: ["이벤트 스태프 앱", "푸시 알림"],
    });
  }

  if (input.communication_preferences.includes("kakao")) {
    channels.push({
      channel: "카카오톡 그룹",
      purpose: "부서별 소통 및 빠른 공지",
      audience: "부서별 스태프",
      frequency: "상시",
      owner: "부서 매니저",
      tools: ["카카오톡 오픈채팅 또는 그룹"],
    });
  }

  if (input.communication_preferences.includes("slack")) {
    channels.push({
      channel: "Slack",
      purpose: "리더십 협업 및 의사결정",
      audience: "매니저 및 리더",
      frequency: "상시",
      owner: "운영 총괄",
      tools: ["Slack 워크스페이스"],
    });
  }

  channels.push({
    channel: "현장 브리핑",
    purpose: "대면 정보 전달 및 동기부여",
    audience: "전체 스태프",
    frequency: "세션 시작/종료 시",
    owner: "부서 매니저",
    tools: ["마이크", "스피커", "화이트보드"],
  });

  const preEventComms = [
    {
      timing: "D-14",
      message_type: "환영 메시지",
      content_summary: "채용 확정 안내, 행사 개요, 앞으로의 일정 안내",
      channel: "이메일 + 카카오톡",
      sender: "HR 매니저",
    },
    {
      timing: "D-10",
      message_type: "사전 교육 안내",
      content_summary: "온라인 교육 링크, 필수 서류 제출 안내",
      channel: "이메일 + 앱",
      sender: "HR 담당",
    },
    {
      timing: "D-7",
      message_type: "상세 일정 공유",
      content_summary: "배치 부서, 근무 시간, 유니폼 수령 안내",
      channel: "앱 + 카카오톡",
      sender: "부서 매니저",
    },
    {
      timing: "D-3",
      message_type: "최종 리마인더",
      content_summary: "집합 장소/시간, 준비물, 비상연락처",
      channel: "SMS + 앱 푸시",
      sender: "HR 담당",
    },
    {
      timing: "D-1",
      message_type: "내일 시작!",
      content_summary: "응원 메시지, 날씨 정보, 마지막 체크리스트",
      channel: "카카오톡 + 앱",
      sender: "운영 총괄",
    },
  ];

  return {
    event_id: input.event_id,
    communication_strategy: {
      objectives: [
        "모든 스태프가 필요한 정보를 적시에 받을 수 있도록 함",
        "명확하고 일관된 메시지 전달",
        "양방향 소통으로 현장 이슈 신속 파악",
        "소속감과 팀워크 강화",
      ],
      key_principles: [
        "간결하고 명확한 메시지",
        "채널별 목적에 맞는 활용",
        "중요 정보는 다중 채널로 전달",
        "피드백 경로 항상 열어두기",
        input.multilingual ? "다국어 지원 (핵심 정보)" : "한국어 기본",
      ],
      channels,
    },
    pre_event_communication: preEventComms,
    during_event_communication: {
      regular_updates: [
        { timing: "매일 시작 전", type: "조회 브리핑", content: "당일 일정, 주요 이벤트, 주의사항", channel: "대면 + 무전" },
        { timing: "매 세션 시작", type: "세션 브리핑", content: "세션 정보, VIP 안내, 특이사항", channel: "무전 + 앱" },
        { timing: "점심시간", type: "중간 점검", content: "오전 이슈, 오후 주의사항", channel: "카카오톡" },
        { timing: "매일 종료", type: "마감 브리핑", content: "당일 성과, 감사 인사, 내일 안내", channel: "대면 + 앱" },
      ],
      emergency_protocol: {
        trigger_conditions: [
          "안전 사고 발생",
          "자연재해/화재",
          "의료 응급 상황",
          "보안 위협",
          "VIP 관련 긴급 상황",
          "대규모 시스템 장애",
        ],
        communication_chain: [
          { step: 1, action: "현장 발견자 → 팀 리더 보고", responsible: "발견 스태프", timeframe: "즉시" },
          { step: 2, action: "팀 리더 → 부서 매니저 보고", responsible: "팀 리더", timeframe: "1분 이내" },
          { step: 3, action: "부서 매니저 → 운영 총괄 보고", responsible: "부서 매니저", timeframe: "2분 이내" },
          { step: 4, action: "운영 총괄 → 대응 지시", responsible: "운영 총괄", timeframe: "3분 이내" },
          { step: 5, action: "전체 공지 (필요 시)", responsible: "커뮤니케이션 담당", timeframe: "5분 이내" },
        ],
        code_words: [
          { code: "코드 레드", meaning: "화재/대피 필요", action_required: "지정 대피 경로로 안내, 방송 시작" },
          { code: "코드 블루", meaning: "의료 응급", action_required: "의료진 호출, 현장 통제" },
          { code: "코드 옐로우", meaning: "보안 위협", action_required: "해당 구역 통제, 보안팀 출동" },
          { code: "코드 그린", meaning: "상황 종료", action_required: "정상 운영 복귀" },
        ],
      },
    },
    post_event_communication: [
      { timing: "종료 직후", message_type: "감사 메시지", content: "수고 감사, 정산 안내, 설문 링크", channel: "카카오톡 + 앱" },
      { timing: "D+3", message_type: "설문 리마인더", content: "피드백 설문 참여 독려", channel: "이메일 + SMS" },
      { timing: "D+7", message_type: "정산 완료 안내", content: "급여 입금 안내", channel: "이메일 + SMS" },
      { timing: "D+14", message_type: "커뮤니티 유지", content: "향후 행사 안내, 인력풀 등록 제안", channel: "이메일" },
    ],
    feedback_system: {
      during_event: [
        { method: "무전 실시간 보고", frequency: "이슈 발생 시", responsible: "팀 리더" },
        { method: "부서별 체크인", frequency: "세션별 1회", responsible: "부서 매니저" },
        { method: "익명 피드백 박스", frequency: "상시", responsible: "HR 담당" },
      ],
      post_event: {
        survey_timing: "행사 종료 후 3일 이내",
        survey_topics: [
          "전반적 만족도",
          "교육 및 온보딩 품질",
          "커뮤니케이션 효과성",
          "장비 및 유니폼 만족도",
          "팀워크 및 리더십",
          "개선 제안",
        ],
        follow_up_actions: [
          "설문 결과 분석 보고서 작성",
          "주요 개선점 도출",
          "우수 스태프 선정 및 표창",
          "인력풀 데이터베이스 업데이트",
        ],
      },
    },
    templates: [
      {
        template_name: "일일 브리핑 템플릿",
        purpose: "매일 아침 조회용",
        key_elements: ["날짜/날씨", "당일 주요 일정", "주의사항", "VIP 정보", "응원 메시지"],
      },
      {
        template_name: "긴급 공지 템플릿",
        purpose: "비상 상황 전파용",
        key_elements: ["상황 요약", "즉시 행동사항", "담당자 연락처", "추가 안내 예고"],
      },
      {
        template_name: "감사 메시지 템플릿",
        purpose: "행사 종료 후 발송",
        key_elements: ["감사 인사", "성과 요약", "정산 일정", "설문 링크", "향후 안내"],
      },
    ],
  };
}

export const HR_012_StaffCommunication = {
  id: "HR-012",
  name: "Staff Communication Plan",
  description: "스태프 커뮤니케이션 계획",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.12",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_012_InputSchema,
  outputSchema: HR_012_OutputSchema,
  persona: `당신은 내부 커뮤니케이션 전문가입니다. 스태프들이 필요한 정보를 적시에 받고, 효과적으로 협업할 수 있는 소통 체계를 설계합니다.`,
};

export default HR_012_StaffCommunication;
