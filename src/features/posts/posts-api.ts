import { apiClient } from '../../services/api-client'
import { Comentario, Publicacao, PublicacaoInput } from '../../types'

/** O backend registra a data em `criado_em`; o app usa `criadoEm`. Aceita os dois nomes. */
function withCreatedAt<T extends { criadoEm?: string }>(item: T): T {
  const raw = item as T & { criado_em?: string }
  return raw.criadoEm || !raw.criado_em ? item : { ...item, criadoEm: raw.criado_em }
}

export const listPosts = (page: number, limit: number) =>
  apiClient<Publicacao[]>('/posts', { query: { page, limit } }).then((l) => l.map(withCreatedAt))

export const searchPosts = (q: string) =>
  apiClient<Publicacao[]>('/posts/search', { query: { q } }).then((l) => l.map(withCreatedAt))

export const getPost = (id: string) => apiClient<Publicacao>(`/posts/${id}`).then(withCreatedAt)

export const createPost = (input: PublicacaoInput) =>
  apiClient<Publicacao>('/posts', { method: 'POST', body: input })

export const updatePost = (id: string, input: PublicacaoInput) =>
  apiClient<Publicacao>(`/posts/${id}`, { method: 'PUT', body: input })

export const deletePost = (id: string) => apiClient<void>(`/posts/${id}`, { method: 'DELETE' })

export const listComments = (postId: string, page = 1, limit = 50) =>
  apiClient<Comentario[]>(`/posts/${postId}/comments`, { query: { page, limit } }).then((l) =>
    l.map(withCreatedAt),
  )

export const deleteComment = (id: string) => apiClient<void>(`/comments/${id}`, { method: 'DELETE' })

export const createComment = (postId: string, conteudo: string) =>
  apiClient<Comentario>(`/posts/${postId}/comments`, { method: 'POST', body: { conteudo } })
