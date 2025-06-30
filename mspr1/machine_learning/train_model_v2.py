import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import missingno as msno
import json

from sklearn.model_selection import (
    train_test_split, GridSearchCV, RandomizedSearchCV, learning_curve, ShuffleSplit
)
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.base import clone

from scipy.stats import uniform, randint
import xgboost as xgb
from xgboost import XGBRegressor

# === Lecture des données ===
df = pd.read_csv('data/data-migration/worldometer_data_clean.csv')

# === Exploration rapide ===
msno.matrix(df)
print(df.describe())
print(df.dtypes)
print(df.columns)

# === Définition des colonnes ===
categorical_features = ['continent', 'who_region', 'country']
numerical_features = ['population', 'total_recovered', 'active_cases',
                      'serious_critical', 'total_tests', 'new_total_cases']

# === Préprocesseur commun ===
categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
numerical_transformer = RobustScaler()
preprocessor = ColumnTransformer([
    ('cat', categorical_transformer, categorical_features),
    ('num', numerical_transformer, numerical_features)
])

# === Données ===
X = df[categorical_features + numerical_features]
y = df['total_deaths']

# 🔁 MODIFICATION: transformation logarithmique (avec 1 pour éviter log(0))
y_log = np.log1p(y)

X_train, X_test, y_train_log, y_test_log = train_test_split(X, y_log, test_size=0.2, random_state=42)

# === Modèles et hyperparamètres ===
param_distributions = {
    'linear_regression': {},
    'ridge': {'regressor__alpha': uniform(loc=0.0001, scale=10)},
    'random_forest': {
        'regressor__n_estimators': randint(50, 200),
        'regressor__max_depth': [None, 10, 20, 30],
        'regressor__min_samples_split': randint(2, 11),
        'regressor__min_samples_leaf': randint(1, 5)
    },
    'gradient_boosting': {
        'regressor__learning_rate': uniform(0.01, 0.3),
        'regressor__n_estimators': randint(50, 200),
        'regressor__max_depth': randint(3, 10)
    },
    'xgboost': {
        'regressor__learning_rate': uniform(0.01, 0.3),
        'regressor__n_estimators': randint(50, 200),
        'regressor__max_depth': randint(3, 10)
    }
}

models = {
    'linear_regression': {'model': LinearRegression()},
    'ridge': {'model': Ridge()},
    'random_forest': {'model': RandomForestRegressor(random_state=42)},
    'gradient_boosting': {'model': GradientBoostingRegressor(random_state=42)},
    'xgboost': {'model': xgb.XGBRegressor(random_state=42, verbosity=0)}
}

cv_learning = ShuffleSplit(n_splits=5, test_size=0.2, random_state=42)
best_models = {}

# === Fonction learning curve ===
def plot_learning_curve(estimator, title, X, y, cv=5, scoring='r2', filename=None):
    train_sizes, train_scores, val_scores = learning_curve(
        estimator=clone(estimator),
        X=X,
        y=y,
        train_sizes=np.linspace(0.1, 1.0, 10),
        cv=cv,
        scoring=scoring,
        n_jobs=-1
    )
    train_scores_mean = np.mean(train_scores, axis=1)
    val_scores_mean = np.mean(val_scores, axis=1)

    plt.figure(figsize=(8, 5))
    plt.plot(train_sizes, train_scores_mean, 'o-', label='Score entraînement')
    plt.plot(train_sizes, val_scores_mean, 'o-', label='Score validation')
    plt.title(title)
    plt.xlabel("Taille de l'ensemble d'entraînement")
    plt.ylabel(f"Score {scoring}")
    plt.legend(loc="best")
    plt.grid(True)
    plt.tight_layout()

    if filename:
        os.makedirs("mspr1/machine_learning/static/plots", exist_ok=True)
        plt.savefig(f"mspr1/machine_learning/static/plots/{filename}.png")
        plt.close()
    else:
        plt.show()

def plot_residuals(y_true, y_pred, model_name):
    """
    Trace et sauvegarde la courbe des résidus dans le dossier static/.
    - Ça montre les erreurs (résidu = y_true - y_pred) en fonction des prédictions.
    """
    residuals = y_true - y_pred

    plt.figure(figsize=(8, 5))
    plt.scatter(y_pred, residuals, alpha=0.5)
    plt.axhline(0, color='red', linestyle='--', linewidth=1)
    plt.title(f"Residual plot - {model_name}")
    plt.xlabel("Predicted values")
    plt.ylabel("Residual (errors)")
    plt.grid(True)
    plt.tight_layout()

    os.makedirs("mspr1/machine_learning/static/plots", exist_ok=True)
    plt.savefig(f"mspr1/machine_learning/static/plots/residuals_{model_name}.png")
    plt.close()

metrics_summary = {}

# === Entraînement des modèles ===
for name, config in models.items():
    print(f"\n🔍 RandomizedSearchCV pour : {name}")
    pipeline = Pipeline([
        ('preprocessing', preprocessor),
        ('regressor', config['model'])
    ])
    param_dist = param_distributions.get(name, {})

    if param_dist:
        search = RandomizedSearchCV(
            pipeline,
            param_distributions=param_dist,
            n_iter=50,
            cv=5,
            scoring='r2',
            n_jobs=-1,
            random_state=42,
            verbose=1
        )
        search.fit(X_train, y_train_log)
        best_model = search.best_estimator_
        print(f"🏅 Meilleurs paramètres : {search.best_params_}")
        print(f"⭐ Meilleur score R² (train cv) : {search.best_score_:.4f}")
    else:
        pipeline.fit(X_train, y_train_log)
        best_model = pipeline
        print("Pas d'hyperparamètre à tuner.")

    # 🔁 MODIFICATION: inverse log1p après prédiction pour retour à l’échelle originale
    y_pred_test_log = best_model.predict(X_test)
    y_pred_test = np.expm1(y_pred_test_log)
    y_test = np.expm1(y_test_log)

    r2_test = r2_score(y_test, y_pred_test)
    rmse_test = mean_squared_error(y_test, y_pred_test) ** 0.5
    mae_test = mean_absolute_error(y_test, y_pred_test)

    print(f"📊 R² sur test : {r2_test:.4f}")
    print(f"📊 RMSE sur test : {rmse_test:.4f}")
    print(f"📊 MAE sur test : {mae_test:.4f}")

    print(f"📉 Courbe des résidus pour : {name}")
    plot_residuals(y_test, y_pred_test, name)

    print(f"📈 Learning Curve pour : {name}")
    plot_learning_curve(
        best_model,
        f"Learning Curve - {name}",
        X_train,
        y_train_log,
        cv=cv_learning,
        filename=f"learning_curve_{name}"
    )

    best_models[name] = {
        'best_estimator': best_model,
        'r2_test': r2_test,
        'rmse_test': rmse_test,
        'best_params': search.best_params_ if param_dist else None
    }

    metrics_summary[name] = {
        'r2': r2_test,
        'rmse': rmse_test,
        'mae': mae_test
    }

os.makedirs("mspr1/machine_learning/static", exist_ok=True)
with open("mspr1/machine_learning/static/metrics.json", "w") as f:
    json.dump(metrics_summary, f, indent=4)
print("✅ Metrics sauvegardées dans : mspr1/machine_learning/static/metrics.json")

# === Meilleur modèle global ===
best_model_name = max(best_models, key=lambda name: best_models[name]['r2_test'])
final_model = best_models[best_model_name]['best_estimator']
joblib.dump(final_model, f'model/best_model_{best_model_name}.pkl')
print(f"\n✅ Meilleur modèle sauvegardé sous : models/best_model_{best_model_name}.pkl")


# L'idée dans les étapes suivantes est de trouver le pays avec le plus gros résidu (erreur de prédiction) pour le modèle XGBoost afin de comprendre où il se trompe le plus.


if name == 'xgboost':
    print("\n🔎 Recherche des plus gros résidus pour XGBoost")
    X_test_reset = X_test.reset_index(drop=True)
    y_test_reset = np.expm1(y_test_log.reset_index(drop=True))
    y_pred_log = final_model.predict(X_test_reset)
    y_pred = np.expm1(y_pred_log)
    residuals = y_test_reset - y_pred

    # Trouver l'index du plus gros résidu
    abs_residuals = np.abs(residuals)
    max_idx = abs_residuals.argmax()
    max_country_data = X_test_reset.iloc[max_idx]
    
    print(f"\n📍 Plus gros résidu pour XGBoost :")
    print(f"Pays : {max_country_data['country']}")
    print(f"Valeur réelle (y_test) : {y_test_reset.iloc[max_idx]:,.0f}")
    print(f"Valeur prédite : {y_pred[max_idx]:,.0f}")
    print(f"Résidu : {residuals.iloc[max_idx]:,.0f}")
    print(f"\n🔎 Données associées :\n{max_country_data}")

if name == "xgboost":
    residuals = y_test - y_pred_test

    max_residual_idx = np.argmax(np.abs(residuals))

    print("\Plus gros résidu pour XGBoost :")
    print(f"Pays : {X_test.iloc[max_residual_idx]['country']}")
    print(f"Valeur réelle (y_test) : {y_test.iloc[max_residual_idx]:,.0f}")
    print(f"Valeur prédite : {y_pred_test[max_residual_idx]:,.0f}")
    print(f"Résidu : {residuals.iloc[max_residual_idx]:,.0f}")

    print("Données associées :")
    print(X_test.iloc[max_residual_idx])


