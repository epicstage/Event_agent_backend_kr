/**
 * OPS-001: Venue Sourcing Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 장소 소싱 및 후보지 발굴
 */

import { z } from "zod";

export const OPS_001_VenueSourcing = {
  id: "OPS-001",
  name: "Venue Sourcing Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 20년 경력의 베뉴 전문가입니다.
전 세계 주요 행사장을 직접 답사하고 평가한 경험이 있으며,
이벤트 요구사항에 맞는 최적의 장소를 찾아내는 것이 전문입니다.
장소 선정이 이벤트 성공의 50%를 결정한다고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    event_type: z.string(), // conference, exhibition, gala, meeting
    expected_attendees: z.number(),
    event_dates: z.object({
      start: z.string(),
      end: z.string(),
    }),
    location_preference: z.object({
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string(),
    }),
    budget_range: z.object({
      min: z.number(),
      max: z.number(),
    }),
    requirements: z.object({
      main_hall_capacity: z.number(),
      breakout_rooms: z.number().optional(),
      exhibition_space_sqm: z.number().optional(),
      outdoor_space: z.boolean().optional(),
      av_included: z.boolean().optional(),
      catering_onsite: z.boolean().optional(),
    }),
  }),

  outputSchema: z.object({
    venue_candidates: z.array(z.object({
      venue_name: z.string(),
      venue_type: z.string(),
      location: z.object({
        address: z.string(),
        city: z.string(),
        country: z.string(),
      }),
      capacity: z.object({
        max: z.number(),
        theater: z.number(),
        banquet: z.number(),
      }),
      daily_rate: z.number(),
      match_score: z.number(), // 0-100
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      contact: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
      }),
    })),
    recommendation: z.object({
      top_pick: z.string(),
      reason: z.string(),
      next_steps: z.array(z.string()),
    }),
    search_criteria_summary: z.string(),
  }),

  execute: async (input: z.infer<typeof OPS_001_VenueSourcing.inputSchema>) => {
    // 베뉴 소싱 로직
    const candidates = [
      {
        venue_name: "Grand Convention Center",
        venue_type: "convention_center",
        location: {
          address: "123 Convention Blvd",
          city: input.location_preference.city || "Seoul",
          country: input.location_preference.country,
        },
        capacity: {
          max: Math.round(input.expected_attendees * 1.3),
          theater: Math.round(input.expected_attendees * 1.2),
          banquet: Math.round(input.expected_attendees * 0.8),
        },
        daily_rate: input.budget_range.max * 0.3,
        match_score: 92,
        pros: [
          "도심 접근성 우수",
          "최신 AV 시설 완비",
          "충분한 주차 공간",
          "유연한 공간 구성",
        ],
        cons: [
          "주말 예약 경쟁 치열",
          "케이터링 외부업체 필수",
        ],
        contact: {
          name: "김영업 팀장",
          email: "sales@grandconvention.com",
          phone: "+82-2-1234-5678",
        },
      },
      {
        venue_name: "Luxury Hotel & Conference",
        venue_type: "hotel",
        location: {
          address: "456 Hotel Avenue",
          city: input.location_preference.city || "Seoul",
          country: input.location_preference.country,
        },
        capacity: {
          max: Math.round(input.expected_attendees * 1.1),
          theater: input.expected_attendees,
          banquet: Math.round(input.expected_attendees * 0.7),
        },
        daily_rate: input.budget_range.max * 0.4,
        match_score: 85,
        pros: [
          "프리미엄 이미지",
          "올인원 서비스",
          "숙박 연계 용이",
        ],
        cons: [
          "비용 상대적 높음",
          "공간 확장 제한적",
        ],
        contact: {
          name: "박매니저",
          email: "events@luxuryhotel.com",
          phone: "+82-2-9876-5432",
        },
      },
      {
        venue_name: "Creative Hub Complex",
        venue_type: "hybrid",
        location: {
          address: "789 Innovation Street",
          city: input.location_preference.city || "Seoul",
          country: input.location_preference.country,
        },
        capacity: {
          max: Math.round(input.expected_attendees * 1.0),
          theater: Math.round(input.expected_attendees * 0.9),
          banquet: Math.round(input.expected_attendees * 0.6),
        },
        daily_rate: input.budget_range.max * 0.25,
        match_score: 78,
        pros: [
          "트렌디한 분위기",
          "합리적 가격",
          "야외 공간 보유",
        ],
        cons: [
          "주차 공간 부족",
          "AV 장비 추가 필요",
        ],
        contact: {
          name: "이크리에이터",
          email: "space@creativehub.kr",
          phone: "+82-2-5555-1234",
        },
      },
    ];

    return {
      venue_candidates: candidates,
      recommendation: {
        top_pick: candidates[0].venue_name,
        reason: `${input.expected_attendees}명 규모의 ${input.event_type}에 최적화된 시설과 접근성, 예산 적합성을 종합 고려시 최상위 추천`,
        next_steps: [
          "현장 답사 일정 조율",
          "세부 견적 요청",
          "가용일 확인",
          "계약 조건 협상",
        ],
      },
      search_criteria_summary: `${input.location_preference.country} ${input.location_preference.city || "지역"}, ${input.expected_attendees}명 규모, 예산 ${input.budget_range.min.toLocaleString()}~${input.budget_range.max.toLocaleString()}원`,
    };
  },
};
