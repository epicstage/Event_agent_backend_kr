/**
 * HR-017: Interview Management
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 면접 프로세스 관리
 */

import { z } from "zod";

export const HR_017_InputSchema = z.object({
  event_id: z.string().uuid(),
  interview_batch: z.string(),
  candidates_count: z.number(),
  interview_dates: z.array(z.string()),
  interview_format: z.enum(["individual", "group", "panel", "video"]).default("group"),
  interviewers: z.array(z.string()),
});

export const HR_017_OutputSchema = z.object({
  event_id: z.string(),
  interview_plan: z.object({
    format: z.string(),
    total_slots: z.number(),
    candidates_per_slot: z.number(),
    duration_per_slot: z.number(),
  }),
  schedule: z.array(z.object({
    date: z.string(),
    time_slots: z.array(z.object({
      time: z.string(),
      interviewer: z.string(),
      capacity: z.number(),
    })),
  })),
  evaluation_form: z.object({
    categories: z.array(z.object({
      name: z.string(),
      weight: z.number(),
      criteria: z.array(z.string()),
    })),
    rating_scale: z.array(z.object({
      score: z.number(),
      description: z.string(),
    })),
  }),
  logistics: z.object({
    venue: z.string(),
    materials_needed: z.array(z.string()),
    preparation_checklist: z.array(z.string()),
  }),
});

export type HR_017_Input = z.infer<typeof HR_017_InputSchema>;
export type HR_017_Output = z.infer<typeof HR_017_OutputSchema>;

export async function execute(input: HR_017_Input): Promise<HR_017_Output> {
  const candidatesPerSlot = input.interview_format === "group" ? 5 : input.interview_format === "panel" ? 1 : 1;
  const durationPerSlot = input.interview_format === "group" ? 40 : 20;
  const slotsNeeded = Math.ceil(input.candidates_count / candidatesPerSlot);
  const slotsPerDay = Math.ceil(slotsNeeded / input.interview_dates.length);

  const schedule = input.interview_dates.map((date) => {
    const timeSlots = [];
    let hour = 10;
    for (let i = 0; i < slotsPerDay && timeSlots.length < slotsPerDay; i++) {
      timeSlots.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        interviewer: input.interviewers[i % input.interviewers.length],
        capacity: candidatesPerSlot,
      });
      hour += Math.ceil(durationPerSlot / 60) + (hour === 12 ? 1 : 0);
      if (hour >= 18) break;
    }
    return { date, time_slots: timeSlots };
  });

  return {
    event_id: input.event_id,
    interview_plan: {
      format: input.interview_format,
      total_slots: slotsNeeded,
      candidates_per_slot: candidatesPerSlot,
      duration_per_slot: durationPerSlot,
    },
    schedule,
    evaluation_form: {
      categories: [
        { name: "첫인상/태도", weight: 20, criteria: ["복장", "시간 엄수", "예의", "적극성"] },
        { name: "의사소통", weight: 25, criteria: ["명확한 표현", "경청", "질문 이해도", "논리성"] },
        { name: "서비스 마인드", weight: 25, criteria: ["고객 중심 사고", "문제 해결 의지", "친절함"] },
        { name: "팀워크", weight: 15, criteria: ["협력 자세", "타인 존중", "유연성"] },
        { name: "직무 적합성", weight: 15, criteria: ["관련 경험", "가용성", "동기 부여"] },
      ],
      rating_scale: [
        { score: 1, description: "부적합 - 기본 기준 미달" },
        { score: 2, description: "미흡 - 개선 필요" },
        { score: 3, description: "보통 - 기준 충족" },
        { score: 4, description: "우수 - 기대 이상" },
        { score: 5, description: "탁월 - 강력 추천" },
      ],
    },
    logistics: {
      venue: "면접장 (회의실 또는 온라인)",
      materials_needed: [
        "지원자 명단 및 이력서",
        "평가지 (인쇄본 또는 태블릿)",
        "볼펜/필기구",
        "행사 소개 자료",
        "질문 리스트",
        "타이머",
      ],
      preparation_checklist: [
        "면접장 환경 점검 (조명, 온도, 의자)",
        "면접관 사전 미팅 (기준 통일)",
        "지원자 안내 문자/이메일 발송",
        "대기 공간 준비",
        "음료/간식 준비",
        "평가지 출력 또는 시스템 준비",
      ],
    },
  };
}

export const HR_017_InterviewManagement = {
  id: "HR-017",
  name: "Interview Management",
  description: "면접 프로세스 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.2",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_017_InputSchema,
  outputSchema: HR_017_OutputSchema,
  persona: `당신은 면접 관리 전문가입니다. 공정하고 효율적인 면접 프로세스를 운영하여 적합한 인재를 선별합니다.`,
};

export default HR_017_InterviewManagement;
