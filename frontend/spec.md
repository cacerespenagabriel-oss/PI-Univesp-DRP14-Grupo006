# Especificação do Front-end (Frequência+)

## 1. Visão Geral
O sistema "Frequência+" é um dashboard de gestão de presenças e ausências, projetado com foco em acessibilidade (WCAG 2.1) e usabilidade. A interface divide-se em uma barra lateral de navegação e uma área de exibição de dados analíticos.

## 2. Layout e Elementos Visuais
### Sidebar (Esquerda)
- **Marca**: 📅 Frequência+
- **Navegação**: Início (ativo), Planilhas, Relatórios, Configurações.
- **Acessibilidade**: Ícone ♿, controles de tamanho de fonte (A A A) e toggle de tema (claro/escuro).
- **Usuário**: Dropdown de perfil (👤 Usuário).

### Área Principal
- **Header**: Saudação ("Olá, Usuário! Gerencie as frequências..."), ícones de sino 🔔 e avatar 👤.
- **Upload de Planilha**: Área tracejada para Drag & Drop (Formatos: .xlsx, .csv - máx. 10MB) com botão azul "Selecionar Arquivo".
- **KPI Cards**:
  1. Total de Colaboradores: 42 (fundo azul claro)
  2. Presentes: 38 / 90,5% (fundo verde claro)
  3. Ausentes: 4 / 9,5% (fundo vermelho claro)
  4. Atrasos: 2 / 4,8% (fundo roxo claro)
- **Gráfico (Fluxo de Frequência)**: Gráfico de linhas (dias 01/08 a 07/08) comparando Presentes (linha azul) e Ausentes (linha vermelha).
- **Tabela (Últimas Registros)**: Colunas: Data, Colaborador, Status (badges verde/vermelho), Horário. Paginação inferior inclusa.
- **Footer**: Créditos de tecnologia e certificação "♿ Acessível | WCAG 2.1".

## 3. Arquitetura e Tecnologias
- **Soberania Digital e Open-Source**: Rejeição de dependências fechadas ou amarradas a serviços de nuvem estrangeiros no client-side.
- **Core**: Vite, React, TypeScript (alta performance e baixo consumo de bundle).
- **Estilos**: Tailwind CSS (utilitário ágil, facilita a padronização e responsividade).
- **Gráficos**: Recharts (D3-based, execução puramente no cliente).
- **Ícones**: Lucide React.
- **Estado**: Context API ou Zustand (caso a complexidade aumente).
