---
name: write-a-lesson
description: |
  Cria documentos de lessons (aulas conceituais evergreen, em pt-BR) seguindo o padrão de docs/lessons/0001-hardening-de-vps-linux.md do talkingpres. Lessons explicam princípios e raciocínio sobre um tema, sem se prender a nomes específicos do projeto, datas concretas ou decisões de runtime.

  **Auto-activation:** quando o usuário pede para escrever, criar ou rascunhar uma lição, aula, material didático conceitual, ou documentação evergreen sobre um tema técnico. Também ao converter conteúdo narrativo/situado (ai-ops, ADRs, transcrições) em aula reutilizável.

  **Input sources:** conteúdo bruto de ai-ops existentes, ADRs, conversas técnicas de grilling, documentação de fornecedor, ou tópicos solicitados diretamente pelo usuário.

  **Output type:** arquivo markdown em docs/lessons/NNNN-titulo.md com frontmatter rico, objetivos de aprendizagem, pré-requisitos, índice navegável, 6-12 seções de conteúdo com diagramas/tabelas/callouts/checkpoints, limites de escopo explícitos, leitura adicional categorizada, glossário e apêndice opcional de aplicações documentadas.
agent: Plan
context: fork
metadata:
  internal: true
---

# Escrevendo Lessons

## Goal

Produzir uma aula conceitual em pt-BR, evergreen e reutilizável, que ensine princípios e raciocínio sobre um tema relevante ao projeto. Lessons não são receita; são pedagogia. Quem lê uma lesson sai sabendo **por que** algo funciona daquele jeito, não apenas **como** fazer.

## Distinguir lesson de outros gêneros

| Gênero | Pergunta que responde | Onde mora | Tom |
|---|---|---|---|
| **ADR** | "Por que tomamos essa decisão arquitetural?" | `docs/adr/` | Decisão com tradeoff |
| **Lesson** | "O que preciso entender sobre X?" | `docs/lessons/` | **Pedagógico, evergreen** |
| **Guide** | "Como faço X agora?" | `docs/guides/` | Receita reproduzível |
| **Runbook** | "Que comandos rodo para operar X?" | `docs/runbooks/` | Referência consultável |
| **AI-ops** | "O que a IA + operador fizeram em X data?" | `docs/ai-ops/` | Narrativa situada |

Se o conteúdo a escrever tem nomes próprios do projeto, datas concretas ou decisões de runtime, **é ai-ops, não lesson**. Lessons ficam puramente conceituais; aplicações específicas vão no apêndice opcional.

## Workflow

Cada lesson percorre 6 fases. Não pular nenhuma.

1. **Investigar** — entender o tema, materiais de origem (ai-ops, ADRs, código), público-alvo. Ler [TEMPLATE.md](TEMPLATE.md) para a estrutura canônica e a referência viva (lição 0001 do talkingpres).
2. **Mapear personas alvo** — escolher 2-4 personas em [PERSONAS.md](PERSONAS.md) que devem chegar ao fim da lesson. Construção é diferente para iniciante vs. especialista.
3. **Rascunhar** — seguir o template estrutural rigorosamente. Estrutura é rígida; voz autoral é livre dentro das regras de estilo.
4. **Teste de personas** — passar o draft pelas personas escolhidas. Onde houver friction (jargão sem explicação, pulo lógico, densidade), ajustar.
5. **Análise profunda** — aplicar o framework de [ANALYSIS.md](ANALYSIS.md). Categorizar problemas, priorizar correções P1-P4, atribuir nota auto-crítica nos 6 eixos.
6. **Iterar** — aplicar correções de Prioridade 1 (bloqueadoras) e Prioridade 2 (qualidade pedagógica) **antes** de apresentar ao usuário. P3 e P4 são opcionais.

## Estrutura mínima obrigatória

Toda lesson válida tem, nesta ordem:

- [ ] **Frontmatter completo** — 8 campos (`numero`, `titulo`, `data`, `versao`, `validade`, `tags`, `publico_alvo`, `tldr`)
- [ ] **H1** com `Lição NNNN — Título`
- [ ] **Blockquote intro** distinguindo do guide/runbook/ai-ops e linkando o apêndice
- [ ] **`## Objetivos de aprendizagem`** — 3-6 verbos de Bloom verificáveis (Explicar, Justificar, Distinguir, Identificar, Decidir, Comparar)
- [ ] **`## Pré-requisitos assumidos`** — o que assume + o que NÃO assume + ponteiro para iniciantes
- [ ] **`## Versão e validade`** — tabela com 5+ atributos (versão, data, sistema-alvo, revalidação, o que envelhece rápido)
- [ ] **`## Índice`** — numerado, todos com anchor links
- [ ] **6-12 seções de conteúdo** — cada uma com heading que carrega ideia
- [ ] **`## Limites desta lição`** — com "O que está fora do escopo" explicitamente enumerado
- [ ] **`## Leitura adicional`** — categorizada em 3-4 grupos com 2-4 links cada
- [ ] **`## Glossário`** — alfabético, em-dashes, todos os termos jargão usados no corpo
- [ ] **`## Apêndice — Aplicações documentadas`** — links opcionais para ai-ops do projeto

Detalhes completos seção-a-seção em [TEMPLATE.md](TEMPLATE.md).

## Regras de estilo (não-negociáveis)

1. **pt-BR.** Sempre. Tom natural, não tradução literal.
2. **Em-dashes permitidos e encorajados.** Lessons ≠ guides; aqui em-dashes (`—`) servem como elemento rítmico que separa parentéticas. Aplicar uniformemente no corpo E no glossário.
3. **Tom narrativo opinado.** Primeira pessoa do plural quando natural ("a gente", "nós", "validamos"). Voz autoral é o que diferencia ensaio técnico bom de wiki estéril.
4. **Zero referência a nomes específicos do projeto no corpo.** Use `<NOME_VPS>`, `<USUARIO_OPERACIONAL>`, `<seu-projeto>`. Específicos ficam no apêndice.
5. **Inline-define jargão na primeira ocorrência.** Glossário é safety net, não primeira linha de defesa. Padrão: "iptables (frontend clássico do kernel Linux para regras de filtragem)".
6. **Parágrafos curtos** — 3-5 linhas em prosa, máximo 7 em parágrafo argumentativo denso.
7. **Headings carregam ideia.** "O firewall não é a primeira camada, é a última" > "Sobre firewall". Heading boa antecipa a conclusão da seção.
8. **Três callouts canônicos:**
   - `> 💡 **Princípio**` — para regras operacionais ou heurísticas
   - `> ⚠️ **Armadilha**` — para erros comuns e armadilhas técnicas
   - `> 🎯 **Teste rápido**` — para checkpoints pedagógicos (com `<details>` na resposta)
9. **Diagramas ASCII** sempre que houver estrutura espacial (camadas, fluxos, hierarquias). Texto é segunda escolha para o que tem geometria natural.
10. **Tabelas** sempre que houver referência consultável (diretivas, comparações, mapeamentos). Tabela vence prosa quando o leitor vai voltar pra checar.

## Avisos importantes

- **Lessons crescem com o projeto.** Os campos `versao` e `validade` no frontmatter são como sinalizamos que afirmações envelhecem. Sempre datar e marcar premissas (ex: "OpenSSH ≥ 8.7").
- **Lessons devem ser reutilizáveis fora do projeto.** Se o corpo amarra ao talkingpres, a lesson falhou. Cross-refs específicos só no apêndice.
- **Glossário não substitui inline-define.** Use ambos: inline-define para fluxo, glossário para revisita.
- **Antes de apresentar ao usuário**, sempre rode pelo menos uma persona iniciante e uma especialista. Se nenhuma das duas chegar ao fim, ajustar antes.

## Próximos passos

- **Estrutura canônica detalhada:** [TEMPLATE.md](TEMPLATE.md)
- **Framework de personas para teste:** [PERSONAS.md](PERSONAS.md)
- **Framework de análise profunda + rubrica de nota:** [ANALYSIS.md](ANALYSIS.md)
- **Exemplo vivo:** `docs/lessons/0001-hardening-de-vps-linux.md` é a referência canônica de aplicação completa
