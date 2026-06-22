# feature-taxonomy.md — o que os números medem (a régua)

`scripts/analyze_corpus.py` produz `features.json`: o **sinal objetivo** de uma voz. Este
arquivo explica o que cada número significa, para você (LLM) **interpretá-lo** em afirmações de
voz ancoradas — e para o linter de escrita saber o que cobrar. Os números são evidência e régua;
nunca um veredito sozinho ("soa como o autor" é julgamento, não aritmética).

Princípio de design: o script só computa o que é **honestamente agnóstico de idioma**. O que
exige saber o que uma palavra *significa* (quais aberturas são conectivos, se um fecho "aponta
para a frente", se uma citação é de terceiro) fica como **material bruto** para você interpretar
— nunca decidido por lista fixa por idioma. É o que mantém a captura portátil.

## Índice
- [1. Como ler o features.json](#1-como-ler-o-featuresjson)
- [2. Métricas de prosa](#2-métricas-de-prosa)
- [3. Métricas estruturais (hábitos)](#3-métricas-estruturais-hábitos)
- [4. Material bruto (você interpreta)](#4-material-bruto-você-interpreta)
- [5. Como virar isso em afirmação de voz](#5-como-virar-isso-em-afirmação-de-voz)

## 1. Como ler o features.json

Três blocos importam:

- `prose` — distribuições computadas sobre a **prosa conectiva** do autor (código, citações,
  tabelas e a seção de referências já foram segmentados para fora). É o coração da régua.
- `structure` — taxas de hábito por documento (termina em referências? usa tabela? razão
  código/prosa?). Identidade que não aparece no comprimento de frase.
- `raw_material` — aberturas, fechos, headings e tokens iniciais de frase **crus**. Texto, não
  número. É daqui que sai a taxonomia de abertura/fecho e o vocabulário de conectivos.

`meta.documents` e `meta.total_prose_words` calibram sua confiança: 6 posts dizem menos que 46.
Distribuição com `n` baixo → trate como indício, não lei (e mande a entrevista cobrir a lacuna).

## 2. Métricas de prosa

| Campo | O que é | Como interpretar |
|---|---|---|
| `sentence_length_words` | distribuição de palavras por frase (mean/median/p10/p90/max/stdev) | ritmo. Mediana baixa + p90 alto = frases curtas com ocasionais longas. A *forma*, não só a média, é a voz. |
| `paragraph_length_words` | palavras por parágrafo | "parágrafos curtos, uma ideia cada" é mensurável aqui. |
| `paragraph_length_sentences` | frases por parágrafo | idem, em outra unidade. |
| `question_rate` | fração de frases terminadas em `?` | pergunta retórica como pivô de assunto vira número. |
| `punctuation_per_1k.em_dash` | travessões (—) por 1k palavras | **assinatura forte**. Muitos autores: ~0. Cheiro de IA clássico é inflar isso. O linter cobra. |
| `punctuation_per_1k.en_dash` / `double_hyphen` | – e -- por 1k | variantes do mesmo tique. |
| `punctuation_per_1k.{comma,semicolon,colon,parens}` | densidade de pontuação | vírgula alta = frases ramificadas; dois-pontos alto = gosta de anunciar-e-listar; parênteses = apartes. |
| `emphasis_per_1k.{italic,bold,code_span,link}` | marcação por 1k | itálico alto costuma ser anglicismo em itálico; code_span alto = cita identificadores in-line; negrito = termo-âncora. |
| `sentence_initial_tokens_top` | palavras que mais iniciam frase | **material bruto p/ conectivos** — você decide quais são tiques ("Assim", "Dessa forma") e quais são artigo banal. |

## 3. Métricas estruturais (hábitos)

| Campo | O que revela |
|---|---|
| `references_section_rate` | fração de docs que fecham com seção de referências. Perto de 1.0 = regra dura de identidade ("sempre credita a fonte"). |
| `table_usage_rate` | usa tabela para glossário/comparação? |
| `blockquote_usage_rate` | cita em bloco (terceiros, livros)? |
| `mean_code_to_prose_ratio` | linhas de código por palavra de prosa. Densidade técnica do autor. |
| `heading_level_hist` | como hierarquiza (`##` vs `###`). |
| `code_langs` | linguagens reais que aparecem — parte do domínio do autor. |

Esses hábitos são **dimensões à parte** da prosa, de propósito: um autor pode ter frase curta E
sempre fechar com referências. São eixos independentes da voz.

## 4. Material bruto (você interpreta)

`raw_material` carrega o que número não captura:

- `openers` — primeira frase de cada doc. Leia 20–40 e **classifique a taxonomia de abertura**:
  abre pelo problema? pela história/linhagem? por saudação ritual? por escopo-por-contraste?
- `closers` — última frase de cada doc. O fecho recapitula e aponta para a frente? Despede-se
  cerimonialmente? Termina no próximo passo?
- `headings_sample` — headings reais. Promessas concretas ou rótulos genéricos ("Introdução")?
- `sentence_initial_tokens_top` — vire em vocabulário de transição característico.

Ruído acontece (alt-text de imagem, etc.) — descarte o que claramente não é prosa do autor.

## 5. Como virar isso em afirmação de voz

Cada afirmação no `voice.md` (ver [capture-schema.md](capture-schema.md)) deve ser **ancorada**:
ou num número (`em_dash_per_1k ≈ 0 em 46 docs`) ou num trecho real (uma abertura citada). Uma
afirmação sem âncora é palpite e não entra. Exemplo de leitura honesta:

> `references_section_rate: 0.87` + `blockquote_usage_rate: 0.35` →
> **Afirmação:** "Credita fontes como regra: ~9 em 10 textos fecham com referências; cita em
> bloco com frequência." *[corpus: 40/46 docs]* — descritivo, alta confiança.

> `question_rate: 0.02`, mas só `n=3` perguntas em 1 gênero →
> **Não afirme** "raramente usa perguntas" ainda. Marque como lacuna e deixe a entrevista do
> `learn` perguntar se é hábito ou artefato do corpus.
