import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Allow Render's hostname when running via `vite preview`
  preview: {
    allowedHosts: ['SkillHunt-frontend.onrender.com'],
  },
})
