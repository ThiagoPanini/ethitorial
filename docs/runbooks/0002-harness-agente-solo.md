---
numero: 0002
titulo: Operação do harness AI-first — loop solo
tipo: runbook
data: 2026-05-27
tags: [ai-first, harness, agentes, planning-board, mcp, vscode, workflow]
tldr: Referência de operação do ciclo de desenvolvimento assistido por IA como dev solo no talkingpres. O board (GitHub Projects) é visibilidade; o trabalho acontece no VS Code com Claude Code, Copilot e Codex. O board é operado via GitHub MCP server, não por scripts. Consulte durante operação; não é tutorial progressivo.
---

# Runbook 0002 — Operação do harness AI-first (loop solo)

> Runbook de referência, não tutorial. O **porquê** está no [ADR-0013](../adr/0013-substrato-de-planejamento-operado-por-agentes.md); os **princípios evergreen** na [lesson 0002](../lessons/0002-harness-basico-em-github-projects.md); o **protocolo operacional** na skill [`operate-planning-board`](../../.agents/skills/operate-planning-board/SKILL.md).

---

## Modelo mental

- **Board = visibilidade.** GitHub Projects `talkingpres — roadmap` (owner `ThiagoPanini`, número `4`). É onde você *vê* o estado; não é onde se trabalha.
- **Cockpit = VS Code.** O trabalho acontece local, com Claude Code (motor), Copilot (autocomplete + apoio) e Codex (executor alternativo) coexistindo na Agent Sessions view.
- **Operação do board = GitHub MCP server** (toolset `projects`), não scripts bash. Os três agentes leem/escrevem via tool MCP.

Dois eixos no board: **`Status`** (`Backlog`·`In progress`·`In review`·`Done`) e **`Owner`** (`Human`·`Agent`·`Pairing`). Estados especiais são labels: `someday` (parado) e `blocked` (travado por externo). `phase-N` e scope (`infra`/`ci`/`web`/…) são labels.

---

## Estado esperado do harness

- Project #4 com os 16 itens da Fase 0; campos `Status` (4 opções) e `Owner` (3 opções).
- Labels: `phase-0`–`phase-4`, `someday`, `blocked`, scope (`infra`, `ci`, `web`, `api`, `docs`, `catalog`, `identity`, `engagement`, `narration`, `shared`, `platform`), `proposed`.
- Branch `main` protegida: PR obrigatório, sem push direto.
- GitHub MCP server instalado em cada harness com toolset `projects` habilitado e token de scope `project`.
- git worktree por agente quando houver trabalho paralelo (particionar por boundary, ADR-0001).

---

## Fluxo diário mínimo (loop solo)

```
você acorda
  └─ olha o board (view "Delegável": Owner∈{Agent,Pairing}, Status=Backlog, -label:someday)
       ├─ há trabalho delegável → despacha agente no VS Code → PR aparece → você revisa → merge
       └─ não → triagem: promove someday→pronto, ajusta Owner/phase, ou cria issue
```

Regra de ouro: **você cura o backlog e aprova merges; o agente descobre, executa e reporta**. O board nunca decide nada irreversível — por isso o agente escreve nele livremente (via MCP).

---

## 1. Consultar o board

Preferir a **UI** para olhar (`https://github.com/users/ThiagoPanini/projects/4`) ou a extensão GitHub no VS Code (issues na sidebar). Para o agente, leitura via tool MCP `projects_get` (filtrar por `Status`, `Owner`, label `phase-N`, excluir `someday`/`blocked`).

Views recomendadas no board:

- **"Board"** — kanban por `Status`, filtrando `-label:someday`.
- **"Minha fila"** — filtro `Owner=Human` (o que depende só de você).
- **"Delegável"** — filtro `Owner∈{Agent,Pairing}`.

---

## 2. Triar backlog (ação humana)

Curadoria é **sempre humana** — nunca delegar. Triar = decidir o que entra na fila pronta:

- Issue com label `someday` que ficou pronta → remover `someday`, ajustar `Owner` e `phase-N`. Já está em `Backlog`; vira candidata a despacho.
- Issue proposta pelo agente chega com label `proposed`. Revise o corpo, decida se entra na fase, ajuste `Owner`/`phase`, remova `proposed`.

Não há transição `Backlog→Todo`: a fila pronta é o próprio `Backlog` sem `someday`/`blocked`. O **portão de curadoria é o ato de despachar** (passo 3), não uma coluna.

---

## 3. Despachar agente para uma issue (no VS Code)

### Claude Code (motor principal)

```
Sessão Claude Code aberta na raiz do repo.
Prompt: "Claim e execute a issue #<N> usando a skill operate-planning-board.
Leia AGENTS.md e o corpo da issue antes de planejar. Não faça merge."
```

O agente: lê via MCP → assigna-se + seta `Status=In progress` (MCP) → comenta o plano → executa em branch (worktree se paralelo) → abre PR `Closes #N` → seta `Status=In review` (MCP).

### Codex / Copilot (local, no VS Code)

Mesma intenção; ambos leem `AGENTS.md` nativo e a skill `operate-planning-board`. Use papéis distintos para evitar redundância e conflito: Claude planeja/executa; Codex executa tarefa escopada alternativa; Copilot autocomplete + apoio. **Particione por boundary + worktree** antes de rodar dois em paralelo.

### Overflow na nuvem (opcional, adiado)

Delegação nativa na nuvem (GitHub Agent HQ / `claude-code-action`) é **overflow documentado**, pago, e **exige ADR antes de adotar** (AGENTS.md). Não é o modo padrão — só para uma issue atômica que você queira largar fora do VS Code.

---

## 4. Acompanhar execução

- **PRs abertos:** UI/`gh pr list`, ou a extensão no VS Code.
- **Plano e comentários:** ler a issue (`In review` indica que há PR).
- **Status do item:** o agente seta `In progress`/`In review` via MCP; built-ins cobrem `Done`.

---

## 5. Revisar e mergear PR (gate duro — ADR-0005)

Revisar e mergear é **sempre ação humana**. Use a UI ou a extensão do VS Code para revisar o diff; merge via UI (recomendado, squash + delete branch). Após o merge, o Projects move o item para `Done` automaticamente (built-in `PR mergeado → Done`).

Tarefa sem PR (infra/humano): você fecha a issue → built-in `issue fechada → Done`.

---

## 6. Lidar com claim órfão

Item em `In progress` cujo agente sumiu (sessão cancelada, rate limit). Como o uso é individual, trate por **checagem manual ocasional**: confirme que ninguém está tocando, mova `Status` de volta para `Backlog` via MCP (ou pela UI), remova o assignee e comente o reset. Sem reaper automatizado — não se paga no uso solo.

---

## 7. Lidar com bloqueio externo

Quando o agente bate em registrar/DNS, segredo, Coolify, Cloudflare ou produção: ele adiciona label `blocked` + comentário do motivo, seta `Owner=Human`, e move `Status` de volta para `Backlog` (sai de `In progress`). Você age e, ao desbloquear, remove o label `blocked` e comenta o que foi feito — a issue volta a ser candidata a despacho.

---

## 8. Saúde do harness

- **MCP:** confirme que o toolset `projects` está habilitado e o token tem scope `project` antes de despachar (sintoma de falta: tools de projects não aparecem).
- **Snapshot do board:** olhe a contagem por coluna na UI; `In progress` com itens antigos = suspeita de claim órfão (passo 6).
- **Worktrees:** em trabalho paralelo, confira que cada agente está em seu worktree/branch antes de rodar.

---

## 9. Criar nova issue (backlog)

```bash
gh issue create \
  --title "<título em português>" \
  --label "phase-0,docs" \
  --body "## Contexto
<por que existe>

## Critério de aceite
- <item>"
```

Entra como `Backlog` (built-in `item adicionado → Backlog`). Ajuste `Owner` e adicione `someday` se ainda não estiver pronta. Issue proposta por agente leva `proposed` e espera sua triagem.

---

## 10. Propor ADR antes de implementar

Decisão arquitetural nova exige ADR antes de código (AGENTS.md). Verifique o último número (`ls docs/adr/`), crie o rascunho a partir de um existente, e — se quiser — use a skill `write-a-guide`/`grill-with-docs` para refinar. Não delegue a decisão a um campo livre do board; ela vira conhecimento versionado.

---

## Links

- Board: https://github.com/users/ThiagoPanini/projects/4
- Repo: https://github.com/ThiagoPanini/talkingpres
- Skill: `.agents/skills/operate-planning-board/SKILL.md`
- ADR-0013: `docs/adr/0013-substrato-de-planejamento-operado-por-agentes.md`
- ADR-0005: `docs/adr/0005-deploy-checks-em-tres-portoes.md`
- Lesson 0002: `docs/lessons/0002-harness-basico-em-github-projects.md`
