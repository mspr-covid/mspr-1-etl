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
