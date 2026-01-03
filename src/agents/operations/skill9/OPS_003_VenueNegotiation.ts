/**
 * OPS-003: Venue Negotiation Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 베뉴 계약 협상 전략
 */

import { z } from "zod";

export const OPS_003_VenueNegotiation = {
  id: "OPS-003",
  name: "Venue Negotiation Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 노련한 베뉴 계약 협상 전문가입니다.
수천 건의 베뉴 계약을 성사시키며 평균 15-25%의 비용 절감을 달성했습니다.
베뉴측의 수익 구조를 이해하고, 윈-윈 협상으로 장기적 관계를 구축합니다.
숨겨진 비용을 찾아내고 최적의 조건을 확보하는 것이 전문입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_id: z.string(),
    venue_name: z.string(),
    initial_quote: z.object({
      rental_fee: z.number(),
      setup_fee: z.number(),
      catering_minimum: z.number().optional(),
      av_package: z.number().optional(),
      other_fees: z.array(z.object({
        name: z.string(),
        amount: z.number(),
      })).optional(),
    }),
    event_details: z.object({
      dates: z.array(z.string()),
      attendees: z.number(),
      is_repeat_event: z.boolean().optional(),
    }),
    budget_target: z.number(),
    negotiation_priorities: z.array(z.string()).optional(),
  }),

  outputSchema: z.object({
    negotiation_strategy: z.object({
      approach: z.string(),
      leverage_points: z.array(z.string()),
      concessions_to_offer: z.array(z.string()),
      must_haves: z.array(z.string()),
      nice_to_haves: z.array(z.string()),
    }),
    cost_analysis: z.object({
      original_total: z.number(),
      target_total: z.number(),
      negotiation_room: z.number(),
      line_item_targets: z.array(z.object({
        item: z.string(),
        original: z.number(),
        target: z.number(),
        strategy: z.string(),
      })),
    }),
    talking_points: z.array(z.object({
      topic: z.string(),
      opening_position: z.string(),
      fallback_position: z.string(),
      justification: z.string(),
    })),
    contract_checklist: z.array(z.object({
      clause: z.string(),
      importance: z.enum(["critical", "important", "standard"]),
      negotiation_note: z.string(),
    })),
    risk_mitigation: z.array(z.object({
      risk: z.string(),
      contract_protection: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_003_VenueNegotiation.inputSchema>) => {
    const otherFees = input.initial_quote.other_fees || [];
    const otherFeesTotal = otherFees.reduce((sum, f) => sum + f.amount, 0);
    const originalTotal = input.initial_quote.rental_fee +
      input.initial_quote.setup_fee +
      (input.initial_quote.catering_minimum || 0) +
      (input.initial_quote.av_package || 0) +
      otherFeesTotal;

    const discountTarget = 0.20; // 20% 할인 목표
    const targetTotal = originalTotal * (1 - discountTarget);

    return {
      negotiation_strategy: {
        approach: input.event_details.is_repeat_event
          ? "장기 파트너십 강조 - 연간 계약 또는 다년 약정 제안"
          : "볼륨 및 마케팅 가치 강조 - 업계 노출 효과 어필",
        leverage_points: [
          `${input.event_details.attendees}명 규모로 F&B 매출 기대`,
          "비수기/주중 일정 활용시 유연성",
          "장기 파트너십 가능성",
          "업계 레퍼런스 제공 가치",
          "소셜 미디어 노출 효과",
        ],
        concessions_to_offer: [
          "조기 확정 (60일 전)",
          "최소 F&B 보장",
          "로고 노출 및 마케팅 협력",
          "사례 연구 참여 동의",
          "다음 행사 우선 예약권 부여",
        ],
        must_haves: [
          "셋업/철거 시간 무료 포함",
          "기본 AV 장비 무료",
          "무료 WiFi",
          "전용 행사 담당자 배정",
        ],
        nice_to_haves: [
          "VIP 주차 무료",
          "스피커 객실 할인",
          "사이니지 설치 비용 면제",
          "연장 운영 시간",
        ],
      },
      cost_analysis: {
        original_total: originalTotal,
        target_total: targetTotal,
        negotiation_room: originalTotal - targetTotal,
        line_item_targets: [
          {
            item: "장소 임대료",
            original: input.initial_quote.rental_fee,
            target: input.initial_quote.rental_fee * 0.85,
            strategy: "복수일 할인 및 비수기 요율 적용 요청",
          },
          {
            item: "셋업비",
            original: input.initial_quote.setup_fee,
            target: 0,
            strategy: "임대료에 포함 요청 (표준 관행)",
          },
          {
            item: "AV 패키지",
            original: input.initial_quote.av_package || 0,
            target: (input.initial_quote.av_package || 0) * 0.7,
            strategy: "기본 장비 무료, 추가분만 유료",
          },
        ],
      },
      talking_points: [
        {
          topic: "장소 임대료",
          opening_position: "유사 규모 베뉴 대비 15-20% 높은 수준입니다",
          fallback_position: "10% 할인 + 셋업비 면제로 조율 가능",
          justification: "경쟁 베뉴 견적 및 시장 조사 데이터 제시",
        },
        {
          topic: "F&B 최소 보장",
          opening_position: "참석자당 금액이 시장 평균 상회",
          fallback_position: "현 금액 유지하되 메뉴 업그레이드 포함",
          justification: "실제 참석률 80% 기준 리스크 공유",
        },
        {
          topic: "취소 조건",
          opening_position: "90일 전 전액 환불, 60일 전 50% 환불",
          fallback_position: "불가항력 조항 확대 및 일정 변경 옵션",
          justification: "업계 표준 취소 정책 비교표 제시",
        },
      ],
      contract_checklist: [
        {
          clause: "Force Majeure (불가항력)",
          importance: "critical" as const,
          negotiation_note: "전염병, 자연재해, 정부 규제 포함 명시",
        },
        {
          clause: "취소 및 환불 정책",
          importance: "critical" as const,
          negotiation_note: "단계별 환불 스케줄 및 일정 변경 옵션",
        },
        {
          clause: "보험 요구사항",
          importance: "important" as const,
          negotiation_note: "상호 책임 한도 명확화",
        },
        {
          clause: "AV/기술 지원",
          importance: "important" as const,
          negotiation_note: "기술자 상주 시간 및 비용 명시",
        },
        {
          clause: "외부 업체 반입",
          importance: "important" as const,
          negotiation_note: "케이터링/AV 외부 업체 허용 조건",
        },
        {
          clause: "노이즈 및 운영 시간",
          importance: "standard" as const,
          negotiation_note: "셋업/철거 포함 전체 이용 시간 명시",
        },
      ],
      risk_mitigation: [
        {
          risk: "베뉴 측 일방적 취소",
          contract_protection: "대체 장소 제공 의무 또는 위약금 3배 조항",
        },
        {
          risk: "예상치 못한 추가 비용",
          contract_protection: "전체 비용 상한선 명시 및 사전 승인 조항",
        },
        {
          risk: "시설 장애/고장",
          contract_protection: "백업 시설 및 비용 부담 주체 명시",
        },
        {
          risk: "인접 행사 소음",
          contract_protection: "방음 보장 또는 할인 조항",
        },
      ],
    };
  },
};
