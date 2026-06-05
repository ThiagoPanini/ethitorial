# ADR 0018 — Catálogo MDX-native no Next na Fase 1; API/Postgres entram com engagement na Fase 2

- **Status:** Accepted
- **Data:** 2026-06-05
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** instancia o modelo de domínio do [ADR-0015](0015-epistemix-domain-model.md) na Fase 1; emenda [ARCHITECTURE.md](../ARCHITECTURE.md) ("`apps/web` consome `apps/api` para todas as operações de domínio") **para a Fase 1**; consome a arquitetura hexagonal do [ADR-0004](0004-hexagonal-pragmatica.md) (o port é o que permite trocar MDX→DB depois); reordena bullets da Fase 1 no [ROADMAP](../ROADMAP.md); governado pelo fluxo de feature-dev do [ADR-0017](0017-desenvolvimento-autonomo-afk.md) (este é o substrato do [spec 0001](../specs/0001-cadeia-with-sources-aihero.md))

## Contexto

A Fase 1 do [ROADMAP](../ROADMAP.md) entrega o **hub público read-only**. Três sinais nos documentos puxavam a implementação para direções opostas:

1. **[ARCHITECTURE.md](../ARCHITECTURE.md)** declara que `apps/web` "consome `apps/api` via fetch para **todas** as operações de domínio", que `catalog` é um boundary **Python** (`apps/api/src/epistemix/catalog/`), e que "OpenAPI é a fronteira" entre web e api. → implica **DB + API** servindo o catálogo.
2. **ROADMAP Fase 1** lista "Migrations Alembic iniciais" + "Endpoints REST: sections/sources/artifacts". → implica **DB + API**.
3. **ROADMAP Fase 1** *também* lista "Modo admin lo-fi: artefatos vivem em `content/<section>/*.mdx` no repo". → implica **arquivo, não DB**.

Um fato técnico aperta o nó: o **render** do conteúdo (prosa MDX do `Post`, slides via `slide-kit`) é obrigatoriamente no Next — `slide-kit` é React/Framer Motion em `apps/web` ([ADR-0012](0012-slide-kit-base-plus-extensoes-locais.md)). Ou seja, o *corpo* do `Artifact` sempre é lido pelo Next a partir dos arquivos. A única pergunta em aberto era se os **metadados** do catálogo (que Sections existem, lista de Artifacts, tags, slugs) passam pela API Python ou são derivados do mesmo MDX que o Next já lê.

Na Fase 1 não existe **estado dinâmico**: `View`/`Vote`/`Comment` (os primeiros consumidores reais de DB) são Fase 2; o CMS com conteúdo dinâmico é Fase 3. O conteúdo nasce e vive como MDX no repo (decisão "admin lo-fi" do ROADMAP).

## Decisão

Na **Fase 1**, o catálogo é **MDX-native no Next**: o `apps/web` lê `content/**/*.mdx` (RSC, build/server-time), extrai Sections/Sources/Artifacts/Tags do frontmatter + arquivos de declaração, e renderiza. **`apps/api` não participa do catálogo na Fase 1** — segue apenas com `/health` até a Fase 2.

Consequências diretas no plano:

- **`apps/api` catalog REST e Alembic/Postgres saem da Fase 1** e migram para a **Fase 2**, onde entram junto com `engagement` (`View`/`Vote`/`Comment`), que é o primeiro consumidor real de DB e de chamadas web→api.
- **O `catalog` boundary em Python ([ARCHITECTURE.md](../ARCHITECTURE.md)) não é exercido na Fase 1.** A linguagem de domínio do [ADR-0015](0015-epistemix-domain-model.md) é instanciada em TypeScript no `apps/web`, lendo o `content/` — sem reescrever o domínio, apenas materializando-o na camada que renderiza.
- **A emenda à ARCHITECTURE.md vale só para a Fase 1.** "Tudo via fetch da API" continua sendo o alvo para operações **dinâmicas** (engagement, auth, upload); conteúdo read-only autorado em arquivo é a exceção consciente enquanto não houver estado dinâmico.

### Evolução preservada pelo port (ADR-0004)

A leitura do catálogo é uma operação atrás de uma interface (um *content source*). Hoje o adapter é o sistema de arquivos (`content/`); quando a **Fase 3 (CMS)** trouxer conteúdo dinâmico, troca-se o adapter (MDX→Postgres, servido pela API) atrás da mesma fronteira. Começar MDX-native **não é dívida** — é a primeira implementação do port, não um atalho que precise ser desfeito.

## Justificativa

- **Sem estado dinâmico, não há o que a API guardar na Fase 1.** Trazer Postgres + Alembic + catalog REST para servir conteúdo que (a) é read-only e (b) já existe como arquivo no repo é máquina para um problema que ainda não existe — contra o princípio #4 da ARCHITECTURE ("custo previsível; atravesse a ponte ao medir gargalo real").
- **Uma representação só.** Como o Next já lê o `content/` para renderizar o corpo, derivar metadados do mesmo frontmatter elimina a segunda representação. As alternativas (API lê MDX em paralelo; ou seed MDX→Postgres) criam duplo manuseio do mesmo dado.
- **Casa com o alvo de curto prazo do operador.** O primeiro uso real é registrar o curso aihero.dev e publicar aprendizados *enquanto faz o curso* — o loop "escrevo MDX → commit → no ar" depende de zero fricção de seed/migration por post. Ver [spec 0001](../specs/0001-cadeia-with-sources-aihero.md).
- **A hexagonal cobre a reversão.** O eixo de evolução para DB não foi perdido; ficou encapsulado no adapter de leitura.

## Consequências

### Positivas

- Fase 1 fica drasticamente mais leve: nenhum schema, migration, ou endpoint de catálogo para construir antes de ter conteúdo no ar.
- Render estático/RSC do conteúdo → ótimo desempenho e SEO sem round-trip de API.
- O fluxo de autoria (lo-fi admin) fica trivial: novo `.mdx` → PR → merge → deploy.
- O `catalog` Python nasce na Fase 2/3 já informado por um modelo exercitado em produção.

### Negativas

- **Divergência temporária da ARCHITECTURE.md** ("tudo via fetch"). Mitigado: a emenda é explícita e escopada à Fase 1; operações dinâmicas seguem a regra original.
- **Domínio materializado em dois lugares ao longo do tempo** — TS no `apps/web` (Fase 1) e, futuramente, Python no `apps/api` (Fase 3 CMS). Risco de divergência de regras. Mitigado: o [ADR-0015](0015-epistemix-domain-model.md) + [CONTEXT.md](../CONTEXT.md) continuam a fonte única da linguagem; as invariantes são as mesmas dos dois lados.
- **`apps/api` fica "ocioso" (só `/health`) durante a Fase 1.** Aceitável — o esqueleto + Portão 3 já provam o pipeline de deploy da API; ela ganha função na Fase 2.

### Trip-wires (gatilhos de revisão)

- **Necessidade de estado dinâmico no catálogo antes da Fase 3** (ex.: conteúdo que muda fora do deploy) → antecipar o adapter Postgres + API.
- **Busca/filtros crescem além do que dá para resolver build-time/client-side** → considerar índice servido pela API.
- **Divergência real de regras entre o domínio TS e o futuro domínio Python** → consolidar a validação num lugar só (provável: gerar/compartilhar via OpenAPI quando a API assumir o catálogo).

## Opções rejeitadas

- **C — API Python lê o `content/` e serve metadados; Next renderiza o corpo.** Exercita o boundary `catalog` e a fronteira OpenAPI já na Fase 1, mas faz API e Next lerem `content/` em paralelo (duplo manuseio) sem nenhum estado dinâmico para justificar a API. Adia-se para a Fase 2/3, quando houver o que servir.
- **B — Seed MDX→Postgres; API serve tudo.** Materializa em DB conteúdo read-only que nem é dinâmico; o mais pesado dos três. Mesma conclusão: prematuro.
- **Manter a ARCHITECTURE.md ao pé da letra na Fase 1** ("tudo via fetch") → forçaria B ou C por dogma, contra o princípio de custo previsível.

## O que este ADR NÃO muda

- Modelo de domínio ([ADR-0015](0015-epistemix-domain-model.md)) e glossário ([CONTEXT.md](../CONTEXT.md)) — intactos; este ADR decide *onde* o domínio é servido, não *o que* ele é.
- Arquitetura hexagonal ([ADR-0004](0004-hexagonal-pragmatica.md)) — intacta; este ADR é uma aplicação dela (adapter de leitura trocável).
- Portões de deploy ([ADR-0005](0005-deploy-checks-em-tres-portoes.md)) e fluxo AFK ([ADR-0017](0017-desenvolvimento-autonomo-afk.md)) — intactos.
- O alvo de longo prazo "tudo dinâmico via API" — apenas **adiado** para quando houver estado dinâmico, não abandonado.
</content>
</invoke>
