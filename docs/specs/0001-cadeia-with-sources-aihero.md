---
numero: 0001
titulo: Cadeia with_sources ponta-a-ponta — Section Courses → Source aihero.dev → Post
status: draft
data: 2026-06-05
fase: 1
boundary: catalog
---

# Spec 0001 — Cadeia `with_sources` ponta-a-ponta (Courses → aihero.dev → Post)

## Objetivo

Publicar, em produção, a primeira cadeia de conteúdo do hub: uma Section `Courses` (`with_sources`) contendo o Source **aihero.dev** e ao menos um `Post` com aprendizados — navegável de `/courses` → `/courses/aihero` → `/courses/aihero/<slug>`. Com isso o operador passa a publicar percepções do curso *enquanto o faz*, via o loop "escrevo MDX → PR → merge → no ar".

## Arquitetura desta fatia

Catálogo **MDX-native no Next** (sem API/Postgres) — ver [ADR-0018](../adr/0018-catalogo-mdx-native-na-fase-1.md). O `apps/web` lê `content/` em RSC/build-time, materializa o modelo de domínio do [ADR-0015](../adr/0015-epistemix-domain-model.md) em TypeScript e renderiza. `apps/api` segue só com `/health`.

### Layout de `content/` (raiz do repo)

```
content/
├── sections.yml          # declara Sections (slug, title, kind, order, description)
├── tags.yml              # conjunto curado fechado de Tags (ADR-0008)
└── courses/              # pasta = slug da Section (kind: with_sources)
    └── aihero/           # pasta = slug do Source
        ├── source.yml    # name, external_url, author, description
        └── primeiras-impressoes.mdx   # um Post
```

### Schemas

`sections.yml` (lista):
```yaml
- slug: courses
  title: Courses
  kind: with_sources        # direct | with_sources
  order: 1
  description: "Cursos que estou fazendo, com minhas notas e aprendizados."
```

`source.yml` (slug = nome da pasta):
```yaml
name: "AI Hero"
external_url: "https://aihero.dev"
author: "Matt Pocock"
description: "Curso sobre construir aplicações de IA em produção."
```

Frontmatter do Post (slug = nome do arquivo; ordenação por `date` desc):
```yaml
---
title: "Primeiras impressões"
date: 2026-06-05
status: published          # draft | published
tags: [ai, typescript]
summary: "Resumo curto — usado na listagem e na OG description."
---
```

`tags.yml` (conjunto curado — ADR-0008):
```yaml
- slug: ai
  label: "AI"
- slug: typescript
  label: "TypeScript"
```

### URLs (hierárquicas)

- `/courses` — página da Section (lista os Sources, pois `kind = with_sources`)
- `/courses/aihero` — página do Source (metadata externa + lista de Posts publicados)
- `/courses/aihero/<post-slug>` — página do Post (render da prosa MDX)

Slugs de Section ocupam o topo do path → guard de palavras reservadas (`authors`, `about`, `api`, …).

## Critério de aceite

- [ ] `content/sections.yml` declara `courses` (`with_sources`); existem `content/courses/aihero/source.yml` e ≥1 Post `published`
- [ ] `/courses` lista os Sources da Section (aihero aparece com nome + descrição)
- [ ] `/courses/aihero` mostra a metadata do Source (link para `aihero.dev`, autor) e lista os Posts `published` (ordenados por `date` desc)
- [ ] `/courses/aihero/<slug>` renderiza a prosa do Post + título + data + tags
- [ ] Post com `status: draft` não aparece em nenhuma listagem e a rota `/courses/aihero/<slug-draft>` retorna 404
- [ ] Tag no frontmatter fora de `content/tags.yml` **quebra o build** (invariante 9)
- [ ] Slug de Section que colida com palavra reservada falha de forma explícita (build ou check)
- [ ] A cadeia inteira está navegável em produção (`epistemix.dev/courses/aihero/...`)

## Vertical slices

Esta fatia é única e atravessa todas as camadas (não há sub-PRs obrigatórios; o agente pode quebrar internamente se ajudar o TDD, mantendo cada PR verde):

1. **Cadeia `with_sources` ponta-a-ponta** — leitura de `content/` (sections.yml + source.yml + frontmatter, com validação de tags e palavras reservadas no build) → rotas `/courses`, `/courses/aihero`, `/courses/aihero/<slug>` → render da prosa MDX → exclusão de `draft` (listagem + 404) → testes (parsing, validação, rotas, draft) → deploy. **Aceite:** todos os itens do critério acima, verificados em produção.

## Fora de escopo

- Section `direct` / blog (Post vinculado direto à Section, sem Source) — fatia futura
- `Presentation` + `slide-kit` — fatia própria (é a peça mais pesada da Fase 1)
- Busca e filtros por tag
- Landing page real (hero + grid de destaques) — a home segue a da Fase 0, com no máximo um link temporário para `/courses`
- OG tags / structured data / sitemap / robots.txt
- Qualquer engagement (`View`/`Vote`/`Comment`), auth, API de catálogo ou Postgres — Fase 2+

## Notas

- Domínio e invariantes: [CONTEXT.md](../CONTEXT.md) e [ADR-0015](../adr/0015-epistemix-domain-model.md) (Section/Source/Artifact/Post/Tag; invariantes 5, 6, 9, 14, 16)
- Arquitetura da Fase 1: [ADR-0018](../adr/0018-catalogo-mdx-native-na-fase-1.md)
- Tags curadas: [ADR-0008](../adr/0008-tags-curadas.md)
- Pipeline MDX: escolha de implementação do agente (provável Velite — schema tipado com Zod); validada pelo critério de aceite
- Origem: sessão `grill-with-docs` de 2026-06-05 (alvo de curto prazo: registrar o curso aihero.dev e publicar aprendizados em andamento)
</content>
