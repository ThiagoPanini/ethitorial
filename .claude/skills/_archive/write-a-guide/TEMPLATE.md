# TEMPLATE — estrutura canônica de um guide

Este documento especifica a estrutura completa que todo guide em `docs/guides/` deve seguir. Para aplicações vivas pós-correções, veja `docs/guides/0001-criar-vps-hostinger-com-coolify.md` e `docs/guides/0002-configurar-cloudflare-r2-mcp.md` no repositório talkingpres.

## Template copy-paste

Cole isso como ponto de partida e preencha cada `{{placeholder}}`. Não pule seções; se uma seção não se aplica, escreva uma frase justificando ao invés de deletar.

````markdown
---
title: {{Nome da operação em ação direta — ex: "Criar conta Cloudflare e preparar DNS, R2 e MCP"}}
description: {{Uma frase descrevendo o que entra no escopo + o que produz como resultado}}
nav_title: {{Nome curto para navegação — 2-4 palavras}}
---

{{Parágrafo 1 — onde este guide se encaixa na trilha real do projeto. Sempre referenciar trilha + ai-ops anterior se houver.}}

{{Parágrafo 2 — escopo declarado: o que ESTÁ no guide e o que NÃO está. Sempre incluir um "não" explícito para evitar inflar expectativa.}}

> ⚠️ **Bootstrap, não runbook.** {{frase explicando que este guide é para uma transição única, não operação cotidiana. Sempre presente em guides de infra/credencial/borda.}}

> 💡 **Alternativa estrutural considerada: {{Alternativa}}.** {{Parágrafo curto reconhecendo alternativa séria considerada (Cloudflare Tunnel, install manual, outro provedor) e justificando por que o caminho do guide foi escolhido. Inclua link para ADR onde a decisão é registrada.}}

## Example

Como exemplo, vamos {{descrição concreta do que vai ser feito usando placeholders específicos}}. O resultado esperado é: {{descrição do estado final}}.

Pré-condições:

- **Ambiente local POSIX:** shell `bash`/`zsh` com `{{ferramentas locais necessárias, ex: ssh, dig, curl}}`. Em Windows, use WSL2 (`wsl --install` no PowerShell admin) ou Git Bash. {{Ressalva específica se uma ferramenta crítica não existe no Windows nativo.}}
- {{Pré-condição de guide anterior, ex: "[Guide 0001](0001-...) concluído"}}
- {{Recurso externo necessário, ex: "Conta Cloudflare com payment method confirmado"}}
- {{Gerenciador de segredos com handles esperados}}
- Placeholders anotados em `~/secrets/talkingpres-bootstrap.md`: `<PLACEHOLDER1>`, `<PLACEHOLDER2>`, `<PLACEHOLDER3>`.

### Passo 1: {{Verbo no infinitivo + objeto — ex: "Criar conta Cloudflare e ativar a zona"}}

{{Parágrafo de contexto curto — 1-2 frases — explicando o que este passo entrega.}}

{{Lista, comando ou tabela com a ação concreta. Sempre placeholders em <MAIUSCULAS>.}}

```bash
{{comandos com placeholders, nunca valores reais}}
```

{{Proof observável — "Resultado esperado: ..."}}

```text
{{saída esperada, truncada se grande}}
```

> ⚠️ **Armadilha: {{nome curto da armadilha}}**
>
> {{descrição do erro comum}}
>
> **Sintoma:** {{o que o operador observa}}
>
> **Resolução:** {{o que fazer}}

> ✅ **Checkpoint do Passo 1 — não avance sem confirmar:**
>
> - [ ] {{check observável 1}}
> - [ ] {{check observável 2}}
> - [ ] {{check observável 3}}
>
> Se algum item falhar, **pare aqui**. {{frase explicando por que avançar com falha aqui é caro.}}

### Passo 2: {{Verbo + objeto}}

{{Padrão repetido. Para passos com risco de auto-bloqueio (sshd, firewall), usar Terminal A/B explícito:}}

No **Terminal A**, {{ação A}}:

```bash
{{...}}
```

No **Terminal B**, {{prova que caminho novo funciona antes de fechar A}}:

```bash
{{...}}
```

{{Para passos que criam credencial ou config local sensível:}}

> 💡 **Para operadores AI autônomos sem GUI de gerenciador de segredos**
>
> {{Descrição da credencial criada e por que precisa ir direto ao cofre.}}
>
> - **Se você tem CLI de gerenciador de segredos** (`bw`, `op`, Vault CLI): {{receita CLI}}.
> - **Se você não tem CLI configurada**: pare aqui. Peça ao humano ou configure CLI antes de prosseguir.

{{Para passos que tocam firewall/origem:}}

#### Validação externa tripla obrigatória

> ⚠️ **Armadilha: validação local não prova fechamento global**
>
> {{Explicar por que único curl do laptop é insuficiente.}}

**Validação A — {{vantage point local}}:**

```bash
{{comando}}
```

**Validação B — {{vantage point bypass DNS, geralmente curl --resolve}}:**

```bash
{{comando}}
```

**Validação C — vantage point externo independente:**

{{Opções em ordem de preferência: outra máquina, dados móveis, check-host.net.}}

> ✅ **Critério de {{X}}:** as **três** validações {{passam/falham}} conforme esperado.

### Passo 3: {{Verbo + objeto}}

{{...}}

### Passo 4: {{Verbo + objeto, último passo}}

{{Se o passo cria arquivo de config local com segredo, sempre incluir `.gitignore` step antes:}}

Antes de criar qualquer arquivo `{{config-file}}`, garanta que ele não vá parar no git:

```bash
echo '{{config-file}}' >> .gitignore
git add .gitignore
git commit -m "chore: ignore local {{tipo}} config"
```

> 💡 **Localização alternativa fora do repo**
>
> Se preferir manter zero risco de versionamento acidental, coloque a config em `~/.config/{{path}}` ou equivalente do seu cliente. Diretórios fora do repo evitam qualquer chance de `git add .` acidental capturar a credencial.

{{Para passos que validam guardrails (ex: MCP, agentes com escopo limitado):}}

> 🎯 **Proof positiva da guardrail "{{nome}}"**
>
> {{Descrição de como o operador valida positivamente que a guardrail funciona, não apenas que está declarada.}}
>
> **Comportamento esperado:** {{o que deve acontecer}}
>
> {{Se a guardrail falhar — o que fazer.}}

## Critério de sucesso

Considere este guide concluído apenas se todos os checks passarem:

- {{Check objetivo 1, com comando esperado de validação}}
- {{Check objetivo 2}}
- {{Check objetivo 3}}
- {{Se aplicável: "Validação externa tripla concluída — todas as três falham/passam conforme esperado"}}
- {{Se aplicável: "Credenciais armazenadas em gerenciador de segredos, sem escala em buffer transitório"}}
- {{Se aplicável: "Tokens de setup têm TTL definido e estão registrados para revogação"}}

## Next steps

{{Parágrafo curto descrevendo o que este guide habilita.}}

Próximo:

- [{{Próximo guide ou explicação de por que aguarda}}]({{caminho}})
- [Runbook de operação relacionado]({{caminho}})
- [ADR relevante]({{caminho}}) — {{relação}}

## References

- [{{Doc oficial 1}}]({{url}}) — {{quando consultar}}
- [{{Doc oficial 2}}]({{url}})
- [{{Ferramenta auxiliar}}]({{url}}) — {{relação ao guide}}
````

## Especificação seção-a-seção

### Frontmatter (3 campos canônicos)

Mantém o padrão da skill canônica `write-guide`. Não introduzir campos novos sem decisão registrada.

| Campo | Conteúdo | Exemplo |
|---|---|---|
| `title` | Nome da operação em ação direta | `Criar conta Cloudflare e preparar DNS, R2 e MCP` |
| `description` | Frase descrevendo escopo e resultado | `Cria a conta Cloudflare, ativa a zona do domínio, publica o Coolify por subdomínio proxied, fecha a origem com validação externa tripla...` |
| `nav_title` | Nome curto para navegação | `Cloudflare + R2 + MCP` |

Versionamento de afirmações que envelhecem ficou em aberto após o último ciclo de revisão. Por enquanto, não adicionar `versao`/`validade` (quebraria consistência com a skill `write-guide` canônica). Reabrir se virar decisão consciente.

### H1 e intro

H1 = exatamente o `title` do frontmatter, sem prefixo "Guide NNNN —" (guides usam `nav_title` para identificação curta, não H1 elaborado).

Intro tem 2-3 parágrafos:

1. Onde este guide se encaixa na trilha real do projeto. Referenciar ai-ops anterior se já houver.
2. Escopo declarado: o que entra E o que **não** entra. Sempre incluir um "não" explícito.
3. (Opcional) Contexto operacional adicional.

### Callouts de abertura

Dois callouts canônicos no topo de quase todo guide:

**Bootstrap callout** — obrigatório para guides de infra/credencial/borda:

```markdown
> ⚠️ **Bootstrap, não runbook.** {{frase explicando que é transição única, não operação cotidiana. Linkar para runbook se existir.}}
```

**Alternativa estrutural callout** — obrigatório quando há alternativa séria considerada e rejeitada:

```markdown
> 💡 **Alternativa estrutural considerada: {{Alternativa}}.** {{Por que a alternativa é séria.}}
>
> {{Por que o caminho deste guide foi escolhido.}}
>
> {{Link para ADR onde a decisão deve ser revisitada.}}
```

Exemplos vividos no guide 0002: Cloudflare Tunnel vs. caminho convencional.

### `## Example` e pré-condições

`## Example` sempre presente. Padrão:

```markdown
Como exemplo, vamos {{descrição concreta com placeholders específicos}}. O resultado esperado é: {{estado final}}.

Pré-condições:

- **Ambiente local POSIX:** shell `bash`/`zsh` com `{{tools}}`. Em Windows, WSL2 ou Git Bash. {{Ressalvas específicas.}}
- {{Pré-condição de guide anterior linkado, se houver}}
- {{Recursos externos: contas, payment methods, acessos}}
- {{Gerenciador de segredos pronto com handles esperados}}
- Placeholders anotados em `~/secrets/talkingpres-bootstrap.md`: `<PLACEHOLDER1>`, ...
```

**Ambiente local POSIX** é primeira pré-condição obrigatória para qualquer guide com comandos locais. Mencionar WSL2 para Windows.

**Payment method / billing** deve ser pré-condição explícita quando o provedor exige (caso R2).

### Passos (2-4)

Cada `### Passo N: {{Verbo + objeto}}` segue ciclo:

1. **Contexto curto** (1-2 frases) — o que este passo entrega.
2. **Ação concreta** — comando, lista de cliques de UI, ou tabela de configurações.
3. **Friction esperada** — callout `> ⚠️ Armadilha` quando aplicável.
4. **Resolução** — embutida na armadilha ou em prosa após o comando.
5. **Proof observável** — saída esperada (`Resultado esperado:` em texto + bloco `text` com saída).
6. **Checkpoint fechado** — `> ✅ Checkpoint do Passo N` quando passo é arriscado (auto-bloqueio, credencial criada, mudança de DNS/firewall).

**Heading do passo** sempre em verbo no infinitivo + objeto: "Criar conta Cloudflare", "Auditar o template", "Fechar a origem". Não usar "Sobre criação" ou "Conceito de auditoria".

**Granularidade**: cada passo cobre **uma** sub-operação coerente. Se um passo tem 5+ sub-operações distintas, dividir em `Passo Na` e `Passo Nb` (exemplo: guide 0002 Passo 2 foi dividido em 2a "publicar" e 2b "fechar origem").

### Os quatro callouts canônicos

#### `> ⚠️ Armadilha` — para erros comuns

```markdown
> ⚠️ **Armadilha: {{nome curto}}**
>
> {{descrição}}
>
> **Sintoma:** {{o que o operador observa}}
>
> **Resolução:** {{o que fazer}}
```

#### `> 💡 Princípio` — para regras operacionais ou heurísticas

```markdown
> 💡 **{{Princípio nomeado}}**
>
> {{descrição da heurística com aplicabilidade clara}}
```

#### `> 🎯 Teste / Proof positiva` — para validação ativa de guardrail

```markdown
> 🎯 **{{Nome do teste}}**
>
> {{instrução do teste}}
>
> **Comportamento esperado:** {{...}}
>
> {{Se falhar — o que fazer.}}
```

#### `> ✅ Checkpoint fechado` — para fim de passos arriscados

```markdown
> ✅ **Checkpoint do Passo N — não avance sem confirmar:**
>
> - [ ] {{check 1}}
> - [ ] {{check 2}}
>
> Se algum item falhar, **pare aqui**.
```

### Padrões obrigatórios por contexto

#### Quando o passo tem risco de auto-bloqueio (sshd, ufw, sudoers)

Sempre usar labels **Terminal A** (sessão de vida) e **Terminal B** (validação) explicitamente.

```markdown
No **Terminal A**, mantenha a sessão `root` original aberta. Execute:

\`\`\`bash
{{comando arriscado}}
\`\`\`

No **Terminal B**, prove o caminho novo antes de fechar a sessão do Terminal A:

\`\`\`bash
{{validação}}
\`\`\`

Se o Terminal B não funcionar, pare aqui. Não feche o Terminal A.
```

#### Quando o passo cria credencial

Sempre incluir bloco "Para operadores AI autônomos sem GUI":

```markdown
> 💡 **Para operadores AI autônomos sem GUI de gerenciador de segredos**
>
> {{Credencial criada e por que precisa ir direto ao cofre.}}
>
> - **Se você tem CLI de gerenciador de segredos** (`bw`, `op`, Vault CLI): {{receita CLI mínima}}.
> - **Se você não tem CLI configurada**: pare aqui. Peça ao humano ou configure CLI antes de prosseguir. Não gere senha em buffer próprio.
```

#### Quando o passo cria arquivo de config local com possível segredo

Sempre incluir `.gitignore` step antes:

```markdown
Antes de criar `{{config-file}}`, garanta que ele não vá parar no git:

\`\`\`bash
echo '{{config-file}}' >> .gitignore
git add .gitignore
git commit -m "chore: ignore local {{tipo}} config"
\`\`\`

> 💡 **Localização alternativa fora do repo**
>
> Se preferir zero risco, coloque a config em `~/.config/{{path}}` ou equivalente.
```

#### Quando o passo fecha origem (firewall, DNS, TLS)

Sempre exigir validação externa tripla:

```markdown
#### Validação externa tripla obrigatória

> ⚠️ **Armadilha: validação local não prova fechamento global**
>
> {{Por que único curl é insuficiente.}}

**Validação A — {{vantage point local}}:**
**Validação B — {{vantage point bypass DNS}}:**
**Validação C — vantage point externo independente:**

> ✅ **Critério:** as **três** validações {{passam/falham}} conforme esperado.
```

#### Quando o sistema é multi-actor (TLS three-sided, proxy chain)

Incluir mini-diagrama ASCII:

````markdown
```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Cliente    │ <-> │  Intermediário│ <-> │    Origem    │
└──────────────┘     └──────────────┘     └──────────────┘
       ↑ Camada A          ↑ Camada B           ↑ Camada C
```

- **Camada A** — {{descrição}}.
- **Camada B** — {{...}}.
- **Camada C** — {{...}}.
````

#### Quando há estado travado conhecido (zona Pending, deploy stuck)

Sempre incluir diagnostic block:

```markdown
> ⚠️ **Se {{estado}} ficar travado por mais de {{tempo}}**, diagnostique antes de assumir bug do provedor. Causas comuns:
>
> 1. **{{causa 1}}.** {{como verificar e resolver}}
> 2. **{{causa 2}}.** {{...}}
> 3. **{{causa 3}}.** {{...}}
>
> Diagnóstico rápido: {{comando único que distingue causas}}.
```

#### Quando o comando Unix retorna em silêncio

Sempre adicionar nota "silêncio = sucesso":

```markdown
> 💡 **`{{comando}}` retorna silêncio quando passa.** Exit code `0` e nenhuma saída significam config válida. Qualquer linha impressa é erro a corrigir.
```

### Critério de sucesso (obrigatório)

Sem critério, o guide é receita aberta — usuário não sabe declarar "feito". Sempre presente, sempre no fim antes de `Next steps`.

Padrão:

```markdown
## Critério de sucesso

Considere este guide concluído apenas se todos os checks passarem:

- {{Check objetivo 1, com comando explícito}}
- {{Check objetivo 2}}
- {{Check objetivo 3}}
- {{Se validação tripla: enumerar as três}}
- {{Se credencial criada: confirmar armazenamento correto}}
- {{Se tokens de setup: confirmar TTL definido}}
```

Cada check tem que ser **objetivo** — comando, presença observável, ou estado verificável. Não "sente que está pronto" ou "parece ok".

### Next steps

Padrão:

```markdown
## Next steps

{{Parágrafo curto explicando o que este guide habilita.}}

Próximo:

- [{{Próximo guide OU explicação de por que aguarda}}]({{caminho}})
- [Runbook relacionado]({{caminho}})
- [ADR relevante]({{caminho}}) — {{relação}}
```

Se o próximo passo lógico ainda não tem guide escrito porque depende de recurso inexistente, dizer isso explicitamente em vez de linkar caminho fantasma.

### References

Padrão:

```markdown
## References

- [{{Doc oficial}}]({{url}}) — {{quando consultar}}
- [{{...}}]({{url}})
```

Sempre referenciar documentação oficial dos provedores usados. Adicionar projetos auxiliares (ufw-docker, mcp-remote) quando o guide os usa.

## Convenções de comando e proof

- **Comandos** em bloco `bash`. Sempre com placeholders `<MAIUSCULAS>` para valores variáveis.
- **Saída esperada** em bloco `text`, precedida por "Resultado esperado:" em prosa.
- **JSON exemplares** em bloco `json`. Strings sensíveis com `<PLACEHOLDER>`.
- **Trechos de config** em bloco do tipo apropriado (`sshconfig`, `ini`, `yaml`).

## Checklist final antes de apresentar

- [ ] Frontmatter `title` / `description` / `nav_title` preenchido
- [ ] Intro com 2-3 parágrafos declarando escopo + "não" explícito
- [ ] Callout `> ⚠️ Bootstrap, não runbook` presente (se guide de infra/credencial/borda)
- [ ] Callout `> 💡 Alternativa estrutural` presente (se há alternativa séria considerada)
- [ ] `## Example` com pré-condições incluindo "Ambiente local POSIX"
- [ ] Payment method / billing como pré-condição quando provedor exige
- [ ] 2-4 passos progressivos com headings em verbo + objeto
- [ ] Cada passo tem contexto → ação → friction (se aplicável) → proof
- [ ] Terminal A/B labels onde há risco de auto-bloqueio
- [ ] Receita AI autônoma onde se cria credencial
- [ ] `.gitignore` step antes de criar config local com possível segredo
- [ ] Validação externa tripla onde se fecha origem
- [ ] Mini-diagrama ASCII onde há sistema multi-actor
- [ ] Diagnostic block para estados travados conhecidos
- [ ] "Silêncio = sucesso" em comandos Unix quietos
- [ ] Checkpoint fechado após passos de alto risco
- [ ] Callouts visuais (não prosa) para avisos críticos
- [ ] `## Critério de sucesso` com checks objetivos
- [ ] `## Next steps` linkando próximo passo OU explicando ausência
- [ ] `## References` com docs oficiais
- [ ] Headings em verbo no infinitivo/imperativo
- [ ] Placeholders em `<MAIUSCULAS>`
- [ ] Tom imperativo direto (não "você poderia")
