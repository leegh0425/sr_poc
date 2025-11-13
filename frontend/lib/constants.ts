export const COMPANIES = ["아성MP", "HS", "랩코", "아성물류", "아성다이소"] as const

export const SYSTEMS = [
  "MS Teams",
  "HERP-NTMS",
  "HERP-BIZ",
  "HERP-SCM",
  "DMS",
  "통합HR",
  "그룹웨어",
  "Mobile-전시회",
  "Mobile-QIS",
  "Mobile-SmartHR",
  "Mobile-DaisoWorks",
  "기타 시스템",
] as const

export const ASSIGNEES = [
  { name: "김인기", system: "HERP-NTMS", email: "ntms@daisoit.co.kr" },
  { name: "이수정", system: "HERP-BIZ", email: "herp-biz@daisoit.co.kr" },
  { name: "박민수", system: "HERP-SCM", email: "herp-scm@daisoit.co.kr" },
  { name: "최지영", system: "DMS", email: "dms@daisoit.co.kr" },
  { name: "정태호", system: "통합HR", email: "hr@daisoit.co.kr" },
  { name: "강서윤", system: "그룹웨어", email: "groupware@daisoit.co.kr" },
  { name: "윤동현", system: "MS Teams", email: "teams@daisoit.co.kr" },
  { name: "한지민", system: "Mobile Apps", email: "mobile@daisoit.co.kr" },
] as const

export const REQUEST_TYPES = ["장애", "문의", "신규", "개선", "기타"] as const

export type Company = (typeof COMPANIES)[number]
export type System = (typeof SYSTEMS)[number]
export type Assignee = (typeof ASSIGNEES)[number]
export type RequestType = (typeof REQUEST_TYPES)[number]
