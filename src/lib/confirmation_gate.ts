/**
 * Confirmation Gate (복명복창)
 *
 * 중대한 변경 발생 시 사용자 승인을 대기하는 인터럽트 로직.
 * - 고가치 트랜잭션 차단 (1000만원 이상)
 * - 되돌릴 수 없는 변경 감지
 * - 여러 도메인에 영향을 미치는 작업 검토
 * - 정책/권한 변경 승인 요구
 */

import { z } from "zod";

// =============================================================================
// TYPES & SCHEMAS
// =============================================================================

export const ConfirmationChangeType = z.enum([
  "high_value",           // 금액 1000만원 이상
  "irreversible",         // 되돌릴 수 없는 변경
  "cross_domain",         // 여러 도메인에 영향
  "policy_change",        // 정책/규칙 변경
  "external_integration", // 외부 시스템 연동
  "data_deletion",        // 데이터 삭제
  "permission_change",    // 권한 변경
  "budget_exceed",        // 예산 초과
]);

export type ConfirmationChangeType = z.infer<typeof ConfirmationChangeType>;

export const ConfirmationRequestSchema = z.object({
  session_id: z.string(),
  user_id: z.string().optional(),
  event_id: z.string().optional(),
  agent_id: z.string(),
  domain: z.string(),
  original_input: z.record(z.unknown()),
  change_type: ConfirmationChangeType,
  change_description: z.string(),
  impact_summary: z.string().optional(),
  affected_domains: z.array(z.string()).optional(),
  affected_agents: z.array(z.string()).optional(),
  risk_level: z.enum(["low", "medium", "high", "critical"]).optional(),
  estimated_impact_value: z.number().optional(),
  timeout_minutes: z.number().default(30),
  timeout_action: z.enum(["reject", "approve", "escalate"]).default("reject"),
});

export type ConfirmationRequest = z.infer<typeof ConfirmationRequestSchema>;

export interface ConfirmationResult {
  request_id: string;
  status: "pending" | "confirmed" | "rejected" | "expired" | "auto_approved";
  confirmed_by?: string;
  confirmation_note?: string;
  confirmed_at?: string;
  can_proceed: boolean;
  message: string;
}

export interface StoredConfirmationRequest extends ConfirmationRequest {
  id: string;
  status: "pending" | "confirmed" | "rejected" | "expired" | "auto_approved";
  created_at: string;
  expires_at: string;
  confirmed_by?: string;
  confirmation_note?: string;
  confirmed_at?: string;
  executed?: boolean;
  execution_result?: Record<string, unknown>;
  executed_at?: string;
}

// =============================================================================
// CONFIRMATION RULES ENGINE
// =============================================================================

export interface ConfirmationRule {
  id: string;
  name: string;
  description: string;
  condition: (input: Record<string, unknown>, context: RuleContext) => boolean;
  change_type: ConfirmationChangeType;
  risk_level: "low" | "medium" | "high" | "critical";
  message_template: string;
  timeout_minutes: number;
  timeout_action: "reject" | "approve" | "escalate";
}

export interface RuleContext {
  agent_id: string;
  domain: string;
  session_id?: string;
  event_id?: string;
  user_role?: string;
}

// Default confirmation rules
export const DEFAULT_RULES: ConfirmationRule[] = [
  // 1. High Value Transaction (1000만원 이상)
  {
    id: "RULE-001",
    name: "High Value Transaction",
    description: "금액이 1000만원 이상인 트랜잭션",
    condition: (input) => {
      const valueFields = ["amount", "total_budget", "cost", "value", "price", "budget"];
      for (const field of valueFields) {
        const value = input[field];
        if (typeof value === "number" && value >= 10_000_000) return true;
        if (typeof value === "string") {
          const numValue = parseFloat(value.replace(/[,원]/g, ""));
          if (!isNaN(numValue) && numValue >= 10_000_000) return true;
        }
      }
      return false;
    },
    change_type: "high_value",
    risk_level: "high",
    message_template: "고액 트랜잭션 (1000만원 이상)이 감지되었습니다. 진행하시겠습니까?",
    timeout_minutes: 60,
    timeout_action: "reject",
  },

  // 2. Budget Exceed (예산 초과)
  {
    id: "RULE-002",
    name: "Budget Exceed",
    description: "할당된 예산을 초과하는 지출",
    condition: (input) => {
      if (input.exceeds_budget === true) return true;
      if (input.budget_variance && typeof input.budget_variance === "number") {
        return input.budget_variance < -0.1; // 10% 이상 초과
      }
      return false;
    },
    change_type: "budget_exceed",
    risk_level: "high",
    message_template: "예산 초과가 감지되었습니다. 승인이 필요합니다.",
    timeout_minutes: 120,
    timeout_action: "reject",
  },

  // 3. Data Deletion
  {
    id: "RULE-003",
    name: "Data Deletion",
    description: "데이터 삭제 작업",
    condition: (input) => {
      const deleteKeywords = ["delete", "remove", "drop", "truncate", "clear"];
      const action = String(input.action || input.operation || "").toLowerCase();
      return deleteKeywords.some((kw) => action.includes(kw));
    },
    change_type: "data_deletion",
    risk_level: "critical",
    message_template: "데이터 삭제 작업입니다. 이 작업은 되돌릴 수 없습니다. 진행하시겠습니까?",
    timeout_minutes: 30,
    timeout_action: "reject",
  },

  // 4. Cross-Domain Impact
  {
    id: "RULE-004",
    name: "Cross-Domain Impact",
    description: "여러 도메인에 영향을 미치는 변경",
    condition: (input) => {
      const affectedDomains = input.affected_domains;
      if (Array.isArray(affectedDomains) && affectedDomains.length >= 2) return true;
      return false;
    },
    change_type: "cross_domain",
    risk_level: "medium",
    message_template: "여러 도메인에 영향을 미치는 변경입니다. 검토가 필요합니다.",
    timeout_minutes: 60,
    timeout_action: "escalate",
  },

  // 5. External Integration
  {
    id: "RULE-005",
    name: "External Integration",
    description: "외부 시스템 연동 작업",
    condition: (input) => {
      const externalKeywords = ["api", "webhook", "integration", "external", "third_party"];
      const inputStr = JSON.stringify(input).toLowerCase();
      return externalKeywords.some((kw) => inputStr.includes(kw));
    },
    change_type: "external_integration",
    risk_level: "medium",
    message_template: "외부 시스템 연동 작업입니다. 승인이 필요합니다.",
    timeout_minutes: 60,
    timeout_action: "reject",
  },

  // 6. Policy/Rule Change
  {
    id: "RULE-006",
    name: "Policy Change",
    description: "정책 또는 규칙 변경",
    condition: (input, context) => {
      // System agents modifying prompts or rules
      if (context.agent_id.startsWith("SYS-")) {
        const modifyKeywords = ["update_prompt", "modify_rule", "change_policy"];
        const action = String(input.action || "").toLowerCase();
        return modifyKeywords.some((kw) => action.includes(kw));
      }
      return false;
    },
    change_type: "policy_change",
    risk_level: "high",
    message_template: "시스템 정책 변경입니다. 관리자 승인이 필요합니다.",
    timeout_minutes: 120,
    timeout_action: "reject",
  },

  // 7. Irreversible Action
  {
    id: "RULE-007",
    name: "Irreversible Action",
    description: "되돌릴 수 없는 작업",
    condition: (input) => {
      const irreversibleKeywords = [
        "finalize",
        "complete",
        "close",
        "archive",
        "publish",
        "send",
        "submit",
        "confirm_payment",
      ];
      const action = String(input.action || input.status || "").toLowerCase();
      return irreversibleKeywords.some((kw) => action.includes(kw));
    },
    change_type: "irreversible",
    risk_level: "medium",
    message_template: "이 작업은 되돌릴 수 없습니다. 진행하시겠습니까?",
    timeout_minutes: 30,
    timeout_action: "reject",
  },

  // 8. Hotel Block Contract (Site Domain)
  {
    id: "RULE-008",
    name: "Hotel Block Contract",
    description: "호텔 블록 계약 또는 대규모 객실 예약",
    condition: (input, context) => {
      if (!context.agent_id.startsWith("SITE-")) return false;
      const roomFields = ["rooms_blocked", "total_rooms", "room_count"];
      for (const field of roomFields) {
        const value = input[field];
        if (typeof value === "number" && value >= 50) return true;
      }
      return false;
    },
    change_type: "high_value",
    risk_level: "high",
    message_template: "대규모 호텔 블록 계약입니다 (50실 이상). 승인이 필요합니다.",
    timeout_minutes: 120,
    timeout_action: "reject",
  },

  // 9. Room Block Release (Site Domain)
  {
    id: "RULE-009",
    name: "Room Block Release",
    description: "객실 블록 릴리스",
    condition: (input, context) => {
      if (context.agent_id !== "SITE-037") return false;
      const releaseRooms = input.rooms_to_release;
      return typeof releaseRooms === "number" && releaseRooms >= 20;
    },
    change_type: "irreversible",
    risk_level: "medium",
    message_template: "객실 블록 릴리스 작업입니다 (20실 이상). 릴리스 후 재확보가 어려울 수 있습니다.",
    timeout_minutes: 60,
    timeout_action: "reject",
  },

  // 10. Venue Contract Signature (Site Domain)
  {
    id: "RULE-010",
    name: "Venue Contract Signature",
    description: "베뉴 계약 서명",
    condition: (input, context) => {
      if (context.agent_id !== "SITE-002") return false;
      const status = String(input.contract_status || "").toLowerCase();
      return status.includes("sign") || status.includes("execute") || status.includes("finalize");
    },
    change_type: "irreversible",
    risk_level: "critical",
    message_template: "베뉴 계약 서명 작업입니다. 법적 구속력이 발생합니다. 진행하시겠습니까?",
    timeout_minutes: 120,
    timeout_action: "reject",
  },

  // 11. High Budget Campaign (Marketing Advanced Domain)
  {
    id: "RULE-011",
    name: "High Budget Campaign",
    description: "고예산 마케팅 캠페인 (5000만원 이상)",
    condition: (input, context) => {
      if (!context.agent_id.startsWith("MKTADV-")) return false;
      const budgetFields = ["campaign_budget", "total_budget", "budget_amount"];
      for (const field of budgetFields) {
        const value = input[field];
        if (typeof value === "number" && value >= 50000000) return true;
      }
      return false;
    },
    change_type: "high_value",
    risk_level: "high",
    message_template: "고예산 마케팅 캠페인입니다 (5000만원 이상). 승인이 필요합니다.",
    timeout_minutes: 120,
    timeout_action: "reject",
  },

  // 12. Mass Email Campaign (Marketing Advanced Domain)
  {
    id: "RULE-012",
    name: "Mass Email Campaign",
    description: "대량 이메일 발송 (10,000명 이상)",
    condition: (input, context) => {
      if (!context.agent_id.startsWith("MKTADV-")) return false;
      const recipientFields = ["recipient_count", "target_audience_size", "email_count"];
      for (const field of recipientFields) {
        const value = input[field];
        if (typeof value === "number" && value >= 10000) return true;
      }
      return false;
    },
    change_type: "external_integration",
    risk_level: "medium",
    message_template: "대량 이메일 발송입니다 (10,000명 이상). 발송 전 승인이 필요합니다.",
    timeout_minutes: 60,
    timeout_action: "reject",
  },

  // 13. CRM Data Bulk Update (Marketing Advanced Domain)
  {
    id: "RULE-013",
    name: "CRM Data Bulk Update",
    description: "CRM 데이터 대량 업데이트",
    condition: (input, context) => {
      if (!context.agent_id.startsWith("MKTADV-")) return false;
      const bulkKeywords = ["bulk_update", "mass_update", "batch_update"];
      const action = String(input.action || "").toLowerCase();
      if (bulkKeywords.some((kw) => action.includes(kw))) return true;
      const recordCount = input.record_count || input.affected_records;
      return typeof recordCount === "number" && recordCount >= 1000;
    },
    change_type: "data_deletion",
    risk_level: "high",
    message_template: "CRM 데이터 대량 업데이트입니다. 영향받는 레코드: 1000건 이상. 승인이 필요합니다.",
    timeout_minutes: 60,
    timeout_action: "reject",
  },

  // 14. Retargeting Audience Export (Marketing Advanced Domain)
  {
    id: "RULE-014",
    name: "Retargeting Audience Export",
    description: "리타겟팅 오디언스 외부 플랫폼 내보내기",
    condition: (input, context) => {
      if (context.agent_id !== "MKTADV-026") return false;
      const exportKeywords = ["export", "sync_to_platform", "upload"];
      const action = String(input.action || input.export_type || "").toLowerCase();
      return exportKeywords.some((kw) => action.includes(kw));
    },
    change_type: "external_integration",
    risk_level: "medium",
    message_template: "리타겟팅 오디언스를 외부 광고 플랫폼으로 내보냅니다. 개인정보 규정을 확인하셨습니까?",
    timeout_minutes: 30,
    timeout_action: "reject",
  },

  // 15. Lead Segment Delete (Marketing Advanced Domain)
  {
    id: "RULE-015",
    name: "Lead Segment Delete",
    description: "리드 세그먼트 삭제",
    condition: (input, context) => {
      if (!context.agent_id.startsWith("MKTADV-")) return false;
      const deleteKeywords = ["delete_segment", "remove_segment", "archive_segment"];
      const action = String(input.action || "").toLowerCase();
      return deleteKeywords.some((kw) => action.includes(kw));
    },
    change_type: "data_deletion",
    risk_level: "medium",
    message_template: "리드 세그먼트 삭제 작업입니다. 삭제 후 복구가 어려울 수 있습니다.",
    timeout_minutes: 30,
    timeout_action: "reject",
  },

  // ============ PROFESSIONALISM DOMAIN (PRO) - Domain J ============

  // 16. Whistleblower Report (Professionalism Domain)
  {
    id: "RULE-016",
    name: "Whistleblower Report",
    description: "내부고발 또는 윤리 위반 보고",
    condition: (input, context) => {
      if (context.agent_id !== "PRO-009") return false;
      const sensitiveKeywords = ["whistleblower", "ethics_violation", "misconduct", "fraud"];
      const inputStr = JSON.stringify(input).toLowerCase();
      return sensitiveKeywords.some((kw) => inputStr.includes(kw));
    },
    change_type: "policy_change",
    risk_level: "critical",
    message_template: "내부고발/윤리 위반 보고입니다. 민감한 정보가 포함되어 있어 승인이 필요합니다.",
    timeout_minutes: 60,
    timeout_action: "escalate",
  },

  // 17. Legal Risk Critical (Professionalism Domain)
  {
    id: "RULE-017",
    name: "Legal Risk Critical",
    description: "높은 법적 리스크 감지",
    condition: (input, context) => {
      if (!context.agent_id.startsWith("PRO-")) return false;
      const riskLevel = String(input.risk_level || input.overall_risk_level || "").toLowerCase();
      return riskLevel === "critical" || riskLevel === "high";
    },
    change_type: "high_value",
    risk_level: "high",
    message_template: "높은 법적 리스크가 감지되었습니다. 법무팀 검토가 필요합니다.",
    timeout_minutes: 120,
    timeout_action: "reject",
  },

  // 18. Privacy Data Export (Professionalism Domain)
  {
    id: "RULE-018",
    name: "Privacy Data Export",
    description: "개인정보 외부 전송",
    condition: (input, context) => {
      if (context.agent_id !== "PRO-013") return false;
      const exportKeywords = ["export", "transfer", "share_external", "third_party_transfer"];
      const action = String(input.action || "").toLowerCase();
      return exportKeywords.some((kw) => action.includes(kw));
    },
    change_type: "external_integration",
    risk_level: "high",
    message_template: "개인정보 외부 전송 작업입니다. GDPR/개인정보보호법 준수 여부를 확인하세요.",
    timeout_minutes: 60,
    timeout_action: "reject",
  },

  // 19. Contract Signature (Professionalism Domain)
  {
    id: "RULE-019",
    name: "Contract Signature",
    description: "계약 서명 또는 법적 구속력 있는 문서 제출",
    condition: (input, context) => {
      if (context.agent_id !== "PRO-012") return false;
      const signKeywords = ["sign", "execute", "finalize", "submit_legal"];
      const action = String(input.action || input.compliance_status || "").toLowerCase();
      return signKeywords.some((kw) => action.includes(kw));
    },
    change_type: "irreversible",
    risk_level: "critical",
    message_template: "계약 서명/법적 문서 제출 작업입니다. 법적 구속력이 발생합니다. 진행하시겠습니까?",
    timeout_minutes: 120,
    timeout_action: "reject",
  },

  // 20. Conflict of Interest Declaration (Professionalism Domain)
  {
    id: "RULE-020",
    name: "Conflict of Interest Declaration",
    description: "이해충돌 선언 또는 고위험 COI 감지",
    condition: (input, context) => {
      if (context.agent_id !== "PRO-007") return false;
      const coiRiskLevel = String(input.coi_risk_level || "").toLowerCase();
      return coiRiskLevel === "high" || coiRiskLevel === "critical";
    },
    change_type: "policy_change",
    risk_level: "high",
    message_template: "고위험 이해충돌이 감지되었습니다. 윤리위원회 검토가 필요합니다.",
    timeout_minutes: 60,
    timeout_action: "escalate",
  },
];

// =============================================================================
// CONFIRMATION GATE CLASS
// =============================================================================

export class ConfirmationGate {
  private db: D1Database;
  private kv: KVNamespace;
  private rules: ConfirmationRule[];

  constructor(db: D1Database, kv: KVNamespace, customRules?: ConfirmationRule[]) {
    this.db = db;
    this.kv = kv;
    this.rules = customRules || DEFAULT_RULES;
  }

  /**
   * Check if an action requires confirmation
   */
  async checkRequiresConfirmation(
    input: Record<string, unknown>,
    context: RuleContext
  ): Promise<{
    requires_confirmation: boolean;
    triggered_rules: ConfirmationRule[];
    highest_risk_level: "low" | "medium" | "high" | "critical";
  }> {
    const triggeredRules = this.rules.filter((rule) => {
      try {
        return rule.condition(input, context);
      } catch {
        return false;
      }
    });

    if (triggeredRules.length === 0) {
      return {
        requires_confirmation: false,
        triggered_rules: [],
        highest_risk_level: "low",
      };
    }

    const riskOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const highestRisk = triggeredRules.reduce((max, rule) => {
      return riskOrder[rule.risk_level] > riskOrder[max] ? rule.risk_level : max;
    }, "low" as "low" | "medium" | "high" | "critical");

    return {
      requires_confirmation: true,
      triggered_rules: triggeredRules,
      highest_risk_level: highestRisk,
    };
  }

  /**
   * Create a confirmation request
   */
  async createRequest(request: ConfirmationRequest): Promise<StoredConfirmationRequest> {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + request.timeout_minutes * 60 * 1000);

    const storedRequest: StoredConfirmationRequest = {
      ...request,
      id,
      status: "pending",
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    // Store in D1
    await this.db
      .prepare(
        `INSERT INTO confirmation_requests (
          id, session_id, user_id, event_id, agent_id, domain,
          original_input, change_type, change_description,
          impact_summary, affected_domains, affected_agents,
          risk_level, estimated_impact_value, status, expires_at, timeout_action, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        request.session_id,
        request.user_id || null,
        request.event_id || null,
        request.agent_id,
        request.domain,
        JSON.stringify(request.original_input),
        request.change_type,
        request.change_description,
        request.impact_summary || null,
        request.affected_domains ? JSON.stringify(request.affected_domains) : null,
        request.affected_agents ? JSON.stringify(request.affected_agents) : null,
        request.risk_level || null,
        request.estimated_impact_value || null,
        "pending",
        expiresAt.toISOString(),
        request.timeout_action,
        now.toISOString()
      )
      .run();

    // Also cache in KV for quick lookup
    await this.kv.put(
      `confirm:${id}`,
      JSON.stringify(storedRequest),
      { expirationTtl: request.timeout_minutes * 60 + 300 } // Add 5 min buffer
    );

    return storedRequest;
  }

  /**
   * Get pending confirmation request
   */
  async getRequest(requestId: string): Promise<StoredConfirmationRequest | null> {
    // Try KV first
    const cached = await this.kv.get(`confirm:${requestId}`);
    if (cached) {
      return JSON.parse(cached) as StoredConfirmationRequest;
    }

    // Fall back to D1
    const result = await this.db
      .prepare("SELECT * FROM confirmation_requests WHERE id = ?")
      .bind(requestId)
      .first();

    if (!result) return null;

    return {
      id: result.id as string,
      session_id: result.session_id as string,
      user_id: result.user_id as string | undefined,
      event_id: result.event_id as string | undefined,
      agent_id: result.agent_id as string,
      domain: result.domain as string,
      original_input: JSON.parse(result.original_input as string),
      change_type: result.change_type as ConfirmationChangeType,
      change_description: result.change_description as string,
      impact_summary: result.impact_summary as string | undefined,
      affected_domains: result.affected_domains ? JSON.parse(result.affected_domains as string) : undefined,
      affected_agents: result.affected_agents ? JSON.parse(result.affected_agents as string) : undefined,
      risk_level: result.risk_level as "low" | "medium" | "high" | "critical" | undefined,
      estimated_impact_value: result.estimated_impact_value as number | undefined,
      timeout_minutes: 30, // Default
      timeout_action: result.timeout_action as "reject" | "approve" | "escalate",
      status: result.status as StoredConfirmationRequest["status"],
      created_at: result.created_at as string,
      expires_at: result.expires_at as string,
      confirmed_by: result.confirmed_by as string | undefined,
      confirmation_note: result.confirmation_note as string | undefined,
      confirmed_at: result.confirmed_at as string | undefined,
      executed: result.executed as boolean | undefined,
      execution_result: result.execution_result ? JSON.parse(result.execution_result as string) : undefined,
      executed_at: result.executed_at as string | undefined,
    };
  }

  /**
   * Confirm a request
   */
  async confirm(
    requestId: string,
    confirmedBy: string,
    note?: string
  ): Promise<ConfirmationResult> {
    const request = await this.getRequest(requestId);
    if (!request) {
      return {
        request_id: requestId,
        status: "rejected",
        can_proceed: false,
        message: "Confirmation request not found",
      };
    }

    if (request.status !== "pending") {
      return {
        request_id: requestId,
        status: request.status,
        can_proceed: request.status === "confirmed" || request.status === "auto_approved",
        message: `Request already ${request.status}`,
      };
    }

    // Check expiration
    if (new Date(request.expires_at) < new Date()) {
      await this.updateStatus(requestId, "expired");
      return {
        request_id: requestId,
        status: "expired",
        can_proceed: false,
        message: "Confirmation request has expired",
      };
    }

    const now = new Date().toISOString();
    await this.db
      .prepare(
        `UPDATE confirmation_requests
         SET status = 'confirmed', confirmed_by = ?, confirmation_note = ?, confirmed_at = ?
         WHERE id = ?`
      )
      .bind(confirmedBy, note || null, now, requestId)
      .run();

    // Update KV cache
    request.status = "confirmed";
    request.confirmed_by = confirmedBy;
    request.confirmation_note = note;
    request.confirmed_at = now;
    await this.kv.put(`confirm:${requestId}`, JSON.stringify(request));

    return {
      request_id: requestId,
      status: "confirmed",
      confirmed_by: confirmedBy,
      confirmation_note: note,
      confirmed_at: now,
      can_proceed: true,
      message: "Request confirmed. Proceeding with action.",
    };
  }

  /**
   * Reject a request
   */
  async reject(
    requestId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<ConfirmationResult> {
    const request = await this.getRequest(requestId);
    if (!request) {
      return {
        request_id: requestId,
        status: "rejected",
        can_proceed: false,
        message: "Confirmation request not found",
      };
    }

    await this.db
      .prepare(
        `UPDATE confirmation_requests
         SET status = 'rejected', confirmed_by = ?, confirmation_note = ?, confirmed_at = ?
         WHERE id = ?`
      )
      .bind(rejectedBy, reason || null, new Date().toISOString(), requestId)
      .run();

    await this.kv.delete(`confirm:${requestId}`);

    return {
      request_id: requestId,
      status: "rejected",
      confirmed_by: rejectedBy,
      confirmation_note: reason,
      can_proceed: false,
      message: reason || "Request rejected",
    };
  }

  /**
   * Get pending requests for a session
   */
  async getPendingRequests(sessionId: string): Promise<StoredConfirmationRequest[]> {
    const results = await this.db
      .prepare(
        `SELECT * FROM confirmation_requests
         WHERE session_id = ? AND status = 'pending' AND expires_at > datetime('now')
         ORDER BY created_at DESC`
      )
      .bind(sessionId)
      .all();

    return (results.results || []).map((r) => ({
      id: r.id as string,
      session_id: r.session_id as string,
      user_id: r.user_id as string | undefined,
      event_id: r.event_id as string | undefined,
      agent_id: r.agent_id as string,
      domain: r.domain as string,
      original_input: JSON.parse(r.original_input as string),
      change_type: r.change_type as ConfirmationChangeType,
      change_description: r.change_description as string,
      timeout_minutes: 30,
      timeout_action: r.timeout_action as "reject" | "approve" | "escalate",
      status: r.status as "pending",
      created_at: r.created_at as string,
      expires_at: r.expires_at as string,
    }));
  }

  /**
   * Process expired requests
   */
  async processExpiredRequests(): Promise<number> {
    const expired = await this.db
      .prepare(
        `SELECT id, timeout_action FROM confirmation_requests
         WHERE status = 'pending' AND expires_at <= datetime('now')`
      )
      .all();

    let processed = 0;
    for (const row of expired.results || []) {
      const action = row.timeout_action as "reject" | "approve" | "escalate";
      let newStatus: "expired" | "auto_approved" = "expired";

      if (action === "approve") {
        newStatus = "auto_approved";
      }
      // escalate would trigger notification (not implemented here)

      await this.updateStatus(row.id as string, newStatus);
      processed++;
    }

    return processed;
  }

  private async updateStatus(requestId: string, status: StoredConfirmationRequest["status"]) {
    await this.db
      .prepare("UPDATE confirmation_requests SET status = ? WHERE id = ?")
      .bind(status, requestId)
      .run();
    await this.kv.delete(`confirm:${requestId}`);
  }

  /**
   * Mark request as executed
   */
  async markExecuted(
    requestId: string,
    result: Record<string, unknown>
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE confirmation_requests
         SET executed = TRUE, execution_result = ?, executed_at = ?
         WHERE id = ?`
      )
      .bind(JSON.stringify(result), new Date().toISOString(), requestId)
      .run();
  }
}

// =============================================================================
// MIDDLEWARE HELPER
// =============================================================================

/**
 * Helper to wrap agent execution with confirmation gate
 */
export async function withConfirmation<T>(
  gate: ConfirmationGate,
  context: RuleContext,
  input: Record<string, unknown>,
  executor: () => Promise<T>
): Promise<
  | { status: "executed"; result: T }
  | { status: "requires_confirmation"; request: StoredConfirmationRequest }
  | { status: "rejected"; message: string }
> {
  // Check if confirmation is required
  const check = await gate.checkRequiresConfirmation(input, context);

  if (!check.requires_confirmation) {
    // Execute directly
    const result = await executor();
    return { status: "executed", result };
  }

  // Create confirmation request
  const primaryRule = check.triggered_rules[0];
  const request = await gate.createRequest({
    session_id: context.session_id || "system",
    event_id: context.event_id,
    agent_id: context.agent_id,
    domain: context.domain,
    original_input: input,
    change_type: primaryRule.change_type,
    change_description: primaryRule.message_template,
    risk_level: check.highest_risk_level,
    timeout_minutes: primaryRule.timeout_minutes,
    timeout_action: primaryRule.timeout_action,
  });

  return {
    status: "requires_confirmation",
    request,
  };
}

export default ConfirmationGate;
