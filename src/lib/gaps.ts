/**
 * System Gaps Detection & Logging
 *
 * AI가 자체적으로 감지한 시스템 한계/개선점을 기록.
 * - MISSING_FEAT: 요청되었으나 없는 기능
 * - LOGIC_ERROR: 로직 오류/부정확한 결과
 * - USER_FRUSTRATION: 사용자 불만 감지
 * - DATA_GAP: 데이터 부족
 * - PERF_ISSUE: 성능 문제
 */

export type GapType =
  | "MISSING_FEAT"
  | "LOGIC_ERROR"
  | "USER_FRUSTRATION"
  | "DATA_GAP"
  | "PERF_ISSUE";

export type GapSeverity = "low" | "medium" | "high" | "critical";

export interface SystemGap {
  id?: number;
  interaction_id?: number;
  gap_type: GapType;
  severity: GapSeverity;
  description: string;
  context_data?: string;
  suggested_fix?: string;
  status?: string;
  created_at?: string;
}

export interface DetectedGap {
  type: GapType;
  severity: GapSeverity;
  description: string;
  suggested_fix?: string;
}

/**
 * 시스템 갭 기록
 */
export async function logSystemGap(
  db: D1Database,
  gap: Omit<SystemGap, "id" | "created_at" | "status">
): Promise<number> {
  const result = await db
    .prepare(
      `INSERT INTO system_gaps
      (interaction_id, gap_type, severity, description, context_data, suggested_fix)
      VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      gap.interaction_id || null,
      gap.gap_type,
      gap.severity,
      gap.description,
      gap.context_data || null,
      gap.suggested_fix || null
    )
    .run();

  return result.meta.last_row_id;
}

/**
 * 원본 대화 저장
 */
export async function logRawConversation(
  db: D1Database,
  sessionId: string,
  messageType: "user_input" | "agent_response" | "system_event",
  content: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  const result = await db
    .prepare(
      `INSERT INTO raw_conversations (session_id, message_type, content, metadata)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      sessionId,
      messageType,
      content,
      metadata ? JSON.stringify(metadata) : null
    )
    .run();

  return result.meta.last_row_id;
}

/**
 * 열린 갭 목록 조회
 */
export async function getOpenGaps(
  db: D1Database,
  limit = 20
): Promise<SystemGap[]> {
  const result = await db
    .prepare(
      `SELECT * FROM system_gaps
       WHERE status = 'open'
       ORDER BY
         CASE severity
           WHEN 'critical' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low' THEN 4
         END,
         created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();

  return (result.results || []) as unknown as SystemGap[];
}

/**
 * 갭 통계
 */
export async function getGapStats(db: D1Database): Promise<{
  total: number;
  by_type: Record<GapType, number>;
  by_severity: Record<GapSeverity, number>;
  open_count: number;
}> {
  const total = await db
    .prepare("SELECT COUNT(*) as count FROM system_gaps")
    .first();

  const byType = await db
    .prepare(
      "SELECT gap_type, COUNT(*) as count FROM system_gaps GROUP BY gap_type"
    )
    .all();

  const bySeverity = await db
    .prepare(
      "SELECT severity, COUNT(*) as count FROM system_gaps GROUP BY severity"
    )
    .all();

  const openCount = await db
    .prepare("SELECT COUNT(*) as count FROM system_gaps WHERE status = 'open'")
    .first();

  const typeMap: Record<string, number> = {};
  for (const row of (byType.results || []) as any[]) {
    typeMap[row.gap_type] = row.count;
  }

  const sevMap: Record<string, number> = {};
  for (const row of (bySeverity.results || []) as any[]) {
    sevMap[row.severity] = row.count;
  }

  return {
    total: (total?.count as number) || 0,
    by_type: typeMap as Record<GapType, number>,
    by_severity: sevMap as Record<GapSeverity, number>,
    open_count: (openCount?.count as number) || 0,
  };
}

/**
 * 반복 질문 패턴 감지 (사용자 불만 시그널)
 */
export async function detectRepetitionPattern(
  db: D1Database,
  sessionId: string,
  currentTaskId: string
): Promise<{ isRepeated: boolean; count: number }> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM interactions
       WHERE session_id = ? AND task_id = ?
       AND created_at > datetime('now', '-10 minutes')`
    )
    .bind(sessionId, currentTaskId)
    .first();

  const count = (result?.count as number) || 0;
  return {
    isRepeated: count >= 2,
    count,
  };
}

/**
 * 갭 상태 업데이트
 */
export async function updateGapStatus(
  db: D1Database,
  gapId: number,
  status: "open" | "acknowledged" | "in_progress" | "resolved" | "wont_fix"
): Promise<void> {
  const resolvedAt = status === "resolved" ? "datetime('now')" : "NULL";
  await db
    .prepare(
      `UPDATE system_gaps SET status = ?, resolved_at = ${
        status === "resolved" ? "datetime('now')" : "NULL"
      } WHERE id = ?`
    )
    .bind(status, gapId)
    .run();
}
