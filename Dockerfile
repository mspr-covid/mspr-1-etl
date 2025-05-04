# Dockerfile

## Ce Dockerfile est utilisé pour créer une image Docker pour l'application sur le COVID-19.
## Il utilise Python 3.11 et installe les dépendances nécessaires pour exécuter l'application. 
## Il est basé sur une image slim de Python pour réduire la taille de l'image finale.
## Update vers Python 3.13 en version alpine pour une image plus légère, plus rapide et plus sécurisée.

FROM python:3.13-alpine

# Installe make et les dépendances nécessaires
RUN apk add --no-cache make build-base

# Crée le répertoire pour l'application au sein du conteneur
WORKDIR /app

# Copie les fichiers nécessaires dans le conteneur
COPY . .

# Installe les dépendances de l'application
RUN pip install --no-cache-dir -r requirements.txt

# Commande pour lancer l'API et le script Python
CMD python mspr1/covid_mspr1.py && uvicorn ws.covid_api:app --host 0.0.0.0 --port 8000
