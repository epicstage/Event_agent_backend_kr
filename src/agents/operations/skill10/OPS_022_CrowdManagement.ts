/**
 * OPS-022: Crowd Management Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_022_CrowdManagement = {
  id: "OPS-022",
  name: "Crowd Management Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `군중 관리 전문가. 안전하고 원활한 인원 흐름을 관리합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    expected_attendees: z.number(),
    venue_capacity: z.number(),
    peak_times: z.array(z.string()),
    entry_points: z.number(),
  }),

  outputSchema: z.object({
    crowd_flow_plan: z.object({
      max_density: z.string(),
      flow_rate: z.number(),
      bottleneck_mitigation: z.array(z.string()),
    }),
    zone_monitoring: z.array(z.object({
      zone: z.string(),
      max_capacity: z.number(),
      monitoring_method: z.string(),
      alert_threshold: z.number(),
    })),
    peak_management: z.array(z.object({
      time: z.string(),
      expected_load: z.number(),
      measures: z.array(z.string()),
    })),
    emergency_protocols: z.array(z.object({
      situation: z.string(),
      response: z.array(z.string()),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_022_CrowdManagement.inputSchema>) => {
    return {
      crowd_flow_plan: {
        max_density: "4인/㎡ 이하 유지",
        flow_rate: input.entry_points * 60,
        bottleneck_mitigation: [
          "복수 입출구 운영",
          "일방향 동선 설정",
          "실시간 밀집도 모니터링",
          "스태프 동선 유도",
        ],
      },
      zone_monitoring: [
        { zone: "메인홀", max_capacity: Math.floor(input.venue_capacity * 0.6), monitoring_method: "카운터 + CCTV", alert_threshold: 80 },
        { zone: "로비", max_capacity: Math.floor(input.venue_capacity * 0.2), monitoring_method: "카운터", alert_threshold: 90 },
        { zone: "케이터링", max_capacity: Math.floor(input.venue_capacity * 0.3), monitoring_method: "스태프 관찰", alert_threshold: 75 },
      ],
      peak_management: input.peak_times.map((time) => ({
        time,
        expected_load: Math.floor(input.expected_attendees * 0.85),
        measures: ["추가 스태프 배치", "안내 방송", "동선 분리"],
      })),
      emergency_protocols: [
        { situation: "과밀 경고", response: ["입장 일시 중단", "분산 유도 방송", "추가 출구 개방"] },
        { situation: "대피 필요", response: ["비상 방송", "출구별 유도", "집결지 안내"] },
      ],
    };
  },
};
