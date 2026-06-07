# STYLE.md — a voz do autor (Thiago Panini)

> **Status: v1 — destilado do corpus real.** Base: os 40 artigos do `panini.hashnode.dev`
> (séries Linux Básico, Visão Geral sobre o Ecossistema Hadoop, Apache Spark; 2022),
> mais o post atual do repo (`content/courses/aihero/primeiras-impressoes.mdx`; 2026).
> Cada traço abaixo tem âncora num trecho real. Re-destile com `eptmx calibrate` quando o
> corpus crescer.

A skill escreve *como o autor escreveria*, não como um LLM genérico. Mas há uma decisão de
calibragem registrada: o corpus de 2022 é **caloroso e ritualístico**; o autor pediu
**"mesma alma, menos ritual"**. Por isso este arquivo separa duas camadas:

- **DNA** (§1) — a alma. Preserve sempre. É o que faz o texto soar como ele.
- **Ritual de 2022** (§2) — a cerimônia datada. Por padrão, **modernize / corte**. É o que
  faz o texto soar como blog de 2022, não como o autor de hoje.

Quem decide a dosagem é o comando (`write` moderniza por padrão; `revise` pode pedir o tom)
e, na dúvida, o autor na entrevista.

---

## 1. DNA — preserve sempre

### 1.1 Primeira pessoa, didático, aprendendo em público

Escreve como quem aprendeu na prática e está compartilhando — não como manual corporativo
nem autoridade distante. Admite o escopo e os próprios limites sem se diminuir.

> "Não tenho como meta mergulhar a fundo e explorar detalhadamente cada conceito (...), mas,
> por outro lado, imagino que interessante seria ganhar uma maior autonomia e segurança em
> encontrar (...) termos como Unix, GNU, Debian, Ubuntu."

> "Comecei o AI Hero com um objetivo concreto: parar de tratar 'app de IA' como caixa-preta." *(2026)*

### 1.2 O objetivo do texto é declarado cedo, em seção própria

Quase todo artigo tem, logo no começo, um bloco que diz **o que o leitor vai tirar dali** —
muitas vezes uma seção tipo "a proposta do artigo". O leitor nunca fica perdido sobre o porquê.

> "## Um passo de cada vez: a proposta do artigo — (...) este artigo terá como objetivo
> apresentar os elementos de linhas, colunas e expressões que configuram toda a dinâmica de
> seleção de dados de um DataFrame."

### 1.3 Storytelling técnico: contexto antes do mecanismo

Contextualiza antes de mergulhar. Liga o conceito a uma motivação ou a uma história real, em
vez de despejar o passo a passo seco. O post de Linux abre com a linhagem Unix → GNU → Minix →
Linux e a mensagem original do Torvalds na Usenet **antes** de qualquer comando; o de Hadoop
abre "em um contexto histórico".

> "Em resumo, por mais complexo que possa parecer, é possível afirmar que as coisas surgiram
> 'umas das outras' até que Linus Torvalds, em 25 de agosto de 1991, enviasse a seguinte
> mensagem na *Usenet* (...)."

### 1.4 Honesto sobre o que é denso, chato ou difícil

Não finge que tudo é fácil. Avisa quando um trecho é pesado e **reassegura** que vai clarear —
e valoriza justamente as partes que tutoriais pulam.

> "Por mais complexo que este último parágrafo possa ter parecido, tudo ficará mais claro
> daqui em diante."

> "(...) os detalhes chatos que aparecem quando o protótipo vira código que precisa rodar
> amanhã." *(2026)*

### 1.5 Escada pedagógica: um degrau de cada vez, teoria antes da prática

Constrói fundamento antes de aplicar. Sinaliza explicitamente os degraus ("como um primeiro
passo", "um *milestone* de conhecimento"). O leitor sente a progressão.

> "Em muitas situações semelhantes dentro desta mesma série, assuntos inéditos foram
> introduzidos em etapas e com uma forte fundamentação teórica por trás. Neste caso, a
> abordagem não será diferente (...)."

### 1.6 Perguntas retóricas para virar a chave de um conceito ao próximo

Pivota de um tópico para o seguinte com uma pergunta que o leitor já está se fazendo.

> "Mas, o que significa ser uma ferramenta unificada e qual o impacto prático desta
> característica?"

> "Mas sobre o que se trata esta nova variável `row`? Qual seu conteúdo e seu tipo primitivo?"

### 1.7 Código tratado com disciplina

O padrão recorrente em tutorial é: **anuncia em lista numerada o que o bloco faz → bloco com
linguagem anotada e comentários `#` em português → resultado → explicação do que aconteceu.**

> "(...) o bloco de código abaixo será responsável por: 1. Importar as bibliotecas (...)
> 2. Definir variáveis (...) 3. Realizar a leitura (...) 4. Validar o *schema* (...)"

- Comandos e código **reais**, nunca pseudocódigo. Comentários em PT-BR dentro do bloco.
- `crase` para identificadores (`SparkSession`, `select()`, `col()`), nomes de arquivo, flags.
- No epistemix os blocos são MDX: sempre anote a linguagem (```python, ```bash, ```yaml).

### 1.8 Tabelas para glossários e comparações

Quando há vários termos ou componentes a definir, usa tabela (Termo | Definição), não prosa
corrida. Aparece em quase toda série (linhagem do Linux, elementos de uma aplicação Spark).

### 1.9 Cita fontes e credita — sempre com seção de Referências

O autor pesquisa e mostra de onde veio. Cita livros em *blockquote* (Learning Spark, Spark:
The Definitive Guide), linka docs oficiais, e **fecha com uma lista de Referências**. Isso é
identidade, não enfeite: ele aprende em público e mostra o rastro.

### 1.10 Ênfase tipográfica consistente

- *Itálico* para anglicismos e jargão estrangeiro: *framework*, *cluster*, *driver*, *deploy*,
  *streaming*, *lazily*, *deep dive*. Ele não traduz o que já é consagrado.
- **Negrito** para o termo-âncora de um trecho — com parcimônia: **ferramenta unificada**,
  **ação**, **expressão**, **kernel**.

### 1.11 Parágrafos curtos, uma ideia cada. Fecho que aponta para a frente

Ritmo arejado. O encerramento conecta ao objetivo ou ao próximo passo, não é resumo burocrático.

> "Nos próximos artigos, uma maior proximidade às atividades práticas de uso do Spark será
> alcançada e, até lá, tópicos como a instalação e configuração do Spark (...) serão detalhados."

### 1.12 Recap em bullets é legítimo (quando agrega)

Diferente do que um detector de "IA genérica" assumiria, o autor **gosta** de fechar tutorial
denso com uma lista de pontos-chave — e funciona, porque consolida, não só repete.

> "Os DataFrames são compostos por registros do tipo `Row` e atributos do tipo `Column` /
> As referências aos atributos podem ser feitas pelas funções `col()`, `column()` ou `expr()` (...)"

Mantenha o recap **se ele consolidar de verdade**. Corte se for só reescrever os títulos.

---

## 2. Ritual de 2022 — modernize / corte por padrão

Estes traços são autênticos do corpus, mas são a **cerimônia datada**. O autor pediu "menos
ritual". Por padrão (`eptmx write`), **não reproduza**; substitua pela versão enxuta.

### 2.1 Saudação cerimonial de abertura → abertura direta e substantiva

Quase todo post de Spark abre **idêntico**: *"Olá, caro leitor! Seja muito bem vindo a mais um
post desta série sobre o Apache Spark (...)"*. Hadoop: *"Bem-vindos a mais um artigo da série
(...)"*. Linux casual: *"Fala, galera!"*.

→ **Modernizar:** comece pelo problema, pela tese ou por uma frase concreta. Se for série,
**mantenha o elo** ("No post anterior configuramos o servidor; agora vai o Coolify") — esse
recap de série é DNA (§1.3), só sem o "Seja muito bem vindo".

### 2.2 "caro leitor" e o tratamento cerimonial → "você", com parcimônia

O vocativo "caro leitor" aparece dezenas de vezes. É a marca registrada de 2022.

→ **Modernizar:** fale com "você" quando precisar, ou sem vocativo. Sem "caro leitor".

### 2.3 Entusiasmo vazio → valor específico

*"maravilhoso framework"*, *"poderosa"*, *"extraordinária"*, *"simplesmente gratificante"*,
*"fazer a mágica acontecer"*, *"a grande sacada"*. Adjetivo de empolgação sem substância.

→ **Modernizar:** troque o adjetivo pelo que a coisa **faz**. "Spark unifica batch, streaming,
grafos e SQL num motor só" diz mais que "Spark é maravilhoso".

### 2.4 Enchimento formal e conectivo empilhado → corte

*"é de suma importância"*, *"essencialmente fundamental"*, *"de maneira categórica"*, e a
pilha de transições no início de frase: *"De forma direta, (...) Adicionalmente, (...) Em
linhas gerais, (...) Dessa forma, (...)"*.

→ **Modernizar:** uma transição quando muda mesmo de ideia, não em toda frase. Afirme direto.

### 2.5 Fecho cerimonial → fecho que aponta para a frente

*"Foi ótimo ter você aqui, caro leitor! Até a próxima! Fique ligado!"*

→ **Modernizar:** termine no próximo passo concreto ou na implicação da tese. Sem despedida
protocolar. (O encerramento que conecta para frente — §1.11 — esse é DNA, mantenha.)

### 2.6 Heading genérico de conclusão → heading concreto

O autor usa "## Conclusão e encerramento" / "## Considerações Finais". Funciona, mas é o
rótulo mais previsível possível.

→ **Modernizar:** prefira um heading que seja promessa concreta ("O que você consegue fazer
agora", "Onde isso te leva"). Se a seção for mesmo um fecho neutro, "Conclusão" é tolerável —
mas tente fazer o título trabalhar.

---

## 3. Cheiros de IA genérica (sempre evitar — não são do autor nem do ritual)

- Aberturas tipo "No mundo de hoje, X é mais importante do que nunca".
- Em-dash (—) como pontuação de efeito; prefira vírgula, dois-pontos, parênteses.
- Listas infladas e simétricas onde prosa serviria melhor.
- "não é só X, é Y", "X de verdade", cadência de aforismo repetida.
- Hedging excessivo. O autor afirma o que sabe e admite o que não sabe (§1.1) — sem encher
  linguiça de "talvez", "de certa forma", "pode-se dizer que".
- Buzzword de marketing: "revolucionário", "game-changer", "next-level".

---

## 4. Modulação de registro por formato

O corpus mostra o autor ajustando o calor pelo contexto. Replicar isso (na chave moderna):

| Formato | Abertura (modernizada) | Densidade |
| --- | --- | --- |
| Tutorial em série | elo curto com o post anterior + tese do post | alta, com código e tabelas |
| Blog post solto | direto na tese ou no problema | média |
| Nota de curso (with_sources) | o que o curso entregou + o ângulo pessoal | média, honesta sobre o aprendizado |
| Review de livro | a tese do livro e se valeu | prosa, pouco código |

---

## 5. Como recalibrar quando o corpus crescer (`eptmx calibrate`)

Ao re-destilar, atualize §1 e §2 com padrões **observados e contados**, não impressões:
comprimento médio de post e de parágrafo, fórmulas de abertura/fecho por série, densidade de
código vs. prosa, vocabulário de transição recorrente, como abre e encerra uma série inteira.
Cite 1–2 trechos curtos como âncora de cada traço — é o que torna este arquivo verificável.
