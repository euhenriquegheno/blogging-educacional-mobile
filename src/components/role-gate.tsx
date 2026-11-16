import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../features/auth/auth-context'
import { canManage } from '../features/auth/permissions'
import { colors } from '../theme'
import { Button } from './button'
import { Loading } from './state-view'

/**
 * Guarda de rota para áreas de criação/edição/administração: exige token válido
 * (senão pede login) e tipo Professor/Administrador (senão nega acesso).
 */
export function RequireManager({ children }: { children: React.ReactNode }) {
  const { user, restoring } = useAuth()
  const navigation = useNavigation<any>()

  if (restoring) return <Loading />

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Login necessário</Text>
        <Text style={styles.text}>Entre com sua conta de professor para acessar esta área.</Text>
        <Button title="Ir para o login" onPress={() => navigation.navigate('Tabs', { screen: 'Conta' })} />
      </View>
    )
  }

  if (!canManage(user)) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text style={styles.text}>Alunos podem apenas visualizar e comentar nas postagens.</Text>
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  text: { fontSize: 15, color: colors.muted, textAlign: 'center' },
})
