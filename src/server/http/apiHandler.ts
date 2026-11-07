import { AppError, toAppError } from '../../shared/errors/AppError'
import { getOrCreateRequestId, REQUEST_ID_HEADER } from '../../shared/http/requestContext'
import type { ApiFailure, ApiResponse, ApiSuccess } from '../../shared/api/types'
import { logger } from '../logging/logger'

export function success<T>(data: T, requestId: string): ApiSuccess<T> {
  return { ok: true, data, meta: { requestId, timestamp: new Date().toISOString() } }
}

export function failure(error: unknown, requestId: string): ApiFailure {
  const appError = toAppError(error)
  return {
    ok: false,
    error: { code: appError.code, message: appError.message, details: appError.details },
    meta: { requestId, timestamp: new Date().toISOString() },
  }
}

export async function handleApiRequest<T>(request: Request, action: () => Promise<T>): Promise<Response> {
  const requestId = getOrCreateRequestId(request.headers)
  try {
    const data = await action()
    return json(success(data, requestId), 200, requestId)
  } catch (error) {
    const appError = error instanceof AppError ? error : toAppError(error)
    logger.error('api_request_failed', { requestId, code: appError.code, error: appError.message })
    return json(failure(appError, requestId), appError.statusCode, requestId)
  }
}

function json<T>(body: ApiResponse<T>, status: number, requestId: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', [REQUEST_ID_HEADER]: requestId },
  })
}
