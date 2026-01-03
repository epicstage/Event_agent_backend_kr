/**
 * OPS-018: F&B Execution Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 *
 * 식음료 현장 실행
 */

import { z } from "zod";

export const OPS_018_FBExecution = {
  id: "OPS-018",
  name: "F&B Execution Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `당신은 F&B 현장 운영 전문가입니다.
계획된 메뉴를 현장에서 완벽하게 실행합니다.
서비스 품질과 타이밍이 핵심이라고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    service_date: z.string(),
    meals: z.array(z.object({
      meal_type: z.string(),
      time: z.string(),
      guests: z.number(),
      location: z.string(),
    })),
    caterer_name: z.string(),
  }),

  outputSchema: z.object({
    service_timeline: z.array(z.object({
      time: z.string(),
      activity: z.string(),
      responsible: z.string(),
      location: z.string(),
      status: z.enum(["pending", "in_progress", "completed"]),
    })),
    station_setup: z.array(z.object({
      station_name: z.string(),
      location: z.string(),
      items: z.array(z.string()),
      staff_assigned: z.number(),
    })),
    quality_checkpoints: z.array(z.object({
      checkpoint: z.string(),
      time: z.string(),
      criteria: z.array(z.string()),
    })),
    issue_log: z.array(z.object({
      issue: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      resolution: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_018_FBExecution.inputSchema>) => {
    const timeline = input.meals.flatMap((meal) => {
      const mealHour = parseInt(meal.time.split(":")[0]);
      return [
        {
          time: `${mealHour - 2}:00`,
          activity: `${meal.meal_type} 준비 시작`,
          responsible: input.caterer_name,
          location: meal.location,
          status: "pending" as const,
        },
        {
          time: `${mealHour - 1}:00`,
          activity: `${meal.meal_type} 테이블 세팅`,
          responsible: "서비스팀",
          location: meal.location,
          status: "pending" as const,
        },
        {
          time: meal.time,
          activity: `${meal.meal_type} 서비스 시작`,
          responsible: "서비스팀",
          location: meal.location,
          status: "pending" as const,
        },
        {
          time: `${mealHour + 1}:00`,
          activity: `${meal.meal_type} 정리 시작`,
          responsible: "서비스팀",
          location: meal.location,
          status: "pending" as const,
        },
      ];
    });

    return {
      service_timeline: timeline,
      station_setup: [
        {
          station_name: "메인 뷔페",
          location: "Catering Zone A",
          items: ["메인 요리", "사이드", "샐러드"],
          staff_assigned: 4,
        },
        {
          station_name: "음료 스테이션",
          location: "Catering Zone B",
          items: ["커피", "차", "소프트 드링크", "물"],
          staff_assigned: 2,
        },
        {
          station_name: "디저트 스테이션",
          location: "Catering Zone C",
          items: ["케이크", "과일", "쿠키"],
          staff_assigned: 1,
        },
      ],
      quality_checkpoints: [
        {
          checkpoint: "음식 온도 체크",
          time: "서비스 시작 직전",
          criteria: ["온식 60°C 이상", "냉식 4°C 이하"],
        },
        {
          checkpoint: "위생 상태 점검",
          time: "세팅 완료 후",
          criteria: ["테이블 청결", "서빙 도구 위생", "직원 복장"],
        },
        {
          checkpoint: "수량 확인",
          time: "서비스 중간",
          criteria: ["보충 필요 여부", "인기 메뉴 재고"],
        },
      ],
      issue_log: [],
    };
  },
};
