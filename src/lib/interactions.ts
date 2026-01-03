/**
 * Interactions Logger
 *
 * D1 기반 인터랙션 로깅.
 * - 모든 execute-with-llm 요청 기록
 * - 피드백 및 AI 진화 노트 저장
 */

export interface InteractionRecord {
  id?: number;
  session_id: string;
  task_id: string;
  user_query: string;
  agent_output: string;
  ai_insight: string;
  user_feedback?: string;
  evolution_note?: string;
  created_at?: string;
}

/**
 * 인터랙션 기록
 */
export async function logInteraction(
  db: D1Database,
  record: Omit<InteractionRecord, "id" | "created_at">
): Promise<number> {
  const result = await db
    .prepare(
      `INSERT INTO interactions
      (session_id, task_id, user_query, agent_output, ai_insight, user_feedback, evolution_note)
      VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      record.session_id,
      record.task_id,
      record.user_query,
      record.agent_output,
      record.ai_insight,
      record.user_feedback || null,
      record.evolution_note || null
    )
    .run();

  return result.meta.last_row_id;
}

/**
 * 세션별 인터랙션 조회
 */
export async function getSessionInteractions(
  db: D1Database,
  sessionId: string,
  limit = 10
): Promise<InteractionRecord[]> {
  const result = await db
    .prepare(
      `SELECT * FROM interactions
       WHERE session_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(sessionId, limit)
    .all();

  return (result.results || []) as unknown as InteractionRecord[];
}

/**
 * 태스크별 인터랙션 통계
 */
export async function getTaskInteractionStats(
  db: D1Database,
  taskId: string
): Promise<{
  total_count: number;
  avg_confidence: number;
  recent_feedback: string[];
}> {
  const countResult = await db
    .prepare("SELECT COUNT(*) as count FROM interactions WHERE task_id = ?")
    .bind(taskId)
    .first();

  const recentFeedback = await db
    .prepare(
      `SELECT user_feedback FROM interactions
       WHERE task_id = ? AND user_feedback IS NOT NULL
       ORDER BY created_at DESC LIMIT 5`
    )
    .bind(taskId)
    .all();

  return {
    total_count: (countResult?.count as number) || 0,
    avg_confidence: 0, // Could calculate from ai_insight JSON if needed
    recent_feedback: (recentFeedback.results || []).map(
      (r: any) => r.user_feedback
    ),
  };
}

/**
 * 피드백 업데이트
 */
export async function updateFeedback(
  db: D1Database,
  interactionId: number,
  feedback: string
): Promise<void> {
  await db
    .prepare("UPDATE interactions SET user_feedback = ? WHERE id = ?")
    .bind(feedback, interactionId)
    .run();
}

/**
 * Evolution Note 업데이트 (AI 자기 학습 메모)
 */
export async function updateEvolutionNote(
  db: D1Database,
  interactionId: number,
  note: string
): Promise<void> {
  await db
    .prepare("UPDATE interactions SET evolution_note = ? WHERE id = ?")
    .bind(note, interactionId)
    .run();
}
