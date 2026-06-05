# ADR 0014 — Substrato de planejamento via ROADMAP.md como single source, operado pela skill `solo-dev-assistant`

- **Status:** Accepted
- **Data:** 2026-05-30
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [ADR-0013](0013-substrato-de-planejamento-operado-por-agentes.md) (superseded em parte por este ADR — ver "O que ADR-0014 supersedes"), [ADR-0005](0005-deploy-checks-em-tres-portoes.md) (portões de merge inalterados), [ADR-0001](0001-monorepo-and-boundaries.md) (boundaries inalterados), [AGENTS.md](../../AGENTS.md) (seção "Board e fluxo dos agentes" precisa de reescrita), [lesson 0002](../lessons/0002-harness-basico-em-github-projects.md) (princípios evergreen, com nota de aplicação para esta calibragem)

## Contexto

O [ADR-0013](0013-substrato-de-planejamento-operado-por-agentes.md) R2 (mai/2026) estabeleceu **GitHub Projects v2** como instrumento de visibilidade ativa, **issues** como veículo de execução de tarefas, **ROADMAP.md** como narrativa de marcos, e operação via **GitHub MCP server** (skill `operate-planning-board`). O desenho era coerente e bem fundamentado — atacava modos de falha reais (claim órfão, espelho divergente, spec ungated) e tratava a divergência como problema a eliminar por construção (partição por altitude).

Em sessão de design via grilling (`grill-me`, 2026-05-30), o operador explicitou três sinais de atrito acumulados após a adoção parcial do R2:

1. **Fricção de materialização manual.** Criar issue + branch antes de cada tarefa é cerimônia que o operador admitiu literalmente: *"dificilmente farei isso manualmente"*. Para um solo dev em Fase 0, esse atrito impede o fluxo natural de "tive uma ideia → vou trabalhar nela".
2. **Board ativo é cerimônia sem retorno na escala atual.** Com ~12 bullets na fase corrente, manter card em coluna correta + sincronia com issues + mover entre estados é mais escrituração do que valor. A visibilidade que o board oferece (kanban, mobile-friendly) não compensa o custo quando a fonte humana (ROADMAP.md) já é o lugar onde o operador pensa.
3. **MCP server, apesar de funcional, ainda exige discipline de mover cards entre estados.** Removeu a fragilidade dos scripts bash (ganho real) mas não removeu a operação de cerimônia. O agente continua tendo que lembrar de marcar `In progress`, depois `In review`, depois aguardar o built-in fechar para `Done`. Cerimônia disfarçada.

### O que mudou na intuição

A pergunta original do R2 era: *"como manter board e ROADMAP coerentes sem divergência?"* — respondida por partição por altitude (marcos vs tarefas).

A pergunta nova é: *"para um solo dev em fase de baixa concorrência, qual é o desenho de menor cerimônia que ainda dá visibilidade entre sessões e cross-harness?"* — resposta diferente: **single source no ROADMAP.md com estados internos**, operado por skill que lê e por agente que edita via instruções em prosa.

O princípio de partição da [lesson 0002](../lessons/0002-harness-basico-em-github-projects.md) **continua válido**. A calibragem mudou: em vez de partir por altitude (marcos vs tarefas), partimos por tipo de dado (plano/estado no ROADMAP versionado; discussão na issue, quando precisar; código no PR). Não há duplicação porque cada dado tem um lar — só o lar é diferente do R2.

### O que esta decisão NÃO muda

- Portões de merge ([ADR-0005](0005-deploy-checks-em-tres-portoes.md)) inalterados — código continua passando por CI + revisão + pré-push.
- Boundaries de domínio ([ADR-0001](0001-monorepo-and-boundaries.md)) inalterados.
- Arquitetura hexagonal ([ADR-0004](0004-hexagonal-pragmatica.md)) inalterada.
- Princípios evergreen da [lesson 0002](../lessons/0002-harness-basico-em-github-projects.md) inalterados — apenas a aplicação concreta no talkingpres muda.

## Decisão

Adotar **ROADMAP.md como single source de plano + estado de execução**, operado pela skill **`solo-dev-assistant`** (framework multi-comando) com o suporte de **instruções no AGENTS.md** (intent-loop) e um **hook PostToolUse** para auto-commit das transições.

### Modelo de dados — ROADMAP.md como fonte única

| Informação | Lar único | Como |
|---|---|---|
| Plano de tarefas por fase | `docs/ROADMAP.md` | bullets `- [ ]` agrupados por fase |
| Estado de execução | `docs/ROADMAP.md` | marker `🚧` (em-andamento), `[x]` (concluído) |
| Anotação de bloqueio | `docs/ROADMAP.md` | parêntese `(aguardando: <razão>)` ao lado do `🚧` |
| Intent de roteamento (quem executa) | `docs/ROADMAP.md` | sufixo `` `@human` `` ou `` `@agent` `` (apenas em fase ativa) |
| Discussão profunda de tarefa (raro) | Issue do GitHub | criada manualmente quando necessário; opcional |
| Código e revisão | Pull Request | gated por [ADR-0005](0005-deploy-checks-em-tres-portoes.md) |

**Sintaxe dos estados:**

```markdown
- [ ] Trocar nameservers para Cloudflare `@agent`
- [ ] Trocar nameservers para Cloudflare `@agent` 🚧
- [ ] Trocar nameservers para Cloudflare `@agent` 🚧 (aguardando: registrar conta CF)
- [x] Trocar nameservers para Cloudflare `@agent`
```

Quatro estados representáveis com 3 markers + uma anotação opcional. O modelo dos 3 estados (não 4 do R2) reflete que o despacho continua sendo manual (do VS Code) — `Todo` colapsa em "disponível" (`[ ]` sem marker), e bloqueio é metadado do `🚧`, não estado separado.

**Sufixo `@human`/`@agent`:** aplicado apenas em bullets de fases em planejamento ativo (hoje: Fase 0 e topo da Fase 1). Fases distantes (3, 4) ficam sem sufixo até serem promovidas a foco. Reduz ruído visual sem perder a função onde importa.

### Skill `solo-dev-assistant` — framework multi-comando

**Distribuição:** skill global no harness do operador. Planejada para distribuição pública via `npx skills` (Vercel) em momento futuro.

**Dois comandos na v1:**

| Comando | Propósito | Uso |
|---|---|---|
| `start` | Bootstrap de projeto novo (greenfield) | One-shot, **não usado em talkingpres** (projeto já passou desta fase) |
| `briefing` | Orientação de sessão de trabalho | Recorrente, invocação manual via `/solo-dev-assistant briefing` |

**Padrão de invocação:** verbose (`/solo-dev-assistant <comando>`) seguindo convenção de skills multi-comando como `impeccable`. Sem alias curto na v1 — adicionar só se a fricção de digitação justificar.

**Crescimento futuro:** comandos novos entram **puxados por dor observada**, não por catálogo a priori. Trip-wire de adição: se um atrito real (não hipotético) aparecer 3+ vezes em uma semana, considerar comando dedicado.

### Mecanismos operacionais — os três

O sistema tem três mecanismos com gatilhos distintos. Confundi-los é o erro mais comum.

| # | Mecanismo | Gatilho | Função | Cross-harness? |
|---|---|---|---|---|
| 1 | **Skill `briefing`** | Operador digita `/solo-dev-assistant briefing` | Lê ROADMAP + git + PRs, devolve digest 5-seções | Sim |
| 2 | **AGENTS.md (intent-loop)** | Operador expressa intenção no chat ("vou pegar X") | Agente reconhece, propõe edição do ROADMAP, edita após confirmação | Sim |
| 3 | **Hook PostToolUse** | Agente edita `docs/ROADMAP.md` | Auto-commit `chore(roadmap): ...` | **Não** — Claude Code only |

**Cenário ilustrativo:**

1. Operador invoca `/solo-dev-assistant briefing` (mecanismo 1) — vê estado, decide pegar uma tarefa.
2. Operador responde no chat: *"vou pegar nameservers"* — agente (mecanismo 2) reconhece, propõe marcar `🚧` no ROADMAP, edita após confirmação.
3. Hook (mecanismo 3) dispara automaticamente ao detectar edição em `ROADMAP.md`, comita com prefixo `chore(roadmap):`.
4. Sessão paralela (qualquer harness) invoca `briefing` — vê `🚧` no ROADMAP, classifica nameservers como "em voo", não re-sugere.

### Formato do output do `briefing`

Cinco seções em markdown rendered:

1. **Em voo** — bullets com `🚧` (sem anotação `aguardando:`) + PRs abertos
2. **Bloqueado / aguardando você** — bullets com `🚧 (aguardando: ...)` + PRs aguardando revisão
3. **Disponível para pegar** — bullets `[ ]` (sem marker) na fase ativa, top 5, com sufixo `@human`/`@agent` visível
4. **Skills sugeridas para esta sessão** — mapeamento estático (lista no SKILL.md), correlacionando tarefas em voo a skills úteis
5. **Recém-concluído** — via `git log --grep "chore(roadmap):" --since="7 days ago"`

Determinístico: mesmo estado do ROADMAP/git/PRs produz output idêntico. Sem opinião subjetiva. Sem direcionamento técnico opinativo (a ordem do ROADMAP é o direcionamento implícito).

### Sobre issues — deferidas (Option C)

Issues do GitHub passam a ser **opcionais e manuais**. Critério para criar:

- Tarefa requer discussão estendida (decisões técnicas que merecem thread)
- Tarefa precisa de link explícito de PR (`Closes #N`) por algum motivo de auditoria

**Sem auto-sync ROADMAP → issues.** A automação via GitHub Action (escutar push em `ROADMAP.md`, criar/fechar issues conforme markers) é trip-wire para o futuro — implementar só quando a falta de issues se mostrar atrito real.

### Sobre o board GitHub Projects — deferido

Board #4 (`talkingpres — roadmap`) **deixa de ser instrumento operacional**. ROADMAP.md cumpre o papel de visibilidade de plano + estado.

O board pode voltar como visibilidade adicional se:
- Fase 1+ trouxer >10 tarefas concorrentes que precisem de visualização kanban
- Necessidade de roteamento multi-pessoa (deixar de ser solo)
- Visibilidade mobile-friendly do GitHub virar requisito real (não hipotético)

Até lá: arquivar o board ou simplificá-lo (não exige decisão neste ADR — fica em aberto, sem operação ativa).

### Hooks recomendados

| Hook | Evento | Função | Prioridade |
|---|---|---|---|
| 1 | `PostToolUse` em `Edit`/`Write` casando `docs/ROADMAP.md` | Auto-commit `chore(roadmap):` | **Essencial** (parte do MVP) |
| 2 | `SessionStart` | `git status -s` + última linha de `git log` + branches feature ativas (3-5 linhas) | Opcional |
| 3 | `PreToolUse` em `Edit` casando `docs/ROADMAP.md` | Valida sintaxe (markers, sufixos) e bloqueia se quebrar convenção | Para depois |

Hook 1 é Claude-Code-only. Codex/Copilot não têm equivalente — para esses, AGENTS.md instrui o agente a comitar manualmente.

## Justificativa

- **Lightness > completeness na escala atual.** Solo dev, Fase 0, ~12 bullets concorrentes. Cerimônia do R2 não se paga nesta escala. Quando a escala mudar, esta decisão tem trip-wires explícitos para revisão.
- **Single source elimina divergência por construção** (princípio evergreen da [lesson 0002](../lessons/0002-harness-basico-em-github-projects.md)). Não é refinamento — é tirar uma cópia do sistema.
- **Cross-harness portability via ROADMAP.md.** O arquivo commitado é lido idêntico por Claude, Codex e Copilot. Sem MCP server requirido, sem schema de board para sincronizar.
- **Atrito reduzido no fluxo "ideia → execução".** Operador fala intenção no chat, agente edita ROADMAP via AGENTS.md, hook comita. Zero cerimônia manual.
- **Skill como produto distribuível** casa com o 3º pilar da [VISION](../VISION.md) ("processo como produto / vitrine AI-first"). Se a skill amadurecer, vira aprendizado público — alinhamento com motivação declarada.
- **Framework multi-comando estabelece namespace para evolução** sem comprometer com catálogo a priori. Cada comando entra puxado por dor.

## Consequências

### Positivas

- ROADMAP.md fica autossuficiente para responder "o que falta, o que está em voo, o que está bloqueado".
- Sessões diferentes (mesmo ou outros harnesses) leem o mesmo estado por construção — visibilidade cross-session sem infra extra.
- Operador não cria issues nem branches manualmente para fluxo padrão. Intenção verbal → ROADMAP atualizado.
- Histórico auditável: cada transição é commit (`git log --grep "chore(roadmap):"` mostra a timeline).
- Skill multi-comando dá home estável para crescimento futuro (capture, audit, retro, etc.) sem proliferar skills paralelas.
- Comportamento previsível e determinístico do `briefing` — invocar duas vezes seguidas com mesmo estado produz output idêntico.
- Reversibilidade: se este desenho não servir, voltar para R2 (ou variante) é trabalho de doc, não de código.

### Negativas

- **Commits `chore(roadmap):` poluem git log.** Em semana ativa, 20-30 commits dessas transições. Mitigado pelo prefixo filtrável (`git log --invert-grep --grep "chore(roadmap):"`) mas o contagem em si cresce.
- **Hook PostToolUse funciona só em Claude Code.** Operador usando Codex/Copilot precisa comitar manualmente as edições do ROADMAP. AGENTS.md cobre essa instrução, mas é assimetria real.
- **Sem GitHub-native visibility** (board kanban, notificações de mudança de status, mobile-friendly view). Operador que abrir o GitHub mobile vê o ROADMAP.md renderizado, não um kanban.
- **ROADMAP.md fica visualmente mais técnico** com markers + sufixos `@human`/`@agent`. Para um documento que é vitrine pública, é ruído real, embora mitigado pelo critério "sufixo só em fase ativa".
- **Skill `start` não tem teste em projeto real do talkingpres** (já passou desta fase). Validação fica para projeto throwaway no momento da implementação.
- **Defere problemas que podem voltar.** Issues, board, auto-sync — todos têm trip-wire mas se um aparecer, é trabalho de redesign parcial.

### Critério de reversão / trip-wires

- **Commits `chore(roadmap):` viram ruído insuportável** → bundle transições com commits de código (operador edita ROADMAP no mesmo commit que entrega código), aceitando perda parcial da auditoria fina.
- **Cross-harness assimetria do hook causa problema concreto** (alguma sessão de Codex/Copilot esquece de comitar e quebra cadeia) → adicionar validação determinística (hook 3 PreToolUse) que bloqueia tool se ROADMAP modificado sem commit pendente.
- **Número de tarefas concorrentes > 10** → reconsiderar board GitHub Projects como visibilidade adicional (não substituindo ROADMAP — complementando).
- **Discussão profunda sobre uma tarefa específica vira frequente** → criar issue para essa tarefa específica vira convenção; AGENTS.md atualizado para sugerir quando criar.
- **Deixar de ser solo** (qualquer colaborador entrar) → reabrir desenho inteiro. Esta calibragem assume solo; co-trabalho assíncrono provavelmente exige board ou equivalente.
- **Skill `start` falha em projeto real** → revisar protocolo de adaptive questioning, possivelmente retornar ao questionário fixo.

## O que ADR-0014 supersedes em ADR-0013 R2

| R2 decidiu | ADR-0014 reverte para | Por quê |
|---|---|---|
| Board (Projects v2) como instrumento de visibilidade ativa | Board deferido; ROADMAP.md cumpre visibilidade | Para fase 0 com ~12 bullets, board ativo é cerimônia sem retorno |
| Issues como veículo de execução de tarefas | Issues opcionais, manuais, deferidas | Operador "dificilmente" cria issues manualmente; auto-sync custa infra |
| Máquina de 4 estados no board (`Backlog`/`In progress`/`In review`/`Done`) | Máquina de 3 estados no ROADMAP via marker (`[ ]`/`🚧`/`[x]`) | Sem board, estados vivem no doc; despacho manual colapsa `Todo` em "disponível" |
| Campo `Owner` no board (`Human`/`Agent`/`Pairing`) | Sufixo `` `@human` ``/`` `@agent` `` no bullet do ROADMAP | Marca onde a tarefa mora; pairing fica em open até prática provar |
| Operação via GitHub MCP server (`projects_get`/`projects_write`) | Skill `solo-dev-assistant` + hook PostToolUse + AGENTS.md | MCP eliminou fragilidade dos scripts mas não a cerimônia; mecanismos novos eliminam ambos |
| Skill `operate-planning-board` como protocolo | Skill `solo-dev-assistant` (framework multi-comando) | Skill antiga vira obsoleta; nova tem escopo mais amplo (start + briefing + futuras) |
| Anotação `blocked` como label | Anotação `(aguardando: <razão>)` inline no bullet com `🚧` | Sem board, labels não fazem sentido; anotação inline mantém contexto onde está a tarefa |

**O que de R2 permanece válido:**

- Princípio de fonte única por partição (lesson 0002) — apenas o eixo de partição mudou.
- Assimetria de autonomia: agente livre no reversível (editar ROADMAP), humano gated no irreversível (merge, segredos, produção).
- Status é estado efêmero, não conhecimento — mas agora vive no ROADMAP versionado (uma exceção consciente; commits `chore(roadmap):` viram a "história" do estado, com custo de poluição assumido).
- VS Code como cockpit, despacho manual (não pull autônomo do agente).
- Branch protection em `main` ([ADR-0005](0005-deploy-checks-em-tres-portoes.md)) intacto.

## Opções rejeitadas

- **Manter desenho de R2 como está.** Atrito real observado em uso — manter seria ignorar sinal.
- **Migrar tudo para Issues do GitHub** (todos os bullets viram issues criadas antecipadamente). Backlog morto polui board, perde narrativa narrativa do ROADMAP, exige materialização antecipada (que o operador admitiu não fazer).
- **Spec-Kit-like ceremony** (`/specify` → `/plan` → `/tasks` → `/implement`). Peso desproporcional para solo dev em Fase 0. Tentativa rejeitada explicitamente no grilling após reconhecer que "panorama-led claim" estava deslizando para esse padrão.
- **Skills separadas por comando** (`/panorama`, `/capture`, `/audit` como skills paralelas). Perde reuso de infraestrutura (leitura de ROADMAP, formatação de output, vocabulário). Skill multi-comando vence.
- **Designar todos os comandos da `solo-dev-assistant` agora.** Operador nunca operou nenhum comando ainda — designar 5-10 comandos é guessar verbos para fricções hipotéticas. Adicionar comandos só puxado por dor.
- **Hook automático para o `briefing`** (SessionStart dispara). Rejeitado por: força frame de execução em sessões que podem ser de exploração; assimetria cross-harness; ruído em múltiplas sessões/dia.
- **Hook real do harness para intent detection** (em vez de AGENTS.md). Rejeitado por: NLU é território do modelo, não de regex; AGENTS.md é portável cross-harness.
- **Co-assignment de bot accounts em issues** (`assignee = você + claude[bot]`). Funciona limpo só para Claude (e exige repo público); assimétrico entre harnesses; risco de trigger acidental futuro. Label `owner:agent` é semântica mais honesta.

## Apêndice operacional

### A. Modelo do ROADMAP.md — exemplo concreto

```markdown
## Fase 0 — Fundação

### Infra e borda

- [x] Provisionar VPS Hostinger (KVM 2) e endurecer `@human`
- [x] Instalar Coolify `@human`
- [ ] Borda Cloudflare `@agent` 🚧 (aguardando: decisão sobre TLS Full strict)
  - [ ] Trocar nameservers para a Cloudflare `@agent`
  - [ ] Publicar Coolify em subdomínio proxied `@agent`
  - [ ] Criar admin do Coolify `@human`
  - [ ] Fechar a origem `@pairing`
- [ ] Backup do Postgres em R2 `@human`
- [ ] Runbook de restore mensal do Postgres `@human`
- [ ] Deploy "hello world" em produção `@agent`
```

Sub-bullets podem ou não ter sufixo individual — convenção é marcar quando o owner do sub difere do owner do pai.

### B. Estrutura da skill `solo-dev-assistant`

```
.agents/skills/solo-dev-assistant/
├── SKILL.md                    # frontmatter + descrição do framework
├── commands/
│   ├── briefing.md             # implementação do comando briefing
│   └── start.md                # implementação do comando start
├── templates/                  # usados pelo comando start
│   ├── README.md.tmpl
│   ├── VISION.md.tmpl
│   ├── ROADMAP.md.tmpl
│   ├── AGENTS.md.tmpl
│   └── CONTEXT.md.tmpl
└── skills-map.md               # mapeamento estático para "Skills sugeridas"
```

### C. Hook PostToolUse — exemplo de configuração

Em `.claude/settings.json` (ou `settings.local.json` conforme escopo):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "condition": "tool_input.file_path matches '**/docs/ROADMAP.md'",
        "command": "cd $(git rev-parse --show-toplevel) && git add docs/ROADMAP.md && git commit -m \"chore(roadmap): auto-commit transição\""
      }
    ]
  }
}
```

A sintaxe exata depende do schema de hooks do Claude Code vigente — validar na documentação oficial no momento da implementação.

### D. Instrução para `AGENTS.md` (intent-loop)

Texto-modelo a ser incluído na reescrita da seção "Board e fluxo dos agentes":

> Quando o operador expressar intenção de trabalhar em uma tarefa do ROADMAP (ex.: "vou pegar X", "vamos começar pelo Y"), o agente:
>
> 1. Identifica o bullet correspondente em `docs/ROADMAP.md`.
> 2. Propõe explicitamente a edição: "Vou marcar 'X' como 🚧 no ROADMAP. Confirma?"
> 3. Edita após confirmação. O hook PostToolUse (Claude Code) cuida do commit; em Codex/Copilot, agente comita manualmente com prefixo `chore(roadmap):`.
>
> Ao terminar uma tarefa (PR mergeado, trabalho não-PR concluído), agente propõe marcar `[x]` com mesma cerimônia.
>
> Ao identificar bloqueio externo, agente propõe adicionar anotação `(aguardando: <razão>)` ao lado do `🚧`. Não move para "disponível" — bloqueio é metadado do em-andamento.

### E. Exemplo end-to-end de fluxo operacional

Walkthrough de três sessões consecutivas demonstrando como os três mecanismos (skill `briefing`, AGENTS.md intent-loop, hook PostToolUse) convergem no ROADMAP.md como fonte única, sem retrabalho cross-session.

#### 20h — primeira sessão do dia

1. Operador abre Claude Code no repo e digita `/solo-dev-assistant briefing`.
2. Skill (mecanismo 1) lê ROADMAP + git + PRs e devolve:

   ```markdown
   ## Panorama — talkingpres @ Fase 0

   ### Em voo
   nada

   ### Bloqueado / aguardando você
   nada

   ### Disponível para pegar
   1. Trocar nameservers para Cloudflare `@agent` — destrava 3 sub-tarefas
   2. Backup do Postgres em R2 `@human`
   3. CI básico do GitHub Actions `@agent`
   4. Skeleton monorepo apps/web + apps/api `@agent`
   5. Docker Compose local com Postgres `@agent`
   (+7 mais no ROADMAP)

   ### Skills sugeridas
   (nenhuma — sem tarefas em voo)

   ### Recém-concluído (últimos 7 dias)
   - VPS hardening completo
   ```

3. Operador responde no chat: *"vou pegar nameservers"*.
4. Agente (mecanismo 2 — instruído por AGENTS.md) reconhece a intenção e propõe:

   > Reconheci sua intenção. Vou marcar "Trocar nameservers para Cloudflare" como 🚧 no ROADMAP. Confirma?

5. Operador: *"sim"*.
6. Agente edita `docs/ROADMAP.md`, mudando o bullet para:

   ```markdown
   - [ ] Trocar nameservers para Cloudflare `@agent` 🚧
   ```

7. Hook PostToolUse (mecanismo 3) dispara automaticamente ao detectar a edição em `docs/ROADMAP.md` e roda:

   ```bash
   git add docs/ROADMAP.md && git commit -m "chore(roadmap): mark nameservers as 🚧"
   ```

   O operador não digitou nenhum comando git.
8. Operador inicia o trabalho — cria branch `feat/infra-nameservers`, codifica, eventualmente abre PR.

#### 21h — segunda sessão no mesmo dia

A primeira sessão estourou janela de contexto, ou o operador abriu uma segunda janela do Claude Code para paralelizar (ou Codex/Copilot para tarefa independente).

1. Operador digita `/solo-dev-assistant briefing` na nova sessão.
2. Skill lê o ROADMAP **commitado** (pela ação do hook na sessão anterior), vê o marker `🚧`, e classifica nameservers como em voo:

   ```markdown
   ## Panorama — talkingpres @ Fase 0

   ### Em voo
   - Trocar nameservers para Cloudflare 🚧 — branch feat/infra-nameservers, sem PR ainda

   ### Bloqueado / aguardando você
   nada

   ### Disponível para pegar (excluindo em-voo)
   1. Backup do Postgres em R2 `@human`
   2. CI básico do GitHub Actions `@agent`
   3. Skeleton monorepo apps/web + apps/api `@agent`
   ...

   ### Skills sugeridas para esta sessão
   - Para "Trocar nameservers" (em voo): `prompt-engineering-patterns` para gerar prompt detalhado
   ```

Zero redundância com a sessão das 20h. O estado vem do ROADMAP commitado — não de session ID, não de cache, não de banco. Funciona idêntico nos três harnesses.

#### Dia seguinte — PR mergeado

1. Operador abre o repo, digita `/solo-dev-assistant briefing`.
2. Skill detecta via `gh pr list` que o PR de nameservers foi mergeado, mas o bullet ainda está marcado `🚧` (o merge não atualiza ROADMAP automaticamente):

   ```markdown
   ### Em voo
   - Trocar nameservers para Cloudflare 🚧 — PR #X mergeado, ROADMAP ainda em voo

   ### Disponível para pegar
   1. Backup do Postgres em R2 `@human`
   ...
   ```

3. Agente (mecanismo 2) propõe:

   > Detectei que o PR de "Trocar nameservers" foi mergeado mas o ROADMAP ainda está em 🚧. Quer marcar como `[x]`?

4. Operador: *"sim, marca"*.
5. Agente edita ROADMAP — bullet vira `- [x] Trocar nameservers para Cloudflare \`@agent\``.
6. Hook auto-comita: `chore(roadmap): mark nameservers as done`.
7. Próximo `briefing` (mesmo dia ou subsequente) mostra nameservers em "Recém-concluído" — derivado de `git log --grep "chore(roadmap):" --since="7 days ago"`.

#### O que esse exemplo demonstra

- **Os três mecanismos têm gatilhos independentes mas convergem no ROADMAP** como fonte única.
- **Cross-session e cross-harness por construção** — a sessão 2 sabe o que a sessão 1 fez porque ambas leem o ROADMAP commitado, sem infraestrutura extra de sincronização.
- **Atrito de materialização tendendo a zero** — operador fala em linguagem natural, confirma, e os artefatos surgem.
- **Histórico auditável sem esforço extra** — cada transição é um commit; `git log --grep "chore(roadmap):"` reconstrói a linha do tempo das tarefas.
- **Determinismo** — invocar `briefing` duas vezes seguidas com o mesmo estado do ROADMAP/git/PRs produz output idêntico. Sem ranking subjetivo dinâmico.

### F. Implementação pendente e ordem recomendada

A adoção plena deste ADR requer três blocos de trabalho:

1. **Sincronização documental** — atualizar [AGENTS.md](../../AGENTS.md) (seção "Board e fluxo dos agentes") para refletir o novo desenho; adicionar nota de migração no apêndice da [lesson 0002](../lessons/0002-harness-basico-em-github-projects.md); arquivar a skill obsoleta `operate-planning-board` (mover para `_archive/` ou remover).

2. **Implementação da skill `solo-dev-assistant` + comando `briefing` + hook PostToolUse** — criar a estrutura conforme apêndice B, implementar o comando `briefing` conforme a especificação do output na seção Decisão, configurar e testar o hook conforme apêndice C.

3. **Implementação do comando `start`** — após o `briefing` ter sido operado por 1-2 semanas e o desenho ter sido validado contra prática real, implementar `start` para projetos novos. Smoke test obrigatório em projeto throwaway antes de declarar v1 estável (este comando não é usado em talkingpres).

Ordem cronológica recomendada:

1. Mergear este ADR.
2. Executar o bloco 1 (sincronização documental).
3. Executar o bloco 2 (skill + `briefing` + hook).
4. Operar o `briefing` por 1-2 semanas, capturar sinais de fricção real.
5. Executar o bloco 3 (`start`).
6. Revisitar este ADR ao final da Fase 0 para registrar lessons learned. Possível R2 deste ADR baseada em uso prático.
