import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

export const APP_NAME = 'Blogging Educacional'

/** Logo (selo com capelo) usada no cabeçalho e no banner de boas-vindas. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <View
      accessibilityLabel="Logo do Blogging Educacional"
      style={[styles.mark, { width: size, height: size, borderRadius: size / 3 }]}
    >
      <Ionicons name="school" size={size * 0.62} color={colors.primary} />
    </View>
  )
}

export function BrandTitle() {
  return (
    <View style={styles.row} accessibilityRole="header">
      <LogoMark />
      <View>
        <Text style={styles.name}>{APP_NAME}</Text>
        <Text style={styles.tagline}>Conhecimento compartilhado</Text>
      </View>
    </View>
  )
}

export function WelcomeBanner() {
  return (
    <View style={styles.banner}>
      <LogoMark size={48} />
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>Bem-vindo(a)!</Text>
        <Text style={styles.bannerText}>
          Materiais e publicações de professores para toda a comunidade acadêmica.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mark: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { color: '#fff', fontSize: 17, fontWeight: '800', lineHeight: 20 },
  tagline: { color: '#c7d2fe', fontSize: 11, lineHeight: 13 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  bannerText: { color: '#e0e7ff', fontSize: 13, lineHeight: 18, marginTop: 2 },
})
