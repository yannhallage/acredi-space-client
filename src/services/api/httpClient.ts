import { env } from '../../app/config/env'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

let accessToken: string | null = null

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(status: number, message: string, payload: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

function buildUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream
  )
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const { body, ...requestOptions } = options

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const requestInit: RequestInit = {
    ...requestOptions,
    headers,
  }

  if (body !== undefined) {
    if (isBodyInit(body)) {
      requestInit.body = body
    } else {
      headers.set('Content-Type', 'application/json')
      requestInit.body = JSON.stringify(body)
    }
  }

  const response = await fetch(buildUrl(path), requestInit)
  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, payload)
  }

  return payload as T
}
