import * as SecureStore from 'expo-secure-store'

const KEY = 'blogging-educacional.token'

export async function loadToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY)
  } catch {
    return null
  }
}

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, token)
  } catch {
    // armazenamento indisponível: a sessão vale só até fechar o app
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY)
  } catch {
    // nada a limpar
  }
}
