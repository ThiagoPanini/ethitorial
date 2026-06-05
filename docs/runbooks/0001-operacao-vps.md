---
numero: 0001
titulo: Operação básica da VPS
tipo: runbook
data: 2026-05-25
tags: [vps, ssh, ufw, fail2ban, coolify, ops]
tldr: Comandos de referência para operar a VPS `panini-vps` (infra agnóstica multi-projeto) depois do hardening base. Runbook permanente, consultável, não progressivo.
---

# Runbook 0001 — Operação básica da VPS

> Este documento é runbook, não tutorial. Use para consultar comandos durante operação ou diagnóstico. Para entender os conceitos por trás de cada decisão de hardening, leia a [lição 0001 — Hardening de VPS Linux](../lessons/0001-hardening-de-vps-linux.md). Para o registro do que foi efetivamente feito nesta máquina, veja os [registros ai-ops](../ai-ops/). Para reproduzir setup de VPS ou Cloudflare, veja os [guides ativos](../guides/).

## Estado esperado

- Hostname: `<NOME_VPS>`; na execução atual, `panini-vps`.
- Timezone: `UTC`.
- Login SSH cotidiano: `<USUARIO_DEPLOY>@<SEU_IP_VPS>`.
- Login SSH como `root`: desabilitado.
- Autenticação por senha no SSH: desabilitada.
- Usuário de operação: `<USUARIO_DEPLOY>` com `sudo NOPASSWD`.
- Firewall: `ufw` ativo, entrada negada por padrão, saída permitida.
- Portas abertas nesta fase: `22`, `80`, `443`, `8000`, `6001`, `6002`.
- Fail2ban: jail `sshd` ativa com backend `systemd`.
- Atualizações automáticas: security-only, reboot automático às `04:00 UTC`.

Os valores reais dos placeholders vivem no caderno de bootstrap, **gitignored** (regra `.local/`, nunca versionado — o repo é público):

```bash
.local/panini-vps-bootstrap.md
```

Segredos de verdade vivem no Bitwarden com prefixo `panini-vps/`.

## Login SSH

Use sempre a chave dedicada:

```bash
ssh -i ~/.ssh/panini_vps_ed25519 <USUARIO_DEPLOY>@<SEU_IP_VPS>
```

Depois de entrar, valide identidade e sudo:

```bash
hostname
whoami
sudo whoami
```

Resultado esperado:

```text
<NOME_VPS>
<USUARIO_DEPLOY>
root
```

Atalho opcional em `~/.ssh/config`:

```sshconfig
Host panini-vps
  HostName <SEU_IP_VPS>
  User <USUARIO_DEPLOY>
  IdentityFile ~/.ssh/panini_vps_ed25519
  IdentitiesOnly yes
```

Com o atalho:

```bash
ssh panini-vps
```

## Autenticação

Para carregar a chave no agent:

```bash
ssh-add ~/.ssh/panini_vps_ed25519
ssh-add -l
```

Para testar sem depender do agent:

```bash
ssh -o BatchMode=yes -i ~/.ssh/panini_vps_ed25519 <USUARIO_DEPLOY>@<SEU_IP_VPS> hostname
```

Testes esperados depois do hardening:

```bash
ssh -i ~/.ssh/panini_vps_ed25519 root@<SEU_IP_VPS>
```

Deve falhar com:

```text
Permission denied (publickey).
```

Senha do usuário `<USUARIO_DEPLOY>` pode estar bloqueada. Isso é esperado: o acesso humano é por chave SSH; o sudo é controlado por `/etc/sudoers.d/90-<USUARIO_DEPLOY>`.

## Regra de segurança antes de mudanças sensíveis

Antes de mexer em `sshd`, `ufw`, chave SSH ou sudoers:

1. Abra uma sessão SSH e mantenha aberta.
2. Faça a mudança nessa sessão.
3. Valide em outro terminal que um novo login funciona.
4. Só então feche a sessão antiga.

Validações mínimas:

```bash
sudo sshd -t
ssh -i ~/.ssh/panini_vps_ed25519 <USUARIO_DEPLOY>@<SEU_IP_VPS> hostname
sudo ufw status verbose
```

Nunca rode `ufw enable` sem antes permitir `22/tcp`.

## Saúde geral

Comandos rápidos:

```bash
hostnamectl
timedatectl
uptime
df -h
free -h
sudo systemctl status ssh --no-pager
sudo systemctl status ufw --no-pager
sudo systemctl status fail2ban --no-pager
sudo systemctl status docker --no-pager
```

Checar pacotes:

```bash
sudo apt update
apt list --upgradable
```

Aplicar atualizações manuais planejadas:

```bash
sudo apt -y full-upgrade
sudo apt -y autoremove
```

Depois, valide:

```bash
apt list --upgradable
test -f /var/run/reboot-required && cat /var/run/reboot-required || true
```

## Debug de SSH

Do terminal local:

```bash
ssh -vvv -i ~/.ssh/panini_vps_ed25519 <USUARIO_DEPLOY>@<SEU_IP_VPS>
```

Na VPS:

```bash
sudo journalctl -u ssh -n 100 --no-pager
sudo sshd -T | grep -E '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|allowusers)'
sudo sshd -t
```

Permissões esperadas:

```bash
stat -c '%U:%G %a %n' ~/.ssh ~/.ssh/authorized_keys
```

Para `<USUARIO_DEPLOY>`, espere:

```text
<USUARIO_DEPLOY>:<USUARIO_DEPLOY> 700 /home/<USUARIO_DEPLOY>/.ssh
<USUARIO_DEPLOY>:<USUARIO_DEPLOY> 600 /home/<USUARIO_DEPLOY>/.ssh/authorized_keys
```

Se a host key mudar por reinstalação ou restore de snapshot, remova a entrada antiga localmente apenas depois de confirmar no hPanel que a VPS é a mesma:

```bash
ssh-keygen -R <SEU_IP_VPS>
ssh-keygen -F <SEU_IP_VPS>
```

## Firewall

Ver regras:

```bash
sudo ufw status verbose
sudo ufw status numbered
```

Regras esperadas nesta fase:

```text
22/tcp    ALLOW IN    Anywhere
80/tcp    ALLOW IN    Anywhere
443/tcp   ALLOW IN    Anywhere
8000/tcp  ALLOW IN    Anywhere
6001/tcp  ALLOW IN    Anywhere
6002/tcp  ALLOW IN    Anywhere
```

Abrir porta temporária:

```bash
sudo ufw allow <PORTA>/tcp comment '<MOTIVO>'
sudo ufw status verbose
```

Remover regra por número:

```bash
sudo ufw status numbered
sudo ufw delete <NUMERO>
```

Cuidados:

- `22/tcp` precisa ficar aberto enquanto SSH depender da internet pública.
- `8000/6001/6002` são temporárias para Coolify antes de DNS/TLS.
- Depois de Cloudflare + TLS, siga a seção 8 do setup para restringir origem e fechar portas temporárias.
- Docker pode criar regras próprias de iptables. Sempre valide exposição real com `ss`, `docker ps` e teste externo.

## Fail2ban

Status:

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

Logs:

```bash
sudo journalctl -u fail2ban -n 100 --no-pager
sudo journalctl -u ssh -n 100 --no-pager
```

Desbanir IP, se você se bloquear por engano:

```bash
sudo fail2ban-client set sshd unbanip <SEU_IP_PUBLICO>
```

Descobrir seu IP público localmente:

```bash
curl https://ifconfig.me
```

## Coolify

Painel temporário antes do DNS:

```text
http://<SEU_IP_VPS>:8000
```

Checar containers:

```bash
sudo docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
sudo docker ps --filter 'name=proxy' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

Checar portas:

```bash
sudo ss -tlnp | grep -E ':(80|443|8000|6001|6002)\b'
```

Logs principais:

```bash
sudo docker logs --tail 100 coolify
sudo docker logs --tail 100 coolify-realtime
sudo docker logs --tail 100 coolify-db
sudo docker logs --tail 100 coolify-redis
```

Banco do Coolify, para auditoria sem expor senha:

```bash
sudo docker exec coolify-db psql -U coolify -d coolify -tAc 'select count(*) from users;'
sudo docker exec coolify-db psql -U coolify -d coolify -tAc "select id,name,proxy->>'type',proxy->>'status' from servers;"
```

Proxy Traefik esperado:

```bash
sudo docker ps --filter 'name=proxy' --format '{{.Names}} {{.Image}} {{.Status}}'
```

Se não houver proxy rodando, isso pode ser normal antes do primeiro login/configuração em `Server → Proxy`.

## Logs e diagnóstico

Sistema:

```bash
sudo journalctl -p warning -n 100 --no-pager
sudo journalctl --since '1 hour ago' --no-pager
```

Serviço específico:

```bash
sudo journalctl -u <SERVICO> -n 100 --no-pager
sudo systemctl status <SERVICO> --no-pager
```

Rede:

```bash
ip addr
ip route
sudo ss -tlnp
curl -I http://127.0.0.1:8000
curl -I http://<SEU_IP_VPS>:8000
```

Docker:

```bash
sudo docker ps
sudo docker ps -a
sudo docker logs --tail 100 <CONTAINER>
sudo docker inspect <CONTAINER> --format '{{.Config.Image}}'
```

## Gestão de serviços

Use `status` antes de `restart`:

```bash
sudo systemctl status <SERVICO> --no-pager
sudo systemctl restart <SERVICO>
sudo systemctl status <SERVICO> --no-pager
```

Serviços importantes:

- `ssh`
- `ufw`
- `fail2ban`
- `docker`
- `unattended-upgrades`

Evite reiniciar `docker` sem janela de manutenção: isso pode derrubar Coolify e aplicações.

## Reboot planejado

Antes:

```bash
uptime
who
sudo docker ps
test -f /var/run/reboot-required && cat /var/run/reboot-required || true
```

Reboot:

```bash
sudo reboot
```

Depois:

```bash
ssh -i ~/.ssh/panini_vps_ed25519 <USUARIO_DEPLOY>@<SEU_IP_VPS> uptime
ssh -i ~/.ssh/panini_vps_ed25519 <USUARIO_DEPLOY>@<SEU_IP_VPS> 'sudo docker ps --filter "name=coolify"'
```

## Backups e snapshots

Antes de mudanças de risco:

- Criar snapshot manual no hPanel quando a mudança mexer em boot, SSH, firewall, Docker ou volumes importantes.
- Não tratar snapshot da VPS como backup primário do produto.
- Quando Postgres da aplicação existir, backups de dados devem seguir o guide futuro de Postgres em R2.

## Coisas para não fazer

- Não logar como `root` por SSH.
- Não reabilitar `PasswordAuthentication`.
- Não rodar `ufw reset` em sessão remota sem plano de recuperação.
- Não remover `22/tcp` antes de configurar alternativa validada.
- Não commitar IPs privados, senhas, tokens, chaves ou dumps.
- Não editar schema de banco manualmente; quando houver app, mudanças de schema passam por migration.
- Não publicar portas de containers manualmente sem revisar UFW/Docker.

## Quando algo parecer quebrado

Checklist rápido:

```bash
ssh -i ~/.ssh/panini_vps_ed25519 <USUARIO_DEPLOY>@<SEU_IP_VPS> hostname
sudo ufw status verbose
sudo fail2ban-client status sshd
sudo systemctl status ssh --no-pager
sudo systemctl status docker --no-pager
sudo docker ps
sudo journalctl -p warning -n 100 --no-pager
```

Se SSH não entrar:

1. Teste com `ssh -vvv`.
2. Confirme se a chave está no agent com `ssh-add -l`.
3. Confirme pelo hPanel se a VPS está ligada.
4. Use console web da Hostinger apenas como recuperação.
5. Não altere firewall ou sshd às cegas sem uma sessão funcional.
