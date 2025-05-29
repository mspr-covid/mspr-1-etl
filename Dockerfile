# Dockerfile

## Ce Dockerfile est utilisé pour créer une image Docker pour l'application sur le COVID-19.
## Il utilise Python 3.13 et installe les dépendances nécessaires pour exécuter l'application. 
## Il est basé sur une image alpine de Python pour réduire la taille de l'image finale.
## Update vers Python 3.13 en version alpine pour une image plus légère, plus rapide et plus sécurisée.

FROM python:3.13-alpine

# Installe make et les dépendances nécessaires
# (ajout de zsh, bash et curl pour flyctl + oh-my-zsh)
RUN apk add --no-cache make build-base git openssh curl zsh bash postgresql-client

# Crée le répertoire pour l'application au sein du conteneur
WORKDIR /app

# Copie le fichier requirements.txt dans le conteneur (pour optimiser le cache)
# Il est préférable de le faire avant de copier le reste du code pour éviter de reconstruire l'image à chaque changement de code
# et ainsi profiter du cache Docker.
# Cela permet de ne pas avoir à réinstaller les dépendances si elles n'ont pas changé.
COPY requirements.txt .

# Installe les dépendances de l'application
RUN pip install --no-cache-dir -r requirements.txt

# Copie les fichiers nécessaires dans le conteneur
COPY . .

# Installation du CLI Fly.io pour le déploiement continu
RUN curl -L https://fly.io/install.sh | sh

# Ajoute Fly CLI au PATH pour pouvoir l'utiliser depuis n'importe où
ENV PATH="/root/.fly/bin:$PATH"

# Installation de Oh My Zsh dans le conteneur
# On désactive les invites interactives avec RUNZSH=no, CHSH=no
# KEEP_ZSHRC=yes permet de garder un .zshrc custom si besoin
RUN ZSH="/root/.oh-my-zsh" RUNZSH=no CHSH=no KEEP_ZSHRC=yes sh -c \
    "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" || true

# Optionnel : on pourrait copier un .zshrc si on veut un prompt custom
# COPY .zshrc /root/.zshrc

# Définit zsh comme shell par défaut pour les instructions suivantes (facultatif, utile pour debug dans le conteneur)
SHELL ["/bin/zsh", "-c"]

COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
