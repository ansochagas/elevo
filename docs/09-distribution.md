# 09 — Distribuição e superfícies

**Decisão (Max, 07/2026):** o produto nasce como **aplicação web + PWA**, sem lojas de app no MVP.

## Por que sem Play Store / App Store no início

- **Sem burocracia:** Apple cobra US$ 99/ano + revisão que pode rejeitar e demora dias; Google tem taxa + revisão. PWA publica e atualiza na hora.
- **Sem a "taxa das lojas":** Apple/Google cobram 15–30% sobre assinaturas vendidas dentro do app nativo. **Pagamentos ficam na web (ex.: Stripe) = pedágio zero.** Decisivo num modelo de assinatura recorrente B2B.
- **Um código, todos os aparelhos:** iPhone, Android, notebook — mesma web app responsiva.
- **Atualização instantânea:** sem esperar revisão de loja; crítico na fase de iteração rápida.
- **Casa com o B2B:** o fluxo da assessoria é baseado em link (convite → conectar). PWA é um link que vira app ("adicionar à tela de início").

## Ressalvas gerenciáveis

- **iOS:** instalar PWA é menos óbvio (Safari → compartilhar → adicionar à tela). Precisa de uma telinha ensinando.
- **Push:** funciona em Android e iOS 16.4+ — cobre o MVP. Nativo dá polimento a mais.

## App nativo: depois, reaproveitando

Quando validado (Fase 9 do documento-mestre), dá para **empacotar a mesma web app** para as lojas (vitrine, descoberta, integração mais profunda, percepção de "app de loja"). Não é recomeçar do zero.

## Três superfícies web (podem viver no mesmo projeto)

1. **Site institucional / marketing** — explica o produto, capta lista de espera, trabalha SEO. É o que se manda para a assessoria antes da reunião.
2. **A aplicação** — onde o corredor usa o produto.
3. **Páginas públicas de perfil e carta** — onde os links compartilhados caem. Dupla função: motor de aquisição (cada carta compartilhada é porta de entrada) + SEO. Site e aquisição são a mesma coisa.

## Pagamentos

Web-based (Stripe ou similar), fora das lojas, para preservar margem. Assinatura cobrada da assessoria (não do aluno) no B2B; plano individual no B2C.
