# Instruções para GitHub Copilot

A fonte canônica de instruções operacionais deste repositório é [`AGENTS.md`](../AGENTS.md) na raiz. Leia esse arquivo antes de qualquer sugestão substantiva.

Documentação adicional obrigatória:

- [`docs/VISION.md`](../docs/VISION.md) — por que o produto existe
- [`docs/CONTEXT.md`](../docs/CONTEXT.md) — glossário e invariantes de domínio
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — desenho de alto nível e boundaries
- [`docs/ROADMAP.md`](../docs/ROADMAP.md) — fases e marcos
- [`docs/adr/`](../docs/adr/) — decisões registradas

## Resumo das regras

- **Backend:** Python 3.13 + FastAPI + SQLAlchemy 2/SQLModel + Alembic. `uv` para deps. `ruff` para format/lint. `pyright` para tipos.
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind 4 + shadcn/ui + Framer Motion. Biome para format/lint.
- **Banco:** PostgreSQL 17. Toda mudança de schema via migration Alembic reversível.
- **Boundaries de domínio:** `catalog`, `identity`, `engagement`, `narration`, `shared`, `platform`. Não acoplar via imports cruzados.
- **Commits:** Conventional Commits. PRs pequenos (~300 LOC alvo).
- **Decisão arquitetural nova:** propor ADR antes de implementar.
- **Mudança em invariante de domínio:** atualizar `docs/CONTEXT.md` no mesmo PR.
- **Não introduzir features de fases futuras** (ver ROADMAP). Não usar `--force` ou `--no-verify`. Não commitar segredos.
