/**
 * OPS-017: Equipment Tracking Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 *
 * 장비 추적 및 인벤토리 관리
 */

import { z } from "zod";

export const OPS_017_EquipmentTracking = {
  id: "OPS-017",
  name: "Equipment Tracking Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `당신은 장비 관리 전문가입니다.
모든 장비의 위치, 상태, 이동을 실시간으로 파악합니다.
분실과 파손을 예방하고, 효율적인 자산 관리를 추구합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    equipment_list: z.array(z.object({
      item_id: z.string(),
      item_name: z.string(),
      category: z.string(),
      quantity: z.number(),
      unit_value: z.number(),
      vendor: z.string(),
    })),
  }),

  outputSchema: z.object({
    inventory_summary: z.object({
      total_items: z.number(),
      total_value: z.number(),
      categories: z.array(z.object({
        category: z.string(),
        count: z.number(),
        value: z.number(),
      })),
    }),
    tracking_system: z.object({
      method: z.string(),
      check_in_process: z.array(z.string()),
      check_out_process: z.array(z.string()),
    }),
    status_report: z.array(z.object({
      item_id: z.string(),
      item_name: z.string(),
      status: z.enum(["ordered", "in_transit", "received", "setup", "active", "teardown", "returned"]),
      location: z.string(),
      condition: z.enum(["new", "good", "fair", "damaged"]),
    })),
    action_items: z.array(z.object({
      priority: z.enum(["high", "medium", "low"]),
      action: z.string(),
      responsible: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_017_EquipmentTracking.inputSchema>) => {
    const totalItems = input.equipment_list.reduce((sum, e) => sum + e.quantity, 0);
    const totalValue = input.equipment_list.reduce((sum, e) => sum + e.quantity * e.unit_value, 0);

    const categoryMap = new Map<string, { count: number; value: number }>();
    input.equipment_list.forEach((e) => {
      const existing = categoryMap.get(e.category) || { count: 0, value: 0 };
      categoryMap.set(e.category, {
        count: existing.count + e.quantity,
        value: existing.value + e.quantity * e.unit_value,
      });
    });

    return {
      inventory_summary: {
        total_items: totalItems,
        total_value: totalValue,
        categories: Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          count: data.count,
          value: data.value,
        })),
      },
      tracking_system: {
        method: "QR 코드 + 스프레드시트 연동",
        check_in_process: [
          "배송 도착 시 포장 상태 확인",
          "수량 체크 및 QR 스캔",
          "상태 기록 (사진 촬영)",
          "지정 위치 배치",
          "시스템 업데이트",
        ],
        check_out_process: [
          "반출 전 상태 점검",
          "QR 스캔 및 반출 기록",
          "손상 여부 문서화",
          "운송 차량 확인",
          "반납 완료 확인",
        ],
      },
      status_report: input.equipment_list.map((e) => ({
        item_id: e.item_id,
        item_name: e.item_name,
        status: "ordered" as const,
        location: "Vendor Warehouse",
        condition: "new" as const,
      })),
      action_items: [
        { priority: "high" as const, action: "고가 장비 보험 확인", responsible: "재무팀" },
        { priority: "medium" as const, action: "QR 라벨 인쇄 및 부착", responsible: "운영팀" },
        { priority: "low" as const, action: "백업 장비 목록 작성", responsible: "기술팀" },
      ],
    };
  },
};
