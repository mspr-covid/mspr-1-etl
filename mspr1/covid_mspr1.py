#!/usr/bin/env python
# coding: utf-8

# In[37]:


# In[98]:

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import missingno as mno
import requests
from sklearn.model_selection import train_test_split


import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Charger les variables du fichier .env
load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

print('Ma config db : ',DB_CONFIG)




# # Import du data set  

# In[39]:


df = pd.read_csv('/Users/laura.b/Documents/EPSI/project/mspr-1-etl/data/worldometer_data_raw.csv')


# # Analyse du dataset

# In[40]:


df.head()


# Premièrement, on définit/décrit nos variables:
# 
# - *Country/Region* : Liste des pays affectés par la COVID-19
# 
# - *Total Cases* : Nombre cumulatif de cas confirmés à ce jour
# 
# - *New Cases* : Nombre de nouveaux cas confirmés chaque jour
# (Contexte temporel manquant!)
# 
# - *Total Deaths* : Nombre cumulatif de décès à ce jour
# 
# - *New Deaths* : Nombre de nouveaux décès chaque jour
# (Contexte temporel manquant!)
# 
# - *Total Recovered* : Nombre cumulatif de cas rétablis à ce jour
# 
# - *Active Cases* : Nombre cumulatif de cas actifs à ce jour
# (Remarque : la définition d’origine indiquait « cas récupérés », mais il s’agit vraisemblablement d’une erreur. Il est attendu que cette variable représente les cas encore actifs.)
# 
# - *Serious, Critical* : Nombre cumulatif de cas graves/critique à ce jour
# 
# - *TotalCases/1M pop* : Nombre cumulatif de cas confirmés à ce jour pour un million d’habitants
# 
# - *Deaths/1M pop* : Nombre cumulatif de décès à ce jour pour un million d’habitants
# 
# - *Total Tests* : Nombre cumulatif de tests effectués à ce jour
# (Contexte temporel manquant!)
# - *Tests/1M pop* : Nombre cumulatif de tests effectués à ce jour pour un million d’habitants
# (Contexte temporel manquant!)
# 
# - *WHO Population*: L'Organisation mondiale de la santé divise le monde en six régions.

# In[41]:


df.info()


# 
# 
# La méthode **df.info()** nous permet d'avoir une vue d'ensemble sur la structure du dataset : 
# 
# **structure du dataset** : 
# 
# - "shape" : 209 entrées (lignes) et 16 variables(colonnnes).
# - Le typage des données et le nombre de variables par type de données  : on a des float64, int64 et object 
# - Le nombre de valeurs non-nulles (donc les nulles) 
# 
# Ici on voit que toutes les variables comportent des valeurs nulles, à l'exception de "Country/Region" et "TotalCases" étant qu'ils ont 209 valeures non nulles 
# 
# On remarque également que certaines variables ont les mêmes nombre de valeurs manquantes. Ces variables/colonnes ne sont-elles pas des doublons?
# 
# L'objectif est de vérifier les données du dataset et de savoir si celles fournient dans le dataset est fiable 

# ### Etape 0 : Réagencement des colonnes 
# D'abord nous allons réagencer l'ordre des colonnes pour une meilleures lisibilité. 
# Elles ont été réorganisées en commençant par les variables catégorielles d'un coté et les numériques de l'autre pour une meilleure lisibilité des colonnes.
# 

# In[42]:


df.columns


# In[43]:


df = df[['Continent', 'WHO Region','Country/Region', 'Population', 'TotalCases', 'NewCases','TotalDeaths', 'NewDeaths', 'TotalRecovered', 'NewRecovered','ActiveCases', 'Serious,Critical', 'Tot Cases/1M pop', 'Deaths/1M pop','TotalTests', 'Tests/1M pop']]


# In[44]:


mno.matrix(df, figsize=(15,5))


# ## Etape 1 : Matplot 
# ### La heatmap 
# La heatmap est une représentation visuelle permettant d'observer s'il y a des corrélations entre les colonnes du dataset

# In[45]:


plt.figure(figsize=(10, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".1f", cmap="coolwarm")


# #### Résultat d'analyse de la heatmap
# *Explication des couleurs de matrice* : 
# - Les valeurs proches de *1.0* (en rouge foncé) indiquent une forte corrélation positive 
# - Les valeurs proches de *-1.0* (en bleu foncé) indiquent une forte corrélation négative
# - Les valeurs proches de *0* (en couleurs pâles) indiquent peu ou pas de corrélation
# 
# On peut voir une large zone rouge foncé dans le haut à gauche de la heatmap ce qui signifie qu'il y a un grand nombre de valeurs à forte coréélation. 
# 
# Om compte parmi elles, les colonnes (TotalCases, NewCases, TotalDeaths, NewDeaths, TotalRecovered, NewRecovered, ActiveCases, Serious,Critical).
# Il est logique qu'on est une forte corrélation entre TotalCases et TotalDeaths 
# TotalCases est fortement corrélé à (0.9) avec TotalCases et TotalDeaths ce qui est logique puisque les morts font partis des données de Total Cases et TotalDeaths.

# ### Boxplot

# In[46]:


plt.figure(figsize=(19,9))
sns.boxplot(data=df,palette='Accent')
plt.title("Données Statistiques du dataset d'origine sans nettoyage")
plt.show()


# In[ ]:





# Le *boxplot* qui représente l'intégralité du dataset ne peut pas être analysé correctement car il contient des valeurs extrèmes qui empâchent la lisibilité des autres données. Nous allons isolé chaque colonne dans un boxplot afin d'avoir une mise à l'écehelle adéquate avec les valeurs concernées. 

# In[47]:


df.boxplot(column=['Population'],
figsize=(9,5))
plt.title("Données Statistiques de la colonne Population")
plt.show()


# 

# In[48]:


df.boxplot(column=['NewCases','NewDeaths','NewRecovered'], figsize=(9,5))
plt.title("Données Statistiques sur les nouveax morts, cas et sauvées")
plt.show()


# In[49]:


df.boxplot(column=['TotalDeaths'], figsize=(9,5))
plt.title("Données Statistiques de la colonne TotalDeaths")
plt.show()


# In[50]:


df.boxplot(['TotalRecovered', 'ActiveCases', 'TotalCases','Tests/1M pop'], figsize=(9,5))
plt.title("Données Statistiques de la colonne Population")
plt.show()


# In[51]:


df.boxplot(column=['TotalTests'], figsize=(9,5))
plt.title("Données Statistiques de la colonne TotalDeaths")
plt.show()


# In[52]:


df.boxplot(column=['Tests/1M pop'], figsize=(9,5))
plt.title("Données Statistiques de la colonne TotalDeaths")
plt.show()


# In[53]:


df.boxplot(column=['Serious,Critical'], figsize=(9,5))
plt.title("Données Statistiques de la colonne TotalDeaths")
plt.show()


# In[54]:


df.boxplot(column=['Deaths/1M pop'], figsize=(9,5))
plt.title("Données Statistiques sur le nombre de morts/ 1M de population")
plt.show()


# In[55]:


df.boxplot(column=['Tot Cases/1M pop'], figsize=(9,5))
plt.title("Données Statistiques sur ")
plt.show()


# In[56]:


df.boxplot(column=['Tests/1M pop'], figsize=(9,5))
plt.title("Données Statistiques de la colonne Population")
plt.show()


# 

# In[57]:


df.describe()


# Maintenant, on fait une somme des valeurs manquantes:

# In[58]:


df.isna().sum()


# In[59]:


mno.matrix(df, figsize=(15,5))


# In[60]:


df.isna().sum()


# ## Analyse des valeures nulles par variables

# In[61]:


mno.matrix(df, figsize=(15,5))


# On peut voir dans la colonne "Continent" et "Population qu'il y a une valeure "null". On peut supposer qu'un pays n'aurait pas été affilié à un continent puisque cette abscence de données est situé sur la même ligne du dataset comme on peut le voir la matrix ci-dessus. 

# In[62]:


mask_population = df['Population'].isnull() | (df['Population'] == '')
mask_continent = df['Continent'].isnull() | (df['Continent'] == '')

ligne_suspecte = df[mask_population & mask_continent]

print("Ligne suspecte avec les colonnes Population et Continent vides:")
ligne_suspecte


# Après avoir mener des recherches . Le 'Diamond Princess' est un bateau et non un pays. On peut expliquer sa présence sur la dataset car le paquebot a été mis en quarantaine à cause de cas covid détecté à bord. C'est donc pas un pays donc on va le retirer du dataset.

# # Nettoyage des données

# In[63]:


df = df[df['Country/Region'] != 'Diamond Princess']


# In[64]:


mno.matrix(df, figsize=(15,5))


# On peut voir en se référant à la matrice que les colonnes "Continent" et "Population" ne présentent plus de valeurs manquantes visuellement, confirmant que les données nulles ont été correctement traitées.

# In[65]:


df.isna().sum()


# On supprime les doublons en utilisant la méthode **drop_duplicates()**

# In[66]:


df.drop_duplicates(inplace = True)


# In[67]:


df.duplicated()


# On constate qu'il n'y a pas de doublons dans le dataset comme le nombre de lignes est identique à celui avant d'appliquer la méthode.

# In[ ]:





# In[68]:


# Créer une colonne 
df['NewTotalCases'] = df['TotalDeaths'] + df['TotalRecovered'] + df['ActiveCases']
df


# In[69]:


plt.figure(figsize=(10, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".1f", cmap="coolwarm")


# Cette figure permet de mieux représenter les valeurs nulles du dataset.
# 
# Mais aussi de se rendre compte de certaines aberrations.
# 
# Ici, on a des colonnes qui sont les copies conformes, on peut supposer que ce sont des "variables doublons":
# 
# - TotalCases et Tot Cases/1M pop ??
# - TotalDeaths et Deaths/1M pop ?
# - NewDeaths et NewRecovered ?
# - TotalRecovered et ActiveCases ?
# - TotalTests et Tests/1m pop ?
# 
# 

# Nous allons donc supprimer ces dernières étant donnée qu'elles ont un niveau de corrélation à 1

# In[70]:


df = df.drop(columns=["Tot Cases/1M pop", "Deaths/1M pop", "NewRecovered", "NewCases","Tests/1M pop","NewDeaths"], errors='ignore')


# In[71]:


df.head()


# Ces deux points sont importants pour la préparation des données :
# 
# - **Suppression des variable**s dérivées : Les métriques normalisées "Tot Cases/1M pop", "Deaths/1M pop" et "Tests/1M pop" sont calculables à partir des données brutes existantes (TotalCases/Population, TotalDeaths/Population, etc.). Si on les conservait cela créerait une redondance qui pourrait biaiser les analyses.
#  
# - **Suppression des colonnes** avec trop de valeurs manquantes : "NewRecovered", "NewDeaths" et "NewCases" présentent plus de 200 valeurs manquantes, ce qui représente une proportion significative du dataset. Au lieu, d'imputer ces nombreuses valeurs manquantes, la suppression de ces colonnes est une approche raisonnable pour maintenir la qualité des données.

# In[72]:


mno.matrix(df, figsize=(15,5))


# In[73]:


plt.figure(figsize=(10, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".2f", cmap="coolwarm")


# La corrélation est forte entre les colonnes TotalCases et TotalDeaths car les données de TotalDeaths sont contenus dans TotalCases.
# On peut faire le même constat pour les variables TotalRecovered et TotalTests. 

# In[74]:


mno.matrix(df, figsize=(15,9))


# On remplaceme les **NaN** par "**Non classé"** pour la colonne WHO Region.

# In[75]:


df['WHO Region'] = df['WHO Region'].fillna("Non classé")


# In[103]:


#Afficher les données du data set en aleatoire 
df.sample(20)


# On s'interroge sur comment on va remplacer les valeurs numériques manquantes par zéro, par la médiane, la moyenne. 
# Quelle est la meilleure option pour avoir des données cohérentes ?
# 
# On procède au remplacement des valeurs nulles par des formules logiques.
# 
# **Pourquoi transformer TotalCases, TotalDeaths et TotalRecovered ?** <br>
# 
# Ces transformations aident à réduire la variance excessive dans les données. Sans cela, la variance serait dominée par quelques grands pays avec des chiffres très élevés, ce qui masquerait les différences entre la majorité des pays. 
# 
# En réduisant la variance, nous obtenons une distribution plus équilibrée où tous les pays peuvent être comparés de manière plus équitable.

# ### Imputation des valeurs manquantes de la colonne "ActiveCases":

# In[76]:


# Afficher les lignes où ActiveCases est null
null_active_cases = df[df['ActiveCases'].isnull()]
null_active_cases


# In[5221]:


# Filtrer le DataFrame pour ne conserver que les pays d'Europe
europe_df = df[df['Continent'] == 'Europe']

# Calculer la médiane de ActiveCases pour l'Europe
europe_active_cases_median = europe_df['ActiveCases'].median()

# Remplacer les valeurs NaN dans le DataFrame original
df['ActiveCases'] = df['ActiveCases'].fillna(europe_active_cases_median)

# Vérifier le nombre de valeurs NaN après remplacement
nan_count_after = df['ActiveCases'].isnull().sum()

# Créer un nouveau DataFrame avec seulement les lignes spécifiées
selected_rows = df.iloc[[9, 11, 29, 40]]
selected_rows


# ### Imputation des valeurs manquantes de la colonne "TotalDeaths":

# In[5222]:


#Remplace les données manquantes de la colonne "TotalDeaths" par le résultat de la formule : "TotalCases" - "TotalRecovered" + "ActiveCases"

def fill_missing_total_deaths(row):
    if pd.isnull(row['TotalDeaths']):
        return int(round(row['TotalCases'] - (row['TotalRecovered'] + row['ActiveCases'] )))
    return row['TotalDeaths']

missing_total_deaths_before = df['TotalDeaths'].isnull().sum()

df['TotalDeaths'] = df.apply(fill_missing_total_deaths, axis=1)

missing_total_deaths_after = df['TotalDeaths'].isnull().sum()

print(f"Number of missing 'TotalDeaths' values before filling: {missing_total_deaths_before}")
print(f"Number of missing 'TotalDeaths' values after filling: {missing_total_deaths_after}")


# ### Imputation des valeurs manquantes de la colonne "TotalRecovered":

# In[81]:


#Remplacer les données manquantes de la colonne "TotalRecovered" par le résultat de la formule : "TotalCases" - "TotalDeaths" + "ActiveCases"

def fill_missing_total_recovered(row):
    if pd.isnull(row['TotalRecovered']):
        return int(round(row['TotalCases'] - (row['TotalDeaths'] + row['ActiveCases'])))
    return row['TotalRecovered']

missing_total_deaths_before = df['TotalRecovered'].isnull().sum()

df['TotalRecovered'] = df.apply(fill_missing_total_recovered, axis=1)

missing_total_deaths_after = df['TotalRecovered'].isnull().sum()

selected_rows = df.iloc[[9, 11, 29, 40]]
selected_rows


# In[82]:


# Créer une colonne calculée
df['NewTotalCases'] = df['TotalDeaths'] + df['TotalRecovered'] + df['ActiveCases']
df


# In[83]:


mno.matrix(df, figsize=(15,5))


# In[84]:


# Comparer si deux colonnes sont identiques
if df['NewTotalCases'].equals(df['TotalCases']):
    print("Les colonnes sont identiques")
else:
    print("Les colonnes sont différentes")
    
    # Afficher le nombre de différences
    differences_count = (df['NewTotalCases'] != df['TotalCases']).sum()
    print(f"Nombre de différences trouvées : {differences_count}")
    
    # Afficher les premières lignes où il y a des différences
    print("\nExemples de différences :")
    diff_rows = df[df['NewTotalCases'] != df['TotalCases']][['NewTotalCases', 'TotalCases']]
    print(diff_rows.head())


# In[5227]:


df = df.drop(columns=['TotalCases'])
df


# On peut voir sur la matrice que les colonnes "TotalRecovered" et "TotalDeaths" ne contiennent plus de valeurs nulles 

#  ## Imputation des valeurs manquantes par la médiane

# La méthode utilisée dans ce code remplace les valeurs manquantes de manière plus intelligente :
# 
# D'abord, le code regroupe les pays par continent
# Ensuite, pour chaque continent, il calcule la valeur médiane (la valeur du milieu)
# Enfin, il remplace les données manquantes par la médiane du continent correspondant
# 
# Par exemple, si un pays d'Afrique a une valeur manquante pour 'Serious,Critical', cette valeur sera remplacée par la médiane de tous les pays africains (et non par la médiane mondiale).
# L'avantage est que les pays reçoivent des valeurs de remplacement qui correspondent mieux à leur région géographique, ce qui donne des résultats plus réalistes.

#  ### Imputation des valeurs manquantes de la colonne "Serious, Critical":

# In[85]:


# Pour la colonne 'Serious,Critical'
df['Serious,Critical'] = df.groupby('Continent')['Serious,Critical'] \
                             .transform(lambda x: x.fillna(x.median()))

# Pour la colonne 'TotalTests'
df['TotalTests'] = df.groupby('Continent')['TotalTests'] \
                     .transform(lambda x: x.fillna(x.median()))


# 
# 
# **Pourquoi utiliser la médiane pour remplacer les valeurs manquantes?**
# 
# La **médiane** est plus pertinente que la moyenne dans notre cas car elle n'est pas influencée par les valeurs extrêmes qui augmentent artificiellement la variance. 
# 
# Par exemple, quelques pays comme la Chine ou les États-Unis avec des chiffres énormes augmenteraient considérablement la variance et fausseraient la moyenne.
# 
# La médiane représente mieux la situation "typique" de la majorité des pays, préservant ainsi une variance plus naturelle dans les données
# 
# 
# Ces choix méthodologiques permettent d'obtenir des données avec une variance plus représentative pour réaliser une analyse pertinente.

# In[86]:


mno.matrix(df, figsize=(15,5))


# On peut voir sur la matrice que la colonne **"Serious, Critical"** ne contient plus de valeurs nulles 

# In[87]:


plt.figure(figsize=(8, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".2f", cmap="coolwarm")


# In[88]:


df.columns


# ## Conversion des valeurs numérques en int

# In[90]:


for column in df.columns:
    if df[column].dtype == 'float64':
        df[column] = df[column].fillna(0).astype(int)

df.info()


# # Normalisation des colonnes

# In[92]:


columns_mapping = {
    "Country/Region": "country",
    "WHO Region": "who_region",
    "NewTotalCases": "new_total_cases",
    "TotalDeaths": "total_deaths",
    "TotalRecovered": "total_recovered",
    "Serious,Critical": "serious_critical",
    "TotalTests": "total_tests",
    "Population": "population",
    "Continent": "continent",
    "ActiveCases":"active_cases"
}
df = df.rename(columns=columns_mapping)
df


# # Dataset transformé

# In[93]:


df = df.drop_duplicates()


# In[94]:


# On affiche le df transformé
df.head()


# In[95]:


sns.heatmap(df.select_dtypes('number').corr(),annot=True, cmap="coolwarm")


# # Préparation du jeu de données à entrainer 

# In[99]:


# Pour un split sans variable cible spécifique avec une répartition 80% d'entrainement et 20% de test
X = df  
X_train, X_test = train_test_split(
    X, 
    test_size=0.2,
    random_state=42
)


# Absence de varaibale cible :

# In[5240]:


print(f"Taille de X_train: {X_train.shape}")
print(f"Taille de X_test: {X_test.shape}")


# # Chargement des données

# ## Connexion à PostgreSQL

# In[101]:


import psycopg2
import time

def checkpostgres(max_retries=5):
    print("🔍 Vérification de la connexion à PostgreSQL...", flush=True)
    
    for attempt in range(max_retries):
        print(f"🟡 Tentative {attempt + 1}/{max_retries}...", flush=True)

        try:
            conn = psycopg2.connect(
                dbname=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                host=os.getenv("DB_HOST"),
                port=os.getenv("DB_PORT"),
            )
            conn.close()
            print("✅ Connexion PostgreSQL réussie !", flush=True)
            return True
        except psycopg2.OperationalError as e:
            print(f"⚠️ PostgreSQL inaccessible : {e}", flush=True)
            time.sleep(5)

    print("❌ PostgreSQL inaccessible après plusieurs tentatives.", flush=True)
    return False

# Appel de la fonction pour test
if __name__ == "__main__":
    checkpostgres()


# In[102]:


# Se connecter à la base de données
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")

)

# Créer un curseur pour faire des requêtes SQL
cursor = conn.cursor()

# Créer les tables si elles n'existent pas déjà
cursor.execute("""
CREATE TABLE IF NOT EXISTS t_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ); 
""")



cursor.execute("""
    CREATE TABLE IF NOT EXISTS worldometer (
    id SERIAL PRIMARY KEY, 
    continent VARCHAR(100) NOT NULL,
    who_region VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    population INT NOT NULL,
    total_tests INT NOT NULL,
    total_cases INT NOT NULL,
    total_deaths INT NOT NULL,
    total_recovered INT NOT NULL,
    serious_critical INT NOT NULL
    );
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY, 
    country VARCHAR(100) NOT NULL, 
    continent VARCHAR(100) NOT NULL,
    who_region VARCHAR(100) NOT NULL,
    population INT NOT NULL
    );
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS health_statistics (
    id SERIAL PRIMARY KEY, 
    country VARCHAR(100) NOT NULL,
    total_cases INT NOT NULL,
    total_deaths INT NOT NULL,
    total_recovered INT NOT NULL,
    serious_critical INT NOT NULL
    );
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS testing_statistics (
    id SERIAL PRIMARY KEY, 
    country VARCHAR(100) NOT NULL,
    total_tests INT NOT NULL
    );
""")

# Boucle pour insérer les données dans la base de données
for index, row in df.iterrows():
    try:
        # Extraire les valeurs depuis chaque ligne du DataFrame

        country = row['country']
        continent = row['continent']
        who_region = row['who_region']
        population = row['population']
        total_tests = row['total_tests']
        total_cases = row['new_total_cases']  # Note que 'NewTotalCases' a été mappé vers 'new_total_cases'
        total_deaths = row['total_deaths']
        total_recovered = row['total_recovered']
        serious_critical = row['serious_critical']
        active_cases = row['active_cases']
        username = ['username']
        email = ['email']
        password_hash = ['password_hash']
        date_created = ['date_created']

        
        # Créer les requêtes SQL pour insérer les données dans les différentes tables

        t_users_sql = """
            INSERT INTO t_users (username, email, password_hash)
            VALUES (%s, %s, %s);
        """

        
        worldometer_sql = """
            INSERT INTO worldometer (continent, who_region, country, population, total_tests, total_cases, total_deaths, total_recovered, serious_critical)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        
        countries_sql = """
            INSERT INTO countries (country, continent, who_region, population)
            VALUES (%s, %s, %s, %s);
        """
        
        health_statistics_sql = """
            INSERT INTO health_statistics (country, total_cases, total_deaths, total_recovered, serious_critical)
            VALUES (%s, %s, %s, %s, %s);
        """
        
        testing_statistics_sql = """
            INSERT INTO testing_statistics (country, total_tests)
            VALUES (%s, %s);
        """
        
        # Exécuter les requêtes d'insertion avec les valeurs de la ligne
        cursor.execute(t_users_sql, (username, email, password_hash))   
        cursor.execute(countries_sql, (country, continent, who_region, population))
        cursor.execute(health_statistics_sql, (country, total_cases, total_deaths, total_recovered, serious_critical))
        cursor.execute(testing_statistics_sql, (country, total_tests))
        cursor.execute(worldometer_sql, (continent, who_region, country, population, total_tests, total_cases, total_deaths, total_recovered, serious_critical))

        # Valider les changements dans la base de données
        conn.commit()
        print(f"✅ sucess")

    except psycopg2.Error as e:
        print(f"❌ Erreur lors de l'insertion des données pour {country}: {e}")

# Fermer le curseur et la connexion après avoir inséré toutes les données
cursor.close()
conn.close()

print("✅ Données chargées dans PostgreSQL")



