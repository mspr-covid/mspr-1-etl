import pytest
from fastapi.testclient import TestClient
from ws.covid_api import app, get_db

client = TestClient(app)

# TODO: Mettre en place une BDD de test
@pytest.fixture(autouse=True)
def clean_db():
    """Nettoie la base de toutes les données insérées durant les tests."""
    db_gen = get_db()
    cursor = next(db_gen)
    yield
    try:
        # On Nettoie les entrées liées à ce test
        cursor.execute("DELETE FROM testing_statistics WHERE country_id IN (SELECT id FROM countries WHERE country LIKE 'Testland%')")
        cursor.execute("DELETE FROM health_statistics WHERE country_id IN (SELECT id FROM countries WHERE country LIKE 'Testland%')")
        cursor.execute("DELETE FROM countries WHERE country LIKE 'Testland%'")
        cursor.execute("DELETE FROM t_users WHERE username LIKE 'testuser%' OR email LIKE 'testuser@%'")
        cursor.connection.commit()
    except Exception as e:
        print(f"Erreur lors du nettoyage de la DB : {e}")
    finally:
        try:
            db_gen.close()
        except Exception as e:
            print(f"Erreur lors de la fermeture de la connexion : {e}")

class TestCovidAPI:

    @pytest.mark.covid
    def test_add_covid_entry_authenticated(self):
        
        """On fait le parcours complet de l'inscription, connexion et ajout d'une entrée COVID."""
        
        # Inscription
        register_response = client.post("/api/user", json={
            "username": "testuser",
            "email": "testuser@test.com",
            "password": "Test123456"
        })
        assert register_response.status_code == 201

        # Connexion
        login_response = client.post("/api/login", data={
            "username": "testuser",
            "password": "Test123456"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Envoi des données COVID
        payload = {
            "country": "Testland",
            "continent": "Testinent",
            "who_region": "TestRegion",
            "population": 123456,
            "total_cases": 1000,
            "total_deaths": 50,
            "total_recovered": 900,
            "serious_critical": 10,
            "total_tests": 5000
        }

        covid_response = client.post("/covid", json=payload, headers=headers)

        assert covid_response.status_code == 200
        assert covid_response.json()["message"] == "Entry added successfully"
    
    @pytest.mark.covid
    def test_add_covid_entry_with_negative_population(self):
        """Test pour vérifier que l'ajout d'une entrée COVID avec une population négative échoue."""
        register_response = client.post("/api/user", json={
            "username": "testuser",
            "email": "testuser@test.com",
            "password": "Test123456"
        })
        
        assert register_response.status_code == 201

        login_response = client.post("/api/login", data={
        "username": "testuser",
        "password": "Test123456"
        })
        
        assert login_response.status_code == 200
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "country": "Testland",
            "continent": "Testinent",
            "who_region": "TestRegion",
            "population": -1,  # Valeur négative 
            "total_cases": 1000,
            "total_deaths": 50,
            "total_recovered": 900,
            "serious_critical": 10,
            "total_tests": 5000
        }

        response = client.post("/covid", json=payload, headers=headers)
        assert response.status_code == 400
        detail = response.json().get("detail", "")
        assert "population" in detail or "positif" in detail.lower()

    @pytest.mark.covid
    def test_get_all_covid_entries_authenticated(self):
        # Inscription
        register_response = client.post("/api/user", json={
            "username": "testuser_getall",
            "email": "testuser_getall@example.com",
            "password": "123456"
        })
        assert register_response.status_code == 201

        # Connexion
        login_response = client.post("/api/login", data={
            "username": "testuser_getall",
            "password": "123456"
        })
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Appel
        response = client.get("/covid", headers=headers)
        assert response.status_code == 200

        json_data = response.json()
        assert "data" in json_data
        assert isinstance(json_data["data"], list)
        assert len(json_data["data"]) > 0  # On s'attend à au moins une entrée

        # Vérification les clés dans la première entrée
        first_entry = json_data["data"][0]
        expected_keys = {
        "country", "continent", "who_region", "population",
        "total_cases", "total_deaths", "total_recovered", "serious_critical",
        "total_tests"
        }
        assert expected_keys.issubset(first_entry.keys())

    @pytest.mark.covid
    def test_delete_covid_entry_authenticated(self):
        """Test d'intégration complet : On s'enregistre, connecte, ajoute, supprime, et vérifie de la suppression d'une entrée COVID."""

        # On crée un utilisateur
        register_response = client.post("/api/user", json={
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "Test123456"
        })
        
        assert register_response.status_code == 201

        # Connexion pour obtenir le token 
        login_response = client.post("/api/login", data={
            "username": "testuser",
            "password": "Test123456"
        })
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Ajout d'une entrée COVID
        payload = {
            "country": "Testland",
            "continent": "Testinent",
            "who_region": "TestRegion",
            "population": 9999,
            "total_cases": 500,
            "total_deaths": 25,
            "total_recovered": 450,
            "serious_critical": 5,
            "total_tests": 2000
        }

        post_response = client.post("/covid", json=payload, headers=headers)
        
        assert post_response.status_code == 200
        assert post_response.json()["message"] == "Entry added successfully"

        # On Suppression de l'entrée COVID
        delete_response = client.delete("/covid/Testland", headers=headers)
        
        assert delete_response.status_code == 200
      
        expected_message = f"Entry for '{payload['country']}' deleted successfully"
        
        assert delete_response.json()["message"] == expected_message


        # 5. Vérification que l'entrée n'est plus présente dans la liste
        all_entries_response = client.get("/covid", headers=headers)
        
        assert all_entries_response.status_code == 200
        
        entries = all_entries_response.json().get("data", [])
        countries = [entry.get("country") for entry in entries]
        
        assert "Testland" not in countries
