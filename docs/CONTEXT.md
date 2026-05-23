# Contexto de Domínio — talkingpres

Este documento é o **glossário e conjunto de invariantes** que define a linguagem comum do projeto. É lido por humanos e por agentes de IA antes de qualquer trabalho substantivo. Mudanças aqui são mudanças no jeito de pensar o produto.

> **Status:** esqueleto inicial. Conteúdo definitivo será refinado na primeira sessão `grill-with-docs` da Fase 0.

## Glossário

| Termo | Definição operacional |
|---|---|
| **Presentation** | Unidade publicável no catálogo. Contém metadata (título, descrição, tags, autor, data) e uma sequência ordenada de slides. Tem URL canônica via slug. |
| **Slide** | Unidade atômica dentro de uma Presentation. Renderizado a partir de MDX. Tem ordem fixa dentro da Presentation. |
| **Author** | Pessoa autora de uma Presentation. Na V1, exclusivamente o mantenedor. Na V3+, qualquer usuário autorizado. |
| **Tag** | Rótulo categórico aplicado a Presentations para descoberta. Exemplos: `ai`, `data`, `sre`, `software`. |
| **View** | Registro anônimo ou identificado de visualização de uma Presentation. Conta uma vez por sessão por usuário (TBD: critério exato). |
| **Vote** | Upvote de usuário autenticado em uma Presentation. Toggle (votar / desfazer). Um voto por usuário por Presentation. |
| **Comment** | Texto curto de usuário autenticado em uma Presentation. Sujeito a moderação. |
| **Narration** *(V2)* | Sequência de áudios gerados por TTS, um por Slide, narrados com a voz clonada do autor. |
| **Knowledge Base** *(V2)* | Conjunto de embeddings derivados do conteúdo da Presentation, usado para responder Q&A via RAG. |

## Invariantes de domínio

> Regras que SEMPRE valem. Qualquer código que possa violá-las é bug.

1. Uma `Presentation` tem ao menos um `Slide`.
2. A ordem dos `Slide` dentro de uma `Presentation` é total e estável.
3. Um `Vote` é único por par `(User, Presentation)`.
4. `Comment.author_id` deve referenciar um `User` ativo.
5. `Presentation.slug` é único globalmente e imutável após publicação.
6. `Presentation` em estado `draft` não aparece em listagens públicas, busca, sitemap ou feeds.
7. Toda mudança em `Presentation` publicada gera registro de auditoria (V2+).

## Boundaries de domínio

Cada boundary é dono dos seus modelos, regras e dados. Comunicação entre boundaries é via interface explícita, nunca import direto de modelos.

- **`catalog`** — Presentation, Slide, Tag, Author, busca, listagem, render
- **`identity`** — User, Session, Auth, Profile
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

## Decisões abertas

Tópicos não resolvidos que afetam o domínio. Cada um vira ADR ao ser decidido.

- [ ] Critério exato de contagem de `View` (sessão? IP? cookie? por janela de tempo?)
- [ ] `Presentation` aceita versionamento (editar regenera versão) ou é imutável após publicar?
- [ ] `Tag` é livre (criada por autor) ou curada (whitelist)?
- [ ] `Comment` aceita threading/replies ou é flat?
- [ ] Quem modera comments na V1 (autor da apresentação? admin global? ambos?)
