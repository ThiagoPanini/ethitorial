# learn — captura descritiva da voz (camada global)

Constrói ou atualiza a **captura** de uma voz: como a pessoa *de fato* escreve. Saída em
`~/.write-as-me/voices/<slug>/` (ver [capture-schema.md](../references/capture-schema.md)). É
**idempotente** — rodar de novo num corpus maior reincorpora; não há verbo separado de
"recalibrar a captura".

```
Reunir corpus → Segmentar e medir → Interpretar (ancorado) → Entrevista de lacuna → Gravar captura
```

Esta é a camada **descritiva**. Nada de "como deveria soar" entra aqui — isso é `calibrate`.

## 1. Reunir o corpus (curadoria, não "aponte para uma pasta")

Pergunte onde mora o material do autor: arquivos, diretórios, ou texto colado. Aceite o que for
local. **Links/URLs ficam fora do v1** — fonte volátil (site atrás de proteção, API que some)
precisa de export para arquivo antes; diga isso e siga com o que há.

Curadoria importa: apontar cego para um diretório pega arquivos que **não são prosa do autor**
(docs de terceiros, README de ferramenta, conteúdo em outro idioma). Antes de medir, confirme com
a pessoa o conjunto — e se o resultado vier estranho (ex.: conectivos num idioma que não é o
dela), avise que o corpus está contaminado e refine a seleção. Variedade de formato melhora a
fidelidade: tutorial, post solto, nota, texto opinativo.

## 2. Segmentar e medir (o script faz o trabalho objetivo)

```bash
python3 scripts/analyze_corpus.py <caminho> [<caminho> ...] --out ~/.write-as-me/voices/<slug>/features.json
```

O script segmenta cada doc por elemento (prosa / código / citação / referências / tabela) e
computa o sinal **só sobre a prosa conectiva** do autor — citação de terceiro não polui a régua,
mas o *hábito* de citar é medido à parte. Leia o `meta`: poucos docs = menos confiança.

Não invente número à mão; o features.json é regenerável e é a régua que o `write` vai cobrar.

## 3. Interpretar em afirmações ancoradas

Leia o features.json com a [feature-taxonomy.md](../references/feature-taxonomy.md) na mão e
traduza número + material bruto em `voice.md`. **Toda afirmação carimba proveniência e âncora**
(`[corpus]` + número/trecho). Sem âncora, é palpite e não entra.

Em particular, use o `raw_material`: leia 20–40 aberturas e classifique a taxonomia de abertura;
idem para fechos; vire `sentence_initial_tokens_top` em vocabulário de conectivos; julgue se os
headings são promessas concretas ou rótulos genéricos. Onde um número tiver `n` baixo ou for
ambíguo, **não afirme** — marque como lacuna para a entrevista.

## 4. Entrevista de lacuna (descritiva)

Rode a entrevista do `learn` da [interview-bank.md](../references/interview-bank.md) — seção A.
**Dirigida por lacuna**: só pergunte o que a captura deixou em aberto (desambiguar um número,
cobrir um gênero ausente, pegar a regra por trás de um tique). Uma pergunta por vez, com
recomendação. Não reconfirme o que o features.json já provou com `n` alto.

O que vier daqui entra no voice.md marcado `[entrevista]`. Cuidado com o seam: se a pessoa
descreve um *hábito* ("sempre cito a fonte"), é captura; se ela expressa um *desejo de mudar*
("queria soar menos formal"), isso é `calibrate`, não vai para a captura descritiva.

## 5. Reter exemplares e gravar

- Separe um punhado de amostras reais variadas em `exemplars/` (não usadas para medir) — servem
  de âncora para o juiz do `write` e de lado "real" do `eval`.
- Escreva `corpus-manifest.md`: o que foi ingerido, onde mora, contagens, data. **Nunca** o texto
  cru — só os ponteiros.
- Feche reapresentando o diff conceitual: o que a captura passou a afirmar, o que ficou como
  lacuna. A pessoa precisa reconhecer a captura como dela. Voz é loop.

## Fronteira

`learn` constrói a captura **global e privada**. Não decide tom de projeto (isso é `calibrate`)
nem escreve conteúdo (isso é `write`). Não commita corpus cru em projeto nenhum.
