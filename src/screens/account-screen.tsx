import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/button'
import { Card } from '../components/card'
import { InlineError, Loading } from '../components/state-view'
import { TextField } from '../components/text-field'
import { useAuth } from '../features/auth/auth-context'
import { ApiError } from '../services/api-client'
import { colors } from '../theme'
import { tipoUsuarioLabel } from '../types'

export function AccountScreen() {
  const { user, restoring, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function entrar() {
    if (!email.trim() || !senha) {
      setError('Informe e-mail e senha.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signIn(email.trim(), senha)
      setSenha('')
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setError('E-mail ou senha incorretos.')
      else setError(e instanceof Error ? e.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  if (restoring) return <Loading />

  if (user) {
    return (
      <View style={styles.container}>
        <Card style={{ gap: 6 }}>
          <Text style={styles.title}>Sessão ativa</Text>
          <Text style={styles.text}>Perfil: {tipoUsuarioLabel[user.tipo]}</Text>
          <Text style={styles.muted}>A sessão expira 24 horas após o login.</Text>
        </Card>
        <Button title="Sair" variant="danger" onPress={() => void signOut()} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.muted}>As contas são criadas por professores. Visitantes podem apenas ler as postagens.</Text>
        <InlineError message={error} />
        <TextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField label="Senha" value={senha} onChangeText={setSenha} secureTextEntry autoCapitalize="none" />
        <Button title="Entrar" onPress={entrar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  text: { fontSize: 15, color: colors.text },
  muted: { fontSize: 13, color: colors.muted, marginBottom: 8 },
})
