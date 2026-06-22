# eval — mede a qualidade da captura (discriminação cega)

Responde a pergunta que o `write` não responde sozinho: **a captura está boa a ponto de o
texto gerado passar por real?** É a métrica de qualidade da voz. Fica **fora do caminho crítico**
do dia a dia — você não roda a cada escrita — mas é o que diz, com honestidade, se a Fase de
captura prestou. Rode depois de um `learn` novo ou quando suspeitar que a voz degradou.

```
Reter reais → Gerar pares → Julgar às cegas → Conferir features → Reportar
```

## 1. Reter amostras reais

Pegue um punhado de parágrafos **reais** do autor que **não** entraram no cômputo de features —
os `exemplars/` da captura servem. Variedade de formato ajuda; um único gênero infla a nota.

## 2. Gerar pares casados

Para cada amostra real, gere com o `write` (na mesma voz/perfil) um parágrafo do **mesmo tema,
formato e tamanho**. O casamento importa: se o real é um fecho de tutorial denso, o gerado também
é. Sem casar tema/formato, o juiz separa pelo assunto, não pela voz — e a métrica mente.

## 3. Julgar às cegas

Misture reais e gerados, **embaralhe e remova rótulos**, e peça a um juiz independente (outra
passada, sem saber qual é qual) para dizer, de cada parágrafo, "real" ou "gerado" — com uma frase
de justificativa. Registre os palpites.

**Leitura da nota:** o objetivo é o juiz **não conseguir separar** (acerto perto de 50% = a
captura está boa; o gerado é indistinguível do real). Acerto alto = o gerado tem tells; as
justificativas dizem **quais** (abertura genérica, em-dash, ritmo errado) e viram tarefa de
melhoria — em `learn` (captura) ou no prompt de composição do `write`.

## 4. Conferir features (cruzar com o objetivo)

Rode o linter nos parágrafos gerados contra o features.json. Se o juiz separou E o linter acusou
`DRIFT` nos mesmos eixos, você tem causa-raiz objetiva. Se o juiz separou mas o linter passou, o
tell é retórico (abertura, arco, escolha de exemplo), não métrico — caça no voice.md e nos
exemplars.

## 5. Reportar

Resuma: taxa de acerto do juiz (quanto mais perto de 50%, melhor), os tells recorrentes que ele
citou, o cruzamento com o linter, e a recomendação — `learn` (corpus/interpretação), `calibrate`
(intenção) ou ajuste de composição. Sem teatro de número: a frase honesta é "um juiz às cegas
acerta X% — a captura está [forte/ainda com tells em Y]".

## Fronteira

`eval` mede; não muda a captura nem o perfil sozinho. As mudanças que ele sugere passam pelo
mesmo aval do loop do `write` — nunca mutação silenciosa da voz.
