/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { gtaApi } from './api/plugin'

const FULL = { lines: 100, branches: 100 }

export default defineConfig({
  plugins: [react(), gtaApi()],
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
    // La UI legada no tiene tests unitarios (se verifica en el navegador): la cobertura,
    // el CRAP y la mutación miden la lógica pura de src/dominio/ y las herramientas.
    coverage: {
      provider: 'istanbul',
      all: true,
      include: ['src/dominio/**/*.ts', 'tools/**/*.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**', 'tools/crap/cli.ts'],
      reporter: ['text', 'json'],
      reportsDirectory: 'reports/coverage',
      thresholds: {
        'src/dominio/**': FULL,
        'tools/**': FULL,
      },
    },
  },
})
