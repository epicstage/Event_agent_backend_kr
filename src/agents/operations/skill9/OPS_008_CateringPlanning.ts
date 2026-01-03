/**
 * OPS-008: Catering Planning Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 식음료 기획 및 메뉴 설계
 */

import { z } from "zod";

export const OPS_008_CateringPlanning = {
  id: "OPS-008",
  name: "Catering Planning Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 케이터링 전문가입니다.
참석자 경험, 예산 효율성, 운영 실행력을 모두 고려한
최적의 F&B 계획을 수립합니다.
음식이 이벤트의 기억을 결정한다고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    event_dates: z.array(z.string()),
    attendees: z.number(),
    meal_requirements: z.array(z.object({
      meal_type: z.string(), // breakfast, coffee_break, lunch, dinner, cocktail
      date: z.string(),
      time: z.string(),
    })),
    dietary_breakdown: z.object({
      vegetarian: z.number().optional(),
      vegan: z.number().optional(),
      halal: z.number().optional(),
      kosher: z.number().optional(),
      gluten_free: z.number().optional(),
      other: z.array(z.object({ type: z.string(), count: z.number() })).optional(),
    }).optional(),
    budget_per_person: z.number(),
    event_style: z.string(), // formal, casual, networking, conference
  }),

  outputSchema: z.object({
    catering_plan: z.object({
      total_meals: z.number(),
      total_budget: z.number(),
      caterer_recommendations: z.array(z.object({
        name: z.string(),
        specialty: z.string(),
        price_range: z.string(),
        rating: z.number(),
      })),
    }),
    meal_plans: z.array(z.object({
      meal_id: z.string(),
      meal_type: z.string(),
      date: z.string(),
      time: z.string(),
      service_style: z.string(),
      menu: z.object({
        main_items: z.array(z.string()),
        sides: z.array(z.string()),
        beverages: z.array(z.string()),
        dessert: z.array(z.string()).optional(),
      }),
      dietary_options: z.array(z.object({
        type: z.string(),
        items: z.array(z.string()),
        quantity: z.number(),
      })),
      estimated_cost: z.number(),
      setup_requirements: z.array(z.string()),
    })),
    beverage_plan: z.object({
      coffee_service: z.object({
        stations: z.number(),
        hours: z.number(),
        includes: z.array(z.string()),
      }),
      bar_service: z.object({
        type: z.string(),
        hours: z.number(),
        includes: z.array(z.string()),
      }).optional(),
    }),
    logistics: z.object({
      service_staff: z.number(),
      setup_time_mins: z.number(),
      cleanup_time_mins: z.number(),
      equipment_needed: z.array(z.string()),
      food_safety_notes: z.array(z.string()),
    }),
    cost_breakdown: z.object({
      food_cost: z.number(),
      beverage_cost: z.number(),
      service_cost: z.number(),
      equipment_rental: z.number(),
      gratuity: z.number(),
      total: z.number(),
      per_person: z.number(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_008_CateringPlanning.inputSchema>) => {
    const totalBudget = input.budget_per_person * input.attendees * input.meal_requirements.length * 0.7;
    const dietary = input.dietary_breakdown || {};

    const mealPlans = input.meal_requirements.map((meal, idx) => {
      const costMultiplier = meal.meal_type === "dinner" ? 1.5
        : meal.meal_type === "lunch" ? 1.0
        : meal.meal_type === "breakfast" ? 0.6
        : 0.3;

      return {
        meal_id: `MEAL-${String(idx + 1).padStart(2, "0")}`,
        meal_type: meal.meal_type,
        date: meal.date,
        time: meal.time,
        service_style: meal.meal_type === "coffee_break" ? "Self-Service Station"
          : meal.meal_type === "cocktail" ? "Passed & Stations"
          : input.event_style === "formal" ? "Plated Service"
          : "Buffet",
        menu: getMenuForMealType(meal.meal_type),
        dietary_options: [
          { type: "Vegetarian", items: ["계절 채소 요리", "버섯 리조또"], quantity: dietary.vegetarian || Math.ceil(input.attendees * 0.1) },
          { type: "Vegan", items: ["두부 스테이크", "퀴노아 샐러드"], quantity: dietary.vegan || Math.ceil(input.attendees * 0.05) },
          { type: "Gluten-Free", items: ["글루텐프리 파스타", "그릴 치킨"], quantity: dietary.gluten_free || Math.ceil(input.attendees * 0.05) },
        ],
        estimated_cost: Math.round(input.budget_per_person * costMultiplier * input.attendees),
        setup_requirements: [
          "뷔페 테이블 6개",
          "음료 스테이션 2개",
          "하이탑 테이블 10개",
          "냅킨/수저 세트",
        ],
      };
    });

    function getMenuForMealType(mealType: string) {
      const menus: Record<string, { main_items: string[]; sides: string[]; beverages: string[]; dessert?: string[] }> = {
        breakfast: {
          main_items: ["계란 요리 (스크램블/오믈렛)", "팬케이크/와플", "베이컨/소시지"],
          sides: ["신선한 과일", "요거트", "토스트/베이글"],
          beverages: ["커피", "주스", "우유"],
        },
        coffee_break: {
          main_items: ["미니 샌드위치", "쿠키/머핀"],
          sides: ["신선한 과일", "에너지바"],
          beverages: ["커피", "차", "생수"],
        },
        lunch: {
          main_items: ["그릴 연어", "안심 스테이크", "치킨 요리"],
          sides: ["계절 샐러드", "로스트 야채", "밥/빵"],
          beverages: ["커피", "차", "주스", "생수"],
          dessert: ["과일 타르트", "티라미수"],
        },
        dinner: {
          main_items: ["프라임 립아이", "랍스터 테일", "덕 콩피"],
          sides: ["트러플 매쉬", "그릴 아스파라거스", "와일드 라이스"],
          beverages: ["와인 (레드/화이트)", "맥주", "칵테일"],
          dessert: ["초콜릿 퐁듀", "마카롱 타워", "아이스크림"],
        },
        cocktail: {
          main_items: ["새우 칵테일", "미니 슬라이더", "참치 타르타르"],
          sides: ["치즈 플래터", "크루디테", "카나페"],
          beverages: ["시그니처 칵테일", "와인", "맥주", "논알콜 옵션"],
        },
      };
      return menus[mealType] || menus.lunch;
    }

    const foodCost = totalBudget * 0.55;
    const beverageCost = totalBudget * 0.2;
    const serviceCost = totalBudget * 0.15;
    const equipmentCost = totalBudget * 0.05;
    const gratuity = totalBudget * 0.05;

    return {
      catering_plan: {
        total_meals: input.meal_requirements.length,
        total_budget: Math.round(totalBudget),
        caterer_recommendations: [
          { name: "Premier Catering Co.", specialty: "Corporate Events", price_range: "Premium", rating: 4.8 },
          { name: "Fresh Kitchen", specialty: "Farm-to-Table", price_range: "Mid-High", rating: 4.6 },
          { name: "Global Flavors", specialty: "International Cuisine", price_range: "Mid", rating: 4.5 },
        ],
      },
      meal_plans: mealPlans,
      beverage_plan: {
        coffee_service: {
          stations: Math.ceil(input.attendees / 100),
          hours: 8,
          includes: ["프리미엄 커피", "에스프레소", "각종 차", "생수", "탄산수"],
        },
        bar_service: input.event_style === "formal" || input.meal_requirements.some(m => m.meal_type === "dinner") ? {
          type: "Open Bar",
          hours: 3,
          includes: ["하우스 와인", "프리미엄 맥주", "기본 칵테일", "논알콜 옵션"],
        } : undefined,
      },
      logistics: {
        service_staff: Math.ceil(input.attendees / 25),
        setup_time_mins: 120,
        cleanup_time_mins: 90,
        equipment_needed: [
          "뷔페 테이블 (6ft)",
          "차핑디쉬",
          "음료 디스펜서",
          "테이블보 및 스커트",
          "서빙 용품",
        ],
        food_safety_notes: [
          "온식: 60°C 이상 유지",
          "냉식: 4°C 이하 유지",
          "알레르겐 라벨링 필수",
          "2시간 이상 상온 노출 금지",
        ],
      },
      cost_breakdown: {
        food_cost: Math.round(foodCost),
        beverage_cost: Math.round(beverageCost),
        service_cost: Math.round(serviceCost),
        equipment_rental: Math.round(equipmentCost),
        gratuity: Math.round(gratuity),
        total: Math.round(totalBudget),
        per_person: Math.round(totalBudget / input.attendees),
      },
    };
  },
};
