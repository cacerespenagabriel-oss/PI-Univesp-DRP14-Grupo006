# Frequência+ — PI Univesp DRP14 Grupo 006

Sistema web de acompanhamento da frequência de alunos, com previsão de presença por machine learning.

- **Banco de dados:** PostgreSQL (Supabase) em produção; SQLite automático no computador de cada um.
- **Back-end:** Python + FastAPI (`backend/`).
- **Machine learning:** árvore de decisão (scikit-learn) que prevê a chance de cada aluno comparecer (`backend/app/ml/modelo.py`).
- **Front-end:** React + Vite + Tailwind + Recharts (`frontend/`).
- **Dados:** `dados_presenca_alunos_1_mes.csv` (180 alunos × 30 dias de setembro/2026).

```
CSV ──► banco (alunos, presencas) ──► FastAPI ──► React (dashboard)
                     │                   ▲
                     └──► modelo de ML ──┘  (treinado a partir do banco)
```

## Como o pipeline de machine learning funciona

1. A API lê do banco todas as presenças, junto com idade e gênero do aluno.
2. Cada registro vira números: idade, presença na semana anterior, gênero e dia da semana (one-hot).
   O `id_aluno` **não** entra: ele é só um código e não descreve o aluno.
3. 25% dos dados são separados para teste. A árvore é treinada com os outros 75% e avaliada
   (acurácia e MAE, inclusive por dia da semana, como no `Modelo_PI.py`).
4. A árvore é treinada de novo com 100% dos dados e usada para prever os 7 dias seguintes
   ao último dia do banco: presentes esperados por dia e alunos com maior risco de falta.
5. O modelo fica em memória e é **retreinado sozinho** quando os dados mudam (por exemplo, após um upload).

Resultado com o CSV atual: **64,6% de acurácia**, contra 57,9% de quem chutasse sempre "presente".
A árvore sem limite de profundidade (versão do `Modelo_PI.py`) acerta ~59%, porque "decora" os dados;
por isso a profundidade foi limitada a 5. A variável que mais pesa é a presença na semana anterior.

Para ver as métricas no terminal: `python -m scripts.treinar_modelo` (dentro de `backend/`).

## Rodando no seu computador

Precisa de **Python 3.11+** e **Node.js 20+**.

### 1. Back-end

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- A API sobe em http://localhost:8000 e a documentação interativa em http://localhost:8000/docs.
- Sem configurar nada, ela cria `backend/frequencia.db` (SQLite) e carrega o CSV da raiz sozinha.
- Para usar o Supabase, copie `backend/.env.example` para `backend/.env` e preencha `DATABASE_URL`.

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173 e entre com **admin@frequencia.com** / **123456**.

## Rotas da API

Todas, menos o login, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/auth/login` | Login; devolve o token |
| GET | `/dashboard?data=AAAA-MM-DD` | Cards do dia e gráfico de presença diária |
| GET | `/frequencias?data=&status=&pagina=` | Registros de presença, paginados |
| GET | `/alunos?busca=&genero=&ordenar=&pagina=` | Alunos com taxa de presença |
| GET | `/previsao` | Previsão da próxima semana + métricas do modelo |
| GET | `/previsao/metricas` | Só as métricas do modelo |
| POST | `/upload` | Importa CSV/XLSX no mesmo formato do arquivo original |
| GET | `/relatorios/exportar?data=` | Baixa os registros em CSV |

## Colocando no ar (gratuito)

São três partes: banco no **Supabase**, back-end na **Vercel** e front-end na **Vercel**.
O plano gratuito da Vercel (Hobby) é para uso não comercial, o que serve para o PI.

### 1. Banco no Supabase

1. Crie uma conta em https://supabase.com e um projeto novo (região São Paulo). Guarde a senha do banco.
2. Clique em **Connect** (no topo do projeto) e copie a string de **Transaction pooler** (porta 6543).
   Troque `[YOUR-PASSWORD]` pela senha do banco.
3. No seu computador, crie `backend/.env` com `DATABASE_URL=<a string copiada>` e rode, dentro de `backend/`:

   ```bash
   python -m scripts.carregar_csv
   ```

   Isso cria as tabelas `alunos` e `presencas` e carrega as 5.400 linhas do CSV.
   As tabelas aparecem no **Table Editor** do Supabase.

### 2. Back-end na Vercel

1. Crie uma conta em https://vercel.com entrando com o GitHub.
2. **Add New → Project**, escolha este repositório e, em **Root Directory**, selecione `backend`.
3. Em **Environment Variables**, cadastre:
   - `DATABASE_URL` = a mesma string do Supabase
   - `SECRET_KEY` = um texto longo e aleatório
   - `ADMIN_EMAIL` e `ADMIN_SENHA` (senha de 6 dígitos), se quiserem trocar o login padrão
4. Clique em **Deploy**. Anote o endereço gerado (ex.: `https://frequencia-api.vercel.app`) e
   teste abrindo `<endereço>/docs`.

O arquivo `backend/vercel.json` manda todas as requisições para `backend/api/index.py`, que carrega a API.

### 3. Front-end na Vercel

1. **Add New → Project** de novo, mesmo repositório, agora com **Root Directory** = `frontend`
   (a Vercel detecta o Vite sozinha).
2. Em **Environment Variables**, cadastre `VITE_API_URL` = endereço do back-end (sem `/` no final).
3. **Deploy**.
4. Opcional: no projeto do back-end, cadastre `CORS_ORIGINS` = endereço do front-end e faça um novo deploy,
   para só o site de vocês poder chamar a API.

### Plano B: back-end no Render

Se a Vercel recusar o back-end por tamanho (scikit-learn + numpy + scipy são pesados), use o
https://render.com (gratuito): **New → Web Service**, Root Directory `backend`,
Build Command `pip install -r requirements.txt`, Start Command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
e as mesmas variáveis de ambiente. No plano gratuito ele "dorme" sem uso, e o primeiro acesso depois disso
demora cerca de 30 segundos.

## Estrutura

```
backend/
  app/
    main.py              # cria a API e registra as rotas
    config.py            # variáveis de ambiente
    db/                  # conexão, tabelas e sessão do banco
    ml/modelo.py         # treino, avaliação e previsão
    services/importacao.py  # leitura de CSV/XLSX e gravação no banco
    routers/             # rotas da API
    core/security.py     # token de login
  scripts/               # carregar_csv.py e treinar_modelo.py
  api/index.py, vercel.json  # deploy na Vercel
frontend/
  src/pages/             # Login, Dashboard, Alunos, Previsoes
  src/components/        # cards, gráfico, tabela, upload, paginação
  src/services/api.ts    # chamadas à API (usa VITE_API_URL)
Modelo_PI.py             # exploração inicial do modelo
dados_presenca_alunos_1_mes.csv
```
