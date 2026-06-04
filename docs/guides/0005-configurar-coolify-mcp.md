---
title: Configurar o Coolify MCP local para operar deploys na VPS
description: Instala o MCP server da comunidade @masonator/coolify-mcp, conecta-o a um cliente MCP local com token inline no config gitignored, aponta para o painel Coolify proxied e valida com operações read-only antes de liberar qualquer escrita.
nav_title: Coolify MCP
---

> 🔄 **Setup atual: multiagente.** Este guide descreve o setup inicial single-agent. O setup vigente fixa a versão e, como o server não lê `.env`, cola o token Coolify no campo `env` de cada config real e gitignored. Para configurar os três clientes locais, siga o [guide 0007](0007-configurar-mcps-multiagente.md).

Este guide conecta um agente de IA ao painel Coolify da VPS via API, expondo as operações de PaaS (projetos, aplicações, deploys, bancos, serviços) como ferramentas tipadas. O objetivo é operação de deploy assistida com a mesma disciplina de borda do [guide 0004](0004-configurar-hostinger-vps-mcp.md): leitura primeiro, escrita só com plano e confirmação.

Diferente da Hostinger e da Cloudflare, **não há MCP oficial da Coolify**. Usamos o server da comunidade mais maduro, `@masonator/coolify-mcp` — 42 ferramentas *token-optimized*. Isso importa: a API do Coolify é muito verbosa (uma única aplicação traz ~91 campos; listar 20+ apps passa de 200KB e estoura o context window). O server resume por padrão e adiciona busca por domínio/IP em vez de só UUID.

> ⚠️ **Server de terceiro, não oficial.** Um MCP da comunidade vê seus tokens e pode ser vetor de prompt injection (ver [aviso do Claude Code sobre MCP](https://code.claude.com/docs/en/mcp)). Fixe a versão, leia o que ele faz e mantenha a regra read-first. Trate-o como o que é: conveniência operacional, não infra de confiança.

O escopo **não** inclui executar deploys/destruições. O guide deixa o MCP pronto e provado em modo leitura; qualquer ação de escrita (deploy, restart, stop, delete) fica atrás de confirmação explícita do operador.

## Example

Como exemplo, vamos registrar o `coolify` no Claude Code como server de escopo de projeto, colocar o token somente no config real gitignored e provar conectividade listando projetos/servidores em modo read-only contra o painel proxied em `https://vps.thiagopanini.dev`.

Pré-condições:

- **Node.js 20+** no ambiente local (o pacote declara `engines.node >= 20`). Verifique com `node -v`.
- **Cliente MCP local** com suporte a stdio (Claude Code, Cursor ou equivalente).
- **Painel Coolify já no ar** e acessível pelo domínio público (proxied na Cloudflare — ver [ADR-0006](../adr/0006-cloudflare-na-frente-da-vps.md)).
- Placeholders: `<COOLIFY_ACCESS_TOKEN>` (gerado no painel), `<COOLIFY_BASE_URL>` (= `https://vps.thiagopanini.dev`).

### Passo 1: Gerar o token read-only

Gere um token em **Coolify -> Settings -> API / Keys & Tokens**. O Coolify deixa escolher permissões — **comece com um token read-only** para provar conectividade sem risco; só escale para escrita depois que a leitura estiver verde.

> ⚠️ **Fricção comum: este server NÃO lê `.env` sozinho.** O `@masonator/coolify-mcp` lê `COOLIFY_ACCESS_TOKEN` somente do env do processo — confirmado: o pacote não declara `dotenv` nas deps, diferente do MCP da Hostinger. Como Claude Code, Codex e Copilot não compartilham uma expansão portável de segredo, a convenção temporária do repo é colar o token no campo `env` de cada config real e gitignored. Não coloque o token em template versionado, `.env` ou comando de shell.

### Passo 2: Registrar o server e materializar o token

Registre o server apontando para o painel proxied e usando a versão pinada:

```bash
# Claude Code (escopo de projeto -> grava ./.mcp.json):
claude mcp add coolify -s project \
  --env COOLIFY_BASE_URL=https://vps.thiagopanini.dev \
  --env COOLIFY_ACCESS_TOKEN='<COLE_O_TOKEN_DO_COOLIFY>' \
  -- npx -y @masonator/coolify-mcp@2.12.0
```

Depois, edite o `.mcp.json` gitignored e substitua o placeholder pelo token. O resultado estrutural:

```json
{
  "mcpServers": {
    "coolify": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@masonator/coolify-mcp@2.12.0"],
      "env": {
        "COOLIFY_BASE_URL": "https://vps.thiagopanini.dev",
        "COOLIFY_ACCESS_TOKEN": "<TOKEN_REAL_SOMENTE_NO_CONFIG_GITIGNORED>"
      }
    }
  }
}
```

> ⚠️ **Convenção do repo: `.mcp.json` fora do git.** O arquivo contém o token Coolify e está no `.gitignore` (mesma regra dos guides [0002](0002-configurar-cloudflare-r2-mcp.md) e [0004](0004-configurar-hostinger-vps-mcp.md)). Confirme: `git check-ignore .mcp.json` imprime `.mcp.json`.

Proof: `claude mcp get coolify` mostra `Scope: Project config` e `Type: stdio`.

### Passo 3: Validar conectividade e listar projetos (read-only)

Confirme que o server conecta:

```bash
claude mcp list
# esperado: coolify: npx -y @masonator/coolify-mcp - ✓ Connected
```

Depois, prove uma operação real e segura pedindo ao agente:

```text
Use o MCP coolify para um overview read-only: versão do Coolify, lista de
servidores e de projetos (só nome/uuid/status). Não dispare deploy nem altere nada.
```

Esperado: a versão do painel, o servidor e os projetos existentes aparecem. Anote os UUIDs de projeto/aplicação para chamadas de detalhe e diagnóstico.

> ⚠️ **Coolify atrás do Cloudflare.** `COOLIFY_BASE_URL` é o domínio **público** proxied (`https://vps.thiagopanini.dev`), nunca `localhost:8000`. Se um dia você colocar **Cloudflare Access** na frente do painel, este server aceita `CF-Access-Client-Id` / `CF-Access-Client-Secret` via `--env`.

#### Regra operacional para qualquer escrita

As 42 ferramentas incluem ações de impacto real (deploy, restart, stop, delete de app/serviço/banco, e um *emergency stop all*). Antes de executar qualquer uma:

```text
Antes de executar, mostre a ferramenta, o método/endpoint, o payload, o
recurso-alvo (uuid + nome) e o efeito esperado. Aguarde minha confirmação.
```

Só confirme se o alvo for o recurso certo, sem deploy/stop/delete acidental. O *emergency stop all* já exige confirmação no próprio server. Mantenha o UI do Coolify como rede de segurança ao mexer em produção.

## Critério de sucesso

Considere este guide concluído apenas se todos os checks passarem:

- `node -v` ≥ 20 e `npx -y @masonator/coolify-mcp` sobe sem erro de pacote.
- `.mcp.json` existe, contém o token real no campo `env`, não contém placeholder e `git check-ignore .mcp.json` confirma que está ignorado.
- Nenhum template ou arquivo versionado contém o token real.
- `claude mcp list` mostra `coolify - ✓ Connected`.
- O overview read-only retorna versão + servidores + projetos esperados (`isError: false`).
- Nenhum deploy/stop/delete foi executado sem plano + confirmação.

## Next steps

- [Guide 0006 — Configurar o Cloudflare MCP remoto](0006-configurar-cloudflare-mcp.md): fecha o tripé de bordas (VPS + PaaS + edge).
- [Runbook 0001 — Operação da VPS](../runbooks/0001-operacao-vps.md): saúde da VPS e Coolify no dia a dia.
- [ADR-0003 — Infra Hostinger VPS + Coolify](../adr/0003-infra-hostinger-vps-coolify.md): contexto da decisão de hosting/PaaS.

## References

- [GitHub — StuMason/coolify-mcp](https://github.com/StuMason/coolify-mcp)
- [npm — @masonator/coolify-mcp](https://www.npmjs.com/package/@masonator/coolify-mcp)
- [Coolify — API & Keys/Tokens (docs)](https://coolify.io/docs/api-reference/authorization)
- [Anthropic — Configurar MCP no Claude Code](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol — especificação](https://modelcontextprotocol.io/)
