import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Esto es crucial para que los archivos JS y CSS se carguen correctamente en Electron
});
