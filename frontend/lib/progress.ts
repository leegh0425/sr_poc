// Calculate form completion progress

export interface ProgressData {
  company?: string
  department?: string
  requester?: string
  title?: string
  system_name?: string
  assignee?: string
  category?: string
  request_date?: string | Date
  description?: string
  attachment_url?: string
}

const REQUIRED_FIELDS = [
  "company",
  "department",
  "requester",
  "title",
  "system_name",
  "assignee",
  "category",
  "request_date",
  "description",
  "attachment_url",
] as const

export const calculateProgress = (data: Partial<ProgressData>): number => {
  const filledCount = REQUIRED_FIELDS.filter((field) => {
    const value = data[field]
    if (value === undefined || value === null) {
      return false
    }

    if (value instanceof Date) {
      return !Number.isNaN(value.getTime())
    }

    return value.toString().trim().length > 0
  }).length

  return Math.round((filledCount / REQUIRED_FIELDS.length) * 100)
}
