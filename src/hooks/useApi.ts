import { api } from '../lib/api'

const API_URL = import.meta.env.VITE_API_URL

export function useApi() {
  return {
    get: <T = unknown>(path: string) => api<T>(path),

    post: <T = unknown>(path: string, body: unknown) =>
      api<T>(path, { method: 'POST', body }),

    put: <T = unknown>(path: string, body: unknown) =>
      api<T>(path, { method: 'PUT', body }),

    patch: <T = unknown>(path: string, body: unknown) =>
      api<T>(path, { method: 'PATCH', body }),

    del: <T = unknown>(path: string) => api<T>(path, { method: 'DELETE' }),

    download: async (path: string): Promise<Blob> => {
      const res = await fetch(`${API_URL}${path}`, { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as any).error || 'Error al descargar el archivo')
      }
      return res.blob()
    },
  }
}
