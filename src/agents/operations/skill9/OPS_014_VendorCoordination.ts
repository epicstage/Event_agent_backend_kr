/**
 * OPS-014: Vendor Coordination Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 협력 업체 조율 및 관리
 */

import { z } from "zod";

export const OPS_014_VendorCoordination = {
  id: "OPS-014",
  name: "Vendor Coordination Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 벤더 관리 전문가입니다.
수십 개의 협력 업체를 동시에 조율하여 완벽한 협업을 이끌어냅니다.
명확한 커뮤니케이션과 타임라인 관리가 핵심이라고 믿습니다.
좋은 파트너십이 좋은 이벤트를 만든다고 확신합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    event_dates: z.array(z.string()),
    vendors: z.array(z.object({
      vendor_name: z.string(),
      vendor_type: z.string(),
      services: z.array(z.string()),
      contract_value: z.number(),
    })),
    venue_rules: z.object({
      load_in_start: z.string(),
      load_in_end: z.string(),
      load_out_start: z.string(),
      load_out_end: z.string(),
      noise_restrictions: z.string().optional(),
    }),
  }),

  outputSchema: z.object({
    vendor_overview: z.object({
      total_vendors: z.number(),
      total_contract_value: z.number(),
      critical_vendors: z.array(z.string()),
      coordination_complexity: z.enum(["low", "medium", "high"]),
    }),
    vendor_schedule: z.array(z.object({
      vendor_name: z.string(),
      vendor_type: z.string(),
      arrival_date: z.string(),
      arrival_time: z.string(),
      setup_duration_hours: z.number(),
      load_out_date: z.string(),
      load_out_time: z.string(),
      parking_assignment: z.string(),
      loading_dock_slot: z.string(),
    })),
    dependencies: z.array(z.object({
      vendor: z.string(),
      depends_on: z.string(),
      reason: z.string(),
      buffer_time_mins: z.number(),
    })),
    communication_matrix: z.array(z.object({
      vendor_name: z.string(),
      primary_contact: z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string(),
      }),
      onsite_contact: z.object({
        name: z.string(),
        phone: z.string(),
      }),
      escalation_contact: z.object({
        name: z.string(),
        phone: z.string(),
      }),
    })),
    deliverables_checklist: z.array(z.object({
      vendor_name: z.string(),
      deliverables: z.array(z.object({
        item: z.string(),
        due_date: z.string(),
        status: z.enum(["pending", "received", "approved", "issues"]),
      })),
    })),
    risk_assessment: z.array(z.object({
      vendor_name: z.string(),
      risk_level: z.enum(["low", "medium", "high"]),
      risks: z.array(z.string()),
      mitigation: z.array(z.string()),
      backup_vendor: z.string().optional(),
    })),
    coordination_meetings: z.array(z.object({
      meeting_name: z.string(),
      date: z.string(),
      attendees: z.array(z.string()),
      agenda: z.array(z.string()),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_014_VendorCoordination.inputSchema>) => {
    const totalValue = input.vendors.reduce((sum, v) => sum + v.contract_value, 0);
    const criticalVendors = input.vendors
      .filter((v) => v.contract_value > totalValue * 0.15)
      .map((v) => v.vendor_name);

    const complexity = input.vendors.length > 15 ? "high" as const
      : input.vendors.length > 8 ? "medium" as const
      : "low" as const;

    return {
      vendor_overview: {
        total_vendors: input.vendors.length,
        total_contract_value: totalValue,
        critical_vendors: criticalVendors,
        coordination_complexity: complexity,
      },
      vendor_schedule: input.vendors.map((vendor, idx) => ({
        vendor_name: vendor.vendor_name,
        vendor_type: vendor.vendor_type,
        arrival_date: `D-${Math.max(1, 3 - idx % 3)}`,
        arrival_time: `${8 + (idx % 4) * 2}:00`,
        setup_duration_hours: vendor.vendor_type === "AV/Production" ? 8
          : vendor.vendor_type === "Catering" ? 4
          : vendor.vendor_type === "Decoration" ? 6
          : 3,
        load_out_date: "D+1",
        load_out_time: `${8 + (idx % 3) * 2}:00`,
        parking_assignment: `Zone ${String.fromCharCode(65 + idx % 4)}`,
        loading_dock_slot: `Slot ${(idx % 3) + 1}`,
      })),
      dependencies: [
        {
          vendor: "AV/Production",
          depends_on: "Stage Builder",
          reason: "무대 설치 완료 후 AV 장비 설치 가능",
          buffer_time_mins: 60,
        },
        {
          vendor: "Catering",
          depends_on: "Furniture Rental",
          reason: "테이블/의자 배치 후 세팅 가능",
          buffer_time_mins: 30,
        },
        {
          vendor: "Decoration",
          depends_on: "AV/Production",
          reason: "조명 위치 확정 후 장식 배치",
          buffer_time_mins: 30,
        },
        {
          vendor: "Signage",
          depends_on: "Venue",
          reason: "최종 레이아웃 확정 후 설치",
          buffer_time_mins: 60,
        },
      ],
      communication_matrix: input.vendors.map((vendor) => ({
        vendor_name: vendor.vendor_name,
        primary_contact: {
          name: `${vendor.vendor_name} 담당자`,
          phone: "010-XXXX-XXXX",
          email: `contact@${vendor.vendor_name.toLowerCase().replace(/\s/g, "")}.com`,
        },
        onsite_contact: {
          name: `${vendor.vendor_name} 현장 책임자`,
          phone: "010-XXXX-XXXX",
        },
        escalation_contact: {
          name: `${vendor.vendor_name} 대표`,
          phone: "010-XXXX-XXXX",
        },
      })),
      deliverables_checklist: input.vendors.map((vendor) => ({
        vendor_name: vendor.vendor_name,
        deliverables: [
          { item: "계약서 서명", due_date: "D-30", status: "approved" as const },
          { item: "보험 증명서", due_date: "D-14", status: "pending" as const },
          { item: "현장 인력 명단", due_date: "D-7", status: "pending" as const },
          { item: "차량 등록", due_date: "D-7", status: "pending" as const },
          { item: "최종 세부 계획", due_date: "D-5", status: "pending" as const },
        ],
      })),
      risk_assessment: input.vendors.map((vendor) => ({
        vendor_name: vendor.vendor_name,
        risk_level: vendor.contract_value > totalValue * 0.2 ? "high" as const
          : vendor.contract_value > totalValue * 0.1 ? "medium" as const
          : "low" as const,
        risks: [
          "일정 지연",
          "인력 부족",
          vendor.vendor_type === "Catering" ? "식자재 품질" : "장비 고장",
        ],
        mitigation: [
          "일일 진행상황 체크",
          "백업 인력 확보 요청",
          "현장 품질 점검",
        ],
        backup_vendor: vendor.contract_value > totalValue * 0.15 ? "백업업체 사전 확보" : undefined,
      })),
      coordination_meetings: [
        {
          meeting_name: "킥오프 미팅",
          date: "D-30",
          attendees: input.vendors.map((v) => v.vendor_name),
          agenda: ["프로젝트 개요", "타임라인 공유", "연락처 교환", "Q&A"],
        },
        {
          meeting_name: "중간 점검",
          date: "D-14",
          attendees: criticalVendors,
          agenda: ["진행 상황 점검", "이슈 논의", "최종 일정 확정"],
        },
        {
          meeting_name: "최종 브리핑",
          date: "D-3",
          attendees: input.vendors.map((v) => v.vendor_name),
          agenda: ["현장 규칙", "로딩 스케줄", "긴급 연락망", "최종 확인"],
        },
        {
          meeting_name: "현장 워크스루",
          date: "D-1",
          attendees: input.vendors.map((v) => v.vendor_name),
          agenda: ["동선 확인", "설치 위치 확정", "안전 브리핑"],
        },
      ],
    };
  },
};
