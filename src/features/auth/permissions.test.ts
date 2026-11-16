import { Publicacao } from '../../types'
import { canManage, canModifyPost } from './permissions'

const post = { id: 'p', titulo: 't', conteudo: 'c', usuario: { id: 2 } } as Publicacao

describe('permissões', () => {
  it('Aluno e visitante não gerenciam', () => {
    expect(canManage({ id: 3, tipo: 3 })).toBe(false)
    expect(canManage(null)).toBe(false)
  })

  it('Professor edita apenas os próprios posts', () => {
    expect(canModifyPost({ id: 2, tipo: 2 }, post)).toBe(true)
    expect(canModifyPost({ id: 5, tipo: 2 }, post)).toBe(false)
  })

  it('Administrador edita qualquer post; Aluno nenhum', () => {
    expect(canModifyPost({ id: 1, tipo: 1 }, post)).toBe(true)
    expect(canModifyPost({ id: 2, tipo: 3 }, post)).toBe(false)
  })
})
