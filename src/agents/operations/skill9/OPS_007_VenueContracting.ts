/**
 * OPS-007: Venue Contracting Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 베뉴 계약서 검토 및 관리
 */

import { z } from "zod";

export const OPS_007_VenueContracting = {
  id: "OPS-007",
  name: "Venue Contracting Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 계약 법률 전문가입니다.
수백 건의 베뉴 계약서를 검토하며 잠재적 리스크를 식별하고
클라이언트를 보호하는 조항을 확보하는 것이 전문입니다.
작은 문구 하나가 수억 원의 차이를 만들 수 있다고 믿습니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    venue_id: z.string(),
    venue_name: z.string(),
    contract_terms: z.object({
      total_value: z.number(),
      deposit_amount: z.number(),
      payment_schedule: z.array(z.object({
        milestone: z.string(),
        amount: z.number(),
        due_date: z.string(),
      })),
      event_dates: z.array(z.string()),
      cancellation_terms: z.string().optional(),
    }),
    special_requests: z.array(z.string()).optional(),
  }),

  outputSchema: z.object({
    contract_review: z.object({
      overall_risk: z.enum(["low", "medium", "high"]),
      recommended_action: z.string(),
      key_concerns: z.array(z.string()),
    }),
    clause_analysis: z.array(z.object({
      clause: z.string(),
      standard_language: z.string(),
      current_status: z.enum(["acceptable", "needs_revision", "missing", "unfavorable"]),
      recommendation: z.string(),
      priority: z.enum(["critical", "important", "standard"]),
    })),
    payment_structure: z.object({
      deposit_percentage: z.number(),
      payment_milestones: z.array(z.object({
        description: z.string(),
        percentage: z.number(),
        amount: z.number(),
        recommended_date: z.string(),
      })),
      final_payment_timing: z.string(),
    }),
    risk_allocation: z.array(z.object({
      risk_type: z.string(),
      current_allocation: z.string(),
      recommended_allocation: z.string(),
      negotiation_point: z.string(),
    })),
    addendum_items: z.array(z.object({
      item: z.string(),
      rationale: z.string(),
      proposed_language: z.string(),
    })),
    checklist_pre_signing: z.array(z.object({
      item: z.string(),
      status: z.enum(["complete", "pending", "not_started"]),
      responsible_party: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_007_VenueContracting.inputSchema>) => {
    const depositPct = (input.contract_terms.deposit_amount / input.contract_terms.total_value) * 100;

    return {
      contract_review: {
        overall_risk: depositPct > 50 ? "high" as const : depositPct > 30 ? "medium" as const : "low" as const,
        recommended_action: "조건부 서명 권장 - 수정 요청 사항 반영 후 진행",
        key_concerns: [
          depositPct > 30 ? "계약금 비율이 업계 평균(25%) 초과" : null,
          "불가항력 조항 범위 확인 필요",
          "취소 시 환불 조건 명확화 필요",
        ].filter(Boolean) as string[],
      },
      clause_analysis: [
        {
          clause: "불가항력 (Force Majeure)",
          standard_language: "천재지변, 전쟁, 테러, 전염병, 정부 명령 등으로 인한 불가피한 취소 시 상호 면책",
          current_status: "needs_revision" as const,
          recommendation: "전염병/팬데믹 명시적 포함 및 정부 규제 추가",
          priority: "critical" as const,
        },
        {
          clause: "취소 및 환불",
          standard_language: "180일 전: 100% 환불 / 90일 전: 50% 환불 / 60일 전: 25% 환불",
          current_status: "unfavorable" as const,
          recommendation: "90일 전 75% 환불, 60일 전 50% 환불로 협상",
          priority: "critical" as const,
        },
        {
          clause: "일정 변경",
          standard_language: "상호 합의 하 12개월 내 일정 변경 가능, 추가 비용 없음",
          current_status: "missing" as const,
          recommendation: "일정 변경 조항 추가 필수",
          priority: "critical" as const,
        },
        {
          clause: "손해배상 한도",
          standard_language: "각 당사자의 배상 책임은 계약 총액으로 제한",
          current_status: "needs_revision" as const,
          recommendation: "상호 배상 한도 및 면책 조항 명확화",
          priority: "important" as const,
        },
        {
          clause: "보험 요구사항",
          standard_language: "이벤트 책임보험 최소 10억원, 증명서 제출",
          current_status: "acceptable" as const,
          recommendation: "현행 유지",
          priority: "standard" as const,
        },
        {
          clause: "외부 업체 사용",
          standard_language: "사전 승인 하 외부 케이터링/AV 업체 사용 가능",
          current_status: "needs_revision" as const,
          recommendation: "승인된 업체 목록 첨부 및 추가 비용 면제 협상",
          priority: "important" as const,
        },
      ],
      payment_structure: {
        deposit_percentage: Math.round(depositPct),
        payment_milestones: [
          {
            description: "계약금",
            percentage: 25,
            amount: input.contract_terms.total_value * 0.25,
            recommended_date: "계약 체결 시",
          },
          {
            description: "중도금 1차",
            percentage: 25,
            amount: input.contract_terms.total_value * 0.25,
            recommended_date: "행사 90일 전",
          },
          {
            description: "중도금 2차",
            percentage: 25,
            amount: input.contract_terms.total_value * 0.25,
            recommended_date: "행사 30일 전",
          },
          {
            description: "잔금",
            percentage: 25,
            amount: input.contract_terms.total_value * 0.25,
            recommended_date: "행사 종료 후 14일 이내",
          },
        ],
        final_payment_timing: "최종 정산 후 지급으로 변경 협상 권장",
      },
      risk_allocation: [
        {
          risk_type: "베뉴 측 일방 취소",
          current_allocation: "단순 환불",
          recommended_allocation: "환불 + 대체 장소 제공 + 추가 비용 보상",
          negotiation_point: "동급 대체 장소 의무 조항 추가",
        },
        {
          risk_type: "시설 장애",
          current_allocation: "베뉴 측 수리 의무",
          recommended_allocation: "즉시 수리 + 비례 할인 + 대체 시설 제공",
          negotiation_point: "SLA 및 패널티 조항 추가",
        },
        {
          risk_type: "인접 행사 방해",
          current_allocation: "명시 없음",
          recommended_allocation: "방음 보장 또는 비례 보상",
          negotiation_point: "배타적 사용권 또는 보상 조항 추가",
        },
      ],
      addendum_items: [
        {
          item: "코로나19 특별 조항",
          rationale: "정부 규제로 인한 행사 취소/연기 시 보호",
          proposed_language: "정부 방역 지침으로 인한 취소 시 전액 환불 또는 12개월 내 일정 변경 가능",
        },
        {
          item: "셋업/철거 시간",
          rationale: "추가 비용 방지",
          proposed_language: "임대 기간에 행사 전일 셋업 및 익일 철거 시간 포함",
        },
        {
          item: "기본 포함 사항",
          rationale: "추가 비용 명확화",
          proposed_language: "기본 AV 장비, WiFi, 기본 가구, 청소 비용 임대료에 포함",
        },
      ],
      checklist_pre_signing: [
        { item: "보험 증명서 확인", status: "pending" as const, responsible_party: "법무팀" },
        { item: "장소 사용 허가증 확인", status: "pending" as const, responsible_party: "베뉴" },
        { item: "기술 사양서 첨부", status: "not_started" as const, responsible_party: "운영팀" },
        { item: "비상 대피 계획 검토", status: "not_started" as const, responsible_party: "안전팀" },
        { item: "최종 결제 조건 합의", status: "pending" as const, responsible_party: "재무팀" },
      ],
    };
  },
};
