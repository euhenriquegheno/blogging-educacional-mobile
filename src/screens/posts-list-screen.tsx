import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, TextInput, View } from 'react-native'
import { WelcomeBanner } from '../components/brand'
import { PostCard } from '../components/post-card'
import { Pagination } from '../components/pagination'
import { Button } from '../components/button'
import { EmptyState, ErrorState, Loading } from '../components/state-view'
import { PAGE_SIZE } from '../config/env'
import { useAuth } from '../features/auth/auth-context'
import { canManage } from '../features/auth/permissions'
import { listPosts, searchPosts } from '../features/posts/posts-api'
import { useFocusRequest } from '../hooks/use-focus-request'
import { colors, radius } from '../theme'

export function PostsListScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  // debounce da busca
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(text.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [text])

  const { data, loading, error, reload } = useFocusRequest(
    () => (query ? searchPosts(query) : listPosts(page, PAGE_SIZE)),
    [query, page],
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.search}
          placeholder="Buscar por palavra-chave"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Buscar postagens"
          value={text}
          onChangeText={setText}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {canManage(user) && <Button title="Nova" small onPress={() => navigation.navigate('PostForm')} />}
      </View>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { id: item.id })} />
          )}
          ListHeaderComponent={!query && page === 1 ? <WelcomeBanner /> : undefined}
          ListEmptyComponent={<EmptyState message={query ? 'Nenhuma postagem encontrada.' : 'Ainda não há postagens.'} />}
          refreshing={loading}
          onRefresh={reload}
          ListFooterComponent={
            !query ? <Pagination page={page} hasNext={(data?.length ?? 0) === PAGE_SIZE} onChange={setPage} /> : undefined
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBox: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 4, alignItems: 'center' },
  search: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  list: { padding: 16 },
})
