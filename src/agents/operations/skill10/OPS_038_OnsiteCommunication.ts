/**
 * OPS-038: On-site Communication Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_038_OnsiteCommunication = {
  id: "OPS-038",
  name: "On-site Communication Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `현장 커뮤니케이션 전문가. 스태프, 업체, 참석자 간의
원활한 소통을 보장합니다. 정보의 흐름이 성공의 열쇠입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    staff_count: z.number(),
    teams: z.array(z.object({
      team_name: z.string(),
      leader: z.string(),
      members: z.number(),
    })),
    venue_size: z.enum(["small", "medium", "large"]),
  }),

  outputSchema: z.object({
    communication_systems: z.array(z.object({
      system: z.string(),
      users: z.array(z.string()),
      purpose: z.string(),
      backup: z.string(),
    })),
    radio_plan: z.object({
      total_radios: z.number(),
      channels: z.array(z.object({
        channel: z.number(),
        name: z.string(),
        users: z.array(z.string()),
      })),
      protocols: z.array(z.string()),
    }),
    briefing_schedule: z.array(z.object({
      time: z.string(),
      attendees: z.array(z.string()),
      location: z.string(),
      duration: z.string(),
      agenda: z.array(z.string()),
    })),
    escalation_matrix: z.array(z.object({
      issue_type: z.string(),
      level_1: z.string(),
      level_2: z.string(),
      level_3: z.string(),
    })),
    contact_sheet: z.object({
      distribution: z.string(),
      includes: z.array(z.string()),
      format: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_038_OnsiteCommunication.inputSchema>) => {
    const radioCount = Math.max(10, Math.ceil(input.staff_count * 0.4));

    return {
      communication_systems: [
        {
          system: "무전기",
          users: ["전 스태프 리더", "보안", "기술팀", "의료팀"],
          purpose: "실시간 현장 소통",
          backup: "휴대폰 그룹콜",
        },
        {
          system: "메시징 앱 (Slack/카카오톡)",
          users: ["전 스태프"],
          purpose: "텍스트 기반 소통, 파일 공유",
          backup: "SMS",
        },
        {
          system: "PA 시스템",
          users: ["운영팀장", "안전 담당"],
          purpose: "참석자 전체 공지",
          backup: "메가폰",
        },
        {
          system: "이벤트 앱 푸시",
          users: ["운영팀"],
          purpose: "참석자 알림",
          backup: "이메일",
        },
      ],
      radio_plan: {
        total_radios: radioCount,
        channels: [
          { channel: 1, name: "커맨드", users: ["총괄", "각 팀장"] },
          { channel: 2, name: "등록/게스트", users: ["등록팀", "VIP 담당"] },
          { channel: 3, name: "프로덕션", users: ["무대 감독", "AV팀", "연사 담당"] },
          { channel: 4, name: "시설/물류", users: ["시설팀", "케이터링", "청소"] },
          { channel: 5, name: "보안/안전", users: ["보안팀", "의료팀", "안전 담당"] },
        ],
        protocols: [
          "10-코드 사용 (간결한 소통)",
          "호출 시 상대방 확인 후 송신",
          "긴급 상황: '긴급 긴급 긴급' 선언 후 메시지",
          "비밀 유지 필요 시 채널 5로 전환",
          "배터리 30% 이하 시 교체",
        ],
      },
      briefing_schedule: [
        {
          time: "D-Day 06:00",
          attendees: ["전체 스태프"],
          location: "메인 로비",
          duration: "30분",
          agenda: ["일정 확인", "역할 재확인", "비상 연락망", "Q&A"],
        },
        {
          time: "D-Day 12:00",
          attendees: ["팀장급"],
          location: "컨트롤룸",
          duration: "15분",
          agenda: ["오전 리뷰", "오후 주의사항", "이슈 공유"],
        },
        {
          time: "D-Day 종료 후",
          attendees: ["전체 스태프"],
          location: "메인 로비",
          duration: "15분",
          agenda: ["감사 인사", "철수 지시", "디브리핑 일정"],
        },
      ],
      escalation_matrix: [
        {
          issue_type: "기술 장애",
          level_1: "AV 기술자",
          level_2: "테크니컬 디렉터",
          level_3: "현장 총괄",
        },
        {
          issue_type: "게스트 불만",
          level_1: "해당 구역 스태프",
          level_2: "등록/게스트팀장",
          level_3: "현장 총괄",
        },
        {
          issue_type: "안전 사고",
          level_1: "보안/의료팀",
          level_2: "안전 담당",
          level_3: "현장 총괄 + 119",
        },
        {
          issue_type: "언론/PR 문의",
          level_1: "PR 담당자",
          level_2: "마케팅 팀장",
          level_3: "클라이언트",
        },
      ],
      contact_sheet: {
        distribution: "인쇄 + 디지털 (앱/메시지)",
        includes: ["이름", "역할", "휴대폰", "무전 채널", "위치"],
        format: "방수 라미네이팅 카드 (휴대용)",
      },
    };
  },
};
