/**
 * OPS-026: VIP Services Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_026_VIPServices = {
  id: "OPS-026",
  name: "VIP Services Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `VIP 서비스 전문가. 최고 수준의 맞춤 서비스를 제공합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    vip_list: z.array(z.object({
      name: z.string(),
      title: z.string(),
      company: z.string(),
      vip_level: z.enum(["platinum", "gold", "silver"]),
      special_requests: z.array(z.string()).optional(),
    })),
  }),

  outputSchema: z.object({
    service_plan: z.array(z.object({
      vip_name: z.string(),
      assigned_liaison: z.string(),
      itinerary: z.array(z.object({ time: z.string(), activity: z.string() })),
      special_arrangements: z.array(z.string()),
    })),
    vip_facilities: z.object({
      lounge_location: z.string(),
      amenities: z.array(z.string()),
      reserved_seating: z.string(),
      parking: z.string(),
    }),
    communication: z.object({
      pre_event_contact: z.string(),
      onsite_contact: z.string(),
      emergency_contact: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_026_VIPServices.inputSchema>) => {
    return {
      service_plan: input.vip_list.map((vip, idx) => ({
        vip_name: vip.name,
        assigned_liaison: `VIP Liaison ${idx + 1}`,
        itinerary: [
          { time: "도착 시", activity: "전용 입구 영접" },
          { time: "08:30", activity: "VIP 라운지 안내" },
          { time: "09:00", activity: "메인홀 VIP 좌석 안내" },
          { time: "12:00", activity: "VIP 다이닝 에스코트" },
        ],
        special_arrangements: vip.special_requests || ["프리미엄 환영 선물", "전용 차량 서비스"],
      })),
      vip_facilities: {
        lounge_location: "2층 Executive Lounge",
        amenities: ["프리미엄 케이터링", "개인 컨시어지", "비즈니스 센터", "휴식 공간"],
        reserved_seating: "메인홀 1-3열 중앙",
        parking: "VIP 전용 주차 (발렛 서비스)",
      },
      communication: {
        pre_event_contact: "VIP 코디네이터 (D-3 개별 연락)",
        onsite_contact: "전담 liaison 휴대폰",
        emergency_contact: "VIP 핫라인 (24시간)",
      },
    };
  },
};
