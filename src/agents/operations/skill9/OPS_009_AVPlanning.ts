/**
 * OPS-009: AV Planning Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 음향/조명/영상 기획
 */

import { z } from "zod";

export const OPS_009_AVPlanning = {
  id: "OPS-009",
  name: "AV Planning Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 AV 기술 전문가입니다.
20년간 대형 컨퍼런스, 콘서트, 기업 행사의 기술 총괄을 맡아왔습니다.
최첨단 기술과 안정적인 운영의 균형을 추구하며,
기술이 콘텐츠를 빛나게 하는 것이 목표입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_specs: z.object({
      main_hall_sqm: z.number(),
      ceiling_height_m: z.number(),
      power_available_kw: z.number(),
    }),
    event_format: z.string(), // conference, hybrid, concert, gala
    sessions: z.array(z.object({
      session_type: z.string(), // keynote, panel, workshop, networking
      duration_mins: z.number(),
      presenters: z.number(),
      requires_video: z.boolean().optional(),
      requires_streaming: z.boolean().optional(),
    })),
    attendees: z.number(),
    budget_range: z.object({
      min: z.number(),
      max: z.number(),
    }),
  }),

  outputSchema: z.object({
    av_plan: z.object({
      production_level: z.enum(["basic", "standard", "premium", "broadcast"]),
      total_estimated_cost: z.number(),
      key_features: z.array(z.string()),
    }),
    audio_system: z.object({
      main_pa: z.object({
        type: z.string(),
        coverage: z.string(),
        components: z.array(z.string()),
      }),
      microphones: z.array(z.object({
        type: z.string(),
        quantity: z.number(),
        purpose: z.string(),
      })),
      monitoring: z.object({
        stage_monitors: z.number(),
        in_ear_systems: z.number(),
      }),
      audio_recording: z.boolean(),
    }),
    video_system: z.object({
      main_display: z.object({
        type: z.string(),
        size: z.string(),
        resolution: z.string(),
      }),
      secondary_displays: z.array(z.object({
        type: z.string(),
        location: z.string(),
        size: z.string(),
      })),
      cameras: z.array(z.object({
        type: z.string(),
        position: z.string(),
        purpose: z.string(),
      })),
      video_switching: z.object({
        switcher: z.string(),
        inputs: z.number(),
        outputs: z.number(),
      }),
    }),
    lighting_system: z.object({
      stage_lighting: z.array(z.object({
        type: z.string(),
        quantity: z.number(),
        purpose: z.string(),
      })),
      ambient_lighting: z.string(),
      special_effects: z.array(z.string()),
    }),
    streaming_setup: z.object({
      platform: z.string(),
      bandwidth_required_mbps: z.number(),
      encoder: z.string(),
      backup_solution: z.string(),
    }).optional(),
    power_requirements: z.object({
      total_load_kw: z.number(),
      circuits_needed: z.number(),
      backup_power: z.boolean(),
      distribution_plan: z.string(),
    }),
    crew_requirements: z.array(z.object({
      role: z.string(),
      quantity: z.number(),
      hours: z.number(),
      rate_per_hour: z.number(),
    })),
    timeline: z.object({
      load_in: z.string(),
      setup_hours: z.number(),
      rehearsal: z.string(),
      teardown_hours: z.number(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_009_AVPlanning.inputSchema>) => {
    const isHybrid = input.event_format === "hybrid";
    const hasStreaming = input.sessions.some(s => s.requires_streaming);
    const productionLevel = input.budget_range.max > 50000000 ? "broadcast" as const
      : input.budget_range.max > 20000000 ? "premium" as const
      : input.budget_range.max > 10000000 ? "standard" as const
      : "basic" as const;

    const totalCost = Math.round(input.budget_range.max * 0.85);

    return {
      av_plan: {
        production_level: productionLevel,
        total_estimated_cost: totalCost,
        key_features: [
          productionLevel !== "basic" ? "LED 월 메인 스크린" : "대형 프로젝션 스크린",
          "전문 음향 시스템",
          productionLevel !== "basic" ? "다중 카메라 촬영" : "단일 카메라 기록",
          isHybrid || hasStreaming ? "라이브 스트리밍" : "현장 전용",
          "전문 조명 디자인",
        ],
      },
      audio_system: {
        main_pa: {
          type: input.attendees > 500 ? "Line Array System" : "Point Source System",
          coverage: `${input.venue_specs.main_hall_sqm}㎡ 전체 커버리지`,
          components: [
            input.attendees > 500 ? "Line Array 스피커 (좌/우 각 6개)" : "메인 스피커 (좌/우)",
            "서브우퍼 4개",
            "딜레이 스피커 (후방)",
            "Front Fill 스피커",
          ],
        },
        microphones: [
          { type: "무선 핸드헬드", quantity: 4, purpose: "발표자용" },
          { type: "무선 핀마이크", quantity: 6, purpose: "패널/VIP용" },
          { type: "구즈넥 마이크", quantity: 4, purpose: "연단/테이블용" },
          { type: "오버헤드 마이크", quantity: 2, purpose: "객석 Q&A용" },
        ],
        monitoring: {
          stage_monitors: 4,
          in_ear_systems: 2,
        },
        audio_recording: true,
      },
      video_system: {
        main_display: {
          type: productionLevel === "basic" ? "Projection" : "LED Wall",
          size: productionLevel === "basic" ? "6m x 3.5m" : "8m x 4.5m",
          resolution: productionLevel !== "basic" ? "4K" : "Full HD",
        },
        secondary_displays: [
          { type: "Confidence Monitor", location: "Stage Front", size: "55인치" },
          { type: "Relay Screen", location: "후방 좌측", size: "150인치 프로젝션" },
          { type: "Relay Screen", location: "후방 우측", size: "150인치 프로젝션" },
        ],
        cameras: [
          { type: "PTZ Camera", position: "후방 센터", purpose: "와이드 샷" },
          { type: "Manned Camera", position: "좌측", purpose: "발표자 클로즈업" },
          { type: "Manned Camera", position: "우측", purpose: "패널 샷" },
          { type: "Roving Camera", position: "이동", purpose: "객석/반응 샷" },
        ],
        video_switching: {
          switcher: productionLevel !== "basic" ? "BlackMagic ATEM 4 M/E" : "ATEM Mini Pro",
          inputs: 12,
          outputs: 8,
        },
      },
      lighting_system: {
        stage_lighting: [
          { type: "LED 워시", quantity: 12, purpose: "스테이지 일반 조명" },
          { type: "LED 스팟", quantity: 8, purpose: "발표자 하이라이트" },
          { type: "무빙헤드", quantity: 6, purpose: "다이나믹 이펙트" },
          { type: "프로파일", quantity: 4, purpose: "고보/텍스처" },
        ],
        ambient_lighting: "DMX 제어 컬러 워시 + 하우스라이트 연동",
        special_effects: [
          "오프닝 레이저 쇼",
          "하이라이트 컨페티 드롭",
          "헤이즈 머신 (빔 가시화)",
        ],
      },
      streaming_setup: isHybrid || hasStreaming ? {
        platform: "자체 플랫폼 + YouTube Live 백업",
        bandwidth_required_mbps: 50,
        encoder: "Teradek Prism",
        backup_solution: "4G 본딩 백업 + 로컬 녹화",
      } : undefined,
      power_requirements: {
        total_load_kw: Math.round(input.venue_specs.power_available_kw * 0.7),
        circuits_needed: 12,
        backup_power: productionLevel !== "basic",
        distribution_plan: "메인 분전반 → 스테이지/음향/조명/영상 각 독립 회로",
      },
      crew_requirements: [
        { role: "테크니컬 디렉터", quantity: 1, hours: 12, rate_per_hour: 150000 },
        { role: "음향 엔지니어", quantity: 2, hours: 10, rate_per_hour: 100000 },
        { role: "영상 엔지니어", quantity: 2, hours: 10, rate_per_hour: 100000 },
        { role: "조명 오퍼레이터", quantity: 1, hours: 10, rate_per_hour: 80000 },
        { role: "카메라 오퍼레이터", quantity: 3, hours: 8, rate_per_hour: 70000 },
        { role: "스테이지 핸드", quantity: 4, hours: 14, rate_per_hour: 50000 },
      ],
      timeline: {
        load_in: "D-1, 08:00",
        setup_hours: 10,
        rehearsal: "D-1, 18:00-21:00",
        teardown_hours: 6,
      },
    };
  },
};
