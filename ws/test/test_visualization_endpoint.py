import pytest
import os
import json
from fastapi.testclient import TestClient
from ws.covid_api import app, get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_users_only():
    """Supprime l'utilisateur de test créé dans les tests de visualisation. """
    db_gen = get_db()
    cursor = next(db_gen)
    yield
    try:
        cursor.execute("""
            DELETE FROM t_users
            WHERE username LIKE 'testuser_plot%'
            OR email LIKE 'testuser_plot@%'
        """)
        cursor.connection.commit()
    except Exception as e:
        print(f"Erreur lors du nettoyage des utilisateurs : {e}")
    finally:
        try:
            db_gen.close()
        except Exception as e:
            print(f"Erreur lors de la fermeture de la connexion : {e}")


class TestVisualizationAPI:
    def get_auth_headers(self, username="testuser_plot", password="Test123456"):
        """Crée un utilisateur et récupère un token JWT."""
        # création user
        client.post("/api/user", json={
            "username": username,
            "email": f"{username}@test.com",
            "password": password
        })

        # connexion et token
        response = client.post("/api/login", data={
            "username": username,
            "password": password
        })

        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    @pytest.mark.visualization
    def test_learning_curve_requires_auth(self):
        """Vérifie que la route /learning_curve sans token retourne 401."""
        response = client.get("/learning_curve")
        assert response.status_code == 401

    @pytest.mark.visualization
    def test_residual_plot_requires_auth(self):
        """Vérifie que la route /residual_plot sans token retourne 401."""
        response = client.get("/residual_plot")
        assert response.status_code == 401

    @pytest.mark.visualization
    def test_learning_curve_authenticated(self):
        """Accès authentifié à /learning_curve."""
        headers = self.get_auth_headers()
        response = client.get("/learning_curve", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "plots" in data
        assert isinstance(data["plots"], list)

        for url in data["plots"]:
            assert url.startswith("/static/plots/learning_curve")
            assert url.endswith(".png")

    @pytest.mark.visualization
    def test_residual_plot_authenticated(self):
        """Accès authentifié à /residual_plot."""
        headers = self.get_auth_headers()
        response = client.get("/residual_plot", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "plots" in data
        assert isinstance(data["plots"], list)

        for url in data["plots"]:
            assert url.startswith("/static/plots/residuals")
            assert url.endswith(".png")

    @pytest.mark.visualization
    def test_metrics_requires_auth(self):
        """Pour vérifier que la route /metrics sans token retourne 401"""
        response = client.get("/metrics")
        assert response.status_code == 401

    @pytest.mark.visualization
    def test_metrics_authenticated(self):
        """Accès authentifié à /metrics, pour vérifier que les données JSON sont présentes et bien formées"""
        headers = self.get_auth_headers()

        # Pour éviter erreur si le fichier metrics.json n'existe pas, on crée un fichier temporaire minimal
        metrics_path = os.path.join(os.path.dirname(__file__), "../mspr1/machine_learning/static/metrics.json")
        os.makedirs(os.path.dirname(metrics_path), exist_ok=True)
        sample_metrics = {
            "linear_regression": {"r2": 0.5, "rmse": 10.0, "mae": 8.0}
        }
        with open(metrics_path, "w") as f:
            json.dump(sample_metrics, f)

        response = client.get("/metrics", headers=headers)
        assert response.status_code == 200

        data = response.json()
        assert "metrics" in data
        assert isinstance(data["metrics"], dict)
        assert "linear_regression" in data["metrics"]
        assert "r2" in data["metrics"]["linear_regression"]
        assert "rmse" in data["metrics"]["linear_regression"]
        assert "mae" in data["metrics"]["linear_regression"]

        # Nettoyage après test
        os.remove(metrics_path)
