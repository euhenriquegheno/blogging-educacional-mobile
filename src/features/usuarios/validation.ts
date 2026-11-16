export interface UsuarioFormValues {
  nome: string
  email: string
  cpf: string
  senha: string
}

export type UsuarioFormErrors = Partial<Record<keyof UsuarioFormValues, string>>

export function validateUsuario(values: UsuarioFormValues, isEdit: boolean): UsuarioFormErrors {
  const errors: UsuarioFormErrors = {}
  if (!values.nome.trim()) errors.nome = 'Informe o nome'
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'E-mail inválido'
  if (values.cpf.replace(/\D/g, '').length !== 11) errors.cpf = 'CPF deve ter 11 dígitos'
  if (!isEdit && values.senha.length < 6) errors.senha = 'Senha deve ter ao menos 6 caracteres'
  if (isEdit && values.senha && values.senha.length < 6) errors.senha = 'Senha deve ter ao menos 6 caracteres'
  return errors
}
