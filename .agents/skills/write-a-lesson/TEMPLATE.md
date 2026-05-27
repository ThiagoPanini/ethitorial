# TEMPLATE — estrutura canônica de uma lesson

Este documento especifica a estrutura completa que toda lesson em `docs/lessons/` deve seguir. Para uma aplicação viva e completa, veja `docs/lessons/0001-hardening-de-vps-linux.md` no repositório talkingpres.

## Template copy-paste

Cole isso como ponto de partida e preencha cada `{{placeholder}}`. Não pule seções; se uma seção não se aplica, escreva uma frase justificando ao invés de deletar.

````markdown
---
numero: {{NNNN}}
titulo: {{Tema central — subtítulo opinado}}
data: {{YYYY-MM-DD}}
versao: 1.0
validade: revalidar em {{YYYY-MM}}; afirmações específicas pressupõem {{premissa técnica como "OpenSSH ≥ 8.7"}}
tags: [{{tag1}}, {{tag2}}, {{tag3}}]
publico_alvo: {{descrição do leitor esperado, ex. "desenvolvedores com Unix-fluência básica"}}
tldr: {{uma frase resumindo a lição inteira}}
---

# Lição {{NNNN}} — {{Tema}}: {{frase memorável}}

> Aula sobre {{tema}}. Não é receita executável — para isso, veja um [guide](../guides/) ou um [runbook](../runbooks/). É o raciocínio por trás de cada decisão. Aplicações concretas a {{contexto do projeto}} estão listadas no [apêndice](#apêndice--aplicações-documentadas).

## Objetivos de aprendizagem

Ao terminar esta lição, você será capaz de:

1. **{{Verbo Bloom}}** {{objetivo verificável}}.
2. **{{Verbo Bloom}}** {{objetivo verificável}}.
3. **{{Verbo Bloom}}** {{objetivo verificável}}.

## Pré-requisitos assumidos

Esta lição assume familiaridade com:

- {{pré-requisito 1}}
- {{pré-requisito 2}}

Não assume: {{lista de coisas que NÃO assume — importante para calibrar leitor}}.

Se algum dos pré-requisitos é novo para você, recomendamos {{ponteiro para material de entrada}}.

## Versão e validade

| Atributo | Valor |
|---|---|
| Versão | 1.0 |
| Data | {{YYYY-MM-DD}} |
| Sistema-base alvo | {{ex. Ubuntu 24.04 LTS}} |
| {{tecnologia chave}} alvo | {{versão mínima}} |
| Revalidação sugerida | {{YYYY-MM ou condição}} |
| O que envelhece mais rápido | {{áreas voláteis}} |

## Índice

1. [{{Seção 1}}](#seção-1)
2. [{{Seção 2}}](#seção-2)
{{...}}
N-3. [Limites desta lição](#limites-desta-lição)
N-2. [Leitura adicional](#leitura-adicional)
N-1. [Glossário](#glossário)
N. [Apêndice — Aplicações documentadas](#apêndice--aplicações-documentadas)

---

## {{Primeira seção: hook conceitual}}

{{Parágrafo que estabelece o problema/contexto e dá o gancho da lição inteira. Deve ser memorável e ancorar tudo o que vem depois.}}

{{Parágrafo que apresenta o conceito central com metáfora ou framing.}}

> 💡 **Princípio — {{nome curto}}**
>
> {{descrição da heurística operacional ou princípio que vai aparecer pelo resto da lesson}}

### Diagrama mental: {{nome do modelo}}

```text
{{diagrama ASCII das camadas/fluxo/hierarquia}}
```

{{Parágrafo explicando o diagrama, com 2-3 frases que destacam o que importa.}}

---

## {{Segunda seção}}

{{Texto que entra na primeira decisão técnica concreta. Mostra código quando relevante.}}

```bash
{{comandos exemplares — com placeholders, nunca valores específicos}}
```

{{Explica o que cada comando faz, em prosa curta. Inline-define jargão novo.}}

### {{Sub-tópico se a seção tiver múltiplas faces}}

{{...}}

> ⚠️ **Armadilha — {{nome curto}}**
>
> {{descrição do erro comum, com sintoma observável e resolução}}

> 🎯 **Teste rápido**
>
> **Pergunta:** {{pergunta que testa compreensão da seção}}
>
> <details>
> <summary>Resposta</summary>
> {{resposta em 2-4 frases, com link de volta ao conceito}}
> </details>

---

{{Repetir o padrão para 6-12 seções no total. Cada uma:
- Heading que carrega ideia
- Abertura conceitual
- Código/comando quando aplicável
- 1-2 callouts (Princípio ou Armadilha)
- Tabela quando há referência consultável
- Diagrama quando há estrutura espacial
- Checkpoint a cada 3-4 seções
}}

---

## Limites desta lição

### O que está fora do escopo

Esta lição cobre {{escopo declarado}}. Camadas adicionais existem e fazem sentido em modelos de ameaça/uso mais altos, mas não foram tratadas aqui:

- **{{Tópico fora}}** — {{breve descrição e quando se justifica}}
- **{{Tópico fora}}** — {{...}}
- **{{Tópico fora}}** — {{...}}

Cada um se justifica quando {{condição}}. Para {{público desta lição}}, o conteúdo acima é o piso, não o teto.

### {{Conclusão temática — "X é incremental por natureza" ou similar}}

{{Parágrafo de fechamento conceitual que amarra a lição.}}

---

## Leitura adicional

Materiais de aprofundamento usados como base ou complemento desta lição:

**{{Categoria 1 — ex: "Referências canônicas"}}**

- **[{{Recurso}}]({{url}})** — {{descrição em 1 frase com indicação de quando consultar}}.
- **{{Recurso}}** — {{descrição}}.

**{{Categoria 2 — ex: "Checklists e benchmarks"}}**

- **[{{Recurso}}]({{url}})** — {{...}}.

**{{Categoria 3 — ex: "Camadas que esta lição não cobriu"}}**

- **[{{Recurso}}]({{url}})** — {{...}}.

---

## Glossário

Termos que aparecem ao longo do texto como apoio e que valem uma definição de bolso. Em ordem alfabética.

- **{{Termo 1}}** — {{definição em 1-2 frases, com nota de quando importa}}.
- **{{Termo 2}}** — {{...}}.
{{... incluir TODOS os termos jargão usados no corpo, mesmo os inline-definidos}}

---

## Apêndice — Aplicações documentadas

> Esta seção é específica do projeto {{projeto}} e pode ser removida por quem usar esta lição em outro contexto. O corpo da lição acima é genérico e reutilizável.

Para ver os conceitos desta lição aplicados a {{contexto}} reais, veja os registros em [ai-ops](../ai-ops/):

- [{{registro 1}}]({{caminho}})
- [{{registro 2}}]({{caminho}})

Para operar {{sistema}} no dia a dia, use o [runbook NNNN — {{nome}}]({{caminho}}).
````

## Especificação seção-a-seção

### Frontmatter (8 campos obrigatórios)

| Campo | Tipo | Conteúdo | Exemplo |
|---|---|---|---|
| `numero` | string | 4 dígitos, sequencial. Próximo número disponível em `docs/lessons/` | `0002` |
| `titulo` | string | Tema + subtítulo opinado | `Observabilidade em sistemas distribuídos — três pilares e o que cada um não te conta` |
| `data` | date | Data de escrita ou última revisão substantiva | `2026-08-12` |
| `versao` | string | Semver-like. Subir minor em correções, major em reestruturação | `1.2` |
| `validade` | string | Quando revalidar + premissas técnicas que envelhecem | `revalidar em 2027-08; pressupõe OpenTelemetry SDK ≥ 1.30` |
| `tags` | list | 3-6 tags em kebab-case ou camelCase. Reutilizar tags existentes | `[observability, distributed-systems, tracing]` |
| `publico_alvo` | string | Descrição em 1 frase do leitor esperado e conhecimento prévio assumido | `engenheiros backend com 2+ anos, familiaridade com HTTP e logs estruturados` |
| `tldr` | string | Uma frase resumindo a lição inteira | `Tracing, métricas e logs respondem perguntas diferentes; saber qual usar quando reduz tempo de debug.` |

### H1 e blockquote intro

Formato do H1: `# Lição NNNN — {Tema}: {frase memorável}`. A frase memorável é o gancho — deve ser legível como tweet.

Blockquote intro tem 3 funções: (1) declara o gênero ("Aula sobre..."), (2) distingue de outros gêneros ("Não é receita executável — para isso..."), (3) linka o apêndice para quem quer ver aplicações.

### Objetivos de aprendizagem

Use verbos da taxonomia de Bloom no nível "Aplicar" ou acima. Evitar "compreender" ou "conhecer" (não-verificáveis).

| Bom | Ruim |
|---|---|
| **Explicar** por que tracing é insuficiente sozinho | **Compreender** observabilidade |
| **Distinguir** logs estruturados de não-estruturados | **Conhecer** tipos de logs |
| **Decidir** quando usar histograma vs counter no Prometheus | **Saber** sobre métricas |
| **Justificar** o uso de sampling em alto volume | **Aprender** sampling |

Mínimo 3 objetivos, máximo 6. Cada um deve ser testável — se você não consegue imaginar uma pergunta que valide o objetivo, reformule.

### Pré-requisitos assumidos

Sempre incluir **as duas listas**:

- **Esta lição assume familiaridade com:** lista do que o leitor precisa saber para acompanhar.
- **Não assume:** lista do que NÃO precisa saber. Essa lista é tão importante quanto a primeira; ela permite que iniciantes saibam que não vão estar perdidos.

Sempre fechar com ponteiro de fallback para iniciantes ("Se {pré-req X} é novo, recomendamos {recurso}").

### Tabela de versão e validade

Mínimo 5 linhas. Sempre incluir:

- Versão
- Data
- Sistema/tecnologia-base alvo (com versão específica)
- Revalidação sugerida
- O que envelhece mais rápido

Adicionais comuns: linguagem alvo, framework alvo, versão mínima de dependência crítica.

### Índice

Sempre numerado. Sempre com anchor links (`[Título](#titulo-em-minusculas-com-hifens-substituindo-espacos-e-acentos)`).

Markdown processors interpretam anchors de formas diferentes; teste em GitHub e no preview que você usa. Caracteres especiais (`/`, `:`, parênteses) são removidos ou viram hífens.

### Seções de conteúdo (6-12)

Cada seção deve ter:

- **Heading que carrega ideia.** Não use "Sobre X" ou "Conceito de X". Use uma afirmação que antecipe a conclusão.
- **Abertura conceitual** de 1-3 parágrafos que estabelece o problema antes de mostrar a solução.
- **Código exemplar** quando o tema é técnico-concreto. Sempre com placeholders (`<NOME>`), nunca valores reais do projeto.
- **Inline-define de jargão** na primeira ocorrência. Padrão: "termo (definição curta entre parênteses)".
- **Pelo menos 1 callout** por seção principal (Princípio ou Armadilha).
- **Tabela** quando há mais de 3 itens com a mesma estrutura comparativa.
- **Diagrama ASCII** quando há estrutura espacial (camadas, fluxos, hierarquias).
- **Checkpoint** a cada 3-4 seções no máximo.

Comprimento típico de uma seção: 200-500 palavras. Seções muito longas (>800 palavras) sinalizam que devem virar duas.

### Os três callouts canônicos

**`> 💡 Princípio`** — para heurísticas operacionais ou regras de polegar que se aplicam recorrentemente.

```markdown
> 💡 **Princípio — {nome curto}**
>
> {descrição em 1-3 frases, com aplicabilidade clara}
```

**`> ⚠️ Armadilha`** — para erros comuns, sintomas observáveis e resolução.

```markdown
> ⚠️ **Armadilha — {nome curto}**
>
> {descrição do erro}
>
> **Sintoma:** {o que o leitor observa}
>
> **Resolução:** {o que fazer}
```

**`> 🎯 Teste rápido`** — checkpoint pedagógico com resposta escondida via `<details>`.

```markdown
> 🎯 **Teste rápido**
>
> **Pergunta:** {pergunta que testa compreensão da seção atual}
>
> <details>
> <summary>Resposta</summary>
> {resposta em 2-4 frases, com link de volta ao conceito}
> </details>
```

Use pelo menos 3 checkpoints em uma lesson média; mais em lessons longas.

### Limites desta lição

**Obrigatório** — não pular. Tem 2 partes:

1. **O que está fora do escopo** — lista enumerada de 5-10 tópicos relacionados que NÃO foram cobertos, com breve nota de quando cada um se justifica.
2. **Conclusão temática** — parágrafo de fechamento que amarra a lição com uma metáfora ou síntese, indicando que este é o piso, não o teto.

A seção "fora do escopo" cumpre função pedagógica importante: evita que o leitor pense que aprendeu "tudo sobre X". Também ancora possíveis próximas lições.

### Leitura adicional

Categorizar em 3-4 grupos. Cada grupo tem 2-4 links. Categorias típicas:

- Referências canônicas (RFCs, especificações, docs oficiais)
- Checklists/benchmarks (CIS, NIST, OWASP)
- Camadas não cobertas (links para os tópicos do "fora do escopo")
- Pré-requisitos (recursos para fechar gaps assumidos)

Cada link inclui **nota de quando consultar** ("use para X", "vale ler quando Y").

### Glossário

Em ordem alfabética. Todos os termos jargão usados no corpo aparecem aqui (mesmo os inline-definidos).

Cada entrada segue o padrão: `**Termo (sigla expandida)** — definição em 1-2 frases. Quando importa: nota sobre relevância.`

Use em-dashes consistentemente. Itens que cruzem com outras lessons podem linkar (`[[lesson-name]]`-style ou `[texto](caminho)`).

### Apêndice — Aplicações documentadas

Sempre marcar a seção como **removível** em outros projetos (blockquote inicial). Lessons devem ser portáveis; o apêndice é a única parte amarrada ao projeto.

Conteúdo típico:

- Links para ai-ops específicos do projeto que aplicam os conceitos da lesson
- Ponteiro para runbook relacionado
- Cross-ref para ADRs relevantes

## Convenções de diagrama ASCII

Padrão básico (caixas com setas):

```text
┌─────────────────┐
│   Componente    │
└────────┬────────┘
         │ rótulo da relação
         ▼
┌─────────────────┐
│  Outro          │
└─────────────────┘
```

Use caracteres Unicode box-drawing: `┌─┐ │ └┘ ├ ┤ ┬ ┴ ┼`. Setas: `← → ↑ ↓ ▼ ▲ ◄ ►`.

Indentar dentro de bloco `text` no markdown. Comentários laterais com `←` após o nome do componente.

Para fluxos lineares simples, lista numerada é melhor que ASCII art. Use ASCII quando há ramificação ou paralelismo.

## Convenções de tabela

Tabela vence prosa quando:

- Há 3+ itens com a mesma estrutura (campos, propriedades, alternativas)
- O leitor vai voltar para consultar
- A comparação tem mais valor que a descrição individual

Padrão: cabeçalho descritivo, alinhamento à esquerda (padrão markdown), uma coluna por dimensão. Evitar tabelas com mais de 5 colunas em prosa corrida (quebram em telas estreitas).

## Checklist final antes de apresentar

- [ ] Todos os 8 campos do frontmatter preenchidos
- [ ] H1 com numero + título memorável
- [ ] Blockquote intro distingue de outros gêneros
- [ ] 3-6 objetivos de aprendizagem com verbos verificáveis
- [ ] Lista de pré-requisitos assume + não-assume + ponteiro de fallback
- [ ] Tabela de versão com 5+ atributos
- [ ] Índice numerado com anchors funcionais
- [ ] 6-12 seções de conteúdo
- [ ] Cada seção principal com pelo menos 1 callout
- [ ] Pelo menos 3 checkpoints (`🎯 Teste rápido`) distribuídos
- [ ] Pelo menos 1 diagrama ASCII (se há estrutura espacial)
- [ ] Pelo menos 1 tabela de referência (se há comparações)
- [ ] Jargão inline-definido na primeira ocorrência
- [ ] Seção "Limites" com "O que está fora do escopo" enumerado
- [ ] Leitura adicional categorizada (3-4 grupos)
- [ ] Glossário em ordem alfabética com todos os termos jargão
- [ ] Apêndice marcado como removível em outros projetos
- [ ] Zero nome específico do projeto no corpo (só no apêndice)
- [ ] Em-dashes uniformes (corpo E glossário)
- [ ] Parágrafos curtos (3-5 linhas dominam)
- [ ] Voz autoral presente (pt-BR natural, primeira pessoa do plural quando natural)
