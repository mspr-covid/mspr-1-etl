import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import missingno as mno
from sklearn.model_selection import train_test_split


import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

df = pd.read_csv('data/worldometer_data_raw.csv')

df.head()

df.info()

df.columns

df = df[['Continent', 'WHO Region','Country/Region', 'Population', 'TotalCases', 'NewCases','TotalDeaths', 'NewDeaths', 'TotalRecovered', 'NewRecovered','ActiveCases', 'Serious,Critical', 'Tot Cases/1M pop', 'Deaths/1M pop','TotalTests', 'Tests/1M pop']]

mno.matrix(df, figsize=(15,5))

plt.figure(figsize=(10, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".1f", cmap="coolwarm")

# plt.figure(figsize=(19,9))
# sns.boxplot(data=df,palette='Accent')
# plt.title("Données Statistiques du dataset d'origine sans nettoyage")
# plt.show()

# df.boxplot(column=['Population'],
# figsize=(9,5))
# plt.title("Données Statistiques de la colonne Population")
# plt.show()

# valid_columns = df[['NewCases', 'NewDeaths', 'NewRecovered']].dropna(axis=1, how='all').columns
# df.boxplot(column=valid_columns, figsize=(9, 5))

# df.boxplot(column=['NewCases','NewDeaths','NewRecovered'], figsize=(9,5))
# plt.title("Données Statistiques sur les nouveax morts, cas et sauvées")
# plt.show()



# df.boxplot(column=['TotalDeaths'], figsize=(9,5))
# plt.title("Données Statistiques de la colonne TotalDeaths")
# plt.show()

# df.boxplot(column=['TotalRecovered', 'ActiveCases', 'TotalCases', 'Tests/1M pop'], figsize=(9,5))
# plt.title("Données Statistiques de la colonne Population")
# plt.show()

# df.boxplot(column=['TotalTests'], figsize=(9,5))
# plt.title("Données Statistiques de la colonne TotalDeaths")
# plt.show()


# df.boxplot(column=['Tests/1M pop'], figsize=(9,5))
# plt.title("Données Statistiques de la colonne TotalDeaths")
# plt.show()

# df.boxplot(column=['Serious,Critical'], figsize=(9,5))
# plt.title("Données Statistiques de la colonne TotalDeaths")
# plt.show()

# df.boxplot(column=['Deaths/1M pop'], figsize=(9,5))
# plt.title("Données Statistiques sur le nombre de morts/ 1M de population")
# plt.show()

# df.boxplot(column=['Tot Cases/1M pop'], figsize=(9,5))
# plt.title("Données Statistiques sur ")
# plt.show()

# df.boxplot(column=['Tests/1M pop'], figsize=(9,5))
# plt.title("Données Statistiques de la colonne Population")
# plt.show()

df.describe()

df.isna().sum()

mno.matrix(df, figsize=(15,5))

df.isna().sum()

mno.matrix(df, figsize=(15,5))

mask_population = df['Population'].isnull() | (df['Population'] == '')
mask_continent = df['Continent'].isnull() | (df['Continent'] == '')

ligne_suspecte = df[mask_population & mask_continent]

print("Ligne suspecte avec les colonnes Population et Continent vides:")
ligne_suspecte

df = df[df['Country/Region'] != 'Diamond Princess']

mno.matrix(df, figsize=(15,5))

df.isna().sum()

df.drop_duplicates(inplace = True)

df.duplicated()
 
df['NewTotalCases'] = df['TotalDeaths'] + df['TotalRecovered'] + df['ActiveCases']
df

plt.figure(figsize=(10, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".1f", cmap="coolwarm")

df = df.drop(columns=["Tot Cases/1M pop", "Deaths/1M pop", "NewRecovered", "NewCases","Tests/1M pop","NewDeaths"], errors='ignore')

df.head()


mno.matrix(df, figsize=(15,5))


plt.figure(figsize=(10, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".2f", cmap="coolwarm")

mno.matrix(df, figsize=(15,9))

df['WHO Region'] = df['WHO Region'].fillna("Non classé")

df.sample(20)

null_active_cases = df[df['ActiveCases'].isnull()]
null_active_cases

europe_df = df[df['Continent'] == 'Europe']

europe_active_cases_median = europe_df['ActiveCases'].median()

df['ActiveCases'] = df['ActiveCases'].fillna(europe_active_cases_median)

nan_count_after = df['ActiveCases'].isnull().sum()

selected_rows = df.iloc[[9, 11, 29, 40]]
selected_rows

def fill_missing_total_deaths(row):
    if pd.isnull(row['TotalDeaths']):
        return int(round(row['TotalCases'] - (row['TotalRecovered'] + row['ActiveCases'] )))
    return row['TotalDeaths']

missing_total_deaths_before = df['TotalDeaths'].isnull().sum()

df['TotalDeaths'] = df.apply(fill_missing_total_deaths, axis=1)

missing_total_deaths_after = df['TotalDeaths'].isnull().sum()

print(f"Number of missing 'TotalDeaths' values before filling: {missing_total_deaths_before}")
print(f"Number of missing 'TotalDeaths' values after filling: {missing_total_deaths_after}")


def fill_missing_total_recovered(row):
    if pd.isnull(row['TotalRecovered']):
        return int(round(row['TotalCases'] - (row['TotalDeaths'] + row['ActiveCases'])))
    return row['TotalRecovered']

missing_total_deaths_before = df['TotalRecovered'].isnull().sum()

df['TotalRecovered'] = df.apply(fill_missing_total_recovered, axis=1)

missing_total_deaths_after = df['TotalRecovered'].isnull().sum()

selected_rows = df.iloc[[9, 11, 29, 40]]
selected_rows

df['NewTotalCases'] = df['TotalDeaths'] + df['TotalRecovered'] + df['ActiveCases']
df

mno.matrix(df, figsize=(15,5))

if df['NewTotalCases'].equals(df['TotalCases']):
    print("Les colonnes sont identiques")
else:
    print("Les colonnes sont différentes")
    
    differences_count = (df['NewTotalCases'] != df['TotalCases']).sum()
    print(f"Nombre de différences trouvées : {differences_count}")
    
    print("\nExemples de différences :")
    diff_rows = df[df['NewTotalCases'] != df['TotalCases']][['NewTotalCases', 'TotalCases']]
    print(diff_rows.head())


df = df.drop(columns=['TotalCases'])
df

df['Serious,Critical'] = df.groupby('Continent')['Serious,Critical'] \
                             .transform(lambda x: x.fillna(x.median()))

df['TotalTests'] = df.groupby('Continent')['TotalTests'] \
                     .transform(lambda x: x.fillna(x.median()))

mno.matrix(df, figsize=(15,5))

plt.figure(figsize=(8, 7))
sns.heatmap(df.select_dtypes('number').corr(), annot=True, fmt=".2f", cmap="coolwarm")

for column in df.columns:
    if df[column].dtype == 'float64':
        df[column] = df[column].fillna(0).astype(int)

df.info()

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

df = df.drop_duplicates()

df.head()

sns.heatmap(df.select_dtypes('number').corr(),annot=True, cmap="coolwarm")

X = df  
X_train, X_test = train_test_split(
    X, 
    test_size=0.2,
    random_state=42
)

print(f"Taille de X_train: {X_train.shape}")
print(f"Taille de X_test: {X_test.shape}")


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

if __name__ == "__main__":
    checkpostgres()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")

)

cursor = conn.cursor()


# === Création et peuplement ===
# 1) Drop tables existantes
cursor.execute("""
DROP TABLE IF EXISTS t_anomalie CASCADE;
DROP TABLE IF EXISTS t_anomalie_type CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS deaths CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS t_users CASCADE;
DROP TABLE IF EXISTS country CASCADE;
DROP TABLE IF EXISTS region CASCADE;
DROP TABLE IF EXISTS continent CASCADE;
DROP TABLE IF EXISTS language CASCADE;
""")

# 2) Création schéma
cursor.execute("""
-- Continent
CREATE TABLE continent (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
-- Région OMS
CREATE TABLE region (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
-- Pays
CREATE TABLE country (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  continent_id INT NOT NULL REFERENCES continent(id),
  region_id INT NOT NULL REFERENCES region(id),
  population BIGINT
);
-- Langues
CREATE TABLE language (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) UNIQUE NOT NULL,
  name VARCHAR(50) UNIQUE NOT NULL
);
-- Utilisateurs
CREATE TABLE t_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  language_id INT REFERENCES language(id)
);
-- Cases
CREATE TABLE cases (
  country_id INT NOT NULL REFERENCES country(id),
  total_cases INT NOT NULL,
  new_cases INT NOT NULL,
  total_recovered INT NOT NULL
);
-- Décès
CREATE TABLE deaths (
  country_id INT NOT NULL REFERENCES country(id),
  total_deaths INT NOT NULL,
  new_deaths INT NOT NULL,
  serious_critical INT NOT NULL
);
-- Tests
CREATE TABLE tests (
  country_id INT NOT NULL REFERENCES country(id),
  total_tests INT NOT NULL,
  tests_per_million INT NOT NULL
);
-- Types d'anomalies
CREATE TABLE t_anomalie_type (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);
-- Enregistrements d'anomalies
CREATE TABLE t_anomalie (
  id SERIAL PRIMARY KEY,
  country_id INT NOT NULL REFERENCES country(id),
  anomaly_type_id INT NOT NULL REFERENCES t_anomalie_type(id),
  value NUMERIC,
  severity VARCHAR(20),
  detected_on TIMESTAMP DEFAULT NOW(),
  note TEXT
);
""")

# 3) Insertion master data
# Continents et régions
df['continent'].fillna('Non classé', inplace=True)
for cont in df['continent'].unique():
    cursor.execute("INSERT INTO continent(name) VALUES(%s) ON CONFLICT DO NOTHING;", (cont,))
for reg in df['who_region'].fillna('Non classé').unique():
    cursor.execute("INSERT INTO region(name) VALUES(%s) ON CONFLICT DO NOTHING;", (reg,))
# Pays
for _, row in df.iterrows():
    cursor.execute(
        "INSERT INTO country(name,continent_id,region_id,population)"
        " VALUES(%s,(SELECT id FROM continent WHERE name=%s),(SELECT id FROM region WHERE name=%s),%s)"
        " ON CONFLICT DO NOTHING;",
        (row['country'], row['continent'], row['who_region'], int(row['population']))
    )
# Langues
langs = [('fr','Français'),('de','Deutsch'),('en','English'),('it','Italiano')]
for code,name in langs:
    cursor.execute("INSERT INTO language(code,name) VALUES(%s,%s) ON CONFLICT DO NOTHING;", (code,name))
# Utilisateur exemple
cursor.execute(
    "INSERT INTO t_users(username,email,password_hash,language_id)"
    " VALUES('mimi','mimi@example.com','hash_test',"
    " (SELECT id FROM language WHERE code='fr'))"
    " ON CONFLICT DO NOTHING;"
)

# 4) Insertion métriques
for _, row in df.iterrows():
    cursor.execute(
        "INSERT INTO cases(country_id,total_cases,new_cases,total_recovered)"
        " VALUES((SELECT id FROM country WHERE name=%s),%s,%s,%s);",
        (row['country'], int(row['new_total_cases']), int(row.get('new_cases',0)), int(row['total_recovered']))
    )
    cursor.execute(
        "INSERT INTO deaths(country_id,total_deaths,new_deaths,serious_critical)"
        " VALUES((SELECT id FROM country WHERE name=%s),%s,%s,%s);",
        (row['country'], int(row['total_deaths']), int(row.get('new_deaths',0)), int(row['serious_critical']))
    )
    cursor.execute(
        "INSERT INTO tests(country_id,total_tests,tests_per_million)"
        " VALUES((SELECT id FROM country WHERE name=%s),%s,%s);",
        (row['country'], int(row['total_tests']), int(row.get('tests_per_million',0)))
    )

# 5) Insertion anomalies exemples
anomaly_types = [('CASE_SPIKE','Pic brutal de cas'),('LOW_TEST_RATE','Taux de tests bas')]
for code, desc in anomaly_types:
    cursor.execute("INSERT INTO t_anomalie_type(code,description) VALUES(%s,%s) ON CONFLICT DO NOTHING;", (code,desc))
cursor.execute(
    "INSERT INTO t_anomalie(country_id,anomaly_type_id,value,severity,note)"
    " VALUES((SELECT id FROM country WHERE name='France'),"
    " (SELECT id FROM t_anomalie_type WHERE code='CASE_SPIKE'),10000,'HIGH','Pic de cas > 2× médiane');"
)

# 6) Suppression des anciennes tables 

cursor.execute("""
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS health_statistics CASCADE;
DROP TABLE IF EXISTS testing_statistics CASCADE;
DROP TABLE IF EXISTS worldometer CASCADE;
""")

# Commit et fermeture
conn.commit()
cursor.close()
conn.close()

print("✅ Données chargées dans PostgreSQL")



