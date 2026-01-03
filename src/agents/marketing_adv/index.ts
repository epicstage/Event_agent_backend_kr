/**
 * Domain I: Advanced Marketing
 * CMP-IS Reference: Skills 17-18
 *
 * Skill 17: Marketing Analytics (MKTADV-001 ~ MKTADV-020)
 * Skill 18: CRM Integration (MKTADV-021 ~ MKTADV-040)
 */

export * from "./skill17";
export * from "./skill18";

import { SKILL17_AGENTS } from "./skill17";
import { SKILL18_AGENTS } from "./skill18";

export const MARKETING_ADV_AGENTS = [
  ...SKILL17_AGENTS,
  ...SKILL18_AGENTS,
];

export default MARKETING_ADV_AGENTS;
