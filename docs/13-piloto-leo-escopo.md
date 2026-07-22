# 13 — Escopo do Piloto Leo

**Data:** 20/07/2026. **Princípio:** "completo" não significa todas as features — significa **jornada sem becos sem saída**: toda ação que o Leo tentar precisa terminar em algo, nunca numa parede. Este documento é o contrato de entrega do piloto.

---

## A jornada do Leo (e o que cada passo exige)

### 1. Primeiro login e onboarding
- [ ] Primeiro acesso guiado: painel vazio deve dizer o que fazer ("adicione seu primeiro aluno"), não assustar.
- [ ] Configurações da assessoria: **editar nome** (hoje está fixo "Fortaleza Run") e dados básicos.
- [ ] Conta do treinador: editar nome, **trocar senha**.
- [ ] **Painel responsivo no celular** — o Leo vai abrir no telefone; hoje o painel é desktop-first. Crítico.

### 2. Gestão de alunos (os gatilhos do Max, expandidos)
- [ ] **Lista completa de alunos** (o "Ver todos"): busca, situação, acesso ao perfil.
- [ ] **Adicionar aluno**: nome + WhatsApp + e-mail (opcional) → gera **link de convite**.
- [ ] **Convite com consentimento (LGPD)**: o aluno abre o link, cria a senha, **aceita que o treinador veja seus dados** (checkbox explícito) e já pode enviar suas corridas. Consentimento é a fundação legal do coach-vê-aluno.
- [ ] **Editar aluno** (nome, contato, observações).
- [ ] **Remover/desvincular aluno**: sai da assessoria, **mas a conta e o histórico continuam do atleta** (decisão antiga: a identidade pertence ao corredor). Nada de deletar dados do aluno.
- [ ] **Perfil individual do aluno (visão do treinador)**: clicar num atleta e ver o perfil completo — score, forma, atributos, evolução, corridas, análise. É a tela que o Leo usa **sentado com o aluno** para mostrar a evolução. Talvez a tela mais importante da venda dele.

### 3. Dados reais (a P2 embutida)
- [ ] **Upload de corridas pelo aluno** (export ZIP do Strava ou GPX avulsos — aceitar o arquivo cru, como decidido).
- [ ] **Upload pelo treinador em nome do aluno** (para alunos que não vão engajar com o app; consentimento coberto pelo convite aceito OU declaração do treinador no piloto).
- [ ] **Motor calculando de verdade**: upload → parse → faxina → atributos → score de duas camadas → salvo no banco.
- [ ] **Painel com KPIs reais**: % ativos, em risco (sumido/queda) derivados das corridas reais — as regras já existem no motor.
- [ ] **App do aluno com dados reais**: o atleta logado vê O PRÓPRIO score, não o do Anderson de exemplo.
- [ ] **Liga/ranking real** da turma (deriva dos scores reais; a liga mock sai).
- [ ] **Estados vazios em tudo**: aluno sem corrida ("aguardando primeira corrida"), turma nova, score "calibrando" com poucos dados (regra do motor).

### 4. Ações do dia a dia
- [ ] **"Falar" abre o WhatsApp do aluno de verdade** (por isso o campo WhatsApp no cadastro). Transforma o alerta de risco em ação com 1 toque.
- [ ] **Esqueci a senha (aluno)**: no piloto, resolvido via "peça ao treinador para reenviar o convite" (reenvio = redefine). Sem servidor de e-mail por ora.
- [ ] **Esqueci a senha (Leo)**: reset manual nosso no piloto (somos o suporte dele); e-mail automático é fast-follow.

### 5. Honestidade no produto (anti-promessa-quebrada)
- [ ] **Esconder o que ainda não é real**: o card "Alcance da marca" (cartas compartilhadas, cliques) só aparece quando houver share real — mostrar números fake para o Leo seria minar a confiança.
- [ ] Compartilhamento da carta: no piloto inicial a carta EXISTE (o aluno vê e mostra); a **geração de imagem + bandeja nativa** é fast-follow priorizado.
- [ ] **Multi-tenant blindado**: o Leo só vê alunos DA assessoria dele (escopo por assessoria em toda query). Fundação para a 2ª assessoria.

---

## O corte: Must / Fast-follow / Depois

**MUST (sem isso o Leo trava — não entrega sem):**
Onboarding + config assessoria/conta · adicionar/editar/desvincular aluno · convite com consentimento · lista completa + perfil individual (coach) · upload (aluno e treinador) → motor → scores reais · painel com KPIs reais + em risco real · app do aluno com dados reais · liga real · estados vazios · "Falar"→WhatsApp · painel mobile · multi-tenant · esconder métricas não-reais.

**FAST-FOLLOW (dentro do piloto, logo depois):**
Geração de imagem da carta + share nativo · reset de senha por e-mail · logo/marca do Leo na carta (promessa do battlecard) · pós-corrida disparado por upload novo.

**DEPOIS (não é piloto):**
Sync automático Strava/Garmin · notificações push · alcance de marca real · múltiplas assessorias em escala · skins desbloqueáveis · B2C aberto.

---

## Decisões de produto já tomadas que este escopo respeita
- Aluno não paga; identidade/histórico pertencem ao atleta (desvincular ≠ deletar).
- Upload-first (ZIP cru aceito); sync automático depois.
- Consentimento explícito e granular (LGPD) na entrada do aluno.
- Score: duas camadas + "calibrando" com poucos dados + nunca punir semana boa visivelmente.
- Compartilhar = bandeja nativa + deep link IG Stories (sem API de postagem); TikTok só com carta em vídeo.

## Perguntas em aberto (para Max/Leo)
1. Quantos alunos o Leo tem, e quantos ele quer no piloto?
2. Os alunos vão usar o app (convite) ou o piloto começa Leo-first (ele sobe os dados e mostra)? — recomendação: Leo + 3-5 alunos engajados; resto coach-only até se interessarem.
3. Leo tem os contatos (WhatsApp) e consegue coletar os exports dos 3-5 primeiros?
