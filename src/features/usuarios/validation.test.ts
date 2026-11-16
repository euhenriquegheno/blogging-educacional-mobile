import { validateUsuario } from './validation'

const ok = { nome: 'Ana', email: 'ana@escola.com', cpf: '123.456.789-00', senha: '123456' }

describe('validateUsuario', () => {
  it('aceita dados válidos', () => {
    expect(validateUsuario(ok, false)).toEqual({})
  })
  it('exige senha na criação, mas não na edição', () => {
    expect(validateUsuario({ ...ok, senha: '' }, false).senha).toBeDefined()
    expect(validateUsuario({ ...ok, senha: '' }, true).senha).toBeUndefined()
  })
  it('valida e-mail, CPF e nome', () => {
    const e = validateUsuario({ nome: ' ', email: 'x', cpf: '1', senha: '123456' }, false)
    expect(Object.keys(e).sort()).toEqual(['cpf', 'email', 'nome'])
  })
})
