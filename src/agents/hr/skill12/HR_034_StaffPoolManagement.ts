/**
 * HR-034: Staff Pool Management
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 인력풀 관리 및 유지
 */

import { z } from "zod";

export const HR_034_InputSchema = z.object({
  organization_id: z.string(),
  staff_pool: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    contact: z.object({
      phone: z.string(),
      email: z.string(),
    }),
    skills: z.array(z.string()),
    certifications: z.array(z.string()).optional(),
    experience: z.object({
      events_worked: z.number(),
      total_hours: z.number(),
      avg_rating: z.number(),
    }),
    availability: z.object({
      weekdays: z.boolean(),
      weekends: z.boolean(),
      holidays: z.boolean(),
      regions: z.array(z.string()),
    }),
    last_event_date: z.string().optional(),
    status: z.enum(["active", "inactive", "blacklisted"]),
  })),
  upcoming_events: z.array(z.object({
    event_id: z.string(),
    name: z.string(),
    date: z.string(),
    location: z.string(),
    required_skills: z.array(z.string()),
    headcount_needed: z.number(),
  })),
});

export const HR_034_OutputSchema = z.object({
  pool_overview: z.object({
    total_members: z.number(),
    active_members: z.number(),
    inactive_members: z.number(),
    avg_experience_events: z.number(),
    avg_rating: z.number(),
  }),
  skill_distribution: z.array(z.object({
    skill: z.string(),
    count: z.number(),
    percentage: z.number(),
    demand_match: z.enum(["surplus", "balanced", "shortage"]),
  })),
  member_segments: z.array(z.object({
    segment: z.string(),
    count: z.number(),
    characteristics: z.array(z.string()),
    engagement_strategy: z.string(),
  })),
  availability_analysis: z.object({
    weekday_available: z.number(),
    weekend_available: z.number(),
    holiday_available: z.number(),
    regional_coverage: z.array(z.object({
      region: z.string(),
      staff_count: z.number(),
    })),
  }),
  event_matching: z.array(z.object({
    event_name: z.string(),
    event_date: z.string(),
    required: z.number(),
    available_matches: z.number(),
    match_rate: z.number(),
    skill_gaps: z.array(z.string()),
  })),
  engagement_recommendations: z.array(z.object({
    segment: z.string(),
    action: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    expected_outcome: z.string(),
  })),
  retention_metrics: z.object({
    at_risk_members: z.number(),
    dormant_members: z.number(),
    reactivation_targets: z.array(z.object({
      staff_id: z.string(),
      name: z.string(),
      last_active: z.string(),
      value_score: z.number(),
    })),
  }),
  pool_health_score: z.object({
    overall: z.number(),
    skill_coverage: z.number(),
    availability: z.number(),
    quality: z.number(),
    engagement: z.number(),
  }),
});

export type HR_034_Input = z.infer<typeof HR_034_InputSchema>;
export type HR_034_Output = z.infer<typeof HR_034_OutputSchema>;

export async function execute(input: HR_034_Input): Promise<HR_034_Output> {
  const activeMembers = input.staff_pool.filter((s) => s.status === "active");
  const inactiveMembers = input.staff_pool.filter((s) => s.status === "inactive");

  const avgEvents = Math.round(
    activeMembers.reduce((sum, s) => sum + s.experience.events_worked, 0) / activeMembers.length
  );
  const avgRating = Math.round(
    (activeMembers.reduce((sum, s) => sum + s.experience.avg_rating, 0) / activeMembers.length) * 10
  ) / 10;

  // 스킬 분포 분석
  const allSkills = input.staff_pool.flatMap((s) => s.skills);
  const skillCounts: Record<string, number> = {};
  for (const skill of allSkills) {
    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
  }

  const requiredSkills = input.upcoming_events.flatMap((e) => e.required_skills);
  const requiredSkillCounts: Record<string, number> = {};
  for (const skill of requiredSkills) {
    requiredSkillCounts[skill] = (requiredSkillCounts[skill] || 0) + 1;
  }

  const skillDistribution = Object.entries(skillCounts).map(([skill, count]) => {
    const demand = requiredSkillCounts[skill] || 0;
    let demandMatch: "surplus" | "balanced" | "shortage" = "balanced";
    if (count > demand * 2) demandMatch = "surplus";
    else if (count < demand * 0.8) demandMatch = "shortage";

    return {
      skill,
      count,
      percentage: Math.round((count / input.staff_pool.length) * 100),
      demand_match: demandMatch,
    };
  }).sort((a, b) => b.count - a.count);

  // 멤버 세그먼트
  const segments = [
    {
      segment: "베테랑 (10+ 행사)",
      count: activeMembers.filter((s) => s.experience.events_worked >= 10).length,
      characteristics: ["높은 경험치", "다양한 스킬", "자율적 업무 수행"],
      engagement_strategy: "리더 역할 부여, 멘토링 기회 제공",
    },
    {
      segment: "경험자 (3-9 행사)",
      count: activeMembers.filter((s) => s.experience.events_worked >= 3 && s.experience.events_worked < 10).length,
      characteristics: ["안정적 수행 능력", "성장 의지"],
      engagement_strategy: "스킬 향상 교육, 다양한 역할 경험 기회",
    },
    {
      segment: "신규 (1-2 행사)",
      count: activeMembers.filter((s) => s.experience.events_worked < 3).length,
      characteristics: ["학습 의지", "멘토 필요"],
      engagement_strategy: "버디 시스템 배정, 체계적 온보딩",
    },
    {
      segment: "휴면",
      count: inactiveMembers.length,
      characteristics: ["6개월 이상 미참여"],
      engagement_strategy: "재활성화 연락, 인센티브 제공",
    },
  ];

  // 가용성 분석
  const availabilityAnalysis = {
    weekday_available: activeMembers.filter((s) => s.availability.weekdays).length,
    weekend_available: activeMembers.filter((s) => s.availability.weekends).length,
    holiday_available: activeMembers.filter((s) => s.availability.holidays).length,
    regional_coverage: [...new Set(activeMembers.flatMap((s) => s.availability.regions))].map((region) => ({
      region,
      staff_count: activeMembers.filter((s) => s.availability.regions.includes(region)).length,
    })),
  };

  // 이벤트 매칭
  const eventMatching = input.upcoming_events.map((event) => {
    const matchingStaff = activeMembers.filter((s) =>
      event.required_skills.some((skill) => s.skills.includes(skill)) &&
      s.availability.regions.includes(event.location.split(" ")[0])
    );

    const skillGaps = event.required_skills.filter(
      (skill) => !skillDistribution.find((sd) => sd.skill === skill && sd.count >= 5)
    );

    return {
      event_name: event.name,
      event_date: event.date,
      required: event.headcount_needed,
      available_matches: matchingStaff.length,
      match_rate: Math.round((matchingStaff.length / event.headcount_needed) * 100),
      skill_gaps: skillGaps,
    };
  });

  // 참여 권장사항
  const recommendations = [
    {
      segment: "휴면 멤버",
      action: "재활성화 캠페인 실행",
      priority: "high" as const,
      expected_outcome: "휴면 멤버 30% 재활성화",
    },
    {
      segment: "베테랑",
      action: "리더 인증 프로그램 도입",
      priority: "medium" as const,
      expected_outcome: "리텐션 향상 및 신규 멤버 교육 품질 개선",
    },
    {
      segment: "신규",
      action: "첫 행사 후 피드백 세션",
      priority: "medium" as const,
      expected_outcome: "재참여율 40% 향상",
    },
  ];

  if (skillDistribution.some((s) => s.demand_match === "shortage")) {
    recommendations.push({
      segment: "전체",
      action: "부족 스킬 교육 프로그램 개설",
      priority: "high" as const,
      expected_outcome: "스킬 갭 해소",
    });
  }

  // 리텐션 메트릭
  const dormantThreshold = new Date();
  dormantThreshold.setMonth(dormantThreshold.getMonth() - 6);

  const reactivationTargets = inactiveMembers
    .filter((s) => s.experience.avg_rating >= 4)
    .slice(0, 5)
    .map((s) => ({
      staff_id: s.staff_id,
      name: s.name,
      last_active: s.last_event_date || "정보 없음",
      value_score: Math.round(s.experience.avg_rating * 10 + s.experience.events_worked * 5),
    }));

  // 풀 건강도 점수
  const skillCoverageScore = Math.min(100, Math.round((skillDistribution.filter((s) => s.demand_match !== "shortage").length / skillDistribution.length) * 100));
  const availabilityScore = Math.min(100, Math.round(((availabilityAnalysis.weekday_available + availabilityAnalysis.weekend_available) / (activeMembers.length * 2)) * 100));
  const qualityScore = Math.min(100, Math.round(avgRating * 20));
  const engagementScore = Math.min(100, Math.round((activeMembers.length / input.staff_pool.length) * 100));
  const overallScore = Math.round((skillCoverageScore + availabilityScore + qualityScore + engagementScore) / 4);

  return {
    pool_overview: {
      total_members: input.staff_pool.length,
      active_members: activeMembers.length,
      inactive_members: inactiveMembers.length,
      avg_experience_events: avgEvents,
      avg_rating: avgRating,
    },
    skill_distribution: skillDistribution.slice(0, 10),
    member_segments: segments,
    availability_analysis: availabilityAnalysis,
    event_matching: eventMatching,
    engagement_recommendations: recommendations,
    retention_metrics: {
      at_risk_members: activeMembers.filter((s) => s.experience.avg_rating < 3.5).length,
      dormant_members: inactiveMembers.length,
      reactivation_targets: reactivationTargets,
    },
    pool_health_score: {
      overall: overallScore,
      skill_coverage: skillCoverageScore,
      availability: availabilityScore,
      quality: qualityScore,
      engagement: engagementScore,
    },
  };
}

export const HR_034_StaffPoolManagement = {
  id: "HR-034",
  name: "Staff Pool Management",
  description: "인력풀 관리 및 유지",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.19",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_034_InputSchema,
  outputSchema: HR_034_OutputSchema,
  persona: `당신은 인재 풀 관리 전문가입니다. 장기적 인력 확보와 유지를 통해 안정적인 행사 운영을 지원합니다.`,
};

export default HR_034_StaffPoolManagement;
