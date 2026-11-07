export const REQUEST_ID_HEADER = 'x-request-id'

export function createRequestId(): string {
  return crypto.randomUUID()
}

export function getOrCreateRequestId(headers?: Headers): string {
  return headers?.get(REQUEST_ID_HEADER) ?? createRequestId()
}

export function withRequestId(headers: HeadersInit = {}, requestId = createRequestId()): Headers {
  const result = new Headers(headers)
  result.set(REQUEST_ID_HEADER, requestId)
  return result
}
