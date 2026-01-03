/**
 * MTG-020: Program Analytics
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_020_InputSchema = z.object({
  event_id: z.string().uuid(),
  sessions: z.array(z.object({
    session_id: z.string(),
    title: z.string(),
    track: z.string(),
    registered: z.number(),
    attended: z.number(),
    rating: z.number().optional(),
    engagement_score: z.number().optional(),
  })),
  overall_registration: z.number(),
  overall_attendance: z.number(),
  survey_responses: z.number().optional(),
});

export const MTG_020_OutputSchema = z.object({
  event_id: z.string(),
  program_analytics: z.object({
    overall_metrics: z.object({
      total_sessions: z.number(),
      avg_attendance_rate: z.number(),
      avg_session_rating: z.number(),
      top_performing_track: z.string(),
    }),
    session_performance: z.array(z.object({
      session_id: z.string(),
      title: z.string(),
      attendance_rate: z.number(),
      rating: z.number(),
      performance_tier: z.enum(["top", "above_average", "average", "below_average"]),
    })),
    track_analysis: z.array(z.object({
      track: z.string(),
      session_count: z.number(),
      avg_attendance: z.number(),
      avg_rating: z.number(),
    })),
    insights: z.array(z.object({ insight: z.string(), evidence: z.string(), action: z.string() })),
  }),
  benchmarks: z.object({
    industry_comparison: z.record(z.object({ your_value: z.number(), benchmark: z.number(), status: z.string() })),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_020_Input = z.infer<typeof MTG_020_InputSchema>;
export type MTG_020_Output = z.infer<typeof MTG_020_OutputSchema>;

export async function execute(input: MTG_020_Input): Promise<MTG_020_Output> {
  const sessions = input.sessions;
  const totalSessions = sessions.length;

  const sessionPerformance = sessions.map(s => {
    const attendanceRate = s.registered > 0 ? (s.attended / s.registered) * 100 : 0;
    const rating = s.rating || 0;
    const tier = attendanceRate >= 80 && rating >= 4.5 ? "top" :
      attendanceRate >= 60 && rating >= 4.0 ? "above_average" :
      attendanceRate >= 40 && rating >= 3.5 ? "average" : "below_average";
    return { session_id: s.session_id, title: s.title, attendance_rate: Math.round(attendanceRate), rating, performance_tier: tier as any };
  });

  const avgAttendanceRate = sessions.reduce((sum, s) => sum + (s.registered > 0 ? s.attended / s.registered : 0), 0) / totalSessions * 100;
  const avgRating = sessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.filter(s => s.rating).length || 0;

  // Track analysis
  const tracks = [...new Set(sessions.map(s => s.track))];
  const trackAnalysis = tracks.map(track => {
    const trackSessions = sessions.filter(s => s.track === track);
    return {
      track,
      session_count: trackSessions.length,
      avg_attendance: Math.round(trackSessions.reduce((sum, s) => sum + s.attended, 0) / trackSessions.length),
      avg_rating: Math.round(trackSessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / trackSessions.filter(s => s.rating).length * 10) / 10 || 0,
    };
  }).sort((a, b) => b.avg_rating - a.avg_rating);

  const topTrack = trackAnalysis[0]?.track || "N/A";
  const overallAttendanceRate = input.overall_registration > 0 ? (input.overall_attendance / input.overall_registration) * 100 : 0;

  return {
    event_id: input.event_id,
    program_analytics: {
      overall_metrics: {
        total_sessions: totalSessions,
        avg_attendance_rate: Math.round(avgAttendanceRate),
        avg_session_rating: Math.round(avgRating * 10) / 10,
        top_performing_track: topTrack,
      },
      session_performance: sessionPerformance.sort((a, b) => b.attendance_rate - a.attendance_rate),
      track_analysis: trackAnalysis,
      insights: [
        {
          insight: sessionPerformance.filter(s => s.performance_tier === "top").length >= 3 ? "Strong top performers cluster" : "Need more standout sessions",
          evidence: `${sessionPerformance.filter(s => s.performance_tier === "top").length} sessions in top tier`,
          action: "Replicate successful formats and speakers",
        },
        {
          insight: avgAttendanceRate < 60 ? "Attendance rate below target" : "Healthy attendance rates",
          evidence: `${Math.round(avgAttendanceRate)}% average session attendance`,
          action: avgAttendanceRate < 60 ? "Review scheduling conflicts and session marketing" : "Maintain current approach",
        },
      ],
    },
    benchmarks: {
      industry_comparison: {
        attendance_rate: { your_value: Math.round(overallAttendanceRate), benchmark: 75, status: overallAttendanceRate >= 75 ? "Above" : "Below" },
        session_rating: { your_value: Math.round(avgRating * 10) / 10, benchmark: 4.0, status: avgRating >= 4.0 ? "Above" : "Below" },
        survey_response_rate: {
          your_value: input.survey_responses ? Math.round((input.survey_responses / input.overall_attendance) * 100) : 0,
          benchmark: 30,
          status: (input.survey_responses || 0) / input.overall_attendance * 100 >= 30 ? "Above" : "Below"
        },
      },
    },
    recommendations: [
      "Double down on top-performing formats and topics",
      "Reduce parallel sessions if attendance is fragmented",
      "Collect more granular feedback for below-average sessions",
      "Use insights to guide next year's CFP criteria",
    ],
  };
}

export const MTG_020_ProgramAnalytics = {
  id: "MTG-020", name: "Program Analytics", description: "프로그램 분석",
  inputSchema: MTG_020_InputSchema, outputSchema: MTG_020_OutputSchema, execute,
  tags: ["analytics", "metrics", "performance"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
