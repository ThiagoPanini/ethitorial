---
title: Criar VPS Hostinger com Coolify e hardening base
description: Reproduz o primeiro passo real desta infra (registrado nos ai-ops): provisionar a VPS Hostinger com template Coolify, auditar o que veio instalado e aplicar o hardening base antes de criar qualquer admin.
nav_title: VPS Hostinger + Coolify
---

Este guide transforma os registros reais de [setup inicial](../ai-ops/0001-setup-inicial-talkingpres-prod.md) e [hardening](../ai-ops/0002-hardening-talkingpres-prod.md) em uma receita reproduzível. A execução real (registrada nos ai-ops) usou Hostinger KVM 2 com template "Ubuntu 24.04 with Coolify"; portanto, o passo principal não foi instalar Coolify manualmente, mas auditar o que o template entregou antes de expor qualquer credencial administrativa.

O escopo termina com a VPS endurecida, usuário `deploy` funcional, Coolify rodando e portas temporárias abertas apenas até a etapa Cloudflare. Não cria admin Coolify, não troca nameservers e não configura Postgres ou backup R2. Esses passos pertencem ao guide seguinte.

> ⚠️ **Bootstrap, não runbook.** Este guide é bootstrap, não runbook de produção. Depois que a aplicação e o banco existirem, operações cotidianas devem seguir [runbooks](../runbooks/) e não repetir passos destrutivos daqui.

## Example

Como exemplo, criamos a máquina `panini-vps` na Hostinger, usando o template Coolify. Vamos provisionar a VPS, corrigir o detalhe do wizard que pode pular a SSH key, auditar os containers do template, endurecer SSH/sistema e deixar a superfície mínima necessária para a próxima etapa.

Pré-condições:

- **Ambiente local POSIX:** shell `bash`/`zsh` com `ssh`, `ssh-keygen`, `dig`, `curl`. Em Windows, use WSL2 (`wsl --install` no PowerShell admin) ou Git Bash. Operadores em PowerShell puro vão encontrar comandos locais que não existem nativamente.
- Conta Hostinger ativa com plano VPS KVM contratado.
- Chave SSH local dedicada, por exemplo `~/.ssh/panini_vps_ed25519`.
- Gerenciador de segredos disponível para passphrase SSH e futuras senhas.
- Arquivo local fora do repo para placeholders, por exemplo `~/secrets/panini-vps-bootstrap.md`.
- Segunda janela de terminal disponível para validar SSH antes de fechar sessões antigas.
- `<SEU_EMAIL>` definido (será usado em SSH key comment e nas notificações de patches).
- Placeholders definidos antes de colar comandos: `<SEU_IP_VPS>`, `<NOME_VPS>` (ex.: `panini-vps`), `<USUARIO_DEPLOY>` (ex.: `deploy`) e `<PORTA_COOLIFY_DIRETA>` depois da auditoria.

### Passo 1: Provisionar a VPS com template Coolify

No hPanel da Hostinger, crie ou reinstale a VPS usando o template **Ubuntu 24.04 with Coolify**. O template entrega Ubuntu, Docker e Coolify preinstalados, conforme a documentação da Hostinger sobre o template Coolify.

Se o wizard mostrar campo de SSH key, cole o conteúdo da chave pública:

```bash
cat ~/.ssh/panini_vps_ed25519.pub
ssh-keygen -lf ~/.ssh/panini_vps_ed25519.pub
```

Na execução real, o fluxo do template pulou silenciosamente esse campo e a VPS nasceu só com senha de root. Se isso acontecer, corrija antes de prosseguir: hPanel -> VPS -> **SSH Access** ou **SSH Keys** -> adicione a mesma chave pública.

Crie um snapshot manual chamado `pre-hardening` antes de tocar em `sshd`, firewall ou boot. Depois anote o IPv4 público, o fingerprint da chave e o hostname inicial em `~/secrets/panini-vps-bootstrap.md`, então valide o primeiro acesso:

```bash
ssh -i ~/.ssh/panini_vps_ed25519 root@<SEU_IP_VPS>
```

Resultado esperado:

```text
Welcome to Ubuntu 24.04.x LTS
root@srv...:~#
```

Se o SSH pedir senha, a chave não entrou na VPS. Volte ao hPanel e cadastre a public key; não siga para hardening enquanto o acesso por chave não estiver provado.

> ✅ **Checkpoint do Passo 1 — não avance sem confirmar:**
>
> - [ ] IPv4 público anotado em `~/secrets/panini-vps-bootstrap.md`
> - [ ] Snapshot `pre-hardening` confirmado visualmente no painel Hostinger (não confiar em "cliquei"; abrir a lista de snapshots)
> - [ ] Fingerprint da chave local registrado (`ssh-keygen -lf ~/.ssh/panini_vps_ed25519.pub`)
> - [ ] `ssh -i ~/.ssh/panini_vps_ed25519 root@<SEU_IP_VPS>` autentica sem prompt de senha
>
> Se algum item falhar, **pare aqui**. Hardening em VPS sem snapshot ou sem chave provada é caminho rápido para auto-bloqueio.

### Passo 2: Auditar o template antes de criar admin Coolify

O template Coolify já deixa serviços rodando. Antes de abrir a UI e criar o primeiro admin, audite o estado entregue. Se a UI ou a doc da Hostinger mencionar outra porta, confira o estado real com `ss` e `docker ps`; na execução real registrada e na documentação self-hosted do Coolify, o dashboard direto estava na `8000`, enquanto a documentação atual da Hostinger menciona `3000`.

```bash
sudo docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
sudo docker inspect coolify --format '{{.Config.Image}}'
sudo docker ps --filter 'name=proxy' --format '{{.Names}} {{.Image}}'
sudo ss -tlnp | grep -E ':(3000|8000|6001|6002)\b'
sudo ls -la /data/coolify | head
sudo docker exec coolify-db psql -U coolify -d coolify -tAc 'select count(*) from users;'
```

Resultado observado na execução real:

- `coolify`, `coolify-db`, `coolify-redis` e `coolify-realtime` saudáveis.
- Coolify `4.1.0`.
- Nenhum proxy Traefik rodando ainda; ele sobe quando há domínio ou recurso que exija proxy.
- Portas `8000`, `6001` e `6002` escutando via Docker.
- `/data/coolify` íntegro.
- Banco interno do Coolify com `0` usuários.

Defina `<PORTA_COOLIFY_DIRETA>` a partir do `ss` antes de abrir a UI. Se aparecer `3000`, use `http://<SEU_IP_VPS>:3000`; se aparecer `8000`, use `http://<SEU_IP_VPS>:8000`.

O `0` no banco de usuários é importante: a rota de registro do admin está aberta. A decisão segura foi **não criar admin** enquanto DNS, TLS, Bitwarden e restrição de origem ainda não estavam fechados. Criar a conta cedo demais concentraria poder administrativo em uma VPS ainda exposta por IP.

### Passo 3: Aplicar hardening de sistema e SSH

No **Terminal A**, mantenha a sessão `root` original aberta. Atualize o sistema. Se `cloud-init` aparecer como `kept back` por hold da Hostinger, preserve o conffile local:

```bash
apt update
apt -y full-upgrade
apt -y autoremove

apt-mark unhold cloud-init
apt install -y -o Dpkg::Options::="--force-confold" cloud-init
apt-mark hold cloud-init
```

Defina identidade da máquina e crie o usuário operacional:

```bash
hostnamectl set-hostname panini-vps
timedatectl set-timezone UTC

adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-deploy
chmod 0440 /etc/sudoers.d/90-deploy
visudo -c
```

`deploy` nasce sem senha local porque o acesso humano será por chave SSH. Se uma senha local foi criada por engano em algum fluxo anterior, bloqueie-a:

```bash
passwd -l deploy
```

Copie a chave autorizada para `deploy`:

```bash
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

No **Terminal B**, prove o novo caminho antes de fechar a sessão root do Terminal A:

```bash
ssh -i ~/.ssh/panini_vps_ed25519 deploy@<SEU_IP_VPS>
sudo whoami
```

Resultado esperado:

```text
root
```

Se o Terminal B não entrar como `deploy`, pare aqui. Não feche o Terminal A.

Agora endureça o SSH em arquivo dedicado:

```bash
sudo tee /etc/ssh/sshd_config.d/00-hardening.conf > /dev/null <<'EOF'
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
EOF

sudo sshd -t
```

> 💡 **`sudo sshd -t` retorna silêncio quando passa.** Exit code `0` e nenhuma saída significam config válida. Qualquer linha impressa é erro de sintaxe a corrigir antes de reiniciar. Confirme com `echo $?` se quiser ver o exit code explicitamente.

Depois reinicie o serviço:

```bash
sudo systemctl restart ssh
```

Valide em um novo terminal:

```bash
ssh -i ~/.ssh/panini_vps_ed25519 root@<SEU_IP_VPS>
ssh -i ~/.ssh/panini_vps_ed25519 deploy@<SEU_IP_VPS>
```

O primeiro comando deve falhar com `Permission denied (publickey)`. O segundo deve abrir sessão como `deploy`.

Se os dois comportamentos não forem verdadeiros ao mesmo tempo, volte pelo Terminal A e corrija `/etc/ssh/sshd_config.d/00-hardening.conf` antes de encerrar qualquer sessão antiga.

### Passo 4: Fechar a base operacional provisória

Instale firewall, banimento de força bruta e upgrades de segurança:

```bash
sudo apt install -y ufw fail2ban unattended-upgrades apt-listchanges

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   comment 'SSH'
sudo ufw allow 80/tcp   comment 'HTTP'
sudo ufw allow 443/tcp  comment 'HTTPS'
sudo ufw allow <PORTA_COOLIFY_DIRETA>/tcp comment 'Coolify dashboard (temporario)'
sudo ufw allow 6001/tcp comment 'Coolify realtime (temporario)'
sudo ufw allow 6002/tcp comment 'Coolify terminal (temporario)'
sudo ufw enable
sudo ufw status verbose
```

A porta `<PORTA_COOLIFY_DIRETA>` e as portas `6001`/`6002` são temporárias. A documentação de firewall do Coolify lista portas para acesso direto ao dashboard, realtime e terminal; depois que houver domínio via proxy, elas podem ser fechadas.

Configure fail2ban com backend `systemd`:

```bash
sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled = true
port    = 22
EOF

sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

Configure unattended upgrades security-only:

```bash
sudo tee /etc/apt/apt.conf.d/52panini-vps-unattended-upgrades > /dev/null <<'EOF'
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
EOF

sudo unattended-upgrade --dry-run --debug 2>&1 | tail -30
```

> ⚠️ **`Mail` requer agente local de envio.** As linhas `Mail` e `MailReport "on-change"` só funcionam se a VPS tiver um MTA local capaz de entregar email (`sendmail`, `postfix`, `msmtp`). Sem isso, `unattended-upgrades` aplica patches em silêncio e reboots às 04:00 UTC acontecem sem aviso — observabilidade silenciosamente desligada.
>
> Caminho mínimo: `sudo apt install -y msmtp msmtp-mta` e configurar `/etc/msmtprc` com um relay SMTP (ex.: SES, Brevo, ou Gmail App Password). Caminho alternativo: trocar `Mail`+`MailReport` por integração via webhook usando script em `Unattended-Upgrade::DPkg::Post-Invoke`. Se MTA é setup pesado demais agora, registre como dívida operacional explícita e siga; ao menos a config fica preparada para quando o MTA existir.

Proof final:

```bash
hostname
whoami
sudo whoami
sudo ufw status verbose
sudo docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Status}}'
```

Estado esperado: hostname `panini-vps`, usuário `deploy`, sudo funcional, UFW ativo, fail2ban ativo e containers Coolify saudáveis.

## Critério de sucesso

Considere este guide concluído apenas se todos os checks passarem:

- Snapshot `pre-hardening` confirmado visualmente no painel Hostinger antes de qualquer mudança em sshd/ufw.
- `ssh root@<SEU_IP_VPS>` falha com `Permission denied (publickey)`.
- `ssh deploy@<SEU_IP_VPS>` entra por chave e `sudo whoami` retorna `root`.
- `sudo ufw status verbose` mostra `22`, `80`, `443` e as portas temporárias do Coolify.
- `sudo fail2ban-client status sshd` mostra a jail ativa.
- `sudo docker ps --filter 'name=coolify'` mostra containers Coolify saudáveis.
- `<PORTA_COOLIFY_DIRETA>` foi descoberta por `ss`, não assumida.
- `sudo unattended-upgrade --dry-run --debug` termina sem erros.
- MTA local configurado para entregar `Unattended-Upgrade::Mail`, **ou** dívida operacional explícita registrada para configurar depois (observabilidade de patches é gap consciente, não esquecimento).

## Next steps

A VPS existe e está endurecida, mas ainda não está pronta para administração cotidiana: o painel Coolify continua temporariamente acessível por IP e as portas internas ainda estão abertas.

Próximo:

- [Criar conta Cloudflare e preparar DNS, R2 e MCP](0002-configurar-cloudflare-r2-mcp.md) — migra a zona para Cloudflare, publica o subdomínio do Coolify, prepara R2 e habilita MCP para agentes.
- [Runbook de operação da VPS](../runbooks/0001-operacao-vps.md) — comandos cotidianos depois do hardening.
- [ADR-0003 — Infra Hostinger VPS + Coolify](../adr/0003-infra-hostinger-vps-coolify.md) — decisão arquitetural que justifica VPS, Coolify e volume local.

## References

- [Hostinger — Coolify VPS template](https://www.hostinger.com/support/9615197-how-to-use-the-coolify-vps-template-at-hostinger/)
- [Hostinger — SSH keys at VPS](https://www.hostinger.com/support/4792364-how-to-use-ssh-keys-at-hostinger-vps/)
- [Coolify — Firewall](https://coolify.io/docs/knowledge-base/server/firewall)
- [Coolify — Server introduction](https://coolify.io/docs/knowledge-base/server/introduction)
