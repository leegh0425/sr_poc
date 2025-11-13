// LocalStorage helpers for form draft auto-save

const STORAGE_KEY = "sr-draft"

export interface SRDraft {
  company?: string
  department?: string
  requester?: string
  title?: string
  system_name?: string
  assignee?: string
  category?: string
  request_date?: string
  due_date?: string
  description?: string
  reply_email?: string
  savedAt?: string
}

export const saveDraft = (data: Partial<SRDraft>) => {
  try {
    const draft = {
      ...data,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error("Failed to save draft:", error)
  }
}

export const loadDraft = (): SRDraft | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Failed to load draft:", error)
    return null
  }
}

export const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear draft:", error)
  }
}
