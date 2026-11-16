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
import { canModifyPost } from '../features/auth/permissions'
import { deletePost, listPosts } from '../features/posts/posts-api'
import { useFocusRequest } from '../hooks/use-focus-request'
import { RootScreenProps } from '../navigation/types'
import { ApiError } from '../services/api-client'
import { colors } from '../theme'

export function AdminPostsScreen(props: RootScreenProps<'AdminPosts'>) {
  return (
    <RequireManager>
      <AdminPosts {...props} />
    </RequireManager>
  )
}

function AdminPosts({ navigation }: RootScreenProps<'AdminPosts'>) {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const { data, loading, error, reload } = useFocusRequest(() => listPosts(page, PAGE_SIZE), [page])

  function excluir(id: string, titulo: string) {
    confirmDelete(`Excluir a postagem "${titulo}"?`, async () => {
      try {
        setActionError(null)
        await deletePost(id)
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
      keyExtractor={(p) => p.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={<InlineError message={actionError} />}
      ListEmptyComponent={<EmptyState message="Nenhuma postagem cadastrada." />}
      refreshing={loading}
      onRefresh={reload}
      renderItem={({ item }) => (
        <Card style={{ gap: 6 }}>
          <Text style={styles.title}>{item.titulo}</Text>
          <Text style={styles.author}>Por {item.usuario?.nome}</Text>
          {canModifyPost(user, item) ? (
            <View style={styles.actions}>
              <Button title="Editar" variant="secondary" small onPress={() => navigation.navigate('PostForm', { id: item.id })} />
              <Button title="Excluir" variant="danger" small onPress={() => excluir(item.id, item.titulo)} />
            </View>
          ) : (
            <Text style={styles.muted}>Somente o autor ou um administrador pode alterar.</Text>
          )}
        </Card>
      )}
      ListFooterComponent={<Pagination page={page} hasNext={(data?.length ?? 0) === PAGE_SIZE} onChange={setPage} />}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  author: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  muted: { color: colors.muted, fontSize: 12 },
})
