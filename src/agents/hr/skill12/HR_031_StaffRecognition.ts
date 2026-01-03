/**
 * HR-031: Staff Recognition Program
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 스태프 인정 및 포상 프로그램
 */

import { z } from "zod";

export const HR_031_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  performance_data: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    department: z.string(),
    role: z.string(),
    performance_score: z.number().min(0).max(100),
    special_contributions: z.array(z.string()).optional(),
    peer_nominations: z.number().optional(),
    attendance_rate: z.number(),
  })),
  recognition_budget: z.number(),
  award_categories: z.array(z.string()).optional(),
});

export const HR_031_OutputSchema = z.object({
  event_id: z.string(),
  recognition_summary: z.object({
    total_staff: z.number(),
    recognition_rate: z.number(),
    total_awards: z.number(),
    budget_used: z.number(),
  }),
  award_recipients: z.array(z.object({
    category: z.string(),
    recipient: z.object({
      staff_id: z.string(),
      name: z.string(),
      department: z.string(),
    }),
    reason: z.string(),
    award: z.object({
      type: z.string(),
      value: z.number(),
      description: z.string(),
    }),
  })),
  department_recognition: z.array(z.object({
    department: z.string(),
    avg_performance: z.number(),
    top_performers: z.array(z.string()),
    special_mention: z.string().optional(),
  })),
  recognition_ceremony: z.object({
    timing: z.string(),
    format: z.string(),
    agenda: z.array(z.object({
      item: z.string(),
      duration: z.string(),
    })),
  }),
  communication_plan: z.object({
    announcement_channels: z.array(z.string()),
    certificate_distribution: z.string(),
    photo_documentation: z.string(),
  }),
  follow_up_actions: z.array(z.object({
    action: z.string(),
    timeline: z.string(),
    responsible: z.string(),
  })),
});

export type HR_031_Input = z.infer<typeof HR_031_InputSchema>;
export type HR_031_Output = z.infer<typeof HR_031_OutputSchema>;

const DEFAULT_CATEGORIES = [
  "최우수 스태프상",
  "팀워크상",
  "고객서비스상",
  "문제해결상",
  "성실상",
];

export async function execute(input: HR_031_Input): Promise<HR_031_Output> {
  const categories = input.award_categories || DEFAULT_CATEGORIES;
  const totalStaff = input.performance_data.length;

  // 상위 성과자 선정
  const sortedByPerformance = [...input.performance_data].sort(
    (a, b) => b.performance_score - a.performance_score
  );

  const awardRecipients = [];
  const usedStaffIds = new Set<string>();
  let budgetUsed = 0;

  // 각 카테고리별 수상자 선정
  for (const category of categories) {
    let recipient;
    let reason = "";

    if (category === "최우수 스태프상") {
      recipient = sortedByPerformance.find((s) => !usedStaffIds.has(s.staff_id));
      reason = `전체 성과 점수 ${recipient?.performance_score}점으로 최고 성과 달성`;
    } else if (category === "팀워크상") {
      recipient = input.performance_data
        .filter((s) => !usedStaffIds.has(s.staff_id))
        .sort((a, b) => (b.peer_nominations || 0) - (a.peer_nominations || 0))[0];
      reason = `동료 추천 ${recipient?.peer_nominations || 0}회로 뛰어난 협업 능력 인정`;
    } else if (category === "고객서비스상") {
      recipient = input.performance_data
        .filter((s) => !usedStaffIds.has(s.staff_id) && s.special_contributions?.some((c) => c.includes("고객")))
        .sort((a, b) => b.performance_score - a.performance_score)[0];
      reason = "탁월한 고객 응대 및 서비스 제공";
    } else if (category === "문제해결상") {
      recipient = input.performance_data
        .filter((s) => !usedStaffIds.has(s.staff_id) && s.special_contributions?.length)
        .sort((a, b) => (b.special_contributions?.length || 0) - (a.special_contributions?.length || 0))[0];
      reason = "현장 문제 해결에 대한 탁월한 기여";
    } else if (category === "성실상") {
      recipient = input.performance_data
        .filter((s) => !usedStaffIds.has(s.staff_id))
        .sort((a, b) => b.attendance_rate - a.attendance_rate)[0];
      reason = `출석률 ${recipient?.attendance_rate}%로 모범적인 근태 유지`;
    } else {
      recipient = sortedByPerformance.find((s) => !usedStaffIds.has(s.staff_id));
      reason = "우수한 성과 달성";
    }

    if (recipient) {
      usedStaffIds.add(recipient.staff_id);
      const awardValue = Math.round(input.recognition_budget / categories.length);
      budgetUsed += awardValue;

      awardRecipients.push({
        category,
        recipient: {
          staff_id: recipient.staff_id,
          name: recipient.name,
          department: recipient.department,
        },
        reason,
        award: {
          type: awardValue >= 100000 ? "상금 + 상장" : "상장 + 기념품",
          value: awardValue,
          description: awardValue >= 100000
            ? `상금 ${awardValue.toLocaleString()}원 및 감사장`
            : `기념품 (${awardValue.toLocaleString()}원 상당) 및 감사장`,
        },
      });
    }
  }

  // 부서별 분석
  const departments = [...new Set(input.performance_data.map((s) => s.department))];
  const departmentRecognition = departments.map((dept) => {
    const deptStaff = input.performance_data.filter((s) => s.department === dept);
    const avgPerformance = Math.round(
      deptStaff.reduce((sum, s) => sum + s.performance_score, 0) / deptStaff.length
    );
    const topPerformers = deptStaff
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, 3)
      .map((s) => s.name);

    return {
      department: dept,
      avg_performance: avgPerformance,
      top_performers: topPerformers,
      special_mention: avgPerformance >= 85 ? "우수 부서" : undefined,
    };
  });

  const recognitionRate = Math.round((awardRecipients.length / totalStaff) * 100);

  return {
    event_id: input.event_id,
    recognition_summary: {
      total_staff: totalStaff,
      recognition_rate: recognitionRate,
      total_awards: awardRecipients.length,
      budget_used: budgetUsed,
    },
    award_recipients: awardRecipients,
    department_recognition: departmentRecognition,
    recognition_ceremony: {
      timing: "행사 종료 후 30분",
      format: "간단한 시상식 (전체 스태프 대상)",
      agenda: [
        { item: "개회 및 감사 인사", duration: "3분" },
        { item: "부서별 우수팀 발표", duration: "5분" },
        { item: "개인 시상 (카테고리별)", duration: "10분" },
        { item: "단체 사진 촬영", duration: "5분" },
        { item: "마무리 인사", duration: "2분" },
      ],
    },
    communication_plan: {
      announcement_channels: [
        "현장 시상식 발표",
        "사내 공지 게시",
        "단체 메신저 공유",
        "SNS 축하 포스팅 (동의 시)",
      ],
      certificate_distribution: "시상식 당일 직접 수여, 부재 시 우편 발송",
      photo_documentation: "시상 순간 촬영, 수상자 개별 사진, 단체 사진",
    },
    follow_up_actions: [
      { action: "상금/기념품 지급 처리", timeline: "D+3", responsible: "HR 담당" },
      { action: "수상자 프로필 업데이트", timeline: "D+5", responsible: "HR 담당" },
      { action: "감사 메시지 발송", timeline: "D+1", responsible: "운영 총괄" },
      { action: "우수 인재 풀 등록", timeline: "D+7", responsible: "HR 담당" },
    ],
  };
}

export const HR_031_StaffRecognition = {
  id: "HR-031",
  name: "Staff Recognition Program",
  description: "스태프 인정 및 포상 프로그램",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.16",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_031_InputSchema,
  outputSchema: HR_031_OutputSchema,
  persona: `당신은 인사 포상 전문가입니다. 공정하고 의미 있는 인정 프로그램으로 스태프 동기를 부여하고 우수 인재를 발굴합니다.`,
};

export default HR_031_StaffRecognition;
