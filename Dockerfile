# Dockerfile
FROM python:3.11-slim

# Installe make et les dépendances nécessaires
RUN apt-get update && apt-get install -y make build-essential && apt-get clean

# Crée un dossier pour l'application
WORKDIR /app

# Copie les fichiers
COPY . .

# Installe les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Commande pour lancer l'API
CMD python mspr1/covid_mspr1.py && uvicorn ws.covid_api:app --host 0.0.0.0 --port 8000
