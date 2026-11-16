import { Comentario, Publicacao, SessionUser, TipoUsuario } from '../../types'

export const isAdmin = (u: SessionUser | null) => u?.tipo === TipoUsuario.ADMINISTRADOR
export const isProfessor = (u: SessionUser | null) => u?.tipo === TipoUsuario.PROFESSOR

/** Professor e Administrador criam posts e gerenciam contas; Aluno apenas visualiza e comenta. */
export const canManage = (u: SessionUser | null) => isAdmin(u) || isProfessor(u)

/** Administrador edita/exclui qualquer post; Professor apenas os próprios. */
export function canModifyPost(u: SessionUser | null, post: Publicacao): boolean {
  if (isAdmin(u)) return true
  return isProfessor(u) && post.usuario?.id === u?.id
}

/** O próprio autor do comentário, um Professor ou um Administrador pode excluí-lo. */
export function canDeleteComment(u: SessionUser | null, comentario: Comentario): boolean {
  if (!u) return false
  return canManage(u) || comentario.usuario?.id === u.id
}
