import { describe, expect, it } from 'vitest'
import {
  PLAZAS_EQUIPO,
  PUNTOS_ARMADO,
  PUNTOS_BLINDAJE,
  PUNTOS_HUIDA,
  PUNTOS_PLAZAS,
  mejoresParaGolpe,
  puntuacionGolpe,
  type VehiculoGolpe,
} from './golpe'

// Fichas reales de api/vehicles.json, ya convertidas como hace convertir()
const ZENTORNO: VehiculoGolpe = { armor: 'None', armado: false, seats: 2, acceleration: 84.2, traction: 80.3 }
const KURUMA: VehiculoGolpe = { armor: 'None', armado: false, seats: 4, acceleration: 72, traction: 73 }
const KURUMA_BLINDADO: VehiculoGolpe = { armor: 'Heavy', armado: false, seats: 4, acceleration: 68.4, traction: 72.3 }
const DUKE_O_DEATH: VehiculoGolpe = { armor: 'Light', armado: false, seats: 2, acceleration: 71, traction: 60 }
const INSURGENT_PICKUP: VehiculoGolpe = { armor: 'Heavy', armado: true, seats: 4, acceleration: 50, traction: 62 }
const OPPRESSOR: VehiculoGolpe = { armor: 'None', armado: true, seats: 1, acceleration: 86, traction: 72 }
const DUBSTA_6X6: VehiculoGolpe = { armor: 'None', armado: false, seats: 6, acceleration: 52, traction: 64 }
const BOXVILLE: VehiculoGolpe = { armor: 'None', armado: false, seats: null, acceleration: 36, traction: 55 }

describe('constantes del supuesto de golpe', () => {
  it('suman 100 puntos como máximo', () => {
    expect(PUNTOS_BLINDAJE).toEqual({ None: 0, Light: 15, Heavy: 30 })
    expect(PUNTOS_BLINDAJE.Heavy + PUNTOS_ARMADO + PUNTOS_PLAZAS + PUNTOS_HUIDA).toBe(100)
    expect(PLAZAS_EQUIPO).toBe(4)
  })
})

describe('puntuacionGolpe', () => {
  it('puntúa vehículos reales', () => {
    expect(puntuacionGolpe(ZENTORNO)).toBe(39)
    expect(puntuacionGolpe(KURUMA_BLINDADO)).toBe(75)
    expect(puntuacionGolpe(KURUMA)).toBe(45)
    expect(puntuacionGolpe(INSURGENT_PICKUP)).toBe(85)
  })

  it('el blindaje ligero suma 15 y uno desconocido no suma', () => {
    expect(puntuacionGolpe(DUKE_O_DEATH)).toBe(48)
    expect(puntuacionGolpe({ ...DUKE_O_DEATH, armor: 'Desconocido' })).toBe(33)
  })

  it('ir armado suma 15', () => {
    expect(puntuacionGolpe(OPPRESSOR)).toBe(48)
    expect(puntuacionGolpe({ ...OPPRESSOR, armado: false })).toBe(33)
  })

  it('sin dato de plazas cuentan 0', () => {
    expect(puntuacionGolpe(BOXVILLE)).toBe(16)
  })

  it('las plazas por encima de 4 no suman más', () => {
    expect(puntuacionGolpe(DUBSTA_6X6)).toBe(40)
    expect(puntuacionGolpe({ ...DUBSTA_6X6, seats: 4 })).toBe(40)
    expect(puntuacionGolpe({ ...DUBSTA_6X6, seats: 1 })).toBe(25)
  })

  it('una puntuación sin nada da 0', () => {
    expect(puntuacionGolpe({ armor: 'None', armado: false, seats: null, acceleration: 0, traction: 0 })).toBe(0)
  })

  it('redondea hacia arriba y hacia abajo', () => {
    expect(puntuacionGolpe(ZENTORNO)).toBe(39) // 38,79
    expect(puntuacionGolpe(KURUMA)).toBe(45) // 45,375
  })
})

describe('mejoresParaGolpe', () => {
  const conGolpe = (modelo: string, c: VehiculoGolpe) => ({ modelo, golpe: puntuacionGolpe(c) })

  it('devuelve el ganador único', () => {
    const zentorno = conGolpe('Zentorno', ZENTORNO)
    const kuruma = conGolpe('Kuruma (Armored)', KURUMA_BLINDADO)
    expect(mejoresParaGolpe([zentorno, kuruma])).toEqual([kuruma])
  })

  it('devuelve todos los empatados', () => {
    const duke = conGolpe("Duke O'Death", DUKE_O_DEATH)
    const oppressor = conGolpe('Oppressor', OPPRESSOR)
    const zentorno = conGolpe('Zentorno', ZENTORNO)
    expect(mejoresParaGolpe([duke, zentorno, oppressor])).toEqual([duke, oppressor])
  })

  it('con menos de dos vehículos no hay mejor', () => {
    expect(mejoresParaGolpe([conGolpe('Zentorno', ZENTORNO)])).toEqual([])
    expect(mejoresParaGolpe([])).toEqual([])
  })
})
