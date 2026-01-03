/**
 * SYS-001: Document Analyzer
 *
 * 업로드된 문서를 분석하여 관련 도메인 에이전트를 식별하는 시스템 에이전트.
 * - 문서 내용 추출 및 요약
 * - 도메인 관련성 분석
 * - 에이전트 매칭 및 relevance 점수 산출
 */

import { z } from "zod";

export const SYS_001_InputSchema = z.object({
  file_id: z.string().uuid(),
  file_name: z.string(),
  file_type: z.enum(["pdf", "docx", "xlsx", "csv", "json", "txt", "md"]),
  content: z.string().describe("Extracted text content from the file"),
  metadata: z
    .object({
      page_count: z.number().optional(),
      word_count: z.number().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export const SYS_001_OutputSchema = z.object({
  file_id: z.string(),
  analysis: z.object({
    summary: z.string().describe("AI-generated summary of the document"),
    key_topics: z.array(z.string()),
    extracted_entities: z.array(
      z.object({
        type: z.enum([
          "event",
          "venue",
          "budget",
          "sponsor",
          "stakeholder",
          "date",
          "metric",
          "risk",
          "task",
          "vendor",
        ]),
        value: z.string(),
        confidence: z.number().min(0).max(1),
      })
    ),
    document_type: z.enum([
      "strategy_document",
      "budget_proposal",
      "project_plan",
      "marketing_brief",
      "operations_manual",
      "vendor_contract",
      "event_brief",
      "report",
      "policy",
      "other",
    ]),
    language: z.string(),
  }),
  domain_relevance: z.array(
    z.object({
      domain: z.enum(["strategy", "finance", "project", "marketing", "operations"]),
      relevance_score: z.number().min(0).max(1),
      reasoning: z.string(),
    })
  ),
  agent_matches: z.array(
    z.object({
      agent_id: z.string(),
      agent_name: z.string(),
      relevance_score: z.number().min(0).max(1),
      matching_topics: z.array(z.string()),
      potential_use: z.string(),
    })
  ),
  recommendations: z.object({
    primary_domain: z.string(),
    integration_priority: z.enum(["high", "medium", "low"]),
    suggested_actions: z.array(z.string()),
    requires_review: z.boolean(),
    review_reason: z.string().optional(),
  }),
  processing_metadata: z.object({
    processing_time_ms: z.number(),
    content_tokens: z.number(),
    model_used: z.string(),
  }),
});

export type SYS_001_Input = z.infer<typeof SYS_001_InputSchema>;
export type SYS_001_Output = z.infer<typeof SYS_001_OutputSchema>;

// Domain keywords for initial classification
const DOMAIN_KEYWORDS = {
  strategy: [
    "목표",
    "비전",
    "미션",
    "전략",
    "기획",
    "이해관계자",
    "stakeholder",
    "goal",
    "objective",
    "SWOT",
    "리스크",
    "risk",
    "KPI",
    "성공지표",
    "포지셔닝",
    "브랜드",
    "타겟",
  ],
  finance: [
    "예산",
    "비용",
    "수익",
    "ROI",
    "손익",
    "스폰서",
    "투자",
    "재무",
    "결산",
    "지출",
    "수입",
    "budget",
    "cost",
    "revenue",
    "pricing",
    "가격",
    "매출",
    "정산",
  ],
  project: [
    "일정",
    "태스크",
    "task",
    "milestone",
    "마일스톤",
    "WBS",
    "간트",
    "Gantt",
    "진행",
    "담당",
    "deadline",
    "마감",
    "프로젝트",
    "협업",
    "리소스",
    "자원관리",
  ],
  marketing: [
    "홍보",
    "마케팅",
    "캠페인",
    "소셜미디어",
    "SNS",
    "광고",
    "PR",
    "언론",
    "인플루언서",
    "콘텐츠",
    "채널",
    "타겟팅",
    "전환율",
    "CTA",
    "랜딩페이지",
  ],
  operations: [
    "베뉴",
    "venue",
    "장소",
    "현장",
    "운영",
    "로지스틱",
    "물류",
    "케이터링",
    "AV",
    "영상",
    "음향",
    "등록",
    "registration",
    "안전",
    "보안",
    "셔틀",
    "스태프",
  ],
};

// Agent catalog for matching
const AGENT_CATALOG = [
  // Strategy domain
  { id: "STR-001", name: "Event Goal Setting", domain: "strategy", keywords: ["목표", "goal", "objective", "KPI"] },
  { id: "STR-002", name: "Stakeholder Analysis", domain: "strategy", keywords: ["이해관계자", "stakeholder", "관계"] },
  { id: "STR-003", name: "Risk Identification", domain: "strategy", keywords: ["리스크", "risk", "위험", "대응"] },

  // Finance domain
  { id: "FIN-001", name: "Sponsorship Valuation", domain: "finance", keywords: ["스폰서", "sponsor", "협찬", "가치"] },
  { id: "FIN-031", name: "Budget Structure Design", domain: "finance", keywords: ["예산", "budget", "비용구조"] },
  { id: "FIN-037", name: "Break-Even Analysis", domain: "finance", keywords: ["손익분기", "break-even", "BEP"] },

  // Project domain
  { id: "PRJ-001", name: "Scope Definition", domain: "project", keywords: ["범위", "scope", "요구사항"] },
  { id: "PRJ-005", name: "WBS Creation", domain: "project", keywords: ["WBS", "작업분류", "태스크"] },
  { id: "PRJ-014", name: "Task Assignment", domain: "project", keywords: ["담당", "배정", "assignment"] },

  // Marketing domain
  { id: "MKT-001", name: "Market Analysis", domain: "marketing", keywords: ["시장", "market", "분석", "트렌드"] },
  { id: "MKT-007", name: "Campaign Planning", domain: "marketing", keywords: ["캠페인", "campaign", "홍보계획"] },
  { id: "MKT-014", name: "Social Media Strategy", domain: "marketing", keywords: ["SNS", "소셜", "인스타", "페이스북"] },

  // Operations domain
  { id: "OPS-001", name: "Venue Sourcing", domain: "operations", keywords: ["베뉴", "venue", "장소", "섭외"] },
  { id: "OPS-008", name: "Catering Planning", domain: "operations", keywords: ["케이터링", "catering", "식음료", "F&B"] },
  { id: "OPS-022", name: "Crowd Management", domain: "operations", keywords: ["군중", "crowd", "인원관리", "동선"] },
];

/**
 * Analyze document content and identify relevant domains/agents
 */
export async function execute(input: SYS_001_Input): Promise<SYS_001_Output> {
  const startTime = Date.now();
  const content = input.content.toLowerCase();
  const wordCount = input.content.split(/\s+/).length;

  // 1. Domain relevance scoring
  const domainScores = Object.entries(DOMAIN_KEYWORDS).map(([domain, keywords]) => {
    const matchCount = keywords.filter((kw) => content.includes(kw.toLowerCase())).length;
    const score = Math.min(matchCount / keywords.length, 1);
    return {
      domain: domain as "strategy" | "finance" | "project" | "marketing" | "operations",
      relevance_score: Math.round(score * 100) / 100,
      reasoning: `${matchCount}/${keywords.length} 키워드 매칭`,
    };
  });

  // Sort by relevance
  domainScores.sort((a, b) => b.relevance_score - a.relevance_score);

  // 2. Agent matching
  const agentMatches = AGENT_CATALOG.filter((agent) => {
    const matchingKeywords = agent.keywords.filter((kw) => content.includes(kw.toLowerCase()));
    return matchingKeywords.length > 0;
  })
    .map((agent) => {
      const matchingKeywords = agent.keywords.filter((kw) => content.includes(kw.toLowerCase()));
      return {
        agent_id: agent.id,
        agent_name: agent.name,
        relevance_score: Math.round((matchingKeywords.length / agent.keywords.length) * 100) / 100,
        matching_topics: matchingKeywords,
        potential_use: `${agent.name} 에이전트가 이 문서의 ${matchingKeywords.join(", ")} 관련 내용을 처리할 수 있습니다.`,
      };
    })
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 10);

  // 3. Extract key topics (simple keyword extraction)
  const allKeywords = Object.values(DOMAIN_KEYWORDS).flat();
  const foundKeywords = allKeywords.filter((kw) => content.includes(kw.toLowerCase()));
  const keyTopics = [...new Set(foundKeywords)].slice(0, 10);

  // 4. Simple entity extraction (pattern-based)
  const entities: Array<{
    type:
      | "event"
      | "venue"
      | "budget"
      | "sponsor"
      | "stakeholder"
      | "date"
      | "metric"
      | "risk"
      | "task"
      | "vendor";
    value: string;
    confidence: number;
  }> = [];

  // Budget patterns (Korean won)
  const budgetPattern = /([0-9,]+)\s*(원|만원|억원|천만원)/g;
  let match;
  while ((match = budgetPattern.exec(input.content)) !== null) {
    entities.push({ type: "budget", value: match[0], confidence: 0.9 });
  }

  // Date patterns
  const datePattern = /(\d{4}[-./]\d{1,2}[-./]\d{1,2}|\d{1,2}월\s*\d{1,2}일)/g;
  while ((match = datePattern.exec(input.content)) !== null) {
    entities.push({ type: "date", value: match[0], confidence: 0.85 });
  }

  // 5. Determine document type
  const docTypeScores = {
    strategy_document: domainScores.find((d) => d.domain === "strategy")?.relevance_score || 0,
    budget_proposal: domainScores.find((d) => d.domain === "finance")?.relevance_score || 0,
    project_plan: domainScores.find((d) => d.domain === "project")?.relevance_score || 0,
    marketing_brief: domainScores.find((d) => d.domain === "marketing")?.relevance_score || 0,
    operations_manual: domainScores.find((d) => d.domain === "operations")?.relevance_score || 0,
  };
  const topDocType = Object.entries(docTypeScores).sort((a, b) => b[1] - a[1])[0][0] as
    | "strategy_document"
    | "budget_proposal"
    | "project_plan"
    | "marketing_brief"
    | "operations_manual";

  // 6. Generate summary (placeholder - would use AI in production)
  const summary = `${input.file_name} 문서는 총 ${wordCount}개 단어로 구성되어 있으며, 주로 ${domainScores[0].domain} 도메인과 관련된 내용을 다루고 있습니다. ${keyTopics.slice(0, 5).join(", ")} 등의 주제가 포함되어 있습니다.`;

  // 7. Determine if review is needed
  const requiresReview = domainScores[0].relevance_score < 0.3 || agentMatches.length === 0;

  return {
    file_id: input.file_id,
    analysis: {
      summary,
      key_topics: keyTopics,
      extracted_entities: entities.slice(0, 20),
      document_type: topDocType,
      language: input.metadata?.language || "ko",
    },
    domain_relevance: domainScores,
    agent_matches: agentMatches,
    recommendations: {
      primary_domain: domainScores[0].domain,
      integration_priority: domainScores[0].relevance_score > 0.5 ? "high" : domainScores[0].relevance_score > 0.3 ? "medium" : "low",
      suggested_actions: [
        `${domainScores[0].domain} 도메인 에이전트들과 연동 검토`,
        agentMatches.length > 0 ? `${agentMatches[0].agent_id} 에이전트에 지식 통합 권장` : "수동 도메인 지정 필요",
        requiresReview ? "관리자 검토 필요" : "자동 통합 가능",
      ],
      requires_review: requiresReview,
      review_reason: requiresReview ? "도메인 관련성이 낮거나 매칭되는 에이전트가 없습니다" : undefined,
    },
    processing_metadata: {
      processing_time_ms: Date.now() - startTime,
      content_tokens: Math.ceil(wordCount * 1.3),
      model_used: "keyword-matching-v1",
    },
  };
}

/**
 * AI-enhanced document analysis
 */
export async function analyzeWithAI(
  input: SYS_001_Input,
  ai: Ai
): Promise<SYS_001_Output> {
  const startTime = Date.now();

  // Get basic analysis first
  const basicResult = await execute(input);

  // Enhance with AI
  const systemPrompt = `You are a document analyzer for an Event Management System.
Analyze the following document and enhance the analysis results.
Focus on:
1. Improving the summary to be more accurate and comprehensive
2. Identifying any missed key topics or entities
3. Refining the domain relevance scores based on semantic understanding
4. Suggesting better agent matches based on the document content

Current analysis:
${JSON.stringify(basicResult.analysis, null, 2)}

Domain scores:
${JSON.stringify(basicResult.domain_relevance, null, 2)}`;

  const userPrompt = `Document: ${input.file_name}
Type: ${input.file_type}
Content (first 2000 chars):
${input.content.substring(0, 2000)}

Provide enhanced analysis in JSON format.`;

  try {
    const aiResponse = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    });

    if (aiResponse && typeof aiResponse === "object" && "response" in aiResponse) {
      try {
        const responseText = aiResponse.response as string;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiEnhancement = JSON.parse(jsonMatch[0]);
          // Merge AI enhancements with basic result
          if (aiEnhancement.summary) {
            basicResult.analysis.summary = aiEnhancement.summary;
          }
          if (aiEnhancement.key_topics) {
            basicResult.analysis.key_topics = [
              ...new Set([...basicResult.analysis.key_topics, ...aiEnhancement.key_topics]),
            ].slice(0, 15);
          }
        }
      } catch {
        // Keep basic result if AI parsing fails
      }
    }
  } catch {
    // Keep basic result if AI fails
  }

  basicResult.processing_metadata.processing_time_ms = Date.now() - startTime;
  basicResult.processing_metadata.model_used = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

  return basicResult;
}

export const SYS_001_DocumentAnalyzer = {
  id: "SYS-001",
  name: "Document Analyzer",
  description: "업로드된 문서를 분석하여 관련 도메인 에이전트를 식별",
  type: "document_analyzer",
  execute,
  analyzeWithAI,
  InputSchema: SYS_001_InputSchema,
  OutputSchema: SYS_001_OutputSchema,
  requires_confirmation: false,
  can_write_kb: true,
};

export default SYS_001_DocumentAnalyzer;
