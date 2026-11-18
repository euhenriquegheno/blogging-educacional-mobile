# Blogging Educacional — App Mobile

Aplicativo mobile (React Native + Expo + TypeScript) do blog institucional onde professores publicam materiais para a comunidade acadêmica. Ele consome a API REST do projeto (repositório do backend: <LINK-DO-REPOSITORIO-DO-BACKEND>).

| Perfil | O que pode fazer no app |
|---|---|
| Visitante | Ler e buscar postagens |
| Aluno | Ler, buscar e comentar |
| Professor | Criar e editar as próprias postagens; gerenciar professores e alunos |
| Administrador | Tudo isso, em qualquer postagem e conta |

> Documentação completa da entrega (arquitetura, guia de uso, testes e relato de experiências): [docs/DOCUMENTACAO.md](docs/DOCUMENTACAO.md) · [versão em HTML](docs/DOCUMENTACAO.html).

## Stack

React Native + Expo · TypeScript · React Navigation (abas + pilha) · Context API (sessão) · Axios (API) · expo-secure-store (token) · Jest + Testing Library.

## Como rodar

**Pré-requisitos:** Node 20+, o **backend rodando** (siga o README do repositório do backend) e o app **Expo Go** no celular (ou um emulador Android/iOS).

```bash
npm ci
cp .env.example .env     # depois ajuste EXPO_PUBLIC_API_URL (veja a tabela abaixo)
npm start                # escaneie o QR code com o Expo Go
```

`EXPO_PUBLIC_API_URL` depende de onde o app roda:

| Ambiente | Valor |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Simulador iOS | `http://localhost:3000` |
| Celular físico (Expo Go) | `http://<IP-do-seu-computador>:3000` (mesmo Wi-Fi) |

O celular e o computador precisam estar na mesma rede. Para descobrir o IP no Windows use `ipconfig` (endereço IPv4 do Wi-Fi).

**Se o app não conectar à API:**
1. Abra `http://<IP>:3000/posts` no navegador do celular. Se não carregar, é rede ou firewall (libere a porta 3000 e o Node.js).
2. A mensagem de erro do app mostra a URL que ele tentou acessar; confira se é a do seu `.env`.
3. Depois de alterar o `.env`, reinicie com `npm start -- --clear` (as variáveis `EXPO_PUBLIC_*` são lidas na hora do bundle).

**Primeiro acesso:** o banco novo não tem contas e o app não tem cadastro próprio. Crie o primeiro Administrador com `npm run seed:admin` no repositório do backend.

### Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Inicia o Expo |
| `npm run android` / `npm run ios` | Abre no emulador/simulador |
| `npm test` | Testes (Jest + Testing Library) |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |

O CI (`.github/workflows/ci.yml`) roda `typecheck`, os testes e gera o bundle Android a cada push na `main` e pull request.

## Funcionalidades x requisitos da atividade

| Requisito | Tela |
|---|---|
| 1. Lista de posts + busca | `PostsListScreen` (título, autor, resumo; busca com debounce em `/posts/search`; paginação) |
| 2. Leitura + comentários | `PostDetailScreen` |
| 3. Criar post (título, conteúdo, autor) | `PostFormScreen` |
| 4. Editar post | `PostFormScreen` com `id` (carrega os dados atuais) |
| 5–7. CRUD de professores (listagem paginada, editar, excluir) | `UsuariosListScreen` / `UsuarioFormScreen` com tipo Professor |
| 8. Idem para alunos | as mesmas telas com tipo Aluno |
| 9. Administração de posts | `AdminPostsScreen` (editar/excluir) |
| 10. Login e autorização | `AccountScreen`, `AuthProvider`, `RequireManager` |

## Estrutura do projeto

```
.
├── App.tsx                          # Providers: SafeArea → Auth → Navigation
├── app.json                         # Nome, ícone, splash e plugins do Expo
├── assets/                          # Ícone, splash e favicon
├── docs/                            # Documentação da entrega e roteiro do vídeo
├── .github/workflows/ci.yml         # CI
└── src/
    ├── config/env.ts                # URL da API e tamanho de página
    ├── services/
    │   ├── api-client.ts            # Axios: interceptors de token, erros (ApiError) e 401
    │   └── token-storage.ts         # JWT no expo-secure-store
    ├── features/
    │   ├── auth/                    # auth-context (Context API), jwt, permissions, auth-api
    │   ├── posts/                   # posts-api (posts e comentários), utils
    │   └── usuarios/                # usuarios-api, validation
    ├── hooks/use-focus-request.ts   # carrega dados ao focar a tela; descarta respostas obsoletas
    ├── navigation/                  # Abas (Postagens / Administração / Conta) + pilha de telas
    ├── screens/                     # uma tela por requisito
    ├── components/                  # Button, TextField, Card, PostCard, Pagination, RequireManager, Brand…
    ├── theme/                       # cores e espaçamentos
    └── types/                       # tipos de domínio e enum TipoUsuario
```

Fluxo de dados: `tela → módulo de API da feature → apiClient (Axios) → API REST`.

## Autenticação e autorização

- `POST /login` devolve um JWT com `sub` e `tipo`; o app decodifica o payload para saber o perfil. A sessão dura 24 h (`exp` do token): ao abrir o app, um token salvo expirado é descartado, e um `401` em requisição autenticada encerra a sessão.
- O token fica em memória (lido pelo interceptor do Axios) e persistido no `SecureStore`.
- Perfis: **Administrador (1)**, **Professor (2)**, **Aluno (3)**.
- `RequireManager` protege criação, edição e administração: sem token pede login; Aluno vê "Acesso restrito". A aba **Administração** só aparece para Professor e Administrador logados.
- Professor edita/exclui apenas as próprias postagens (`canModifyPost`); Administrador, qualquer uma. Professor gerencia professores e alunos, nunca Administradores.
- **A fonte da verdade é o backend:** as guardas do app só melhoram a experiência; a API rejeita com 401/403 mesmo se o app for adulterado.

## Contrato esperado do backend

O app depende destes comportamentos da API, implementados no repositório do backend:

- `POST /posts` e `PUT /posts/:id` aceitam `autorId` opcional (padrão: usuário logado; o autor deve ser Professor ou Administrador).
- As rotas `/user` aceitam Professor (além de Administrador), com regra nos casos de uso que impede o Professor de criar, ver, editar ou excluir contas de Administrador.
- `GET /user?tipo=2|3` filtra por tipo, para as listagens de professores e alunos.
- `PUT /user/:id` aceita o corpo sem `senha` (a senha atual é mantida).

## Paginação

A API retorna arrays sem o total de registros. O app considera que há próxima página quando a página atual veio cheia (`PAGE_SIZE = 10`). A busca por palavra-chave não é paginada, pois `/posts/search` não oferece paginação.

## Decisões e limitações

- O conteúdo das postagens é `TextInput` multilinha simples (sem editor rico).
- Não há upload de imagens, auto-cadastro nem recuperação de senha.
- O nome do usuário logado não é exibido: o JWT carrega apenas `id` e `tipo`.
