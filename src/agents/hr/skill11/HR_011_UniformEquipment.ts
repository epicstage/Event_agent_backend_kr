/**
 * HR-011: Uniform & Equipment Planning
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 유니폼 및 장비 계획
 */

import { z } from "zod";

export const HR_011_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_theme: z.string().optional(),
  staff_count: z.number(),
  departments: z.array(z.object({
    name: z.string(),
    count: z.number(),
    outdoor_work: z.boolean(),
  })),
  event_dates: z.array(z.string()),
  venue_type: z.enum(["indoor", "outdoor", "mixed"]),
  season: z.enum(["spring", "summer", "fall", "winter"]),
  budget_per_person: z.number().optional(),
});

export const HR_011_OutputSchema = z.object({
  event_id: z.string(),
  uniform_plan: z.object({
    design_concept: z.string(),
    color_scheme: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
    }),
    items: z.array(z.object({
      item: z.string(),
      description: z.string(),
      quantity_per_person: z.number(),
      sizes_needed: z.array(z.string()),
      customization: z.array(z.string()),
      estimated_cost: z.number(),
    })),
    department_distinctions: z.array(z.object({
      department: z.string(),
      distinction_method: z.string(),
      items: z.array(z.string()),
    })),
  }),
  equipment_plan: z.object({
    personal_equipment: z.array(z.object({
      item: z.string(),
      purpose: z.string(),
      quantity_per_person: z.number(),
      departments: z.array(z.string()),
      estimated_cost: z.number(),
    })),
    shared_equipment: z.array(z.object({
      item: z.string(),
      purpose: z.string(),
      total_quantity: z.number(),
      locations: z.array(z.string()),
      estimated_cost: z.number(),
    })),
    communication_devices: z.object({
      type: z.string(),
      quantity: z.number(),
      channels: z.array(z.object({
        channel: z.string(),
        assigned_to: z.string(),
      })),
    }),
  }),
  size_distribution: z.array(z.object({
    size: z.string(),
    percentage: z.number(),
    quantity: z.number(),
  })),
  procurement_timeline: z.array(z.object({
    task: z.string(),
    deadline: z.string(),
    responsible: z.string(),
  })),
  budget_summary: z.object({
    uniform_total: z.number(),
    equipment_total: z.number(),
    contingency: z.number(),
    grand_total: z.number(),
  }),
});

export type HR_011_Input = z.infer<typeof HR_011_InputSchema>;
export type HR_011_Output = z.infer<typeof HR_011_OutputSchema>;

const SIZE_DISTRIBUTION = [
  { size: "XS", percentage: 5 },
  { size: "S", percentage: 20 },
  { size: "M", percentage: 35 },
  { size: "L", percentage: 25 },
  { size: "XL", percentage: 10 },
  { size: "XXL", percentage: 5 },
];

export async function execute(input: HR_011_Input): Promise<HR_011_Output> {
  const isOutdoor = input.venue_type !== "indoor";
  const isCold = input.season === "winter" || input.season === "fall";
  const isHot = input.season === "summer";

  // 기본 유니폼 아이템
  const uniformItems = [
    {
      item: "이벤트 티셔츠",
      description: isCold ? "긴팔 면 티셔츠, 행사 로고 프린트" : "반팔 면 티셔츠, 행사 로고 프린트",
      quantity_per_person: input.event_dates.length > 1 ? 2 : 1,
      sizes_needed: SIZE_DISTRIBUTION.map((s) => s.size),
      customization: ["행사 로고", "스태프 텍스트", "부서 컬러"],
      estimated_cost: 15000,
    },
    {
      item: "명찰/ID 카드",
      description: "이름, 역할, 사진 포함 목걸이형 ID 카드",
      quantity_per_person: 1,
      sizes_needed: ["Free"],
      customization: ["이름", "역할", "부서 컬러 띠"],
      estimated_cost: 3000,
    },
  ];

  if (isCold) {
    uniformItems.push({
      item: "이벤트 점퍼/자켓",
      description: "방풍 기능성 자켓, 행사 로고 자수",
      quantity_per_person: 1,
      sizes_needed: SIZE_DISTRIBUTION.map((s) => s.size),
      customization: ["행사 로고 자수", "부서 와펜"],
      estimated_cost: 45000,
    });
  }

  if (isOutdoor) {
    uniformItems.push({
      item: "캡/모자",
      description: isHot ? "통기성 캡" : "방한 비니",
      quantity_per_person: 1,
      sizes_needed: ["Free"],
      customization: ["행사 로고"],
      estimated_cost: 8000,
    });
  }

  // 부서별 구분
  const departmentDistinctions = input.departments.map((dept) => ({
    department: dept.name,
    distinction_method: "컬러 배지 및 완장",
    items: [
      `${dept.name} 컬러 완장`,
      dept.outdoor_work ? "반사 조끼" : "부서명 배지",
    ],
  }));

  // 개인 장비
  const personalEquipment = [
    {
      item: "스태프 핸드북",
      purpose: "행사 정보 및 비상 연락망 참조",
      quantity_per_person: 1,
      departments: input.departments.map((d) => d.name),
      estimated_cost: 2000,
    },
    {
      item: "볼펜 및 메모장",
      purpose: "현장 기록",
      quantity_per_person: 1,
      departments: input.departments.map((d) => d.name),
      estimated_cost: 1500,
    },
  ];

  // 부서별 추가 장비
  for (const dept of input.departments) {
    if (dept.name.includes("등록") || dept.name.includes("안내")) {
      personalEquipment.push({
        item: "태블릿 파우치",
        purpose: "등록 기기 휴대",
        quantity_per_person: 1,
        departments: [dept.name],
        estimated_cost: 5000,
      });
    }
    if (dept.name.includes("보안") || dept.name.includes("안전")) {
      personalEquipment.push({
        item: "손전등",
        purpose: "야간 순찰 및 비상 시",
        quantity_per_person: 1,
        departments: [dept.name],
        estimated_cost: 8000,
      });
    }
    if (dept.outdoor_work) {
      personalEquipment.push({
        item: isHot ? "쿨링 타월" : "핫팩",
        purpose: isHot ? "더위 대응" : "추위 대응",
        quantity_per_person: isHot ? 1 : 3,
        departments: [dept.name],
        estimated_cost: isHot ? 5000 : 3000,
      });
    }
  }

  // 공용 장비
  const sharedEquipment = [
    {
      item: "구급함",
      purpose: "응급 처치",
      total_quantity: Math.ceil(input.staff_count / 50),
      locations: ["스태프 라운지", "등록 데스크", "현장 본부"],
      estimated_cost: 50000,
    },
    {
      item: "우산/우비",
      purpose: "우천 대비",
      total_quantity: Math.ceil(input.staff_count * 0.3),
      locations: ["비상 물품 창고"],
      estimated_cost: 5000,
    },
    {
      item: "충전기 (멀티)",
      purpose: "기기 충전",
      total_quantity: Math.ceil(input.staff_count / 20),
      locations: ["스태프 라운지", "각 부서 데스크"],
      estimated_cost: 25000,
    },
  ];

  // 무전기 계획
  const radioQuantity = Math.ceil(input.staff_count * 0.15) + input.departments.length;
  const communicationDevices = {
    type: "디지털 무전기",
    quantity: radioQuantity,
    channels: [
      { channel: "CH 1", assigned_to: "총괄 및 매니저" },
      { channel: "CH 2", assigned_to: "등록/안내팀" },
      { channel: "CH 3", assigned_to: "보안/안전팀" },
      { channel: "CH 4", assigned_to: "케이터링/시설팀" },
      { channel: "CH 5", assigned_to: "기술/AV팀" },
      { channel: "CH 9", assigned_to: "비상 전용" },
    ],
  };

  // 사이즈 분포 계산
  const sizeDistribution = SIZE_DISTRIBUTION.map((s) => ({
    size: s.size,
    percentage: s.percentage,
    quantity: Math.ceil(input.staff_count * (s.percentage / 100)),
  }));

  // 예산 계산
  const uniformTotal = uniformItems.reduce(
    (sum, item) => sum + item.estimated_cost * item.quantity_per_person * input.staff_count,
    0
  );
  const personalEquipTotal = personalEquipment.reduce((sum, item) => {
    const deptCount = item.departments.reduce((c, d) => {
      const found = input.departments.find((dept) => dept.name === d);
      return c + (found?.count || 0);
    }, 0);
    return sum + item.estimated_cost * item.quantity_per_person * (deptCount || input.staff_count);
  }, 0);
  const sharedEquipTotal = sharedEquipment.reduce(
    (sum, item) => sum + item.estimated_cost * item.total_quantity,
    0
  );
  const radioTotal = radioQuantity * 150000; // 무전기 대여 비용
  const equipmentTotal = personalEquipTotal + sharedEquipTotal + radioTotal;
  const contingency = Math.round((uniformTotal + equipmentTotal) * 0.1);

  return {
    event_id: input.event_id,
    uniform_plan: {
      design_concept: `${input.event_name} 스태프 유니폼 - 통일감 있고 전문적인 이미지 연출`,
      color_scheme: {
        primary: "네이비 블루",
        secondary: "화이트",
        accent: "오렌지 (이벤트 포인트 컬러)",
      },
      items: uniformItems,
      department_distinctions: departmentDistinctions,
    },
    equipment_plan: {
      personal_equipment: personalEquipment,
      shared_equipment: sharedEquipment,
      communication_devices: communicationDevices,
    },
    size_distribution: sizeDistribution,
    procurement_timeline: [
      { task: "유니폼 디자인 확정", deadline: "D-45", responsible: "HR/마케팅" },
      { task: "사이즈 수집 완료", deadline: "D-30", responsible: "HR" },
      { task: "유니폼 주문", deadline: "D-28", responsible: "HR" },
      { task: "장비 발주", deadline: "D-21", responsible: "운영팀" },
      { task: "무전기 대여 계약", deadline: "D-14", responsible: "운영팀" },
      { task: "유니폼 입고 및 검수", deadline: "D-7", responsible: "HR" },
      { task: "장비 입고 및 테스트", deadline: "D-5", responsible: "운영팀" },
      { task: "스태프별 배포 준비", deadline: "D-3", responsible: "HR" },
      { task: "온보딩 시 배포", deadline: "D-2", responsible: "HR" },
    ],
    budget_summary: {
      uniform_total: uniformTotal,
      equipment_total: equipmentTotal,
      contingency,
      grand_total: uniformTotal + equipmentTotal + contingency,
    },
  };
}

export const HR_011_UniformEquipment = {
  id: "HR-011",
  name: "Uniform & Equipment Planning",
  description: "유니폼 및 장비 계획",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.11",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_011_InputSchema,
  outputSchema: HR_011_OutputSchema,
  persona: `당신은 이벤트 유니폼 및 장비 전문가입니다. 스태프의 전문성과 소속감을 높이는 유니폼 디자인과 효율적인 업무 수행을 위한 장비를 계획합니다.`,
};

export default HR_011_UniformEquipment;
