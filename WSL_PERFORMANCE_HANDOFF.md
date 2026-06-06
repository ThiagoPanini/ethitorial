# Handoff: Diagnostico de Performance VS Code + WSL

## Contexto

O usuario relatou problemas frequentes de performance em operacoes de I/O e problemas de conexao ao usar VS Code, WSL e agentes de IA no repositorio `epistemix`.

O repositorio estava aberto em:

```bash
/mnt/c/Users/panin/workspaces/epistemix
```

Esse path significa que o codigo esta no filesystem do Windows (`C:\Users\panin\workspaces\epistemix`) e esta sendo acessado pelo WSL atraves de um mount em `/mnt/c`.

## Diagnostico Principal

A causa mais provavel dos problemas de performance e o repositorio estar em `/mnt/c`, ou seja, no filesystem Windows montado dentro do WSL.

No setup medido:

- O repositorio atual esta em filesystem `v9fs`/`9p`, vindo de `C:\`.
- `/tmp` esta no filesystem Linux nativo (`ext4`).
- WSL esta em versao 2.
- O workload do projeto tem muitos arquivos pequenos: Node, Next, Python, caches e ambiente virtual.

Esse e exatamente o perfil que piora em `/mnt/c`: muitas operacoes pequenas de `stat`, leitura, escrita, criacao e enumeracao de arquivos.

## Evidencias Locais Coletadas

### Filesystem

Comandos executados:

```bash
df -T . /tmp
stat -f -c 'path=%n type=%T block_size=%s blocks=%b free=%f' . /tmp
mount | rg -n ' /mnt/c |drvfs|9p|epistemix|wsl'
```

Achados:

```text
Repositorio: /mnt/c/Users/panin/workspaces/epistemix
Filesystem do repo: v9fs / 9p
Filesystem de /tmp: ext4
```

`df -T` mostrou:

```text
C:\      9p    ... 91% /mnt/c/Users/panin/workspaces/epistemix
/dev/sdd ext4  ...  4% /tmp
```

`stat -f` mostrou:

```text
path=. type=v9fs
path=/tmp type=ext2/ext3
```

### Benchmark de muitos arquivos pequenos

Comando usado para comparar `/mnt/c` com `/tmp`:

```bash
bash -lc 'd=$(mktemp -d "$PWD/.perf-probe.XXXXXX"); /usr/bin/time -p bash -lc '\''for i in $(seq 1 1000); do : > "$0/f$i"; done; find "$0" -type f -print >/dev/null'\'' "$d"; rm -rf "$d"'

bash -lc 'd=$(mktemp -d "/tmp/perf-probe.XXXXXX"); /usr/bin/time -p bash -lc '\''for i in $(seq 1 1000); do : > "$0/f$i"; done; find "$0" -type f -print >/dev/null'\'' "$d"; rm -rf "$d"'
```

Resultado:

```text
/mnt/c: real 8.93s
/tmp:   real 0.07s
```

Diferenca aproximada: 127x mais lento no mount Windows.

### Git

Comandos:

```bash
/usr/bin/time -p git status --short
GIT_TRACE_PERFORMANCE=1 git status --short
/usr/bin/time -p git status --short --untracked-files=no
```

Resultados observados:

```text
git status --short: cerca de 2.6s a 3.2s
git status --short --untracked-files=no: cerca de 1.39s
```

Trace relevante:

```text
refresh index: cerca de 1.7s
git command total: cerca de 2.6s
```

Interpretacao: o tempo esta concentrado em varredura/refresh do working tree, nao em CPU.

### Tamanho e quantidade de arquivos

Comandos:

```bash
find . -type f -not -path './.git/*' | wc -l
find node_modules apps/web/node_modules apps/web/.next apps/api/.venv -type f 2>/dev/null | wc -l
du -sh .
```

Resultados:

```text
Total de arquivos sem .git: 23981
Arquivos em node_modules/.next/.venv: 23740
Tamanho do repo: 723M
```

Quase todos os arquivos do workspace vem de dependencias, build cache e ambiente virtual.

### WSL e ambiente

Comandos:

```bash
wsl.exe --version
wsl.exe --list --verbose
wsl.exe --status
cat /etc/os-release
cat /etc/wsl.conf
```

Achados:

```text
WSL version: 2.6.3.0
Kernel: 6.6.87.2
Distro default: Ubuntu-20.04
Distro rodando: WSL 2
OS dentro da distro: Ubuntu 24.04.4 LTS
/etc/wsl.conf: systemd=false
```

Nao havia `%UserProfile%\.wslconfig`.

### Watchers e file descriptors

Comandos:

```bash
cat /proc/sys/fs/inotify/max_user_watches /proc/sys/fs/inotify/max_user_instances /proc/sys/fs/inotify/max_queued_events
ulimit -n
```

Resultados:

```text
max_user_watches: 524288
max_user_instances: 128
max_queued_events: 16384
ulimit -n: 1048576
```

Interpretacao: limites de watchers e descritores parecem saudaveis. Nao parecem ser a causa principal.

### Windows Defender e disco

Comandos PowerShell:

```powershell
Get-MpComputerStatus | Select-Object AMServiceEnabled,AntivirusEnabled,RealTimeProtectionEnabled,IoavProtectionEnabled,BehaviorMonitorEnabled,NISEnabled
Get-PSDrive -PSProvider FileSystem | Select-Object Name,Used,Free,Root
```

Achados:

```text
RealTimeProtectionEnabled: False
IoavProtectionEnabled: False
BehaviorMonitorEnabled: False
C: com cerca de 45 GB livres e 91% usado
```

Interpretacao: Defender nao parece ser o gargalo atual. O disco C: esta relativamente cheio, o que pode agravar latencia e reduzir margem para VHD, caches, swap e builds.

## Hipoteses Ranqueadas

1. **Repositorio em `/mnt/c` e a causa principal.**
   - Confirmada por benchmark local: 8.93s vs 0.07s em operacoes com 1.000 arquivos pequenos.

2. **Artefatos grandes dentro do projeto amplificam o problema.**
   - Confirmada: `node_modules`, `.next` e `.venv` concentram 23.740 de 23.981 arquivos.

3. **Git e language servers sofrem por varrerem o working tree em v9fs.**
   - Confirmada parcialmente: `git status` ficou entre 2.6s e 3.2s, com tempo concentrado em `refresh index`.

4. **PATH herdado do Windows adiciona ruido.**
   - Parcial: `PATH` contem muitos paths `/mnt/c`, mas os binarios principais (`git`, `node`, `pnpm`, `uv`, `codex`) eram Linux. Nao parece ser causa primaria.

5. **Problemas de rede/conexao do VS Code WSL sao secundarios.**
   - Ainda nao confirmado. A recomendacao e migrar o repo primeiro e reavaliar. Muitas "falhas de conexao" podem ser sintomas indiretos de processos travando em I/O.

## Recomendacao Principal

Mover o repositorio para o filesystem Linux nativo do WSL, por exemplo:

```bash
~/workspaces/epistemix
```

Evitar trabalhar em:

```bash
/mnt/c/Users/panin/workspaces/epistemix
```

No VS Code, o fluxo correto passa a ser:

```bash
cd ~/workspaces/epistemix
code .
```

O canto inferior esquerdo do VS Code deve indicar uma janela remota WSL.

## Receita Segura de Migracao

Como a arvore estava dirty, com alteracoes nao commitadas, nao usar apenas `git clone` como primeira opcao. O caminho mais seguro e copiar o workspace atual com `rsync`, preservando `.git` e mudancas locais, mas excluindo dependencias e caches.

### 1. Criar destino no Linux

```bash
mkdir -p ~/workspaces/epistemix
```

### 2. Sincronizar sem caches pesados

```bash
rsync -a --info=progress2 \
  --exclude node_modules \
  --exclude .next \
  --exclude .venv \
  --exclude .pytest_cache \
  --exclude .ruff_cache \
  --exclude .uv-cache \
  --exclude .turbo \
  /mnt/c/Users/panin/workspaces/epistemix/ \
  ~/workspaces/epistemix/
```

### 3. Entrar no novo workspace

```bash
cd ~/workspaces/epistemix
```

### 4. Confirmar que as mudancas locais vieram junto

```bash
git status --short --branch
```

Compare com o status observado antes da migracao:

```text
## docs/design-direcao-visual-v1...origin/docs/design-direcao-visual-v1
 M .agents/skills/_archive/solo-dev-assistant/SKILL.md
 M .agents/skills/_archive/write-a-lesson/SKILL.md
 M apps/web/app/[section]/[source]/[post]/page.tsx
 M apps/web/app/[section]/[source]/page.tsx
 M apps/web/app/[section]/page.tsx
 M apps/web/app/page.tsx
 M apps/web/lib/mdx-components.tsx
?? apps/web/app/_components/
?? apps/web/lib/site/
?? apps/web/lib/slug.ts
```

### 5. Reinstalar dependencias no filesystem Linux

```bash
pnpm install
cd apps/api
uv sync
cd ~/workspaces/epistemix
```

### 6. Abrir no VS Code pelo WSL

```bash
code .
```

### 7. Validar que o workspace nao esta mais em `/mnt/c`

```bash
pwd
df -T .
stat -f -c '%T' .
```

Esperado:

```text
/home/paninit/workspaces/epistemix
ext2/ext3 ou ext4
```

Nao esperado:

```text
/mnt/c/...
v9fs
9p
```

## Ajustes Secundarios Recomendados

### Reduzir PATH herdado do Windows

Depois que o repo estiver migrado e validado, considerar editar `/etc/wsl.conf`:

```ini
[boot]
systemd=false

[interop]
appendWindowsPath=false
```

Depois, no PowerShell:

```powershell
wsl --shutdown
```

Observacao: o usuario ja possui configuracao em `~/.config/zsh/thiago-wsl.zsh` adicionando manualmente o path do VS Code:

```bash
/mnt/c/Users/panin/AppData/Local/Programs/Microsoft VS Code/bin
```

Entao `code .` deve continuar funcionando mesmo com `appendWindowsPath=false`.

### Reavaliar conexao depois da migracao

Nao alterar `networkingMode=mirrored` antes de mover o repo. Primeiro eliminar o gargalo de I/O.

Se problemas de conexao persistirem apos a migracao, investigar:

```bash
code --status
VSCODE_WSL_DEBUG_INFO=true code .
```

E no VS Code:

- Command Palette: `WSL: Open Log`
- habilitar `remote.WSL.debug` temporariamente, se necessario

## Fontes Consultadas

- Microsoft WSL filesystem guidance: https://learn.microsoft.com/windows/wsl/filesystems
- Microsoft WSL version comparison: https://learn.microsoft.com/windows/wsl/compare-versions
- VS Code WSL docs: https://code.visualstudio.com/docs/remote/wsl
- VS Code Remote troubleshooting: https://code.visualstudio.com/docs/remote/troubleshooting
- Docker WSL best practices: https://docs.docker.com/desktop/features/wsl/best-practices/

## Conclusao para o Proximo Agente

O proximo passo de maior impacto e migrar o repositorio de `/mnt/c/Users/panin/workspaces/epistemix` para `~/workspaces/epistemix`.

Trate isso como mudanca estrutural de ambiente, nao como ajuste fino. A medicao local mostrou diferenca aproximada de 127x em operacoes pequenas de filesystem, que sao o caminho quente de VS Code, Git, Next, pnpm, uv, language servers e agentes de IA.

Depois da migracao, repetir os benchmarks de `git status`, criacao de arquivos pequenos e inicializacao do VS Code/agentes para confirmar a melhora.
