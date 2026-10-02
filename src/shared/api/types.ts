export type RequestId = string

export interface ApiMeta {
  requestId: RequestId
  timestamp: string
}

export interface ApiSuccess<T> {
  ok: true
  data: T
  meta: ApiMeta
}

export interface ApiFailure {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: ApiMeta
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}
