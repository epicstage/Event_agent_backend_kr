/**
 * Skill 16: Housing Management
 * Domain H: Site Management - Housing 하위 스킬
 * CMP-IS Reference: Skill 16 - Housing Management
 */

export { default as SITE_021_HotelBlockNegotiation } from "./SITE_021_HotelBlockNegotiation";
export { default as SITE_022_RoomAllocation } from "./SITE_022_RoomAllocation";
export { default as SITE_023_GuestAccommodation } from "./SITE_023_GuestAccommodation";
export { default as SITE_024_HousingInventory } from "./SITE_024_HousingInventory";
export { default as SITE_025_HousingBudget } from "./SITE_025_HousingBudget";
export { default as SITE_026_HousingInvoicing } from "./SITE_026_HousingInvoicing";
export { default as SITE_027_CheckInOut } from "./SITE_027_CheckInOut";
export { default as SITE_028_RoomingList } from "./SITE_028_RoomingList";
export { default as SITE_029_TransportCoordination } from "./SITE_029_TransportCoordination";
export { default as SITE_030_VIPHousing } from "./SITE_030_VIPHousing";
export { default as SITE_031_AttritionManagement } from "./SITE_031_AttritionManagement";
export { default as SITE_032_HousingCommunications } from "./SITE_032_HousingCommunications";
export { default as SITE_033_PostEventReconciliation } from "./SITE_033_PostEventReconciliation";
export { default as SITE_034_GroupRoomBlock } from "./SITE_034_GroupRoomBlock";
export { default as SITE_035_HousingReporting } from "./SITE_035_HousingReporting";
export { default as SITE_036_HotelServiceLevel } from "./SITE_036_HotelServiceLevel";
export { default as SITE_037_RoomBlockRelease } from "./SITE_037_RoomBlockRelease";
export { default as SITE_038_HousingCompliance } from "./SITE_038_HousingCompliance";
export { default as SITE_039_HousingTechnology } from "./SITE_039_HousingTechnology";
export { default as SITE_040_HousingEmergency } from "./SITE_040_HousingEmergency";

import SITE_021 from "./SITE_021_HotelBlockNegotiation";
import SITE_022 from "./SITE_022_RoomAllocation";
import SITE_023 from "./SITE_023_GuestAccommodation";
import SITE_024 from "./SITE_024_HousingInventory";
import SITE_025 from "./SITE_025_HousingBudget";
import SITE_026 from "./SITE_026_HousingInvoicing";
import SITE_027 from "./SITE_027_CheckInOut";
import SITE_028 from "./SITE_028_RoomingList";
import SITE_029 from "./SITE_029_TransportCoordination";
import SITE_030 from "./SITE_030_VIPHousing";
import SITE_031 from "./SITE_031_AttritionManagement";
import SITE_032 from "./SITE_032_HousingCommunications";
import SITE_033 from "./SITE_033_PostEventReconciliation";
import SITE_034 from "./SITE_034_GroupRoomBlock";
import SITE_035 from "./SITE_035_HousingReporting";
import SITE_036 from "./SITE_036_HotelServiceLevel";
import SITE_037 from "./SITE_037_RoomBlockRelease";
import SITE_038 from "./SITE_038_HousingCompliance";
import SITE_039 from "./SITE_039_HousingTechnology";
import SITE_040 from "./SITE_040_HousingEmergency";

export const SKILL16_AGENTS = {
  "SITE-021": SITE_021,
  "SITE-022": SITE_022,
  "SITE-023": SITE_023,
  "SITE-024": SITE_024,
  "SITE-025": SITE_025,
  "SITE-026": SITE_026,
  "SITE-027": SITE_027,
  "SITE-028": SITE_028,
  "SITE-029": SITE_029,
  "SITE-030": SITE_030,
  "SITE-031": SITE_031,
  "SITE-032": SITE_032,
  "SITE-033": SITE_033,
  "SITE-034": SITE_034,
  "SITE-035": SITE_035,
  "SITE-036": SITE_036,
  "SITE-037": SITE_037,
  "SITE-038": SITE_038,
  "SITE-039": SITE_039,
  "SITE-040": SITE_040,
};

export const SKILL16_METADATA = {
  skillId: "skill-16",
  skillName: "Housing Management",
  description: "숙박 관리 - 호텔 블록 협상, 객실 배정, VIP 관리, 인보이스 처리",
  agentCount: 20,
  subSkills: [
    { id: "16.1", name: "Hotel Contracting", agents: ["SITE-021", "SITE-034"] },
    { id: "16.2", name: "Room Management", agents: ["SITE-022", "SITE-023", "SITE-028"] },
    { id: "16.3", name: "Inventory Control", agents: ["SITE-024", "SITE-037"] },
    { id: "16.4", name: "Budget Control", agents: ["SITE-025", "SITE-031"] },
    { id: "16.5", name: "Financial Management", agents: ["SITE-026", "SITE-033"] },
    { id: "16.6", name: "Guest Services", agents: ["SITE-027"] },
    { id: "16.7", name: "Transportation Coordination", agents: ["SITE-029"] },
    { id: "16.8", name: "VIP Services", agents: ["SITE-030"] },
    { id: "16.9", name: "Communications", agents: ["SITE-032"] },
    { id: "16.10", name: "Reporting & Analytics", agents: ["SITE-035"] },
    { id: "16.11", name: "Service Quality", agents: ["SITE-036"] },
    { id: "16.12", name: "Compliance", agents: ["SITE-038"] },
    { id: "16.13", name: "Technology Integration", agents: ["SITE-039"] },
    { id: "16.14", name: "Emergency Response", agents: ["SITE-040"] },
  ],
};

export default SKILL16_AGENTS;
