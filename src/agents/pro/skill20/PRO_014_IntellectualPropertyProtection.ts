/**
 * PRO-014: 지적재산권 보호
 * CMP-IS Reference: 20.4.a - Intellectual property protection management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Intellectual Property Protection Specialist for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  ip_types: z.array(z.enum(["trademark", "copyright", "patent", "trade_secret", "licensing"])).optional(),
  content_review_scope: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  ip_report_id: z.string(),
  event_id: z.string(),
  ip_overview: z.object({
    total_ip_assets: z.number(),
    protected_assets: z.number(),
    pending_protection: z.number(),
    risk_items: z.number(),
    compliance_score: z.number(),
  }),
  owned_ip: z.array(z.object({
    asset_name: z.string(),
    ip_type: z.string(),
    registration_status: z.enum(["registered", "pending", "unregistered"]),
    registration_number: z.string(),
    expiry_date: z.string(),
    protection_scope: z.string(),
  })),
  licensed_content: z.array(z.object({
    content_type: z.string(),
    source: z.string(),
    license_type: z.enum(["exclusive", "non_exclusive", "royalty_free", "creative_commons"]),
    usage_rights: z.array(z.string()),
    restrictions: z.array(z.string()),
    license_period: z.object({
      start: z.string(),
      end: z.string(),
    }),
    fee_status: z.enum(["paid", "pending", "not_applicable"]),
  })),
  content_review: z.array(z.object({
    content_item: z.string(),
    content_type: z.string(),
    ip_clearance_status: z.enum(["cleared", "pending", "issue_found"]),
    issues: z.array(z.string()),
    recommendation: z.string(),
  })),
  third_party_ip: z.array(z.object({
    ip_owner: z.string(),
    ip_type: z.string(),
    usage_context: z.string(),
    permission_status: z.enum(["obtained", "pending", "denied", "not_required"]),
    agreement_reference: z.string(),
  })),
  risk_assessment: z.array(z.object({
    risk_area: z.string(),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    description: z.string(),
    mitigation_action: z.string(),
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

  return {
    ip_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    ip_overview: {
      total_ip_assets: 25,
      protected_assets: 20,
      pending_protection: 3,
      risk_items: 2,
      compliance_score: 88,
    },
    owned_ip: [
      {
        asset_name: "이벤트 로고",
        ip_type: "상표",
        registration_status: "registered",
        registration_number: "KR-TM-2024-12345",
        expiry_date: "2034-06-15",
        protection_scope: "국내 및 중국, 일본",
      },
      {
        asset_name: "이벤트 슬로건",
        ip_type: "상표",
        registration_status: "pending",
        registration_number: "-",
        expiry_date: "-",
        protection_scope: "국내 출원 중",
      },
      {
        asset_name: "참가자 앱 소스코드",
        ip_type: "저작권",
        registration_status: "registered",
        registration_number: "C-2024-56789",
        expiry_date: "저작자 사후 70년",
        protection_scope: "전 세계",
      },
    ],
    licensed_content: [
      {
        content_type: "배경 음악",
        source: "Epidemic Sound",
        license_type: "non_exclusive",
        usage_rights: ["행사장 재생", "스트리밍", "녹화본 포함"],
        restrictions: ["재판매 금지", "광고 사용 금지"],
        license_period: { start: "2025-01-01", end: "2025-12-31" },
        fee_status: "paid",
      },
      {
        content_type: "스톡 이미지",
        source: "Shutterstock",
        license_type: "royalty_free",
        usage_rights: ["마케팅 자료", "웹사이트", "인쇄물"],
        restrictions: ["에디토리얼 전용 이미지 상업 사용 불가"],
        license_period: { start: "2025-01-01", end: "2025-06-30" },
        fee_status: "paid",
      },
      {
        content_type: "발표 자료 템플릿",
        source: "Envato Elements",
        license_type: "non_exclusive",
        usage_rights: ["연사 발표용", "배포 가능"],
        restrictions: ["재판매 금지", "템플릿 그대로 배포 금지"],
        license_period: { start: "2025-01-01", end: "2025-12-31" },
        fee_status: "paid",
      },
    ],
    content_review: [
      {
        content_item: "오프닝 영상",
        content_type: "비디오",
        ip_clearance_status: "cleared",
        issues: [],
        recommendation: "사용 가능",
      },
      {
        content_item: "연사 A 발표자료",
        content_type: "프레젠테이션",
        ip_clearance_status: "pending",
        issues: ["출처 불명 이미지 3건"],
        recommendation: "연사에게 출처 확인 및 라이선스 증빙 요청",
      },
      {
        content_item: "스폰서 B 홍보영상",
        content_type: "비디오",
        ip_clearance_status: "issue_found",
        issues: ["저작권 있는 배경음악 사용", "연예인 초상권 미확인"],
        recommendation: "스폰서에게 라이선스 증빙 요청, 미제출 시 상영 불가",
      },
    ],
    third_party_ip: [
      { ip_owner: "연사 C", ip_type: "저작권", usage_context: "발표 영상 녹화 및 배포", permission_status: "obtained", agreement_reference: "연사 계약서 제7조" },
      { ip_owner: "스폰서 D", ip_type: "상표", usage_context: "로고 사용", permission_status: "obtained", agreement_reference: "스폰서 계약서 별첨" },
      { ip_owner: "사진작가 E", ip_type: "저작권", usage_context: "행사 사진 2차 사용", permission_status: "pending", agreement_reference: "-" },
    ],
    risk_assessment: [
      {
        risk_area: "스폰서 홍보물",
        risk_level: "high",
        description: "스폰서 B 홍보영상 저작권 미확인",
        mitigation_action: "라이선스 증빙 미제출 시 상영 중단",
      },
      {
        risk_area: "연사 발표자료",
        risk_level: "medium",
        description: "일부 연사 자료 출처 불명확",
        mitigation_action: "발표 전 검토 완료 및 수정 요청",
      },
    ],
    recommendations: [
      "스폰서 B 홍보영상 라이선스 증빙 긴급 요청",
      "사진작가 E와 2차 사용권 계약 체결",
      "연사 발표자료 IP 체크리스트 배포 및 사전 검토 강화",
      "이벤트 슬로건 상표 등록 진행 상황 확인",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-014",
  taskName: "지적재산권 보호",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 20.4.a",
  skill: "Skill 20: Legal Compliance & Professional Development",
  subSkill: "20.4: Intellectual Property",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
