import { describe, expect, it } from "vitest";
import {
  avisoGolpe,
  ganadoresGolpe,
  puntuarGolpe,
  textoGolpe,
  type CandidatoGolpe,
  type DatosGolpe,
} from "./golpe";

// Datos reales de api/vehicles.json; pctVelocidad = topSpeed / 140 * 100
const pct = (mph: number) => (mph / 140) * 100;

const INSURGENT: DatosGolpe = {
  plazas: 4,
  blindaje: "Heavy",
  armamento: "Turret",
  pctVelocidad: pct(105),
  aceleracion: 50,
  agarre: 62,
};
const KURUMA_BLINDADO: DatosGolpe = {
  plazas: 4,
  blindaje: "Heavy",
  armamento: "None",
  pctVelocidad: pct(116),
  aceleracion: 68.4,
  agarre: 72.3,
};
const SCHAFTER_BLINDADO: DatosGolpe = {
  plazas: 4,
  blindaje: "Heavy",
  armamento: "None",
  pctVelocidad: pct(119),
  aceleracion: 72,
  agarre: 71.5,
};
const KURUMA: DatosGolpe = {
  plazas: 4,
  blindaje: "None",
  armamento: "None",
  pctVelocidad: pct(117.8),
  aceleracion: 72,
  agarre: 73,
};
const STOCKADE: DatosGolpe = {
  plazas: 4,
  blindaje: "Heavy",
  armamento: "None",
  pctVelocidad: pct(90),
  aceleracion: 35,
  agarre: 56,
};
const ZENTORNO: DatosGolpe = {
  plazas: 2,
  blindaje: "None",
  armamento: "None",
  pctVelocidad: pct(132.5),
  aceleracion: 84.2,
  agarre: 80.3,
};
const ADDER: DatosGolpe = {
  plazas: 2,
  blindaje: "None",
  armamento: "None",
  pctVelocidad: pct(131),
  aceleracion: 79.5,
  agarre: 75.5,
};
const BATI: DatosGolpe = {
  plazas: 2,
  blindaje: "None",
  armamento: "None",
  pctVelocidad: 100,
  aceleracion: 88,
  agarre: 75,
};
const BOXVILLE: DatosGolpe = {
  plazas: null,
  blindaje: "None",
  armamento: "None",
  pctVelocidad: pct(88),
  aceleracion: 36,
  agarre: 55,
};

// Vehículo sintético de 4 plazas, sin blindaje, sin armas y con huida 0: puntúa 0
const CERO: DatosGolpe = {
  plazas: 4,
  blindaje: "None",
  armamento: "None",
  pctVelocidad: 0,
  aceleracion: 0,
  agarre: 0,
};

const candidato = (nombre: string, d: DatosGolpe): CandidatoGolpe => ({
  nombre,
  resultado: puntuarGolpe(d),
});

describe("puntuarGolpe", () => {
  it("puntúa los vehículos reales con un único redondeo", () => {
    expect(puntuarGolpe(INSURGENT)).toEqual({
      apto: true,
      puntuacion: 85,
      plazas: 4,
    }); // 84,933 hacia arriba
    expect(puntuarGolpe(KURUMA_BLINDADO).puntuacion).toBe(70); // 69,808
    expect(puntuarGolpe(SCHAFTER_BLINDADO).puntuacion).toBe(70); // 70,467 hacia abajo
    expect(puntuarGolpe(KURUMA).puntuacion).toBe(31);
    expect(puntuarGolpe(STOCKADE).puntuacion).toBe(61);
  });

  it("no puntúa a los de menos de 4 plazas ni a los de plazas desconocidas", () => {
    expect(puntuarGolpe(ZENTORNO)).toEqual({
      apto: false,
      puntuacion: null,
      plazas: 2,
    });
    expect(puntuarGolpe(BOXVILLE)).toEqual({
      apto: false,
      puntuacion: null,
      plazas: null,
    });
  });

  it("el límite es 4 plazas", () => {
    expect(puntuarGolpe({ ...CERO, plazas: 3 })).toEqual({
      apto: false,
      puntuacion: null,
      plazas: 3,
    });
    expect(puntuarGolpe({ ...CERO, plazas: 4 })).toEqual({
      apto: true,
      puntuacion: 0,
      plazas: 4,
    });
    expect(puntuarGolpe({ ...CERO, plazas: 6 })).toEqual({
      apto: true,
      puntuacion: 0,
      plazas: 6,
    });
  });

  it("el blindaje pesa un 40 %", () => {
    expect(puntuarGolpe({ ...CERO, blindaje: "Heavy" }).puntuacion).toBe(40);
    expect(puntuarGolpe({ ...CERO, blindaje: "Light" }).puntuacion).toBe(20);
    expect(puntuarGolpe({ ...CERO, blindaje: "Desconocido" }).puntuacion).toBe(
      0,
    );
  });

  it("el armamento pesa un 20 %", () => {
    expect(puntuarGolpe({ ...CERO, armamento: "Turret" }).puntuacion).toBe(20);
    expect(puntuarGolpe({ ...CERO, armamento: "Missiles" }).puntuacion).toBe(
      20,
    );
    expect(
      puntuarGolpe({ ...CERO, armamento: "Machine guns" }).puntuacion,
    ).toBe(10);
    expect(puntuarGolpe({ ...CERO, armamento: "Desconocido" }).puntuacion).toBe(
      0,
    );
  });

  it("la huida es la media de velocidad, aceleración y agarre y pesa un 40 %", () => {
    expect(
      puntuarGolpe({
        ...CERO,
        pctVelocidad: 100,
        aceleracion: 100,
        agarre: 100,
      }).puntuacion,
    ).toBe(40);
    expect(puntuarGolpe({ ...CERO, pctVelocidad: 30 }).puntuacion).toBe(4);
    expect(puntuarGolpe({ ...CERO, aceleracion: 30 }).puntuacion).toBe(4);
    expect(puntuarGolpe({ ...CERO, agarre: 30 }).puntuacion).toBe(4);
  });
});

describe("textoGolpe", () => {
  it("muestra la puntuación o por qué no es apto", () => {
    expect(textoGolpe(puntuarGolpe(INSURGENT))).toBe("85");
    expect(textoGolpe(puntuarGolpe(CERO))).toBe("0");
    expect(textoGolpe(puntuarGolpe(ZENTORNO))).toBe("No apto: 2 de 4 plazas");
    expect(textoGolpe(puntuarGolpe(BOXVILLE))).toBe(
      "No apto: plazas desconocidas",
    );
  });
});

describe("ganadoresGolpe", () => {
  it("con un solo candidato no hay mejor", () => {
    expect(ganadoresGolpe([candidato("Karin Kuruma", KURUMA)])).toEqual([]);
  });

  it("sin aptos no hay mejor", () => {
    expect(
      ganadoresGolpe([
        candidato("a", ZENTORNO),
        candidato("b", ADDER),
        candidato("c", BATI),
      ]),
    ).toEqual([]);
  });

  it("gana el apto de mayor puntuación", () => {
    expect(
      ganadoresGolpe([
        candidato("a", INSURGENT),
        candidato("b", KURUMA_BLINDADO),
        candidato("c", ZENTORNO),
      ]),
    ).toEqual([0]);
    expect(
      ganadoresGolpe([candidato("a", ZENTORNO), candidato("b", KURUMA)]),
    ).toEqual([1]);
  });

  it("un apto con 0 puntos gana a los no aptos", () => {
    expect(
      ganadoresGolpe([candidato("a", BOXVILLE), candidato("b", CERO)]),
    ).toEqual([1]);
  });

  it("en un empate ganan todos", () => {
    expect(
      ganadoresGolpe([
        candidato("a", SCHAFTER_BLINDADO),
        candidato("b", KURUMA_BLINDADO),
      ]),
    ).toEqual([0, 1]);
  });
});

describe("avisoGolpe", () => {
  it("con un solo candidato no hay aviso", () => {
    expect(avisoGolpe([candidato("Karin Kuruma", KURUMA)])).toBeNull();
    expect(avisoGolpe([])).toBeNull();
  });

  it("nombra al ganador", () => {
    const insurgent = candidato("HVY Insurgent Pick-Up", INSURGENT);
    const kurumaBlindado = candidato("Karin Kuruma (Armored)", KURUMA_BLINDADO);
    const zentorno = candidato("Pegassi Zentorno", ZENTORNO);
    expect(avisoGolpe([insurgent, kurumaBlindado, zentorno])).toBe(
      "Mejor para el golpe: HVY Insurgent Pick-Up (85)",
    );
    expect(avisoGolpe([kurumaBlindado, zentorno])).toBe(
      "Mejor para el golpe: Karin Kuruma (Armored) (70)",
    );
  });

  it("los no aptos no cuentan", () => {
    const kuruma = candidato("Karin Kuruma", KURUMA);
    expect(
      avisoGolpe([
        kuruma,
        candidato("Pegassi Zentorno", ZENTORNO),
        candidato("Truffade Adder", ADDER),
      ]),
    ).toBe("Mejor para el golpe: Karin Kuruma (31)");
    expect(avisoGolpe([candidato("Brute Boxville", BOXVILLE), kuruma])).toBe(
      "Mejor para el golpe: Karin Kuruma (31)",
    );
    expect(avisoGolpe([candidato("Brute Stockade", STOCKADE), kuruma])).toBe(
      "Mejor para el golpe: Brute Stockade (61)",
    );
  });

  it("sin aptos lo dice", () => {
    expect(
      avisoGolpe([
        candidato("a", ZENTORNO),
        candidato("b", ADDER),
        candidato("c", BATI),
      ]),
    ).toBe(
      "Ninguno sirve para el golpe: hace falta un vehículo de 4 plazas o más",
    );
  });

  it("nombra a todos los empatados", () => {
    expect(
      avisoGolpe([
        candidato("Benefactor Schafter V12 (Armored)", SCHAFTER_BLINDADO),
        candidato("Karin Kuruma (Armored)", KURUMA_BLINDADO),
      ]),
    ).toBe(
      "Empate para el golpe: Benefactor Schafter V12 (Armored) y Karin Kuruma (Armored) (70)",
    );
    expect(
      avisoGolpe([
        candidato("A", CERO),
        candidato("B", CERO),
        candidato("C", CERO),
      ]),
    ).toBe("Empate para el golpe: A, B y C (0)");
  });
});
