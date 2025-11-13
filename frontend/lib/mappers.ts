import type { RequestType } from "./constants"

export function mapRequestTypeToCategory(requestType: RequestType): string {
  // UI label → API category (exact match in this case)
  return requestType
}
