import pytest
from unittest.mock import MagicMock
from unittest.mock import ANY


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
# TODO : crypt est depérécié, Mettre à jour avec un autre module (hashlib ?)
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
    
def mock_db(monkeypatch):
    # Ici on crée un objet fictif pour simuler le comportement de la base de données
    # On utilise MagicMock pour créer un objet qui imite le comportement d'un curseur de base de données
    # On suppose que le curseur a une méthode fetchone() qui renvoie un utilisateur
    mock_cursor = MagicMock()

    # Par défaut, aucun utilisateur trouvé
    mock_cursor.fetchone.return_value = None

    def override_get_db():
        return mock_cursor

    monkeypatch.setattr("ws.covid_api.get_db", override_get_db)  
    return mock_cursor

# def test_register_user_success(mock_db):
#     # Injection correcte du mock
#     app.dependency_overrides[get_db] = lambda: mock_db

#     payload = {
#         "username": "nouveau_user",
#         "email": "test@example.com",
#         "password": "password123"
#     }

#     response = client.post("/api/user", json=payload)

#     # ASSERTIONS
#     assert response.status_code == 201
#     assert response.json() == {"message": "Utilisateur créé avec succès"}

#     mock_db.execute.assert_any_call(
#         "INSERT INTO t_users (username, email, password_hash) VALUES (%s, %s, %s)",
#         ("nouveau_user", "test@example.com", ANY)
#     )

#     # Nettoyage
#     app.dependency_overrides = {}



