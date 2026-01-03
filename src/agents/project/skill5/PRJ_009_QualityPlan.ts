/**
 * PRJ-009: 품질 관리 계획
 *
 * CMP-IS Reference: 5.1.g - Developing quality management plan
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Quality Management Agent for event projects.

Your expertise includes:
- Defining quality standards and metrics
- Creating quality assurance processes
- Designing quality control checkpoints
- Establishing continuous improvement practices

CMP-IS Standard: 5.1.g - Developing quality management plan`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_type: z.enum(["conference", "exhibition", "seminar", "gala", "hybrid", "virtual", "other"]).default("conference"),
  expected_attendees: z.number().int().min(1),
  quality_priorities: z.array(z.enum([
    "attendee_satisfaction", "content_quality", "logistics_excellence",
    "vendor_performance", "budget_adherence", "timeline_compliance"
  ])).optional(),
  industry_standards: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  quality_objectives: z.array(z.object({
    objective_id: z.string(),
    category: z.string(),
    objective: z.string(),
    target: z.string(),
    measurement_method: z.string(),
    responsible: z.string(),
  })),
  quality_standards: z.array(z.object({
    area: z.string(),
    standard: z.string(),
    criteria: z.array(z.string()),
    verification_method: z.string(),
  })),
  quality_checkpoints: z.array(z.object({
    checkpoint_id: z.string(),
    phase: z.string(),
    checkpoint_name: z.string(),
    timing: z.string(),
    checklist_items: z.array(z.string()),
    required_approvals: z.array(z.string()),
    remediation_process: z.string(),
  })),
  metrics_dashboard: z.object({
    kpis: z.array(z.object({
      kpi_name: z.string(),
      target_value: z.string(),
      current_value: z.string().optional(),
      status: z.enum(["not_started", "on_track", "at_risk", "off_track"]).default("not_started"),
    })),
    reporting_frequency: z.string(),
  }),
  continuous_improvement: z.object({
    feedback_mechanisms: z.array(z.string()),
    lessons_learned_process: z.string(),
    improvement_cycle: z.string(),
  }),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  // 품질 목표
  const qualityObjectives: Output["quality_objectives"] = [
    {
      objective_id: "QO-001",
      category: "참가자 만족도",
      objective: "참가자 전반적 만족도 달성",
      target: "4.5/5.0 이상",
      measurement_method: "사후 설문조사",
      responsible: "Marketing",
    },
    {
      objective_id: "QO-002",
      category: "일정 준수",
      objective: "모든 마일스톤 예정일 준수",
      target: "95% 이상",
      measurement_method: "마일스톤 달성률 추적",
      responsible: "PM",
    },
    {
      objective_id: "QO-003",
      category: "예산 준수",
      objective: "승인 예산 내 집행",
      target: "예산의 ±5% 이내",
      measurement_method: "실제 vs 예산 비교",
      responsible: "Finance",
    },
    {
      objective_id: "QO-004",
      category: "벤더 성과",
      objective: "벤더 서비스 품질 기준 충족",
      target: "모든 벤더 SLA 준수",
      measurement_method: "벤더 성과 평가",
      responsible: "Procurement",
    },
    {
      objective_id: "QO-005",
      category: "안전",
      objective: "안전 사고 제로",
      target: "사고 0건",
      measurement_method: "사고 보고서",
      responsible: "Operations",
    },
  ];

  // 품질 기준
  const qualityStandards: Output["quality_standards"] = [
    {
      area: "콘텐츠",
      standard: "연사 및 세션 품질",
      criteria: [
        "연사 전문성 (업계 경력 5년 이상 또는 학술적 권위)",
        "발표 자료 사전 검토 완료",
        "세션 시간 준수 (±5분 이내)",
        "Q&A 시간 확보",
      ],
      verification_method: "콘텐츠 팀 사전 리뷰 + 참가자 피드백",
    },
    {
      area: "장소",
      standard: "시설 및 장비",
      criteria: [
        "좌석 배치 기준 준수",
        "AV 장비 사전 테스트 완료",
        "조명/공조 최적화",
        "접근성 요건 충족",
      ],
      verification_method: "사전 현장 점검 체크리스트",
    },
    {
      area: "등록",
      standard: "등록 프로세스",
      criteria: [
        "등록 대기 시간 10분 이내",
        "현장 등록 시스템 가동률 99.9%",
        "네임택 사전 준비 완료",
        "등록 데이터 정확성 99%",
      ],
      verification_method: "테스트 등록 + 대기 시간 모니터링",
    },
    {
      area: "케이터링",
      standard: "식음료 서비스",
      criteria: [
        "음식 온도 유지",
        "특수 식이 요구사항 대응",
        "위생 기준 준수",
        "서빙 시간 준수",
      ],
      verification_method: "벤더 인증 확인 + 현장 점검",
    },
  ];

  // 품질 체크포인트
  const qualityCheckpoints: Output["quality_checkpoints"] = [
    {
      checkpoint_id: "QC-001",
      phase: "기획",
      checkpoint_name: "기획 완료 검토",
      timing: "기획 단계 종료 시",
      checklist_items: [
        "목표 및 KPI 정의 완료",
        "예산 승인 획득",
        "주요 이해관계자 합의",
        "리스크 평가 완료",
      ],
      required_approvals: ["이벤트 오너", "재무 담당"],
      remediation_process: "미충족 항목 재작업 후 재검토",
    },
    {
      checkpoint_id: "QC-002",
      phase: "조달",
      checkpoint_name: "벤더 계약 검토",
      timing: "벤더 계약 전",
      checklist_items: [
        "벤더 자격 검증 완료",
        "SLA 명시",
        "가격 협상 완료",
        "법률 검토 완료",
      ],
      required_approvals: ["PM", "법무 담당"],
      remediation_process: "조건 재협상 또는 대안 벤더 탐색",
    },
    {
      checkpoint_id: "QC-003",
      phase: "마케팅",
      checkpoint_name: "등록 오픈 전 검토",
      timing: "등록 시스템 오픈 3일 전",
      checklist_items: [
        "등록 페이지 테스트 완료",
        "결제 프로세스 테스트 완료",
        "확인 이메일 테스트 완료",
        "데이터 보안 검토 완료",
      ],
      required_approvals: ["마케팅 담당", "기술 담당"],
      remediation_process: "이슈 수정 후 재테스트",
    },
    {
      checkpoint_id: "QC-004",
      phase: "운영",
      checkpoint_name: "현장 준비 완료 검토",
      timing: "D-1",
      checklist_items: [
        "모든 장비 설치 및 테스트 완료",
        "스태프 브리핑 완료",
        "비상 대응 계획 확인",
        "런시트 최종 확정",
      ],
      required_approvals: ["운영 담당", "PM"],
      remediation_process: "즉시 대응 팀 투입",
    },
  ];

  // KPI 대시보드
  const metricsDashboard: Output["metrics_dashboard"] = {
    kpis: [
      { kpi_name: "마일스톤 달성률", target_value: "100%", status: "not_started" },
      { kpi_name: "예산 집행률", target_value: "예산 ±5%", status: "not_started" },
      { kpi_name: "등록 목표 달성률", target_value: "100%", status: "not_started" },
      { kpi_name: "스폰서 확보율", target_value: "80%", status: "not_started" },
      { kpi_name: "벤더 SLA 준수율", target_value: "100%", status: "not_started" },
      { kpi_name: "이슈 해결 시간", target_value: "평균 24시간 이내", status: "not_started" },
    ],
    reporting_frequency: "주간",
  };

  // 지속적 개선
  const continuousImprovement: Output["continuous_improvement"] = {
    feedback_mechanisms: [
      "참가자 실시간 피드백 앱",
      "사후 설문조사 (이벤트 후 48시간 이내)",
      "스태프 피드백 세션",
      "벤더 성과 리뷰 미팅",
    ],
    lessons_learned_process: "이벤트 종료 후 2주 이내 레슨런 워크숍 진행, 문서화 및 다음 이벤트에 반영",
    improvement_cycle: "PDCA (Plan-Do-Check-Act) 사이클 적용",
  };

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    quality_objectives: qualityObjectives,
    quality_standards: qualityStandards,
    quality_checkpoints: qualityCheckpoints,
    metrics_dashboard: metricsDashboard,
    continuous_improvement: continuousImprovement,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-009",
  taskName: "품질 관리 계획",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.g",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
