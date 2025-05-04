# 🐳 Docker & Automatisation – Documentation Technique

## 🔰 Pourquoi Docker ?

Suite à notre projet d'application mettant en place un **ETL** (extract, transform load), nous avons souhaité uniformiser notre environnement de développement en intégrant une partie **devOPS**. Il était essentiel que **tous les développeurs disposent du même environnement**. C'est pourquoi nous avons intégré **Docker** pour :

- Garantir la portabilité de l'application quelque soit l'environnement d'execution (Mac OS, Window, Linux). Si ça fonctionne pour l'un, ça fonctionne pour tous.
- Éviter les problématiques liées aux différentes versions des dépendances, à des configurations différentes (Grafana, BDD)
- Automatiser le lancement de l'infrastructure complète en une commande (Lancement de notre pipeline ETL, du web service, de la base de données avec une persistance des données sur un volume, du service Grafana pour la visualisation et le monitoring )

## 🧱 Fichier `docker-compose.yml` – Infrastructure multi-services

Ce fichier orchestre l’infrastructure du projet : **API backend**, **base de données PostgreSQL**, et **Grafana**.

```yaml
version: "3.8"

services:
  db:
    image: postgres:16
    container_name: postgres_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mynetwork

  backend:
    build: .
    container_name: covid_mspr
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://myuser:mypassword@db:5432/mydatabase
    ports:
      - "8000:8000"
    networks:
      - mynetwork

  grafana:
    image: grafana/grafana
    container_name: grafana
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/grafana.ini:/etc/grafana/grafana.ini
    networks:
      - mynetwork

volumes:
  postgres_data:

networks:
  mynetwork:
```
