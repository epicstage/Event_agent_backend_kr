/**
 * OPS-039: Real-Time Monitoring Agent
 * CMP-IS Standards: Domain E (Operations), Skill 10 (Logistics)
 */

import { z } from "zod";

export const OPS_039_RealTimeMonitoring = {
  id: "OPS-039",
  name: "Real-Time Monitoring Agent",
  domain: "operations",
  skill: 10,
  cmpStandard: "CMP-IS Domain E: Logistics Management",

  persona: `실시간 모니터링 전문가. 이벤트의 모든 지표를
실시간으로 추적하여 선제적 대응을 가능하게 합니다.`,

  inputSchema: z.object({
    event_id: z.string(),
    monitoring_areas: z.array(z.string()),
    kpis: z.array(z.object({
      name: z.string(),
      target: z.number(),
      unit: z.string(),
    })),
  }),

  outputSchema: z.object({
    dashboard_setup: z.object({
      location: z.string(),
      screens: z.number(),
      displays: z.array(z.object({
        screen: z.number(),
        content: z.array(z.string()),
      })),
    }),
    data_sources: z.array(z.object({
      source: z.string(),
      data_type: z.string(),
      refresh_rate: z.string(),
      integration: z.string(),
    })),
    alert_system: z.array(z.object({
      metric: z.string(),
      threshold: z.string(),
      alert_type: z.string(),
      recipients: z.array(z.string()),
    })),
    real_time_metrics: z.array(z.object({
      category: z.string(),
      metrics: z.array(z.string()),
    })),
    response_protocols: z.array(z.object({
      trigger: z.string(),
      action: z.string(),
      responsible: z.string(),
    })),
  }),

  execute: async (input: z.infer<typeof OPS_039_RealTimeMonitoring.inputSchema>) => {
    return {
      dashboard_setup: {
        location: "컨트롤룸 (백스테이지)",
        screens: 4,
        displays: [
          { screen: 1, content: ["등록 현황", "실시간 인원수", "대기열 상황"] },
          { screen: 2, content: ["세션별 참석률", "피드백 점수", "Q&A 현황"] },
          { screen: 3, content: ["시설 상태", "온도/습도", "전력 사용량"] },
          { screen: 4, content: ["보안 카메라", "SNS 멘션", "라이브 스트림 현황"] },
        ],
      },
      data_sources: [
        {
          source: "등록 시스템",
          data_type: "체크인 수, 대기 시간",
          refresh_rate: "10초",
          integration: "API 연동",
        },
        {
          source: "이벤트 앱",
          data_type: "세션 체크인, 피드백, 폴링",
          refresh_rate: "실시간",
          integration: "웹훅",
        },
        {
          source: "IoT 센서",
          data_type: "온도, 습도, 인원 카운팅",
          refresh_rate: "30초",
          integration: "MQTT",
        },
        {
          source: "SNS 모니터링",
          data_type: "해시태그 멘션, 감성 분석",
          refresh_rate: "1분",
          integration: "서드파티 툴",
        },
        {
          source: "스트리밍 플랫폼",
          data_type: "동접자, 채팅량, 버퍼링률",
          refresh_rate: "10초",
          integration: "API",
        },
      ],
      alert_system: [
        {
          metric: "등록 대기열",
          threshold: "30명 초과 또는 5분 대기",
          alert_type: "SMS + 무전",
          recipients: ["등록팀장", "현장 총괄"],
        },
        {
          metric: "세션 참석률",
          threshold: "수용인원 90% 초과",
          alert_type: "앱 푸시",
          recipients: ["세션 매니저"],
        },
        {
          metric: "온도",
          threshold: "25°C 초과",
          alert_type: "대시보드 경고",
          recipients: ["시설팀"],
        },
        {
          metric: "부정 멘션",
          threshold: "30분 내 5건 이상",
          alert_type: "이메일",
          recipients: ["PR팀", "마케팅"],
        },
        {
          metric: "스트리밍 장애",
          threshold: "버퍼링 5% 초과",
          alert_type: "무전 + 대시보드",
          recipients: ["스트리밍 디렉터"],
        },
      ],
      real_time_metrics: [
        {
          category: "참석",
          metrics: ["총 체크인", "시간대별 입장", "VIP 도착", "노쇼율"],
        },
        {
          category: "세션",
          metrics: ["세션별 참석률", "평균 체류 시간", "Q&A 참여율"],
        },
        {
          category: "만족도",
          metrics: ["실시간 피드백 점수", "NPS", "SNS 감성"],
        },
        {
          category: "운영",
          metrics: ["케이터링 소진율", "화장실 대기", "분실물 접수"],
        },
        {
          category: "기술",
          metrics: ["Wi-Fi 사용량", "앱 활성 사용자", "스트리밍 동접"],
        },
      ],
      response_protocols: [
        {
          trigger: "등록 병목",
          action: "추가 레인 오픈, 사전등록자 우선",
          responsible: "등록팀장",
        },
        {
          trigger: "세션 과밀",
          action: "오버플로우 룸 안내, 스트리밍 유도",
          responsible: "세션 매니저",
        },
        {
          trigger: "온도 이상",
          action: "HVAC 조정 요청",
          responsible: "시설팀",
        },
        {
          trigger: "SNS 위기",
          action: "PR팀 즉시 대응, 사실 확인",
          responsible: "PR팀장",
        },
      ],
    };
  },
};
