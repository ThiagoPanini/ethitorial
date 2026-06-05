---
numero: 0001
titulo: Hardening de VPS Linux — conceitos, princípios e cada decisão da base
data: 2026-05-25
versao: 1.1
validade: revalidar em 2027-05, ou quando próxima LTS de Ubuntu sair; afirmações específicas pressupõem OpenSSH ≥ 8.7 e Ubuntu 22.04+
tags: [security, vps, ssh, firewall, linux, conceitos]
publico_alvo: desenvolvedores ou operadores com Unix-fluência básica (sudo, apt, systemctl, modelo de permissões)
tldr: Aula conceitual sobre transformar uma VPS recém-provisionada em superfície estreita. Modelo de ameaça, defesa em profundidade, menor privilégio, hardening de SSH diretiva por diretiva, papel real do firewall e do fail2ban, política de patches. Genérico, evergreen, aplicável a qualquer projeto.
---

# Lição 0001 — Hardening de VPS Linux: estreitando a máquina sem perder o acesso

> Aula sobre os conceitos e princípios do hardening base de uma VPS Linux exposta à internet pública. Não é receita executável — para isso, veja um [guide](../guides/) ou um [runbook](../runbooks/). É o raciocínio por trás de cada decisão. Aplicações concretas a máquinas reais do talkingpres estão listadas no [apêndice](#apêndice--aplicações-documentadas-no-talkingpres).

## Objetivos de aprendizagem

Ao terminar esta lição, você será capaz de:

1. **Explicar** o modelo de ameaça mundano que justifica o hardening base de uma VPS exposta à internet pública.
2. **Justificar** a ordem específica das nove etapas do hardening, e por que inverter qualquer uma é arriscado.
3. **Defender** ou criticar `NOPASSWD` no sudoers, articulando as premissas que sustentam o trade-off.
4. **Distinguir** por que o firewall é a última camada de defesa, não a primeira.
5. **Identificar** os pontos onde Docker e UFW conflitam e como validar a exposição real de portas.
6. **Decidir** quando adiar a criação de credenciais administrativas, e por quê.

## Pré-requisitos assumidos

Esta lição assume familiaridade com:

- Linha de comando Unix/Linux básica (`ls`, `cd`, `cat`, redirecionamento, pipes).
- Conceito de **usuário e grupo** Unix; modelo de permissões (`chmod`, `chown`).
- Uso elementar de `sudo` e `apt` (Debian/Ubuntu).
- Conceito de **daemon** e gerenciamento de serviços via `systemctl`.
- Noção do que é SSH (sem precisar saber configurar).

Não assume: experiência prévia com hardening, iptables, PAM, ou administração de servidor de produção.

Se algum dos pré-requisitos é novo para você, recomendamos passar antes pelos primeiros capítulos do *The Linux Command Line* (William Shotts — [linuxcommand.org/tlcl.php](http://linuxcommand.org/tlcl.php), gratuito) ou equivalente.

## Versão e validade

| Atributo | Valor |
|---|---|
| Versão | 1.1 |
| Data | 2026-05-25 |
| Sistema-base alvo | Ubuntu 24.04 LTS (válido também para 22.04) |
| OpenSSH alvo | ≥ 8.7 (release 2021) |
| Revalidação sugerida | 2027-05, ou quando a próxima LTS de Ubuntu sair |
| O que envelhece mais rápido | sintaxe de `unattended-upgrades`, comportamento Docker+UFW, nomes de diretivas do `sshd` |

## Índice

1. [A máquina nasce hostil](#a-máquina-nasce-hostil)
2. [Antes de começar: três decisões que precedem o hardening](#antes-de-começar-três-decisões-que-precedem-o-hardening)
3. [Atualizar a base antes de qualquer cadeado](#atualizar-a-base-antes-de-qualquer-cadeado)
4. [Nomear a máquina é trabalho de observabilidade](#nomear-a-máquina-é-trabalho-de-observabilidade)
5. [Deixar de ser `root` antes que `root` deixe a gente](#deixar-de-ser-root-antes-que-root-deixe-a-gente)
6. [A chave que se ganha, e o porquê do SSH ser caprichoso](#a-chave-que-se-ganha-e-o-porquê-do-ssh-ser-caprichoso)
7. [Cada linha do `sshd_config` é uma decisão consciente](#cada-linha-do-sshd_config-é-uma-decisão-consciente)
8. [O firewall não é a primeira camada, é a última](#o-firewall-não-é-a-primeira-camada-é-a-última)
9. [Vigilância que reage, não que previne](#vigilância-que-reage-não-que-previne)
10. [Patches enquanto dormimos](#patches-enquanto-dormimos)
11. [Quando NÃO criar credenciais administrativas](#quando-não-criar-credenciais-administrativas)
12. [Limites desta lição](#limites-desta-lição)
13. [Leitura adicional](#leitura-adicional)
14. [Glossário](#glossário)
15. [Apêndice — Aplicações documentadas no talkingpres](#apêndice--aplicações-documentadas-no-talkingpres)

---

## A máquina nasce hostil

Existe um instante curto, entre o clique em "Create VPS" no painel do provedor e o primeiro `ssh root@<IP>`, em que a máquina existe, está roteada na internet pública, escuta na porta 22 com login por senha aceito, e ninguém ainda decidiu quem ela é. Nesse momento ela não é nossa — é de qualquer scanner que estiver passando pelo bloco de IPs do provedor naquele segundo. E, considerando o volume de tráfego de reconhecimento que rola na internet, esse "qualquer scanner" não é hipótese, é certeza estatística.

Isso é o ponto de partida. Não há um momento mágico onde a VPS é "segura por padrão". Existe um intervalo onde ela é exposta com defaults amistosos, e existe o que fazemos dentro desse intervalo. Hardening, no fundo, é narrar a transformação de uma máquina genérica numa máquina opinada: com identidade, com lista nominal de quem entra, com portas justificadas uma a uma, e com uma rotina silenciosa que aplica patches enquanto dormimos.

O modelo de ameaça aqui é mundano, e propositalmente. Não estamos defendendo contra um adversário estatal. Estamos defendendo contra scanners automatizados, brute force de SSH, e exploração oportunista de pacotes desatualizados — a base estatística de qualquer servidor exposto. Defesa em profundidade não é exagero retórico: é a aritmética de que várias camadas finas, cada uma reduzindo um vetor diferente, compõem uma barreira melhor do que uma camada única "boa". Princípio do menor privilégio segue a mesma lógica — cada credencial, cada porta, cada serviço só existe porque alguém precisou e justificou.

> 💡 **Princípio operacional — nunca serrar o galho**
>
> As duas etapas mais perigosas, SSH e firewall, são justamente aquelas onde, se erramos, perdemos o acesso pelo qual estamos editando. Toda mudança nelas deve ser feita com uma segunda sessão SSH aberta em outro terminal, servindo de linha de vida enquanto a primeira testa a porta nova. Nunca se serra o galho onde a gente está sentado.

### Diagrama mental: as camadas de defesa

```text
                  Internet pública
                         │
                         ▼
              ┌──────────────────────┐
              │ Proxy/CDN (opcional) │  ← absorve DDoS, termina TLS
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Firewall (UFW)     │  ← última camada, não primeira
              └──────────┬───────────┘
                         │ só 22/80/443 abertos
                         ▼
              ┌──────────────────────┐
              │  sshd endurecido     │  ← AllowUsers nominal
              └──────────┬───────────┘
                         │ só usuário operacional
                         ▼
              ┌──────────────────────┐
              │  Chave Ed25519       │  ← passphrase no operador
              │  + permissões 600    │
              └──────────┬───────────┘
                         │ chave + passphrase
                         ▼
              ┌──────────────────────┐
              │  sudo (NOPASSWD)     │  ← elevação consciente
              └──────────┬───────────┘
                         ▼
                    root efetivo

       Em paralelo, em segundo plano:
        • fail2ban observa logs e bane IPs reincidentes
        • unattended-upgrades aplica patches de segurança
        • snapshot do provedor = botão de undo
```

Cada camada faz uma coisa, e tudo o que escapa de uma é capturado pela seguinte. Para um atacante chegar à última, ele precisaria ter (1) acesso à internet onde a VPS é roteada, (2) bypass do firewall, (3) match com `AllowUsers`, (4) posse da chave Ed25519 e (5) conhecimento da passphrase. Cada uma reduz o universo de candidatos em ordens de magnitude.

---

## Antes de começar: três decisões que precedem o hardening

Três decisões aparecem antes mesmo do primeiro comando, e cada uma molda o que vem depois.

### Snapshot como botão de undo

Snapshot, na maioria dos provedores VPS, é uma imagem do disco num ponto no tempo, restaurável em um clique. É barato — planos KVM costumam incluir um slot manual gratuito — e é o único botão de undo confiável quando você está prestes a tocar em sshd, ufw ou sudoers.

Snapshot é diferente de **backup**, e a confusão é comum:

| | Snapshot | Backup |
|---|---|---|
| **O que copia** | Estado completo do disco da VPS num ponto no tempo | Tipicamente dados específicos (banco, arquivos) em destino externo |
| **Onde mora** | Storage do provedor da VPS, ligado à mesma conta | Provedor diferente (ideal: outra empresa, outra região) |
| **Granularidade** | Tudo ou nada (a VPS inteira volta ao ponto X) | Por dataset, por dia/hora |
| **Propósito** | Reverter mudança de **estado de sistema** (sshd, ufw, pacotes) | Recuperar **dados em evolução** (banco, uploads) |
| **Limite** | Não preserva dados gerados depois do snapshot | Não recupera estado de sistema |

Para hardening, snapshot manual basta como botão de undo: ele protege contra "quebrei o sshd e perdi acesso". Para o banco de aplicação ou uploads de usuário, é assunto de outra camada — dump diário para storage **externo** à máquina. A VPS inteira não é o ativo crítico; ela é reproduzível. Os dados são.

> 💡 **Heurística operacional**
>
> Snapshot antes de tocar em qualquer coisa que possa (a) trancar você fora — sshd, ufw, sudoers — ou (b) apagar volume — Docker, banco, destinos S3. Snapshot é barato; recuperar de "perdi acesso e não tenho rollback" é caro.

### Templates de provedor

Provedores muitas vezes oferecem templates (Coolify, WordPress, n8n, GitLab) que entregam a VPS com um stack já rodando. Templates economizam tempo e fecham classes de erro de instalação, mas pedem uma postura específica: tratar a entrega como **input**, não como output.

Quando você herda quatro containers rodando, banco interno com schema próprio e diretórios de dados pré-criados, sua primeira ação não é "começar a usar" — é **auditar**:

- Quais containers estão rodando? Quais imagens? Quais versões?
- Que usuário (UID) cada um usa?
- Quais portas estão publicadas no host?
- Onde estão os diretórios de dados? Quem é o owner?
- E principalmente, o que **não** está lá: admin pré-criado, proxy em execução, validações pendentes.

Template não é hardening. Template não substitui leitura crítica do que está rodando como `root` numa máquina nova exposta à internet.

### A ordem das operações

A sequência de hardening que se respeita não foi escolhida por gosto — foi escolhida porque cada etapa fecha uma porta que a etapa anterior deixou aberta:

1. **Atualizar sistema** — fechar vulnerabilidades já conhecidas antes de construir em cima.
2. **Hostname e timezone** — dar identidade observável à máquina antes que apareça em logs.
3. **Criar usuário operacional e validar sudo** — habilitar operação não-root antes de demolir o caminho do root.
4. **Replicar chave SSH para o usuário** — garantir o caminho novo antes de fechar o antigo.
5. **Endurecer SSH** — fechar `root` e senha somente depois do caminho novo estar provado.
6. **Ativar firewall** — fechar portas inesperadas com SSH já liberado e endurecido.
7. **Ativar fail2ban** — adicionar resposta automática contra ataques que ainda assim chegarem.
8. **Configurar patches automáticos** — automatizar a manutenção da base.
9. **Só então** abrir painéis administrativos, criar credenciais sensíveis, expor serviços.

Cada inversão dessa ordem é um pé na frente da bala.

> ⚠️ **Exemplo contrastivo**
>
> O que acontece se você inverter os passos 5 e 6? Você ativa o firewall com `deny incoming` antes de endurecer o sshd. Resultado: sshd ainda aceita root por senha, mas agora você precisa garantir que a porta 22 está liberada no firewall **e** que sua sessão sobreviveu ao `ufw enable`. Mais ainda: o vetor mais batido (brute force contra root) continua aberto porque o sshd ainda não foi endurecido. Você gastou risco operacional na ordem errada e não fechou o vetor de maior valor.
>
> Inverter 3 e 4 (criar usuário antes de copiar chave): você acaba com um usuário sem caminho de entrada, e quando desabilitar root via SSH no passo 5, vai precisar do console web do provedor para se recuperar.

> 🎯 **Teste rápido**
>
> **Pergunta:** Por que o passo 4 (replicar chave) precisa vir antes do passo 5 (desabilitar `root` no SSH)?
>
> <details>
> <summary>Resposta</summary>
> Porque o passo 5 fecha o caminho `root` via SSH. Se o caminho novo (usuário operacional + chave) não estiver provado funcionar antes, você termina com nenhum caminho de entrada e precisa do console web do provedor para recuperar.
> </details>

---

## Atualizar a base antes de qualquer cadeado

Imagens de sistema dos provedores costumam ter dias, às vezes semanas, entre o build e o momento em que ligamos a VPS. Esse intervalo é exatamente o tempo em que vulnerabilidades já publicadas ainda não chegaram à imagem. Atualizar antes de configurar o resto é construir em cima de uma base coerente em vez de uma fotografia antiga.

```bash
apt update
apt -y full-upgrade
apt -y autoremove
```

`apt update` mexe só no catálogo de pacotes — não instala nada, apenas atualiza a lista de o que está disponível. `full-upgrade` instala e aceita ajustes mais agressivos de dependência quando necessário, diferente do `upgrade` simples, que recua diante de qualquer conflito. `autoremove` limpa pacotes órfãos (dependências que ficaram instaladas mas não são mais necessárias por nenhum pacote ativo).

### Armadilha: pacotes em `hold`

Uma surpresa comum em VPS de templates: alguns pacotes vêm marcados como `hold`, estado em que o `apt` se recusa a atualizar o pacote automaticamente, porque o provedor o congelou em uma versão específica. `cloud-init` (o agente que provedores usam para aplicar o provisionamento inicial — hostname, chaves SSH, dados injetados pelo template) é o caso clássico. Atualizar sem cuidado pode sobrescrever `/etc/cloud/cloud.cfg` com a versão genérica do pacote, perdendo customizações do template.

A saída segura é atualizar explicitamente preservando o arquivo de configuração local, com a flag de manter o **conffile** (arquivo de configuração mantido como "do usuário" pelos pacotes Debian/Ubuntu) existente:

```bash
apt-mark unhold cloud-init
apt install -y -o Dpkg::Options::="--force-confold" cloud-init
apt-mark hold cloud-init
```

Quando o terminal cuspir `0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`, a base está limpa.

---

## Nomear a máquina é trabalho de observabilidade

```bash
hostnamectl set-hostname <NOME_VPS>
timedatectl set-timezone UTC
```

Hostname não é cosmético. Ele aparece no prompt, nos logs do `journald` (daemon de log estruturado do systemd), nos cabeçalhos de e-mail de relatório do `unattended-upgrades`, e em qualquer dashboard que vier a agregar essa máquina. O nome de fábrica — algo como `srv1700377` — comunica nada. Um nome descritivo (`<projeto>-prod`, `<projeto>-staging`) comunica função e ambiente, que é exatamente o que se quer ler num alerta às 3 da manhã.

UTC é a decisão chata mas correta. No momento que existir mais de uma máquina, ou uma integração que cruze regiões, ou um cron rodando às "4 da manhã", a única forma de correlacionar eventos sem perder tempo é todo mundo falar a mesma língua temporal. Horário de verão deslocando logs em uma hora é o tipo de armadilha que custa caro em incidente. UTC é o esperanto da operação.

---

## Deixar de ser `root` antes que `root` deixe a gente

`root` não tem freio. É o usuário onde qualquer typo num `rm -rf` é apagar o sistema. Mais relevante para o modelo de ameaça: é o usuário cujo nome qualquer scanner já sabe. Quando o login por SSH é como `root`, o atacante já tem metade da credencial — resta tentar adivinhar a senha. Quando o login é como `operador` (ou qualquer outro nome que você escolher), mesmo se o atacante puder testar senhas — não pode, mas suponhamos — ele precisa primeiro descobrir que existe um usuário com esse nome.

A receita é: criar o usuário, validar que ele está no grupo `sudo`, e conceder `sudo` via arquivo dedicado em `/etc/sudoers.d/`:

```bash
adduser <USUARIO_OPERACIONAL>
usermod -aG sudo <USUARIO_OPERACIONAL>
echo "<USUARIO_OPERACIONAL> ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-<USUARIO_OPERACIONAL>
chmod 0440 /etc/sudoers.d/90-<USUARIO_OPERACIONAL>
visudo -c
```

`visudo -c` é o teste de sintaxe do sudoers. Importa porque o sudoers é um arquivo onde um erro de sintaxe quebra `sudo` inteiro. E numa máquina onde, em poucos minutos, `root` via SSH deixará de existir, quebrar `sudo` é o equivalente operacional a perder a chave do carro dentro do carro. Validamos antes de confiar.

### O trade-off do `NOPASSWD`

`NOPASSWD` exige justificativa explícita, porque a posição naive ("sudo deve sempre pedir senha") tem mérito real. O argumento a favor é simples mas tem cláusulas.

**Premissa 1:** o fator de autenticação que importa nesta máquina é a chave Ed25519 protegida por passphrase do lado do operador. **Premissa 2:** a senha local do usuário operacional está bloqueada (sem senha definida via `adduser` sem `--disabled-password`, ou explicitamente bloqueada com `passwd -l`).

Sob essas premissas, pedir uma senha local para `sudo` adiciona atrito sem adicionar fator de autenticação. Quem entrou já provou que tem a chave privada e a passphrase — evidência mais forte do que qualquer senha local seria.

O trade-off é consciente, e só se sustenta enquanto as duas premissas valerem. Se SSH por senha for reabilitado, ou se a chave deixar de ter passphrase, `NOPASSWD` cai junto e precisa ser revertido.

> 🎯 **Teste rápido**
>
> **Pergunta:** Por que `visudo -c` deve ser executado **antes** de qualquer modificação em sudoers ficar valendo?
>
> <details>
> <summary>Resposta</summary>
> Porque um erro de sintaxe em sudoers quebra `sudo` por inteiro. Numa máquina onde root via SSH será desativado em seguida, perder `sudo` significa perder administração remota. `visudo -c` valida a sintaxe sem aplicar; é o cinto antes da curva.
> </details>

---

## A chave que se ganha, e o porquê do SSH ser caprichoso

A escolha padrão hoje é Ed25519: curva elíptica moderna, chaves curtas, assinaturas rápidas, sem os caveats de geração ruim que historicamente atormentaram RSA. Para dar dimensão da diferença:

| Algoritmo | Tamanho típico da chave pública | Tamanho da assinatura |
|---|---|---|
| Ed25519 | 32 bytes | 64 bytes |
| RSA-2048 | ~256 bytes | ~256 bytes |
| RSA-4096 | ~512 bytes | ~512 bytes |
| ECDSA P-256 | 32 bytes (compactada) | 64-72 bytes |

A chave pública vai para `/home/<USUARIO_OPERACIONAL>/.ssh/authorized_keys`. A privada nunca sai da máquina do operador, e deve estar protegida por passphrase.

O SSH é deliberadamente paranoico com permissões dos arquivos relacionados a chave:

```text
700  /home/<USUARIO_OPERACIONAL>/.ssh
600  /home/<USUARIO_OPERACIONAL>/.ssh/authorized_keys
```

Se a pasta `.ssh` estiver legível por grupo ou por outros, ou se `authorized_keys` estiver com qualquer permissão além de `600`, o `sshd` ignora silenciosamente a chave e o login falha. Esse comportamento existe porque, num sistema multi-usuário, `authorized_keys` mal protegido é uma porta dos fundos — qualquer usuário local que conseguisse escrever lá poderia adicionar a própria chave e virar o usuário operacional por SSH. O SSH prefere falhar a confiar em arquivos potencialmente comprometidos. É uma das raras vezes que um daemon prefere ser inconveniente a ser permissivo, e a gente agradece.

A validação é prosaica: conectar como o novo usuário, executar `sudo whoami`, e ver o terminal responder `root`. Nesse momento, `root` direto por SSH ainda funciona — esse é o próximo a cair.

---

## Cada linha do `sshd_config` é uma decisão consciente

O hardening do SSH deve ser colocado em `/etc/ssh/sshd_config.d/00-hardening.conf` em vez de editar o arquivo principal. Ubuntu 24.04 honra os `.conf` desse diretório como overrides, e isolar nossas decisões num arquivo dedicado deixa óbvio o que veio do projeto e o que veio do pacote. Auditoria futura agradece.

O conteúdo padrão:

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
AllowUsers <USUARIO_OPERACIONAL>
```

### Tabela de referência: cada diretiva, propósito e categoria

| Diretiva | Categoria | O que faz | Por que está aqui |
|---|---|---|---|
| `PermitRootLogin no` | Identidade | Recusa conexão SSH como `root` | Fecha brute force contra usuário cujo nome todo scanner já tem |
| `AllowUsers <user>` | Identidade | Allowlist nominal de quem pode entrar | Robusto contra criação inesperada de usuários no futuro |
| `PasswordAuthentication no` | Método de auth | Recusa senha como método de login | Corta classe inteira de ataques automatizados |
| `PubkeyAuthentication yes` | Método de auth | Aceita chave pública | Explícito vale a clareza (default já é `yes` em ≥ 8.7) |
| `ChallengeResponseAuthentication no` | Método de auth | Desativa challenge-response (nome legado) | Necessário em OpenSSH < 8.7 onde a diretiva ainda existe |
| `KbdInteractiveAuthentication no` | Método de auth | Desativa modo interativo keyboard | Em ≥ 8.7 é a única diretiva (a anterior foi removida) |
| `UsePAM yes` | Integração | Mantém integração com PAM | PAM não é só senha — cuida de sessão, limites, logging |
| `MaxAuthTries 3` | Orçamento | Limita tentativas por conexão | Reduz custo de varredura |
| `LoginGraceTime 30s` | Orçamento | Tempo máximo para autenticar | Conexões zumbi não esgotam slots |
| `ClientAliveInterval 300` | Sessão | Ping a cada 300s para verificar cliente vivo | Detecta sessões abandonadas |
| `ClientAliveCountMax 2` | Sessão | Derruba após 2 pings sem resposta | Limpa sessões esquecidas (~10 min) |
| `X11Forwarding no` | Feature disable | Desliga forwarding gráfico | Servidores headless não precisam |

### Por que cada categoria importa

**Identidade.** `PermitRootLogin no` corta o vetor mais batido: brute force contra o usuário cujo nome todo scanner já tem cabeado. `AllowUsers <USUARIO_OPERACIONAL>` é o último cinto — cria uma allowlist nominal: mesmo que algum dia exista outro usuário no sistema, o SSH só negocia conexão para o usuário listado. Tornar o conjunto explícito é mais robusto do que confiar que ninguém vai criar usuários inesperados.

**Método de autenticação.** `PasswordAuthentication no` corta a possibilidade de qualquer ataque baseado em senha, o que, combinado com a próxima dupla, fecha bem a porta. `PubkeyAuthentication yes` é redundante por default mas explícito vale a clareza.

> ⚠️ **Armadilha técnica: ChallengeResponse vs KbdInteractive**
>
> `ChallengeResponseAuthentication no` e `KbdInteractiveAuthentication no` resolvem o mesmo problema em momentos diferentes da evolução do OpenSSH:
>
> - Em **OpenSSH < 8.7** (anterior a 2021), eram diretivas distintas tratáveis separadamente em algumas distribuições. Desabilitar só uma podia deixar o caminho da outra aberto, permitindo que o PAM aceitasse "senha" sob disfarce de prompt interativo.
> - Em **OpenSSH ≥ 8.7**, `ChallengeResponseAuthentication` foi **removida** e apenas `KbdInteractiveAuthentication` permanece como diretiva válida.
>
> Manter as duas no arquivo é cinto-e-suspensório que sobrevive a versões mistas: a versão antiga ignora silenciosamente a diretiva nova, a versão nova ignora a diretiva removida, e em ambos os casos o caminho interativo fica fechado. Confirme sua versão local com `ssh -V` antes de assumir.

`UsePAM yes` permanece ligado porque o PAM (Pluggable Authentication Modules — framework de autenticação modular do Linux) cuida de coisas além de senha — sessão, limites, logging — e nada disso colide com senha desabilitada no SSH.

**Orçamento por conexão.** `MaxAuthTries 3` e `LoginGraceTime 30s` apertam o orçamento de cada tentativa de conexão. Limitar tentativas evita força bruta dentro de uma única conexão; limitar tempo evita que conexões zumbi ocupem slots.

**Sessão.** `ClientAliveInterval 300` com `ClientAliveCountMax 2` derruba sessões inativas após cerca de dez minutos sem resposta. Sessões esquecidas em terminais abertos são uma forma mundana de superfície ampliada — um laptop esquecido aberto num café é entrada potencial.

**Feature disable.** `X11Forwarding no` desliga um vetor que servidores headless tipicamente não precisam: encaminhar X11 por SSH é uma classe de superfície que só interessa em workstations.

### Exceção estrutural: orquestradores containerizados (Coolify, Portainer, similares)

`PermitRootLogin no` + `AllowUsers <USUARIO_OPERACIONAL>` são as diretivas certas para o acesso externo. Mas orquestradores auto-hospedados como Coolify e Portainer se conectam ao host via SSH como `root` para executar comandos Docker — é a mecânica interna deles, não uma opção configurável.

Sem exceção explícita, o hardening bloqueia o próprio orquestrador que você acabou de instalar. E o sintoma não é óbvio: o fail2ban bane o IP do container após as primeiras falhas, fazendo o erro parecer "connection refused" (ban de rede) em vez de "permission denied" (restrição de usuário) — mascarando a causa real.

A solução correta é usar o bloco `Match Address` do OpenSSH para sobreescrever `PermitRootLogin` **apenas** para a rede Docker interna, mantendo a política restritiva para todo tráfego externo:

```sshconfig
# Em /etc/ssh/sshd_config.d/00-hardening.conf

# Políticas globais (aplicam ao mundo externo)
PermitRootLogin no
AllowUsers deploy

# Exceção para orquestradores containerizados (Coolify, Portainer, etc.)
# Match Address sobrescreve PermitRootLogin apenas para a rede Docker interna
Match Address 172.16.0.0/12
    PermitRootLogin prohibit-password
```

`172.16.0.0/12` cobre o range inteiro que o Docker usa para suas redes bridge (tipicamente `172.16.x.x` a `172.31.x.x`). `prohibit-password` permite root com chave, mas rejeita senha — preservando o vetor de autenticação forte.

Para que o orquestrador consiga autenticar, sua chave pública precisa estar em `/root/.ssh/authorized_keys` no host:

```bash
# Verificar chave pública da instância Coolify (exemplo)
sudo docker exec coolify cat /var/www/html/storage/app/ssh/keys/id.root@host.docker.internal.pub

# Adicionar ao authorized_keys do root
sudo tee -a /root/.ssh/authorized_keys <<< "<CHAVE_PUBLICA_DO_ORQUESTRADOR>"
sudo chmod 600 /root/.ssh/authorized_keys
sudo chown root:root /root/.ssh/authorized_keys
```

**Momento certo para fazer isso:** ainda durante o hardening, **antes** da primeira tentativa de validação no UI do orquestrador. Cada tentativa falhada conta como falha de autenticação para o fail2ban (ver seção a seguir).

> ⚠️ **AllowUsers não aceita sintaxe `user@CIDR` para ranges — somente IPs exatos**
>
> A diretiva `AllowUsers` aceita `root@172.16.1.5` (IP exato) mas **não** `root@172.16.0.0/12` (CIDR). Para liberar root de um range, use `Match Address` com `PermitRootLogin`, não `AllowUsers`. O bloco `Match` sobrescreve as diretivas globais para os endereços que batem com o range especificado.

### Validar antes de aplicar

Antes de reiniciar o `sshd`, `sudo sshd -t` testa a sintaxe do config — o equivalente do `visudo -c` para SSH. Só então `sudo systemctl restart ssh`. E, do outro terminal (aquela linha de vida que nunca se fechou), tentar login como `root` e ver `Permission denied (publickey)` retornar. A porta dos fundos foi pregada.

> 🎯 **Teste rápido**
>
> **Pergunta:** Por que isolar o hardening do SSH em `/etc/ssh/sshd_config.d/00-hardening.conf` em vez de editar `/etc/ssh/sshd_config` direto?
>
> <details>
> <summary>Resposta</summary>
> Duas razões: (1) auditoria — fica óbvio o que veio do projeto vs. o que veio do pacote; (2) sobrevivência a `apt upgrade` — um upgrade do `openssh-server` pode sobrescrever o arquivo principal, mas os `.conf` no diretório `sshd_config.d/` ficam preservados. O prefixo `00-` garante que carregam antes de qualquer override posterior.
> </details>

---

## O firewall não é a primeira camada, é a última

É tentador pensar no firewall como a barreira principal. Não é. O firewall é uma rede de segurança para cobrir falhas das camadas acima:

- Cuida do serviço que escutou em `0.0.0.0` por engano.
- Cuida do container Docker que publicou uma porta sem querer.
- Cuida do daemon novo instalado por dependência transitiva que abriu socket numa porta razoável.

As camadas que importam mais — autenticação por chave, lista nominal de usuários — já foram montadas. O firewall é o que pega o que escapou.

A política base é a única que faz sentido para um servidor exposto:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

Negar tudo na entrada por padrão é a regra que faz qualquer serviço novo nascer invisível até alguém liberar explicitamente. Permitir tudo na saída é o ajuste pragmático: servidores precisam baixar pacote, puxar imagem Docker, falar com APIs, resolver DNS. Restringir egress vale a pena num ambiente com modelo de ameaça mais alto, ou quando há um proxy de saída controlando o que pode sair — não é o cenário típico de uma VPS de aplicação, e fingir que é só adicionaria atrito.

As portas mínimas para uma VPS que sirva HTTP:

```bash
sudo ufw allow 22/tcp   comment 'SSH'
sudo ufw allow 80/tcp   comment 'HTTP'
sudo ufw allow 443/tcp  comment 'HTTPS'
```

VPS que não serve HTTP (apenas worker, agendador, processador de filas) pode dispensar 80 e 443. Avalie por serviço, não por costume.

> ⚠️ **Armadilha clássica: `ufw enable` sem `22/tcp` liberada**
>
> Ativar a política `deny incoming` enquanto a porta SSH não está na allowlist é o atalho mais rápido para perder o acesso à própria máquina. A ordem segura é:
>
> 1. Definir defaults (`deny incoming`, `allow outgoing`).
> 2. Liberar `22/tcp` **explicitamente**.
> 3. Liberar demais portas necessárias.
> 4. `ufw enable` (vai perguntar; responda `y`).
> 5. Testar novo login SSH em **outro terminal**, mantendo o atual aberto.

Quando há portas temporárias (painéis de admin antes do TLS estar no lugar, sockets de instalação), abra com comentário `(temporario)` no UFW. O comentário é a pista para o futuro de que essas portas têm prazo de validade e devem fechar quando a alternativa segura estiver pronta.

### Sutileza importante: Docker e UFW não conversam direito

O daemon do Docker injeta regras próprias na cadeia `DOCKER` do `iptables` (frontend clássico do kernel Linux para regras de filtragem de pacotes). Essas regras correm **antes** das regras do UFW para tráfego destinado a containers.

Resultado: `docker run -p 5432:5432 ...` pode tornar uma porta acessível de fora mesmo que `ufw status` jure que não.

> ⚠️ **Armadilha: a saída do UFW não é fonte da verdade quando Docker está presente**
>
> A defesa prática é não confiar só na saída do UFW para inferir o que está exposto. O conjunto mínimo de evidências para saber a realidade:
>
> ```bash
> sudo ss -tlnp           # quem está escutando em quê
> sudo docker ps          # o que cada container publicou
> sudo ufw status verbose # o que o UFW pensa que está aceitando
> ```
>
> Se uma porta aparece em `ss -tlnp` ligada a um processo Docker, ela provavelmente está exposta — mesmo que o UFW diga o contrário. Para gerenciar isso explicitamente, projetos como [`ufw-docker`](https://github.com/chaifeng/ufw-docker) ajustam a ordem das regras, mas introduzem-no apenas se medir um vazamento real.

---

## Vigilância que reage, não que previne

`fail2ban` não impede invasão. Não é essa a função. O que ele faz é ler logs continuamente, identificar padrões de falha (tipicamente, tentativas mal-sucedidas no `sshd`), e banir o IP atacante temporariamente via `iptables` quando um limiar é cruzado.

Numa máquina onde SSH só aceita chave e `PasswordAuthentication` está desligado, a chance prática de alguém entrar por brute force já é desprezível. Então por que rodar `fail2ban`?

Por duas razões:

1. **Reduz ruído nos logs.** Sem `fail2ban`, scanners ficam pingando indefinidamente e poluindo `journalctl -u ssh` com tentativas que nunca vão dar certo, dificultando ver eventos legítimos.
2. **Adiciona resposta automática a erros futuros nossos.** Se uma mudança involuntariamente expuser autenticação por senha, `fail2ban` pelo menos contém a janela enquanto o erro não é detectado.

É seguro contra erros futuros nossos, não contra atacantes presentes.

Configuração mínima em `/etc/fail2ban/jail.local`:

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

A janela é razoável: cinco falhas em dez minutos viram um ban de uma hora. Apertar mais que isso começa a banir operadores legítimos que erram passphrase algumas vezes.

> ⚠️ **Armadilha: containers que fazem SSH para o host são banidos antes de revelar a causa real**
>
> Se você roda um orquestrador containerizado (Coolify, Portainer, n8n com execuções SSH), o container vai tentar SSH para o host. Enquanto a configuração não estiver correta (chave não autorizada, `PermitRootLogin no` bloqueando, etc.), cada tentativa conta como falha de autenticação. Depois de `maxretry` falhas, o fail2ban bane o IP do container — e o erro passa a parecer "connection refused" em vez de "permission denied", mascarando a causa real.
>
> **A solução é adicionar a subnet Docker ao `ignoreip` no momento do hardening**, antes de qualquer tentativa de conexão do orquestrador:
>
> ```ini
> [DEFAULT]
> ignoreip = 127.0.0.1/8 ::1 172.16.0.0/12
> bantime  = 1h
> findtime = 10m
> maxretry = 5
> backend  = systemd
> ```
>
> `172.16.0.0/12` cobre todo o range de redes bridge do Docker. IPs nesse range nunca serão banidos pelo fail2ban, independente de quantas falhas de autenticação ocorram. O fail2ban ainda monitora e loga as tentativas — apenas não bane.

> ⚠️ **Armadilha de Ubuntu 24.04: backend de arquivo gera jail vazio silenciosamente**
>
> A linha que merece nota é `backend = systemd`. Historicamente, `fail2ban` lia diretamente arquivos como `/var/log/auth.log`. Ubuntu 24.04 já não popula `/var/log/auth.log` por padrão — os logs de autenticação vivem no `journald`. O backend `systemd` faz o `fail2ban` ler do journal direto, que é o caminho idiomático no Ubuntu moderno.
>
> Configurar backend de arquivo no 24.04 leva a um jail silenciosamente vazio: o serviço está rodando, mas não vê nada, e a gente fica com falsa sensação de cobertura.
>
> Verificar com `sudo fail2ban-client status sshd` e confirmar que o jail está enxergando o `sshd` é o teste que separa configuração real de configuração teórica.

---

## Patches enquanto dormimos

Vulnerabilidades de segurança têm janela. Entre o dia que um CVE (Common Vulnerabilities and Exposures, identificador padronizado de uma vulnerabilidade pública) é publicado e o dia que um exploit público circula, o relógio anda. Servidor sem patch é servidor cujo dono está apostando que ninguém vai usar essa janela contra ele. A aposta às vezes ganha, mas a casa, com o tempo, sempre vence.

Automação aqui é a única forma realista. Memória humana não escala para checar atualizações de segurança diariamente em todas as máquinas. `unattended-upgrades` aplica patches sozinho, e a configuração padrão recomendada para servidor é security-only com reboot automático em janela de baixo tráfego:

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

> ⚠️ **Sobre os origens ESM (Expanded Security Maintenance)**
>
> As linhas `${distro_id}ESMApps:...` e `${distro_id}ESM:...` só fazem efeito se a máquina tem **Ubuntu Pro** ativo (subscription gratuita até 5 máquinas para uso pessoal, paga para uso comercial). Sem subscription, essas origens são silenciosamente ignoradas e o `unattended-upgrades` aplica apenas patches do canal `-security` padrão. Para verificar se ESM está ativo: `pro status`.
>
> Para uma VPS sem subscription Ubuntu Pro, **deixe as linhas mesmo assim** — elas não atrapalham, e ativam automaticamente se você anexar a máquina ao Ubuntu Pro depois.

### Por que security-only

A decisão central aqui é **security-only**. Em vez de deixar a máquina puxar todos os updates do repositório `updates`, restringimos a `-security` e aos canais ESM. Atualizações comuns mudam comportamento de bibliotecas e ferramentas — boas para uma estação de trabalho, ruins para um servidor de produção onde mudança de comportamento numa madrugada qualquer pode quebrar o que estava funcionando.

Security-only é a posição conservadora consciente: a gente aceita a interrupção mínima de patches críticos e rejeita o turbilhão de upgrades funcionais não pedidos.

### Por que reboot automático

`Automatic-Reboot true` com janela em `04:00 UTC` é a contrapartida honesta. Algumas atualizações — em particular as de kernel, glibc, openssl — só entram em vigor após reboot. Sem reboot, o pacote novo está no disco mas o código vulnerável continua mapeado em memória, e a sensação de "atualizado" é cosmética.

Marcar uma janela previsível (baixo tráfego, em UTC porque é a única hora estável que essa máquina conhece) é trocar disponibilidade contínua por segurança real. Para um projeto sem usuários em produção ainda, é uma troca trivial. Quando houver tráfego sensível a downtime, a janela merece revisão — talvez com health check pós-reboot e rollback automático.

### Validar antes de confiar

O `dry-run` é a forma de validar que a configuração faz o que se espera sem aplicar nada:

```bash
sudo unattended-upgrade --dry-run --debug 2>&1 | tail -30
```

Vale rodar uma vez no fim do hardening e confirmar que ele simula apenas pacotes `-security`, não meia distribuição.

> 🎯 **Teste rápido**
>
> **Pergunta:** Por que `Automatic-Reboot true` é considerado parte do hardening, e não apenas conveniência operacional?
>
> <details>
> <summary>Resposta</summary>
> Porque algumas atualizações de segurança críticas (kernel, glibc, openssl) só entram em vigor após reboot. Sem reboot, o pacote vulnerável continua mapeado em memória mesmo que o novo esteja no disco. "Atualizado" sem reboot é só cosmética — o patch não está efetivamente aplicado.
> </details>

---

## Quando NÃO criar credenciais administrativas

Depois de tudo isso — sistema atualizado, identidade definida, `root` exilado do SSH, chave Ed25519 no portão, firewall negando por padrão, fail2ban observando, patches automatizados — ainda há um ato que tem ordem específica: a criação de admins de painéis de orquestração. Exemplos comuns: Coolify, Portainer, Plesk, painel administrativo de CMS.

Painel administrativo, uma vez com credencial, é poder concentrado: orquestra deploys, conhece todos os containers, guarda variáveis de ambiente sensíveis das aplicações, executa comandos com privilégio dentro da máquina. Criar o admin antes de a base estar protegida significa abrir uma superfície administrativa numa máquina ainda menos endurecida — exatamente o vetor que o resto do hardening tentou fechar.

A regra é: primeiro tornar a máquina estreita, depois introduzir o ponto de poder.

E a criação da credencial deve ir direto para o gerenciador de segredos (Bitwarden, 1Password, Vault), sem escala em buffer transitório — clipboard, scrollback do terminal, anotação rápida. Qualquer um desses é local errado para segredo, e qualquer hábito de "depois eu copio direito" é o jeito como segredos vazam.

> 💡 **Princípio: se a ferramenta não está pronta, adie**
>
> Se a CLI do gerenciador de segredos não estiver disponível na sessão, **adiar** a criação da credencial é a decisão correta, mesmo que aparente trabalho incompleto. Sidequest com credencial em local errado é dívida operacional escondida; sidequest com item explicitamente pendente é dívida operacional visível. A segunda é gerenciável; a primeira não.

---

## Limites desta lição

### O que está fora do escopo

Esta lição cobre hardening **base** — o conjunto mínimo de práticas que faz sentido em qualquer VPS exposta à internet. Camadas adicionais existem e fazem sentido em modelos de ameaça mais altos, mas não foram tratadas aqui:

- **AppArmor / SELinux** — controle mandatório de acesso a nível de kernel. Ubuntu vem com AppArmor ativo por default e profiles para serviços comuns; aprofundar (escrever profiles para suas próprias aplicações) é trabalho próprio.
- **auditd** — auditoria detalhada de syscalls e eventos do kernel. Útil para forense pós-incidente e compliance.
- **Kernel hardening via `sysctl`** — desabilitar `kexec`, restringir `ptrace`, ativar `kptr_restrict`, ajustar parâmetros de rede (`tcp_syncookies`, `rp_filter`).
- **Integridade de arquivos (AIDE, Tripwire)** — detecção de modificação não autorizada em arquivos críticos.
- **eBPF observability** — visibilidade comportamental fine-grained de syscalls e tráfego.
- **Hardware security (TPM, Secure Boot, disk encryption)** — relevante em provedores que oferecem; raro em VPS compartilhada de baixo custo.
- **Logging centralizado / SIEM** — agregar logs em sistema externo para correlação cross-host.
- **Hardening de aplicações específicas** — nginx, postgres, redis, cada um tem seu próprio checklist de hardening (limites de conexão, ciphers, autenticação interna).
- **Ciphers, KEX e MACs do SSH** — esta lição cobriu diretivas de auth e sessão; ajustar quais algoritmos criptográficos o sshd aceita é outra camada (ver Mozilla SSH Guidelines em [leitura adicional](#leitura-adicional)).

Cada um desses se justifica quando o modelo de ameaça ou os requisitos regulatórios pedirem. Para uma VPS de aplicação Fase 0, o hardening base desta lição é o piso, não o teto.

### Hardening é incremental por natureza

O estado pós-hardening de uma VPS é honesto sobre o que é e o que não é. É uma máquina com acesso controlado, autenticação por chave forte, firewall ativo, vigilância automatizada, patches rotineiros e identidade clara. Não é uma máquina pronta para produção exposta a usuários finais. A diferença está em três frentes que tipicamente ficam para sidequests seguintes:

**1. Proxy/CDN na frente.** Quando o DNS apontar para um proxy (Cloudflare, Bunny, Fastly) e o tráfego entrar exclusivamente pelos IPs deles, o firewall pode passar de "permite 80/443 de qualquer lugar" para "permite 80/443 apenas dos blocos do proxy" — eliminando, de um movimento só, o tráfego direto à origem por scanners. O proxy também absorve DDoS, termina TLS na borda e oferece cache. A VPS deixa de ser endpoint público para virar back-of-house.

**2. Fechar portas temporárias** que ficaram abertas durante bootstrap (painéis de admin, sockets de instalação, dashboards expostos em `:8000`). Comentário `(temporario)` no UFW marca o que precisa fechar; revisar periodicamente.

**3. Stack de dados e backup.** Banco devidamente configurado, e backups automatizados para storage **externo** à máquina — porque servidor sem backup é especulação, não operação. O backup mora em provedor diferente da máquina por uma razão simples: backup no mesmo lugar do dado original é uma cópia, não um backup.

E, antes de qualquer uma dessas três, a credencial administrativa de quem comanda o stack precisa nascer, indo direto para o gerenciador de segredos. Esse é o próximo movimento, e ele só faz sentido depois que a máquina abaixo dele já é estreita.

Hardening é incremental por natureza. O que se faz na primeira sessão não é o estado final; é o estado de partida confiável. E essa diferença — entre uma VPS que existe e uma VPS na qual se pode construir sem ansiedade — é a única que valia a viagem.

---

## Leitura adicional

Materiais de aprofundamento usados como base ou complemento desta lição:

**Referências canônicas de hardening de SSH**

- **[Mozilla OpenSSH Guidelines](https://infosec.mozilla.org/guidelines/openssh)** — referência canônica para ciphers, KEX, MACs e diretivas recomendadas. Vai além do escopo desta lição (que focou em auth e sessão).
- **`man sshd_config`** na própria VPS — fonte autoritativa para cada diretiva da sua versão específica do OpenSSH.
- **[OpenSSH Release Notes](https://www.openssh.com/releasenotes.html)** — para acompanhar quando diretivas mudam de nome, são removidas ou ganham defaults novos.

**Checklists e benchmarks abrangentes**

- **[CIS Ubuntu Linux 24.04 LTS Benchmark](https://www.cisecurity.org/benchmark/ubuntu_linux)** — checklist exaustivo de hardening para Ubuntu (centenas de itens). Use como complemento; muitos itens vão além do escopo "base".
- **[NIST SP 800-123 — Guide to General Server Security](https://csrc.nist.gov/publications/detail/sp/800-123/final)** — princípios gerais de segurança de servidor, agnóstico de OS.

**Camadas que esta lição não cobriu**

- **[Linux Audit Documentation (auditd)](https://github.com/linux-audit/audit-documentation/wiki)** — porta de entrada para a camada de auditoria de syscalls.
- **[AppArmor Wiki](https://gitlab.com/apparmor/apparmor/-/wikis/home)** — escrever profiles próprios para suas aplicações.
- **[Linux Kernel Self-Protection Project](https://www.kernel.org/doc/html/latest/security/self-protection.html)** — `sysctl` hardening e mais.

**Pré-requisitos Unix**

- **[The Linux Command Line — William Shotts](http://linuxcommand.org/tlcl.php)** — gratuito, ótimo para construir os pré-requisitos Unix assumidos aqui.

---

## Glossário

Termos que aparecem ao longo do texto como apoio e que valem uma definição de bolso. Em ordem alfabética.

- **ADR (Architecture Decision Record)** — documento curto que registra uma decisão arquitetural, seu contexto e suas consequências.
- **AppArmor** — sistema de controle mandatório de acesso (MAC) do kernel Linux usado por padrão no Ubuntu. Confina o que cada processo pode fazer mesmo se for comprometido.
- **auditd** — daemon de auditoria de syscalls e eventos do kernel. Coleta evidências para forense e compliance.
- **Cloud-init** — agente que provedores de VPS executam no primeiro boot para aplicar configuração inicial (hostname, chaves SSH, dados injetados pelo template). Sensível a sobrescrita de `/etc/cloud/cloud.cfg`; daí o `hold` que alguns provedores aplicam.
- **Conffile** — arquivo de configuração que pacotes Debian/Ubuntu marcam como "do usuário". Em upgrade, o `apt` pergunta se deve manter a versão local ou aceitar a do pacote; manter (`--force-confold`) é o caminho seguro quando o template do provedor injetou customizações.
- **CVE (Common Vulnerabilities and Exposures)** — identificador padronizado de uma vulnerabilidade pública (formato `CVE-AAAA-NNNNN`). Moeda comum para falar de uma falha específica em qualquer canal de segurança.
- **Daemon** — processo de longa duração que roda em segundo plano, tipicamente como serviço de sistema (`sshd`, `nginx`, `fail2ban`).
- **DDoS (Distributed Denial of Service)** — ataque que esgota recursos de um serviço enviando tráfego coordenado de muitas origens. Mitigar isso na borda (CDN/proxy) é mais barato do que mitigar na origem.
- **Ed25519** — algoritmo de assinatura baseado em curva elíptica Edwards 25519. Chaves de 32 bytes, assinaturas rápidas, geração determinística; preferível a RSA para SSH em projetos novos.
- **ESM (Expanded Security Maintenance)** — programa da Canonical que estende patches de segurança para pacotes do Ubuntu além do ciclo padrão. Requer subscription Ubuntu Pro ativa.
- **eBPF (extended Berkeley Packet Filter)** — tecnologia do kernel Linux que permite rodar programas verificados em pontos específicos do kernel para observabilidade e segurança fine-grained.
- **iptables** — interface clássica do kernel Linux para regras de filtragem de pacotes. UFW e Docker são ambos consumidores do iptables; a "briga" entre eles é uma disputa de ordem de inserção de regras na mesma cadeia.
- **journald / journalctl** — daemon de log estruturado do systemd. `journalctl` é o comando para consultá-lo. Substitui, no Ubuntu moderno, o papel histórico de arquivos como `/var/log/auth.log`.
- **NOPASSWD** — modificador no sudoers que dispensa o pedido de senha local ao executar `sudo`. Útil apenas quando a autenticação forte já aconteceu em outra camada (chave SSH com passphrase).
- **PAM (Pluggable Authentication Modules)** — framework de autenticação modular do Linux. Cuida de sessão, limites e logging mesmo quando o SSH não usa PAM para validar credencial.
- **Passphrase** — senha que protege uma chave privada SSH em disco. Sem ela, a chave é apenas um arquivo; com ela, mesmo um vazamento do arquivo não basta para usar a chave.
- **SELinux** — alternativa ao AppArmor (controle mandatório de acesso a nível de kernel). Default no RHEL/Fedora; opcional no Ubuntu.
- **Snapshot** — imagem do disco da VPS num ponto no tempo, restaurável em um clique pelo painel do provedor. Diferente de backup recorrente; barato e suficiente como botão de undo antes de mudanças de risco em estado de sistema.
- **sshd_config.d/** — diretório de overrides do `sshd`. O Ubuntu 24.04 lê arquivos `.conf` desse diretório em ordem lexicográfica, sobrepondo o `sshd_config` principal. Prefixo numérico (`00-`, `99-`) controla precedência.
- **systemd** — gerenciador de serviços, processos e logs do Linux moderno. Define o ciclo de vida de daemons como `ssh`, `fail2ban` e `unattended-upgrades` via `systemctl`.
- **sysctl** — interface para ler e ajustar parâmetros do kernel em runtime. Persistido em `/etc/sysctl.conf` e `/etc/sysctl.d/`.
- **TLS (Transport Layer Security)** — protocolo que cifra a comunicação HTTP, transformando-a em HTTPS. Terminação na borda (CDN) é a estratégia padrão para servir TLS sem gerenciar certificados na origem.
- **TPM (Trusted Platform Module)** — chip de segurança em hardware que armazena chaves criptográficas. Disponível em servidores físicos e algumas VPS premium; raro em VPS compartilhada de baixo custo.
- **UFW (Uncomplicated Firewall)** — frontend amigável para iptables no Ubuntu. Boa ferramenta de operação cotidiana, mas não é a fonte da verdade quando Docker está envolvido; `iptables -L` e `ss -tlnp` são os juízes finais.
- **Ubuntu Pro** — programa de subscription da Canonical que inclui ESM, ataque a malware (Livepatch), compliance (FIPS) e suporte. Gratuito até 5 máquinas para uso pessoal.
- **unattended-upgrades** — daemon que instala atualizações automaticamente segundo política configurável. Combinado com `Automatic-Reboot`, fecha o ciclo de patches sem intervenção humana.
- **visudo** — editor seguro do `/etc/sudoers` e arquivos em `/etc/sudoers.d/`. A flag `-c` apenas valida sintaxe sem editar; o teste mínimo antes de confiar numa mudança no sudoers.

---

## Apêndice — Aplicações documentadas no talkingpres

> Esta seção é específica do projeto talkingpres e pode ser removida por quem usar esta lição em outro contexto. O corpo da lição acima é genérico e reutilizável.

Para ver os conceitos desta lição aplicados a máquinas reais do talkingpres, com nomes próprios, obstáculos encontrados e decisões situadas, veja os registros em [ai-ops](../ai-ops/):

- [2026-05-24 — Setup inicial da VPS talkingpres-prod com template Coolify](../ai-ops/0001-setup-inicial-talkingpres-prod.md)
- [2026-05-24 — Hardening base da VPS talkingpres-prod](../ai-ops/0002-hardening-talkingpres-prod.md)

Para operar a VPS já endurecida no dia a dia, use o [runbook 0001 — Operação básica da VPS](../runbooks/0001-operacao-vps.md).
