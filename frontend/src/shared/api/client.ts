const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  public readonly status: number
  public readonly type?: string
  public readonly fields?: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    type?: string,
    fields?: Record<string, string[]>,
  ) {
    super(message)
    this.status = status
    this.type = type
    this.fields = fields
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      try {
        const refresh = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
        if (refresh.ok) return request<T>(path, options)
        window.dispatchEvent(new CustomEvent('sigel:authentication-expired'))
      } catch {
        window.dispatchEvent(new CustomEvent('sigel:authentication-expired'))
      }
    }
    throw new ApiError(
      body?.message ?? 'Não foi possível concluir a operação.',
      response.status,
      body?.type,
      body?.errors,
    )
  }
  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<null>(path, { method: 'DELETE' }),
}
