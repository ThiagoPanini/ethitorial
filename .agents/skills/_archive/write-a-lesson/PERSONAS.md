# PERSONAS — framework de teste pedagógico

Lessons são escritas para serem lidas. O que parece coerente para quem escreve frequentemente confunde quem lê. As 4 personas abaixo são lentes obrigatórias antes de considerar um draft pronto.

Use as personas em **dois momentos**:

1. **Construção** — antes de rascunhar, escolher quais personas devem chegar ao fim. Isso calibra densidade, jargão e profundidade.
2. **Revisão** — depois do draft, simular leitura por cada persona escolhida. Onde houver friction, ajustar.

Cada persona tem: background, estilo de leitura, sinais de friction, checklist específico, critério pass/fail.

---

## Persona 1 — Júlia, intermediária no domínio adjacente

### Background

- 5 anos de experiência em desenvolvimento (backend Python ou equivalente).
- Já trabalhou com infra na superfície — usa Docker, deploy básico, lê logs — mas nunca configurou servidor Linux do zero.
- Sabe fazer `ssh user@host` e `sudo apt install x`, mas nunca tocou em `sshd_config`.
- Aprende lendo, mas não tem tempo de ler tudo duas vezes. Lê uma vez e quer reter.

### Estilo de leitura

- Lê do começo ao fim, sequencial.
- Para nos exemplos de código para entender. Não copia para terminal — só absorve.
- Quando bate em jargão novo, decide rápido: ou ela infere pelo contexto, ou ela vai ao Google. Não tem paciência para scrollar até o glossário.
- Aprecia metáforas e voz autoral — torna o conteúdo mais memorável.

### Sinais de friction

- Jargão sem definição inline na primeira ocorrência.
- Pulo lógico assumindo conhecimento que ela não tem.
- Parágrafo denso de mais de 7 linhas sem respiro.
- Falta de checkpoint que confirme se ela entendeu.
- Comandos sem explicação do "por quê" — ela quer entender, não decorar.

### Checklist específico

Quando simular leitura como Júlia, perguntar a cada seção:

- [ ] Há algum termo técnico que aparece sem definição na primeira ocorrência?
- [ ] Algum exemplo de código pressupõe Unix-fluência além do declarado nos pré-requisitos?
- [ ] Algum parágrafo passa de 7 linhas sem quebra?
- [ ] Há ao menos um momento de "interesse" (metáfora, princípio, armadilha) que faz ela parar e absorver?
- [ ] Se ela parar de ler no meio, conseguiria voltar via TOC e retomar?

### Critério pass/fail

**Pass:** Júlia chega ao fim com 70%+ de compreensão. Consegue recontar os 3 principais princípios sem reler. Identifica pelo menos 2 dos objetivos de aprendizagem declarados.

**Fail:** Júlia abandona antes do meio. Ou chega ao fim mas não consegue identificar a tese central. Ou desiste num parágrafo denso sem checkpoint próximo.

---

## Persona 2 — Marcus, senior no domínio

### Background

- 15 anos de experiência na área específica que a lesson cobre (sysadmin senior se a lesson é sobre Linux; staff frontend se é sobre React; etc).
- Já fez muito do que a lesson descreve, várias vezes, com variações.
- Lê para **validar** que o material é correto antes de recomendar para sua equipe.
- Pulou de fluência intermediária para senior por debugar incidentes reais — então tem antenas afinadas para imprecisão.

### Estilo de leitura

- Skim agressivo. Lê só headings primeiro, depois decide onde mergulhar.
- Para nas afirmações controversas ou contraintuitivas — quer ver se a justificativa convence.
- Aprecia tabelas e diagramas — eles oferecem o conteúdo num formato escaneável.
- Tolerância zero a imprecisão técnica. Uma única afirmação errada faz ele questionar o resto.
- Aprecia honestidade sobre limites ("o que NÃO está coberto").

### Sinais de friction

- Afirmação técnica imprecisa ou desatualizada (ex: "OpenSSH sempre fez X" quando X mudou em 8.7).
- Falta de versionamento ("válido para versão Y").
- Linguagem vendedora ou exagerada ("a melhor forma", "única solução").
- Tratamento simplista de trade-offs reais (ex: dizer NOPASSWD sem explicar a premissa).
- Ausência de referências externas que ele possa cruzar.

### Checklist específico

Quando simular leitura como Marcus, perguntar a cada seção:

- [ ] Toda afirmação técnica está correta para a versão alvo declarada?
- [ ] Trade-offs estão explicitados com premissas e condições de validade?
- [ ] Há referências externas (RFCs, docs oficiais, benchmarks) para ele cruzar?
- [ ] As tabelas/diagramas oferecem informação que prosa cobriria pior?
- [ ] A seção "Limites desta lição" é honesta sobre o que ficou fora?

### Critério pass/fail

**Pass:** Marcus chega ao fim sem perder confiança no material. Endossa para recomendação. Talvez sugira 1-2 melhorias técnicas, mas nenhuma de natureza factual.

**Fail:** Marcus encontra erro técnico que muda recomendação operacional, ou identifica trade-off central tratado de forma superficial, ou não vê referências canônicas para validar.

---

## Persona 3 — Eduardo, iniciante absoluto curioso

### Background

- Dev frontend há 3 anos. Nunca configurou servidor.
- Está aprendendo DevOps por curiosidade ou porque a empresa pediu que ele "soubesse o básico".
- Não tem fluência Unix além do que precisa para `npm`/`git`.
- Aprende lendo conteúdo bem-escrito, mas pula quando vira muleta.

### Estilo de leitura

- Lê do começo ao fim, mas com menos resistência a abandonar do que Júlia.
- Bate em jargão e tenta inferir; se não consegue, segue (não para para pesquisar).
- Engaja com metáforas e diagramas mais do que com prosa técnica.
- Aprecia muito quando a lesson reconhece que ele pode não saber X ("não assume conhecimento prévio de Y").
- Abandona quando se sente burro — não quando o material está difícil, mas quando o material assume conhecimento que ele não tem sem aviso.

### Sinais de friction

- Pré-requisitos não declarados ou subestimados.
- Jargão que escapou inline-define e está fora do glossário básico.
- Comandos exemplares sem explicação do que cada parte faz.
- Conceito introduzido com referência a outro conceito que ele não conhece ("é como o iptables mas mais simples" — mas e se ele nunca ouviu falar de iptables?).
- Densidade alta sem mudança de ritmo.

### Checklist específico

Quando simular leitura como Eduardo, perguntar a cada seção:

- [ ] Os pré-requisitos declarados realmente cobrem o que a seção pressupõe?
- [ ] Todo jargão tem inline-define OU está no glossário?
- [ ] Comandos exemplares são explicados em prosa, não só mostrados?
- [ ] Conceitos novos são introduzidos antes de serem referenciados?
- [ ] Há um diagrama, metáfora ou exemplo concreto que dá âncora visual?

### Critério pass/fail

**Pass:** Eduardo chega ao fim. Pode não reter 100%, mas sai com modelo mental do tema e saberia explicar em voz alta os princípios principais. Não se sentiu burro.

**Fail:** Eduardo abandona antes dos 60%. Ou chega ao fim mas não consegue articular nada (lessão virou ruído). Ou se sente burro em alguma seção (pré-requisito não declarado, jargão sem âncora).

---

## Persona 4 — Sara, especialista crítica

### Background

- Security engineer, ML researcher, distributed systems architect — depende do tema.
- Lê materiais didáticos para julgar qualidade antes de adotar/recomendar.
- Tem visão de "what's missing" calibrada por anos de experiência.
- Não está aprendendo nada novo lendo a lesson — está auditando se a lesson ensina certo.

### Estilo de leitura

- Lê devagar, marca anotações mentais ou em margens.
- Compara com referências canônicas (CIS Benchmarks, RFCs, materiais consagrados).
- Procura ativamente por: omissões importantes, simplificações enganosas, tendências de viés, falta de versionamento.
- Aprecia humildade ("esta lição não cobre X") e honestidade ("trade-off não é gratuito").

### Sinais de friction

- Material que se vende como exaustivo quando é introdutório.
- Omissão de camadas relevantes sem reconhecimento ("e onde está AppArmor?").
- Falta de referências canônicas externas (Mozilla, NIST, OWASP, RFCs).
- Generalização excessiva ("sempre faça X") sem nuance.
- Ausência de versionamento técnico ("válido para versão Y de Z").

### Checklist específico

Quando simular leitura como Sara, perguntar a cada seção:

- [ ] Há referências canônicas externas para o conteúdo coberto?
- [ ] A seção "Limites desta lição" enumera as camadas/tópicos relacionados não cobertos?
- [ ] Afirmações generalistas têm cláusulas de aplicabilidade?
- [ ] Há versionamento explícito de afirmações que envelhecem rápido?
- [ ] O material reconhece quando uma simplificação é simplificação?

### Critério pass/fail

**Pass:** Sara endossa o material para o público declarado. Sugere melhorias menores. Reconhece que escopo declarado foi entregue com integridade.

**Fail:** Sara identifica omissão grave sem reconhecimento, generalização perigosa, ou tendência de viés. Não recomendaria sem ressalvas.

---

## Como aplicar as personas

### Antes de rascunhar (15 minutos)

1. **Escolher 2-4 personas alvo.** Não é viável servir todas igualmente. Decisões típicas:
   - Lesson introdutória: Eduardo + Júlia.
   - Lesson de aprofundamento: Júlia + Marcus.
   - Lesson de referência: Marcus + Sara.
   - Lesson ambiciosa: todas as 4 (escolha rara — material precisa ser muito bom).

2. **Para cada persona escolhida**, escrever em uma frase:
   - O que ela deve saber ao final.
   - Qual será o ponto mais difícil para ela.
   - O que vai mantê-la lendo.

3. **Calibrar o pré-requisitos assumidos** para o piso da persona menos avançada escolhida.

### Durante a redação

- Quando introduzir jargão: pensar "Júlia/Eduardo vão entender isto inline?".
- Quando fazer afirmação técnica: pensar "Marcus vai questionar?".
- Quando definir escopo: pensar "Sara vai ver omissão?".

### Após o draft, antes de apresentar (30-45 minutos)

Para cada persona escolhida:

1. Ler a lesson **inteira** como aquela persona. Não pular, não acelerar.
2. Anotar cada momento de friction (qual seção, qual sinal, qual gravidade).
3. Avaliar pass/fail conforme critério da persona.
4. Se alguma falhou: identificar fix mínimo. Se múltiplas falharam: reestruturar.

### Documentar resultado do teste

Após o teste de personas, gerar uma mini-tabela mental:

| Persona | Pass/Fail | Friction principal | Ação |
|---|---|---|---|
| Júlia | Pass | densidade no §X | quebrar §X em dois |
| Marcus | Pass | falta ref externa em §Y | adicionar link Mozilla |
| Eduardo | Fail | pré-req não declarado: conhece systemd? | acrescentar systemd à lista de "assume" + ponteiro |
| Sara | Pass | sem comentário | — |

Aplicar as ações antes de seguir para [ANALYSIS.md](ANALYSIS.md).

---

## Personas vs. cenários

Personas são lentes de leitura. Cenários são contextos de uso. Lessons devem ser construídas para **personas** (o leitor) e validadas em **cenários** (a situação em que serão consultadas).

Cenários típicos para validar:

- **Onboarding** — novo membro da equipe usa a lesson para entender uma camada do stack pela primeira vez.
- **Debug noturno** — engenheiro de plantão consulta a lesson para entender por que algo está configurado de certo jeito.
- **Avaliação de proposta** — alguém propõe mudar X; lesson serve de contexto para discussão informada.
- **Auditoria externa** — auditor de segurança usa a lesson para entender postura do projeto.
- **Treinamento estruturado** — lesson vira material de aula presencial ou de pair-learning.

Para cada cenário onde a lesson será usada, testar mentalmente: "este leitor, neste cenário, com este nível de tempo e atenção, consegue extrair valor?".
