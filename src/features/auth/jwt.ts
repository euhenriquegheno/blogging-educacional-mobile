import { SessionUser, TipoUsuario } from '../../types'

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** Decodificador base64 puro (não depende de `atob`/Buffer no Hermes). */
function decodeBase64(input: string): string {
  const clean = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '')
  let bits = 0
  let value = 0
  let bytes = ''
  for (const char of clean) {
    const index = BASE64.indexOf(char)
    if (index === -1) throw new Error('base64 inválido')
    value = (value << 6) | index
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes += String.fromCharCode((value >> bits) & 0xff)
    }
  }
  // bytes -> UTF-8
  try {
    return decodeURIComponent(
      bytes
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
  } catch {
    return bytes
  }
}

interface JwtPayload {
  sub: number | string
  tipo: number
  exp?: number
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    return JSON.parse(decodeBase64(parts[1]!)) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string, now = Date.now()): boolean {
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= now
}

export function sessionUserFromToken(token: string): SessionUser | null {
  const payload = decodeJwt(token)
  if (!payload) return null
  const tipo = Number(payload.tipo)
  if (![TipoUsuario.ADMINISTRADOR, TipoUsuario.PROFESSOR, TipoUsuario.ALUNO].includes(tipo as TipoUsuario)) {
    return null
  }
  return { id: Number(payload.sub), tipo: tipo as TipoUsuario }
}
