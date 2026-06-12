# ADR 0019 — Redesenho: protótipo da Direção A como alvo absoluto, push feature-completo, fases aposentadas

- **Status:** Accepted
- **Data:** 2026-06-12
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** adota a Direção A do protótipo em `.claude/design/` (substitui [docs/design/0001](../design/0001-direcao-visual-v1.md), agora superseded por [DESIGN.md](../DESIGN.md)); estende o domínio em [CONTEXT.md](../CONTEXT.md) (Now Learning / Timeline / Knowledge Graph + status de estudo); **aposenta a estrutura de fases** do [ROADMAP](../ROADMAP.md); revisa o enquadramento faseado de [ADR-0014](0014-roadmap-como-source-skill-solo-dev-assistant.md) e [ADR-0017](0017-desenvolvimento-autonomo-afk.md); **preserva** [ADR-0018](0018-catalogo-mdx-native-na-fase-1.md) (catálogo MDX-native), [ADR-0004](0004-hexagonal-pragmatica.md), [ADR-0009](0009-view-como-entidade-persistida.md), [ADR-0008](0008-tags-curadas.md), [ADR-0012](0012-slide-kit-base-plus-extensoes-locais.md) e os ADRs de stack/infra (0002/0003/0006/0016).

## Contexto

O epistemix nasceu como laboratório de práticas AI-first; muito do que se produziu serviu ao aprendizado e não à solução final. Um protótipo de alta fidelidade gerado no Claude Design (duas direções navegáveis, fluxo completo + quatro inovações de produto) atingiu uma maturidade de visão que o roadmap faseado não tinha. O operador decidiu: **o protótipo é absoluto** — a versão em produção deve realizá-lo exatamente, inclusive features que hoje não existem (discussão em posts, now-learning, cronologia, grafo).

Isso colide com três pressupostos vigentes:

1. **Disciplina de fases** ([ROADMAP](../ROADMAP.md)): Fase 1 read-only; engajamento (auth + Postgres) só na Fase 2; conteúdo dinâmico na Fase 3. O protótipo trata votos, **comentários** e views como cidadãos de primeira classe, exigindo auth + persistência **já**.
2. **Direção visual 0001** (violeta/aurora + Inter, sabor Linear): o protótipo a rompe deliberadamente em favor da estética editorial "Prensa" (Archivo + Source Serif 4 + Spline Sans Mono, acento laranja).
3. **Roadmap como single source de execução** ([ADR-0014](0014-roadmap-como-source-skill-solo-dev-assistant.md)): a fonte do plano passa a ser **issues**, não um documento de fases.

## Decisão

1. **Direção A ("Prensa") é o alvo de produto absoluto.** Tokens e padrões em [DESIGN.md](../DESIGN.md); divergência entre doc e protótipo resolve a favor do protótipo.
2. **Push feature-completo, sem gating de fases.** Implementa-se o protótipo inteiro — catálogo, leitura, ⌘K, player, now-learning, cronologia, grafo, **e engajamento autenticado (view/vote/comment + moderação) + auth + perfil** — numa cadeia contínua de vertical slices até o protótipo estar no ar. A estrutura de fases sequenciais do ROADMAP fica **aposentada**.
3. **A divisão arquitetural do [ADR-0018](0018-catalogo-mdx-native-na-fase-1.md) é preservada, não revertida.** O catálogo (Section/Source/Artifact/Tag) segue **MDX-native no Next**; o que muda é o *timing*: `engagement` (Postgres + `apps/api` + auth) deixa de ser "Fase 2 mais tarde" e entra **agora**, como primeiro estado dinâmico. As projeções derivadas (Now Learning / Timeline / Knowledge Graph) são read-models sobre o catálogo MDX — sem persistência nova.
4. **Substrato de execução = issues do GitHub** (via skill `to-issues`, fatias tracer-bullet). O alvo durável vive em três âncoras: o **protótipo**, o **DESIGN.md** e o **CONTEXT.md**. Não há mais documento de plano faseado; dependências de ordem (auth antes de comentar; migration antes de UI de voto; render de Post antes de busca) ficam nos links/labels/milestone das issues.
5. **Nav de conta completa** (avatar, menu, login, perfil `/authors/<username>`) é extensão deliberada — não existe no protótipo A — para suportar engajamento autenticado.

## Justificativa

- **O protótipo destravou uma visão coerente que o roadmap faseado fragmentava.** Comentário e voto *são* o produto na Direção A (barra de engajamento + seção de Discussão na leitura); adiá-los para "depois" entregaria um hub mutilado em relação ao alvo absoluto.
- **A disciplina de fases existia para conter risco quando a visão era difusa.** Com um alvo pixel-exato e infra de produção já no ar (Fase 0 fechada: VPS, Coolify, Cloudflare, CI nos 3 portões), o gating vira cerimônia: o risco que ele mitigava (construir a coisa errada) caiu.
- **Nada da arquitetura precisa ser desfeito.** O catálogo MDX-native (0018), a hexagonal (0004), o modelo de View (0009), tags curadas (0008) e o slide-kit (0012) seguem válidos e agora são *exercitados antes*. O port de leitura do catálogo continua sendo o eixo de evolução MDX→Postgres (Fase "CMS" futura).
- **Issues > roadmap-doc para um push contínuo.** Sem fases, um markdown de plano vira board disfarçado (a dor que o [ADR-0014](0014-roadmap-como-source-skill-solo-dev-assistant.md) já reconhecia). O alvo coeso é preservado pelo protótipo + DESIGN + CONTEXT, então não se perde a definição do "o quê".

## Consequências

### Positivas

- Uma visão única, pixel-exata, dirige toda a implementação.
- `apps/api` + Postgres ganham função imediata (engagement), encerrando o estado "ocioso" previsto pelo ADR-0018.
- O domínio (CONTEXT.md) é exercitado por inteiro de uma vez, incluindo os conceitos derivados.

### Negativas

- **Escopo maior antes do primeiro "tudo no ar".** Auth + Postgres + moderação entram cedo — mais superfície para acertar antes de fechar o protótipo. Mitigado: vertical slices via `to-issues`; cada fatia atravessa schema→API→UI→teste e pode ir a produção sozinha.
- **Perda da visibilidade macro de ordem** que o roadmap dava. Mitigado: milestone/labels nas issues; dependências explícitas no slicing.
- **Provedor de auth em aberto.** Decisão (Clerk vs. better-auth) fica para um **ADR dedicado** na primeira fatia de auth, não neste.

### Trip-wires (gatilhos de revisão)

- Se o push contínuo começar a empilhar slices sem chegar a produção (perda do loop "fatia → no ar"), reintroduzir um agrupamento leve (milestone) como portão de entrega.
- Se a moderação/abuso de comentários exigir mais que o painel admin simples + rate limiting previstos, abrir ADR de moderação.

## O que este ADR NÃO muda

- **Modelo de domínio** ([CONTEXT.md](../CONTEXT.md), [ADR-0015](0015-epistemix-domain-model.md)): estendido (3 read-models + status de estudo), não reescrito.
- **Catálogo MDX-native** ([ADR-0018](0018-catalogo-mdx-native-na-fase-1.md)): preservado; só o timing do engagement muda.
- **Stack e infra** (0002/0003/0006/0016) e **portões de deploy** ([ADR-0005](0005-deploy-checks-em-tres-portoes.md)): intactos — merge na `main` segue humano.
- **Fluxo AFK de feature-dev** ([ADR-0017](0017-desenvolvimento-autonomo-afk.md)): mantido (alinhar → slices em worktree → PR verde → revisão humana); só o "gating por fase" some.
