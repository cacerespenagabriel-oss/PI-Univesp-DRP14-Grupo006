# %%
from sklearn import tree
from sklearn import metrics
from sklearn.model_selection import train_test_split
import pandas as pd 
modelo = tree.DecisionTreeRegressor()
base = pd.read_csv('dados_presenca_alunos_1_mes.csv', sep=',', encoding='utf-8-sig')
# %%
base = pd.get_dummies(base, columns=['genero'],dtype=int)
base = pd.get_dummies(base, columns=['dia_semana'],dtype=int)
base['data'] = pd.to_datetime(base['data'])
base = base.drop(columns='data')
base
# %%
X = base[['id_aluno', 'idade', 'presenca_semana_anterior',
       'genero_Feminino', 'genero_Masculino', 'genero_Nao informado',
       'genero_Outro', 'dia_semana_domingo', 'dia_semana_quarta-feira',
       'dia_semana_quinta-feira', 'dia_semana_segunda-feira',
       'dia_semana_sexta-feira', 'dia_semana_sábado',
       'dia_semana_terça-feira']]
y = base['presenca']
# %%
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size =0.25)
# %%
modelo.fit(X_train,y_train)
# %%
'''Previsão por dia'''

dias = ['dia_semana_domingo', 'dia_semana_quarta-feira',
       'dia_semana_quinta-feira', 'dia_semana_segunda-feira',
       'dia_semana_sexta-feira', 'dia_semana_sábado',
       'dia_semana_terça-feira']

previsoes = {}

for dia in dias:

    filtro = X[X[dia] == 1]

    probabilidades = modelo.predict(filtro)

    previsoes[dia] = probabilidades.sum()
# %%
'''MAE por dia'''

erros_dias = {}

for dia in dias:

    filtro = X_test[dia] == 1

    X_dia = X_test[filtro]
    y_dia = y_test[filtro]

    pred = modelo.predict(X_dia)

    erro = metrics.mean_absolute_error(y_dia, pred)

    erros_dias[dia] = erro

resultado_erros = pd.DataFrame(
    list(erros_dias.items()),
    columns=['dia_semana','MAE'])

resultado_erros
# %%