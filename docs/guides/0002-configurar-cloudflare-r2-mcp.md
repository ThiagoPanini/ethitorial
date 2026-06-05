---
title: Criar conta Cloudflare e preparar DNS, R2 e MCP
description: Cria a conta Cloudflare, ativa a zona do domínio, publica o Coolify por subdomínio proxied, fecha a origem com validação externa tripla, prepara o bucket R2 para a próxima etapa e conecta o Cloudflare API MCP com regra de plano antes de escrita.
nav_title: Cloudflare + R2 + MCP
---

Este guide é a segunda etapa da trilha real desta infra: depois da VPS Hostinger com Coolify existir e estar endurecida, a borda precisa sair do registrar/DNS anterior e passar para Cloudflare. O objetivo é preparar a fundação: zona DNS ativa, subdomínio do Coolify atrás do proxy, TLS em modo estrito, origem fechada com validação externa tripla, bucket R2 criado e MCP disponível para agentes.

O escopo **não** inclui configurar backup Postgres no Coolify. Aqui o R2 fica pronto; o backup, retenção e restore entram em um guide futuro, quando a Cloudflare já tiver sido criada e validada.

> ⚠️ **Bootstrap, não runbook.** Este guide mexe em DNS autoritativo, TLS e firewall. Execute em janela calma. Não é receita de operação cotidiana; pare se qualquer proof falhar.

> 💡 **Alternativa estrutural considerada: Cloudflare Tunnel.** O caminho deste guide expõe DNS público apontando para o IP da VPS e depois restringe firewall aos ranges Cloudflare. Funciona, mas mantém um IP de origem acessível durante curtos períodos do setup e exige sincronização periódica do allowlist.
>
> Cloudflare Tunnel resolve o mesmo problema de forma estrutural: a VPS estabelece conexão *outbound* para Cloudflare; nenhum IP de origem é exposto e nenhuma porta inbound precisa estar aberta. A complexidade migra para gerenciar o daemon `cloudflared`.
>
> Este guide segue o caminho convencional por consistência com a trilha real registrada nos ai-ops. A decisão deve ser revisitada na próxima atualização do [ADR-0006](../adr/0006-cloudflare-na-frente-da-vps.md). Para projetos novos, considere Tunnel desde o início.

## Example

Como exemplo, vamos adicionar `<SEU_DOMINIO>` à Cloudflare, criar `painel.<SEU_DOMINIO>` apontando para a VPS, fechar a origem e validar externamente, preparar o bucket `panini-vps-backups` no R2 e conectar um agente ao Cloudflare API MCP. O resultado esperado é: painel Coolify acessível por `https://<SUBDOMINIO_COOLIFY>`, origem fechada e provada por três checagens independentes, `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_ZONE_ID` anotados fora do repo, e bucket R2 privado criado.

Pré-condições:

- **Ambiente local POSIX:** shell `bash`/`zsh` com `ssh`, `dig`, `curl`. Em Windows, WSL2 ou Git Bash. PowerShell puro não cobre `dig` nem o `curl --resolve` usado na validação externa.
- [Guide 0001](0001-criar-vps-hostinger-com-coolify.md) concluído (VPS endurecida, Coolify rodando, portas temporárias abertas).
- Domínio registrado e acesso ao registrar para trocar nameservers.
- Acesso ao hPanel da Hostinger e ao IP público da VPS.
- **Conta Cloudflare com payment method confirmado** — R2 exige billing configurado mesmo para criar bucket dentro do free tier. Se ainda não confirmou, faça isso antes de começar para evitar pausa no meio do Passo 3.
- Bitwarden ou gerenciador equivalente pronto para `panini-vps/coolify-admin` e tokens Cloudflare.
- Placeholders anotados em `~/secrets/panini-vps-bootstrap.md`: `<SEU_DOMINIO>`, `<SUBDOMINIO_COOLIFY>`, `<SEU_IP_VPS>`, `<PORTA_COOLIFY_DIRETA>`, `<R2_BUCKET_BACKUPS>`.

### Passo 1: Criar conta Cloudflare e ativar a zona

Crie a conta em Cloudflare Dashboard e adicione o domínio raiz, por exemplo `<SEU_DOMINIO>`. Use **primary/full setup**, que é o modo comum nos planos Free e Pro: Cloudflare passa a ser o DNS autoritativo do domínio.

No onboarding:

- Informe apenas o domínio apex, por exemplo `epistemix.com`.
- Escolha o plano Free, salvo decisão registrada em ADR.
- Revise os DNS records importados automaticamente antes de trocar nameservers.
- Anote os dois nameservers que a Cloudflare atribuir.

Antes de trocar nameservers, exporte ou capture os DNS records atuais no registrar/provedor antigo. Confira manualmente se a zona Cloudflare preservou:

- `MX` e `TXT` de email.
- `TXT` de SPF, DKIM, DMARC e verificações SaaS.
- `CAA`, se existir; ele pode afetar emissão Let's Encrypt.
- Records do apex (`@`), `www` e redirects existentes.
- Qualquer `TXT` de verificação de domínio usado por GitHub, Google, PostHog, Sentry ou serviços similares.

Antes de alterar o registrar, confira se DNSSEC está ativo fora da Cloudflare. Se houver DS record no registrar, desative DNSSEC antigo primeiro; trocar nameservers com DS antigo pode deixar o domínio inacessível.

No registrar do domínio:

1. Remova os nameservers atuais.
2. Adicione exatamente os dois nameservers fornecidos pela Cloudflare.
3. Aguarde ativação. A Cloudflare pode levar até 24h para marcar a zona como **Active**.

Valide localmente:

```bash
dig ns <SEU_DOMINIO> @1.1.1.1
dig ns <SEU_DOMINIO> @8.8.8.8
dig <SEU_DOMINIO> +trace
```

Resultado esperado: os dois nameservers da Cloudflare aparecem nas respostas. Depois que a zona estiver ativa, anote fora do repo:

```text
CLOUDFLARE_ACCOUNT_ID=<...>
CLOUDFLARE_ZONE_ID=<...>
```

> ⚠️ **Se a zona ficar `Pending` por mais de 48h**, diagnostique antes de assumir bug da Cloudflare. Causas comuns:
>
> 1. **Nameservers digitados com typo no registrar.** Confira: `whois <SEU_DOMINIO>` (ou painel do registrar) deve listar exatamente os dois NS da Cloudflare, sem caracteres extras.
> 2. **Cache do registrar com TTL longo.** Alguns registrars mantêm cache local de 24-72h. Forçar refresh explícito ou aguardar o TTL.
> 3. **DS record antigo no registrar.** DNSSEC ativo no registrar bloqueia a propagação. Desative o DS record e aguarde a propagação do unsign (pode levar mais 24h por causa do TTL do DS).
> 4. **Nameservers antigos ainda presentes** ao lado dos novos. Alguns registrars permitem múltiplos NS; remova os antigos.
>
> Diagnóstico rápido: `dig ns <SEU_DOMINIO> @1.1.1.1` deve retornar apenas os NS da Cloudflare. Se aparecer NS misto ou antigo, o registrar não publicou a troca.

Se você desativou DNSSEC para migrar, reative pelo Cloudflare depois que a zona estiver `Active`.

### Passo 2a: Publicar Coolify em subdomínio — padrão cinza → laranja

**Não crie o record já como Proxied.** O padrão seguro é:

```text
1. Cria como DNS Only (cinza)  ── Traefik resolve o challenge Let's Encrypt pela porta 80
2. Cert Let's Encrypt emitido  ── proof: openssl s_client confirma cert válido na origem
3. Muda para Proxied (laranja) ── IP da origem some do DNS público
4. SSL/TLS → Full (strict)     ── cert válido na origem ⇒ sem erro 526
```

Se você ligar o proxy **antes** do cert emitir, o challenge HTTP-01 do Let's Encrypt não chega ao Traefik (a Cloudflare intercepta o tráfego) e você toma **erro 526 — Invalid SSL Certificate**. Difícil de diagnosticar remotamente e com rollback trabalhoso.

Na zona Cloudflare, crie o DNS record:

- **Type:** `A`
- **Name:** parte curta do subdomínio, por exemplo `painel`
- **IPv4 address:** `<SEU_IP_VPS>`
- **Proxy status:** **DNS Only (cinza)** ← obrigatório neste momento
- **TTL:** Auto

Aguarde a propagação DNS (verifique com `dig +short <SUBDOMINIO_COOLIFY> @1.1.1.1` — deve retornar `<SEU_IP_VPS>`).

Agora crie o primeiro admin do Coolify pela rota temporária `http://<SEU_IP_VPS>:<PORTA_COOLIFY_DIRETA>`. Esta é uma **janela curta de exposição administrativa** (idealmente menos de 10 minutos): a rota `/register` está pública na internet enquanto o admin não foi criado e a origem não foi fechada. Tenha o gerenciador de senhas aberto antes de clicar.

Se a Hostinger oferecer firewall no painel para esta VPS, limite temporariamente `<PORTA_COOLIFY_DIRETA>`, `6001` e `6002` ao seu IP público antes de abrir a rota de registro. Não confie só em UFW para isso (a armadilha Docker+UFW está documentada no Passo 2b).

> 💡 **Para operadores AI autônomos sem GUI de gerenciador de segredos**
>
> A criação do admin Coolify produz credencial sensível que **deve** ir direto para o cofre, sem escala em buffer transitório (scrollback do agente, log, clipboard).
>
> - **Se você tem CLI de gerenciador de segredos** (Bitwarden `bw`, 1Password `op`, HashiCorp Vault): gere a senha com `bw generate -ulns --length 32`, crie o item `panini-vps/coolify-admin` com `bw create item ...`, e só então use a senha no registro.
> - **Se você não tem CLI configurada**: pare aqui. Peça ao humano para gerar e armazenar a credencial, ou configure a CLI antes de prosseguir. Não gere senha em buffer próprio — sidequest com credencial em local errado é dívida operacional escondida e potencial vazamento.

Em seguida, no Coolify, configure **Settings -> General -> Instance domain** como:

```text
https://<SUBDOMINIO_COOLIFY>
```

Acesse primeiro por HTTP para permitir que o Traefik responda ao challenge e emita o certificado:

```bash
curl -I http://<SUBDOMINIO_COOLIFY>
```

Aguarde alguns minutos e valide HTTPS — use `openssl s_client` (mais confiável que `curl -vI | grep`):

```bash
echo | openssl s_client -connect <SEU_IP_VPS>:443 -servername <SUBDOMINIO_COOLIFY> 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates
```

Esperado: `issuer=... Let's Encrypt ...`, `subject=CN = <SUBDOMINIO_COOLIFY>`, `notAfter` ~90 dias no futuro.

**Só agora**, com o cert válido confirmado, mude o record para **Proxied (laranja)** na Cloudflare.

Valide que o IP da origem não aparece mais no DNS público:

```bash
dig +short <SUBDOMINIO_COOLIFY>
```

Resultado esperado: IPs Cloudflare, não `<SEU_IP_VPS>`.

Com o record já **Proxied (laranja)** e o certificado de origem válido, vá em Cloudflare -> zona -> **SSL/TLS -> Overview** e selecione **Full (strict)**. Em **Edge Certificates**, habilite:

- **Always Use HTTPS:** On
- **Minimum TLS Version:** TLS 1.2
- **Automatic HTTPS Rewrites:** On

#### Como TLS funciona aqui (três lados)

```text
       ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
       │  Browser/cliente │ <-> │    Cloudflare    │ <-> │  Origem (Traefik)│
       └──────────────────┘     └──────────────────┘     └──────────────────┘
                ↑ TLS 1                    ↑ TLS 2                ↑ Cert 3
                │                          │                       │
       Cert da Cloudflare         Cert emitido pelo          Cert Let's Encrypt
       (Universal SSL)            Traefik/Let's Encrypt      vivendo no Coolify
                                  apresentado pela origem
```

- **TLS 1** (browser ↔ Cloudflare) sempre funciona — Cloudflare emite cert Universal.
- **TLS 2** (Cloudflare ↔ origem) é o canal que `Full (strict)` exige válido.
- **Cert 3** (cert na origem) precisa ter sido emitido para `<SUBDOMINIO_COOLIFY>` e estar válido.

Se aparecer `526 Invalid SSL Certificate`, o modo Strict foi ligado antes de o certificado da origem estar válido (Cert 3 ainda emitindo). Volte temporariamente para `Full`, confira logs ACME do proxy e tente novamente:

```bash
sudo docker logs coolify-proxy 2>&1 | grep -i acme | tail -20
```

### Passo 2b: Fechar a origem e validar externamente

Com `https://<SUBDOMINIO_COOLIFY>` saudável e Full (strict) ativo, sincronize a allowlist Cloudflare no UFW e remova as portas temporárias.

> ⚠️ **Armadilha crítica: Docker e UFW não conversam direito**
>
> O daemon do Docker injeta regras próprias na cadeia `DOCKER` do `iptables`. Essas regras correm **antes** das regras do UFW para tráfego destinado a containers.
>
> **Sintoma:** `sudo ufw status` mostra a porta fechada, mas a porta continua acessível externamente.
>
> **Resolução:** não confiar só na saída do UFW. Validar exposição real com **três checagens independentes** (mais abaixo). Se a porta permanecer aberta apesar das regras UFW, use o firewall da Hostinger (hPanel -> VPS -> Firewall) OU instale [`ufw-docker`](https://github.com/chaifeng/ufw-docker), que reordena as regras iptables corretamente.

Instale o script de sincronização e aplique:

```bash
sudo tee /usr/local/sbin/ufw-cloudflare-sync.sh > /dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

for n in $(sudo ufw status numbered | awk -F'[][]' '/cloudflare/ {print $2}' | sort -rn); do
    yes | sudo ufw delete "$n" >/dev/null
done

for cidr in $(curl -fsSL https://www.cloudflare.com/ips-v4); do
    sudo ufw allow proto tcp from "$cidr" to any port 80 comment 'cloudflare-v4'
    sudo ufw allow proto tcp from "$cidr" to any port 443 comment 'cloudflare-v4'
done

for cidr in $(curl -fsSL https://www.cloudflare.com/ips-v6); do
    sudo ufw allow proto tcp from "$cidr" to any port 80 comment 'cloudflare-v6'
    sudo ufw allow proto tcp from "$cidr" to any port 443 comment 'cloudflare-v6'
done

sudo ufw reload
EOF

sudo chmod +x /usr/local/sbin/ufw-cloudflare-sync.sh
sudo /usr/local/sbin/ufw-cloudflare-sync.sh

sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp
sudo ufw delete allow <PORTA_COOLIFY_DIRETA>/tcp
sudo ufw delete allow 6001/tcp
sudo ufw delete allow 6002/tcp
sudo ufw reload
```

Agende a sincronização mensal dos ranges:

```bash
sudo tee /etc/systemd/system/ufw-cloudflare-sync.service > /dev/null <<'EOF'
[Unit]
Description=Sync ufw allowlist with Cloudflare IP ranges
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/ufw-cloudflare-sync.sh
EOF

sudo tee /etc/systemd/system/ufw-cloudflare-sync.timer > /dev/null <<'EOF'
[Unit]
Description=Run Cloudflare IP sync monthly

[Timer]
OnCalendar=monthly
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now ufw-cloudflare-sync.timer
```

#### Validação externa tripla obrigatória

> ⚠️ **Armadilha: validação local não prova fechamento global**
>
> Um único `curl` do laptop do operador é uma amostra de **um único vantage point**. Pode falhar por motivos não-relacionados ao firewall (ISP do operador bloqueando egress, cache local DNS, NAT compartilhado). Origem fechada exige confirmação por **três vantage points independentes**.

**Validação A — curl direto do operador:**

```bash
curl -I --max-time 5 http://<SEU_IP_VPS>
```

Resultado esperado: `Connection timed out` ou `Connection refused` após 5s.

**Validação B — curl forçando bypass do DNS via `--resolve`:**

```bash
# Esta deve FALHAR (origem fechada para tráfego direto):
curl -I --max-time 5 --resolve <SUBDOMINIO_COOLIFY>:443:<SEU_IP_VPS> https://<SUBDOMINIO_COOLIFY>

# Esta deve PASSAR (caminho normal via Cloudflare):
curl -I --max-time 5 https://<SUBDOMINIO_COOLIFY>
```

A primeira força resolução DNS para o IP da origem direto, simulando atacante que descobriu o IP. A segunda passa pela Cloudflare normalmente. Diferença entre as duas = prova de que apenas Cloudflare consegue alcançar a origem.

**Validação C — vantage point externo independente:**

Escolha uma das opções (em ordem de preferência):

1. **De outra máquina** (segundo laptop, VPS, servidor de colega) rode `curl -I --max-time 5 http://<SEU_IP_VPS>` — deve expirar.
2. **Do celular via dados móveis** (não Wi-Fi do mesmo local): rode equivalente em app de SSH ou Termux. Deve expirar.
3. **Ferramenta online de scan** como [check-host.net](https://check-host.net/check-tcp) — submeta `<SEU_IP_VPS>:80` e `<SEU_IP_VPS>:<PORTA_COOLIFY_DIRETA>`. Resultado esperado: timeout/closed em todos os nodes externos.

> ✅ **Critério de origem fechada:** as **três** validações falham. Se qualquer uma passar (origem responde), volte aos passos UFW e considere usar firewall da Hostinger ou `ufw-docker` antes de declarar o passo concluído.

### Passo 3: Criar o bucket R2 para a próxima etapa

No Cloudflare Dashboard, abra **R2 object storage** e habilite R2 se a conta ainda não tiver feito isso. Em seguida, crie o bucket:

- **Bucket name:** `<R2_BUCKET_BACKUPS>`, por exemplo `panini-vps-backups`
- **Location/jurisdiction:** default/automatic, salvo requisito explícito de jurisdição
- **Public access:** off

O nome do bucket precisa obedecer às regras do R2/S3: letras minúsculas, números e hífens, entre 3 e 63 caracteres, sem começar ou terminar com hífen. Se você escolher jurisdição específica, o endpoint também muda; mantenha `automatic/default` nesta fase a menos que exista requisito explícito.

Anote fora do repo:

```text
R2_ACCOUNT_ID=<CLOUDFLARE_ACCOUNT_ID>
R2_BUCKET_BACKUPS=<R2_BUCKET_BACKUPS>
R2_ENDPOINT=https://<CLOUDFLARE_ACCOUNT_ID>.r2.cloudflarestorage.com
R2_REGION=auto
```

Não crie ainda a credencial S3 de longa duração para o Coolify se você não for configurar o backup Postgres na mesma sessão. O secret do R2 só aparece uma vez; criar cedo demais aumenta chance de segredo parado em lugar errado. No guide futuro de backup, crie um token R2 `Object Read & Write` escopado apenas a esse bucket e registre como destino S3 no Coolify.

Proof no painel: o bucket existe, está vazio e privado. Se a UI ainda pedir billing na criação, conclua a confirmação de payment method (o pré-requisito do guide era ter feito isso antes; volte e termine se ainda não estiver feito).

### Passo 4: Conectar o Cloudflare API MCP para agentes

Antes de criar qualquer arquivo `.mcp.json`, garanta que ele não vá parar no git:

```bash
echo '.mcp.json' >> .gitignore
git add .gitignore
git commit -m "chore: ignore local mcp config"
```

> 💡 **Localização alternativa fora do repo**
>
> Se preferir manter zero risco de versionamento acidental, coloque a config em `~/.config/claude/mcp/cloudflare.json` ou equivalente do seu cliente MCP. Diretórios fora do repo evitam qualquer chance de `git add .` acidental capturar a credencial.

O MCP recomendado é o **Cloudflare API MCP Server** oficial:

```text
https://mcp.cloudflare.com/mcp
```

Para clientes com suporte a remote MCP e OAuth, prefira a configuração sem token manual:

```json
{
  "mcpServers": {
    "cloudflare-api": {
      "url": "https://mcp.cloudflare.com/mcp"
    }
  }
}
```

O fluxo OAuth abre a Cloudflare no browser e permite conceder permissões interativamente. Para automações que exigem token manual, crie tokens curtos e separados por finalidade:

- `panini-vps-mcp-dns-setup`: `Zone Read`, `DNS Read/Edit`, `Zone Settings Read/Edit` e `SSL and Certificates Read/Edit`, escopado apenas a `<SEU_DOMINIO>`, TTL curto.
- `panini-vps-mcp-r2-provisioning`: `Workers R2 Storage Write` no account, TTL curto, apenas se o agente realmente for criar/listar buckets.

Não habilite **Client IP Address Filtering** nesses tokens; o servidor MCP oficial informa que tokens com IP filtering não são suportados. Revogue tokens de setup depois de concluir a operação.

Para clientes sem remote MCP nativo, use `mcp-remote` como ponte local:

```json
{
  "mcpServers": {
    "cloudflare-api": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.cloudflare.com/mcp",
        "--header",
        "Authorization:${CLOUDFLARE_MCP_AUTH_HEADER}"
      ],
      "env": {
        "CLOUDFLARE_MCP_AUTH_HEADER": "Bearer <TOKEN>"
      }
    }
  }
}
```

Nunca versione config com token real. Se algum token foi parar em commit, log ou histórico de shell, revogue imediatamente em Cloudflare → API Tokens e crie outro.

#### Validação por etapas: leitura primeiro, escrita com plano

**Etapa 1 — proof de escopo mínimo (leitura):**

```text
Use o Cloudflare API MCP para listar zonas visíveis para este token.
Retorne apenas zone name, zone_id e account_id. Não faça alterações.
```

Se o agente enxergar zonas além de `<SEU_DOMINIO>`, o escopo está amplo demais. Revogue e recrie.

```text
Use o Cloudflare API MCP para listar apenas buckets R2 visíveis nesta conta.
Não crie, altere ou apague nada.
```

**Etapa 2 — proof positiva da guardrail "plano antes de escrita":**

> 🎯 **Teste de guardrail**
>
> Para validar que o MCP de fato exige plano antes de executar escrita (e não apenas aceita pedidos diretos), peça explicitamente uma operação de escrita:
>
> ```text
> Use o Cloudflare API MCP para criar um TXT record temporário
> `_mcp-validation.<SEU_DOMINIO>` com valor `test-{timestamp}`.
> ```
>
> **Comportamento esperado:** o agente apresenta plano antes de executar:
>
> ```text
> Plano:
> - Endpoint: POST /zones/{zone_id}/dns_records
> - Payload: {"type": "TXT", "name": "_mcp-validation", "content": "test-...", ...}
> - Efeito: cria novo record (não sobrescreve nenhum existente)
> Confirma?
> ```
>
> Confirme apenas se quiser de fato criar o record (e remova-o em seguida com nova operação ou via UI). Se o agente executar **sem** apresentar plano, a guardrail falhou — revogue o token, investigue o cliente MCP e não use para escrita em produção até resolver.

#### Regra operacional para qualquer escrita

```text
Antes de executar, mostre endpoint Cloudflare, método HTTP, payload,
zona/account alvo e efeito esperado. Aguarde minha confirmação.
```

Só confirme se o payload apontar para a zona certa, não tiver delete/overwrite acidental e estiver coerente com o guide.

Proof final deste passo:
- O agente lista apenas a zona/conta esperadas.
- O agente não executou escrita sem confirmação (validado pela Etapa 2).
- Tokens temporários de setup foram revogados ou têm TTL curto registrado no gerenciador de segredos.

## Critério de sucesso

Considere este guide concluído apenas se todos os checks passarem:

- A zona `<SEU_DOMINIO>` está `Active` na Cloudflare.
- `dig ns <SEU_DOMINIO> @1.1.1.1` retorna os nameservers Cloudflare.
- Registros críticos de email/verificação foram preservados ou conscientemente descartados.
- `dig +short <SUBDOMINIO_COOLIFY>` retorna IPs Cloudflare, não `<SEU_IP_VPS>`.
- `https://<SUBDOMINIO_COOLIFY>` responde com TLS válido e Cloudflare em `Full (strict)`.
- Admin Coolify criado, senha salva em `panini-vps/coolify-admin` no gerenciador de segredos (sem escala em buffer transitório).
- **Origem fechada provada por validação externa tripla:**
  - Validação A: `curl -I --max-time 5 http://<SEU_IP_VPS>` expira ou falha.
  - Validação B: `curl --resolve <SUBDOMINIO_COOLIFY>:443:<SEU_IP_VPS> ...` falha; `curl` sem `--resolve` passa.
  - Validação C: scan externo (outra máquina, dados móveis ou check-host.net) confirma timeout.
- Bucket `<R2_BUCKET_BACKUPS>` existe, está privado e vazio.
- MCP lista apenas recursos esperados e exige plano antes de qualquer escrita (proof positiva validada).
- `.mcp.json` está no `.gitignore` (ou config vive fora do repo).
- Tokens MCP de setup têm TTL definido e estão registrados para revogação.

## Next steps

Com Cloudflare ativa, Coolify publicado por subdomínio, origem fechada e validada, e R2 criado, a próxima doc pode tratar apenas do backup Postgres em R2: criar credencial S3 escopada ao bucket, registrar destino no Coolify, configurar schedule, disparar backup manual e documentar restore.

Próximo:

- [Runbook de operação da VPS](../runbooks/0001-operacao-vps.md) — saúde, firewall, fail2ban e Coolify.
- [ADR-0006 — Cloudflare na frente da VPS](../adr/0006-cloudflare-na-frente-da-vps.md) — contexto da decisão de borda, proxy e R2. Próxima revisão deve registrar Cloudflare Tunnel como alternativa considerada.
- Guide futuro: backup Postgres em R2, ainda não escrito porque depende desta etapa estar concluída.

## References

- [Cloudflare DNS — Primary setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/)
- [Cloudflare DNS — Set up a primary zone](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [Cloudflare DNS — Proxy status](https://developers.cloudflare.com/dns/proxy-status/)
- [Cloudflare SSL/TLS — Get started](https://developers.cloudflare.com/ssl/get-started/)
- [Cloudflare SSL/TLS — Full strict](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Cloudflare R2 — Create buckets](https://developers.cloudflare.com/r2/buckets/create-buckets/)
- [Cloudflare R2 — Authentication and tokens](https://developers.cloudflare.com/r2/api/tokens/)
- [Cloudflare R2 — S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- [Cloudflare Tunnel — Get started](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/) — alternativa estrutural ao caminho deste guide.
- [Cloudflare MCP Server](https://github.com/cloudflare/mcp)
- [ufw-docker](https://github.com/chaifeng/ufw-docker) — projeto que reordena regras iptables se Docker contornar UFW.
- [check-host.net](https://check-host.net/) — vantage point externo para validar fechamento de origem.
