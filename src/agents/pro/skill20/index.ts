/**
 * Skill 20: Legal Compliance & Professional Development (PRO-011 ~ PRO-020)
 * CMP-IS Reference: Domain 20 - Legal Compliance & Professional Development
 */

export { default as PRO_011_LegalRiskReview } from "./PRO_011_LegalRiskReview";
export { default as PRO_012_ContractCompliance } from "./PRO_012_ContractCompliance";
export { default as PRO_013_PrivacyCompliance } from "./PRO_013_PrivacyCompliance";
export { default as PRO_014_IntellectualPropertyProtection } from "./PRO_014_IntellectualPropertyProtection";
export { default as PRO_015_RegulatoryCompliance } from "./PRO_015_RegulatoryCompliance";
export { default as PRO_016_ProfessionalCertificationManagement } from "./PRO_016_ProfessionalCertificationManagement";
export { default as PRO_017_ContinuingEducationTracking } from "./PRO_017_ContinuingEducationTracking";
export { default as PRO_018_SelfDevelopmentPlanning } from "./PRO_018_SelfDevelopmentPlanning";
export { default as PRO_019_MentorshipProgram } from "./PRO_019_MentorshipProgram";
export { default as PRO_020_CareerDevelopment } from "./PRO_020_CareerDevelopment";

import PRO_011 from "./PRO_011_LegalRiskReview";
import PRO_012 from "./PRO_012_ContractCompliance";
import PRO_013 from "./PRO_013_PrivacyCompliance";
import PRO_014 from "./PRO_014_IntellectualPropertyProtection";
import PRO_015 from "./PRO_015_RegulatoryCompliance";
import PRO_016 from "./PRO_016_ProfessionalCertificationManagement";
import PRO_017 from "./PRO_017_ContinuingEducationTracking";
import PRO_018 from "./PRO_018_SelfDevelopmentPlanning";
import PRO_019 from "./PRO_019_MentorshipProgram";
import PRO_020 from "./PRO_020_CareerDevelopment";

export const SKILL_20_AGENTS = [
  PRO_011,
  PRO_012,
  PRO_013,
  PRO_014,
  PRO_015,
  PRO_016,
  PRO_017,
  PRO_018,
  PRO_019,
  PRO_020,
];

export const SKILL_20_METADATA = {
  skillId: "20",
  skillName: "Legal Compliance & Professional Development",
  description: "Legal risk management, regulatory compliance, and professional growth for event professionals",
  agentCount: 10,
  taskIdRange: "PRO-011 ~ PRO-020",
  cmpReference: "CMP-IS Domain 20",
};

export default SKILL_20_AGENTS;
