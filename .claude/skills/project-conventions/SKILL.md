---
name: project-conventions
description: Convenciones de código del comparador de vehículos de GTA (lógica pura en src/dominio/ con tests, UI en App.tsx, props con interface, textos en castellano, api/ intocable, sin dependencias de producción nuevas) y qué gate ejecutar en cada momento. Precárgala antes de escribir o modificar código de src/.
user-invocable: false
---

# Convenciones del comparador de vehículos de GTA

Las reglas del proyecto están en `CLAUDE.md`. Esta skill las traduce a lo que tienes que hacer al escribir código.

## Dónde va cada cosa

- **Lógica pura nueva** (cálculos, puntuaciones, reglas de clasificación): un fichero `.ts` en `src/dominio/`, en castellano como el resto del código, que exporta funciones puras y no importa React ni llama a `fetch`. Su test va al lado: `src/dominio/<nombre>.test.ts`.
- **UI**: en las páginas de `src/App.tsx` o en los componentes de `src/gta.tsx`, siguiendo el patrón de lo que ya hay. No reestructures el código legado que no necesitas tocar.
- **Estilos**: en `src/styles.css`, reutilizando las clases y variables que ya existen.
- **Datos**: por HTTP a `/api/...` con `pedir`. **Nunca** importes de `api/` ni la modifiques.
- Un fichero que nadie importa es código muerto: todo fichero nuevo tiene un consumidor.

## Código

- Código, nombres y textos de pantalla en castellano, como el resto del proyecto. Constantes en MAYÚSCULAS (`KM_POR_MILLA`, `DINERO_INICIAL`).
- En los componentes de React, las props y cualquier forma de objeto se declaran con `interface`, no con `type` (regla de ESLint `equipo/props-con-interface`).
- Cada supuesto de negocio (un dato que la API no da) vive en **un solo sitio**, con nombre.
- El código nuevo no usa `any`, aunque el legado lo haga.
- No se añaden dependencias de producción (un test de `guardarrailes/` lo comprueba).
- Dinero en GTA$ sin decimales y con punto de miles; velocidades en km/h con `km()`.

## Tests

- Vitest. Los de `src/dominio/` van junto al código (`*.test.ts`); los guardarraíles, en `guardarrailes/`.
- Aserciones de comportamiento (lo que devuelve la función para un vehículo real de `api/vehicles.json`), no de detalles de implementación.
- `src/dominio/` tiene umbral de cobertura del 100 % de líneas y ramas, y Stryker exige el 100 % de mutantes muertos: prueba los límites (`>` frente a `>=`) y cada rama.
- La UI no tiene tests unitarios: se verifica en el navegador con la skill `verify-browser`.

## Gates

| Momento | Comando |
|---|---|
| Tras cada edición | El hook PostToolUse ya lanza ESLint sobre el fichero de `src/` |
| Antes de dar la tarea por terminada | `npm run check` (tipos, ESLint, tests, guardarraíles y build) |
| Antes de publicar | `npm run verify` (lo anterior + duplicación, cobertura y CRAP; lo ejecuta el pre-push) |
| Mutación | `npm run mutation`, o acotada: `npx stryker run --mutate <ficheros>` |

Arregla la causa. Nunca desactives una regla, ni pongas `eslint-disable` o `@ts-ignore`, ni saltes un hook con `--no-verify`.
