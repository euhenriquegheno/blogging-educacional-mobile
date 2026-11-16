import { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { ApiError, apiClient, configureApiClient, http } from './api-client'

type Reply = { status: number; data?: unknown } | Error

let lastConfig: InternalAxiosRequestConfig | undefined

/** Adapter falso: exercita os interceptors reais sem rede. */
function reply(result: Reply) {
  http.defaults.adapter = async (cfg: InternalAxiosRequestConfig) => {
    lastConfig = cfg
    if (result instanceof Error) throw result
    const response = { data: result.data ?? '', status: result.status, statusText: '', headers: {}, config: cfg }
    if (result.status >= 200 && result.status < 300) return response
    throw new AxiosError('failed', 'ERR_BAD_REQUEST', cfg, null, response)
  }
}

beforeEach(() => {
  lastConfig = undefined
  configureApiClient({ getToken: () => 'tok', onUnauthorized: jest.fn() })
})

describe('apiClient (Axios)', () => {
  it('envia Authorization, query sem valores vazios e body JSON', async () => {
    reply({ status: 200, data: [{ id: 1 }] })
    const out = await apiClient('/posts', { method: 'POST', query: { page: 2, q: undefined, x: '' }, body: { a: 1 } })
    expect(out).toEqual([{ id: 1 }])
    const cfg = lastConfig as AxiosRequestConfig
    expect(cfg.headers?.Authorization).toBe('Bearer tok')
    expect(cfg.params).toEqual({ page: 2 })
    expect(JSON.parse(cfg.data as string)).toEqual({ a: 1 })
  })

  it('não envia Authorization sem token', async () => {
    configureApiClient({ getToken: () => null, onUnauthorized: jest.fn() })
    reply({ status: 200, data: {} })
    await apiClient('/posts')
    expect(lastConfig?.headers?.Authorization).toBeUndefined()
  })

  it('retorna null em 204', async () => {
    reply({ status: 204 })
    await expect(apiClient('/posts/1', { method: 'DELETE' })).resolves.toBeNull()
  })

  it('lança ApiError com a mensagem da API e aciona onUnauthorized em 401', async () => {
    const onUnauthorized = jest.fn()
    configureApiClient({ getToken: () => 'tok', onUnauthorized })
    reply({ status: 401, data: { message: 'Unauthorized' } })
    await expect(apiClient('/posts')).rejects.toMatchObject({ status: 401, message: 'Unauthorized' })
    expect(onUnauthorized).toHaveBeenCalled()
  })

  it('não encerra a sessão em 401 sem token (ex.: login inválido)', async () => {
    const onUnauthorized = jest.fn()
    configureApiClient({ getToken: () => null, onUnauthorized })
    reply({ status: 401, data: { message: 'Username or password is incorrect' } })
    await expect(apiClient('/login', { method: 'POST', body: {} })).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('traduz erro de validação (400) e falha de rede', async () => {
    reply({ status: 400, data: { message: 'Validation error' } })
    await expect(apiClient('/user')).rejects.toMatchObject({ message: 'Dados inválidos. Revise os campos.' })

    reply(new AxiosError('Network Error', 'ERR_NETWORK'))
    await expect(apiClient('/posts')).rejects.toMatchObject({ status: 0 })
  })
})
