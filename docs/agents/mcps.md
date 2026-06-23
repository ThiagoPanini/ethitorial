# MCPs locais (Claude Code, Codex, Copilot)

Setup dos MCP servers de produção (Hostinger / Coolify / Cloudflare). Carregado sob demanda pelo [AGENTS.md](../../AGENTS.md). A **classificação de risco** de cada operação está em [afk-ops.md](afk-ops.md).

- O token Hostinger vive no `.env`; o token Coolify fica inline somente nos três configs reais e gitignored.
- Configs reais são locais e gitignored: `.mcp.json` (Claude Code), `.codex/config.toml` (Codex) e `.vscode/mcp.json` (Copilot Chat local).
- Templates versionados: `.mcp.json.example`, `.codex/config.toml.example` e `.vscode/mcp.json.example`; contêm apenas placeholder para o token Coolify.
- O MCP Hostinger lê `.env` via dotenv; o Coolify recebe o token pelo campo `env` dos configs reais; Cloudflare autentica por OAuth separadamente em cada cliente.
- O Copilot cloud/coding agent **não** recebe estes MCPs de produção. Ele executa ferramentas autonomamente e não compartilha o ambiente local.

Infra registrada em [ADR-0003](../adr/0003-infra-hostinger-vps-coolify.md) (Hostinger + Coolify), [ADR-0006](../adr/0006-cloudflare-na-frente-da-vps.md) (Cloudflare) e [ADR-0016](../adr/0016-vps-agnostica-multi-projeto.md) (VPS agnóstica).
