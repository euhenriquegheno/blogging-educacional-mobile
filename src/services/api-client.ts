import axios, { AxiosError } from 'axios'
import { API_URL } from '../config/env'

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(message: string, status: number, data: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface ClientConfig {
  getToken: () => string | null
  /** Chamado quando a API responde 401 a uma requisição autenticada (token expirado/inválido). */
  onUnauthorized: () => void
}

let config: ClientConfig = { getToken: () => null, onUnauthorized: () => {} }

export function configureApiClient(next: ClientConfig) {
  config = next
}

/** Instância Axios compartilhada (exportada para testes). */
export const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

// Injeta o JWT em toda requisição autenticada
http.interceptors.request.use((request) => {
  const token = config.getToken()
  if (token) request.headers.set('Authorization', `Bearer ${token}`)
  return request
})

function messageFrom(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message
    if (typeof message === 'string') {
      if (status === 400 && message === 'Validation error') return 'Dados inválidos. Revise os campos.'
      return message
    }
  }
  return `Erro ao comunicar com a API (${status})`
}

// Converte qualquer falha do Axios em ApiError e encerra a sessão em 401
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error
    const { response, code } = error as AxiosError

    if (!response) {
      throw new ApiError(
        code === 'ECONNABORTED'
          ? 'O servidor demorou demais para responder. Tente novamente.'
          : `Não foi possível conectar ao servidor (${API_URL}). Verifique a conexão e a URL da API.`,
        0,
      )
    }

    if (response.status === 401 && config.getToken()) config.onUnauthorized()
    throw new ApiError(messageFrom(response.data, response.status), response.status, response.data)
  },
)

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined>
}

export async function apiClient<T = unknown>(
  path: string,
  { method = 'GET', body, query }: RequestOptions = {},
): Promise<T> {
  const params = query
    ? Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''))
    : undefined

  const response = await http.request({ url: path, method, data: body, params })

  // 204 No Content chega como string vazia
  if (response.status === 204 || response.data === '') return null as T
  return response.data as T
}
