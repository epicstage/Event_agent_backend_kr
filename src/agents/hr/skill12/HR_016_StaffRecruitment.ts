/**
 * HR-016: Staff Recruitment Execution
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 채용 프로세스 실행 및 관리
 */

import { z } from "zod";

export const HR_016_InputSchema = z.object({
  event_id: z.string().uuid(),
  campaign_id: z.string().optional(),
  positions: z.array(z.object({
    role: z.string(),
    openings: z.number(),
    applications_received: z.number(),
  })),
  recruitment_phase: z.enum(["screening", "interviewing", "offering", "closing"]),
});

export const HR_016_OutputSchema = z.object({
  event_id: z.string(),
  recruitment_status: z.object({
    phase: z.string(),
    total_openings: z.number(),
    total_applications: z.number(),
    conversion_rate: z.number(),
    positions_filled: z.number(),
    positions_pending: z.number(),
  }),
  pipeline: z.array(z.object({
    stage: z.string(),
    count: z.number(),
    actions: z.array(z.string()),
  })),
  screening_criteria: z.array(z.object({
    criterion: z.string(),
    weight: z.number(),
    evaluation_method: z.string(),
  })),
  interview_schedule: z.object({
    format: z.string(),
    duration: z.string(),
    questions: z.array(z.object({
      category: z.string(),
      question: z.string(),
      evaluation_focus: z.string(),
    })),
  }),
  next_steps: z.array(z.object({
    action: z.string(),
    deadline: z.string(),
    responsible: z.string(),
  })),
});

export type HR_016_Input = z.infer<typeof HR_016_InputSchema>;
export type HR_016_Output = z.infer<typeof HR_016_OutputSchema>;

export async function execute(input: HR_016_Input): Promise<HR_016_Output> {
  const totalOpenings = input.positions.reduce((sum, p) => sum + p.openings, 0);
  const totalApplications = input.positions.reduce((sum, p) => sum + p.applications_received, 0);

  const pipelineStages = [
    { stage: "지원서 접수", count: totalApplications, actions: ["서류 검토", "자격 요건 확인"] },
    { stage: "서류 합격", count: Math.round(totalApplications * 0.6), actions: ["면접 일정 안내", "사전 과제 발송"] },
    { stage: "면접 진행", count: Math.round(totalApplications * 0.4), actions: ["면접 실시", "평가서 작성"] },
    { stage: "최종 합격", count: Math.round(totalApplications * 0.25), actions: ["합격 통보", "계약서 발송"] },
    { stage: "온보딩 대기", count: Math.round(totalApplications * 0.2), actions: ["서류 수집", "교육 일정 안내"] },
  ];

  return {
    event_id: input.event_id,
    recruitment_status: {
      phase: input.recruitment_phase,
      total_openings: totalOpenings,
      total_applications: totalApplications,
      conversion_rate: Math.round((totalApplications / totalOpenings) * 100) / 100,
      positions_filled: Math.round(totalOpenings * 0.6),
      positions_pending: Math.round(totalOpenings * 0.4),
    },
    pipeline: pipelineStages,
    screening_criteria: [
      { criterion: "관련 경험", weight: 30, evaluation_method: "이력서 검토" },
      { criterion: "가용 시간", weight: 25, evaluation_method: "지원서 확인" },
      { criterion: "위치/통근", weight: 20, evaluation_method: "거리 계산" },
      { criterion: "자격증/기술", weight: 15, evaluation_method: "증빙 확인" },
      { criterion: "동기/열정", weight: 10, evaluation_method: "자기소개 평가" },
    ],
    interview_schedule: {
      format: "그룹 면접 (5인 1조) + 개별 Q&A",
      duration: "30분",
      questions: [
        { category: "경험", question: "이벤트 스태프 경험이 있다면 가장 기억에 남는 상황은?", evaluation_focus: "실무 경험 및 대처 능력" },
        { category: "상황대처", question: "불만을 표출하는 참가자를 어떻게 응대하시겠습니까?", evaluation_focus: "고객 서비스 마인드" },
        { category: "팀워크", question: "팀원과 의견이 다를 때 어떻게 해결하나요?", evaluation_focus: "협업 능력" },
        { category: "동기", question: "이 행사 스태프에 지원한 이유는?", evaluation_focus: "열정 및 적합성" },
      ],
    },
    next_steps: [
      { action: "서류 심사 완료", deadline: "D-21", responsible: "HR 담당자" },
      { action: "면접 대상자 통보", deadline: "D-18", responsible: "HR 담당자" },
      { action: "면접 실시", deadline: "D-14", responsible: "HR팀 + 부서 매니저" },
      { action: "최종 합격자 발표", deadline: "D-10", responsible: "HR 담당자" },
      { action: "온보딩 시작", deadline: "D-7", responsible: "HR팀" },
    ],
  };
}

export const HR_016_StaffRecruitment = {
  id: "HR-016",
  name: "Staff Recruitment Execution",
  description: "채용 프로세스 실행 및 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.1",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_016_InputSchema,
  outputSchema: HR_016_OutputSchema,
  persona: `당신은 채용 담당자입니다. 효율적이고 공정한 채용 프로세스를 운영하여 최적의 인재를 확보합니다.`,
};

export default HR_016_StaffRecruitment;
