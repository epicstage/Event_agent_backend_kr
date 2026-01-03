/**
 * Knowledge Engine - 웹 크롤링 및 자가 업데이트 엔진
 *
 * 에이전트가 부족한 정보를 보완하기 위해:
 * - 웹 검색 요청 및 결과 캐싱
 * - 지식 베이스에 임시 저장
 * - 검증 후 에이전트 통합
 */

import { z } from "zod";

// =============================================================================
// TYPES & SCHEMAS
// =============================================================================

export const WebSearchRequestSchema = z.object({
  query: z.string().min(2).max(500),
  search_type: z.enum(["general", "news", "academic", "documentation", "market_data"]).default("general"),
  requesting_agent: z.string(),
  context: z.string().optional(),
  max_results: z.number().min(1).max(20).default(5),
  language: z.string().default("ko"),
  cache_ttl_hours: z.number().min(1).max(168).default(24), // Max 1 week
});

export type WebSearchRequest = z.infer<typeof WebSearchRequestSchema>;

export interface WebSearchResult {
  id: string;
  query: string;
  query_hash: string;
  search_type: string;
  results: SearchResultItem[];
  summary: string;
  source_urls: string[];
  relevance_score: number;
  cached_at: string;
  expires_at: string;
  requesting_agent: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  published_date?: string;
  source?: string;
  relevance: number;
}

export interface KnowledgeGap {
  agent_id: string;
  topic: string;
  description: string;
  priority: "low" | "medium" | "high";
  suggested_queries: string[];
  detected_at: string;
}

// =============================================================================
// KNOWLEDGE ENGINE CLASS
// =============================================================================

export class KnowledgeEngine {
  private db: D1Database;
  private kv: KVNamespace;
  private ai: Ai;

  constructor(db: D1Database, kv: KVNamespace, ai: Ai) {
    this.db = db;
    this.kv = kv;
    this.ai = ai;
  }

  /**
   * Hash a query for cache lookup
   */
  private hashQuery(query: string): string {
    // Simple hash - in production use crypto.subtle
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Search the web for information
   */
  async search(request: WebSearchRequest): Promise<WebSearchResult> {
    const queryHash = this.hashQuery(request.query.toLowerCase());

    // Check cache first
    const cached = await this.getCachedSearch(queryHash);
    if (cached && new Date(cached.expires_at) > new Date()) {
      // Update cache hit count
      await this.db
        .prepare("UPDATE web_search_cache SET cache_hits = cache_hits + 1, last_accessed_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), cached.id)
        .run();
      return cached;
    }

    // Perform new search (using AI to simulate - in production use Tavily/Firecrawl)
    const searchResults = await this.performAISearch(request);

    // Cache the results
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + request.cache_ttl_hours * 60 * 60 * 1000);

    const result: WebSearchResult = {
      id,
      query: request.query,
      query_hash: queryHash,
      search_type: request.search_type,
      results: searchResults.results,
      summary: searchResults.summary,
      source_urls: searchResults.results.map((r) => r.url),
      relevance_score: searchResults.relevance,
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      requesting_agent: request.requesting_agent,
    };

    // Store in database
    await this.db
      .prepare(
        `INSERT INTO web_search_cache (
          id, query, query_hash, search_type, source_provider,
          source_urls, result_summary, result_raw, requesting_agent,
          relevance_to_query, expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        request.query,
        queryHash,
        request.search_type,
        "ai-simulation", // Would be "tavily" or "firecrawl" in production
        JSON.stringify(result.source_urls),
        result.summary,
        JSON.stringify(result.results),
        request.requesting_agent,
        result.relevance_score,
        expiresAt.toISOString(),
        now.toISOString()
      )
      .run();

    // Also cache in KV for fast lookup
    await this.kv.put(
      `search:${queryHash}`,
      JSON.stringify(result),
      { expirationTtl: request.cache_ttl_hours * 3600 }
    );

    return result;
  }

  /**
   * Perform AI-simulated search (in production, use real search APIs)
   */
  private async performAISearch(
    request: WebSearchRequest
  ): Promise<{ results: SearchResultItem[]; summary: string; relevance: number }> {
    const systemPrompt = `You are a web search assistant for an Event Management System.
Generate realistic search results for the given query.
Focus on ${request.search_type} content related to event management.
Language preference: ${request.language}`;

    const userPrompt = `Query: "${request.query}"
Context: ${request.context || "Event management related search"}

Generate ${request.max_results} search results in JSON format:
{
  "results": [
    {
      "title": "Result title",
      "url": "https://example.com/article",
      "snippet": "Brief description of the content...",
      "published_date": "2024-01-15",
      "source": "Source name",
      "relevance": 0.95
    }
  ],
  "summary": "Brief summary of findings",
  "relevance": 0.85
}`;

    try {
      const aiResponse = await this.ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2048,
      });

      if (aiResponse && typeof aiResponse === "object" && "response" in aiResponse) {
        const responseText = aiResponse.response as string;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            results: parsed.results || [],
            summary: parsed.summary || "No summary available",
            relevance: parsed.relevance || 0.5,
          };
        }
      }
    } catch (error) {
      console.error("AI search error:", error);
    }

    // Fallback
    return {
      results: [],
      summary: "Search could not be completed",
      relevance: 0,
    };
  }

  /**
   * Get cached search result
   */
  private async getCachedSearch(queryHash: string): Promise<WebSearchResult | null> {
    // Try KV first
    const kvCached = await this.kv.get(`search:${queryHash}`);
    if (kvCached) {
      return JSON.parse(kvCached) as WebSearchResult;
    }

    // Fall back to DB
    const dbResult = await this.db
      .prepare("SELECT * FROM web_search_cache WHERE query_hash = ? AND expires_at > datetime('now')")
      .bind(queryHash)
      .first();

    if (!dbResult) return null;

    const result: WebSearchResult = {
      id: dbResult.id as string,
      query: dbResult.query as string,
      query_hash: dbResult.query_hash as string,
      search_type: dbResult.search_type as string,
      results: JSON.parse(dbResult.result_raw as string),
      summary: dbResult.result_summary as string,
      source_urls: JSON.parse(dbResult.source_urls as string),
      relevance_score: dbResult.relevance_to_query as number,
      cached_at: dbResult.created_at as string,
      expires_at: dbResult.expires_at as string,
      requesting_agent: dbResult.requesting_agent as string,
    };

    return result;
  }

  /**
   * Detect knowledge gaps from agent performance
   */
  async detectKnowledgeGaps(agentId?: string): Promise<KnowledgeGap[]> {
    const gaps: KnowledgeGap[] = [];

    // Query for agents with low success rates or high error rates
    const query = agentId
      ? `SELECT agent_id, error_message, COUNT(*) as error_count
         FROM agent_performance_logs
         WHERE status = 'error' AND agent_id = ?
         GROUP BY agent_id, error_message
         ORDER BY error_count DESC
         LIMIT 10`
      : `SELECT agent_id, error_message, COUNT(*) as error_count
         FROM agent_performance_logs
         WHERE status = 'error' AND created_at > datetime('now', '-7 days')
         GROUP BY agent_id, error_message
         ORDER BY error_count DESC
         LIMIT 20`;

    const results = agentId
      ? await this.db.prepare(query).bind(agentId).all()
      : await this.db.prepare(query).all();

    for (const row of results.results || []) {
      const errorMsg = row.error_message as string;
      if (errorMsg && errorMsg.length > 0) {
        // Analyze error to suggest knowledge gap
        const suggestedQueries = this.generateQueriesFromError(row.agent_id as string, errorMsg);

        gaps.push({
          agent_id: row.agent_id as string,
          topic: this.extractTopicFromError(errorMsg),
          description: `에이전트 ${row.agent_id}에서 반복적인 에러 발생: ${errorMsg.substring(0, 100)}`,
          priority: (row.error_count as number) > 10 ? "high" : (row.error_count as number) > 5 ? "medium" : "low",
          suggested_queries: suggestedQueries,
          detected_at: new Date().toISOString(),
        });
      }
    }

    return gaps;
  }

  /**
   * Extract topic from error message
   */
  private extractTopicFromError(errorMsg: string): string {
    // Simple keyword extraction
    const keywords = [
      "budget",
      "예산",
      "venue",
      "베뉴",
      "sponsor",
      "스폰서",
      "schedule",
      "일정",
      "pricing",
      "가격",
      "marketing",
      "마케팅",
      "safety",
      "안전",
    ];

    for (const kw of keywords) {
      if (errorMsg.toLowerCase().includes(kw.toLowerCase())) {
        return kw;
      }
    }

    return "general";
  }

  /**
   * Generate search queries from error context
   */
  private generateQueriesFromError(agentId: string, errorMsg: string): string[] {
    const queries: string[] = [];
    const topic = this.extractTopicFromError(errorMsg);

    // Domain-specific queries based on agent prefix
    if (agentId.startsWith("STR-")) {
      queries.push(`이벤트 전략 ${topic} 가이드라인`);
      queries.push(`${topic} 관련 이해관계자 분석 방법`);
    } else if (agentId.startsWith("FIN-")) {
      queries.push(`이벤트 재무 ${topic} 계산 방법`);
      queries.push(`${topic} 예산 수립 베스트 프랙티스`);
    } else if (agentId.startsWith("PRJ-")) {
      queries.push(`이벤트 프로젝트 관리 ${topic}`);
      queries.push(`${topic} 일정 관리 방법론`);
    } else if (agentId.startsWith("MKT-")) {
      queries.push(`이벤트 마케팅 ${topic} 전략`);
      queries.push(`${topic} 캠페인 ROI 측정`);
    } else if (agentId.startsWith("OPS-")) {
      queries.push(`이벤트 운영 ${topic} 체크리스트`);
      queries.push(`${topic} 현장 관리 가이드`);
    }

    return queries.slice(0, 3);
  }

  /**
   * Integrate search result into knowledge base
   */
  async integrateToKnowledgeBase(
    searchResultId: string,
    verifiedBy: string
  ): Promise<{ success: boolean; kb_upload_id?: string; message: string }> {
    // Get the search result
    const searchResult = await this.db
      .prepare("SELECT * FROM web_search_cache WHERE id = ?")
      .bind(searchResultId)
      .first();

    if (!searchResult) {
      return { success: false, message: "Search result not found" };
    }

    // Create knowledge base entry
    const kbId = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO knowledge_base_uploads (
          id, file_name, file_type, file_size_bytes, file_hash,
          content_summary, status, is_integrated, integrated_at,
          uploaded_by, approved_by, approved_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        kbId,
        `web_search_${searchResultId}`,
        "json",
        (searchResult.result_raw as string).length,
        searchResult.query_hash,
        searchResult.result_summary,
        "indexed",
        true,
        now,
        "system",
        verifiedBy,
        now,
        now,
        now
      )
      .run();

    // Update search cache to mark as integrated
    await this.db
      .prepare("UPDATE web_search_cache SET integrated_to_kb = TRUE, kb_upload_id = ? WHERE id = ?")
      .bind(kbId, searchResultId)
      .run();

    return {
      success: true,
      kb_upload_id: kbId,
      message: "Search result integrated to knowledge base",
    };
  }

  /**
   * Log agent performance
   */
  async logPerformance(log: {
    agent_id: string;
    domain: string;
    skill?: string;
    status: "success" | "error" | "timeout" | "validation_failed";
    latency_ms: number;
    ai_latency_ms?: number;
    error_message?: string;
    session_id?: string;
    event_id?: string;
    ai_enhanced?: boolean;
    ai_confidence?: number;
  }): Promise<void> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO agent_performance_logs (
          id, agent_id, domain, skill, total_latency_ms, ai_latency_ms,
          status, error_message, session_id, event_id,
          ai_enhanced, ai_confidence_score, started_at, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        log.agent_id,
        log.domain,
        log.skill || null,
        log.latency_ms,
        log.ai_latency_ms || null,
        log.status,
        log.error_message || null,
        log.session_id || null,
        log.event_id || null,
        log.ai_enhanced || false,
        log.ai_confidence || null,
        now,
        now,
        now
      )
      .run();
  }

  /**
   * Get agent performance stats
   */
  async getPerformanceStats(
    agentId: string,
    days: number = 7
  ): Promise<{
    total_invocations: number;
    success_rate: number;
    avg_latency_ms: number;
    error_count: number;
    top_errors: Array<{ message: string; count: number }>;
  }> {
    const stats = await this.db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
          AVG(total_latency_ms) as avg_latency,
          SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
         FROM agent_performance_logs
         WHERE agent_id = ? AND created_at > datetime('now', '-' || ? || ' days')`
      )
      .bind(agentId, days)
      .first();

    const topErrors = await this.db
      .prepare(
        `SELECT error_message, COUNT(*) as count
         FROM agent_performance_logs
         WHERE agent_id = ? AND status = 'error' AND created_at > datetime('now', '-' || ? || ' days')
         GROUP BY error_message
         ORDER BY count DESC
         LIMIT 5`
      )
      .bind(agentId, days)
      .all();

    return {
      total_invocations: (stats?.total as number) || 0,
      success_rate:
        stats?.total ? ((stats.success_count as number) / (stats.total as number)) * 100 : 0,
      avg_latency_ms: (stats?.avg_latency as number) || 0,
      error_count: (stats?.error_count as number) || 0,
      top_errors: (topErrors.results || []).map((r) => ({
        message: r.error_message as string,
        count: r.count as number,
      })),
    };
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<number> {
    const result = await this.db
      .prepare("DELETE FROM web_search_cache WHERE expires_at < datetime('now') AND integrated_to_kb = FALSE")
      .run();

    return result.meta.changes || 0;
  }
}

export default KnowledgeEngine;
