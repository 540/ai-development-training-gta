// Puntuación de un vehículo para dar un golpe (spec: specs/mejor-vehiculo-para-un-golpe-spec.md).
// La API no da tipos de golpe ni resistencia en números: estos supuestos de negocio son nuestros.

/** Tamaño de la banda: un vehículo es apto si tiene al menos estas plazas (conductor incluido). */
export const PLAZAS_BANDA = 4;

/** Puntos de blindaje (0-100) según el valor crudo de `armor` de la API. */
export const PUNTOS_BLINDAJE: Record<string, number> = {
  None: 0,
  Light: 50,
  Heavy: 100,
};

/** Puntos de armamento (0-100) según el valor crudo de `weapons` de la API. */
export const PUNTOS_ARMAMENTO: Record<string, number> = {
  None: 0,
  "Machine guns": 50,
  Turret: 100,
  Missiles: 100,
};

export const PESO_BLINDAJE = 0.4;
export const PESO_HUIDA = 0.4;
export const PESO_ARMAMENTO = 0.2;

export interface DatosGolpe {
  /** `seats`; null si la API no da el dato. */
  plazas: number | null;
  /** Valor crudo de `armor`. */
  blindaje: string;
  /** Valor crudo de `weapons`. */
  armamento: string;
  /** Velocidad punta en porcentaje (0-100), la misma de la barra de velocidad. */
  pctVelocidad: number;
  aceleracion: number;
  agarre: number;
}

export interface ResultadoApto {
  apto: true;
  puntuacion: number;
  plazas: number;
}

export interface ResultadoNoApto {
  apto: false;
  puntuacion: null;
  /** null si la API no da el dato. */
  plazas: number | null;
}

export type ResultadoGolpe = ResultadoApto | ResultadoNoApto;

export interface CandidatoGolpe {
  nombre: string;
  resultado: ResultadoGolpe;
}

export function puntuarGolpe(d: DatosGolpe): ResultadoGolpe {
  const plazas = d.plazas ?? 0;
  if (plazas < PLAZAS_BANDA)
    return { apto: false, puntuacion: null, plazas: d.plazas };
  const blindaje = PUNTOS_BLINDAJE[d.blindaje] ?? 0;
  const armamento = PUNTOS_ARMAMENTO[d.armamento] ?? 0;
  const huida = (d.pctVelocidad + d.aceleracion + d.agarre) / 3;
  const puntuacion = Math.round(
    PESO_BLINDAJE * blindaje + PESO_HUIDA * huida + PESO_ARMAMENTO * armamento,
  );
  return { apto: true, puntuacion, plazas };
}

export function textoGolpe(r: ResultadoGolpe): string {
  if (r.apto) return String(r.puntuacion);
  if (r.plazas === null) return "No apto: plazas desconocidas";
  return `No apto: ${r.plazas} de ${PLAZAS_BANDA} plazas`;
}

interface Ganador {
  indice: number;
  puntuacion: number;
}

/** Aptos con la puntuación máxima; vacío con menos de 2 candidatos o sin aptos. */
function mejoresAptos(candidatos: CandidatoGolpe[]): Ganador[] {
  if (candidatos.length < 2) return [];
  const aptos = candidatos.flatMap((c, indice) =>
    c.resultado.apto ? [{ indice, puntuacion: c.resultado.puntuacion }] : [],
  );
  const maximo = Math.max(...aptos.map((a) => a.puntuacion));
  return aptos.filter((a) => a.puntuacion === maximo);
}

/** Índices de los aptos con la puntuación máxima; vacío con menos de 2 candidatos o sin aptos. */
export function ganadoresGolpe(candidatos: CandidatoGolpe[]): number[] {
  return mejoresAptos(candidatos).map((g) => g.indice);
}

function enumerar(nombres: string[]): string {
  return nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
}

export function avisoGolpe(candidatos: CandidatoGolpe[]): string | null {
  if (candidatos.length < 2) return null;
  const ganadores = mejoresAptos(candidatos);
  if (ganadores.length === 0)
    return `Ninguno sirve para el golpe: hace falta un vehículo de ${PLAZAS_BANDA} plazas o más`;
  const nombres = ganadores.map((g) => candidatos[g.indice].nombre);
  const puntuacion = ganadores[0].puntuacion;
  if (nombres.length === 1)
    return `Mejor para el golpe: ${nombres[0]} (${puntuacion})`;
  return `Empate para el golpe: ${enumerar(nombres)} (${puntuacion})`;
}
