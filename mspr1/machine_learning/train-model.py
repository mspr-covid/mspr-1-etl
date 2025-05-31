import pandas as pd
import os
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Charger les données nettoyées
df = pd.read_csv("data/data-migration/worldometer_data_clean.csv")


# On s'en servira pour voir les features d'importance
features = ["total_tests", "total_recovered", "serious_critical", "population", "active_cases", "new_total_cases"]

# Après le retour des features d'importance
features_clean = ["total_tests", "serious_critical", "population"]

target = "total_deaths"

# On ne garde que les colonnes numériques pour la corrélation
num_cols = features + [target]

# On vérifie la corrélation entre les features et la cible
corr_matrix = df[num_cols].corr()

print("Corrélation avec la cible (total_deaths) :")
print(corr_matrix[target].loc[features].sort_values(ascending=False))

X = df[features_clean]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=True
)

# On teste plusieurs modèles et on gardera le meilleur
models = {
    "linear_regression": LinearRegression(),
    "xgboost": xgb.XGBRegressor(),
    "random_forest": RandomForestRegressor(),
}

best_model = None
best_r2 = float('-inf')
best_rmse = float('inf')
best_model_name = ""

for name, model in models.items():
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = mse ** 0.5
    r2 = r2_score(y_test, y_pred)
    

    print(
    f"""Évaluation du modèle {name} :
  - MAE  : {mae:.2f}
  - MSE  : {mse:.2f}
  - RMSE : {rmse:.2f}
  - R²   : {r2:.4f}
    """
    )
    
    # Affichage importance des features si disponible
    if hasattr(model, "feature_importances_"):
        print("Importance des variables :")
        for feat, imp in zip(features, model.feature_importances_):
            print(f"  - {feat}: {imp:.4f}")


    if (r2 > best_r2) or (r2 == best_r2 and rmse < best_rmse):
        best_r2 = r2
        best_rmse = rmse
        best_model = model
        best_model_name = name


# Sauvegarder le meilleur modèle
if best_model is not None:
    os.makedirs("model", exist_ok=True)
    joblib.dump(best_model, f"model/{best_model_name}_total_deaths_model.pkl")
    print(f"Modèle {best_model_name} sauvegardé avec un R² de {best_r2:.4f} et un RMSE de {best_rmse:.2f}.")
