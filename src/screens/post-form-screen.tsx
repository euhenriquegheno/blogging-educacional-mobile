import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/button'
import { RequireManager } from '../components/role-gate'
import { ErrorState, InlineError, Loading } from '../components/state-view'
import { TextField } from '../components/text-field'
import { useAuth } from '../features/auth/auth-context'
import { canModifyPost } from '../features/auth/permissions'
import { createPost, getPost, updatePost } from '../features/posts/posts-api'
import { listUsuarios } from '../features/usuarios/usuarios-api'
import { RootScreenProps } from '../navigation/types'
import { ApiError } from '../services/api-client'
import { colors, radius } from '../theme'
import { Publicacao, TipoUsuario, Usuario } from '../types'

export function PostFormScreen(props: RootScreenProps<'PostForm'>) {
  return (
    <RequireManager>
      <PostForm {...props} />
    </RequireManager>
  )
}

function PostForm({ route, navigation }: RootScreenProps<'PostForm'>) {
  const id = route.params?.id
  const { user } = useAuth()
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [autor, setAutor] = useState<Usuario | null>(null) // null = usuário logado
  const [professores, setProfessores] = useState<Usuario[]>([])
  const [picker, setPicker] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ titulo?: string; conteudo?: string }>({})

  // carrega o post a ser editado
  useEffect(() => {
    if (!id) return
    getPost(id)
      .then((p: Publicacao) => {
        if (!canModifyPost(user, p)) {
          setLoadError('Você só pode editar as suas próprias postagens.')
          return
        }
        setTitulo(p.titulo)
        setConteudo(p.conteudo)
        setAutor(p.usuario ?? null)
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'Erro ao carregar a postagem.'))
      .finally(() => setLoading(false))
  }, [id, user])

  // professores disponíveis como autor
  useEffect(() => {
    listUsuarios(TipoUsuario.PROFESSOR, 1, 100)
      .then(setProfessores)
      .catch(() => setProfessores([]))
  }, [])

  async function salvar() {
    const next: typeof errors = {}
    if (!titulo.trim()) next.titulo = 'Informe o título'
    if (!conteudo.trim()) next.conteudo = 'Informe o conteúdo'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    setError(null)
    try {
      const input = {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        ...(autor ? { autorId: autor.id } : {}),
      }
      if (id) await updatePost(id, input)
      else await createPost(input)
      navigation.goBack()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />
  if (loadError) return <ErrorState message={loadError} />

  const autorLabel = autor ? autor.nome : 'Eu mesmo (usuário logado)'

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <InlineError message={error} />
        <TextField label="Título" value={titulo} onChangeText={setTitulo} error={errors.titulo} />

        <Text style={styles.label}>Autor</Text>
        <Pressable style={styles.select} onPress={() => setPicker(true)} accessibilityRole="button" accessibilityLabel="Escolher autor">
          <Text style={styles.selectText}>{autorLabel}</Text>
          <Text style={styles.selectText}>▾</Text>
        </Pressable>

        <TextField
          label="Conteúdo"
          value={conteudo}
          onChangeText={setConteudo}
          multiline
          error={errors.conteudo}
        />
        <Button title={id ? 'Salvar alterações' : 'Publicar'} onPress={salvar} loading={saving} />
      </ScrollView>

      <Modal visible={picker} transparent animationType="slide" onRequestClose={() => setPicker(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Escolha o autor</Text>
            <ScrollView>
              {!id && (
                <Option label="Eu mesmo (usuário logado)" onPress={() => { setAutor(null); setPicker(false) }} />
              )}
              {professores.map((p) => (
                <Option key={p.id} label={p.nome} onPress={() => { setAutor(p); setPicker(false) }} />
              ))}
            </ScrollView>
            <Button title="Fechar" variant="secondary" onPress={() => setPicker(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

function Option({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.option} accessibilityRole="button">
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  selectText: { color: colors.text, fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, padding: 20, maxHeight: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { fontSize: 15, color: colors.text },
})
