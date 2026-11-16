import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import { Button } from '../components/button'
import { RequireManager } from '../components/role-gate'
import { ErrorState, InlineError, Loading } from '../components/state-view'
import { TextField } from '../components/text-field'
import { createUsuario, getUsuario, updateUsuario } from '../features/usuarios/usuarios-api'
import { UsuarioFormErrors, UsuarioFormValues, validateUsuario } from '../features/usuarios/validation'
import { RootScreenProps } from '../navigation/types'
import { ApiError } from '../services/api-client'

export function UsuarioFormScreen(props: RootScreenProps<'UsuarioForm'>) {
  return (
    <RequireManager>
      <UsuarioForm {...props} />
    </RequireManager>
  )
}

function UsuarioForm({ route, navigation }: RootScreenProps<'UsuarioForm'>) {
  const { tipo, id } = route.params
  const isEdit = id !== undefined
  const [values, setValues] = useState<UsuarioFormValues>({ nome: '', email: '', cpf: '', senha: '' })
  const [errors, setErrors] = useState<UsuarioFormErrors>({})
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof UsuarioFormValues) => (text: string) => setValues((v) => ({ ...v, [key]: text }))

  useEffect(() => {
    if (!isEdit) return
    getUsuario(id)
      .then((u) => setValues({ nome: u.nome, email: u.email, cpf: u.cpf, senha: '' }))
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'Erro ao carregar o cadastro.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  async function salvar() {
    const found = validateUsuario(values, isEdit)
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    setError(null)
    try {
      const input = {
        nome: values.nome.trim(),
        email: values.email.trim(),
        cpf: values.cpf.replace(/\D/g, ''),
        tipo,
        ...(values.senha ? { senha: values.senha } : {}),
      }
      if (isEdit) await updateUsuario(id, input)
      else await createUsuario(input)
      navigation.goBack()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />
  if (loadError) return <ErrorState message={loadError} />

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <InlineError message={error} />
        <TextField label="Nome" value={values.nome} onChangeText={set('nome')} error={errors.nome} />
        <TextField
          label="E-mail"
          value={values.email}
          onChangeText={set('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField label="CPF" value={values.cpf} onChangeText={set('cpf')} error={errors.cpf} keyboardType="number-pad" maxLength={14} />
        <TextField
          label={isEdit ? 'Nova senha (opcional)' : 'Senha'}
          value={values.senha}
          onChangeText={set('senha')}
          error={errors.senha}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button title={isEdit ? 'Salvar alterações' : 'Cadastrar'} onPress={salvar} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 } })
