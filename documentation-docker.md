# 🐳 Docker & Automatisation – Documentation Technique

## 🔰 Pourquoi Docker ?

Suite à notre projet d'application mettant en place un **ETL** (extract, transform load), nous avons souhaité uniformiser notre environnement de développement en intégrant une partie **devOPS**. Il était essentiel que **tous les développeurs disposent du même environnement**. C'est pourquoi nous avons intégré **Docker** pour :

- Garantir la portabilité de l'application quelque soit l'environnement d'execution (Mac OS, Window, Linux). Si ça fonctionne pour l'un, ça fonctionne pour tous.
- Éviter les problématiques liées aux différentes versions des dépendances, à des configurations différentes (Grafana, BDD...)
- Automatiser le lancement de l'infrastructure complète en une commande (Lancement de notre pipeline ETL, du web service, de la base de données avec une persistance des données sur un volume, du service Grafana pour la visualisation et le monitoring, et du front-end)

## Dockerfile – Notre application 🚀

Le Dockerfile à la racine du projet nous permet de constuire une image de notre application en se basant sur une image légère de Python et effectue les étapes suivantes :

- Utilise comme base une image légère de Python (On embarque seulement les composants essentiels pour un build et un déploiement rapide)
- Définit le répertoire de travail au sein du container
- Copie tous les fichiers de l'application du système hôte vers le container
- Installation de toutes les dépendances répertoriées dans le fichier requirements.txt
- Lancement du script de l'ETL et du web service

### 🔍 Sécurité et optimisation avec Docker Scout

Nous avons utilisé l’outil **Docker Scout** pour inspecter les vulnérabilités de sécurité potentielles dans notre image.

Grâce à la commande suivante :

```bash
docker scout quickview
```

➡️ Nous avons pu identifier plusieurs failles de sécurité dans notre image initiale.

Puis, avec :

```bash
docker scout recommendations
```

➡️ Docker nous a suggéré des images alternatives plus sûres et plus légères.
Cela nous a permis de passer à l’image python:3.13-alpine, qui présente :

- ✅ Moins de failles connues (plus aucune connue à ce jour)
- 📦 Une taille plus réduite (ce qui accélère le build et le déploiement)

## 🧱 Fichier `docker-compose.yml` – Notre Infrastructure multi-services

C'est le fichier qui va nous permettre d'orchestrer toute l’infrastructure de notre projet : **API backend**, **base de données PostgreSQL**, **Grafana** et **front-end**.
Plusieurs **containers** sont donc lancés.

Services définis :

- Db : un container PostgreSQL avec persistance des données via un volume postgres_data.
- Backend : notre application FastAPI avec le script ETL intégré.
- Grafana : pour visualiser les données (via dashboard) avec, comme pour la BDD, un volume pour la persistance.
- Frontend : Front Vite.js pour l'affichage et l'exploitation des données

## 🛠️ Makefile – Automatiser les commandes pour les développeurs

Afin de **simplifier l'utilisation de Docker** et les différentes actions répétitives pendant le développement, nous avons mis en place un **Makefile** à la racine du projet.

Le `Makefile` permet à chaque développeur d'exécuter des commandes utiles (lancer l'application, exécuter le script ETL, nettoyer Docker, etc.) **sans avoir à taper manuellement des commandes longues ou complexes**. Nous pouvons y ajouter d'autres commandes si nécessaires.

⚙️ Comment l'utiliser ?

Sur notre terminal (à la racine du projet), il suffit de précéder les commandes par `make`.  
Par exemple, pour démarrer tous les services Docker :

```bash
make up
```
