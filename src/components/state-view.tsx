import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import { Button } from './button'

export function Loading() {
  return (
    <View style={styles.center} testID="loading">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && <Button title="Tentar novamente" variant="secondary" onPress={onRetry} />}
    </View>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.muted}>{message}</Text>
    </View>
  )
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View style={styles.inline} accessibilityRole="alert">
      <Text style={styles.inlineText}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { padding: 32, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: colors.danger, textAlign: 'center', fontSize: 15 },
  muted: { color: colors.muted, textAlign: 'center', fontSize: 15 },
  inline: { backgroundColor: colors.dangerLight, padding: 12, borderRadius: 10, marginBottom: 14 },
  inlineText: { color: colors.danger, fontSize: 14 },
})
