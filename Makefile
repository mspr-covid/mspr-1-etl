# Grâce à ce Makefile, on peut facilement gérer le projet en utilisant des commandes simples notamment pour lancer notre infra Docker et exécuter le script ETL. Pensez bien à précéder chaque commande par une tabulation (pas d'espace) pour que le Makefile fonctionne correctement. Sur votre CLI, précéder chaque commande par un "make" pour l'exécuter. Par exemple, pour lancer l'application, il faut exécuter "make up".

# Lancer l'application (Docker)
up:
	docker compose up --build -d

# Stopper les containers
down:
	docker compose down

# Lancer un shell dans le container Docker du back-end (pour sortir du container, on peut utiliser exit)
shell-b:
	docker exec -it covid_mspr sh       

#Lancer un shell dans le container Docker de la base de données (pour sortir du container, on peut utiliser exit)
shell-db:
	docker exec -it postgres_db sh

#Lancer un shell dans le container Docker du service Grafana (pour sortir du container, on peut utiliser exit)
shell-g:
	docker exec -it grafana sh

# Lancer les containers sans les reconstruire
start:
	docker compose up -d

# Redémarrer les containers (équivalent down + up)
restart:
	docker compose down && docker compose up --build -d

# Lancer seulement l'API en local (hors Docker)
run-api:
	uvicorn ws.covid_api:app --reload

# Lancer uniquement le script ETL en local
run-etl:
	python3 mspr1/covid_mspr1.py

# Afficher l'état des containers
ps:
	docker compose ps

# Nettoyer les containers, volumes, images inutiles
clean:
	docker system prune -af --volumes

# Afficher l'aide et ce qu'il est possible de faire. À mettre a jour si besoin.
help:
	@echo "Commandes disponibles :"
	@echo "  make up        -> Build et démarre Docker Compose (build + up)"
	@echo "  make start     -> Démarre les containers Docker sans rebuild"
	@echo "  make down      -> Stoppe les services Docker"
	@echo "  make restart   -> Redémarre les containers (down + build + up)"
	@echo "  make shell-b   -> Ouvre un shell dans le container backend"
	@echo "  make shell-db  -> Ouvre un shell dans le container base de données"
	@echo "  make shell-g   -> Ouvre un shell dans le container Grafana"
	@echo "  make run-api   -> Lance l'API FastAPI localement (hors Docker)"
	@echo "  make run-etl   -> Lance uniquement le script ETL localement"
	@echo "  make ps        -> Affiche l'état des containers Docker"
	@echo "  make clean     -> Nettoyage complet Docker (containers, images, volumes)"
