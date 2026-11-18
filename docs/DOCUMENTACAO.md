# Documentação do Projeto — App Mobile do Blogging Educacional

## 1. Visão geral

O **Blogging Educacional** é um blog institucional onde professores publicam
materiais para a comunidade acadêmica. A API REST (Fastify + TypeORM + MySQL,
com autenticação JWT) e a interface web (React) já estavam concluídas. Esta
etapa entrega o **aplicativo mobile**, desenvolvido em **React Native
(Expo + TypeScript)**, que consome a mesma API e atende a três perfis:

- **Aluno**: lê, busca e comenta nas postagens.
- **Professor**: além disso, cria e edita as próprias postagens e gerencia
  contas de professores e alunos.
- **Administrador**: acesso total (qualquer postagem e qualquer conta).

Visitantes (sem login) podem ler e buscar postagens.

### 1.1 Requisitos atendidos

| # | Requisito | Tela / componente |
|---|---|---|
| 1 | Lista de posts (título, autor, resumo) com busca por palavra-chave | `PostsListScreen` |
| 2 | Leitura do post e comentários | `PostDetailScreen` |
| 3 | Criação de post (título, conteúdo, autor) | `PostFormScreen` |
| 4 | Edição de post com dados carregados | `PostFormScreen` (com `id`) |
| 5 | Cadastro de professores | `UsuarioFormScreen` (tipo Professor) |
| 6 | Edição de professores | `UsuarioFormScreen` (com `id`) |
| 7 | Listagem paginada de professores com editar/excluir | `UsuariosListScreen` (tipo Professor) |
| 8 | Mesmas telas (5, 6 e 7) para alunos | `UsuariosListScreen` / `UsuarioFormScreen` (tipo Aluno) |
| 9 | Administração de postagens (editar/excluir) | `AdminPostsScreen` |
| 10 | Login e autorização | `AccountScreen`, `AuthProvider`, `RequireManager` |

Requisitos técnicos: React Native com hooks e componentes funcionais; Context
API para a sessão; consumo da API com **Axios**; estilização própria
(tema em `src/theme`); documentação neste arquivo e no `README.md`.

## 2. Arquitetura

### 2.1 Visão em camadas

```
Tela (screens/) ─► módulo de API da feature (features/*-api.ts)
                     ─► cliente HTTP (services/api-client.ts, Axios)
                          ─► API REST
```

- **Screens** (`src/screens`): uma tela por requisito. Cuidam apenas de
  estado de interface, validação de formulário e navegação.
- **Features** (`src/features`): `auth` (contexto de sessão, JWT,
  permissões), `posts` (posts e comentários) e `usuarios` (contas). Cada uma
  expõe funções de API tipadas (`listPosts`, `createUsuario`, ...).
- **Services** (`src/services`): `api-client.ts` (Axios) e `token-storage.ts`
  (armazenamento seguro do token).
- **Components** (`src/components`): blocos reutilizáveis (`Button`,
  `TextField`, `Card`, `PostCard`, `Pagination`, `RequireManager`, `Brand`...).
- **Hooks** (`src/hooks`): `useFocusRequest` carrega dados quando a tela
  ganha foco, descarta respostas obsoletas e mantém o dado anterior
  enquanto recarrega.
- **Navigation** (`src/navigation`): *Bottom Tabs* (Postagens, Administração,
  Conta) dentro de um *Native Stack* (detalhe, formulários e listas).
- **Types** (`src/types`): tipos de domínio e o enum `TipoUsuario`
  (`ADMINISTRADOR = 1`, `PROFESSOR = 2`, `ALUNO = 3`), o mesmo do backend.

### 2.2 Cliente HTTP (Axios)

O `api-client.ts` cria uma instância Axios (`baseURL` vinda de
`EXPO_PUBLIC_API_URL`, timeout de 15 s) com dois interceptors:

- **Requisição**: injeta `Authorization: Bearer <token>` quando há sessão.
- **Resposta**: converte qualquer falha em `ApiError` (com `status` e a
  mensagem enviada pela API), traduz falhas de rede/timeout em mensagens
  claras (incluindo a URL tentada, o que facilita diagnosticar problemas de
  configuração) e, em **401 com token**, encerra a sessão automaticamente.
  Um 401 sem token (login com senha errada) **não** derruba a sessão.

As telas e os módulos `*-api.ts` dependem só da função `apiClient`, sem
conhecer o Axios; a troca de `fetch` para Axios alterou apenas esse arquivo.

### 2.3 Autenticação e autorização

- `POST /login` devolve um JWT (`sub`, `tipo`, validade de **24 h**). O app
  decodifica o payload para saber o perfil. A decodificação é feita com um
  decodificador base64 próprio, sem depender de `atob`/`Buffer` no Hermes.
- O token é mantido em memória (lido pelo interceptor) e persistido no
  **`expo-secure-store`**. Ao abrir o app, o token salvo é descartado se
  estiver expirado (`exp`); caso contrário a sessão é restaurada.
- O estado de sessão fica no `AuthContext` (Context API), exposto por
  `useAuth()` com `user`, `signIn` e `signOut`.
- **Guarda de acesso**: `RequireManager` envolve as telas de criação, edição
  e administração. Sem token, pede login; com perfil Aluno, mostra "Acesso
  restrito". A aba **Administração** só existe na barra inferior para
  Professor e Administrador autenticados.
- **Regras de posse**: Professor edita/exclui apenas as próprias postagens
  (`canModifyPost`); Administrador, qualquer uma. Professor gerencia
  professores e alunos, **nunca** contas de Administrador.
- A **fonte da verdade é o backend**: as guardas do app melhoram a
  experiência, mas a API rejeita com 401/403 mesmo se o app for adulterado.

### 2.4 Mudanças feitas no backend para suportar o app

A API original não cobria três necessidades da atividade; foram feitas estas
alterações (com testes), seguindo o que o projeto já havia decidido:

| Mudança | Motivo |
|---|---|
| `POST /posts` e `PUT /posts/:id` aceitam `autorId` opcional (padrão: usuário logado; o autor deve ser Professor ou Administrador, senão `400`) | O formulário de postagem precisa do campo **autor** |
| Rotas `/user` passam a aceitar Professor, com regra nos casos de uso que o impede de criar, ver, editar, promover ou excluir contas de Administrador | Professor cadastra e edita professores e alunos |
| `GET /user?tipo=2\|3` filtra por tipo | Listagens paginadas separadas de professores e alunos |
| `PUT /user/:id` com schema próprio, `senha` opcional | Editar um cadastro sem trocar a senha |
| Erros de validação do Fastify respondem `400` (antes `500`) | Mensagens corretas no app |

### 2.5 Paginação e busca

A API devolve arrays sem o total de registros. O app considera que existe
próxima página quando a página atual veio cheia (`PAGE_SIZE = 10`). A busca
(`/posts/search`) usa *debounce* de 400 ms e não é paginada, pois a API não
oferece paginação nesse endpoint.

### 2.6 Estrutura de pastas

```
├── App.tsx                       # Providers: SafeArea → Auth → Navigation
├── app.json                      # Nome, ícone, splash e plugins do Expo
├── assets/                       # Ícone, splash e favicon
├── docs/DOCUMENTACAO.md          # Este documento
└── src/
    ├── config/env.ts             # URL da API e tamanho da página
    ├── services/                 # api-client (Axios), token-storage
    ├── features/{auth,posts,usuarios}/
    ├── hooks/use-focus-request.ts
    ├── navigation/               # root-navigator, types
    ├── screens/                  # Telas
    ├── components/               # Componentes compartilhados
    ├── theme/                    # Cores e espaçamentos
    └── types/                    # Tipos de domínio
```

### 2.7 Identidade visual

O app tem logo própria (selo com capelo de formatura) usada no cabeçalho da
tela inicial, em um banner de boas-vindas, no ícone do aplicativo e na
splash. A paleta usa um azul-índigo (`#3730A3`) como cor principal; a barra
inferior usa ícones (Ionicons) e a navegação respeita o perfil do usuário.

## 3. Guia de uso

### 3.1 Executando o projeto

Pré-requisitos: Node 20+, o **backend** rodando (veja o repositório do
backend) e o app **Expo Go** no celular, ou um emulador.

```bash
npm ci
cp .env.example .env     # defina EXPO_PUBLIC_API_URL
npm start                # escaneie o QR code com o Expo Go
```

| Ambiente | `EXPO_PUBLIC_API_URL` |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Simulador iOS | `http://localhost:3000` |
| Celular físico (Expo Go) | `http://<IP-do-computador>:3000` (mesmo Wi-Fi) |

Se o app não conectar: confirme o IP com `ipconfig`, libere a porta 3000 no
firewall e reinicie com `npm start -- --clear` (as variáveis `EXPO_PUBLIC_*`
são lidas na hora do bundle). Para validar a rede, abra
`http://<IP>:3000/posts` no navegador do celular.

Para criar a primeira conta de Administrador, use `npm run seed:admin` no
repositório do backend.

### 3.2 Fluxos por perfil

- **Visitante**: na aba *Postagens* vê a lista (título, autor e resumo),
  busca por palavra-chave, navega entre páginas e abre uma postagem para
  ler o conteúdo completo e os comentários. Não vê o campo de comentário.
- **Aluno**: faz login na aba *Conta* e passa a comentar em qualquer
  postagem. Não vê a aba *Administração* nem botões de edição.
- **Professor**: vê o botão **Nova** na lista e a aba *Administração*.
  - *Nova postagem*: informa título, conteúdo e escolhe o autor (padrão: ele
    mesmo; a lista traz os professores).
  - *Editar*: disponível apenas nas próprias postagens (na tela de leitura
    e em *Gerenciar postagens*); o formulário carrega os dados atuais.
  - *Professores* e *Alunos*: listagem paginada com **Editar** e **Excluir**
    (com confirmação) e botão de cadastro. Na edição, a senha é opcional.
- **Administrador**: tudo o que o professor faz, mas sobre qualquer
  postagem e qualquer conta.

Não há auto-cadastro nem recuperação de senha: as contas são criadas por
professores ou administradores. O conteúdo das postagens é texto simples
(sem editor rico) e não há upload de imagens.

## 4. Testes e integração contínua

- **Testes do app** (Jest + `jest-expo` + Testing Library, 18 testes):
  - `api-client`: injeção do token, query, corpo JSON, resposta 204,
    tratamento de 401 (com e sem token), 400 e falha de rede, usando um
    adaptador falso do Axios que exercita os interceptors reais.
  - `jwt`: extração de perfil e detecção de expiração.
  - `permissions`: regras de posse de postagem e de gestão por perfil.
  - `validation` (cadastro de usuário), `excerpt` (resumo) e `PostCard`.
- **Backend**: os testes das mudanças (autor da postagem, gestão de contas
  por professor, corpo do `PUT /user` sem senha) estão no repositório do
  backend.
- **Verificações manuais**: o app foi executado em celular físico via Expo
  Go contra a API real. <CONFIRMAR: fluxos testados por perfil>
- **CI** (`.github/workflows/ci.yml`): a cada push na `main` e pull request,
  instala dependências, roda `typecheck`, os testes e gera o bundle Android
  (`expo export`) para garantir que o app compila.

```bash
npm run typecheck
npm test
```

## 5. Relato de experiências e desafios

Relato dos desafios encontrados durante o desenvolvimento do app, que foi
feito individualmente.

- **A API não estava pronta para o mobile.** Ao mapear os requisitos contra
  os endpoints, apareceram lacunas: `/user` aceitava só Administrador (a
  atividade pede que professores cadastrem professores e alunos), a criação
  de postagem não recebia o autor e não havia filtro por tipo de usuário para
  as listagens. Resolvi no backend, com a regra "professor nunca
  gerencia Administrador" nos **casos de uso**, e não só nas rotas, para que
  valesse para qualquer cliente.
- **Edição de cadastro sem senha.** Salvar um professor sem preencher a
  senha retornava *Internal Server Error*. O controller já tratava a senha
  como opcional, mas o schema de validação do `PUT` era o mesmo do `POST` e a
  exigia; além disso, o tratador global de erros transformava a falha de
  validação em `500`. Corrigi criando um schema de atualização e
  mapeando erros de validação para `400`, com testes de regressão.
- **Paginação sem total de registros.** A API devolve apenas a página
  pedida. Em vez de alterar o contrato, o app infere a existência de uma
  próxima página quando a atual vem cheia, aceitando a limitação de, no
  caso extremo de o total ser múltiplo de 10, mostrar uma última página
  vazia.
- **Sessão no dispositivo.** O token fica no `expo-secure-store`, não em
  armazenamento comum. Como o JWT só carrega `id` e `tipo`, o app decodifica
  o payload localmente (com decodificador base64 próprio, por causa das
  diferenças do Hermes) e verifica `exp` ao abrir o app, além de encerrar a
  sessão ao receber 401. Consequência assumida: o nome do usuário logado não
  é exibido, pois não vem no token.
- **Conectar o celular à API.** O endereço `localhost` não funciona no
  celular, e `10.0.2.2` só vale para o emulador Android; é preciso usar o IP
  do computador na rede, liberar a porta no firewall e reiniciar o Expo com
  cache limpo para ler o `.env`. Para facilitar o diagnóstico, a mensagem de
  erro de rede passou a incluir a URL que o app tentou acessar.
- **Migração de `fetch` para Axios.** O cliente HTTP inicial usava `fetch`.
  Ao adotar Axios, como toda a comunicação estava concentrada em um único
  arquivo, só ele precisou mudar (interceptors de token e de erro), e os
  testes foram reescritos com um adaptador falso para continuar validando o
  comportamento real dos interceptors.
- **Ferramentas de teste no React Native.** O ambiente de testes exigiu
  versões compatíveis (`react-test-renderer` alinhado ao React, API
  assíncrona do Testing Library nas versões recentes, tipos do Jest
  declarados explicitamente no `tsconfig`).
- **Identidade visual.** O app abria direto na lista, sem nome nem logo.
  Criei uma marca simples (capelo de formatura), cabeçalho com nome do
  app, banner de boas-vindas, ícones na barra inferior, ícone do aplicativo
  e splash; e a aba de administração passou a aparecer somente para quem tem
  permissão.
- **Separação em repositório próprio.** O app foi isolado do monorepo. O
  `.gitignore` padrão do Expo não ignorava o `.env`, o que violaria a regra
  de nunca versionar configuração local; foi corrigido, e o CI passou a
  cobrir o mobile.

## 6. Vídeo

https://youtu.be/nk8FGUOsa2c
