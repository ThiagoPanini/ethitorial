---
data: 2026-05-24
operacao: setup inicial da VPS de produção com template Coolify
maquina: talkingpres-prod (Hostinger KVM 2, hostname de fábrica srv1700377)
operador: Thiago Panini
agente: Claude Code
resultado: success
dividas:
  - hardening base da VPS (executado em sessão seguinte, ver 0002-hardening-talkingpres-prod.md)
  - admin Coolify não criado (aguarda fim do hardening)
  - proxy Traefik não confirmado em execução (sobe no primeiro deploy ou após config no painel)
referencias:
  lesson: ../lessons/0001-hardening-de-vps-linux.md
  guide: ../guides/0001-criar-vps-hostinger-com-coolify.md
  adr: ../adr/0003-infra-hostinger-vps-coolify.md
---

# 20260524 — Setup inicial da VPS talkingpres-prod com template Coolify

Registro narrativo da sessão em que a VPS de produção do talkingpres nasceu. Conceitos gerais sobre por que cada decisão faz sentido vivem na [lição 0001 — Hardening de VPS Linux](../lessons/0001-hardening-de-vps-linux.md). Este documento registra **o que efetivamente fizemos nesta máquina específica nesta data específica**.

## Cenário

- Plano Hostinger KVM 2 (2 vCPU, 8 GB RAM, 100 GB NVMe) já contratado.
- Conta Cloudflare disponível, mas zona `talkingpres.com` ainda não migrada para os nameservers Cloudflare.
- Domínio `talkingpres.com` registrado em registrar externo.
- Bitwarden disponível como gerenciador de segredos, sem CLI `bw` instalada na sessão.
- Chaves locais já preparadas em sessão anterior de bootstrap: `~/.ssh/talkingpres_ed25519` com fingerprint `SHA256:u3kxbG8GjkJiEcxLLss3LzeaCaNt33FNB28ndHYLOFE`, passphrase salva em Bitwarden como `talkingpres/ssh-passphrase`.
- Caderno local de placeholders em `~/secrets/talkingpres-bootstrap.md` (`700/600`) para guardar IP da VPS e valores de bootstrap fora do repo.

## Execução

### Escolha do template Coolify em vez de install manual

Avaliamos as duas formas de chegar a uma VPS com Coolify: instalar Ubuntu 24.04 limpo + rodar o instalador oficial (`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash`), ou comprar a VPS já com o template "Coolify" pré-instalado pela Hostinger. Optamos pelo template porque, para Fase 0, o objetivo é ter Coolify rodando o quanto antes para destravar o resto da sidequest, e a Hostinger empacota a configuração privilegiada (Docker, daemon, volumes, rede, containers de proxy, banco interno, redis interno) num produto que ela se compromete a manter funcional. A contrapartida aceita: perdemos controle fino sobre versões e flags. Reabriremos a discussão se a abstração começar a vazar.

A consequência operacional: quando a VPS terminou de provisionar, não existiu o ato cerimonial de "instalar Coolify". Existiu o ato silencioso de auditar o que o template entregou.

### O wizard da Hostinger pulou o campo SSH key

A tela de provisionamento da hPanel tem um campo para SSH key pública. Em fluxo normal (escolher OS limpo, colar chave, clicar instalar), esse campo aparece junto da seleção de SO. No fluxo de template Coolify, o campo desapareceu silenciosamente da tela: o template instala o OS por uma rota interna que pula a injeção de chave. Resultado observado: VPS provisionada com **senha de root e zero chaves cadastradas**.

Resolução: cadastrar a chave manualmente em hPanel → VPS → **SSH Access** → adicionar `~/.ssh/talkingpres_ed25519.pub`. Optamos por essa via em vez de logar pelo console web com a senha e popular `/root/.ssh/authorized_keys` à mão, porque o painel passa a saber que a chave existe e isso fica registrado para futuros reprovisionamentos.

Vão silencioso entre dois fluxos do produto Hostinger. Vale anotar para a próxima vez que alguém da equipe provisionar VPS com template.

### Snapshot `pre-hardening` criado

Antes de qualquer mudança que tocasse boot, sshd ou firewall, criamos um snapshot manual via hPanel → VPS → **Snapshots** → **Create** com nome `pre-hardening`. Plano KVM 2 da Hostinger inclui um slot manual gratuito.

### Primeiro ssh root via chave

```bash
ssh -i ~/.ssh/talkingpres_ed25519 root@<SEU_IP_VPS>
```

Saída:

```text
Welcome to Ubuntu 24.04.x LTS (GNU/Linux ...)
root@srv1700377:~#
```

Três coisas confirmadas: chave aceita (autenticação por chave funcionando), IP público roteado, VPS viva. `srv1700377` é o hostname de fábrica, marcador de "ainda nada nosso aconteceu aqui". IP público anotado em `~/secrets/talkingpres-bootstrap.md`.

### Auditoria do template Coolify

Antes de criar qualquer admin no painel, mapeamos o que o template entregou:

```bash
sudo docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
sudo docker inspect coolify --format '{{.Config.Image}}'
sudo docker ps --filter 'name=proxy' --format '{{.Names}} {{.Image}}'
sudo ss -tlnp | grep -E ':(8000|6001|6002)\b'
sudo ls -la /data/coolify | head
sudo docker exec coolify-db psql -U coolify -d coolify -tAc 'select count(*) from users;'
```

Resultados:

- Quatro containers `coolify*` saudáveis: `coolify` (4.1.0), `coolify-db` (postgres:15-alpine), `coolify-redis` (redis:7-alpine), `coolify-realtime` (1.0.15).
- Nenhum container `proxy` rodando. Traefik (o proxy default do Coolify) sobe no primeiro deploy ou quando o admin loga e configura **Server → Proxy**. Antes desse momento, as portas 80/443 não têm ninguém escutando.
- Portas `8000`, `6001`, `6002` escutando no host, publicadas pelo `docker-proxy` (Docker daemon publica antes do UFW; ver nota sobre Docker+UFW na lesson de hardening).
- `/data/coolify` íntegro com `applications/`, `backups/`, `databases/`, `proxy/`, `sentinel/`, `services/`, `source/`. Owner `9999:9999` (UID interno do Coolify).
- Banco interno com `0` usuários. Painel virgem, rota `/register` disponível, qualquer um que acessasse `http://<SEU_IP_VPS>:8000` poderia se tornar admin.

### Decisão de adiar criação do admin

Mais importante do que o que o template entregou: o que **não** estava lá. Banco com zero usuários significa painel administrativo aberto na internet pública sem credencial. Poder concentrado (deploys, banco, secrets, comandos privilegiados) numa máquina ainda sem hardening seria abrir superfície administrativa exatamente no ponto frágil.

Decisão: **não criar admin antes do hardening fechar**. O hardening foi executado na sessão seguinte (registrada em [0002-hardening-talkingpres-prod.md](0002-hardening-talkingpres-prod.md)). O admin só será criado na etapa Cloudflare, com DNS encaminhando para o subdomínio e senha salva direto no gerenciador (procedimento no [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md)).

Restrição operacional concreta: a senha do admin precisa ir direto para o Bitwarden como `talkingpres/coolify-admin`. Sem a CLI `bw` instalada na sessão, criar agora significaria gerar a senha em buffer transitório (clipboard, scrollback, anotação rápida) — todos locais errados para segredo. Parar antes de gerar a credencial foi a decisão segura.

## Obstáculos e resoluções

### Wizard Hostinger sem campo SSH key no fluxo template

**Sintoma**: depois de provisionar, só senha de root estava configurada; chave não foi aceita no primeiro ssh.

**Causa**: template Coolify instala OS por rota interna que pula a etapa de injeção de chave do wizard padrão.

**Resolução**: cadastrar manualmente em hPanel → VPS → **SSH Access**.

### `cloud-init` em estado `hold` no apt

**Sintoma**: durante `apt -y full-upgrade` na sessão de hardening seguinte, `cloud-init` aparecia como `kept back`.

**Causa**: a Hostinger congelou o pacote em uma versão específica para preservar o provisionamento do template. `apt` se recusa a atualizar pacotes em `hold` automaticamente.

**Resolução**: atualizar explicitamente preservando `/etc/cloud/cloud.cfg` local (flag de manter conffile existente). Detalhe técnico do procedimento documentado na lesson de hardening; aqui registramos apenas que isso aconteceu nesta máquina.

## Divergências detectadas com ADRs

Apêndice de leitura crítica que apareceu durante o setup. Cada item ou foi resolvido com atualização do ADR, ou ficou registrado para revisão futura.

### C.1 — Coolify usa Traefik por default, não Caddy (resolvido)

[ADR-0003](../adr/0003-infra-hostinger-vps-coolify.md) originalmente descrevia "Caddy como reverse proxy com SSL automático". Doc oficial Coolify atual ([proxies](https://coolify.io/docs/knowledge-base/server/proxies)) diz que Traefik é o default e Caddy é experimental, com recomendação explícita de manter Traefik para a maioria dos setups. Template Hostinger entrega Traefik.

Seguimos Traefik porque (a) é o que veio entregue, (b) é o que a doc upstream recomenda, (c) o objetivo do ADR ("reverse proxy com SSL automático") é cumprido por qualquer um dos dois.

**Status:** ADR-0003 atualizado em 2026-05-24 substituindo "Caddy" por "Traefik (default do Coolify)". Divergência fechada.

### C.2 — Ubuntu 26.04 LTS lançado, mas mantemos 24.04

[ADR-0003](../adr/0003-infra-hostinger-vps-coolify.md) especifica Ubuntu 24.04 LTS. Em 2026-05-24, Ubuntu 26.04 LTS (Resolute Raccoon) já foi lançado (abril/2026), mas upgrades diretos só liberam a partir de 26.04.1 (previsto agosto/2026) e o instalador automático do Coolify ainda não lista suporte para 26.04.

Seguimos 24.04 porque o ADR pede, o instalador garante, e a recomendação Canonical é aguardar 26.04.1 para servidores de produção.

**Status:** não reabrir o ADR agora. Reavaliar depois que Coolify suportar 26.04 explicitamente **e** 26.04.1 tiver saído.

### C.3 — Portas extras do Coolify (6001, 6002)

[ADR-0003](../adr/0003-infra-hostinger-vps-coolify.md) não menciona portas adicionais além de 8000. Doc oficial ([firewall](https://coolify.io/docs/knowledge-base/server/firewall)) cita explicitamente 8000 (dashboard HTTP), 6001 (realtime) e 6002 (terminal access, ≥ 4.0.0-beta.336). Abrimos as três provisoriamente no hardening; o fechamento pertence ao fluxo Cloudflare do [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md). Não é divergência de decisão, é detalhe operacional ausente do ADR.

**Status:** opcional incluir as portas no ADR-0003 na próxima revisão para reduzir descoberta repetida pelos futuros agentes.

## Resultado

Estado final observável ao término desta sessão:

- VPS Hostinger KVM 2 com Ubuntu 24.04 LTS provisionada, hostname de fábrica `srv1700377`, timezone default.
- IPv4 público anotado em `~/secrets/talkingpres-bootstrap.md`.
- Snapshot `pre-hardening` disponível como botão de undo.
- SSH key Ed25519 cadastrada; primeiro `ssh root@<SEU_IP_VPS>` autenticando via chave.
- Coolify 4.1.0 rodando via template Hostinger: 4 containers saudáveis, sem admin criado, sem proxy ativo, `/data/coolify` íntegro.
- Banco interno do Coolify com 0 usuários.
- Auditoria do template completa: o que veio dentro está mapeado.

## Dívidas

- **Hardening base ainda não aplicado.** A máquina nasceu hostil e segue hostil até o hardening fechar. Executado em sessão seguinte; ver [0002-hardening-talkingpres-prod.md](0002-hardening-talkingpres-prod.md).
- **Admin Coolify não criado.** Aguarda gerenciador de senhas em sessão futura e conclusão do hardening + DNS/TLS Cloudflare. Procedimento previsto no [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md).
- **Proxy Traefik não confirmado em execução.** Sobe no primeiro deploy ou quando admin loga e configura Server → Proxy. Validação acontecerá junto com a criação do admin.
- **DNS Cloudflare ainda não trocado para a zona `talkingpres.com`.** Nameservers ainda no registrar externo. Bloqueio para emitir cert Let's Encrypt no Traefik. Procedimento no [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md).
