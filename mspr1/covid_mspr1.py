import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import missingno as mno
from sklearn.model_selection import train_test_split
from Database import Database


import psycopg2
import time
from sklearn.model_selection import train_test_split
from dotenv import load_dotenv

load_dotenv(override=True)


df = pd.read_csv('data/worldometer_data_raw.csv')

df.head()

df.info()

df.columns

df = df[['Continent',
         'WHO Region',
         'Country/Region',
         'Population',
         'TotalCases',
         'NewCases',
         'TotalDeaths',
         'NewDeaths',
         'TotalRecovered',
         'NewRecovered',
         'ActiveCases',
         'Serious,Critical',
         'Tot Cases/1M pop',
         'Deaths/1M pop',
         'TotalTests',
         'Tests/1M pop']]

mno.matrix(df, figsize=(15, 5))

plt.figure(figsize=(10, 7))
sns.heatmap(
    df.select_dtypes('number').corr(),
    annot=True,
    fmt=".1f",
    cmap="coolwarm")

# plt.figure(figsize=(19, 9))
# sns.boxplot(data=df, palette='Accent')
# plt.title("Données Statistiques du dataset d'origine sans nettoyage")
# plt.show()

# df.boxplot(column=['Population'],
# figsize=(9, 5))
# plt.title("Données Statistiques de la colonne Population")
# plt.show()

# valid_columns = df[['NewCases',
# 'NewDeaths',
# 'NewRecovered']].dropna(axis=1,
# how='all').columns
# df.boxplot(column=valid_columns, figsize=(9, 5))

# df.boxplot(column=['NewCases', 'NewDeaths', 'NewRecovered'], figsize=(9, 5))
# plt.title("Données Statistiques sur les nouveax morts, cas et sauvées")
# plt.show()

# df.boxplot(column=['TotalDeaths'], figsize=(9,5))
# plt.title("Données Statistiques de la colonne TotalDeaths")
# plt.show()

# df.boxplot(column=['TotalRecovered',
# 'ActiveCases',
# 'TotalCases',
# 'Tests/1M pop'],
# figsize=(9,5))
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

mno.matrix(df, figsize=(15, 5))

df.isna().sum()

mno.matrix(df, figsize=(15, 5))

mask_population = df['Population'].isnull() | (df['Population'] == '')
mask_continent = df['Continent'].isnull() | (df['Continent'] == '')

ligne_suspecte = df[mask_population & mask_continent]

print("Ligne suspecte avec les colonnes Population et Continent vides:")
ligne_suspecte

df = df[df['Country/Region'] != 'Diamond Princess']

mno.matrix(df, figsize=(15, 5))

df.isna().sum()

df.drop_duplicates(inplace=True)

df.duplicated()

df['NewTotalCases'] = (
    df['TotalDeaths'] + df['TotalRecovered'] + df['ActiveCases']
)
df

plt.figure(figsize=(10, 7))
sns.heatmap(
    df.select_dtypes('number').corr(),
    annot=True,
    fmt=".1f",
    cmap="coolwarm"
    )

df = df.drop(columns=["Tot Cases/1M pop",
                      "Deaths/1M pop",
                      "NewRecovered",
                      "NewCases",
                      "Tests/1M pop",
                      "NewDeaths"],
             errors='ignore')

df.head()

mno.matrix(df, figsize=(15, 5))

plt.figure(figsize=(10, 7))
sns.heatmap(
    df.select_dtypes('number').corr(),
    annot=True,
    fmt=".2f",
    cmap="coolwarm"
    )

mno.matrix(df, figsize=(15, 9))

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
        return int(
            round(row['TotalCases'] - (
                row['TotalRecovered'] + row['ActiveCases'])))
    return row['TotalDeaths']


missing_total_deaths_before = df['TotalDeaths'].isnull().sum()

df['TotalDeaths'] = df.apply(fill_missing_total_deaths, axis=1)

missing_total_deaths_after = df['TotalDeaths'].isnull().sum()

print(f"Number of missing 'TotalDeaths' values before filling: "
      f"{missing_total_deaths_before}")
print(f"Number of missing 'TotalDeaths' values after filling: "
      f"{missing_total_deaths_after}")


def fill_missing_total_recovered(row):
    if pd.isnull(row['TotalRecovered']):
        return int(round(row['TotalCases'] - (
            row['TotalDeaths'] + row['ActiveCases'])))
    return row['TotalRecovered']


missing_total_deaths_before = df['TotalRecovered'].isnull().sum()

df['TotalRecovered'] = df.apply(fill_missing_total_recovered, axis=1)

missing_total_deaths_after = df['TotalRecovered'].isnull().sum()

selected_rows = df.iloc[[9, 11, 29, 40]]
selected_rows

df['NewTotalCases'] = (
    df['TotalDeaths'] + df['TotalRecovered'] + df['ActiveCases']
)
df

mno.matrix(df, figsize=(15, 5))

if df['NewTotalCases'].equals(df['TotalCases']):
    print("Les colonnes sont identiques")
else:
    print("Les colonnes sont différentes")

    differences_count = (df['NewTotalCases'] != df['TotalCases']).sum()
    print(f"Nombre de différences trouvées : {differences_count}")

    print("\nExemples de différences :")
    diff_rows = df[
        df['NewTotalCases'] != df['TotalCases']
        ][['NewTotalCases', 'TotalCases']]
    print(diff_rows.head())

df = df.drop(columns=['TotalCases'])
df

df['Serious,Critical'] = df.groupby('Continent')['Serious,Critical'] \
                             .transform(lambda x: x.fillna(x.median()))
df['TotalTests'] = df.groupby('Continent')['TotalTests'] \
                     .transform(lambda x: x.fillna(x.median()))

mno.matrix(df, figsize=(15, 5))

plt.figure(figsize=(8, 7))
sns.heatmap(
    df.select_dtypes('number').corr(),
    annot=True,
    fmt=".2f",
    cmap="coolwarm"
    )

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
    "ActiveCases": "active_cases"
}
df = df.rename(columns=columns_mapping)
df

df = df.drop_duplicates()

df.head()

sns.heatmap(df.select_dtypes('number').corr(), annot=True, cmap="coolwarm")

X = df
X_train, X_test = train_test_split(
    X,
    test_size=0.2,
    random_state=42
)

print(f"Taille de X_train: {X_train.shape}")
print(f"Taille de X_test: {X_test.shape}")


def checkpostgres(max_retries=5):
    print("🔍 Vérification de la connexion à PostgreSQL...", flush=True)

    for attempt in range(max_retries):
        print(f"🟡 Tentative {attempt + 1}/{max_retries}...", flush=True)
        try:
            with Database() as cursor:
                pass
            print("Connexion PostgreSQL réussie !", flush=True)
            return True
        except psycopg2.OperationalError as e:
            print(f"⚠️ PostgreSQL inaccessible : {e}", flush=True)
            time.sleep(5)

    print("PostgreSQL inaccessible après plusieurs tentatives.", flush=True)
    return False



if __name__ == "__main__":
    # Vérifier la connexion
    checkpostgres()

    # Exemple: charger un dataframe pandas ici
    # df = pd.read_csv("ton_fichier.csv")  # ou autre méthode de chargement

    # Création des tables
    with Database() as cursor:
        
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
            country VARCHAR(100) NOT NULL UNIQUE, 
            continent VARCHAR(100) NOT NULL,
            who_region VARCHAR(100) NOT NULL,
            population INT NOT NULL
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS health_statistics (
            id SERIAL PRIMARY KEY,
            country_id INT NOT NULL UNIQUE,
            total_cases INT NOT NULL,
            total_deaths INT NOT NULL,
            total_recovered INT NOT NULL,
            serious_critical INT NOT NULL,
            CONSTRAINT fk_health_country FOREIGN KEY (country_id) REFERENCES countries(id)
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS testing_statistics (
            id SERIAL PRIMARY KEY,
            country_id INT NOT NULL UNIQUE,
            total_tests INT NOT NULL,
            CONSTRAINT fk_testing_country FOREIGN KEY (country_id) REFERENCES countries(id)
        );
        """)

    print("✅ Tables créées avec succès.")


    with Database() as cursor:
        for index, row in df.iterrows():
            try:
                country = row['country']
                continent = row['continent']
                who_region = row['who_region']
                population = int(row['population'])
                total_tests = int(row['total_tests'])
                total_cases = int(row['new_total_cases'])
                total_deaths = int(row['total_deaths'])
                total_recovered = int(row['total_recovered'])
                serious_critical = int(row['serious_critical'])
                active_cases = int(row['active_cases'])  # optionnel

                cursor.execute("""
                    INSERT INTO countries (country, continent, who_region, population)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (country) DO NOTHING
                    RETURNING id;
                """, (country, continent, who_region, population))

                country_id_row = cursor.fetchone()
                if country_id_row is None:
                    cursor.execute("SELECT id FROM countries WHERE country = %s;", (country,))
                    country_id_row = cursor.fetchone()
                country_id = country_id_row[0]

                cursor.execute("""
                    INSERT INTO health_statistics (country_id, total_cases, total_deaths, total_recovered, serious_critical)
                    VALUES (%s, %s, %s, %s, %s);
                """, (country_id, total_cases, total_deaths, total_recovered, serious_critical))

                cursor.execute("""
                    INSERT INTO testing_statistics (country_id, total_tests)
                    VALUES (%s, %s);
                """, (country_id, total_tests))

                cursor.execute("""
                    INSERT INTO worldometer (continent, who_region, country, population, total_tests, total_cases, total_deaths, total_recovered, serious_critical)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (continent, who_region, country, population, total_tests, total_cases, total_deaths, total_recovered, serious_critical))

                print(f"Insertion réussie pour {country}")

            except psycopg2.Error as e:
                print(f"Erreur lors de l'insertion pour {country}: {e}")
