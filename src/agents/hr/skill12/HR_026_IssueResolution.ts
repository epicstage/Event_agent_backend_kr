/**
 * HR-026: Staff Issue Resolution
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 스태프 이슈 및 갈등 해결
 */

import { z } from "zod";

export const HR_026_InputSchema = z.object({
  event_id: z.string().uuid(),
  issue: z.object({
    type: z.enum(["conflict", "complaint", "misconduct", "injury", "absence", "performance", "harassment", "other"]),
    description: z.string(),
    reported_by: z.string(),
    involved_parties: z.array(z.string()),
    severity: z.enum(["low", "medium", "high", "critical"]),
    timestamp: z.string(),
  }),
});

export const HR_026_OutputSchema = z.object({
  event_id: z.string(),
  issue_assessment: z.object({
    type: z.string(),
    severity: z.string(),
    requires_immediate_action: z.boolean(),
    escalation_needed: z.boolean(),
    escalation_to: z.string().optional(),
  }),
  resolution_protocol: z.array(z.object({
    step: z.number(),
    action: z.string(),
    responsible: z.string(),
    timeframe: z.string(),
    notes: z.string(),
  })),
  communication_plan: z.object({
    to_involved_parties: z.string(),
    to_witnesses: z.string(),
    to_management: z.string(),
    confidentiality_notes: z.string(),
  }),
  documentation: z.array(z.object({
    document: z.string(),
    purpose: z.string(),
    retention: z.string(),
  })),
  follow_up: z.array(z.object({
    action: z.string(),
    timing: z.string(),
    responsible: z.string(),
  })),
  prevention_recommendations: z.array(z.string()),
});

export type HR_026_Input = z.infer<typeof HR_026_InputSchema>;
export type HR_026_Output = z.infer<typeof HR_026_OutputSchema>;

const ISSUE_PROTOCOLS: Record<string, { escalation: boolean; escalation_to: string; immediate: boolean }> = {
  conflict: { escalation: false, escalation_to: "부서 매니저", immediate: false },
  complaint: { escalation: false, escalation_to: "HR 담당", immediate: false },
  misconduct: { escalation: true, escalation_to: "HR 매니저", immediate: true },
  injury: { escalation: true, escalation_to: "안전 담당 + HR", immediate: true },
  absence: { escalation: false, escalation_to: "팀 리더", immediate: true },
  performance: { escalation: false, escalation_to: "부서 매니저", immediate: false },
  harassment: { escalation: true, escalation_to: "HR 매니저 + 법무", immediate: true },
  other: { escalation: false, escalation_to: "HR 담당", immediate: false },
};

export async function execute(input: HR_026_Input): Promise<HR_026_Output> {
  const protocol = ISSUE_PROTOCOLS[input.issue.type];
  const isHighSeverity = input.issue.severity === "high" || input.issue.severity === "critical";

  const resolutionSteps = [];

  // 즉시 조치
  if (protocol.immediate || isHighSeverity) {
    resolutionSteps.push({
      step: 1,
      action: "현장 상황 안정화",
      responsible: "현장 책임자",
      timeframe: "즉시",
      notes: "관련자 분리, 안전 확보",
    });
  }

  resolutionSteps.push({
    step: resolutionSteps.length + 1,
    action: "초기 사실 확인",
    responsible: "팀 리더",
    timeframe: "30분 이내",
    notes: "관련자 개별 면담, 증인 확보",
  });

  if (protocol.escalation || isHighSeverity) {
    resolutionSteps.push({
      step: resolutionSteps.length + 1,
      action: "상급자 보고 및 에스컬레이션",
      responsible: "팀 리더",
      timeframe: "1시간 이내",
      notes: `${protocol.escalation_to}에게 상황 보고`,
    });
  }

  resolutionSteps.push({
    step: resolutionSteps.length + 1,
    action: "공식 조사 진행",
    responsible: "HR 담당",
    timeframe: input.issue.type === "harassment" ? "24시간 이내" : "행사 종료 후",
    notes: "객관적 사실 파악, 증거 수집",
  });

  resolutionSteps.push({
    step: resolutionSteps.length + 1,
    action: "해결 방안 결정",
    responsible: protocol.escalation_to,
    timeframe: isHighSeverity ? "당일" : "48시간 이내",
    notes: "관련 규정에 따른 조치 결정",
  });

  resolutionSteps.push({
    step: resolutionSteps.length + 1,
    action: "결과 통보 및 조치 실행",
    responsible: "HR 담당",
    timeframe: "결정 후 즉시",
    notes: "관련자에게 결과 통보, 필요 시 조치 실행",
  });

  return {
    event_id: input.event_id,
    issue_assessment: {
      type: input.issue.type,
      severity: input.issue.severity,
      requires_immediate_action: protocol.immediate || isHighSeverity,
      escalation_needed: protocol.escalation || isHighSeverity,
      escalation_to: protocol.escalation_to,
    },
    resolution_protocol: resolutionSteps,
    communication_plan: {
      to_involved_parties: "개별 면담, 비밀 유지 원칙 안내, 보복 금지 고지",
      to_witnesses: "증언 요청, 비밀 유지 협조 요청",
      to_management: "상황 요약, 조치 계획, 필요 지원 요청",
      confidentiality_notes: "관련자 프라이버시 보호, 필요 최소 범위 공유, 추측/소문 방지",
    },
    documentation: [
      { document: "이슈 보고서", purpose: "초기 신고 및 상황 기록", retention: "3년" },
      { document: "조사 기록", purpose: "면담 내용, 증거 정리", retention: "3년" },
      { document: "조치 결정서", purpose: "결정 내용 및 근거 기록", retention: "3년" },
      { document: "당사자 확인서", purpose: "결과 통보 확인", retention: "3년" },
    ],
    follow_up: [
      { action: "관련자 상태 확인", timing: "D+1", responsible: "HR 담당" },
      { action: "재발 방지 모니터링", timing: "행사 기간 중", responsible: "팀 리더" },
      { action: "최종 보고서 작성", timing: "행사 종료 후 7일", responsible: "HR 담당" },
      { action: "교훈 및 개선점 정리", timing: "행사 종료 후 14일", responsible: "HR 매니저" },
    ],
    prevention_recommendations: [
      "명확한 행동 규범 사전 교육",
      "익명 제보 채널 운영",
      "정기 스태프 상태 체크",
      "리더십 갈등 해결 교육",
      "다양성 및 존중 교육 강화",
    ],
  };
}

export const HR_026_IssueResolution = {
  id: "HR-026",
  name: "Staff Issue Resolution",
  description: "스태프 이슈 및 갈등 해결",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.11",
  taskType: "Hybrid" as const,
  execute,
  inputSchema: HR_026_InputSchema,
  outputSchema: HR_026_OutputSchema,
  persona: `당신은 노사관계 전문가입니다. 공정하고 신속한 이슈 해결로 건강한 조직 문화를 유지합니다.`,
};

export default HR_026_IssueResolution;
