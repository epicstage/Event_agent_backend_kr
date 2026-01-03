/**
 * SITE-008: 셋업 일정 관리
 * CMP-IS Reference: 15.5.a - Setup schedule management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Setup Scheduler.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_start_date: z.string(),
  setup_days_available: z.number(),
  tasks: z.array(z.object({
    task_name: z.string(),
    category: z.string(),
    duration_hours: z.number(),
    dependencies: z.array(z.string()).optional(),
    team: z.string().optional(),
  })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  schedule_id: z.string(),
  event_id: z.string(),
  setup_timeline: z.array(z.object({ day: z.number(), date: z.string(), tasks: z.array(z.object({ task: z.string(), start: z.string(), end: z.string(), team: z.string() })) })),
  critical_path: z.array(z.string()),
  total_hours: z.number(),
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
  const totalHours = validatedInput.tasks.reduce((sum, t) => sum + t.duration_hours, 0);
  const hoursPerDay = 10;
  const eventDate = new Date(validatedInput.event_start_date);

  const timeline = [];
  let currentHour = 0;
  for (let day = 1; day <= validatedInput.setup_days_available; day++) {
    const setupDate = new Date(eventDate);
    setupDate.setDate(setupDate.getDate() - (validatedInput.setup_days_available - day + 1));
    const dayTasks = [];
    let dayHours = 0;
    for (const task of validatedInput.tasks) {
      if (dayHours + task.duration_hours <= hoursPerDay && currentHour < totalHours) {
        dayTasks.push({
          task: task.task_name,
          start: `${8 + dayHours}:00`,
          end: `${8 + dayHours + task.duration_hours}:00`,
          team: task.team || "TBD",
        });
        dayHours += task.duration_hours;
        currentHour += task.duration_hours;
      }
    }
    timeline.push({ day, date: setupDate.toISOString().split("T")[0], tasks: dayTasks });
  }

  return {
    schedule_id: generateUUID(),
    event_id: validatedInput.event_id,
    setup_timeline: timeline,
    critical_path: validatedInput.tasks.filter(t => t.dependencies?.length).map(t => t.task_name),
    total_hours: totalHours,
    recommendations: ["여유 시간 20% 확보 권장", "의존성 있는 작업 우선 배치"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-008",
  taskName: "셋업 일정 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.5.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.5: Setup & Teardown",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
