import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    mimeTypes: {
      'jsx': 'text/javascript'  
    },
    proxy: {
      '/covid': {
        target: 'http://localhost:8081',  // Pointage vers le backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/covid/, '/covid'),  // Si nécessaire, réécris le chemin
      },
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/covid/, '/covid'),  // Assurez-vous que le chemin est correct
      },
      '/dashboard': {
        target: 'http://localhost:3000/d-solo/cef5sbqc4do8wb/comparaison-des-cas-et-des-deces-par-region-oms?orgId=1&from=1704063600000&to=1767308399000&timezone=browser&panelId=1&__feature.dashboardSceneSolo',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dashboard/, '/dashboard'),  // Assurez-vous que le chemin est correct
      },
    },
  },
});
