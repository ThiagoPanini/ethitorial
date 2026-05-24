# ADR 0011 — URL pública do publicador é `/authors/<username>`

- **Status:** Accepted
- **Data:** 2026-05-23
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [ADR-0007](0007-publicar-e-papel-de-user.md), [docs/VISION.md](../VISION.md)

## Contexto

O ADR-0007 estabelece que `User` é a entidade-publicador (não há `Author` no domínio), mas deixa explícita a brecha: "UI pública pode dizer 'author' como rótulo de display". A URL pública para listar as apresentações de um publicador é uma das primeiras manifestações concretas dessa brecha — e uma decisão duradoura, porque mudar depois quebra backlinks externos e penaliza SEO.

Padrões viáveis considerados:

1. `/authors/<username>` — linguagem de catálogo/biblioteca.
2. `/@<username>` — linguagem de rede social (Twitter, Threads, Medium).
3. `/users/<username>` — linguagem técnica/de plataforma (espelha o schema).

O tom da VISÃO ("padrão visual referenciado em codewiki.google", "vitrine de engenharia", "alto padrão visual") é acadêmico-técnico, não rede-social.

Decisão paralela: forma do `<username>`. Duas alternativas:

- **a)** Slug derivado automaticamente do display name (`thiago-panini`).
- **b)** Username escolhido pelo `User` no cadastro (`thiago`), com fallback gerado se o usuário não escolher.

## Decisão

**Adotar `/authors/<username>` como URL canônica do publicador.** `<username>` é campo `User.username`: escolhido pelo usuário no cadastro, único globalmente, imutável após escolhido, com fallback gerado a partir do display name caso o usuário não defina explicitamente.

### Regras concretas

1. `User.username` é único, lowercase, ASCII, regex `^[a-z0-9][a-z0-9-]{0,30}$`.
2. Imutável após primeiro set. Mudança exige fluxo manual (rename + 301 redirect mantido por 12 meses).
3. UI pública usa o rótulo "author" para se referir ao publicador (header da página, listagens, breadcrumb).
4. Em listagens de catálogo o link aponta para `/authors/<username>`.

## Justificativa

- **`/authors/<slug>` casa com o vocabulário de catálogo curado** — que é o que o produto é. "Author" é a palavra natural quando se fala de quem produziu uma apresentação técnica.
- **Rejeitar `/@<slug>` preserva o tom acadêmico-técnico.** A semântica social do `@` desalinha com o posicionamento CodeWiki-like.
- **Rejeitar `/users/<slug>` evita dump técnico em interface humana.** URL é interface, não schema.
- **Username escolhido > slug derivado** porque dá autonomia ao publicador (especialmente relevante na V3 multi-autor) e é convenção universal (GitHub, Twitter, dev.to). Fallback gerado cobre o caso "usuário não quer escolher agora".
- **Imutabilidade do `username`** preserva permalinks e SEO. Permitir rename livre cria custo de redirect/redirect-decay e gera URLs efêmeras.

## Consequências

### Positivas

- URL semanticamente honesta com o domínio do produto (catálogo de apresentações de autores).
- Backlinks externos estáveis no longo prazo.
- Multi-autor (V3+) escala sem mudança de rota.

### Negativas

- "Author" como rótulo de UI difere de `User` como termo de domínio — pequena dissonância que vive documentada no glossário e no ADR-0007.
- Usuário que escolheu username ruim na criação só consegue corrigir via fluxo manual com curadoria, não self-service. Custo aceito.

## Opções rejeitadas

- **`/@<username>`**: tom de rede social conflita com posicionamento técnico-curatorial.
- **`/users/<username>`**: termo técnico em UI pública; agride a brecha aberta no ADR-0007 ("UI pública pode dizer 'author'").
- **`username` mutável**: cria churn de SEO e permalink, sem ganho proporcional.
- **`username` derivado automaticamente**: tira autonomia do publicador; relevante a partir de V3.
