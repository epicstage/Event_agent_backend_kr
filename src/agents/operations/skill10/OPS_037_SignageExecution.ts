/**
 * OPS-037: Signage Execution Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_037_SignageExecution = {
  id: "OPS-037",
  name: "Signage Execution Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `사이니지 실행 전문가. 계획된 모든 사이니지가
제 위치에 완벽하게 설치되도록 관리합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    signage_list: z.array(z.object({
      signage_id: z.string(),
      type: z.string(),
      location: z.string(),
      content: z.string(),
      size: z.string(),
    })),
    installation_date: z.string(),
  }),

  outputSchema: z.object({
    installation_schedule: z.array(z.object({
      phase: z.string(),
      time: z.string(),
      signage_types: z.array(z.string()),
      crew_required: z.number(),
    })),
    placement_checklist: z.array(z.object({
      signage_id: z.string(),
      location: z.string(),
      height: z.string(),
      mounting: z.string(),
      status: z.enum(["pending", "installed", "verified"]),
    })),
    quality_checks: z.array(z.object({
      checkpoint: z.string(),
      criteria: z.array(z.string()),
    })),
    contingency: z.object({
      spare_signage: z.array(z.string()),
      rapid_print_contact: z.string(),
      toolkit: z.array(z.string()),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_037_SignageExecution.inputSchema>) => {
    return {
      installation_schedule: [
        {
          phase: "대형 구조물",
          time: `${input.installation_date} 08:00-12:00`,
          signage_types: ["메인 배너", "스테이지 백드롭", "포토월"],
          crew_required: 6,
        },
        {
          phase: "방향 안내",
          time: `${input.installation_date} 10:00-14:00`,
          signage_types: ["웨이파인딩", "존 표시", "화장실/비상구 안내"],
          crew_required: 4,
        },
        {
          phase: "세부 사이니지",
          time: `${input.installation_date} 13:00-17:00`,
          signage_types: ["세션 안내", "스폰서 로고", "테이블 텐트"],
          crew_required: 3,
        },
        {
          phase: "디지털 사이니지",
          time: `${input.installation_date} 14:00-16:00`,
          signage_types: ["디지털 키오스크", "LED 스크린 콘텐츠"],
          crew_required: 2,
        },
        {
          phase: "최종 점검",
          time: `${input.installation_date} 17:00-18:00`,
          signage_types: ["전체 워크스루"],
          crew_required: 2,
        },
      ],
      placement_checklist: input.signage_list.map((sign) => ({
        signage_id: sign.signage_id,
        location: sign.location,
        height: getRecommendedHeight(sign.type),
        mounting: getMountingMethod(sign.type),
        status: "pending" as const,
      })),
      quality_checks: [
        {
          checkpoint: "가시성",
          criteria: ["10m 거리에서 읽기 가능", "조명 반사 없음", "가림 없음"],
        },
        {
          checkpoint: "정렬",
          criteria: ["수평/수직 정렬", "일관된 높이", "간격 균일"],
        },
        {
          checkpoint: "브랜딩",
          criteria: ["로고 정확성", "컬러 일치", "오탈자 없음"],
        },
        {
          checkpoint: "안전",
          criteria: ["견고한 고정", "통로 미침범", "낙하 위험 없음"],
        },
      ],
      contingency: {
        spare_signage: ["방향 안내판 5개", "빈 배너 2개", "A3 프레임 10개"],
        rapid_print_contact: "현장 인쇄 업체 (30분 내 제작 가능)",
        toolkit: ["케이블 타이", "양면 테이프", "피아노 와이어", "레벨기", "사다리"],
      },
    };

    function getRecommendedHeight(type: string): string {
      const heights: Record<string, string> = {
        banner: "바닥에서 2.5m (하단 기준)",
        wayfinding: "눈높이 1.5m",
        table_tent: "테이블 위 (고정)",
        floor_standing: "1.8m 스탠드",
      };
      return heights[type] || "표준 높이 1.5m";
    }

    function getMountingMethod(type: string): string {
      const methods: Record<string, string> = {
        banner: "트러스 부착 / 천장 행거",
        wayfinding: "스탠드 또는 벽 부착",
        backdrop: "프레임 자립형",
        floor_graphic: "바닥 스티커 (미끄럼 방지)",
      };
      return methods[type] || "상황에 맞게 선택";
    }
  },
};
