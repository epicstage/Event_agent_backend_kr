/**
 * OPS-010: Safety Planning Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 안전 및 비상 계획 수립
 */

import { z } from "zod";

export const OPS_010_SafetyPlanning = {
  id: "OPS-010",
  name: "Safety Planning Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 안전 관리 전문가입니다.
15년간 대형 이벤트의 안전 총괄을 맡아 무사고 기록을 유지해왔습니다.
'안전에는 타협이 없다'는 원칙으로 모든 시나리오에 대비합니다.
참석자 한 명 한 명의 안전이 이벤트 성공의 전제조건입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_id: z.string(),
    expected_attendees: z.number(),
    event_type: z.string(),
    event_dates: z.array(z.string()),
    venue_features: z.object({
      floors: z.number(),
      exits: z.number(),
      fire_suppression: z.boolean(),
      security_cameras: z.boolean(),
      medical_room: z.boolean(),
    }),
    special_considerations: z.array(z.string()).optional(), // outdoor, pyrotechnics, alcohol, vip
  }),

  outputSchema: z.object({
    safety_assessment: z.object({
      risk_level: z.enum(["low", "medium", "high"]),
      key_risks: z.array(z.object({
        risk: z.string(),
        likelihood: z.enum(["low", "medium", "high"]),
        impact: z.enum(["low", "medium", "high"]),
        mitigation: z.string(),
      })),
      compliance_status: z.string(),
    }),
    emergency_plan: z.object({
      evacuation_procedures: z.object({
        primary_routes: z.array(z.string()),
        secondary_routes: z.array(z.string()),
        assembly_points: z.array(z.string()),
        evacuation_time_estimate_mins: z.number(),
      }),
      emergency_contacts: z.array(z.object({
        role: z.string(),
        name: z.string(),
        phone: z.string(),
        backup: z.string(),
      })),
      communication_protocol: z.object({
        primary_channel: z.string(),
        backup_channel: z.string(),
        code_words: z.array(z.object({
          situation: z.string(),
          code: z.string(),
        })),
      }),
    }),
    medical_plan: z.object({
      first_aid_stations: z.array(z.object({
        location: z.string(),
        equipment: z.array(z.string()),
        staff: z.number(),
      })),
      ambulance_access: z.object({
        entry_point: z.string(),
        staging_area: z.string(),
        response_time_mins: z.number(),
      }),
      hospital_info: z.object({
        nearest_hospital: z.string(),
        distance_km: z.number(),
        trauma_level: z.string(),
      }),
    }),
    security_plan: z.object({
      access_control: z.object({
        entry_points: z.number(),
        screening_type: z.string(),
        credentials: z.array(z.string()),
      }),
      security_personnel: z.object({
        total: z.number(),
        positions: z.array(z.object({
          location: z.string(),
          count: z.number(),
          role: z.string(),
        })),
      }),
      crowd_management: z.object({
        max_density: z.string(),
        flow_control: z.array(z.string()),
        bottleneck_mitigations: z.array(z.string()),
      }),
    }),
    permits_and_insurance: z.object({
      required_permits: z.array(z.object({
        permit_type: z.string(),
        issuing_authority: z.string(),
        status: z.enum(["obtained", "pending", "not_started"]),
        deadline: z.string(),
      })),
      insurance_requirements: z.array(z.object({
        type: z.string(),
        coverage: z.number(),
        status: z.string(),
      })),
    }),
    training_requirements: z.array(z.object({
      topic: z.string(),
      target_audience: z.string(),
      duration: z.string(),
      mandatory: z.boolean(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_010_SafetyPlanning.inputSchema>) => {
    const riskLevel = input.expected_attendees > 5000 ? "high" as const
      : input.expected_attendees > 1000 ? "medium" as const
      : "low" as const;

    const securityCount = Math.ceil(input.expected_attendees / 100);
    const medicalStaff = Math.ceil(input.expected_attendees / 500);

    return {
      safety_assessment: {
        risk_level: riskLevel,
        key_risks: [
          {
            risk: "군중 압착/과밀",
            likelihood: riskLevel,
            impact: "high" as const,
            mitigation: "실시간 인원 모니터링, 입장 통제, 복수 동선 확보",
          },
          {
            risk: "화재",
            likelihood: "low" as const,
            impact: "high" as const,
            mitigation: "소방 시설 점검, 비상구 확보, 소화기 배치",
          },
          {
            risk: "의료 응급상황",
            likelihood: "medium" as const,
            impact: "medium" as const,
            mitigation: "의료진 상주, AED 배치, 응급 후송 경로 확보",
          },
          {
            risk: "보안 위협",
            likelihood: "low" as const,
            impact: "high" as const,
            mitigation: "입장 스크리닝, CCTV 모니터링, 경비 인력 배치",
          },
          {
            risk: "악천후",
            likelihood: "medium" as const,
            impact: "medium" as const,
            mitigation: "기상 모니터링, 실내 대체 공간, 통보 시스템",
          },
        ],
        compliance_status: "사전 검토 완료 - 현장 점검 필요",
      },
      emergency_plan: {
        evacuation_procedures: {
          primary_routes: [
            "정문 → 주차장 방향",
            "후문 → 공원 방향",
            "측면 비상구 → 대로변",
          ],
          secondary_routes: [
            "지하 통로 → 인접 건물",
            "옥상 → 헬기 접근 (대형 화재 시)",
          ],
          assembly_points: [
            "주차장 A구역 (정문 대피자)",
            "공원 광장 (후문 대피자)",
            "인접 주차빌딩 (측면 대피자)",
          ],
          evacuation_time_estimate_mins: Math.ceil(input.expected_attendees / (input.venue_features.exits * 50)),
        },
        emergency_contacts: [
          { role: "총괄 안전 책임자", name: "TBD", phone: "010-XXXX-XXXX", backup: "010-XXXX-XXXX" },
          { role: "의료 책임자", name: "TBD", phone: "010-XXXX-XXXX", backup: "010-XXXX-XXXX" },
          { role: "경비 책임자", name: "TBD", phone: "010-XXXX-XXXX", backup: "010-XXXX-XXXX" },
          { role: "소방서", name: "관할 소방서", phone: "119", backup: "-" },
          { role: "경찰서", name: "관할 경찰서", phone: "112", backup: "-" },
        ],
        communication_protocol: {
          primary_channel: "무전기 채널 1 (보안/안전)",
          backup_channel: "휴대폰 그룹 통화",
          code_words: [
            { situation: "의료 응급", code: "CODE BLUE" },
            { situation: "화재", code: "CODE RED" },
            { situation: "대피", code: "CODE YELLOW" },
            { situation: "보안 위협", code: "CODE BLACK" },
            { situation: "상황 종료", code: "ALL CLEAR" },
          ],
        },
      },
      medical_plan: {
        first_aid_stations: [
          {
            location: "메인 로비",
            equipment: ["AED", "응급 키트", "휠체어", "들것"],
            staff: Math.ceil(medicalStaff / 2),
          },
          {
            location: "메인홀 후면",
            equipment: ["AED", "응급 키트", "산소 공급기"],
            staff: Math.ceil(medicalStaff / 2),
          },
        ],
        ambulance_access: {
          entry_point: "후문 로딩독",
          staging_area: "후문 주차 구역",
          response_time_mins: 8,
        },
        hospital_info: {
          nearest_hospital: "OO대학병원 응급실",
          distance_km: 3.5,
          trauma_level: "Level 1 Trauma Center",
        },
      },
      security_plan: {
        access_control: {
          entry_points: 3,
          screening_type: "가방 검색 + 금속 탐지",
          credentials: ["참석자 배지", "스태프 ID", "VIP 패스", "미디어 패스"],
        },
        security_personnel: {
          total: securityCount,
          positions: [
            { location: "정문", count: Math.ceil(securityCount * 0.3), role: "입장 통제/스크리닝" },
            { location: "메인홀", count: Math.ceil(securityCount * 0.3), role: "장내 순찰" },
            { location: "무대/백스테이지", count: Math.ceil(securityCount * 0.2), role: "VIP/스피커 보호" },
            { location: "순찰", count: Math.ceil(securityCount * 0.2), role: "외곽 순찰" },
          ],
        },
        crowd_management: {
          max_density: "4인/㎡ 이하 유지",
          flow_control: [
            "일방통행 동선 설정",
            "병목 구간 스태프 배치",
            "실시간 밀집도 모니터링",
          ],
          bottleneck_mitigations: [
            "다중 입/출구 운영",
            "시차 세션 종료",
            "안내 표지판 강화",
          ],
        },
      },
      permits_and_insurance: {
        required_permits: [
          { permit_type: "집회 신고", issuing_authority: "관할 경찰서", status: "not_started" as const, deadline: "D-14" },
          { permit_type: "소방 안전 검사", issuing_authority: "소방서", status: "not_started" as const, deadline: "D-7" },
          { permit_type: "임시 시설물 설치", issuing_authority: "구청", status: "not_started" as const, deadline: "D-30" },
        ],
        insurance_requirements: [
          { type: "행사 배상책임보험", coverage: 1000000000, status: "필수" },
          { type: "시설물 보험", coverage: 500000000, status: "필수" },
          { type: "취소 보험", coverage: 300000000, status: "권장" },
        ],
      },
      training_requirements: [
        { topic: "비상 대피 절차", target_audience: "전 스태프", duration: "30분", mandatory: true },
        { topic: "응급 처치 기본", target_audience: "섹션 리더", duration: "2시간", mandatory: true },
        { topic: "군중 관리 기법", target_audience: "보안 인력", duration: "1시간", mandatory: true },
        { topic: "화재 대응", target_audience: "전 스태프", duration: "30분", mandatory: true },
        { topic: "무전기 사용법", target_audience: "핵심 스태프", duration: "15분", mandatory: false },
      ],
    };
  },
};
