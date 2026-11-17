import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/button'
import { Card } from '../components/card'
import { ErrorState, InlineError, Loading } from '../components/state-view'
import { TextField } from '../components/text-field'
import { useAuth } from '../features/auth/auth-context'
import { canDeleteComment, canModifyPost } from '../features/auth/permissions'
import { createComment, deleteComment, getPost, listComments } from '../features/posts/posts-api'
import { formatDate } from '../features/posts/utils'
import { useFocusRequest } from '../hooks/use-focus-request'
import { RootScreenProps } from '../navigation/types'
import { ApiError } from '../services/api-client'
import { colors } from '../theme'

export function PostDetailScreen({ route, navigation }: RootScreenProps<'PostDetail'>) {
  const { id } = route.params
  const { user } = useAuth()
  const post = useFocusRequest(() => getPost(id), [id])
  const comments = useFocusRequest(() => listComments(id), [id])
  const [texto, setTexto] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  async function enviar() {
    if (!texto.trim()) {
      setSendError('Escreva um comentário.')
      return
    }
    setSending(true)
    setSendError(null)
    try {
      await createComment(id, texto.trim())
      setTexto('')
      await comments.reload()
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : 'Não foi possível enviar o comentário.')
    } finally {
      setSending(false)
    }
  }

  function excluir(commentId: string) {
    Alert.alert('Excluir comentário', 'Tem certeza que deseja excluir este comentário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteComment(commentId)
            await comments.reload()
          } catch (e) {
            setSendError(e instanceof ApiError ? e.message : 'Não foi possível excluir o comentário.')
          }
        },
      },
    ])
  }

  if (post.error) return <ErrorState message={post.error} onRetry={post.reload} />
  if (!post.data) return <Loading />

  const p = post.data

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{p.titulo}</Text>
        <Text style={styles.author}>Por {p.usuario?.nome ?? 'autor desconhecido'}</Text>
        {p.criadoEm ? <Text style={styles.muted}>{formatDate(p.criadoEm)}</Text> : null}
        <Text style={styles.body}>{p.conteudo}</Text>

        {canModifyPost(user, p) && (
          <View style={{ marginTop: 16 }}>
            <Button title="Editar postagem" variant="secondary" onPress={() => navigation.navigate('PostForm', { id: p.id })} />
          </View>
        )}

        <Text style={styles.section}>Comentários</Text>
        {comments.error ? (
          <ErrorState message={comments.error} onRetry={comments.reload} />
        ) : (
          <View style={{ gap: 10 }}>
            {(comments.data ?? []).length === 0 && !comments.loading && (
              <Text style={styles.muted}>Seja o primeiro a comentar.</Text>
            )}
            {(comments.data ?? []).map((c) => (
              <Card key={c.id} style={{ gap: 4 }}>
                <Text style={styles.commentAuthor}>
                  {c.usuario?.nome} · <Text style={styles.muted}>{formatDate(c.criadoEm)}</Text>
                </Text>
                <Text style={styles.commentBody}>{c.conteudo}</Text>
                {canDeleteComment(user, c) && (
                  <Button title="Excluir" variant="secondary" onPress={() => excluir(c.id)} />
                )}
              </Card>
            ))}
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          {user ? (
            <>
              <InlineError message={sendError} />
              <TextField label="Seu comentário" value={texto} onChangeText={setTexto} multiline style={{ minHeight: 90 }} />
              <Button title="Comentar" onPress={enviar} loading={sending} />
            </>
          ) : (
            <Text style={styles.muted}>Entre na aba Conta para comentar.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  author: { marginTop: 6, color: colors.primary, fontWeight: '600' },
  body: { marginTop: 16, fontSize: 16, lineHeight: 24, color: colors.text },
  section: { marginTop: 28, marginBottom: 12, fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  commentAuthor: { fontWeight: '700', color: colors.text, fontSize: 14 },
  commentBody: { color: colors.text, fontSize: 14, lineHeight: 20 },
})
