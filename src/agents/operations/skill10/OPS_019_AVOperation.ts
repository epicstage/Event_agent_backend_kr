/**
 * OPS-019: AV Operation Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 *
 * AV 현장 운영
 */

import { z } from "zod";

export const OPS_019_AVOperation = {
  id: "OPS-019",
  name: "AV Operation Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `당신은 AV 현장 운영 전문가입니다.
라이브 이벤트의 기술 운영을 완벽하게 수행합니다.
기술 문제에 즉각 대응하고 안정적인 서비스를 제공합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    sessions: z.array(z.object({
      session_id: z.string(),
      session_name: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      presenters: z.number(),
      requires_recording: z.boolean(),
      requires_streaming: z.boolean(),
    })),
  }),

  outputSchema: z.object({
    operation_runsheet: z.array(z.object({
      time: z.string(),
      cue: z.string(),
      action: z.string(),
      operator: z.string(),
      notes: z.string(),
    })),
    equipment_status: z.array(z.object({
      equipment: z.string(),
      status: z.enum(["ready", "standby", "active", "issue"]),
      backup_ready: z.boolean(),
    })),
    presenter_support: z.array(z.object({
      presenter_slot: z.number(),
      mic_assignment: z.string(),
      presentation_loaded: z.boolean(),
      clicker_provided: z.boolean(),
      sound_check: z.boolean(),
    })),
    streaming_status: z.object({
      platform: z.string(),
      status: z.string(),
      viewer_count: z.number(),
      bandwidth_mbps: z.number(),
    }).optional(),
    issue_response: z.array(z.object({
      issue_type: z.string(),
      response_protocol: z.array(z.string()),
      backup_solution: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_019_AVOperation.inputSchema>) => {
    const runsheet = input.sessions.flatMap((session) => {
      const startHour = parseInt(session.start_time.split(":")[0]);
      const startMin = parseInt(session.start_time.split(":")[1]);

      return [
        {
          time: `${startHour}:${String(startMin - 15).padStart(2, "0")}`,
          cue: "PRE-SESSION",
          action: `${session.session_name} 준비 - 마이크/영상 체크`,
          operator: "Audio/Video Tech",
          notes: "발표자 도착 확인",
        },
        {
          time: `${startHour}:${String(startMin - 5).padStart(2, "0")}`,
          cue: "STANDBY",
          action: "발표자 마이크 ON, 프레젠테이션 대기",
          operator: "Stage Manager",
          notes: "타이틀 슬라이드 확인",
        },
        {
          time: session.start_time,
          cue: "GO",
          action: "세션 시작 - 하우스라이트 다운, 스테이지 업",
          operator: "Lighting Tech",
          notes: session.requires_streaming ? "스트리밍 시작" : "",
        },
        {
          time: session.end_time,
          cue: "END",
          action: "세션 종료 - Q&A 마이크 준비",
          operator: "Audio Tech",
          notes: session.requires_recording ? "녹화 중단점 확인" : "",
        },
      ];
    });

    const hasStreaming = input.sessions.some((s) => s.requires_streaming);

    return {
      operation_runsheet: runsheet,
      equipment_status: [
        { equipment: "메인 LED 스크린", status: "ready" as const, backup_ready: true },
        { equipment: "음향 시스템", status: "ready" as const, backup_ready: true },
        { equipment: "무선 마이크 (x8)", status: "ready" as const, backup_ready: true },
        { equipment: "카메라 시스템", status: "ready" as const, backup_ready: true },
        { equipment: "스트리밍 인코더", status: hasStreaming ? "ready" as const : "standby" as const, backup_ready: true },
        { equipment: "조명 콘솔", status: "ready" as const, backup_ready: false },
      ],
      presenter_support: input.sessions.map((session, idx) => ({
        presenter_slot: idx + 1,
        mic_assignment: `Wireless ${(idx % 4) + 1}`,
        presentation_loaded: false,
        clicker_provided: false,
        sound_check: false,
      })),
      streaming_status: hasStreaming ? {
        platform: "YouTube Live + 자체 플랫폼",
        status: "Ready",
        viewer_count: 0,
        bandwidth_mbps: 50,
      } : undefined,
      issue_response: [
        {
          issue_type: "마이크 불량",
          response_protocol: ["즉시 백업 마이크 전달", "무선 채널 변경", "필요시 유선 전환"],
          backup_solution: "예비 마이크 4대 대기",
        },
        {
          issue_type: "프레젠테이션 오류",
          response_protocol: ["백업 노트북 전환", "USB 직접 연결", "브레이크 슬라이드 표시"],
          backup_solution: "모든 발표 파일 3중 백업",
        },
        {
          issue_type: "스트리밍 끊김",
          response_protocol: ["자동 재연결 확인", "백업 인코더 전환", "시청자 공지"],
          backup_solution: "4G 본딩 백업 라인",
        },
      ],
    };
  },
};
