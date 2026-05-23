# Visão — talkingpres

## Resumo

`talkingpres` é um SaaS open source que centraliza apresentações técnicas em um catálogo público de alto padrão visual, com mecanismos de engajamento de comunidade e, numa segunda versão, um apresentador AI que narra os slides com a voz do autor e responde perguntas via RAG sobre o conteúdo da apresentação.

## Por que existe

1. **Para o autor:** consolidar produção técnica (software, AI, dados/analytics, SRE) em um espaço próprio, com narrativa visual coerente, em vez de fragmentar entre Speaker Deck, SlideShare, repositórios soltos e PDFs.
2. **Para a comunidade:** oferecer uma galeria curada com mecanismos de descoberta (filtros, busca, upvotes) e engajamento (comentários, views), facilitando o consumo de conteúdo técnico bem produzido.
3. **Como vitrine de engenharia AI-first:** o próprio processo de construção é parte do produto. O repositório deve ser um exemplo público de como construir SaaS modernos com fluxo de desenvolvimento assistido por IA (Claude Code + agentes + skills + MCPs).

## Público-alvo

- **Autor (V1):** o próprio mantenedor publicando suas apresentações. Sem multi-tenant nesta fase.
- **Audiência (V1):** desenvolvedores e engenheiros interessados nos temas das apresentações.
- **Outros autores (V2+):** abertura controlada para múltiplos autores publicarem (eventualmente como SaaS multi-tenant pago).

## Atributos não-funcionais

- **Estética como diferencial:** padrão visual referenciado em codewiki.google — dark first, gradientes leves, animações elegantes e impressionantes sem cair em extravagância. Performance percebida não pode ser sacrificada pela estética.
- **SEO:** catálogo público precisa indexar bem. Server rendering por padrão.
- **Acessibilidade:** WCAG AA mínimo. Player de slides navegável via teclado.
- **Custo previsível:** infra fixa em VPS, sem surpresas de billing serverless.
- **Open source dia 1:** repositório público desde o primeiro commit. Setup AI-first exemplar.

## O que NÃO é

- Não é um substituto de PowerPoint/Keynote/Google Slides para edição.
- Não é uma plataforma de webinars ao vivo.
- Não é um LMS (learning management system).
- Não é (na V1) um marketplace multi-autor.

## Critério de sucesso da V1

5 apresentações reais do mantenedor publicadas no catálogo em produção, com design polido, players funcionais, e mecanismos básicos de engajamento ativos. Sem isso, não vale falar de V2.
