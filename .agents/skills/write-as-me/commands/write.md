# write — gera conteúdo na voz calibrada

Compõe a **captura** (descritiva) com o **perfil** ativo (prescritivo) e produz um draft que a
pessoa reconheça como dela. Depois mede o draft contra a régua e colhe as edições como sinal.

```
Compor voz × perfil → Entender a tarefa → Escrever → Linter de features → Juiz de voz → Entregar → Loop
```

É aqui que a qualidade é ganha ou perdida: a composição do contexto é o produto.

## 1. Compor voz × perfil

- Carregue o `voice.md` da voz (`<slug>`, default `me`) e o perfil do projeto
  (`.write-as-me/profiles/<slug>.md`). Se faltar captura → `learn`. Se faltar perfil → ou rode
  `calibrate`, ou siga só com a captura e avise que não há intenção/contrato de projeto.
- A captura dá o **DNA** (ritmo, pontuação, aberturas, hábitos estruturais). O perfil dá a
  **modulação** (o que preservar/dosar, mudança intencional), o público, os nuncas e o **contrato
  de saída**. Onde os dois se cruzam, o perfil modula — mas nunca apaga o DNA.

## 2. Entender a tarefa

Se a tarefa já veio clara (tema, ângulo, insumos), siga. Se estiver vaga, faça uma entrevista
curta no estilo `grill-me` (uma pergunta por vez, com recomendação): tese/ângulo, público,
esqueleto, **insumos concretos** (comandos, números, versões, código). Texto técnico sem o
concreto vira vago. **Não invente fatos** que a pessoa não deu e que você não pode fundamentar —
marque um `> TODO:` visível em vez de inventar.

## 3. Escrever o draft

Escreva o texto **inteiro**, na voz composta. Deixe o voice.md guiar ritmo, pontuação, abertura e
fecho; deixe o perfil guiar tom, tamanho, nuncas e formato/destino. Honre o **contrato de saída**
do perfil (frontmatter, seções obrigatórias, caminho) — se o projeto tem um command/hook próprio
para isso, use-o em vez de adivinhar.

## 4. Linter de features (guard-rail objetivo)

```bash
python3 scripts/lint_text.py <draft> --features ~/.write-as-me/voices/<slug>/features.json
```

Compara as métricas do draft com a régua do autor (comprimento de frase/parágrafo, em-dash,
ênfase, etc.). **Necessário, não suficiente:** casar os números não faz soar como a pessoa, mas
desviar muito é cheiro confiável (o caso clássico: em-dash que o autor nunca usa). Trate `DRIFT`
como "olhe aqui", revise a prosa onde fizer sentido, e re-rode.

## 5. Juiz de voz (consultivo, ancorado)

Compare o draft com os `exemplars/` reais da captura e aponte as **linhas específicas** que
destoam, dizendo **por quê** ("esta abertura é genérica; o autor abre pela história — cf. exemplar
X"). É holofote, não portão: você sugere, a pessoa decide. Verifique também os **nuncas duros** do
perfil — esses, sim, são gate.

## 6. Entregar

Resuma em poucas linhas: o que foi escrito e onde (honrando o contrato de saída), o resultado do
linter, os pontos que o juiz levantou, e os `> TODO:` que sobraram. O próximo passo é da pessoa:
revisar, ajustar onde soou off, publicar pelo fluxo do projeto. Respeite a **fronteira** do
perfil (ex.: parar no draft, não abrir PR).

## 7. Loop (acumulativo, mas com aval)

As edições da pessoa sobre o draft são o sinal mais rico que existe. Observe o que ela muda de
forma recorrente. **Nunca mute a captura em silêncio.** Ao acumular um padrão (a mesma correção
em vários drafts), **proponha**: "Você vem cortando minhas aberturas longas — isso é a captura
errada (atualizo o voice.md via `learn`?) ou intenção deste projeto (ajusto o perfil via
`calibrate`?)." A distinção captura-vs-perfil decide qual artefato muda. A pessoa aprova; o loop
melhora a voz sem nunca reescrevê-la pelas suas costas.
