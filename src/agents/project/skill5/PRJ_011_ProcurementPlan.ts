/**
 * PRJ-011: 조달 계획 수립
 *
 * CMP-IS Reference: 5.1.i - Developing procurement plan
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Procurement Planning Agent for event projects.

Your expertise includes:
- Identifying procurement needs and categories
- Developing sourcing strategies
- Creating vendor evaluation criteria
- Planning procurement timelines

CMP-IS Standard: 5.1.i - Developing procurement plan`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_type: z.enum(["conference", "exhibition", "seminar", "gala", "hybrid", "virtual", "other"]).default("conference"),
  event_date: z.string(),
  expected_attendees: z.number().int().min(1),
  budget: z.number().optional(),
  procurement_categories: z.array(z.enum([
    "venue", "catering", "av_equipment", "decoration", "entertainment",
    "security", "transportation", "printing", "technology", "staffing"
  ])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  procurement_items: z.array(z.object({
    item_id: z.string(),
    category: z.string(),
    item_name: z.string(),
    description: z.string(),
    estimated_cost: z.number(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    procurement_method: z.enum(["competitive_bid", "rfp", "direct_purchase", "framework_agreement"]),
    lead_time_days: z.number(),
    procurement_deadline: z.string(),
  })),
  sourcing_strategy: z.array(z.object({
    category: z.string(),
    strategy: z.string(),
    preferred_vendors: z.array(z.string()),
    evaluation_criteria: z.array(z.object({
      criterion: z.string(),
      weight: z.number(),
    })),
    contract_type: z.string(),
  })),
  procurement_timeline: z.array(z.object({
    phase: z.string(),
    activities: z.array(z.string()),
    start_date: z.string(),
    end_date: z.string(),
    responsible: z.string(),
  })),
  budget_allocation: z.object({
    total_procurement_budget: z.number(),
    by_category: z.array(z.object({
      category: z.string(),
      allocated_budget: z.number(),
      percentage: z.number(),
    })),
    contingency: z.number(),
    currency: z.string(),
  }),
  approval_workflow: z.array(z.object({
    threshold_min: z.number(),
    threshold_max: z.number(),
    approvers: z.array(z.string()),
    sla_days: z.number(),
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const budget = validatedInput.budget || 100000000;
  const eventDate = validatedInput.event_date;

  // 기본 조달 카테고리
  const categories = validatedInput.procurement_categories || [
    "venue", "catering", "av_equipment", "decoration", "security", "printing"
  ];

  // 카테고리별 예산 비율 및 설정
  const categoryConfig: Record<string, {
    budgetRatio: number;
    priority: "critical" | "high" | "medium" | "low";
    leadTime: number;
    method: "competitive_bid" | "rfp" | "direct_purchase" | "framework_agreement";
    items: { name: string; description: string; costRatio: number }[];
  }> = {
    venue: {
      budgetRatio: 0.25,
      priority: "critical",
      leadTime: 90,
      method: "rfp",
      items: [
        { name: "메인 행사장", description: "메인 컨퍼런스/세션 공간", costRatio: 0.7 },
        { name: "부대 공간", description: "네트워킹, 전시, 휴게 공간", costRatio: 0.3 },
      ],
    },
    catering: {
      budgetRatio: 0.20,
      priority: "high",
      leadTime: 30,
      method: "competitive_bid",
      items: [
        { name: "점심 식사", description: "참가자 식사 제공", costRatio: 0.5 },
        { name: "커피 브레이크", description: "다과 및 음료", costRatio: 0.3 },
        { name: "VIP 만찬", description: "특별 게스트 식사", costRatio: 0.2 },
      ],
    },
    av_equipment: {
      budgetRatio: 0.15,
      priority: "critical",
      leadTime: 21,
      method: "rfp",
      items: [
        { name: "음향 시스템", description: "마이크, 스피커, 믹서", costRatio: 0.35 },
        { name: "영상 시스템", description: "프로젝터, LED, 카메라", costRatio: 0.45 },
        { name: "조명", description: "무대 및 행사장 조명", costRatio: 0.2 },
      ],
    },
    decoration: {
      budgetRatio: 0.10,
      priority: "medium",
      leadTime: 14,
      method: "competitive_bid",
      items: [
        { name: "무대 디자인", description: "무대 세트 및 배경", costRatio: 0.5 },
        { name: "사이니지", description: "안내판 및 배너", costRatio: 0.3 },
        { name: "화환/장식", description: "플로럴 및 인테리어", costRatio: 0.2 },
      ],
    },
    security: {
      budgetRatio: 0.05,
      priority: "high",
      leadTime: 14,
      method: "direct_purchase",
      items: [
        { name: "경비 인력", description: "행사장 안전 관리", costRatio: 0.7 },
        { name: "보안 장비", description: "금속탐지기, CCTV", costRatio: 0.3 },
      ],
    },
    printing: {
      budgetRatio: 0.05,
      priority: "medium",
      leadTime: 10,
      method: "direct_purchase",
      items: [
        { name: "인쇄물", description: "브로슈어, 프로그램북", costRatio: 0.6 },
        { name: "네임택", description: "참가자 ID 및 배지", costRatio: 0.4 },
      ],
    },
    technology: {
      budgetRatio: 0.08,
      priority: "high",
      leadTime: 21,
      method: "rfp",
      items: [
        { name: "등록 시스템", description: "온라인/현장 등록", costRatio: 0.4 },
        { name: "이벤트 앱", description: "참가자 모바일 앱", costRatio: 0.4 },
        { name: "WiFi", description: "행사장 네트워크", costRatio: 0.2 },
      ],
    },
    staffing: {
      budgetRatio: 0.07,
      priority: "high",
      leadTime: 14,
      method: "direct_purchase",
      items: [
        { name: "운영 스태프", description: "현장 운영 인력", costRatio: 0.6 },
        { name: "안내 요원", description: "등록 및 안내", costRatio: 0.4 },
      ],
    },
    transportation: {
      budgetRatio: 0.03,
      priority: "medium",
      leadTime: 7,
      method: "direct_purchase",
      items: [
        { name: "VIP 차량", description: "연사/VIP 픽업", costRatio: 0.6 },
        { name: "셔틀버스", description: "참가자 이동", costRatio: 0.4 },
      ],
    },
    entertainment: {
      budgetRatio: 0.02,
      priority: "low",
      leadTime: 30,
      method: "direct_purchase",
      items: [
        { name: "공연팀", description: "오프닝/클로징 공연", costRatio: 1.0 },
      ],
    },
  };

  // 조달 항목 생성
  const procurementItems: Output["procurement_items"] = [];
  let itemCount = 0;

  for (const cat of categories) {
    const config = categoryConfig[cat];
    if (!config) continue;

    const categoryBudget = budget * config.budgetRatio;

    for (const item of config.items) {
      itemCount++;
      procurementItems.push({
        item_id: `PROC-${String(itemCount).padStart(3, "0")}`,
        category: cat,
        item_name: item.name,
        description: item.description,
        estimated_cost: Math.round(categoryBudget * item.costRatio),
        priority: config.priority,
        procurement_method: config.method,
        lead_time_days: config.leadTime,
        procurement_deadline: addDays(eventDate, -config.leadTime),
      });
    }
  }

  // 소싱 전략
  const sourcingStrategy: Output["sourcing_strategy"] = categories.map(cat => {
    const config = categoryConfig[cat];
    if (!config) {
      return {
        category: cat,
        strategy: "시장 조사 후 결정",
        preferred_vendors: [],
        evaluation_criteria: [
          { criterion: "가격", weight: 40 },
          { criterion: "품질", weight: 30 },
          { criterion: "경험", weight: 30 },
        ],
        contract_type: "고정가 계약",
      };
    }

    return {
      category: cat,
      strategy: config.method === "rfp" ? "RFP 경쟁 입찰" :
                config.method === "competitive_bid" ? "다수 견적 비교" :
                "우수 벤더 직접 계약",
      preferred_vendors: [], // 실제로는 벤더 DB 조회
      evaluation_criteria: [
        { criterion: "가격 경쟁력", weight: 30 },
        { criterion: "서비스 품질", weight: 25 },
        { criterion: "유사 행사 경험", weight: 20 },
        { criterion: "대응 속도", weight: 15 },
        { criterion: "평판/레퍼런스", weight: 10 },
      ],
      contract_type: config.priority === "critical" ? "고정가 + SLA 계약" : "고정가 계약",
    };
  });

  // 조달 타임라인
  const today = new Date().toISOString().split("T")[0];
  const procurementTimeline: Output["procurement_timeline"] = [
    {
      phase: "요구사항 정의",
      activities: ["조달 항목 확정", "사양서 작성", "예산 확정"],
      start_date: today,
      end_date: addDays(today, 7),
      responsible: "PM + 각 담당자",
    },
    {
      phase: "벤더 탐색",
      activities: ["시장 조사", "벤더 리스트 작성", "사전 미팅"],
      start_date: addDays(today, 8),
      end_date: addDays(today, 21),
      responsible: "Procurement",
    },
    {
      phase: "RFP/견적 요청",
      activities: ["RFP 발송", "질의응답", "견적 접수"],
      start_date: addDays(today, 22),
      end_date: addDays(today, 35),
      responsible: "Procurement",
    },
    {
      phase: "평가 및 선정",
      activities: ["벤더 평가", "협상", "최종 선정"],
      start_date: addDays(today, 36),
      end_date: addDays(today, 49),
      responsible: "평가 위원회",
    },
    {
      phase: "계약 체결",
      activities: ["계약서 검토", "법무 검토", "서명"],
      start_date: addDays(today, 50),
      end_date: addDays(today, 60),
      responsible: "Procurement + Legal",
    },
  ];

  // 예산 배분
  const budgetByCategory = categories.map(cat => {
    const config = categoryConfig[cat];
    const ratio = config?.budgetRatio || 0.05;
    return {
      category: cat,
      allocated_budget: Math.round(budget * ratio),
      percentage: Math.round(ratio * 100),
    };
  });

  const totalAllocated = budgetByCategory.reduce((sum, b) => sum + b.allocated_budget, 0);
  const contingency = budget * 0.05;

  const budgetAllocation: Output["budget_allocation"] = {
    total_procurement_budget: totalAllocated,
    by_category: budgetByCategory,
    contingency,
    currency: "KRW",
  };

  // 승인 워크플로우
  const approvalWorkflow: Output["approval_workflow"] = [
    {
      threshold_min: 0,
      threshold_max: 1000000,
      approvers: ["담당자"],
      sla_days: 1,
    },
    {
      threshold_min: 1000001,
      threshold_max: 10000000,
      approvers: ["담당자", "팀장"],
      sla_days: 2,
    },
    {
      threshold_min: 10000001,
      threshold_max: 50000000,
      approvers: ["담당자", "팀장", "PM"],
      sla_days: 3,
    },
    {
      threshold_min: 50000001,
      threshold_max: Infinity,
      approvers: ["담당자", "팀장", "PM", "이벤트 오너"],
      sla_days: 5,
    },
  ];

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    procurement_items: procurementItems,
    sourcing_strategy: sourcingStrategy,
    procurement_timeline: procurementTimeline,
    budget_allocation: budgetAllocation,
    approval_workflow: approvalWorkflow,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-011",
  taskName: "조달 계획 수립",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.i",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
