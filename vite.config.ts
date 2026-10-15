import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {defineConfig, loadEnv} from 'vite';
import type {ViteDevServer, PreviewServer} from 'vite';
import {googleReviewsHandler} from './server/google-reviews.mjs';

export default defineConfig(({mode}) => {
  const env={...loadEnv(mode,fileURLToPath(new URL('.',import.meta.url)),''),...process.env};
  const reviewsMiddleware=(server:ViteDevServer|PreviewServer) => {
    server.middlewares.use((req,res,next) => {
      void googleReviewsHandler(req,res,env).then(handled=>{if(!handled)next();}).catch(()=>{res.statusCode=503;res.end();});
    });
  };
  return {
    base: '/',
    build: {outDir: 'docs', emptyOutDir: false},
    plugins: [react(), tailwindcss(), {name:'google-reviews',configureServer:reviewsMiddleware,configurePreviewServer:reviewsMiddleware}],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
