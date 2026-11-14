import tseslint from 'typescript-eslint'

import propsConInterface from './eslint/propsConInterface.js'

// Solo las reglas del equipo. El código legado tiene vicios a propósito (any, var...),
// así que no se activa ningún preset: cada regla que entra aquí es una decisión.
export default tseslint.config({
  files: ['src/**/*.{ts,tsx}'],
  languageOptions: { parser: tseslint.parser },
  plugins: { equipo: { rules: { 'props-con-interface': propsConInterface } } },
  rules: {
    'equipo/props-con-interface': 'error',
  },
})
