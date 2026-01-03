/**
 * Skill 15: Site Operations
 * CMP-IS 현장 운영 관련 에이전트 (SITE-001 ~ SITE-020)
 */

import SITE_001 from "./SITE_001_SiteSelectionAnalysis";
import SITE_002 from "./SITE_002_VenueContractNegotiation";
import SITE_003 from "./SITE_003_SiteInspection";
import SITE_004 from "./SITE_004_FloorPlanDesign";
import SITE_005 from "./SITE_005_SafetySecurityPlan";
import SITE_006 from "./SITE_006_LogisticsCoordination";
import SITE_007 from "./SITE_007_EquipmentInventory";
import SITE_008 from "./SITE_008_SetupSchedule";
import SITE_009 from "./SITE_009_TeardownPlan";
import SITE_010 from "./SITE_010_SignageWayfinding";
import SITE_011 from "./SITE_011_PowerElectrical";
import SITE_012 from "./SITE_012_NetworkConnectivity";
import SITE_013 from "./SITE_013_AVTechnical";
import SITE_014 from "./SITE_014_AccessibilityCompliance";
import SITE_015 from "./SITE_015_EmergencyProcedures";
import SITE_016 from "./SITE_016_VendorCoordination";
import SITE_017 from "./SITE_017_ParkingTraffic";
import SITE_018 from "./SITE_018_WasteManagement";
import SITE_019 from "./SITE_019_CleaningServices";
import SITE_020 from "./SITE_020_SiteOperationsReport";

export const Skill15Agents = [
  SITE_001,
  SITE_002,
  SITE_003,
  SITE_004,
  SITE_005,
  SITE_006,
  SITE_007,
  SITE_008,
  SITE_009,
  SITE_010,
  SITE_011,
  SITE_012,
  SITE_013,
  SITE_014,
  SITE_015,
  SITE_016,
  SITE_017,
  SITE_018,
  SITE_019,
  SITE_020,
];

export const SKILL15_AGENTS = {
  "SITE-001": SITE_001,
  "SITE-002": SITE_002,
  "SITE-003": SITE_003,
  "SITE-004": SITE_004,
  "SITE-005": SITE_005,
  "SITE-006": SITE_006,
  "SITE-007": SITE_007,
  "SITE-008": SITE_008,
  "SITE-009": SITE_009,
  "SITE-010": SITE_010,
  "SITE-011": SITE_011,
  "SITE-012": SITE_012,
  "SITE-013": SITE_013,
  "SITE-014": SITE_014,
  "SITE-015": SITE_015,
  "SITE-016": SITE_016,
  "SITE-017": SITE_017,
  "SITE-018": SITE_018,
  "SITE-019": SITE_019,
  "SITE-020": SITE_020,
};

export const SKILL15_METADATA = {
  skillId: "skill-15",
  skillName: "Site Operations",
  description: "현장 운영 - 사이트 선정, 시설 관리, 안전, 셋업/철거",
  agentCount: 20,
};

export {
  SITE_001,
  SITE_002,
  SITE_003,
  SITE_004,
  SITE_005,
  SITE_006,
  SITE_007,
  SITE_008,
  SITE_009,
  SITE_010,
  SITE_011,
  SITE_012,
  SITE_013,
  SITE_014,
  SITE_015,
  SITE_016,
  SITE_017,
  SITE_018,
  SITE_019,
  SITE_020,
};

export default Skill15Agents;
