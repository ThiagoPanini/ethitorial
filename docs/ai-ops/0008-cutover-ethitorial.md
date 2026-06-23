---
data: 2026-06-22
operacao: cutover do rebatismo epistemix → ethitorial + migração epistemix.dev → ethitorial.panlabs.tech (ADR-0021), AFK via MCP
maquina: panini-vps (Hostinger KVM 2, Ubuntu 24.04 LTS) — VM id 1700377, IP 2.24.125.180
operador: Thiago Panini
agente: Claude Code
resultado: success
dividas:
  - teardown da zona/registros `epistemix.dev` (`epistemix.dev`, `www`, `api`) — 🔴, fica para o operador. O dry-cut já está feito (o `web` não serve mais esses domínios; Traefik não tem rota para eles → 404). Não removi nada da zona `epistemix.dev`.
  - banco antigo `epistemix-postgres` (`mq0tcp78vogkdwut8flansen`) **mantido de pé e intacto** como rede de rollback (dado descartável, mas preservado). Deletar (🔴) quando confortável — é a única cicatriz de nome antigo restante na infra.
  - imagens GHCR antigas `ghcr.io/thiagopanini/epistemix-{web,api}` ficaram órfãs (as novas `ethitorial-{web,api}` estão em uso e são públicas). Limpar quando quiser.
  - **social login (GitHub/Google) não completa ainda**: o app web não tem `GITHUB_CLIENT_ID/SECRET` nem `GOOGLE_CLIENT_ID/SECRET` (estado pré-existente — `auth.ts` só registra o provider se as 4 envs existirem) e os callback URLs no provider precisam virar `https://ethitorial.panlabs.tech/api/auth/callback/{github,google}`. Segredo de terceiro = 🔴 operador. A página de login carrega e o better-auth está ligado ao domínio novo; falta só o provider.
  - rename do diretório local `/workspaces/epistemix` — manual, operador (renomear no meio quebra o cwd e o path de memória do Claude).
  - sessão do `panlabs` (atualizar `targetUrl`/card para `ethitorial.panlabs.tech`) — separada, no repo dele (ADR-0021 decisão 9).
referencias:
  adr: ../adr/0021-rebatismo-ethitorial-e-migracao-panlabs-tech.md
  adr_autonomia: ../adr/0017-desenvolvimento-autonomo-afk.md
  adr_portoes: ../adr/0005-deploy-checks-em-tres-portoes.md
  setup_anterior: 0005-deploy-cutover-coolify-e-api-publica.md
  pr_rename: "#144 (big-bang epistemix → ethitorial)"
---

# 20260622 — Cutover do rebatismo ethitorial e migração para ethitorial.panlabs.tech

Execução AFK (fim a fim, via MCP Coolify/Cloudflare/Hostinger + `gh`/`git`) do [ADR-0021](../adr/0021-rebatismo-ethitorial-e-migracao-panlabs-tech.md): renomear o produto `epistemix` → `ethitorial` em marca, código, infra, banco e domínio, e mover `epistemix.dev` → `ethitorial.panlabs.tech` com **corte seco** (sem 301) e **downtime aceito** (sem usuários). O rename de código/docs/conteúdo foi o PR **#144** (big-bang, 83 arquivos); este registro cobre o **cutover de infra** e os portões de verificação.

## Cenário herdado (reconciliado por recon read-only antes de qualquer escrita)

- Coolify project `epistemix` (`uto7su3ktcloefuyhe2sq4de`) / env `production` (`tzb89djn4nwe7q5s20c4t4ho`) no server `localhost` (`xzika6refja7xc2j8sia6cp7`).
- `epistemix-web` (`kd4niwj9bzp2m7cwz0579ktk`) servindo `epistemix.dev`+`www`; `epistemix-api` (`y1iaroyitv1k9f46t4dssowt`) **público** em `api.epistemix.dev` (a dívida do [0005](0005-deploy-cutover-coolify-e-api-publica.md)).
- DB `epistemix-postgres` (`mq0tcp78vogkdwut8flansen`), db/user `epistemix`.
- Zona `panlabs.tech` (`29bcc2ac5e9d660c32a77df370b89e86`) já possuída, com irmãos `panlabs.tech`/`www`/`travelmanager.panlabs.tech` todos `A → 2.24.125.180` proxied.
- **Divergência favorável vs. handoff:** as 3 branches de segurança já estavam mergeadas (PRs #136/#137/#138) — Fase 0 já satisfeita; worktrees/branches stale removidos.

## Execução (o que ficou de pé)

1. **PR #144 mergeado** (squash) → `deploy.yml` (Portão 3) buildou e publicou `ghcr.io/thiagopanini/ethitorial-{web,api}:latest` (ambas **públicas**). O job de deploy foi vermelho só no smoke do domínio novo (ainda não existia) — esperado e não-quebrante.
2. **DNS aditivo (🟡, emenda ADR-0021):** `A ethitorial.panlabs.tech → 2.24.125.180` (proxied) na zona `panlabs.tech`, espelhando os irmãos. Nada removido de `epistemix.dev`.
3. **Banco recriado (🟡):** novo `ethitorial-postgres` (`rht5o7updyiiclr196j9mk17`), db/user `ethitorial`, senha gerada pela máquina (Coolify), `instant_deploy`. Não `ALTER`; o antigo segue intacto.
4. **Apps repontados (🟡):** project + apps renomeados para `ethitorial`/`ethitorial-web`/`ethitorial-api` (UUIDs preservados). Imagens → `ethitorial-{web,api}`. `web.fqdn = https://ethitorial.panlabs.tech`; **`api.fqdn` esvaziado → API internalizada** (sem domínio público).
5. **Envs reescritas + deduplicadas (🟡):** o `web` passou a ler `ETHITORIAL_API_URL = http://y1iaroyitv1k9f46t4dssowt:8000` (rede interna do Coolify, host = UUID do app), `BETTER_AUTH_URL = https://ethitorial.panlabs.tech`, `DATABASE_URL` → novo db (esquema `postgres://`, driver do better-auth). O `api` recebeu `DATABASE_URL` → novo db (esquema `postgresql+asyncpg://`). Removidas as **duplicatas** de `DATABASE_URL`/`BETTER_AUTH_*`/`ETHITORIAL_API_URL` (a armadilha de concatenação do [0005](0005-deploy-cutover-coolify-e-api-publica.md)).
6. **Deploy (🟡):** `api` primeiro — o `CMD` roda `alembic upgrade head && uvicorn`; as 3 migrations subiram limpas no db vazio (engagement → identity/auth → fix user_id). `web` em seguida — healthcheck verde na 1ª tentativa, cert Let's Encrypt emitido para `ethitorial.panlabs.tech`.
7. **Rede de segurança:** snapshot da VPS criado antes do cutover (action `100589358`); não havia snapshot anterior a sobrescrever.
8. **Identidade do repo (🟡):** GitHub `ThiagoPanini/epistemix` → `ThiagoPanini/ethitorial`; `git remote` local atualizado.

## Portões de verificação (ADR-0021 §Portões) — todos verdes

1. **CI verde** no PR #144 (web + api + security + open-pr).
2. `GET https://ethitorial.panlabs.tech` → **200**, TLS válido, `<title>ethitorial</title>`, "ethitorial" ×14, "epistemix" ×0.
3. `/health` da API **200** (interno); round-trip web→API interno: `POST /api/views/<probe>` → **204**, `GET` → **200 `{"count":0}`** (web → API interna → db → volta, JSON limpo).
4. Banco recriado, `alembic upgrade head` aplicado (head), caminho de query real funciona (o round-trip acima).
5. `/auth/sign-in` e `/auth/sign-up` → **200** no domínio novo; `/api/auth/get-session` → **200 JSON**; better-auth ligado a `BETTER_AUTH_URL=https://ethitorial.panlabs.tech` (cookie host-only no domínio novo). Headers de segurança (CSP/HSTS/X-Frame-Options) ativos.

## Obstáculos e resoluções (as surpresas)

- **Esquema do `DATABASE_URL` difere por app.** O `web` (better-auth, driver node) usa `postgres://`; o `api` (SQLAlchemy async) usa `postgresql+asyncpg://`. Reconstruí cada um preservando o esquema — usar asyncpg no web teria quebrado o better-auth.
- **Rede interna container-a-container AGORA funciona** (era a dívida central do [0005](0005-deploy-cutover-coolify-e-api-publica.md)): `http://<uuid-do-app>:8000` resolve e conecta na rede `coolify` (mesmo padrão do `internal_db_url`, que usa o UUID do db como host). Internalizar a API saiu de graça, sem hairpin público.
- **Duplicata de env reapareceu.** Após setar, o `web` ficou com duas `ETHITORIAL_API_URL` (mesmo valor); removida uma. Conferir `env_vars list` pós-escrita continua valendo.
- **GHCR das imagens novas.** Pacotes `ethitorial-{web,api}` nasceram **públicos** — Coolify puxa anônimo, sem credencial de registry.

## Dívidas

Ver frontmatter. Destaques 🔴 para o operador: teardown da zona `epistemix.dev`; deletar o `epistemix-postgres` antigo quando confortável; configurar OAuth (client id/secret + callback URLs no provider) para o social login completar; rename do diretório local; e a sessão separada do `panlabs`.
