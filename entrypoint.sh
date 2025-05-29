#!/bin/sh
set -e

echo "Lancement du script ETL"
if python mspr1/covid_mspr1.py; then
    echo "Script ETL exécuté avec succès"
else
    echo "Script ETL not ok" >&2
    exit 1
fi

echo "Démarrage FastAPI"
exec uvicorn ws.covid_api:app --host 0.0.0.0 --port ${PORT:-8000}
