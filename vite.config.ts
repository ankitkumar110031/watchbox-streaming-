import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // VITE_BASE_PATH will be set by the GitHub Actions workflow during build
  // For local development (command === 'serve'), base will be '/'
  // For build (command === 'build'), it will use the environment variable or fallback to '/'
  const base = command === 'build' && process.env.VITE_BASE_PATH 
               ? process.env.VITE_BASE_PATH 
               : '/';

  return {
    base: base,
    plugins: [react()],
    optimizeDeps: {
    exclude: ['lucide-react'],
    },
  };
});
