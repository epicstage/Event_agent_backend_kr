/**
 * Skill 19: Ethics & Standards (PRO-001 ~ PRO-010)
 * CMP-IS Reference: Domain 19 - Professional Ethics & Standards
 */

export { default as PRO_001_EthicsCodeCompliance } from "./PRO_001_EthicsCodeCompliance";
export { default as PRO_002_IndustryStandardsAdherence } from "./PRO_002_IndustryStandardsAdherence";
export { default as PRO_003_BusinessEtiquette } from "./PRO_003_BusinessEtiquette";
export { default as PRO_004_VendorEthicsScreening } from "./PRO_004_VendorEthicsScreening";
export { default as PRO_005_SustainabilityStandards } from "./PRO_005_SustainabilityStandards";
export { default as PRO_006_DEICompliance } from "./PRO_006_DEICompliance";
export { default as PRO_007_ConflictOfInterest } from "./PRO_007_ConflictOfInterest";
export { default as PRO_008_GiftPolicyManagement } from "./PRO_008_GiftPolicyManagement";
export { default as PRO_009_WhistleblowerProtection } from "./PRO_009_WhistleblowerProtection";
export { default as PRO_010_ProfessionalConduct } from "./PRO_010_ProfessionalConduct";

import PRO_001 from "./PRO_001_EthicsCodeCompliance";
import PRO_002 from "./PRO_002_IndustryStandardsAdherence";
import PRO_003 from "./PRO_003_BusinessEtiquette";
import PRO_004 from "./PRO_004_VendorEthicsScreening";
import PRO_005 from "./PRO_005_SustainabilityStandards";
import PRO_006 from "./PRO_006_DEICompliance";
import PRO_007 from "./PRO_007_ConflictOfInterest";
import PRO_008 from "./PRO_008_GiftPolicyManagement";
import PRO_009 from "./PRO_009_WhistleblowerProtection";
import PRO_010 from "./PRO_010_ProfessionalConduct";

export const SKILL_19_AGENTS = [
  PRO_001,
  PRO_002,
  PRO_003,
  PRO_004,
  PRO_005,
  PRO_006,
  PRO_007,
  PRO_008,
  PRO_009,
  PRO_010,
];

export const SKILL_19_METADATA = {
  skillId: "19",
  skillName: "Ethics & Standards",
  description: "Professional ethics, industry standards, and compliance management for event professionals",
  agentCount: 10,
  taskIdRange: "PRO-001 ~ PRO-010",
  cmpReference: "CMP-IS Domain 19",
};

export default SKILL_19_AGENTS;
