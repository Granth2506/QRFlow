import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: {
      key: './192.168.1.20+2-key.pem',
      cert: './192.168.1.20+2.pem',
    },
  },
})