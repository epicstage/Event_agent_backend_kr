/**
 * HR-035: Credential Verification
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 자격증 및 인증 검증
 */

import { z } from "zod";

export const HR_035_InputSchema = z.object({
  event_id: z.string().uuid(),
  staff_credentials: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    role: z.string(),
    required_credentials: z.array(z.string()),
    submitted_credentials: z.array(z.object({
      credential_type: z.string(),
      issuing_authority: z.string(),
      issue_date: z.string(),
      expiry_date: z.string().optional(),
      document_url: z.string().optional(),
      verified: z.boolean().optional(),
    })),
  })),
  verification_requirements: z.object({
    mandatory_checks: z.array(z.string()),
    background_check_required: z.boolean(),
    verification_deadline: z.string(),
  }),
});

export const HR_035_OutputSchema = z.object({
  event_id: z.string(),
  verification_summary: z.object({
    total_staff: z.number(),
    fully_verified: z.number(),
    pending_verification: z.number(),
    failed_verification: z.number(),
    verification_rate: z.number(),
  }),
  staff_status: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    role: z.string(),
    overall_status: z.enum(["verified", "pending", "failed", "expired"]),
    credentials: z.array(z.object({
      type: z.string(),
      status: z.enum(["verified", "pending", "expired", "missing", "invalid"]),
      expiry_date: z.string().optional(),
      action_required: z.string().optional(),
    })),
    clearance_level: z.enum(["full", "conditional", "restricted", "none"]),
  })),
  expiring_credentials: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    credential: z.string(),
    expiry_date: z.string(),
    days_until_expiry: z.number(),
    action: z.string(),
  })),
  missing_credentials: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    role: z.string(),
    missing: z.array(z.string()),
    deadline: z.string(),
    impact: z.string(),
  })),
  verification_actions: z.array(z.object({
    priority: z.enum(["urgent", "high", "medium", "low"]),
    action: z.string(),
    staff_affected: z.number(),
    deadline: z.string(),
    responsible: z.string(),
  })),
  compliance_report: z.object({
    mandatory_compliance_rate: z.number(),
    issues: z.array(z.object({
      issue: z.string(),
      severity: z.enum(["critical", "major", "minor"]),
      resolution: z.string(),
    })),
    audit_ready: z.boolean(),
  }),
});

export type HR_035_Input = z.infer<typeof HR_035_InputSchema>;
export type HR_035_Output = z.infer<typeof HR_035_OutputSchema>;

export async function execute(input: HR_035_Input): Promise<HR_035_Output> {
  const today = new Date();
  const staffStatus = [];
  const expiringCredentials = [];
  const missingCredentials = [];

  let fullyVerified = 0;
  let pending = 0;
  let failed = 0;

  for (const staff of input.staff_credentials) {
    const credentials = [];
    let hasExpired = false;
    let hasMissing = false;
    let hasPending = false;

    for (const required of staff.required_credentials) {
      const submitted = staff.submitted_credentials.find(
        (c) => c.credential_type.toLowerCase().includes(required.toLowerCase())
      );

      if (!submitted) {
        credentials.push({
          type: required,
          status: "missing" as const,
          action_required: "자격증 제출 필요",
        });
        hasMissing = true;
      } else {
        const expiryDate = submitted.expiry_date ? new Date(submitted.expiry_date) : null;
        const daysUntilExpiry = expiryDate
          ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        if (expiryDate && expiryDate < today) {
          credentials.push({
            type: required,
            status: "expired" as const,
            expiry_date: submitted.expiry_date,
            action_required: "자격증 갱신 필요",
          });
          hasExpired = true;
        } else if (submitted.verified === false) {
          credentials.push({
            type: required,
            status: "invalid" as const,
            action_required: "재확인 필요",
          });
          hasMissing = true;
        } else if (submitted.verified === undefined) {
          credentials.push({
            type: required,
            status: "pending" as const,
            expiry_date: submitted.expiry_date,
            action_required: "검증 대기 중",
          });
          hasPending = true;
        } else {
          credentials.push({
            type: required,
            status: "verified" as const,
            expiry_date: submitted.expiry_date,
          });

          // 만료 임박 체크 (30일 이내)
          if (daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            expiringCredentials.push({
              staff_id: staff.staff_id,
              name: staff.name,
              credential: required,
              expiry_date: submitted.expiry_date!,
              days_until_expiry: daysUntilExpiry,
              action: daysUntilExpiry <= 7 ? "즉시 갱신 요청" : "갱신 알림 발송",
            });
          }
        }
      }
    }

    let overallStatus: "verified" | "pending" | "failed" | "expired" = "verified";
    let clearanceLevel: "full" | "conditional" | "restricted" | "none" = "full";

    if (hasMissing || hasExpired) {
      overallStatus = hasExpired ? "expired" : "failed";
      clearanceLevel = "none";
      failed++;

      if (hasMissing) {
        missingCredentials.push({
          staff_id: staff.staff_id,
          name: staff.name,
          role: staff.role,
          missing: staff.required_credentials.filter(
            (r) => !staff.submitted_credentials.some(
              (s) => s.credential_type.toLowerCase().includes(r.toLowerCase())
            )
          ),
          deadline: input.verification_requirements.verification_deadline,
          impact: "업무 배치 불가",
        });
      }
    } else if (hasPending) {
      overallStatus = "pending";
      clearanceLevel = "conditional";
      pending++;
    } else {
      fullyVerified++;
    }

    staffStatus.push({
      staff_id: staff.staff_id,
      name: staff.name,
      role: staff.role,
      overall_status: overallStatus,
      credentials,
      clearance_level: clearanceLevel,
    });
  }

  // 조치 사항
  const verificationActions = [];

  if (missingCredentials.length > 0) {
    verificationActions.push({
      priority: "urgent" as const,
      action: "누락 자격증 제출 요청",
      staff_affected: missingCredentials.length,
      deadline: input.verification_requirements.verification_deadline,
      responsible: "HR 담당",
    });
  }

  if (expiringCredentials.filter((e) => e.days_until_expiry <= 7).length > 0) {
    verificationActions.push({
      priority: "high" as const,
      action: "만료 임박 자격증 갱신 요청",
      staff_affected: expiringCredentials.filter((e) => e.days_until_expiry <= 7).length,
      deadline: "즉시",
      responsible: "HR 담당",
    });
  }

  if (pending > 0) {
    verificationActions.push({
      priority: "medium" as const,
      action: "검증 대기 자격증 확인 완료",
      staff_affected: pending,
      deadline: input.verification_requirements.verification_deadline,
      responsible: "검증 담당",
    });
  }

  // 컴플라이언스 리포트
  const mandatoryComplianceRate = Math.round((fullyVerified / input.staff_credentials.length) * 100);
  const issues = [];

  if (missingCredentials.length > 0) {
    issues.push({
      issue: `${missingCredentials.length}명의 필수 자격증 누락`,
      severity: "critical" as const,
      resolution: "자격증 제출 완료 전 업무 배치 보류",
    });
  }

  if (expiringCredentials.length > 0) {
    issues.push({
      issue: `${expiringCredentials.length}개 자격증 만료 임박`,
      severity: "major" as const,
      resolution: "갱신 요청 및 임시 배치 계획 수립",
    });
  }

  return {
    event_id: input.event_id,
    verification_summary: {
      total_staff: input.staff_credentials.length,
      fully_verified: fullyVerified,
      pending_verification: pending,
      failed_verification: failed,
      verification_rate: Math.round((fullyVerified / input.staff_credentials.length) * 100),
    },
    staff_status: staffStatus,
    expiring_credentials: expiringCredentials.sort((a, b) => a.days_until_expiry - b.days_until_expiry),
    missing_credentials: missingCredentials,
    verification_actions: verificationActions,
    compliance_report: {
      mandatory_compliance_rate: mandatoryComplianceRate,
      issues,
      audit_ready: mandatoryComplianceRate >= 100 && issues.filter((i) => i.severity === "critical").length === 0,
    },
  };
}

export const HR_035_CredentialVerification = {
  id: "HR-035",
  name: "Credential Verification",
  description: "자격증 및 인증 검증",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.20",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_035_InputSchema,
  outputSchema: HR_035_OutputSchema,
  persona: `당신은 자격 검증 전문가입니다. 철저한 검증으로 적격 인력만 현장에 배치되도록 보장합니다.`,
};

export default HR_035_CredentialVerification;
