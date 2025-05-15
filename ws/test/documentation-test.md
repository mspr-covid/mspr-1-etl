# 📚 Documentation des tests unitaires sur la création de JWT lors d'une connexion à notre API

## Introduction

Ce document explique le fonctionnement et les détails des tests unitaires réalisés pour notre application (pour tester la méthode `create_access_token` par exemple). Cette fonction est utile pour l'authentification vers notre API, en particulier pour la gestion des utilisateurs et des sessions.

Les tests sont réalisés en utilisant la bibliothèque `pytest` pour le framework de test et `jwt` pour la gestion des tokens JWT. Pour lancer les tests du web service depuis la CLI : `pytest ws/test/`
Un décorateur @pytest.mark.token permet de cibler les tests liés aux tokens. Cela nous permettra de cibler certains tests `pytest -m token`.
⚠️ Remarque : Pour que pytest reconnaisse ce marqueur personnalisé, il faut l'enregistrer dans le fichier pytest.ini :

## Prérequis

Pour pouvoir exécuter les tests, on peut lancer la commande :

```bash
make up
```

qui est un alias pour lancer les services docker habituellement lancés avec la commande :

```bash
docker compose up --build
```
