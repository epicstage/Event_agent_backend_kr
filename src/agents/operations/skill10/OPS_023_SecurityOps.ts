/**
 * OPS-023: Security Operations Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_023_SecurityOps = {
  id: "OPS-023",
  name: "Security Operations Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `보안 운영 전문가. 참석자 안전과 자산 보호를 담당합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    attendees: z.number(),
    vip_present: z.boolean(),
    threat_level: z.enum(["low", "medium", "high"]),
  }),

  outputSchema: z.object({
    security_deployment: z.array(z.object({
      position: z.string(),
      personnel: z.number(),
      responsibilities: z.array(z.string()),
    })),
    access_control: z.object({
      screening_level: z.string(),
      credential_types: z.array(z.string()),
      restricted_areas: z.array(z.string()),
    }),
    incident_response: z.array(z.object({
      incident_type: z.string(),
      response_protocol: z.array(z.string()),
      escalation: z.string(),
    })),
    communication: z.object({
      radio_channels: z.array(z.object({ channel: z.number(), purpose: z.string() })),
      code_words: z.array(z.object({ code: z.string(), meaning: z.string() })),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_023_SecurityOps.inputSchema>) => {
    const basePersonnel = Math.ceil(input.attendees / 100);
    const multiplier = input.threat_level === "high" ? 1.5 : input.threat_level === "medium" ? 1.2 : 1;

    return {
      security_deployment: [
        { position: "정문", personnel: Math.ceil(basePersonnel * 0.3 * multiplier), responsibilities: ["입장 스크리닝", "배지 확인"] },
        { position: "메인홀", personnel: Math.ceil(basePersonnel * 0.3 * multiplier), responsibilities: ["장내 순찰", "질서 유지"] },
        { position: "백스테이지", personnel: Math.ceil(basePersonnel * 0.2 * multiplier), responsibilities: ["VIP 보호", "출입 통제"] },
        { position: "순찰", personnel: Math.ceil(basePersonnel * 0.2 * multiplier), responsibilities: ["외곽 순찰", "비상구 확인"] },
      ],
      access_control: {
        screening_level: input.threat_level === "high" ? "금속탐지 + 가방검색" : "가방검색",
        credential_types: ["참석자 배지", "스태프 ID", "VIP 패스", "미디어 패스", "벤더 패스"],
        restricted_areas: ["백스테이지", "컨트롤룸", "VIP 라운지", "스토리지"],
      },
      incident_response: [
        { incident_type: "미인가 침입", response_protocol: ["퇴거 요청", "에스코트", "경찰 연락"], escalation: "보안 책임자" },
        { incident_type: "분실물", response_protocol: ["분실물 센터 안내", "기록", "공지"], escalation: "운영팀" },
        { incident_type: "의심 물품", response_protocol: ["구역 격리", "전문가 호출", "대피 준비"], escalation: "경찰/소방" },
      ],
      communication: {
        radio_channels: [
          { channel: 1, purpose: "보안 총괄" },
          { channel: 2, purpose: "입구 스크리닝" },
          { channel: 3, purpose: "순찰팀" },
        ],
        code_words: [
          { code: "ALPHA", meaning: "일반 상황" },
          { code: "BRAVO", meaning: "주의 필요" },
          { code: "CHARLIE", meaning: "긴급 상황" },
        ],
      },
    };
  },
};
