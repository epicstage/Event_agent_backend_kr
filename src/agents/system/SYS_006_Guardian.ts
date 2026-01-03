/**
 * SYS-006: Guardian Agent (가디언 에이전트)
 *
 * 에이전트 실행 전 입력 데이터 유효성을 검사하고,
 * 부족한 정보가 있을 경우 '추가 정보 요청' 인터럽트를 발생시키는 인터셉터.
 *
 * 주요 기능:
 * 1. UUID 필드 유효성 검사
 * 2. 필수 enum 값 검증
 * 3. 범위 제한 값 검사 (숫자 범위, 문자열 길이 등)
 * 4. 크로스 필드 의존성 검사
 * 5. 누락된 필수 정보에 대한 친화적 요청 생성
 */

import { z } from "zod";

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: FieldSuggestion[];
}

export interface ValidationError {
  field: string;
  code: ErrorCode;
  message: string;
  expected?: string;
  received?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  recommendation?: string;
}

export interface FieldSuggestion {
  field: string;
  question: string;
  examples?: string[];
  required: boolean;
  fieldType: "uuid" | "string" | "number" | "enum" | "date" | "array" | "object";
  enumOptions?: string[];
  defaultValue?: unknown;
}

export type ErrorCode =
  | "MISSING_REQUIRED"
  | "INVALID_UUID"
  | "INVALID_ENUM"
  | "OUT_OF_RANGE"
  | "INVALID_FORMAT"
  | "DEPENDENCY_MISSING"
  | "TYPE_MISMATCH";

export interface InterruptRequest {
  type: "INFORMATION_REQUIRED";
  agentId: string;
  taskId: string;
  missingFields: FieldSuggestion[];
  message: string;
  canProceedPartially: boolean;
  partialInput?: Record<string, unknown>;
}

export interface GuardianInput {
  taskId: string;
  agentId: string;
  input: Record<string, unknown>;
  schema?: z.ZodSchema;
  context?: {
    sessionId?: string;
    userId?: string;
    previousResponses?: Record<string, unknown>;
  };
}

export interface GuardianOutput {
  passed: boolean;
  validatedInput?: Record<string, unknown>;
  interrupt?: InterruptRequest;
  validation: ValidationResult;
  processingTime: number;
}

// =============================================================================
// FIELD DEFINITIONS BY DOMAIN
// =============================================================================

interface FieldDefinition {
  name: string;
  type: "uuid" | "string" | "number" | "enum" | "date" | "array" | "object";
  required: boolean;
  enumOptions?: string[];
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  dependsOn?: string[];
  friendlyName: string;
  questionKo: string;
  examples?: string[];
  defaultValue?: unknown;
}

// 공통 필드 정의
const COMMON_FIELDS: Record<string, FieldDefinition> = {
  event_id: {
    name: "event_id",
    type: "uuid",
    required: true,
    friendlyName: "이벤트 ID",
    questionKo: "어떤 이벤트에 대해 작업하시겠습니까?",
    examples: ["550e8400-e29b-41d4-a716-446655440000"],
  },
  event_type: {
    name: "event_type",
    type: "enum",
    required: false,
    enumOptions: ["conference", "seminar", "workshop", "exhibition", "networking", "webinar", "hybrid"],
    friendlyName: "이벤트 유형",
    questionKo: "이벤트 유형이 무엇인가요?",
    examples: ["conference", "seminar"],
    defaultValue: "conference",
  },
  event_scale: {
    name: "event_scale",
    type: "enum",
    required: false,
    enumOptions: ["small", "medium", "large", "mega"],
    friendlyName: "이벤트 규모",
    questionKo: "이벤트 규모가 어느 정도인가요?",
    examples: ["small (100명 이하)", "medium (100-500명)", "large (500-2000명)", "mega (2000명 이상)"],
    defaultValue: "medium",
  },
  expected_attendees: {
    name: "expected_attendees",
    type: "number",
    required: false,
    minValue: 1,
    maxValue: 100000,
    friendlyName: "예상 참가자 수",
    questionKo: "예상 참가자 수가 몇 명인가요?",
    examples: ["100", "500", "1000"],
    defaultValue: 100,
  },
};

// 도메인별 필수 필드 정의
const DOMAIN_REQUIRED_FIELDS: Record<string, string[]> = {
  finance: ["event_id"],
  strategy: ["event_id"],
  project: ["event_id"],
  marketing: ["event_id"],
  operations: ["event_id"],
  hr: ["event_id"],
  meetings: ["event_id"],
};

// 태스크별 특수 필드 정의
const TASK_SPECIFIC_FIELDS: Record<string, FieldDefinition[]> = {
  "FIN-001": [
    {
      name: "benefits",
      type: "array",
      required: true,
      friendlyName: "스폰서 혜택 목록",
      questionKo: "어떤 스폰서 혜택을 제공할 예정인가요?",
      examples: ["로고 노출", "부스 공간", "발표 기회", "참가자 DB"],
    },
    {
      name: "market_positioning",
      type: "enum",
      required: false,
      enumOptions: ["new_entrant", "established", "premium", "budget"],
      friendlyName: "시장 포지셔닝",
      questionKo: "이벤트의 시장 포지셔닝은 어떤가요?",
      examples: ["new_entrant", "established", "premium"],
      defaultValue: "established",
    },
  ],
  "FIN-031": [
    {
      name: "budget_total",
      type: "number",
      required: false,
      minValue: 0,
      friendlyName: "총 예산",
      questionKo: "총 예산이 얼마인가요? (원)",
      examples: ["10000000", "50000000", "100000000"],
    },
    {
      name: "currency",
      type: "enum",
      required: false,
      enumOptions: ["KRW", "USD", "EUR", "JPY"],
      friendlyName: "통화",
      questionKo: "어떤 통화를 사용하나요?",
      defaultValue: "KRW",
    },
  ],
  "OPS-001": [
    {
      name: "venue_requirements",
      type: "object",
      required: false,
      friendlyName: "베뉴 요구사항",
      questionKo: "베뉴에 대한 특별한 요구사항이 있나요?",
      examples: ["수용 인원", "위치", "시설"],
    },
  ],
  "HR-001": [
    {
      name: "staff_categories",
      type: "array",
      required: false,
      friendlyName: "필요 인력 카테고리",
      questionKo: "어떤 종류의 스태프가 필요한가요?",
      examples: ["행사 진행", "등록 데스크", "안내", "기술 지원"],
    },
  ],
  // Meetings & Contents Domain
  "MTG-001": [
    {
      name: "event_type",
      type: "enum",
      required: true,
      enumOptions: ["conference", "symposium", "summit", "congress", "forum", "workshop_series", "hybrid"],
      friendlyName: "이벤트 유형",
      questionKo: "어떤 유형의 학술/비즈니스 행사인가요?",
      examples: ["conference", "symposium", "summit"],
    },
    {
      name: "event_duration_days",
      type: "number",
      required: true,
      minValue: 1,
      maxValue: 14,
      friendlyName: "행사 기간 (일)",
      questionKo: "행사가 며칠 동안 진행되나요?",
      examples: ["1", "2", "3"],
    },
    {
      name: "main_theme",
      type: "string",
      required: true,
      minLength: 3,
      friendlyName: "메인 테마",
      questionKo: "행사의 메인 테마가 무엇인가요?",
      examples: ["AI Innovation", "디지털 트랜스포메이션", "지속가능한 미래"],
    },
    {
      name: "parallel_sessions_max",
      type: "number",
      required: false,
      minValue: 1,
      maxValue: 20,
      friendlyName: "최대 동시 세션 수",
      questionKo: "동시에 진행할 수 있는 최대 세션 수가 몇 개인가요?",
      examples: ["3", "4", "6"],
      defaultValue: 4,
    },
  ],
  "MTG-021": [
    {
      name: "speaker_requirements",
      type: "object",
      required: false,
      friendlyName: "연사 요구사항",
      questionKo: "필요한 연사 유형과 조건이 있나요?",
      examples: ["키노트 연사 3명", "패널리스트 10명", "워크샵 진행자 5명"],
    },
    {
      name: "speaker_budget",
      type: "number",
      required: false,
      minValue: 0,
      friendlyName: "연사 예산",
      questionKo: "연사 사례비/여비 예산이 얼마인가요? (원)",
      examples: ["5000000", "10000000", "50000000"],
    },
  ],
  "MTG-028": [
    {
      name: "submission_deadline",
      type: "date",
      required: false,
      friendlyName: "초록 제출 마감일",
      questionKo: "초록 제출 마감일이 언제인가요?",
      examples: ["2024-06-30", "2024-09-15"],
    },
    {
      name: "review_process",
      type: "enum",
      required: false,
      enumOptions: ["single_blind", "double_blind", "open", "editorial"],
      friendlyName: "심사 방식",
      questionKo: "초록 심사 방식이 어떻게 되나요?",
      examples: ["double_blind", "single_blind"],
      defaultValue: "double_blind",
    },
  ],
};

// =============================================================================
// UUID VALIDATION
// =============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: unknown): boolean {
  return typeof value === "string" && UUID_REGEX.test(value);
}

// =============================================================================
// GUARDIAN AGENT IMPLEMENTATION
// =============================================================================

/**
 * 입력 데이터 유효성 검사 수행
 */
export function validateInput(
  taskId: string,
  input: Record<string, unknown>,
  domain: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: FieldSuggestion[] = [];

  // 1. 도메인 공통 필수 필드 검사
  const requiredFields = DOMAIN_REQUIRED_FIELDS[domain] || ["event_id"];

  for (const fieldName of requiredFields) {
    const fieldDef = COMMON_FIELDS[fieldName];
    if (!fieldDef) continue;

    const value = input[fieldName];

    if (value === undefined || value === null || value === "") {
      errors.push({
        field: fieldName,
        code: "MISSING_REQUIRED",
        message: `${fieldDef.friendlyName}이(가) 필요합니다`,
        expected: fieldDef.type,
        received: value,
      });

      suggestions.push({
        field: fieldName,
        question: fieldDef.questionKo,
        examples: fieldDef.examples,
        required: true,
        fieldType: fieldDef.type,
        enumOptions: fieldDef.enumOptions,
        defaultValue: fieldDef.defaultValue,
      });
    } else {
      // 값이 있으면 유효성 검사
      const fieldError = validateField(fieldDef, value);
      if (fieldError) {
        errors.push(fieldError);
      }
    }
  }

  // 2. 태스크별 특수 필드 검사
  const taskFields = TASK_SPECIFIC_FIELDS[taskId] || [];

  for (const fieldDef of taskFields) {
    const value = input[fieldDef.name];

    if (fieldDef.required && (value === undefined || value === null || value === "")) {
      errors.push({
        field: fieldDef.name,
        code: "MISSING_REQUIRED",
        message: `${fieldDef.friendlyName}이(가) 필요합니다`,
        expected: fieldDef.type,
        received: value,
      });

      suggestions.push({
        field: fieldDef.name,
        question: fieldDef.questionKo,
        examples: fieldDef.examples,
        required: true,
        fieldType: fieldDef.type,
        enumOptions: fieldDef.enumOptions,
        defaultValue: fieldDef.defaultValue,
      });
    } else if (value !== undefined && value !== null) {
      const fieldError = validateField(fieldDef, value);
      if (fieldError) {
        errors.push(fieldError);
      }
    } else if (!fieldDef.required) {
      // 선택 필드지만 없으면 제안 추가
      suggestions.push({
        field: fieldDef.name,
        question: fieldDef.questionKo,
        examples: fieldDef.examples,
        required: false,
        fieldType: fieldDef.type,
        enumOptions: fieldDef.enumOptions,
        defaultValue: fieldDef.defaultValue,
      });
    }
  }

  // 3. 공통 선택 필드 검사 (있으면 유효성 검증)
  for (const [fieldName, fieldDef] of Object.entries(COMMON_FIELDS)) {
    if (requiredFields.includes(fieldName)) continue; // 이미 검사함

    const value = input[fieldName];
    if (value !== undefined && value !== null) {
      const fieldError = validateField(fieldDef, value);
      if (fieldError) {
        errors.push(fieldError);
      }
    }
  }

  // 4. 경고 추가 (베스트 프랙티스 권장)
  if (!input.expected_attendees) {
    warnings.push({
      field: "expected_attendees",
      message: "예상 참가자 수가 제공되면 더 정확한 분석이 가능합니다",
      recommendation: "예상 참가자 수를 입력해주세요",
    });
  }

  if (!input.event_type) {
    warnings.push({
      field: "event_type",
      message: "이벤트 유형이 제공되면 더 맞춤화된 결과를 제공할 수 있습니다",
      recommendation: "conference, seminar, workshop 중 선택해주세요",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions: suggestions.filter((s) => s.required), // 필수 필드만 제안
  };
}

/**
 * 개별 필드 유효성 검사
 */
function validateField(fieldDef: FieldDefinition, value: unknown): ValidationError | null {
  // UUID 검사
  if (fieldDef.type === "uuid") {
    if (!isValidUUID(value)) {
      return {
        field: fieldDef.name,
        code: "INVALID_UUID",
        message: `${fieldDef.friendlyName}이(가) 올바른 UUID 형식이 아닙니다`,
        expected: "UUID v1-5 형식 (예: 550e8400-e29b-41d4-a716-446655440000)",
        received: value,
      };
    }
  }

  // Enum 검사
  if (fieldDef.type === "enum" && fieldDef.enumOptions) {
    if (typeof value !== "string" || !fieldDef.enumOptions.includes(value)) {
      return {
        field: fieldDef.name,
        code: "INVALID_ENUM",
        message: `${fieldDef.friendlyName}이(가) 허용된 값이 아닙니다`,
        expected: `허용 값: ${fieldDef.enumOptions.join(", ")}`,
        received: value,
      };
    }
  }

  // 숫자 범위 검사
  if (fieldDef.type === "number") {
    if (typeof value !== "number") {
      return {
        field: fieldDef.name,
        code: "TYPE_MISMATCH",
        message: `${fieldDef.friendlyName}은(는) 숫자여야 합니다`,
        expected: "number",
        received: typeof value,
      };
    }

    if (fieldDef.minValue !== undefined && value < fieldDef.minValue) {
      return {
        field: fieldDef.name,
        code: "OUT_OF_RANGE",
        message: `${fieldDef.friendlyName}이(가) 최소값보다 작습니다`,
        expected: `최소 ${fieldDef.minValue}`,
        received: value,
      };
    }

    if (fieldDef.maxValue !== undefined && value > fieldDef.maxValue) {
      return {
        field: fieldDef.name,
        code: "OUT_OF_RANGE",
        message: `${fieldDef.friendlyName}이(가) 최대값을 초과합니다`,
        expected: `최대 ${fieldDef.maxValue}`,
        received: value,
      };
    }
  }

  // 문자열 길이 검사
  if (fieldDef.type === "string" && typeof value === "string") {
    if (fieldDef.minLength !== undefined && value.length < fieldDef.minLength) {
      return {
        field: fieldDef.name,
        code: "OUT_OF_RANGE",
        message: `${fieldDef.friendlyName}이(가) 너무 짧습니다`,
        expected: `최소 ${fieldDef.minLength}자`,
        received: `${value.length}자`,
      };
    }

    if (fieldDef.maxLength !== undefined && value.length > fieldDef.maxLength) {
      return {
        field: fieldDef.name,
        code: "OUT_OF_RANGE",
        message: `${fieldDef.friendlyName}이(가) 너무 깁니다`,
        expected: `최대 ${fieldDef.maxLength}자`,
        received: `${value.length}자`,
      };
    }

    if (fieldDef.pattern && !fieldDef.pattern.test(value)) {
      return {
        field: fieldDef.name,
        code: "INVALID_FORMAT",
        message: `${fieldDef.friendlyName}이(가) 올바른 형식이 아닙니다`,
        expected: fieldDef.pattern.toString(),
        received: value,
      };
    }
  }

  // 배열 검사
  if (fieldDef.type === "array" && !Array.isArray(value)) {
    return {
      field: fieldDef.name,
      code: "TYPE_MISMATCH",
      message: `${fieldDef.friendlyName}은(는) 배열이어야 합니다`,
      expected: "array",
      received: typeof value,
    };
  }

  return null;
}

/**
 * 인터럽트 요청 생성
 */
function createInterruptRequest(
  agentId: string,
  taskId: string,
  validation: ValidationResult,
  input: Record<string, unknown>
): InterruptRequest {
  // 친화적인 메시지 생성
  const missingCount = validation.suggestions.length;
  const fieldNames = validation.suggestions.map((s) => s.field).join(", ");

  let message: string;
  if (missingCount === 1) {
    message = `${validation.suggestions[0].question}`;
  } else {
    message = `다음 정보가 필요합니다: ${fieldNames}. 하나씩 입력해주세요.`;
  }

  // 부분 진행 가능 여부 판단 (event_id만 있으면 기본 분석 가능)
  const canProceedPartially = isValidUUID(input.event_id);

  return {
    type: "INFORMATION_REQUIRED",
    agentId,
    taskId,
    missingFields: validation.suggestions,
    message,
    canProceedPartially,
    partialInput: canProceedPartially ? input : undefined,
  };
}

/**
 * 기본값 적용
 */
function applyDefaults(
  input: Record<string, unknown>,
  taskId: string,
  domain: string
): Record<string, unknown> {
  const result = { ...input };

  // 공통 필드 기본값
  for (const [fieldName, fieldDef] of Object.entries(COMMON_FIELDS)) {
    if (result[fieldName] === undefined && fieldDef.defaultValue !== undefined) {
      result[fieldName] = fieldDef.defaultValue;
    }
  }

  // 태스크별 필드 기본값
  const taskFields = TASK_SPECIFIC_FIELDS[taskId] || [];
  for (const fieldDef of taskFields) {
    if (result[fieldDef.name] === undefined && fieldDef.defaultValue !== undefined) {
      result[fieldDef.name] = fieldDef.defaultValue;
    }
  }

  return result;
}

/**
 * 메인 실행 함수 - Guardian Agent
 */
export async function execute(guardianInput: GuardianInput): Promise<GuardianOutput> {
  const startTime = Date.now();

  const { taskId, agentId, input, context } = guardianInput;

  // 도메인 추출 (taskId 앞 3글자)
  const domain = getDomainFromTaskId(taskId);

  // 1. 기본값 적용
  const inputWithDefaults = applyDefaults(input, taskId, domain);

  // 2. 유효성 검사
  const validation = validateInput(taskId, inputWithDefaults, domain);

  // 3. 검증 통과 여부에 따른 처리
  if (validation.isValid) {
    return {
      passed: true,
      validatedInput: inputWithDefaults,
      validation,
      processingTime: Date.now() - startTime,
    };
  }

  // 4. 검증 실패 - 인터럽트 요청 생성
  const interrupt = createInterruptRequest(agentId, taskId, validation, inputWithDefaults);

  return {
    passed: false,
    validatedInput: interrupt.canProceedPartially ? inputWithDefaults : undefined,
    interrupt,
    validation,
    processingTime: Date.now() - startTime,
  };
}

/**
 * TaskId에서 도메인 추출
 */
function getDomainFromTaskId(taskId: string): string {
  const prefix = taskId.substring(0, 3).toUpperCase();

  const prefixToDomain: Record<string, string> = {
    FIN: "finance",
    STR: "strategy",
    PRJ: "project",
    MKT: "marketing",
    OPS: "operations",
    "HR-": "hr",
    MTG: "meetings",
  };

  return prefixToDomain[prefix] || "strategy";
}

/**
 * 필드 정의 조회 (외부 사용용)
 */
export function getFieldDefinitions(taskId: string): FieldDefinition[] {
  const domain = getDomainFromTaskId(taskId);
  const requiredFields = DOMAIN_REQUIRED_FIELDS[domain] || [];

  const fields: FieldDefinition[] = [];

  // 공통 필수 필드
  for (const fieldName of requiredFields) {
    const fieldDef = COMMON_FIELDS[fieldName];
    if (fieldDef) {
      fields.push(fieldDef);
    }
  }

  // 태스크별 특수 필드
  const taskFields = TASK_SPECIFIC_FIELDS[taskId] || [];
  fields.push(...taskFields);

  return fields;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SYS_006_Guardian = {
  id: "SYS-006",
  name: "Guardian Agent",
  description: "에이전트 실행 전 입력 데이터 유효성 검사 및 추가 정보 요청 인터셉터",
  type: "guardian",
  execute,
  validateInput,
  getFieldDefinitions,
  applyDefaults,
  requires_confirmation: false,
  can_interrupt: true,
};

export default SYS_006_Guardian;
