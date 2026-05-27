# Lessons

Aulas conceituais e evergreen sobre temas relevantes ao trabalho no projeto. Cada lição explica **o que precisa ser entendido** sobre um tema (princípios, trade-offs, vocabulário), sem se prender a um nome de máquina, um IP específico ou uma decisão de runtime.

Lições não são receita executável. Para reproduzir um procedimento passo a passo, use um [guide](../guides/). Para operar dia a dia, use um [runbook](../runbooks/). Para o registro narrativo do que efetivamente foi feito em uma operação específica (com nomes, datas, obstáculos reais), use um [ai-ops](../ai-ops/).

## Como escolher entre os quatro gêneros

| Pergunta que o documento responde | Onde escrever |
|---|---|
| "Por que tomamos essa decisão arquitetural?" | **ADR** (`docs/adr/`) |
| "O que preciso entender sobre X?" (conceitos, princípios, evergreen) | **Lesson** (`docs/lessons/`) |
| "Como faço X agora?" (receita reproduzível) | **Guide** (`docs/guides/`) |
| "Que comandos rodo para operar X no dia a dia?" | **Runbook** (`docs/runbooks/`) |
| "O que a IA + operador fizeram em X data, com que resultado?" | **AI-ops** (`docs/ai-ops/`) |

## O que uma lição NÃO contém

- Nomes próprios de máquinas, IPs, fingerprints, paths específicos do projeto. Use placeholders genéricos (`<NOME_VPS>`, `<USUARIO_OPERACIONAL>`).
- Narrativa de execução ("criamos", "encontramos"). Use modo declarativo ou imperativo abstrato.
- Decisões situadas de runtime. Essas vivem em ai-ops.
- Estado pendente do projeto. Esse vive em ai-ops ou no ROADMAP.

Se você está escrevendo "decidimos usar X em vez de Y porque o cluster Z tinha problema W", você está escrevendo ai-ops, não lesson. Se você está escrevendo "X e Y são duas abordagens; X é preferível quando A, Y quando B", você está escrevendo lesson.

## Lista

- [0001 — Hardening de VPS Linux: conceitos, princípios e cada decisão da base](0001-hardening-de-vps-linux.md)
- [0002 — Harness básico de planejamento sobre um board de issues: partição, autonomia assimétrica e modos de falha](0002-harness-basico-em-github-projects.md)
