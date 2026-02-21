<p align="center">
  <img src="resources/icon.png" alt="GFGC Logo" width="100" height="100">
</p>

<h1 align="center">GFGC</h1>

<p align="center">
  <strong>Gestão Financeira Gabriel & Carol</strong>
</p>

<p align="center">
  Aplicação desktop completa para gestão financeira pessoal — contas, investimentos, metas, receitas, FGTS e patrimônio — 100% offline, com dados armazenados localmente.
</p>

<p align="center">
  <a href="https://github.com/gluizcortez/gfgc/releases/latest"><img src="https://img.shields.io/github/v/release/gluizcortez/gfgc?style=flat-square&color=6366f1" alt="Release"></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/electron-33-47848f?style=flat-square&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/react-18-61dafb?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/typescript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind">
</p>

---

> [!NOTE]
> **Disclaimer** — Este projeto nasceu de duas motivações: a necessidade pessoal de ter um sistema robusto para gerenciamento financeiro, investimentos e metas; e a curiosidade de experimentar como seria desenvolver um software utilizando intensivamente uma das melhores IAs do mercado (Claude, da Anthropic). Ao longo do desenvolvimento, pratiquei pouca codificação direta e participei mais como **coordenador e revisor da IA** — definindo requisitos, validando entregas, tomando decisões arquiteturais e direcionando o rumo do projeto. O resultado é um estudo de caso real de desenvolvimento assistido por IA.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelagem de Dados](#modelagem-de-dados)
- [Começando](#começando)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Build e Distribuição](#build-e-distribuição)
- [Persistência e Backup](#persistência-e-backup)
- [Licença](#licença)

---

## Visão Geral

O GFGC é uma aplicação desktop construída com **Electron + React** para controle financeiro pessoal completo. Diferente de soluções em nuvem, todos os dados ficam armazenados localmente na máquina do usuário — sem contas, sem servidores, sem dependência de internet.

### Por que desktop e offline?

- **Privacidade** — Dados financeiros nunca saem do computador
- **Independência** — Funciona sem internet e sem assinaturas
- **Performance** — Acesso instantâneo aos dados sem latência de rede
- **Controle** — Backup e exportação manual a qualquer momento

---

## Funcionalidades

### Contas Mensais

Gerenciamento completo de despesas mensais com templates recorrentes e geração automática.

- Templates de contas que geram entradas automaticamente a cada mês
- Status automático: pendente, pago ou atrasado (baseado na data de vencimento)
- Duas visualizações: tabela ordenável e calendário mensal
- Suporte a parcelamento (divide o valor em N meses) e recorrência
- Orçamento por categoria com tracking visual
- Duplicação de mês inteiro para agilizar o preenchimento
- Anexos de comprovantes (PDF, imagens — até 100 MB por arquivo)
- Campos customizáveis definidos pelo usuário

### Investimentos

Tracking de portfólio com histórico completo de transações.

- Tipos: Renda Fixa, Ações, Fundos, Criptomoedas, Outro
- Transações: aportes, resgates e rendimentos com data e valor
- Saldo calculado automaticamente a partir do histórico
- Gráfico de evolução do patrimônio investido
- Modal de detalhes com histórico completo por investimento
- Simulador de projeção vinculado a metas

### Metas Financeiras

Acompanhamento de objetivos com projeção inteligente de alcance.

- Metas manuais (contribuições registradas) ou vinculadas a investimentos
- Periodicidade: mensal, trimestral, semestral, anual ou customizada
- Barra de progresso com indicador visual (acima/abaixo/na meta)
- Projeção automática de data de conclusão baseada no ritmo de contribuições
- Gráfico de evolução por meta

### Receitas

Controle de entradas financeiras com suporte a recorrência.

- Categorias: Salário, Freelance, Rendimentos, Bônus, Outros
- Receitas recorrentes com geração automática para meses futuros
- Gestão de recorrência (pausar/restaurar)
- Distribuição por categoria (gráfico de pizza)
- Exportação em CSV

### FGTS

Acompanhamento de saldo do Fundo de Garantia.

- Registro mensal de saldos por workspace
- Gráfico de evolução anual
- Integrado ao cálculo de patrimônio líquido

### Dashboard

Painel consolidado com visão mensal e anual de toda a vida financeira.

- Cards de resumo: receitas, despesas, saldo, investimentos
- Alertas de contas atrasadas e vencendo hoje
- Gráficos: despesas por categoria, evolução de investimentos, tendências, distribuição de receitas
- Filtros por workspace (contas, investimentos, receitas)
- Visão anual com comparativo mês-a-mês
- Relatório mensal para impressão/PDF

### Patrimônio Líquido

Visão consolidada de todos os ativos.

- Cálculo: soma de investimentos ativos + saldo FGTS mais recente
- Gráfico de evolução temporal
- Breakdown por tipo de ativo com percentuais

### Recursos Gerais

| Recurso | Descrição |
|---------|-----------|
| **Workspaces** | Contextos separados para contas, investimentos, FGTS e receitas |
| **Tema Escuro** | True black com mapeamento completo de cores |
| **Busca Global** | `⌘K` / `Ctrl+K` para pesquisar em todas as seções e dados |
| **Notificações** | Toasts com auto-dismiss + lembretes proativos ao abrir o app |
| **Backup Automático** | Backups diários com retenção configurável |
| **Export/Import** | JSON completo + CSV para relatórios |
| **Atualização** | Verificação automática via GitHub Releases |
| **Anexos** | Upload, visualização e abertura de arquivos vinculados |
| **Categorias** | 12 pré-configuradas + totalmente customizáveis |
| **Campos Custom** | Campos definidos pelo usuário para contas e investimentos |
| **Ajuda Integrada** | Documentação completa acessível dentro do app |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Electron Main Process                   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Storage  │  │  Backup  │  │ Attachmt │  │   Updater   │  │
│  │ (JSON)   │  │ (Auto)   │  │ (Files)  │  │  (GitHub)   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
│       └──────────────┴─────────────┴───────────────┘         │
│                           │ IPC                               │
│  ┌────────────────────────┴──────────────────────────────┐   │
│  │                   IPC Handlers                         │   │
│  │  load · save · export · import · attach · update       │   │
│  └────────────────────────┬──────────────────────────────┘   │
│                           │                                   │
├───────────────────────────┼───────────────────────────────────┤
│                    Preload (Context Bridge)                    │
│                     window.api.*                              │
├───────────────────────────┼───────────────────────────────────┤
│                           │                                   │
│                  Renderer Process (React)                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Zustand Stores                        │ │
│  │  Bills · Investments · Goals · FGTS · Income · Settings │ │
│  │                       UI Store                           │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────────┐ │
│  │                    usePersistence                        │ │
│  │         Subscribe → Debounce (500ms) → IPC Save         │ │
│  │              + Flush on beforeunload                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                     Components                        │    │
│  │  Pages: Dashboard · Bills · Investments · Goals ·     │    │
│  │         FGTS · Income · NetWorth · Settings · Help     │    │
│  │  Layout: Sidebar · TabBar · MonthNavigator · Search   │    │
│  │  Shared: Modal · CurrencyInput · ConfirmDialog · ...  │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Padrões Chave

- **Store-per-domain** — Cada domínio (contas, investimentos, metas...) tem seu próprio Zustand store com Immer middleware
- **Hydration pattern** — Dados carregados do disco no boot e injetados nos stores via `hydrate()`
- **Debounced persistence** — Alterações são salvas automaticamente com debounce de 500ms + flush no fechamento da janela
- **Atomic writes** — Escrita em arquivo temporário + rename para evitar corrupção
- **Offline-first** — Zero dependência de rede para funcionalidades core; rede usada apenas para check de atualização

---

## Stack Tecnológica

### Core

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| [Electron](https://www.electronjs.org/) | 33 | Runtime desktop multiplataforma |
| [React](https://react.dev/) | 18 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | Tipagem estática |
| [Vite](https://vitejs.dev/) | 6 | Bundler e dev server |
| [electron-vite](https://electron-vite.org/) | 5 | Integração Vite + Electron |

### State & Data

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | Gerenciamento de estado minimalista |
| [Immer](https://immerjs.github.io/immer/) | 10 | Atualizações imutáveis com sintaxe mutável |
| [nanoid](https://github.com/ai/nanoid) | 5 | Geração de IDs únicos |

### UI & Styling

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS framework |
| [Radix UI](https://www.radix-ui.com/) | — | Componentes acessíveis (Dialog, Select, Popover, Tooltip) |
| [Lucide React](https://lucide.dev/) | 0.469 | Biblioteca de ícones |
| [Recharts](https://recharts.org/) | 2.15 | Gráficos (Pie, Bar, Line, Area) |

### Utilities

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| [date-fns](https://date-fns.org/) | 4 | Manipulação e formatação de datas |
| [clsx](https://github.com/lukeed/clsx) | 2 | Concatenação condicional de classes CSS |

### Build & Distribution

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| [electron-builder](https://www.electron.build/) | 25 | Empacotamento e distribuição |
| [@electron-toolkit](https://github.com/electron-vite/electron-toolkit) | 3 | Utilitários para preload e main process |

---

## Estrutura do Projeto

```
gfgc/
├── src/
│   ├── main/                           # Processo principal (Electron/Node)
│   │   ├── index.ts                    #   Criação da janela, bootstrap
│   │   ├── ipc-handlers.ts             #   Handlers de comunicação IPC
│   │   ├── storage.ts                  #   Leitura/escrita do arquivo de dados
│   │   ├── backup.ts                   #   Backup automático com retenção
│   │   ├── attachments.ts              #   Upload e gerenciamento de anexos
│   │   └── updater.ts                  #   Verificação de atualizações (GitHub API)
│   │
│   ├── preload/
│   │   ├── index.ts                    #   Context bridge (window.api)
│   │   └── index.d.ts                  #   Tipos TypeScript para a API exposta
│   │
│   ├── shared/
│   │   └── ipc-channels.ts             #   Constantes dos canais IPC
│   │
│   └── renderer/src/                   # Processo de renderização (React)
│       ├── App.tsx                      #   Componente raiz, roteamento por seção
│       ├── main.tsx                     #   Entry point do React
│       │
│       ├── types/
│       │   └── models.ts               #   Modelos de dados TypeScript
│       │
│       ├── stores/                      #   Zustand stores (7 stores)
│       │   ├── useBillsStore.ts         #     Contas e registros mensais
│       │   ├── useInvestmentsStore.ts   #     Investimentos e transações
│       │   ├── useGoalsStore.ts         #     Metas e contribuições
│       │   ├── useFGTSStore.ts          #     Registros FGTS
│       │   ├── useIncomeStore.ts        #     Entradas de receita
│       │   ├── useSettingsStore.ts      #     Configurações, workspaces, categorias
│       │   └── useUIStore.ts            #     Estado da UI (seção ativa, modals)
│       │
│       ├── hooks/
│       │   └── usePersistence.ts        #   Auto-save com debounce + hydration
│       │
│       ├── lib/                         #   Lógica de negócio e utilitários
│       │   ├── calculations.ts          #     Cálculos financeiros
│       │   ├── formatters.ts            #     Formatação de moeda, data, números
│       │   ├── billStatus.ts            #     Determinação de status de contas
│       │   └── constants.ts             #     Categorias default, cores, labels
│       │
│       ├── components/
│       │   ├── bills/                   #   Contas mensais (8 componentes)
│       │   ├── investments/             #   Investimentos (7 componentes)
│       │   ├── goals/                   #   Metas (7 componentes)
│       │   ├── dashboard/               #   Dashboard e gráficos (13 componentes)
│       │   ├── fgts/                    #   FGTS (4 componentes)
│       │   ├── income/                  #   Receitas (3 componentes)
│       │   ├── networth/                #   Patrimônio líquido (3 componentes)
│       │   ├── annual/                  #   Resumo anual (3 componentes)
│       │   ├── settings/                #   Configurações (3 componentes)
│       │   ├── help/                    #   Ajuda (2 arquivos)
│       │   ├── layout/                  #   Sidebar, TabBar, navegação (6 componentes)
│       │   └── shared/                  #   Componentes reutilizáveis (9 componentes)
│       │
│       └── assets/
│           └── index.css                #   Tailwind + tema escuro customizado
│
├── resources/                           # Ícones da aplicação
│   ├── icon.icns                        #   macOS
│   ├── icon.ico                         #   Windows
│   └── icon.svg                         #   Vetor
│
├── electron.vite.config.ts              # Configuração do build
├── tsconfig.json                        # TypeScript (raiz)
├── tsconfig.web.json                    # TypeScript (renderer)
├── tsconfig.node.json                   # TypeScript (main/preload)
└── package.json                         # Dependências, scripts e config do builder
```

**Total: ~70 componentes React, 7 stores, 255+ linhas de lógica de cálculo.**

---

## Modelagem de Dados

Todos os dados são persistidos em um único arquivo JSON (`gfgc-data.json`) no diretório `userData` do Electron.

```
AppData
├── version: number
│
├── settings: AppSettings
│   ├── currency: "BRL"
│   ├── locale: "pt-BR"
│   ├── theme: "light" | "dark"
│   ├── categories: Category[]          # id, name, color, icon, budget, sortOrder
│   ├── customFields: CustomField[]     # id, name, type, appliesTo
│   ├── backupEnabled: boolean
│   ├── backupRetentionCount: number
│   └── autoGenerateRecurringBills: boolean
│
├── workspaces: Workspace[]             # id, name, type, color, sortOrder
│   └── type: "bills" | "investments" | "fgts" | "income"
│
├── bills: Bill[]                       # Templates de contas
│   ├── id, name, value (centavos), categoryId, dueDay
│   ├── isRecurring, recurrenceType, installments
│   └── workspaceId, customFieldValues, attachments
│
├── monthlyBillRecords: MonthlyBillRecord[]
│   ├── monthKey: "YYYY-MM"
│   └── entries: BillEntry[]            # billId, value, status, paidDate, notes
│
├── investments: Investment[]
│   ├── id, name, type, currentBalance (centavos)
│   └── workspaceId, isActive, notes, attachments
│
├── investmentTransactions: InvestmentTransaction[]
│   ├── investmentId, type: "contribution" | "withdrawal" | "yield"
│   ├── amount (centavos), date, monthKey
│   └── notes, attachments
│
├── goals: Goal[]
│   ├── id, name, targetAmount (centavos), currentAmount
│   ├── type: "manual" | "investment_linked"
│   ├── periodicity, startDate, endDate
│   ├── linkedInvestmentIds[]
│   └── contributions: GoalContribution[]  # amount, date, notes
│
├── fgtsRecords: FGTSRecord[]
│   ├── id, monthKey, balance (centavos)
│   └── workspaceId, notes
│
└── incomeEntries: IncomeEntry[]
    ├── id, name, amount (centavos), date, monthKey
    ├── category: "salary" | "freelance" | "investments" | "bonus" | "other"
    ├── isRecurring, recurrenceId, recurrenceRemovedAt
    └── workspaceId, notes
```

> Todos os valores monetários são armazenados em **centavos** (inteiros) para evitar problemas de aritmética de ponto flutuante.

---

## Começando

### Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- **Git**

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/gluizcortez/gfgc.git
cd gfgc

# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npm run dev
```

A aplicação abrirá automaticamente com hot-reload habilitado. DevTools do Electron são carregados automaticamente em modo dev.

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Inicia o app em modo de desenvolvimento com hot-reload |
| `build` | `npm run build` | Compila o código TypeScript/React para produção |
| `preview` | `npm run preview` | Preview do build de produção |
| `build:mac` | `npm run build:mac` | Build + empacotamento para macOS (.dmg) |
| `build:win` | `npm run build:win` | Build + empacotamento para Windows x64 (.exe) |
| `build:linux` | `npm run build:linux` | Build + empacotamento para Linux (.AppImage) |
| `build:unpack` | `npm run build:unpack` | Build + diretório desempacotado (para debug) |

---

## Build e Distribuição

### Configuração

O build é gerenciado pelo **electron-builder** com a seguinte configuração:

```json
{
  "appId": "com.gfgc.app",
  "productName": "GFGC",
  "mac": { "target": "dmg" },
  "win": { "target": [{ "target": "nsis", "arch": ["x64"] }] },
  "linux": { "target": "AppImage" }
}
```

### Artefatos

| Plataforma | Formato | Arquitetura |
|------------|---------|-------------|
| macOS | `.dmg` | arm64 (Apple Silicon) |
| Windows | `.exe` (NSIS installer) | x64 |
| Linux | `.AppImage` | x64 |

### Instalação no macOS

Como o app não possui assinatura de desenvolvedor Apple (code signing), o macOS pode bloquear a abertura exibindo a mensagem **"GFGC está danificado e não pode ser aberto"**. Para resolver, execute o seguinte comando no Terminal após instalar o app:

```bash
xattr -cr /Applications/GFGC.app
```

Depois disso, o app abrirá normalmente.

### Releases

Releases são publicados via [GitHub Releases](https://github.com/gluizcortez/gfgc/releases). O app verifica automaticamente por novas versões ao iniciar, consultando a GitHub API.

---

## Persistência e Backup

### Armazenamento

```
{userData}/
├── gfgc-data.json              # Dados principais da aplicação
├── attachments/                 # Arquivos anexados
│   └── {id}.{ext}
└── backups/                     # Backups automáticos
    ├── gfgc-data-2026-02-20T15-30-45.json
    ├── gfgc-data-2026-02-19T08-15-22.json
    └── ...
```

- **Escrita atômica** — Dados são escritos em arquivo temporário e renomeados, prevenindo corrupção em caso de crash
- **Debounce de 500ms** — Alterações frequentes são agrupadas para evitar I/O excessivo
- **Flush no fechamento** — `beforeunload` garante que alterações pendentes são salvas antes de fechar
- **Backup automático** — Criado na inicialização do app, com retenção configurável (padrão: 10 backups)
- **Export/Import** — Exportação completa em JSON + importação com validação de estrutura

### Localização do `userData`

| OS | Caminho |
|----|---------|
| macOS | `~/Library/Application Support/GFGC/` |
| Windows | `%APPDATA%/GFGC/` |
| Linux | `~/.config/GFGC/` |

---

## Licença

Este é um projeto pessoal. Todos os direitos reservados.

---

<p align="center">
  <sub>Desenvolvido com coordenação humana e assistência de IA.</sub>
</p>
