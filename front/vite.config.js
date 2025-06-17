import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Lire la variable d'environnement USE_POLLING, défaut: false
const usePolling = process.env.USE_POLLING === "true";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 5173,
		host: true, // Pour autoriser l’accès réseau si besoin
		proxy: {
			"/covid": {
				target: "http://localhost:8000", // backend FastAPI
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/covid/, "/covid"),
				// Pas de réécriture, on garde le préfixe /covid côté backend
			},
		},
		watch: {
			usePolling,
		}
	},
});
