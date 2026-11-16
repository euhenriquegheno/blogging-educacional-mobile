# Blogging Educacional — App Mobile

App React Native (Expo + TypeScript) que consome a API REST do blog institucional. Professores e Administradores publicam materiais e gerenciam contas; Alunos leem e comentam.

## Setup

Pré-requisitos: Node 20+, o **backend** rodando (repositório: <LINK-DO-REPOSITORIO-DO-BACKEND>; siga o README dele para subir a API com `docker compose up` ou `npm run start:dev`) e o app **Expo Go** no celular (ou um emulador Android/iOS).

```bash
cd mobile
npm ci
cp .env.example .env     # defina EXPO_PUBLIC_API_URL
npm start                # abre o Expo; escaneie o QR code com o Expo Go
npm test                 # Jest (jest-expo + Testing Library)
npm run typecheck        # tsc --noEmit
```

`EXPO_PUBLIC_API_URL` depende de onde o app roda:

| Ambiente | Valor |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Simulador iOS | `http://localhost:3000` |
| Celular físico (Expo Go) | `http://<IP-da-sua-máquina>:3000` (mesma rede Wi-Fi) |

Para criar a primeira conta de Administrador use `npm run seed:admin` no repositório do backend.

## Funcionalidades x requisitos

| Requisito | Tela |
|---|---|
| 1. Lista de posts + busca | `PostsListScreen` (título, autor, resumo; busca com debounce em `/posts/search`; paginação) |
| 2. Leitura + comentários | `PostDetailScreen` |
| 3. Criar post (título, conteúdo, autor) | `PostFormScreen` |
| 4. Editar post | `PostFormScreen` com `id` (carrega os dados atuais) |
| 5–7. CRUD de professores (listagem paginada, editar, excluir) | `UsuariosListScreen` / `UsuarioFormScreen` com `tipo = Professor` |
| 8. Idem para alunos | as mesmas telas com `tipo = Aluno` |
| 9. Administração de posts | `AdminPostsScreen` (editar/excluir) |
| 10. Login e autorização | `AccountScreen`, `AuthProvider`, `RequireManager` |

## Arquitetura

```
mobile/
├── App.tsx                      # Providers: SafeArea → Auth → Navigation
└── src/
    ├── config/env.ts            # URL da API e tamanho de página
    ├── services/
    │   ├── api-client.ts        # Axios (interceptors: Bearer token, ApiError, 401) 
    │   └── token-storage.ts     # JWT no expo-secure-store
    ├── features/
    │   ├── auth/                # auth-context (Context API), jwt, permissions, auth-api
    │   ├── posts/               # posts-api (posts + comentários), utils
    │   └── usuarios/            # usuarios-api, validation
    ├── hooks/use-focus-request.ts   # carrega dados ao focar a tela, descarta respostas obsoletas
    ├── navigation/              # Stack (telas) + Bottom Tabs (Postagens / Administração / Conta)
    ├── screens/                 # uma tela por requisito
    ├── components/              # Button, TextField, Card, PostCard, Pagination, RequireManager…
    ├── theme/                   # cores e espaçamentos
    └── types/                   # tipos de domínio e enum TipoUsuario
```

Fluxo: `screen → feature api → apiClient → API REST`. O estado de sessão fica no `AuthContext`; o token é mantido em memória (lido pelo `apiClient`) e persistido no `SecureStore`.

### Autenticação e autorização

- `POST /login` devolve um JWT com `sub` e `tipo`; o app decodifica o payload para saber o perfil. A sessão dura 24 h (`exp` do token): ao abrir o app o token salvo é descartado se expirou, e um `401` em requisição autenticada encerra a sessão.
- Perfis: **Administrador (1)**, **Professor (2)**, **Aluno (3)**.
- `RequireManager` protege criação, edição e administração: sem token pede login; Aluno vê "Acesso restrito".
- Professor edita/exclui apenas os próprios posts (`canModifyPost`); Administrador, qualquer um. Professor gerencia professores e alunos, nunca Administradores.
- **A fonte da verdade é o backend**: as guardas do app só melhoram a experiência; as rotas rejeitam com 401/403 mesmo se o app for adulterado.

### Contrato esperado do backend

O app depende destes comportamentos da API (implementados no repositório do backend):

- `POST /posts` e `PUT /posts/:id` aceitam `autorId` opcional (padrão: usuário logado; o autor deve ser Professor ou Administrador).
- Rotas `/user` passam a aceitar Professor (além de Administrador), com regra de negócio nos casos de uso que impede Professor de criar, ver, editar ou excluir contas de Administrador.
- `GET /user?tipo=2|3` filtra por tipo para as listagens de professores e alunos.

### Paginação

A API retorna arrays sem total. Consideramos que há próxima página quando a página atual veio cheia (`PAGE_SIZE = 10`). A busca por palavra-chave não é paginada (a API não oferece paginação em `/posts/search`).

## Guia de uso

1. **Visitante**: lê e busca postagens na aba *Postagens*.
2. **Entrar**: aba *Conta* → e-mail e senha. Contas são criadas por professores/administradores (não há auto-cadastro nem recuperação de senha).
3. **Aluno**: lê e comenta nas postagens.
4. **Professor/Administrador**: botão *Nova* na lista cria postagem (escolhendo o autor); aba *Administração* dá acesso a gerenciar postagens, professores e alunos (cadastrar, editar, excluir com confirmação).

## Decisões e limitações

- Conteúdo dos posts em `TextInput` multilinha simples (sem editor rico).
- Sem upload de imagens (fora do escopo).
- O nome do usuário logado não é exibido: o JWT carrega apenas id e tipo.
