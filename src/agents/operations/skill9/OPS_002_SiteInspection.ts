/**
 * OPS-002: Site Inspection Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 현장 답사 및 평가
 */

import { z } from "zod";

export const OPS_002_SiteInspection = {
  id: "OPS-002",
  name: "Site Inspection Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 꼼꼼한 현장 답사 전문가입니다.
수백 건의 베뉴 인스펙션 경험을 통해 표면적으로 보이지 않는
잠재적 문제점을 발견하는 능력을 갖추고 있습니다.
체크리스트 하나하나가 이벤트 당일의 성공을 좌우한다고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_id: z.string(),
    venue_name: z.string(),
    inspection_date: z.string(),
    event_requirements: z.object({
      attendees: z.number(),
      sessions: z.number().optional(),
      exhibition_booths: z.number().optional(),
      vip_areas: z.boolean().optional(),
      outdoor_activities: z.boolean().optional(),
    }),
    focus_areas: z.array(z.string()).optional(), // capacity, av, catering, accessibility, safety
  }),

  outputSchema: z.object({
    inspection_report: z.object({
      venue_id: z.string(),
      venue_name: z.string(),
      inspection_date: z.string(),
      inspector: z.string(),
      overall_score: z.number(), // 0-100
      recommendation: z.enum(["highly_recommended", "recommended", "conditional", "not_recommended"]),
    }),
    area_assessments: z.array(z.object({
      area: z.string(),
      score: z.number(),
      findings: z.array(z.string()),
      concerns: z.array(z.string()),
      requirements_met: z.boolean(),
    })),
    capacity_analysis: z.object({
      main_space: z.object({
        name: z.string(),
        stated_capacity: z.number(),
        realistic_capacity: z.number(),
        layout_options: z.array(z.string()),
      }),
      breakout_spaces: z.array(z.object({
        name: z.string(),
        capacity: z.number(),
        suitability: z.string(),
      })),
    }),
    technical_assessment: z.object({
      power: z.object({
        adequate: z.boolean(),
        notes: z.string(),
      }),
      internet: z.object({
        type: z.string(),
        speed_mbps: z.number(),
        reliable: z.boolean(),
      }),
      av_infrastructure: z.object({
        existing_equipment: z.array(z.string()),
        additional_needed: z.array(z.string()),
      }),
    }),
    issues_log: z.array(z.object({
      severity: z.enum(["critical", "major", "minor"]),
      issue: z.string(),
      mitigation: z.string(),
    })),
    photos_notes: z.array(z.object({
      location: z.string(),
      observation: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_002_SiteInspection.inputSchema>) => {
    const baseScore = 85;

    return {
      inspection_report: {
        venue_id: input.venue_id,
        venue_name: input.venue_name,
        inspection_date: input.inspection_date,
        inspector: "Site Inspection Agent",
        overall_score: baseScore,
        recommendation: "recommended" as const,
      },
      area_assessments: [
        {
          area: "Main Event Space",
          score: 90,
          findings: [
            "천장고 6m로 무대 설치 적합",
            "기둥 없는 오픈 플로어",
            "자연광 조절 가능한 블라인드",
          ],
          concerns: ["화장실 동선 다소 멀음"],
          requirements_met: true,
        },
        {
          area: "Registration Area",
          score: 85,
          findings: [
            "넓은 로비 공간",
            "전원 콘센트 충분",
          ],
          concerns: ["외부 소음 유입 가능성"],
          requirements_met: true,
        },
        {
          area: "Catering Area",
          score: 80,
          findings: [
            "별도 케이터링 공간 확보",
            "냉장 시설 구비",
          ],
          concerns: [
            "주방 시설 제한적",
            "동선 혼잡 우려",
          ],
          requirements_met: true,
        },
        {
          area: "Loading & Access",
          score: 88,
          findings: [
            "대형 화물 엘리베이터",
            "지하 로딩독 보유",
          ],
          concerns: ["로딩독 예약 필요"],
          requirements_met: true,
        },
      ],
      capacity_analysis: {
        main_space: {
          name: "Grand Ballroom",
          stated_capacity: Math.round(input.event_requirements.attendees * 1.2),
          realistic_capacity: input.event_requirements.attendees,
          layout_options: ["Theater", "Classroom", "Banquet", "Cocktail", "U-Shape"],
        },
        breakout_spaces: [
          {
            name: "Meeting Room A",
            capacity: 50,
            suitability: "세션/워크샵 적합",
          },
          {
            name: "Meeting Room B",
            capacity: 30,
            suitability: "VIP 미팅 적합",
          },
          {
            name: "Boardroom",
            capacity: 20,
            suitability: "스피커 대기실 활용 가능",
          },
        ],
      },
      technical_assessment: {
        power: {
          adequate: true,
          notes: "3상 400V 전원 가용, 추가 분전반 설치 가능",
        },
        internet: {
          type: "Dedicated Fiber",
          speed_mbps: 1000,
          reliable: true,
        },
        av_infrastructure: {
          existing_equipment: [
            "천장 프로젝터 2대",
            "스크린 (4m x 3m)",
            "기본 음향 시스템",
            "무선 마이크 4대",
          ],
          additional_needed: [
            "LED Wall (추천)",
            "무대 조명",
            "라이브 스트리밍 장비",
            "통역 부스",
          ],
        },
      },
      issues_log: [
        {
          severity: "minor" as const,
          issue: "주차장에서 행사장까지 동선 복잡",
          mitigation: "안내 표지판 및 도우미 배치",
        },
        {
          severity: "minor" as const,
          issue: "화장실 수 다소 부족",
          mitigation: "휴식시간 분산 운영",
        },
      ],
      photos_notes: [
        {
          location: "Main Entrance",
          observation: "브랜딩 배너 설치 적합한 공간 확인",
        },
        {
          location: "Backstage",
          observation: "스피커 대기 공간 충분, 별도 출입구 있음",
        },
        {
          location: "Parking Area",
          observation: "VIP 전용 주차 10대 확보 가능",
        },
      ],
    };
  },
};
