import type { Plugin } from 'vite'
import vehicles from './vehicles.json'

// API de mentira con los vehículos de GTA. Hace de servicio externo: la app no la toca,
// solo la consume por HTTP igual que haría con una API de verdad.
//
//   GET /api/vehicle/menu/class                               clases
//   GET /api/vehicle/menu/make?class=Super                     fabricantes de una clase
//   GET /api/vehicle/menu/model?class=Super&make=Pegassi       modelos de un fabricante
//   GET /api/vehicle/menu/options?class=…&make=…&model=…       versiones de un modelo
//   GET /api/vehicle/:id                                       ficha de una versión
//
// Igual que muchas APIs viejas: todo llega como texto, la velocidad en millas por hora,
// los menús son una lista, un objeto suelto si solo hay uno o null si no hay ninguno,
// y sin la cabecera Accept: application/json responde en XML.

type Vehicle = Record<string, string>

const ALL = vehicles as Vehicle[]
const MAX_SPEED_MPH = 140

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function menu(items: { text: string; value: string }[]) {
  if (items.length === 0) return null
  return { menuItem: items.length === 1 ? items[0] : items }
}

function performanceScore(v: Vehicle) {
  const speed = Math.min(100, (Number(v.topSpeed) / MAX_SPEED_MPH) * 100)
  const average = (speed + Number(v.acceleration) + Number(v.braking) + Number(v.traction)) / 4
  return String(Math.round(average / 10))
}

function sellPrice(v: Vehicle) {
  return v.price ? String(Math.round(Number(v.price) / 2)) : ''
}

function optionText(v: Vehicle) {
  const parts = [v.armor !== 'None' ? v.armor + ' armor' : '', v.drive, v.seats ? v.seats + ' seats' : '']
  return parts.filter(Boolean).join(', ')
}

function route(path: string, query: URLSearchParams): unknown {
  const byClass = ALL.filter((v) => v.VClass === query.get('class'))
  const byMake = byClass.filter((v) => v.make === query.get('make'))

  if (path === '/vehicle/menu/class') {
    return menu(unique(ALL.map((v) => v.VClass)).map((c) => ({ text: c, value: c })))
  }
  if (path === '/vehicle/menu/make') {
    return menu(unique(byClass.map((v) => v.make)).map((m) => ({ text: m, value: m })))
  }
  if (path === '/vehicle/menu/model') {
    return menu(unique(byMake.map((v) => v.baseModel)).map((m) => ({ text: m, value: m })))
  }
  if (path === '/vehicle/menu/options') {
    const options = byMake.filter((v) => v.baseModel === query.get('model'))
    return menu(options.map((v) => ({ text: optionText(v), value: v.id })))
  }
  const match = path.match(/^\/vehicle\/(\w+)$/)
  if (match) {
    const v = ALL.find((x) => x.id === match[1])
    if (!v) throw new Error('not found')
    return { ...v, sellPrice: sellPrice(v), perfScore: performanceScore(v) }
  }
  throw new Error('not found')
}

function toXml(value: unknown, tag = 'response'): string {
  if (value == null) return `<${tag}/>`
  if (Array.isArray(value)) return value.map((v) => toXml(v, tag)).join('')
  if (typeof value === 'object') {
    const inner = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => toXml(v, k))
      .join('')
    return `<${tag}>${inner}</${tag}>`
  }
  return `<${tag}>${String(value)}</${tag}>`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function middleware(req: any, res: any, next: () => void) {
  if (!req.url?.startsWith('/api/')) return next()
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname.replace(/^\/api/, '')
  const wantsJson = String(req.headers.accept ?? '').includes('application/json')
  const latency = 150 + Math.random() * 300

  setTimeout(() => {
    try {
      const body = route(path, url.searchParams)
      res.setHeader('Content-Type', wantsJson ? 'application/json' : 'application/xml')
      res.end(wantsJson ? JSON.stringify(body) : '<?xml version="1.0"?>' + toXml(body))
    } catch {
      res.statusCode = 404
      res.end()
    }
  }, latency)
}

export function gtaApi(): Plugin {
  return {
    name: 'gta-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
