import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../features/auth/auth-context'
import { canManage } from '../features/auth/permissions'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AccountScreen } from '../screens/account-screen'
import { AdminHomeScreen } from '../screens/admin-home-screen'
import { AdminPostsScreen } from '../screens/admin-posts-screen'
import { PostDetailScreen } from '../screens/post-detail-screen'
import { PostFormScreen } from '../screens/post-form-screen'
import { PostsListScreen } from '../screens/posts-list-screen'
import { UsuarioFormScreen } from '../screens/usuario-form-screen'
import { UsuariosListScreen } from '../screens/usuarios-list-screen'
import { BrandTitle } from '../components/brand'
import { colors } from '../theme'
import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

type IconName = React.ComponentProps<typeof Ionicons>['name']

function tabIcon(focused: IconName, outline: IconName) {
  return ({ focused: isFocused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={isFocused ? focused : outline} size={size} color={color} />
  )
}

function Tabs() {
  const { user } = useAuth()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Posts"
        component={PostsListScreen}
        options={{
          title: 'Postagens',
          headerTitle: () => <BrandTitle />,
          tabBarIcon: tabIcon('newspaper', 'newspaper-outline'),
        }}
      />
      {/* Administração só existe para Professor/Administrador autenticado */}
      {canManage(user) && (
        <Tab.Screen
          name="Admin"
          component={AdminHomeScreen}
          options={{ title: 'Administração', tabBarIcon: tabIcon('settings', 'settings-outline') }}
        />
      )}
      <Tab.Screen
        name="Conta"
        component={AccountScreen}
        options={{ title: 'Conta', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }}
      />
    </Tab.Navigator>
  )
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Postagem' }} />
      <Stack.Screen name="PostForm" component={PostFormScreen} options={({ route }) => ({ title: route.params?.id ? 'Editar postagem' : 'Nova postagem' })} />
      <Stack.Screen name="AdminPosts" component={AdminPostsScreen} options={{ title: 'Gerenciar postagens' }} />
      <Stack.Screen
        name="UsuariosList"
        component={UsuariosListScreen}
        options={({ route }) => ({ title: route.params.tipo === 2 ? 'Professores' : 'Alunos' })}
      />
      <Stack.Screen
        name="UsuarioForm"
        component={UsuarioFormScreen}
        options={({ route }) => {
          const nome = route.params.tipo === 2 ? 'professor' : 'aluno'
          return { title: route.params.id ? `Editar ${nome}` : `Novo ${nome}` }
        }}
      />
    </Stack.Navigator>
  )
}
