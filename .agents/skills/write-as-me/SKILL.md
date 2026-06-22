---
name: write-as-me
description: >-
  Aprende a voz de escrita de um autor a partir do material dele (corpus de exemplos + entrevista)
  e gera conteúdo técnico que soa como a própria pessoa escreveu, não como um LLM genérico.
  Genérica e portátil — serve qualquer autor, em qualquer projeto; nada de catálogo ou formato é
  assado no núcleo. Multi-comando: learn (captura descritiva da voz a partir de exemplos),
  calibrate (intenção editorial e contrato de saída por projeto), write (gera na voz calibrada),
  eval (mede a fidelidade da captura). Use sempre que alguém quiser "aprender meu jeito de
  escrever", "escrever isto como eu", "na minha voz", "soar como eu/como o autor", calibrar ou
  destilar o próprio estilo, capturar tonalidade/storytelling/nuance de escrita, ou gerar
  artigo/post/texto que pareça escrito pela própria pessoa — mesmo sem dizer "write-as-me", "voz"
  ou o nome do comando. O destino e o formato do output vêm do perfil do projeto, não da skill.
  Não use para editar UI, código de aplicação ou documentação de arquitetura.
---

# write-as-me — aprende e escreve na voz de um autor

Transforma o material de escrita de alguém numa **voz capturada** e depois gera conteúdo técnico
que a pessoa reconheça como dela. É um **handler multi-comando** (inspirado no `impeccable`): o
`SKILL.md` roteia; cada comando tem seu playbook em `commands/<comando>.md`, carregado sob demanda.

É **genérica e portátil** de propósito: serve qualquer autor em qualquer contexto. A skill não
conhece o catálogo, o formato nem o destino de nenhum projeto específico — isso vem do **perfil**
do projeto. Onde for usada, a adaptação é por configuração/commands/hooks do próprio projeto,
nunca assada no núcleo.

## A espinha: captura descritiva ≠ transformação prescritiva

Tudo na skill deriva de uma separação:

- **Captura (descritiva)** — *como a pessoa de fato escreve.* Honesta, medida, ancorada. Global e
  portátil, porque a voz é da pessoa, não do repositório.
- **Transformação (prescritiva)** — *como ela quer soar neste projeto.* Opcional, declarada,
  local. Modula a captura; nunca a reescreve.

Fundir as duas é o erro que envenena uma "voz": uma preferência editorial de um contexto vira lei
descritiva e contamina todo uso futuro. **Não há doutrina de voz default nesta skill** — nenhum
"menos isto, mais aquilo" embutido. A voz é capturada como é; qualquer mudança de tom é escolha
declarada do autor no `calibrate`.

## Os dois artefatos (e onde vivem)

- **Captura** — `~/.write-as-me/voices/<slug>/` (global, privada). `features.json` (objetivo,
  gerado por script) + `voice.md` (interpretado, ancorado) + `exemplars/` + `corpus-manifest.md`.
  Schema em [references/capture-schema.md](references/capture-schema.md).
- **Perfil** — `<projeto>/.write-as-me/profiles/<slug>.md` (local, commitado). Transformação
  editorial + contrato de saída. Schema em [references/profile-schema.md](references/profile-schema.md).

`<slug>` default = `me`. O sujeito-padrão é *você*; escrever como outra pessoa (ghostwriting) é
afordância de power-user com outro slug, não a pitch.

**Proveniência é regra dura:** toda afirmação de voz carimba origem — `[corpus]` (medido) ou
`[entrevista]` (dito pelo autor) — e uma âncora. Sem âncora, é palpite e não entra.

## Setup — carregue sob demanda (não tudo sempre)

Se já leu um item nesta conversa, não releia.

1. [references/capture-schema.md](references/capture-schema.md) — forma da captura. **Para:**
   `learn`, `write`, `eval`.
2. [references/feature-taxonomy.md](references/feature-taxonomy.md) — o que os números medem e
   como virar afirmação de voz. **Para:** `learn`, `eval`.
3. [references/profile-schema.md](references/profile-schema.md) — forma do perfil de projeto.
   **Para:** `calibrate`, `write`.
4. [references/interview-bank.md](references/interview-bank.md) — repertório de entrevista (lacuna
   descritiva no `learn`; intenção prescritiva no `calibrate`). **Para:** `learn`, `calibrate`.

Os scripts em `scripts/` (`analyze_corpus.py`, `lint_text.py`, lib `features.py`) são stdlib puro,
sem instalação — rodam com `python3`.

## Comandos

| Comando | Camada | Descrição | Playbook |
|---|---|---|---|
| `learn [fontes]` | Captura (global) | Mede o corpus + entrevista de lacuna → captura descritiva | [commands/learn.md](commands/learn.md) |
| `calibrate` | Transformação (local) | Intenção editorial + contrato de saída do projeto | [commands/calibrate.md](commands/calibrate.md) |
| `write [tarefa]` | Geração | Compõe captura × perfil → draft + linter + juiz + loop | [commands/write.md](commands/write.md) |
| `eval` | Qualidade | Discriminação cega → mede a fidelidade da captura | [commands/eval.md](commands/eval.md) |

## Regras de roteamento

1. **Sem argumento** ("o que dá pra fazer?"): NÃO rode comando automaticamente. Veja o que já
   existe (há captura em `~/.write-as-me/voices/`? perfil no projeto?) e ofereça o próximo passo
   de maior valor com o comando exato — sem captura → `learn`; captura mas sem perfil → `calibrate`;
   ambos prontos → `write` — seguido da tabela.
2. **Primeira palavra casa um comando** (`learn`, `calibrate`, `write`, `eval`): carregue
   `commands/<comando>.md` e siga. O resto do argumento é o alvo.
3. **Não casa, mas a intenção mapeia claro:** "aprende meu jeito de escrever" / "destila minha
   voz" → `learn`; "calibra o estilo para este projeto" / "define o tom daqui" → `calibrate`;
   "escreve isto como eu" / "rascunha na minha voz" → `write`; "quão fiel está a captura?" →
   `eval`. Carregue o playbook e prossiga. Dois cabem → pergunte uma vez qual.
4. **Sem mapeamento claro:** se a pessoa quer produzir texto e já há captura, trate como `write`;
   senão, pergunte o que ela quer, mostrando a tabela.

## Fronteiras

- **HITL na borda.** Você **nunca muta a voz em silêncio.** Recalibrar (captura ou perfil) é
  sempre **proposto e revisável** — as edições do autor são sinal, não autorização para reescrever
  a voz pelas costas dele. Para no artefato pronto; não publica nem mergeia (o fluxo é do projeto).
- **Genérica por contrato.** O núcleo não conhece o catálogo/formato/destino de nenhum projeto.
  Tudo isso entra pelo **perfil** e pelos commands/hooks do projeto consumidor. É o que deixa a
  mesma skill servir qualquer autor sem herdar o viés de nenhum contexto.
