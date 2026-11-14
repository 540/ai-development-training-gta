#!/usr/bin/env node
// Hooks de Claude Code que meten los guardarraíles en el bucle del agente.
//
//   node .claude/hooks/guardarrailes.mjs edit   (PostToolUse de Edit/Write)
//     Pasa ESLint sobre el fichero que acaba de tocar. Si falla, sale con código 2
//     y Claude Code le devuelve el error al agente, que lo corrige en el momento.
//
//   node .claude/hooks/guardarrailes.mjs stop   (Stop)
//     Si hay cambios en src/, ejecuta `npm run check` entero. Si falla, sale con
//     código 2 y el agente no puede dar la tarea por terminada.
//
// Claude Code manda por stdin un JSON con el contexto del evento.

import { execSync, spawnSync } from 'node:child_process'
import { relative } from 'node:path'

const modo = process.argv[2]
const entrada = JSON.parse(await new Promise((ok) => {
  let datos = ''
  process.stdin.on('data', (d) => (datos += d))
  process.stdin.on('end', () => ok(datos || '{}'))
}))
const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd()

const bloquear = (mensaje) => {
  process.stderr.write(mensaje + '\n')
  process.exit(2)
}

if (modo === 'edit') {
  const fichero = entrada.tool_input?.file_path
  if (!fichero || !/\.(ts|tsx)$/.test(fichero)) process.exit(0)
  const ruta = relative(raiz, fichero)
  if (!ruta.startsWith('src/')) process.exit(0)

  const eslint = spawnSync('npx', ['eslint', ruta], { cwd: raiz, encoding: 'utf8' })
  if (eslint.status !== 0) {
    bloquear(`Guardarraíles: ${ruta} incumple las reglas del equipo. Corrígelo antes de seguir.\n\n${eslint.stdout}`)
  }
}

if (modo === 'stop') {
  // Si ya estamos reintentando por culpa de este hook, no lo encadenamos otra vez.
  if (entrada.stop_hook_active) process.exit(0)
  const cambios = execSync('git status --porcelain -- src', { cwd: raiz, encoding: 'utf8' }).trim()
  if (!cambios) process.exit(0)

  const check = spawnSync('npm', ['run', 'check'], { cwd: raiz, encoding: 'utf8' })
  if (check.status !== 0) {
    const salida = (check.stdout + check.stderr).split('\n').slice(-40).join('\n')
    bloquear(`Guardarraíles: \`npm run check\` está en rojo. La tarea no está terminada.\n\n${salida}`)
  }
}

process.exit(0)
