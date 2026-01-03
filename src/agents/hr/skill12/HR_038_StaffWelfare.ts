/**
 * HR-038: Staff Welfare Services
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 스태프 복지 서비스 관리
 */

import { z } from "zod";

export const HR_038_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_duration: z.object({
    start_date: z.string(),
    end_date: z.string(),
    daily_hours: z.number(),
  }),
  staff_profile: z.object({
    total_count: z.number(),
    age_distribution: z.object({
      under_25: z.number(),
      age_25_35: z.number(),
      age_35_50: z.number(),
      over_50: z.number(),
    }),
    employment_types: z.object({
      full_time: z.number(),
      part_time: z.number(),
      contractor: z.number(),
      volunteer: z.number(),
    }),
  }),
  venue_info: z.object({
    type: z.enum(["indoor", "outdoor", "mixed"]),
    catering_available: z.boolean(),
    rest_area_capacity: z.number(),
  }),
  budget_per_person: z.number(),
});

export const HR_038_OutputSchema = z.object({
  event_id: z.string(),
  welfare_plan: z.object({
    total_budget: z.number(),
    per_person_allocation: z.number(),
    coverage_rate: z.number(),
  }),
  meal_services: z.object({
    provision_type: z.enum(["catering", "meal_voucher", "packed_lunch", "mixed"]),
    meals_per_day: z.array(z.object({
      meal: z.string(),
      time: z.string(),
      location: z.string(),
      menu_type: z.string(),
    })),
    dietary_options: z.array(z.string()),
    estimated_cost: z.number(),
  }),
  rest_facilities: z.object({
    rest_areas: z.array(z.object({
      name: z.string(),
      capacity: z.number(),
      amenities: z.array(z.string()),
      available_hours: z.string(),
    })),
    break_policy: z.object({
      minimum_breaks: z.number(),
      break_duration: z.number(),
      rotation_system: z.boolean(),
    }),
  }),
  refreshments: z.object({
    stations: z.array(z.object({
      location: z.string(),
      items: z.array(z.string()),
      replenishment_schedule: z.string(),
    })),
    hydration_focus: z.boolean(),
  }),
  comfort_provisions: z.array(z.object({
    item: z.string(),
    quantity: z.number(),
    location: z.string(),
    purpose: z.string(),
  })),
  health_support: z.object({
    first_aid_stations: z.number(),
    medical_staff_available: z.boolean(),
    common_supplies: z.array(z.string()),
    emergency_protocol: z.string(),
  }),
  mental_wellbeing: z.object({
    stress_management: z.array(z.string()),
    support_channels: z.array(z.object({
      channel: z.string(),
      availability: z.string(),
      contact: z.string(),
    })),
  }),
  special_provisions: z.array(z.object({
    group: z.string(),
    provisions: z.array(z.string()),
    reason: z.string(),
  })),
  feedback_mechanism: z.object({
    real_time_feedback: z.string(),
    suggestion_box: z.string(),
    response_commitment: z.string(),
  }),
});

export type HR_038_Input = z.infer<typeof HR_038_InputSchema>;
export type HR_038_Output = z.infer<typeof HR_038_OutputSchema>;

export async function execute(input: HR_038_Input): Promise<HR_038_Output> {
  const totalBudget = input.budget_per_person * input.staff_profile.total_count;
  const isOutdoor = input.venue_info.type === "outdoor" || input.venue_info.type === "mixed";

  // 식사 서비스
  const mealProvision = input.venue_info.catering_available ? "catering" : "packed_lunch";
  const mealsPerDay = [];

  if (input.event_duration.daily_hours >= 4) {
    mealsPerDay.push({
      meal: "점심",
      time: "12:00 - 13:00",
      location: input.venue_info.catering_available ? "케이터링 구역" : "휴게실",
      menu_type: "한식/양식 선택",
    });
  }

  if (input.event_duration.daily_hours >= 8) {
    mealsPerDay.push({
      meal: "저녁",
      time: "18:00 - 19:00",
      location: input.venue_info.catering_available ? "케이터링 구역" : "휴게실",
      menu_type: "도시락 또는 식권",
    });
  }

  mealsPerDay.push({
    meal: "간식",
    time: "15:00 - 16:00",
    location: "휴게 공간",
    menu_type: "과일, 음료, 스낵",
  });

  const mealCost = mealsPerDay.length * 10000 * input.staff_profile.total_count;

  // 휴게 시설
  const restAreaCount = Math.ceil(input.staff_profile.total_count / input.venue_info.rest_area_capacity);
  const restAreas = [];

  for (let i = 0; i < restAreaCount; i++) {
    restAreas.push({
      name: `휴게실 ${i + 1}`,
      capacity: Math.ceil(input.venue_info.rest_area_capacity),
      amenities: [
        "의자/소파",
        "에어컨/난방",
        "음료 자판기",
        "충전기",
        "Wi-Fi",
      ],
      available_hours: "행사 시간 전체",
    });
  }

  // 음료/간식 스테이션
  const stationCount = Math.ceil(input.staff_profile.total_count / 30);
  const refreshmentStations = [];

  for (let i = 0; i < stationCount; i++) {
    refreshmentStations.push({
      location: `구역 ${String.fromCharCode(65 + i)} 근처`,
      items: ["생수", "이온음료", "커피", "차", "에너지바"],
      replenishment_schedule: "2시간마다",
    });
  }

  // 컴포트 용품
  const comfortProvisions = [
    { item: "휴대용 선풍기", quantity: Math.ceil(input.staff_profile.total_count * 0.3), location: "물품 대여소", purpose: "더위 대비" },
    { item: "우산/우비", quantity: Math.ceil(input.staff_profile.total_count * 0.2), location: "물품 대여소", purpose: "우천 대비" },
    { item: "보조배터리", quantity: Math.ceil(input.staff_profile.total_count * 0.2), location: "물품 대여소", purpose: "휴대폰 충전" },
    { item: "구급 키트", quantity: stationCount, location: "각 구역", purpose: "경미한 부상 대응" },
  ];

  if (isOutdoor) {
    comfortProvisions.push(
      { item: "선크림", quantity: Math.ceil(input.staff_profile.total_count * 0.5), location: "휴게실", purpose: "자외선 차단" },
      { item: "쿨링 스프레이", quantity: stationCount * 3, location: "각 구역", purpose: "더위 대비" }
    );
  }

  // 특별 제공
  const specialProvisions = [];

  if (input.staff_profile.age_distribution.over_50 > 0) {
    specialProvisions.push({
      group: "50세 이상 스태프",
      provisions: ["우선 휴식 배정", "저자극 식사 옵션", "의자 비치 구역 배정"],
      reason: "체력 관리 및 건강 배려",
    });
  }

  if (input.staff_profile.employment_types.volunteer > 0) {
    specialProvisions.push({
      group: "봉사자",
      provisions: ["기념품 제공", "봉사 시간 인증서", "감사 인사 행사"],
      reason: "자발적 참여에 대한 감사 표현",
    });
  }

  if (input.event_duration.daily_hours >= 10) {
    specialProvisions.push({
      group: "장시간 근무자",
      provisions: ["추가 휴식 시간", "영양 보충제", "마사지 의자 이용"],
      reason: "피로 관리",
    });
  }

  return {
    event_id: input.event_id,
    welfare_plan: {
      total_budget: totalBudget,
      per_person_allocation: input.budget_per_person,
      coverage_rate: 100,
    },
    meal_services: {
      provision_type: mealProvision as "catering" | "meal_voucher" | "packed_lunch" | "mixed",
      meals_per_day: mealsPerDay,
      dietary_options: ["채식", "할랄", "알레르기 대응", "저염식"],
      estimated_cost: mealCost,
    },
    rest_facilities: {
      rest_areas: restAreas,
      break_policy: {
        minimum_breaks: Math.ceil(input.event_duration.daily_hours / 4),
        break_duration: 15,
        rotation_system: true,
      },
    },
    refreshments: {
      stations: refreshmentStations,
      hydration_focus: isOutdoor,
    },
    comfort_provisions: comfortProvisions,
    health_support: {
      first_aid_stations: Math.ceil(input.staff_profile.total_count / 100),
      medical_staff_available: input.staff_profile.total_count >= 100,
      common_supplies: [
        "반창고",
        "소독약",
        "진통제",
        "소화제",
        "체온계",
        "혈압계",
        "AED",
      ],
      emergency_protocol: "응급 상황 시 의무실(내선 119) 연락 → 구급차 호출 → 보호자 연락",
    },
    mental_wellbeing: {
      stress_management: [
        "정기 휴식 시간 보장",
        "팀 리더 정기 체크인",
        "어려움 발생 시 즉시 보고 문화",
        "긍정적 피드백 제공",
      ],
      support_channels: [
        { channel: "현장 상담", availability: "행사 시간 중", contact: "HR 부스" },
        { channel: "핫라인", availability: "24시간", contact: "1588-XXXX" },
        { channel: "온라인 상담", availability: "익명 가능", contact: "welfare@event.com" },
      ],
    },
    special_provisions: specialProvisions,
    feedback_mechanism: {
      real_time_feedback: "HR 앱 내 피드백 버튼",
      suggestion_box: "각 휴게실에 비치",
      response_commitment: "접수 후 1시간 이내 확인, 당일 해결 원칙",
    },
  };
}

export const HR_038_StaffWelfare = {
  id: "HR-038",
  name: "Staff Welfare Services",
  description: "스태프 복지 서비스 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.23",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_038_InputSchema,
  outputSchema: HR_038_OutputSchema,
  persona: `당신은 직원 복지 전문가입니다. 스태프가 최상의 컨디션으로 근무할 수 있도록 종합적인 복지를 제공합니다.`,
};

export default HR_038_StaffWelfare;
