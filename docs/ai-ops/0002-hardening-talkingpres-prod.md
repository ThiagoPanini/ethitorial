---
data: 2026-05-24
operacao: hardening base da VPS de produção
maquina: talkingpres-prod (Hostinger KVM 2, Ubuntu 24.04 LTS)
operador: Thiago Panini
agente: Claude Code
resultado: parcial
dividas:
  - admin Coolify não criado (aguarda CLI Bitwarden e DNS/TLS Cloudflare)
  - proxy Traefik não confirmado em execução
  - portas 8000/6001/6002 ainda abertas no UFW (provisórias até DNS/TLS)
  - UFW ainda permite 80/443 do mundo (restringir para ranges Cloudflare)
  - backup Postgres ainda não configurado
  - "⚠️ CONFLITO COM PASSO SEGUINTE: o hardening aplicado aqui (PermitRootLogin no + AllowUsers deploy) bloqueia a conectividade SSH que o Coolify precisa para funcionar. Ao configurar o servidor no Coolify (guide 0003, Passo 3), é necessário: (a) adicionar bloco Match Address 172.16.0.0/12 com PermitRootLogin prohibit-password no sshd_config, (b) chave pública do Coolify em /root/.ssh/authorized_keys, (c) ignoreip = 172.16.0.0/12 no fail2ban/jail.local. Ver lição 0001 §Exceção estrutural: orquestradores containerizados."
referencias:
  lesson: ../lessons/0001-hardening-de-vps-linux.md
  guide_proximo: ../guides/0002-configurar-cloudflare-r2-mcp.md
  setup_anterior: 0001-setup-inicial-talkingpres-prod.md
  adr: ../adr/0003-infra-hostinger-vps-coolify.md
---

# 20260524 — Hardening base da VPS talkingpres-prod

> 📌 **Registro histórico.** Nesta data a máquina se chamava `talkingpres-prod`. Em 2026-05-31 virou infra agnóstica `panini-vps` (ver [ai-ops 0003](0003-generalizar-vps-panini.md) e [ADR-0016](../adr/0016-vps-agnostica-multi-projeto.md)). O hardening descrito permanece válido; só o nome da máquina e o do arquivo `52talkingpres-unattended-upgrades` (→ `52panini-vps-unattended-upgrades`) mudaram depois. Este registro não é reescrito.

Registro narrativo da sessão em que a VPS de produção do talkingpres foi endurecida da configuração de template Hostinger até superfície estreita. Conceitos gerais sobre cada técnica e por que ela existe vivem na [lição 0001 — Hardening de VPS Linux](../lessons/0001-hardening-de-vps-linux.md). Este documento registra **o que efetivamente fizemos nesta máquina específica nesta data específica**, em continuação à sessão anterior de [setup inicial](0001-setup-inicial-talkingpres-prod.md).

## Cenário

Estado herdado da sessão anterior:

- VPS Hostinger KVM 2, Ubuntu 24.04 LTS, hostname de fábrica `srv1700377`.
- IPv4 público anotado em `~/secrets/talkingpres-bootstrap.md`.
- Snapshot `pre-hardening` como botão de undo.
- SSH key Ed25519 cadastrada, login `ssh root@<SEU_IP_VPS>` funcionando.
- Coolify 4.1.0 rodando via template Hostinger (4 containers saudáveis, sem admin criado, sem proxy ativo).
- Portas `8000/6001/6002` escutando no host via `docker-proxy`.

Ferramentas locais no operador: `ssh ≥ 8`, segunda janela de terminal disponível para a regra de "linha de vida" durante mudanças em sshd/ufw.

## Execução

Ordem cronológica das oito etapas. Cada uma resolveu uma porta que a anterior deixou aberta.

### 1. Atualização de pacotes

```bash
apt update
apt -y full-upgrade
apt -y autoremove
```

Resultado final esperado:

```text
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
```

### 2. Resolução do `cloud-init` em `hold`

**Sintoma**: durante o `full-upgrade`, `cloud-init` apareceu como `kept back`. `apt` não atualiza pacotes em `hold` automaticamente.

**Causa**: a Hostinger congelou o pacote em uma versão específica via `apt-mark hold` para preservar customizações do template Coolify em `/etc/cloud/cloud.cfg`. Sobrescrever esse arquivo com a versão genérica do pacote derrubaria o provisionamento do template.

**Resolução**: atualizar explicitamente preservando o arquivo de configuração local:

```bash
apt-mark unhold cloud-init
apt install -y -o Dpkg::Options::="--force-confold" cloud-init
apt-mark hold cloud-init
```

Validação: `0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.` no `apt update && apt -y full-upgrade` seguinte.

### 3. Hostname e timezone

```bash
hostnamectl set-hostname talkingpres-prod
timedatectl set-timezone UTC
```

`talkingpres-prod` comunica função e ambiente, substitui o nome de fábrica `srv1700377`. UTC é a única hora estável que esta máquina vai conhecer.

### 4. Criação do usuário `deploy`

```bash
adduser deploy
usermod -aG sudo deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-deploy
chmod 0440 /etc/sudoers.d/90-deploy
visudo -c
```

`visudo -c` retornou:

```text
/etc/sudoers: parsed OK
/etc/sudoers.d/90-deploy: parsed OK
```

`NOPASSWD` justificado: autenticação forte (chave Ed25519 com passphrase) já aconteceu na borda SSH; senha local de `deploy` ficou bloqueada (sem senha definida). Trade-off documentado na [lição](../lessons/0001-hardening-de-vps-linux.md). Trade-off só se sustenta enquanto SSH por senha continuar desabilitado.

### 5. Chave SSH para o usuário deploy

```bash
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Validação em segunda janela de terminal (regra de linha de vida — primeira sessão como root mantida aberta até a validação passar):

```bash
ssh -i ~/.ssh/talkingpres_ed25519 deploy@<SEU_IP_VPS>
sudo whoami
```

Saída:

```text
root
```

`deploy` operacional com sudo funcional.

### 6. Hardening do sshd

Arquivo dedicado em `/etc/ssh/sshd_config.d/00-hardening.conf`:

```sshconfig
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30s
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers deploy
```

Validação de sintaxe antes do restart:

```bash
sudo sshd -t
echo $?
```

Saída:

```text
0
```

Restart:

```bash
sudo systemctl restart ssh
```

Validação em terceira janela de terminal (primeira sessão como root ainda mantida aberta):

```bash
ssh -i ~/.ssh/talkingpres_ed25519 root@<SEU_IP_VPS>
```

Saída:

```text
root@<SEU_IP_VPS>: Permission denied (publickey).
```

```bash
ssh -i ~/.ssh/talkingpres_ed25519 deploy@<SEU_IP_VPS>
```

Saída: prompt `deploy@talkingpres-prod:~$`. Caminho novo provado, caminho antigo fechado. Sessões antigas como root encerradas.

### 7. UFW + fail2ban + unattended-upgrades

```bash
sudo apt install -y ufw fail2ban unattended-upgrades apt-listchanges

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   comment 'SSH'
sudo ufw allow 80/tcp   comment 'HTTP'
sudo ufw allow 443/tcp  comment 'HTTPS'
sudo ufw allow 8000/tcp comment 'Coolify dashboard (temporario)'
sudo ufw allow 6001/tcp comment 'Coolify realtime (temporario)'
sudo ufw allow 6002/tcp comment 'Coolify terminal (temporario)'
sudo ufw enable
```

Comentário `(temporario)` nas portas Coolify é a pista para o futuro de que elas têm prazo de validade (fecham no [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md), passo 2).

Validação:

```bash
sudo ufw status verbose
```

Saída (truncada):

```text
Status: active
22/tcp                     ALLOW IN    Anywhere                   # SSH
80/tcp                     ALLOW IN    Anywhere                   # HTTP
443/tcp                    ALLOW IN    Anywhere                   # HTTPS
8000/tcp                   ALLOW IN    Anywhere                   # Coolify dashboard (temporario)
6001/tcp                   ALLOW IN    Anywhere                   # Coolify realtime (temporario)
6002/tcp                   ALLOW IN    Anywhere                   # Coolify terminal (temporario)
```

Fail2ban em `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled = true
port    = 22
```

`backend = systemd` foi escolha consciente para Ubuntu 24.04 (journald é o destino dos logs do sshd; backend de arquivo levaria a jail silenciosamente vazio).

```bash
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

Saída:

```text
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     0
|  `- File list:        (systemd journal)
`- Actions
   |- Currently banned: 0
   |- Total banned:     0
   `- Banned IP list:
```

### 8. unattended-upgrades security-only com reboot automático

Override em `/etc/apt/apt.conf.d/52talkingpres-unattended-upgrades`:

```text
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Mail "<SEU_EMAIL>";
Unattended-Upgrade::MailReport "on-change";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
```

Reboot às `04:00 UTC` é janela aceita para o estágio atual (sem usuários em produção). Quando houver tráfego sensível a downtime, a janela merece revisão.

Validação:

```bash
sudo unattended-upgrade --dry-run --debug 2>&1 | tail -30
```

Saída final:

```text
No packages found that can be upgraded unattended and no pending auto-removals
```

## Obstáculos e resoluções

### `cloud-init` em `hold` impedindo atualização limpa

Já documentado na seção 2 da execução. Resolução com `apt-mark unhold` + `--force-confold` + `apt-mark hold` para preservar `/etc/cloud/cloud.cfg`.

### Risco de auto-bloqueio em sshd e ufw

**Mitigação aplicada**: regra de linha de vida em três etapas consecutivas (hardening sshd, ativação ufw, restrição de portas). Para cada mudança, mantivemos a sessão ativa antiga aberta enquanto validávamos a porta nova em segunda janela. Nenhuma sessão fechada antes da próxima ter sido provada.

### Decisão de NÃO criar admin Coolify nesta sessão

**Contexto**: o painel do Coolify estava acessível em `http://<SEU_IP_VPS>:8000` com rota `/register` disponível. Tentação operacional de "fechar" a sidequest criando o admin.

**Decisão**: adiar. Duas razões:

1. Ordem de hardening: admin é poder concentrado (deploys, banco, secrets); abrir antes do DNS+TLS+UFW restrict significaria expor superfície administrativa numa máquina ainda parcialmente protegida.
2. Restrição operacional: senha do admin precisa ir direto para Bitwarden como `talkingpres/coolify-admin`, sem escala em buffer transitório. CLI `bw` não estava disponível nesta sessão.

Dívida explícita registrada. Próxima sessão prevista no [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md).

## Resultado

Estado final observável ao término desta sessão:

- Hostname `talkingpres-prod`, timezone `UTC`.
- Sistema atualizado, `cloud-init` em versão correta com conffile preservado.
- Usuário `deploy` com `sudo NOPASSWD` validado por `visudo -c`.
- SSH só aceita chave Ed25519, não aceita `root`, lista de usuários permitidos = `deploy`.
- UFW ativo, default-deny incoming, default-allow outgoing.
- Portas abertas: `22`, `80`, `443`, `8000` (temp), `6001` (temp), `6002` (temp).
- Fail2ban com jail `sshd` ativa, backend `systemd`, `bantime=1h`, `findtime=10m`, `maxretry=5`.
- unattended-upgrades security-only, reboot automático em `04:00 UTC`, dry-run sem erros.
- Coolify continua rodando (mesma versão 4.1.0), agora protegido pela base endurecida.

Smoke test em terminal local:

```bash
ssh -i ~/.ssh/talkingpres_ed25519 root@<SEU_IP_VPS>     # Permission denied (publickey) — esperado
ssh -i ~/.ssh/talkingpres_ed25519 deploy@<SEU_IP_VPS>   # sucesso, prompt deploy@talkingpres-prod
sudo whoami                                              # root
```

Tudo conforme esperado.

## Dívidas

Itens explicitamente deixados para sidequest seguinte. Cada um mapeia para um guide ou ai-ops futuro.

- **Admin Coolify não criado.** Próxima sessão: criar após DNS Cloudflare ativo, com gerenciador de senhas disponível. Procedimento: [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md).
- **Proxy Traefik não confirmado em execução.** Sobe no primeiro deploy ou ao configurar Server → Proxy no painel. Validação acontecerá junto com criação do admin.
- **Portas `8000/6001/6002` ainda abertas para o mundo.** Provisórias. Fecham depois que o subdomínio Coolify estiver respondendo via Cloudflare. Procedimento: [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md), passo 2.
- **UFW ainda permite `80/443` do mundo todo.** Próxima ação: restringir aos ranges Cloudflare via `ufw-cloudflare-sync.sh` + systemd timer mensal. Procedimento: [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md), passo 2.
- **DNS Cloudflare ainda não configurado.** Zona ainda no registrar externo, nameservers não trocados. Bloqueio para emitir cert Let's Encrypt. Procedimento: [guide 0002](../guides/0002-configurar-cloudflare-r2-mcp.md), passo 1.
- **Backup do Postgres ainda não configurado.** Sem isso, a VPS guarda dados não reproduzíveis. Guide futuro depois da Cloudflare e R2 estarem prontos.
- **Runbook de restore mensal do Postgres não escrito.** Backup não testado não é backup. Rastreado no [ROADMAP](../ROADMAP.md).
