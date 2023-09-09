import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": process.env,
    VITE_API_SERVER_URL: process.env.VITE_API_SERVER_URL,
  },
})
