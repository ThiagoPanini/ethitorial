# capture-schema.md — o artefato de captura (a camada descritiva, global)

A **captura** é como o autor *de fato* escreve. É descritiva, honesta, e **portátil** — vive
fora de qualquer projeto, porque a voz é da pessoa, não do repositório. Um projeto só adiciona
sua *intenção editorial* por cima (ver [profile-schema.md](profile-schema.md)).

## Onde vive

```
~/.write-as-me/voices/<slug>/
├── features.json        # camada objetiva — saída de scripts/analyze_corpus.py
├── voice.md             # camada interpretada — afirmações ancoradas, com proveniência
├── exemplars/           # amostras reais retidas (ancoragem do juiz + base do eval)
│   └── *.md
└── corpus-manifest.md   # o que foi ingerido e ONDE mora — nunca o texto cru em si
```

- `<slug>` default = `me`. Multi-voz (escrever como outra pessoa) = outro slug; é afordância de
  power-user, não a pitch.
- **Global e privada de propósito.** O corpus cru de alguém pode ser pessoal; ele não é commitado
  em projeto nenhum. O que um projeto compartilha é o *perfil*, que não expõe o corpus.
- O caminho-base pode ser sobrescrito por config do projeto (env `WRITE_AS_ME_HOME` ou
  equivalente), mas o default acima é o contrato.

## `features.json` — a camada objetiva

Gerado por `scripts/analyze_corpus.py`. Não edite à mão — é regenerável e é a régua do linter.
Significado de cada campo em [feature-taxonomy.md](feature-taxonomy.md).

## `voice.md` — a camada interpretada (o coração descritivo)

Aqui você (LLM) traduz números + material bruto em afirmações que dá para escrever em cima.
**Regra dura: toda afirmação carimba proveniência e âncora.** Sem âncora, é palpite e não entra.

Proveniência tem dois valores, e eles não se misturam:

- `[corpus]` — observado e contado no material do autor. Âncora = um número do features.json ou
  um trecho real citado.
- `[entrevista]` — dito pelo autor quando o corpus não mostrava (ou era ambíguo). Âncora = a
  resposta dele. **Captura também é descritiva aqui** — é o autor descrevendo o próprio hábito,
  não o que ele *deseja* soar (isso é o perfil).

Estrutura recomendada (adapte às dimensões que o corpus revelar — não force seções vazias):

```markdown
# voice.md — <slug>
> Captura descritiva. Base: <n> docs, <palavras> de prosa. Gerada <data>.
> Regenere a camada objetiva com analyze_corpus.py; reinterprete aqui quando o corpus crescer.

## Ritmo e frase
- Frases de mediana ~21 palavras, com ocasionais longas (p90 ~39). *[corpus: sentence_length]*
- Parágrafos curtos, uma ideia cada (~34 palavras). *[corpus: paragraph_length_words]*

## Pontuação e ênfase
- **Não usa em-dash** (— ≈ 0 por 1k em 46 docs). *[corpus: punctuation_per_1k.em_dash]*
- Itálico para anglicismo (*framework*, *deploy*); negrito só no termo-âncora. *[corpus: emphasis]*

## Abertura e fecho
- Abre pela história/linhagem antes do mecanismo (cita "<trecho real>"). *[corpus: openers]*
- Fecha apontando para o próximo passo, não com despedida. *[corpus: closers]*

## Hábitos estruturais
- Fecha quase sempre com seção de referências (~0.87). *[corpus: references_section_rate]*
- Tabela para glossário/comparação (~0.61 dos docs). *[corpus: table_usage_rate]*
- Código com disciplina: anuncia o que o bloco faz, depois explica. *[entrevista]*

## Vozes vizinhas / modulação por registro
- Tutorial é mais denso; post de abertura de série é mais caloroso. *[corpus/entrevista]*

## Lacunas conhecidas
- Pouco sinal sobre texto opinativo curto — corpus é quase todo tutorial. *[lacuna]*
```

A seção **"Modulação por registro"** é onde mora a variação *descritiva* (tutorial vs hot-take):
é como o autor naturalmente muda de calor/densidade por formato. Não confunda com a mudança
*intencional* de tom — essa é escolha do projeto e vive no perfil.

## `exemplars/`

Punhado de amostras reais **retidas** (não usadas para computar features). Servem para (a)
ancorar o juiz de voz no `write` ("a linha gerada destoa deste trecho real") e (b) ser o lado
"real" do `eval` de discriminação cega. Guarde variedade de formato, não só o gênero dominante.

## `corpus-manifest.md`

Registra **o que** foi ingerido e **onde** mora (caminhos, repos, datas, contagens) — para
regenerar a captura depois. **Nunca** duplique o texto cru aqui; aponte para a fonte. Se uma
fonte é volátil (site atrás de proteção, API que pode sumir), diga que precisa de export para
arquivo antes — links voláteis ficam fora da ingestão automática.
