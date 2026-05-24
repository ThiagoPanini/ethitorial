# ADR 0008 — `Tag` é conjunto curado fechado, não livre

- **Status:** Accepted
- **Data:** 2026-05-23
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [docs/CONTEXT.md](../CONTEXT.md), [docs/VISION.md](../VISION.md)

## Contexto

O catálogo público precisa de filtros por `Tag` para descoberta. Em catálogos de blog/SaaS é comum aceitar qualquer string como tag e deixar o autor cunhar livremente. O resultado típico é lixo lexical: `ai`, `AI`, `artificial-intelligence`, `llms`, `llm` coexistindo. Para um catálogo cuja VISÃO declara "padrão visual referenciado em codewiki.google" e cujo critério de sucesso da V1 é "5 apresentações reais publicadas com design polido", filtros sujos quebram a percepção de curadoria.

Por outro lado, na V1 só existe um autor (o mantenedor), então o "atrito" clássico de uma whitelist (autor precisa pedir tag nova) não se aplica — basta editar um arquivo no próprio repositório.

Opções consideradas:

1. **Tag livre.** Frontmatter MDX aceita qualquer string. Coleta tags vistas.
2. **Tag curada (whitelist).** `content/tags.yml` define o conjunto fechado. Tag fora dele quebra a build.
3. **Híbrida com aliases.** Tag livre no frontmatter, normalizada via dicionário canônico (`AI → ai`). Desconhecida vira warning.

## Decisão

**Adotar opção 2 na V1.** `content/tags.yml` é a fonte única; build do `apps/web` valida o frontmatter MDX contra essa lista. Tag fora da lista é erro de build, não warning.

## Justificativa

- **Catálogo curado é parte do produto, não opcional.** A VISÃO trata estética e curadoria como diferenciais; tags sujas contradizem isso.
- **Custo de atrito é zero na V1.** Autor único, edição de `tags.yml` é um commit. "Atrito imaginário" não justifica desistir da disciplina.
- **Mover restritivo → permissivo é trivial; o caminho contrário exige limpeza de dados.** Comece restritivo.
- **Híbrida (opção 3) tem valor real apenas quando autores externos aparecem.** Reabrir na Fase 3 (CMS) ou Fase 4 (multi-autor) é o momento certo, não agora.

## Consequências

### Positivas

- Filtros do catálogo permanecem visualmente limpos sem código de normalização.
- Decisão de adicionar tag passa por PR — vira reflexão consciente, não acúmulo.
- Build falha cedo (no `apps/web`) em vez de tarde (resultado vazio em filtro inexistente).

### Negativas

- Autor que quer experimentar tag nova precisa abrir PR antes de publicar a apresentação. Aceitável enquanto autor único.
- Multi-autor (V3+) vai exigir abrir essa decisão — autor externo não vai (não deveria) editar `content/tags.yml` diretamente. Solução provável: UI de proposta de tag + curadoria por admin, ou migração para opção 3 (híbrida com aliases).

## Opções rejeitadas

- **Opção 1 (livre).** Otimizada para "atrito do autor" — um problema que não existe na V1 — ao custo de qualidade do catálogo. Erro clássico.
- **Opção 3 (híbrida com aliases).** Complexidade prematura. Faz sentido quando há autores que não controlam `tags.yml`; não agora.
