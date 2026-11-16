import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/button'
import { RequireManager } from '../components/role-gate'
import { colors } from '../theme'
import { TipoUsuario } from '../types'

export function AdminHomeScreen({ navigation }: { navigation: any }) {
  return (
    <RequireManager>
      <View style={styles.container}>
        <Text style={styles.title}>Área administrativa</Text>
        <Text style={styles.text}>Gerencie postagens e contas da comunidade acadêmica.</Text>
        <Button title="Nova postagem" onPress={() => navigation.navigate('PostForm')} />
        <Button title="Gerenciar postagens" variant="secondary" onPress={() => navigation.navigate('AdminPosts')} />
        <Button
          title="Professores"
          variant="secondary"
          onPress={() => navigation.navigate('UsuariosList', { tipo: TipoUsuario.PROFESSOR })}
        />
        <Button
          title="Alunos"
          variant="secondary"
          onPress={() => navigation.navigate('UsuariosList', { tipo: TipoUsuario.ALUNO })}
        />
      </View>
    </RequireManager>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  text: { color: colors.muted, marginBottom: 8 },
})
