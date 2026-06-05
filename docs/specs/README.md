# Specs (PRD-lite)

Specs leves de feature — o **destino** de uma funcionalidade: o que construir, critério de aceite e a lista de **vertical slices** que o agente implementa em modo AFK. Ver [ADR-0017](../adr/0017-desenvolvimento-autonomo-afk.md).

Um spec **não** é uma decisão arquitetural (isso é [ADR](../adr/)), nem um conceito (isso é [lesson](../lessons/)), nem um procedimento já executado (isso é [guide](../guides/)). É o briefing curto que transforma um alinhamento (via `grill-me`/`grill-with-docs`) em fatias implementáveis.

## Quando criar um spec

- Antes de implementar uma feature da Fase 1+ que tem mais de uma fatia vertical.
- Depois que o *o quê* já está alinhado com o operador (borda HITL de entrada do ADR-0017). Não use spec para descobrir o que construir — use o grilling para isso.

Criação é **lazy**: nasce quando a feature começa, não antes. Feature de uma fatia só (raro) pode pular o spec e virar sub-bullet do ROADMAP direto.

## Formato

Cada spec deve manter:

- YAML frontmatter (`numero`, `titulo`, `status`, `data`, `fase`, `boundary`)
- `## Objetivo` — uma frase: o que o usuário ganha quando isto existir
- `## Critério de aceite` — lista verificável; é o "verde" de cada fatia
- `## Vertical slices` — lista ordenada de tracer bullets (schema → API → UI → testes → e2e), cada um entregável e verificável sozinho
- `## Fora de escopo` — o que esta feature explicitamente NÃO faz (evita scope creep do agente AFK)
- `## Notas` (opcional) — links para CONTEXT.md, ADRs e o grilling de origem

## Como criar um novo spec

1. Copie o spec mais recente como template (ou o bloco abaixo, se for o primeiro).
2. Numere sequencialmente: `NNNN-titulo-em-kebab.md`.
3. Cada slice deve atravessar todas as camadas relevantes e ter seu próprio critério de aceite. Se uma slice só toca uma camada, ela está horizontal — refatore.
4. Linke daqui na lista abaixo.

### Template

```markdown
---
numero: 0001
titulo: <feature em uma linha>
status: draft        # draft | em-progresso | concluído
data: AAAA-MM-DD
fase: 1
boundary: catalog    # catalog | identity | engagement | narration | shared | platform
---

# Spec 0001 — <título>

## Objetivo
<uma frase: o valor para o usuário>

## Critério de aceite
- [ ] <condição verificável>
- [ ] <condição verificável>

## Vertical slices
1. **<nome da fatia>** — schema → API → UI → testes. Aceite: <como sei que fechou>.
2. **<nome da fatia>** — ...

## Fora de escopo
- <o que NÃO entra aqui>

## Notas
- Domínio: ver [CONTEXT.md](../CONTEXT.md)
- Decisões relacionadas: [ADR-XXXX](../adr/XXXX-...md)
```

## Lista

- [0001 — Cadeia `with_sources` ponta-a-ponta (Courses → aihero.dev → Post)](0001-cadeia-with-sources-aihero.md) — primeira fatia da Fase 1; catálogo MDX-native ([ADR-0018](../adr/0018-catalogo-mdx-native-na-fase-1.md))
