# Contexto de Domínio — talkingpres

Este documento é o **glossário e conjunto de invariantes** que define a linguagem comum do projeto. É lido por humanos e por agentes de IA antes de qualquer trabalho substantivo. Mudanças aqui são mudanças no jeito de pensar o produto.

> **Status:** consolidado após sessão `grill-with-docs` da Fase 0 (2026-05-23). Mudanças futuras passam por ADR + atualização inline.

## Glossário

| Termo | Definição operacional |
|---|---|
| **Presentation** | Unidade publicável no catálogo. Contém metadata (título, descrição, tags, publicador, data) e uma sequência ordenada de slides. Tem URL canônica via slug. |
| **Slide** | Unidade atômica dentro de uma Presentation. Renderizado a partir de MDX usando o `slide-kit` (catálogo base de primitivas, animações e chrome de player) + opcionalmente componentes locais da própria Presentation. Tem ordem fixa dentro da Presentation. Ver [ADR-0012](adr/0012-slide-kit-base-plus-extensoes-locais.md). |
| **User** | Pessoa autenticada na plataforma. Acumula dois papéis: (a) **publicador** de Presentations (Fase 3+), referenciado em `Presentation.published_by`; (b) **comentarista/votante** em engagement. Carrega persona pública (display name, avatar, bio), `role` (`user` ou `admin`) e `username` único e imutável usado em `/authors/<username>` (ver [ADR-0011](adr/0011-url-publica-do-publicador.md)). Ver [ADR-0007](adr/0007-publicar-e-papel-de-user.md). |
| **Tag** | Rótulo categórico aplicado a Presentations para descoberta. Exemplos: `ai`, `data`, `sre`, `software`. |
| **View** | Registro persistido de visualização de uma `Presentation`. Disparado no carregamento da página (POST client-side, com filtro server-side de bots/crawlers). Dedup por `(presentation_id, session_id, day_bucket_UTC)`. Carrega `user_id` opcional, `referrer_kind` e `country_code` (via Cloudflare). Usado tanto como sinal público de popularidade quanto base analítica. Ver [ADR-0009](adr/0009-view-como-entidade-persistida.md). |
| **Vote** | Upvote de usuário autenticado em uma Presentation. Toggle (votar / desfazer). Um voto por usuário por Presentation. |
| **Comment** | Texto curto de usuário autenticado em uma Presentation. Sujeito a moderação. |
| **Narration** *(V2)* | Sequência de áudios gerados por TTS, um por Slide, narrados com a voz clonada do autor. |
| **Knowledge Base** *(V2)* | Conjunto de embeddings derivados do conteúdo da Presentation, usado para responder Q&A via RAG. |

## Invariantes de domínio

> Regras que SEMPRE valem. Qualquer código que possa violá-las é bug.

1. Uma `Presentation` tem ao menos um `Slide`.
2. A ordem dos `Slide` dentro de uma `Presentation` é total e estável.
3. Um `Vote` é único por par `(User, Presentation)`.
4. `Comment.user_id` deve referenciar um `User` ativo.
5. `Presentation.slug` é único globalmente e imutável após publicação.
6. `Presentation` em estado `draft` não aparece em listagens públicas, busca, sitemap ou feeds.
7. `Presentation` publicada é mutável (conteúdo, ordem de slides, metadata exceto `slug`). Sem entidade `Version` no domínio. Histórico via auditoria (V2+). Versionamento explícito é decisão deferida para a Fase 4 (voz/RAG), quando regenerar narração torna a mudança custosa.
8. Toda mudança em `Presentation` publicada gera registro de auditoria (V2+).
9. `Tag` pertence a um conjunto curado fechado definido em `content/tags.yml`. Tag fora desse conjunto referenciada em frontmatter MDX falha a build. Ver [ADR-0008](adr/0008-tags-curadas.md).
10. `Comment` é flat (sem replies aninhadas). Menções `@usuario` resolvem referência humana; não há `parent_comment_id`. Decisão pode ser revisada quando volume real justificar threading.
11. `Comment` não recebe reações na V1/V2. `Vote` é exclusivamente sobre `Presentation`. Caso essa decisão seja revisada, o caminho preferido é estender `Vote` polimorficamente (alvo `Presentation | Comment`) — emoji reactions ficam fora de escopo permanente para preservar o tom curado do catálogo.
12. Moderação de `Comment` na Fase 2 é exclusivamente por `User` com `role = admin`. Autor de `Presentation` não tem poder especial de moderação local. Decisão revisada quando multi-autor entrar (V3+).
13. `View` conta uma vez por `(presentation_id, session_id, day_bucket_UTC)`. Gatilho: carregamento da página da `Presentation` (POST client-side). Requests de bots/crawlers identificados via User-Agent são descartados. `session_id` é cookie funcional anônimo. Schema enriquecido com `referrer_kind` e `country_code` desde o dia 1. Ver [ADR-0009](adr/0009-view-como-entidade-persistida.md).

## Boundaries de domínio

Cada boundary é dono dos seus modelos, regras e dados. Comunicação entre boundaries é via interface explícita, nunca import direto de modelos.

- **`catalog`** — Presentation, Slide, Tag, busca, listagem, render. Referencia `User` apenas por `UserId` (value object em `shared`); enriquecimento de display via port → `identity`. Ver [ADR-0007](adr/0007-publicar-e-papel-de-user.md).
- **`identity`** — User, Session, Auth, Profile (display name, avatar, bio)
- **`engagement`** — View, Vote, Comment, moderação, rate limiting
- **`narration`** *(V2)* — Narration, Knowledge Base, voice cloning, RAG, Q&A
- **`shared`** — tipos primitivos, erros base, value objects (ex.: `Slug`, `UserId`)
- **`platform`** — adapters de DB, storage, observabilidade, AI providers

Detalhamento arquitetural em [ARCHITECTURE.md](ARCHITECTURE.md).

## Termos ambíguos a evitar

| Não use | Use |
|---|---|
| "Post" | `Presentation` |
| "Like" / "Heart" | `Vote` |
| "Page" (referindo-se a slide) | `Slide` |
| "Topic" | `Tag` |
| "Talk" *(no domínio, fora da UI)* | `Presentation` |
| "Author" *(como entidade de domínio)* | `User` (no domínio) ou "publicador" (em texto solto). UI pública pode dizer "author" como rótulo de display — não é termo de domínio. Ver [ADR-0007](adr/0007-publicar-e-papel-de-user.md). |

## Decisões abertas

Tópicos não resolvidos que afetam o domínio. Cada um vira ADR ao ser decidido.

_(nenhuma no momento — todas as decisões iniciais foram resolvidas na sessão `grill-with-docs` da Fase 0)_
