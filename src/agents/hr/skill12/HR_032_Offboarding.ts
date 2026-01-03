/**
 * HR-032: Staff Offboarding & Checkout
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 스태프 철수 및 체크아웃 관리
 */

import { z } from "zod";

export const HR_032_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_end_time: z.string(),
  staff_records: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    department: z.string(),
    employment_type: z.enum(["full_time", "part_time", "contractor", "volunteer"]),
    issued_items: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      serial_number: z.string().optional(),
    })),
    locker_assigned: z.string().optional(),
    final_shift_end: z.string(),
  })),
  checkout_locations: z.array(z.string()),
});

export const HR_032_OutputSchema = z.object({
  event_id: z.string(),
  offboarding_plan: z.object({
    total_staff: z.number(),
    checkout_stations: z.number(),
    estimated_duration: z.string(),
    peak_checkout_time: z.string(),
  }),
  checkout_process: z.array(z.object({
    step: z.number(),
    station: z.string(),
    action: z.string(),
    responsible: z.string(),
    estimated_time: z.string(),
  })),
  item_return_checklist: z.object({
    categories: z.array(z.object({
      category: z.string(),
      items: z.array(z.string()),
      return_location: z.string(),
    })),
    tracking_method: z.string(),
    missing_item_procedure: z.string(),
  }),
  staff_schedule: z.array(z.object({
    time_slot: z.string(),
    departments: z.array(z.string()),
    expected_count: z.number(),
  })),
  final_settlements: z.object({
    payment_timeline: z.string(),
    document_distribution: z.array(z.object({
      document: z.string(),
      method: z.string(),
      timeline: z.string(),
    })),
  }),
  feedback_collection: z.object({
    method: z.string(),
    incentive: z.string(),
    deadline: z.string(),
  }),
  post_event_communication: z.array(z.object({
    message_type: z.string(),
    timing: z.string(),
    channel: z.string(),
    content_summary: z.string(),
  })),
});

export type HR_032_Input = z.infer<typeof HR_032_InputSchema>;
export type HR_032_Output = z.infer<typeof HR_032_OutputSchema>;

export async function execute(input: HR_032_Input): Promise<HR_032_Output> {
  const totalStaff = input.staff_records.length;
  const checkoutStations = input.checkout_locations.length;

  // 체크아웃 프로세스
  const checkoutProcess = [
    {
      step: 1,
      station: "물품 반납대",
      action: "유니폼, 배지, 장비 반납 및 상태 확인",
      responsible: "물품 담당",
      estimated_time: "3분",
    },
    {
      step: 2,
      station: "라커 정리",
      action: "개인 소지품 수거 및 라커 반납",
      responsible: "시설 담당",
      estimated_time: "2분",
    },
    {
      step: 3,
      station: "근무 확인대",
      action: "최종 근무 시간 확인 및 서명",
      responsible: "HR 담당",
      estimated_time: "2분",
    },
    {
      step: 4,
      station: "정산 안내대",
      action: "급여 정산 일정 및 서류 안내",
      responsible: "회계 담당",
      estimated_time: "2분",
    },
    {
      step: 5,
      station: "피드백 부스",
      action: "설문 작성 또는 QR 코드 제공",
      responsible: "HR 담당",
      estimated_time: "3분",
    },
  ];

  // 반납 물품 카테고리화
  const allItems = input.staff_records.flatMap((s) => s.issued_items.map((i) => i.item));
  const uniqueItems = [...new Set(allItems)];

  const categories = [
    {
      category: "의류",
      items: uniqueItems.filter((i) => i.includes("유니폼") || i.includes("티셔츠") || i.includes("조끼")),
      return_location: "물품 반납대 A",
    },
    {
      category: "장비",
      items: uniqueItems.filter((i) => i.includes("무전기") || i.includes("이어피스") || i.includes("배터리")),
      return_location: "장비 반납대",
    },
    {
      category: "신분증/배지",
      items: uniqueItems.filter((i) => i.includes("배지") || i.includes("명찰") || i.includes("패스")),
      return_location: "물품 반납대 B",
    },
    {
      category: "기타",
      items: uniqueItems.filter((i) =>
        !i.includes("유니폼") && !i.includes("티셔츠") && !i.includes("조끼") &&
        !i.includes("무전기") && !i.includes("이어피스") && !i.includes("배터리") &&
        !i.includes("배지") && !i.includes("명찰") && !i.includes("패스")
      ),
      return_location: "물품 반납대 C",
    },
  ].filter((c) => c.items.length > 0);

  // 부서별 철수 스케줄
  const departments = [...new Set(input.staff_records.map((s) => s.department))];
  const staffPerDept = Math.ceil(totalStaff / departments.length);

  const staffSchedule = departments.map((dept, idx) => ({
    time_slot: `종료 후 ${idx * 15}분 ~ ${(idx + 1) * 15}분`,
    departments: [dept],
    expected_count: input.staff_records.filter((s) => s.department === dept).length,
  }));

  return {
    event_id: input.event_id,
    offboarding_plan: {
      total_staff: totalStaff,
      checkout_stations: checkoutStations,
      estimated_duration: `${Math.ceil(totalStaff / (checkoutStations * 4))}시간`,
      peak_checkout_time: "행사 종료 직후 30분",
    },
    checkout_process: checkoutProcess,
    item_return_checklist: {
      categories,
      tracking_method: "바코드 스캔 + 체크리스트 서명",
      missing_item_procedure: "분실 사유서 작성 → 변상 여부 결정 → 급여에서 공제 또는 면제",
    },
    staff_schedule: staffSchedule,
    final_settlements: {
      payment_timeline: "행사 종료 후 7일 이내 계좌 입금",
      document_distribution: [
        { document: "급여명세서", method: "이메일", timeline: "급여 지급 당일" },
        { document: "봉사/근무 확인서", method: "이메일 또는 우편", timeline: "요청 시 D+3" },
        { document: "원천징수영수증", method: "이메일", timeline: "다음 해 2월" },
      ],
    },
    feedback_collection: {
      method: "온라인 설문 (QR 코드 제공)",
      incentive: "추첨을 통한 소정의 상품 제공",
      deadline: "행사 종료 후 3일 이내",
    },
    post_event_communication: [
      {
        message_type: "감사 메시지",
        timing: "D+1",
        channel: "문자/카카오톡",
        content_summary: "참여 감사, 급여 지급 일정 안내",
      },
      {
        message_type: "설문 리마인더",
        timing: "D+2",
        channel: "이메일",
        content_summary: "피드백 설문 참여 요청 및 인센티브 안내",
      },
      {
        message_type: "급여 지급 완료",
        timing: "D+7",
        channel: "문자",
        content_summary: "급여 입금 완료 통보",
      },
      {
        message_type: "향후 행사 안내",
        timing: "D+30",
        channel: "이메일",
        content_summary: "다음 행사 우선 참여 기회 안내",
      },
    ],
  };
}

export const HR_032_Offboarding = {
  id: "HR-032",
  name: "Staff Offboarding & Checkout",
  description: "스태프 철수 및 체크아웃 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.17",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_032_InputSchema,
  outputSchema: HR_032_OutputSchema,
  persona: `당신은 행사 마무리 전문가입니다. 체계적인 철수 프로세스로 물품 회수와 원활한 정산을 보장합니다.`,
};

export default HR_032_Offboarding;
