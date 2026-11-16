import { isTokenExpired, sessionUserFromToken } from './jwt'

function makeToken(payload: object) {
  const enc = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${enc({ alg: 'HS256' })}.${enc(payload)}.sig`
}

describe('jwt', () => {
  it('extrai id e tipo do payload', () => {
    expect(sessionUserFromToken(makeToken({ sub: 7, tipo: 2 }))).toEqual({ id: 7, tipo: 2 })
  })

  it('rejeita token malformado ou com tipo inválido', () => {
    expect(sessionUserFromToken('abc')).toBeNull()
    expect(sessionUserFromToken(makeToken({ sub: 1, tipo: 99 }))).toBeNull()
  })

  it('detecta expiração (sessão de 24h)', () => {
    const now = Date.now()
    const valid = makeToken({ sub: 1, tipo: 3, exp: Math.floor(now / 1000) + 86400 })
    const expired = makeToken({ sub: 1, tipo: 3, exp: Math.floor(now / 1000) - 10 })
    expect(isTokenExpired(valid, now)).toBe(false)
    expect(isTokenExpired(expired, now)).toBe(true)
    expect(isTokenExpired('lixo')).toBe(true)
  })
})
