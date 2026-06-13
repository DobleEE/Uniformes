const API_URL = import.meta.env.VITE_API_URL

interface RequestOptions {
  method?: string
  body?: unknown
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body } = options

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.error || 'Error en la peticion') as Error & { status: number }
    err.status = res.status
    throw err
  }

  return data as T
}
