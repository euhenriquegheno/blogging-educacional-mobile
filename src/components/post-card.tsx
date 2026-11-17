import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { excerpt, formatDate } from '../features/posts/utils'
import { colors } from '../theme'
import { Publicacao } from '../types'
import { Card } from './card'

export function PostCard({ post, onPress }: { post: Publicacao; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Abrir ${post.titulo}`}>
      <Card style={styles.card}>
        <Text style={styles.title}>{post.titulo}</Text>
        <Text style={styles.author}>Por {post.usuario?.nome ?? 'autor desconhecido'}</Text>
        {post.criadoEm ? <Text style={styles.date}>{formatDate(post.criadoEm)}</Text> : null}
        <Text style={styles.excerpt}>{excerpt(post.conteudo)}</Text>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  author: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  date: { fontSize: 12, color: colors.muted },
  excerpt: { fontSize: 14, color: colors.muted, lineHeight: 20 },
})
