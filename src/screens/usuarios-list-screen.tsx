import React, { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/button'
import { Card } from '../components/card'
import { confirmDelete } from '../components/confirm'
import { Pagination } from '../components/pagination'
import { RequireManager } from '../components/role-gate'
import { EmptyState, ErrorState, InlineError, Loading } from '../components/state-view'
import { PAGE_SIZE } from '../config/env'
import { useAuth } from '../features/auth/auth-context'
import { deleteUsuario, listUsuarios } from '../features/usuarios/usuarios-api'
import { useFocusRequest } from '../hooks/use-focus-request'
import { RootScreenProps } from '../navigation/types'
import { ApiError } from '../services/api-client'
import { colors } from '../theme'
import { TipoUsuario } from '../types'

export function UsuariosListScreen(props: RootScreenProps<'UsuariosList'>) {
  return (
    <RequireManager>
      <UsuariosList {...props} />
    </RequireManager>
  )
}

function UsuariosList({ route, navigation }: RootScreenProps<'UsuariosList'>) {
  const { tipo } = route.params
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const { data, loading, error, reload } = useFocusRequest(() => listUsuarios(tipo, page, PAGE_SIZE), [tipo, page])
  const plural = tipo === TipoUsuario.PROFESSOR ? 'professores' : 'alunos'

  function excluir(id: number, nome: string) {
    confirmDelete(`Excluir "${nome}" do sistema?`, async () => {
      try {
        setActionError(null)
        await deleteUsuario(id)
        await reload()
      } catch (e) {
        setActionError(e instanceof ApiError ? e.message : 'Não foi possível excluir.')
      }
    })
  }

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading && !data) return <Loading />

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(u) => String(u.id)}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <InlineError message={actionError} />
          <Button title={`Cadastrar ${tipo === TipoUsuario.PROFESSOR ? 'professor' : 'aluno'}`} onPress={() => navigation.navigate('UsuarioForm', { tipo })} />
        </View>
      }
      ListEmptyComponent={<EmptyState message={`Nenhum(a) ${plural} cadastrado(a).`} />}
      refreshing={loading}
      onRefresh={reload}
      renderItem={({ item }) => (
        <Card style={{ gap: 4 }}>
          <Text style={styles.name}>{item.nome}</Text>
          <Text style={styles.muted}>{item.email}</Text>
          <View style={styles.actions}>
            <Button title="Editar" variant="secondary" small onPress={() => navigation.navigate('UsuarioForm', { tipo, id: item.id })} />
            {item.id !== user?.id && (
              <Button title="Excluir" variant="danger" small onPress={() => excluir(item.id, item.nome)} />
            )}
          </View>
        </Card>
      )}
      ListFooterComponent={<Pagination page={page} hasNext={(data?.length ?? 0) === PAGE_SIZE} onChange={setPage} />}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
})
