import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/social-search': {
        target: 'https://ngwxtzuuwtioxrorzyez.supabase.co/functions/v1/social-search',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/social-search/, ''),
      },
    },
  },
});