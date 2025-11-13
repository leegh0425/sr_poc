export const COMPANIES = ["아성다이소", "아성HMP", "아성", "아성솔루션", "한웰","HS"] as const

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
  { name: "권민지", system: "HERP-BIZ", email: "herp-biz@daisoit.co.kr" },
  { name: "하동진", system: "HERP-SCM", email: "herp-scm@daisoit.co.kr" },
  { name: "박종범", system: "DMS", email: "dms@daisoit.co.kr" },
  { name: "강호연", system: "통합HR", email: "hr@daisoit.co.kr" },
  { name: "남채희", system: "그룹웨어", email: "groupware@daisoit.co.kr" },
  { name: "이광현", system: "MS Teams", email: "teams@daisoit.co.kr" },
  { name: "김재도", system: "Mobile Apps", email: "mobile@daisoit.co.kr" },
] as const

export const REQUEST_TYPES = ["장애", "문의", "신규", "개선", "기타"] as const

export type Company = (typeof COMPANIES)[number]
export type System = (typeof SYSTEMS)[number]
export type Assignee = (typeof ASSIGNEES)[number]
export type RequestType = (typeof REQUEST_TYPES)[number]
