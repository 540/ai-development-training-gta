// Puntuación de golpe (0-100): supuesto de negocio, la API no da aptitud para golpes.
// Blindaje 30 + armamento 15 + plazas 20 + huida 35.

export interface VehiculoGolpe {
  armor: string
  armado: boolean
  seats: number | null
  acceleration: number
  traction: number
}

export const PUNTOS_BLINDAJE: Readonly<Record<string, number>> = { None: 0, Light: 15, Heavy: 30 }
export const PUNTOS_ARMADO = 15
export const PLAZAS_EQUIPO = 4
export const PUNTOS_PLAZAS = 20
export const PUNTOS_HUIDA = 35

export function puntuacionGolpe(c: VehiculoGolpe): number {
  const blindaje = PUNTOS_BLINDAJE[c.armor] ?? 0
  const armamento = c.armado ? PUNTOS_ARMADO : 0
  const plazas = (Math.min(c.seats ?? 0, PLAZAS_EQUIPO) / PLAZAS_EQUIPO) * PUNTOS_PLAZAS
  const huida = (((c.acceleration + c.traction) / 2) * PUNTOS_HUIDA) / 100
  return Math.round(blindaje + armamento + plazas + huida)
}

export function mejoresParaGolpe<T extends { golpe: number }>(coches: T[]): T[] {
  if (coches.length < 2) return []
  const maxima = Math.max(...coches.map((c) => c.golpe))
  return coches.filter((c) => c.golpe === maxima)
}
