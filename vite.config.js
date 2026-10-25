import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'redirect-to-strata',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          if (url === '/' || url === '/index.html') {
            const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
            res.writeHead(302, { Location: `/strata.html${query}` });
            res.end();
            return;
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          if (url === '/' || url === '/index.html') {
            const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
            res.writeHead(302, { Location: `/strata.html${query}` });
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        strata: resolve(import.meta.dirname, 'strata.html')
      }
    }
  }
})

