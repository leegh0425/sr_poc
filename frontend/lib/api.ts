interface SRPayload {
  title: string
  team: string
  assignee: string
  description: string
  category: string
  priority: string
  system_name: string
  request_date: string
  requester: string
  summary: string | null
  attachment_url: string | null
  due_date?: string | null
  reply_email?: string | null
}

interface SRResponse {
  id: number
  ticket_id: string
  status: string
  notion_page_id?: string
}

export async function submitSR(payload: SRPayload): Promise<SRResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

  const response = await fetch(`${apiUrl}/api/sr/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}
