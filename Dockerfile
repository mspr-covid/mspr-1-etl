# Dockerfile

## Ce Dockerfile est utilisé pour créer une image Docker pour l'application sur le COVID-19.
## Il utilise Python 3.11 et installe les dépendances nécessaires pour exécuter l'application. 
## Il est basé sur une image slim de Python pour réduire la taille de l'image finale.
## Update vers Python 3.13 en version alpine pour une image plus légère, plus rapide et plus sécurisée.

FROM python:3.13-alpine

# Installe make et les dépendances nécessaires
RUN apk add --no-cache make build-base git openssh

# Crée le répertoire pour l'application au sein du conteneur
WORKDIR /app

# Copie le fichier requirements.txt dans le conteneur (Pour optimiser le cache)
# Il est préférable de le faire avant de copier le reste du code pour éviter de reconstruire l'image à chaque changement de code
# et ainsi profiter du cache Docker.
# Cela permet de ne pas avoir à réinstaller les dépendances si elles n'ont pas changé.
COPY requirements.txt .

# Installe les dépendances de l'application
RUN pip install --no-cache-dir -r requirements.txt

# Copie les fichiers nécessaires dans le conteneur
COPY . .

# Commande pour lancer l'API et le script Python
CMD ["sh", "-c", "uvicorn ws.covid_api:app --host 0.0.0.0 --port 8000"]

