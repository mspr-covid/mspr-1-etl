# Dans cette première étape, on va construire l'application front avec Node 
# On utlise une image alpine car plus légère et plus rapide.
# Ici, dans cette première étape on va compiler l'application front.
FROM node:18 AS builder

# On définit le répertoire de travail dans le conteneur
WORKDIR /app

# On copie les fichiers de configuration npm dans le conteneur (package.json et package-lock.json). 
# Ils listent les dépendances de l'application.
COPY package*.json ./

# Avec notre gestionnaire de package, on installe les dépendances nécessaires pour l'application.
RUN npm ci

# On copie le reste des fichiers de l'application dans le conteneur.
# De la machine hôte vers le conteneur.
COPY . .

# On lance la commande de build pour compiler l'application front-end.
# Ça génère les fichiers statiques dans le répertoire dist.
RUN npm run build

# Étape 2 : nginx
# Donc une fois nos fichiers comilés, on va les servir avec Nginx.
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

# On expose le port 80 pour que Nginx puisse servir l'application.
EXPOSE 80
