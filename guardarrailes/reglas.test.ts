// Guardarraíles escritos como tests: reglas del proyecto que no son de estilo
// sino de negocio o de arquitectura. Si un agente (o una persona) las rompe,
// `npm run check` se pone en rojo y el mensaje dice qué regla y por qué.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const fuentes = readdirSync('src', { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.(ts|tsx)$/.test(f))
  .map((f) => ({ fichero: join('src', f), codigo: readFileSync(join('src', f), 'utf8') }))

describe('Guardarraíles del comparador', () => {
  it('la app no importa la API simulada: es un servicio externo y se consume por HTTP', () => {
    const infractores = fuentes.filter(({ codigo }) => /from ['"](\.\.\/)+api\//.test(codigo)).map((f) => f.fichero)
    expect(infractores, 'Pide los datos con fetch a /api/..., no importes api/').toEqual([])
  })

  it('la conversión de mph a km/h vive en un solo sitio (CONTEXT.md, «Unidades»)', () => {
    const usos = fuentes.flatMap(({ fichero, codigo }) => (codigo.match(/1[.,]609/g) ?? []).map(() => fichero))
    expect(usos, 'Usa la constante KM_POR_MILLA de src/App.tsx en vez de repetir el número').toHaveLength(1)
  })

  it('no se añaden dependencias de producción sin hablarlo con el equipo', () => {
    const { dependencies } = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(Object.keys(dependencies).sort(), 'Si de verdad hace falta una librería, pregunta antes').toEqual([
      'react',
      'react-dom',
    ])
  })
})
