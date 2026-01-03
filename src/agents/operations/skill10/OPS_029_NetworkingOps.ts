/**
 * OPS-029: Networking Operations Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_029_NetworkingOps = {
  id: "OPS-029",
  name: "Networking Operations Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `네트워킹 운영 전문가. 참석자들이 의미 있는 연결을
만들 수 있도록 공간, 프로그램, 도구를 최적화합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    attendee_count: z.number(),
    networking_sessions: z.array(z.object({
      session_name: z.string(),
      format: z.string(),
      duration_mins: z.number(),
      location: z.string(),
    })),
    matchmaking_enabled: z.boolean(),
  }),

  outputSchema: z.object({
    networking_zones: z.array(z.object({
      zone_name: z.string(),
      capacity: z.number(),
      setup: z.array(z.string()),
      ambiance: z.string(),
    })),
    session_operations: z.array(z.object({
      session_name: z.string(),
      format: z.string(),
      facilitation: z.string(),
      materials: z.array(z.string()),
      staff_required: z.number(),
    })),
    matchmaking_setup: z.object({
      enabled: z.boolean(),
      platform: z.string(),
      meeting_slots: z.number(),
      meeting_duration: z.number(),
    }),
    engagement_tools: z.array(z.object({
      tool: z.string(),
      purpose: z.string(),
      location: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_029_NetworkingOps.inputSchema>) => {
    return {
      networking_zones: [
        {
          zone_name: "메인 네트워킹 라운지",
          capacity: Math.round(input.attendee_count * 0.3),
          setup: ["하이탑 테이블 15개", "라운지 소파 세트 5개", "충전 스테이션"],
          ambiance: "배경 음악, 조도 70%, 따뜻한 조명",
        },
        {
          zone_name: "조용한 미팅 존",
          capacity: 20,
          setup: ["2인 테이블 10개", "파티션", "화이트 노이즈"],
          ambiance: "조용함, 프라이버시 보장",
        },
        {
          zone_name: "스탠딩 리셉션 공간",
          capacity: Math.round(input.attendee_count * 0.5),
          setup: ["칵테일 테이블", "음료 바", "푸드 스테이션"],
          ambiance: "활기찬 분위기, 업비트 음악",
        },
      ],
      session_operations: input.networking_sessions.map((session) => ({
        session_name: session.session_name,
        format: session.format,
        facilitation: session.format === "speed_networking"
          ? "타이머 + 벨 시스템, 진행자 1명"
          : "자연스러운 흐름, 아이스브레이커 카드",
        materials: ["명찰", "대화 주제 카드", "명함 교환 앱 QR"],
        staff_required: Math.ceil(session.duration_mins / 30),
      })),
      matchmaking_setup: {
        enabled: input.matchmaking_enabled,
        platform: "이벤트 앱 내 미팅 스케줄러",
        meeting_slots: input.matchmaking_enabled ? 20 : 0,
        meeting_duration: 15,
      },
      engagement_tools: [
        { tool: "디지털 명함 교환", purpose: "즉각적인 연락처 공유", location: "앱 내 기능" },
        { tool: "관심사 배지", purpose: "같은 관심사 참석자 식별", location: "명찰에 스티커 부착" },
        { tool: "네트워킹 빙고", purpose: "대화 유도 게이미피케이션", location: "등록 시 배포" },
      ],
    };
  },
};
