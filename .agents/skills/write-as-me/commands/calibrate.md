# calibrate — intenção editorial do projeto (camada local)

Constrói ou atualiza o **perfil** de uma voz num projeto: como a pessoa quer *soar aqui*. Saída
em `<raiz-do-projeto>/.write-as-me/profiles/<slug>.md`, commitada (ver
[profile-schema.md](../references/profile-schema.md)).

```
Confirmar a captura → Entrevista de intenção → Resolver contrato de saída → Gravar perfil
```

Esta é a camada **prescritiva**. Ela MODULA a captura, **nunca a reescreve**. Se faltar captura
para a voz, mande rodar `learn` antes — perfil sem captura é opinião no vácuo.

## 1. Confirmar a captura de base

Identifique a voz (`<slug>`, default `me`) e leia o `voice.md` dela. Mostre à pessoa o que a
captura **descreve** ("Você escreve assim: frase média ~21 palavras, fecha com referências, zero
em-dash…"). O perfil parte daí. Se não houver captura, pare e peça `learn` primeiro.

## 2. Entrevista de intenção (prescritiva)

Rode a entrevista do `calibrate` da [interview-bank.md](../references/interview-bank.md) — seção
B. Uma pergunta por vez, com recomendação. Cubra o que o projeto pedir:

- **O dial de transformação.** A captura descreve como a pessoa escrevia; aqui ela escolhe manter
  ou modular. Se a captura mostra cerimônia datada, **ofereça** cortar — mas a decisão é dela,
  não um default da skill. Registre como `Preserve` / `Modula` / `Mudança intencional`.
- **Público e propósito**, **nuncas duros**, **tamanho e densidade** — ver o banco.

Carimbe tudo como decisão de projeto. Se a pessoa pedir um desvio da captura ("quero menos
floreio que nos meus posts antigos"), isso é `Mudança intencional` no perfil — **não** edite o
voice.md. A captura continua dizendo a verdade sobre o corpus; o perfil registra a escolha.

## 3. Resolver o contrato de saída (fornecido pelo projeto)

O núcleo da skill **não conhece o catálogo de nenhum projeto** — é o que a mantém genérica. O
contrato vem do projeto. Pergunte (ou aponte para o command/hook do projeto que já sabe):

- Formato (Markdown puro? outro? frontmatter exigido e quais campos?).
- Destino (onde o arquivo nasce; convenção de nome/slug).
- Estrutura obrigatória (seções fixas, blocos que sempre aparecem).
- Validação (o comando que o projeto roda para dizer "encaixou").
- Fronteira (até onde a skill vai — ex.: para no draft, não abre PR).

Se o projeto já tem um command/hook próprio carregando isso, o perfil só **aponta** para ele em
vez de duplicar. É assim que a skill serve qualquer projeto sem assar viés de nenhum.

## 4. Gravar o perfil

Escreva `.write-as-me/profiles/<slug>.md` na estrutura do
[profile-schema.md](../references/profile-schema.md). Feche resumindo: o que será preservado, o
que será modulado, qual a mudança intencional e por quê, e o contrato de saída. Como é commitado,
fica revisável em PR — voz e intenção são decisões versionadas do projeto.

## Fronteira

`calibrate` decide intenção e contrato; **não** mede a voz (isso é `learn`) nem escreve (isso é
`write`). Nunca muta a captura descritiva — modular é por cima, sempre.
