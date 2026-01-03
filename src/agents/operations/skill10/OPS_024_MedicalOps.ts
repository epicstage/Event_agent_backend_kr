/**
 * OPS-024: Medical Operations Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_024_MedicalOps = {
  id: "OPS-024",
  name: "Medical Operations Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `의료 지원 운영 전문가. 참석자 건강과 응급 상황에 대비합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    attendees: z.number(),
    event_duration_hours: z.number(),
    outdoor_activities: z.boolean(),
  }),

  outputSchema: z.object({
    medical_stations: z.array(z.object({
      location: z.string(),
      staff: z.array(z.object({ role: z.string(), count: z.number() })),
      equipment: z.array(z.string()),
      operating_hours: z.string(),
    })),
    emergency_response: z.object({
      ambulance_access: z.string(),
      nearest_hospital: z.object({ name: z.string(), distance_km: z.number(), phone: z.string() }),
      emergency_contacts: z.array(z.object({ role: z.string(), phone: z.string() })),
    }),
    common_issues: z.array(z.object({
      issue: z.string(),
      likelihood: z.string(),
      preparation: z.string(),
    })),
    documentation: z.object({
      incident_form: z.boolean(),
      waiver_required: z.boolean(),
      reporting_protocol: z.string(),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_024_MedicalOps.inputSchema>) => {
    const stationCount = input.attendees > 2000 ? 3 : input.attendees > 500 ? 2 : 1;

    return {
      medical_stations: Array.from({ length: stationCount }, (_, i) => ({
        location: i === 0 ? "메인 로비" : `구역 ${String.fromCharCode(65 + i)}`,
        staff: [
          { role: "EMT", count: 2 },
          { role: "간호사", count: 1 },
        ],
        equipment: ["AED", "응급 키트", "휠체어", "들것", "산소 공급기"],
        operating_hours: "행사 시작 1시간 전 ~ 종료 30분 후",
      })),
      emergency_response: {
        ambulance_access: "후문 로딩독 (상시 접근 가능)",
        nearest_hospital: { name: "OO대학병원", distance_km: 3.5, phone: "02-XXX-XXXX" },
        emergency_contacts: [
          { role: "의료 책임자", phone: "010-XXXX-XXXX" },
          { role: "119 신고", phone: "119" },
          { role: "현장 총괄", phone: "010-XXXX-XXXX" },
        ],
      },
      common_issues: [
        { issue: "탈수/어지러움", likelihood: "높음", preparation: "음료 스테이션 확보" },
        { issue: "낙상", likelihood: "중간", preparation: "미끄럼 방지, 동선 정리" },
        { issue: "알레르기 반응", likelihood: "낮음", preparation: "에피펜 구비, 메뉴 표시" },
        { issue: "심장 이상", likelihood: "낮음", preparation: "AED 배치, CPR 훈련" },
      ],
      documentation: {
        incident_form: true,
        waiver_required: input.outdoor_activities,
        reporting_protocol: "모든 의료 개입 24시간 내 문서화, 심각 사례 즉시 보고",
      },
    };
  },
};
