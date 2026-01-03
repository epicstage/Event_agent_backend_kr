/**
 * OPS-006: Accessibility Planning Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 접근성 및 포용적 이벤트 설계
 */

import { z } from "zod";

export const OPS_006_AccessibilityPlanning = {
  id: "OPS-006",
  name: "Accessibility Planning Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 접근성 및 포용성 전문가입니다.
모든 참석자가 차별 없이 동등한 경험을 할 수 있도록
물리적, 감각적, 인지적 접근성을 설계합니다.
다양성과 포용은 선택이 아닌 필수라고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_id: z.string(),
    expected_attendees: z.number(),
    accessibility_requests: z.object({
      wheelchair_users: z.number().optional(),
      hearing_impaired: z.number().optional(),
      visually_impaired: z.number().optional(),
      mobility_limited: z.number().optional(),
      dietary_restrictions: z.array(z.string()).optional(),
      other_needs: z.array(z.string()).optional(),
    }).optional(),
    venue_current_features: z.array(z.string()).optional(),
  }),

  outputSchema: z.object({
    accessibility_audit: z.object({
      overall_score: z.number(),
      compliance_status: z.string(),
      areas_assessed: z.array(z.object({
        area: z.string(),
        score: z.number(),
        status: z.enum(["compliant", "partial", "non_compliant"]),
        notes: z.string(),
      })),
    }),
    physical_accessibility: z.object({
      wheelchair_access: z.array(z.object({
        feature: z.string(),
        status: z.enum(["available", "needed", "not_applicable"]),
        action_required: z.string().optional(),
      })),
      seating_accommodations: z.object({
        wheelchair_spaces: z.number(),
        companion_seats: z.number(),
        accessible_seating_location: z.string(),
      }),
      restroom_facilities: z.object({
        accessible_restrooms: z.number(),
        locations: z.array(z.string()),
      }),
    }),
    sensory_accessibility: z.object({
      hearing_support: z.array(z.object({
        service: z.string(),
        availability: z.string(),
        cost: z.string(),
      })),
      visual_support: z.array(z.object({
        service: z.string(),
        availability: z.string(),
        notes: z.string(),
      })),
    }),
    communication_accessibility: z.object({
      sign_language_interpreters: z.number(),
      captioning: z.string(),
      multilingual_support: z.array(z.string()),
      accessible_materials: z.array(z.string()),
    }),
    dietary_accommodations: z.array(z.object({
      restriction: z.string(),
      accommodation: z.string(),
      labeling: z.string(),
    })),
    staff_training: z.array(z.object({
      topic: z.string(),
      target_staff: z.string(),
      duration: z.string(),
    })),
    emergency_procedures: z.object({
      evacuation_plan: z.string(),
      safe_areas: z.array(z.string()),
      buddy_system: z.boolean(),
      communication_methods: z.array(z.string()),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_006_AccessibilityPlanning.inputSchema>) => {
    const requests = input.accessibility_requests || {};

    return {
      accessibility_audit: {
        overall_score: 85,
        compliance_status: "Substantially Compliant - Minor improvements needed",
        areas_assessed: [
          { area: "Entrance & Exit", score: 90, status: "compliant" as const, notes: "자동문, 경사로 완비" },
          { area: "Circulation Paths", score: 85, status: "compliant" as const, notes: "통로폭 1.5m 이상 확보" },
          { area: "Restrooms", score: 80, status: "partial" as const, notes: "접근성 화장실 2개소, 추가 필요" },
          { area: "Signage", score: 75, status: "partial" as const, notes: "점자 표지판 일부 누락" },
          { area: "Emergency Egress", score: 88, status: "compliant" as const, notes: "피난 경로 적정" },
        ],
      },
      physical_accessibility: {
        wheelchair_access: [
          { feature: "주 출입구 경사로", status: "available" as const },
          { feature: "엘리베이터", status: "available" as const },
          { feature: "무대 접근 경사로", status: "needed" as const, action_required: "이동식 경사로 대여 필요" },
          { feature: "전시 부스 통로", status: "available" as const },
        ],
        seating_accommodations: {
          wheelchair_spaces: Math.max(requests.wheelchair_users || 0, Math.ceil(input.expected_attendees * 0.01)),
          companion_seats: Math.max((requests.wheelchair_users || 0) * 2, Math.ceil(input.expected_attendees * 0.02)),
          accessible_seating_location: "메인홀 앞줄 측면 및 후면 지정 구역",
        },
        restroom_facilities: {
          accessible_restrooms: 3,
          locations: ["로비 1층", "메인홀 후면", "케이터링 구역"],
        },
      },
      sensory_accessibility: {
        hearing_support: [
          { service: "보청기 루프 시스템", availability: "메인홀 설치됨", cost: "포함" },
          { service: "실시간 자막", availability: "신청 시 제공", cost: "추가 비용" },
          { service: "FM 수신기", availability: "50대 보유", cost: "무료 대여" },
        ],
        visual_support: [
          { service: "점자 프로그램북", availability: "사전 제작 필요", notes: "인쇄 2주 소요" },
          { service: "대형 인쇄물", availability: "제공 가능", notes: "16pt 이상 폰트" },
          { service: "안내 도우미", availability: "배정 가능", notes: "사전 신청 필요" },
        ],
      },
      communication_accessibility: {
        sign_language_interpreters: Math.max(requests.hearing_impaired || 0, 2),
        captioning: "실시간 AI 자막 + 수화 통역 병행",
        multilingual_support: ["한국어", "영어", "중국어 (동시통역)"],
        accessible_materials: [
          "디지털 프로그램 (스크린리더 호환)",
          "대형 인쇄 안내문",
          "점자 안내 카드",
          "쉬운 언어 버전",
        ],
      },
      dietary_accommodations: [
        { restriction: "채식", accommodation: "별도 뷔페 라인", labeling: "초록색 라벨" },
        { restriction: "비건", accommodation: "별도 메뉴", labeling: "V 마크" },
        { restriction: "할랄", accommodation: "인증 케이터러", labeling: "할랄 인증 마크" },
        { restriction: "글루텐프리", accommodation: "별도 조리", labeling: "GF 마크" },
        { restriction: "알레르기", accommodation: "성분표 비치", labeling: "알레르겐 표시" },
      ],
      staff_training: [
        { topic: "장애인 응대 기본", target_staff: "전 스태프", duration: "1시간" },
        { topic: "휠체어 보조 방법", target_staff: "안내 요원", duration: "30분" },
        { topic: "청각장애인 커뮤니케이션", target_staff: "등록 데스크", duration: "30분" },
        { topic: "응급 대피 보조", target_staff: "안전 요원", duration: "1시간" },
      ],
      emergency_procedures: {
        evacuation_plan: "층별 대피 경로도 작성 및 접근성 대피 구역 지정",
        safe_areas: ["1층 로비 동측", "2층 테라스 (승강기 도착 가능)"],
        buddy_system: true,
        communication_methods: ["육성 안내", "전광판", "진동 알림", "수화 통역"],
      },
    };
  },
};
