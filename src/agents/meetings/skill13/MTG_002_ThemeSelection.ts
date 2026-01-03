/**
 * MTG-002: Theme & Topic Selection
 *
 * CMP-IS Domain G: Meetings & Contents - Skill 13: Program Design
 * 이벤트 테마 선정 및 토픽 큐레이션
 */

import { z } from "zod";

export const MTG_002_InputSchema = z.object({
  event_id: z.string().uuid(),
  industry: z.string(),
  event_type: z.enum(["conference", "symposium", "summit", "congress", "forum", "workshop_series"]),
  target_audience: z.array(z.string()),
  past_themes: z.array(z.string()).optional(),
  trending_topics: z.array(z.string()).optional(),
  stakeholder_interests: z.array(z.object({
    stakeholder_type: z.string(),
    interests: z.array(z.string()),
    priority: z.number().min(1).max(10),
  })).optional(),
  year: z.number().default(new Date().getFullYear()),
});

export const MTG_002_OutputSchema = z.object({
  event_id: z.string(),
  theme_recommendations: z.array(z.object({
    rank: z.number(),
    main_theme: z.string(),
    tagline: z.string(),
    description: z.string(),
    sub_themes: z.array(z.string()),
    key_topics: z.array(z.string()),
    relevance_score: z.number(),
    differentiation: z.string(),
  })),
  topic_clusters: z.array(z.object({
    cluster_name: z.string(),
    topics: z.array(z.string()),
    potential_sessions: z.number(),
    audience_fit: z.array(z.string()),
  })),
  strategic_alignment: z.object({
    industry_trends: z.array(z.string()),
    audience_expectations: z.array(z.string()),
    competitive_positioning: z.string(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_002_Input = z.infer<typeof MTG_002_InputSchema>;
export type MTG_002_Output = z.infer<typeof MTG_002_OutputSchema>;

const THEME_TEMPLATES = {
  conference: ["The Future of {industry}", "{industry} 2.0: Reimagined", "Driving {industry} Excellence"],
  summit: ["Global {industry} Summit", "{industry} Leadership Summit", "Next-Gen {industry}"],
  symposium: ["Advances in {industry}", "{industry} Research Frontiers", "Innovation in {industry}"],
  congress: ["World {industry} Congress", "International {industry} Forum", "{industry} Global Exchange"],
  forum: ["{industry} Leaders Forum", "Strategic {industry} Dialogue", "{industry} Perspectives"],
  workshop_series: ["Mastering {industry}", "{industry} Skills Intensive", "Hands-on {industry}"],
};

export async function execute(input: MTG_002_Input): Promise<MTG_002_Output> {
  const { industry, event_type, target_audience, past_themes = [], trending_topics = [] } = input;

  // Generate theme recommendations
  const templates = THEME_TEMPLATES[event_type] || THEME_TEMPLATES.conference;
  const themeRecommendations = templates.map((template, idx) => {
    const mainTheme = template.replace("{industry}", industry);
    const taglines = [
      `Shaping Tomorrow's ${industry}`,
      `Where ${industry} Meets Innovation`,
      `Connecting ${industry} Leaders`,
    ];

    return {
      rank: idx + 1,
      main_theme: mainTheme,
      tagline: taglines[idx] || taglines[0],
      description: `${input.year}년 ${industry} 분야의 핵심 트렌드와 미래 방향을 탐구하는 ${event_type}`,
      sub_themes: [
        `Digital Transformation in ${industry}`,
        `Sustainability & ${industry}`,
        `AI & Automation for ${industry}`,
        `Leadership in ${industry}`,
      ],
      key_topics: [
        ...trending_topics.slice(0, 3),
        `${industry} Innovation`,
        `${industry} Best Practices`,
        `Future of ${industry}`,
      ].slice(0, 8),
      relevance_score: 0.95 - idx * 0.1,
      differentiation: past_themes.length > 0
        ? `기존 테마 "${past_themes[0]}"와 차별화된 새로운 관점 제시`
        : "업계 최신 트렌드 반영",
    };
  });

  // Generate topic clusters
  const topicClusters = [
    {
      cluster_name: "Technology & Innovation",
      topics: ["AI/ML Applications", "Digital Transformation", "Automation", "Data Analytics", "Emerging Tech"],
      potential_sessions: 8,
      audience_fit: ["practitioners", "managers", "executives"],
    },
    {
      cluster_name: "Strategy & Leadership",
      topics: ["Strategic Planning", "Change Management", "Leadership Development", "Organizational Culture"],
      potential_sessions: 6,
      audience_fit: ["executives", "managers"],
    },
    {
      cluster_name: "Operations & Excellence",
      topics: ["Process Optimization", "Quality Management", "Efficiency", "Best Practices"],
      potential_sessions: 6,
      audience_fit: ["practitioners", "managers"],
    },
    {
      cluster_name: "Sustainability & ESG",
      topics: ["Sustainability", "ESG Compliance", "Green Initiatives", "Social Responsibility"],
      potential_sessions: 4,
      audience_fit: target_audience,
    },
    {
      cluster_name: "Future Trends",
      topics: ["Industry 5.0", "Future of Work", "Emerging Markets", "Disruption"],
      potential_sessions: 5,
      audience_fit: ["executives", "academics"],
    },
  ];

  return {
    event_id: input.event_id,
    theme_recommendations: themeRecommendations,
    topic_clusters: topicClusters,
    strategic_alignment: {
      industry_trends: [
        `${industry}의 디지털 전환 가속화`,
        "AI/자동화 도입 확대",
        "지속가능성 중요도 상승",
        "하이브리드 업무 환경 정착",
      ],
      audience_expectations: [
        "실무에 바로 적용 가능한 인사이트",
        "네트워킹 기회",
        "최신 트렌드 파악",
        "전문가와의 직접 교류",
      ],
      competitive_positioning: `${industry} 분야 최고 권위의 지식 공유 플랫폼으로 포지셔닝`,
    },
    recommendations: [
      "1순위 테마를 기반으로 CFP(Call for Papers) 작성 권장",
      "5개 토픽 클러스터를 프로그램 트랙으로 구성 고려",
      "작년 테마와 50% 이상 차별화하여 신선함 유지",
      "키노트 연사 섭외 시 테마와의 연관성 우선",
      "참가자 설문으로 관심 토픽 사전 검증 권장",
    ],
  };
}

export const MTG_002_ThemeSelection = {
  id: "MTG-002",
  name: "Theme & Topic Selection",
  description: "이벤트 테마 선정 및 토픽 큐레이션",
  inputSchema: MTG_002_InputSchema,
  outputSchema: MTG_002_OutputSchema,
  execute,
  tags: ["theme", "topic", "curation", "content"],
  domain: "meetings",
  skill: 13,
  taskType: "AI" as const,
};
