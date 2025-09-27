import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // ATTENZIONE: Se il tuo repository su GitHub ha un nome diverso,
  // cambia 'killer-sudoku-solver' con il nome corretto.
  base: '/killer-sudoku-solver/', 
  plugins: [react()],
})