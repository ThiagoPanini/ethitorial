---
title: Configurar MCPs de infraestrutura no Claude Code, Codex e Copilot
description: Padroniza Hostinger, Coolify e Cloudflare nos três agentes locais, com .env como fonte única de segredos, allowlist por processo, versões pinadas e OAuth separado por cliente.
nav_title: MCPs multiagente
---

Este guide consolida os MCPs de infraestrutura do epistemix nos três agentes usados no VS Code: Claude Code, OpenAI Codex e GitHub Copilot Chat local. Os guides [0004](0004-configurar-hostinger-vps-mcp.md), [0005](0005-configurar-coolify-mcp.md) e [0006](0006-configurar-cloudflare-mcp.md) continuam sendo a referência de cada provedor; aqui fica a configuração cross-harness.

O desenho deliberadamente **não** configura o Copilot cloud/coding agent. Esse agente usa ferramentas autonomamente, não compartilha o `.env` local e não suporta MCP remoto autenticado por OAuth. Credenciais de produção ficam restritas aos agentes locais com confirmação de tool call.

## Example

Estado esperado:

| Cliente local | Config real | Template versionado |
|---|---|---|
| Claude Code | `.mcp.json` | `.mcp.json.example` |
| Codex CLI/IDE | `.codex/config.toml` | `.codex/config.toml.example` |
| Copilot Chat no VS Code | `.vscode/mcp.json` | `.vscode/mcp.json.example` |

Todos usam:

- `.env` como fonte única de `HOSTINGER_API_TOKEN` e `COOLIFY_ACCESS_TOKEN`;
- `scripts/run-mcp-with-env.mjs` para entregar apenas o segredo permitido a cada MCP stdio;
- `hostinger-api-mcp@0.2.5` e `@masonator/coolify-mcp@2.12.0` pinados;
- `https://mcp.cloudflare.com/mcp` com OAuth independente por cliente.

### Passo 1: Preparar a fonte única de segredos

Copie `.env.example` para `.env` e preencha exatamente:

```text
HOSTINGER_API_TOKEN=<segredo>
COOLIFY_ACCESS_TOKEN=<segredo>
```

Não use aliases nem coloque tokens nos arquivos de configuração MCP. O runner lê o `.env` sem executar seu conteúdo, remove todas as chaves do `.env` herdadas pelo processo e encaminha somente a allowlist declarada antes de `--`.

Exemplo:

```bash
node scripts/run-mcp-with-env.mjs COOLIFY_ACCESS_TOKEN -- \
  npx -y @masonator/coolify-mcp@2.12.0
```

O processo do Coolify recebe `COOLIFY_ACCESS_TOKEN`, mas não recebe `HOSTINGER_API_TOKEN`. Os MCPs rodam em `.local/mcp-runtime`, longe do `.env`, para impedir carregamento indireto por pacotes que usam `dotenv`.

### Passo 2: Materializar as três configurações locais

```bash
cp .mcp.json.example .mcp.json
cp .codex/config.toml.example .codex/config.toml
cp .vscode/mcp.json.example .vscode/mcp.json
```

Os três destinos são gitignored. Os templates são versionados e não contêm segredos.

No Codex, o projeto precisa estar confiável para carregar `.codex/config.toml`. A configuração vale para CLI e extensão IDE. No Copilot, `.vscode/mcp.json` executa no ambiente remoto do workspace WSL e disponibiliza as ferramentas no modo Agent.

### Passo 3: Autenticar Cloudflare e validar em leitura

OAuth da Cloudflare não é compartilhado entre clientes:

1. Claude Code: abra `/mcp`, conecte `cloudflare` e autorize os scopes mínimos.
2. Codex: execute `codex mcp login cloudflare` e conclua o fluxo no browser.
3. Copilot/VS Code: abra `.vscode/mcp.json`, inicie `cloudflare` e conclua o prompt de autenticação.

Valide primeiro os MCPs stdio:

```bash
node scripts/run-mcp-with-env.mjs HOSTINGER_API_TOKEN -- \
  npx -y --package hostinger-api-mcp@0.2.5 hostinger-vps-mcp

node scripts/run-mcp-with-env.mjs COOLIFY_ACCESS_TOKEN -- \
  npx -y @masonator/coolify-mcp@2.12.0

codex mcp list
```

Depois, em cada agente, faça somente leitura:

```text
Liste a VPS Hostinger, os projetos/servidores do Coolify e as zonas Cloudflare.
Retorne apenas identificadores, nomes e status. Não altere nada.
```

## Critério de sucesso

- Os três templates versionados não contêm tokens.
- Os três configs reais estão ignorados pelo Git.
- `scripts/run-mcp-with-env.mjs` falha quando a variável permitida está ausente e não entrega o outro segredo ao processo filho.
- Codex lista `hostinger-vps`, `coolify` e `cloudflare`.
- Copilot Chat local mostra os três servidores no seletor de ferramentas.
- Cada cliente conclui seu próprio OAuth Cloudflare.
- Nenhuma configuração MCP é adicionada ao Copilot cloud/coding agent.

## Next steps

- Usar os MCPs apenas conforme o semáforo operacional do [ADR-0017](../adr/0017-desenvolvimento-autonomo-afk.md).
- Configurar backup Postgres em R2 somente depois de existir o PostgreSQL dedicado do epistemix.

## References

- [OpenAI Codex — Model Context Protocol](https://developers.openai.com/codex/mcp)
- [VS Code — Use MCP servers](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [GitHub — Extend Copilot coding agent with MCP](https://docs.github.com/copilot/customizing-copilot/using-model-context-protocol/extending-copilot-coding-agent-with-mcp)
- [Cloudflare — Cloudflare MCP servers](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/)
