/**
 * PRO-016: 전문 자격 관리
 * CMP-IS Reference: 20.6.a - Professional certification management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Professional Certification Manager for event professionals.`;

export const InputSchema = z.object({
  event_id: z.string(),
  staff_scope: z.array(z.enum(["internal", "contractors", "volunteers"])).optional(),
  certification_types: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  certification_report_id: z.string(),
  event_id: z.string(),
  summary: z.object({
    total_staff: z.number(),
    certified_staff: z.number(),
    certification_rate: z.number(),
    expiring_soon: z.number(),
    expired: z.number(),
  }),
  certifications_by_type: z.array(z.object({
    certification_type: z.string(),
    issuing_body: z.string(),
    holders: z.number(),
    target: z.number(),
    coverage: z.number(),
    validity_period: z.string(),
    renewal_requirements: z.string(),
  })),
  staff_certifications: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    role: z.string(),
    certifications: z.array(z.object({
      certification: z.string(),
      issue_date: z.string(),
      expiry_date: z.string(),
      status: z.enum(["active", "expiring_soon", "expired", "pending_renewal"]),
      ce_credits_required: z.number(),
      ce_credits_earned: z.number(),
    })),
  })),
  upcoming_exams: z.array(z.object({
    certification: z.string(),
    exam_date: z.string(),
    location: z.string(),
    registered_candidates: z.number(),
    registration_deadline: z.string(),
  })),
  training_programs: z.array(z.object({
    program_name: z.string(),
    target_certification: z.string(),
    format: z.enum(["online", "in_person", "hybrid"]),
    duration: z.string(),
    cost: z.number(),
    next_session: z.string(),
    enrolled: z.number(),
  })),
  recommendations: z.array(z.string()),
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
    certification_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    summary: {
      total_staff: 45,
      certified_staff: 32,
      certification_rate: 71,
      expiring_soon: 5,
      expired: 2,
    },
    certifications_by_type: [
      {
        certification_type: "CMP (Certified Meeting Professional)",
        issuing_body: "Events Industry Council",
        holders: 8,
        target: 10,
        coverage: 80,
        validity_period: "5년",
        renewal_requirements: "25 CE 시간/클락아워",
      },
      {
        certification_type: "CSEP (Certified Special Events Professional)",
        issuing_body: "International Live Events Association",
        holders: 4,
        target: 5,
        coverage: 80,
        validity_period: "3년",
        renewal_requirements: "20 포인트/재시험",
      },
      {
        certification_type: "CEM (Certified in Exhibition Management)",
        issuing_body: "IAEE",
        holders: 3,
        target: 3,
        coverage: 100,
        validity_period: "3년",
        renewal_requirements: "30 CE 포인트",
      },
      {
        certification_type: "응급처치/CPR",
        issuing_body: "대한적십자사",
        holders: 15,
        target: 20,
        coverage: 75,
        validity_period: "2년",
        renewal_requirements: "재교육",
      },
      {
        certification_type: "안전관리자",
        issuing_body: "한국산업안전보건공단",
        holders: 2,
        target: 2,
        coverage: 100,
        validity_period: "2년",
        renewal_requirements: "보수 교육",
      },
    ],
    staff_certifications: [
      {
        staff_id: "STF-001",
        name: "김민수",
        role: "이벤트 디렉터",
        certifications: [
          { certification: "CMP", issue_date: "2022-05-15", expiry_date: "2027-05-15", status: "active", ce_credits_required: 25, ce_credits_earned: 18 },
          { certification: "CSEP", issue_date: "2021-09-10", expiry_date: "2024-09-10", status: "expired", ce_credits_required: 20, ce_credits_earned: 8 },
        ],
      },
      {
        staff_id: "STF-002",
        name: "이영희",
        role: "프로젝트 매니저",
        certifications: [
          { certification: "CMP", issue_date: "2023-03-20", expiry_date: "2028-03-20", status: "active", ce_credits_required: 25, ce_credits_earned: 12 },
          { certification: "응급처치", issue_date: "2023-06-01", expiry_date: "2025-06-01", status: "expiring_soon", ce_credits_required: 0, ce_credits_earned: 0 },
        ],
      },
      {
        staff_id: "STF-003",
        name: "박준호",
        role: "안전 담당",
        certifications: [
          { certification: "안전관리자", issue_date: "2024-01-15", expiry_date: "2026-01-15", status: "active", ce_credits_required: 16, ce_credits_earned: 16 },
          { certification: "응급처치", issue_date: "2024-03-10", expiry_date: "2026-03-10", status: "active", ce_credits_required: 0, ce_credits_earned: 0 },
        ],
      },
    ],
    upcoming_exams: [
      {
        certification: "CMP",
        exam_date: "2025-04-15",
        location: "서울 (온라인 가능)",
        registered_candidates: 3,
        registration_deadline: "2025-03-01",
      },
      {
        certification: "응급처치",
        exam_date: "2025-02-20",
        location: "대한적십자사 서울지사",
        registered_candidates: 8,
        registration_deadline: "2025-02-10",
      },
    ],
    training_programs: [
      {
        program_name: "CMP 시험 준비 과정",
        target_certification: "CMP",
        format: "hybrid",
        duration: "40시간",
        cost: 1500000,
        next_session: "2025-02-15",
        enrolled: 3,
      },
      {
        program_name: "응급처치 및 CPR 교육",
        target_certification: "응급처치",
        format: "in_person",
        duration: "8시간",
        cost: 50000,
        next_session: "2025-02-20",
        enrolled: 8,
      },
      {
        program_name: "이벤트 안전관리 실무",
        target_certification: "안전관리자 보수교육",
        format: "online",
        duration: "16시간",
        cost: 200000,
        next_session: "2025-03-10",
        enrolled: 1,
      },
    ],
    recommendations: [
      "김민수 CSEP 자격 갱신 또는 재취득 지원",
      "응급처치 자격 만료 예정자 재교육 등록",
      "CMP 미보유 시니어 스태프 취득 장려",
      "분기별 CE 크레딧 이수 현황 점검",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-016",
  taskName: "전문 자격 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.6.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.6: Professional Certification",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
