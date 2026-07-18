import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true'
        ? { clientPort: process.env.REPLIT_DEV_DOMAIN ? 443 : undefined }
        : false,
      allowedHosts: true,
      proxy: {
        '/api': 'http://localhost:5001',
        '/voice': 'http://localhost:5001',
        '/ws': { target: 'ws://localhost:5001', ws: true, changeOrigin: true },
      },
    },
  };
});
