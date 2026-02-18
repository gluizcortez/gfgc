export interface HelpSection {
  id: string
  title: string
  icon: string
  summary: string
  content: HelpBlock[]
}

export interface HelpBlock {
  heading: string
  body: string
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'overview',
    title: 'Visão Geral',
    icon: 'info',
    summary: 'Conheça o GFGC e entenda como ele pode ajudar na sua gestão financeira.',
    content: [
      {
        heading: 'O que é o GFGC?',
        body: 'O GFGC (Gestão Financeira Gabriel & Carol) é uma ferramenta de gestão financeira pessoal que permite acompanhar contas mensais, investimentos, FGTS, metas financeiras e patrimônio. Tudo funciona offline no seu computador, sem necessidade de internet.'
      },
      {
        heading: 'Principais funcionalidades',
        body: '- **Contas Mensais**: Controle todas as suas despesas fixas e variáveis mês a mês.\n- **Investimentos**: Registre aportes, resgates e rendimentos de qualquer tipo de investimento.\n- **FGTS**: Acompanhe a evolução do seu saldo de FGTS.\n- **Metas**: Defina objetivos financeiros e monitore o progresso.\n- **Painel**: Veja um resumo visual de toda a sua saúde financeira.\n- **Resumo Anual**: Analise seus gastos e investimentos ao longo do ano.\n- **Patrimônio**: Veja a evolução do seu patrimônio líquido.'
      },
      {
        heading: 'Workspaces',
        body: 'Os workspaces permitem separar dados por contexto. Por exemplo, você pode ter um workspace "Minhas Contas" e outro "Contas da Carol", cada um com seus próprios dados. Workspaces estão disponíveis em Contas, Investimentos e FGTS.'
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Painel (Dashboard)',
    icon: 'layout-dashboard',
    summary: 'O centro de comando da sua vida financeira.',
    content: [
      {
        heading: 'O que é?',
        body: 'O Painel é a tela principal do GFGC. Ele mostra uma visão consolidada de todas as suas finanças em um só lugar, com gráficos e indicadores visuais.'
      },
      {
        heading: 'O que você encontra no Painel',
        body: '- **Cards de resumo**: Total de despesas, investimentos, patrimônio e metas no mês.\n- **Gráfico de despesas**: Pizza mostrando a distribuição dos gastos por categoria.\n- **Evolução dos investimentos**: Linha temporal do crescimento dos investimentos.\n- **Planejado vs Real**: Comparação entre o orçamento planejado e o gasto real.\n- **FGTS**: Evolução do saldo de FGTS.\n- **Portfólio**: Distribuição dos investimentos por tipo.'
      },
      {
        heading: 'Quando usar?',
        body: 'Acesse o Painel sempre que quiser ter uma visão rápida da sua situação financeira. É ideal para o check-in diário ou semanal.'
      }
    ]
  },
  {
    id: 'income',
    title: 'Receitas',
    icon: 'dollar-sign',
    summary: 'Registre suas fontes de renda para ter uma visão completa das suas finanças.',
    content: [
      {
        heading: 'O que é?',
        body: 'A seção de Receitas permite registrar todas as suas fontes de renda mensal: salário, freelance, rendimentos de investimentos, bônus e outros.'
      },
      {
        heading: 'Como usar',
        body: '1. Navegue até o mês desejado.\n2. Clique em **"Nova Receita"**.\n3. Informe a descrição, valor, categoria e data.\n4. Marque como **recorrente** se a receita se repete todo mês.\n5. Acompanhe o total por categoria nos cards de resumo.'
      },
      {
        heading: 'Categorias de receita',
        body: '- **Salário**: Renda fixa do emprego.\n- **Freelance**: Trabalhos avulsos e projetos.\n- **Rendimentos**: Juros, dividendos e rendimentos de investimentos.\n- **Bônus**: Participação nos lucros, 13º, etc.\n- **Outros**: Qualquer outra fonte de renda.'
      },
      {
        heading: 'Por que registrar receitas?',
        body: 'Com receitas e despesas registradas, você consegue calcular sua taxa de poupança, identificar meses de superávit ou déficit, e ter uma visão real do seu fluxo de caixa.'
      }
    ]
  },
  {
    id: 'bills',
    title: 'Contas Mensais',
    icon: 'receipt',
    summary: 'Controle todas as suas contas e despesas do mês.',
    content: [
      {
        heading: 'O que é?',
        body: 'A seção de Contas Mensais permite cadastrar, acompanhar e gerenciar todas as suas despesas mensais. Cada conta possui nome, valor, data de vencimento, categoria e status de pagamento.'
      },
      {
        heading: 'Como usar',
        body: '1. Selecione o workspace desejado na barra de abas.\n2. Navegue até o mês desejado usando as setas de navegação.\n3. Clique em **"Adicionar Conta"** para criar uma nova conta.\n4. Preencha nome, valor, dia de vencimento e categoria.\n5. Marque como **recorrente** se a conta se repete todo mês.\n6. Após pagar, clique no status para marcar como **Pago**.'
      },
      {
        heading: 'Status das contas',
        body: '- **Pendente**: Conta ainda não foi paga.\n- **Pago**: Conta já foi quitada.\n- **Atrasado**: O vencimento já passou e a conta não foi paga.'
      },
      {
        heading: 'Duplicar mês',
        body: 'Use a opção "Duplicar Mês" para copiar todas as contas do mês anterior para o mês atual. Isso é útil para despesas que se repetem mas não foram marcadas como recorrentes.'
      },
      {
        heading: 'Contas recorrentes',
        body: 'Ao marcar uma conta como recorrente, ela será automaticamente gerada nos meses seguintes (se a opção estiver habilitada em Configurações). Isso evita que você precise cadastrar a mesma conta todo mês.'
      },
      {
        heading: 'Orçamento por categoria',
        body: 'Em Configurações > Categorias, você pode definir um orçamento mensal para cada categoria. Na visão de Contas Mensais, o "Resumo do Orçamento" mostra quanto você já gastou em relação ao limite definido.'
      },
      {
        heading: 'Anexos',
        body: 'Você pode anexar comprovantes de pagamento a cada conta. Clique no botão de anexo ao editar uma conta para adicionar arquivos como PDFs ou imagens.'
      }
    ]
  },
  {
    id: 'investments',
    title: 'Investimentos',
    icon: 'trending-up',
    summary: 'Acompanhe seus investimentos, aportes e rendimentos.',
    content: [
      {
        heading: 'O que é?',
        body: 'A seção de Investimentos permite registrar e acompanhar todos os seus investimentos. Você pode cadastrar investimentos de diferentes tipos e registrar transações (aportes, resgates e rendimentos).'
      },
      {
        heading: 'Tipos de investimento',
        body: '- **Renda Fixa**: CDB, LCI, LCA, Tesouro Direto, etc.\n- **Ações**: Ações na bolsa de valores.\n- **Fundo de Investimento**: Fundos multimercado, de ações, imobiliários, etc.\n- **Criptomoedas**: Bitcoin, Ethereum e outras criptos.\n- **Outro**: Qualquer investimento que não se encaixe nas categorias acima.'
      },
      {
        heading: 'Como usar',
        body: '1. Clique em **"Novo Investimento"** para cadastrar um investimento.\n2. Informe o nome, tipo e notas.\n3. Para registrar movimentações, clique no investimento e depois em **"Nova Transação"**.\n4. Escolha o tipo: **Aporte** (dinheiro investido), **Resgate** (dinheiro retirado) ou **Rendimento** (ganhos).\n5. O saldo é calculado automaticamente.'
      },
      {
        heading: 'Quando usar Aporte vs Rendimento?',
        body: '- **Aporte**: Quando você envia dinheiro novo para o investimento.\n- **Rendimento**: Quando o investimento gera lucro (juros, dividendos, valorização).\n- **Resgate**: Quando você retira dinheiro do investimento.\n\nExemplo: Se você investiu R$ 1.000 e após um mês o saldo está R$ 1.050, registre R$ 1.000 como aporte e R$ 50 como rendimento.'
      },
      {
        heading: 'Simulador de projeção',
        body: 'Use o simulador de projeção para estimar o crescimento dos seus investimentos ao longo do tempo. Ele considera aportes periódicos e taxa de rendimento para projetar o valor futuro.'
      }
    ]
  },
  {
    id: 'fgts',
    title: 'FGTS',
    icon: 'landmark',
    summary: 'Registre e acompanhe seu saldo de FGTS ao longo do tempo.',
    content: [
      {
        heading: 'O que é?',
        body: 'A seção FGTS permite que você registre seu saldo de FGTS mensalmente, acompanhando a evolução ao longo do tempo em um gráfico anual.'
      },
      {
        heading: 'Como usar',
        body: '1. Selecione o workspace desejado.\n2. Clique em **"Registrar FGTS"** para adicionar um novo registro.\n3. Informe o mês, o saldo atual e observações opcionais.\n4. O gráfico anual será atualizado automaticamente.'
      },
      {
        heading: 'Por que registrar o FGTS?',
        body: 'O FGTS é um componente importante do seu patrimônio. Ao registrá-lo mensalmente, você consegue:\n- Ver a evolução ao longo dos meses e anos.\n- Incluí-lo no cálculo de patrimônio líquido.\n- Planejar melhor o uso (compra de imóvel, aposentadoria, etc.).'
      },
      {
        heading: 'Dica',
        body: 'Consulte o saldo do seu FGTS pelo app do FGTS (Caixa) ou pelo site e registre aqui para manter o histórico organizado.'
      }
    ]
  },
  {
    id: 'goals',
    title: 'Metas Financeiras',
    icon: 'target',
    summary: 'Defina objetivos e acompanhe o progresso das suas metas.',
    content: [
      {
        heading: 'O que é?',
        body: 'A seção de Metas permite definir objetivos financeiros com valores e prazos, acompanhando quanto falta para alcançá-los.'
      },
      {
        heading: 'Tipos de meta',
        body: '- **Manual**: Você registra manualmente cada contribuição. Ideal para metas de economia geral, como "Reserva de emergência" ou "Viagem".\n- **Vinculada a investimento**: O progresso é calculado automaticamente a partir dos investimentos selecionados. Ideal quando a meta está atrelada a um investimento específico.'
      },
      {
        heading: 'Quando usar Meta Manual vs Vinculada?',
        body: '**Use Meta Manual quando:**\n- A meta não está atrelada a um investimento específico.\n- Você quer registrar contribuições de diferentes fontes.\n- Exemplo: "Juntar R$ 5.000 para uma viagem".\n\n**Use Meta Vinculada quando:**\n- O dinheiro da meta está aplicado em um investimento.\n- Você quer que o progresso seja calculado automaticamente.\n- Exemplo: "Aposentadoria" vinculada à sua previdência privada.'
      },
      {
        heading: 'Periodicidade',
        body: 'Defina a periodicidade dos aportes na meta:\n- **Mensal**: Contribuição todo mês.\n- **Trimestral**: A cada 3 meses.\n- **Semestral**: A cada 6 meses.\n- **Anual**: Uma vez por ano.\n- **Personalizado**: Defina o intervalo em dias.'
      },
      {
        heading: 'Como usar',
        body: '1. Clique em **"Nova Meta"**.\n2. Defina o nome, valor alvo, periodicidade e tipo.\n3. Se for vinculada, selecione os investimentos.\n4. Para metas manuais, registre contribuições clicando em **"Adicionar Contribuição"**.\n5. Acompanhe o progresso pela barra de progresso no card da meta.'
      }
    ]
  },
  {
    id: 'annual',
    title: 'Resumo Anual',
    icon: 'calendar',
    summary: 'Análise consolidada dos seus dados ao longo do ano.',
    content: [
      {
        heading: 'O que é?',
        body: 'O Resumo Anual apresenta uma visão consolidada de todos os seus gastos e receitas ao longo de um ano, com gráficos mensais e análise por categoria.'
      },
      {
        heading: 'O que você encontra',
        body: '- **Gráfico de barras mensal**: Mostra o total de despesas por mês, facilitando a identificação de meses com gastos acima da média.\n- **Gráfico de categorias**: Pizza mostrando a distribuição anual dos gastos por categoria.\n- **Totais do ano**: Soma total de despesas, média mensal e outras métricas.'
      },
      {
        heading: 'Quando usar?',
        body: 'O Resumo Anual é ideal para:\n- Planejamento financeiro de longo prazo.\n- Identificar padrões de gastos ao longo dos meses.\n- Comparar gastos entre categorias.\n- Preparar informações para declaração de imposto de renda.'
      }
    ]
  },
  {
    id: 'networth',
    title: 'Patrimônio',
    icon: 'wallet',
    summary: 'Acompanhe a evolução do seu patrimônio líquido.',
    content: [
      {
        heading: 'O que é?',
        body: 'A seção Patrimônio mostra a evolução do seu patrimônio líquido ao longo do tempo, somando todos os seus investimentos e FGTS.'
      },
      {
        heading: 'O que compõe o patrimônio?',
        body: '- **Investimentos**: Soma de todos os saldos dos seus investimentos ativos.\n- **FGTS**: Último saldo registrado de FGTS.\n- O patrimônio total é a soma de todos esses itens.'
      },
      {
        heading: 'Como usar',
        body: 'Basta manter seus investimentos e FGTS atualizados. O patrimônio é calculado automaticamente. O gráfico de evolução mostra como seu patrimônio cresceu mês a mês.'
      },
      {
        heading: 'Dica',
        body: 'Atualize seus investimentos e FGTS regularmente (pelo menos uma vez por mês) para ter um gráfico de evolução preciso.'
      }
    ]
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: 'settings',
    summary: 'Personalize o GFGC de acordo com suas preferências.',
    content: [
      {
        heading: 'Aparência',
        body: 'Alterne entre o tema **Claro** e **Escuro** de acordo com sua preferência. O tema escuro é ideal para uso noturno e reduz o cansaço visual.'
      },
      {
        heading: 'Backup automático',
        body: 'Quando ativado, o GFGC cria um backup dos seus dados automaticamente ao abrir o aplicativo. Você pode configurar quantos backups manter (os mais antigos são removidos automaticamente).'
      },
      {
        heading: 'Contas recorrentes automáticas',
        body: 'Se ativado, ao navegar para um mês que ainda não tem contas cadastradas, o GFGC automaticamente gera as contas marcadas como recorrentes. Isso poupa tempo e garante que você não esqueça de nenhuma despesa fixa.'
      },
      {
        heading: 'Exportar e Importar dados',
        body: '- **Exportar**: Salva todos os seus dados em um arquivo JSON. Use para backup manual ou transferência entre computadores.\n- **Importar**: Carrega dados de um arquivo exportado anteriormente. **Atenção**: a importação substitui todos os dados atuais.'
      },
      {
        heading: 'Gerenciar Workspaces',
        body: 'Crie, edite e exclua workspaces. Cada workspace funciona como uma "área separada" dentro do GFGC. Exemplo: "Minhas Finanças" e "Finanças Conjuntas".'
      },
      {
        heading: 'Gerenciar Categorias',
        body: 'Crie categorias personalizadas para organizar suas contas e investimentos. Cada categoria pode ter uma cor e um orçamento mensal opcional. Exemplo: "Moradia", "Alimentação", "Transporte".'
      }
    ]
  },
  {
    id: 'tips',
    title: 'Atalhos e Dicas',
    icon: 'lightbulb',
    summary: 'Dicas para usar o GFGC de forma mais eficiente.',
    content: [
      {
        heading: 'Atalhos de teclado',
        body: '- **⌘K / Ctrl+K**: Abre a barra de pesquisa rápida. Digite para navegar entre seções ou executar ações.'
      },
      {
        heading: 'Calendário de vencimentos',
        body: 'Na seção de Contas Mensais, alterne entre a visualização em lista e o calendário usando os botões no canto superior. O calendário mostra as contas organizadas por dia de vencimento, com cores indicando o status (verde = pago, amarelo = pendente, vermelho = atrasado).'
      },
      {
        heading: 'Exportar relatórios',
        body: 'Você pode exportar seus dados em CSV:\n- **Contas Mensais**: Clique no ícone de download para exportar as contas do mês atual.\n- **Resumo Anual**: Clique em "Exportar CSV" para exportar o resumo do ano selecionado.'
      },
      {
        heading: 'Barra de pesquisa',
        body: 'A barra de pesquisa no topo da tela permite encontrar rapidamente qualquer seção ou ação. Digite "contas" para ir às Contas Mensais, "nova meta" para criar uma meta, etc.'
      },
      {
        heading: 'Fluxo recomendado',
        body: '1. **Configure categorias** em Configurações.\n2. **Crie workspaces** para separar suas finanças.\n3. **Cadastre contas recorrentes** para o mês atual.\n4. **Registre investimentos** e transações.\n5. **Defina metas** de curto e longo prazo.\n6. **Acompanhe no Painel** semanalmente.'
      },
      {
        heading: 'Boas práticas',
        body: '- Atualize suas contas e investimentos pelo menos uma vez por mês.\n- Use a duplicação de mês para agilizar o cadastro de contas.\n- Ative o backup automático para não perder dados.\n- Exporte seus dados periodicamente como backup extra.\n- Use categorias com cores diferentes para facilitar a visualização nos gráficos.'
      }
    ]
  }
]
