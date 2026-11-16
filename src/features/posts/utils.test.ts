import { excerpt } from './utils'

describe('excerpt', () => {
  it('mantém textos curtos e normaliza espaços', () => {
    expect(excerpt('  olá\n\nmundo ')).toBe('olá mundo')
  })
  it('trunca textos longos com reticências', () => {
    const out = excerpt('a'.repeat(300), 50)
    expect(out.length).toBe(51)
    expect(out.endsWith('…')).toBe(true)
  })
})
