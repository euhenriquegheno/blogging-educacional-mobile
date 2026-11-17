export const TipoUsuario = {
  ADMINISTRADOR: 1,
  PROFESSOR: 2,
  ALUNO: 3,
} as const

export type TipoUsuario = (typeof TipoUsuario)[keyof typeof TipoUsuario]

export const tipoUsuarioLabel: Record<TipoUsuario, string> = {
  [TipoUsuario.ADMINISTRADOR]: 'Administrador',
  [TipoUsuario.PROFESSOR]: 'Professor',
  [TipoUsuario.ALUNO]: 'Aluno',
}

export interface Usuario {
  id: number
  nome: string
  email: string
  cpf: string
  tipo: TipoUsuario
}

export interface UsuarioInput {
  nome: string
  email: string
  cpf: string
  tipo: TipoUsuario
  senha?: string
}

export interface Publicacao {
  id: string
  titulo: string
  conteudo: string
  criadoEm?: string
  usuario: Usuario
}

export interface PublicacaoInput {
  titulo: string
  conteudo: string
  autorId?: number
}

export interface Comentario {
  id: string
  conteudo: string
  criadoEm: string
  usuario: Pick<Usuario, 'id' | 'nome' | 'email'>
}

/** Usuário autenticado, extraído do payload do JWT. */
export interface SessionUser {
  id: number
  tipo: TipoUsuario
}
