import pytest
from fastapi.testclient import TestClient
from ws.covid_api import app, get_db


client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    db_gen = get_db()
    cursor = next(db_gen)
    yield
    try:
        cursor.execute("DELETE FROM t_users WHERE username LIKE 'testuser%' OR email LIKE 'testuser@%'")
        cursor.connection.commit()
    finally:
        db_gen.close()

@pytest.mark.authentication
class TestAuthenticationAPI:
    
    # On va tester l'inscription d'un utilisateur
    def test_register_user(self):
        response = client.post("/api/user", json={
            "username": "testuser_1",
            "email": "testuser1@example.com",
            "password": "123456"
        })
        assert response.status_code == 201
        assert response.json()["message"] == "Utilisateur créé avec succès"
        
    # On va tester l'inscription d'un utilisateur avec un email déjà existant
    def test_register_duplicate_user(self):
        # On crée d'abord un nouvel utilisateur sur la route d'inscription
        client.post("/api/user", json={
            "username": "testuser_2",
            "email": "testuser2@example.com",
            "password": "123456"
        })

        # On tente de recréer le même utilisateur (avec un username différent mais avec le même email)
        # sur la même route
        response = client.post("/api/user", json={
            "username": "testuser_3",
            "email": "testuser2@example.com",
            "password": "123456"
        })
        assert response.status_code == 400
        assert response.json()["detail"] == "Nom d'utilisateur ou email incorrect"

    # On fait le parcours de la route de connexion (donc inscription + connexion)
    def test_register_and_login_user(self):
        client.post("/api/user", json={
            "username": "testuser_3",
            "email": "testuser3@example.com",
            "password": "123456"
        })

        response = client.post("/api/login", data={
            "username": "testuser_3",
            "password": "123456"
        })
        assert response.status_code == 200
        # On vérifie que le token est bien présent dans la réponse
        assert "access_token" in response.json()
