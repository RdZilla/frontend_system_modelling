import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Слушаем на всех интерфейсах
    port: 5173,        // Убедитесь, что порт тот же
  },
})
