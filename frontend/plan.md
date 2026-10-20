# Plano de Ação - Implementação Front-end

Este plano segue a abordagem Spec-Driven Development (SDD), garantindo que a implementação corresponda rigorosamente à especificação visual da interface antes da escrita do código. As tarefas foram divididas sequencialmente para controle de custos e complexidade.

## Etapa 1: Infraestrutura e Setup
- [ ] Inicializar projeto Vite (React + TS) na pasta `frontend`.
- [ ] Configurar Tailwind CSS para estilização.
- [ ] Instalar dependências de UI (`lucide-react`, `recharts`, `clsx`, `tailwind-merge`).
- [ ] Limpar template padrão do Vite e criar estrutura de diretórios (`components`, `layouts`, `pages`).

## Etapa 2: Layout Base (Shell)
- [ ] Desenvolver `Sidebar` com os itens de navegação e rodapé de acessibilidade.
- [ ] Desenvolver `Header` superior.
- [ ] Criar o componente `MainLayout` orquestrando Sidebar e Header de forma responsiva.

## Etapa 3: Componentes do Dashboard (Início)
- [ ] Implementar `UploadArea` com estilo tracejado para Drag & Drop de arquivos.
- [ ] Construir o componente genérico `KpiCard` e instanciar os 4 cartões (Total, Presentes, Ausentes, Atrasos).
- [ ] Integrar o gráfico de linhas `FrequencyChart` utilizando Recharts.

## Etapa 4: Tabela de Dados e Finalização
- [ ] Desenvolver a tabela `RecentRecordsTable` com badges dinâmicos de status (Presente/Ausente).
- [ ] Implementar o `Footer` com os selos de acessibilidade.
- [ ] Revisar contrastes e garantir conformidade visual inicial (WCAG 2.1).
