import { apiClient } from '../../services/api-client'

export async function login(email: string, senha: string): Promise<string> {
  const { token } = await apiClient<{ token: string }>('/login', {
    method: 'POST',
    body: { email, senha },
  })
  return token
}
