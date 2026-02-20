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
        body: 'O GFGC (Gestão Financeira Gabriel & Carol) é uma ferramenta completa de gestão financeira pessoal. Com ela você pode acompanhar contas mensais, receitas, investimentos, FGTS, metas financeiras e patrimônio. Tudo funciona 100% offline no seu computador — seus dados nunca saem da sua máquina.'
      },
      {
        heading: 'Principais funcionalidades',
        body: '- **Contas Mensais**: Controle despesas fixas e variáveis mês a mês, com status de pagamento, recorrência e anexos.\n- **Receitas**: Registre todas as suas fontes de renda (salário, freelance, bônus, etc.).\n- **Investimentos**: Registre aportes, resgates e rendimentos de qualquer tipo de investimento.\n- **FGTS**: Acompanhe a evolução do seu saldo de FGTS.\n- **Metas**: Defina objetivos financeiros com prazos e projeções automáticas.\n- **Painel**: Resumo visual mensal ou anual com gráficos interativos.\n- **Relatório PDF**: Exporte um relatório mensal consolidado para impressão ou PDF.\n- **Patrimônio**: Evolução do seu patrimônio líquido ao longo do tempo.\n- **Busca Rápida**: Encontre qualquer dado ou ação com **⌘K / Ctrl+K**.\n- **Lembretes**: Notificação automática de contas vencidas ou vencendo ao abrir o app.'
      },
      {
        heading: 'Workspaces (Abas)',
        body: 'Os workspaces permitem separar dados por contexto. Por exemplo, você pode ter um workspace "Minhas Contas" e outro "Contas da Carol", cada um com seus próprios dados independentes.\n\nWorkspaces estão disponíveis em:\n- **Contas Mensais**\n- **Investimentos**\n- **FGTS**\n- **Receitas**\n\nVocê pode criar, renomear, alterar a cor e excluir workspaces em **Configurações > Abas / Workspaces**.'
      },
      {
        heading: 'Notificações e lembretes',
        body: 'Ao abrir o GFGC, o app verifica automaticamente se há contas atrasadas ou vencendo no dia. Se houver, uma notificação aparece no topo da tela. Clique nela para ir direto à seção de Contas Mensais.\n\nO sino de notificações (no canto superior esquerdo) também mostra alertas sobre:\n- Contas vencidas ou próximas do vencimento\n- Novas versões disponíveis do aplicativo'
      },
      {
        heading: 'Atualizações do aplicativo',
        body: 'O GFGC verifica automaticamente se há novas versões ao abrir. Você também pode verificar manualmente em **Configurações > Atualizações**. Quando uma atualização está disponível, basta clicar para baixar o instalador e atualizar.'
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
        body: 'O Painel é a tela principal do GFGC. Ele mostra uma visão consolidada de todas as suas finanças em um só lugar, com gráficos interativos e indicadores visuais. Você pode alternar entre a visão **Mensal** e a visão **Anual** usando os botões no topo.'
      },
      {
        heading: 'Visão Mensal',
        body: 'Na visão mensal, você encontra:\n\n- **Alertas**: Cards destacando contas atrasadas, vencendo hoje ou próximas do vencimento.\n- **Cards de resumo**: Total de despesas, investimentos, patrimônio e progresso das metas.\n- **Gráfico de despesas (pizza)**: Distribuição dos gastos por categoria.\n- **Gráfico de receitas (pizza)**: Distribuição das receitas por categoria.\n- **Planejado vs Real**: Comparação entre a meta planejada e o que foi realmente contribuído.\n- **Contribuições das metas**: Aportes por meta no período.\n- **Portfólio**: Distribuição dos investimentos por tipo.\n- **Detalhamento de investimentos**: Aportes, resgates e rendimentos do mês.\n- **Tendência de despesas**: Evolução dos gastos nos últimos 6 meses.\n- **Tendência por categoria**: Evolução das maiores categorias de gastos.\n- **Evolução dos investimentos**: Linha temporal do patrimônio investido.\n- **FGTS**: Evolução do saldo de FGTS.'
      },
      {
        heading: 'Filtros por workspace',
        body: 'No topo do Painel, abaixo do navegador de meses, você pode filtrar os dados por workspace. Os filtros são separados por tipo:\n\n- **Contas**: Selecione quais workspaces de contas incluir nos gráficos.\n- **Investimentos**: Selecione quais workspaces de investimentos incluir.\n- **Receitas**: Selecione quais workspaces de receitas incluir.\n- **Metas**: Selecione quais metas exibir.\n\nPor padrão, todos os workspaces e metas estão selecionados. Clique em um para desmarcar/marcar.'
      },
      {
        heading: 'Relatório Mensal (PDF)',
        body: 'Ao lado do navegador de meses, há um botão com ícone de documento. Ao clicar, um modal apresenta um resumo consolidado do mês:\n\n- Receitas totais, despesas totais e saldo.\n- Despesas por categoria com percentual.\n- Resumo dos investimentos (saldo, aportes, resgates, rendimentos).\n- Metas ativas e progresso.\n- Saldo mais recente do FGTS.\n\nClique em **"Imprimir / Salvar PDF"** para gerar o relatório. O relatório respeita os filtros de workspace ativos no Painel.'
      },
      {
        heading: 'Visão Anual',
        body: 'Alterne para a visão Anual clicando no botão **Ano** ao lado do título "Painel". Nesta visão:\n\n- **Cards resumo**: Total de despesas, receitas, investimentos e metas do ano.\n- **Balanço**: Receitas vs Despesas com saldo do ano.\n- **Gráfico de barras mensal**: Despesas por mês no ano.\n- **Distribuição por categoria**: Pizza anual de gastos.\n- **Resumo de investimentos**: Aportes, rendimentos e retiradas no ano.\n- **Evolução do FGTS**: Saldo ao longo do ano.\n- **Receitas por categoria**: Distribuição anual das fontes de renda.\n\nUse o botão **Exportar CSV** para baixar os dados em formato de planilha.'
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
        body: 'A seção de Receitas permite registrar todas as suas fontes de renda mensal. Com receitas e despesas registradas, o Painel consegue calcular seu saldo mensal (receitas - despesas), ajudando a identificar meses de superávit ou déficit.'
      },
      {
        heading: 'Como usar',
        body: '1. Selecione o workspace desejado na barra de abas (ou crie um novo).\n2. Navegue até o mês desejado usando as setas.\n3. Clique em **"Nova Receita"**.\n4. Informe o nome (ex: "Salário"), o valor, a categoria e a data.\n5. Marque como **recorrente** se a receita se repete todo mês.\n6. Clique em **"Salvar"**.'
      },
      {
        heading: 'Receitas recorrentes',
        body: 'Ao marcar uma receita como recorrente, ela será automaticamente gerada nos próximos meses quando você navegar para eles. Isso é ideal para:\n\n- Salário fixo\n- Renda de aluguel\n- Assinaturas que geram receita\n\nSe uma receita recorrente mudar de valor, edite a entrada mais recente. Os meses futuros usarão o valor atualizado.\n\nVocê pode remover a recorrência de uma receita clicando no ícone correspondente na tabela — e restaurá-la depois, se necessário.'
      },
      {
        heading: 'Categorias de receita',
        body: '- **Salário**: Renda fixa do emprego (CLT, PJ, etc.).\n- **Freelance**: Trabalhos avulsos, projetos e consultorias.\n- **Rendimentos**: Juros, dividendos e rendimentos de investimentos.\n- **Bônus**: Participação nos lucros, 13º salário, premiações.\n- **Outros**: Qualquer outra fonte de renda (vendas, devoluções, etc.).'
      },
      {
        heading: 'Exportar receitas',
        body: 'Clique no ícone de download no canto superior da página para exportar as receitas do mês atual em formato CSV, compatível com Excel e Google Sheets.'
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
        body: 'A seção de Contas Mensais permite cadastrar, acompanhar e gerenciar todas as suas despesas mensais. Cada conta possui nome, valor, data de vencimento, categoria e status de pagamento. O sistema detecta automaticamente contas atrasadas e emite alertas.'
      },
      {
        heading: 'Como usar',
        body: '1. Selecione o workspace desejado na barra de abas.\n2. Navegue até o mês desejado usando as setas de navegação.\n3. Clique em **"Adicionar Conta"** para criar uma nova conta.\n4. Preencha o nome, valor, data de vencimento e categoria.\n5. Opcionalmente, marque **"Repetir nos próximos meses"** para gerar a conta automaticamente nos meses seguintes (útil para parcelamentos).\n6. Após pagar, clique no badge de status na tabela para alternar entre **Pendente** e **Pago**.\n7. Ao editar uma conta, você também pode marcar como pago pelo botão dentro do formulário.'
      },
      {
        heading: 'Status das contas',
        body: '- **Pendente** (amarelo): Conta ainda não foi paga e o vencimento não chegou.\n- **Pago** (verde): Conta já foi quitada. A data de pagamento é registrada automaticamente.\n- **Atrasado** (vermelho): O vencimento já passou e a conta não foi paga. Muda automaticamente.\n\nDica: Ao abrir o app, o GFGC notifica se há contas atrasadas ou vencendo no dia.'
      },
      {
        heading: 'Visualizações: Lista e Calendário',
        body: 'Alterne entre duas formas de visualizar suas contas:\n\n- **Lista**: Tabela com todas as contas do mês, ordenáveis por nome, valor, vencimento ou status. Permite edição e exclusão rápida.\n- **Calendário**: Visão mensal onde as contas aparecem nos seus respectivos dias de vencimento. Cores indicam o status (verde = pago, amarelo = pendente, vermelho = atrasado).\n\nUse os botões no canto superior direito para alternar.'
      },
      {
        heading: 'Contas recorrentes',
        body: 'Contas marcadas como recorrentes (em Configurações > Contas recorrentes automáticas = ativo) serão geradas automaticamente quando você navegar para um mês que ainda não tem contas. Isso é ideal para:\n\n- Aluguel, condomínio, internet\n- Assinaturas (streaming, academia)\n- Seguros e planos de saúde\n\nAs contas são geradas com o mesmo valor, categoria e dia de vencimento. Se o mês de destino tem menos dias (ex: fevereiro), o vencimento é ajustado para o último dia do mês.'
      },
      {
        heading: 'Repetição por múltiplos meses (parcelamento)',
        body: 'Diferente da recorrência automática, ao criar uma conta você pode selecionar **"Repetir nos próximos meses"** e definir quantos meses. Isso cria entradas individuais para cada mês com numeração automática (ex: "TV (1/12)", "TV (2/12)", etc.). Ideal para:\n\n- Compras parceladas no cartão\n- Financiamentos com prazo definido\n- Qualquer despesa com número fixo de parcelas'
      },
      {
        heading: 'Duplicar mês',
        body: 'Use a opção **"Duplicar Mês"** (ícone de cópia) para copiar todas as contas de um mês para outro. Selecione o mês de origem e o de destino. Todas as contas são copiadas com status "Pendente". Útil quando você quer copiar manualmente de um mês específico.'
      },
      {
        heading: 'Orçamento por categoria',
        body: 'Em **Configurações > Categorias**, defina um orçamento mensal para cada categoria (ex: "Alimentação: R$ 1.500"). Na tela de Contas, o **Resumo do Orçamento** mostra:\n\n- Quanto foi gasto em relação ao limite\n- Barra de progresso com cores (verde = dentro, amarelo = perto, vermelho = acima)\n- Percentual de uso do orçamento'
      },
      {
        heading: 'Anexos e comprovantes',
        body: 'Ao criar ou editar uma conta, você pode anexar comprovantes de pagamento (PDFs, imagens, etc.). Os anexos são armazenados localmente e podem ser abertos diretamente pelo app. Útil para manter uma cópia digital dos recibos.'
      },
      {
        heading: 'Exportar contas',
        body: 'Clique no ícone de download no canto superior para exportar todas as contas do mês atual em formato CSV.'
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
        body: 'A seção de Investimentos permite registrar e acompanhar todos os seus investimentos. Cadastre cada investimento, registre movimentações mensais e acompanhe a evolução do saldo automaticamente.'
      },
      {
        heading: 'Tipos de investimento',
        body: '- **Renda Fixa**: CDB, LCI, LCA, Tesouro Direto, poupança, CRI/CRA.\n- **Ações**: Ações na bolsa de valores (B3).\n- **Fundo de Investimento**: Fundos multimercado, de ações, imobiliários (FIIs), etc.\n- **Criptomoedas**: Bitcoin, Ethereum e outras criptomoedas.\n- **Outro**: Qualquer investimento que não se encaixe nas categorias acima (ouro, previdência privada, etc.).'
      },
      {
        heading: 'Como usar',
        body: '1. Selecione o workspace desejado na barra de abas.\n2. Clique em **"Novo Investimento"** para cadastrar.\n3. Informe o nome (ex: "CDB Banco X"), o tipo e observações opcionais.\n4. O investimento aparece na lista com saldo R$ 0,00.\n5. Clique no investimento para expandir e ver as transações.\n6. Clique em **"Nova Transação"** para registrar uma movimentação.\n7. O saldo é recalculado automaticamente após cada transação.'
      },
      {
        heading: 'Tipos de transação',
        body: '- **Aporte**: Dinheiro novo que você envia para o investimento. Aumenta o saldo.\n- **Rendimento**: Lucro gerado pelo investimento (juros, dividendos, valorização). Aumenta o saldo.\n- **Resgate**: Dinheiro que você retira do investimento. Diminui o saldo.\n\n**Exemplo prático:**\nVocê investiu R$ 1.000 em um CDB. Após um mês, o saldo é R$ 1.050.\n- Registre R$ 1.000 como **Aporte**\n- Registre R$ 50 como **Rendimento**\n- Saldo final: R$ 1.050'
      },
      {
        heading: 'Investimentos ativos e inativos',
        body: 'Você pode desativar um investimento clicando no toggle. Investimentos inativos:\n\n- Não aparecem nos gráficos do Painel\n- Não são incluídos no cálculo de patrimônio\n- Continuam com o histórico preservado\n\nIsso é útil quando você resgata totalmente um investimento mas quer manter o histórico.'
      },
      {
        heading: 'Simulador de projeção',
        body: 'Use o simulador de projeção para estimar o crescimento futuro dos seus investimentos. Informe:\n\n- Saldo inicial\n- Aporte mensal\n- Taxa de rendimento esperada (% ao mês)\n- Período em meses\n\nO simulador calcula o valor futuro considerando juros compostos e aportes periódicos.'
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
        body: 'A seção FGTS permite que você registre o saldo do seu Fundo de Garantia mensalmente, criando um histórico visual da evolução ao longo do tempo. O saldo também é incluído no cálculo do patrimônio líquido.'
      },
      {
        heading: 'Como usar',
        body: '1. Selecione o workspace desejado (ou crie um, ex: "Meu FGTS").\n2. Clique em **"Registrar FGTS"**.\n3. Selecione o mês de referência.\n4. Informe o saldo atual (conforme extrato do FGTS).\n5. Adicione observações opcionais (ex: "Depósito referente a Out/2025").\n6. O gráfico anual é atualizado automaticamente.'
      },
      {
        heading: 'Gráfico de evolução',
        body: 'O gráfico mostra a evolução do saldo ao longo dos meses. Selecione o ano desejado no dropdown para visualizar períodos diferentes. Passe o mouse sobre os pontos do gráfico para ver o saldo exato de cada mês.'
      },
      {
        heading: 'Por que registrar o FGTS?',
        body: 'O FGTS é um componente importante do seu patrimônio que muitas vezes é esquecido. Ao registrá-lo mensalmente:\n\n- Você acompanha o crescimento mês a mês\n- O valor entra no cálculo do patrimônio líquido (seção Patrimônio)\n- Pode planejar o uso futuro (compra de imóvel, aposentadoria, saque-aniversário)\n- Identifica se os depósitos do empregador estão corretos'
      },
      {
        heading: 'Como consultar o saldo real',
        body: 'Para obter o saldo atualizado do seu FGTS:\n\n- **App FGTS** (Caixa Econômica Federal) — disponível para iOS e Android\n- **Site**: fgts.caixa.gov.br\n- **Internet Banking** da Caixa\n- **Extrato por SMS**: envie "FGTS" para 26878\n\nRegistre aqui o saldo que aparece no extrato para manter seu histórico organizado.'
      }
    ]
  },
  {
    id: 'goals',
    title: 'Metas Financeiras',
    icon: 'target',
    summary: 'Defina objetivos, acompanhe o progresso e veja projeções automáticas.',
    content: [
      {
        heading: 'O que é?',
        body: 'A seção de Metas permite definir objetivos financeiros com valores, prazos e periodicidade. Cada meta mostra o progresso atual, histórico de contribuições e uma projeção automática de quando o objetivo será atingido.'
      },
      {
        heading: 'Tipos de meta',
        body: '- **Manual**: Você registra manualmente cada contribuição/aporte. O progresso é calculado a partir desses registros.\n- **Vinculada a investimento**: O progresso é calculado automaticamente a partir dos aportes registrados nos investimentos selecionados. Nenhuma entrada manual é necessária.'
      },
      {
        heading: 'Quando usar Meta Manual vs Vinculada?',
        body: '**Use Meta Manual quando:**\n- A meta não está atrelada a um investimento específico\n- Você quer registrar contribuições de diferentes fontes\n- Exemplo: "Juntar R$ 5.000 para uma viagem", "Reserva de emergência"\n\n**Use Meta Vinculada quando:**\n- O dinheiro da meta já está aplicado em investimentos cadastrados\n- Você quer que o progresso seja calculado automaticamente\n- Exemplo: "Aposentadoria" vinculada à sua previdência privada'
      },
      {
        heading: 'Como criar uma meta',
        body: '1. Clique em **"Nova Meta"**.\n2. Defina o nome (ex: "Reserva de Emergência").\n3. Escolha o tipo: **Manual** ou **Vinculada a Investimento**.\n4. Informe o **valor alvo por período** (quanto quer contribuir por mês/trimestre/etc.).\n5. Selecione a **periodicidade** (mensal, trimestral, semestral, anual).\n6. Opcionalmente, defina um **prazo final** (data limite).\n7. Se for vinculada, selecione os workspaces ou investimentos.\n8. Clique em **"Criar Meta"**.'
      },
      {
        heading: 'Registrando aportes (metas manuais)',
        body: 'Para metas manuais:\n\n1. No card da meta, clique em **"Registrar Aporte"**.\n2. Selecione o período (ex: "2026-02" para fevereiro de 2026).\n3. Informe o valor aportado.\n4. O modal mostra em tempo real o percentual da meta e a diferença em relação ao alvo.\n5. Clique em **"Registrar"**.\n\nA barra de progresso no card é atualizada automaticamente. Você pode ver o histórico completo clicando em **"Histórico"**.'
      },
      {
        heading: 'Projeção automática',
        body: 'Cada meta exibe um badge de projeção que estima quando o objetivo será atingido, baseado no ritmo atual de contribuições:\n\n- **Verde**: "Projeção: Jul/2027" — indica que você está no caminho certo (dentro do prazo, se definido).\n- **Amarelo**: "Projeção: Dez/2028 (após prazo)" — indica que no ritmo atual você ultrapassará o prazo definido.\n- **Cinza**: "Dados insuficientes para projeção" — aparece quando há menos de 2 períodos de dados.\n\nA projeção também mostra a **média de contribuição por período**, para que você saiba quanto está aportando em média.\n\nDica: Quanto mais períodos de dados, mais precisa fica a projeção.'
      },
      {
        heading: 'Gerenciando metas',
        body: '- **Pausar/Reativar**: Clique no ícone de pause para pausar uma meta. Metas pausadas ficam com opacidade reduzida e não aparecem nos gráficos.\n- **Editar**: Altere nome, valor, periodicidade ou vinculação.\n- **Excluir**: Remove a meta e todo o histórico de contribuições.\n- **Gráfico**: Para metas manuais com histórico, clique no ícone de gráfico para ver a evolução visual dos aportes.'
      },
      {
        heading: 'Filtro por período',
        body: 'No topo da página de Metas, você pode filtrar por período para ver o progresso de todos as metas em um período específico. Use o seletor de período para navegar entre meses, trimestres ou semestres (conforme a periodicidade de cada meta).'
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
        body: 'A seção Patrimônio mostra a evolução do seu patrimônio líquido ao longo do tempo. O patrimônio é calculado automaticamente somando todos os seus investimentos ativos e o saldo mais recente do FGTS.'
      },
      {
        heading: 'O que compõe o patrimônio?',
        body: '- **Investimentos**: Soma dos saldos de todos os investimentos ativos em todos os workspaces.\n- **FGTS**: Último saldo registrado de FGTS.\n\nO patrimônio total é a soma desses componentes. Investimentos inativos não são incluídos.'
      },
      {
        heading: 'Gráfico de evolução',
        body: 'O gráfico mostra como seu patrimônio cresceu (ou variou) mês a mês. Para cada mês, o sistema reconstrói o saldo dos investimentos a partir do histórico de transações e combina com o saldo de FGTS do período.\n\nPasse o mouse sobre os pontos para ver o valor exato. Selecione o ano desejado no dropdown para visualizar diferentes períodos.'
      },
      {
        heading: 'Como manter preciso',
        body: 'Para ter um gráfico de evolução confiável:\n\n- Registre transações de investimentos regularmente (pelo menos uma vez por mês)\n- Atualize o saldo do FGTS mensalmente\n- Mantenha investimentos que você não usa mais como "inativos" ao invés de excluí-los (para preservar o histórico)'
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
        heading: 'Aparência (Tema)',
        body: 'Alterne entre o tema **Claro** e **Escuro**. O tema escuro usa fundo preto verdadeiro com contrastes elegantes, ideal para uso noturno e para reduzir o cansaço visual em ambientes com pouca luz.'
      },
      {
        heading: 'Backup automático',
        body: 'Quando ativado, o GFGC cria um backup dos seus dados automaticamente ao abrir o aplicativo. Configure quantos backups manter — os mais antigos são removidos automaticamente.\n\nOs backups são salvos na pasta de dados do aplicativo. Recomendamos manter pelo menos 5 backups.'
      },
      {
        heading: 'Contas recorrentes automáticas',
        body: 'Se ativado, ao navegar para um mês que ainda não tem contas cadastradas, o GFGC gera automaticamente as contas marcadas como recorrentes. Isso poupa tempo e garante que você não esqueça de nenhuma despesa fixa.\n\nDesative esta opção se você preferir cadastrar contas manualmente a cada mês.'
      },
      {
        heading: 'Exportar dados',
        body: 'Clique em **"Exportar"** para salvar todos os seus dados em um arquivo JSON. O arquivo inclui configurações, workspaces, contas, investimentos, metas, FGTS e receitas.\n\nUse para:\n- Backup manual\n- Transferência entre computadores\n- Segurança extra além do backup automático'
      },
      {
        heading: 'Importar dados',
        body: 'Clique em **"Importar"** para carregar dados de um arquivo JSON exportado anteriormente.\n\n**Atenção**: antes de importar, um diálogo de confirmação será exibido, pois a importação **substitui todos os dados atuais**. Certifique-se de exportar um backup antes de importar, caso queira preservar os dados atuais.'
      },
      {
        heading: 'Gerenciar Workspaces',
        body: 'Crie, renomeie, altere a cor e exclua workspaces. Cada workspace funciona como uma "área separada" dentro do GFGC. Tipos disponíveis:\n\n- **Contas Mensais**: Para separar despesas por pessoa, cartão, etc.\n- **Investimentos**: Para separar carteiras ou objetivos.\n- **Receitas**: Para separar fontes de renda.\n\n**Atenção**: Ao excluir um workspace, todos os dados associados são perdidos permanentemente.'
      },
      {
        heading: 'Gerenciar Categorias',
        body: 'Crie categorias personalizadas para organizar suas contas e investimentos. Cada categoria tem:\n\n- **Nome**: Identificação (ex: "Moradia", "Alimentação").\n- **Cor**: Usada nos gráficos de pizza e barras.\n- **Tipo**: Contas, Investimentos ou Ambos.\n- **Orçamento**: Valor mensal opcional. Quando definido, o Resumo do Orçamento mostra quanto você já gastou.\n\nCategorias padrão não podem ser excluídas. Categorias personalizadas podem ser editadas ou excluídas livremente.'
      },
      {
        heading: 'Atualizações',
        body: 'Na seção de atualizações, você pode:\n\n- Ver a **versão atual** do aplicativo.\n- **Verificar** se há novas versões disponíveis.\n- **Baixar** o instalador da versão mais recente.\n\nO GFGC também verifica atualizações automaticamente ao abrir, notificando quando uma nova versão estiver disponível.'
      },
      {
        heading: 'Apagar base de dados',
        body: 'Em caso extremo, você pode apagar todos os dados e voltar ao estado de fábrica. Para confirmar, é necessário digitar a frase de confirmação exata. Esta ação é **irreversível** — faça um export antes se quiser preservar algo.'
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
        heading: 'Busca rápida (⌘K / Ctrl+K)',
        body: 'A barra de pesquisa no topo da tela é uma das formas mais rápidas de navegar pelo GFGC. Pressione **⌘K** (Mac) ou **Ctrl+K** (Windows) para ativá-la.\n\nA busca funciona em duas camadas:\n\n- **Navegação e ações**: Digite "painel", "contas", "nova meta", "exportar" para ir direto à seção ou executar ações.\n- **Dados reais**: Digite o nome de uma conta, investimento, meta ou receita para encontrá-lo. Os resultados aparecem agrupados por tipo.\n\nUse as setas do teclado para navegar e Enter para selecionar.'
      },
      {
        heading: 'Atalhos de teclado',
        body: '- **⌘K / Ctrl+K**: Abre a busca rápida.\n- **Escape**: Fecha modais, formulários e a busca.\n- **Enter**: Confirma formulários e seleções.\n- **Setas**: Navegam pela busca e por listas.'
      },
      {
        heading: 'Calendário rápido',
        body: 'No canto superior esquerdo (ao lado do sino de notificações), há um ícone de calendário. Clique nele para abrir um calendário mensal ampliado que mostra todas as contas do mês organizadas por dia, com cores de status. É uma forma rápida de ver o panorama de vencimentos sem sair da tela atual.'
      },
      {
        heading: 'Fluxo recomendado para iniciantes',
        body: '1. **Crie workspaces** em Configurações para organizar seus dados (ex: "Pessoal", "Conjunta").\n2. **Configure categorias** com orçamentos mensais para as principais despesas.\n3. **Cadastre suas contas fixas** como recorrentes (aluguel, internet, etc.).\n4. **Registre suas receitas** (salário e outras fontes de renda).\n5. **Cadastre seus investimentos** e registre os saldos/aportes atuais.\n6. **Registre o saldo do FGTS** (consulte pelo app da Caixa).\n7. **Crie metas** para seus objetivos financeiros.\n8. **Acompanhe no Painel** semanalmente para ter controle total.'
      },
      {
        heading: 'Fluxo mensal recomendado',
        body: 'A cada início de mês:\n\n1. Navegue para o novo mês em **Contas Mensais** (as recorrentes são geradas automaticamente).\n2. Ajuste valores de contas que mudaram.\n3. Registre novas receitas ou confirme as recorrentes.\n4. Registre aportes e rendimentos nos investimentos.\n5. Atualize o saldo do FGTS.\n6. Registre aportes nas metas manuais.\n7. Verifique o **Painel** para ter a visão consolidada do mês.\n8. Gere o **Relatório PDF** se quiser manter um registro impresso.'
      },
      {
        heading: 'Boas práticas',
        body: '- Atualize suas contas e investimentos pelo menos uma vez por mês.\n- Use a **duplicação de mês** para agilizar o cadastro quando não usar recorrência automática.\n- Mantenha o **backup automático ativo** e exporte manualmente antes de atualizações importantes.\n- Use **cores diferentes** nas categorias para facilitar a leitura dos gráficos.\n- **Pausar metas** que você não está contribuindo temporariamente, ao invés de excluí-las.\n- Mantenha investimentos resgatados como **inativos** para preservar o histórico no patrimônio.\n- Use o **tema escuro** em ambientes com pouca luz para conforto visual.'
      },
      {
        heading: 'Exportar relatórios',
        body: 'O GFGC oferece várias formas de exportar dados:\n\n- **Relatório Mensal PDF**: No Painel (visão mês), clique no ícone de documento ao lado do navegador de meses.\n- **CSV de Contas**: Na página de Contas, clique no ícone de download.\n- **CSV de Receitas**: Na página de Receitas, clique no ícone de download.\n- **CSV Anual**: No Painel (visão ano), clique em "Exportar CSV".\n- **Backup JSON completo**: Em Configurações > Exportar.'
      }
    ]
  }
]
