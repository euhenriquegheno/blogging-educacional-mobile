import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'
import { PostCard } from './post-card'
import { Publicacao } from '../types'

const post = {
  id: '1',
  titulo: 'Funções',
  conteudo: 'x'.repeat(400),
  usuario: { id: 2, nome: 'Profa. Ana' },
} as Publicacao

describe('PostCard', () => {
  it('mostra título, autor e descrição resumida', async () => {
    const onPress = jest.fn()
    await render(<PostCard post={post} onPress={onPress} />)
    expect(screen.getByText('Funções')).toBeTruthy()
    expect(screen.getByText('Por Profa. Ana')).toBeTruthy()
    expect(screen.getByText(/…$/)).toBeTruthy()
    await fireEvent.press(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalled()
  })
})
