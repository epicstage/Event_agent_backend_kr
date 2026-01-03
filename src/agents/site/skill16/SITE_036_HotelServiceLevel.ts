/**
 * SITE-036: 호텔 서비스 레벨 관리
 * CMP-IS Reference: 16.11.a - Hotel service level management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Hotel Service Level Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotels: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    star_rating: z.number(),
    contracted_services: z.array(z.string()),
    sla_metrics: z.object({
      response_time_minutes: z.number().optional(),
      complaint_resolution_hours: z.number().optional(),
      room_readiness_percent: z.number().optional(),
    }).optional(),
  })),
  performance_data: z.array(z.object({
    hotel_id: z.string(),
    guest_complaints: z.number(),
    avg_response_time: z.number(),
    satisfaction_score: z.number(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  assessment_id: z.string(),
  event_id: z.string(),
  hotel_assessments: z.array(z.object({
    hotel_name: z.string(),
    overall_score: z.number(),
    service_compliance: z.object({ contracted: z.number(), delivered: z.number(), compliance_rate: z.number() }),
    performance_metrics: z.object({ response_time: z.string(), satisfaction: z.number(), complaints: z.number() }),
    grade: z.string(),
    issues: z.array(z.string()),
  })),
  summary: z.object({ avg_score: z.number(), hotels_meeting_sla: z.number(), total_hotels: z.number() }),
  improvement_plans: z.array(z.object({ hotel: z.string(), issue: z.string(), action: z.string() })),
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
  const perfMap = new Map(validatedInput.performance_data?.map(p => [p.hotel_id, p]) || []);

  const assessments = validatedInput.hotels.map(h => {
    const perf = perfMap.get(h.hotel_id);
    const satisfaction = perf?.satisfaction_score || 80;
    const complaints = perf?.complaints || 0;
    const responseTime = perf?.avg_response_time || 15;

    const score = Math.round(satisfaction - complaints * 2 + (h.star_rating * 5));
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
    const issues: string[] = [];

    if (responseTime > 30) issues.push("응답 시간 초과");
    if (complaints > 5) issues.push("불만 건수 높음");
    if (satisfaction < 70) issues.push("만족도 개선 필요");

    return {
      hotel_name: h.hotel_name,
      overall_score: score,
      service_compliance: {
        contracted: h.contracted_services.length,
        delivered: Math.round(h.contracted_services.length * 0.9),
        compliance_rate: 90,
      },
      performance_metrics: {
        response_time: `${responseTime}분`,
        satisfaction,
        complaints,
      },
      grade,
      issues,
    };
  });

  const avgScore = Math.round(assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length);
  const meetingSla = assessments.filter(a => a.grade === "A" || a.grade === "B").length;

  const improvementPlans = assessments
    .filter(a => a.issues.length > 0)
    .flatMap(a => a.issues.map(issue => ({
      hotel: a.hotel_name,
      issue,
      action: issue.includes("응답") ? "호텔 담당자 핫라인 설정"
        : issue.includes("불만") ? "일일 체크인 미팅 실시"
          : "서비스 교육 요청",
    })));

  return {
    assessment_id: generateUUID(),
    event_id: validatedInput.event_id,
    hotel_assessments: assessments,
    summary: {
      avg_score: avgScore,
      hotels_meeting_sla: meetingSla,
      total_hotels: assessments.length,
    },
    improvement_plans: improvementPlans,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-036",
  taskName: "호텔 서비스 레벨 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.11.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.11: Service Quality",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
