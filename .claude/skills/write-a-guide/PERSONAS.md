# PERSONAS — framework de teste operacional

Guides são executados, não apenas lidos. O que parece claro para quem escreveu pode auto-bloquear quem executa. As 5 personas abaixo são lentes obrigatórias antes de considerar um guide pronto.

Use as personas em **dois momentos**:

1. **Construção** — antes de rascunhar, escolher quais personas devem executar com sucesso. Isso calibra densidade dos checkpoints, presença de Terminal A/B, profundidade de validação externa.
2. **Execução simulada** — depois do draft, simular execução mental por cada persona escolhida. Onde houver friction (comando ambíguo, decisão arbitrária, proof ausente), ajustar.

As personas aqui se sobrepõem parcialmente com as de `write-a-lesson`, mas estão calibradas para **execução** e não **compreensão**.

---

## Persona M — Marina, operadora nova na área

### Background

- Dev frontend/backend com 3-5 anos de experiência geral.
- Conhece o projeto na superfície mas nunca fez essa operação específica.
- Para infra: sabe Docker básico, ssh por chave, mas nunca tocou em `sshd_config`, `ufw`, `iptables` ou DNS autoritativo.
- Lê o guide com calma, com tempo para validar cada passo.

### Como ela executa

- Cola comandos no terminal sem entender 100%, mas para nos proofs para confirmar.
- Não tem intuição para distinguir prosa contextual de comando.
- Quando bate em jargão (`iptables`, `PAM`, `ACME`, `--resolve`), decide rápido: ou ela infere pelo contexto, ou ela acelera assumindo "deve dar certo".
- Aprecia checkpoints fechados — confirmam que está no caminho certo.

### Sinais de friction durante execução

- Comando sem proof depois — ela não sabe se passou.
- Jargão que escapou inline-define.
- Passo arriscado sem Terminal A/B label.
- Validação só local sem instrução de "como confirmar externamente".
- Pré-requisito assumido mas não declarado (e.g., "ssh-agent rodando").

### Checklist específico ao revisar como Marina

- [ ] Todo comando tem proof observável depois?
- [ ] Todo passo arriscado (sshd, ufw, sudoers) tem Terminal A/B explícito?
- [ ] Todos os jargões do guide estão inline-definidos ou linkados para lesson/glossário?
- [ ] Pré-condições cobrem o ambiente local POSIX dela?
- [ ] Existe checkpoint após cada passo de alto risco?
- [ ] Comandos Unix quietos (`sshd -t`, `visudo -c` quando passa) têm nota "silêncio = sucesso"?

### Critério pass/fail

**Pass:** Marina executa o guide do começo ao fim sem auto-bloqueio. Pode pausar em pontos de dúvida, mas cada dúvida é resolvida pelo guide (callout, checkpoint, proof).

**Fail:** Marina auto-bloqueia, vaza segredo em buffer, ou termina sem saber se passou. Qualquer fim ambíguo é fail.

---

## Persona A — André, operador cansado em recuperação noturna

### Background

- Solo founder ou tech lead, conhece a stack.
- Está executando o guide em modo recuperação (algo quebrou em produção; está reconstruindo) ou em fim de noite (energia baixa).
- Pula leitura porque "já fez isso antes" mesmo quando guide pede atenção.
- Faria a operação no escuro se possível.

### Como ele executa

- Skim agressivo. Lê só headings e blocos de código.
- Cola comandos rapidamente. Não para para ler prosa contextual.
- Confunde guide com runbook se o aviso "Bootstrap, não runbook" não estiver visível.
- Pula proofs se "parecer que deu certo".

### Sinais de friction durante execução

- Aviso crítico em prosa em vez de callout visual `> ⚠️`.
- Ordem ambígua (passo 5 "vai antes ou depois do 6?").
- Falta de "pare aqui se X falhar" em pontos de não-retorno.
- Critério de sucesso vago ou ausente.
- Validação externa única (não tripla) em fechamento de origem.

### Checklist específico ao revisar como André

- [ ] Avisos críticos são callouts visuais, não parágrafos?
- [ ] Bootstrap callout está no topo, visível?
- [ ] Passos têm ordem clara e justificada (números, não bullets)?
- [ ] Checkpoint fechado tem "pare aqui se algum item falhar"?
- [ ] Critério de sucesso é objetivo e enumerado?
- [ ] Validação externa tripla é mandatória onde se fecha origem?

### Critério pass/fail

**Pass:** André chega ao critério de sucesso seguindo só headings + blocos de código + callouts visuais. Não precisa parar para ler prosa contextual.

**Fail:** André pula um aviso crítico que estava em prosa, ou avança com falha silenciosa por falta de critério de sucesso, ou confunde guide com runbook por falta de aviso visível.

---

## Persona D — Daniel, agente Claude Code autônomo

### Background

- Instância Claude Code instruída a "executar o guide NNNN" sem operador humano supervisionando.
- Lê o guide inteiro antes de começar.
- Executa comandos via Bash, valida saídas, decide próximo passo.
- Tem ferramentas mas não tem GUI: não pode abrir browser, clicar em "Confirm" da Cloudflare, ou colar senha em prompt visual.

### Como ele executa

- Trata cada bloco de código como comando candidato. Pode confundir prosa contextual com comando se a marcação não for clara.
- Não tem fluência intuitiva para decidir "se UI X, então Y" sem instrução explícita.
- Risco de criar tokens amplos para "não falhar" — interpreta restrição como limite, não como princípio.
- Risco de gerar senha em buffer próprio (scrollback do agente).

### Sinais de friction durante execução

- Instrução "abra a UI e clique em X" sem alternativa CLI ou explicação do que acontece.
- Criação de credencial sem receita CLI explícita.
- Falta de receita "se não tiver ferramenta Y, pare e peça ao humano".
- Token scopes descritos como "amplos OK" em vez de princípio explícito de menor privilégio.

### Checklist específico ao revisar como Daniel

- [ ] Toda criação de credencial tem receita AI autônoma (CLI ou "pare e peça ao humano")?
- [ ] Token scopes têm exemplo concreto de escopo mínimo aceito?
- [ ] Validação por leitura precede qualquer instrução de escrita?
- [ ] `.gitignore` step é command, não recomendação?
- [ ] Guardrails (plano antes de escrita) têm proof positiva de funcionamento?
- [ ] Instruções com UI têm alternativa CLI quando possível?

### Critério pass/fail

**Pass:** Daniel executa o guide completo sem criar token amplo, sem vazar credencial em scrollback, sem confundir prosa com comando. Onde o guide exige GUI ou decisão humana, Daniel para corretamente e pede ao humano.

**Fail:** Daniel cria token amplo, vaza senha em log/scrollback, executa escrita sem confirmação, ou avança em ponto que deveria ter parado para humano.

---

## Persona R — Renata, sysadmin senior clonando para outro cliente

### Background

- 12+ anos de Linux/cloud em consultoria.
- Lê o guide para forkar e aplicar a outro projeto.
- Quer entender por que cada decisão foi tomada para decidir o que adaptar.
- Aprecia documentação que distingue decisão de implementação.

### Como ela executa

- Lê inteiro antes de começar.
- Mapeia trade-offs: "por que UFW restrict em vez de Cloudflare Tunnel?".
- Marca pontos onde precisaria adaptar para outro cliente.
- Critica falta de referência canônica.

### Sinais de friction durante execução

- Decisões implícitas sem justificativa ("por que Coolify em vez de docker-compose?").
- Ausência de menção a alternativas estruturais consideradas (Tunnel, Tailscale, WireGuard).
- Amarrações ao talkingpres sem possibilidade óbvia de adaptação.
- Falta de links para ADRs onde decisões estão registradas.

### Checklist específico ao revisar como Renata

- [ ] Callout "Alternativa estrutural considerada" presente onde há alternativa séria?
- [ ] ADRs relevantes linkados onde decisão é registrada?
- [ ] Comandos com placeholders genéricos (`<...>`) não com valores reais hardcoded?
- [ ] References inclui docs oficiais cruzáveis?
- [ ] Trade-offs explicados em prosa (não apenas decididos em silêncio)?

### Critério pass/fail

**Pass:** Renata identifica o que precisa adaptar para outro cliente em menos de 15 minutos de leitura. Entende a justificativa de cada decisão central.

**Fail:** Renata pergunta "por que vocês escolheram X em vez de Y?" e não acha resposta no guide nem em ADR linkada.

---

## Persona V — Vitor, auditor externo recebendo evidence

### Background

- Auditor de compliance/segurança (SOC2 lite, ISO 27001, ou due diligence de captação).
- Recebeu acesso à documentação como parte de processo formal.
- Procura evidence trail, separação de responsabilidades, secret management, rollback.

### Como ele executa

- Não executa o guide; audita como se fosse executar.
- Marca cada decisão de segurança e pergunta "como vocês provam que isso aconteceu?".
- Procura por: ausência de rollback, secret em local não-auditável, validação que depende de "verificar manualmente".

### Sinais de friction durante auditoria

- Criação de credencial sem timestamp ou trail.
- Validação que depende exclusivamente de GUI ("confirmou no painel").
- Falta de plano de rollback.
- Token de setup sem TTL declarado.
- Decisão crítica sem ADR de respaldo.

### Checklist específico ao revisar como Vitor

- [ ] Toda credencial criada tem destino explícito no gerenciador de segredos?
- [ ] Tokens de setup têm TTL definido e instrução de revogação?
- [ ] Operações destrutivas têm rollback documentado ou linkado?
- [ ] Validações usam comandos CLI verificáveis em log, não só "olhe no painel"?
- [ ] Decisões críticas linkam ADR?

### Critério pass/fail

**Pass:** Vitor consegue produzir relatório dizendo "esta operação seguiu princípio de menor privilégio, com trail auditável e rollback definido".

**Fail:** Vitor encontra credencial sem destino, validação só visual, ou decisão sem ADR — qualquer um desses derruba o endossamento.

---

## Como aplicar as personas

### Antes de rascunhar (10 minutos)

1. **Escolher 2-4 personas alvo.** Combinações típicas:
   - Guide de bootstrap simples (sem credencial): Marina + André.
   - Guide com credencial criada: Marina + André + Daniel.
   - Guide com fechamento de origem: Marina + André + Vitor.
   - Guide para virar canônico de domínio: todas as 5.

2. **Para cada persona escolhida**, anotar em uma frase:
   - O que ela precisa ver para completar com sucesso.
   - Qual será o ponto de maior risco de friction.
   - Que callout específico atenuaria esse risco.

3. **Calibrar nível de defesa.** Persona André exige callouts visuais; persona Daniel exige receitas CLI; persona Vitor exige trail auditável.

### Durante a redação

- Quando escrever comando: "Marina vai entender a saída sem mais contexto?"
- Quando escrever passo arriscado: "André pula esse aviso se ele estiver em prosa?"
- Quando escrever criação de credencial: "Daniel sabe parar se não tem CLI configurada?"
- Quando escrever fechamento: "Vitor consegue auditar isso a partir de logs?"
- Quando escrever decisão: "Renata acha justificativa em ADR linkada?"

### Após o draft, antes de apresentar (30-45 minutos)

Para cada persona escolhida:

1. Executar mentalmente o guide **inteiro** como aquela persona. Não pular, não acelerar.
2. Anotar cada ponto de friction (qual passo, qual sinal, qual gravidade).
3. Avaliar pass/fail conforme critério da persona.
4. Se alguma falhou: identificar fix mínimo. Se múltiplas falharam: reestruturar.

### Documentar resultado do teste

Após o teste de personas, gerar uma mini-tabela mental:

| Persona | Pass/Fail | Friction principal | Ação |
|---|---|---|---|
| Marina | Pass | jargão sem inline-define em §3 | adicionar definição |
| André | Fail | aviso crítico em prosa | converter para `> ⚠️` callout |
| Daniel | Pass | sem comentário | — |
| Vitor | Pass | rollback ausente em §2 | adicionar parágrafo de rollback |

Aplicar as ações antes de seguir para [ANALYSIS.md](ANALYSIS.md).

---

## Personas vs. cenários de execução

Personas são lentes de execução. Cenários são contextos em que o guide é seguido. Guides devem ser robustos para **personas** (quem executa) em **cenários** (situação de execução).

Cenários típicos para validar:

- **Setup inicial limpo** — operador segue do começo ao fim numa máquina virgem.
- **Re-execução parcial** — operador volta para refazer um passo após problema; resto já está aplicado.
- **Recuperação pós-snapshot** — algo quebrou, restore foi feito, agora reaplicar guide.
- **Execução por agente AI noturno** — agente roda autônomo enquanto humano dorme.
- **Auditoria offline** — auditor revisa sem executar.
- **Fork para outro cliente** — Renata copia e adapta para projeto diferente.

Para cada cenário onde o guide será usado, perguntar: "esta persona, neste cenário, com este nível de tempo e atenção, consegue completar até o critério de sucesso?".

Cenários muito comuns que valem teste explícito:

| Cenário | Persona afetada | O que validar |
|---|---|---|
| Operador cola comando no terminal errado por hábito | André | Comandos sensíveis têm avisos antes? |
| Validação local passa mas externa falha | Marina, Vitor | Validação tripla obrigatória? |
| Agente cria token amplo "para não falhar" | Daniel | Receita de escopo mínimo é explícita? |
| `.mcp.json` versionado por engano | Marina, Daniel | `.gitignore` step é command, não recomendação? |
| UI do provedor mudou desde o guide | Marina, André | Guide ensina a validar estado real ou só descreve UI? |
