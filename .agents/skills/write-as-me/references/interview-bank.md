# interview-bank.md — repertório de entrevista (teto, não roteiro)

A entrevista é um **canal distinto e permanente** de captura — não só um plano B de corpus magro.
Há coisas sobre a voz de alguém que o texto não revela e que só a pessoa sabe. Mas ela é
**dirigida por lacuna**: a captura computada decide o que ainda falta perguntar. Este arquivo é o
**repertório** (o teto do que dá para cobrir), não um formulário a despejar.

Técnica (igual ao `grill-me`): **uma pergunta por vez**, ramificando pela resposta anterior, com
uma **recomendação sua** em cada pergunta. O objetivo é sair com insumo para a pessoa se
reconhecer no resultado — não preencher campos.

**Proveniência é regra dura.** O que vem daqui entra na captura/perfil marcado como
`[entrevista]`, nunca disfarçado de `[corpus]`. Os dois canais respondem perguntas diferentes:

---

## A. Entrevista do `learn` — lacuna DESCRITIVA

Pergunta: *como a pessoa de fato escreve, onde o corpus não conta?* Use para desambiguar números
e cobrir buracos — não para reconfirmar o que o features.json já provou.

Gatilhos típicos de pergunta (escolha pelos que a captura deixou em aberto):

- **Desambiguar um número de baixa confiança.** "Seu corpus tem em-dash ≈ 0 — isso é regra sua,
  ou só não apareceu nesses textos?" "Perguntas retóricas aparecem pouco (n=3); é tique seu ou
  artefato deste gênero?"
- **Cobrir um gênero ausente.** Se o corpus é quase todo tutorial: "Quando você escreve algo
  curto e opinativo, muda o quê? Abre diferente?"
- **Confirmar hábito vs artefato de tópico.** "Você sempre fecha com referências, ou foi porque
  esses posts eram técnicos? Vale para um texto pessoal também?"
- **Pegar a regra por trás do tique.** "Você usa itálico bastante — é para anglicismo, para
  ênfase, ou os dois? Tem uma regra?"
- **Modulação por registro (descritiva).** "Tutorial denso vs post de abertura — o que muda no
  seu calor e na sua densidade? Você sente que são 'dois você' ou o mesmo?"
- **Influências e antimodelos.** "Que autores/textos você sente que moldaram seu jeito? E tem um
  estilo que você ativamente *não* quer soar como?"
- **O que dói ler de volta.** "Lendo seus textos antigos, o que te faz torcer o nariz hoje?"
  (Cuidado: a resposta pode ser intenção de mudança → isso é material de `calibrate`, não de
  captura descritiva. Carimbe certo.)

Pare quando as lacunas materiais fecharam, não quando "acabou o repertório". Lacuna pequena e
sem impacto → registre como lacuna no voice.md e siga.

---

## B. Entrevista do `calibrate` — intenção PRESCRITIVA

Pergunta: *como a pessoa quer SOAR neste projeto?* É o dial editorial. Aqui qualquer mudança de
tom é **escolha declarada**, nunca assumida pela skill.

- **O dial de transformação.** "Sua captura descreve como você escrevia. Neste projeto, você quer
  soar exatamente assim, ou modular algo? Mais direto? Mais formal? Menos floreio de abertura?"
  (Se a captura mostra cerimônia datada, ofereça a opção — mas é ele quem decide manter ou cortar.)
- **Público e propósito.** "Para quem é este conteúdo? O que o leitor sai sabendo ou conseguindo
  fazer? Quanto ele já sabe quando chega?"
- **Nuncas duros.** "Tem linha que você nunca quer cruzar aqui? Emoji, gíria, promessa de
  cadência, jargão de marketing?"
- **Tamanho e densidade.** "O default aqui é panorama curto ou guia denso? Quanto código?"
- **Contrato de saída.** "Onde o texto precisa nascer e em que formato? Tem frontmatter, seções
  obrigatórias, um validador que diz se encaixou? Existe um command/hook do projeto que já sabe
  disso?" (Se sim, aponte para ele em vez de reinventar — a skill genérica não conhece o catálogo.)
- **Fronteira.** "Até onde eu vou? Paro no draft para você revisar, ou faço mais?"
- **Mudança intencional vs captura.** Se ele pedir um desvio do corpus ("quero menos cerimônia"),
  confirme que é escolha de projeto e registre como `Mudança intencional` no perfil — **sem**
  alterar a captura descritiva. A captura continua dizendo a verdade sobre o corpus.

---

## Modo de conduzir (vale para os dois)

- Comece mostrando o que a captura **já sabe** ("Detectei isto; confere?") — respeita o tempo da
  pessoa e ancora a conversa no real.
- Uma pergunta por vez. Recomende. Deixe a resposta abrir a próxima.
- Não pergunte o que o features.json já respondeu com `n` alto. Isso irrita e não agrega.
- Feche reapresentando o que mudou ("Com base nisto, vou afirmar X e marcar Y como lacuna") e
  peça o aval. Voz é loop, não one-shot.
