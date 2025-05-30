# Intégration Continue – Workflow GitHub Actions

Ici, on décrit comment fonctionne le workflow GitHub Actions mis en place pour ce projet. Il s'exécute automatiquement à chaque `push` ou `pull_request` sur le dépôt. Ce sont nos délencheurs.

---

## Objectifs du workflow

- Construire l'image Docker du backend et la pousser sur un registry
- Lancer les conteneurs nécessaires à l'application (FastAPI + PostgreSQL + Grafana)
- Vérifier que les services sont bien disponibles
- Initialiser la base de données
- Lancer les tests automatiques avec `pytest`
- Vérifier la qualité du code avec `flake8`
- Scanner l'image Docker à la recherche de failles de sécurité avec Docker Scout
- Envoyer des notifications sur Discord via des webhooks. Une notification pour le rapport de sécurité et une
  autre pour informer le statut d'une PR.

---

## 1. Job `build`

Ce job s'occupe de :

- Cloner le projet
- Construire une image Docker taguée `:test` à partir du Dockerfile
- Se connecter à Docker Hub
- Pousser l'image vers le Docker Hub. On se servira de cette image dans le job qui scanne le projet
  et lancer un rapport de sécurité

Ça permet de s'assurer que l'image peut être construite correctement à chaque commit.
On évite des régressions de ce côté.

---

## 2. Job `start-services`

Ce job dépend du précédent (`needs: build`) et fait plusieurs actions :

- Création d'un fichier `.env` à partir des secrets stockés dans GitHub
- Lancement des services avec `docker compose up -d`
- Vérification que PostgreSQL est prêt
- Création de la base de données si elle n'existe pas déjà
- Exécution d'un script Python pour initialiser les tables
- Vérification que FastAPI est bien lancé
- Installation de `flake8` dans le conteneur backend pour executer un linter (non bloquant pour le moment)
- Lancement des tests unitaires et d'intégrations avec `pytest` et on lance un calcul de la couverture de code

---

## 3. Job `notification-security`

Ce job exécute un scan de sécurité sur l'image Docker construite. On utilise la CLI de Docker Scout. Ce qu'il fait :

- On récupère l'image `covid-mspr:test` depuis Docker Hub (On l'avait poussée à l'étape du build)
- On installe la CLI Docker Scout
- On lance deux commandes :
  - `docker scout quickview` : vue d'ensemble rapide
  - `docker scout recommendations` : recommandations pour corriger les failles
- Et on envoit automatiquement dans des salons Discord via des webhooks

Les rapports sont lisibles directement depuis Discord, dans des blocs de code.

---

## 4. Job `notification-integration`

Une fois que tout s'est bien passé, ce job envoie une notification dans un autre salon Discord pour prévenir que le workflow a réussi et que la PR peut-être relue

La notification contient le nom de la branche et l'utilisateur qui a déclenché le workflow.

---

## Secrets utilisés dans GitHub

Voici la liste des secrets utilisés dans notre pipeline :

- `DOCKER_USERNAME` : identifiant Docker Hub
- `DOCKER_PASSWORD` : mot de passe Docker Hub
- `DISCORD_SECURITY_WEBHOOK` : webhook Discord pour les rapports de sécurité
- `DISCORD_WEBHOOK` : webhook Discord pour les notifications de succès
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` : infos pour se connecter à la base
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` : variables PostgreSQL internes
- `SECRET_KEY` : clé secrète de l'application

---

## Résumé du déroulement

Pour résumer, les grandes étapes sont :

1. Le projet est cloné
2. L'image Docker est construite et poussée
3. Les conteneurs sont lancés et vérifiés
4. La base de données est préparée
5. Les tests et le linter sont exécutés
6. Le rapport de sécurité est généré et envoyé
7. Une notification Discord est envoyée pour résumer l'exécution

---

## Remarque

Cette pipeline est conçu pour être facilement extensible. Il est possible d'ajouter d'autres outils de qualité ou des déploiements automatiques par la suite si besoin.

## 7. Déploiement continu (CD)

Les jobs suivants ne s’exécutent que lors d’un **merge** sur la branche `master`. Cela garantit que seules des versions validées et stables soient déployées en production.

Nous déployons notre application sur **Fly.io**, un fournisseur cloud choisi pour sa simplicité d’intégration avec GitHub Actions, son plan gratuit adapté aux petits projets, ainsi que sa gestion native des conteneurs Docker. Fly.io offre aussi une montée en charge automatique en cas d’augmentation de trafic, ce qui est un avantage pour la scalabilité.

Le job de déploiement dépend de la réussite de plusieurs jobs clés :

- Build des images Docker backend et frontend
- Lancement et validation de l’infrastructure Docker
- Tests unitaires et d’intégration
- Notifications de succès d’intégration

Pour déployer, nous utilisons l’action GitHub officielle `superfly/flyctl-actions@v1` qui installe automatiquement la CLI Fly.io dans le runner GitHub, puis exécute la commande suivante :

```yaml
- uses: superfly/flyctl-actions@v1
  with:
    args: "deploy --remote-only --app ${{ secrets.FLY_APP_NAME }}"
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```
