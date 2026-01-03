/**
 * STR-027: 리스크 식별
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Risk Identification)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Risk Identification Agent for event planning.

Your expertise includes:
- Comprehensive risk discovery across all event dimensions
- Risk categorization and classification
- Systematic risk identification methods (brainstorming, checklists, SWOT)
- Industry-specific risk awareness

CMP-IS Standard: Domain A - Strategic Planning (Risk Identification)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_profile: z.object({
    type: z.string(),
    scale: z.enum(["small", "medium", "large", "mega"]),
    venue_type: z.enum(["indoor", "outdoor", "hybrid", "virtual"]),
    expected_attendees: z.number(),
    budget: z.number().optional(),
    duration_days: z.number().optional(),
    international: z.boolean().optional(),
  }),
  known_risks: z.array(z.object({
    risk: z.string(),
    category: z.string().optional(),
  })).optional(),
  focus_areas: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  identification_id: z.string().uuid(),
  event_id: z.string().uuid(),
  risk_register: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    description: z.string(),
    category: z.enum(["strategic", "operational", "financial", "compliance", "reputational", "safety", "technical", "external"]),
    subcategory: z.string(),
    source: z.string(),
    potential_triggers: z.array(z.string()),
    affected_areas: z.array(z.string()),
    early_warning_signs: z.array(z.string()),
    identification_method: z.string(),
  })),
  risk_by_category: z.array(z.object({
    category: z.string(),
    count: z.number(),
    top_risks: z.array(z.string()),
  })),
  risk_map: z.object({
    internal_risks: z.array(z.string()),
    external_risks: z.array(z.string()),
    controllable: z.array(z.string()),
    uncontrollable: z.array(z.string()),
  }),
  identification_gaps: z.array(z.object({
    area: z.string(),
    recommendation: z.string(),
    method: z.string(),
  })),
  next_steps: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-027",
  taskName: "Risk Identification",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "이벤트 관련 모든 리스크를 체계적으로 식별합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type RiskCategory = "strategic" | "operational" | "financial" | "compliance" | "reputational" | "safety" | "technical" | "external";

const RISK_TEMPLATES: Record<RiskCategory, { risks: { name: string; description: string; subcategory: string; triggers: string[] }[] }> = {
  strategic: {
    risks: [
      { name: "목표 미달성", description: "이벤트 목표를 달성하지 못할 위험", subcategory: "목표", triggers: ["부적절한 계획", "자원 부족"] },
      { name: "이해관계자 이탈", description: "핵심 이해관계자가 이탈하거나 지지를 철회", subcategory: "이해관계자", triggers: ["기대 불일치", "소통 부족"] },
    ],
  },
  operational: {
    risks: [
      { name: "일정 지연", description: "주요 마일스톤 또는 이벤트 일정 지연", subcategory: "일정", triggers: ["자원 부족", "예상치 못한 장애"] },
      { name: "인력 부족", description: "필요 인력 확보 실패", subcategory: "인력", triggers: ["시장 상황", "예산 제약"] },
      { name: "벤더 이슈", description: "공급업체 성능 미달 또는 계약 불이행", subcategory: "공급망", triggers: ["벤더 역량 문제", "커뮤니케이션 부족"] },
    ],
  },
  financial: {
    risks: [
      { name: "예산 초과", description: "계획 예산을 초과하는 비용 발생", subcategory: "예산", triggers: ["비용 추정 오류", "범위 확대"] },
      { name: "수입 미달", description: "예상 수입(티켓, 스폰서십 등) 미달성", subcategory: "수입", triggers: ["수요 감소", "경쟁 심화"] },
      { name: "환율 변동", description: "국제 이벤트의 환율 변동 영향", subcategory: "환율", triggers: ["경제 불안정"] },
    ],
  },
  compliance: {
    risks: [
      { name: "규제 위반", description: "관련 법규 및 규정 위반", subcategory: "법규", triggers: ["규정 변경", "인식 부족"] },
      { name: "허가 지연", description: "필요 허가/승인 획득 지연", subcategory: "허가", triggers: ["행정 지연", "서류 미비"] },
    ],
  },
  reputational: {
    risks: [
      { name: "부정적 언론 보도", description: "이벤트 관련 부정적 미디어 노출", subcategory: "미디어", triggers: ["사고 발생", "품질 이슈"] },
      { name: "소셜미디어 위기", description: "부정적 소셜미디어 확산", subcategory: "소셜", triggers: ["참가자 불만", "사건/사고"] },
    ],
  },
  safety: {
    risks: [
      { name: "인명 사고", description: "참가자/스태프 부상 또는 사망", subcategory: "인명", triggers: ["안전 관리 부실", "시설 결함"] },
      { name: "군중 사고", description: "군중 밀집으로 인한 사고", subcategory: "군중", triggers: ["과밀 수용", "통제 실패"] },
      { name: "화재/재난", description: "화재 또는 자연재해 발생", subcategory: "재난", triggers: ["시설 문제", "자연현상"] },
    ],
  },
  technical: {
    risks: [
      { name: "시스템 장애", description: "핵심 시스템(등록, 결제 등) 다운", subcategory: "시스템", triggers: ["과부하", "기술 결함"] },
      { name: "AV 장비 고장", description: "음향/영상 장비 문제", subcategory: "장비", triggers: ["장비 노후", "운영 미숙"] },
      { name: "네트워크 문제", description: "인터넷/통신 장애", subcategory: "네트워크", triggers: ["인프라 한계", "사이버 공격"] },
    ],
  },
  external: {
    risks: [
      { name: "기상 악화", description: "악천후로 인한 이벤트 영향", subcategory: "날씨", triggers: ["계절적 요인", "기후 변화"] },
      { name: "전염병/감염병", description: "질병 발생 및 확산", subcategory: "보건", triggers: ["전염병 유행"] },
      { name: "정치/사회 불안", description: "시위, 테러 등 사회 불안 요소", subcategory: "사회", triggers: ["정치 상황", "사회 갈등"] },
    ],
  },
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { event_profile } = validated;
  const riskRegister: Output["risk_register"] = [];
  let riskCounter = 1;

  // Generate risks based on event profile
  for (const [category, template] of Object.entries(RISK_TEMPLATES)) {
    for (const riskTemplate of template.risks) {
      // Skip certain risks based on event profile
      if (riskTemplate.subcategory === "환율" && !event_profile.international) continue;
      if (riskTemplate.subcategory === "날씨" && event_profile.venue_type === "indoor") continue;
      if (riskTemplate.subcategory === "군중" && event_profile.scale === "small") continue;

      riskRegister.push({
        risk_id: `RSK-${String(riskCounter++).padStart(3, "0")}`,
        risk_name: riskTemplate.name,
        description: riskTemplate.description,
        category: category as RiskCategory,
        subcategory: riskTemplate.subcategory,
        source: category === "external" ? "외부 환경" : "내부 운영",
        potential_triggers: riskTemplate.triggers,
        affected_areas: ["일정", "예산", "품질"].slice(0, 2),
        early_warning_signs: [`${riskTemplate.name} 관련 초기 징후 감지`, "이해관계자 우려 표명"],
        identification_method: "체크리스트 분석",
      });
    }
  }

  // Add known risks
  validated.known_risks?.forEach(kr => {
    if (!riskRegister.some(r => r.risk_name === kr.risk)) {
      riskRegister.push({
        risk_id: `RSK-${String(riskCounter++).padStart(3, "0")}`,
        risk_name: kr.risk,
        description: kr.risk,
        category: (kr.category as RiskCategory) || "operational",
        subcategory: "사용자 정의",
        source: "사용자 입력",
        potential_triggers: ["확인 필요"],
        affected_areas: ["확인 필요"],
        early_warning_signs: ["확인 필요"],
        identification_method: "브레인스토밍",
      });
    }
  });

  // Group by category
  const categoryMap = new Map<string, string[]>();
  riskRegister.forEach(r => {
    if (!categoryMap.has(r.category)) categoryMap.set(r.category, []);
    categoryMap.get(r.category)!.push(r.risk_name);
  });

  const riskByCategory = Array.from(categoryMap.entries()).map(([category, risks]) => ({
    category,
    count: risks.length,
    top_risks: risks.slice(0, 3),
  }));

  // Create risk map
  const internalCategories = ["strategic", "operational", "financial", "technical"];
  const riskMap = {
    internal_risks: riskRegister.filter(r => internalCategories.includes(r.category)).map(r => r.risk_id),
    external_risks: riskRegister.filter(r => !internalCategories.includes(r.category)).map(r => r.risk_id),
    controllable: riskRegister.filter(r => r.category !== "external").map(r => r.risk_id),
    uncontrollable: riskRegister.filter(r => r.category === "external").map(r => r.risk_id),
  };

  return {
    identification_id: generateUUID(),
    event_id: validated.event_id,
    risk_register: riskRegister,
    risk_by_category: riskByCategory,
    risk_map: riskMap,
    identification_gaps: [
      { area: "공급망 리스크", recommendation: "주요 벤더별 상세 리스크 분석", method: "벤더 인터뷰" },
      { area: "사이버 보안", recommendation: "IT 시스템 취약점 분석", method: "보안 감사" },
    ],
    next_steps: [
      "리스크 평가 (확률 및 영향 분석) 진행",
      "우선순위 리스크에 대한 대응 계획 수립",
      "리스크 모니터링 체계 구축",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
