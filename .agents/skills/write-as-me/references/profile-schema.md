# profile-schema.md — o perfil de projeto (a camada prescritiva, local)

O **perfil** é como o autor quer *soar neste contexto* — a transformação editorial e o contrato
de saída. É **prescritivo** e **local ao projeto**, porque a mesma voz pode querer registros
diferentes em lugares diferentes (um blog pessoal, a documentação de uma empresa, uma newsletter).

A separação é a espinha da skill: a [captura](capture-schema.md) é honesta sobre como o autor
escreve; o perfil é a escolha sobre como modular isso aqui. Misturar os dois é o erro que torna
uma "voz" enviesada e não-reaproveitável — uma preferência editorial vira lei descritiva e
contamina todo uso. Mantenha o seam limpo.

## Onde vive

```
<raiz-do-projeto>/.write-as-me/profiles/<slug>.md     # commitado
```

Commitado de propósito: o perfil é decisão de projeto, revisável em PR, e **não expõe o corpus**
(que fica na captura global e privada). `<slug>` casa a voz da captura (default `me`).

## Estrutura

```markdown
# profile — <slug> @ <projeto>
> Camada prescritiva. Refere a captura ~/.write-as-me/voices/<slug>/.
> Calibrada <data> por <autor>. Mudou a intenção? Recalibre com `calibrate`.

## Voz de base
Refere: <slug>. Preserve o DNA descrito em voice.md — esta camada só MODULA, não reescreve.

## Transformação editorial
O dial é do AUTOR, declarado na entrevista de calibração — nunca assumido pela skill.
- **Preserve:** <traços da captura que ficam intactos — ex.: storytelling antes do mecanismo,
  fechar com referências, código com disciplina>.
- **Modula:** <traços que o autor quer dosar diferente aqui — ex.: "menos floreio de abertura",
  "mais direto ao ponto", "tom mais formal para público corporativo">.
- **Mudança intencional:** <desvios deliberados da captura, com o motivo — ex.: "o corpus é de
  2022 e caloroso; aqui quero a mesma alma com menos cerimônia". Isto é escolha, não correção da
  captura: a captura continua dizendo a verdade sobre 2022.>

## Público e propósito
Para quem é, o que o leitor deve sair sabendo/fazendo, nível de pré-requisito assumido.

## Nuncas duros
Linhas que este projeto nunca cruza (ex.: "sem emoji", "sem promessa de cadência", "sem jargão de
marketing"). O linter e o juiz tratam isso como gate, não sugestão.

## Alvo de tamanho e densidade
Panorama curto vs guia denso; faixa de palavras; densidade de código esperada.

## Contrato de saída (fornecido pelo projeto)
O núcleo da skill NÃO conhece o catálogo de nenhum projeto. O projeto declara aqui (ou aponta
para seus próprios commands/hooks) o que um output válido precisa ter:
- **Formato:** Markdown puro? MDX? Frontmatter exigido (quais campos)?
- **Destino:** onde o arquivo deve nascer; convenção de nome/slug.
- **Estrutura obrigatória:** seções fixas, ordem, blocos que sempre aparecem.
- **Validação:** comando que o projeto roda para dizer "isto encaixa" (ex.: um teste de catálogo).
- **Fronteira:** até onde a skill vai (ex.: "para no draft; não abre PR nem mergeia").

> Se o projeto tem um command/hook próprio que já carrega o contrato de saída, este bloco pode só
> apontar para ele. A skill genérica fica de fora dessas especificidades — é assim que ela serve
> qualquer projeto sem assar viés de nenhum.
```

## Por que separar mesmo a "mudança intencional"

Quando o autor diz "aqui quero menos cerimônia que no meu corpus antigo", a tentação é
reescrever a captura. **Não faça.** A captura continua verdadeira (o corpus *era* cerimonioso);
o perfil registra a escolha de modular. Assim a próxima voz/projeto herda a captura honesta, não
a preferência de um contexto — e o `eval` de discriminação cega ainda mede contra o real, não
contra o desejo.
