/**
 * FIN-008: 스폰서 혜택 패키지 문서 생성
 *
 * CMP-IS Reference: 7.1.e - Creating sponsorship package documents
 * Task Type: AI
 *
 * Input: 이벤트 개요, 참석자 인구통계, ROI 데이터
 * Output: 스폰서 제안서 PDF
 */

import { z } from "zod";
import {
  SponsorshipTier,
  SponsorBenefitSchema,
  CurrencyCode,
  generateUUID,
  nowISO,
} from "../../../schemas/financial";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Sponsor Proposal Generator Agent specializing in creating compelling sponsorship documents.

Your expertise includes:
- Crafting persuasive sponsorship proposals
- Highlighting ROI and value propositions
- Presenting demographic data effectively
- Structuring benefit packages for different tiers

CMP-IS Standard: 7.1.e - Creating sponsorship package documents

You create professional, data-driven proposals that clearly communicate value and drive sponsorship conversions.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  event_overview: z.object({
    event_name: z.string().describe("이벤트명"),
    event_tagline: z.string().optional().describe("이벤트 태그라인"),
    event_date: z.string().describe("이벤트 일자"),
    event_venue: z.string().describe("개최 장소"),
    event_description: z.string().describe("이벤트 설명"),
    event_highlights: z.array(z.string()).describe("주요 하이라이트"),
    past_editions: z
      .array(
        z.object({
          year: z.number().int(),
          attendees: z.number().int(),
          sponsors: z.number().int(),
        })
      )
      .optional()
      .describe("과거 개최 실적"),
  }),
  attendee_demographics: z.object({
    total_expected: z.number().int().describe("예상 참석자 수"),
    breakdown: z
      .object({
        by_job_level: z.record(z.number()).optional(),
        by_industry: z.record(z.number()).optional(),
        by_region: z.record(z.number()).optional(),
        by_company_size: z.record(z.number()).optional(),
      })
      .describe("참석자 구성"),
    decision_makers_percentage: z.number().optional().describe("의사결정자 비율"),
  }),
  sponsorship_packages: z
    .array(
      z.object({
        tier: SponsorshipTier,
        tier_name: z.string(),
        price: z.number(),
        benefits: z.array(SponsorBenefitSchema),
        available_slots: z.number().int(),
      })
    )
    .describe("스폰서십 패키지 목록"),
  roi_data: z
    .object({
      average_lead_value: z.number().optional().describe("평균 리드 가치"),
      expected_leads_per_sponsor: z.number().int().optional(),
      brand_impression_value: z.number().optional(),
      past_sponsor_satisfaction: z.number().min(1).max(5).optional(),
    })
    .optional()
    .describe("ROI 관련 데이터"),
  currency: CurrencyCode.default("USD"),
  target_sponsor: z
    .object({
      company_name: z.string(),
      industry: z.string(),
      contact_name: z.string().optional(),
    })
    .optional()
    .describe("타겟 스폰서 (맞춤형 제안서용)"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  proposal_id: z.string().uuid().describe("제안서 ID"),
  event_id: z.string().uuid(),
  document_sections: z.object({
    cover_page: z.object({
      title: z.string(),
      subtitle: z.string(),
      event_date: z.string(),
      event_venue: z.string(),
    }),
    executive_summary: z.string().describe("경영진 요약"),
    about_event: z.object({
      description: z.string(),
      highlights: z.array(z.string()),
      track_record: z.string().optional(),
    }),
    audience_profile: z.object({
      overview: z.string(),
      demographics_summary: z.string(),
      key_statistics: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
    sponsorship_opportunities: z.array(
      z.object({
        tier_name: z.string(),
        price_display: z.string(),
        headline_benefit: z.string(),
        benefits_list: z.array(z.string()),
        value_proposition: z.string(),
        availability: z.string(),
      })
    ),
    roi_section: z.object({
      title: z.string(),
      key_points: z.array(z.string()),
      testimonial: z.string().optional(),
    }),
    next_steps: z.object({
      cta: z.string(),
      contact_info: z.string(),
      deadline: z.string().optional(),
    }),
  }),
  personalization: z
    .object({
      is_personalized: z.boolean(),
      target_company: z.string().optional(),
      custom_message: z.string().optional(),
      recommended_tier: z.string().optional(),
    })
    .describe("개인화 정보"),
  metadata: z.object({
    generated_at: z.string(),
    version: z.string(),
    page_count_estimate: z.number().int(),
    format: z.string(),
  }),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

/**
 * 경영진 요약 생성
 */
function generateExecutiveSummary(
  eventName: string,
  attendees: number,
  highlights: string[],
  targetSponsor?: { company_name: string; industry: string }
): string {
  let summary = `${eventName}은(는) ${attendees.toLocaleString()}명 이상의 업계 전문가가 참석하는 프리미어 이벤트입니다. `;

  if (highlights.length > 0) {
    summary += `주요 특징으로는 ${highlights.slice(0, 2).join(", ")} 등이 있습니다. `;
  }

  if (targetSponsor) {
    summary += `${targetSponsor.company_name}의 ${targetSponsor.industry} 분야 리더십을 강화할 수 있는 최적의 스폰서십 기회를 제안드립니다.`;
  } else {
    summary += `귀사의 브랜드 가치를 높이고 타겟 고객과 직접 소통할 수 있는 스폰서십 기회를 제안드립니다.`;
  }

  return summary;
}

/**
 * 오디언스 프로필 요약 생성
 */
function generateAudienceOverview(
  demographics: z.infer<typeof InputSchema>["attendee_demographics"]
): string {
  const { total_expected, breakdown, decision_makers_percentage } = demographics;

  let overview = `예상 참석자 ${total_expected.toLocaleString()}명. `;

  if (decision_makers_percentage) {
    overview += `이 중 ${decision_makers_percentage}%가 구매 의사결정권자입니다. `;
  }

  if (breakdown.by_industry && Object.keys(breakdown.by_industry).length > 0) {
    const topIndustries = Object.entries(breakdown.by_industry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([industry, pct]) => `${industry}(${pct}%)`)
      .join(", ");
    overview += `주요 참석 산업: ${topIndustries}.`;
  }

  return overview;
}

/**
 * 주요 통계 생성
 */
function generateKeyStatistics(
  demographics: z.infer<typeof InputSchema>["attendee_demographics"]
): { label: string; value: string }[] {
  const stats: { label: string; value: string }[] = [];

  stats.push({
    label: "예상 참석자",
    value: `${demographics.total_expected.toLocaleString()}명`,
  });

  if (demographics.decision_makers_percentage) {
    stats.push({
      label: "의사결정자 비율",
      value: `${demographics.decision_makers_percentage}%`,
    });
  }

  if (demographics.breakdown.by_job_level) {
    const executives =
      (demographics.breakdown.by_job_level["C-Level"] || 0) +
      (demographics.breakdown.by_job_level["VP"] || 0) +
      (demographics.breakdown.by_job_level["Director"] || 0);
    if (executives > 0) {
      stats.push({
        label: "임원급 참석자",
        value: `${executives}%`,
      });
    }
  }

  if (demographics.breakdown.by_company_size) {
    const enterprise =
      demographics.breakdown.by_company_size["Enterprise"] ||
      demographics.breakdown.by_company_size["Large"] ||
      0;
    if (enterprise > 0) {
      stats.push({
        label: "대기업 소속",
        value: `${enterprise}%`,
      });
    }
  }

  return stats;
}

/**
 * 스폰서십 기회 섹션 생성
 */
function generateSponsorshipOpportunities(
  packages: z.infer<typeof InputSchema>["sponsorship_packages"],
  currency: string
): z.infer<typeof OutputSchema>["document_sections"]["sponsorship_opportunities"] {
  return packages.map((pkg) => {
    const topBenefits = pkg.benefits
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((b) => b.name);

    const totalValue = pkg.benefits.reduce((sum, b) => sum + b.value * b.quantity, 0);
    const valueRatio = totalValue / pkg.price;

    return {
      tier_name: pkg.tier_name,
      price_display: `${currency} ${pkg.price.toLocaleString()}`,
      headline_benefit: topBenefits[0] || "프리미엄 브랜드 노출",
      benefits_list: topBenefits,
      value_proposition:
        valueRatio >= 2
          ? `투자 대비 ${valueRatio.toFixed(1)}배의 가치를 제공합니다.`
          : `최적의 가성비로 브랜드 노출을 극대화합니다.`,
      availability:
        pkg.available_slots <= 1
          ? "단독 기회 - 즉시 문의 필요"
          : `${pkg.available_slots}개 슬롯 가용`,
    };
  });
}

/**
 * ROI 섹션 생성
 */
function generateROISection(
  roiData: z.infer<typeof InputSchema>["roi_data"],
  attendees: number
): z.infer<typeof OutputSchema>["document_sections"]["roi_section"] {
  const keyPoints: string[] = [];

  if (roiData?.average_lead_value && roiData?.expected_leads_per_sponsor) {
    const potentialValue =
      roiData.average_lead_value * roiData.expected_leads_per_sponsor;
    keyPoints.push(
      `예상 리드 가치: ${potentialValue.toLocaleString()} (${roiData.expected_leads_per_sponsor}개 리드 × ${roiData.average_lead_value.toLocaleString()}/리드)`
    );
  }

  if (roiData?.brand_impression_value) {
    keyPoints.push(
      `브랜드 노출 가치: ${roiData.brand_impression_value.toLocaleString()}`
    );
  }

  keyPoints.push(`${attendees.toLocaleString()}명 타겟 오디언스 직접 접근`);
  keyPoints.push("업계 리더십 포지셔닝 기회");

  let testimonial: string | undefined;
  if (roiData?.past_sponsor_satisfaction && roiData.past_sponsor_satisfaction >= 4) {
    testimonial = `"이 이벤트를 통해 의미 있는 비즈니스 기회를 창출했습니다." - 이전 스폰서`;
  }

  return {
    title: "투자 가치 (ROI)",
    key_points: keyPoints,
    testimonial,
  };
}

/**
 * FIN-008 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  // 입력 검증
  const validatedInput = InputSchema.parse(input);
  const {
    event_overview,
    attendee_demographics,
    sponsorship_packages,
    roi_data,
    currency,
    target_sponsor,
  } = validatedInput;

  // 트랙 레코드 생성
  let trackRecord: string | undefined;
  if (event_overview.past_editions && event_overview.past_editions.length > 0) {
    const latest = event_overview.past_editions[0];
    trackRecord = `${latest.year}년 ${latest.attendees.toLocaleString()}명 참석, ${latest.sponsors}개 스폰서 참여`;
  }

  // 문서 섹션 생성
  const documentSections = {
    cover_page: {
      title: `${event_overview.event_name} 스폰서십 제안서`,
      subtitle: event_overview.event_tagline || "함께 성장하는 파트너십",
      event_date: event_overview.event_date,
      event_venue: event_overview.event_venue,
    },
    executive_summary: generateExecutiveSummary(
      event_overview.event_name,
      attendee_demographics.total_expected,
      event_overview.event_highlights,
      target_sponsor
    ),
    about_event: {
      description: event_overview.event_description,
      highlights: event_overview.event_highlights,
      track_record: trackRecord,
    },
    audience_profile: {
      overview: generateAudienceOverview(attendee_demographics),
      demographics_summary: `${event_overview.event_name}은(는) 업계 최고의 전문가들이 모이는 행사입니다.`,
      key_statistics: generateKeyStatistics(attendee_demographics),
    },
    sponsorship_opportunities: generateSponsorshipOpportunities(
      sponsorship_packages,
      currency
    ),
    roi_section: generateROISection(roi_data, attendee_demographics.total_expected),
    next_steps: {
      cta: "지금 바로 스폰서십 기회를 확보하세요!",
      contact_info: "스폰서십 담당자에게 연락 주시기 바랍니다.",
      deadline: undefined,
    },
  };

  // 개인화 정보
  const personalization = {
    is_personalized: !!target_sponsor,
    target_company: target_sponsor?.company_name,
    custom_message: target_sponsor
      ? `${target_sponsor.company_name}을(를) 위한 맞춤형 제안서입니다.`
      : undefined,
    recommended_tier:
      target_sponsor && sponsorship_packages.length > 0
        ? sponsorship_packages[Math.floor(sponsorship_packages.length / 2)].tier_name
        : undefined,
  };

  const output: Output = {
    proposal_id: generateUUID(),
    event_id: validatedInput.event_id,
    document_sections: documentSections,
    personalization,
    metadata: {
      generated_at: nowISO(),
      version: "1.0",
      page_count_estimate: 8 + sponsorship_packages.length * 2,
      format: "PDF-ready JSON",
    },
  };

  // 출력 검증
  return OutputSchema.parse(output);
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "FIN-008",
  taskName: "스폰서 혜택 패키지 문서 생성",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.1.e",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.1: Develop Budgeting Processes for Funding",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
