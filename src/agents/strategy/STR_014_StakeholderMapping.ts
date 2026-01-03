/**
 * STR-014: 이해관계자 매핑
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Stakeholder Mapping)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Mapping Agent for strategic event planning.

Your expertise includes:
- Comprehensive stakeholder identification
- Power/Interest grid analysis
- Relationship mapping and network analysis
- Stakeholder categorization frameworks

CMP-IS Standard: Domain A - Strategic Planning (Stakeholder Mapping)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_scope: z.object({
    type: z.string(),
    scale: z.enum(["small", "medium", "large", "mega"]),
    budget: z.number().optional(),
    expected_attendees: z.number().optional(),
  }),
  known_stakeholders: z.array(z.object({
    name: z.string(),
    organization: z.string().optional(),
    role: z.string(),
    relationship: z.string().optional(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  mapping_id: z.string().uuid(),
  event_id: z.string().uuid(),
  stakeholder_categories: z.array(z.object({
    category: z.string(),
    description: z.string(),
    stakeholders: z.array(z.object({
      id: z.string(),
      name: z.string(),
      organization: z.string().optional(),
      role: z.string(),
      power_level: z.number().min(1).max(10),
      interest_level: z.number().min(1).max(10),
      influence_type: z.enum(["decision_maker", "influencer", "affected_party", "observer"]),
      relationship_status: z.enum(["ally", "neutral", "potential_blocker", "unknown"]),
    })),
  })),
  power_interest_grid: z.object({
    high_power_high_interest: z.array(z.string()),
    high_power_low_interest: z.array(z.string()),
    low_power_high_interest: z.array(z.string()),
    low_power_low_interest: z.array(z.string()),
  }),
  network_map: z.array(z.object({
    stakeholder_id: z.string(),
    connections: z.array(z.object({
      connected_to: z.string(),
      relationship_type: z.string(),
      strength: z.enum(["strong", "moderate", "weak"]),
    })),
  })),
  gap_analysis: z.array(z.object({
    missing_category: z.string(),
    importance: z.string(),
    action: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-014",
  taskName: "Stakeholder Mapping",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이벤트 이해관계자를 체계적으로 식별하고 매핑합니다.",
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

const DEFAULT_CATEGORIES = [
  { category: "내부 이해관계자", roles: ["경영진", "프로젝트팀", "마케팅팀", "운영팀"] },
  { category: "외부 파트너", roles: ["스폰서", "벤더", "협력사", "미디어 파트너"] },
  { category: "참가자", roles: ["VIP 참가자", "일반 참가자", "연사/발표자"] },
  { category: "규제/지원", roles: ["정부기관", "업계협회", "지역사회"] },
];

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  let stakeholderCounter = 1;
  const allStakeholders: Output["stakeholder_categories"] = [];

  for (const cat of DEFAULT_CATEGORIES) {
    const stakeholders = cat.roles.map(role => {
      const known = validated.known_stakeholders?.find(k => k.role === role);
      const power = role.includes("경영") || role.includes("스폰서") ? 8 : role.includes("참가") ? 4 : 6;
      const interest = role.includes("팀") || role.includes("참가") ? 8 : 5;

      return {
        id: `SH-${String(stakeholderCounter++).padStart(3, "0")}`,
        name: known?.name || role,
        organization: known?.organization,
        role,
        power_level: power + Math.floor(Math.random() * 2),
        interest_level: interest + Math.floor(Math.random() * 2),
        influence_type: power >= 7 ? "decision_maker" as const : power >= 5 ? "influencer" as const : "affected_party" as const,
        relationship_status: "neutral" as const,
      };
    });

    allStakeholders.push({
      category: cat.category,
      description: `${cat.category} 그룹 이해관계자`,
      stakeholders,
    });
  }

  const flatStakeholders = allStakeholders.flatMap(c => c.stakeholders);

  return {
    mapping_id: generateUUID(),
    event_id: validated.event_id,
    stakeholder_categories: allStakeholders,
    power_interest_grid: {
      high_power_high_interest: flatStakeholders.filter(s => s.power_level >= 7 && s.interest_level >= 7).map(s => s.id),
      high_power_low_interest: flatStakeholders.filter(s => s.power_level >= 7 && s.interest_level < 7).map(s => s.id),
      low_power_high_interest: flatStakeholders.filter(s => s.power_level < 7 && s.interest_level >= 7).map(s => s.id),
      low_power_low_interest: flatStakeholders.filter(s => s.power_level < 7 && s.interest_level < 7).map(s => s.id),
    },
    network_map: flatStakeholders.slice(0, 5).map(s => ({
      stakeholder_id: s.id,
      connections: flatStakeholders
        .filter(other => other.id !== s.id)
        .slice(0, 2)
        .map(other => ({
          connected_to: other.id,
          relationship_type: "업무 협력",
          strength: "moderate" as const,
        })),
    })),
    gap_analysis: validated.event_scope.scale === "large" || validated.event_scope.scale === "mega" ? [
      { missing_category: "국제 파트너", importance: "높음", action: "글로벌 스폰서/파트너 탐색" },
    ] : [],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
