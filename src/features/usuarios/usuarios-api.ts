import { apiClient } from '../../services/api-client'
import { TipoUsuario, Usuario, UsuarioInput } from '../../types'

export const listUsuarios = (tipo: TipoUsuario, page: number, limit: number) =>
  apiClient<Usuario[]>('/user', { query: { tipo, page, limit } })

export const getUsuario = (id: number) => apiClient<Usuario>(`/user/${id}`)

export const createUsuario = (input: UsuarioInput) =>
  apiClient<Usuario>('/user', { method: 'POST', body: input })

export const updateUsuario = (id: number, input: UsuarioInput) =>
  apiClient<Usuario>(`/user/${id}`, { method: 'PUT', body: input })

export const deleteUsuario = (id: number) => apiClient<void>(`/user/${id}`, { method: 'DELETE' })
