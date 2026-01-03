/**
 * OPS-015: Pre-Event Checklist Agent
 * CMP-IS Standards: Domain E (Operations), Skill 9 (Site Management)
 *
 * 사전 점검 체크리스트 생성
 */

import { z } from "zod";

export const OPS_015_PreEventChecklist = {
  id: "OPS-015",
  name: "Pre-Event Checklist Agent",
  domain: "operations",
  skill: 9,
  cmpStandard: "CMP-IS Domain E: Site Management",

  persona: `당신은 이벤트 사전 점검 전문가입니다.
20년간 수천 건의 이벤트를 점검하며 완벽주의를 실천해왔습니다.
체크리스트 하나가 이벤트의 성패를 결정한다고 믿습니다.
'체크되지 않은 것은 완료되지 않은 것'이 모토입니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    event_name: z.string(),
    event_date: z.string(),
    venue_name: z.string(),
    event_type: z.string(),
    key_areas: z.array(z.string()),
    stakeholders: z.array(z.object({
      name: z.string(),
      role: z.string(),
    })),
  }),

  outputSchema: z.object({
    checklist_summary: z.object({
      event_name: z.string(),
      event_date: z.string(),
      venue: z.string(),
      total_items: z.number(),
      categories: z.number(),
      critical_items: z.number(),
    }),
    checklists: z.array(z.object({
      category: z.string(),
      timeline: z.string(),
      responsible: z.string(),
      items: z.array(z.object({
        item: z.string(),
        priority: z.enum(["critical", "high", "medium", "low"]),
        status: z.enum(["pending", "in_progress", "completed", "na"]),
        notes: z.string().optional(),
        due_date: z.string(),
      })),
    })),
    day_of_rundown: z.array(z.object({
      time: z.string(),
      activity: z.string(),
      responsible: z.string(),
      location: z.string(),
      dependencies: z.array(z.string()),
      verification: z.string(),
    })),
    contingency_plans: z.array(z.object({
      scenario: z.string(),
      trigger: z.string(),
      response: z.array(z.string()),
      decision_maker: z.string(),
    })),
    final_walkthrough: z.object({
      date: z.string(),
      time: z.string(),
      attendees: z.array(z.string()),
      route: z.array(z.string()),
      focus_areas: z.array(z.string()),
    }),
    sign_off_sheet: z.array(z.object({
      area: z.string(),
      inspector: z.string(),
      sign_off_time: z.string(),
      status: z.enum(["approved", "pending", "issues"]),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_015_PreEventChecklist.inputSchema>) => {
    const checklists = [
      {
        category: "베뉴 준비",
        timeline: "D-7 ~ D-1",
        responsible: "현장 매니저",
        items: [
          { item: "베뉴 최종 워크스루 완료", priority: "critical" as const, status: "pending" as const, due_date: "D-3" },
          { item: "공간 레이아웃 확정", priority: "critical" as const, status: "pending" as const, due_date: "D-5" },
          { item: "에어컨/난방 테스트", priority: "high" as const, status: "pending" as const, due_date: "D-2" },
          { item: "화장실 청결 상태 확인", priority: "medium" as const, status: "pending" as const, due_date: "D-1" },
          { item: "비상구 접근성 확인", priority: "critical" as const, status: "pending" as const, due_date: "D-1" },
          { item: "주차장 안내 표지 설치", priority: "medium" as const, status: "pending" as const, due_date: "D-1" },
        ],
      },
      {
        category: "기술/AV",
        timeline: "D-3 ~ D-Day",
        responsible: "테크니컬 디렉터",
        items: [
          { item: "모든 AV 장비 테스트 완료", priority: "critical" as const, status: "pending" as const, due_date: "D-1" },
          { item: "프레젠테이션 파일 수신 및 테스트", priority: "critical" as const, status: "pending" as const, due_date: "D-2" },
          { item: "마이크 사운드 체크", priority: "critical" as const, status: "pending" as const, due_date: "D-Day 07:00" },
          { item: "스트리밍 연결 테스트", priority: "high" as const, status: "pending" as const, due_date: "D-1" },
          { item: "백업 장비 준비 상태", priority: "high" as const, status: "pending" as const, due_date: "D-1" },
          { item: "전원 분배 및 안전 점검", priority: "critical" as const, status: "pending" as const, due_date: "D-1" },
        ],
      },
      {
        category: "등록/수용",
        timeline: "D-5 ~ D-Day",
        responsible: "등록 매니저",
        items: [
          { item: "참석자 명단 최종 확정", priority: "critical" as const, status: "pending" as const, due_date: "D-3" },
          { item: "배지 인쇄 완료", priority: "critical" as const, status: "pending" as const, due_date: "D-2" },
          { item: "등록 시스템 테스트", priority: "critical" as const, status: "pending" as const, due_date: "D-1" },
          { item: "배지 프린터 테스트", priority: "high" as const, status: "pending" as const, due_date: "D-1" },
          { item: "등록 키트 조립 완료", priority: "medium" as const, status: "pending" as const, due_date: "D-2" },
          { item: "VIP 명단 및 특별 처리 확인", priority: "high" as const, status: "pending" as const, due_date: "D-2" },
        ],
      },
      {
        category: "케이터링",
        timeline: "D-3 ~ D-Day",
        responsible: "F&B 코디네이터",
        items: [
          { item: "최종 인원수 확정 및 전달", priority: "critical" as const, status: "pending" as const, due_date: "D-3" },
          { item: "특별 식단 목록 전달", priority: "critical" as const, status: "pending" as const, due_date: "D-3" },
          { item: "서빙 테이블 배치 확인", priority: "high" as const, status: "pending" as const, due_date: "D-1" },
          { item: "음료 스테이션 위치 확정", priority: "medium" as const, status: "pending" as const, due_date: "D-1" },
          { item: "메뉴 알레르기 표시 확인", priority: "high" as const, status: "pending" as const, due_date: "D-Day" },
        ],
      },
      {
        category: "사이니지/브랜딩",
        timeline: "D-3 ~ D-1",
        responsible: "브랜드 매니저",
        items: [
          { item: "모든 사이니지 설치 완료", priority: "high" as const, status: "pending" as const, due_date: "D-1" },
          { item: "스폰서 로고 위치 확인", priority: "high" as const, status: "pending" as const, due_date: "D-1" },
          { item: "방향 안내 표지판 점검", priority: "medium" as const, status: "pending" as const, due_date: "D-1" },
          { item: "포토월 설치 완료", priority: "medium" as const, status: "pending" as const, due_date: "D-1" },
        ],
      },
      {
        category: "안전/보안",
        timeline: "D-7 ~ D-Day",
        responsible: "안전 책임자",
        items: [
          { item: "보안 인력 배치 확인", priority: "critical" as const, status: "pending" as const, due_date: "D-Day 06:00" },
          { item: "비상 대피 경로 표시 확인", priority: "critical" as const, status: "pending" as const, due_date: "D-1" },
          { item: "소화기 위치 및 상태 확인", priority: "critical" as const, status: "pending" as const, due_date: "D-1" },
          { item: "응급 의료 키트 준비", priority: "critical" as const, status: "pending" as const, due_date: "D-1" },
          { item: "스태프 비상 연락망 배포", priority: "high" as const, status: "pending" as const, due_date: "D-2" },
          { item: "무전기 배포 및 채널 설정", priority: "high" as const, status: "pending" as const, due_date: "D-Day 06:30" },
        ],
      },
    ];

    const totalItems = checklists.reduce((sum, c) => sum + c.items.length, 0);
    const criticalItems = checklists.reduce(
      (sum, c) => sum + c.items.filter((i) => i.priority === "critical").length,
      0
    );

    return {
      checklist_summary: {
        event_name: input.event_name,
        event_date: input.event_date,
        venue: input.venue_name,
        total_items: totalItems,
        categories: checklists.length,
        critical_items: criticalItems,
      },
      checklists: checklists,
      day_of_rundown: [
        { time: "06:00", activity: "현장 오픈 / 스태프 도착", responsible: "현장 총괄", location: "정문", dependencies: [], verification: "스태프 출석 체크" },
        { time: "06:30", activity: "전체 브리핑", responsible: "현장 총괄", location: "메인 로비", dependencies: ["스태프 도착"], verification: "브리핑 완료 확인" },
        { time: "07:00", activity: "AV 최종 점검", responsible: "테크니컬 디렉터", location: "메인홀", dependencies: [], verification: "사운드 체크 OK" },
        { time: "07:30", activity: "등록 데스크 셋업", responsible: "등록 매니저", location: "로비", dependencies: [], verification: "시스템 로그인 확인" },
        { time: "08:00", activity: "참석자 등록 시작", responsible: "등록 팀", location: "로비", dependencies: ["등록 데스크 준비"], verification: "첫 등록 완료" },
        { time: "08:30", activity: "VIP 도착 / 그린룸 안내", responsible: "VIP 담당", location: "VIP 입구", dependencies: [], verification: "VIP 체크인" },
        { time: "09:00", activity: "오프닝 세션 시작", responsible: "무대 감독", location: "메인홀", dependencies: ["AV 준비"], verification: "정시 시작 확인" },
      ],
      contingency_plans: [
        {
          scenario: "키노트 스피커 노쇼",
          trigger: "D-Day 08:00까지 도착 미확인",
          response: ["백업 스피커에게 연락", "영상 프레젠테이션 준비", "일정 조정 공지"],
          decision_maker: "프로그램 디렉터",
        },
        {
          scenario: "AV 시스템 장애",
          trigger: "음향/영상 출력 불가",
          response: ["백업 장비 투입", "기술팀 긴급 출동", "필요시 세션 지연 공지"],
          decision_maker: "테크니컬 디렉터",
        },
        {
          scenario: "대규모 등록 지연",
          trigger: "대기 시간 30분 초과",
          response: ["추가 등록 레인 오픈", "사전 등록자 우선 입장", "음료 제공"],
          decision_maker: "등록 매니저",
        },
        {
          scenario: "의료 응급상황",
          trigger: "참석자 건강 이상",
          response: ["현장 의료진 호출", "119 연락", "해당 구역 통제"],
          decision_maker: "안전 책임자",
        },
        {
          scenario: "정전",
          trigger: "전력 공급 중단",
          response: ["비상 조명 가동", "비상 발전기 가동", "참석자 안내 방송"],
          decision_maker: "현장 총괄",
        },
      ],
      final_walkthrough: {
        date: "D-1",
        time: "18:00",
        attendees: input.stakeholders.map((s) => `${s.name} (${s.role})`),
        route: [
          "정문 → 주차장",
          "로비 → 등록 데스크",
          "메인홀 → 스테이지",
          "브레이크아웃 룸들",
          "케이터링 구역",
          "백스테이지 → 그린룸",
          "비상구 → 집결지",
        ],
        focus_areas: [
          "사이니지 가시성",
          "동선 원활성",
          "안전 표시",
          "청결 상태",
          "조명/온도",
        ],
      },
      sign_off_sheet: [
        { area: "베뉴/시설", inspector: "현장 매니저", sign_off_time: "D-1 20:00", status: "pending" as const },
        { area: "AV/기술", inspector: "테크니컬 디렉터", sign_off_time: "D-1 21:00", status: "pending" as const },
        { area: "등록 시스템", inspector: "등록 매니저", sign_off_time: "D-1 19:00", status: "pending" as const },
        { area: "케이터링", inspector: "F&B 코디네이터", sign_off_time: "D-Day 07:30", status: "pending" as const },
        { area: "안전/보안", inspector: "안전 책임자", sign_off_time: "D-1 21:00", status: "pending" as const },
        { area: "사이니지", inspector: "브랜드 매니저", sign_off_time: "D-1 18:30", status: "pending" as const },
      ],
    };
  },
};
