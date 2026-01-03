/**
 * MKT-026: A/B 테스팅
 * CMP-IS Reference: 8.2.b - A/B testing execution and analysis
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert A/B Testing Agent.
CMP-IS Standard: 8.2.b - Executing A/B tests with statistical rigor.`;

export const InputSchema = z.object({
  event_id: z.string(),
  test_name: z.string(),
  test_type: z.string(),
  hypothesis: z.string(),
  control_variant: z.object({
    name: z.string(),
    description: z.string(),
  }),
  test_variant: z.object({
    name: z.string(),
    description: z.string(),
  }),
  success_metric: z.string(),
  traffic_split: z.number().default(50),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  test_id: z.string(),
  event_id: z.string(),
  test_name: z.string(),
  test_status: z.string(),
  test_config: z.object({
    hypothesis: z.string(),
    success_metric: z.string(),
    traffic_split: z.object({
      control: z.number(),
      variant: z.number(),
    }),
    minimum_sample_size: z.number(),
    statistical_significance: z.number(),
    test_duration_days: z.number(),
  }),
  results: z.object({
    control: z.object({
      name: z.string(),
      visitors: z.number(),
      conversions: z.number(),
      conversion_rate: z.number(),
    }),
    variant: z.object({
      name: z.string(),
      visitors: z.number(),
      conversions: z.number(),
      conversion_rate: z.number(),
    }),
    lift: z.number(),
    confidence_level: z.number(),
    p_value: z.number(),
    is_significant: z.boolean(),
  }),
  recommendation: z.object({
    winner: z.string(),
    action: z.string(),
    next_steps: z.array(z.string()),
  }),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  // Simulated test results
  const controlConversions = 150;
  const controlVisitors = 5000;
  const variantConversions = 195;
  const variantVisitors = 5000;
  const controlRate = (controlConversions / controlVisitors) * 100;
  const variantRate = (variantConversions / variantVisitors) * 100;
  const lift = ((variantRate - controlRate) / controlRate) * 100;

  return {
    test_id: generateUUID(),
    event_id: validatedInput.event_id,
    test_name: validatedInput.test_name,
    test_status: "completed",
    test_config: {
      hypothesis: validatedInput.hypothesis,
      success_metric: validatedInput.success_metric,
      traffic_split: {
        control: validatedInput.traffic_split,
        variant: 100 - validatedInput.traffic_split,
      },
      minimum_sample_size: 3000,
      statistical_significance: 95,
      test_duration_days: 14,
    },
    results: {
      control: {
        name: validatedInput.control_variant.name,
        visitors: controlVisitors,
        conversions: controlConversions,
        conversion_rate: controlRate,
      },
      variant: {
        name: validatedInput.test_variant.name,
        visitors: variantVisitors,
        conversions: variantConversions,
        conversion_rate: variantRate,
      },
      lift: lift,
      confidence_level: 97.2,
      p_value: 0.028,
      is_significant: true,
    },
    recommendation: {
      winner: validatedInput.test_variant.name,
      action: "테스트 변형(Variant)을 100% 트래픽에 적용",
      next_steps: [
        "Variant를 기본값으로 설정",
        "다음 최적화 영역 테스트 계획",
        "학습 내용 문서화",
        "후속 테스트 아이디어 도출",
      ],
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-026";
export const taskName = "A/B 테스팅";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.2.b";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.2: Performance Optimization";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
