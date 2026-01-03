/**
 * FIN-058: 결제 처리 시스템 설정
 *
 * CMP-IS Reference: 9.1.a
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Payment Processing Setup.
CMP-IS Standard: 9.1.a - Setting up payment processing systems (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  expected_transaction_volume: z.object({
    total_transactions: z.number().int(),
    average_transaction_value: z.number(),
    peak_transactions_per_hour: z.number().int(),
  }),
  payment_methods_required: z.array(z.enum([
    "credit_card", "debit_card", "bank_transfer", "paypal",
    "apple_pay", "google_pay", "cash", "check", "wire_transfer",
  ])),
  currencies_needed: z.array(CurrencyCode),
  primary_currency: CurrencyCode.default("USD"),
  security_requirements: z.object({
    pci_compliance_level: z.enum(["level_1", "level_2", "level_3", "level_4"]),
    require_3ds: z.boolean(),
    fraud_detection: z.boolean(),
  }),
  integration_requirements: z.object({
    registration_platform: z.string(),
    accounting_system: z.string().optional(),
    crm_system: z.string().optional(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  setup_id: z.string().uuid(),
  event_id: z.string().uuid(),
  processor_recommendations: z.array(z.object({
    processor_name: z.string(),
    suitability_score: z.number(),
    supported_methods: z.array(z.string()),
    transaction_fees: z.object({
      percentage: z.number(),
      fixed_fee: z.number(),
      monthly_fee: z.number(),
    }),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    integration_complexity: z.enum(["low", "medium", "high"]),
  })),
  selected_configuration: z.object({
    primary_processor: z.string(),
    backup_processor: z.string().optional(),
    payment_methods: z.array(z.object({
      method: z.string(),
      processor: z.string(),
      enabled: z.boolean(),
    })),
    currency_handling: z.object({
      base_currency: z.string(),
      supported_currencies: z.array(z.string()),
      conversion_handling: z.string(),
    }),
  }),
  security_setup: z.object({
    pci_compliance_steps: z.array(z.object({
      step: z.string(),
      status: z.enum(["pending", "in_progress", "complete"]),
      deadline: z.string(),
    })),
    fraud_prevention_measures: z.array(z.string()),
    data_protection_measures: z.array(z.string()),
  }),
  integration_plan: z.object({
    technical_requirements: z.array(z.string()),
    api_endpoints: z.array(z.object({
      purpose: z.string(),
      endpoint: z.string(),
      method: z.string(),
    })),
    testing_checklist: z.array(z.object({
      test_case: z.string(),
      priority: z.enum(["critical", "high", "medium"]),
    })),
  }),
  cost_estimate: z.object({
    setup_costs: z.number(),
    estimated_processing_fees: z.number(),
    monthly_fees: z.number(),
    total_estimated_cost: z.number(),
  }),
  implementation_timeline: z.array(z.object({
    phase: z.string(),
    tasks: z.array(z.string()),
    duration_days: z.number().int(),
    dependencies: z.array(z.string()),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalVolume = validated.expected_transaction_volume.total_transactions *
    validated.expected_transaction_volume.average_transaction_value;

  const processorRecommendations = [
    {
      processor_name: "Stripe",
      suitability_score: 92,
      supported_methods: ["credit_card", "debit_card", "apple_pay", "google_pay"],
      transaction_fees: {
        percentage: 2.9,
        fixed_fee: 0.30,
        monthly_fee: 0,
      },
      pros: ["쉬운 통합", "우수한 문서화", "강력한 사기 탐지"],
      cons: ["높은 거래 수수료", "일부 지역 제한"],
      integration_complexity: "low" as const,
    },
    {
      processor_name: "PayPal",
      suitability_score: 85,
      supported_methods: ["paypal", "credit_card", "debit_card"],
      transaction_fees: {
        percentage: 2.9,
        fixed_fee: 0.30,
        monthly_fee: 0,
      },
      pros: ["높은 브랜드 인지도", "구매자 보호", "글로벌 지원"],
      cons: ["분쟁 처리 복잡", "일부 결제 지연"],
      integration_complexity: "low" as const,
    },
    {
      processor_name: "Square",
      suitability_score: 78,
      supported_methods: ["credit_card", "debit_card", "cash"],
      transaction_fees: {
        percentage: 2.6,
        fixed_fee: 0.10,
        monthly_fee: 0,
      },
      pros: ["현장 결제 강점", "POS 통합", "간단한 설정"],
      cons: ["온라인 기능 제한", "대량 처리 한계"],
      integration_complexity: "medium" as const,
    },
  ];

  const estimatedFees = totalVolume * 0.029 + validated.expected_transaction_volume.total_transactions * 0.30;

  const output: Output = {
    setup_id: generateUUID(),
    event_id: validated.event_id,
    processor_recommendations: processorRecommendations,
    selected_configuration: {
      primary_processor: "Stripe",
      backup_processor: "PayPal",
      payment_methods: validated.payment_methods_required.map(method => ({
        method,
        processor: method === "paypal" ? "PayPal" : "Stripe",
        enabled: true,
      })),
      currency_handling: {
        base_currency: validated.primary_currency,
        supported_currencies: validated.currencies_needed,
        conversion_handling: "자동 환율 적용 (결제 시점 기준)",
      },
    },
    security_setup: {
      pci_compliance_steps: [
        { step: "SAQ(자가진단서) 작성", status: "pending", deadline: "D-60" },
        { step: "네트워크 보안 스캔", status: "pending", deadline: "D-45" },
        { step: "취약점 점검", status: "pending", deadline: "D-30" },
        { step: "PCI 인증 완료", status: "pending", deadline: "D-14" },
      ],
      fraud_prevention_measures: [
        "3D Secure 2.0 활성화",
        "CVV 검증 필수",
        "주소 검증 서비스(AVS)",
        "속도 제한 설정",
        "이상 거래 모니터링",
      ],
      data_protection_measures: [
        "토큰화를 통한 카드 정보 보호",
        "SSL/TLS 암호화",
        "PCI DSS 준수 데이터 저장",
        "접근 권한 최소화",
      ],
    },
    integration_plan: {
      technical_requirements: [
        "HTTPS 필수",
        "Webhook 엔드포인트 설정",
        "API 키 보안 저장",
        "에러 처리 로직 구현",
      ],
      api_endpoints: [
        { purpose: "결제 생성", endpoint: "/api/payments/create", method: "POST" },
        { purpose: "결제 확인", endpoint: "/api/payments/{id}", method: "GET" },
        { purpose: "환불 처리", endpoint: "/api/payments/{id}/refund", method: "POST" },
        { purpose: "Webhook 수신", endpoint: "/api/webhooks/payment", method: "POST" },
      ],
      testing_checklist: [
        { test_case: "정상 결제 처리", priority: "critical" },
        { test_case: "결제 실패 처리", priority: "critical" },
        { test_case: "환불 처리", priority: "high" },
        { test_case: "Webhook 수신 확인", priority: "high" },
        { test_case: "동시 결제 처리", priority: "medium" },
        { test_case: "타임아웃 처리", priority: "medium" },
      ],
    },
    cost_estimate: {
      setup_costs: 0,
      estimated_processing_fees: Math.round(estimatedFees),
      monthly_fees: 0,
      total_estimated_cost: Math.round(estimatedFees),
    },
    implementation_timeline: [
      {
        phase: "계획 및 계약",
        tasks: ["프로세서 선정", "계약 체결", "계정 설정"],
        duration_days: 7,
        dependencies: [],
      },
      {
        phase: "기술 통합",
        tasks: ["API 통합", "테스트 환경 구축", "Webhook 설정"],
        duration_days: 14,
        dependencies: ["계획 및 계약"],
      },
      {
        phase: "보안 검증",
        tasks: ["PCI 준수 확인", "보안 테스트", "침투 테스트"],
        duration_days: 7,
        dependencies: ["기술 통합"],
      },
      {
        phase: "테스트 및 검증",
        tasks: ["기능 테스트", "부하 테스트", "UAT"],
        duration_days: 7,
        dependencies: ["보안 검증"],
      },
      {
        phase: "런칭",
        tasks: ["프로덕션 배포", "모니터링 설정", "지원 체계 구축"],
        duration_days: 3,
        dependencies: ["테스트 및 검증"],
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-058",
  taskName: "결제 처리 시스템 설정",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 9.1.a",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.1: Establish Monetary Transaction Procedures",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
