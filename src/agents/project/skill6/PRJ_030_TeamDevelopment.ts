/**
 * PRJ-030: 팀 개발
 * CMP-IS Reference: 6.2.f - Developing project team
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Team Development Agent for event projects.
CMP-IS Standard: 6.2.f - Developing project team`;

export const InputSchema = z.object({
  event_id: z.string(),
  team_members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    experience_level: z.enum(["junior", "mid", "senior"]),
    current_skills: z.array(z.string()),
    development_goals: z.array(z.string()).optional(),
    performance_rating: z.number().min(1).max(5).optional(),
  })),
  project_requirements: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  team_assessment: z.object({
    total_members: z.number(),
    skill_coverage: z.number(),
    experience_distribution: z.object({
      junior: z.number(),
      mid: z.number(),
      senior: z.number(),
    }),
    team_maturity: z.enum(["forming", "storming", "norming", "performing"]),
  }),
  skill_gap_analysis: z.array(z.object({
    skill: z.string(),
    current_level: z.enum(["none", "basic", "intermediate", "advanced"]),
    required_level: z.enum(["basic", "intermediate", "advanced", "expert"]),
    gap: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  development_plans: z.array(z.object({
    member_id: z.string(),
    member_name: z.string(),
    focus_areas: z.array(z.string()),
    training_recommendations: z.array(z.object({
      training: z.string(),
      type: z.enum(["on_the_job", "workshop", "course", "mentoring"]),
      timeline: z.string(),
    })),
    mentoring_pair: z.string().optional(),
  })),
  team_building_activities: z.array(z.object({
    activity: z.string(),
    objective: z.string(),
    timing: z.string(),
    budget_estimate: z.string(),
  })),
  recommendations: z.array(z.string()),
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
  const { team_members, project_requirements } = validatedInput;

  // 경험 분포
  const expDist = { junior: 0, mid: 0, senior: 0 };
  team_members.forEach(m => expDist[m.experience_level]++);

  // 팀 성숙도 판단
  const seniorRatio = expDist.senior / team_members.length;
  const teamMaturity = seniorRatio >= 0.5 ? "performing" :
    seniorRatio >= 0.3 ? "norming" :
    seniorRatio >= 0.1 ? "storming" : "forming";

  // 스킬 갭 분석
  const requiredSkills = project_requirements || ["프로젝트 관리", "커뮤니케이션", "문제 해결", "벤더 관리"];
  const allSkills = team_members.flatMap(m => m.current_skills);

  const skillGapAnalysis = requiredSkills.map(skill => {
    const hasSkill = allSkills.filter(s => s.toLowerCase().includes(skill.toLowerCase())).length;
    const coverage = hasSkill / team_members.length;

    return {
      skill,
      current_level: coverage >= 0.7 ? "advanced" as const : coverage >= 0.4 ? "intermediate" as const : coverage > 0 ? "basic" as const : "none" as const,
      required_level: "intermediate" as const,
      gap: coverage >= 0.5 ? "없음" : coverage > 0 ? "부분적" : "전체",
      priority: coverage < 0.3 ? "high" as const : coverage < 0.6 ? "medium" as const : "low" as const,
    };
  });

  // 개발 계획
  const seniors = team_members.filter(m => m.experience_level === "senior");
  const developmentPlans = team_members.map(member => {
    const focusAreas = member.development_goals || ["역량 강화", "협업 능력"];
    const mentor = seniors.find(s => s.id !== member.id);

    return {
      member_id: member.id,
      member_name: member.name,
      focus_areas: focusAreas,
      training_recommendations: [
        {
          training: `${focusAreas[0]} 워크샵`,
          type: "workshop" as const,
          timeline: "1개월 내",
        },
        {
          training: "실무 경험 확대",
          type: "on_the_job" as const,
          timeline: "지속적",
        },
      ],
      mentoring_pair: member.experience_level === "junior" && mentor ? mentor.name : undefined,
    };
  });

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    team_assessment: {
      total_members: team_members.length,
      skill_coverage: Math.round(skillGapAnalysis.filter(s => s.gap === "없음").length / skillGapAnalysis.length * 100),
      experience_distribution: expDist,
      team_maturity: teamMaturity,
    },
    skill_gap_analysis: skillGapAnalysis,
    development_plans: developmentPlans,
    team_building_activities: [
      {
        activity: "킥오프 팀빌딩",
        objective: "팀 결속력 강화 및 목표 공유",
        timing: "프로젝트 초기",
        budget_estimate: "인당 50,000원",
      },
      {
        activity: "중간 회식/워크샵",
        objective: "사기 진작 및 피드백 공유",
        timing: "프로젝트 중간",
        budget_estimate: "인당 80,000원",
      },
      {
        activity: "성공 축하 행사",
        objective: "성과 인정 및 동기부여",
        timing: "프로젝트 종료",
        budget_estimate: "인당 100,000원",
      },
    ],
    recommendations: [
      teamMaturity !== "performing" ? "팀 성숙도 향상 프로그램 운영" : "현재 팀 역량 유지",
      skillGapAnalysis.filter(s => s.priority === "high").length > 0 ? "핵심 스킬 교육 시급" : "스킬 유지 및 향상",
      expDist.junior > expDist.senior ? "멘토링 프로그램 강화" : "지식 전수 체계화",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-030",
  taskName: "팀 개발",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.2.f",
  skill: "Skill 6: Manage Project",
  subSkill: "6.2: Coordinate Project Team",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
