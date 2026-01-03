/**
 * Domain J: Professionalism (PRO-001 ~ PRO-020)
 * CMP-IS Reference: Professional Ethics, Legal Compliance & Career Development
 *
 * Skills Covered:
 * - Skill 19: Ethics & Standards (PRO-001 ~ PRO-010)
 * - Skill 20: Legal Compliance & Professional Development (PRO-011 ~ PRO-020)
 */

export * from "./skill19";
export * from "./skill20";

import { SKILL_19_AGENTS, SKILL_19_METADATA } from "./skill19";
import { SKILL_20_AGENTS, SKILL_20_METADATA } from "./skill20";

export const PRO_DOMAIN_AGENTS = [
  ...SKILL_19_AGENTS,
  ...SKILL_20_AGENTS,
];

export const PRO_DOMAIN_METADATA = {
  domainId: "J",
  domainCode: "PRO",
  domainName: "Professionalism",
  description: "Professional ethics, standards, legal compliance, and career development for event professionals",
  skills: [SKILL_19_METADATA, SKILL_20_METADATA],
  totalAgents: 20,
  taskIdRange: "PRO-001 ~ PRO-020",
  cmpReference: "CMP-IS Domains 19-20",
};

export default PRO_DOMAIN_AGENTS;
