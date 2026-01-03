/**
 * OPS-012: Signage Planning Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 사이니지 및 웨이파인딩 계획
 */

import { z } from "zod";

export const OPS_012_SignagePlanning = {
  id: "OPS-012",
  name: "Signage Planning Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 사이니지/웨이파인딩 전문가입니다.
참석자가 직관적으로 이동할 수 있도록 안내 시스템을 설계합니다.
브랜딩과 기능성의 균형을 추구하며,
좋은 사이니지는 질문을 예방한다고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_layout: z.object({
      floors: z.number(),
      main_areas: z.array(z.string()),
      entry_points: z.number(),
    }),
    branding_guidelines: z.object({
      primary_color: z.string(),
      secondary_color: z.string(),
      logo_url: z.string().optional(),
      font_family: z.string().optional(),
    }),
    event_name: z.string(),
    sessions_count: z.number(),
    attendees: z.number(),
    multilingual: z.array(z.string()).optional(),
  }),

  outputSchema: z.object({
    signage_plan: z.object({
      total_signs: z.number(),
      total_cost_estimate: z.number(),
      production_timeline_days: z.number(),
    }),
    signage_inventory: z.array(z.object({
      sign_type: z.string(),
      location: z.string(),
      dimensions: z.string(),
      material: z.string(),
      quantity: z.number(),
      unit_cost: z.number(),
      installation_method: z.string(),
    })),
    wayfinding_system: z.object({
      strategy: z.string(),
      color_coding: z.array(z.object({
        zone: z.string(),
        color: z.string(),
        hex_code: z.string(),
      })),
      icon_system: z.array(z.object({
        meaning: z.string(),
        icon_description: z.string(),
      })),
      floor_markers: z.boolean(),
    }),
    digital_signage: z.object({
      screens: z.array(z.object({
        location: z.string(),
        size_inches: z.number(),
        content_type: z.string(),
        refresh_rate: z.string(),
      })),
      content_management: z.string(),
      real_time_updates: z.boolean(),
    }),
    accessibility_signage: z.array(z.object({
      type: z.string(),
      locations: z.array(z.string()),
      features: z.array(z.string()),
    })),
    sponsor_signage: z.object({
      locations: z.array(z.string()),
      sizes_available: z.array(z.string()),
      visibility_rating: z.array(z.object({
        location: z.string(),
        rating: z.enum(["premium", "high", "standard"]),
      })),
    }),
    production_specs: z.object({
      vendor_requirements: z.array(z.string()),
      file_formats: z.array(z.string()),
      deadline: z.string(),
      installation_schedule: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_012_SignagePlanning.inputSchema>) => {
    const baseSignCount = 20 + input.venue_layout.floors * 10 + input.sessions_count * 2;

    return {
      signage_plan: {
        total_signs: baseSignCount,
        total_cost_estimate: baseSignCount * 150000,
        production_timeline_days: 14,
      },
      signage_inventory: [
        {
          sign_type: "메인 이벤트 배너",
          location: "정문 외부",
          dimensions: "6m x 2m",
          material: "메쉬 배너 (방염)",
          quantity: 2,
          unit_cost: 500000,
          installation_method: "프레임 고정",
        },
        {
          sign_type: "웰컴 사인",
          location: "로비 중앙",
          dimensions: "3m x 2.5m",
          material: "폼보드 + 우드 프레임",
          quantity: 1,
          unit_cost: 800000,
          installation_method: "자립형 스탠드",
        },
        {
          sign_type: "방향 안내판",
          location: "주요 교차점",
          dimensions: "1m x 0.6m",
          material: "아크릴 + LED 백라이트",
          quantity: 10,
          unit_cost: 200000,
          installation_method: "천장 서스펜션 / 벽면 부착",
        },
        {
          sign_type: "세션 룸 표지",
          location: "각 세션 룸 입구",
          dimensions: "0.4m x 0.3m",
          material: "아크릴",
          quantity: input.sessions_count,
          unit_cost: 50000,
          installation_method: "도어 사이드 부착",
        },
        {
          sign_type: "바닥 스티커",
          location: "주요 동선",
          dimensions: "0.5m 원형",
          material: "방수 비닐 스티커",
          quantity: 30,
          unit_cost: 15000,
          installation_method: "바닥 부착",
        },
        {
          sign_type: "롤업 배너",
          location: "등록 / 포토존 / 스폰서 구역",
          dimensions: "0.85m x 2m",
          material: "PP 합성지",
          quantity: 15,
          unit_cost: 80000,
          installation_method: "롤업 스탠드",
        },
        {
          sign_type: "A형 입간판",
          location: "외부 / 주차장",
          dimensions: "0.6m x 0.9m",
          material: "알루미늄 + 포맥스",
          quantity: 5,
          unit_cost: 100000,
          installation_method: "자립형",
        },
      ],
      wayfinding_system: {
        strategy: "색상 코딩 + 아이콘 + 바닥 마커 통합 시스템",
        color_coding: [
          { zone: "컨퍼런스 홀", color: "Blue", hex_code: "#0066CC" },
          { zone: "전시 구역", color: "Green", hex_code: "#00AA55" },
          { zone: "네트워킹", color: "Orange", hex_code: "#FF6600" },
          { zone: "케이터링", color: "Red", hex_code: "#CC0033" },
          { zone: "등록/서비스", color: "Purple", hex_code: "#6600CC" },
        ],
        icon_system: [
          { meaning: "등록/체크인", icon_description: "체크마크 + 배지" },
          { meaning: "세션/강연", icon_description: "마이크 + 말풍선" },
          { meaning: "식사/카페", icon_description: "커피컵/포크나이프" },
          { meaning: "화장실", icon_description: "국제 표준 픽토그램" },
          { meaning: "비상구", icon_description: "국제 표준 픽토그램" },
          { meaning: "정보/도움", icon_description: "물음표 + i" },
        ],
        floor_markers: true,
      },
      digital_signage: {
        screens: [
          { location: "로비 메인", size_inches: 75, content_type: "세션 스케줄 + 안내", refresh_rate: "5분" },
          { location: "메인홀 입구", size_inches: 55, content_type: "현재 세션 정보", refresh_rate: "실시간" },
          { location: "케이터링 구역", size_inches: 43, content_type: "메뉴 + 스폰서", refresh_rate: "30분" },
        ],
        content_management: "클라우드 기반 CMS (원격 업데이트 지원)",
        real_time_updates: true,
      },
      accessibility_signage: [
        {
          type: "점자 안내판",
          locations: ["로비 안내 데스크", "엘리베이터 앞", "화장실 입구"],
          features: ["촉각 픽토그램", "점자 텍스트", "높은 대비 색상"],
        },
        {
          type: "청각 장애인 안내",
          locations: ["메인홀", "등록 데스크"],
          features: ["수화 통역 안내", "자막 제공 표시", "진동 알림 안내"],
        },
        {
          type: "휠체어 경로 안내",
          locations: ["입구", "엘리베이터", "접근성 좌석"],
          features: ["경사로 위치", "넓은 통로 표시", "접근 가능 화장실"],
        },
      ],
      sponsor_signage: {
        locations: [
          "메인 스테이지 백드롭",
          "등록 데스크 후면",
          "네트워킹 라운지",
          "포토월",
          "행사장 입구",
        ],
        sizes_available: ["대형 (3m x 2m)", "중형 (2m x 1m)", "소형 (1m x 0.5m)"],
        visibility_rating: [
          { location: "메인 스테이지 백드롭", rating: "premium" as const },
          { location: "등록 데스크 후면", rating: "premium" as const },
          { location: "네트워킹 라운지", rating: "high" as const },
          { location: "포토월", rating: "high" as const },
          { location: "행사장 입구", rating: "standard" as const },
        ],
      },
      production_specs: {
        vendor_requirements: [
          "대형 출력 가능 (6m 이상)",
          "당일 설치 인력 제공",
          "방염 인증서 제출",
          "수정 1회 포함",
        ],
        file_formats: ["AI (원본)", "PDF (인쇄용)", "PNG (디지털용)"],
        deadline: "D-10 최종 디자인 확정",
        installation_schedule: "D-1 09:00-18:00",
      },
    };
  },
};
