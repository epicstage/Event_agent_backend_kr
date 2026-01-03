/**
 * OPS-036: Accessibility Operations Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_036_AccessibilityOps = {
  id: "OPS-036",
  name: "Accessibility Operations Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `접근성 운영 전문가. 모든 참석자가 동등하게 행사를
경험할 수 있도록 현장 접근성을 보장합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    accessibility_requests: z.array(z.object({
      request_id: z.string(),
      type: z.string(),
      details: z.string(),
    })),
    venue_accessibility: z.object({
      wheelchair_access: z.boolean(),
      elevator: z.boolean(),
      accessible_restrooms: z.boolean(),
    }),
  }),

  outputSchema: z.object({
    accessibility_features: z.array(z.object({
      feature: z.string(),
      location: z.string(),
      availability: z.string(),
      contact: z.string(),
    })),
    service_assignments: z.array(z.object({
      request_id: z.string(),
      service_provided: z.string(),
      assigned_staff: z.string(),
      meeting_point: z.string(),
    })),
    communication_plan: z.object({
      pre_event: z.array(z.string()),
      on_site: z.array(z.string()),
      emergency: z.string(),
    }),
    staff_training: z.array(z.object({
      topic: z.string(),
      content: z.string(),
      duration: z.string(),
    })),
    venue_adaptations: z.array(z.object({
      area: z.string(),
      adaptation: z.string(),
      responsible: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_036_AccessibilityOps.inputSchema>) => {
    return {
      accessibility_features: [
        {
          feature: "휠체어 경사로",
          location: "정문, 세션 홀 입구",
          availability: "상시",
          contact: "안내 데스크",
        },
        {
          feature: "수어 통역",
          location: "메인 스테이지 좌측",
          availability: "키노트 및 주요 세션",
          contact: "사전 신청 필요",
        },
        {
          feature: "실시간 자막",
          location: "메인 스크린 하단",
          availability: "모든 세션",
          contact: "자동 제공",
        },
        {
          feature: "장애인 주차",
          location: "주차장 입구 인접",
          availability: "5대 예약",
          contact: "사전 등록 시 신청",
        },
        {
          feature: "보조 청취 기기",
          location: "등록 데스크",
          availability: "대여 가능 (20대)",
          contact: "등록 시 요청",
        },
      ],
      service_assignments: input.accessibility_requests.map((req, idx) => ({
        request_id: req.request_id,
        service_provided: getServiceForType(req.type),
        assigned_staff: `접근성 도우미 ${idx + 1}`,
        meeting_point: "VIP 입구 접근성 데스크",
      })),
      communication_plan: {
        pre_event: [
          "등록 확인 이메일에 접근성 서비스 안내",
          "D-3 개별 연락으로 상세 니즈 확인",
          "행사장 접근성 지도 PDF 발송",
        ],
        on_site: [
          "접근성 데스크 별도 운영 (빠른 입장)",
          "접근성 도우미 명찰 착용 (쉬운 식별)",
          "긴급 연락 카드 배포",
        ],
        emergency: "접근성 참석자 우선 대피, 전담 도우미 동행, 대피 어셈블리 포인트 별도 지정",
      },
      staff_training: [
        {
          topic: "장애 인식 교육",
          content: "적절한 언어 사용, 에티켓, 도움 제공 방법",
          duration: "1시간",
        },
        {
          topic: "휠체어 보조",
          content: "안전한 이동 보조, 경사로/엘리베이터 안내",
          duration: "30분",
        },
        {
          topic: "시각 장애 안내",
          content: "언어 설명, 팔 안내법, 점자 자료 안내",
          duration: "30분",
        },
        {
          topic: "청각 장애 소통",
          content: "필담, 명확한 발음, 시각 자료 활용",
          duration: "30분",
        },
      ],
      venue_adaptations: [
        { area: "등록 데스크", adaptation: "낮은 카운터 1개 확보", responsible: "등록팀" },
        { area: "세션 홀", adaptation: "휠체어 좌석 구역 표시 및 확보", responsible: "시설팀" },
        { area: "케이터링", adaptation: "접근 가능한 높이 테이블 배치", responsible: "F&B팀" },
        { area: "화장실", adaptation: "장애인 화장실 위치 안내 강화", responsible: "사이니지팀" },
      ],
    };

    function getServiceForType(type: string): string {
      const services: Record<string, string> = {
        wheelchair: "휠체어 이동 보조 및 우선 좌석",
        hearing: "수어 통역 및 보조 청취 기기",
        visual: "점자 자료 및 음성 안내",
        mobility: "이동 보조 및 휴식 공간 안내",
        cognitive: "조용한 공간 안내 및 1:1 도우미",
      };
      return services[type] || "개별 맞춤 지원";
    }
  },
};
