/**
 * OPS-040: Load-Out & Teardown Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_040_LoadOut = {
  id: "OPS-040",
  name: "Load-Out & Teardown Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `철수 관리 전문가. 행사의 마지막 순간까지 안전하고
효율적인 철수를 책임집니다. 원상복구가 완벽해야 진짜 끝입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    event_end_time: z.string(),
    venue_handover_deadline: z.string(),
    vendors: z.array(z.object({
      vendor_name: z.string(),
      equipment_type: z.string(),
      vehicle_required: z.boolean(),
    })),
    rental_items: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      return_to: z.string(),
    })),
  }),

  outputSchema: z.object({
    teardown_schedule: z.array(z.object({
      phase: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      activities: z.array(z.string()),
      crew_required: z.number(),
    })),
    vendor_loadout: z.array(z.object({
      vendor: z.string(),
      slot_time: z.string(),
      loading_dock: z.string(),
      equipment: z.string(),
      status: z.enum(["scheduled", "in_progress", "completed"]),
    })),
    checklist: z.array(z.object({
      category: z.string(),
      items: z.array(z.string()),
      responsible: z.string(),
    })),
    venue_restoration: z.object({
      cleaning: z.array(z.string()),
      damage_check: z.array(z.string()),
      final_walkthrough: z.string(),
      key_return: z.string(),
    }),
    post_event_logistics: z.object({
      storage_items: z.array(z.string()),
      disposal_items: z.array(z.string()),
      rental_returns: z.array(z.object({
        item: z.string(),
        quantity: z.number(),
        return_deadline: z.string(),
      })),
    }),
  }),

  execute: async (input: z.infer<typeof OPS_040_LoadOut.inputSchema>) => {
    return {
      teardown_schedule: [
        {
          phase: "1단계: 즉시 철수",
          start_time: input.event_end_time,
          end_time: "+2시간",
          activities: [
            "참석자 퇴장 안내",
            "분실물 최종 수거",
            "케이터링 철수",
            "등록 장비 수거",
          ],
          crew_required: 10,
        },
        {
          phase: "2단계: 데코/사이니지",
          start_time: "+2시간",
          end_time: "+5시간",
          activities: [
            "배너/사이니지 철거",
            "데코레이션 수거",
            "포토월 해체",
            "플로어 그래픽 제거",
          ],
          crew_required: 8,
        },
        {
          phase: "3단계: AV/기술 장비",
          start_time: "+3시간",
          end_time: "+8시간",
          activities: [
            "음향 장비 철거",
            "조명 철거",
            "스크린/프로젝터 수거",
            "케이블 정리",
          ],
          crew_required: 6,
        },
        {
          phase: "4단계: 가구/구조물",
          start_time: "+5시간",
          end_time: "+10시간",
          activities: [
            "의자/테이블 정리",
            "스테이지 해체",
            "부스 파티션 철거",
            "트러스 해체",
          ],
          crew_required: 12,
        },
        {
          phase: "5단계: 최종 정리",
          start_time: "+10시간",
          end_time: input.venue_handover_deadline,
          activities: [
            "전문 청소",
            "원상복구 확인",
            "최종 워크스루",
            "베뉴 인수인계",
          ],
          crew_required: 6,
        },
      ],
      vendor_loadout: input.vendors.map((vendor, idx) => ({
        vendor: vendor.vendor_name,
        slot_time: `+${3 + idx * 2}시간`,
        loading_dock: `Dock ${String.fromCharCode(65 + (idx % 3))}`,
        equipment: vendor.equipment_type,
        status: "scheduled" as const,
      })),
      checklist: [
        {
          category: "장비 반납",
          items: ["무전기 전량 회수", "배지 프린터 반납", "키트 잔여 확인"],
          responsible: "등록팀",
        },
        {
          category: "AV 장비",
          items: ["마이크 전량 회수", "케이블 정리", "장비 손상 체크"],
          responsible: "AV팀",
        },
        {
          category: "케이터링",
          items: ["잔여 음식 처리", "식기 반납", "냉장고 비우기"],
          responsible: "F&B팀",
        },
        {
          category: "시설",
          items: ["에어컨 OFF", "전등 OFF", "문/창문 잠금"],
          responsible: "시설팀",
        },
        {
          category: "보안",
          items: ["최종 순찰", "CCTV 확인", "경비 인수인계"],
          responsible: "보안팀",
        },
      ],
      venue_restoration: {
        cleaning: [
          "바닥 청소 (진공/물걸레)",
          "화장실 청소",
          "쓰레기통 비우기",
          "벽/기둥 테이프 자국 제거",
        ],
        damage_check: [
          "바닥 손상 확인",
          "벽면 손상 확인",
          "가구 손상 확인",
          "손상 발견 시 즉시 촬영 및 보고",
        ],
        final_walkthrough: `${input.venue_handover_deadline} 30분 전, 베뉴 담당자와 동행`,
        key_return: "베뉴 담당자에게 직접 전달, 수령증 확보",
      },
      post_event_logistics: {
        storage_items: [
          "재사용 가능한 사이니지",
          "브랜드 굿즈 잔여",
          "AV 자체 장비",
        ],
        disposal_items: [
          "일회용 데코레이션",
          "손상된 사이니지",
          "음식물 쓰레기",
        ],
        rental_returns: input.rental_items.map((item) => ({
          item: item.item,
          quantity: item.quantity,
          return_deadline: "D+3 17:00",
        })),
      },
    };
  },
};
