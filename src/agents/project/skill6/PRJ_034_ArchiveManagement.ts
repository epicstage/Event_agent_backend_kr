/**
 * PRJ-034: 아카이브 관리
 * CMP-IS Reference: 6.3.d - Archiving project documents
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Archive Management Agent for event projects.
CMP-IS Standard: 6.3.d - Archiving project documents`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  project_documents: z.array(z.object({
    document_name: z.string(),
    category: z.enum(["planning", "contracts", "financial", "communications", "deliverables", "reports", "media"]),
    format: z.enum(["pdf", "docx", "xlsx", "pptx", "jpg", "mp4", "other"]),
    size_mb: z.number().optional(),
    confidentiality: z.enum(["public", "internal", "confidential", "restricted"]).default("internal"),
  })),
  retention_requirements: z.object({
    legal_retention_years: z.number().default(7),
    business_retention_years: z.number().default(5),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  archive_id: z.string(),
  event_id: z.string(),
  archive_summary: z.object({
    event_name: z.string(),
    total_documents: z.number(),
    total_size_mb: z.number(),
    archive_date: z.string(),
    archive_location: z.string(),
  }),
  document_index: z.array(z.object({
    document_id: z.string(),
    document_name: z.string(),
    category: z.string(),
    format: z.string(),
    confidentiality: z.string(),
    retention_until: z.string(),
    archive_path: z.string(),
  })),
  category_summary: z.array(z.object({
    category: z.string(),
    document_count: z.number(),
    total_size_mb: z.number(),
  })),
  retention_schedule: z.object({
    standard_retention: z.string(),
    legal_documents: z.string(),
    financial_documents: z.string(),
    contracts: z.string(),
  }),
  access_control: z.array(z.object({
    confidentiality_level: z.string(),
    access_roles: z.array(z.string()),
    approval_required: z.boolean(),
  })),
  archive_checklist: z.array(z.object({
    task: z.string(),
    status: z.enum(["completed", "pending", "not_applicable"]),
    responsible: z.string(),
  })),
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

function addYears(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { project_documents, retention_requirements } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  const legalRetention = retention_requirements?.legal_retention_years || 7;
  const businessRetention = retention_requirements?.business_retention_years || 5;

  // 문서 인덱스
  const documentIndex = project_documents.map((doc, idx) => {
    const retentionYears = doc.category === "contracts" || doc.category === "financial"
      ? legalRetention
      : businessRetention;

    return {
      document_id: `DOC-${String(idx + 1).padStart(4, "0")}`,
      document_name: doc.document_name,
      category: doc.category,
      format: doc.format,
      confidentiality: doc.confidentiality,
      retention_until: addYears(retentionYears),
      archive_path: `/archive/${validatedInput.event_id}/${doc.category}/${doc.document_name}`,
    };
  });

  // 카테고리별 요약
  const categoryMap: Record<string, { count: number; size: number }> = {};
  project_documents.forEach(doc => {
    if (!categoryMap[doc.category]) {
      categoryMap[doc.category] = { count: 0, size: 0 };
    }
    categoryMap[doc.category].count++;
    categoryMap[doc.category].size += doc.size_mb || 1;
  });

  const categorySummary = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    document_count: data.count,
    total_size_mb: Math.round(data.size * 10) / 10,
  }));

  const totalSize = project_documents.reduce((sum, doc) => sum + (doc.size_mb || 1), 0);

  return {
    archive_id: generateUUID(),
    event_id: validatedInput.event_id,
    archive_summary: {
      event_name: validatedInput.event_name,
      total_documents: project_documents.length,
      total_size_mb: Math.round(totalSize * 10) / 10,
      archive_date: today,
      archive_location: "Cloud Storage (AWS S3 / Google Drive)",
    },
    document_index: documentIndex,
    category_summary: categorySummary,
    retention_schedule: {
      standard_retention: `${businessRetention}년`,
      legal_documents: `${legalRetention}년`,
      financial_documents: `${legalRetention}년`,
      contracts: `${legalRetention}년 (계약 종료 후)`,
    },
    access_control: [
      { confidentiality_level: "public", access_roles: ["전체"], approval_required: false },
      { confidentiality_level: "internal", access_roles: ["직원"], approval_required: false },
      { confidentiality_level: "confidential", access_roles: ["PM", "경영진"], approval_required: true },
      { confidentiality_level: "restricted", access_roles: ["경영진"], approval_required: true },
    ],
    archive_checklist: [
      { task: "모든 문서 수집 완료", status: "completed", responsible: "PM" },
      { task: "파일 명명 규칙 적용", status: "completed", responsible: "Admin" },
      { task: "기밀 등급 분류", status: "completed", responsible: "PM" },
      { task: "백업 완료", status: "pending", responsible: "IT" },
      { task: "접근 권한 설정", status: "pending", responsible: "IT" },
      { task: "아카이브 완료 통보", status: "pending", responsible: "PM" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-034",
  taskName: "아카이브 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.d",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
