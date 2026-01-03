/**
 * Session Context Manager
 *
 * KV 기반 세션 컨텍스트 캐싱.
 * - 최근 10개 대화 유지
 * - LLM 프롬프트에 Short-term Memory로 주입
 * - 사용자 선호도 학습 및 캐싱
 * - 반복 질문/불만 패턴 감지
 */

export interface ConversationEntry {
  taskId: string;
  input: unknown;
  output: unknown;
  aiInsights?: {
    analysis: string;
    recommendations: string[];
    confidence_score: number;
  };
  timestamp: string;
  userSatisfied?: boolean; // 사용자 만족 여부
}

export interface UserPreferences {
  language: string;
  detail_level: "brief" | "standard" | "detailed";
  industry_focus?: string;
  past_topics: string[];
  preferred_formats?: string[];
}

export interface SessionContext {
  sessionId: string;
  conversations: ConversationEntry[];
  preferences: UserPreferences;
  frustrationSignals: FrustrationSignal[];
  createdAt: string;
  updatedAt: string;
}

export interface FrustrationSignal {
  type: "repeated_question" | "negative_feedback" | "abandoned_task";
  taskId: string;
  count: number;
  lastOccurred: string;
}

const MAX_CONVERSATIONS = 10;
const SESSION_TTL = 60 * 60 * 24; // 24 hours
const FRUSTRATION_THRESHOLD = 2; // 2회 이상 반복 시 불만 신호

/**
 * 세션 컨텍스트 조회
 */
export async function getSessionContext(
  kv: KVNamespace,
  sessionId: string
): Promise<SessionContext | null> {
  const key = `user_session:${sessionId}`;
  const data = await kv.get(key, "json");
  return data as SessionContext | null;
}

/**
 * 세션 컨텍스트 저장
 */
export async function saveSessionContext(
  kv: KVNamespace,
  context: SessionContext
): Promise<void> {
  const key = `user_session:${context.sessionId}`;
  await kv.put(key, JSON.stringify(context), { expirationTtl: SESSION_TTL });
}

/**
 * 기본 선호도 생성
 */
function createDefaultPreferences(): UserPreferences {
  return {
    language: "ko",
    detail_level: "standard",
    past_topics: [],
  };
}

/**
 * 대화 추가 (최대 10개 유지) + 반복 질문 감지
 */
export async function addConversation(
  kv: KVNamespace,
  sessionId: string,
  entry: Omit<ConversationEntry, "timestamp">
): Promise<{ context: SessionContext; isRepeated: boolean }> {
  let context = await getSessionContext(kv, sessionId);
  const now = new Date().toISOString();

  if (!context) {
    context = {
      sessionId,
      conversations: [],
      preferences: createDefaultPreferences(),
      frustrationSignals: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // 반복 질문 감지
  const recentSameTask = context.conversations.filter(
    (c) =>
      c.taskId === entry.taskId &&
      new Date(c.timestamp).getTime() > Date.now() - 10 * 60 * 1000 // 10분 이내
  );

  const isRepeated = recentSameTask.length >= FRUSTRATION_THRESHOLD;

  if (isRepeated) {
    // 불만 신호 기록
    const existingSignal = context.frustrationSignals.find(
      (s) => s.taskId === entry.taskId && s.type === "repeated_question"
    );
    if (existingSignal) {
      existingSignal.count++;
      existingSignal.lastOccurred = now;
    } else {
      context.frustrationSignals.push({
        type: "repeated_question",
        taskId: entry.taskId,
        count: 1,
        lastOccurred: now,
      });
    }
  }

  const newEntry: ConversationEntry = {
    ...entry,
    timestamp: now,
  };

  context.conversations.push(newEntry);

  // 최대 10개 유지
  if (context.conversations.length > MAX_CONVERSATIONS) {
    context.conversations = context.conversations.slice(-MAX_CONVERSATIONS);
  }

  // 토픽 학습
  if (!context.preferences.past_topics.includes(entry.taskId)) {
    context.preferences.past_topics.push(entry.taskId);
    if (context.preferences.past_topics.length > 20) {
      context.preferences.past_topics = context.preferences.past_topics.slice(-20);
    }
  }

  context.updatedAt = now;
  await saveSessionContext(kv, context);

  return { context, isRepeated };
}

/**
 * 사용자 선호도 업데이트
 */
export async function updatePreferences(
  kv: KVNamespace,
  sessionId: string,
  updates: Partial<UserPreferences>
): Promise<SessionContext | null> {
  const context = await getSessionContext(kv, sessionId);
  if (!context) return null;

  context.preferences = { ...context.preferences, ...updates };
  context.updatedAt = new Date().toISOString();
  await saveSessionContext(kv, context);

  return context;
}

/**
 * 불만 신호 조회
 */
export function getFrustrationLevel(context: SessionContext | null): {
  level: "none" | "low" | "medium" | "high";
  signals: FrustrationSignal[];
} {
  if (!context || context.frustrationSignals.length === 0) {
    return { level: "none", signals: [] };
  }

  const totalCount = context.frustrationSignals.reduce((sum, s) => sum + s.count, 0);

  let level: "none" | "low" | "medium" | "high" = "none";
  if (totalCount >= 5) level = "high";
  else if (totalCount >= 3) level = "medium";
  else if (totalCount >= 1) level = "low";

  return { level, signals: context.frustrationSignals };
}

/**
 * Short-term Memory 프롬프트 생성
 */
export function buildShortTermMemoryPrompt(context: SessionContext | null): string {
  if (!context || context.conversations.length === 0) {
    return "";
  }

  const recentConversations = context.conversations.slice(-5); // 최근 5개만 프롬프트에 포함

  const memories = recentConversations.map((c, i) => {
    const summary = c.aiInsights?.analysis || "No AI analysis";
    return `[${i + 1}] Task: ${c.taskId} | Summary: ${summary.slice(0, 100)}...`;
  });

  return `
## Short-term Memory (Recent Context)
The user has had ${context.conversations.length} previous interactions in this session.
Recent activity summary:
${memories.join("\n")}

Use this context to provide more personalized and consistent responses.
`;
}

/**
 * 세션 ID 생성 (없으면 새로 생성)
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
