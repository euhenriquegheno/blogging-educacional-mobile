import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { colors, radius } from '../theme'

interface Props {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  disabled?: boolean
  small?: boolean
  testID?: string
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, small, testID }: Props) {
  const inactive = disabled || loading
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (pressed || inactive) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            small && { fontSize: 13 },
            variant === 'primary' && { color: '#fff' },
            variant === 'secondary' && { color: colors.primary },
            variant === 'danger' && { color: colors.danger },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { minHeight: 46, paddingHorizontal: 16, borderRadius: radius, alignItems: 'center', justifyContent: 'center' },
  small: { minHeight: 36, paddingHorizontal: 12 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryLight },
  danger: { backgroundColor: colors.dangerLight },
  text: { fontSize: 15, fontWeight: '600' },
})
