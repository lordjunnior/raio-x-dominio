<div align="center">

<img src="./public/og-cover.svg" width="100%" alt="Raio-X de Domínio e IP — LORD JUNNIOR" />

# RAIO-X DE DOMÍNIO E IP

**Digite um site ou IP e veja onde ele está hospedado, quem é o provedor, os servidores de e-mail e o registro do domínio.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=fff)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=fff)](https://vite.dev/)

[Site oficial](https://lordjunnior.com.br/ferramentas/raio-x-dominio) · [Perfil GitHub](https://github.com/lordjunnior)

</div>

---

## Visão geral

Digite um site ou IP e veja onde ele está hospedado, quem é o provedor, os servidores de e-mail e o registro do domínio.

Este repositório contém uma versão independente da ferramenta publicada no Arsenal LORD JUNNIOR. A interface e os módulos locais necessários foram extraídos do projeto principal para permitir execução, auditoria e evolução separadas.

## Executar localmente

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Arquitetura

- `src/App.tsx`: entrada independente da ferramenta.
- `src/components/tools/screens/`: tela funcional e componentes diretamente necessários.
- `src/components/tools/lib/` e `src/lib/`: motores e cálculos reutilizados pela tela, quando aplicável.
- `src/styles.css`: tokens visuais e estilos compartilhados da família LORD JUNNIOR.

## Privacidade e integrações

A ferramenta preserva o fluxo de processamento implementado na tela de origem. Quando houver chamadas a serviços externos, elas devem ser avaliadas conforme o provedor e a ação executada; ausência de conta própria não significa ausência de tráfego externo. Não inclua chaves privadas, tokens ou credenciais no código do navegador.

## Projeto de origem

- Site: https://lordjunnior.com.br
- Código-fonte principal: https://github.com/lordjunnior/Meu-site-atualizado
- Ferramenta no site: `/ferramentas/raio-x-dominio`

---

**LORD JUNNIOR** — Inteligência, Geopolítica e Liberdade Digital.
