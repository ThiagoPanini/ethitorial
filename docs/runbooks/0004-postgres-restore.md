# Runbook 0004 — Postgres backup e restore

Banco: `epistemix` no Postgres 17, hospedado via Coolify na VPS Hostinger.

## Backup pg_dump → R2

### Pré-requisitos
- `rclone` configurado com remote `r2` apontando para o bucket `epistemix-backups`
- `DATABASE_URL` disponível no ambiente

### Comando de backup

```bash
pg_dump "$DATABASE_URL" | gzip | \
  rclone rcat r2:epistemix-backups/postgres/$(date +%Y%m%d_%H%M%S).sql.gz
```

### Cron sugerido (crontab na VPS ou Coolify Scheduled Tasks)

```
0 3 * * * pg_dump "$DATABASE_URL" | gzip | rclone rcat r2:epistemix-backups/postgres/$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

## Verificar backups disponíveis

```bash
rclone ls r2:epistemix-backups/postgres/ | sort -k2
```

## Restore

> ⚠️ Operação 🔴 — restaurar por cima do banco de produção é irreversível.
> Confirmar com o operador antes de executar.

### 1. Listar backups

```bash
rclone ls r2:epistemix-backups/postgres/ | sort -k2 | tail -10
```

### 2. Baixar o backup escolhido

```bash
rclone copy r2:epistemix-backups/postgres/<arquivo>.sql.gz /tmp/
gunzip /tmp/<arquivo>.sql.gz
```

### 3. Parar a aplicação (evitar writes concorrentes)

Via Coolify UI: parar o serviço `epistemix-api`.

### 4. Restore

```bash
# Apagar banco e recriar (conectar como superuser)
psql "$DATABASE_URL" -c "DROP DATABASE IF EXISTS epistemix;"
psql "$DATABASE_URL" -c "CREATE DATABASE epistemix OWNER epistemix;"

# Restaurar
psql "$DATABASE_URL" < /tmp/<arquivo>.sql
```

### 5. Re-rodar migrations (garantir schema atual)

```bash
uv run alembic upgrade head
```

### 6. Religar a aplicação

Via Coolify UI: iniciar `epistemix-api`.

### 7. Verificar healthcheck

```bash
curl https://api.epistemix.dev/health
# Esperado: {"status":"ok","db":"ok"}
```

## Teste do restore (validação mínima — executar ao menos 1×)

Execute os passos 1–7 num ambiente de staging ou num Postgres local para confirmar
que o pipeline backup→restore produz um banco funcional antes de confiar nele
em produção.

```bash
# Restore local (Docker Postgres)
docker run -d --name pg-restore-test -e POSTGRES_PASSWORD=test -p 5433:5432 postgres:17
export TEST_URL="postgresql://postgres:test@localhost:5433/postgres"
psql "$TEST_URL" < /tmp/<arquivo>.sql
# Verificar tabelas
psql "$TEST_URL" -c "\dt artifact_*"
```
