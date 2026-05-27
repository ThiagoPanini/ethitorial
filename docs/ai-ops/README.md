# AI-ops

Registros narrativos do que a IA (em sessão com operador humano) fez em operações reais do projeto. Cada documento aqui é um relato situado: máquina concreta, data concreta, decisões com nomes próprios, obstáculos encontrados, resoluções aplicadas, dívidas deixadas.

ai-ops é o oposto de [lessons](../lessons/): lá vivem conceitos evergreen aplicáveis a qualquer projeto; aqui vive a história específica desta operação neste momento. Para reproduzir um procedimento, use um [guide](../guides/). Para operar dia a dia, use um [runbook](../runbooks/). Para entender por que um conceito existe, use uma [lesson](../lessons/).

## Quando escrever um ai-ops

Sempre que uma operação IA + humano produzir mudança real em infra, dado ou configuração que valha auditoria posterior. Indicadores típicos:

- Mudou estado de produção (VPS, DNS, banco, secrets, deploys).
- Tomou decisão não óbvia em runtime que mereça contexto futuro.
- Encontrou obstáculo, surpresa ou divergência com documentação prévia.
- Deixou dívida explícita (item adiado, próximo passo, premissa frágil).

Não escrever ai-ops para conversas exploratórias, refatorações triviais ou tarefas puramente locais sem impacto observável.

## Convenção de nome

`YYYYMMDD-slug.md`

- `YYYYMMDD` = data UTC da operação (sort por nome = sort cronológico).
- `slug` = curto, kebab-case, identifica máquina ou subsistema + ação. Ex: `20260524-hardening-talkingpres-prod`.
- Se houver duas operações no mesmo dia no mesmo subsistema, suffixar `-01`, `-02`.

## Frontmatter padrão

```yaml
---
data: 2026-05-24
operacao: hardening da VPS de produção
maquina: talkingpres-prod (203.0.113.42)
operador: Thiago Panini
agente: Claude Code
resultado: parcial
dividas:
  - admin Coolify não criado (aguarda CLI Bitwarden)
  - proxy Traefik não confirmado em execução
referencias:
  lesson: ../lessons/0001-hardening-de-vps-linux.md
  guide: ../guides/0001-criar-vps-hostinger-com-coolify.md
  adr: ../adr/0003-infra-hostinger-vps-coolify.md
---
```

Campo `resultado` aceita `success`, `parcial`, `blocked`. Campo `dividas` lista itens em prosa curta; cada um deve mapear para issue ou para próxima ai-ops planejada.

## Estrutura recomendada do corpo

1. **Cenário** — estado inicial: máquina, ferramentas, contexto da sessão.
2. **Execução** — o que foi feito em ordem cronológica. Comandos reais (com placeholders de segredo), saídas reais (truncadas se grandes), decisões em runtime.
3. **Obstáculos e resoluções** — surpresas que apareceram, diagnóstico aplicado, escolha tomada.
4. **Resultado** — estado final observável, evidência verificável.
5. **Dívidas** — o que ficou pendente, por quê, próximo passo previsto.

Tom narrativo, primeira pessoa do plural ("criamos", "encontramos", "decidimos"), específico, sem abstração. Quem lê precisa entender o que aconteceu naquela sessão sem precisar reconstruir contexto.

## Lista

- [2026-05-24 — Setup inicial da VPS talkingpres-prod com template Coolify](0001-setup-inicial-talkingpres-prod.md)
- [2026-05-24 — Hardening base da VPS talkingpres-prod](0002-hardening-talkingpres-prod.md)
