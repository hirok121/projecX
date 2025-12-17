import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '')
  
  // Determine if this is production mode
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    
    // Server configuration
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 5173,
      host: true,
      open: false,
    },
      // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: isProduction ? false : true,
      minify: isProduction ? 'esbuild' : false,
      target: isProduction ? 'es2020' : 'esnext',
      

    },
      // Preview configuration for SPA routing
    preview: {
      port: 4173,
      host: true,
      cors: true,
      // Handle SPA routing for preview server
      middlewareMode: false,
    },
    
    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@mui/material',
        'axios'
      ]
    },
    
    // Base path for deployment
    base: '/',
    
    // Define global constants
    define: {
      __DEV__: !isProduction,
    },
  }
})