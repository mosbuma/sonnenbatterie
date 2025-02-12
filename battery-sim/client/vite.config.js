import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// const serverHost = import.meta.env.VITE_SERVER_HOST || 'localhost';
// const serverPort = import.meta.env.VITE_SERVER_PORT || '5001';

// const serverUrl = `http://${serverHost}:${serverPort}`;

const serverUrl = `http://battery-sim-server:5001`;

console.log('********* Server URL:', serverUrl);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: serverUrl, // Your Express server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});