/**
 * SITE-039: 숙박 기술 통합
 * CMP-IS Reference: 16.13.a - Housing technology integration
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Technology Integration Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  registration_system: z.object({
    system_name: z.string(),
    api_available: z.boolean(),
    data_fields: z.array(z.string()),
  }),
  hotel_systems: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    pms_system: z.string(),
    integration_type: z.enum(["api", "file_transfer", "manual"]),
  })),
  required_integrations: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  integration_plan_id: z.string(),
  event_id: z.string(),
  system_mapping: z.object({
    registration_to_housing: z.array(z.object({ source_field: z.string(), target_field: z.string(), mapping_type: z.string() })),
    housing_to_hotel: z.array(z.object({ data_type: z.string(), format: z.string(), frequency: z.string() })),
  }),
  hotel_integrations: z.array(z.object({
    hotel_name: z.string(),
    integration_status: z.string(),
    method: z.string(),
    automation_level: z.number(),
    setup_tasks: z.array(z.string()),
  })),
  data_flow: z.object({ real_time_sync: z.boolean(), batch_frequency: z.string(), error_handling: z.string() }),
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

  const fieldMappings = validatedInput.registration_system.data_fields.map(f => ({
    source_field: f,
    target_field: f.toLowerCase().replace(/ /g, "_"),
    mapping_type: "direct",
  }));

  const hotelIntegrations = validatedInput.hotel_systems.map(h => ({
    hotel_name: h.hotel_name,
    integration_status: h.integration_type === "api" ? "automated" : h.integration_type === "file_transfer" ? "semi_automated" : "manual",
    method: h.integration_type,
    automation_level: h.integration_type === "api" ? 90 : h.integration_type === "file_transfer" ? 60 : 20,
    setup_tasks: h.integration_type === "api"
      ? ["API 키 발급", "엔드포인트 설정", "테스트 데이터 전송"]
      : h.integration_type === "file_transfer"
        ? ["SFTP 계정 설정", "파일 형식 합의", "전송 스케줄 설정"]
        : ["담당자 연락처 확보", "엑셀 템플릿 생성", "업데이트 주기 합의"],
  }));

  const hasApiIntegration = validatedInput.registration_system.api_available;
  const hotelApiCount = validatedInput.hotel_systems.filter(h => h.integration_type === "api").length;

  return {
    integration_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    system_mapping: {
      registration_to_housing: fieldMappings,
      housing_to_hotel: [
        { data_type: "rooming_list", format: "CSV/JSON", frequency: "daily" },
        { data_type: "modifications", format: "JSON", frequency: "real_time" },
        { data_type: "cancellations", format: "JSON", frequency: "real_time" },
      ],
    },
    hotel_integrations: hotelIntegrations,
    data_flow: {
      real_time_sync: hasApiIntegration && hotelApiCount > 0,
      batch_frequency: "매일 06:00, 18:00",
      error_handling: "자동 재시도 3회 후 알림",
    },
    recommendations: [
      hotelApiCount < validatedInput.hotel_systems.length ? "API 미지원 호텔 자동화 개선 검토" : "",
      !hasApiIntegration ? "등록 시스템 API 연동 권장" : "",
      "데이터 검증 로직 구현 권장",
    ].filter(Boolean),
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-039",
  taskName: "숙박 기술 통합",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.13.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.13: Technology Integration",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
