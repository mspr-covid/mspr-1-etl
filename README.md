# 📊 MSPR 1 – Projet ETL, API FastAPI, PostgreSQL & Grafana

Ce projet est une solution d'extraction, transformation et chargement (ETL) des données du COVID-19, accompagnée d'une API REST développée avec FastAPI, d'un tableau de bord Grafana pour la visualisation des données, d'une base de données PostgreSQL pour le stockage et d'un modèle de machine learning. Le tout est orchestré dans un environnement Dockerisé prêt pour le développement via Dev Containers.

---

## 🧱 Structure du projet

mspr-1-etl/
├── .devcontainer/ # Configuration pour le Dev Container
├── data/ # Données brutes et transformées
├── database/ # Scripts de gestion de la base de données
├── front/ # Client qui consomme notre API et permet la visualisation de données
├── grafana/ # Configuration de Grafana (notamment pour la partie Docker)
├── mspr1/ # Ensemble du processus ETL
├── ws/ # API FastAPI
├── .gitignore
├── Dockerfile # L'image de notre application est générée grâce à ce fichier
├── Makefile # Nous permet de lancer des commandes plus simplement
├── README.md # Des informations sur le projet
├── docker-compose.yml # Pour lancer les services dans des environnements isolés
├── requirements.txt # Les dépendances du projet
└── documentation-docker.md # Description de l'infra DevOPS

---

## 🚀 Prérequis

- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/) installés sur votre machine.
- [Visual Studio Code](https://code.visualstudio.com/) avec l'extension [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

## ⚙️ Installation

1. **Cloner le dépôt :**

   ```bash

   git clone https://github.com/Nouster/mspr-1-etl.git

   ```

2. **Création d'un fichier d'environnement local :**

Crééz un fichier .env à la racine du projet en copiant le schéma depuis le
.env.template et en éditant avec vos informations.

```bash
cp .env.template .env
```

3. **Lancement de l'infra Docker :**

```bash
docker compose up --build
```

👉 [Voir notre documentation Docker](documentation-docker.md)

4. **Les tests :**

Ils sont lancés via le framework pytest et sont intégrés à une pipeline CI. La pipeline génére un rapport sur la couverture de test.

## 🛠️ Intégration continue (CI)

Le projet utilise **GitHub Actions** pour exécuter automatiquement les tests unitaires à chaque `push` ou `pull request`.
Un webhook vers un salon Discord permet de notifier l’équipe en temps réel des résultats du workflow.

Le fichier de configuration se trouve dans `.github/workflows/main.yml`.

### ✅ Étapes automatisées

- Vérification du code via un linter (Flake8 - Non bloquant)
- Installation des dépendances (`pip install -r requirements.txt`)
- Exécution des tests avec `pytest`
- Mesure de la couverture
- Envoie une notification sur le salon Discord via un webhook

### 🔄 Déclencheurs du workflow

- `push` sur n'importe quelle branche
- `pull_request` vers la branche `master`

👉 [Voir notre documentation CI](.github/workflows/ci-workflow.md)
