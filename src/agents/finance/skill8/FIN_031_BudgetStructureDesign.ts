/**
 * FIN-031: 예산 구조 설계
 *
 * CMP-IS Reference: 8.1.a
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Budget Structure Design.
CMP-IS Standard: 8.1.a - Designing comprehensive budget structures for events.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_profile: z.object({
    name: z.string(),
    type: z.string(),
    scale: z.enum(["small", "medium", "large", "mega"]),
    duration_days: z.number().int(),
  }),
  organization_requirements: z.object({
    accounting_system: z.string().optional(),
    cost_center_structure: z.boolean().default(false),
    approval_levels: z.number().int().default(2),
  }).optional(),
  historical_budget: z.object({
    previous_event_budget: z.number().optional(),
    category_breakdown: z.record(z.string(), z.number()).optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  structure_id: z.string().uuid(),
  event_id: z.string().uuid(),
  budget_categories: z.array(z.object({
    category_code: z.string(),
    category_name: z.string(),
    subcategories: z.array(z.object({
      code: z.string(),
      name: z.string(),
      description: z.string(),
    })),
    typical_percentage: z.number(),
  })),
  cost_centers: z.array(z.object({
    code: z.string(),
    name: z.string(),
    owner: z.string(),
  })).optional(),
  approval_workflow: z.object({
    levels: z.array(z.object({
      level: z.number().int(),
      threshold: z.number(),
      approver_role: z.string(),
    })),
    escalation_rules: z.array(z.string()),
  }),
  chart_of_accounts_mapping: z.record(z.string(), z.string()).optional(),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const output: Output = {
    structure_id: generateUUID(),
    event_id: validated.event_id,
    budget_categories: [
      {
        category_code: "VEN",
        category_name: "장소 및 시설",
        subcategories: [
          { code: "VEN-001", name: "장소 임대료", description: "메인 행사장, 회의실" },
          { code: "VEN-002", name: "시설 비용", description: "전기, 인터넷, HVAC" },
          { code: "VEN-003", name: "보안", description: "보안 인력, 장비" },
        ],
        typical_percentage: 25,
      },
      {
        category_code: "FB",
        category_name: "식음료",
        subcategories: [
          { code: "FB-001", name: "케이터링", description: "식사, 음료" },
          { code: "FB-002", name: "특별 F&B", description: "VIP 리셉션, 갈라 디너" },
        ],
        typical_percentage: 20,
      },
      {
        category_code: "AV",
        category_name: "AV 및 기술",
        subcategories: [
          { code: "AV-001", name: "AV 장비", description: "음향, 조명, 영상" },
          { code: "AV-002", name: "기술 인력", description: "기술 스태프" },
          { code: "AV-003", name: "스트리밍", description: "온라인 방송" },
        ],
        typical_percentage: 15,
      },
      {
        category_code: "MKT",
        category_name: "마케팅 및 홍보",
        subcategories: [
          { code: "MKT-001", name: "디지털 마케팅", description: "온라인 광고, SNS" },
          { code: "MKT-002", name: "인쇄물", description: "브로슈어, 배너" },
          { code: "MKT-003", name: "PR", description: "언론 홍보" },
        ],
        typical_percentage: 10,
      },
      {
        category_code: "SPK",
        category_name: "연사 및 엔터테인먼트",
        subcategories: [
          { code: "SPK-001", name: "연사 비용", description: "강연료, 교통비, 숙박" },
          { code: "SPK-002", name: "엔터테인먼트", description: "공연, 음악" },
        ],
        typical_percentage: 12,
      },
      {
        category_code: "OPS",
        category_name: "운영",
        subcategories: [
          { code: "OPS-001", name: "등록 시스템", description: "플랫폼, 결제" },
          { code: "OPS-002", name: "스태프", description: "임시 인력" },
          { code: "OPS-003", name: "물류", description: "운송, 창고" },
        ],
        typical_percentage: 10,
      },
      {
        category_code: "CNT",
        category_name: "예비비",
        subcategories: [
          { code: "CNT-001", name: "예비비", description: "미예상 비용 대비" },
        ],
        typical_percentage: 8,
      },
    ],
    cost_centers: validated.organization_requirements?.cost_center_structure ? [
      { code: "CC-MAIN", name: "메인 이벤트", owner: "이벤트 매니저" },
      { code: "CC-SPONS", name: "스폰서십", owner: "영업팀장" },
      { code: "CC-EXHIBIT", name: "전시", owner: "전시 담당자" },
    ] : undefined,
    approval_workflow: {
      levels: [
        { level: 1, threshold: 1000, approver_role: "팀장" },
        { level: 2, threshold: 5000, approver_role: "디렉터" },
        { level: 3, threshold: 20000, approver_role: "VP/C-Level" },
      ],
      escalation_rules: [
        "48시간 내 미승인 시 상위 레벨 자동 에스컬레이션",
        "예비비 사용은 모든 레벨 사전 승인 필요",
        "긴급 상황 시 사후 승인 허용 (24시간 내 문서화)",
      ],
    },
    chart_of_accounts_mapping: {
      "VEN": "6100-장소비",
      "FB": "6200-식음료비",
      "AV": "6300-기술비",
      "MKT": "6400-마케팅비",
      "SPK": "6500-연사비",
      "OPS": "6600-운영비",
      "CNT": "6900-예비비",
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-031",
  taskName: "예산 구조 설계",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.1.a",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
