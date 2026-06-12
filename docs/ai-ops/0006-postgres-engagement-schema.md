---
data: 2026-06-12
operacao: 1ª migration Alembic + schema engagement + healthcheck com DB
maquina: panini-vps (Hostinger KVM 2, Ubuntu 24.04 LTS)
operador: Thiago Panini
agente: Claude Code (issue #55)
resultado: código pronto — provisionamento Postgres no Coolify e segredos pendentes (🔴, ver seção abaixo)
referencias:
  issue: "#55"
  adr: "../adr/0002-stack-fastapi-nextjs-postgres.md"
  runbook_restore: "../runbooks/0004-postgres-restore.md"
---

# 20260612 — Alembic + schema engagement + healthcheck DB

Implementação da issue #55: estrutura de banco para o boundary `engagement`
(View, Vote, Comment), configuração Alembic async e `/health` com DB ping.

## O que foi feito (🟡 agente autônomo)

- `pyproject.toml`: deps adicionadas — `sqlalchemy[asyncio]>=2.0`, `asyncpg>=0.30`, `alembic>=1.14`; dev deps `pytest-asyncio`, `aiosqlite`
- `src/epistemix/db.py`: engine async, `SessionLocal`, `Base`, `ping_db()` (retorna `"ok" | "unconfigured" | "error"`)
- `src/epistemix/engagement/models.py`: `ArtifactView`, `ArtifactVote`, `ArtifactComment` — invariantes de domínio como constraints únicos
- `alembic/`: inicializado com template async; `env.py` lê `DATABASE_URL` do ambiente
- `alembic/versions/20260612152918_initial_engagement_schema.py`: migration reversível — upgrade cria as 3 tabelas + índices; downgrade derruba tudo
- `GET /health`: retorna `{"status":"ok","db":"ok"|"unconfigured"|"error"}`
- Testes: 5 testes verdes (health × 3, migration upgrade + downgrade)

## Pendências 🔴 (operador deve executar)

### 1. Provisionar Postgres 17 no Coolify

Via UI do Coolify ou MCP (operação 🟡 se criação simples, mas o operador deve confirmar):

```
Project: epistemix / environment: production
Tipo: PostgreSQL 17
Nome: epistemix-postgres
DB: epistemix
User: epistemix
```

Após criar, **copiar a Internal DB URL** (formato `postgresql+asyncpg://epistemix:<SENHA>@epistemix-postgres:5432/epistemix`).

### 2. Setar DATABASE_URL na app api

Via Coolify → app `epistemix-api` → Environment Variables:

```
DATABASE_URL=postgresql+asyncpg://epistemix:<SENHA>@epistemix-postgres:5432/epistemix
```

Nunca commitar este valor. Registrar a senha num gerenciador de segredos.

### 3. Rodar a migration em produção

Após o deploy da nova imagem (CI faz isso ao mergear):

```bash
# Conectar no container da api via Coolify → Terminal, ou:
docker exec -it <container-api> uv run alembic upgrade head
```

Verificar que as 3 tabelas existem:

```sql
\dt artifact_*
```

### 4. Configurar backup pg_dump → R2

Ver runbook em `docs/runbooks/0004-postgres-restore.md`.

Comando de backup (executar no cron da VPS ou via Coolify Scheduled Tasks):

```bash
pg_dump "$DATABASE_URL" | gzip | \
  rclone rcat r2:epistemix-backups/postgres/$(date +%Y%m%d_%H%M%S).sql.gz
```

Frequência sugerida: diária às 03:00 UTC.
