/**
 * Domain H: Site Management
 * CMP-IS Reference: Skills 15 & 16 - Site Selection/Design & Housing Management
 *
 * 총 40개 에이전트:
 * - Skill 15 (Site Operations): SITE-001 ~ SITE-020
 * - Skill 16 (Housing Management): SITE-021 ~ SITE-040
 */

// Skill 15: Site Operations
export * from "./skill15";
export { SKILL15_AGENTS, SKILL15_METADATA } from "./skill15";

// Skill 16: Housing Management
export * from "./skill16";
export { SKILL16_AGENTS, SKILL16_METADATA } from "./skill16";

import { SKILL15_AGENTS } from "./skill15";
import { SKILL16_AGENTS } from "./skill16";

// Combined Site Management Agents
export const SITE_AGENTS = {
  ...SKILL15_AGENTS,
  ...SKILL16_AGENTS,
};

// Domain Metadata
export const SITE_DOMAIN_METADATA = {
  domainId: "H",
  domainName: "Site Management",
  description: "사이트 선정, 설계, 운영 및 숙박 관리",
  totalAgents: 40,
  skills: [
    {
      skillId: "skill-15",
      skillName: "Site Selection and Design",
      agentRange: "SITE-001 ~ SITE-020",
      agentCount: 20,
    },
    {
      skillId: "skill-16",
      skillName: "Housing Management",
      agentRange: "SITE-021 ~ SITE-040",
      agentCount: 20,
    },
  ],
  neuralConnections: {
    inbound: [
      { from: "PRJ", description: "프로젝트 일정 → 사이트 셋업/철거 일정" },
      { from: "FIN", description: "예산 할당 → 사이트/숙박 예산" },
    ],
    outbound: [
      { to: "FIN", description: "사이트/숙박 비용 → 예산 추적" },
      { to: "PRJ", description: "셋업 일정 → 전체 일정" },
    ],
  },
};

// Agent Catalog for Router
export const SITE_AGENT_CATALOG = Object.entries(SITE_AGENTS).map(([taskId, agent]) => ({
  taskId,
  taskName: agent.taskName,
  taskType: agent.taskType,
  cmpReference: agent.cmpReference,
  skill: agent.skill,
  subSkill: agent.subSkill,
}));

export default SITE_AGENTS;
