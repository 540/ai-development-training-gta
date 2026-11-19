# Comparador de vehículos de GTA

Comparador de vehículos de GTA Online con ambientación del juego: listado por clase y fabricante con buscador y filtros, ficha de cada vehículo, comparación lado a lado de hasta tres y un garaje donde comprar y vender con tu propio dinero.

![Listado de vehículos](docs/listado.png)

![Comparación de tres vehículos](docs/comparador.png)

## Qué tiene

- **Listado**: cada tarjeta lleva de fondo la sombra difuminada de su propio vehículo, con la velocidad, las estadísticas y su nivel de búsqueda.
- **Ficha**: foto del vehículo, barras de estadísticas como las del concesionario del juego, datos técnicos y botones para comparar, comprar o vender.
- **Comparar**: hasta tres vehículos en una tabla, con el mejor de cada fila resaltado.
- **Garaje**: empiezas con $1.500.000. Lo que compras va al garaje y Los Santos Customs te lo recompra por la mitad.
- **HUD**: arriba a la derecha, el dinero y las estrellas de búsqueda del vehículo más buscado que tengas en la comparación.
- **Ambientación**: fondo de atardecer de Vice City, cinta de noticias de Los Santos, consejos como los de las pantallas de carga, avisos de «¡Comprado!» y «Sin fondos»… y algún truco escondido.

El dinero, el garaje y la comparación se guardan en el `localStorage` del navegador. Para empezar de cero, bórralo desde las herramientas de desarrollo.

## Arrancar

```bash
npm install
npm run dev
```

La primera vez, para la skill `validation`: `npx playwright install chromium`.

## Dónde está cada cosa

| fichero | qué hay |
|---|---|
| `src/App.tsx` | las páginas: listado, ficha, comparar y garaje |
| `src/gta.tsx` | lo del juego: HUD, estrellas, barras, avisos, trucos, noticias, consejos y el fondo de Vice City |
| `src/fotos.tsx` | la foto de cada vehículo y su sombra en el listado |
| `src/fotos.json` | qué foto lleva cada modelo, con su autor y licencia |
| `src/siluetas.tsx` | siluetas en SVG por tipo de carrocería, por si una foto no carga |
| `public/coches/` | las fotos |

## Las fotos

Cada vehículo lleva una foto del coche real en el que se inspira el modelo del juego (el Zentorno, por ejemplo, es un Lamborghini Sesto Elemento). Están sacadas de Wikimedia Commons con licencia libre. La ficha de cada vehículo cita al autor, y la lista completa está en [`public/coches/CREDITOS.md`](public/coches/CREDITOS.md).

## La API

Los datos los sirve una API simulada que arranca con `npm run dev` (`api/plugin.ts` sobre `api/vehicles.json`). Hace de servicio externo: no se toca, se consume.

| endpoint | devuelve |
|---|---|
| `GET /api/vehicle/menu/class` | las clases |
| `GET /api/vehicle/menu/make?class=Super` | los fabricantes de una clase |
| `GET /api/vehicle/menu/model?class=Super&make=Pegassi` | los modelos de un fabricante |
| `GET /api/vehicle/menu/options?class=…&make=…&model=…` | las versiones de un modelo |
| `GET /api/vehicle/:id` | la ficha de una versión |

Todo llega como texto y la velocidad, en millas por hora. Las estadísticas son aproximadas y están inventadas para la práctica. GTA y Grand Theft Auto son marcas de Rockstar Games; este proyecto no tiene relación con ellas.

## Las skills

En `.claude/skills/`:

| skill | qué hace | dónde corre |
|---|---|---|
| `/grill-me` | Te interroga hasta escribir la especificación en `specs/` | en tu conversación |
| `/implement <tarea o spec>` | Fija los criterios, implementa y llama a `reviewer` y `validation`; repite con los arreglos hasta 3 rondas | en tu conversación |
| `/reviewer <slug>` | Revisa el diff contra los criterios y `CONTEXT.md` y da un veredicto APTO o NO APTO | en un subagente (`context: fork`) |
| `/validation <slug>` | Comprueba cada criterio en Chromium con Playwright y saca una captura de cada uno | en un subagente (`context: fork`) |

`reviewer` y `validation` no ven la conversación en la que se escribió el código: solo los criterios (`.claude/tmp/<slug>/criterios.md`) y el diff. Así no se dan la razón a sí mismas.

## Los guardarraíles

Una regla escrita en `CLAUDE.md` es una petición: el agente la puede olvidar. Un guardarraíl es una regla que se comprueba sola y que el agente no puede saltarse.

| guardarraíl | dónde | qué exige |
|---|---|---|
| tipos | TypeScript | el proyecto compila |
| props con `interface` | regla de ESLint hecha a mano (`eslint/propsConInterface.js`) | en los componentes, las formas de objeto se declaran con `interface`, no con `type` |
| la API es externa | test (`guardarrailes/reglas.test.ts`) | `src/` no importa nada de `api/` |
| una sola conversión | test | el factor de mph a km/h aparece una sola vez |
| sin dependencias nuevas | test | `dependencies` solo tiene `react` y `react-dom` |

```bash
npm run check   # tipos, ESLint, guardarraíles y build
npm run lint    # solo las reglas de ESLint
npm test        # solo los guardarraíles
```

### Cuándo corren

Los hooks de Claude Code (`.claude/settings.json` → `.claude/hooks/guardarrailes.mjs`) los meten en el bucle del agente:

- **Después de cada edición** de un fichero de `src/`, ESLint revisa ese fichero. Si falla, el error vuelve al agente y lo corrige en el momento.
- **Al terminar**, si hay cambios en `src/`, se ejecuta `npm run check`. Si está en rojo, el agente no puede dar la tarea por terminada.

## El harness

`.claude/workflows/implement.mjs` hace lo mismo que `/implement`, pero el orden, las rondas y la condición de parada los decide el código y no el modelo. Cada fase es un agente nuevo que sigue la skill que le toca:

| fase | agente | qué hace |
|---|---|---|
| Criterios | sigue el paso 1 de `implement` | Slug, supuestos y criterios en `.claude/tmp/<slug>/criterios.md` |
| Implementar | sigue el paso 2 de `implement` | Código mínimo hasta `npm run check` en verde |
| Revisar y validar | `reviewer` ‖ `validation` | En paralelo: veredicto con hallazgos y una captura por criterio |
| Arreglar | implementador con la lista | Los critical de la revisión y los criterios que fallan en el navegador; vuelve a revisar y validar |

Para cuando la revisión da APTO y todos los criterios pasan, o al llegar a 3 rondas. Devuelve los supuestos, los criterios con su captura y lo que haya quedado pendiente. No hace commit.

Se lanza desde Claude Code pidiéndole que ejecute el workflow `implement` con `{ task: "…" }` o `{ specFile: "specs/x.md" }`. Opción: `maxRounds`.

## Práctica

1. **Lánzalo.** Pega este prompt en Claude Code y mira el progreso con `/workflows`:

   ```text
   lanza el workflow implement con la tarea: Añade al comparador cuál de los coches es mejor para dar un golpe.
   ```

2. **Con especificación.** Lánzalo otra vez con la `specs/` que sacaste con `/grill-me`.
3. **Cotejo.** ¿Qué cambia frente a `/implement` en la rama `skills`? ¿Quién decide cuándo está terminado?
