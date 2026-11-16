import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { TipoUsuario } from '../types'

export type RootStackParamList = {
  Tabs: undefined
  PostDetail: { id: string }
  PostForm: { id?: string } | undefined
  AdminPosts: undefined
  UsuariosList: { tipo: TipoUsuario }
  UsuarioForm: { tipo: TipoUsuario; id?: number }
}

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>
