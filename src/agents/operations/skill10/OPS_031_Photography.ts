/**
 * OPS-031: Event Photography Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_031_Photography = {
  id: "OPS-031",
  name: "Event Photography Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `이벤트 사진/영상 운영 전문가. 행사의 모든 순간을
전문적으로 기록하고 효율적으로 전달합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    event_name: z.string(),
    duration_hours: z.number(),
    key_moments: z.array(z.string()),
    deliverables: z.array(z.string()),
  }),

  outputSchema: z.object({
    photo_team: z.object({
      photographers: z.number(),
      videographers: z.number(),
      assignments: z.array(z.object({
        role: z.string(),
        coverage: z.string(),
        equipment: z.array(z.string()),
      })),
    }),
    shot_list: z.array(z.object({
      category: z.string(),
      shots: z.array(z.string()),
      priority: z.enum(["must_have", "nice_to_have"]),
    })),
    workflow: z.object({
      capture: z.string(),
      transfer: z.string(),
      editing: z.string(),
      delivery_timeline: z.array(z.object({
        deliverable: z.string(),
        deadline: z.string(),
      })),
    }),
    branding_guidelines: z.object({
      logo_placement: z.string(),
      color_treatment: z.string(),
      restrictions: z.array(z.string()),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_031_Photography.inputSchema>) => {
    const photographerCount = Math.max(2, Math.ceil(input.duration_hours / 4));

    return {
      photo_team: {
        photographers: photographerCount,
        videographers: Math.ceil(photographerCount / 2),
        assignments: [
          {
            role: "메인 포토그래퍼",
            coverage: "키노트, VIP, 주요 순간",
            equipment: ["풀프레임 카메라 2대", "24-70mm", "70-200mm", "스트로보"],
          },
          {
            role: "서브 포토그래퍼",
            coverage: "참석자, 네트워킹, 전시",
            equipment: ["풀프레임 카메라 1대", "35mm", "85mm"],
          },
          {
            role: "비디오그래퍼",
            coverage: "하이라이트 영상, 인터뷰",
            equipment: ["시네마 카메라", "짐벌", "무선 마이크"],
          },
        ],
      },
      shot_list: [
        {
          category: "오프닝",
          shots: ["빈 홀 전경", "등록 장면", "첫 참석자 도착", "오프닝 연사"],
          priority: "must_have" as const,
        },
        {
          category: "키노트/세션",
          shots: ["연사 전신", "연사 클로즈업", "청중 반응", "슬라이드와 연사"],
          priority: "must_have" as const,
        },
        {
          category: "네트워킹",
          shots: ["대화 장면", "그룹샷", "음식/음료", "자연스러운 인터랙션"],
          priority: "must_have" as const,
        },
        {
          category: "브랜딩",
          shots: ["로고 노출", "스폰서 배너", "사이니지", "굿즈"],
          priority: "must_have" as const,
        },
        {
          category: "디테일",
          shots: ["테이블 세팅", "명찰", "장식", "기술 장비"],
          priority: "nice_to_have" as const,
        },
      ],
      workflow: {
        capture: "RAW + JPEG 동시 저장, 휴식 시간마다 카드 백업",
        transfer: "현장 Wi-Fi로 실시간 업로드 (선별 사진)",
        editing: "당일 하이라이트 10장, D+2 전체 셀렉트, D+7 최종 보정",
        delivery_timeline: [
          { deliverable: "SNS용 하이라이트 10장", deadline: "당일 저녁" },
          { deliverable: "웹사이트용 셀렉트 50장", deadline: "D+2" },
          { deliverable: "전체 보정 사진", deadline: "D+7" },
          { deliverable: "하이라이트 영상 (2분)", deadline: "D+5" },
          { deliverable: "풀 이벤트 영상", deadline: "D+14" },
        ],
      },
      branding_guidelines: {
        logo_placement: "오른쪽 하단 워터마크 (불투명도 30%)",
        color_treatment: "브랜드 컬러 톤 유지, 과도한 필터 지양",
        restrictions: ["경쟁사 로고 노출 최소화", "개인정보 주의 (명찰 클로즈업 X)", "식사 중 촬영 자제"],
      },
    };
  },
};
