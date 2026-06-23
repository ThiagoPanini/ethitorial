# Fluxo de trabalho e skills

Como o trabalho é despachado e executado no `ethitorial`. Carregado sob demanda pelo [AGENTS.md](../../AGENTS.md).

## Estado de execução

O alvo de produto é o **protótipo da Direção A** (`.claude/design/`). O alvo durável vive em três âncoras: o protótipo, [docs/DESIGN.md](../DESIGN.md) (visual) e [docs/CONTEXT.md](../CONTEXT.md) (domínio). O **estado de execução vive nas issues do GitHub** — fatias vertical-slice geradas pela skill `to-issues`, com label de triagem `agent-ready`. Não há board nem ROADMAP faseado a sincronizar ([ADR-0019](../adr/0019-redesenho-prototipo-absoluto-push-feature-completo.md)). O despacho é manual, no VS Code (Claude Code, Copilot, Codex).

**Pegar trabalho:** escolha uma issue `agent-ready` sem bloqueio em aberto (respeite o `Blocked by`). O estado vive na própria issue (assignee/labels/comentário/PR com `Closes #N`), não em documento versionado.

**Dependências duras do push atual:** shell/tokens antes de tudo → catálogo antes dos derivados (now-learning, cronologia, grafo) e da busca → auth antes de voto/comentário → 1ª migration + Postgres antes de view/voto/comentário.

## Antes de codar

- **Feature nova:** ler [CONTEXT.md](../CONTEXT.md), [ARCHITECTURE.md](../ARCHITECTURE.md) e os ADRs relevantes.
- **Mexer no front:** ler [DESIGN.md](../DESIGN.md) e conferir a tela correspondente no protótipo da Direção A (`.claude/design/`) — alvo absoluto; divergência resolve a favor do protótipo ([ADR-0019](../adr/0019-redesenho-prototipo-absoluto-push-feature-completo.md)).
- **Decisão arquitetural nova:** registrar um ADR em `docs/adr/NNNN-titulo.md` antes de implementar.
- **Mudança em invariante/glossário:** atualizar [CONTEXT.md](../CONTEXT.md) no mesmo PR.
- **Mudança de comando/convenção:** atualizar o [AGENTS.md](../../AGENTS.md) (ou o módulo em `docs/agents/`) no mesmo PR.
- Tests primeiro (TDD) sempre que viável. Validar UI/UX rodando o app de verdade no browser, não só testes verdes.

## Skills (`.agents/skills/`)

`find-skills`, `frontend-design`, `grill-me`, `grill-with-docs`, `prompt-engineering-patterns`, `skill-creator`, `solo-dev-assistant`, `to-issues`, `tdd`, `eptmx` (autoria de conteúdo publicável do catálogo). Nativas do Claude Code: `init`, `verify`, `simplify`, `review`, `security-review`, `claude-api`, `update-config`.
