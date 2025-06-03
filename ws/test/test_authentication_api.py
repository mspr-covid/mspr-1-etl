import pytest
from fastapi.testclient import TestClient
from ws.covid_api import app, get_db


client = TestClient(app)


# TODO: Mettre en place une BDD de test
@pytest.fixture(autouse=True)
def clean_db():
    db_gen = get_db()
    cursor = next(db_gen)

    # Nettoyer avant le test
    cursor.execute("""DELETE
                   FROM t_users
                   WHERE username LIKE 'testuser%'
                   OR email LIKE 'testuser@%'""")
    cursor.connection.commit()

    yield

    # Nettoyer après le test aussi
    cursor.execute("""DELETE
                   FROM t_users
                   WHERE username LIKE 'testuser%'
                   OR email LIKE 'testuser@%'""")
    cursor.connection.commit()

    db_gen.close()


class TestAuthenticationAPI:
    # On va tester l'inscription d'un utilisateur
    @pytest.mark.authentication
    def test_register_user(self):
        response = client.post("/api/user", json={
            "username": "testuser_1",
            "email": "testuser1@example.com",
            "password": "123456"
        })
        assert response.status_code == 201
        assert response.json()["message"] == "Utilisateur créé avec succès"

# On va tester l'inscription d'un utilisateur avec un email déjà existant
    @pytest.mark.authentication
    def test_register_duplicate_user(self):
        # Création initiale
        first_response = client.post(
            "/api/user",
            json={
                "username": "testuser_2",
                "email": "testuser2@example.com",
                "password": "123456"
            })
        assert first_response.status_code == 201

        # Deuxième tentative avec le même email
        response = client.post(
            "/api/user",
            json={
                "username": "testuser_3",  # username différent
                "email": "testuser2@example.com",  # même email
                "password": "123456"
            })
        assert response.status_code == 400
        detail = response.json()["detail"]
        assert detail == "Nom d'utilisateur ou email incorrect"

# On fait le parcours de la route de connexion (donc inscription + connexion)
    @pytest.mark.authentication
    def test_register_and_login_user(self):
        client.post("/api/user", json={
            "username": "testuser_3",
            "email": "testuser3@example.com",
            "password": "123456"
        })

        response = client.post("/api/login", json={
            "username": "testuser_3",
            "password": "123456"
        })
        assert response.status_code == 200
        # On vérifie que le token est bien présent dans la réponse
        assert "access_token" in response.json()
