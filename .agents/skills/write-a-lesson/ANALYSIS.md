# ANALYSIS — framework de análise profunda + grading

Depois do teste de personas (em [PERSONAS.md](PERSONAS.md)), a lesson passa por análise profunda multi-eixo. Este framework converte "parece bom" em "tem nota X em Y eixos com Z problemas categorizados".

A análise produz:

1. **Nota auto-atribuída** nos 6 eixos (com nota geral ponderada).
2. **Lista de problemas categorizada** por tipo e severidade.
3. **Plano de correção priorizado** (P1-P4).
4. **Critério explícito** de aceitar (apresentar ao usuário) vs. iterar.

---

## Rubrica de 6 eixos

Cada eixo recebe nota 0-10. A nota geral é a média ponderada (pesos abaixo).

| # | Eixo | Peso | O que avalia |
|---|---|---|---|
| 1 | Correção técnica | 25% | Afirmações são corretas para a versão alvo? Há imprecisão ou desatualização? |
| 2 | Estrutura pedagógica | 25% | Objetivos verificáveis, pré-requisitos honestos, TOC, checkpoints, diagramas? |
| 3 | Qualidade da escrita | 15% | Voz autoral, metáforas memoráveis, fluidez, ausência de tradução literal |
| 4 | Cobertura e escopo | 15% | Cobre o escopo declarado? Limites explícitos? Sem omissão grave silenciosa? |
| 5 | Reutilizabilidade | 10% | Funciona fora do projeto? Específicos só no apêndice? Genérico no corpo? |
| 6 | Manutenibilidade | 10% | Versionado? Premissas técnicas marcadas? Sinais de envelhecimento mapeados? |

**Cálculo:** `nota_geral = 0.25*técnica + 0.25*pedagógica + 0.15*escrita + 0.15*cobertura + 0.10*reutilizabilidade + 0.10*manutenibilidade`

### Detalhamento de cada eixo

#### Eixo 1 — Correção técnica (peso 25%)

| Nota | Critério |
|---|---|
| 10 | Toda afirmação verificada contra docs oficiais. Versionamento explícito. Trade-offs com premissas. |
| 8-9 | Maioria correta; 1-2 imprecisões menores que não mudam recomendação operacional. |
| 6-7 | Geralmente correto; algumas afirmações desatualizadas ou simplistas que confundem. |
| 4-5 | Erro técnico que muda recomendação operacional. Quem seguir vai ter problema. |
| 0-3 | Múltiplos erros. Material faria dano se seguido. |

**Como avaliar:** revisar cada afirmação técnica contra documentação oficial. Especial atenção a: versões de software, comportamentos default, evolução de APIs.

#### Eixo 2 — Estrutura pedagógica (peso 25%)

| Nota | Critério |
|---|---|
| 10 | Objetivos verificáveis, pré-requisitos honestos, TOC funcional, 3+ checkpoints, diagrama quando há geometria, tabela quando há comparação, parágrafos quebrados. |
| 8-9 | Estrutura sólida; falta 1-2 elementos (ex: TOC ausente OU só 1 checkpoint). |
| 6-7 | Estrutura parcial; alguns elementos faltam ou são meramente decorativos. |
| 4-5 | Estrutura ausente em peças críticas (sem objetivos, sem pré-requisitos, sem checkpoints). |
| 0-3 | Texto corrido sem afetação pedagógica. |

**Como avaliar:** rodar o checklist final do [TEMPLATE.md](TEMPLATE.md) e contar quantos itens passam.

#### Eixo 3 — Qualidade da escrita (peso 15%)

| Nota | Critério |
|---|---|
| 10 | Voz autoral inconfundível. Metáforas que ancoram (não decoram). Prosa fluida em pt-BR natural. Headings memoráveis. |
| 8-9 | Boa escrita; voz presente; algumas metáforas funcionam, outras nem tanto. |
| 6-7 | Funcional mas seco. Lê como wiki bem-mantida. |
| 4-5 | Tradução literal aparente. Frases longas. Voz ausente. |
| 0-3 | Texto gerado mecânico. Cansa o leitor. |

**Como avaliar:** ler em voz alta um trecho. Se soa natural em pt-BR e prende atenção, nota alta. Se trava, soa robótico ou genérico, nota baixa.

#### Eixo 4 — Cobertura e escopo (peso 15%)

| Nota | Critério |
|---|---|
| 10 | Escopo declarado entregue integralmente. Limites explícitos. "Fora do escopo" enumerado com honestidade. |
| 8-9 | Escopo entregue; "fora do escopo" tem 2-3 itens menos enumerados. |
| 6-7 | Cobertura parcial do escopo OU "fora do escopo" superficial. |
| 4-5 | Escopo declarado vai além do entregue. Promessa não cumprida. |
| 0-3 | Escopo confuso ou inflado. Leitor não sabe o que esperava aprender. |

**Como avaliar:** ler frontmatter + objetivos e confirmar que o corpo cobre tudo declarado, sem promessas além.

#### Eixo 5 — Reutilizabilidade (peso 10%)

| Nota | Critério |
|---|---|
| 10 | Corpo 100% genérico. Específicos do projeto só no apêndice (e marcados como removíveis). |
| 8-9 | 1-2 menções tangenciais ao projeto no corpo; nada que travasse fork. |
| 6-7 | Algumas referências ao projeto no corpo (links, exemplos). Removíveis com pequeno esforço. |
| 4-5 | Corpo amarrado ao projeto. Forkar exige reescrita parcial. |
| 0-3 | Lesson é, na prática, ai-ops disfarçado de lesson. |

**Como avaliar:** mental fork. Se você copiasse a lesson para outro projeto, quanto teria que mudar? Se a resposta é "só o apêndice", nota máxima.

#### Eixo 6 — Manutenibilidade (peso 10%)

| Nota | Critério |
|---|---|
| 10 | `versao`, `validade`, premissas técnicas marcadas. Seção "O que envelhece rápido" no frontmatter. Linkagem a docs oficiais que envelhecem juntas. |
| 8-9 | Versionamento básico presente; faltam 1-2 sinais. |
| 6-7 | Frontmatter mínimo. Sem indicação de quando revalidar. |
| 4-5 | Sem versionamento. Lesson terá afirmações enganosas em 12 meses. |
| 0-3 | Conteúdo sem nenhum marcador temporal. Já nasceu rumo à obsolescência silenciosa. |

**Como avaliar:** procurar `versao`, `validade`, "válido para versão Y", "revalidar em Z" no frontmatter e ao longo do texto.

### Interpretação da nota geral

| Nota geral | Significado | Ação |
|---|---|---|
| 9.0-10.0 | Excelente. Apresentar ao usuário sem ressalvas. | Apresentar |
| 8.0-8.9 | Muito bom. Apresentar com 1-2 sugestões opcionais. | Apresentar |
| 7.0-7.9 | Bom mas com gaps. Aplicar correções P1 e P2 antes de apresentar. | Iterar |
| 6.0-6.9 | Pedagogicamente problemático. Reestruturar pelo menos uma seção. | Iterar |
| < 6.0 | Não apresentar. Reescrita substancial necessária. | Refazer |

---

## Categorias de problema

Cada problema identificado se encaixa em uma das 4 categorias.

### Técnico

- Afirmação factualmente errada.
- Afirmação desatualizada para a versão alvo.
- Trade-off tratado de forma simplista (sem premissa explícita).
- Métrica/número incorreto.
- Comando com sintaxe errada ou flag deprecated.

### Pedagógico

- Objetivo de aprendizagem não-verificável ("compreender X").
- Pré-requisito não declarado mas pressuposto.
- Jargão sem inline-define na primeira ocorrência.
- Falta de checkpoint quando seção é densa.
- TOC quebrado ou ausente.
- Ausência de diagrama onde há estrutura espacial.
- Ausência de tabela onde há comparação consultável.

### Estrutural

- Seção obrigatória ausente (objetivos, pré-requisitos, limites, glossário).
- Seção empilhando múltiplos tópicos.
- Redundância entre seções (mesmo conteúdo dito duas vezes).
- Ordem ilógica das seções (conclusão antes do desenvolvimento).
- Apêndice misturado ao corpo.

### Estilo

- Em-dashes inconsistentes (corpo evita, glossário usa, ou vice-versa).
- Parágrafo > 7 linhas.
- Tom seco ou genérico ("é importante notar que...").
- Headings que não carregam ideia ("Sobre X", "Conceito de X").
- Pt-BR não-natural ("Você poderá querer considerar...").
- Linguagem vendedora ("a melhor forma", "única solução").
- Drift de voz (genérico vira específico do projeto sem justificativa).

---

## Sistema de prioridade P1-P4

Cada problema identificado recebe prioridade. Apresentar ao usuário só quando P1 estiver resolvido e P2 majoritariamente resolvido.

### P1 — Bloqueador

**Não apresentar ao usuário sem resolver.** Compromete a função pedagógica do material.

Exemplos:
- Frontmatter incompleto.
- Sem objetivos de aprendizagem OU objetivos não-verificáveis.
- Erro técnico que muda recomendação operacional.
- Pré-requisito grave não declarado (persona iniciante não chegaria ao fim).
- Seção obrigatória ausente (Limites, Glossário).
- Apêndice misturado ao corpo do jeito que quebra reutilizabilidade.

### P2 — Qualidade pedagógica

**Aplicar antes de apresentar; pode pular 1-2 se justificado.** Eleva o material de "funcional" para "pedagógico".

Exemplos:
- TOC ausente em lesson >500 linhas.
- Menos de 3 checkpoints distribuídos.
- Ausência de diagrama onde há estrutura espacial óbvia.
- Ausência de tabela onde há comparação repetida.
- Imprecisão técnica menor que não muda recomendação.
- Falta de referências externas (Leitura adicional vazia).
- Glossário incompleto (termos jargão do corpo ausentes).

### P3 — Polimento

**Aplicar quando der tempo; não bloqueia apresentação.** Polimento de superfície.

Exemplos:
- Parágrafo levemente longo (6-7 linhas).
- Heading que poderia ser mais memorável.
- Metáfora ok mas não memorável.
- Inconsistência menor de em-dash.
- Sub-heading que poderia ser quebrado.

### P4 — Diferencial

**Opcional; eleva de bom para excelente.** Adições que diferenciam material excepcional.

Exemplos:
- Exemplos contrastivos ("o que aconteceria se invertêssemos X").
- Diagrama animado/visual além do ASCII.
- Versionamento granular ("válido para subversão exata Y").
- Cross-links com outras lessons formando trilha pedagógica.
- Seção "Erros que vi pessoalmente" com casos reais.

---

## Checklist linha-a-linha de problemas comuns

Aplicar durante a revisão. Cada item passa OU vira P1/P2/P3/P4.

### Frontmatter

- [ ] Todos os 8 campos presentes?
- [ ] `numero` é o próximo disponível em `docs/lessons/`?
- [ ] `titulo` tem subtítulo opinado (não só "Hardening" mas "Hardening: estreitando a máquina")?
- [ ] `versao` está em formato semver?
- [ ] `validade` tem ano + condição + premissa técnica?
- [ ] `publico_alvo` descreve nível esperado de conhecimento?
- [ ] `tldr` cabe em uma frase?

### Abertura

- [ ] H1 segue formato `Lição NNNN — Título: frase memorável`?
- [ ] Blockquote intro distingue lesson de guide/runbook/ai-ops?
- [ ] Blockquote intro linka o apêndice?

### Objetivos de aprendizagem

- [ ] Entre 3 e 6 objetivos?
- [ ] Todos com verbo de Bloom verificável (Explicar, Justificar, Distinguir, Identificar, Decidir, Comparar)?
- [ ] Cada objetivo é testável (dá pra imaginar pergunta que valide)?

### Pré-requisitos

- [ ] Lista "assume familiaridade com" presente?
- [ ] Lista "não assume" presente?
- [ ] Ponteiro de fallback para iniciantes?

### Versão e validade

- [ ] Tabela com 5+ linhas?
- [ ] Inclui versão, data, sistema-alvo, revalidação, "envelhece rápido"?

### Índice

- [ ] Numerado?
- [ ] Todos os anchors funcionam (testar pelo menos 3)?

### Seções de conteúdo (cada uma)

- [ ] Heading carrega ideia (não "Sobre X")?
- [ ] Pelo menos 1 callout (Princípio, Armadilha, Teste rápido)?
- [ ] Jargão novo tem inline-define?
- [ ] Código exemplar tem placeholders, não valores reais?
- [ ] Parágrafos majoritariamente curtos (3-5 linhas)?

### Distribuição de elementos pedagógicos

- [ ] Pelo menos 3 checkpoints (`🎯 Teste rápido`) distribuídos pela lesson?
- [ ] Pelo menos 1 diagrama ASCII (se há estrutura espacial)?
- [ ] Pelo menos 1 tabela de referência (se há comparações)?

### Limites desta lição

- [ ] Seção "O que está fora do escopo" presente?
- [ ] Enumera 5-10 tópicos relacionados não cobertos?
- [ ] Cada tópico tem nota de quando se justifica?
- [ ] Conclusão temática presente?

### Leitura adicional

- [ ] Categorizada em 3-4 grupos?
- [ ] Cada link tem nota de quando consultar?
- [ ] Inclui referências canônicas (RFCs, docs oficiais, benchmarks)?

### Glossário

- [ ] Ordem alfabética?
- [ ] TODOS os termos jargão do corpo presentes?
- [ ] Em-dashes consistentes com o corpo?

### Apêndice

- [ ] Blockquote inicial marca como removível em fork?
- [ ] Contém apenas referências específicas do projeto?

### Estilo geral

- [ ] pt-BR natural (não tradução literal)?
- [ ] Voz autoral presente (primeira pessoa do plural quando natural)?
- [ ] Zero nome específico do projeto no corpo?
- [ ] Em-dashes uniformes?

---

## Como gerar o relatório final

Após análise, produzir um sumário no formato:

```markdown
## Análise da lesson {NNNN}-{nome}

**Nota geral: X.X / 10**

| Eixo | Nota | Peso |
|---|---|---|
| Correção técnica | X.X | 25% |
| Estrutura pedagógica | X.X | 25% |
| Qualidade da escrita | X.X | 15% |
| Cobertura e escopo | X.X | 15% |
| Reutilizabilidade | X.X | 10% |
| Manutenibilidade | X.X | 10% |

**Problemas identificados:**

| Prioridade | Categoria | Localização | Problema | Sugestão |
|---|---|---|---|---|
| P1 | Técnico | §X | {descrição} | {fix} |
| P2 | Pedagógico | §Y | {descrição} | {fix} |
{...}

**Decisão:**

- ✅ Apresentar (nota ≥ 8 e zero P1 pendente)
- ⚠️ Iterar (P1 pendente OU múltiplos P2 OU nota 6-7.9)
- ❌ Refazer (nota < 6 OU estrutura fundamentalmente quebrada)

**Plano de iteração (se aplicável):**

1. {primeira correção, com seção e mudança específica}
2. {segunda...}
3. {...}
```

## Quando aceitar vs. iterar vs. refazer

| Situação | Ação |
|---|---|
| Nota ≥ 8.0 e zero P1 | Apresentar com sumário e nota auto-atribuída |
| Nota 7.0-7.9 e zero P1 | Aplicar P2 mínimos (3-5 itens), depois apresentar |
| Qualquer P1 pendente | Iterar — não apresentar até P1 resolvido |
| Nota 6.0-6.9 mesmo com P1 resolvido | Identificar maior gap e reescrever a seção afetada |
| Nota < 6.0 | Voltar ao [TEMPLATE.md](TEMPLATE.md), revisar escopo, refazer outline antes do conteúdo |

## Avisos importantes

- **Auto-grading é honesto.** Não inflar notas. Se a lesson tem gap, marcar como P1/P2 e iterar.
- **Apresentar SEMPRE com sumário de auto-análise.** O usuário precisa saber a nota e os problemas conscientes para confiar.
- **P1 é não-negociável.** Não apresentar com P1 pendente, mesmo sob pressão de tempo.
- **Personas e análise são complementares.** Personas detectam friction de leitor; análise detecta problemas estruturais. Use os dois.
