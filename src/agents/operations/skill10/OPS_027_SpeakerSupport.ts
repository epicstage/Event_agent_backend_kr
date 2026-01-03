/**
 * OPS-027: Speaker Support Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_027_SpeakerSupport = {
  id: "OPS-027",
  name: "Speaker Support Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `연사 지원 전문가. 연사들이 최상의 컨디션으로 발표할 수 있도록
모든 지원을 제공합니다. 그린룸 관리부터 무대 진행까지 책임집니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    speakers: z.array(z.object({
      speaker_id: z.string(),
      name: z.string(),
      session_title: z.string(),
      session_time: z.string(),
      special_requirements: z.array(z.string()).optional(),
    })),
    green_room_available: z.boolean(),
  }),

  outputSchema: z.object({
    speaker_schedule: z.array(z.object({
      speaker_name: z.string(),
      arrival_time: z.string(),
      tech_check_time: z.string(),
      green_room_time: z.string(),
      stage_call_time: z.string(),
      session_time: z.string(),
    })),
    green_room_setup: z.object({
      location: z.string(),
      amenities: z.array(z.string()),
      av_preview: z.boolean(),
      refreshments: z.array(z.string()),
    }),
    support_assignments: z.array(z.object({
      speaker_name: z.string(),
      liaison: z.string(),
      contact: z.string(),
    })),
    contingencies: z.array(z.object({
      scenario: z.string(),
      response: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_027_SpeakerSupport.inputSchema>) => {
    return {
      speaker_schedule: input.speakers.map((speaker) => ({
        speaker_name: speaker.name,
        arrival_time: "세션 2시간 전",
        tech_check_time: "세션 90분 전",
        green_room_time: "세션 60분 전",
        stage_call_time: "세션 10분 전",
        session_time: speaker.session_time,
      })),
      green_room_setup: {
        location: input.green_room_available ? "2층 VIP 라운지" : "백스테이지 대기실",
        amenities: ["개인 화장대", "프레젠테이션 미리보기 모니터", "Wi-Fi", "충전 스테이션"],
        av_preview: true,
        refreshments: ["생수", "커피/차", "가벼운 스낵", "과일"],
      },
      support_assignments: input.speakers.map((speaker, idx) => ({
        speaker_name: speaker.name,
        liaison: `Speaker Liaison ${idx + 1}`,
        contact: `무전기 채널 ${5 + idx}`,
      })),
      contingencies: [
        { scenario: "연사 지연 도착", response: "차량 픽업 대기, 약식 테크체크, 진행 순서 조정" },
        { scenario: "프레젠테이션 파일 문제", response: "백업 USB 준비, 클라우드 다운로드, 기술팀 즉시 지원" },
        { scenario: "연사 컨디션 불량", response: "의료 지원, 휴식 공간 제공, 대체 발표자 준비" },
      ],
    };
  },
};
