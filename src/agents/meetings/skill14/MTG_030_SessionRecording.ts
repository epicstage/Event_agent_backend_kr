/**
 * MTG-030: Session Recording Management
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_030_InputSchema = z.object({
  event_id: z.string().uuid(),
  sessions_to_record: z.number(),
  recording_type: z.enum(["audio_only", "video_slides", "video_full", "multi_camera"]),
  live_streaming: z.boolean().default(false),
  post_production: z.enum(["none", "basic", "full"]).default("basic"),
  distribution_platforms: z.array(z.string()),
});

export const MTG_030_OutputSchema = z.object({
  event_id: z.string(),
  recording_plan: z.object({
    technical_setup: z.object({
      equipment: z.array(z.object({ item: z.string(), quantity: z.number(), purpose: z.string() })),
      crew: z.array(z.object({ role: z.string(), count: z.number() })),
      infrastructure: z.array(z.string()),
    }),
    workflow: z.array(z.object({ phase: z.string(), activities: z.array(z.string()), timeline: z.string() })),
    quality_standards: z.object({ video: z.string(), audio: z.string(), file_format: z.string() }),
  }),
  post_production: z.object({
    editing_tasks: z.array(z.object({ task: z.string(), time_per_session: z.string() })),
    deliverables: z.array(z.object({ format: z.string(), resolution: z.string(), use_case: z.string() })),
    timeline: z.string(),
  }),
  distribution: z.object({
    platforms: z.array(z.object({ platform: z.string(), format: z.string(), access: z.string() })),
    rights_management: z.array(z.string()),
  }),
  budget_estimate: z.object({ production: z.string(), post_production: z.string(), hosting: z.string() }),
  recommendations: z.array(z.string()),
});

export type MTG_030_Input = z.infer<typeof MTG_030_InputSchema>;
export type MTG_030_Output = z.infer<typeof MTG_030_OutputSchema>;

export async function execute(input: MTG_030_Input): Promise<MTG_030_Output> {
  const isMultiCam = input.recording_type === "multi_camera";
  const isVideoFull = input.recording_type === "video_full" || isMultiCam;

  return {
    event_id: input.event_id,
    recording_plan: {
      technical_setup: {
        equipment: [
          { item: isVideoFull ? "PTZ camera" : "Webcam/fixed camera", quantity: isMultiCam ? 3 : 1, purpose: "Video capture" },
          { item: "Lavalier microphone", quantity: 4, purpose: "Speaker audio" },
          { item: "Audio mixer", quantity: 1, purpose: "Audio management" },
          { item: "Recording workstation", quantity: 1, purpose: "Capture and encoding" },
          ...(input.live_streaming ? [{ item: "Streaming encoder", quantity: 1, purpose: "Live broadcast" }] : []),
        ],
        crew: [
          { role: "Recording technician", count: Math.ceil(input.sessions_to_record / 10) },
          { role: "Audio engineer", count: 1 },
          ...(isMultiCam ? [{ role: "Camera operator", count: 2 }] : []),
          ...(input.live_streaming ? [{ role: "Streaming director", count: 1 }] : []),
        ],
        infrastructure: [
          "Dedicated recording network",
          "Backup storage (minimum 2TB)",
          "UPS for power backup",
          ...(input.live_streaming ? ["Dedicated internet uplink (20+ Mbps)"] : []),
        ],
      },
      workflow: [
        { phase: "Pre-event", activities: ["Equipment setup", "Test recordings", "Crew briefing"], timeline: "Day before" },
        { phase: "During event", activities: ["Monitor recordings", "Swap media", "Troubleshoot issues"], timeline: "All session days" },
        { phase: "Post-event", activities: ["Collect all media", "Initial backup", "Quality check"], timeline: "Same day" },
      ],
      quality_standards: {
        video: isVideoFull ? "1080p 30fps H.264" : "720p 30fps",
        audio: "48kHz 16-bit stereo",
        file_format: "MP4 container",
      },
    },
    post_production: {
      editing_tasks: input.post_production === "none" ? [] : [
        { task: "Trim start/end", time_per_session: "15 min" },
        { task: "Add intro/outro", time_per_session: "10 min" },
        ...(input.post_production === "full" ? [
          { task: "Color correction", time_per_session: "20 min" },
          { task: "Audio leveling", time_per_session: "15 min" },
          { task: "Add lower thirds", time_per_session: "20 min" },
        ] : []),
      ],
      deliverables: [
        { format: "MP4", resolution: "1080p", use_case: "Main distribution" },
        { format: "MP4", resolution: "720p", use_case: "Mobile/bandwidth-limited" },
        { format: "MP3", resolution: "128kbps", use_case: "Audio-only/podcast" },
      ],
      timeline: input.post_production === "full" ? "4-6 weeks post-event" : "2 weeks post-event",
    },
    distribution: {
      platforms: input.distribution_platforms.map(p => ({
        platform: p,
        format: "MP4",
        access: "Authenticated attendees",
      })),
      rights_management: [
        "Speaker recording consent in contract",
        "Attendee notification of recording",
        "Clear usage rights for organization",
        "Consider Creative Commons licensing",
      ],
    },
    budget_estimate: {
      production: `$${input.sessions_to_record * (isMultiCam ? 500 : 200)} estimated`,
      post_production: input.post_production === "full" ? `$${input.sessions_to_record * 150}` : input.post_production === "basic" ? `$${input.sessions_to_record * 50}` : "$0",
      hosting: `$${Math.ceil(input.sessions_to_record * 2 / 100) * 100}/month for 1 year`,
    },
    recommendations: [
      "Get recording consent during registration",
      "Test all equipment day before",
      "Have backup recording solution",
      "Plan for quick turnaround on key sessions",
    ],
  };
}

export const MTG_030_SessionRecording = {
  id: "MTG-030", name: "Session Recording Management", description: "세션 녹화 관리",
  inputSchema: MTG_030_InputSchema, outputSchema: MTG_030_OutputSchema, execute,
  tags: ["recording", "video", "production"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
