import pytest
from unittest.mock import MagicMock



import jwt
from fastapi.testclient import TestClient
from datetime import timedelta
from ws.covid_api import app, create_access_token
from ws.covid_api import get_db
import os

# Ici, on va supposer que la clé est définie dns les variables d'environnement
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
client = TestClient(app)


#Test de la méthode qui est située dans le fichier ws/covid_api.py
@pytest.mark.token
def test_create_access_token():
    # Données de test pour le token
    payload = {"sub": "mail_user"}
    expires = timedelta(minutes=30)

    # Appel de la méthode à tester
    token = create_access_token(data=payload, expires_delta=expires)

    # Vérification que le token est une chaîne non vide
    assert isinstance(token, str)
    assert token != ""

    # Décodage du token pour inspecter le contenu
    # On utilise la même clé et le même algorithme que pour l'encodage
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    # Vérifie que le contenu du token correspond à ce qu'on a encodé
    assert decoded["sub"] == "mail_user"
    # On regarde si le champ d'expiration est bien présent dans le token
    assert "exp" in decoded 
    




