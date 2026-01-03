/**
 * OPS-030: Live Streaming Operations Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_030_LiveStreaming = {
  id: "OPS-030",
  name: "Live Streaming Operations Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `라이브 스트리밍 전문가. 하이브리드 이벤트의 온라인 경험을
현장만큼 생생하게 전달합니다. 안정성이 최우선입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    streaming_sessions: z.array(z.object({
      session_id: z.string(),
      session_name: z.string(),
      duration_mins: z.number(),
      languages: z.array(z.string()),
    })),
    expected_online_viewers: z.number(),
    platforms: z.array(z.string()),
  }),

  outputSchema: z.object({
    technical_setup: z.object({
      encoding: z.object({
        primary: z.string(),
        backup: z.string(),
        resolution: z.string(),
        bitrate: z.string(),
      }),
      bandwidth_requirement: z.string(),
      redundancy: z.array(z.string()),
    }),
    platform_config: z.array(z.object({
      platform: z.string(),
      stream_key_location: z.string(),
      features_enabled: z.array(z.string()),
      moderation: z.string(),
    })),
    production_team: z.array(z.object({
      role: z.string(),
      responsibilities: z.array(z.string()),
      position: z.string(),
    })),
    viewer_engagement: z.object({
      chat_moderation: z.string(),
      qa_system: z.string(),
      polling: z.string(),
      reactions: z.boolean(),
    }),
    contingency: z.array(z.object({
      issue: z.string(),
      solution: z.string(),
      responsible: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_030_LiveStreaming.inputSchema>) => {
    return {
      technical_setup: {
        encoding: {
          primary: "OBS Studio + NDI",
          backup: "하드웨어 인코더 (Blackmagic)",
          resolution: input.expected_online_viewers > 1000 ? "1080p60" : "1080p30",
          bitrate: "6-8 Mbps",
        },
        bandwidth_requirement: `${Math.max(50, Math.ceil(input.expected_online_viewers / 100) * 10)} Mbps 전용 회선`,
        redundancy: [
          "듀얼 인코더 핫스탠바이",
          "4G/LTE 백업 회선",
          "로컬 녹화 동시 진행",
          "CDN 멀티 리전",
        ],
      },
      platform_config: input.platforms.map((platform) => ({
        platform,
        stream_key_location: "Secrets Manager 저장",
        features_enabled: ["채팅", "Q&A", "폴링", "VOD 자동 변환"],
        moderation: "AI 필터 + 인력 모니터링 2명",
      })),
      production_team: [
        {
          role: "스트리밍 디렉터",
          responsibilities: ["전체 송출 총괄", "플랫폼 모니터링", "비상 대응"],
          position: "스트리밍 컨트롤룸",
        },
        {
          role: "스위처 오퍼레이터",
          responsibilities: ["카메라 전환", "그래픽 송출", "자막 입력"],
          position: "프로덕션 데스크",
        },
        {
          role: "채팅 모더레이터",
          responsibilities: ["채팅 관리", "Q&A 필터링", "기술 문의 응대"],
          position: "원격 가능",
        },
      ],
      viewer_engagement: {
        chat_moderation: "AI + 인력 하이브리드",
        qa_system: "Slido 연동, 연사에게 큐레이션 전달",
        polling: "실시간 투표, 결과 화면 공유",
        reactions: true,
      },
      contingency: [
        {
          issue: "스트림 끊김",
          solution: "백업 인코더 자동 전환, '잠시 후 재개' 슬레이트",
          responsible: "스트리밍 디렉터",
        },
        {
          issue: "음향 문제",
          solution: "백업 오디오 소스 전환, 자막 활성화",
          responsible: "스위처 오퍼레이터",
        },
        {
          issue: "채팅 스팸",
          solution: "슬로우 모드 활성화, 문제 계정 차단",
          responsible: "채팅 모더레이터",
        },
      ],
    };
  },
};
