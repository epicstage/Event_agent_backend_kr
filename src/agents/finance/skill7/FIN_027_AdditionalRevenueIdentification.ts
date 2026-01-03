/**
 * FIN-027: 추가 수익원 식별
 *
 * CMP-IS Reference: 7.4.a
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Additional Revenue Identification.
CMP-IS Standard: 7.4.a - Identifying additional revenue opportunities for events.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_profile: z.object({
    type: z.string(),
    expected_attendees: z.number().int(),
    duration_days: z.number().int(),
    venue_type: z.string(),
  }),
  existing_revenue_streams: z.array(z.string()),
  attendee_demographics: z.object({
    primary_industry: z.string(),
    avg_company_size: z.string().optional(),
    decision_maker_percentage: z.number().optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid(),
  event_id: z.string().uuid(),
  opportunities: z.array(z.object({
    opportunity_name: z.string(),
    category: z.string(),
    revenue_potential: z.object({
      minimum: z.number(),
      expected: z.number(),
      maximum: z.number(),
    }),
    implementation_effort: z.enum(["low", "medium", "high"]),
    timeline_weeks: z.number(),
    requirements: z.array(z.string()),
    target_buyer: z.string(),
    success_factors: z.array(z.string()),
  })),
  prioritized_recommendations: z.array(z.object({
    rank: z.number().int(),
    opportunity: z.string(),
    rationale: z.string(),
  })),
  total_potential_revenue: z.number(),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);
  const attendees = validated.event_profile.expected_attendees;

  const opportunities = [
    {
      opportunity_name: "프리미엄 네트워킹 세션",
      category: "프로그램",
      revenue_potential: {
        minimum: attendees * 5,
        expected: attendees * 10,
        maximum: attendees * 15,
      },
      implementation_effort: "medium" as const,
      timeline_weeks: 4,
      requirements: ["별도 공간 확보", "케이터링", "참가자 매칭 시스템"],
      target_buyer: "참가자",
      success_factors: ["고품질 참석자 프로필", "효과적인 매칭", "적정 인원 제한"],
    },
    {
      opportunity_name: "공식 앱 광고",
      category: "광고",
      revenue_potential: {
        minimum: 5000,
        expected: 15000,
        maximum: 30000,
      },
      implementation_effort: "low" as const,
      timeline_weeks: 2,
      requirements: ["이벤트 앱", "광고 영역 설계"],
      target_buyer: "스폰서/전시사",
      success_factors: ["높은 앱 사용률", "관련성 높은 광고"],
    },
    {
      opportunity_name: "워크숍/인증 프로그램",
      category: "교육",
      revenue_potential: {
        minimum: attendees * 20,
        expected: attendees * 40,
        maximum: attendees * 60,
      },
      implementation_effort: "high" as const,
      timeline_weeks: 8,
      requirements: ["강사 섭외", "교재 개발", "인증 파트너십"],
      target_buyer: "참가자",
      success_factors: ["업계 인정 인증", "실무 적용 가능성", "적정 가격"],
    },
    {
      opportunity_name: "온디맨드 콘텐츠 패키지",
      category: "콘텐츠",
      revenue_potential: {
        minimum: 3000,
        expected: 10000,
        maximum: 25000,
      },
      implementation_effort: "medium" as const,
      timeline_weeks: 6,
      requirements: ["녹화 장비", "플랫폼", "편집"],
      target_buyer: "비참석자/기업",
      success_factors: ["양질의 콘텐츠", "쉬운 접근성", "합리적 가격"],
    },
  ];

  const totalExpected = opportunities.reduce((sum, o) => sum + o.revenue_potential.expected, 0);

  const output: Output = {
    analysis_id: generateUUID(),
    event_id: validated.event_id,
    opportunities,
    prioritized_recommendations: [
      { rank: 1, opportunity: "공식 앱 광고", rationale: "낮은 구현 노력 대비 높은 수익" },
      { rank: 2, opportunity: "프리미엄 네트워킹 세션", rationale: "참가자 가치 제고와 수익 동시 달성" },
      { rank: 3, opportunity: "온디맨드 콘텐츠", rationale: "이벤트 후에도 지속적 수익 창출" },
      { rank: 4, opportunity: "워크숍/인증 프로그램", rationale: "높은 수익 잠재력 (장기 준비 필요)" },
    ],
    total_potential_revenue: totalExpected,
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-027",
  taskName: "추가 수익원 식별",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.4.a",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.4: Identify and Develop Additional Revenue Streams",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
