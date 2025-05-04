# Grâce à ce Makefile, on peut facilement gérer le projet en utilisant des commandes simples notamment pour lancer notre infra Docker et exécuter le script ETL. Pensez bien à précéder chaque commande par une tabulation (pas d'espace) pour que le Makefile fonctionne correctement. Sur votre CLI, précéder chaque commande par un "make" pour l'exécuter. Par exemple, pour lancer l'application, il faut exécuter "make up".

# Lancer l'application (Docker)
up:
	docker compose up --build -d

# Stopper les containers
down:
	docker compose down

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
	@echo "Commandes disponibles:"
	@echo "  make up        -> Build et démarre Docker Compose"
	@echo "  make down      -> Stoppe les services Docker"
	@echo "  make run-api   -> Lance l'API FastAPI localement"
	@echo "  make run-etl   -> Lance uniquement le script ETL localement"
	@echo "  make ps        -> Affiche l'état des containers"
	@echo "  make clean     -> Nettoyage Docker complet"
