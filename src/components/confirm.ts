import { Alert } from 'react-native'

export function confirmDelete(message: string, onConfirm: () => void) {
  Alert.alert('Confirmar exclusão', message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: onConfirm },
  ])
}
