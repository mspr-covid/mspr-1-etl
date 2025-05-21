# 🛠️ Détail du fichier GitHub Actions : `integration.yml`

Ce fichier configure un workflow d’intégration continue (CI) pour :

- Installer les dépendances
- Vérifier la qualité du code avec `flake8`
- Exécuter les tests avec `pytest` et mesurer la couverture
- Notifier l’équipe via un webhook vers un salon Discord

## 🧾 Déclencheurs

```yaml
name: Integration Test Workflow
on: [push, pull_request]
```

- name: Nom du workflow affiché dans l'interface GitHub Actions
- on: Déclenche ce workflow à chaque push ou pull_request sur n’importe quelle branche

## Job de test

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
```

- jobs: Déclare une liste de tâches à exécuter (ici, la tâche 'test' est executé).
- runs-on: Le job s’exécute sur une machine virtuelle Ubuntu fournie par GitHub.

- uses: actions/checkout@v2
- Récupère le code source de la branche sur laquelle le workflow est déclenché.

## 💾 Mise en cache de pip

```yaml
- name: Cache pip
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

Met en cache les paquets pip pour accélérer les exécutions futures.
Le cache est lié au runner et au hash du fichier requirements.txt.

## 🐍 Définition de la version de Python

```yaml
- name: Set up Python
  uses: actions/setup-python@v2
  with:
    python-version: "3.12"
```

Installe Python 3.12 sur le runner.

## 📦 Installation des dépendances

```yaml
- name: Install dependencies
  run: pip install -r requirements.txt
```

Installe les dépendances du projet nécessaires.

## Linter flake8 (non bloquant)

```yaml
- name: Run flake8 linter (non bloquant)
  run: |
    pip install flake8
    flake8 . || true
```

flake8 est un outil de linting pour vérifier le respect des conventions de style.
|| true permet de ne pas échouer le pipeline même si flake8 détecte des erreurs.
(Le but est simplement de nous informer et nous metterons à jour au fur et à mesure)

## 🧪 Tests avec couverture

```yaml
- name: Run tests with coverage
  run: pytest --cov=ws --cov-report=term-missing
```

Lance les tests avec pytest tout en mesurant la couverture de code.

--cov=ws : mesure la couverture du dossier ws.

--cov-report=term-missing : affiche les lignes non couvertes directement dans le terminal.

## 🔔 Notification Discord

```yaml
- name: Discord Notification
  uses: emvakar/discord-notification-action@v2
  with:
    title: "Test Workflow"
    status: "success"
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

Envoie une notification sur Discord dans le salon #integration à la fin du workflow.
Le webhook est stocké dans les secrets du dépôt (DISCORD_WEBHOOK).
