---
name: write-a-guide
description: |
  Cria documentos de guides (receitas reproduzíveis passo a passo, em pt-BR) para docs/guides/ do talkingpres, calibrados ao padrão pós-correções (bootstrap-not-runbook, validação externa tripla, callouts visuais, receita AI autônoma, gitignore step, mini-diagramas). Cada guide resolve UMA etapa operacional concreta da trilha real do projeto.

  **Auto-activation:** quando o usuário pede para escrever, criar ou rascunhar um guide, tutorial passo a passo, receita operacional ou procedimento reproduzível. Também ao destilar ai-ops existente em receita executável, ou ao documentar o próximo passo da trilha do projeto.

  **Input sources:** ai-ops registrados (`docs/ai-ops/`), ADRs (`docs/adr/`), trilha definida no roadmap (`docs/ROADMAP.md`), e tarefas concretas solicitadas pelo usuário.

  **Output type:** arquivo markdown em docs/guides/NNNN-titulo.md com frontmatter `title/description/nav_title`, intro com escopo + callouts de bootstrap e alternativa estrutural, pré-condições incluindo ambiente local POSIX, 2-4 passos progressivos com friction/resolution e callouts visuais (⚠️/💡/🎯/✅), critério de sucesso objetivo, next steps e references.
agent: Plan
context: fork
metadata:
  internal: true
---

# Escrevendo Guides

## Goal

Produzir uma receita reproduzível em pt-BR para UMA etapa operacional concreta da trilha real do talkingpres. Guide não é narrativa nem aula — é instrução suficiente para que um operador novo, um agente AI autônomo ou um operador cansado consigam executar até o critério de sucesso sem auto-bloqueio, vazamento de segredo ou falsa sensação de êxito.

## Distinguir guide de outros gêneros

| Gênero | Pergunta que responde | Onde mora | Tom |
|---|---|---|---|
| **ADR** | Por que tomamos essa decisão? | `docs/adr/` | Decisão com tradeoff |
| **Lesson** | O que preciso entender sobre X? | `docs/lessons/` | Pedagógico, evergreen |
| **Guide** | **Como faço X agora?** | `docs/guides/` | **Receita imperativa, project-specific** |
| **Runbook** | Que comandos rodo para operar X? | `docs/runbooks/` | Referência consultável |
| **AI-ops** | O que a IA + operador fizeram em X data? | `docs/ai-ops/` | Narrativa situada |

Se a etapa **ainda não aconteceu** e depende de recurso inexistente, registre como `Next steps` em vez de criar guide prematuro. Se a etapa **já aconteceu** e o registro é histórico, escreva ai-ops. Guide é para **agora** ou **próximo passo executável**.

## Workflow

Cada guide percorre 6 fases. Não pular nenhuma — é exatamente a ordem que reduz friction acumulada.

1. **Investigar** — entender a etapa operacional, materiais de origem (ai-ops, ADRs, roadmap), o que já está implementado e o que falta. Ler [TEMPLATE.md](TEMPLATE.md) para a estrutura canônica e os guides existentes em `docs/guides/0001` e `0002` como referência viva.
2. **Mapear personas alvo e ambiente de execução** — escolher 2-4 personas em [PERSONAS.md](PERSONAS.md). Decidir nível de risco (operação destrutiva? credencial criada? mudança de DNS/firewall?) e contexto (humano supervisionando? agente autônomo?).
3. **Rascunhar** — seguir o template estrutural rigorosamente. Estrutura é rígida; a única coisa criativa é a sequência dos passos.
4. **Teste de personas** — passar o draft pelas personas escolhidas, simulando execução real. Onde houver friction (comando sem proof, sessão de risco sem Terminal A/B, validação só local), ajustar.
5. **Análise profunda** — aplicar o framework de [ANALYSIS.md](ANALYSIS.md). Categorizar problemas, priorizar P0/P1/P2/P3, atribuir nota auto-crítica nos 6 eixos (segurança operacional, reprodutibilidade, robustez sob carga cognitiva, aderência à trilha real, observabilidade, robustez contra UI mutável).
6. **Iterar** — aplicar **todos** os P0 (bloqueadores) e a maioria dos P1 antes de apresentar ao usuário. Guides têm tolerância menor a P0 do que lessons, porque consequências de seguir guide ruim são operacionais imediatas.

## Estrutura mínima obrigatória

Todo guide válido tem, nesta ordem:

- [ ] **Frontmatter `title` / `description` / `nav_title`** (canônico write-guide)
- [ ] **H1** com `Lição`/`Guide` não no título — apenas o nome da operação ("Criar conta Cloudflare e preparar DNS, R2 e MCP")
- [ ] **Intro de 2-3 parágrafos** declarando escopo, o que entra, o que **não** entra
- [ ] **Callout `> ⚠️ Bootstrap, não runbook`** — sempre, para distinguir de operação cotidiana
- [ ] **Callout `> 💡 Alternativa estrutural`** quando há alternativa séria considerada (Cloudflare Tunnel vs. caminho convencional, install manual vs. template, etc.)
- [ ] **`## Example`** com descrição do "vamos fazer X usando Y" + pré-condições
- [ ] **Pré-condições incluindo "Ambiente local POSIX"** explícito (shell, ferramentas locais necessárias, WSL2 para Windows)
- [ ] **2-4 passos progressivos** (`### Passo N: ...`), cada um com:
  - Contexto curto
  - Comando/ação mínima
  - Friction esperada (callout `> ⚠️ Armadilha` quando aplicável)
  - Resolução
  - Proof observável
  - Checkpoint fechado quando passo é arriscado (`> ✅ Checkpoint do Passo N`)
- [ ] **`## Critério de sucesso`** — lista de checks objetivos. Sem isso, usuário não sabe declarar "feito"
- [ ] **`## Next steps`** com links para próximo guide / runbook / ADR
- [ ] **`## References`** com docs oficiais consultadas

Detalhes completos seção-a-seção em [TEMPLATE.md](TEMPLATE.md).

## Padrões obrigatórios pós-correções

O talkingpres aprendeu padrões em duas ondas de revisão. Aplicar todos quando contexto exigir:

1. **Bootstrap callout** — todo guide de infra começa com `> ⚠️ Bootstrap, não runbook`.
2. **Validação externa tripla** — operações que fecham origem (firewall, DNS, TLS) exigem 3 proofs independentes: curl local + curl com `--resolve` bypass + vantage point externo.
3. **Callouts visuais, não prosa** — avisos críticos viram `> ⚠️ Armadilha` com sintoma + resolução.
4. **Receita AI autônoma** quando passo cria credencial — "se você não tem CLI de gerenciador de segredos, **pare** e peça ao humano".
5. **`.gitignore` step** antes de criar qualquer arquivo de config local com segredo (`.mcp.json`, `.env`, etc.).
6. **Mini-diagrama ASCII** para sistemas multi-actor (TLS three-sided, camadas de proxy, fluxo de auth).
7. **Diagnostic block** para estados travados conhecidos ("Se ficar `Pending` por mais de 48h").
8. **"Silêncio = sucesso"** em comandos Unix quietos (`sshd -t`, `visudo -c` quando passa).
9. **Terminal A/B labels** em mudanças com risco de auto-bloqueio (sshd, ufw, sudoers).
10. **Checkpoint fechado** após cada passo de alto risco com lista marcável e "pare aqui se algum item falhar".

Lista detalhada com sintaxe exata em [TEMPLATE.md](TEMPLATE.md).

## Regras de estilo

1. **pt-BR.** Sempre.
2. **Tom imperativo direto.** "Crie o record", "Valide com `dig`", não "Você poderia querer criar".
3. **Project-specific OK no corpo.** Diferente de lessons, guides referenciam `talkingpres-prod`, `<R2_BUCKET_BACKUPS>`, ADRs do projeto. Esse é o ponto.
4. **Placeholders sempre em `<MAIUSCULAS>`.** Operador precisa ver de relance o que substituir.
5. **Comandos em blocos `bash`** identificados. Saída esperada em blocos `text`.
6. **Proof observável depois de cada comando crítico.** "Resultado esperado: ...".
7. **Tabelas para comparações.** Não confundir com lessons (que são pedagógicas); tabelas em guides são referência rápida durante execução.
8. **Headings com ação no infinitivo ou imperativo.** "Criar conta Cloudflare", não "Sobre criação de conta".

## Avisos importantes

- **Guides envelhecem com UI dos provedores.** Hostinger, Cloudflare e Coolify mudam UI mais rápido do que outros sistemas. Não amarrar passos a textos exatos de botão; ensinar a validar **estado real** (`docker ps`, `ufw status`, `dig`).
- **Critério de sucesso é obrigatório.** Sem isso, usuário não sabe se passou. Guides sem critério são receitas abertas.
- **`Next steps` deve linkar próximo passo ou explicar por que não há.** "Próximo guide aguarda recurso X" é melhor do que `Next steps` ausente.
- **Antes de apresentar ao usuário**, sempre rodar pelo menos uma persona "operador cansado" e uma "agente AI autônomo". Se uma delas falhar, ajustar antes.

## Próximos passos

- **Estrutura canônica detalhada:** [TEMPLATE.md](TEMPLATE.md)
- **Framework de personas para teste:** [PERSONAS.md](PERSONAS.md)
- **Framework de análise profunda + rubrica de nota:** [ANALYSIS.md](ANALYSIS.md)
- **Exemplos vivos:** `docs/guides/0001-criar-vps-hostinger-com-coolify.md` e `docs/guides/0002-configurar-cloudflare-r2-mcp.md` são as referências canônicas pós-correções.
