# ADR 0012 — `slide-kit`: catálogo base compartilhado + extensões locais por apresentação + animação como primitiva first-class

- **Status:** Accepted
- **Data:** 2026-05-23
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [ADR-0002](0002-stack-fastapi-nextjs-postgres.md), [ADR-0004](0004-hexagonal-pragmatica.md), [docs/VISION.md](../VISION.md), [docs/CONTEXT.md](../CONTEXT.md)

## Contexto

A VISÃO posiciona o talkingpres como catálogo público de alto padrão visual, com referência declarada em codewiki.google: dark-first, gradientes leves, animações elegantes. Há, simultaneamente, uma exigência produto-específica: **cada apresentação precisa poder gerar reação de "wow"** nos leitores — efeitos animados, transições, componentes próprios. Não basta o tom geral coerente; o conteúdo precisa surpreender.

Essas duas exigências puxam o desenho em direções opostas:

- **Consistência (catálogo coerente).** Tipografia, ritmo vertical, paleta, comportamento de navegação têm que ser estáveis entre apresentações. Sem isso, o catálogo vira "agregador de slides aleatórios" e perde o caráter editorial que justifica o produto.
- **Expressividade (wow por apresentação).** Apresentação sobre LLMs com tokens entrando da direita. Apresentação sobre SRE com gráfico de latência animado. Apresentação sobre arquitetura com transição "magic move" entre diagramas. Padronizar com componentes congelados mata essa camada.

A referência analisada — [palestra-sdd da Glaucia Lemos](https://glaucia86.github.io/palestra-sdd/?lang=pt-BR) — usa Reveal.js 5.1, TypeScript modular, Mermaid para diagramas, Lucide para ícones, sistema próprio de carregamento via `manifest.json`. Reveal.js dá de graça **fragmentos** (revelação progressiva dentro do slide), **transições parametrizáveis entre slides**, **temas via CSS variables** e **navegação por teclado**. Toda apresentação ganha esse vocabulário sem o autor reinventar.

Mas Reveal.js como tecnologia está fora do escopo: o ADR-0002 fixou Next.js + MDX como base do `apps/web`, e Reveal.js geralmente é embarcado via iframe ou HTML estático — quebra SEO (o catálogo não indexa o conteúdo dos slides), quebra cache da Cloudflare em granularidade fina, e duplica camadas. O que importamos de Reveal.js são as **ideias** (fragments, transições como first-class, tema por variável), não a tecnologia.

Opções consideradas:

1. **Catálogo fechado.** Conjunto único de componentes compartilhados; nada além disso. Consistente, mas mata wow.
2. **MDX permissivo com imports controlados.** Autor importa qualquer componente compilado em `apps/web`. Mais flexível, sem governança real.
3. **MDX totalmente livre.** Qualquer JSX, qualquer import. Sem chance de consistência; surface área de segurança enorme em multi-autor.
4. **Slide-kit em camadas: catálogo base + extensões locais por apresentação + animação como primitiva first-class + tema por apresentação.** Forma híbrida.

## Decisão

**Adotar opção 4.** O frontend constrói um pacote interno chamado `slide-kit` que define o vocabulário visual e de animação compartilhado. Apresentações usam esse vocabulário e podem estender com componentes locais. Tema por apresentação vive em CSS variables permitidas.

### Estrutura física

```
apps/web/
├── slide-kit/
│   ├── primitives/                    # vocabulário visual base
│   │   ├── CodeBlock.tsx              # Shiki + ranges destacáveis
│   │   ├── Callout.tsx                # info | warn | tip | quote
│   │   ├── Image.tsx                  # wrapper de next/image, alt obrigatório
│   │   ├── Quote.tsx                  # citação com atribuição
│   │   ├── Embed.tsx                  # youtube | gist | tweet (whitelist)
│   │   ├── Diagram.tsx                # Mermaid renderizado server-side
│   │   ├── Icon.tsx                   # wrapper de Lucide
│   │   ├── TwoColumn.tsx              # layouts comuns
│   │   ├── Centered.tsx
│   │   └── Grid.tsx
│   │
│   ├── animations/                    # primitivas de animação (Framer Motion)
│   │   ├── FadeIn.tsx                 # entrada com fade
│   │   ├── SlideIn.tsx                # entrada com direção (left|right|top|bottom)
│   │   ├── Stagger.tsx                # cascata de filhos com delay
│   │   ├── Reveal.tsx                 # revelação progressiva por scroll/fragment
│   │   ├── MagicMove.tsx              # morph entre dois layouts (shared layoutId)
│   │   ├── Parallax.tsx               # profundidade no scroll do slide
│   │   └── Typewriter.tsx             # texto digitado caractere a caractere
│   │
│   ├── player/                        # chrome e mecânica do player
│   │   ├── Fragment.tsx               # progressive disclosure por keyboard nav
│   │   ├── SlideTransition.tsx        # fade | slide | zoom | none
│   │   ├── ProgressBar.tsx
│   │   ├── KeyboardNav.tsx
│   │   └── SpeakerNotes.tsx           # painel para apresentador (V2+)
│   │
│   └── theme/
│       ├── base.css                   # design system CodeWiki dark-native
│       │                              # tipografia, ritmo, espaçamento, cores neutras
│       └── vars.ts                    # whitelist de CSS variables override-áveis
│
content/presentations/
└── <slug>/
    ├── presentation.mdx               # ou slides/01-intro.mdx, slides/02-...
    ├── theme.css                      # opcional — override de variáveis permitidas
    └── components/                    # componentes locais desta apresentação
        ├── ParticleField.tsx
        ├── TokenStream.tsx
        └── AnimatedTimeline.tsx
```

### Regras invioláveis

**R1 — Base imutável.**
O design system em `slide-kit/theme/base.css` define tipografia (família, escala, line-height), ritmo vertical, espaçamento, cores neutras, comportamento de foco e estados. Nenhuma apresentação pode sobrescrever esses valores. Override de tipografia ou espaçamento é bug.

**R2 — Tema por apresentação varia só variáveis permitidas.**
`slide-kit/theme/vars.ts` exporta a lista fechada de CSS variables que `theme.css` da apresentação pode redefinir. Sugestão inicial:

```ts
export const ALLOWED_THEME_VARS = [
  '--accent',           // cor de destaque primária
  '--accent-soft',      // versão suave do accent (10-20% opacity)
  '--accent-glow',      // glow/shadow do accent
  '--font-display',     // família para títulos (subset de variáveis pré-aprovadas)
  '--gradient-stop-1',  // gradientes de background customizáveis
  '--gradient-stop-2',
] as const;
```

Build do `apps/web` lê `content/presentations/<slug>/theme.css`, faz parse, valida que toda regra é override de variável da whitelist. Variável fora da lista falha o build com mensagem clara.

**R3 — Componentes locais são livres mas escopados.**
`content/presentations/<slug>/components/*.tsx` pode declarar qualquer componente React. **Mas:**

- Esses componentes só são importáveis pelos MDX da mesma apresentação. Rota de import qualificada via convenção (`./components/X` resolvido pelo loader contra `content/presentations/<slug>/components/`).
- Não podem importar de fora de `slide-kit/`, da sua própria pasta `components/`, e de uma whitelist de bibliotecas (`framer-motion`, `lucide-react`, `react`). Acesso a `apps/web/lib`, `next/headers`, ou qualquer módulo de infraestrutura é proibido. Enforced via ESLint rule custom + revisão de PR.
- Não podem ter side effects fora de renderização (sem `fetch`, sem `localStorage`, sem `document.cookie`). Animação visual e estado local são OK.

**R4 — Animação é primitiva first-class.**
Apresentações **não escrevem `motion.div` direto**. Usam os componentes de `slide-kit/animations/`. Isso garante:

- API uniforme (`<FadeIn delay={200} duration={400}>...</FadeIn>`).
- Respeito automático a `prefers-reduced-motion` (componentes lidam internamente).
- Performance previsível (lazy import quando primitiva entra no viewport).
- Composabilidade (`<Stagger><FadeIn>...</FadeIn>...</Stagger>` é a forma canônica).

Componente local pode internamente usar `framer-motion` cru se precisar de animação fora do vocabulário das primitivas — mas é decisão pontual, não default.

**R5 — Fragmentos e transições são do player, não do slide.**
Progressive disclosure (`<Fragment index={1}>...`) e transição entre slides (`<SlideTransition kind="magic-move">`) vivem em `slide-kit/player/` e integram com `KeyboardNav`. Slide não decide como avança; só declara o que aparece e em que ordem.

**R6 — Diagramas via Mermaid são primeira-classe.**
A referência analisada usa Mermaid. É padrão de fato em apresentações técnicas. `<Diagram>` do `slide-kit/primitives/` aceita Mermaid como input (renderizado server-side para evitar FOUC e ganhar SEO). Fluxogramas, sequência, gantt, classe — todos pelo mesmo componente.

**R7 — Acessibilidade não é opcional.**
- `<Image>` exige `alt`.
- `<Embed>` exige descrição textual quando o conteúdo for não-textual.
- Toda animação respeita `prefers-reduced-motion: reduce` (cai pra estado final imediato).
- Navegação por teclado obrigatória (player já cobre).
- Contraste WCAG AA mínimo testado em CI.

### Catálogo inicial (commit zero)

Primeiras apresentações reais (V1) só precisam de um subset. Catálogo arranca com:

**Primitives:** `CodeBlock`, `Callout`, `Image`, `Quote`, `Embed`, `Diagram`, `TwoColumn`, `Centered`.
**Animations:** `FadeIn`, `SlideIn`, `Stagger`, `Reveal`, `MagicMove`.
**Player:** `Fragment`, `SlideTransition`, `ProgressBar`, `KeyboardNav`.

`Grid`, `Parallax`, `Typewriter`, `Icon`, `SpeakerNotes` entram conforme primeira apresentação precisar. Adições ao catálogo base passam por PR; revisão atenta a "isso é genuinamente reusável ou é demanda local disfarçada de primitiva?".

### Exemplo de uso

```mdx
---
slug: llms-internals
title: Como LLMs realmente funcionam
---

import { TokenStream } from './components/TokenStream';

<Centered>
  <FadeIn>
    # Como LLMs realmente funcionam
  </FadeIn>
  <FadeIn delay={300}>
    *Uma jornada de tokens até resposta*
  </FadeIn>
</Centered>

---

<Stagger gap={150}>
  <Callout type="info">Atenção é o ingrediente central.</Callout>
  <TokenStream tokens={['The', 'cat', 'sat']} />
  <Fragment index={1}>
    <CodeBlock language="python" highlight={[3, 4]}>
      {`def attention(q, k, v):
    scores = q @ k.T
    weights = softmax(scores)
    return weights @ v`}
    </CodeBlock>
  </Fragment>
</Stagger>
```

`TokenStream` mora em `content/presentations/llms-internals/components/TokenStream.tsx`, é específico desta apresentação, não polui o catálogo global. Tudo o mais (`Centered`, `FadeIn`, `Stagger`, `Callout`, `Fragment`, `CodeBlock`) vem do `slide-kit`.

## Justificativa

**Por que dois níveis (base + locais), não um:**
Catálogo único força o ritmo "primeiro adiciono ao catálogo, depois uso". Para componente que será usado uma única vez, isso é overengineering — e desincentiva o uso criativo que gera "wow". Permitir componente local, escopado e revisado por PR, dá expressividade sem perder consistência da base.

**Por que animação como primitiva, não API livre do Framer Motion:**
`motion.div` é poderoso e perigoso na mão errada. Animações inconsistentes (uma apresentação com `duration: 0.2` ease-in, outra com `duration: 0.8` spring) corroem a sensação de "produto coeso". Primitivas absorvem decisão de timing/easing dentro do vocabulário; autor escolhe **o quê** animar, não **como**. Respeito automático a `prefers-reduced-motion` é benefício adicional não-negociável.

**Por que tema só via whitelist de variáveis:**
"Cada apresentação muda accent color" cobre 90% do desejo legítimo de personalização (vide Reveal.js themes). Liberar CSS livre cobriria 100%, mas abriria porta pra "esta apresentação tem fonte serif", "esta apresentação tem fundo claro" — variação que desfaz a identidade do catálogo. A whitelist é o ajuste fino entre liberdade e disciplina.

**Por que Mermaid:**
Apresentações técnicas têm fluxogramas e sequência o tempo todo. Sem Mermaid no catálogo, autor cola screenshot — perde acessibilidade, perde SEO, perde possibilidade de animar. Render server-side resolve FOUC e mantém o slide indexável.

**Por que Fragment e SlideTransition no player, não nos slides:**
Progressive disclosure precisa coordenar com keyboard nav (avançar slide ou avançar fragment?). Transição entre slides precisa saber sobre os dois slides envolvidos. Isso é responsabilidade do player. Slide só declara `<Fragment index={1}>` — semântica, não mecânica.

**Por que V1 (autor único) tolera componentes locais com gate só de PR:**
Mantenedor é o único autor; PR review é a malha de qualidade. Custo zero de governança extra. A decisão "V3 reabre componentes locais externos" é deliberada — quando aparecer autor externo, gating muda de natureza (sandboxing, lista pré-aprovada, ou proibição total). Antes disso, é problema imaginário.

## Consequências

### Positivas

- Catálogo coerente desde o primeiro slide publicado, sem disciplina humana ad-hoc.
- "Wow" possível por apresentação sem permitir caos visual.
- Animação consistente em timing, easing e acessibilidade.
- SEO preservado (tudo renderiza no server, sem iframe, sem hidratação que esconde conteúdo).
- Caminho para CMS na Fase 3 já implícito: editor MDX referencia catálogo conhecido; primitivas viram blocos selecionáveis.
- Caminho para narração V2: cada primitiva pode declarar `getNarratable(): string` para extrair o texto narrável.

### Negativas

- Build do `apps/web` precisa de loader custom para resolver imports de `./components/*` em MDX relativo à apresentação. Trabalho de infra na Fase 0–1.
- ESLint rule custom para bloquear imports proibidos em `content/presentations/<slug>/components/` exige escrita. Não trivial.
- Renderização de Mermaid server-side em ambiente Node + Next.js exige cuidado (pacote `@mermaid-js/mermaid-cli` ou `@svgdotjs/svg.js` — decidir na implementação).
- Lista de CSS variables permitidas é decisão estética que precisa de revisão consciente — exposição de mais variáveis = mais churn de design system.

### Riscos

- **Catálogo inicial vira primeira ofensa do escopo.** Tentação de adicionar primitivas "porque uma apresentação precisou" antes de provar reuso. Mitigação: regra "três usos justificam primitiva; antes disso, mora em `components/` local".
- **Apresentações migram performance ruim do `framer-motion` server-side render mismatches.** Mitigação: testar cada primitiva com SSR + hydration no CI.
- **V3 multi-autor explode o modelo de componentes locais.** Risco conhecido e deliberadamente postergado.

## Decisões reabertas em V3 (multi-autor)

Quando autores externos entrarem no produto, este ADR precisa ser revisado pelo menos em três pontos:

1. **Componentes locais por autor externo são risco de segurança** (XSS, data exfiltration, side effects). Caminhos possíveis: sandboxing via iframe + postMessage; lista global pré-aprovada; proibição total e migração das apresentações existentes para usar só primitivas.
2. **Tema livre por autor externo é risco de drift estético.** Whitelist atual pode precisar encolher (menos variáveis) ou ser modulada por nível de confiança do autor.
3. **Curadoria visual** vira pauta de produto (revisão estética antes de publicar?).

Tudo isso fica explicitamente fora de escopo até V3. Hoje seria adivinhação.

## Opções rejeitadas

- **Catálogo fechado puro (opção 1).** Mata "wow" por apresentação. Erro de subestimar o caráter editorial do produto.
- **MDX permissivo com imports controlados (opção 2).** Sem governança real: qualquer componente de `apps/web` fica disponível, incluindo coisas que não são do vocabulário do slide. Sem ganho frente à opção 4.
- **MDX livre (opção 3).** Caos visual garantido; surface área de segurança absurda em V3.
- **Reveal.js embarcado.** Reabre ADR-0002, quebra SEO, duplica camadas de hidratação.
- **Slidev como base.** Vue + Markdown — fora do ecossistema React/Next.js já decidido.
- **Spectacle como base.** React puro, mas é app standalone, não componível dentro de um catálogo Next.js com SSR.
- **Animação via `framer-motion` cru (sem primitivas).** Inconsistência inevitável; perda de garantia de `prefers-reduced-motion`.

## Referências

- [Reveal.js](https://revealjs.com/) — fonte de inspiração para fragments, transições e tema por CSS variables.
- [Slidev](https://sli.dev/) — validação do modelo "markdown + componentes registrados" para apresentações técnicas (em Vue).
- [Spectacle](https://commerce.nearform.com/open-source/spectacle/) — validação React do mesmo padrão.
- [Framer Motion](https://www.framer.com/motion/) — biblioteca base das primitivas de animação.
- [Mermaid](https://mermaid.js.org/) — diagramas declarativos.
- [Apresentação de referência: palestra-sdd (Glaucia Lemos)](https://glaucia86.github.io/palestra-sdd/?lang=pt-BR).
