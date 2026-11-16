import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import { Button } from './button'

interface Props {
  page: number
  hasNext: boolean
  onChange: (page: number) => void
}

/** A API não retorna o total, então `hasNext` vem de a página vir cheia. */
export function Pagination({ page, hasNext, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Button title="Anterior" variant="secondary" small disabled={page <= 1} onPress={() => onChange(page - 1)} />
      <Text style={styles.label}>Página {page}</Text>
      <Button title="Próxima" variant="secondary" small disabled={!hasNext} onPress={() => onChange(page + 1)} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  label: { color: colors.muted, fontSize: 14 },
})
