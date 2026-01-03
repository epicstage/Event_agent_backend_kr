/**
 * Domain G: Meetings & Contents
 * CMP-IS 프로그램 설계 및 콘텐츠 관리 도메인
 *
 * Skill 13: Program Design (MTG-001 ~ MTG-020)
 * Skill 14: Speaker & Content Management (MTG-021 ~ MTG-040)
 */

export { Skill13Agents } from "./skill13";
export { Skill14Agents } from "./skill14";

export * from "./skill13";
export * from "./skill14";

import { Skill13Agents } from "./skill13";
import { Skill14Agents } from "./skill14";

export const MeetingsAgents = [...Skill13Agents, ...Skill14Agents];

// Domain metadata
export const MeetingsDomainInfo = {
  domain: "G",
  name: "Meetings & Contents",
  description: "프로그램 설계, 연사 관리, 콘텐츠 제작",
  skills: [
    { id: 13, name: "Program Design", agents: Skill13Agents.length },
    { id: 14, name: "Speaker & Content Management", agents: Skill14Agents.length },
  ],
  totalAgents: Skill13Agents.length + Skill14Agents.length,
};
