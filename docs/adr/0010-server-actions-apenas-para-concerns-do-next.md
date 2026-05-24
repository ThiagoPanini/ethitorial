# ADR 0010 — Server Actions apenas para concerns do Next; toda mutation de domínio vai para a FastAPI

- **Status:** Accepted
- **Data:** 2026-05-23
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [ADR-0001](0001-monorepo-and-boundaries.md), [ADR-0002](0002-stack-fastapi-nextjs-postgres.md), [ADR-0004](0004-hexagonal-pragmatica.md)

## Contexto

O Next.js 15 oferece **Server Actions** como mecanismo idiomático para mutations: uma função TypeScript marcada com `'use server'` que o cliente invoca como função normal, mas que roda no servidor do Next. Combinada com `useOptimistic` do React 19, dá UX otimista praticamente de graça. Tutoriais oficiais empurram esse padrão como o caminho default para qualquer mutation iniciada no front.

O stack do talkingpres tem `apps/web` (Next) e `apps/api` (FastAPI) como deployables distintos, com domain logic vivendo na API (ADR-0004). Surge a pergunta: onde fica a borda entre Server Action e endpoint FastAPI?

Duas armadilhas reais quando Server Action é a default:

1. **Server Action como proxy fininho:** a função apenas faz `fetch` para a FastAPI. Dobra a latência (browser → Next → FastAPI → Next → browser) e a complexidade arquitetural sem ganho real.
2. **Server Action com SQL direto:** a função fala com Postgres a partir do Next. Ganha latência, mas o domínio (regras como "um voto por par (User, Presentation)") vaza para `apps/web`. O ADR-0004 existe justamente para impedir esse vazamento — domínio puro mora na API, testável sem rede e sem framework. Uma vez que voto vaza, comentário vai junto, depois perfil, depois moderação; em meses `apps/web` vira um back-end disfarçado de front.

## Decisão

**Regra única que destrava a borda:**

> Se a operação **faz sentido sem o front** (app mobile futuro, integração externa, CLI, agente AI chamando a API) → **endpoint REST na FastAPI**, cliente chama via `fetch`.
>
> Se a operação **só faz sentido dentro do Next** (invalidar cache de rota, setar cookie funcional, redirect programático) → **Server Action**.

### Critérios operacionais

1. **Toda mutation que toca estado de domínio** (`catalog`, `identity`, `engagement`, `narration`) **vai para a FastAPI.** Browser chama a API REST diretamente. UX otimista vive no React via `useOptimistic` + chamada à API, não em Server Action.
2. **Server Actions são exclusivas para concerns do Next.js**: `revalidatePath`, `revalidateTag`, cookies funcionais (ex.: `session_id` do View do ADR-0009), redirects programáticos.
3. **API REST do FastAPI é a única fronteira tipada.** OpenAPI → `openapi-typescript` → `packages/types`. Schemas de domínio não são duplicados em `apps/web`.
4. **Cliente fala com a API pelo mesmo domínio via Cloudflare.** Path `/api/...` roteia para FastAPI; outros paths para Next. Sem `api.talkingpres.com` separado. Cookies funcionais ficam first-party, CORS é evitado, cache da Cloudflare aplicável em ambos.

### Proibição explícita

**Server Action que faz `fetch` para FastAPI é proibida.** É só um wrapper de latência dobrada. Se o `fetch` é necessário, faça do cliente. Exceção legítima: a Server Action precisa fazer a chamada *e também* outra ação do Next (revalidar, setar cookie) na mesma transação lógica — aí faz a Server Action coordenar, mas isso deve ser raro e justificado em comentário no código.

## Justificativa

- **Domínio fora do front é não-negociável.** O ADR-0004 fundou a arquitetura hexagonal com domínio puro na API. Permitir Server Action com SQL direto colapsa essa decisão.
- **Caminho da menor resistência em Next 15 é Server Action.** Sem regra explícita, "modernizações" futuras vão mover mutations pra `apps/web` por estética. O ADR registra a rejeição deliberada.
- **OpenAPI como fronteira sobrevive a múltiplos clientes.** Mobile futuro, CLI, agentes AI chamam a mesma API. Server Action duplicaria a superfície ou criaria um caminho privilegiado para o Next.
- **Mesmo domínio via Cloudflare elimina dores periféricas.** Cookies funcionais (View dedup do ADR-0009) ficam first-party. CORS deixa de ser configuração viva. Cache regras unificadas.

## Consequências

### Positivas

- Domain logic concentrado na API, testável sem framework.
- Tipos TS sincronizados via OpenAPI — sem drift entre Python e TypeScript.
- API serve qualquer cliente futuro sem refatoração.
- Latência das mutations não tem hop extra desnecessário.

### Negativas

- Mais código de fetch no cliente comparado a Server Action ingênua (mitigado por client gerado a partir do OpenAPI + helpers em `apps/web/lib/api-client`).
- `useOptimistic` exige um pouco mais de orquestração manual em comparação a Server Action + `useActionState`. Aceitável.
- Contribuidores acostumados ao "Next 15 way" vão estranhar — daí o valor deste ADR existir.

## Opções rejeitadas

- **Server Action como caminho default para mutations** (caminho tutorial-de-Next). Rejeitado por colapsar domínio em `apps/web` (cenário B2) ou por ser proxy inútil (cenário B1).
- **Subdomínio `api.talkingpres.com` separado.** Rejeitado por gerar CORS, dificultar cookies funcionais e exigir duas configurações Cloudflare paralelas sem ganho.
- **Router handlers do Next (`app/api/...`) como BFF.** Mesma armadilha do Server Action — ou vira proxy ou vira back-end paralelo.
