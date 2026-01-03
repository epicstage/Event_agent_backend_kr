/**
 * OPS-021: Session Management Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 *
 * 세션 현장 관리
 */

import { z } from "zod";

export const OPS_021_SessionManagement = {
  id: "OPS-021",
  name: "Session Management Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `당신은 세션 현장 관리 전문가입니다.
모든 세션이 일정대로 진행되도록 조율합니다.
발표자 지원과 참석자 경험을 동시에 관리합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    sessions: z.array(z.object({
      session_id: z.string(),
      title: z.string(),
      room: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      speaker: z.string(),
      capacity: z.number(),
    })),
  }),

  outputSchema: z.object({
    session_rundown: z.array(z.object({
      session_id: z.string(),
      room: z.string(),
      timeline: z.array(z.object({
        time: z.string(),
        activity: z.string(),
        responsible: z.string(),
      })),
      room_captain: z.string(),
    })),
    speaker_support: z.object({
      green_room_location: z.string(),
      speaker_ready_time_mins: z.number(),
      tech_check_protocol: z.array(z.string()),
    }),
    audience_management: z.object({
      seating_protocol: z.string(),
      overflow_handling: z.string(),
      qa_protocol: z.string(),
    }),
    timing_controls: z.object({
      warning_signals: z.array(z.object({ time_remaining: z.number(), signal: z.string() })),
      overtime_protocol: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_021_SessionManagement.inputSchema>) => {
    return {
      session_rundown: input.sessions.map((session, idx) => ({
        session_id: session.session_id,
        room: session.room,
        timeline: [
          { time: "-30분", activity: "룸 세팅 최종 점검", responsible: "Room Captain" },
          { time: "-15분", activity: "발표자 도착 및 기술 체크", responsible: "AV Tech" },
          { time: "-5분", activity: "참석자 입장 완료", responsible: "Usher" },
          { time: "0분", activity: "세션 시작", responsible: "MC/Moderator" },
          { time: "+5분 전", activity: "Q&A 준비", responsible: "Room Captain" },
          { time: "종료", activity: "다음 세션 준비 안내", responsible: "Room Captain" },
        ],
        room_captain: `Captain ${idx + 1}`,
      })),
      speaker_support: {
        green_room_location: "2층 VIP 라운지",
        speaker_ready_time_mins: 30,
        tech_check_protocol: [
          "프레젠테이션 파일 로딩 확인",
          "마이크 레벨 체크",
          "슬라이드 어드밴스 테스트",
          "비디오/오디오 재생 테스트",
          "타이머 확인",
        ],
      },
      audience_management: {
        seating_protocol: "선착순 자유석, VIP 예약석 별도",
        overflow_handling: "실시간 스트리밍 안내 → 오버플로우 룸",
        qa_protocol: "마이크 러너 2명 배치, 슬라이도 병행",
      },
      timing_controls: {
        warning_signals: [
          { time_remaining: 10, signal: "그린 라이트 점등" },
          { time_remaining: 5, signal: "옐로우 라이트 점등" },
          { time_remaining: 1, signal: "레드 라이트 점멸" },
          { time_remaining: 0, signal: "음악 페이드인" },
        ],
        overtime_protocol: "MC가 정중하게 마무리 안내, 다음 발표자 대기 알림",
      },
    };
  },
};
