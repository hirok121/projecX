
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// DeepMed Vite Configuration
export default defineConfig(({ mode }) => {
  // Load environment variables for DeepMed
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [react()],

    // DeepMed Dev Server
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 5173,
      host: true,
      open: false,
    },

    // DeepMed Build Output
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      target: isProduction ? 'es2020' : 'esnext',
    },

    // SPA Preview for DeepMed
    preview: {
      port: 4173,
      host: true,
      cors: true,
      middlewareMode: false,
    },

    // Optimize DeepMed dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@mui/material',
        'axios',
      ],
    },

    // Base path for DeepMed deployment
    base: '/',

    // Global constants for DeepMed
    define: {
      __DEV__: !isProduction,
    },
  };
});