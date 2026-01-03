/**
 * PRO-004: 벤더 윤리 심사
 * CMP-IS Reference: 19.4.a - Vendor ethics screening
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Vendor Ethics Screening Specialist for event supply chain.`;

export const InputSchema = z.object({
  event_id: z.string(),
  vendor_id: z.string().optional(),
  screening_type: z.enum(["initial", "renewal", "incident_based"]).optional(),
  criteria_focus: z.array(z.enum(["labor", "environmental", "anti_corruption", "safety", "diversity"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  screening_id: z.string(),
  event_id: z.string(),
  screening_summary: z.object({
    vendors_screened: z.number(),
    passed: z.number(),
    conditional: z.number(),
    failed: z.number(),
    pending: z.number(),
  }),
  vendor_assessments: z.array(z.object({
    vendor_name: z.string(),
    vendor_type: z.string(),
    overall_score: z.number(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    criteria_scores: z.array(z.object({
      criterion: z.string(),
      score: z.number(),
      findings: z.string(),
    })),
    status: z.enum(["approved", "conditional", "rejected", "pending_review"]),
    conditions: z.array(z.string()),
  })),
  red_flags: z.array(z.object({
    vendor_name: z.string(),
    issue: z.string(),
    severity: z.enum(["warning", "serious", "critical"]),
    recommended_action: z.string(),
  })),
  best_practices: z.array(z.object({
    vendor_name: z.string(),
    practice: z.string(),
    category: z.string(),
  })),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  return {
    screening_id: generateUUID(),
    event_id: validatedInput.event_id,
    screening_summary: {
      vendors_screened: 25,
      passed: 18,
      conditional: 5,
      failed: 1,
      pending: 1,
    },
    vendor_assessments: [
      {
        vendor_name: "프리미엄 케이터링",
        vendor_type: "F&B",
        overall_score: 92,
        risk_level: "low",
        criteria_scores: [
          { criterion: "노동 관행", score: 95, findings: "공정 임금, 근무 환경 우수" },
          { criterion: "환경 관리", score: 88, findings: "지역 식재료 사용, 음식물 쓰레기 최소화" },
          { criterion: "안전 기준", score: 94, findings: "HACCP 인증, 정기 위생 점검" },
        ],
        status: "approved",
        conditions: [],
      },
      {
        vendor_name: "테크 솔루션즈",
        vendor_type: "AV Equipment",
        overall_score: 75,
        risk_level: "medium",
        criteria_scores: [
          { criterion: "노동 관행", score: 70, findings: "일부 하청업체 근무 환경 확인 필요" },
          { criterion: "환경 관리", score: 78, findings: "에너지 효율 장비 사용, 재활용 프로그램 미흡" },
          { criterion: "반부패", score: 80, findings: "반부패 정책 문서화됨" },
        ],
        status: "conditional",
        conditions: ["하청업체 노동 환경 개선 증빙 제출", "재활용 프로그램 계획서 제출"],
      },
    ],
    red_flags: [
      {
        vendor_name: "저가 인쇄소",
        issue: "아동 노동 관련 과거 이력 발견",
        severity: "critical",
        recommended_action: "계약 체결 중단 및 대체 벤더 검토",
      },
    ],
    best_practices: [
      { vendor_name: "그린 플로리스트", practice: "100% 지역 재배 꽃 사용", category: "환경" },
      { vendor_name: "프리미엄 케이터링", practice: "잉여 음식 지역 푸드뱅크 기부", category: "사회적 책임" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-004",
  taskName: "벤더 윤리 심사",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.4.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.4: Vendor Ethics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
