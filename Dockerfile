# Dockerfile
FROM python:3.11-slim

# Crée un dossier pour l'application
WORKDIR /app

# Copie les fichiers
COPY . .

# Installe les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Commande pour lancer l'API
# CMD ["uvicorn", "ws.covid_api:app", "--host", "0.0.0.0", "--port", "8000"]
CMD python mspr1/covid_mspr1.py && uvicorn ws.covid_api:app --host 0.0.0.0 --port 8000
