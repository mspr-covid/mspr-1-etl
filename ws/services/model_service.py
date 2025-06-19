import os
from pathlib import Path
import joblib
from functools import lru_cache

MODEL_PATH = os.getenv("MODEL_PATH", "/app/model/random_forest_total_deaths_model.pkl")

@lru_cache()
def get_model():
    model_path = Path(MODEL_PATH)
    if not model_path.is_file():
        raise FileNotFoundError(f"Model file not found at {model_path}")
    with open(model_path, "rb") as f:
        print(f"Chargement du modèle depuis : {model_path}")
        model = joblib.load(model_path) 
    return model


@lru_cache()
def get_model_v2():
    models_dir = Path("model")
    if not models_dir.exists() or not models_dir.is_dir():
        raise FileNotFoundError("Le dossier 'model' n'existe pas.")

    model_files = list(models_dir.glob("best_model_*.pkl"))
    if not model_files:
        raise FileNotFoundError("Aucun modèle entraîné trouvé dans le dossier 'model'.")

    # Prendre le modèle le plus récemment modifié
    latest_model_file = max(model_files, key=lambda f: f.stat().st_mtime)

    print(f"Chargement du dernier modèle entraîné : {latest_model_file}")
    with open(latest_model_file, "rb") as f:
        model = joblib.load(f)
    return model