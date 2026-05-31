# ANALYSIS — framework de análise profunda + grading

Depois do teste de personas (em [PERSONAS.md](PERSONAS.md)), o guide passa por análise profunda multi-eixo. Este framework converte "parece bom" em "tem nota X em Y eixos com Z problemas categorizados".

Diferente do framework de lessons (que pondera escrita e cobertura conceitual), este framework é calibrado para **execução operacional**: segurança, reprodutibilidade e robustez sob carga cognitiva pesam mais; escrita e cobertura conceitual pesam menos.

A análise produz:

1. **Nota auto-atribuída** nos 6 eixos (com nota geral ponderada).
2. **Lista de problemas categorizada** por tipo e severidade.
3. **Plano de correção priorizado** (P0/P1/P2/P3).
4. **Critério explícito** de aceitar (apresentar ao usuário) vs. iterar.

---

## Rubrica de 6 eixos (calibrada para guides)

Cada eixo recebe nota 0-10. A nota geral é a média ponderada (pesos abaixo).

| # | Eixo | Peso | O que avalia |
|---|---|---|---|
| 1 | Segurança operacional | 25% | Evita auto-bloqueio, vazamento de segredo, exposição de admin, falsa sensação de fechamento? |
| 2 | Reprodutibilidade | 20% | Pessoa nova consegue executar do começo ao fim sem decisões arbitrárias? |
| 3 | Robustez sob carga cognitiva | 15% | Operador cansado / agente AI autônomo consegue seguir sem perder contexto? |
| 4 | Observabilidade | 15% | Cada etapa tem proof? Critério de sucesso é objetivo? |
| 5 | Robustez contra UI mutável | 15% | Onde provedor muda UI/termo, guide ensina a validar estado real? |
| 6 | Aderência à trilha real | 10% | Representa o que faz parte da trilha do projeto, sem inventar prematuro? |

**Cálculo:** `nota_geral = 0.25*segurança + 0.20*reprodutibilidade + 0.15*carga + 0.15*observabilidade + 0.15*ui_mutável + 0.10*aderência`

### Detalhamento de cada eixo

#### Eixo 1 — Segurança operacional (peso 25%)

| Nota | Critério |
|---|---|
| 10 | Terminal A/B em todo passo arriscado; validação externa tripla onde fecha origem; receita AI autônoma onde cria credencial; `.gitignore` step antes de config local; tokens com TTL declarado; rollback documentado. |
| 8-9 | Maioria dos padrões aplicados; 1-2 gaps menores (ex: rollback implícito em vez de explícito). |
| 6-7 | Padrões principais presentes; falta validação externa OU receita AI autônoma OU `.gitignore` step. |
| 4-5 | Risco real de auto-bloqueio ou vazamento de segredo em uso normal. |
| 0-3 | Múltiplos vetores de risco. Seguir o guide pode causar dano operacional imediato. |

**Como avaliar:** rodar checklist de padrões obrigatórios pós-correções (Bootstrap callout, Validação tripla, Receita AI autônoma, `.gitignore` step, etc.) e contar quantos aplicam-se ao contexto e estão presentes.

#### Eixo 2 — Reprodutibilidade (peso 20%)

| Nota | Critério |
|---|---|
| 10 | Pré-condições completas (ambiente local POSIX, payment methods, recursos externos). Cada passo tem comando exato e proof. Critério de sucesso enumera checks objetivos. Persona Marina executa do começo ao fim sem decisão arbitrária. |
| 8-9 | Reprodutível com mínimas adaptações; pré-condição menor implícita. |
| 6-7 | Algumas decisões arbitrárias ("escolha um nome para o bucket"); pré-condições incompletas. |
| 4-5 | Faltam comandos exatos; persona nova precisa inferir vários passos. |
| 0-3 | Receita inacabada. Maioria dos passos exige conhecimento prévio não declarado. |

**Como avaliar:** simular execução por Marina. Cada momento de "espera, e agora?" é perda de nota.

#### Eixo 3 — Robustez sob carga cognitiva (peso 15%)

| Nota | Critério |
|---|---|
| 10 | Avisos críticos em callouts visuais (`> ⚠️`); checkpoints fechados em pontos de não-retorno; comandos curtos por bloco; headings carregam ideia; persona André chega ao fim seguindo só headings + callouts. |
| 8-9 | Sólido; 1-2 avisos críticos em prosa que poderiam ser callouts. |
| 6-7 | Estrutura útil; mas algumas decisões críticas só em prosa corrida. |
| 4-5 | Prosa densa intercalada com comandos; persona cansada pode pular alertas. |
| 0-3 | Texto único sem destaque; risco alto de comando errado executado por hábito. |

**Como avaliar:** simular execução por André em modo skim — só headings, blocos de código e callouts visuais. Se chegar ao fim sem perder informação crítica, nota alta.

#### Eixo 4 — Observabilidade (peso 15%)

| Nota | Critério |
|---|---|
| 10 | Cada comando crítico tem "Resultado esperado: ..." com saída em bloco `text`. Critério de sucesso enumera N checks objetivos com comandos de validação. Validação tripla onde aplicável. |
| 8-9 | Maioria dos comandos com proof; critério de sucesso presente mas com 1-2 checks vagos. |
| 6-7 | Proofs intermitentes; critério de sucesso presente mas curto demais. |
| 4-5 | Comandos sem proof na maioria; critério de sucesso vago ou ausente. |
| 0-3 | Receita aberta — usuário não sabe se passou. |

**Como avaliar:** contar quantos comandos críticos têm proof observável imediato. Validar que critério de sucesso é checklist enumerado com comandos.

#### Eixo 5 — Robustez contra UI mutável (peso 15%)

| Nota | Critério |
|---|---|
| 10 | Onde toca UI de provedor, guide instrui a validar estado real via CLI/API (`docker ps`, `ufw status`, `dig`). Placeholders para porta/endpoint descobertos por comando, não assumidos. Diagnostic block para estados travados conhecidos. |
| 8-9 | Maioria das UIs validada via CLI; 1-2 instruções dependem de texto exato de botão. |
| 6-7 | Mistura de validação CLI e referência a UI; quebra parcial quando UI muda. |
| 4-5 | Forte dependência em "clique no botão X"; sem alternativa CLI. |
| 0-3 | Guide narra UI passo a passo. Provedor muda UI → guide quebra. |

**Como avaliar:** mentalmente simular que cada UI do provedor mudou (botão renomeado, fluxo reorganizado). Quanto ainda funciona?

#### Eixo 6 — Aderência à trilha real (peso 10%)

| Nota | Critério |
|---|---|
| 10 | Cada passo tem origem em ai-ops existente OU é próximo passo necessário do roadmap. Nada é antecipado. References a ai-ops/ADRs precisas. |
| 8-9 | Trilha respeitada; 1-2 detalhes minoritários antecipados. |
| 6-7 | Maioria da trilha; mas inclui sub-passos especulativos. |
| 4-5 | Mistura trilha real com backlog imaginado. |
| 0-3 | Receita inventada — cobre etapa que projeto ainda não vai chegar. |

**Como avaliar:** rastrear cada passo até origem em ai-ops, ADR ou roadmap. Passos sem origem são especulação.

### Interpretação da nota geral

| Nota geral | Significado | Ação |
|---|---|---|
| 9.0-10.0 | Excelente. Apresentar ao usuário sem ressalvas. | Apresentar |
| 8.0-8.9 | Muito bom. Apresentar com 1-2 sugestões opcionais. | Apresentar |
| 7.0-7.9 | Bom mas com gaps. Aplicar correções P0 e P1 antes de apresentar. | Iterar |
| 6.0-6.9 | Risco operacional moderado. Reestruturar pelo menos um passo. | Iterar |
| < 6.0 | Não apresentar. Risco alto de auto-bloqueio ou dano. | Refazer |

**Diferença para lessons:** o limiar de aceitar é **mais alto** para guides. Lessons aceitam em 8.0+ porque consequência de leitura imperfeita é compreensão parcial. Guides aceitam em 8.0+ porque consequência de execução imperfeita é dano operacional.

---

## Categorias de problema

Cada problema identificado se encaixa em uma das 4 categorias.

### Segurança operacional

- Falta de Terminal A/B em passo com risco de auto-bloqueio.
- Validação só local em fechamento de origem (sem tripla).
- Credencial criada sem receita AI autônoma.
- Config local com possível segredo criada sem `.gitignore` step prévio.
- Token sem TTL declarado nem instrução de revogação.
- Aviso crítico em prosa em vez de callout visual.
- Janela de exposição (porta admin pública) sem aviso de "janela curta".
- Rollback ausente em operação destrutiva.

### Reprodutibilidade

- Pré-condição assumida mas não declarada.
- Comando com valor hardcoded em vez de placeholder.
- Decisão arbitrária deixada para o operador sem critério.
- Pulo lógico entre passos.
- Falta de "Ambiente local POSIX" nas pré-condições.
- Falta de critério de sucesso enumerado.

### Robustez

- Parágrafo longo de aviso em vez de callout visual.
- Comando crítico sem proof observável.
- Heading que não carrega ideia ("Sobre criação").
- Sem mini-diagrama em sistema multi-actor.
- Sem diagnostic block em estado travado conhecido.
- Sem "silêncio = sucesso" em comandos Unix quietos.

### Estilo e trilha

- Tom não-imperativo ("você poderia querer").
- Headings sem verbo de ação.
- Trilha quebrada (passo sem origem em ai-ops/ADR/roadmap).
- Antecipação de guide ainda não executável.
- Bootstrap callout ausente em guide de infra.
- Alternativa estrutural não mencionada onde aplicável.
- References sem docs oficiais.

---

## Sistema de prioridade P0-P3

Guides têm tolerância **menor** que lessons. P0 é não-negociável; até P2 deve ser tratado antes de apresentar.

### P0 — Bloqueador

**Não apresentar ao usuário sob nenhuma circunstância.** Risco de dano operacional imediato.

Exemplos:
- Falta de validação externa em fechamento de origem (operador pensa que está fechado, não está).
- Falta de Terminal A/B em mudança de sshd.
- Receita AI autônoma ausente onde se cria credencial (Daniel vai vazar senha).
- `.gitignore` step ausente antes de criar `.mcp.json`/`.env` com segredo.
- Critério de sucesso ausente ou vago (operador não sabe se passou).
- Bootstrap callout ausente em guide de infra (André vai usar como runbook).
- Comando com valor real hardcoded (operador vai aplicar em conta errada).
- Decisão crítica sem rollback documentado.

### P1 — Qualidade pedagógica e robustez

**Aplicar antes de apresentar.** Pode pular 1 ou 2 se justificado e o caso for muito específico.

Exemplos:
- Aviso crítico em prosa em vez de callout `> ⚠️`.
- Comando crítico sem proof observável.
- Pré-condição importante implícita (ex: "Ambiente local POSIX").
- Heading sem verbo de ação.
- Sem diagnostic block para estado travado conhecido.
- Sem mini-diagrama em sistema multi-actor onde ajudaria.
- References sem doc oficial do provedor primário.
- Validação tripla incompleta (falta uma das três).

### P2 — Polimento operacional

**Aplicar quando der tempo; não bloqueia apresentação.** Eleva de "ok" para "robusto".

Exemplos:
- Parágrafo levemente longo onde poderia ser bullets.
- Comando Unix quieto sem nota "silêncio = sucesso".
- Heading bom mas que poderia ser mais ativo.
- Tabela de comparação ausente onde mais de 3 itens são comparados.
- Aviso de janela curta sem quantificar tempo.

### P3 — Diferencial

**Opcional; eleva de robusto para excepcional.** Adições que diferenciam guide canônico.

Exemplos:
- Exemplo contrastivo ("o que aconteceria se invertêssemos passos 5 e 6").
- Cross-link com guides paralelos formando trilha.
- Tempo estimado total de execução no início.
- Lista de "armadilhas que vimos antes" com casos reais (atenção: pode virar ai-ops; manter aqui só se for instrutivo no contexto do guide).

---

## Checklist linha-a-linha de problemas comuns

Aplicar durante a revisão. Cada item passa OU vira P0/P1/P2/P3.

### Frontmatter e abertura

- [ ] Os 3 campos canônicos (`title`, `description`, `nav_title`) preenchidos?
- [ ] H1 sem prefixo "Guide NNNN —" desnecessário?
- [ ] Intro com escopo + "não" explícito?
- [ ] Bootstrap callout presente se guide de infra/credencial/borda?
- [ ] Alternativa estrutural mencionada se aplicável?

### Pré-condições

- [ ] "Ambiente local POSIX" como primeira pré-condição?
- [ ] WSL2 mencionado para operadores Windows?
- [ ] Payment method / billing declarado se provedor exige?
- [ ] Guide anterior linkado se cadeia depende dele?
- [ ] Gerenciador de segredos pronto com handles esperados?
- [ ] Placeholders enumerados explicitamente?

### Passos

- [ ] Entre 2 e 4 passos? (se 5+, dividir em sub-passos `Na`/`Nb`)
- [ ] Cada heading em verbo de ação?
- [ ] Cada passo tem proof observável depois do comando crítico?
- [ ] Comandos com placeholders em `<MAIUSCULAS>`, não valores reais?
- [ ] Tom imperativo direto?

### Padrões obrigatórios por contexto

- [ ] Terminal A/B explícito onde há risco de auto-bloqueio?
- [ ] Receita AI autônoma onde se cria credencial?
- [ ] `.gitignore` step antes de criar config local com possível segredo?
- [ ] Validação externa tripla onde se fecha origem?
- [ ] Mini-diagrama ASCII em sistema multi-actor?
- [ ] Diagnostic block para estados travados conhecidos?
- [ ] "Silêncio = sucesso" em comandos Unix quietos?
- [ ] Janela curta quantificada onde há exposição administrativa?

### Callouts

- [ ] Avisos críticos como `> ⚠️ Armadilha` com sintoma + resolução, não prosa?
- [ ] Heurísticas operacionais como `> 💡 Princípio`?
- [ ] Guardrails validadas com `> 🎯 Teste`?
- [ ] Checkpoint fechado após cada passo de alto risco com `> ✅` + "pare aqui se falhar"?

### Critério de sucesso

- [ ] Seção `## Critério de sucesso` presente?
- [ ] Cada check é objetivo (comando, estado verificável)?
- [ ] Validação tripla enumerada nas três se aplicável?
- [ ] Inclui confirmação de credencial armazenada se aplicável?
- [ ] Inclui TTL de tokens de setup se aplicável?

### Next steps e References

- [ ] `## Next steps` linka próximo guide OU explica ausência?
- [ ] `## References` inclui docs oficiais dos provedores?
- [ ] Ferramentas auxiliares referenciadas onde usadas?

### Trilha real

- [ ] Cada passo tem origem rastreável em ai-ops/ADR/roadmap?
- [ ] Não antecipa guides ainda não executáveis?
- [ ] Refs cruzadas para ADRs onde decisões críticas são registradas?

---

## Como gerar o relatório final

Após análise, produzir um sumário no formato:

```markdown
## Análise do guide {NNNN}-{nome}

**Nota geral: X.X / 10**

| Eixo | Nota | Peso |
|---|---|---|
| Segurança operacional | X.X | 25% |
| Reprodutibilidade | X.X | 20% |
| Robustez sob carga cognitiva | X.X | 15% |
| Observabilidade | X.X | 15% |
| Robustez contra UI mutável | X.X | 15% |
| Aderência à trilha real | X.X | 10% |

**Personas testadas:**

| Persona | Pass/Fail | Friction principal |
|---|---|---|
| Marina | {X} | {...} |
| André | {X} | {...} |
| Daniel | {X} | {...} |
| Vitor | {X} | {...} |

**Problemas identificados:**

| Prioridade | Categoria | Localização | Problema | Sugestão |
|---|---|---|---|---|
| P0 | Segurança | §X | {descrição} | {fix} |
| P1 | Robustez | §Y | {descrição} | {fix} |
{...}

**Decisão:**

- ✅ Apresentar (nota ≥ 8 e zero P0 pendente)
- ⚠️ Iterar (P0 pendente OU nota 6-7.9)
- ❌ Refazer (nota < 6 OU múltiplos P0 estruturais)

**Plano de iteração (se aplicável):**

1. {primeira correção, com seção e mudança específica}
2. {segunda...}
3. {...}
```

## Quando aceitar vs. iterar vs. refazer

| Situação | Ação |
|---|---|
| Nota ≥ 8.0 e zero P0 | Apresentar com sumário e nota auto-atribuída |
| Nota 7.0-7.9 e zero P0 | Aplicar P1 mínimos (3-5 itens), depois apresentar |
| Qualquer P0 pendente | Iterar — **não apresentar sob nenhuma circunstância** |
| Nota 6.0-6.9 mesmo com P0 resolvido | Identificar maior gap e reescrever o passo afetado |
| Nota < 6.0 | Voltar ao [TEMPLATE.md](TEMPLATE.md), revisar escopo, refazer outline antes do conteúdo |

## Avisos importantes

- **Auto-grading honesto.** Não inflar notas. Se o guide tem gap de segurança, marcar como P0 e iterar — mesmo que pareça pequeno. Consequência de seguir guide ruim é operacional, não pedagógica.
- **Apresentar SEMPRE com sumário de auto-análise.** O usuário precisa saber a nota e os problemas conscientes para confiar.
- **P0 é não-negociável.** Não apresentar com P0 pendente, **nunca**, mesmo sob pressão de tempo. Guide com P0 pendente é receita pronta para dano.
- **Personas e análise são complementares.** Personas detectam friction de execução; análise detecta problemas estruturais. Use os dois.
- **Trilha real importa.** Se um passo não tem origem em ai-ops/ADR/roadmap, ou ele vem da trilha (e foi pulada documentação) ou ele é especulação. Distinguir antes de aceitar.

## Diferenças importantes vs. lesson grading

| Aspecto | Lesson | Guide |
|---|---|---|
| Peso de segurança | Não aplicável (lessons são conceito) | 25% (peso máximo) |
| Peso de escrita | 15% | Não tem eixo específico |
| Peso de pedagogia | 25% | Substituído por "robustez sob carga cognitiva" 15% |
| Limiar de aceitar | 8.0+ | 8.0+ mas zero P0 obrigatório |
| Consequência de falha | Compreensão parcial | Dano operacional |
| Validação obrigatória | Persona iniciante chega ao fim | Persona executando chega ao critério de sucesso sem auto-bloqueio |
